! ✖ / env;
node(function(require, console)  {
      var fs = require("fs"), xcode = require("xcode"), path = require("path"), projectRootDir = path.resolve(__dirname, "..", "..", ".."), projectConfigFilePath = path.join(projectRootDir, "custom", "brand", "project_config.json"), projectName = require(projectConfigFilePath).projectName, iosProjectObject, elementsFilePath = path.join(projectRootDir, "custom", "elements.json"), elements = require(elementsFilePath), elementsNum = 0, platformDestinations =  {
         android:path.join(projectRootDir, "platforms", "android"), 
         ios:path.join(projectRootDir, "platforms", "ios", projectName)      }
, platformDispositions =  {} , targetActions =  {} , platform;
      console.log("[customize hook] Applying customizations from %s", path.relative(projectRootDir, elementsFilePath));
      function determineDispositions()  {
         var platform, location;
         for (platform in platformDestinations)  {
               if (platformDestinations.hasOwnProperty(platform))  {
                  location = platformDestinations[platform];
                  if (! fs.existsSync(location))  {
                     platformDispositions[platform] = "absent";
                     console.log("[customize hook] skipping not-yet existent " + " platform " + platform);
                  }
                   else  {
                     platformDispositions[platform] = "ready";
                  }
               }
            }
         ;
      }
;
      ;
      determineDispositions();
      function doCopyIfPresent(sourceDir, sourceFileName, targetFileName, targetPath, platform)  {
         var platformLC = platform.toLowerCase();
         if (! platformDestinations.hasOwnProperty(platformLC))  {
            throw new Error("[customize hook] Unrecognized customization platform" + " '" + platform + "'");
         }
         var fromPath = path.join(sourceDir, sourceFileName);
         var destPath = path.join(platformDestinations[platformLC], path.join.apply( {} , targetPath.split("/")), targetFileName);
         if (fs.existsSync(fromPath))  {
            if (! fs.existsSync(path.dirname(destPath)))  {
               throw new Error("[customize hook] Copy failed due to missing " + platform + " destination directory for item " + sourceFileName + ": " + path.dirname(destPath));
            }
            var readStream = fs.createReadStream(fromPath);
            var writeStream = fs.createWriteStream(destPath);
            writeStream.on("end", function(event)  {
               }
            );
            console.log("[customize hook] (%s) %s => %s", platform, sourceFileName, path.relative(projectRootDir, destPath));
            readStream.pipe(writeStream);
            return destPath;
         }
          else  {
            console.log("[customize hook] (%s) %s is absent (%s).", platform, sourceFileName, fromPath);
         }
         return false;
      }
;
      ;
      function doAction(action, sourceDir, sourceName, targetName, platform)  {
         if (! targetActions.hasOwnProperty(action))  {
            throw new Error("[customize hook] Unknown targetAction" + " '" + action + "'");
         }
          else  {
            return targetActions[action](action, sourceDir, sourceName, targetName, platform);
         }
      }
;
      ;
      targetActions.iOSaddCertificate = iOSaddCertAction;
      function iOSaddCertAction(action, sourceDir, sourceName, targetName, platform)  {
         var resourcePath = path.join(sourceDir, sourceName), iosProjectObject = xcode.project(platformDestinations["ios"] + ".xcodeproj/project.pbxproj"), destPath, projFile;
         iosProjectObject.parseSync();
         destPath = doCopyIfPresent(sourceDir, sourceName, sourceName, "", "ios");
         projFile = iosProjectObject.addResourceFile(destPath);
         console.log("[customize hook] Did %s: %s", action, path.relative(projectRootDir, resourcePath));
         fs.writeFileSync(iosProjectObject.filepath, iosProjectObject.writeSync());
         return projFile;
      }
;
      ;
      function matchesInDir(target, dir)  {
         var safeReaddirSync = function(dir)  {
            try {
               return fs.readdirSync(dir);
            }
            catch (e) {
               if (e.code === "ENOENT")  {
                  return [];
               }
                else  {
                  throw e;
               }
            }
         }
, entries = safeReaddirSync(dir) || [], asRegexp = target.charAt(0) === "^", got = entries.filter(function(name)  {
               return asRegexp ? name.match(target) : name === target;
            }
         );
         return got;
      }
;
      ;
      for (var i in elements.Items)  {
            var item = elements.Items[i], sourceName = item.SourceFileName, targetName = item.TargetFileName, getCustomElementsFrom = path.join.apply( {} , item.GetCustomElementsFrom || elements.GetCustomElementsFrom.split("/")), customElementsDir = path.join(projectRootDir, getCustomElementsFrom);
            item.Platforms.forEach(function(platform)  {
                  if (platformDispositions[platform.toLowerCase()] !== "ready")  {
                     return ;
                  }
                  ;
                  if (! item.TargetFolder && ! item.TargetAction)  {
                     throw new Error("[customize hook] Entry '%s' must have either a" + " TargetFolder or TargetAction", JSON.stringify(item));
                  }
                   else  {
                     var got = sourceName;
                     matchesInDir(sourceName, customElementsDir).forEach(function(fromName)  {
                           var toName = targetName || fromName;
                           if (item.TargetFolder)  {
                              doCopyIfPresent(customElementsDir, fromName, toName, item.TargetFolder, platform);
                           }
                            else if (item.TargetAction)  {
                              doAction(item.TargetAction, customElementsDir, fromName, toName, platform);
                           }
                           ;
                        }
                     );
                  }
                  ;
               }
            );
         }
   }
)(require, console);
