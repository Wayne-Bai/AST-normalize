! ✖ / env;
node;
var JAKE_VERSION = "0.1.12", jake, args = process.argv.slice(2), fs = require("fs"), path = require("path"), sys = require("sys"), usage, parseopts =  {} , optsReg, Parser, parsed, opts, cmds, taskName, jakefile, dirname, isCoffee, exists, tasks;
var Namespace = function(name, parentNamespace)  {
   this.name = name;
   this.parentNamespace = parentNamespace;
   this.childNamespaces =  {} ;
   this.tasks =  {} ;
}
;
exists = function()  {
   var cwd = process.cwd();
   if (path.existsSync(jakefile) || path.existsSync(jakefile + ".js") || path.existsSync(jakefile + ".coffee"))  {
      return true;
   }
   process.chdir("..");
   if (cwd === process.cwd())  {
      return false;
   }
   return exists();
}
;
usage = "" + "Node-Jake JavaScript build tool
" + "********************************************************************************
" + "If no flags are given, Node-Jake looks for a Jakefile or Jakefile.js in the current directory.
" + "********************************************************************************
" + "{Usage}: jake [options] target (commands/options ...)
" + "
" + "{Options}:
" + "  -f, --jakefile FILE        Use FILE as the Jakefile
" + "  -C, --directory DIRECTORY  Change to DIRECTORY before running tasks.
" + "  -T, --tasks                Display the tasks, with descriptions, then exit.
" + "  -h, --help                 Outputs help information
" + "  -V, --version              Outputs Node-Jake version
" + "";
parseopts.Parser = function(opts)  {
   this.cmds = [];
   this.opts =  {} ;
   this.reg = [];
   this.shortOpts =  {} ;
   this.longOpts =  {} ;
   var item;
   for (var i = 0, ii = opts.length; i < ii; i++)  {
         item = opts[i];
         this.shortOpts[item.abbr] = item.full;
         this.longOpts[item.full] = item.full;
      }
   this.reg = opts;
}
;
parseopts.Parser.prototype = new function()  {
   this.parse = function(args)  {
      var cmds = [], opts =  {} , arg, argName, argItems;
      while (args.length)  {
            arg = args.shift();
            if (arg.indexOf("--") == 0)  {
               argItems = arg.split("=");
               argName = this.longOpts[argItems[0].substr(2)];
               if (argName)  {
                  opts[argName] = argItems[1] || true;
               }
                else  {
                  throw new Error("Unknown option "" + argItems[0] + """);
               }
            }
             else if (arg.indexOf("-") == 0)  {
               argName = this.shortOpts[arg.substr(1)];
               if (argName)  {
                  opts[argName] = ! args[0] || args[0].indexOf("-") == 0 ? true : args.shift();
               }
                else  {
                  throw new Error("Unknown option "" + arg + """);
               }
            }
             else  {
               cmds.push(arg);
            }
         }
      this.cmds = cmds;
      this.opts = opts;
   }
;
}
();
jake = new function()  {
   var _this = this, _taskList = [], _taskDict =  {} ;
   var _isArray = function(obj)  {
      return obj && typeof obj === "object" && typeof obj.length === "number" && typeof obj.splice === "function" && ! obj.propertyIsEnumerable("length");
   }
, _mixin = function(t, f)  {
      for (var p in f)  {
            t[p] = f[p];
         }
      return t;
   }
, _taskHasDeps = function(deps)  {
      return ! ! deps && _isArray(deps) && deps.length;
   }
, _handleFileTask = function(name, opts, callback)  {
      var err = opts.err, stats = opts.stats, deps = opts.deps, includeDeps = opts.includeDeps, subOpts =  {} ;
      if (includeDeps && _taskHasDeps(deps))  {
         stats = stats ||  {
            ctime:0         }
;
         _mixin(subOpts, opts);
         subOpts.root = false;
         for (var i = 0, ii = deps.length, depsLeft = deps.length, maxTime = stats.ctime; i < ii; i++)  {
               _parseDeps(deps[i], subOpts, function(ctime)  {
                     depsLeft = 1;
                     maxTime = maxTime == null || maxTime < ctime ? ctime : maxTime;
                     if (depsLeft == 0)  {
                        if (maxTime > stats.ctime)  {
                           _taskList.push(name);
                        }
                        callback(maxTime);
                     }
                  }
               );
            }
      }
       else if (err)  {
         if (err.errno == 2)  {
            _taskList.push(name);
            callback(new Date());
         }
          else  {
            throw new Error(err.message);
         }
      }
       else  {
         callback(stats.ctime);
      }
   }
, _parseDeps = function(name, opts, callback)  {
      var task = _this.getTask(name), deps = task ? task.deps : [], root = opts.root, includeDeps = opts.includeDeps, subOpts =  {} ;
      if (! task)  {
         if (root)  {
            throw new Error("Task "" + name + "" is not defined in the Jakefile.");
         }
         fs.lstat(name, function(err, stats)  {
               if (err)  {
                  throw new Error(err.message);
               }
               callback(stats.ctime);
            }
         );
      }
       else  {
         if (task.isFile)  {
            fs.lstat(name, function(err, stats)  {
                  var taskOpts =  {
                     err:err, 
                     stats:stats, 
                     deps:deps, 
                     includeDeps:includeDeps                  }
;
                  _handleFileTask(name, taskOpts, callback);
               }
            );
         }
          else  {
            if (includeDeps && _taskHasDeps(deps))  {
               _mixin(subOpts, opts);
               subOpts.root = false;
               for (var i = 0, ii = deps.length, ctr = deps.length; i < ii; i++)  {
                     _parseDeps(deps[i], subOpts, function()  {
                           ctr = 1;
                           if (ctr == 0)  {
                              _taskList.push(name);
                              callback(new Date());
                           }
                        }
                     );
                  }
            }
             else  {
               _taskList.push(name);
               callback(new Date());
            }
         }
      }
   }
;
   this.defaultNamespace = new Namespace("default", null);
   this.currentNamespace = this.defaultNamespace;
   this.currentTaskDescription = null;
   this.populateAndProcessTaskList = function(name, includeDeps, callback)  {
      var opts =  {
         root:true, 
         includeDeps:includeDeps      }
;
      _parseDeps(name, opts, callback);
   }
;
   this.runTask = function(name, includeDeps)  {
      this.populateAndProcessTaskList(name, includeDeps, function()  {
            if (! _taskList.length)  {
               _this.die("No tasks to run.");
            }
            _this.runNextTask();
         }
      );
   }
;
   this.reenableTask = function(name, includeDeps)  {
      var self = this;
      this.populateAndProcessTaskList(name, includeDeps, function()  {
            var name, task;
            if (! _taskList.length)  {
               _this.die("No tasks to reenable.");
            }
             else  {
               while (name = _taskList.shift())  {
                     task = self.getTask(name);
                     task.done = false;
                  }
            }
         }
      );
   }
;
   this.getTask = function(name)  {
      var nameArr = name.split(":"), taskName = nameArr.pop(), ns = jake.defaultNamespace, currName;
      while (nameArr.length)  {
            currName = nameArr.shift();
            ns = ns.childNamespaces[currName];
         }
      var task = ns.tasks[taskName];
      return task;
   }
;
   this.tryGetTask = function(name)  {
      try {
         return this.getTask(name);
      }
      catch (e) {
         return null;
      }
   }
;
   this.runNextTask = function()  {
      var name = _taskList.shift(), task, parsed, passArgs;
      if (name)  {
         task = this.getTask(name);
         if (task.done)  {
            complete();
         }
          else  {
            task.done = true;
            parsed = this.parseArgs(this.args);
            passArgs = parsed.cmds;
            if (parsed.opts)  {
               passArgs = parsed.cmds.concat(parsed.opts);
            }
            task.handler.apply(task, passArgs);
            if (! task.async)  {
               complete();
            }
         }
      }
   }
;
   this.parseArgs = function(args)  {
      var cmds = [], opts =  {} , pat = /:|=/, argItems, hasOpts = false;
      for (var i = 0; i < args.length; i++)  {
            argItems = args[i].split(pat);
            if (argItems.length > 1)  {
               hasOpts = true;
               opts[argItems[0]] = argItems[1];
            }
             else  {
               cmds.push(args[i]);
            }
         }
      if (! hasOpts)  {
         opts = null;
      }
      return  {
         cmds:cmds, 
         opts:opts      }
;
   }
;
   this.die = function(str)  {
      var len = str.length, i;
      for (i = 0; i < len; i = 25)  {
            sys.print(str.slice(i, i + 25));
         }
      process.exit();
   }
;
   this.parseAllTasks = function()  {
      var _parseNs = function(name, ns)  {
         var nsTasks = ns.tasks, task, nsNamespaces = ns.childNamespaces, fullName;
         for (var q in nsTasks)  {
               task = nsTasks[q];
               fullName = name == "default" ? q : name + ":" + q;
               task.fullName = fullName;
               jake.Task[fullName] = task;
            }
         for (var p in nsNamespaces)  {
               fullName = name == "default" ? p : name + ":" + p;
               _parseNs(fullName, nsNamespaces[p]);
            }
      }
;
      _parseNs("default", jake.defaultNamespace);
   }
;
   this.showAllTaskDescriptions = function()  {
      var maxTaskNameLength = 0, task, str = "", padding, descr;
      for (var p in jake.Task)  {
            task = jake.Task[p];
            maxTaskNameLength = p.length > maxTaskNameLength ? p.length : maxTaskNameLength;
         }
      for (var p in jake.Task)  {
            task = jake.Task[p];
            padding = new Array(maxTaskNameLength - p.length + 2).join(" ");
            descr = task.description || "(No description)";
            descr = "[90m # " + descr + "[39m";
            console.log("jake " + p + padding + descr);
         }
      process.exit();
   }
;
}
();
jake.Task = function(name, deps, handler, async, isFile)  {
   this.name = name;
   this.fullName = null;
   this.deps = deps;
   this.handler = handler;
   this.desription = null;
   this.async = async === true;
   this.isFile = isFile;
   this.done = false;
}
;
jake.Task.prototype = new function()  {
   this.invoke = function()  {
      jake.runTask(this.fullName, true);
   }
;
   this.execute = function()  {
      jake.reenableTask(this.fullName, true);
      jake.runTask(this.fullName, false);
   }
;
   this.reenable = function(deep)  {
      jake.reenableTask(this.fullName, deep);
   }
;
}
();
jake.taskOrFile = function()  {
   var args = Array.prototype.slice.call(arguments), type = args.shift(), name = args.shift(), deps = typeof args[0] == "function" ? [] : args.shift(), handler = args.shift(), async = args.shift(), isFile = type == "file";
   var task = new jake.Task(name, deps, handler, async, isFile);
   if (jake.currentTaskDescription)  {
      task.description = jake.currentTaskDescription;
      jake.currentTaskDescription = null;
   }
   jake.currentNamespace.tasks[name] = task;
}
;
global.jake = jake;
global.task = function(name, deps, handler, async)  {
   var args = Array.prototype.slice.call(arguments), type;
   args.unshift("task");
   jake.taskOrFile.apply(global, args);
}
;
global.file = function(name, deps, handler, async)  {
   var args = Array.prototype.slice.call(arguments);
   args.unshift("file");
   jake.taskOrFile.apply(global, args);
}
;
global.desc = function(str)  {
   jake.currentTaskDescription = str;
}
;
global.namespace = function(name, nextLevelDown)  {
   var curr = jake.currentNamespace, ns = new Namespace(name, curr);
   curr.childNamespaces[name] = ns;
   jake.currentNamespace = ns;
   nextLevelDown();
   jake.currentNamespace = curr;
}
;
global.complete = function()  {
   jake.runNextTask();
}
;
global.fail = function(msg)  {
   var message = msg && msg.toString() || "(No error message specified.)";
   throw new Error(message);
}
;
optsReg = [ {
   full:"directory", 
   abbr:"C"}
,  {
   full:"jakefile", 
   abbr:"f"}
,  {
   full:"tasks", 
   abbr:"T"}
,  {
   full:"help", 
   abbr:"h"}
,  {
   full:"version", 
   abbr:"V"}
];
Parser = new parseopts.Parser(optsReg);
parsed = Parser.parse(args);
opts = Parser.opts;
cmds = Parser.cmds;
taskName = cmds.shift();
dirname = opts.directory || process.cwd();
process.chdir(dirname);
taskName = taskName || "default";
jakefile = opts.jakefile ? opts.jakefile.replace(/\.js$/, "").replace(/\.coffee$/, "") : "Jakefile";
if (opts.help)  {
   jake.die(usage);
}
if (opts.version)  {
   jake.die(JAKE_VERSION);
}
if (! exists())  {
   jake.die("Could not load Jakefile.
If no Jakefile specified with -f or --jakefile, " + "jake looks for Jakefile or Jakefile.js in the current directory " + "or one of the parent directories.");
}
isCoffee = path.existsSync(jakefile + ".coffee");
try {
   if (isCoffee)  {
      try {
         CoffeeScript = require("coffee-script");
      }
      catch (e) {
         jake.die("CoffeeScript is missing! Try `npm install coffee-script`");
      }
   }
   tasks = require(path.join(process.cwd(), jakefile));
}
catch (e) {
   if (e.stack)  {
      console.log(e.stack);
   }
   jake.die("Could not load Jakefile: " + e);
}
process.addListener("uncaughtException", function(err)  {
      console.log("jake aborted.");
      if (err.stack)  {
         console.log(err.stack);
      }
   }
);
jake.parseAllTasks();
if (opts.tasks)  {
   jake.showAllTaskDescriptions();
}
 else  {
   jake.args = cmds;
   jake.runTask(taskName, true);
}
