! ✖ / env;
node;
if (process.getuid && process.getuid() === 0)  {
   global.console.error("Sinopia doesn't need superuser privileges. Don't run it under root.");
}
process.title = "sinopia";
require("es6-shim");
try {
   require("heapdump");
}
catch (err) {
}
var logger = require("./logger");
logger.setup();
var commander = require("commander");
var constants = require("constants");
var fs = require("fs");
var http = require("http");
var https = require("https");
var YAML = require("js-yaml");
var Path = require("path");
var URL = require("url");
var server = require("./index");
var Utils = require("./utils");
var pkg_file = "../package.yaml";
var pkg = YAML.safeLoad(fs.readFileSync(__dirname + "/" + pkg_file, "utf8"));
commander.option("-l, --listen <[host:]port>", "host:port number to listen on (default: localhost:4873)").option("-c, --config <config.yaml>", "use this configuration file (default: ./config.yaml)").version(pkg.version).parse(process.argv);
if (commander.args.length == 1 && ! commander.config)  {
   commander.config = commander.args.pop();
}
if (commander.args.length != 0)  {
   commander.help();
}
var config, config_path;
try {
   if (commander.config)  {
      config_path = Path.resolve(commander.config);
   }
    else  {
      config_path = require("./config-path")();
   }
   config = YAML.safeLoad(fs.readFileSync(config_path, "utf8"));
   logger.logger.warn( {
         file:config_path      }, 
      "config file  - @{file}");
}
catch (err) {
   logger.logger.fatal( {
         file:config_path, 
         err:err      }, 
      "cannot open config file @{file}: @{!err.message}");
   process.exit(1);
}
afterConfigLoad();
function get_listen_addresses()  {
   var addresses;
   if (commander.listen)  {
      addresses = [commander.listen];
   }
    else if (Array.isArray(config.listen))  {
      addresses = config.listen;
   }
    else if (config.listen)  {
      addresses = [config.listen];
   }
    else  {
      addresses = ["4873"];
   }
   addresses = addresses.map(function(addr)  {
         addr = Utils.parse_address(addr);
         if (! addr)  {
            logger.logger.warn( {
                  addr:addr               }, 
               "invalid address - @{addr}, we expect a port (e.g. "4873"),", + " host:port (e.g. "localhost:4873") or full url" + " (e.g. "http://localhost:4873/")");
         }
         return addr;
      }
   ).filter(Boolean);
   return addresses;
}
;
function afterConfigLoad()  {
   if (! config.self_path) config.self_path = Path.resolve(config_path)   if (! config.https) config.https =  {
      enable:false   }
   var app = server(config);
   get_listen_addresses().forEach(function(addr)  {
         var webServer;
         if (addr.proto === "https")  {
            if (! config.https || ! config.https.key || ! config.https.cert)  {
               var conf_path = function(file)  {
                  if (! file) return config_path                  return Path.resolve(Path.dirname(config_path), file);
               }
;
               logger.logger.fatal(["You need to specify "https.key" and "https.cert" to run https server", "", "To quickly create self-signed certificate, use:", " $ openssl genrsa -out " + conf_path("sinopia-key.pem") + " 2048", " $ openssl req -new -sha256 -key " + conf_path("sinopia-key.pem") + " -out " + conf_path("sinopia-csr.pem"), " $ openssl x509 -req -in " + conf_path("sinopia-csr.pem") + " -signkey " + conf_path("sinopia-key.pem") + " -out " + conf_path("sinopia-cert.pem"), "", "And then add to config file (" + conf_path() + "):", "  https:", "    key: sinopia-key.pem", "    cert: sinopia-cert.pem"].join("
"));
               process.exit(2);
            }
            try {
               webServer = https.createServer( {
                     secureProtocol:"SSLv23_method", 
                     secureOptions:constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3, 
                     key:fs.readFileSync(config.https.key), 
                     cert:fs.readFileSync(config.https.cert)                  }, 
                  app);
            }
            catch (err) {
               logger.logger.fatal( {
                     err:err                  }, 
                  "cannot create server: @{err.message}");
               process.exit(2);
            }
         }
          else  {
            webServer = http.createServer(app);
         }
         webServer.listen(addr.port, addr.host).on("error", function(err)  {
               logger.logger.fatal( {
                     err:err                  }, 
                  "cannot create server: @{err.message}");
               process.exit(2);
            }
         );
         logger.logger.warn( {
               addr:URL.format( {
                     protocol:addr.proto, 
                     hostname:addr.host, 
                     port:addr.port, 
                     pathname:"/"                  }
               ), 
               version:"Sinopia/" + pkg.version            }, 
            "http address - @{addr}");
      }
   );
   if (typeof process.send === "function")  {
      process.send( {
            sinopia_started:true         }
      );
   }
}
;
process.on("uncaughtException", function(err)  {
      logger.logger.fatal( {
            err:err         }, 
         "uncaught exception, please report this
@{err.stack}");
      process.exit(255);
   }
);
