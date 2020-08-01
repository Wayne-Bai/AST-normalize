! ✖ / env;
node;
"use strict";
var fs = require("fs"), path = require("path"), inDir = process.argv[2], jsFileRegExp = /\.js$/, dependStartRegExp = /\*\s+Depends\:([^\/]+)\*\//, dotRegExp = /\./g, filesRegExp = /([\w\.]+)\.js/g, exists = fs.existsSync || path.existsSync, jqUiSrcDir, jqPaths;
function mkDir(dir)  {
   if (! exists(dir))  {
      fs.mkdirSync(dir, 511);
   }
}
;
function readFile(filePath)  {
   var text = fs.readFileSync(filePath, "utf8");
   if (text.indexOf("﻿") === 0)  {
      text = text.substring(1, text.length);
   }
   return text;
}
;
function convert(fileName, contents)  {
   var moduleName, outFileName, i, segment, match = dependStartRegExp.exec(contents), files = ["'jquery'"], fileParts = fileName.split("."), tempDir = inDir;
   fileParts.pop();
   if (fileParts[0].indexOf("jquery-ui") !== - 1)  {
      moduleName = "jqueryui";
      outFileName = inDir + moduleName + ".js";
   }
    else  {
      fileParts[0] = "jqueryui";
      if (fileParts[1] === "ui")  {
         fileParts.splice(1, 1);
      }
      moduleName = fileParts.join("/");
      outFileName = inDir + moduleName + ".js";
   }
   if (fileParts[fileParts.length - 1].indexOf("datepicker-") === 0)  {
      files.push("'jqueryui/datepicker'");
   }
   if (moduleName !== "jqueryui" && fileParts.length > 1)  {
      for (i = 0; i < fileParts.length - 1; i = 1)  {
            segment = fileParts[i];
            tempDir = segment + "/";
            mkDir(tempDir);
         }
   }
   if (match)  {
      match[1].replace(filesRegExp, function(match, depName)  {
            files.push("'./" + depName.replace(/\.ui\./, ".").replace(/\.effects\./, ".").replace(/^jquery\./, "").replace(dotRegExp, "/") + "'");
         }
      );
   }
   contents = "define(" + "[" + files.join(",") + "], function (jQuery) {
" + contents + "
});";
   fs.writeFileSync(outFileName, contents);
}
;
if (! inDir)  {
   console.log("Usage: jqueryui-amd inputDir");
   process.exit(1);
}
inDir = path.normalize(inDir);
if (inDir.lastIndexOf("/") !== inDir.length - 1)  {
   inDir = "/";
}
jqUiSrcDir = path.join(inDir, "ui/");
if (! exists(jqUiSrcDir) || ! fs.statSync(jqUiSrcDir).isDirectory())  {
   console.log("The directory does not appear to contain jQuery UI, " + "not converting any files. Looking for "ui" directory " + "in the source directory failed.");
   process.exit(1);
}
jqPaths = fs.readdirSync(jqUiSrcDir);
jqPaths.forEach(function(fileName)  {
      var srcPath = jqUiSrcDir + fileName;
      if (fs.statSync(srcPath).isFile() && jsFileRegExp.test(srcPath))  {
         convert(fileName, readFile(srcPath));
      }
   }
);
jqPaths = fs.readdirSync(jqUiSrcDir + "i18n");
jqPaths.forEach(function(fileName)  {
      var srcPath = jqUiSrcDir + "i18n/" + fileName;
      if (fs.statSync(srcPath).isFile() && jsFileRegExp.test(srcPath))  {
         convert(fileName, readFile(srcPath));
      }
   }
);
console.log("Done. See " + path.join(inDir, "jqueryui") + " for the AMD modules.");
