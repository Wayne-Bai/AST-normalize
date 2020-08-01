! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), wsapi = require("./lib/wsapi.js"), http = require("http"), secondary = require("./lib/secondary.js"), version = require("../lib/version.js");
var suite = vows.describe("registration-status-wsapi");
start_stop.addStartupBatches(suite);
suite.addBatch( {
      creating a secondary account: {
         topic:function()  {
            secondary.create( {
                  email:"first@fakeemail.com", 
                  pass:"firstfakepass", 
                  site:"http://fakesite.com:123"               }, 
               this.callback);
         }, 
         succeeds:function(err, r)  {
            assert.isNull(err);
         }}    }
);
suite.addBatch( {
      attempt to auth without cookie: {
         topic:function()  {
            var cb = this.callback;
            version(function(commit)  {
                  var req = http.request( {
                        host:"127.0.0.1", 
                        port:10002, 
                        path:"/wsapi/authenticate_user", 
                        headers: {
                           Content-Type:"application/json", 
                           BrowserID-git-sha:commit                        }, 
                        method:"POST", 
                        agent:false                     }, 
                     function(res)  {
                        var body = "";
                        res.on("data", function(chunk)  {
                              body = chunk;
                           }
                        ).on("end", function()  {
                              cb(null,  {
                                    code:res.statusCode, 
                                    headers:res.headers, 
                                    body:body                                 }
                              );
                           }
                        );
                     }
                  ).on("error", function(e)  {
                        cb(e);
                     }
                  );
                  req.write(JSON.stringify( {
                           csrf:wsapi.getCSRF(), 
                           email:"first@fakeemail.com", 
                           pass:"firstfakepass"                        }
                     ));
                  req.end();
               }
            );
         }, 
         returns a 403 with 'no cookie' as the body:function(err, r)  {
            assert.equal(err, null);
            assert.equal(r.code, 403);
            assert.equal(r.body, "Forbidden: no cookie");
         }}    }
);
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)