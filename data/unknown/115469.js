! ✖ / env;
node;
var sys = require("sys");
var path = require("path");
var posix = require("posix");
try {
   var App = require("bomberjs/lib/app").App;
}
catch (err) {
   if (err.message == "Cannot find module 'bomberjs/lib/app'")  {
      require.paths.push(path.dirname(__filename) + "/..");
      var App = require("bomberjs/lib/app").App;
   }
}
var bomberjs_location = path.normalize(path.join(require("bomberjs/lib/utils").require_resolve("bomberjs/lib/app"), "../../"));
var dir = posix.readdir(path.join(bomberjs_location, "lib/tasks")).wait();
var tasks =  {} ;
dir.forEach(function(file)  {
      if (! file.match(/\.js$/))  {
         return ;
      }
      var p = "bomberjs/lib/tasks/" + file.substr(0, file.length - 3);
      tasks[path.basename(p)] = p;
   }
);
var argv = process.ARGV.slice(2);
var opts =  {} ;
while (argv.length > 0)  {
      var stop = false;
      switch(argv[0]) {
         case "--tasks":
 
            
         case "-t":
 
               opts["tasks"] = true;
               break;
            
         case "--app":
 
            
         case "-a":
 
               opts["app"] = argv[1];
               argv.splice(0, 1);
               break;
            
         default:
 
               stop = true;
            
}
;
      if (stop)  {
         break;
      }
      argv.splice(0, 1);
   }
var project =  {
   config: {} }
;
project.base_app = new App(opts.app, project);
if (opts.tasks)  {
   sys.puts("Available tasks:");
   Object.keys(tasks).forEach(function(task)  {
         sys.print("  ");
         sys.puts(task);
      }
   );
}
 else if (argv.length == 0)  {
   sys.puts("Script for managing Bomber apps.
http://bomber.obtdev.com/");
}
 else  {
   if (! argv[0] in tasks)  {
      sys.puts("Unknown task: " + argv[0]);
   }
    else  {
      var task = argv.shift();
      require(tasks[task]).task(project, argv);
   }
}
