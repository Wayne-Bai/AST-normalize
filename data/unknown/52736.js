! ✖ / env;
node;
"use strict";
var path = require("path");
var fs = require("fs");
var readline = require("readline");
var rl = readline.createInterface( {
      input:process.stdin, 
      output:process.stdout   }
);
module.exports = function()  {
   var self = this ||  {} ;
   self.waterlockPlugins = [];
   self.logger = require("../lib/logger");
   self.waterlockPlugins.push(path.resolve(__dirname + "/../lib/templates"));
   var node_modules = path.resolve(__dirname + "/../..");
   var _node_modules = fs.readdirSync(node_modules);
   for (var i = 0; i < _node_modules.length; i++)  {
         if (_node_modules[i].indexOf("waterlock-") > - 1)  {
            self.waterlockPlugins.push(node_modules + "/" + _node_modules[i] + "/lib/templates");
         }
      }
   return  {
      installArray:[], 
      basePath:path.resolve(__dirname + "/../../.."), 
      install:function(task)  {
         switch(task) {
            case "all":
 
                  this.collectAll();
                  break;
               
            case "models":
 
               
            case "controllers":
 
               
            case "configs":
 
               
            case "views":
 
               
            case "policies":
 
                  this.collect(task);
                  break;
               
            default:
 
                  this.usageExit();
                  break;
               
}
;
         this.triggerNext();
      }, 
      collect:function(target)  {
         for (var i = 0; i < self.waterlockPlugins.length; i++)  {
               var arr = this.readdirSyncComplete(self.waterlockPlugins[i] + "/" + target);
               this.installArray = this.installArray.concat(arr);
            }
      }, 
      collectAll:function()  {
         this.collect("models");
         this.collect("controllers");
         this.collect("configs");
         this.collect("policies");
         this.collect("views");
      }, 
      readdirSyncComplete:function(path)  {
         var fullPath = [];
         try {
            var files = fs.readdirSync(path);
            for (var i = 0; i < files.length; i++)  {
                  fullPath.push(path + "/" + files[i]);
               }
            return fullPath;
         }
         catch (e) {
            return [];
         }
      }, 
      usageExit:function()  {
         this.usage();
         process.exit(1);
      }, 
      usage:function()  {
         console.log("");
         this.log("Usage: generate [resource]");
         this.log("Resources:");
         this.log("  all                    generates all components", false);
         this.log("  models                 generates all models", false);
         this.log("  controllers            generates all controllers", false);
         this.log("  configs                generates default configs", false);
         this.log("  views                  generates default view templates", false);
         this.log("  policies               generates all policies");
      }, 
      log:function(msg, br)  {
         console.log("  " + msg);
         if (typeof br === "undefined" || br)  {
            console.log(" ");
         }
      }, 
      triggerNext:function()  {
         var src = this.installArray.shift();
         if (typeof src !== "undefined")  {
            var parts = src.split("/");
            var resourcePath = this.getResourcePath(parts[parts.length - 2]);
            var dest = this.basePath + resourcePath + "/" + parts[parts.length - 1];
            if (typeof resourcePath !== "undefined")  {
               this._install(src, dest);
            }
             else  {
               this.triggerNext();
            }
         }
          else  {
            this.log("all done, get ready to rock!  (╯°□°）╯︵ ┻━┻");
            rl.close();
         }
      }, 
      getResourcePath:function(resource)  {
         switch(resource) {
            case "models":
 
                  return "/api/models";
               
            case "controllers":
 
                  return "/api/controllers";
               
            case "configs":
 
                  return "/config";
               
            case "policies":
 
                  return "/api/policies";
               
            case "views":
 
                  return "/views";
               
            default:
 
                  return null;
               
}
;
      }, 
      _install:function(src, dest)  {
         if (fs.existsSync(dest))  {
            this.waitForResponse(src, dest);
         }
          else  {
            this.copy(src, dest);
            this.triggerNext();
         }
      }, 
      copy:function(src, dest)  {
         self.logger.info("generating " + dest);
         fs.createReadStream(src).pipe(fs.createWriteStream(dest));
      }, 
      waitForResponse:function(src, dest)  {
         self.logger.warn("File at " + dest + " exists, overwrite?");
         rl.question("(yN) ", function(answer)  {
               switch(answer.toLowerCase()) {
                  case "y":
 
                        this.copy(src, dest);
                        this.triggerNext();
                        break;
                     
                  case "n":
 
                        this.triggerNext();
                        break;
                     
                  default:
 
                        this.waitForResponse(src, dest);
                        break;
                     
}
;
            }
.bind(this));
      }} ;
}
;
