! ✖ / env;
node;
var path = require("path"), fs = require("fs"), optimist = require("optimist"), exec = require("child_process").exec, user = require("./lib/permissions"), pkg = require(path.join(process.mainModule.paths[0], "..", "..", "package.json"));
require("colors");
var base =  {
   init:"Initialize a project directory for use with NGN.", 
   add:"Add an NGN feature.", 
   remove:"Remove an NGN feature.", 
   update:"Update the NGN installation", 
   uninstall:"Remove NGN completely.", 
   version:"List the version of NGN installed on the system.", 
   help:"View help for a specific command."}
;
var shortcuts =  {
   v:"version", 
   h:"help"}
;
var opts =  {} ;
for (var o in base)  {
      opts[o] = base[o];
   }
var opt =  {
   ngn-dev: {
      develop:"Auto-restart processes when the file changes. (Dev Tool)"   }} ;
for (var mod in opt)  {
      if (fs.existsSync(path.join(__dirname, "..", "..", "ngn-dev")))  {
         for (var m in opt[mod])  {
               opts[m] = opt[mod][m];
            }
      }
   }
var cmd = null;
var minOptions = function(argv)  {
   if (argv._.length > 0)  {
      cmd = argv._[0];
      argv[cmd] = argv._[1] || true;
      return true;
   }
   for (var term in opts)  {
         if (argv.hasOwnProperty(term))  {
            cmd = term;
            return true;
         }
      }
   for (var _term in argv)  {
         if (_term !== "_" && _term !== "$0")  {
            cmd = _term;
            break;
         }
      }
   optimist.describe(opts);
   if (cmd == null)  {
      throw "";
   }
   if (cmd in shortcuts)  {
      cmd = shortcuts[cmd];
      return true;
   }
   throw """ + cmd + "" is not a valid option.";
}
;
var priv = function()  {
   if (! user.isElevatedUser())  {
      throw "Insufficient privileges to run this command.
Please run this command " + require("os").platform() == "win32" ? "with and admin account" : "as root (or sudo)" + ".";
   }
}
;
var validOption = function(argv)  {
   switch(cmd.trim().toLowerCase()) {
      case "uninstall":
 
            priv();
            return true;
         
      case "update":
 
            priv();
            return true;
         
      case "remove":
 
         
      case "add":
 
            priv();
            if (typeof argv[cmd] == "boolean")  {
               argv[cmd] = "";
            }
            break;
         
      case "create":
 
            if (argv[cmd] === true || ["class", "docs", "api"].indexOf(argv[cmd].trim().toLowerCase()) < 0)  {
               throw """ + argv[cmd] === true ? "Blank" : argv[cmd] + "" is not a valid "create" option. Valid options are:
  - class
  - api";
            }
            break;
         
      case "start":
 
         
      case "stop":
 
            return true;
         
      default:
 
            if (opts.hasOwnProperty(cmd))  {
               return true;
            }
            optimist.describe(opts);
            throw """ + cmd + "" is not a valid option.";
         
}
;
   return true;
}
;
var argv = optimist.usage("Usage: ngn <option>").wrap(80).check(minOptions).check(validOption).argv, p = require("path"), cwd = process.cwd(), root = p.dirname(process.mainModule.filename);
if (cmd in base)  {
   require(require("path").join(__dirname, "commands", cmd));
}
 else  {
   for (var pkg in opt)  {
         if (opt[pkg][cmd] !== undefined)  {
            require(require("path").join(__dirname, "..", "..", pkg))[cmd]();
            break;
         }
      }
}
return ;
