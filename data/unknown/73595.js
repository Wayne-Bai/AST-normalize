! ✖ / env;
node;
"use strict";
require("colors");
var http = require("http"), url = require("url"), fs = require("fs"), ps = require("child_process"), path = require("path"), host = "127.0.0.1", port = 39170, appBuildMain =  {
   baseUrl:"../../src/", 
   optimize:"uglify2", 
   out:"./Epitome-min.js", 
   name:"epitome", 
   include:["epitome-events", "epitome", "epitome-isequal", "epitome-model", "epitome-model-sync", "epitome-storage", "epitome-collection", "epitome-collection-sync", "epitome-template", "epitome-view", "epitome-router"]}
, generateUID = function()  {
   var now = new Date();
   return Math.floor(Math.random() * 10) + parseInt(now.getTime(), 10).toString(36).toUpperCase();
}
;
function respond(res, code, contents)  {
   console.log("[" + "LOG".green + "] " + code);
   res.writeHead(code,  {
         Content-Type:code === 200 ? "application/javascript;charset=UTF-8" : "text/plain", 
         Content-Length:contents.length      }
   );
   res.write(contents, "utf8");
   res.end();
}
;
http.createServer(function(req, res)  {
      var u = url.parse(req.url, true), query = u["query"], id = generateUID(), file = "./hash/epitome-" + id + ".js", ip = req.connection.remoteAddress, appBuild;
      require("dns").reverse(ip, function(err, domains)  {
            if (! err)  {
               console.log("Started session for " + ip.green + " - " + domains.join(" "));
            }
             else  {
               console.log("Started session for " + ip.green);
            }
         }
      );
      req.on("close", function()  {
            res.end();
         }
      );
      req.on("end", function()  {
            var deps = [], temp, allowBuild = true;
            appBuild = JSON.parse(JSON.stringify(appBuildMain));
            if (query.build)  {
               temp = query.build.split(",");
               console.log("Created a custom include with " + deps.join(", "));
               temp = temp.filter(function(dep)  {
                     var e = fs.existsSync("../src/" + dep + ".js");
                     e || console.log("Error:".red + " skipping " + dep.green);
                     return e;
                  }
               );
               if (! temp.length)  {
                  console.log("No custom includes found, returning main instead");
                  id = "base.js";
                  deps = appBuild.include;
               }
                else  {
                  deps = temp;
                  fs.writeFile(file, deps.join(","), function(error)  {
                        error && console.log("Error".red + " - failed to write " + file.green);
                     }
                  );
                  appBuild.include = deps;
               }
            }
             else if (u.pathname != "/" && u.pathname.length == 10 && u.pathname.match(/\/([A-Z0-9]+)/))  {
               id = u.pathname.replace("/", "");
               var orig = "./hash/epitome-" + id + ".js";
               if (! path.existsSync(orig))  {
                  respond(res, 404, "Failed to find existing build for " + id);
                  allowBuild = false;
               }
                else  {
                  console.log("Found existing hash id, rebuilding...");
               }
            }
             else  {
               console.log("No custom includes found, returning main instead");
               id = "base.js";
               deps = appBuild.include;
            }
            appBuild.out = "../out/epitome-" + id + "-min.js";
            var buildFile = "./hash/" + id + ".json", handleBuilding = function()  {
               var ab = require(buildFile);
               console.log("[" + "LOG".green + "] running: r.js -o " + file);
               ps.exec("r.js -o " + buildFile, function(error, output)  {
                     console.log(output);
                     if (error)  {
                        respond(res, 500, error.toString());
                        return ;
                     }
                     fs.readFile("./out/epitome-" + id + "-min.js", function(error, contents)  {
                           contents = "/*Epitome hash: " + id + "
  Download: http://" + req.headers.host + "/" + id + "
  Selected: " + ab.include.join(", ") + " */
" + contents;
                           respond(res, 200, contents);
                        }
                     );
                  }
               );
            }
;
            fs.writeFile(buildFile, JSON.stringify(appBuild), function()  {
                  allowBuild && handleBuilding();
               }
            );
         }
      );
   }
).listen(port);
console.log("Epitome".green + " Build Server running at http://" + host + ":" + port + "/");
