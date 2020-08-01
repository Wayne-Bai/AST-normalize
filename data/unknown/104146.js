! ✖ / env;
node;
"use strict";
var http = require("http"), querystring = require("querystring"), mime = require("mime"), fs = require("fs"), url = require("url"), util = require("util"), minimatch = require("minimatch"), httpProxy = require("http-proxy"), path = require("path"), optimist = require("optimist");
var argv = optimist.usage("This server providers a utility to wrap JavaScript
" + "with calls to earhorn$. Additionally, it lets earhorn$
" + "write changes to the file system.

" + "Example:

" + "  ./server.js --port 8001 --pattern "**/*.js"

" + "  This would add earhorn$ to every JavaScript file
" + "  running from the current directory (not recommended
" + "  on large codebases).").describe("port", "Port to run on.").describe("cors", "Access-Control-Allow-Origin header, if specified").describe("pattern", "Url pattern add earhorn$ calls to").describe("patternFile", "File with newline-delimited url patterns").describe("verbose", "Whether to enable verbose logging").describe("folder", "Folder to add earhorn$ calls to").describe("runProxy", "Whether to reverse proxy").describe("proxyPort", "Port of site to reverse proxy").describe("proxyHost", "Host of site to reverse proxy").demand("port").boolean("runProxy").boolean("verbose").default("folder", ".").default("proxyHost", "localhost").argv;
var patternFile = argv.patternFile, pattern = argv.pattern, cors = argv.cors, port = + argv.port, folder = argv.folder, verbose = argv.verbose || false, runProxy = argv.runProxy, proxyHost = argv.proxyHost, proxyPort = + argv.proxyPort, proxy = new httpProxy.RoutingProxy(), patterns = [], earhornIndexAliases = ["/earhorn/", "/earhorn/index.html"], indexFilePath = __dirname + "/index.html";
if (patternFile && pattern) throw "--pattern and --patternFile both specified"if (patternFile) patterns = fs.readFileSync(patternFile).split("
") else if (pattern) patterns = [pattern]if (proxyPort && ! runProxy) throw "--proxyPort specified but no --runProxy"if (runProxy && ! proxyPort) throw "--runProxy specified but no --proxyPort"if (runProxy && ! proxyHost) throw "--runProxy specified but no --proxyHost"if (verbose) console.log(argv)function handleError(err, res, code)  {
   console.error(err);
   res.statusCode = code || 500;
   res.setHeader("Content-Type", "application/json");
   res.end(JSON.stringify(err));
}
;
var server = http.createServer(function(req, res)  {
      if (req.url === "/earhorn")  {
         res.statusCode = 302;
         res.setHeader("Location", "/earhorn/");
         return res.end();
      }
      var parsedUrl = url.parse(req.url), query = querystring.parse(parsedUrl.query), pathname = parsedUrl.pathname, isEarhornDir = ! pathname.indexOf("/earhorn/"), isIndex = earhornIndexAliases.indexOf(pathname) >= 0;
      var filePath = path.resolve(isIndex ? indexFilePath : isEarhornDir ? __dirname + "/.." + pathname : folder + pathname);
      var type = mime.lookup(filePath), isJs = type === "application/javascript";
      var matches = patterns.filter(function(p)  {
            if (! isJs) return false            var match = minimatch(pathname, p);
            if (verbose) console.log("testing match", pathname, p, ":", match)            return match;
         }
      );
      if (runProxy && ! matches.length && ! isIndex && ! isEarhornDir)  {
         console.log(req.method, req.url, "=>", proxyHost + ":" + proxyPort);
         return proxy.proxyRequest(req, res,  {
               host:proxyHost, 
               port:proxyPort            }
         );
      }
      console.log(req.method, req.url, "->", filePath);
      if (pathname.indexOf("..") >= 0) return handleError("ellipses in path are invalid", res)      if (req.method === "PUT" && ! isIndex && ! isEarhornDir)  {
         var pendingError = null, stream = fs.createWriteStream(filePath);
         stream.on("close", function()  {
               if (pendingError) writeError(pendingError)                else res.end()            }
         );
         stream.on("error", function(err)  {
               pendingError = err;
            }
         );
         req.pipe(stream);
      }
       else if (req.method === "HEAD" || req.method === "GET") fs.stat(filePath, function(err, stats)  {
            if (err) return handleError(err, res)            res.setHeader("Last-Modified", stats.mtime);
            res.setHeader("Expires", "Sat, 01 Jan 2000 00:00:00 GMT");
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
            res.setHeader("Cache-Control", "post-check=0, pre-check=0");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Content-Type", type);
            if (cors) res.setHeader("Access-Control-Allow-Origin", cors)            if (req.method === "HEAD")  {
               res.setHeader("Content-Length", stats.size);
               return res.end();
            }
            fs.readFile(filePath, function(err, data)  {
                  if (err) return handleError(err, res)                  if (matches.length && ! isIndex && ! isEarhornDir)  {
                     var slashIndex = req.url.lastIndexOf("/"), name = req.url.substring(slashIndex + 1), ref = "http://" + req.headers.host + req.url;
                     data = "earhorn$("" + ref + "", true, function() {" + data + "})()";
                  }
                  res.setHeader("Content-Length", data.length);
                  res.end(data);
               }
            );
         }
      )       else writeError(req.method, res, 405)   }
);
server.listen(port);
console.log("Earhorn server listening on", port);
