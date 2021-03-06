! ✖ / env;
node;
var assert = require("assert"), express = require("express"), http = require("http"), keys = require("keygrip")(), cookies = require("../").express, options =  {
   host:"localhost", 
   port:8000, 
   path:"/set"}
, app = express.createServer();
app.use(cookies(keys));
app.get("/set", function(req, res)  {
      res.cookies.set("unsigned", "foo",  {
            signed:false, 
            httpOnly:false         }
      ).set("signed", "bar",  {
            signed:true         }
      ).set("tampered", "baz").set("tampered.sig", "bogus").set("overwrite", "old-value",  {
            signed:true         }
      ).set("overwrite", "new-value",  {
            overwrite:true, 
            signed:true         }
      );
      res.writeHead(302,  {
            Location:"/"         }
      );
      res.end();
   }
);
app.get("/", function(req, res)  {
      var unsigned = req.cookies.get("unsigned"), signed = req.cookies.get("signed",  {
            signed:true         }
      ), tampered = req.cookies.get("tampered",  {
            signed:true         }
      ), overwrite = req.cookies.get("overwrite",  {
            signed:true         }
      );
      assert.equal(unsigned, "foo");
      assert.equal(req.cookies.get("unsigned.sig",  {
               signed:false            }
         ), undefined);
      assert.equal(signed, "bar");
      assert.equal(req.cookies.get("signed.sig",  {
               signed:false            }
         ), keys.sign("signed=bar"));
      assert.notEqual(tampered, "baz");
      assert.equal(tampered, undefined);
      assert.equal(overwrite, "new-value");
      assert.equal(req.cookies.get("overwrite.sig",  {
               signed:false            }
         ), keys.sign("overwrite=new-value"));
      assert.equal(res.getHeader("Set-Cookie"), "tampered.sig=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly");
      res.send("unsigned expected: foo
" + "unsigned actual: " + unsigned + "

" + "signed expected: bar
" + "signed actual: " + signed + "

" + "tampered expected: undefined
" + "tampered: " + tampered + "
");
   }
);
var server = require("http").createServer(app);
server.listen(8000);
http.get(options, function(res)  {
      var header = res.headers["set-cookie"], body = "";
      console.log("
cookies set:", header);
      console.log("
============
");
      assert.equal(header.length, 7);
      options.path = res.headers["Location"];
      options.headers =  {
         Cookie:header.join(";")      }
;
      http.get(options, function(res)  {
            res.on("data", function(chunk)  {
                  body = chunk;
               }
            );
            res.on("end", function()  {
                  console.log(body);
               }
            );
            server.close();
         }
      );
   }
);
