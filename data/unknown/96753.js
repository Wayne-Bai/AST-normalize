! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), wsapi = require("./lib/wsapi.js"), config = require("../lib/configuration.js"), http = require("http"), secrets = require("../lib/secrets.js"), version = require("../lib/version.js");
var suite = vows.describe("post-limiting");
suite.options.error = false;
const;
MAX_POST_SIZE = 1024 * 10;
start_stop.addStartupBatches(suite);
var code_version;
function getVersion(done)  {
   version(function(commit)  {
         code_version = commit;
         done();
      }
   );
}
;
function request(opts, done)  {
   var headers = opts.headers = opts.headers ||  {} ;
   if (opts.path.indexOf("/wsapi") > - 1)  {
      headers["BrowserID-git-sha"] = code_version;
   }
   return http.request(opts, done);
}
;
function addTests(port, path)  {
   suite.addBatch( {
         posting more than allowed: {
            topic:function()  {
               var cb = this.callback;
               getVersion(function()  {
                     var req = request( {
                           host:"127.0.0.1", 
                           port:port, 
                           path:path, 
                           headers: {
                              Content-Type:"application/x-www-form-urlencoded"                           }, 
                           method:"POST"                        }, 
                        function(res)  {
                           cb(null, res);
                        }
                     ).on("error", function(e)  {
                           cb(e);
                        }
                     );
                     req.write(secrets.weakGenerate(MAX_POST_SIZE + 1));
                     req.end();
                  }
               );
            }, 
            fails:function(err)  {
               assert.ok(/Error: (socket hang up|read ECONNRESET)/.test(err.toString()));
            }}       }
   );
   suite.addBatch( {
         posting more than allowed with content-length: {
            topic:function()  {
               var cb = this.callback;
               getVersion(function()  {
                     var req = request( {
                           host:"127.0.0.1", 
                           port:port, 
                           path:path, 
                           headers: {
                              Content-Type:"application/x-www-form-urlencoded", 
                              Content-Length:MAX_POST_SIZE + 1                           }, 
                           method:"POST"                        }, 
                        function(res)  {
                           cb(null, res);
                        }
                     ).on("error", function(e)  {
                           cb(e);
                        }
                     );
                     req.write(secrets.weakGenerate(MAX_POST_SIZE + 1));
                     req.end();
                  }
               );
            }, 
            fails:function(err, r)  {
               assert.strictEqual(413, r.statusCode);
            }}       }
   );
}
;
addTests(10002, "/wsapi/authenticate_user");
addTests(10000, "/verify");
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)