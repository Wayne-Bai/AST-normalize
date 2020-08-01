! ✖ / env;
node;
var fs = require("fs"), path = require("path"), mods =  {} ;
var json = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "js") + "/yui3.json"));
var wrapper = fs.readFileSync(__dirname + "/loader_template.js", "utf8");
var testMod = function(v)  {
   if (v.indexOf("yui") === - 1 && v.indexOf("loader") !== 0 && v.indexOf("css") === - 1 && v !== "queue-run" && v !== "features" && v !== "get" && v !== "intl-base")  {
      return true;
   }
   return false;
}
;
Object.keys(json).forEach(function(v)  {
      if (testMod(v))  {
         mods[v] = json[v];
         if (json[v].submodules)  {
            Object.keys(json[v].submodules).forEach(function(k)  {
                  if (testMod(k))  {
                     mods[k] = json[v].submodules[k];
                  }
               }
            );
         }
      }
   }
);
var writeTest = function(key, mod)  {
   var str = "     "Testing " + key + "": function(data) {
";
   str = "            var loader = new Y.Loader({
";
   str = "                require: ["" + key + ""],
";
   str = "                ignoreRegistered: true,
";
   str = "                allowRollup: false
";
   str = "            });
";
   str = "            loader.calculate();
";
   if (mod.use)  {
      str = "            //Testing A rollup module
";
      mod.use.forEach(function(s)  {
            if (mods[s] && mods[s].use)  {
               str = "            //Testing A rollup of a rollup module ( datatype )
";
               mods[s].use.forEach(function(s)  {
                     str = "            Assert.isTrue((loader.sorted.indexOf("" + s + "")) > -1, "Module (" + s + ") not found in sorted array");
";
                  }
               );
            }
             else  {
               str = "            Assert.isTrue((loader.sorted.indexOf("" + s + "")) > -1, "Module (" + s + ") not found in sorted array");
";
            }
         }
      );
   }
    else  {
      str = "            //Testing A normal module
";
      str = "            Assert.isTrue((loader.sorted.indexOf("" + key + "")) > -1, "Module (" + key + ") not found in sorted array");
";
   }
   str = "        }";
   return str;
}
;
var tests = [];
Object.keys(mods).forEach(function(k)  {
      tests.push(writeTest(k, mods[k]));
   }
);
var str = "{
";
str = "    name: "Loader Tests",
";
str = "    " + tests.join(",
"), str = "    
}";
wrapper = wrapper.replace("!!TESTCASE!!", str);
fs.writeFileSync(path.join(__dirname, "../", "tests/cli") + "/loader.js", wrapper);
console.log(Object.keys(mods).length + " tests written to: ./tests/cli/loader.js");
