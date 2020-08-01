! ✖ / env;
node;
var path = require("path"), fs = require("fs"), uglify = require("uglify-js"), sourceDir = path.resolve(path.join(__dirname, "..", "..", "titanium")), fileList = require("wrench").readdirSyncRecursive(sourceDir), match, dependencies, dependencyMap =  {} , i, j, len, temp, jsExtensionRegex = /^(.*)\.js$/, startTime = Date.now();
for (i = 0, len = fileList.length; i < len; i++)  {
      match = fileList[i].match(jsExtensionRegex);
      if (match)  {
         try {
            var foundDefine = false;
            dependencyMap[match[1]] = [];
            dependencies = uglify.parser.parse(fs.readFileSync(path.join(sourceDir, match[0])).toString(), false, true)[1][0];
            if (dependencies[0].name === "stat")  {
               dependencies = dependencies[1];
               if (dependencies[0].name === "call" && dependencies[1][1] === "define")  {
                  foundDefine = true;
                  dependencies = dependencies[2];
                  if (dependencies[0] && dependencies[0][0].name === "array")  {
                     dependencies = dependencies[0][1];
                  }
                   else if (dependencies[1] && dependencies[1][0].name === "array")  {
                     dependencies = dependencies[1][1];
                  }
                   else  {
                     continue;
                  }
                  for (j = 0; j < dependencies.length; j++)  {
                        dependencies[j] = dependencies[j][1];
                        if (~ dependencies[j].indexOf("!"))  {
                           temp = dependencies[j].split("!");
                           if (temp[0] == "Ti/_/text")  {
                              dependencyMap[dependencies[j]] = [];
                           }
                        }
                         else  {
                           dependencies[j] = dependencies[j].replace(/\.js$/, "");
                        }
                     }
                  dependencyMap[match[1]] = dependencies;
               }
            }
            if (! foundDefine)  {
               delete dependencyMap[match[1]];
            }
         }
         catch (e) {
            console.error("Parse error in " + match[0] + ": " + e.message);
         }
      }
   }
fs.writeFileSync(path.join(sourceDir, "dependencies.json"), JSON.stringify(dependencyMap, null, "	"));
console.log("Completed in " + Date.now() - startTime / 1000 + "s");
