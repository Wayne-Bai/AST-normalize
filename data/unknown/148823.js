! ✖ / env;
node;
var shell = require("shelljs"), spawn = require("./spawn"), Q = require("q"), path = require("path"), fs = require("fs"), ROOT = path.join(__dirname, "..", "..");
function hasCustomRules()  {
   return fs.existsSync(path.join(ROOT, "custom_rules.xml"));
}
;
module.exports.getAntArgs = function(cmd)  {
   var args = [cmd, "-f", path.join(ROOT, "build.xml")];
   if (hasCustomRules())  {
      args.push("-Dout.dir=ant-build", "-Dgen.absolute.dir=ant-gen");
   }
   return args;
}
;
module.exports.run = function(build_type)  {
   build_type = typeof build_type !== "undefined" ? build_type : "--debug";
   var args = module.exports.getAntArgs("debug");
   switch(build_type) {
      case "--debug":
 
            break;
         
      case "--release":
 
            args[0] = "release";
            break;
         
      case "--nobuild":
 
            console.log("Skipping build...");
            return Q();
         
      default:
 
            return Q.reject("Build option '" + build_type + "' not recognized.");
         
}
;
   var ret = Q();
   if (! hasCustomRules())  {
      ret = require("./clean").run();
   }
   return ret.then(function()  {
         return spawn("ant", args);
      }
   );
}
;
module.exports.get_apk = function()  {
   var binDir = path.join(ROOT, "ant-build");
   if (fs.existsSync(binDir))  {
      var candidates = fs.readdirSync(binDir).filter(function(p)  {
            return path.extname(p) == ".apk";
         }
      ).map(function(p)  {
            p = path.join(binDir, p);
            return  {
               p:p, 
               t:fs.statSync(p).mtime            }
;
         }
      ).sort(function(a, b)  {
            return a.t > b.t ? - 1 : a.t < b.t ? 1 : 0;
         }
      );
      if (candidates.length === 0)  {
         console.error("ERROR : No .apk found in 'ant-build' directory");
         process.exit(2);
      }
      console.log("Using apk: " + candidates[0].p);
      return candidates[0].p;
   }
    else  {
      console.error("ERROR : unable to find project ant-build directory, could not locate .apk");
      process.exit(2);
   }
}
;
module.exports.help = function()  {
   console.log("Usage: " + path.relative(process.cwd(), path.join(ROOT, "cordova", "build")) + " [build_type]");
   console.log("Build Types : ");
   console.log("    '--debug': Default build, will build project in using ant debug");
   console.log("    '--release': will build project using ant release");
   console.log("    '--nobuild': will skip build process (can be used with run command)");
   process.exit(0);
}
;
