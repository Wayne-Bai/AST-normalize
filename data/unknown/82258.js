! ✖ / env;
node;
var path = require("path");
var fs = require("fs");
var roto = require("roto");
var colorize = roto.colorize;
var optimist = require("optimist");
optimist.usage("Usage: $0 [target] [options]");
var i, n, key;
require("../src/build.js")(roto);
var argv = optimist.argv;
var target = argv._.length ? argv._[0] : null;
var blacklist = ["_", "$0"];
var options =  {} ;
for (key in argv)  {
      if (argv.hasOwnProperty(key) && blacklist.indexOf(key) === - 1)  {
         options[key] = argv[key];
      }
   }
for (i = 1; i < argv._.length; i++)  {
      options[argv._[i]] = true;
   }
if (options["help"])  {
   var print_target = function(name, options)  {
      if (options && options.hidden) return       var selected = name === roto.defaultTarget;
      var bullet = selected ? "■" : "□";
      process.stdout.write(colorize(" " + bullet, "gray") + " " + name);
      if (selected)  {
         process.stdout.write(colorize(" (default)", "blue"));
      }
      if (options && options.description)  {
         process.stdout.write(colorize(": " + options.description + "", "gray"));
      }
      process.stdout.write("
");
   }
;
   process.stdout.write("
" + optimist.help());
   process.stdout.write(colorize("Available Targets:
", "white"));
   for (var key in roto._project.targets)  {
         if (roto._project.targets.hasOwnProperty(key))  {
            print_target(key, roto._project.targets[key].options);
         }
      }
   process.stdout.write("
For more information, find the documentation at:
");
   process.stdout.write(colorize("http://github.com/creativemarket/csxs", "underline") + "

");
   process.exit(0);
}
if (target === "compile")  {
   process.stderr.write(colorize("ERROR: ", "red") + " The "compile" target cannot be run explicitly.
");
   process.exit(1);
}
 else  {
   roto.run(target, options, function(success)  {
         process.exit(success !== false ? 0 : 1);
      }
   );
}
