! ✖ / env;
node;
var fs = require("fs"), connect = require("connect"), colors = require("colors"), WebSocket = require("faye-websocket"), path = require("path"), url = require("url"), http = require("http"), send = require("send"), open = require("open"), es = require("event-stream"), watchr = require("watchr"), ws;
var INJECTED_CODE = fs.readFileSync(__dirname + "/injected.html", "utf8");
var LiveServer =  {} ;
function escape(html)  {
   return String(html).replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
;
function staticServer(root)  {
   return function(req, res, next)  {
      if ("GET" != req.method && "HEAD" != req.method) return next()      var reqpath = url.parse(req.url).pathname;
      var hasNoOrigin = ! req.headers.origin;
      var doInject = false;
      function directory()  {
         var pathname = url.parse(req.originalUrl).pathname;
         res.statusCode = 301;
         res.setHeader("Location", pathname + "/");
         res.end("Redirecting to " + escape(pathname) + "/");
      }
;
      function file(filepath, stat)  {
         var x = path.extname(filepath);
         if (hasNoOrigin && x === "" || x == ".html" || x == ".htm" || x == ".xhtml" || x == ".php")  {
            var contents = fs.readFileSync(filepath, "utf8");
            doInject = contents.indexOf("</body>") > - 1;
         }
      }
;
      function error(err)  {
         if (404 == err.status) return next()         next(err);
      }
;
      function inject(stream)  {
         if (doInject)  {
            var len = INJECTED_CODE.length + res.getHeader("Content-Length");
            res.setHeader("Content-Length", len);
            var originalPipe = stream.pipe;
            stream.pipe = function(res)  {
               originalPipe.call(stream, es.replace(new RegExp("</body>", "i"), INJECTED_CODE + "</body>")).pipe(res);
            }
;
         }
      }
;
      send(req, reqpath,  {
            root:root         }
      ).on("error", error).on("directory", directory).on("file", file).on("stream", inject).pipe(res);
   }
;
}
;
LiveServer.start = function(options)  {
   options = options ||  {} ;
   var host = options.host || "0.0.0.0";
   var port = options.port || 8080;
   var root = options.root || process.cwd();
   var logLevel = options.logLevel === undefined ? 2 : options.logLevel;
   var openPath = options.open === undefined || options.open === true ? "" : options.open === null || options.open === false ? null : options.open;
   if (options.noBrowser) openPath = null   var app = connect().use(staticServer(root)).use(connect.directory(root,  {
            icons:true         }
      ));
   if (logLevel >= 2) app.use(connect.logger("dev"))   var server = http.createServer(app).listen(port, host);
   server.addListener("upgrade", function(request, socket, head)  {
         ws = new WebSocket(request, socket, head);
         ws.onopen = function()  {
            ws.send("connected");
         }
;
      }
   );
   watchr.watch( {
         path:root, 
         ignoreCommonPatterns:true, 
         ignoreHiddenFiles:true, 
         preferredMethods:["watchFile", "watch"], 
         interval:1407, 
         listeners: {
            error:function(err)  {
               console.log("ERROR:".red, err);
            }, 
            change:function(eventName, filePath, fileCurrentStat, filePreviousStat)  {
               if (! ws) return                if (path.extname(filePath) == ".css")  {
                  ws.send("refreshcss");
                  if (logLevel >= 1) console.log("CSS change detected".magenta)               }
                else  {
                  ws.send("reload");
                  if (logLevel >= 1) console.log("File change detected".cyan)               }
            }}       }
   );
   var serveURL = "http://127.0.0.1:" + port;
   if (logLevel >= 1) console.log("Serving "" + root + "" at " + serveURL.green)   if (openPath !== null) open(serveURL + openPath)}
;
module.exports = LiveServer;
