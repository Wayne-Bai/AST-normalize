! ✖ / env;
node;
var http = require("http"), fs = require("fs"), path = require("path"), url = require("url"), opt = require("parseopt"), io = require("socket.io");
var VogueClient = require("./VogueClient").VogueClient, Watcher = require("./Watcher").Watcher;
var options = getOptions(), server = http.createServer(handleHttpRequest), socket = io.listen(server), watcher = new Watcher(options.webDirectory, options.rewrite);
server.listen(options.port);
socket.sockets.on("connection", function(clientSocket)  {
      watcher.addClient(new VogueClient(clientSocket, watcher));
   }
);
console.log("Watching directory: " + options.webDirectory);
console.log("Listening for clients: http://localhost:" + options.port + "/");
function handleHttpRequest(request, response)  {
   var pathname = url.parse(request.url).pathname;
   if (pathname === "/")  {
      sendAboutPage(response);
   }
    else if (pathname === "/vogue-client.js")  {
      sendVogueClient(response);
   }
}
;
function sendAboutPage(response)  {
   fs.readFile(__dirname + "/client/about.htm", function(e, fileData)  {
         var html = fileData.toString();
         html = html.replace(/\{port\}/g, options.port.toString());
         response.writeHead(200,  {
               Content-Type:"text/html"            }
         );
         response.write(html);
         response.end();
      }
   );
}
;
function sendVogueClient(response)  {
   fs.readFile(__dirname + "/client/vogue-client.js", function(e, fileData)  {
         var script = fileData.toString();
         response.writeHead(200,  {
               Content-Type:"text/javascript"            }
         );
         response.write(script);
         response.end();
      }
   );
}
;
function getOptions()  {
   var data = createOptionParser().parse();
   if (! data) process.exit(1)   data.options.webDirectory = getDirectoryToWatch(data.arguments);
   return data.options;
   function createOptionParser()  {
      var parser = new opt.OptionParser( {
            options:[ {
               name:["--port", "-p"], 
               type:"int", 
               help:"Port to run Vogue server on", 
               default:8001            }
,  {
               name:["--rewrite", "-r"], 
               type:"string", 
               help:"Expression of the form "regexp:replacement" rewrites a URL path into a file system path, relative to the website root directory. For example: --rewrite "v[0-9]/(.*)$:files/\$1" would change "v1/demo.css" to "files/demo.css".", 
               default:null            }
,  {
               name:["--help", "-h", "-?"], 
               type:"flag", 
               help:"Show this help message", 
               onOption:function(value)  {
                  if (value)  {
                     parser.usage("First argument after options should be the path to the website's root directory. Otherwise the current directory is used.
e.g. vogue -p 8001 ./myweb");
                  }
                  return value;
               }} ]         }
      );
      return parser;
   }
;
   function getDirectoryToWatch(arguments)  {
      var dir;
      if (arguments.length > 0)  {
         if (/^\//.test(arguments[0]))  {
            dir = arguments[0];
         }
          else  {
            dir = path.join(process.cwd(), arguments[0]);
         }
      }
       else  {
         dir = process.cwd();
      }
      try {
         var stats = fs.statSync(dir);
         if (! stats.isDirectory())  {
            console.error("Path is not a directory: " + dir);
            process.exit(1);
         }
      }
      catch (e) {
         console.error("Path not found: " + dir);
         process.exit(1);
      }
      return dir;
   }
;
}
;
