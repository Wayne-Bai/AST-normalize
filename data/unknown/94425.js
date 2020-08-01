! ✖ / env;
node;
var path = require("path");
require("colors");
var mkdirp = require("mkdirp");
var Deployer = require("../lib/deployer");
var deployer = new Deployer();
var exec = require("child_process").exec;
var ConfigurationManager = require("../lib/configurationManager");
var crypto = require("crypto");
var cjson = require("cjson");
var fs = require("fs");
var request = require("request");
var nariyaHome = path.resolve(process.env.HOME, ".nariya/");
var nariyaConfFile = path.resolve(nariyaHome, "nariya.conf");
var nariyaLibs = path.resolve(__dirname, "../lib");
var nariyaLog = path.resolve(nariyaHome, "./nariya.log");
var nariyaErrorLog = path.resolve(nariyaHome, "./nariya.err.log");
var action = process.argv[2];
console.log("Welcome to Nariya - Continious Deployment Server".bold.magenta);
if (action == "start")  {
   startNariya();
}
 else if (action == "stop")  {
   var configurationManager = new ConfigurationManager(nariyaConfFile);
   configurationManager.updateSync();
   var stopCommand = "forever stop start-nariya.js";
   exec(stopCommand,  {
         cwd:nariyaLibs      }, 
      function(err)  {
         if (! err)  {
            console.log("+ Nariya Server Stopped on port: %s".bold.green, configurationManager.getServerInfo().port);
         }
          else  {
            console.error("+ Error when stopping Nariya Server
	%s".red, err.message);
         }
      }
   );
}
 else if (action == "add")  {
   var configurationManager = new ConfigurationManager(nariyaConfFile);
   var name = process.argv[3];
   var repoType = process.argv[4] ? process.argv[4] : "github";
   var branch = process.argv[5] ? process.argv[5] : "master";
   if (name)  {
      deployer.fileExists(nariyaConfFile, function(exists)  {
            if (exists)  {
               configurationManager.updateSync();
               checkForGit(process.cwd(), afterGitChecked);
            }
             else  {
               console.log("+ Nariya is not configured. start the nariya".bold.red);
               console.log("	eg:- nariya start");
            }
         }
      );
   }
    else  {
      console.log("+ Project Name Required:".bold.red);
      console.log("	eg:- nariya add project-name");
   }
   function afterGitChecked(yes)  {
      if (yes)  {
         deployer.findStartScript(process.cwd(), startScriptFounded);
      }
       else  {
         console.error("+ This is not an valid git project".bold.red);
      }
   }
;
   function startScriptFounded(err, script)  {
      if (! err)  {
         var repoInfo =  {
            location:process.cwd(), 
            logpath:path.resolve(nariyaHome, "./" + name), 
            type:repoType, 
            secret:md5("" + Math.random()), 
            branch:branch, 
            startScript:script         }
;
         mkdirp(repoInfo.logpath, 493);
         saveConfigurations(name, repoInfo);
         var webhook = "http://hostname:" + configurationManager.getServerInfo().port + "/deploy/" + repoInfo.secret;
         console.log("+ project added with secret: %s".bold.green, repoInfo.secret.yellow);
         console.log("  add following webhook
	" + webhook);
         console.log("  edit %s for advanced configurations", nariyaConfFile.bold);
         console.log("+ starting nariya again to apply these settings".bold.green);
         startNariya();
      }
       else  {
         console.error("+ Error loading Startup Script: %s".bold.red, err.message);
      }
   }
;
}
 else if (action == "deploy")  {
   var name = process.argv[3];
   if (name)  {
      var conf = cjson.load(nariyaConfFile);
      var repo = conf.repositories[name];
      if (repo)  {
         var uri = "http://localhost:" + conf.server.port + "/deploy/" + repo.secret;
         console.log("+ simulating github webhook call as".bold.green);
         console.log("	" + uri);
         var payload = getSamplePayload(repo.type, repo.branch);
         request( {
               method:"POST", 
               uri:uri, 
               headers: {
                  Content-Type:"application/x-www-form-urlencoded"               }, 
               body:payload            }, 
            function(error, response, data)  {
               console.log(response.statusCode);
               if (! error && response.statusCode == 200)  {
                  console.log("+ Project Deployment started".green.bold);
               }
                else  {
                  console.error("+ Error Deploying Request".bold.red);
                  console.error("	" + JSON.stringify(error));
                  console.error("	" + data);
               }
            }
         );
      }
       else  {
         console.log("This is not a valid nariya enabled project".red.bold);
      }
   }
    else  {
      console.log("+ Project Name Required:".bold.red);
      console.log("	eg:- nariya add project-name");
   }
}
 else  {
   console.log("	usage: nariya [start | stop | add | deploy ]".bold.green);
   console.log("		add name [repoType] [branch]".green);
   console.log("
");
}
function checkForGit(folder, callback)  {
   exec("git status",  {
         cwd:folder      }, 
      function(err, stdout, stderr)  {
         if (! err)  {
            callback(true);
         }
          else  {
            callback(false);
         }
      }
   );
}
;
function md5(data)  {
   var hash = crypto.createHash("md5");
   hash.update(data);
   return hash.digest("hex");
}
;
function saveConfigurations(appname, repoInfo)  {
   var conf = cjson.load(nariyaConfFile);
   conf.repositories[appname] = repoInfo;
   fs.writeFileSync(nariyaConfFile, JSON.stringify(conf, null, 4), "utf-8");
}
;
function startNariya()  {
   mkdirp(nariyaHome, 493, function()  {
         var sampleConf = path.resolve(__dirname, "../conf/sample.conf");
         deployer.executeIfNotExists(nariyaHome, "nariya.conf", "cp " + sampleConf + " " + nariyaConfFile, afterCopied);
      }
   );
   function afterCopied(err)  {
      var configurationManager = new ConfigurationManager(nariyaConfFile);
      configurationManager.updateSync();
      var startCommand = "forever stop start-nariya.js && SL_NAME=nariya NODE_ENV=production forever start ";
      startCommand = "-o " + nariyaLog + " ";
      startCommand = "-e " + nariyaErrorLog + " ";
      startCommand = "start-nariya.js";
      exec(startCommand,  {
            cwd:nariyaLibs         }, 
         function(err)  {
            if (! err)  {
               console.log("+ Nariya Server Started on port: %s".bold.green, configurationManager.getServerInfo().port);
            }
             else  {
               console.error("+ Error when starting Nariya Server
	%s".red, err.message);
            }
         }
      );
   }
;
   ;
}
;
function getSamplePayload(repoType, branch)  {
   var payloads =  {
      github:"payload=" + "{"ref": "refs/heads/" + branch + ""}", 
      bitbucket:"payload=" + JSON.stringify( {
            commits:[ {
               branch:branch            }
]         }
      )   }
;
   return payloads[repoType];
}
;
