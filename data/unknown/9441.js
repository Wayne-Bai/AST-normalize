! ✖;
node;
var http = require("http"), url = require("url"), path = require("path"), fs = require("fs"), program = require("commander");
program.option("-p, --port <n>", "Port to run server on.").option("-h, --host [value]", "Bind address or host.").option("-d, --domain", "Cannonical host. All requests are rewritten to this URL").parse(process.argv);
var port = program.port || process.env.PORT || process.env.OPENSHIFT_INTERNAL_PORT || process.env.VCAP_APP_PORT || 8888, host = program.host || process.env.OPENSHIFT_INTERNAL_IP || "0.0.0.0";
var REDIRECT_PROTOCOL = "http://";
REDIRECT_HOST = program.domain || process.env.DOMAIN || host + ":" + port;
http.createServer(function(request, response)  {
      var hostname = request.headers.host;
      if (hostname !== REDIRECT_HOST)  {
         response.writeHead(301,  {
               Location:REDIRECT_PROTOCOL + REDIRECT_HOST + request.url, 
               Expires:new Date().toGMTString()            }
         );
         response.end();
         return ;
      }
      var uri = url.parse(request.url).pathname, filename = path.join(__dirname, "www", uri);
      fs.exists(filename, function(exists)  {
            if (! exists)  {
               filename = path.join(__dirname, "index.html");
            }
            response.writeHead(404,  {
                  Content-Type:"text/plain"               }
            );
            response.write("404 Not Found :( Sorry.
");
            response.end();
            return ;
         }, 
         fs.statSync(filename).isDirectory(), filename = "/index.html", fs.readFile(filename, "binary", function(err, file)  {
               if (err)  {
                  response.writeHead(500,  {
                        Content-Type:"text/plain"                     }
                  );
                  response.write(err + "
");
                  response.end();
                  return ;
               }
               var opts;
               if (filename.indexOf(".js") > 0)  {
                  opts =  {
                     Content-Type:"application/x-javascript"                  }
;
               }
                else if (filename.indexOf(".css") > 0)  {
                  opts =  {
                     Content-Type:"text/css"                  }
;
               }
                else if (filename.indexOf(".manifest") > 0)  {
                  opts =  {
                     Cache-Control:"no-cache, must-revalidate", 
                     Expires:"Sat, 26 Jul 1997 05:00:00 GMT", 
                     Content-Type:"text/cache-manifest"                  }
;
               }
                else if (filename.indexOf(".webapp") > 0)  {
                  opts =  {
                     Content-Type:"application/x-web-app-manifest+json"                  }
;
               }
               response.writeHead(200, opts);
               response.write(file, "binary");
               response.end();
            }
         ));
   }
);
✖.listen(parseInt(port, 10), host);
console.log("FlipClock running at
 => http://" + REDIRECT_HOST + "/
CTRL + C to shutdown");
