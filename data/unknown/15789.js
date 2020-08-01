! ✖ / env;
node;
var yaml = require("js-yaml");
var path = require("path");
var fs = require("fs");
var request = require("request");
var version = process.argv[2];
if (! version)  {
   console.log("Please pass the Bootswatch version as an argument.");
   process.exit(1);
}
var basedir = path.join(__dirname, "..");
var bootswatchDir = path.join(basedir, "public", "bootswatch", version);
var configFile = path.join(basedir, "config", "_config.yml");
var config = yaml.safeLoad(fs.readFileSync(configFile));
var files = ["https://bootswatch.com/%s/bootstrap.min.css", "https://bootswatch.com/%s/bootstrap.css"];
var fonts = "https://bootswatch.com/fonts/%s";
var fontsDir = path.join(bootswatchDir, "fonts");
function errorCheck(err)  {
   if (err)  {
      console.trace(err);
      process.exit(1);
   }
}
;
fs.mkdirSync(bootswatchDir, 493);
console.log("Created: %s", bootswatchDir);
files.forEach(function(file)  {
      config.bootswatch.themes.forEach(function(theme)  {
            var source = file.replace("%s", theme);
            request.get(source, function(err, res, body)  {
                  if (res.statusCode !== 200)  {
                     errorCheck(new Error("Non-success status code: " + res.statusCode));
                  }
                  var targetDir = path.join(bootswatchDir, theme);
                  try {
                     fs.mkdirSync(targetDir, 493);
                     console.log("  Created: %s", targetDir);
                  }
                  catch (e) {
                  }
                  var target = path.join(targetDir, path.basename(file));
                  fs.writeFileSync(target, body);
                  console.log("    Saved: %s", target);
                  console.log("     From: %s", source);
               }
            );
         }
      );
   }
);
fs.mkdirSync(fontsDir, 493);
console.log("  Created: %s", fontsDir);
["glyphicons-halflings-regular.eot", "glyphicons-halflings-regular.svg", "glyphicons-halflings-regular.ttf", "glyphicons-halflings-regular.woff", "glyphicons-halflings-regular.woff2"].forEach(function(font)  {
      var fontPath = fonts.replace("%s", font);
      request.get(fontPath, function(err, res, body)  {
            if (res.statusCode !== 200)  {
               errorCheck(new Error("Non-success status code: " + res.statusCode));
            }
            var target = path.join(fontsDir, font);
            fs.writeFileSync(target, body);
            console.log("    Saved: %s", target);
            console.log("     From: %s", fontPath);
         }
      );
   }
);
process.on("exit", function(code)  {
      if (code === 0)  {
         console.log("Don't forget to update symlink and config file!");
      }
   }
);
