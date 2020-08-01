! ✖ / env;
node(function(require)  {
      var fs = require("fs"), path = require("path"), res = path.join(".", "www", "res", "icon"), projectRootDir = path.resolve(__dirname, "..", "..", ".."), projectConfigFilePath = path.join(projectRootDir, "custom", "brand", "project_config.json"), projectName = require(projectConfigFilePath).projectName, androidDest = path.join(projectRootDir, "platforms", "android", "res"), iOSDest = path.join(projectRootDir, "platforms", "ios", projectName, "Resources", "icons");
      var androidIcons = [ {
         file:"cordova_android_96.png", 
         dest:"drawable"      }
,  {
         file:"cordova_android_72.png", 
         dest:"drawable-hdpi"      }
,  {
         file:"cordova_android_36.png", 
         dest:"drawable-ldpi"      }
,  {
         file:"cordova_android_48.png", 
         dest:"drawable-mdpi"      }
,  {
         file:"cordova_android_96.png", 
         dest:"drawable-xhdpi"      }
];
      var iOSIcons = [ {
         file:"cordova_ios_57.png", 
         dest:"icon.png"      }
,  {
         file:"cordova_ios_114.png", 
         dest:"icon@2x.png"      }
,  {
         file:"cordova_ios_72.png", 
         dest:"icon-72.png"      }
,  {
         file:"cordova_ios_76.png", 
         dest:"icon-76.png"      }
,  {
         file:"cordova_ios_120.png", 
         dest:"icon-60@2x.png"      }
,  {
         file:"cordova_ios_180.png", 
         dest:"icon-60@3x.png"      }
,  {
         file:"cordova_ios_144.png", 
         dest:"icon-72@2x.png"      }
,  {
         file:"cordova_ios_152.png", 
         dest:"icon-76@2x.png"      }
];
      function copyFile(from, to)  {
         var readStream = fs.createReadStream(from);
         var writeStream = fs.createWriteStream(to);
         writeStream.on("end", function(event)  {
            }
         );
         readStream.pipe(writeStream);
      }
;
      if (fs.existsSync(res))  {
         if (fs.existsSync(androidDest))  {
            console.log("[hooks] copying android icons...");
            var idxa;
            for (idxa in androidIcons)  {
                  copyFile(path.join(res, androidIcons[idxa].file), path.join(androidDest, androidIcons[idxa].dest, "icon.png"));
               }
         }
         if (fs.existsSync(iOSDest))  {
            console.log("[hooks] copying ios icons...");
            var idxi;
            for (idxi in iOSIcons)  {
                  copyFile(path.join(res, iOSIcons[idxi].file), path.join(iOSDest, iOSIcons[idxi].dest));
               }
         }
      }
   }
)(require);
