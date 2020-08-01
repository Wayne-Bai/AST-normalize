! ✖ / env;
node(function(global)  {
      var USAGE = _multiline(function()  {
         }
      );
      var ERR = "[31m";
      var WARN = "[33m";
      var INFO = "[32m";
      var CLR = "[0m";
      var fs = require("fs");
      var cp = require("child_process");
      var argv = process.argv.slice(2);
      var wmlib = process.argv[1].split("/").slice(0, - 2).join("/") + "/lib/";
      var mod = require(wmlib + "Module.js");
      var pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
      var wm = pkg.webmodule;
      var Task = require(wmlib + "Task.js");
      var target = mod.collectBuildTarget(pkg);
      var options = _parseCommandLineOptions( {
            name:pkg.name, 
            help:false, 
            keep:false, 
            label:["dev", "debug", "assert"], 
            nowrap:false, 
            header:"", 
            footer:"", 
            es5in:false, 
            es6in:false, 
            es5out:false, 
            es6out:false, 
            strict:false, 
            pretty:false, 
            option:[], 
            compile:true, 
            release:false, 
            externs:[], 
            verbose:false, 
            workDir:"release/", 
            advanced:true         }
      );
      if (options.help)  {
         console.log(WARN + USAGE + CLR);
         return ;
      }
      if (! target.workDir)  {
         console.log(ERR + "package.json - webmodule.{browser|worker|node}.output are empty." + CLR);
         return ;
      }
      var browserSource = target.browser.source;
      var workerSource = target.worker.source;
      var nodeSource = target.node.source;
      var nwSource = target.nw.source;
      if (options.release)  {
         var deps = mod.getDependencies(options.release);
         browserSource = mod.toUniqueArray([].concat(deps.files.browser, browserSource));
         workerSource = mod.toUniqueArray([].concat(deps.files.worker, workerSource));
         nodeSource = mod.toUniqueArray([].concat(deps.files.node, nodeSource));
         nwSource = mod.toUniqueArray([].concat(deps.files.nw, nwSource));
         if (options.verbose)  {
            var buildFiles =  {
               browser:browserSource, 
               worker:workerSource, 
               node:nodeSource, 
               nw:nwSource, 
               label:deps.files.label            }
;
            console.log(INFO + "Release build: " + JSON.stringify(buildFiles, null, 2) + CLR);
         }
      }
       else  {
         if (options.verbose)  {
            var buildFiles =  {
               browser:browserSource, 
               worker:workerSource, 
               node:nodeSource, 
               nw:nwSource, 
               label:wm.label            }
;
            console.log(INFO + "Debug build: " + JSON.stringify(buildFiles, null, 2) + CLR);
         }
      }
      if (! _isFileExists(options.externs) || ! _isFileExists(browserSource) || ! _isFileExists(workerSource) || ! _isFileExists(nodeSource) || ! _isFileExists(nwSource))  {
         return ;
      }
      var minifyOptions =  {
         keep:options.keep, 
         label:options.label, 
         nowrap:options.nowrap, 
         header:options.header, 
         footer:options.footer, 
         es5in:options.es5in, 
         es6in:options.es6in, 
         es5out:options.es5out, 
         es6out:options.es6out, 
         strict:options.strict, 
         pretty:options.pretty, 
         option:options.option, 
         compile:options.compile, 
         externs:options.externs, 
         verbose:options.verbose, 
         workDir:options.workDir, 
         advanced:options.advanced      }
;
      var taskPlan = [];
      var copyBrowserFileToWorkerFile = false;
      var copyBrowserFileToNodeFile = false;
      var copyBrowserFileToNWFile = false;
      var copyWorkerFileToNodeFile = false;
      if (wm.browser && browserSource.length)  {
         taskPlan.push("browser");
      }
      if (wm.worker && workerSource.length)  {
         taskPlan.push("worker");
      }
      if (wm.node && nodeSource.length)  {
         taskPlan.push("node");
      }
      if (wm.nw && nwSource.length)  {
         taskPlan.push("nw");
      }
      if (taskPlan.indexOf("browser") >= 0 && taskPlan.indexOf("worker") >= 0)  {
         if (browserSource.join() === workerSource.join())  {
            copyBrowserFileToWorkerFile = true;
            taskPlan = taskPlan.filter(function(target)  {
                  return target !== "worker";
               }
            );
         }
      }
      if (taskPlan.indexOf("browser") >= 0 && taskPlan.indexOf("node") >= 0)  {
         if (browserSource.join() === nodeSource.join())  {
            copyBrowserFileToNodeFile = true;
            taskPlan = taskPlan.filter(function(target)  {
                  return target !== "node";
               }
            );
         }
      }
      if (taskPlan.indexOf("browser") >= 0 && taskPlan.indexOf("nw") >= 0)  {
         if (browserSource.join() === nwSource.join())  {
            copyBrowserFileToNWFile = true;
            taskPlan = taskPlan.filter(function(target)  {
                  return target !== "nw";
               }
            );
         }
      }
      if (taskPlan.indexOf("worker") >= 0 && taskPlan.indexOf("node") >= 0)  {
         if (workerSource.join() === nodeSource.join())  {
            copyWorkerFileToNodeFile = true;
            taskPlan = taskPlan.filter(function(target)  {
                  return target !== "node";
               }
            );
         }
      }
      Task.run(taskPlan.join(" > "),  {
            browser:function(task)  {
               if (options.verbose)  {
                  console.log("Build for the browser...");
               }
               Minify(browserSource, minifyOptions, function(err, js)  {
                     if (err || ! js)  {
                        task.miss();
                     }
                      else  {
                        fs.writeFileSync(target.browser.output, js);
                        if (copyBrowserFileToWorkerFile)  {
                           fs.writeFileSync(target.worker.output, js);
                        }
                        if (copyBrowserFileToNodeFile)  {
                           fs.writeFileSync(target.node.output, js);
                        }
                        if (copyBrowserFileToNWFile)  {
                           fs.writeFileSync(target.nw.output, js);
                        }
                        task.pass();
                     }
                  }
               );
            }, 
            worker:function(task)  {
               if (options.verbose)  {
                  console.log("Build for the worker...");
               }
               Minify(workerSource, minifyOptions, function(err, js)  {
                     if (err || ! js)  {
                        task.miss();
                     }
                      else  {
                        fs.writeFileSync(target.worker.output, js);
                        if (copyWorkerFileToNodeFile)  {
                           fs.writeFileSync(target.node.output, js);
                        }
                        task.pass();
                     }
                  }
               );
            }, 
            node:function(task)  {
               if (options.verbose)  {
                  console.log("Build for the node...");
               }
               Minify(nodeSource, minifyOptions, function(err, js)  {
                     if (err || ! js)  {
                        task.miss();
                     }
                      else  {
                        fs.writeFileSync(target.node.output, js);
                        task.pass();
                     }
                  }
               );
            }, 
            nw:function(task)  {
               if (options.verbose)  {
                  console.log("Build for the node-webkit...");
               }
               Minify(nwSource, minifyOptions, function(err, js)  {
                     if (err || ! js)  {
                        task.miss();
                     }
                      else  {
                        fs.writeFileSync(target.nw.output, js);
                        task.pass();
                     }
                  }
               );
            }} , function(err)  {
            if (err)  {
               if (options.verbose)  {
                  console.log(ERR + "Build error." + CLR);
                  process.exit(1);
               }
            }
             else  {
               if (options.verbose)  {
                  console.log("done.");
               }
            }
         }
      );
      function _isFileExists(fileList)  {
         return fileList.every(function(file)  {
               if (! fs.existsSync(file))  {
                  console.log(ERR + "File not found: " + file + CLR);
                  return false;
               }
               return true;
            }
         );
      }
;
      function _parseCommandLineOptions(options)  {
         for (var i = 0, iz = argv.length; i < iz; ++i)  {
               switch(argv[i]) {
                  case "-h":
 
                     
                  case "--help":
 
                        options.help = true;
                        break;
                     
                  case "-v":
 
                     
                  case "--verbose":
 
                        options.verbose = true;
                        break;
                     
                  case "--nowrap":
 
                        options.nowrap = true;
                        break;
                     
                  case "--nocompile":
 
                        options.compile = false;
                        break;
                     
                  case "--header":
 
                        options.header = fs.readFileSync(argv[++i], "utf8");
                        break;
                     
                  case "--footer":
 
                        options.footer = fs.readFileSync(argv[++i], "utf8");
                        break;
                     
                  case "--es5in":
 
                        options.es5in = true;
                        break;
                     
                  case "--es6in":
 
                        options.es6in = true;
                        break;
                     
                  case "--es5out":
 
                        options.es5out = true;
                        break;
                     
                  case "--es6out":
 
                        options.es6out = true;
                        break;
                     
                  case "--strict":
 
                        options.strict = true;
                        break;
                     
                  case "--pretty":
 
                        options.pretty = true;
                        break;
                     
                  case "--keep":
 
                        options.keep = true;
                        break;
                     
                  case "--simple":
 
                        options.advanced = false;
                        break;
                     
                  case "--extern":
 
                     
                  case "--externs":
 
                        _pushif(options.externs, argv[++i]);
                        break;
                     
                  case "--option":
 
                        _pushif(options.option, argv[++i]);
                        break;
                     
                  case "--module":
 
                     
                  case "--release":
 
                        options.release = true;
                        break;
                     
                  case "--label":
 
                        _pushif(options.label, argv[++i].replace(/^@/, ""));
                        break;
                     
                  default:
 
                        if (/^@/.test(argv[i]))  {
                           _pushif(options.label, argv[i].replace(/^@/, ""));
                        }
                         else  {
                           throw new Error("Unknown option: " + argv[i]);
                        }
                     
}
;
            }
         return options;
      }
;
      function _pushif(source, value)  {
         if (source.indexOf(value) < 0)  {
            source.push(value);
         }
      }
;
      function _multiline(fn)  {
         return fn + "".split("
").slice(1, - 1).join("
");
      }
;
      var OUTPUT_FILE = "./.Minify.output.js";
      var TMP_FILE = "./.Minify.tmp.js";
      function Minify(sources, options, fn)  {
         _if(! Array.isArray(sources), Minify, "sources");
         if (options)  {
            _if(options.constructor !==  {} .constructor, Minify, "options");
            _if(! _keys(options, "keep,label,nowrap,header,footer,es5in,es6in,es5out,es6out,strict,pretty,option,compile,externs,verbose,workDir,advanced"), Minify, "options");
         }
         if (fn)  {
            _if(typeof fn !== "function", Minify, "fn");
         }
         var optionsString = _makeClouserCompilerOptions(options);
         if (options.compile)  {
            cp.exec("which -s closure-compiler", function(err)  {
                  _offlineMinificationNode(sources, options, optionsString, fn);
               }
            );
         }
          else  {
            _noMinification(sources, options, fn);
         }
      }
;
      function _makeClouserCompilerOptions(options)  {
         var result = [];
         if (options.advanced)  {
            result.push("--compilation_level ADVANCED_OPTIMIZATIONS");
            if (options.externs && options.externs.length)  {
               result.push("--externs " + options.externs.join(" --externs "));
            }
         }
          else  {
            result.push("--compilation_level SIMPLE_OPTIMIZATIONS");
         }
         if (! options.nowrap)  {
            result.push("--output_wrapper '(function(global){
%output%
})((this||0).self||global);'");
         }
         if (options.strict)  {
            if (options.es5in)  {
               result.push("--language_in ECMASCRIPT5_STRICT");
            }
             else if (options.es6in)  {
               result.push("--language_in ECMASCRIPT6_STRICT");
            }
             else  {
               result.push("--language_in ECMASCRIPT5_STRICT");
            }
            if (options.es5out)  {
               result.push("--language_out ECMASCRIPT5_STRICT");
            }
             else if (options.es6out)  {
               result.push("--language_out ECMASCRIPT6_STRICT");
            }
         }
          else  {
            if (options.es5in)  {
               result.push("--language_in ECMASCRIPT5");
            }
             else if (options.es6in)  {
               result.push("--language_in ECMASCRIPT6");
            }
             else  {
               result.push("--language_in ECMASCRIPT5");
            }
            if (options.es5out)  {
               result.push("--language_out ECMASCRIPT5");
            }
             else if (options.es6out)  {
               result.push("--language_out ECMASCRIPT6");
            }
         }
         if (options.pretty)  {
            result.push("--formatting pretty_print");
         }
         if (options.option.length)  {
            result.push("--" + optionsObject.option.join(" --"));
         }
         return result.join(" ");
      }
;
      function _offlineMinificationNode(sources, options, optionsString, callback)  {
         var js = options.header || "" + _concatFiles(sources) + options.footer || "";
         if (options.label && options.label.length)  {
            js = Minify_preprocess(js, options.label);
         }
         fs.writeFileSync(options.workDir + TMP_FILE, js);
         if (options.verbose)  {
            console.log(INFO + "Compile options: 
  " + optionsString.replace(/\n/g, "") + CLR);
         }
         var compile = require("uupaa.compile.js");
         compile.exec(options.workDir + TMP_FILE, options.workDir + OUTPUT_FILE, optionsString, function(err, stdout, stderr)  {
               if (err || stderr)  {
                  console.log(stderr);
                  if (callback)  {
                     callback(new Error(stderr), "");
                  }
               }
                else  {
                  var minifiedCode = fs.readFileSync(options.workDir + OUTPUT_FILE, "utf8");
                  fs.unlinkSync(options.workDir + OUTPUT_FILE);
                  if (! options.keep)  {
                     fs.unlinkSync(options.workDir + TMP_FILE);
                  }
                  if (callback)  {
                     callback(null, minifiedCode);
                  }
               }
            }
         );
      }
;
      function Minify_preprocess(js, labels)  {
         _if(typeof js !== "string", Minify_preprocess, "js");
         _if(! Array.isArray(labels), Minify_preprocess, "labels");
         js = js.replace(/(\r\n|\r|\n)/gm, "
");
         js = _trimCodeBlock(js, labels);
         return js;
      }
;
      function _noMinification(sources, options, fn)  {
         var js = options.header || "" + _concatFiles(sources) + options.footer || "";
         if (options.label && options.label.length)  {
            js = Minify_preprocess(js, options.label);
         }
         if (fn)  {
            fn(null, js);
         }
      }
;
      function _trimCodeBlock(js, labels)  {
         return labels.reduce(function(js, label)  {
               var line = RegExp("\{@" + label + "\b(?:[^\n]*)\}@" + label + "\b", "g");
               var lines = RegExp("\{@" + label + "\b(?:[^\n]*)
(?:[\S\s]*?)?\}@" + label + "\b", "g");
               return js.replace(line, " ").replace(lines, " ");
            }, 
            js);
      }
;
      function _concatFiles(sources)  {
         return sources.map(function(path)  {
               if (fs.existsSync(path))  {
                  return fs.readFileSync(path, "utf8");
               }
               console.log(path + " is not exists");
               return "";
            }
         ).join("");
      }
;
      function _keys(value, keys)  {
         var items = keys.split(",");
         return Object.keys(value).every(function(key)  {
               return items.indexOf(key) >= 0;
            }
         );
      }
;
      function _if(value, fn, hint)  {
         if (value)  {
            throw new Error(fn.name + " " + hint);
         }
      }
;
   }
)(this || 0.self || global);
