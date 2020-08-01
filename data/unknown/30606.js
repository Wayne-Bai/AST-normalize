! ✖ / env;
node;
var requirejs, require, define;
function(console, args, readFileFunc)  {
   var fileName, env, fs, vm, path, exec, rhinoContext, dir, nodeRequire, nodeDefine, exists, reqMain, loadedOptimizedLib, version = "1.0.8", jsSuffixRegExp = /\.js$/, commandOption = "", useLibLoaded =  {} , rhinoArgs = args, readFile = typeof readFileFunc !== "undefined" ? readFileFunc : null;
   function showHelp()  {
      console.log("See https://github.com/jrburke/r.js for usage.");
   }
;
   if (typeof Packages !== "undefined")  {
      env = "rhino";
      fileName = args[0];
      if (fileName && fileName.indexOf("-") === 0)  {
         commandOption = fileName.substring(1);
         fileName = args[1];
      }
      rhinoContext = Packages.org.mozilla.javascript.ContextFactory.getGlobal().enterContext();
      exec = function(string, name)  {
         return rhinoContext.evaluateString(this, string, name, 0, null);
      }
;
      exists = function(fileName)  {
         return new java.io.File(fileName).exists();
      }
;
      if (typeof console === "undefined")  {
         console =  {
            log:function()  {
               print.apply(undefined, arguments);
            }} ;
      }
   }
    else if (typeof process !== "undefined")  {
      env = "node";
      fs = require("fs");
      vm = require("vm");
      path = require("path");
      nodeRequire = require;
      nodeDefine = define;
      reqMain = require.main;
      require = undefined;
      define = undefined;
      readFile = function(path)  {
         return fs.readFileSync(path, "utf8");
      }
;
      exec = function(string, name)  {
         return vm.runInThisContext(this.requirejsVars.require.makeNodeWrapper(string), name ? fs.realpathSync(name) : "");
      }
;
      exists = function(fileName)  {
         return path.existsSync(fileName);
      }
;
      fileName = process.argv[2];
      if (fileName && fileName.indexOf("-") === 0)  {
         commandOption = fileName.substring(1);
         fileName = process.argv[3];
      }
   }
   function(undefined)  {
      var version = "1.0.8", commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm, cjsRequireRegExp = /require\(\s*["']([^'"\s]+)["']\s*\)/g, currDirRegExp = /^\.\//, jsSuffixRegExp = /\.js$/, ostring = Object.prototype.toString, ap = Array.prototype, aps = ap.slice, apsp = ap.splice, isBrowser = ! ! typeof window !== "undefined" && navigator && document, isWebWorker = ! isBrowser && typeof importScripts !== "undefined", readyRegExp = isBrowser && navigator.platform === "PLAYSTATION 3" ? /^complete$/ : /^(complete|loaded)$/, defContextName = "_", isOpera = typeof opera !== "undefined" && opera.toString() === "[object Opera]", empty =  {} , contexts =  {} , globalDefQueue = [], interactiveScript = null, checkLoadedDepth = 0, useInteractive = false, reservedDependencies =  {
         require:true, 
         module:true, 
         exports:true      }
, req, cfg =  {} , currentlyAddingScript, s, head, baseElement, scripts, script, src, subPath, mainScript, dataMain, globalI, ctx, jQueryCheck, checkLoadedTimeoutId;
      function isFunction(it)  {
         return ostring.call(it) === "[object Function]";
      }
;
      function isArray(it)  {
         return ostring.call(it) === "[object Array]";
      }
;
      function mixin(target, source, force)  {
         for (var prop in source)  {
               if (! prop in empty && ! prop in target || force)  {
                  target[prop] = source[prop];
               }
            }
         return req;
      }
;
      function makeError(id, msg, err)  {
         var e = new Error(msg + "
http://requirejs.org/docs/errors.html#" + id);
         if (err)  {
            e.originalError = err;
         }
         return e;
      }
;
      function configurePackageDir(pkgs, currentPackages, dir)  {
         var i, location, pkgObj;
         for (i = 0; pkgObj = currentPackages[i]; i++)  {
               pkgObj = typeof pkgObj === "string" ?  {
                  name:pkgObj               }
 : pkgObj;
               location = pkgObj.location;
               if (dir && ! location || location.indexOf("/") !== 0 && location.indexOf(":") === - 1)  {
                  location = dir + "/" + location || pkgObj.name;
               }
               pkgs[pkgObj.name] =  {
                  name:pkgObj.name, 
                  location:location || pkgObj.name, 
                  main:pkgObj.main || "main".replace(currDirRegExp, "").replace(jsSuffixRegExp, "")               }
;
            }
      }
;
      function jQueryHoldReady($, shouldHold)  {
         if ($.holdReady)  {
            $.holdReady(shouldHold);
         }
          else if (shouldHold)  {
            $.readyWait = 1;
         }
          else  {
            $.ready(true);
         }
      }
;
      if (typeof define !== "undefined")  {
         return ;
      }
      if (typeof requirejs !== "undefined")  {
         if (isFunction(requirejs))  {
            return ;
         }
          else  {
            cfg = requirejs;
            requirejs = undefined;
         }
      }
      if (typeof require !== "undefined" && ! isFunction(require))  {
         cfg = require;
         require = undefined;
      }
      function newContext(contextName)  {
         var context, resume, config =  {
            waitSeconds:7, 
            baseUrl:"./", 
            paths: {} , 
            pkgs: {} , 
            catchError: {}          }
, defQueue = [], specified =  {
            require:true, 
            exports:true, 
            module:true         }
, urlMap =  {} , defined =  {} , loaded =  {} , waiting =  {} , waitAry = [], urlFetched =  {} , managerCounter = 0, managerCallbacks =  {} , plugins =  {} , needFullExec =  {} , fullExec =  {} , resumeDepth = 0;
         function trimDots(ary)  {
            var i, part;
            for (i = 0; part = ary[i]; i++)  {
                  if (part === ".")  {
                     ary.splice(i, 1);
                     i = 1;
                  }
                   else if (part === "..")  {
                     if (i === 1 && ary[2] === ".." || ary[0] === "..")  {
                        break;
                     }
                      else if (i > 0)  {
                        ary.splice(i - 1, 2);
                        i = 2;
                     }
                  }
               }
         }
;
         function normalize(name, baseName)  {
            var pkgName, pkgConfig;
            if (name && name.charAt(0) === ".")  {
               if (baseName)  {
                  if (config.pkgs[baseName])  {
                     baseName = [baseName];
                  }
                   else  {
                     baseName = baseName.split("/");
                     baseName = baseName.slice(0, baseName.length - 1);
                  }
                  name = baseName.concat(name.split("/"));
                  trimDots(name);
                  pkgConfig = config.pkgs[pkgName = name[0]];
                  name = name.join("/");
                  if (pkgConfig && name === pkgName + "/" + pkgConfig.main)  {
                     name = pkgName;
                  }
               }
                else if (name.indexOf("./") === 0)  {
                  name = name.substring(2);
               }
            }
            return name;
         }
;
         function makeModuleMap(name, parentModuleMap)  {
            var index = name ? name.indexOf("!") : - 1, prefix = null, parentName = parentModuleMap ? parentModuleMap.name : null, originalName = name, normalizedName, url, pluginModule;
            if (index !== - 1)  {
               prefix = name.substring(0, index);
               name = name.substring(index + 1, name.length);
            }
            if (prefix)  {
               prefix = normalize(prefix, parentName);
            }
            if (name)  {
               if (prefix)  {
                  pluginModule = defined[prefix];
                  if (pluginModule && pluginModule.normalize)  {
                     normalizedName = pluginModule.normalize(name, function(name)  {
                           return normalize(name, parentName);
                        }
                     );
                  }
                   else  {
                     normalizedName = normalize(name, parentName);
                  }
               }
                else  {
                  normalizedName = normalize(name, parentName);
                  url = urlMap[normalizedName];
                  if (! url)  {
                     url = context.nameToUrl(name, null, parentModuleMap);
                     urlMap[normalizedName] = url;
                  }
               }
            }
            return  {
               prefix:prefix, 
               name:normalizedName, 
               parentMap:parentModuleMap, 
               url:url, 
               originalName:originalName, 
               fullName:prefix ? prefix + "!" + normalizedName || "" : normalizedName            }
;
         }
;
         function isPriorityDone()  {
            var priorityDone = true, priorityWait = config.priorityWait, priorityName, i;
            if (priorityWait)  {
               for (i = 0; priorityName = priorityWait[i]; i++)  {
                     if (! loaded[priorityName])  {
                        priorityDone = false;
                        break;
                     }
                  }
               if (priorityDone)  {
                  delete config.priorityWait;
               }
            }
            return priorityDone;
         }
;
         function makeContextModuleFunc(func, relModuleMap, enableBuildCallback)  {
            return function()  {
               var args = aps.call(arguments, 0), lastArg;
               if (enableBuildCallback && isFunction(lastArg = args[args.length - 1]))  {
                  lastArg.__requireJsBuild = true;
               }
               args.push(relModuleMap);
               return func.apply(null, args);
            }
;
         }
;
         function makeRequire(relModuleMap, enableBuildCallback, altRequire)  {
            var modRequire = makeContextModuleFunc(altRequire || context.require, relModuleMap, enableBuildCallback);
            mixin(modRequire,  {
                  nameToUrl:makeContextModuleFunc(context.nameToUrl, relModuleMap), 
                  toUrl:makeContextModuleFunc(context.toUrl, relModuleMap), 
                  defined:makeContextModuleFunc(context.requireDefined, relModuleMap), 
                  specified:makeContextModuleFunc(context.requireSpecified, relModuleMap), 
                  isBrowser:req.isBrowser               }
            );
            return modRequire;
         }
;
         function queueDependency(manager)  {
            context.paused.push(manager);
         }
;
         function execManager(manager)  {
            var i, ret, err, errFile, errModuleTree, cb = manager.callback, map = manager.map, fullName = map.fullName, args = manager.deps, listeners = manager.listeners, execCb = config.requireExecCb || req.execCb, cjsModule;
            if (cb && isFunction(cb))  {
               if (config.catchError.define)  {
                  try {
                     ret = execCb(fullName, manager.callback, args, defined[fullName]);
                  }
                  catch (e) {
                     err = e;
                  }
               }
                else  {
                  ret = execCb(fullName, manager.callback, args, defined[fullName]);
               }
               if (fullName)  {
                  cjsModule = manager.cjsModule;
                  if (cjsModule && cjsModule.exports !== undefined && cjsModule.exports !== defined[fullName])  {
                     ret = defined[fullName] = manager.cjsModule.exports;
                  }
                   else if (ret === undefined && manager.usingExports)  {
                     ret = defined[fullName];
                  }
                   else  {
                     defined[fullName] = ret;
                     if (needFullExec[fullName])  {
                        fullExec[fullName] = true;
                     }
                  }
               }
            }
             else if (fullName)  {
               ret = defined[fullName] = cb;
               if (needFullExec[fullName])  {
                  fullExec[fullName] = true;
               }
            }
            if (waiting[manager.id])  {
               delete waiting[manager.id];
               manager.isDone = true;
               context.waitCount = 1;
               if (context.waitCount === 0)  {
                  waitAry = [];
               }
            }
            delete managerCallbacks[fullName];
            if (req.onResourceLoad && ! manager.placeholder)  {
               req.onResourceLoad(context, map, manager.depArray);
            }
            if (err)  {
               errFile = fullName ? makeModuleMap(fullName).url : "" || err.fileName || err.sourceURL;
               errModuleTree = err.moduleTree;
               err = makeError("defineerror", "Error evaluating " + "module "" + fullName + "" at location "" + errFile + "":
" + err + "
fileName:" + errFile + "
lineNumber: " + err.lineNumber || err.line, err);
               err.moduleName = fullName;
               err.moduleTree = errModuleTree;
               return req.onError(err);
            }
            for (i = 0; cb = listeners[i]; i++)  {
                  cb(ret);
               }
            return undefined;
         }
;
         function makeArgCallback(manager, i)  {
            return function(value)  {
               if (! manager.depDone[i])  {
                  manager.depDone[i] = true;
                  manager.deps[i] = value;
                  manager.depCount = 1;
                  if (! manager.depCount)  {
                     execManager(manager);
                  }
               }
            }
;
         }
;
         function callPlugin(pluginName, depManager)  {
            var map = depManager.map, fullName = map.fullName, name = map.name, plugin = plugins[pluginName] || plugins[pluginName] = defined[pluginName], load;
            if (depManager.loading)  {
               return ;
            }
            depManager.loading = true;
            load = function(ret)  {
               depManager.callback = function()  {
                  return ret;
               }
;
               execManager(depManager);
               loaded[depManager.id] = true;
               resume();
            }
;
            load.fromText = function(moduleName, text)  {
               var hasInteractive = useInteractive;
               loaded[moduleName] = false;
               context.scriptCount = 1;
               context.fake[moduleName] = true;
               if (hasInteractive)  {
                  useInteractive = false;
               }
               req.exec(text);
               if (hasInteractive)  {
                  useInteractive = true;
               }
               context.completeLoad(moduleName);
            }
;
            if (fullName in defined)  {
               load(defined[fullName]);
            }
             else  {
               plugin.load(name, makeRequire(map.parentMap, true, function(deps, cb)  {
                        var moduleDeps = [], i, dep, depMap;
                        for (i = 0; dep = deps[i]; i++)  {
                              depMap = makeModuleMap(dep, map.parentMap);
                              deps[i] = depMap.fullName;
                              if (! depMap.prefix)  {
                                 moduleDeps.push(deps[i]);
                              }
                           }
                        depManager.moduleDeps = depManager.moduleDeps || [].concat(moduleDeps);
                        return context.require(deps, cb);
                     }
                  ), load, config);
            }
         }
;
         function addWait(manager)  {
            if (! waiting[manager.id])  {
               waiting[manager.id] = manager;
               waitAry.push(manager);
               context.waitCount = 1;
            }
         }
;
         function managerAdd(cb)  {
            this.listeners.push(cb);
         }
;
         function getManager(map, shouldQueue)  {
            var fullName = map.fullName, prefix = map.prefix, plugin = prefix ? plugins[prefix] || plugins[prefix] = defined[prefix] : null, manager, created, pluginManager, prefixMap;
            if (fullName)  {
               manager = managerCallbacks[fullName];
            }
            if (! manager)  {
               created = true;
               manager =  {
                  id:prefix && ! plugin ? managerCounter++ + "__p@:" : "" + fullName || "__r@" + managerCounter++, 
                  map:map, 
                  depCount:0, 
                  depDone:[], 
                  depCallbacks:[], 
                  deps:[], 
                  listeners:[], 
                  add:managerAdd               }
;
               specified[manager.id] = true;
               if (fullName && ! prefix || plugins[prefix])  {
                  managerCallbacks[fullName] = manager;
               }
            }
            if (prefix && ! plugin)  {
               prefixMap = makeModuleMap(prefix);
               if (prefix in defined && ! defined[prefix])  {
                  delete defined[prefix];
                  delete urlFetched[prefixMap.url];
               }
               pluginManager = getManager(prefixMap, true);
               pluginManager.add(function(plugin)  {
                     var newMap = makeModuleMap(map.originalName, map.parentMap), normalizedManager = getManager(newMap, true);
                     manager.placeholder = true;
                     normalizedManager.add(function(resource)  {
                           manager.callback = function()  {
                              return resource;
                           }
;
                           execManager(manager);
                        }
                     );
                  }
               );
            }
             else if (created && shouldQueue)  {
               loaded[manager.id] = false;
               queueDependency(manager);
               addWait(manager);
            }
            return manager;
         }
;
         function main(inName, depArray, callback, relModuleMap)  {
            var moduleMap = makeModuleMap(inName, relModuleMap), name = moduleMap.name, fullName = moduleMap.fullName, manager = getManager(moduleMap), id = manager.id, deps = manager.deps, i, depArg, depName, depPrefix, cjsMod;
            if (fullName)  {
               if (fullName in defined || loaded[id] === true || fullName === "jquery" && config.jQuery && config.jQuery !== callback().fn.jquery)  {
                  return ;
               }
               specified[id] = true;
               loaded[id] = true;
               if (fullName === "jquery" && callback)  {
                  jQueryCheck(callback());
               }
            }
            manager.depArray = depArray;
            manager.callback = callback;
            for (i = 0; i < depArray.length; i++)  {
                  depArg = depArray[i];
                  if (depArg)  {
                     depArg = makeModuleMap(depArg, name ? moduleMap : relModuleMap);
                     depName = depArg.fullName;
                     depPrefix = depArg.prefix;
                     depArray[i] = depName;
                     if (depName === "require")  {
                        deps[i] = makeRequire(moduleMap);
                     }
                      else if (depName === "exports")  {
                        deps[i] = defined[fullName] =  {} ;
                        manager.usingExports = true;
                     }
                      else if (depName === "module")  {
                        manager.cjsModule = cjsMod = deps[i] =  {
                           id:name, 
                           uri:name ? context.nameToUrl(name, null, relModuleMap) : undefined, 
                           exports:defined[fullName]                        }
;
                     }
                      else if (depName in defined && ! depName in waiting && ! fullName in needFullExec || fullName in needFullExec && fullExec[depName])  {
                        deps[i] = defined[depName];
                     }
                      else  {
                        if (fullName in needFullExec)  {
                           needFullExec[depName] = true;
                           delete defined[depName];
                           urlFetched[depArg.url] = false;
                        }
                        manager.depCount = 1;
                        manager.depCallbacks[i] = makeArgCallback(manager, i);
                        getManager(depArg, true).add(manager.depCallbacks[i]);
                     }
                  }
               }
            if (! manager.depCount)  {
               execManager(manager);
            }
             else  {
               addWait(manager);
            }
         }
;
         function callDefMain(args)  {
            main.apply(null, args);
         }
;
         jQueryCheck = function(jqCandidate)  {
            if (! context.jQuery)  {
               var $ = jqCandidate || typeof jQuery !== "undefined" ? jQuery : null;
               if ($)  {
                  if (config.jQuery && $.fn.jquery !== config.jQuery)  {
                     return ;
                  }
                  if ("holdReady" in $ || "readyWait" in $)  {
                     context.jQuery = $;
                     callDefMain(["jquery", [], function()  {
                           return jQuery;
                        }
]);
                     if (context.scriptCount)  {
                        jQueryHoldReady($, true);
                        context.jQueryIncremented = true;
                     }
                  }
               }
            }
         }
;
         function findCycle(manager, traced)  {
            var fullName = manager.map.fullName, depArray = manager.depArray, fullyLoaded = true, i, depName, depManager, result;
            if (manager.isDone || ! fullName || ! loaded[fullName])  {
               return result;
            }
            if (traced[fullName])  {
               return manager;
            }
            traced[fullName] = true;
            if (depArray)  {
               for (i = 0; i < depArray.length; i++)  {
                     depName = depArray[i];
                     if (! loaded[depName] && ! reservedDependencies[depName])  {
                        fullyLoaded = false;
                        break;
                     }
                     depManager = waiting[depName];
                     if (depManager && ! depManager.isDone && loaded[depName])  {
                        result = findCycle(depManager, traced);
                        if (result)  {
                           break;
                        }
                     }
                  }
               if (! fullyLoaded)  {
                  result = undefined;
                  delete traced[fullName];
               }
            }
            return result;
         }
;
         function forceExec(manager, traced)  {
            var fullName = manager.map.fullName, depArray = manager.depArray, i, depName, depManager, prefix, prefixManager, value;
            if (manager.isDone || ! fullName || ! loaded[fullName])  {
               return undefined;
            }
            if (fullName)  {
               if (traced[fullName])  {
                  return defined[fullName];
               }
               traced[fullName] = true;
            }
            if (depArray)  {
               for (i = 0; i < depArray.length; i++)  {
                     depName = depArray[i];
                     if (depName)  {
                        prefix = makeModuleMap(depName).prefix;
                        if (prefix && prefixManager = waiting[prefix])  {
                           forceExec(prefixManager, traced);
                        }
                        depManager = waiting[depName];
                        if (depManager && ! depManager.isDone && loaded[depName])  {
                           value = forceExec(depManager, traced);
                           manager.depCallbacks[i](value);
                        }
                     }
                  }
            }
            return defined[fullName];
         }
;
         function checkLoaded()  {
            var waitInterval = config.waitSeconds * 1000, expired = waitInterval && context.startTime + waitInterval < new Date().getTime(), noLoads = "", hasLoadedProp = false, stillLoading = false, cycleDeps = [], i, prop, err, manager, cycleManager, moduleDeps;
            if (context.pausedCount > 0)  {
               return undefined;
            }
            if (config.priorityWait)  {
               if (isPriorityDone())  {
                  resume();
               }
                else  {
                  return undefined;
               }
            }
            for (prop in loaded)  {
                  if (! prop in empty)  {
                     hasLoadedProp = true;
                     if (! loaded[prop])  {
                        if (expired)  {
                           noLoads = prop + " ";
                        }
                         else  {
                           stillLoading = true;
                           if (prop.indexOf("!") === - 1)  {
                              cycleDeps = [];
                              break;
                           }
                            else  {
                              moduleDeps = managerCallbacks[prop] && managerCallbacks[prop].moduleDeps;
                              if (moduleDeps)  {
                                 cycleDeps.push.apply(cycleDeps, moduleDeps);
                              }
                           }
                        }
                     }
                  }
               }
            if (! hasLoadedProp && ! context.waitCount)  {
               return undefined;
            }
            if (expired && noLoads)  {
               err = makeError("timeout", "Load timeout for modules: " + noLoads);
               err.requireType = "timeout";
               err.requireModules = noLoads;
               err.contextName = context.contextName;
               return req.onError(err);
            }
            if (stillLoading && cycleDeps.length)  {
               for (i = 0; manager = waiting[cycleDeps[i]]; i++)  {
                     if (cycleManager = findCycle(manager,  {} ))  {
                        forceExec(cycleManager,  {} );
                        break;
                     }
                  }
            }
            if (! expired && stillLoading || context.scriptCount)  {
               if (isBrowser || isWebWorker && ! checkLoadedTimeoutId)  {
                  checkLoadedTimeoutId = setTimeout(function()  {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                     }, 
                     50);
               }
               return undefined;
            }
            if (context.waitCount)  {
               for (i = 0; manager = waitAry[i]; i++)  {
                     forceExec(manager,  {} );
                  }
               if (context.paused.length)  {
                  resume();
               }
               if (checkLoadedDepth < 5)  {
                  checkLoadedDepth = 1;
                  checkLoaded();
               }
            }
            checkLoadedDepth = 0;
            req.checkReadyState();
            return undefined;
         }
;
         resume = function()  {
            var manager, map, url, i, p, args, fullName;
            context.takeGlobalQueue();
            resumeDepth = 1;
            if (context.scriptCount <= 0)  {
               context.scriptCount = 0;
            }
            while (defQueue.length)  {
                  args = defQueue.shift();
                  if (args[0] === null)  {
                     return req.onError(makeError("mismatch", "Mismatched anonymous define() module: " + args[args.length - 1]));
                  }
                   else  {
                     callDefMain(args);
                  }
               }
            if (! config.priorityWait || isPriorityDone())  {
               while (context.paused.length)  {
                     p = context.paused;
                     context.pausedCount = p.length;
                     context.paused = [];
                     for (i = 0; manager = p[i]; i++)  {
                           map = manager.map;
                           url = map.url;
                           fullName = map.fullName;
                           if (map.prefix)  {
                              callPlugin(map.prefix, manager);
                           }
                            else  {
                              if (! urlFetched[url] && ! loaded[fullName])  {
                                 config.requireLoad || req.load(context, fullName, url);
                                 if (url.indexOf("empty:") !== 0)  {
                                    urlFetched[url] = true;
                                 }
                              }
                           }
                        }
                     context.startTime = new Date().getTime();
                     context.pausedCount = p.length;
                  }
            }
            if (resumeDepth === 1)  {
               checkLoaded();
            }
            resumeDepth = 1;
            return undefined;
         }
;
         context =  {
            contextName:contextName, 
            config:config, 
            defQueue:defQueue, 
            waiting:waiting, 
            waitCount:0, 
            specified:specified, 
            loaded:loaded, 
            urlMap:urlMap, 
            urlFetched:urlFetched, 
            scriptCount:0, 
            defined:defined, 
            paused:[], 
            pausedCount:0, 
            plugins:plugins, 
            needFullExec:needFullExec, 
            fake: {} , 
            fullExec:fullExec, 
            managerCallbacks:managerCallbacks, 
            makeModuleMap:makeModuleMap, 
            normalize:normalize, 
            configure:function(cfg)  {
               var paths, prop, packages, pkgs, packagePaths, requireWait;
               if (cfg.baseUrl)  {
                  if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== "/")  {
                     cfg.baseUrl = "/";
                  }
               }
               paths = config.paths;
               packages = config.packages;
               pkgs = config.pkgs;
               mixin(config, cfg, true);
               if (cfg.paths)  {
                  for (prop in cfg.paths)  {
                        if (! prop in empty)  {
                           paths[prop] = cfg.paths[prop];
                        }
                     }
                  config.paths = paths;
               }
               packagePaths = cfg.packagePaths;
               if (packagePaths || cfg.packages)  {
                  if (packagePaths)  {
                     for (prop in packagePaths)  {
                           if (! prop in empty)  {
                              configurePackageDir(pkgs, packagePaths[prop], prop);
                           }
                        }
                  }
                  if (cfg.packages)  {
                     configurePackageDir(pkgs, cfg.packages);
                  }
                  config.pkgs = pkgs;
               }
               if (cfg.priority)  {
                  requireWait = context.requireWait;
                  context.requireWait = false;
                  resume();
                  context.require(cfg.priority);
                  resume();
                  context.requireWait = requireWait;
                  config.priorityWait = cfg.priority;
               }
               if (cfg.deps || cfg.callback)  {
                  context.require(cfg.deps || [], cfg.callback);
               }
            }, 
            requireDefined:function(moduleName, relModuleMap)  {
               return makeModuleMap(moduleName, relModuleMap).fullName in defined;
            }, 
            requireSpecified:function(moduleName, relModuleMap)  {
               return makeModuleMap(moduleName, relModuleMap).fullName in specified;
            }, 
            require:function(deps, callback, relModuleMap)  {
               var moduleName, fullName, moduleMap;
               if (typeof deps === "string")  {
                  if (isFunction(callback))  {
                     return req.onError(makeError("requireargs", "Invalid require call"));
                  }
                  if (req.get)  {
                     return req.get(context, deps, callback);
                  }
                  moduleName = deps;
                  relModuleMap = callback;
                  moduleMap = makeModuleMap(moduleName, relModuleMap);
                  fullName = moduleMap.fullName;
                  if (! fullName in defined)  {
                     return req.onError(makeError("notloaded", "Module name '" + moduleMap.fullName + "' has not been loaded yet for context: " + contextName));
                  }
                  return defined[fullName];
               }
               if (deps && deps.length || callback)  {
                  main(null, deps, callback, relModuleMap);
               }
               if (! context.requireWait)  {
                  while (! context.scriptCount && context.paused.length)  {
                        resume();
                     }
               }
               return context.require;
            }, 
            takeGlobalQueue:function()  {
               if (globalDefQueue.length)  {
                  apsp.apply(context.defQueue, [context.defQueue.length - 1, 0].concat(globalDefQueue));
                  globalDefQueue = [];
               }
            }, 
            completeLoad:function(moduleName)  {
               var args;
               context.takeGlobalQueue();
               while (defQueue.length)  {
                     args = defQueue.shift();
                     if (args[0] === null)  {
                        args[0] = moduleName;
                        break;
                     }
                      else if (args[0] === moduleName)  {
                        break;
                     }
                      else  {
                        callDefMain(args);
                        args = null;
                     }
                  }
               if (args)  {
                  callDefMain(args);
               }
                else  {
                  callDefMain([moduleName, [], moduleName === "jquery" && typeof jQuery !== "undefined" ? function()  {
                        return jQuery;
                     }
 : null]);
               }
               if (req.isAsync)  {
                  context.scriptCount = 1;
               }
               resume();
               if (! req.isAsync)  {
                  context.scriptCount = 1;
               }
            }, 
            toUrl:function(moduleNamePlusExt, relModuleMap)  {
               var index = moduleNamePlusExt.lastIndexOf("."), ext = null;
               if (index !== - 1)  {
                  ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                  moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
               }
               return context.nameToUrl(moduleNamePlusExt, ext, relModuleMap);
            }, 
            nameToUrl:function(moduleName, ext, relModuleMap)  {
               var paths, pkgs, pkg, pkgPath, syms, i, parentModule, url, config = context.config;
               moduleName = normalize(moduleName, relModuleMap && relModuleMap.fullName);
               if (req.jsExtRegExp.test(moduleName))  {
                  url = moduleName + ext ? ext : "";
               }
                else  {
                  paths = config.paths;
                  pkgs = config.pkgs;
                  syms = moduleName.split("/");
                  for (i = syms.length; i > 0; i--)  {
                        parentModule = syms.slice(0, i).join("/");
                        if (paths[parentModule])  {
                           syms.splice(0, i, paths[parentModule]);
                           break;
                        }
                         else if (pkg = pkgs[parentModule])  {
                           if (moduleName === pkg.name)  {
                              pkgPath = pkg.location + "/" + pkg.main;
                           }
                            else  {
                              pkgPath = pkg.location;
                           }
                           syms.splice(0, i, pkgPath);
                           break;
                        }
                     }
                  url = syms.join("/") + ext || ".js";
                  url = url.charAt(0) === "/" || url.match(/^[\w\+\.\-]+:/) ? "" : config.baseUrl + url;
               }
               return config.urlArgs ? url + url.indexOf("?") === - 1 ? "?" : "&" + config.urlArgs : url;
            }} ;
         context.jQueryCheck = jQueryCheck;
         context.resume = resume;
         return context;
      }
;
      req = requirejs = function(deps, callback)  {
         var contextName = defContextName, context, config;
         if (! isArray(deps) && typeof deps !== "string")  {
            config = deps;
            if (isArray(callback))  {
               deps = callback;
               callback = arguments[2];
            }
             else  {
               deps = [];
            }
         }
         if (config && config.context)  {
            contextName = config.context;
         }
         context = contexts[contextName] || contexts[contextName] = newContext(contextName);
         if (config)  {
            context.configure(config);
         }
         return context.require(deps, callback);
      }
;
      req.config = function(config)  {
         return req(config);
      }
;
      if (! require)  {
         require = req;
      }
      req.toUrl = function(moduleNamePlusExt)  {
         return contexts[defContextName].toUrl(moduleNamePlusExt);
      }
;
      req.version = version;
      req.jsExtRegExp = /^\/|:|\?|\.js$/;
      s = req.s =  {
         contexts:contexts, 
         skipAsync: {}       }
;
      req.isAsync = req.isBrowser = isBrowser;
      if (isBrowser)  {
         head = s.head = document.getElementsByTagName("head")[0];
         baseElement = document.getElementsByTagName("base")[0];
         if (baseElement)  {
            head = s.head = baseElement.parentNode;
         }
      }
      req.onError = function(err)  {
         throw err;
      }
;
      req.load = function(context, moduleName, url)  {
         req.resourcesReady(false);
         context.scriptCount = 1;
         req.attach(url, context, moduleName);
         if (context.jQuery && ! context.jQueryIncremented)  {
            jQueryHoldReady(context.jQuery, true);
            context.jQueryIncremented = true;
         }
      }
;
      function getInteractiveScript()  {
         var scripts, i, script;
         if (interactiveScript && interactiveScript.readyState === "interactive")  {
            return interactiveScript;
         }
         scripts = document.getElementsByTagName("script");
         for (i = scripts.length - 1; i > - 1 && script = scripts[i]; i--)  {
               if (script.readyState === "interactive")  {
                  return interactiveScript = script;
               }
            }
         return null;
      }
;
      define = function(name, deps, callback)  {
         var node, context;
         if (typeof name !== "string")  {
            callback = deps;
            deps = name;
            name = null;
         }
         if (! isArray(deps))  {
            callback = deps;
            deps = [];
         }
         if (! deps.length && isFunction(callback))  {
            if (callback.length)  {
               callback.toString().replace(commentRegExp, "").replace(cjsRequireRegExp, function(match, dep)  {
                     deps.push(dep);
                  }
               );
               deps = callback.length === 1 ? ["require"] : ["require", "exports", "module"].concat(deps);
            }
         }
         if (useInteractive)  {
            node = currentlyAddingScript || getInteractiveScript();
            if (node)  {
               if (! name)  {
                  name = node.getAttribute("data-requiremodule");
               }
               context = contexts[node.getAttribute("data-requirecontext")];
            }
         }
         context ? context.defQueue : globalDefQueue.push([name, deps, callback]);
         return undefined;
      }
;
      define.amd =  {
         multiversion:true, 
         plugins:true, 
         jQuery:true      }
;
      req.exec = function(text)  {
         return eval(text);
      }
;
      req.execCb = function(name, callback, args, exports)  {
         return callback.apply(exports, args);
      }
;
      req.addScriptToDom = function(node)  {
         currentlyAddingScript = node;
         if (baseElement)  {
            head.insertBefore(node, baseElement);
         }
          else  {
            head.appendChild(node);
         }
         currentlyAddingScript = null;
      }
;
      req.onScriptLoad = function(evt)  {
         var node = evt.currentTarget || evt.srcElement, contextName, moduleName, context;
         if (evt.type === "load" || node && readyRegExp.test(node.readyState))  {
            interactiveScript = null;
            contextName = node.getAttribute("data-requirecontext");
            moduleName = node.getAttribute("data-requiremodule");
            context = contexts[contextName];
            contexts[contextName].completeLoad(moduleName);
            if (node.detachEvent && ! isOpera)  {
               node.detachEvent("onreadystatechange", req.onScriptLoad);
            }
             else  {
               node.removeEventListener("load", req.onScriptLoad, false);
            }
         }
      }
;
      req.attach = function(url, context, moduleName, callback, type, fetchOnlyFunction)  {
         var node;
         if (isBrowser)  {
            callback = callback || req.onScriptLoad;
            node = context && context.config && context.config.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
            node.type = type || context && context.config.scriptType || "text/javascript";
            node.charset = "utf-8";
            node.async = ! s.skipAsync[url];
            if (context)  {
               node.setAttribute("data-requirecontext", context.contextName);
            }
            node.setAttribute("data-requiremodule", moduleName);
            if (node.attachEvent && ! node.attachEvent.toString && node.attachEvent.toString().indexOf("[native code]") < 0 && ! isOpera)  {
               useInteractive = true;
               if (fetchOnlyFunction)  {
                  node.onreadystatechange = function(evt)  {
                     if (node.readyState === "loaded")  {
                        node.onreadystatechange = null;
                        node.attachEvent("onreadystatechange", callback);
                        fetchOnlyFunction(node);
                     }
                  }
;
               }
                else  {
                  node.attachEvent("onreadystatechange", callback);
               }
            }
             else  {
               node.addEventListener("load", callback, false);
            }
            node.src = url;
            if (! fetchOnlyFunction)  {
               req.addScriptToDom(node);
            }
            return node;
         }
          else if (isWebWorker)  {
            importScripts(url);
            context.completeLoad(moduleName);
         }
         return null;
      }
;
      if (isBrowser)  {
         scripts = document.getElementsByTagName("script");
         for (globalI = scripts.length - 1; globalI > - 1 && script = scripts[globalI]; globalI--)  {
               if (! head)  {
                  head = script.parentNode;
               }
               if (dataMain = script.getAttribute("data-main"))  {
                  if (! cfg.baseUrl)  {
                     src = dataMain.split("/");
                     mainScript = src.pop();
                     subPath = src.length ? src.join("/") + "/" : "./";
                     cfg.baseUrl = subPath;
                     dataMain = mainScript.replace(jsSuffixRegExp, "");
                  }
                  cfg.deps = cfg.deps ? cfg.deps.concat(dataMain) : [dataMain];
                  break;
               }
            }
      }
      req.checkReadyState = function()  {
         var contexts = s.contexts, prop;
         for (prop in contexts)  {
               if (! prop in empty)  {
                  if (contexts[prop].waitCount)  {
                     return ;
                  }
               }
            }
         req.resourcesReady(true);
      }
;
      req.resourcesReady = function(isReady)  {
         var contexts, context, prop;
         req.resourcesDone = isReady;
         if (req.resourcesDone)  {
            contexts = s.contexts;
            for (prop in contexts)  {
                  if (! prop in empty)  {
                     context = contexts[prop];
                     if (context.jQueryIncremented)  {
                        jQueryHoldReady(context.jQuery, false);
                        context.jQueryIncremented = false;
                     }
                  }
               }
         }
      }
;
      req.pageLoaded = function()  {
         if (document.readyState !== "complete")  {
            document.readyState = "complete";
         }
      }
;
      if (isBrowser)  {
         if (document.addEventListener)  {
            if (! document.readyState)  {
               document.readyState = "loading";
               window.addEventListener("load", req.pageLoaded, false);
            }
         }
      }
      req(cfg);
      if (req.isAsync && typeof setTimeout !== "undefined")  {
         ctx = s.contexts[cfg.context || defContextName];
         ctx.requireWait = true;
         setTimeout(function()  {
               ctx.requireWait = false;
               if (! ctx.scriptCount)  {
                  ctx.resume();
               }
               req.checkReadyState();
            }, 
            0);
      }
   }
();
   if (env === "rhino")  {
      function()  {
         require.load = function(context, moduleName, url)  {
            context.scriptCount = 1;
            load(url);
            context.completeLoad(moduleName);
         }
;
      }
();
   }
    else if (env === "node")  {
      this.requirejsVars =  {
         require:require, 
         requirejs:require, 
         define:define, 
         nodeRequire:nodeRequire      }
;
      require.nodeRequire = nodeRequire;
   }
   function()  {
      var nodeReq = requirejsVars.nodeRequire, req = requirejsVars.require, def = requirejsVars.define, fs = nodeReq("fs"), path = nodeReq("path"), vm = nodeReq("vm");
      req.get = function(context, moduleName, relModuleMap)  {
         if (moduleName === "require" || moduleName === "exports" || moduleName === "module")  {
            req.onError(new Error("Explicit require of " + moduleName + " is not allowed."));
         }
         var ret, moduleMap = context.makeModuleMap(moduleName, relModuleMap);
         moduleName = moduleMap.fullName;
         if (moduleName in context.defined)  {
            ret = context.defined[moduleName];
         }
          else  {
            if (ret === undefined)  {
               req.load(context, moduleName, moduleMap.url);
               ret = context.defined[moduleName];
            }
         }
         return ret;
      }
;
      req.makeNodeWrapper = function(contents)  {
         return "(function (require, requirejs, define) { " + contents + "
}(requirejsVars.require, requirejsVars.requirejs, requirejsVars.define));";
      }
;
      requirejsVars.nodeLoad = req.load = function(context, moduleName, url)  {
         var contents, err;
         context.scriptCount = 1;
         if (path.existsSync(url))  {
            contents = fs.readFileSync(url, "utf8");
            contents = req.makeNodeWrapper(contents);
            try {
               vm.runInThisContext(contents, fs.realpathSync(url));
            }
            catch (e) {
               err = new Error("Evaluating " + url + " as module "" + moduleName + "" failed with error: " + e);
               err.originalError = e;
               err.moduleName = moduleName;
               err.fileName = url;
               return req.onError(err);
            }
         }
          else  {
            def(moduleName, function()  {
                  try {
                     return context.config.nodeRequire || req.nodeRequire(moduleName);
                  }
                  catch (e) {
                     err = new Error("Calling node's require("" + moduleName + "") failed with error: " + e);
                     err.originalError = e;
                     err.moduleName = moduleName;
                     return req.onError(err);
                  }
               }
            );
         }
         context.completeLoad(moduleName);
         return undefined;
      }
;
      req.exec = function(text)  {
         text = req.makeNodeWrapper(text);
         return eval(text);
      }
;
      requirejsVars.nodeRequireExecCb = require.execCb;
   }
();
}
;
if (commandOption !== "o" && ! fileName || ! jsSuffixRegExp.test(fileName))  {
   fileName = "main.js";
}
function loadLib()  {
   function()  {
      var pathRegExp = /(\/|^)env\/|\{env\}/, env = "unknown";
      if (typeof Packages !== "undefined")  {
         env = "rhino";
      }
       else if (typeof process !== "undefined")  {
         env = "node";
      }
       else if (typeof window !== "undefined" && navigator && document)  {
         env = "browser";
      }
      define("env",  {
            load:function(name, req, load, config)  {
               if (config.env)  {
                  env = config.env;
               }
               name = name.replace(pathRegExp, function(match, prefix)  {
                     if (match.indexOf("{") === - 1)  {
                        return prefix + env + "/";
                     }
                      else  {
                        return env;
                     }
                  }
               );
               req([name], function(mod)  {
                     load(mod);
                  }
               );
            }} );
   }
();
   if (env === "node")  {
      define("node/assert", ["assert"], function(assert)  {
            return assert;
         }
      );
   }
   if (env === "rhino")  {
      define("rhino/assert", function()  {
            return  {} ;
         }
      );
   }
   if (env === "node")  {
      define("node/args", function()  {
            var args = process.argv.slice(2);
            if (args[0] && args[0].indexOf("-" === 0))  {
               args = args.slice(1);
            }
            return args;
         }
      );
   }
   if (env === "rhino")  {
      var jsLibRhinoArgs = typeof rhinoArgs !== "undefined" && rhinoArgs || [].concat(Array.prototype.slice.call(arguments, 0));
      define("rhino/args", function()  {
            var args = jsLibRhinoArgs;
            if (args[0] && args[0].indexOf("-" === 0))  {
               args = args.slice(1);
            }
            return args;
         }
      );
   }
   if (env === "node")  {
      define("node/load", ["fs"], function(fs)  {
            function load(fileName)  {
               var contents = fs.readFileSync(fileName, "utf8");
               process.compile(contents, fileName);
            }
;
            return load;
         }
      );
   }
   if (env === "rhino")  {
      define("rhino/load", function()  {
            return load;
         }
      );
   }
   if (env === "node")  {
      define("node/file", ["fs", "path"], function(fs, path)  {
            var isWindows = process.platform === "win32", windowsDriveRegExp = /^[a-zA-Z]\:\/$/, file;
            function frontSlash(path)  {
               return path.replace(/\\/g, "/");
            }
;
            function exists(path)  {
               if (isWindows && path.charAt(path.length - 1) === "/" && path.charAt(path.length - 2) !== ":")  {
                  path = path.substring(0, path.length - 1);
               }
               try {
                  fs.statSync(path);
                  return true;
               }
               catch (e) {
                  return false;
               }
            }
;
            function mkDir(dir)  {
               if (! exists(dir) && ! isWindows || ! windowsDriveRegExp.test(dir))  {
                  fs.mkdirSync(dir, 511);
               }
            }
;
            function mkFullDir(dir)  {
               var parts = dir.split("/"), currDir = "", first = true;
               parts.forEach(function(part)  {
                     currDir = part + "/";
                     first = false;
                     if (part)  {
                        mkDir(currDir);
                     }
                  }
               );
            }
;
            file =  {
               backSlashRegExp:/\\/g, 
               exclusionRegExp:/^\./, 
               getLineSeparator:function()  {
                  return "/";
               }, 
               exists:function(fileName)  {
                  return exists(fileName);
               }, 
               parent:function(fileName)  {
                  var parts = fileName.split("/");
                  parts.pop();
                  return parts.join("/");
               }, 
               absPath:function(fileName)  {
                  return frontSlash(path.normalize(frontSlash(fs.realpathSync(fileName))));
               }, 
               normalize:function(fileName)  {
                  return frontSlash(path.normalize(fileName));
               }, 
               isFile:function(path)  {
                  return fs.statSync(path).isFile();
               }, 
               isDirectory:function(path)  {
                  return fs.statSync(path).isDirectory();
               }, 
               getFilteredFileList:function(startDir, regExpFilters, makeUnixPaths)  {
                  var files = [], topDir, regExpInclude, regExpExclude, dirFileArray, i, stat, filePath, ok, dirFiles, fileName;
                  topDir = startDir;
                  regExpInclude = regExpFilters.include || regExpFilters;
                  regExpExclude = regExpFilters.exclude || null;
                  if (file.exists(topDir))  {
                     dirFileArray = fs.readdirSync(topDir);
                     for (i = 0; i < dirFileArray.length; i++)  {
                           fileName = dirFileArray[i];
                           filePath = path.join(topDir, fileName);
                           stat = fs.statSync(filePath);
                           if (stat.isFile())  {
                              if (makeUnixPaths)  {
                                 if (filePath.indexOf("/") === - 1)  {
                                    filePath = frontSlash(filePath);
                                 }
                              }
                              ok = true;
                              if (regExpInclude)  {
                                 ok = filePath.match(regExpInclude);
                              }
                              if (ok && regExpExclude)  {
                                 ok = ! filePath.match(regExpExclude);
                              }
                              if (ok && ! file.exclusionRegExp || ! file.exclusionRegExp.test(fileName))  {
                                 files.push(filePath);
                              }
                           }
                            else if (stat.isDirectory() && ! file.exclusionRegExp || ! file.exclusionRegExp.test(fileName))  {
                              dirFiles = this.getFilteredFileList(filePath, regExpFilters, makeUnixPaths);
                              files.push.apply(files, dirFiles);
                           }
                        }
                  }
                  return files;
               }, 
               copyDir:function(srcDir, destDir, regExpFilter, onlyCopyNew)  {
                  regExpFilter = regExpFilter || /\w/;
                  srcDir = frontSlash(path.normalize(srcDir));
                  destDir = frontSlash(path.normalize(destDir));
                  var fileNames = file.getFilteredFileList(srcDir, regExpFilter, true), copiedFiles = [], i, srcFileName, destFileName;
                  for (i = 0; i < fileNames.length; i++)  {
                        srcFileName = fileNames[i];
                        destFileName = srcFileName.replace(srcDir, destDir);
                        if (file.copyFile(srcFileName, destFileName, onlyCopyNew))  {
                           copiedFiles.push(destFileName);
                        }
                     }
                  return copiedFiles.length ? copiedFiles : null;
               }, 
               copyFile:function(srcFileName, destFileName, onlyCopyNew)  {
                  var parentDir;
                  if (onlyCopyNew)  {
                     if (file.exists(destFileName) && fs.statSync(destFileName).mtime.getTime() >= fs.statSync(srcFileName).mtime.getTime())  {
                        return false;
                     }
                  }
                  parentDir = path.dirname(destFileName);
                  if (! file.exists(parentDir))  {
                     mkFullDir(parentDir);
                  }
                  fs.writeFileSync(destFileName, fs.readFileSync(srcFileName, "binary"), "binary");
                  return true;
               }, 
               renameFile:function(from, to)  {
                  return fs.renameSync(from, to);
               }, 
               readFile:function(path, encoding)  {
                  if (encoding === "utf-8")  {
                     encoding = "utf8";
                  }
                  if (! encoding)  {
                     encoding = "utf8";
                  }
                  var text = fs.readFileSync(path, encoding);
                  if (text.indexOf("﻿") === 0)  {
                     text = text.substring(1, text.length);
                  }
                  return text;
               }, 
               saveUtf8File:function(fileName, fileContents)  {
                  file.saveFile(fileName, fileContents, "utf8");
               }, 
               saveFile:function(fileName, fileContents, encoding)  {
                  var parentDir;
                  if (encoding === "utf-8")  {
                     encoding = "utf8";
                  }
                  if (! encoding)  {
                     encoding = "utf8";
                  }
                  parentDir = path.dirname(fileName);
                  if (! file.exists(parentDir))  {
                     mkFullDir(parentDir);
                  }
                  fs.writeFileSync(fileName, fileContents, encoding);
               }, 
               deleteFile:function(fileName)  {
                  var files, i, stat;
                  if (file.exists(fileName))  {
                     stat = fs.statSync(fileName);
                     if (stat.isDirectory())  {
                        files = fs.readdirSync(fileName);
                        for (i = 0; i < files.length; i++)  {
                              this.deleteFile(path.join(fileName, files[i]));
                           }
                        fs.rmdirSync(fileName);
                     }
                      else  {
                        fs.unlinkSync(fileName);
                     }
                  }
               }} ;
            return file;
         }
      );
   }
   if (env === "rhino")  {
      define("rhino/file", function()  {
            var file =  {
               backSlashRegExp:/\\/g, 
               exclusionRegExp:/^\./, 
               getLineSeparator:function()  {
                  return file.lineSeparator;
               }, 
               lineSeparator:java.lang.System.getProperty("line.separator"), 
               exists:function(fileName)  {
                  return new java.io.File(fileName).exists();
               }, 
               parent:function(fileName)  {
                  return file.absPath(new java.io.File(fileName).getParentFile());
               }, 
               normalize:function(fileName)  {
                  return file.absPath(fileName);
               }, 
               isFile:function(path)  {
                  return new java.io.File(path).isFile();
               }, 
               isDirectory:function(path)  {
                  return new java.io.File(path).isDirectory();
               }, 
               absPath:function(fileObj)  {
                  if (typeof fileObj === "string")  {
                     fileObj = new java.io.File(fileObj);
                  }
                  return fileObj.getAbsolutePath() + "".replace(file.backSlashRegExp, "/");
               }, 
               getFilteredFileList:function(startDir, regExpFilters, makeUnixPaths, startDirIsJavaObject)  {
                  var files = [], topDir, regExpInclude, regExpExclude, dirFileArray, i, fileObj, filePath, ok, dirFiles;
                  topDir = startDir;
                  if (! startDirIsJavaObject)  {
                     topDir = new java.io.File(startDir);
                  }
                  regExpInclude = regExpFilters.include || regExpFilters;
                  regExpExclude = regExpFilters.exclude || null;
                  if (topDir.exists())  {
                     dirFileArray = topDir.listFiles();
                     for (i = 0; i < dirFileArray.length; i++)  {
                           fileObj = dirFileArray[i];
                           if (fileObj.isFile())  {
                              filePath = fileObj.getPath();
                              if (makeUnixPaths)  {
                                 filePath = String(filePath);
                                 if (filePath.indexOf("/") === - 1)  {
                                    filePath = filePath.replace(/\\/g, "/");
                                 }
                              }
                              ok = true;
                              if (regExpInclude)  {
                                 ok = filePath.match(regExpInclude);
                              }
                              if (ok && regExpExclude)  {
                                 ok = ! filePath.match(regExpExclude);
                              }
                              if (ok && ! file.exclusionRegExp || ! file.exclusionRegExp.test(fileObj.getName()))  {
                                 files.push(filePath);
                              }
                           }
                            else if (fileObj.isDirectory() && ! file.exclusionRegExp || ! file.exclusionRegExp.test(fileObj.getName()))  {
                              dirFiles = this.getFilteredFileList(fileObj, regExpFilters, makeUnixPaths, true);
                              files.push.apply(files, dirFiles);
                           }
                        }
                  }
                  return files;
               }, 
               copyDir:function(srcDir, destDir, regExpFilter, onlyCopyNew)  {
                  regExpFilter = regExpFilter || /\w/;
                  var fileNames = file.getFilteredFileList(srcDir, regExpFilter, true), copiedFiles = [], i, srcFileName, destFileName;
                  for (i = 0; i < fileNames.length; i++)  {
                        srcFileName = fileNames[i];
                        destFileName = srcFileName.replace(srcDir, destDir);
                        if (file.copyFile(srcFileName, destFileName, onlyCopyNew))  {
                           copiedFiles.push(destFileName);
                        }
                     }
                  return copiedFiles.length ? copiedFiles : null;
               }, 
               copyFile:function(srcFileName, destFileName, onlyCopyNew)  {
                  var destFile = new java.io.File(destFileName), srcFile, parentDir, srcChannel, destChannel;
                  if (onlyCopyNew)  {
                     srcFile = new java.io.File(srcFileName);
                     if (destFile.exists() && destFile.lastModified() >= srcFile.lastModified())  {
                        return false;
                     }
                  }
                  parentDir = destFile.getParentFile();
                  if (! parentDir.exists())  {
                     if (! parentDir.mkdirs())  {
                        throw "Could not create directory: " + parentDir.getAbsolutePath();
                     }
                  }
                  srcChannel = new java.io.FileInputStream(srcFileName).getChannel();
                  destChannel = new java.io.FileOutputStream(destFileName).getChannel();
                  destChannel.transferFrom(srcChannel, 0, srcChannel.size());
                  srcChannel.close();
                  destChannel.close();
                  return true;
               }, 
               renameFile:function(from, to)  {
                  return new java.io.File(from).renameTo(new java.io.File(to));
               }, 
               readFile:function(path, encoding)  {
                  encoding = encoding || "utf-8";
                  var fileObj = new java.io.File(path), input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(fileObj), encoding)), stringBuffer, line;
                  try {
                     stringBuffer = new java.lang.StringBuffer();
                     line = input.readLine();
                     if (line && line.length() && line.charAt(0) === 65279)  {
                        line = line.substring(1);
                     }
                     while (line !== null)  {
                           stringBuffer.append(line);
                           stringBuffer.append(file.lineSeparator);
                           line = input.readLine();
                        }
                     return String(stringBuffer.toString());
                  }
finally  {
                        input.close();
                     }
               }, 
               saveUtf8File:function(fileName, fileContents)  {
                  file.saveFile(fileName, fileContents, "utf-8");
               }, 
               saveFile:function(fileName, fileContents, encoding)  {
                  var outFile = new java.io.File(fileName), outWriter, parentDir, os;
                  parentDir = outFile.getAbsoluteFile().getParentFile();
                  if (! parentDir.exists())  {
                     if (! parentDir.mkdirs())  {
                        throw "Could not create directory: " + parentDir.getAbsolutePath();
                     }
                  }
                  if (encoding)  {
                     outWriter = new java.io.OutputStreamWriter(new java.io.FileOutputStream(outFile), encoding);
                  }
                   else  {
                     outWriter = new java.io.OutputStreamWriter(new java.io.FileOutputStream(outFile));
                  }
                  os = new java.io.BufferedWriter(outWriter);
                  try {
                     os.write(fileContents);
                  }
finally  {
                        os.close();
                     }
               }, 
               deleteFile:function(fileName)  {
                  var fileObj = new java.io.File(fileName), files, i;
                  if (fileObj.exists())  {
                     if (fileObj.isDirectory())  {
                        files = fileObj.listFiles();
                        for (i = 0; i < files.length; i++)  {
                              this.deleteFile(files[i]);
                           }
                     }
                     fileObj["delete"]();
                  }
               }} ;
            return file;
         }
      );
   }
   define("lang", function()  {
         "use strict";
         var lang =  {
            backSlashRegExp:/\\/g, 
            ostring:Object.prototype.toString, 
            isArray:Array.isArray || function(it)  {
               return lang.ostring.call(it) === "[object Array]";
            }, 
            isFunction:function(it)  {
               return lang.ostring.call(it) === "[object Function]";
            }, 
            isRegExp:function(it)  {
               return it && it instanceof RegExp;
            }, 
            _mixin:function(dest, source, override)  {
               var name;
               for (name in source)  {
                     if (source.hasOwnProperty(name) && override || ! dest.hasOwnProperty(name))  {
                        dest[name] = source[name];
                     }
                  }
               return dest;
            }, 
            mixin:function(dest)  {
               var parameters = Array.prototype.slice.call(arguments), override, i, l;
               if (! dest)  {
                  dest =  {} ;
               }
               if (parameters.length > 2 && typeof arguments[parameters.length - 1] === "boolean")  {
                  override = parameters.pop();
               }
               for (i = 1, l = parameters.length; i < l; i++)  {
                     lang._mixin(dest, parameters[i], override);
                  }
               return dest;
            }, 
            delegate:function()  {
               function TMP()  {
               }
;
               return function(obj, props)  {
                  TMP.prototype = obj;
                  var tmp = new TMP();
                  TMP.prototype = null;
                  if (props)  {
                     lang.mixin(tmp, props);
                  }
                  return tmp;
               }
;
            }
()         }
;
         return lang;
      }
   );
   if (env === "node")  {
      define("node/print", function()  {
            function print(msg)  {
               console.log(msg);
            }
;
            return print;
         }
      );
   }
   if (env === "rhino")  {
      define("rhino/print", function()  {
            return print;
         }
      );
   }
   define("logger", ["env!env/print"], function(print)  {
         var logger =  {
            TRACE:0, 
            INFO:1, 
            WARN:2, 
            ERROR:3, 
            SILENT:4, 
            level:0, 
            logPrefix:"", 
            logLevel:function(level)  {
               this.level = level;
            }, 
            trace:function(message)  {
               if (this.level <= this.TRACE)  {
                  this._print(message);
               }
            }, 
            info:function(message)  {
               if (this.level <= this.INFO)  {
                  this._print(message);
               }
            }, 
            warn:function(message)  {
               if (this.level <= this.WARN)  {
                  this._print(message);
               }
            }, 
            error:function(message)  {
               if (this.level <= this.ERROR)  {
                  this._print(message);
               }
            }, 
            _print:function(message)  {
               this._sysPrint(this.logPrefix ? this.logPrefix + " " : "" + message);
            }, 
            _sysPrint:function(message)  {
               print(message);
            }} ;
         return logger;
      }
   );
   define("uglifyjs/consolidator", ["require", "exports", "module", "env!env/assert", "./parse-js", "./process"], function(require, exports, module, assert)  {
         exports["ast_consolidate"] = function(oAbstractSyntaxTree)  {
            "use strict";
            var _, TSourceElementsData = function()  {
               this.nCategory = ESourceElementCategories.N_OTHER;
               this.aCount = [];
               this.aCount[EPrimaryExpressionCategories.N_IDENTIFIER_NAMES] =  {} ;
               this.aCount[EPrimaryExpressionCategories.N_STRING_LITERALS] =  {} ;
               this.aCount[EPrimaryExpressionCategories.N_NULL_AND_BOOLEAN_LITERALS] =  {} ;
               this.aIdentifiers = [];
               this.aPrimitiveValues = [];
            }
, TPrimitiveValue = function()  {
               this.nSaving = 0;
               this.sName = "";
            }
, TSolution = function()  {
               this.oPrimitiveValues =  {} ;
               this.nSavings = 0;
            }
, oProcessor = require("./process"), oWeights =  {
               N_PROPERTY_ACCESSOR:1, 
               N_VARIABLE_DECLARATION:2, 
               N_VARIABLE_STATEMENT_AFFIXATION:4, 
               N_CLOSURE:17            }
, EPrimaryExpressionCategories =  {
               N_IDENTIFIER_NAMES:0, 
               N_STRING_LITERALS:1, 
               N_NULL_AND_BOOLEAN_LITERALS:2            }
, EValuePrefixes =  {
               S_STRING:"#S", 
               S_SYMBOLIC:"#O"            }
, ESourceElementCategories =  {
               N_WITH:0, 
               N_EVAL:1, 
               N_EXCLUDABLE:2, 
               N_OTHER:3            }
, A_OTHER_SUBSTITUTABLE_LITERALS = ["null", "false", "true"];
            function(oSyntacticCodeUnit)  {
               var _, bIsGlobal = "toplevel" === oSyntacticCodeUnit[0], bIsWhollyExaminable = ! bIsGlobal, oSourceElements, oSourceElementData, oScope, oWalker, oWalkers =  {
                  oSurveySourceElement: {
                     defun:function(sIdentifier, aFormalParameterList, oFunctionBody)  {
                        fClassifyAsExcludable();
                        fAddIdentifier(sIdentifier);
                        aFormalParameterList.forEach(fAddIdentifier);
                     }, 
                     dot:function(oExpression, sIdentifierName)  {
                        fCountPrimaryExpression(EPrimaryExpressionCategories.N_IDENTIFIER_NAMES, EValuePrefixes.S_STRING + sIdentifierName);
                        return ["dot", oWalker.walk(oExpression), sIdentifierName];
                     }, 
                     function:function(sIdentifier, aFormalParameterList, oFunctionBody)  {
                        if ("string" === typeof sIdentifier)  {
                           fAddIdentifier(sIdentifier);
                        }
                        aFormalParameterList.forEach(fAddIdentifier);
                     }, 
                     name:function(sIdentifier)  {
                        if (- 1 !== A_OTHER_SUBSTITUTABLE_LITERALS.indexOf(sIdentifier))  {
                           fCountPrimaryExpression(EPrimaryExpressionCategories.N_NULL_AND_BOOLEAN_LITERALS, EValuePrefixes.S_SYMBOLIC + sIdentifier);
                        }
                         else  {
                           if ("eval" === sIdentifier)  {
                              oSourceElementData.nCategory = ESourceElementCategories.N_EVAL;
                           }
                           fAddIdentifier(sIdentifier);
                        }
                     }, 
                     return:function(oExpression)  {
                        fClassifyAsExcludable();
                     }, 
                     string:function(sStringValue)  {
                        if (sStringValue.length > 0)  {
                           fCountPrimaryExpression(EPrimaryExpressionCategories.N_STRING_LITERALS, EValuePrefixes.S_STRING + sStringValue);
                        }
                     }, 
                     try:function(oTry, aCatch, oFinally)  {
                        if (Array.isArray(aCatch))  {
                           fAddIdentifier(aCatch[0]);
                        }
                     }, 
                     var:function(aVariableDeclarationList)  {
                        fClassifyAsExcludable();
                        aVariableDeclarationList.forEach(fAddVariable);
                     }, 
                     with:function(oExpression, oStatement)  {
                        oSourceElementData.nCategory = ESourceElementCategories.N_WITH;
                        return [];
                     }} , 
                  oExamineFunctions: {
                     defun:function()  {
                        fExamineSyntacticCodeUnit(this);
                        return [];
                     }, 
                     function:function()  {
                        fExamineSyntacticCodeUnit(this);
                        return [];
                     }}                }
, aSourceElementsData = [], nAfterDirectivePrologue = 0, nPosition, nTo, cContext = function(oWalker, oSourceElement)  {
                  var fLambda = function()  {
                     return oWalker.walk(oSourceElement);
                  }
;
                  return fLambda;
               }
, fClassifyAsExcludable = function()  {
                  if (oSourceElementData.nCategory === ESourceElementCategories.N_OTHER)  {
                     oSourceElementData.nCategory = ESourceElementCategories.N_EXCLUDABLE;
                  }
               }
, fAddIdentifier = function(sIdentifier)  {
                  if (- 1 === oSourceElementData.aIdentifiers.indexOf(sIdentifier))  {
                     oSourceElementData.aIdentifiers.push(sIdentifier);
                  }
               }
, fAddVariable = function(aVariableDeclaration)  {
                  fAddIdentifier(aVariableDeclaration[0]);
               }
, fCountPrimaryExpression = function(nCategory, sName)  {
                  if (! oSourceElementData.aCount[nCategory].hasOwnProperty(sName))  {
                     oSourceElementData.aCount[nCategory][sName] = 0;
                     if (- 1 === oSourceElementData.aPrimitiveValues.indexOf(sName))  {
                        oSourceElementData.aPrimitiveValues.push(sName);
                     }
                  }
                  oSourceElementData.aCount[nCategory][sName] = 1;
               }
, fExamineSourceElements = function(nFrom, nTo, bEnclose)  {
                  var _, nIndex = oScope.cname, nPosition, oWalkersTransformers =  {
                     dot:function(oExpression, sIdentifierName)  {
                        var sPrefixed = EValuePrefixes.S_STRING + sIdentifierName;
                        return oSolutionBest.oPrimitiveValues.hasOwnProperty(sPrefixed) && oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0 ? ["sub", oWalker.walk(oExpression), ["name", oSolutionBest.oPrimitiveValues[sPrefixed].sName]] : ["dot", oWalker.walk(oExpression), sIdentifierName];
                     }, 
                     name:function(sIdentifier)  {
                        var sPrefixed = EValuePrefixes.S_SYMBOLIC + sIdentifier;
                        return ["name", oSolutionBest.oPrimitiveValues.hasOwnProperty(sPrefixed) && oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0 ? oSolutionBest.oPrimitiveValues[sPrefixed].sName : sIdentifier];
                     }, 
                     string:function(sStringValue)  {
                        var sPrefixed = EValuePrefixes.S_STRING + sStringValue;
                        return oSolutionBest.oPrimitiveValues.hasOwnProperty(sPrefixed) && oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0 ? ["name", oSolutionBest.oPrimitiveValues[sPrefixed].sName] : ["string", sStringValue];
                     }} , oSolutionBest = new TSolution(), oSolutionCandidate = new TSolution(), oSourceElementsData = new TSourceElementsData(), aVariableDeclarations = [], cAugmentList = function(aList)  {
                     var fLambda = function(sPrefixed)  {
                        if (- 1 === aList.indexOf(sPrefixed))  {
                           aList.push(sPrefixed);
                        }
                     }
;
                     return fLambda;
                  }
, cAddOccurrences = function(nPosition, nCategory)  {
                     var fLambda = function(sPrefixed)  {
                        if (! oSourceElementsData.aCount[nCategory].hasOwnProperty(sPrefixed))  {
                           oSourceElementsData.aCount[nCategory][sPrefixed] = 0;
                        }
                        oSourceElementsData.aCount[nCategory][sPrefixed] = aSourceElementsData[nPosition].aCount[nCategory][sPrefixed];
                     }
;
                     return fLambda;
                  }
, cAddOccurrencesInCategory = function(nPosition)  {
                     var fLambda = function(nCategory)  {
                        Object.keys(aSourceElementsData[nPosition].aCount[nCategory]).forEach(cAddOccurrences(nPosition, nCategory));
                     }
;
                     return fLambda;
                  }
, fAddOccurrences = function(nPosition)  {
                     Object.keys(aSourceElementsData[nPosition].aCount).forEach(cAddOccurrencesInCategory(nPosition));
                  }
, cAugmentVariableDeclarations = function(sPrefixed)  {
                     if (oSolutionBest.oPrimitiveValues[sPrefixed].nSaving > 0)  {
                        aVariableDeclarations.push([oSolutionBest.oPrimitiveValues[sPrefixed].sName, [0 === sPrefixed.indexOf(EValuePrefixes.S_SYMBOLIC) ? "name" : "string", sPrefixed.substring(EValuePrefixes.S_SYMBOLIC.length)]]);
                     }
                  }
, cSortPrimitiveValues = function(sPrefixed0, sPrefixed1)  {
                     var nDifference = oSolutionCandidate.oPrimitiveValues[sPrefixed0].nSaving - oSolutionCandidate.oPrimitiveValues[sPrefixed1].nSaving;
                     return nDifference > 0 ? - 1 : nDifference < 0 ? 1 : 0;
                  }
, fEvaluatePrimitiveValue = function(sPrefixed)  {
                     var _, nIndex, sName = sPrefixed.substring(EValuePrefixes.S_SYMBOLIC.length), nLengthOriginal = sName.length, nLengthSubstitution, nLengthString = oProcessor.make_string(sName).length;
                     oSolutionCandidate.oPrimitiveValues[sPrefixed] = new TPrimitiveValue();
                     do  {
                           nIndex = oScope.cname;
                           oSolutionCandidate.oPrimitiveValues[sPrefixed].sName = oScope.next_mangled();
                        }
 while (- 1 !== oSourceElementsData.aIdentifiers.indexOf(oSolutionCandidate.oPrimitiveValues[sPrefixed].sName))                     nLengthSubstitution = oSolutionCandidate.oPrimitiveValues[sPrefixed].sName.length;
                     if (0 === sPrefixed.indexOf(EValuePrefixes.S_SYMBOLIC))  {
                        oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving = nLengthSubstitution + nLengthOriginal + oWeights.N_VARIABLE_DECLARATION;
                        oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving = oSourceElementsData.aCount[EPrimaryExpressionCategories.N_NULL_AND_BOOLEAN_LITERALS][sPrefixed] * nLengthOriginal - nLengthSubstitution;
                     }
                      else  {
                        oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving = nLengthSubstitution + nLengthString + oWeights.N_VARIABLE_DECLARATION;
                        if (oSourceElementsData.aCount[EPrimaryExpressionCategories.N_IDENTIFIER_NAMES].hasOwnProperty(sPrefixed))  {
                           oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving = oSourceElementsData.aCount[EPrimaryExpressionCategories.N_IDENTIFIER_NAMES][sPrefixed] * nLengthOriginal - nLengthSubstitution - oWeights.N_PROPERTY_ACCESSOR;
                        }
                        if (oSourceElementsData.aCount[EPrimaryExpressionCategories.N_STRING_LITERALS].hasOwnProperty(sPrefixed))  {
                           oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving = oSourceElementsData.aCount[EPrimaryExpressionCategories.N_STRING_LITERALS][sPrefixed] * nLengthString - nLengthSubstitution;
                        }
                     }
                     if (oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving > 0)  {
                        oSolutionCandidate.nSavings = oSolutionCandidate.oPrimitiveValues[sPrefixed].nSaving;
                     }
                      else  {
                        oScope.cname = nIndex;
                     }
                  }
, cAddVariableDeclaration = function(aVariableDeclaration)  {
                     oSourceElements[nFrom][1].unshift(aVariableDeclaration);
                  }
;
                  if (nFrom > nTo)  {
                     return ;
                  }
                  if (nFrom === nTo && "stat" === oSourceElements[nFrom][0] && "call" === oSourceElements[nFrom][1][0] && "function" === oSourceElements[nFrom][1][1][0])  {
                     fExamineSyntacticCodeUnit(oSourceElements[nFrom][1][1]);
                     return ;
                  }
                  for (nPosition = nFrom; nPosition <= nTo; nPosition = 1)  {
                        aSourceElementsData[nPosition].aPrimitiveValues.forEach(cAugmentList(oSourceElementsData.aPrimitiveValues));
                     }
                  if (0 === oSourceElementsData.aPrimitiveValues.length)  {
                     return ;
                  }
                  for (nPosition = nFrom; nPosition <= nTo; nPosition = 1)  {
                        fAddOccurrences(nPosition);
                        aSourceElementsData[nPosition].aIdentifiers.forEach(cAugmentList(oSourceElementsData.aIdentifiers));
                     }
                  do  {
                        oSolutionBest = oSolutionCandidate;
                        if (Object.keys(oSolutionCandidate.oPrimitiveValues).length > 0)  {
                           oSourceElementsData.aPrimitiveValues.sort(cSortPrimitiveValues);
                        }
                        oSolutionCandidate = new TSolution();
                        oSourceElementsData.aPrimitiveValues.forEach(fEvaluatePrimitiveValue);
                        oScope.cname = nIndex;
                     }
 while (oSolutionCandidate.nSavings > oSolutionBest.nSavings)                  if ("var" !== oSourceElements[nFrom][0])  {
                     oSolutionBest.nSavings = oWeights.N_VARIABLE_STATEMENT_AFFIXATION;
                  }
                  if (bEnclose)  {
                     oSolutionBest.nSavings = oWeights.N_CLOSURE;
                  }
                  if (oSolutionBest.nSavings > 0)  {
                     Object.keys(oSolutionBest.oPrimitiveValues).forEach(cAugmentVariableDeclarations);
                     for (nPosition = nFrom; nPosition <= nTo; nPosition = 1)  {
                           oWalker = oProcessor.ast_walker();
                           oSourceElements[nPosition] = oWalker.with_walkers(oWalkersTransformers, cContext(oWalker, oSourceElements[nPosition]));
                        }
                     if ("var" === oSourceElements[nFrom][0])  {
                        aVariableDeclarations.reverse().forEach(cAddVariableDeclaration);
                     }
                      else  {
                        Array.prototype.splice.call(oSourceElements, nFrom, 0, ["var", aVariableDeclarations]);
                        nTo = 1;
                     }
                     if (bEnclose)  {
                        Array.prototype.splice.call(oSourceElements, nFrom, 0, ["stat", ["call", ["function", null, [], []], []]]);
                        for (nPosition = nTo + 1; nPosition > nFrom; nPosition = 1)  {
                              Array.prototype.unshift.call(oSourceElements[nFrom][1][1][3], oSourceElements[nPosition]);
                           }
                        Array.prototype.splice.call(oSourceElements, nFrom + 1, nTo - nFrom + 1);
                     }
                  }
                  if (bEnclose)  {
                     oScope.cname = nIndex;
                  }
               }
;
               oSourceElements = oSyntacticCodeUnit[bIsGlobal ? 1 : 3];
               if (0 === oSourceElements.length)  {
                  return ;
               }
               oScope = bIsGlobal ? oSyntacticCodeUnit.scope : oSourceElements.scope;
               while (nAfterDirectivePrologue < oSourceElements.length && "stat" === oSourceElements[nAfterDirectivePrologue][0] && "string" === oSourceElements[nAfterDirectivePrologue][1][0])  {
                     nAfterDirectivePrologue = 1;
                     aSourceElementsData.push(null);
                  }
               if (oSourceElements.length === nAfterDirectivePrologue)  {
                  return ;
               }
               for (nPosition = nAfterDirectivePrologue; nPosition < oSourceElements.length; nPosition = 1)  {
                     oSourceElementData = new TSourceElementsData();
                     oWalker = oProcessor.ast_walker();
                     oWalker.with_walkers(oWalkers.oSurveySourceElement, cContext(oWalker, oSourceElements[nPosition]));
                     bIsWhollyExaminable = bIsWhollyExaminable && ESourceElementCategories.N_WITH !== oSourceElementData.nCategory && ESourceElementCategories.N_EVAL !== oSourceElementData.nCategory;
                     aSourceElementsData.push(oSourceElementData);
                  }
               if (bIsWhollyExaminable)  {
                  fExamineSourceElements(nAfterDirectivePrologue, oSourceElements.length - 1, false);
               }
                else  {
                  for (nPosition = oSourceElements.length - 1; nPosition >= nAfterDirectivePrologue; nPosition = 1)  {
                        oSourceElementData = aSourceElementsData[nPosition];
                        if (ESourceElementCategories.N_OTHER === oSourceElementData.nCategory)  {
                           if ("undefined" === typeof nTo)  {
                              nTo = nPosition;
                           }
                           if (nPosition === nAfterDirectivePrologue)  {
                              fExamineSourceElements(nPosition, nTo, true);
                           }
                        }
                         else  {
                           if ("undefined" !== typeof nTo)  {
                              fExamineSourceElements(nPosition + 1, nTo, true);
                              nTo = void 0;
                           }
                           oWalker = oProcessor.ast_walker();
                           oWalker.with_walkers(oWalkers.oExamineFunctions, cContext(oWalker, oSourceElements[nPosition]));
                        }
                     }
               }
            }
(oAbstractSyntaxTree = oProcessor.ast_add_scope(oAbstractSyntaxTree));
            return oAbstractSyntaxTree;
         }
;
         if (require.main === module)  {
            function()  {
               "use strict";
               var _, oAssert = require("env!env/assert"), oParser = require("./parse-js"), oProcessor = require("./process"), oWalker, oWalkersPurifiers =  {
                  defun:function(sIdentifier, aFormalParameterList, oFunctionBody)  {
                     delete oFunctionBody.scope;
                  }, 
                  function:function(sIdentifier, aFormalParameterList, oFunctionBody)  {
                     delete oFunctionBody.scope;
                  }} , cContext = function(oWalker, oSourceElement)  {
                  var fLambda = function()  {
                     return oWalker.walk(oSourceElement);
                  }
;
                  return fLambda;
               }
, oCodeGenerationOptions =  {
                  beautify:true               }
, cAssert = function(oUnitTest)  {
                  var _, oSyntacticCodeUnitActual = exports.ast_consolidate(oParser.parse(oUnitTest.sInput)), oSyntacticCodeUnitExpected = oParser.parse(oUnitTest.hasOwnProperty("sOutput") ? oUnitTest.sOutput : oUnitTest.sInput);
                  delete oSyntacticCodeUnitActual.scope;
                  oWalker = oProcessor.ast_walker();
                  oWalker.with_walkers(oWalkersPurifiers, cContext(oWalker, oSyntacticCodeUnitActual));
                  try {
                     oAssert.deepEqual(oSyntacticCodeUnitActual, oSyntacticCodeUnitExpected);
                  }
                  catch (oException) {
                     console.error("########## A unit test has failed.
" + oUnitTest.sTitle + "
" + "#####  actual code  (" + oProcessor.gen_code(oSyntacticCodeUnitActual).length + " bytes)
" + oProcessor.gen_code(oSyntacticCodeUnitActual, oCodeGenerationOptions) + "
" + "##### expected code (" + oProcessor.gen_code(oSyntacticCodeUnitExpected).length + " bytes)
" + oProcessor.gen_code(oSyntacticCodeUnitExpected, oCodeGenerationOptions));
                  }
               }
;
               [ {
                  sTitle:"Omission of keywords while choosing an identifier name.", 
                  sInput:"(function() {" + "  var a, b, c, d, e, f, g, h, i, j, k, l, m," + "      n, o, p, q, r, s, t, u, v, w, x, y, z," + "      A, B, C, D, E, F, G, H, I, J, K, L, M," + "      N, O, P, Q, R, S, T, U, V, W, X, Y, Z," + "      $, _," + "      aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am," + "      an, ao, ap, aq, ar, as, at, au, av, aw, ax, ay, az," + "      aA, aB, aC, aD, aE, aF, aG, aH, aI, aJ, aK, aL, aM," + "      aN, aO, aP, aQ, aR, aS, aT, aU, aV, aW, aX, aY, aZ," + "      a$, a_," + "      ba, bb, bc, bd, be, bf, bg, bh, bi, bj, bk, bl, bm," + "      bn, bo, bp, bq, br, bs, bt, bu, bv, bw, bx, by, bz," + "      bA, bB, bC, bD, bE, bF, bG, bH, bI, bJ, bK, bL, bM," + "      bN, bO, bP, bQ, bR, bS, bT, bU, bV, bW, bX, bY, bZ," + "      b$, b_," + "      ca, cb, cc, cd, ce, cf, cg, ch, ci, cj, ck, cl, cm," + "      cn, co, cp, cq, cr, cs, ct, cu, cv, cw, cx, cy, cz," + "      cA, cB, cC, cD, cE, cF, cG, cH, cI, cJ, cK, cL, cM," + "      cN, cO, cP, cQ, cR, cS, cT, cU, cV, cW, cX, cY, cZ," + "      c$, c_," + "      da, db, dc, dd, de, df, dg, dh, di, dj, dk, dl, dm," + "      dn, dq, dr, ds, dt, du, dv, dw, dx, dy, dz," + "      dA, dB, dC, dD, dE, dF, dG, dH, dI, dJ, dK, dL, dM," + "      dN, dO, dP, dQ, dR, dS, dT, dU, dV, dW, dX, dY, dZ," + "      d$, d_;" + "  void ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"," + "        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];" + "}());", 
                  sOutput:"(function() {" + "  var dp =" + "      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"," + "      a, b, c, d, e, f, g, h, i, j, k, l, m," + "      n, o, p, q, r, s, t, u, v, w, x, y, z," + "      A, B, C, D, E, F, G, H, I, J, K, L, M," + "      N, O, P, Q, R, S, T, U, V, W, X, Y, Z," + "      $, _," + "      aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am," + "      an, ao, ap, aq, ar, as, at, au, av, aw, ax, ay, az," + "      aA, aB, aC, aD, aE, aF, aG, aH, aI, aJ, aK, aL, aM," + "      aN, aO, aP, aQ, aR, aS, aT, aU, aV, aW, aX, aY, aZ," + "      a$, a_," + "      ba, bb, bc, bd, be, bf, bg, bh, bi, bj, bk, bl, bm," + "      bn, bo, bp, bq, br, bs, bt, bu, bv, bw, bx, by, bz," + "      bA, bB, bC, bD, bE, bF, bG, bH, bI, bJ, bK, bL, bM," + "      bN, bO, bP, bQ, bR, bS, bT, bU, bV, bW, bX, bY, bZ," + "      b$, b_," + "      ca, cb, cc, cd, ce, cf, cg, ch, ci, cj, ck, cl, cm," + "      cn, co, cp, cq, cr, cs, ct, cu, cv, cw, cx, cy, cz," + "      cA, cB, cC, cD, cE, cF, cG, cH, cI, cJ, cK, cL, cM," + "      cN, cO, cP, cQ, cR, cS, cT, cU, cV, cW, cX, cY, cZ," + "      c$, c_," + "      da, db, dc, dd, de, df, dg, dh, di, dj, dk, dl, dm," + "      dn, dq, dr, ds, dt, du, dv, dw, dx, dy, dz," + "      dA, dB, dC, dD, dE, dF, dG, dH, dI, dJ, dK, dL, dM," + "      dN, dO, dP, dQ, dR, dS, dT, dU, dV, dW, dX, dY, dZ," + "      d$, d_;" + "  void [dp, dp];" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to the null value.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  var foo;" + "  void [null, null, null];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void [null, null];" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  var a = null, foo;" + "  void [a, a, a];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void [null, null];" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to the false value.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  var foo;" + "  void [false, false, false];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void [false, false];" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  var a = false, foo;" + "  void [a, a, a];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void [false, false];" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to the true value.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  var foo;" + "  void [true, true, true];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void [true, true];" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  var a = true, foo;" + "  void [a, a, a];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void [true, true];" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to the String value of a string literal.", 
                  sInput:"(function() {" + "  var foo;" + "  void ["abcd", "abcd", "abc", "abc"];" + "}());", 
                  sOutput:"(function() {" + "  var a = "abcd", foo;" + "  void [a, a, "abc", "abc"];" + "}());"               }
,  {
                  sTitle:"Preservation of the pattern of a regular expression literal.", 
                  sInput:"void [/abcdefghijklmnopqrstuvwxyz/, /abcdefghijklmnopqrstuvwxyz/];"               }
,  {
                  sTitle:"Preservation of the flags of a regular expression literal.", 
                  sInput:"void [/(?:)/gim, /(?:)/gim, /(?:)/gim, /(?:)/gim, /(?:)/gim," + "      /(?:)/gim, /(?:)/gim, /(?:)/gim, /(?:)/gim, /(?:)/gim," + "      /(?:)/gim, /(?:)/gim, /(?:)/gim, /(?:)/gim, /(?:)/gim];"               }
,  {
                  sTitle:"Preservation of identifier names in the same scope.", 
                  sInput:"/*jshint shadow:true */" + "var a;" + "function b(i) {" + "}" + "for (var c; 0 === Math.random(););" + "for (var d in {});" + "void ["abcdefghijklmnopqrstuvwxyz"];" + "void [b(a), b(c), b(d)];" + "void [typeof e];" + "i: for (; 0 === Math.random();) {" + "  if (42 === (new Date()).getMinutes()) {" + "    continue i;" + "  } else {" + "    break i;" + "  }" + "}" + "try {" + "} catch (f) {" + "} finally {" + "}" + "(function g(h) {" + "}());" + "void [{" + "  i: 42," + "  "j": 42," + "  'k': 42" + "}];" + "void ["abcdefghijklmnopqrstuvwxyz"];", 
                  sOutput:"/*jshint shadow:true */" + "var a;" + "function b(i) {" + "}" + "for (var c; 0 === Math.random(););" + "for (var d in {});" + "(function() {" + "  var i = "abcdefghijklmnopqrstuvwxyz";" + "  void [i];" + "  void [b(a), b(c), b(d)];" + "  void [typeof e];" + "  i: for (; 0 === Math.random();) {" + "    if (42 === (new Date()).getMinutes()) {" + "      continue i;" + "    } else {" + "      break i;" + "    }" + "  }" + "  try {" + "  } catch (f) {" + "  } finally {" + "  }" + "  (function g(h) {" + "  }());" + "  void [{" + "    i: 42," + "    "j": 42," + "    'k': 42" + "  }];" + "  void [i];" + "}());"               }
,  {
                  sTitle:"Preservation of identifier names in nested function code.", 
                  sInput:"(function() {" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "  (function() {" + "    var a;" + "    for (var b; 0 === Math.random(););" + "    for (var c in {});" + "    void [typeof d];" + "    h: for (; 0 === Math.random();) {" + "      if (42 === (new Date()).getMinutes()) {" + "        continue h;" + "      } else {" + "        break h;" + "      }" + "    }" + "    try {" + "    } catch (e) {" + "    } finally {" + "    }" + "    (function f(g) {" + "    }());" + "    void [{" + "      h: 42," + "      "i": 42," + "      'j': 42" + "    }];" + "  }());" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "}());", 
                  sOutput:"(function() {" + "  var h = "abcdefghijklmnopqrstuvwxyz";" + "  void [h];" + "  (function() {" + "    var a;" + "    for (var b; 0 === Math.random(););" + "    for (var c in {});" + "    void [typeof d];" + "    h: for (; 0 === Math.random();) {" + "      if (42 === (new Date()).getMinutes()) {" + "        continue h;" + "      } else {" + "        break h;" + "      }" + "    }" + "    try {" + "    } catch (e) {" + "    } finally {" + "    }" + "    (function f(g) {" + "    }());" + "    void [{" + "      h: 42," + "      "i": 42," + "      'j': 42" + "    }];" + "  }());" + "  void [h];" + "}());"               }
,  {
                  sTitle:"Consolidation of a closure with other source elements.", 
                  sInput:"(function(foo) {" + "}("abcdefghijklmnopqrstuvwxyz"));" + "void ["abcdefghijklmnopqrstuvwxyz"];", 
                  sOutput:"(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  (function(foo) {" + "  })(a);" + "  void [a];" + "}());"               }
,  {
                  sTitle:"Consolidation of function code instead of a sole closure.", 
                  sInput:"(function(foo, bar) {" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}("abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"));", 
                  sOutput:"(function(foo, bar) {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}("abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"));"               }
,  {
                  sTitle:"Preservation of property names of an object initialiser.", 
                  sInput:"var foo = {" + "  abcdefghijklmnopqrstuvwxyz: 42," + "  "zyxwvutsrqponmlkjihgfedcba": 42," + "  'mlkjihgfedcbanopqrstuvwxyz': 42" + "};" + "void [" + "  foo.abcdefghijklmnopqrstuvwxyz," + "  "zyxwvutsrqponmlkjihgfedcba"," + "  'mlkjihgfedcbanopqrstuvwxyz'" + "];"               }
,  {
                  sTitle:"Evaluation with regard to String values derived from identifier " + "names used as property accessors.", 
                  sInput:"(function() {" + "  var foo;" + "  void [" + "    Math.abcdefghij," + "    Math.abcdefghij," + "    Math.abcdefghi," + "    Math.abcdefghi" + "  ];" + "}());", 
                  sOutput:"(function() {" + "  var a = "abcdefghij", foo;" + "  void [" + "    Math[a]," + "    Math[a]," + "    Math.abcdefghi," + "    Math.abcdefghi" + "  ];" + "}());"               }
,  {
                  sTitle:"Preservation of identifiers in the nonterminal MemberExpression.", 
                  sInput:"void [" + "  Math.E," + "  Math.LN10," + "  Math.LN2," + "  Math.LOG2E," + "  Math.LOG10E," + "  Math.PI," + "  Math.SQRT1_2," + "  Math.SQRT2," + "  Math.abs," + "  Math.acos" + "];"               }
,  {
                  sTitle:"Preservation of the identifier of a variable that is being " + "declared in a variable statement.", 
                  sInput:"(function() {" + "  var abcdefghijklmnopqrstuvwxyz;" + "  void [abcdefghijklmnopqrstuvwxyz];" + "}());"               }
,  {
                  sTitle:"Exclusion of a variable statement in global code.", 
                  sInput:"void ["abcdefghijklmnopqrstuvwxyz"];" + "var foo = "abcdefghijklmnopqrstuvwxyz"," + "    bar = "abcdefghijklmnopqrstuvwxyz";" + "void ["abcdefghijklmnopqrstuvwxyz"];"               }
,  {
                  sTitle:"Exclusion of a variable statement in function code that " + "contains a with statement.", 
                  sInput:"(function() {" + "  with ({});" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "  var foo;" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "}());"               }
,  {
                  sTitle:"Exclusion of a variable statement in function code that " + "contains a direct call to the eval function.", 
                  sInput:"/*jshint evil:true */" + "void [" + "  function() {" + "    eval("");" + "    void ["abcdefghijklmnopqrstuvwxyz"];" + "    var foo;" + "    void ["abcdefghijklmnopqrstuvwxyz"];" + "  }" + "];"               }
,  {
                  sTitle:"Consolidation within a variable statement in global code.", 
                  sInput:"var foo = function() {" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "};", 
                  sOutput:"var foo = function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "};"               }
,  {
                  sTitle:"Consolidation within a variable statement excluded in function " + "code due to the presence of a with statement.", 
                  sInput:"(function() {" + "  with ({});" + "  var foo = function() {" + "    void ["abcdefghijklmnopqrstuvwxyz"," + "          "abcdefghijklmnopqrstuvwxyz"];" + "  };" + "}());", 
                  sOutput:"(function() {" + "  with ({});" + "  var foo = function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  };" + "}());"               }
,  {
                  sTitle:"Consolidation within a variable statement excluded in function " + "code due to the presence of a direct call to the eval function.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  eval("");" + "  var foo = function() {" + "    void ["abcdefghijklmnopqrstuvwxyz"," + "          "abcdefghijklmnopqrstuvwxyz"];" + "  };" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  eval("");" + "  var foo = function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  };" + "}());"               }
,  {
                  sTitle:"Inclusion of a variable statement in function code that " + "contains no with statement and no direct call to the eval " + "function.", 
                  sInput:"(function() {" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "  var foo;" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "}());", 
                  sOutput:"(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a];" + "  var foo;" + "  void [a];" + "}());"               }
,  {
                  sTitle:"Ignorance with regard to a variable statement in global code.", 
                  sInput:"var foo = "abcdefghijklmnopqrstuvwxyz";" + "void ["abcdefghijklmnopqrstuvwxyz"," + "      "abcdefghijklmnopqrstuvwxyz"];", 
                  sOutput:"var foo = "abcdefghijklmnopqrstuvwxyz";" + "(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"Preservation of identifiers in an expression statement.", 
                  sInput:"void [typeof abcdefghijklmnopqrstuvwxyz," + "      typeof abcdefghijklmnopqrstuvwxyz];"               }
,  {
                  sTitle:"Preservation of identifiers in the variable declaration list of " + "a for statement.", 
                  sInput:"for (var abcdefghijklmnopqrstuvwxyz; 0 === Math.random(););" + "for (var abcdefghijklmnopqrstuvwxyz; 0 === Math.random(););"               }
,  {
                  sTitle:"Preservation of identifiers in the variable declaration list of " + "a for-in statement.", 
                  sInput:"for (var abcdefghijklmnopqrstuvwxyz in {});" + "for (var abcdefghijklmnopqrstuvwxyz in {});"               }
,  {
                  sTitle:"Preservation of the identifier in a continue statement.", 
                  sInput:"abcdefghijklmnopqrstuvwxyz: for (; 0 === Math.random();) {" + "  continue abcdefghijklmnopqrstuvwxyz;" + "}" + "abcdefghijklmnopqrstuvwxyz: for (; 0 === Math.random();) {" + "  continue abcdefghijklmnopqrstuvwxyz;" + "}"               }
,  {
                  sTitle:"Preservation of the identifier in a break statement.", 
                  sInput:"abcdefghijklmnopqrstuvwxyz: for (; 0 === Math.random();) {" + "  break abcdefghijklmnopqrstuvwxyz;" + "}" + "abcdefghijklmnopqrstuvwxyz: for (; 0 === Math.random();) {" + "  break abcdefghijklmnopqrstuvwxyz;" + "}"               }
,  {
                  sTitle:"Exclusion of a return statement in function code that contains " + "a with statement.", 
                  sInput:"(function() {" + "  with ({});" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "  if (0 === Math.random()) {" + "    return;" + "  } else {" + "  }" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "}());"               }
,  {
                  sTitle:"Exclusion of a return statement in function code that contains " + "a direct call to the eval function.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  eval("");" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "  if (0 === Math.random()) {" + "    return;" + "  } else {" + "  }" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "}());"               }
,  {
                  sTitle:"Consolidation within a return statement excluded in function " + "code due to the presence of a with statement.", 
                  sInput:"(function() {" + "  with ({});" + "  return function() {" + "    void ["abcdefghijklmnopqrstuvwxyz"," + "          "abcdefghijklmnopqrstuvwxyz"];" + "  };" + "}());", 
                  sOutput:"(function() {" + "  with ({});" + "  return function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  };" + "}());"               }
,  {
                  sTitle:"Consolidation within a return statement excluded in function " + "code due to the presence of a direct call to the eval function.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  eval("");" + "  return function() {" + "    void ["abcdefghijklmnopqrstuvwxyz"," + "          "abcdefghijklmnopqrstuvwxyz"];" + "  };" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  eval("");" + "  return function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  };" + "}());"               }
,  {
                  sTitle:"Inclusion of a return statement in function code that contains " + "no with statement and no direct call to the eval function.", 
                  sInput:"(function() {" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "  if (0 === Math.random()) {" + "    return;" + "  } else {" + "  }" + "  void ["abcdefghijklmnopqrstuvwxyz"];" + "}());", 
                  sOutput:"(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a];" + "  if (0 === Math.random()) {" + "    return;" + "  } else {" + "  }" + "  void [a];" + "}());"               }
,  {
                  sTitle:"Preservation of the statement in a with statement.", 
                  sInput:"with ({}) {" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}"               }
,  {
                  sTitle:"Exclusion of a with statement in the same syntactic code unit.", 
                  sInput:"void ["abcdefghijklmnopqrstuvwxyz"];" + "with ({" + "  foo: "abcdefghijklmnopqrstuvwxyz"," + "  bar: "abcdefghijklmnopqrstuvwxyz"" + "}) {" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}" + "void ["abcdefghijklmnopqrstuvwxyz"];"               }
,  {
                  sTitle:"Exclusion of a with statement in nested function code.", 
                  sInput:"void ["abcdefghijklmnopqrstuvwxyz"];" + "(function() {" + "  with ({" + "    foo: "abcdefghijklmnopqrstuvwxyz"," + "    bar: "abcdefghijklmnopqrstuvwxyz"" + "  }) {" + "    void ["abcdefghijklmnopqrstuvwxyz"," + "          "abcdefghijklmnopqrstuvwxyz"];" + "  }" + "}());" + "void ["abcdefghijklmnopqrstuvwxyz"];"               }
,  {
                  sTitle:"Preservation of the label of a labelled statement.", 
                  sInput:"abcdefghijklmnopqrstuvwxyz: for (; 0 === Math.random(););" + "abcdefghijklmnopqrstuvwxyz: for (; 0 === Math.random(););"               }
,  {
                  sTitle:"Preservation of the identifier in the catch clause of a try" + "statement.", 
                  sInput:"try {" + "} catch (abcdefghijklmnopqrstuvwxyz) {" + "} finally {" + "}" + "try {" + "} catch (abcdefghijklmnopqrstuvwxyz) {" + "} finally {" + "}"               }
,  {
                  sTitle:"Preservation of the identifier of a function declaration.", 
                  sInput:"function abcdefghijklmnopqrstuvwxyz() {" + "}" + "void [abcdefghijklmnopqrstuvwxyz];"               }
,  {
                  sTitle:"Preservation of the identifier of a function expression.", 
                  sInput:"void [" + "  function abcdefghijklmnopqrstuvwxyz() {" + "  }," + "  function abcdefghijklmnopqrstuvwxyz() {" + "  }" + "];"               }
,  {
                  sTitle:"Preservation of a formal parameter of a function declaration.", 
                  sInput:"function foo(abcdefghijklmnopqrstuvwxyz) {" + "}" + "function bar(abcdefghijklmnopqrstuvwxyz) {" + "}"               }
,  {
                  sTitle:"Preservation of a formal parameter in a function expression.", 
                  sInput:"void [" + "  function(abcdefghijklmnopqrstuvwxyz) {" + "  }," + "  function(abcdefghijklmnopqrstuvwxyz) {" + "  }" + "];"               }
,  {
                  sTitle:"Exclusion of a function declaration.", 
                  sInput:"void ["abcdefghijklmnopqrstuvwxyz"];" + "function foo() {" + "}" + "void ["abcdefghijklmnopqrstuvwxyz"];"               }
,  {
                  sTitle:"Consolidation within a function declaration.", 
                  sInput:"function foo() {" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}", 
                  sOutput:"function foo() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}"               }
,  {
                  sTitle:"Preservation of a program without source elements.", 
                  sInput:""               }
,  {
                  sTitle:"Preservation of a Directive Prologue in global code.", 
                  sInput:""abcdefghijklmnopqrstuvwxyz";" + "'zyxwvutsrqponmlkjihgfedcba';"               }
,  {
                  sTitle:"Preservation of a Directive Prologue in a function declaration.", 
                  sInput:"function foo() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  'zyxwvutsrqponmlkjihgfedcba';" + "}"               }
,  {
                  sTitle:"Preservation of a Directive Prologue in a function expression.", 
                  sInput:"void [" + "  function() {" + "    "abcdefghijklmnopqrstuvwxyz";" + "    'zyxwvutsrqponmlkjihgfedcba';" + "  }" + "];"               }
,  {
                  sTitle:"Ignorance with regard to a Directive Prologue in global code.", 
                  sInput:""abcdefghijklmnopqrstuvwxyz";" + "void ["abcdefghijklmnopqrstuvwxyz"," + "      "abcdefghijklmnopqrstuvwxyz"];", 
                  sOutput:""abcdefghijklmnopqrstuvwxyz";" + "(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"Ignorance with regard to a Directive Prologue in a function" + "declaration.", 
                  sInput:"function foo() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}", 
                  sOutput:"function foo() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}"               }
,  {
                  sTitle:"Ignorance with regard to a Directive Prologue in a function" + "expression.", 
                  sInput:"(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}());", 
                  sOutput:"(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"Preservation of a property of the global object.", 
                  sInput:"void [undefined, undefined, undefined, undefined, undefined];"               }
,  {
                  sTitle:"Exclusion of a direct call to the eval function in the same " + "syntactic code unit.", 
                  sInput:"/*jshint evil:true */" + "void ["abcdefghijklmnopqrstuvwxyz"];" + "eval("");" + "void ["abcdefghijklmnopqrstuvwxyz"];"               }
,  {
                  sTitle:"Exclusion of a direct call to the eval function in nested " + "function code.", 
                  sInput:"/*jshint evil:true */" + "void ["abcdefghijklmnopqrstuvwxyz"];" + "(function() {" + "  eval("");" + "}());" + "void ["abcdefghijklmnopqrstuvwxyz"];"               }
,  {
                  sTitle:"Consolidation within a direct call to the eval function.", 
                  sInput:"/*jshint evil:true */" + "eval(function() {" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}());", 
                  sOutput:"/*jshint evil:true */" + "eval(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"No consolidation if it does not result in a reduction of the " + "number of source characters.", 
                  sInput:"(function() {" + "  var foo;" + "  void ["ab", "ab", "abc", "abc"];" + "}());"               }
,  {
                  sTitle:"Identification of a range of source elements at the beginning " + "of global code.", 
                  sInput:"/*jshint evil:true */" + ""abcdefghijklmnopqrstuvwxyz";" + "void ["abcdefghijklmnopqrstuvwxyz"," + "      "abcdefghijklmnopqrstuvwxyz"];" + "eval("");", 
                  sOutput:"/*jshint evil:true */" + ""abcdefghijklmnopqrstuvwxyz";" + "(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());" + "eval("");"               }
,  {
                  sTitle:"Identification of a range of source elements in the middle of " + "global code.", 
                  sInput:"/*jshint evil:true */" + ""abcdefghijklmnopqrstuvwxyz";" + "eval("");" + "void ["abcdefghijklmnopqrstuvwxyz"," + "      "abcdefghijklmnopqrstuvwxyz"];" + "eval("");", 
                  sOutput:"/*jshint evil:true */" + ""abcdefghijklmnopqrstuvwxyz";" + "eval("");" + "(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());" + "eval("");"               }
,  {
                  sTitle:"Identification of a range of source elements at the end of " + "global code.", 
                  sInput:"/*jshint evil:true */" + ""abcdefghijklmnopqrstuvwxyz";" + "eval("");" + "void ["abcdefghijklmnopqrstuvwxyz"," + "      "abcdefghijklmnopqrstuvwxyz"];", 
                  sOutput:"/*jshint evil:true */" + ""abcdefghijklmnopqrstuvwxyz";" + "eval("");" + "(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"Identification of a range of source elements at the beginning " + "of function code.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "  eval("");" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  (function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  }());" + "  eval("");" + "}());"               }
,  {
                  sTitle:"Identification of a range of source elements in the middle of " + "function code.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  eval("");" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "  eval("");" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  eval("");" + "  (function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  }());" + "  eval("");" + "}());"               }
,  {
                  sTitle:"Identification of a range of source elements at the end of " + "function code.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  eval("");" + "  void ["abcdefghijklmnopqrstuvwxyz"," + "        "abcdefghijklmnopqrstuvwxyz"];" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  "abcdefghijklmnopqrstuvwxyz";" + "  eval("");" + "  (function() {" + "    var a = "abcdefghijklmnopqrstuvwxyz";" + "    void [a, a];" + "  }());" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to String values of String literals and " + "String values derived from identifier names used as property" + "accessors.", 
                  sInput:"(function() {" + "  var foo;" + "  void ["abcdefg", Math.abcdefg, "abcdef", Math.abcdef];" + "}());", 
                  sOutput:"(function() {" + "  var a = "abcdefg", foo;" + "  void [a, Math[a], "abcdef", Math.abcdef];" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to the necessity of adding a variable " + "statement.", 
                  sInput:"/*jshint evil:true */" + "(function() {" + "  void ["abcdefgh", "abcdefgh"];" + "}());" + "eval("");" + "(function() {" + "  void ["abcdefg", "abcdefg"];" + "}());" + "eval("");" + "(function() {" + "  var foo;" + "  void ["abcd", "abcd"];" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  var a = "abcdefgh";" + "  void [a, a];" + "}());" + "eval("");" + "(function() {" + "  void ["abcdefg", "abcdefg"];" + "}());" + "eval("");" + "(function() {" + "  var a = "abcd", foo;" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"Evaluation with regard to the necessity of enclosing source " + "elements.", 
                  sInput:"/*jshint evil:true */" + "void ["abcdefghijklmnopqrstuvwxy", "abcdefghijklmnopqrstuvwxy"];" + "eval("");" + "void ["abcdefghijklmnopqrstuvwx", "abcdefghijklmnopqrstuvwx"];" + "eval("");" + "(function() {" + "  void ["abcdefgh", "abcdefgh"];" + "}());" + "(function() {" + "  void ["abcdefghijklmnopqrstuvwxy"," + "        "abcdefghijklmnopqrstuvwxy"];" + "  eval("");" + "  void ["abcdefghijklmnopqrstuvwx"," + "        "abcdefghijklmnopqrstuvwx"];" + "  eval("");" + "  (function() {" + "    void ["abcdefgh", "abcdefgh"];" + "  }());" + "}());", 
                  sOutput:"/*jshint evil:true */" + "(function() {" + "  var a = "abcdefghijklmnopqrstuvwxy";" + "  void [a, a];" + "}());" + "eval("");" + "void ["abcdefghijklmnopqrstuvwx", "abcdefghijklmnopqrstuvwx"];" + "eval("");" + "(function() {" + "  var a = "abcdefgh";" + "  void [a, a];" + "}());" + "(function() {" + "  (function() {" + "    var a = "abcdefghijklmnopqrstuvwxy";" + "    void [a, a];" + "  }());" + "  eval("");" + "  void ["abcdefghijklmnopqrstuvwx", "abcdefghijklmnopqrstuvwx"];" + "  eval("");" + "  (function() {" + "    var a = "abcdefgh";" + "    void [a, a];" + "  }());" + "}());"               }
,  {
                  sTitle:"Employment of a closure while consolidating in global code.", 
                  sInput:"void ["abcdefghijklmnopqrstuvwxyz"," + "      "abcdefghijklmnopqrstuvwxyz"];", 
                  sOutput:"(function() {" + "  var a = "abcdefghijklmnopqrstuvwxyz";" + "  void [a, a];" + "}());"               }
,  {
                  sTitle:"Assignment of a shorter identifier to a value whose " + "consolidation results in a greater reduction of the number of " + "source characters.", 
                  sInput:"(function() {" + "  var b, c, d, e, f, g, h, i, j, k, l, m," + "      n, o, p, q, r, s, t, u, v, w, x, y, z," + "      A, B, C, D, E, F, G, H, I, J, K, L, M," + "      N, O, P, Q, R, S, T, U, V, W, X, Y, Z," + "      $, _;" + "  void ["abcde", "abcde", "edcba", "edcba", "edcba"];" + "}());", 
                  sOutput:"(function() {" + "  var a = "edcba"," + "      b, c, d, e, f, g, h, i, j, k, l, m," + "      n, o, p, q, r, s, t, u, v, w, x, y, z," + "      A, B, C, D, E, F, G, H, I, J, K, L, M," + "      N, O, P, Q, R, S, T, U, V, W, X, Y, Z," + "      $, _;" + "  void ["abcde", "abcde", a, a, a];" + "}());"               }
].forEach(cAssert);
            }
();
         }
      }
   );
   define("uglifyjs/parse-js", ["exports"], function(exports)  {
         var KEYWORDS = array_to_hash(["break", "case", "catch", "const", "continue", "debugger", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "throw", "try", "typeof", "var", "void", "while", "with"]);
         var RESERVED_WORDS = array_to_hash(["abstract", "boolean", "byte", "char", "class", "double", "enum", "export", "extends", "final", "float", "goto", "implements", "import", "int", "interface", "long", "native", "package", "private", "protected", "public", "short", "static", "super", "synchronized", "throws", "transient", "volatile"]);
         var KEYWORDS_BEFORE_EXPRESSION = array_to_hash(["return", "new", "delete", "throw", "else", "case"]);
         var KEYWORDS_ATOM = array_to_hash(["false", "null", "true", "undefined"]);
         var OPERATOR_CHARS = array_to_hash(characters("+-*&%=<>!?|~^"));
         var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
         var RE_OCT_NUMBER = /^0[0-7]+$/;
         var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;
         var OPERATORS = array_to_hash(["in", "instanceof", "typeof", "new", "void", "delete", "++", "--", "+", "-", "!", "~", "&", "|", "^", "*", "/", "%", ">>", "<<", ">>>", "<", ">", "<=", ">=", "==", "===", "!=", "!==", "?", "=", "+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&=", "&&", "||"]);
         var WHITESPACE_CHARS = array_to_hash(characters("  
	​᠎             　"));
         var PUNC_BEFORE_EXPRESSION = array_to_hash(characters("[{(,.;:"));
         var PUNC_CHARS = array_to_hash(characters("[]{}(),;:"));
         var REGEXP_MODIFIERS = array_to_hash(characters("gmsiy"));
         var UNICODE =  {
            letter:new RegExp("[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0621-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971\u0972\u097B-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3D\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC\u0EDD\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8B\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10D0-\u10FA\u10FC\u1100-\u1159\u115F-\u11A2\u11A8-\u11F9\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u1676\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19A9\u19C1-\u19C7\u1A00-\u1A16\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u2094\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C6F\u2C71-\u2C7D\u2C80-\u2CE4\u2D00-\u2D25\u2D30-\u2D65\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31B7\u31F0-\u31FF\u3400\u4DB5\u4E00\u9FC3\uA000-\uA48C\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA65F\uA662-\uA66E\uA67F-\uA697\uA717-\uA71F\uA722-\uA788\uA78B\uA78C\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA90A-\uA925\uA930-\uA946\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAC00\uD7A3\uF900-\uFA2D\uFA30-\uFA6A\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]"), 
            non_spacing_mark:new RegExp("[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065E\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0900-\u0902\u093C\u0941-\u0948\u094D\u0951-\u0955\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1DC0-\u1DE6\u1DFD-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]"), 
            space_combining_mark:new RegExp("[\u0903\u093E-\u0940\u0949-\u094C\u094E\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u19B0-\u19C0\u19C8\u19C9\u1A19-\u1A1B\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF2\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC]"), 
            connector_punctuation:new RegExp("[\u005F\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F]")         }
;
         function is_letter(ch)  {
            return UNICODE.letter.test(ch);
         }
;
         ;
         function is_digit(ch)  {
            ch = ch.charCodeAt(0);
            return ch >= 48 && ch <= 57;
         }
;
         ;
         function is_alphanumeric_char(ch)  {
            return is_digit(ch) || is_letter(ch);
         }
;
         ;
         function is_unicode_combining_mark(ch)  {
            return UNICODE.non_spacing_mark.test(ch) || UNICODE.space_combining_mark.test(ch);
         }
;
         ;
         function is_unicode_connector_punctuation(ch)  {
            return UNICODE.connector_punctuation.test(ch);
         }
;
         ;
         function is_identifier_start(ch)  {
            return ch == "$" || ch == "_" || is_letter(ch);
         }
;
         ;
         function is_identifier_char(ch)  {
            return is_identifier_start(ch) || is_unicode_combining_mark(ch) || is_digit(ch) || is_unicode_connector_punctuation(ch) || ch == "‌" || ch == "‍";
         }
;
         ;
         function parse_js_number(num)  {
            if (RE_HEX_NUMBER.test(num))  {
               return parseInt(num.substr(2), 16);
            }
             else if (RE_OCT_NUMBER.test(num))  {
               return parseInt(num.substr(1), 8);
            }
             else if (RE_DEC_NUMBER.test(num))  {
               return parseFloat(num);
            }
         }
;
         ;
         function JS_Parse_Error(message, line, col, pos)  {
            this.message = message;
            this.line = line + 1;
            this.col = col + 1;
            this.pos = pos + 1;
            this.stack = new Error().stack;
         }
;
         ;
         JS_Parse_Error.prototype.toString = function()  {
            return this.message + " (line: " + this.line + ", col: " + this.col + ", pos: " + this.pos + ")" + "

" + this.stack;
         }
;
         function js_error(message, line, col, pos)  {
            throw new JS_Parse_Error(message, line, col, pos);
         }
;
         ;
         function is_token(token, type, val)  {
            return token.type == type && val == null || token.value == val;
         }
;
         ;
         var EX_EOF =  {} ;
         function tokenizer($TEXT)  {
            var S =  {
               text:$TEXT.replace(/\r\n?|[\n\u2028\u2029]/g, "
").replace(/^\uFEFF/, ""), 
               pos:0, 
               tokpos:0, 
               line:0, 
               tokline:0, 
               col:0, 
               tokcol:0, 
               newline_before:false, 
               regex_allowed:false, 
               comments_before:[]            }
;
            function peek()  {
               return S.text.charAt(S.pos);
            }
;
            ;
            function next(signal_eof, in_string)  {
               var ch = S.text.charAt(S.pos++);
               if (signal_eof && ! ch) throw EX_EOF               if (ch == "
")  {
                  S.newline_before = S.newline_before || ! in_string;
                  ++S.line;
                  S.col = 0;
               }
                else  {
                  ++S.col;
               }
               return ch;
            }
;
            ;
            function eof()  {
               return ! S.peek();
            }
;
            ;
            function find(what, signal_eof)  {
               var pos = S.text.indexOf(what, S.pos);
               if (signal_eof && pos == - 1) throw EX_EOF               return pos;
            }
;
            ;
            function start_token()  {
               S.tokline = S.line;
               S.tokcol = S.col;
               S.tokpos = S.pos;
            }
;
            ;
            function token(type, value, is_comment)  {
               S.regex_allowed = type == "operator" && ! HOP(UNARY_POSTFIX, value) || type == "keyword" && HOP(KEYWORDS_BEFORE_EXPRESSION, value) || type == "punc" && HOP(PUNC_BEFORE_EXPRESSION, value);
               var ret =  {
                  type:type, 
                  value:value, 
                  line:S.tokline, 
                  col:S.tokcol, 
                  pos:S.tokpos, 
                  endpos:S.pos, 
                  nlb:S.newline_before               }
;
               if (! is_comment)  {
                  ret.comments_before = S.comments_before;
                  S.comments_before = [];
               }
               S.newline_before = false;
               return ret;
            }
;
            ;
            function skip_whitespace()  {
               while (HOP(WHITESPACE_CHARS, peek())) next()            }
;
            ;
            function read_while(pred)  {
               var ret = "", ch = peek(), i = 0;
               while (ch && pred(ch, i++))  {
                     ret = next();
                     ch = peek();
                  }
               return ret;
            }
;
            ;
            function parse_error(err)  {
               js_error(err, S.tokline, S.tokcol, S.tokpos);
            }
;
            ;
            function read_num(prefix)  {
               var has_e = false, after_e = false, has_x = false, has_dot = prefix == ".";
               var num = read_while(function(ch, i)  {
                     if (ch == "x" || ch == "X")  {
                        if (has_x) return false                        return has_x = true;
                     }
                     if (! has_x && ch == "E" || ch == "e")  {
                        if (has_e) return false                        return has_e = after_e = true;
                     }
                     if (ch == "-")  {
                        if (after_e || i == 0 && ! prefix) return true                        return false;
                     }
                     if (ch == "+") return after_e                     after_e = false;
                     if (ch == ".")  {
                        if (! has_dot && ! has_x) return has_dot = true                        return false;
                     }
                     return is_alphanumeric_char(ch);
                  }
               );
               if (prefix) num = prefix + num               var valid = parse_js_number(num);
               if (! isNaN(valid))  {
                  return token("num", valid);
               }
                else  {
                  parse_error("Invalid syntax: " + num);
               }
            }
;
            ;
            function read_escaped_char(in_string)  {
               var ch = next(true, in_string);
               switch(ch) {
                  case "n":
 
                        return "
";
                     
                  case "r":
 
                        return "";
                     
                  case "t":
 
                        return "	";
                     
                  case "b":
 
                        return "";
                     
                  case "v":
 
                        return "";
                     
                  case "f":
 
                        return "";
                     
                  case "0":
 
                        return "";
                     
                  case "x":
 
                        return String.fromCharCode(hex_bytes(2));
                     
                  case "u":
 
                        return String.fromCharCode(hex_bytes(4));
                     
                  case "
":
 
                        return "";
                     
                  default:
 
                        return ch;
                     
}
;
            }
;
            ;
            function hex_bytes(n)  {
               var num = 0;
               for (; n > 0; --n)  {
                     var digit = parseInt(next(true), 16);
                     if (isNaN(digit)) parse_error("Invalid hex-character pattern in string")                     num = num << 4 | digit;
                  }
               return num;
            }
;
            ;
            function read_string()  {
               return with_eof_error("Unterminated string constant", function()  {
                     var quote = next(), ret = "";
                     for (; ; )  {
                           var ch = next(true);
                           if (ch == "\")  {
                              var octal_len = 0, first = null;
                              ch = read_while(function(ch)  {
                                    if (ch >= "0" && ch <= "7")  {
                                       if (! first)  {
                                          first = ch;
                                          return ++octal_len;
                                       }
                                        else if (first <= "3" && octal_len <= 2) return ++octal_len                                        else if (first >= "4" && octal_len <= 1) return ++octal_len                                    }
                                    return false;
                                 }
                              );
                              if (octal_len > 0) ch = String.fromCharCode(parseInt(ch, 8))                               else ch = read_escaped_char(true)                           }
                            else if (ch == quote) break                           ret = ch;
                        }
                     return token("string", ret);
                  }
               );
            }
;
            ;
            function read_line_comment()  {
               next();
               var i = find("
"), ret;
               if (i == - 1)  {
                  ret = S.text.substr(S.pos);
                  S.pos = S.text.length;
               }
                else  {
                  ret = S.text.substring(S.pos, i);
                  S.pos = i;
               }
               return token("comment1", ret, true);
            }
;
            ;
            function read_multiline_comment()  {
               next();
               return with_eof_error("Unterminated multiline comment", function()  {
                     var i = find("*/", true), text = S.text.substring(S.pos, i);
                     S.pos = i + 2;
                     S.line = text.split("
").length - 1;
                     S.newline_before = text.indexOf("
") >= 0;
                     if (/^@cc_on/i.test(text))  {
                        warn("WARNING: at line " + S.line);
                        warn("*** Found "conditional comment": " + text);
                        warn("*** UglifyJS DISCARDS ALL COMMENTS.  This means your code might no longer work properly in Internet Explorer.");
                     }
                     return token("comment2", text, true);
                  }
               );
            }
;
            ;
            function read_name()  {
               var backslash = false, name = "", ch, escaped = false, hex;
               while (ch = peek() != null)  {
                     if (! backslash)  {
                        if (ch == "\") escaped = backslash = true, next()                         else if (is_identifier_char(ch)) name = next()                         else break                     }
                      else  {
                        if (ch != "u") parse_error("Expecting UnicodeEscapeSequence -- uXXXX")                        ch = read_escaped_char();
                        if (! is_identifier_char(ch)) parse_error("Unicode char: " + ch.charCodeAt(0) + " is not valid in identifier")                        name = ch;
                        backslash = false;
                     }
                  }
               if (HOP(KEYWORDS, name) && escaped)  {
                  hex = name.charCodeAt(0).toString(16).toUpperCase();
                  name = "\u" + "0000".substr(hex.length) + hex + name.slice(1);
               }
               return name;
            }
;
            ;
            function read_regexp(regexp)  {
               return with_eof_error("Unterminated regular expression", function()  {
                     var prev_backslash = false, ch, in_class = false;
                     while (ch = next(true)) if (prev_backslash)  {
                           regexp = "\" + ch;
                           prev_backslash = false;
                        }
                         else if (ch == "[")  {
                           in_class = true;
                           regexp = ch;
                        }
                         else if (ch == "]" && in_class)  {
                           in_class = false;
                           regexp = ch;
                        }
                         else if (ch == "/" && ! in_class)  {
                           break;
                        }
                         else if (ch == "\")  {
                           prev_backslash = true;
                        }
                         else  {
                           regexp = ch;
                        }
                     var mods = read_name();
                     return token("regexp", [regexp, mods]);
                  }
               );
            }
;
            ;
            function read_operator(prefix)  {
               function grow(op)  {
                  if (! peek()) return op                  var bigger = op + peek();
                  if (HOP(OPERATORS, bigger))  {
                     next();
                     return grow(bigger);
                  }
                   else  {
                     return op;
                  }
               }
;
               ;
               return token("operator", grow(prefix || next()));
            }
;
            ;
            function handle_slash()  {
               next();
               var regex_allowed = S.regex_allowed;
               switch(peek()) {
                  case "/":
 
                        S.comments_before.push(read_line_comment());
                        S.regex_allowed = regex_allowed;
                        return next_token();
                     
                  case "*":
 
                        S.comments_before.push(read_multiline_comment());
                        S.regex_allowed = regex_allowed;
                        return next_token();
                     
}
;
               return S.regex_allowed ? read_regexp("") : read_operator("/");
            }
;
            ;
            function handle_dot()  {
               next();
               return is_digit(peek()) ? read_num(".") : token("punc", ".");
            }
;
            ;
            function read_word()  {
               var word = read_name();
               return ! HOP(KEYWORDS, word) ? token("name", word) : HOP(OPERATORS, word) ? token("operator", word) : HOP(KEYWORDS_ATOM, word) ? token("atom", word) : token("keyword", word);
            }
;
            ;
            function with_eof_error(eof_error, cont)  {
               try {
                  return cont();
               }
               catch (ex) {
                  if (ex === EX_EOF) parse_error(eof_error)                   else throw ex               }
            }
;
            ;
            function next_token(force_regexp)  {
               if (force_regexp != null) return read_regexp(force_regexp)               skip_whitespace();
               start_token();
               var ch = peek();
               if (! ch) return token("eof")               if (is_digit(ch)) return read_num()               if (ch == """ || ch == "'") return read_string()               if (HOP(PUNC_CHARS, ch)) return token("punc", next())               if (ch == ".") return handle_dot()               if (ch == "/") return handle_slash()               if (HOP(OPERATOR_CHARS, ch)) return read_operator()               if (ch == "\" || is_identifier_start(ch)) return read_word()               parse_error("Unexpected character '" + ch + "'");
            }
;
            ;
            next_token.context = function(nc)  {
               if (nc) S = nc               return S;
            }
;
            return next_token;
         }
;
         ;
         var UNARY_PREFIX = array_to_hash(["typeof", "void", "delete", "--", "++", "!", "~", "-", "+"]);
         var UNARY_POSTFIX = array_to_hash(["--", "++"]);
         var ASSIGNMENT = function(a, ret, i)  {
            while (i < a.length)  {
                  ret[a[i]] = a[i].substr(0, a[i].length - 1);
                  i++;
               }
            return ret;
         }
(["+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&="],  {
               =:true            }, 
            0);
         var PRECEDENCE = function(a, ret)  {
            for (var i = 0, n = 1; i < a.length; ++i, ++n)  {
                  var b = a[i];
                  for (var j = 0; j < b.length; ++j)  {
                        ret[b[j]] = n;
                     }
               }
            return ret;
         }
([["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"]],  {} );
         var STATEMENTS_WITH_LABELS = array_to_hash(["for", "do", "while", "switch"]);
         var ATOMIC_START_TOKEN = array_to_hash(["atom", "num", "string", "regexp", "name"]);
         function NodeWithToken(str, start, end)  {
            this.name = str;
            this.start = start;
            this.end = end;
         }
;
         ;
         NodeWithToken.prototype.toString = function()  {
            return this.name;
         }
;
         function parse($TEXT, exigent_mode, embed_tokens)  {
            var S =  {
               input:typeof $TEXT == "string" ? tokenizer($TEXT, true) : $TEXT, 
               token:null, 
               prev:null, 
               peeked:null, 
               in_function:0, 
               in_loop:0, 
               labels:[]            }
;
            S.token = next();
            function is(type, value)  {
               return is_token(S.token, type, value);
            }
;
            ;
            function peek()  {
               return S.peeked || S.peeked = S.input();
            }
;
            ;
            function next()  {
               S.prev = S.token;
               if (S.peeked)  {
                  S.token = S.peeked;
                  S.peeked = null;
               }
                else  {
                  S.token = S.input();
               }
               return S.token;
            }
;
            ;
            function prev()  {
               return S.prev;
            }
;
            ;
            function croak(msg, line, col, pos)  {
               var ctx = S.input.context();
               js_error(msg, line != null ? line : ctx.tokline, col != null ? col : ctx.tokcol, pos != null ? pos : ctx.tokpos);
            }
;
            ;
            function token_error(token, msg)  {
               croak(msg, token.line, token.col);
            }
;
            ;
            function unexpected(token)  {
               if (token == null) token = S.token               token_error(token, "Unexpected token: " + token.type + " (" + token.value + ")");
            }
;
            ;
            function expect_token(type, val)  {
               if (is(type, val))  {
                  return next();
               }
               token_error(S.token, "Unexpected token " + S.token.type + ", expected " + type);
            }
;
            ;
            function expect(punc)  {
               return expect_token("punc", punc);
            }
;
            ;
            function can_insert_semicolon()  {
               return ! exigent_mode && S.token.nlb || is("eof") || is("punc", "}");
            }
;
            ;
            function semicolon()  {
               if (is("punc", ";")) next()                else if (! can_insert_semicolon()) unexpected()            }
;
            ;
            function as()  {
               return slice(arguments);
            }
;
            ;
            function parenthesised()  {
               expect("(");
               var ex = expression();
               expect(")");
               return ex;
            }
;
            ;
            function add_tokens(str, start, end)  {
               return str instanceof NodeWithToken ? str : new NodeWithToken(str, start, end);
            }
;
            ;
            function maybe_embed_tokens(parser)  {
               if (embed_tokens) return function()  {
                  var start = S.token;
                  var ast = parser.apply(this, arguments);
                  ast[0] = add_tokens(ast[0], start, prev());
                  return ast;
               }
                else return parser            }
;
            ;
            var statement = maybe_embed_tokens(function()  {
                  if (is("operator", "/") || is("operator", "/="))  {
                     S.peeked = null;
                     S.token = S.input(S.token.value.substr(1));
                  }
                  switch(S.token.type) {
                     case "num":
 
                        
                     case "string":
 
                        
                     case "regexp":
 
                        
                     case "operator":
 
                        
                     case "atom":
 
                           return simple_statement();
                        
                     case "name":
 
                           return is_token(peek(), "punc", ":") ? labeled_statement(prog1(S.token.value, next, next)) : simple_statement();
                        
                     case "punc":
 
                           switch(S.token.value) {
                              case "{":
 
                                    return as("block", block_());
                                 
                              case "[":
 
                                 
                              case "(":
 
                                    return simple_statement();
                                 
                              case ";":
 
                                    next();
                                    return as("block");
                                 
                              default:
 
                                    unexpected();
                                 
}
;
                        
                     case "keyword":
 
                           switch(prog1(S.token.value, next)) {
                              case "break":
 
                                    return break_cont("break");
                                 
                              case "continue":
 
                                    return break_cont("continue");
                                 
                              case "debugger":
 
                                    semicolon();
                                    return as("debugger");
                                 
                              case "do":
 
                                    return function(body)  {
                                       expect_token("keyword", "while");
                                       return as("do", prog1(parenthesised, semicolon), body);
                                    }
(in_loop(statement));
                                 
                              case "for":
 
                                    return for_();
                                 
                              case "function":
 
                                    return function_(true);
                                 
                              case "if":
 
                                    return if_();
                                 
                              case "return":
 
                                    if (S.in_function == 0) croak("'return' outside of function")                                    return as("return", is("punc", ";") ? next(), null : can_insert_semicolon() ? null : prog1(expression, semicolon));
                                 
                              case "switch":
 
                                    return as("switch", parenthesised(), switch_block_());
                                 
                              case "throw":
 
                                    if (S.token.nlb) croak("Illegal newline after 'throw'")                                    return as("throw", prog1(expression, semicolon));
                                 
                              case "try":
 
                                    return try_();
                                 
                              case "var":
 
                                    return prog1(var_, semicolon);
                                 
                              case "const":
 
                                    return prog1(const_, semicolon);
                                 
                              case "while":
 
                                    return as("while", parenthesised(), in_loop(statement));
                                 
                              case "with":
 
                                    return as("with", parenthesised(), statement());
                                 
                              default:
 
                                    unexpected();
                                 
}
;
                        
}
;
               }
            );
            function labeled_statement(label)  {
               S.labels.push(label);
               var start = S.token, stat = statement();
               if (exigent_mode && ! HOP(STATEMENTS_WITH_LABELS, stat[0])) unexpected(start)               S.labels.pop();
               return as("label", label, stat);
            }
;
            ;
            function simple_statement()  {
               return as("stat", prog1(expression, semicolon));
            }
;
            ;
            function break_cont(type)  {
               var name;
               if (! can_insert_semicolon())  {
                  name = is("name") ? S.token.value : null;
               }
               if (name != null)  {
                  next();
                  if (! member(name, S.labels)) croak("Label " + name + " without matching loop or statement")               }
                else if (S.in_loop == 0) croak(type + " not inside a loop or switch")               semicolon();
               return as(type, name);
            }
;
            ;
            function for_()  {
               expect("(");
               var init = null;
               if (! is("punc", ";"))  {
                  init = is("keyword", "var") ? next(), var_(true) : expression(true, true);
                  if (is("operator", "in"))  {
                     if (init[0] == "var" && init[1].length > 1) croak("Only one variable declaration allowed in for..in loop")                     return for_in(init);
                  }
               }
               return regular_for(init);
            }
;
            ;
            function regular_for(init)  {
               expect(";");
               var test = is("punc", ";") ? null : expression();
               expect(";");
               var step = is("punc", ")") ? null : expression();
               expect(")");
               return as("for", init, test, step, in_loop(statement));
            }
;
            ;
            function for_in(init)  {
               var lhs = init[0] == "var" ? as("name", init[1][0]) : init;
               next();
               var obj = expression();
               expect(")");
               return as("for-in", init, lhs, obj, in_loop(statement));
            }
;
            ;
            var function_ = function(in_statement)  {
               var name = is("name") ? prog1(S.token.value, next) : null;
               if (in_statement && ! name) unexpected()               expect("(");
               return as(in_statement ? "defun" : "function", name, function(first, a)  {
                     while (! is("punc", ")"))  {
                           if (first) first = false                            else expect(",")                           if (! is("name")) unexpected()                           a.push(S.token.value);
                           next();
                        }
                     next();
                     return a;
                  }
(true, []), function()  {
                     ++S.in_function;
                     var loop = S.in_loop;
                     S.in_loop = 0;
                     var a = block_();
                     --S.in_function;
                     S.in_loop = loop;
                     return a;
                  }
());
            }
;
            function if_()  {
               var cond = parenthesised(), body = statement(), belse;
               if (is("keyword", "else"))  {
                  next();
                  belse = statement();
               }
               return as("if", cond, body, belse);
            }
;
            ;
            function block_()  {
               expect("{");
               var a = [];
               while (! is("punc", "}"))  {
                     if (is("eof")) unexpected()                     a.push(statement());
                  }
               next();
               return a;
            }
;
            ;
            var switch_block_ = curry(in_loop, function()  {
                  expect("{");
                  var a = [], cur = null;
                  while (! is("punc", "}"))  {
                        if (is("eof")) unexpected()                        if (is("keyword", "case"))  {
                           next();
                           cur = [];
                           a.push([expression(), cur]);
                           expect(":");
                        }
                         else if (is("keyword", "default"))  {
                           next();
                           expect(":");
                           cur = [];
                           a.push([null, cur]);
                        }
                         else  {
                           if (! cur) unexpected()                           cur.push(statement());
                        }
                     }
                  next();
                  return a;
               }
            );
            function try_()  {
               var body = block_(), bcatch, bfinally;
               if (is("keyword", "catch"))  {
                  next();
                  expect("(");
                  if (! is("name")) croak("Name expected")                  var name = S.token.value;
                  next();
                  expect(")");
                  bcatch = [name, block_()];
               }
               if (is("keyword", "finally"))  {
                  next();
                  bfinally = block_();
               }
               if (! bcatch && ! bfinally) croak("Missing catch/finally blocks")               return as("try", body, bcatch, bfinally);
            }
;
            ;
            function vardefs(no_in)  {
               var a = [];
               for (; ; )  {
                     if (! is("name")) unexpected()                     var name = S.token.value;
                     next();
                     if (is("operator", "="))  {
                        next();
                        a.push([name, expression(false, no_in)]);
                     }
                      else  {
                        a.push([name]);
                     }
                     if (! is("punc", ",")) break                     next();
                  }
               return a;
            }
;
            ;
            function var_(no_in)  {
               return as("var", vardefs(no_in));
            }
;
            ;
            function const_()  {
               return as("const", vardefs());
            }
;
            ;
            function new_()  {
               var newexp = expr_atom(false), args;
               if (is("punc", "("))  {
                  next();
                  args = expr_list(")");
               }
                else  {
                  args = [];
               }
               return subscripts(as("new", newexp, args), true);
            }
;
            ;
            var expr_atom = maybe_embed_tokens(function(allow_calls)  {
                  if (is("operator", "new"))  {
                     next();
                     return new_();
                  }
                  if (is("punc"))  {
                     switch(S.token.value) {
                        case "(":
 
                              next();
                              return subscripts(prog1(expression, curry(expect, ")")), allow_calls);
                           
                        case "[":
 
                              next();
                              return subscripts(array_(), allow_calls);
                           
                        case "{":
 
                              next();
                              return subscripts(object_(), allow_calls);
                           
}
;
                     unexpected();
                  }
                  if (is("keyword", "function"))  {
                     next();
                     return subscripts(function_(false), allow_calls);
                  }
                  if (HOP(ATOMIC_START_TOKEN, S.token.type))  {
                     var atom = S.token.type == "regexp" ? as("regexp", S.token.value[0], S.token.value[1]) : as(S.token.type, S.token.value);
                     return subscripts(prog1(atom, next), allow_calls);
                  }
                  unexpected();
               }
            );
            function expr_list(closing, allow_trailing_comma, allow_empty)  {
               var first = true, a = [];
               while (! is("punc", closing))  {
                     if (first) first = false                      else expect(",")                     if (allow_trailing_comma && is("punc", closing)) break                     if (is("punc", ",") && allow_empty)  {
                        a.push(["atom", "undefined"]);
                     }
                      else  {
                        a.push(expression(false));
                     }
                  }
               next();
               return a;
            }
;
            ;
            function array_()  {
               return as("array", expr_list("]", ! exigent_mode, true));
            }
;
            ;
            function object_()  {
               var first = true, a = [];
               while (! is("punc", "}"))  {
                     if (first) first = false                      else expect(",")                     if (! exigent_mode && is("punc", "}")) break                     var type = S.token.type;
                     var name = as_property_name();
                     if (type == "name" && name == "get" || name == "set" && ! is("punc", ":"))  {
                        a.push([as_name(), function_(false), name]);
                     }
                      else  {
                        expect(":");
                        a.push([name, expression(false)]);
                     }
                  }
               next();
               return as("object", a);
            }
;
            ;
            function as_property_name()  {
               switch(S.token.type) {
                  case "num":
 
                     
                  case "string":
 
                        return prog1(S.token.value, next);
                     
}
;
               return as_name();
            }
;
            ;
            function as_name()  {
               switch(S.token.type) {
                  case "name":
 
                     
                  case "operator":
 
                     
                  case "keyword":
 
                     
                  case "atom":
 
                        return prog1(S.token.value, next);
                     
                  default:
 
                        unexpected();
                     
}
;
            }
;
            ;
            function subscripts(expr, allow_calls)  {
               if (is("punc", "."))  {
                  next();
                  return subscripts(as("dot", expr, as_name()), allow_calls);
               }
               if (is("punc", "["))  {
                  next();
                  return subscripts(as("sub", expr, prog1(expression, curry(expect, "]"))), allow_calls);
               }
               if (allow_calls && is("punc", "("))  {
                  next();
                  return subscripts(as("call", expr, expr_list(")")), true);
               }
               return expr;
            }
;
            ;
            function maybe_unary(allow_calls)  {
               if (is("operator") && HOP(UNARY_PREFIX, S.token.value))  {
                  return make_unary("unary-prefix", prog1(S.token.value, next), maybe_unary(allow_calls));
               }
               var val = expr_atom(allow_calls);
               while (is("operator") && HOP(UNARY_POSTFIX, S.token.value) && ! S.token.nlb)  {
                     val = make_unary("unary-postfix", S.token.value, val);
                     next();
                  }
               return val;
            }
;
            ;
            function make_unary(tag, op, expr)  {
               if (op == "++" || op == "--" && ! is_assignable(expr)) croak("Invalid use of " + op + " operator")               return as(tag, op, expr);
            }
;
            ;
            function expr_op(left, min_prec, no_in)  {
               var op = is("operator") ? S.token.value : null;
               if (op && op == "in" && no_in) op = null               var prec = op != null ? PRECEDENCE[op] : null;
               if (prec != null && prec > min_prec)  {
                  next();
                  var right = expr_op(maybe_unary(true), prec, no_in);
                  return expr_op(as("binary", op, left, right), min_prec, no_in);
               }
               return left;
            }
;
            ;
            function expr_ops(no_in)  {
               return expr_op(maybe_unary(true), 0, no_in);
            }
;
            ;
            function maybe_conditional(no_in)  {
               var expr = expr_ops(no_in);
               if (is("operator", "?"))  {
                  next();
                  var yes = expression(false);
                  expect(":");
                  return as("conditional", expr, yes, expression(false, no_in));
               }
               return expr;
            }
;
            ;
            function is_assignable(expr)  {
               if (! exigent_mode) return true               switch(expr[0] + "") {
                  case "dot":
 
                     
                  case "sub":
 
                     
                  case "new":
 
                     
                  case "call":
 
                        return true;
                     
                  case "name":
 
                        return expr[1] != "this";
                     
}
;
            }
;
            ;
            function maybe_assign(no_in)  {
               var left = maybe_conditional(no_in), val = S.token.value;
               if (is("operator") && HOP(ASSIGNMENT, val))  {
                  if (is_assignable(left))  {
                     next();
                     return as("assign", ASSIGNMENT[val], left, maybe_assign(no_in));
                  }
                  croak("Invalid assignment");
               }
               return left;
            }
;
            ;
            var expression = maybe_embed_tokens(function(commas, no_in)  {
                  if (arguments.length == 0) commas = true                  var expr = maybe_assign(no_in);
                  if (commas && is("punc", ","))  {
                     next();
                     return as("seq", expr, expression(true, no_in));
                  }
                  return expr;
               }
            );
            function in_loop(cont)  {
               try {
                  ++S.in_loop;
                  return cont();
               }
finally  {
                     --S.in_loop;
                  }
            }
;
            ;
            return as("toplevel", function(a)  {
                  while (! is("eof")) a.push(statement())                  return a;
               }
([]));
         }
;
         ;
         function curry(f)  {
            var args = slice(arguments, 1);
            return function()  {
               return f.apply(this, args.concat(slice(arguments)));
            }
;
         }
;
         ;
         function prog1(ret)  {
            if (ret instanceof Function) ret = ret()            for (var i = 1, n = arguments.length; --n > 0; ++i) arguments[i]()            return ret;
         }
;
         ;
         function array_to_hash(a)  {
            var ret =  {} ;
            for (var i = 0; i < a.length; ++i) ret[a[i]] = true            return ret;
         }
;
         ;
         function slice(a, start)  {
            return Array.prototype.slice.call(a, start || 0);
         }
;
         ;
         function characters(str)  {
            return str.split("");
         }
;
         ;
         function member(name, array)  {
            for (var i = array.length; --i >= 0; ) if (array[i] == name) return true            return false;
         }
;
         ;
         function HOP(obj, prop)  {
            return Object.prototype.hasOwnProperty.call(obj, prop);
         }
;
         ;
         var warn = function()  {
         }
;
         exports.tokenizer = tokenizer;
         exports.parse = parse;
         exports.slice = slice;
         exports.curry = curry;
         exports.member = member;
         exports.array_to_hash = array_to_hash;
         exports.PRECEDENCE = PRECEDENCE;
         exports.KEYWORDS_ATOM = KEYWORDS_ATOM;
         exports.RESERVED_WORDS = RESERVED_WORDS;
         exports.KEYWORDS = KEYWORDS;
         exports.ATOMIC_START_TOKEN = ATOMIC_START_TOKEN;
         exports.OPERATORS = OPERATORS;
         exports.is_alphanumeric_char = is_alphanumeric_char;
         exports.set_logger = function(logger)  {
            warn = logger;
         }
;
      }
   );
   define("uglifyjs/squeeze-more", ["require", "exports", "module", "./parse-js", "./process"], function(require, exports, module)  {
         var jsp = require("./parse-js"), pro = require("./process"), slice = jsp.slice, member = jsp.member, curry = jsp.curry, MAP = pro.MAP, PRECEDENCE = jsp.PRECEDENCE, OPERATORS = jsp.OPERATORS;
         function ast_squeeze_more(ast)  {
            var w = pro.ast_walker(), walk = w.walk, scope;
            function with_scope(s, cont)  {
               var save = scope, ret;
               scope = s;
               ret = cont();
               scope = save;
               return ret;
            }
;
            ;
            function _lambda(name, args, body)  {
               return [this[0], name, args, with_scope(body.scope, curry(MAP, body, walk))];
            }
;
            ;
            return w.with_walkers( {
                  toplevel:function(body)  {
                     return [this[0], with_scope(this.scope, curry(MAP, body, walk))];
                  }, 
                  function:_lambda, 
                  defun:_lambda, 
                  new:function(ctor, args)  {
                     if (ctor[0] == "name")  {
                        if (ctor[1] == "Array" && ! scope.has("Array"))  {
                           if (args.length != 1)  {
                              return ["array", args];
                           }
                            else  {
                              return walk(["call", ["name", "Array"], args]);
                           }
                        }
                         else if (ctor[1] == "Object" && ! scope.has("Object"))  {
                           if (! args.length)  {
                              return ["object", []];
                           }
                            else  {
                              return walk(["call", ["name", "Object"], args]);
                           }
                        }
                         else if (ctor[1] == "RegExp" || ctor[1] == "Function" || ctor[1] == "Error" && ! scope.has(ctor[1]))  {
                           return walk(["call", ["name", ctor[1]], args]);
                        }
                     }
                  }, 
                  call:function(expr, args)  {
                     if (expr[0] == "dot" && expr[1][0] == "string" && args.length == 1 && args[0][1] > 0 && expr[2] == "substring" || expr[2] == "substr")  {
                        return ["call", ["dot", expr[1], "slice"], args];
                     }
                     if (expr[0] == "dot" && expr[2] == "toString" && args.length == 0)  {
                        return ["binary", "+", expr[1], ["string", ""]];
                     }
                     if (expr[0] == "name")  {
                        if (expr[1] == "Array" && args.length != 1 && ! scope.has("Array"))  {
                           return ["array", args];
                        }
                        if (expr[1] == "Object" && ! args.length && ! scope.has("Object"))  {
                           return ["object", []];
                        }
                        if (expr[1] == "String" && ! scope.has("String"))  {
                           return ["binary", "+", args[0], ["string", ""]];
                        }
                     }
                  }} , function()  {
                  return walk(pro.ast_add_scope(ast));
               }
            );
         }
;
         ;
         exports.ast_squeeze_more = ast_squeeze_more;
      }
   );
   define("uglifyjs/process", ["require", "exports", "module", "./parse-js", "./squeeze-more"], function(require, exports, module)  {
         var jsp = require("./parse-js"), slice = jsp.slice, member = jsp.member, PRECEDENCE = jsp.PRECEDENCE, OPERATORS = jsp.OPERATORS;
         function ast_walker()  {
            function _vardefs(defs)  {
               return [this[0], MAP(defs, function(def)  {
                     var a = [def[0]];
                     if (def.length > 1) a[1] = walk(def[1])                     return a;
                  }
               )];
            }
;
            ;
            function _block(statements)  {
               var out = [this[0]];
               if (statements != null) out.push(MAP(statements, walk))               return out;
            }
;
            ;
            var walkers =  {
               string:function(str)  {
                  return [this[0], str];
               }, 
               num:function(num)  {
                  return [this[0], num];
               }, 
               name:function(name)  {
                  return [this[0], name];
               }, 
               toplevel:function(statements)  {
                  return [this[0], MAP(statements, walk)];
               }, 
               block:_block, 
               splice:_block, 
               var:_vardefs, 
               const:_vardefs, 
               try:function(t, c, f)  {
                  return [this[0], MAP(t, walk), c != null ? [c[0], MAP(c[1], walk)] : null, f != null ? MAP(f, walk) : null];
               }, 
               throw:function(expr)  {
                  return [this[0], walk(expr)];
               }, 
               new:function(ctor, args)  {
                  return [this[0], walk(ctor), MAP(args, walk)];
               }, 
               switch:function(expr, body)  {
                  return [this[0], walk(expr), MAP(body, function(branch)  {
                        return [branch[0] ? walk(branch[0]) : null, MAP(branch[1], walk)];
                     }
                  )];
               }, 
               break:function(label)  {
                  return [this[0], label];
               }, 
               continue:function(label)  {
                  return [this[0], label];
               }, 
               conditional:function(cond, t, e)  {
                  return [this[0], walk(cond), walk(t), walk(e)];
               }, 
               assign:function(op, lvalue, rvalue)  {
                  return [this[0], op, walk(lvalue), walk(rvalue)];
               }, 
               dot:function(expr)  {
                  return [this[0], walk(expr)].concat(slice(arguments, 1));
               }, 
               call:function(expr, args)  {
                  return [this[0], walk(expr), MAP(args, walk)];
               }, 
               function:function(name, args, body)  {
                  return [this[0], name, args.slice(), MAP(body, walk)];
               }, 
               debugger:function()  {
                  return [this[0]];
               }, 
               defun:function(name, args, body)  {
                  return [this[0], name, args.slice(), MAP(body, walk)];
               }, 
               if:function(conditional, t, e)  {
                  return [this[0], walk(conditional), walk(t), walk(e)];
               }, 
               for:function(init, cond, step, block)  {
                  return [this[0], walk(init), walk(cond), walk(step), walk(block)];
               }, 
               for-in:function(vvar, key, hash, block)  {
                  return [this[0], walk(vvar), walk(key), walk(hash), walk(block)];
               }, 
               while:function(cond, block)  {
                  return [this[0], walk(cond), walk(block)];
               }, 
               do:function(cond, block)  {
                  return [this[0], walk(cond), walk(block)];
               }, 
               return:function(expr)  {
                  return [this[0], walk(expr)];
               }, 
               binary:function(op, left, right)  {
                  return [this[0], op, walk(left), walk(right)];
               }, 
               unary-prefix:function(op, expr)  {
                  return [this[0], op, walk(expr)];
               }, 
               unary-postfix:function(op, expr)  {
                  return [this[0], op, walk(expr)];
               }, 
               sub:function(expr, subscript)  {
                  return [this[0], walk(expr), walk(subscript)];
               }, 
               object:function(props)  {
                  return [this[0], MAP(props, function(p)  {
                        return p.length == 2 ? [p[0], walk(p[1])] : [p[0], walk(p[1]), p[2]];
                     }
                  )];
               }, 
               regexp:function(rx, mods)  {
                  return [this[0], rx, mods];
               }, 
               array:function(elements)  {
                  return [this[0], MAP(elements, walk)];
               }, 
               stat:function(stat)  {
                  return [this[0], walk(stat)];
               }, 
               seq:function()  {
                  return [this[0]].concat(MAP(slice(arguments), walk));
               }, 
               label:function(name, block)  {
                  return [this[0], name, walk(block)];
               }, 
               with:function(expr, block)  {
                  return [this[0], walk(expr), walk(block)];
               }, 
               atom:function(name)  {
                  return [this[0], name];
               }} ;
            var user =  {} ;
            var stack = [];
            function walk(ast)  {
               if (ast == null) return null               try {
                  stack.push(ast);
                  var type = ast[0];
                  var gen = user[type];
                  if (gen)  {
                     var ret = gen.apply(ast, ast.slice(1));
                     if (ret != null) return ret                  }
                  gen = walkers[type];
                  return gen.apply(ast, ast.slice(1));
               }
finally  {
                     stack.pop();
                  }
            }
;
            ;
            function dive(ast)  {
               if (ast == null) return null               try {
                  stack.push(ast);
                  return walkers[ast[0]].apply(ast, ast.slice(1));
               }
finally  {
                     stack.pop();
                  }
            }
;
            ;
            function with_walkers(walkers, cont)  {
               var save =  {} , i;
               for (i in walkers) if (HOP(walkers, i))  {
                     save[i] = user[i];
                     user[i] = walkers[i];
                  }
               var ret = cont();
               for (i in save) if (HOP(save, i))  {
                     if (! save[i]) delete user[i]                      else user[i] = save[i]                  }
               return ret;
            }
;
            ;
            return  {
               walk:walk, 
               dive:dive, 
               with_walkers:with_walkers, 
               parent:function()  {
                  return stack[stack.length - 2];
               }, 
               stack:function()  {
                  return stack;
               }} ;
         }
;
         ;
         function Scope(parent)  {
            this.names =  {} ;
            this.mangled =  {} ;
            this.rev_mangled =  {} ;
            this.cname = - 1;
            this.refs =  {} ;
            this.uses_with = false;
            this.uses_eval = false;
            this.parent = parent;
            this.children = [];
            if (parent)  {
               this.level = parent.level + 1;
               parent.children.push(this);
            }
             else  {
               this.level = 0;
            }
         }
;
         ;
         var base54 = function()  {
            var DIGITS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_0123456789";
            return function(num)  {
               var ret = "", base = 54;
               do  {
                     ret = DIGITS.charAt(num % base);
                     num = Math.floor(num / base);
                     base = 64;
                  }
 while (num > 0)               return ret;
            }
;
         }
();
         Scope.prototype =  {
            has:function(name)  {
               for (var s = this; s; s = s.parent) if (HOP(s.names, name)) return s            }, 
            has_mangled:function(mname)  {
               for (var s = this; s; s = s.parent) if (HOP(s.rev_mangled, mname)) return s            }, 
            toJSON:function()  {
               return  {
                  names:this.names, 
                  uses_eval:this.uses_eval, 
                  uses_with:this.uses_with               }
;
            }, 
            next_mangled:function()  {
               for (; ; )  {
                     var m = base54(++this.cname), prior;
                     prior = this.has_mangled(m);
                     if (prior && this.refs[prior.rev_mangled[m]] === prior) continue                     prior = this.has(m);
                     if (prior && prior !== this && this.refs[m] === prior && ! prior.has_mangled(m)) continue                     if (HOP(this.refs, m) && this.refs[m] == null) continue                     if (! is_identifier(m)) continue                     return m;
                  }
            }, 
            set_mangle:function(name, m)  {
               this.rev_mangled[m] = name;
               return this.mangled[name] = m;
            }, 
            get_mangled:function(name, newMangle)  {
               if (this.uses_eval || this.uses_with) return name               var s = this.has(name);
               if (! s) return name               if (HOP(s.mangled, name)) return s.mangled[name]               if (! newMangle) return name               return s.set_mangle(name, s.next_mangled());
            }, 
            references:function(name)  {
               return name && ! this.parent || this.uses_with || this.uses_eval || this.refs[name];
            }, 
            define:function(name, type)  {
               if (name != null)  {
                  if (type == "var" || ! HOP(this.names, name)) this.names[name] = type || "var"                  return name;
               }
            }} ;
         function ast_add_scope(ast)  {
            var current_scope = null;
            var w = ast_walker(), walk = w.walk;
            var having_eval = [];
            function with_new_scope(cont)  {
               current_scope = new Scope(current_scope);
               current_scope.labels = new Scope();
               var ret = current_scope.body = cont();
               ret.scope = current_scope;
               current_scope = current_scope.parent;
               return ret;
            }
;
            ;
            function define(name, type)  {
               return current_scope.define(name, type);
            }
;
            ;
            function reference(name)  {
               current_scope.refs[name] = true;
            }
;
            ;
            function _lambda(name, args, body)  {
               var is_defun = this[0] == "defun";
               return [this[0], is_defun ? define(name, "defun") : name, args, with_new_scope(function()  {
                     if (! is_defun) define(name, "lambda")                     MAP(args, function(name)  {
                           define(name, "arg");
                        }
                     );
                     return MAP(body, walk);
                  }
               )];
            }
;
            ;
            function _vardefs(type)  {
               return function(defs)  {
                  MAP(defs, function(d)  {
                        define(d[0], type);
                        if (d[1]) reference(d[0])                     }
                  );
               }
;
            }
;
            ;
            function _breacont(label)  {
               if (label) current_scope.labels.refs[label] = true            }
;
            ;
            return with_new_scope(function()  {
                  var ret = w.with_walkers( {
                        function:_lambda, 
                        defun:_lambda, 
                        label:function(name, stat)  {
                           current_scope.labels.define(name);
                        }, 
                        break:_breacont, 
                        continue:_breacont, 
                        with:function(expr, block)  {
                           for (var s = current_scope; s; s = s.parent) s.uses_with = true                        }, 
                        var:_vardefs("var"), 
                        const:_vardefs("const"), 
                        try:function(t, c, f)  {
                           if (c != null) return [this[0], MAP(t, walk), [define(c[0], "catch"), MAP(c[1], walk)], f != null ? MAP(f, walk) : null]                        }, 
                        name:function(name)  {
                           if (name == "eval") having_eval.push(current_scope)                           reference(name);
                        }} , function()  {
                        return walk(ast);
                     }
                  );
                  MAP(having_eval, function(scope)  {
                        if (! scope.has("eval")) while (scope)  {
                              scope.uses_eval = true;
                              scope = scope.parent;
                           }
                     }
                  );
                  function fixrefs(scope, i)  {
                     for (i = scope.children.length; --i >= 0; ) fixrefs(scope.children[i])                     for (i in scope.refs) if (HOP(scope.refs, i))  {
                           for (var origin = scope.has(i), s = scope; s; s = s.parent)  {
                                 s.refs[i] = origin;
                                 if (s === origin) break                              }
                        }
                  }
;
                  ;
                  fixrefs(current_scope);
                  return ret;
               }
            );
         }
;
         ;
         function ast_mangle(ast, options)  {
            var w = ast_walker(), walk = w.walk, scope;
            options = options ||  {} ;
            function get_mangled(name, newMangle)  {
               if (! options.toplevel && ! scope.parent) return name               if (options.except && member(name, options.except)) return name               return scope.get_mangled(name, newMangle);
            }
;
            ;
            function get_define(name)  {
               if (options.defines)  {
                  if (! scope.has(name))  {
                     if (HOP(options.defines, name))  {
                        return options.defines[name];
                     }
                  }
                  return null;
               }
            }
;
            ;
            function _lambda(name, args, body)  {
               if (! options.no_functions)  {
                  var is_defun = this[0] == "defun", extra;
                  if (name)  {
                     if (is_defun) name = get_mangled(name)                      else if (body.scope.references(name))  {
                        extra =  {} ;
                        if (! scope.uses_eval || scope.uses_with) name = extra[name] = scope.next_mangled()                         else extra[name] = name                     }
                      else name = null                  }
               }
               body = with_scope(body.scope, function()  {
                     args = MAP(args, function(name)  {
                           return get_mangled(name);
                        }
                     );
                     return MAP(body, walk);
                  }, 
                  extra);
               return [this[0], name, args, body];
            }
;
            ;
            function with_scope(s, cont, extra)  {
               var _scope = scope;
               scope = s;
               if (extra) for (var i in extra) if (HOP(extra, i))  {
                     s.set_mangle(i, extra[i]);
                  }
               for (var i in s.names) if (HOP(s.names, i))  {
                     get_mangled(i, true);
                  }
               var ret = cont();
               ret.scope = s;
               scope = _scope;
               return ret;
            }
;
            ;
            function _vardefs(defs)  {
               return [this[0], MAP(defs, function(d)  {
                     return [get_mangled(d[0]), walk(d[1])];
                  }
               )];
            }
;
            ;
            function _breacont(label)  {
               if (label) return [this[0], scope.labels.get_mangled(label)]            }
;
            ;
            return w.with_walkers( {
                  function:_lambda, 
                  defun:function()  {
                     var ast = _lambda.apply(this, arguments);
                     switch(w.parent()[0]) {
                        case "toplevel":
 
                           
                        case "function":
 
                           
                        case "defun":
 
                              return MAP.at_top(ast);
                           
}
;
                     return ast;
                  }, 
                  label:function(label, stat)  {
                     if (scope.labels.refs[label]) return [this[0], scope.labels.get_mangled(label, true), walk(stat)]                     return walk(stat);
                  }, 
                  break:_breacont, 
                  continue:_breacont, 
                  var:_vardefs, 
                  const:_vardefs, 
                  name:function(name)  {
                     return get_define(name) || [this[0], get_mangled(name)];
                  }, 
                  try:function(t, c, f)  {
                     return [this[0], MAP(t, walk), c != null ? [get_mangled(c[0]), MAP(c[1], walk)] : null, f != null ? MAP(f, walk) : null];
                  }, 
                  toplevel:function(body)  {
                     var self = this;
                     return with_scope(self.scope, function()  {
                           return [self[0], MAP(body, walk)];
                        }
                     );
                  }} , function()  {
                  return walk(ast_add_scope(ast));
               }
            );
         }
;
         ;
         var warn = function()  {
         }
;
         function best_of(ast1, ast2)  {
            return gen_code(ast1).length > gen_code(ast2[0] == "stat" ? ast2[1] : ast2).length ? ast2 : ast1;
         }
;
         ;
         function last_stat(b)  {
            if (b[0] == "block" && b[1] && b[1].length > 0) return b[1][b[1].length - 1]            return b;
         }
;
         function aborts(t)  {
            if (t) switch(last_stat(t)[0]) {
               case "return":
 
                  
               case "break":
 
                  
               case "continue":
 
                  
               case "throw":
 
                     return true;
                  
}
         }
;
         ;
         function boolean_expr(expr)  {
            return expr[0] == "unary-prefix" && member(expr[1], ["!", "delete"]) || expr[0] == "binary" && member(expr[1], ["in", "instanceof", "==", "!=", "===", "!==", "<", "<=", ">=", ">"]) || expr[0] == "binary" && member(expr[1], ["&&", "||"]) && boolean_expr(expr[2]) && boolean_expr(expr[3]) || expr[0] == "conditional" && boolean_expr(expr[2]) && boolean_expr(expr[3]) || expr[0] == "assign" && expr[1] === true && boolean_expr(expr[3]) || expr[0] == "seq" && boolean_expr(expr[expr.length - 1]);
         }
;
         ;
         function empty(b)  {
            return ! b || b[0] == "block" && ! b[1] || b[1].length == 0;
         }
;
         ;
         function is_string(node)  {
            return node[0] == "string" || node[0] == "unary-prefix" && node[1] == "typeof" || node[0] == "binary" && node[1] == "+" && is_string(node[2]) || is_string(node[3]);
         }
;
         ;
         var when_constant = function()  {
            var $NOT_CONSTANT =  {} ;
            function evaluate(expr)  {
               switch(expr[0]) {
                  case "string":
 
                     
                  case "num":
 
                        return expr[1];
                     
                  case "name":
 
                     
                  case "atom":
 
                        switch(expr[1]) {
                           case "true":
 
                                 return true;
                              
                           case "false":
 
                                 return false;
                              
                           case "null":
 
                                 return null;
                              
}
;
                        break;
                     
                  case "unary-prefix":
 
                        switch(expr[1]) {
                           case "!":
 
                                 return ! evaluate(expr[2]);
                              
                           case "typeof":
 
                                 return typeof evaluate(expr[2]);
                              
                           case "~":
 
                                 return ~ evaluate(expr[2]);
                              
                           case "-":
 
                                 return - evaluate(expr[2]);
                              
                           case "+":
 
                                 return + evaluate(expr[2]);
                              
}
;
                        break;
                     
                  case "binary":
 
                        var left = expr[2], right = expr[3];
                        switch(expr[1]) {
                           case "&&":
 
                                 return evaluate(left) && evaluate(right);
                              
                           case "||":
 
                                 return evaluate(left) || evaluate(right);
                              
                           case "|":
 
                                 return evaluate(left) | evaluate(right);
                              
                           case "&":
 
                                 return evaluate(left) & evaluate(right);
                              
                           case "^":
 
                                 return evaluate(left) ^ evaluate(right);
                              
                           case "+":
 
                                 return evaluate(left) + evaluate(right);
                              
                           case "*":
 
                                 return evaluate(left) * evaluate(right);
                              
                           case "/":
 
                                 return evaluate(left) / evaluate(right);
                              
                           case "%":
 
                                 return evaluate(left) % evaluate(right);
                              
                           case "-":
 
                                 return evaluate(left) - evaluate(right);
                              
                           case "<<":
 
                                 return evaluate(left) << evaluate(right);
                              
                           case ">>":
 
                                 return evaluate(left) >> evaluate(right);
                              
                           case ">>>":
 
                                 return evaluate(left) >>> evaluate(right);
                              
                           case "==":
 
                                 return evaluate(left) == evaluate(right);
                              
                           case "===":
 
                                 return evaluate(left) === evaluate(right);
                              
                           case "!=":
 
                                 return evaluate(left) != evaluate(right);
                              
                           case "!==":
 
                                 return evaluate(left) !== evaluate(right);
                              
                           case "<":
 
                                 return evaluate(left) < evaluate(right);
                              
                           case "<=":
 
                                 return evaluate(left) <= evaluate(right);
                              
                           case ">":
 
                                 return evaluate(left) > evaluate(right);
                              
                           case ">=":
 
                                 return evaluate(left) >= evaluate(right);
                              
                           case "in":
 
                                 return evaluate(left) in evaluate(right);
                              
                           case "instanceof":
 
                                 return evaluate(left) instanceof evaluate(right);
                              
}
;
                     
}
;
               throw $NOT_CONSTANT;
            }
;
            ;
            return function(expr, yes, no)  {
               try {
                  var val = evaluate(expr), ast;
                  switch(typeof val) {
                     case "string":
 
                           ast = ["string", val];
                           break;
                        
                     case "number":
 
                           ast = ["num", val];
                           break;
                        
                     case "boolean":
 
                           ast = ["name", String(val)];
                           break;
                        
                     default:
 
                           if (val === null)  {
                              ast = ["atom", "null"];
                              break;
                           }
                           throw new Error("Can't handle constant of type: " + typeof val);
                        
}
;
                  return yes.call(expr, ast, val);
               }
               catch (ex) {
                  if (ex === $NOT_CONSTANT)  {
                     if (expr[0] == "binary" && expr[1] == "===" || expr[1] == "!==" && is_string(expr[2]) && is_string(expr[3]) || boolean_expr(expr[2]) && boolean_expr(expr[3]))  {
                        expr[1] = expr[1].substr(0, 2);
                     }
                      else if (no && expr[0] == "binary" && expr[1] == "||" || expr[1] == "&&")  {
                        try {
                           var lval = evaluate(expr[2]);
                           expr = expr[1] == "&&" && lval ? expr[3] : lval || expr[1] == "||" && lval ? lval : expr[3] || expr;
                        }
                        catch (ex2) {
                        }
                     }
                     return no ? no.call(expr, expr) : null;
                  }
                   else throw ex               }
            }
;
         }
();
         function warn_unreachable(ast)  {
            if (! empty(ast)) warn("Dropping unreachable code: " + gen_code(ast, true))         }
;
         ;
         function prepare_ifs(ast)  {
            var w = ast_walker(), walk = w.walk;
            function redo_if(statements)  {
               statements = MAP(statements, walk);
               for (var i = 0; i < statements.length; ++i)  {
                     var fi = statements[i];
                     if (fi[0] != "if") continue                     if (fi[3] && walk(fi[3])) continue                     var t = walk(fi[2]);
                     if (! aborts(t)) continue                     var conditional = walk(fi[1]);
                     var e_body = redo_if(statements.slice(i + 1));
                     var e = e_body.length == 1 ? e_body[0] : ["block", e_body];
                     return statements.slice(0, i).concat([[fi[0], conditional, t, e]]);
                  }
               return statements;
            }
;
            ;
            function redo_if_lambda(name, args, body)  {
               body = redo_if(body);
               return [this[0], name, args, body];
            }
;
            ;
            function redo_if_block(statements)  {
               return [this[0], statements != null ? redo_if(statements) : null];
            }
;
            ;
            return w.with_walkers( {
                  defun:redo_if_lambda, 
                  function:redo_if_lambda, 
                  block:redo_if_block, 
                  splice:redo_if_block, 
                  toplevel:function(statements)  {
                     return [this[0], redo_if(statements)];
                  }, 
                  try:function(t, c, f)  {
                     return [this[0], redo_if(t), c != null ? [c[0], redo_if(c[1])] : null, f != null ? redo_if(f) : null];
                  }} , function()  {
                  return walk(ast);
               }
            );
         }
;
         ;
         function for_side_effects(ast, handler)  {
            var w = ast_walker(), walk = w.walk;
            var $stop =  {} , $restart =  {} ;
            function stop()  {
               throw $stop;
            }
;
            ;
            function restart()  {
               throw $restart;
            }
;
            ;
            function found()  {
               return handler.call(this, this, w, stop, restart);
            }
;
            ;
            function unary(op)  {
               if (op == "++" || op == "--") return found.apply(this, arguments)            }
;
            ;
            return w.with_walkers( {
                  try:found, 
                  throw:found, 
                  return:found, 
                  new:found, 
                  switch:found, 
                  break:found, 
                  continue:found, 
                  assign:found, 
                  call:found, 
                  if:found, 
                  for:found, 
                  for-in:found, 
                  while:found, 
                  do:found, 
                  return:found, 
                  unary-prefix:unary, 
                  unary-postfix:unary, 
                  defun:found               }, 
               function()  {
                  while (true) try {
                        walk(ast);
                        break;
                     }
                     catch (ex) {
                        if (ex === $stop) break                        if (ex === $restart) continue                        throw ex;
                     }
               }
            );
         }
;
         ;
         function ast_lift_variables(ast)  {
            var w = ast_walker(), walk = w.walk, scope;
            function do_body(body, env)  {
               var _scope = scope;
               scope = env;
               body = MAP(body, walk);
               var hash =  {} , names = MAP(env.names, function(type, name)  {
                     if (type != "var") return MAP.skip                     if (! env.references(name)) return MAP.skip                     hash[name] = true;
                     return [name];
                  }
               );
               if (names.length > 0)  {
                  for_side_effects(["block", body], function(ast, walker, stop, restart)  {
                        if (ast[0] == "assign" && ast[1] === true && ast[2][0] == "name" && HOP(hash, ast[2][1]))  {
                           for (var i = names.length; --i >= 0; )  {
                                 if (names[i][0] == ast[2][1])  {
                                    if (names[i][1]) stop()                                    names[i][1] = ast[3];
                                    names.push(names.splice(i, 1)[0]);
                                    break;
                                 }
                              }
                           var p = walker.parent();
                           if (p[0] == "seq")  {
                              var a = p[2];
                              a.unshift(0, p.length);
                              p.splice.apply(p, a);
                           }
                            else if (p[0] == "stat")  {
                              p.splice(0, p.length, "block");
                           }
                            else  {
                              stop();
                           }
                           restart();
                        }
                        stop();
                     }
                  );
                  body.unshift(["var", names]);
               }
               scope = _scope;
               return body;
            }
;
            ;
            function _vardefs(defs)  {
               var ret = null;
               for (var i = defs.length; --i >= 0; )  {
                     var d = defs[i];
                     if (! d[1]) continue                     d = ["assign", true, ["name", d[0]], d[1]];
                     if (ret == null) ret = d                      else ret = ["seq", d, ret]                  }
               if (ret == null)  {
                  if (w.parent()[0] == "for-in") return ["name", defs[0][0]]                  return MAP.skip;
               }
               return ["stat", ret];
            }
;
            ;
            function _toplevel(body)  {
               return [this[0], do_body(body, this.scope)];
            }
;
            ;
            return w.with_walkers( {
                  function:function(name, args, body)  {
                     for (var i = args.length; --i >= 0 && ! body.scope.references(args[i]); ) args.pop()                     if (! body.scope.references(name)) name = null                     return [this[0], name, args, do_body(body, body.scope)];
                  }, 
                  defun:function(name, args, body)  {
                     if (! scope.references(name)) return MAP.skip                     for (var i = args.length; --i >= 0 && ! body.scope.references(args[i]); ) args.pop()                     return [this[0], name, args, do_body(body, body.scope)];
                  }, 
                  var:_vardefs, 
                  toplevel:_toplevel               }, 
               function()  {
                  return walk(ast_add_scope(ast));
               }
            );
         }
;
         ;
         function ast_squeeze(ast, options)  {
            options = defaults(options,  {
                  make_seqs:true, 
                  dead_code:true, 
                  no_warnings:false, 
                  keep_comps:true               }
            );
            var w = ast_walker(), walk = w.walk;
            function negate(c)  {
               var not_c = ["unary-prefix", "!", c];
               switch(c[0]) {
                  case "unary-prefix":
 
                        return c[1] == "!" && boolean_expr(c[2]) ? c[2] : not_c;
                     
                  case "seq":
 
                        c = slice(c);
                        c[c.length - 1] = negate(c[c.length - 1]);
                        return c;
                     
                  case "conditional":
 
                        return best_of(not_c, ["conditional", c[1], negate(c[2]), negate(c[3])]);
                     
                  case "binary":
 
                        var op = c[1], left = c[2], right = c[3];
                        if (! options.keep_comps) switch(op) {
                           case "<=":
 
                                 return ["binary", ">", left, right];
                              
                           case "<":
 
                                 return ["binary", ">=", left, right];
                              
                           case ">=":
 
                                 return ["binary", "<", left, right];
                              
                           case ">":
 
                                 return ["binary", "<=", left, right];
                              
}
                        switch(op) {
                           case "==":
 
                                 return ["binary", "!=", left, right];
                              
                           case "!=":
 
                                 return ["binary", "==", left, right];
                              
                           case "===":
 
                                 return ["binary", "!==", left, right];
                              
                           case "!==":
 
                                 return ["binary", "===", left, right];
                              
                           case "&&":
 
                                 return best_of(not_c, ["binary", "||", negate(left), negate(right)]);
                              
                           case "||":
 
                                 return best_of(not_c, ["binary", "&&", negate(left), negate(right)]);
                              
}
;
                        break;
                     
}
;
               return not_c;
            }
;
            ;
            function make_conditional(c, t, e)  {
               var make_real_conditional = function()  {
                  if (c[0] == "unary-prefix" && c[1] == "!")  {
                     return e ? ["conditional", c[2], e, t] : ["binary", "||", c[2], t];
                  }
                   else  {
                     return e ? best_of(["conditional", c, t, e], ["conditional", negate(c), e, t]) : ["binary", "&&", c, t];
                  }
               }
;
               return when_constant(c, function(ast, val)  {
                     warn_unreachable(val ? e : t);
                     return val ? t : e;
                  }, 
                  make_real_conditional);
            }
;
            ;
            function rmblock(block)  {
               if (block != null && block[0] == "block" && block[1])  {
                  if (block[1].length == 1) block = block[1][0]                   else if (block[1].length == 0) block = ["block"]               }
               return block;
            }
;
            ;
            function _lambda(name, args, body)  {
               return [this[0], name, args, tighten(body, "lambda")];
            }
;
            ;
            function tighten(statements, block_type)  {
               statements = MAP(statements, walk);
               statements = statements.reduce(function(a, stat)  {
                     if (stat[0] == "block")  {
                        if (stat[1])  {
                           a.push.apply(a, stat[1]);
                        }
                     }
                      else  {
                        a.push(stat);
                     }
                     return a;
                  }, 
                  []);
               statements = function(a, prev)  {
                  statements.forEach(function(cur)  {
                        if (prev && cur[0] == "var" && prev[0] == "var" || cur[0] == "const" && prev[0] == "const")  {
                           prev[1] = prev[1].concat(cur[1]);
                        }
                         else  {
                           a.push(cur);
                           prev = cur;
                        }
                     }
                  );
                  return a;
               }
([]);
               if (options.dead_code) statements = function(a, has_quit)  {
                  statements.forEach(function(st)  {
                        if (has_quit)  {
                           if (st[0] == "function" || st[0] == "defun")  {
                              a.push(st);
                           }
                            else if (st[0] == "var" || st[0] == "const")  {
                              if (! options.no_warnings) warn("Variables declared in unreachable code")                              st[1] = MAP(st[1], function(def)  {
                                    if (def[1] && ! options.no_warnings) warn_unreachable(["assign", true, ["name", def[0]], def[1]])                                    return [def[0]];
                                 }
                              );
                              a.push(st);
                           }
                            else if (! options.no_warnings) warn_unreachable(st)                        }
                         else  {
                           a.push(st);
                           if (member(st[0], ["return", "throw", "break", "continue"])) has_quit = true                        }
                     }
                  );
                  return a;
               }
([])               if (options.make_seqs) statements = function(a, prev)  {
                  statements.forEach(function(cur)  {
                        if (prev && prev[0] == "stat" && cur[0] == "stat")  {
                           prev[1] = ["seq", prev[1], cur[1]];
                        }
                         else  {
                           a.push(cur);
                           prev = cur;
                        }
                     }
                  );
                  if (a.length >= 2 && a[a.length - 2][0] == "stat" && a[a.length - 1][0] == "return" || a[a.length - 1][0] == "throw" && a[a.length - 1][1])  {
                     a.splice(a.length - 2, 2, [a[a.length - 1][0], ["seq", a[a.length - 2][1], a[a.length - 1][1]]]);
                  }
                  return a;
               }
([])               return statements;
            }
;
            ;
            function make_if(c, t, e)  {
               return when_constant(c, function(ast, val)  {
                     if (val)  {
                        t = walk(t);
                        warn_unreachable(e);
                        return t || ["block"];
                     }
                      else  {
                        e = walk(e);
                        warn_unreachable(t);
                        return e || ["block"];
                     }
                  }, 
                  function()  {
                     return make_real_if(c, t, e);
                  }
               );
            }
;
            ;
            function abort_else(c, t, e)  {
               var ret = [["if", negate(c), e]];
               if (t[0] == "block")  {
                  if (t[1]) ret = ret.concat(t[1])               }
                else  {
                  ret.push(t);
               }
               return walk(["block", ret]);
            }
;
            ;
            function make_real_if(c, t, e)  {
               c = walk(c);
               t = walk(t);
               e = walk(e);
               if (empty(t))  {
                  c = negate(c);
                  t = e;
                  e = null;
               }
                else if (empty(e))  {
                  e = null;
               }
                else  {
                  function()  {
                     var a = gen_code(c);
                     var n = negate(c);
                     var b = gen_code(n);
                     if (b.length < a.length)  {
                        var tmp = t;
                        t = e;
                        e = tmp;
                        c = n;
                     }
                  }
();
               }
               if (empty(e) && empty(t)) return ["stat", c]               var ret = ["if", c, t, e];
               if (t[0] == "if" && empty(t[3]) && empty(e))  {
                  ret = best_of(ret, walk(["if", ["binary", "&&", c, t[1]], t[2]]));
               }
                else if (t[0] == "stat")  {
                  if (e)  {
                     if (e[0] == "stat") ret = best_of(ret, ["stat", make_conditional(c, t[1], e[1])])                      else if (aborts(e)) ret = abort_else(c, t, e)                  }
                   else  {
                     ret = best_of(ret, ["stat", make_conditional(c, t[1])]);
                  }
               }
                else if (e && t[0] == e[0] && t[0] == "return" || t[0] == "throw" && t[1] && e[1])  {
                  ret = best_of(ret, [t[0], make_conditional(c, t[1], e[1])]);
               }
                else if (e && aborts(t))  {
                  ret = [["if", c, t]];
                  if (e[0] == "block")  {
                     if (e[1]) ret = ret.concat(e[1])                  }
                   else  {
                     ret.push(e);
                  }
                  ret = walk(["block", ret]);
               }
                else if (t && aborts(e))  {
                  ret = abort_else(c, t, e);
               }
               return ret;
            }
;
            ;
            function _do_while(cond, body)  {
               return when_constant(cond, function(cond, val)  {
                     if (! val)  {
                        warn_unreachable(body);
                        return ["block"];
                     }
                      else  {
                        return ["for", null, null, null, walk(body)];
                     }
                  }
               );
            }
;
            ;
            return w.with_walkers( {
                  sub:function(expr, subscript)  {
                     if (subscript[0] == "string")  {
                        var name = subscript[1];
                        if (is_identifier(name)) return ["dot", walk(expr), name]                         else if (/^[1-9][0-9]*$/.test(name) || name === "0") return ["sub", walk(expr), ["num", parseInt(name, 10)]]                     }
                  }, 
                  if:make_if, 
                  toplevel:function(body)  {
                     return ["toplevel", tighten(body)];
                  }, 
                  switch:function(expr, body)  {
                     var last = body.length - 1;
                     return ["switch", walk(expr), MAP(body, function(branch, i)  {
                           var block = tighten(branch[1]);
                           if (i == last && block.length > 0)  {
                              var node = block[block.length - 1];
                              if (node[0] == "break" && ! node[1]) block.pop()                           }
                           return [branch[0] ? walk(branch[0]) : null, block];
                        }
                     )];
                  }, 
                  function:_lambda, 
                  defun:_lambda, 
                  block:function(body)  {
                     if (body) return rmblock(["block", tighten(body)])                  }, 
                  binary:function(op, left, right)  {
                     return when_constant(["binary", op, walk(left), walk(right)], function(c)  {
                           return best_of(walk(c), this);
                        }, 
                        function()  {
                           return function()  {
                              if (op != "==" && op != "!=") return                               var l = walk(left), r = walk(right);
                              if (l && l[0] == "unary-prefix" && l[1] == "!" && l[2][0] == "num") left = ["num", + ! l[2][1]]                               else if (r && r[0] == "unary-prefix" && r[1] == "!" && r[2][0] == "num") right = ["num", + ! r[2][1]]                              return ["binary", op, left, right];
                           }
() || this;
                        }
                     );
                  }, 
                  conditional:function(c, t, e)  {
                     return make_conditional(walk(c), walk(t), walk(e));
                  }, 
                  try:function(t, c, f)  {
                     return ["try", tighten(t), c != null ? [c[0], tighten(c[1])] : null, f != null ? tighten(f) : null];
                  }, 
                  unary-prefix:function(op, expr)  {
                     expr = walk(expr);
                     var ret = ["unary-prefix", op, expr];
                     if (op == "!") ret = best_of(ret, negate(expr))                     return when_constant(ret, function(ast, val)  {
                           return walk(ast);
                        }, 
                        function()  {
                           return ret;
                        }
                     );
                  }, 
                  name:function(name)  {
                     switch(name) {
                        case "true":
 
                              return ["unary-prefix", "!", ["num", 0]];
                           
                        case "false":
 
                              return ["unary-prefix", "!", ["num", 1]];
                           
}
;
                  }, 
                  while:_do_while, 
                  assign:function(op, lvalue, rvalue)  {
                     lvalue = walk(lvalue);
                     rvalue = walk(rvalue);
                     var okOps = ["+", "-", "/", "*", "%", ">>", "<<", ">>>", "|", "^", "&"];
                     if (op === true && lvalue[0] === "name" && rvalue[0] === "binary" && ~ okOps.indexOf(rvalue[1]) && rvalue[2][0] === "name" && rvalue[2][1] === lvalue[1])  {
                        return [this[0], rvalue[1], lvalue, rvalue[3]];
                     }
                     return [this[0], op, lvalue, rvalue];
                  }} , function()  {
                  for (var i = 0; i < 2; ++i)  {
                        ast = prepare_ifs(ast);
                        ast = walk(ast);
                     }
                  return ast;
               }
            );
         }
;
         ;
         var DOT_CALL_NO_PARENS = jsp.array_to_hash(["name", "array", "object", "string", "dot", "sub", "call", "regexp", "defun"]);
         function make_string(str, ascii_only)  {
            var dq = 0, sq = 0;
            str = str.replace(/[\\\b\f\n\r\t\x22\x27\u2028\u2029\0]/g, function(s)  {
                  switch(s) {
                     case "\":
 
                           return "\\";
                        
                     case "":
 
                           return "\b";
                        
                     case "":
 
                           return "\f";
                        
                     case "
":
 
                           return "\n";
                        
                     case "":
 
                           return "\r";
                        
                     case " ":
 
                           return "\u2028";
                        
                     case " ":
 
                           return "\u2029";
                        
                     case """:
 
                           ++dq;
                           return """;
                        
                     case "'":
 
                           ++sq;
                           return "'";
                        
                     case "":
 
                           return "\0";
                        
}
;
                  return s;
               }
            );
            if (ascii_only) str = to_ascii(str)            if (dq > sq) return "'" + str.replace(/\x27/g, "\'") + "'"             else return """ + str.replace(/\x22/g, "\"") + """         }
;
         ;
         function to_ascii(str)  {
            return str.replace(/[\u0080-\uffff]/g, function(ch)  {
                  var code = ch.charCodeAt(0).toString(16);
                  while (code.length < 4) code = "0" + code                  return "\u" + code;
               }
            );
         }
;
         ;
         var SPLICE_NEEDS_BRACKETS = jsp.array_to_hash(["if", "while", "do", "for", "for-in", "with"]);
         function gen_code(ast, options)  {
            options = defaults(options,  {
                  indent_start:0, 
                  indent_level:4, 
                  quote_keys:false, 
                  space_colon:false, 
                  beautify:false, 
                  ascii_only:false, 
                  inline_script:false               }
            );
            var beautify = ! ! options.beautify;
            var indentation = 0, newline = beautify ? "
" : "", space = beautify ? " " : "";
            function encode_string(str)  {
               var ret = make_string(str, options.ascii_only);
               if (options.inline_script) ret = ret.replace(/<\x2fscript([>\/\t\n\f\r ])/gi, "<\/script$1")               return ret;
            }
;
            ;
            function make_name(name)  {
               name = name.toString();
               if (options.ascii_only) name = to_ascii(name)               return name;
            }
;
            ;
            function indent(line)  {
               if (line == null) line = ""               if (beautify) line = repeat_string(" ", options.indent_start + indentation * options.indent_level) + line               return line;
            }
;
            ;
            function with_indent(cont, incr)  {
               if (incr == null) incr = 1               indentation = incr;
               try {
                  return cont.apply(null, slice(arguments, 1));
               }
finally  {
                     indentation = incr;
                  }
            }
;
            ;
            function add_spaces(a)  {
               if (beautify) return a.join(" ")               var b = [];
               for (var i = 0; i < a.length; ++i)  {
                     var next = a[i + 1];
                     b.push(a[i]);
                     if (next && /[a-z0-9_\x24]$/i.test(a[i].toString()) && /^[a-z0-9_\x24]/i.test(next.toString()) || /[\+\-]$/.test(a[i].toString()) && /^[\+\-]/.test(next.toString()))  {
                        b.push(" ");
                     }
                  }
               return b.join("");
            }
;
            ;
            function add_commas(a)  {
               return a.join("," + space);
            }
;
            ;
            function parenthesize(expr)  {
               var gen = make(expr);
               for (var i = 1; i < arguments.length; ++i)  {
                     var el = arguments[i];
                     if (el instanceof Function && el(expr) || expr[0] == el) return "(" + gen + ")"                  }
               return gen;
            }
;
            ;
            function best_of(a)  {
               if (a.length == 1)  {
                  return a[0];
               }
               if (a.length == 2)  {
                  var b = a[1];
                  a = a[0];
                  return a.length <= b.length ? a : b;
               }
               return best_of([a[0], best_of(a.slice(1))]);
            }
;
            ;
            function needs_parens(expr)  {
               if (expr[0] == "function" || expr[0] == "object")  {
                  var a = slice(w.stack()), self = a.pop(), p = a.pop();
                  while (p)  {
                        if (p[0] == "stat") return true                        if (p[0] == "seq" || p[0] == "call" || p[0] == "dot" || p[0] == "sub" || p[0] == "conditional" && p[1] === self || p[0] == "binary" || p[0] == "assign" || p[0] == "unary-postfix" && p[2] === self)  {
                           self = p;
                           p = a.pop();
                        }
                         else  {
                           return false;
                        }
                     }
               }
               return ! HOP(DOT_CALL_NO_PARENS, expr[0]);
            }
;
            ;
            function make_num(num)  {
               var str = num.toString(10), a = [str.replace(/^0\./, ".")], m;
               if (Math.floor(num) === num)  {
                  if (num >= 0)  {
                     a.push("0x" + num.toString(16).toLowerCase(), "0" + num.toString(8));
                  }
                   else  {
                     a.push("-0x" + - num.toString(16).toLowerCase(), "-0" + - num.toString(8));
                  }
                  if (m = /^(.*?)(0+)$/.exec(num))  {
                     a.push(m[1] + "e" + m[2].length);
                  }
               }
                else if (m = /^0?\.(0+)(.*)$/.exec(num))  {
                  a.push(m[2] + "e-" + m[1].length + m[2].length, str.substr(str.indexOf(".")));
               }
               return best_of(a);
            }
;
            ;
            var w = ast_walker();
            var make = w.walk;
            return w.with_walkers( {
                  string:encode_string, 
                  num:make_num, 
                  name:make_name, 
                  debugger:function()  {
                     return "debugger";
                  }, 
                  toplevel:function(statements)  {
                     return make_block_statements(statements).join(newline + newline);
                  }, 
                  splice:function(statements)  {
                     var parent = w.parent();
                     if (HOP(SPLICE_NEEDS_BRACKETS, parent))  {
                        return make_block.apply(this, arguments);
                     }
                      else  {
                        return MAP(make_block_statements(statements, true), function(line, i)  {
                              return i > 0 ? indent(line) : line;
                           }
                        ).join(newline);
                     }
                  }, 
                  block:make_block, 
                  var:function(defs)  {
                     return "var " + add_commas(MAP(defs, make_1vardef)) + ";";
                  }, 
                  const:function(defs)  {
                     return "const " + add_commas(MAP(defs, make_1vardef)) + ";";
                  }, 
                  try:function(tr, ca, fi)  {
                     var out = ["try", make_block(tr)];
                     if (ca) out.push("catch", "(" + ca[0] + ")", make_block(ca[1]))                     if (fi) out.push("finally", make_block(fi))                     return add_spaces(out);
                  }, 
                  throw:function(expr)  {
                     return add_spaces(["throw", make(expr)]) + ";";
                  }, 
                  new:function(ctor, args)  {
                     args = args.length > 0 ? "(" + add_commas(MAP(args, function(expr)  {
                              return parenthesize(expr, "seq");
                           }
                        )) + ")" : "";
                     return add_spaces(["new", parenthesize(ctor, "seq", "binary", "conditional", "assign", function(expr)  {
                              var w = ast_walker(), has_call =  {} ;
                              try {
                                 w.with_walkers( {
                                       call:function()  {
                                          throw has_call;
                                       }, 
                                       function:function()  {
                                          return this;
                                       }} , function()  {
                                       w.walk(expr);
                                    }
                                 );
                              }
                              catch (ex) {
                                 if (ex === has_call) return true                                 throw ex;
                              }
                           }
                        ) + args]);
                  }, 
                  switch:function(expr, body)  {
                     return add_spaces(["switch", "(" + make(expr) + ")", make_switch_block(body)]);
                  }, 
                  break:function(label)  {
                     var out = "break";
                     if (label != null) out = " " + make_name(label)                     return out + ";";
                  }, 
                  continue:function(label)  {
                     var out = "continue";
                     if (label != null) out = " " + make_name(label)                     return out + ";";
                  }, 
                  conditional:function(co, th, el)  {
                     return add_spaces([parenthesize(co, "assign", "seq", "conditional"), "?", parenthesize(th, "seq"), ":", parenthesize(el, "seq")]);
                  }, 
                  assign:function(op, lvalue, rvalue)  {
                     if (op && op !== true) op = "="                      else op = "="                     return add_spaces([make(lvalue), op, parenthesize(rvalue, "seq")]);
                  }, 
                  dot:function(expr)  {
                     var out = make(expr), i = 1;
                     if (expr[0] == "num")  {
                        if (! /\./.test(expr[1])) out = "."                     }
                      else if (expr[0] != "function" && needs_parens(expr)) out = "(" + out + ")"                     while (i < arguments.length) out = "." + make_name(arguments[i++])                     return out;
                  }, 
                  call:function(func, args)  {
                     var f = make(func);
                     if (f.charAt(0) != "(" && needs_parens(func)) f = "(" + f + ")"                     return f + "(" + add_commas(MAP(args, function(expr)  {
                              return parenthesize(expr, "seq");
                           }
                        )) + ")";
                  }, 
                  function:make_function, 
                  defun:make_function, 
                  if:function(co, th, el)  {
                     var out = ["if", "(" + make(co) + ")", el ? make_then(th) : make(th)];
                     if (el)  {
                        out.push("else", make(el));
                     }
                     return add_spaces(out);
                  }, 
                  for:function(init, cond, step, block)  {
                     var out = ["for"];
                     init = init != null ? make(init) : "".replace(/;*\s*$/, ";" + space);
                     cond = cond != null ? make(cond) : "".replace(/;*\s*$/, ";" + space);
                     step = step != null ? make(step) : "".replace(/;*\s*$/, "");
                     var args = init + cond + step;
                     if (args == "; ; ") args = ";;"                     out.push("(" + args + ")", make(block));
                     return add_spaces(out);
                  }, 
                  for-in:function(vvar, key, hash, block)  {
                     return add_spaces(["for", "(" + vvar ? make(vvar).replace(/;+$/, "") : make(key), "in", make(hash) + ")", make(block)]);
                  }, 
                  while:function(condition, block)  {
                     return add_spaces(["while", "(" + make(condition) + ")", make(block)]);
                  }, 
                  do:function(condition, block)  {
                     return add_spaces(["do", make(block), "while", "(" + make(condition) + ")"]) + ";";
                  }, 
                  return:function(expr)  {
                     var out = ["return"];
                     if (expr != null) out.push(make(expr))                     return add_spaces(out) + ";";
                  }, 
                  binary:function(operator, lvalue, rvalue)  {
                     var left = make(lvalue), right = make(rvalue);
                     if (member(lvalue[0], ["assign", "conditional", "seq"]) || lvalue[0] == "binary" && PRECEDENCE[operator] > PRECEDENCE[lvalue[1]] || lvalue[0] == "function" && needs_parens(this))  {
                        left = "(" + left + ")";
                     }
                     if (member(rvalue[0], ["assign", "conditional", "seq"]) || rvalue[0] == "binary" && PRECEDENCE[operator] >= PRECEDENCE[rvalue[1]] && ! rvalue[1] == operator && member(operator, ["&&", "||", "*"]))  {
                        right = "(" + right + ")";
                     }
                      else if (! beautify && options.inline_script && operator == "<" || operator == "<<" && rvalue[0] == "regexp" && /^script/i.test(rvalue[1]))  {
                        right = " " + right;
                     }
                     return add_spaces([left, operator, right]);
                  }, 
                  unary-prefix:function(operator, expr)  {
                     var val = make(expr);
                     if (! expr[0] == "num" || expr[0] == "unary-prefix" && ! HOP(OPERATORS, operator + expr[1]) || ! needs_parens(expr)) val = "(" + val + ")"                     return operator + jsp.is_alphanumeric_char(operator.charAt(0)) ? " " : "" + val;
                  }, 
                  unary-postfix:function(operator, expr)  {
                     var val = make(expr);
                     if (! expr[0] == "num" || expr[0] == "unary-postfix" && ! HOP(OPERATORS, operator + expr[1]) || ! needs_parens(expr)) val = "(" + val + ")"                     return val + operator;
                  }, 
                  sub:function(expr, subscript)  {
                     var hash = make(expr);
                     if (needs_parens(expr)) hash = "(" + hash + ")"                     return hash + "[" + make(subscript) + "]";
                  }, 
                  object:function(props)  {
                     var obj_needs_parens = needs_parens(this);
                     if (props.length == 0) return obj_needs_parens ? "({})" : "{}"                     var out = "{" + newline + with_indent(function()  {
                           return MAP(props, function(p)  {
                                 if (p.length == 3)  {
                                    return indent(make_function(p[0], p[1][2], p[1][3], p[2], true));
                                 }
                                 var key = p[0], val = parenthesize(p[1], "seq");
                                 if (options.quote_keys)  {
                                    key = encode_string(key);
                                 }
                                  else if (typeof key == "number" || ! beautify && + key + "" == key && parseFloat(key) >= 0)  {
                                    key = make_num(+ key);
                                 }
                                  else if (! is_identifier(key))  {
                                    key = encode_string(key);
                                 }
                                 return indent(add_spaces(beautify && options.space_colon ? [key, ":", val] : [key + ":", val]));
                              }
                           ).join("," + newline);
                        }
                     ) + newline + indent("}");
                     return obj_needs_parens ? "(" + out + ")" : out;
                  }, 
                  regexp:function(rx, mods)  {
                     return "/" + rx + "/" + mods;
                  }, 
                  array:function(elements)  {
                     if (elements.length == 0) return "[]"                     return add_spaces(["[", add_commas(MAP(elements, function(el, i)  {
                                 if (! beautify && el[0] == "atom" && el[1] == "undefined") return i === elements.length - 1 ? "," : ""                                 return parenthesize(el, "seq");
                              }
                           )), "]"]);
                  }, 
                  stat:function(stmt)  {
                     return make(stmt).replace(/;*\s*$/, ";");
                  }, 
                  seq:function()  {
                     return add_commas(MAP(slice(arguments), make));
                  }, 
                  label:function(name, block)  {
                     return add_spaces([make_name(name), ":", make(block)]);
                  }, 
                  with:function(expr, block)  {
                     return add_spaces(["with", "(" + make(expr) + ")", make(block)]);
                  }, 
                  atom:function(name)  {
                     return make_name(name);
                  }} , function()  {
                  return make(ast);
               }
            );
            function make_then(th)  {
               if (th == null) return ";"               if (th[0] == "do")  {
                  return make_block([th]);
               }
               var b = th;
               while (true)  {
                     var type = b[0];
                     if (type == "if")  {
                        if (! b[3]) return make(["block", [th]])                        b = b[3];
                     }
                      else if (type == "while" || type == "do") b = b[2]                      else if (type == "for" || type == "for-in") b = b[4]                      else break                  }
               return make(th);
            }
;
            ;
            function make_function(name, args, body, keyword, no_parens)  {
               var out = keyword || "function";
               if (name)  {
                  out = " " + make_name(name);
               }
               out = "(" + add_commas(MAP(args, make_name)) + ")";
               out = add_spaces([out, make_block(body)]);
               return ! no_parens && needs_parens(this) ? "(" + out + ")" : out;
            }
;
            ;
            function must_has_semicolon(node)  {
               switch(node[0]) {
                  case "with":
 
                     
                  case "while":
 
                        return empty(node[2]);
                     
                  case "for":
 
                     
                  case "for-in":
 
                        return empty(node[4]);
                     
                  case "if":
 
                        if (empty(node[2]) && ! node[3]) return true                        if (node[3])  {
                           if (empty(node[3])) return true                           return must_has_semicolon(node[3]);
                        }
                        return must_has_semicolon(node[2]);
                     
}
;
            }
;
            ;
            function make_block_statements(statements, noindent)  {
               for (var a = [], last = statements.length - 1, i = 0; i <= last; ++i)  {
                     var stat = statements[i];
                     var code = make(stat);
                     if (code != ";")  {
                        if (! beautify && i == last && ! must_has_semicolon(stat))  {
                           code = code.replace(/;+\s*$/, "");
                        }
                        a.push(code);
                     }
                  }
               return noindent ? a : MAP(a, indent);
            }
;
            ;
            function make_switch_block(body)  {
               var n = body.length;
               if (n == 0) return "{}"               return "{" + newline + MAP(body, function(branch, i)  {
                     var has_body = branch[1].length > 0, code = with_indent(function()  {
                           return indent(branch[0] ? add_spaces(["case", make(branch[0]) + ":"]) : "default:");
                        }, 
                        0.5) + has_body ? newline + with_indent(function()  {
                           return make_block_statements(branch[1]).join(newline);
                        }
                     ) : "";
                     if (! beautify && has_body && i < n - 1) code = ";"                     return code;
                  }
               ).join(newline) + newline + indent("}");
            }
;
            ;
            function make_block(statements)  {
               if (! statements) return ";"               if (statements.length == 0) return "{}"               return "{" + newline + with_indent(function()  {
                     return make_block_statements(statements).join(newline);
                  }
               ) + newline + indent("}");
            }
;
            ;
            function make_1vardef(def)  {
               var name = def[0], val = def[1];
               if (val != null) name = add_spaces([make_name(name), "=", parenthesize(val, "seq")])               return name;
            }
;
            ;
         }
;
         ;
         function split_lines(code, max_line_length)  {
            var splits = [0];
            jsp.parse(function()  {
                  var next_token = jsp.tokenizer(code);
                  var last_split = 0;
                  var prev_token;
                  function current_length(tok)  {
                     return tok.pos - last_split;
                  }
;
                  ;
                  function split_here(tok)  {
                     last_split = tok.pos;
                     splits.push(last_split);
                  }
;
                  ;
                  function custom()  {
                     var tok = next_token.apply(this, arguments);
                     out:
 {
                           if (prev_token)  {
                              if (prev_token.type == "keyword") break out                           }
                           if (current_length(tok) > max_line_length)  {
                              switch(tok.type) {
                                 case "keyword":
 
                                    
                                 case "atom":
 
                                    
                                 case "name":
 
                                    
                                 case "punc":
 
                                       split_here(tok);
                                       break out;
                                    
}
;
                           }
                        }
;
                     prev_token = tok;
                     return tok;
                  }
;
                  ;
                  custom.context = function()  {
                     return next_token.context.apply(this, arguments);
                  }
;
                  return custom;
               }
());
            return splits.map(function(pos, i)  {
                  return code.substring(pos, splits[i + 1] || code.length);
               }
            ).join("
");
         }
;
         ;
         function repeat_string(str, i)  {
            if (i <= 0) return ""            if (i == 1) return str            var d = repeat_string(str, i >> 1);
            d = d;
            if (i & 1) d = str            return d;
         }
;
         ;
         function defaults(args, defs)  {
            var ret =  {} ;
            if (args === true) args =  {}             for (var i in defs) if (HOP(defs, i))  {
                  ret[i] = args && HOP(args, i) ? args[i] : defs[i];
               }
            return ret;
         }
;
         ;
         function is_identifier(name)  {
            return /^[a-z_$][a-z0-9_$]*$/i.test(name) && name != "this" && ! HOP(jsp.KEYWORDS_ATOM, name) && ! HOP(jsp.RESERVED_WORDS, name) && ! HOP(jsp.KEYWORDS, name);
         }
;
         ;
         function HOP(obj, prop)  {
            return Object.prototype.hasOwnProperty.call(obj, prop);
         }
;
         ;
         var MAP;
         function()  {
            MAP = function(a, f, o)  {
               var ret = [], top = [], i;
               function doit()  {
                  var val = f.call(o, a[i], i);
                  if (val instanceof AtTop)  {
                     val = val.v;
                     if (val instanceof Splice)  {
                        top.push.apply(top, val.v);
                     }
                      else  {
                        top.push(val);
                     }
                  }
                   else if (val != skip)  {
                     if (val instanceof Splice)  {
                        ret.push.apply(ret, val.v);
                     }
                      else  {
                        ret.push(val);
                     }
                  }
               }
;
               ;
               if (a instanceof Array) for (i = 0; i < a.length; ++i) doit()                else for (i in a) if (HOP(a, i)) doit()               return top.concat(ret);
            }
;
            MAP.at_top = function(val)  {
               return new AtTop(val);
            }
;
            MAP.splice = function(val)  {
               return new Splice(val);
            }
;
            var skip = MAP.skip =  {} ;
            function AtTop(val)  {
               this.v = val;
            }
;
            ;
            function Splice(val)  {
               this.v = val;
            }
;
            ;
         }
();
         exports.ast_walker = ast_walker;
         exports.ast_mangle = ast_mangle;
         exports.ast_squeeze = ast_squeeze;
         exports.ast_lift_variables = ast_lift_variables;
         exports.gen_code = gen_code;
         exports.ast_add_scope = ast_add_scope;
         exports.set_logger = function(logger)  {
            warn = logger;
         }
;
         exports.make_string = make_string;
         exports.split_lines = split_lines;
         exports.MAP = MAP;
         exports.ast_squeeze_more = require("./squeeze-more").ast_squeeze_more;
      }
   );
   define("uglifyjs/index", ["require", "exports", "module", "./parse-js", "./process", "./consolidator"], function(require, exports, module)  {
         function uglify(orig_code, options)  {
            options || options =  {} ;
            var jsp = uglify.parser;
            var pro = uglify.uglify;
            var ast = jsp.parse(orig_code, options.strict_semicolons);
            ast = pro.ast_mangle(ast, options.mangle_options);
            ast = pro.ast_squeeze(ast, options.squeeze_options);
            var final_code = pro.gen_code(ast, options.gen_options);
            return final_code;
         }
;
         ;
         uglify.parser = require("./parse-js");
         uglify.uglify = require("./process");
         uglify.consolidator = require("./consolidator");
         module.exports = uglify;
      }
   );
   define("parse", ["./uglifyjs/index"], function(uglify)  {
         var parser = uglify.parser, processor = uglify.uglify, ostring = Object.prototype.toString, isArray;
         if (Array.isArray)  {
            isArray = Array.isArray;
         }
          else  {
            isArray = function(it)  {
               return ostring.call(it) === "[object Array]";
            }
;
         }
         function isArrayLiteral(node)  {
            return node[0] === "array";
         }
;
         function isObjectLiteral(node)  {
            return node[0] === "object";
         }
;
         function toAstArray(ary)  {
            var output = ["array", []], i, item;
            for (i = 0; item = ary[i]; i++)  {
                  output[1].push(["string", item]);
               }
            return output;
         }
;
         function validateDeps(node)  {
            var newDeps = ["array", []], arrayArgs, i, dep;
            if (! node)  {
               return null;
            }
            if (isObjectLiteral(node) || node[0] === "function")  {
               return node;
            }
            if (! isArrayLiteral(node))  {
               return null;
            }
            arrayArgs = node[1];
            for (i = 0; i < arrayArgs.length; i++)  {
                  dep = arrayArgs[i];
                  if (dep[0] === "string")  {
                     newDeps[1].push(dep);
                  }
               }
            return newDeps[1].length ? newDeps : null;
         }
;
         function getValidDeps(node)  {
            var newDeps = [], arrayArgs, i, dep;
            if (! node)  {
               return null;
            }
            if (isObjectLiteral(node) || node[0] === "function")  {
               return null;
            }
            if (! isArrayLiteral(node))  {
               return null;
            }
            arrayArgs = node[1];
            for (i = 0; i < arrayArgs.length; i++)  {
                  dep = arrayArgs[i];
                  if (dep[0] === "string")  {
                     newDeps.push(dep[1]);
                  }
               }
            return newDeps.length ? newDeps : null;
         }
;
         function parse(moduleName, fileName, fileContents, options)  {
            options = options ||  {} ;
            var moduleDeps = [], result = "", moduleList = [], needsDefine = true, astRoot = parser.parse(fileContents), i, moduleCall, depString;
            parse.recurse(astRoot, function(callName, config, name, deps)  {
                  if (name && isArrayLiteral(name))  {
                     deps = name;
                     name = null;
                  }
                  if (! deps = getValidDeps(deps))  {
                     deps = [];
                  }
                  if (name && name[0] === "string")  {
                     name = name[1];
                  }
                   else  {
                     name = null;
                  }
                  if (callName === "define" && ! name || name === moduleName)  {
                     needsDefine = false;
                  }
                  if (! name)  {
                     moduleDeps = moduleDeps.concat(deps);
                  }
                   else  {
                     moduleList.push( {
                           name:name, 
                           deps:deps                        }
                     );
                  }
                  return ! options.findNestedDependencies;
               }, 
               options);
            if (options.insertNeedsDefine && needsDefine)  {
               result = "require.needsDefine("" + moduleName + "");";
            }
            if (moduleDeps.length || moduleList.length)  {
               for (i = 0; moduleCall = moduleList[i]; i++)  {
                     if (result)  {
                        result = "
";
                     }
                     if (moduleCall.name === moduleName)  {
                        moduleCall.deps = moduleCall.deps.concat(moduleDeps);
                        moduleDeps = [];
                     }
                     depString = moduleCall.deps.length ? "["" + moduleCall.deps.join("","") + ""]" : "[]";
                     result = "define("" + moduleCall.name + ""," + depString + ");";
                  }
               if (moduleDeps.length)  {
                  if (result)  {
                     result = "
";
                  }
                  depString = moduleDeps.length ? "["" + moduleDeps.join("","") + ""]" : "[]";
                  result = "define("" + moduleName + ""," + depString + ");";
               }
            }
            return result ? result : null;
         }
;
         parse.isArray = isArray;
         parse.isObjectLiteral = isObjectLiteral;
         parse.isArrayLiteral = isArrayLiteral;
         parse.recurse = function(parentNode, onMatch, options, recurseCallback)  {
            var hasHas = options && options.has, i, node;
            recurseCallback = recurseCallback || this.parseNode;
            if (isArray(parentNode))  {
               for (i = 0; i < parentNode.length; i++)  {
                     node = parentNode[i];
                     if (isArray(node))  {
                        if (hasHas && node[0] === "if" && node[1] && node[1][0] === "name" && node[1][1] === "true" || node[1][1] === "false")  {
                           if (node[1][1] === "true")  {
                              this.recurse([node[2]], onMatch, options, recurseCallback);
                           }
                            else  {
                              this.recurse([node[3]], onMatch, options, recurseCallback);
                           }
                        }
                         else  {
                           if (recurseCallback(node, onMatch))  {
                              continue;
                           }
                           this.recurse(node, onMatch, options, recurseCallback);
                        }
                     }
                  }
            }
         }
;
         parse.definesRequire = function(fileName, fileContents)  {
            var astRoot = parser.parse(fileContents);
            return this.nodeHasRequire(astRoot);
         }
;
         parse.getAnonDeps = function(fileName, fileContents)  {
            var astRoot = parser.parse(fileContents), defFunc = this.findAnonDefineFactory(astRoot);
            return parse.getAnonDepsFromNode(defFunc);
         }
;
         parse.getAnonDepsFromNode = function(node)  {
            var deps = [], funcArgLength;
            if (node)  {
               this.findRequireDepNames(node, deps);
               funcArgLength = node[2] && node[2].length;
               if (funcArgLength)  {
                  deps = funcArgLength > 1 ? ["require", "exports", "module"] : ["require"].concat(deps);
               }
            }
            return deps;
         }
;
         parse.findAnonDefineFactory = function(node)  {
            var callback, i, n, call, args;
            if (isArray(node))  {
               if (node[0] === "call")  {
                  call = node[1];
                  args = node[2];
                  if (call[0] === "name" && call[1] === "define" || call[0] === "dot" && call[1][1] === "require" && call[2] === "def")  {
                     if (args.length === 1 && args[0][0] === "function")  {
                        return args[0];
                     }
                      else if (args.length === 2 && args[0][0] === "string" && args[1][0] === "function")  {
                        return args[1];
                     }
                  }
               }
               for (i = 0; i < node.length; i++)  {
                     n = node[i];
                     if (callback = this.findAnonDefineFactory(n))  {
                        return callback;
                     }
                  }
            }
            return null;
         }
;
         parse.findConfig = function(fileName, fileContents)  {
            var foundConfig = null, astRoot = parser.parse(fileContents);
            parse.recurse(astRoot, function(configNode)  {
                  var jsConfig;
                  if (! foundConfig && configNode)  {
                     jsConfig = parse.nodeToString(configNode);
                     foundConfig = eval("(" + jsConfig + ")");
                     return foundConfig;
                  }
                  return undefined;
               }, 
               null, parse.parseConfigNode);
            return foundConfig;
         }
;
         parse.findDependencies = function(fileName, fileContents, options)  {
            var dependencies = [], astRoot = parser.parse(fileContents);
            parse.recurse(astRoot, function(callName, config, name, deps)  {
                  if (name && isArrayLiteral(name))  {
                     deps = name;
                     name = null;
                  }
                  if (deps = getValidDeps(deps))  {
                     dependencies = dependencies.concat(deps);
                  }
               }, 
               options);
            return dependencies;
         }
;
         parse.findCjsDependencies = function(fileName, fileContents, options)  {
            var dependencies = [], astRoot = parser.parse(fileContents);
            parse.recurse(astRoot, function(dep)  {
                  dependencies.push(dep);
               }, 
               options, function(node, onMatch)  {
                  var call, args;
                  if (! isArray(node))  {
                     return false;
                  }
                  if (node[0] === "call")  {
                     call = node[1];
                     args = node[2];
                     if (call)  {
                        if (call[0] === "name" && call[1] === "require" && args[0][0] === "string")  {
                           return onMatch(args[0][1]);
                        }
                     }
                  }
                  return false;
               }
            );
            return dependencies;
         }
;
         parse.usesAmdOrRequireJs = function(fileName, fileContents, options)  {
            var astRoot = parser.parse(fileContents), uses;
            parse.recurse(astRoot, function(prop)  {
                  if (! uses)  {
                     uses =  {} ;
                  }
                  uses[prop] = true;
               }, 
               options, parse.findAmdOrRequireJsNode);
            return uses;
         }
;
         parse.usesCommonJs = function(fileName, fileContents, options)  {
            var uses = null, assignsExports = false, astRoot = parser.parse(fileContents);
            parse.recurse(astRoot, function(prop)  {
                  if (prop === "varExports")  {
                     assignsExports = true;
                  }
                   else if (prop !== "exports" || ! assignsExports)  {
                     if (! uses)  {
                        uses =  {} ;
                     }
                     uses[prop] = true;
                  }
               }, 
               options, function(node, onMatch)  {
                  var call, args;
                  if (! isArray(node))  {
                     return false;
                  }
                  if (node[0] === "name" && node[1] === "__dirname" || node[1] === "__filename")  {
                     return onMatch(node[1].substring(2));
                  }
                   else if (node[0] === "var" && node[1] && node[1][0] && node[1][0][0] === "exports")  {
                     return onMatch("varExports");
                  }
                   else if (node[0] === "assign" && node[2] && node[2][0] === "dot")  {
                     args = node[2][1];
                     if (args)  {
                        if (args[0] === "name" && args[1] === "module" && node[2][2] === "exports")  {
                           return onMatch("moduleExports");
                        }
                         else if (args[0] === "name" && args[1] === "exports")  {
                           return onMatch("exports");
                        }
                     }
                  }
                   else if (node[0] === "call")  {
                     call = node[1];
                     args = node[2];
                     if (call)  {
                        if (call[0] === "name" && call[1] === "require" && args[0][0] === "string")  {
                           return onMatch("require");
                        }
                     }
                  }
                  return false;
               }
            );
            return uses;
         }
;
         parse.findRequireDepNames = function(node, deps)  {
            var moduleName, i, n, call, args;
            if (isArray(node))  {
               if (node[0] === "call")  {
                  call = node[1];
                  args = node[2];
                  if (call && call[0] === "name" && call[1] === "require")  {
                     moduleName = args[0];
                     if (moduleName[0] === "string")  {
                        deps.push(moduleName[1]);
                     }
                  }
               }
               for (i = 0; i < node.length; i++)  {
                     n = node[i];
                     this.findRequireDepNames(n, deps);
                  }
            }
         }
;
         parse.nodeHasRequire = function(node)  {
            if (this.isDefineNode(node))  {
               return true;
            }
            if (isArray(node))  {
               for (var i = 0, n; i < node.length; i++)  {
                     n = node[i];
                     if (this.nodeHasRequire(n))  {
                        return true;
                     }
                  }
            }
            return false;
         }
;
         parse.isDefineNode = function(node)  {
            var assign;
            if (! node)  {
               return null;
            }
            if (node[0] === "assign" && node[1] === true)  {
               assign = node[2];
               if (assign[0] === "dot" && assign[1][0] === "name" && assign[1][1] === "define" && assign[2] === "amd")  {
                  return true;
               }
            }
            return false;
         }
;
         parse.parseNode = function(node, onMatch)  {
            var call, name, config, deps, args, cjsDeps;
            if (! isArray(node))  {
               return false;
            }
            if (node[0] === "call")  {
               call = node[1];
               args = node[2];
               if (call)  {
                  if (call[0] === "name" && call[1] === "require" || call[1] === "requirejs")  {
                     config = args[0];
                     deps = args[1];
                     if (isArrayLiteral(config))  {
                        deps = config;
                        config = null;
                     }
                     if (! deps = validateDeps(deps))  {
                        return null;
                     }
                     return onMatch("require", null, null, deps);
                  }
                   else if (call[0] === "name" && call[1] === "define")  {
                     name = args[0];
                     deps = args[1];
                     if (name[0] === "string" || isArrayLiteral(name) || name[0] === "function" || isObjectLiteral(name) && ! deps || isArrayLiteral(deps) || deps[0] === "function" || isObjectLiteral(deps) || isArrayLiteral(name) && deps[0] === "name" && args.length === 2)  {
                        if (name && name[0] === "function")  {
                           cjsDeps = parse.getAnonDepsFromNode(name);
                           if (cjsDeps.length)  {
                              name = toAstArray(cjsDeps);
                           }
                        }
                         else if (deps && deps[0] === "function")  {
                           cjsDeps = parse.getAnonDepsFromNode(deps);
                           if (cjsDeps.length)  {
                              deps = toAstArray(cjsDeps);
                           }
                        }
                        return onMatch("define", null, name, deps);
                     }
                  }
               }
            }
            return false;
         }
;
         parse.findAmdOrRequireJsNode = function(node, onMatch)  {
            var call, args, configNode, type;
            if (! isArray(node))  {
               return false;
            }
            if (node[0] === "defun" && node[1] === "define")  {
               type = "declaresDefine";
            }
             else if (node[0] === "assign" && node[2] && node[2][2] === "amd" && node[2][1] && node[2][1][0] === "name" && node[2][1][1] === "define")  {
               type = "defineAmd";
            }
             else if (node[0] === "call")  {
               call = node[1];
               args = node[2];
               if (call)  {
                  if (call[0] === "dot" && call[1] && call[1][0] === "name" && call[1][1] === "require" || call[1][1] === "requirejs" && call[2] === "config")  {
                     type = call[1][1] + "Config";
                  }
                   else if (call[0] === "name" && call[1] === "require" || call[1] === "requirejs")  {
                     configNode = args[0];
                     if (configNode[0] === "object" || configNode[0] === "array")  {
                        type = call[1];
                     }
                  }
                   else if (call[0] === "name" && call[1] === "define")  {
                     type = "define";
                  }
               }
            }
            if (type)  {
               return onMatch(type);
            }
            return false;
         }
;
         parse.parseConfigNode = function(node, onMatch)  {
            var call, configNode, args;
            if (! isArray(node))  {
               return false;
            }
            if (node[0] === "call")  {
               call = node[1];
               args = node[2];
               if (call)  {
                  if (call[0] === "dot" && call[1] && call[1][0] === "name" && call[1][1] === "require" || call[1][1] === "requirejs" && call[2] === "config" || call[0] === "name" && call[1] === "require" || call[1] === "requirejs")  {
                     configNode = args[0];
                     if (configNode[0] !== "object")  {
                        return null;
                     }
                     return onMatch(configNode);
                  }
               }
            }
            return false;
         }
;
         parse.nodeToString = function(node)  {
            return processor.gen_code(node, true);
         }
;
         return parse;
      }
   );
   define("pragma", ["parse", "logger"], function(parse, logger)  {
         function Temp()  {
         }
;
         function create(obj, mixin)  {
            Temp.prototype = obj;
            var temp = new Temp(), prop;
            Temp.prototype = null;
            if (mixin)  {
               for (prop in mixin)  {
                     if (mixin.hasOwnProperty(prop) && ! prop in temp)  {
                        temp[prop] = mixin[prop];
                     }
                  }
            }
            return temp;
         }
;
         var pragma =  {
            conditionalRegExp:/(exclude|include)Start\s*\(\s*["'](\w+)["']\s*,(.*)\)/, 
            useStrictRegExp:/['"]use strict['"];/g, 
            hasRegExp:/has\s*\(\s*['"]([^'"]+)['"]\s*\)/g, 
            nsRegExp:/(^|[^\.])(requirejs|require|define)\s*\(/, 
            nsWrapRegExp:/\/\*requirejs namespace: true \*\//, 
            apiDefRegExp:/var requirejs, require, define;/, 
            defineCheckRegExp:/typeof\s+define\s*===\s*["']function["']\s*&&\s*define\s*\.\s*amd/g, 
            defineJQueryRegExp:/typeof\s+define\s*===\s*["']function["']\s*&&\s*define\s*\.\s*amd\s*&&\s*define\s*\.\s*amd\s*\.\s*jQuery/g, 
            defineHasRegExp:/typeof\s+define\s*==(=)?\s*['"]function['"]\s*&&\s*typeof\s+define\.amd\s*==(=)?\s*['"]object['"]\s*&&\s*define\.amd/g, 
            defineTernaryRegExp:/typeof\s+define\s*===\s*['"]function["']\s*&&\s*define\s*\.\s*amd\s*\?\s*define/, 
            amdefineRegExp:/if\s*\(\s*typeof define\s*\!==\s*'function'\s*\)\s*\{\s*[^\{\}]+amdefine[^\{\}]+\}/g, 
            removeStrict:function(contents, config)  {
               return config.useStrict ? contents : contents.replace(pragma.useStrictRegExp, "");
            }, 
            namespace:function(fileContents, ns, onLifecycleName)  {
               if (ns)  {
                  fileContents = fileContents.replace(pragma.nsRegExp, "$1" + ns + ".$2(");
                  fileContents = fileContents.replace(pragma.defineTernaryRegExp, "typeof " + ns + ".define === 'function' && " + ns + ".define.amd ? " + ns + ".define");
                  fileContents = fileContents.replace(pragma.defineJQueryRegExp, "typeof " + ns + ".define === 'function' && " + ns + ".define.amd && " + ns + ".define.amd.jQuery");
                  fileContents = fileContents.replace(pragma.defineHasRegExp, "typeof " + ns + ".define === 'function' && typeof " + ns + ".define.amd === 'object' && " + ns + ".define.amd");
                  fileContents = fileContents.replace(pragma.defineCheckRegExp, "typeof " + ns + ".define === 'function' && " + ns + ".define.amd");
                  if (pragma.apiDefRegExp.test(fileContents) && fileContents.indexOf("if (typeof " + ns + " === 'undefined')") === - 1)  {
                     fileContents = "var " + ns + ";(function () { if (typeof " + ns + " === 'undefined') {
" + ns + " = {};
" + fileContents + "
" + ns + ".requirejs = requirejs;" + ns + ".require = require;" + ns + ".define = define;
" + "}
}());";
                  }
                  if (pragma.nsWrapRegExp.test(fileContents))  {
                     fileContents = fileContents.replace(pragma.nsWrapRegExp, "");
                     fileContents = "(function () {
" + "var require = " + ns + ".require," + "requirejs = " + ns + ".requirejs," + "define = " + ns + ".define;
" + fileContents + "
}());";
                  }
               }
               return fileContents;
            }, 
            process:function(fileName, fileContents, config, onLifecycleName, pluginCollector)  {
               var foundIndex = - 1, startIndex = 0, lineEndIndex, conditionLine, matches, type, marker, condition, isTrue, endRegExp, endMatches, endMarkerIndex, shouldInclude, startLength, lifecycleHas, deps, i, dep, moduleName, lifecyclePragmas, pragmas = config.pragmas, hasConfig = config.has, kwArgs = pragmas;
               if (onLifecycleName)  {
                  lifecyclePragmas = config["pragmas" + onLifecycleName];
                  lifecycleHas = config["has" + onLifecycleName];
                  if (lifecyclePragmas)  {
                     pragmas = create(pragmas ||  {} , lifecyclePragmas);
                  }
                  if (lifecycleHas)  {
                     hasConfig = create(hasConfig ||  {} , lifecycleHas);
                  }
               }
               if (hasConfig)  {
                  fileContents = fileContents.replace(pragma.hasRegExp, function(match, test)  {
                        if (test in hasConfig)  {
                           return ! ! hasConfig[test];
                        }
                        return match;
                     }
                  );
               }
               if (! config.skipPragmas)  {
                  while (foundIndex = fileContents.indexOf("//>>", startIndex) !== - 1)  {
                        lineEndIndex = fileContents.indexOf("
", foundIndex);
                        if (lineEndIndex === - 1)  {
                           lineEndIndex = fileContents.length - 1;
                        }
                        startIndex = lineEndIndex + 1;
                        conditionLine = fileContents.substring(foundIndex, lineEndIndex + 1);
                        matches = conditionLine.match(pragma.conditionalRegExp);
                        if (matches)  {
                           type = matches[1];
                           marker = matches[2];
                           condition = matches[3];
                           isTrue = false;
                           try {
                              isTrue = ! ! eval("(" + condition + ")");
                           }
                           catch (e) {
                              throw "Error in file: " + fileName + ". Conditional comment: " + conditionLine + " failed with this error: " + e;
                           }
                           endRegExp = new RegExp("\/\/\>\>\s*" + type + "End\(\s*['"]" + marker + "['"]\s*\)", "g");
                           endMatches = endRegExp.exec(fileContents.substring(startIndex, fileContents.length));
                           if (endMatches)  {
                              endMarkerIndex = startIndex + endRegExp.lastIndex - endMatches[0].length;
                              lineEndIndex = fileContents.indexOf("
", endMarkerIndex);
                              if (lineEndIndex === - 1)  {
                                 lineEndIndex = fileContents.length - 1;
                              }
                              shouldInclude = type === "exclude" && ! isTrue || type === "include" && isTrue;
                              startLength = startIndex - foundIndex;
                              fileContents = fileContents.substring(0, foundIndex) + shouldInclude ? fileContents.substring(startIndex, endMarkerIndex) : "" + fileContents.substring(lineEndIndex + 1, fileContents.length);
                              startIndex = foundIndex;
                           }
                            else  {
                              throw "Error in file: " + fileName + ". Cannot find end marker for conditional comment: " + conditionLine;
                           }
                        }
                     }
               }
               if (config.optimizeAllPluginResources && pluginCollector)  {
                  try {
                     deps = parse.findDependencies(fileName, fileContents);
                     if (deps.length)  {
                        for (i = 0; dep = deps[i]; i++)  {
                              if (dep.indexOf("!") !== - 1)  {
                                 pluginCollector[moduleName] || pluginCollector[moduleName] = [].push(dep);
                              }
                           }
                     }
                  }
                  catch (eDep) {
                     logger.error("Parse error looking for plugin resources in " + fileName + ", skipping.");
                  }
               }
               fileContents = fileContents.replace(pragma.amdefineRegExp, "");
               if (onLifecycleName === "OnSave" && config.namespace)  {
                  fileContents = pragma.namespace(fileContents, config.namespace, onLifecycleName);
               }
               return pragma.removeStrict(fileContents, config);
            }} ;
         return pragma;
      }
   );
   if (env === "node")  {
      define("node/optimize",  {} );
   }
   if (env === "rhino")  {
      define("rhino/optimize", ["logger"], function(logger)  {
            if (! Array.prototype.reduce)  {
               Array.prototype.reduce = function(fn)  {
                  var i = 0, length = this.length, accumulator;
                  if (arguments.length >= 2)  {
                     accumulator = arguments[1];
                  }
                   else  {
                     do  {
                           if (i in this)  {
                              accumulator = this[i++];
                              break;
                           }
                        }
 while (true)                  }
                  for (; i < length; i++)  {
                        if (i in this)  {
                           accumulator = fn.call(undefined, accumulator, this[i], i, this);
                        }
                     }
                  return accumulator;
               }
;
            }
            var JSSourceFilefromCode, optimize;
            try {
               JSSourceFilefromCode = java.lang.Class.forName("com.google.javascript.jscomp.JSSourceFile").getMethod("fromCode", [java.lang.String, java.lang.String]);
            }
            catch (e) {
            }
            function closurefromCode(filename, content)  {
               return JSSourceFilefromCode.invoke(null, [filename, content]);
            }
;
            optimize =  {
               closure:function(fileName, fileContents, keepLines, config)  {
                  config = config ||  {} ;
                  var jscomp = Packages.com.google.javascript.jscomp, flags = Packages.com.google.common.flags, externSourceFile = closurefromCode("fakeextern.js", " "), jsSourceFile = closurefromCode(String(fileName), String(fileContents)), options, option, FLAG_compilation_level, compiler, Compiler = Packages.com.google.javascript.jscomp.Compiler, result;
                  logger.trace("Minifying file: " + fileName);
                  options = new jscomp.CompilerOptions();
                  for (option in config.CompilerOptions)  {
                        if (config.CompilerOptions[option])  {
                           options[option] = config.CompilerOptions[option];
                        }
                     }
                  options.prettyPrint = keepLines || options.prettyPrint;
                  FLAG_compilation_level = jscomp.CompilationLevel[config.CompilationLevel || "SIMPLE_OPTIMIZATIONS"];
                  FLAG_compilation_level.setOptionsForCompilationLevel(options);
                  Compiler.setLoggingLevel(Packages.java.util.logging.Level[config.loggingLevel || "WARNING"]);
                  compiler = new Compiler();
                  result = compiler.compile(externSourceFile, jsSourceFile, options);
                  if (! result.success)  {
                     logger.error("Cannot closure compile file: " + fileName + ". Skipping it.");
                  }
                   else  {
                     fileContents = compiler.toSource();
                  }
                  return fileContents;
               }} ;
            return optimize;
         }
      );
   }
   define("optimize", ["lang", "logger", "env!env/optimize", "env!env/file", "parse", "pragma", "uglifyjs/index"]);
   function ✖(lang, logger, envOptimize, file, parse, pragma, uglify)  {
      var optimize, cssImportRegExp = /\@import\s+(url\()?\s*([^);]+)\s*(\))?([\w, ]*)(;)?/g, cssCommentImportRegExp = /\/\*[^\*]*@import[^\*]*\*\//g, cssUrlRegExp = /\url\(\s*([^\)]+)\s*\)?/g;
      function cleanCssUrlQuotes(url)  {
         url = url.replace(/\s+$/, "");
         if (url.charAt(0) === "'" || url.charAt(0) === """)  {
            url = url.substring(1, url.length - 1);
         }
         return url;
      }
;
      function flattenCss(fileName, fileContents, cssImportIgnore, included)  {
         fileName = fileName.replace(lang.backSlashRegExp, "/");
         var endIndex = fileName.lastIndexOf("/"), filePath = endIndex !== - 1 ? fileName.substring(0, endIndex + 1) : "", importList = [];
         fileContents = fileContents.replace(cssCommentImportRegExp, "");
         if (cssImportIgnore && cssImportIgnore.charAt(cssImportIgnore.length - 1) !== ",")  {
            cssImportIgnore = ",";
         }
         fileContents = fileContents.replace(cssImportRegExp, function(fullMatch, urlStart, importFileName, urlEnd, mediaTypes)  {
               if (mediaTypes && mediaTypes.replace(/^\s\s*/, "").replace(/\s\s*$/, "") !== "all")  {
                  return fullMatch;
               }
               importFileName = cleanCssUrlQuotes(importFileName);
               if (cssImportIgnore && cssImportIgnore.indexOf(importFileName + ",") !== - 1)  {
                  return fullMatch;
               }
               importFileName = importFileName.replace(lang.backSlashRegExp, "/");
               try {
                  var fullImportFileName = importFileName.charAt(0) === "/" ? importFileName : filePath + importFileName, importContents = file.readFile(fullImportFileName), i, importEndIndex, importPath, fixedUrlMatch, colonIndex, parts, flat;
                  if (included[fullImportFileName])  {
                     return "";
                  }
                  included[fullImportFileName] = true;
                  flat = flattenCss(fullImportFileName, importContents, cssImportIgnore, included);
                  importContents = flat.fileContents;
                  if (flat.importList.length)  {
                     importList.push.apply(importList, flat.importList);
                  }
                  importEndIndex = importFileName.lastIndexOf("/");
                  importPath = importEndIndex !== - 1 ? importFileName.substring(0, importEndIndex + 1) : "";
                  importPath = importPath.replace(/^\.\//, "");
                  importContents = importContents.replace(cssUrlRegExp, function(fullMatch, urlMatch)  {
                        fixedUrlMatch = cleanCssUrlQuotes(urlMatch);
                        fixedUrlMatch = fixedUrlMatch.replace(lang.backSlashRegExp, "/");
                        colonIndex = fixedUrlMatch.indexOf(":");
                        if (fixedUrlMatch.charAt(0) !== "/" && colonIndex === - 1 || colonIndex > fixedUrlMatch.indexOf("/"))  {
                           urlMatch = importPath + fixedUrlMatch;
                        }
                         else  {
                           logger.trace(importFileName + "
  URL not a relative URL, skipping: " + urlMatch);
                        }
                        parts = urlMatch.split("/");
                        for (i = parts.length - 1; i > 0; i--)  {
                              if (parts[i] === ".")  {
                                 parts.splice(i, 1);
                              }
                               else if (parts[i] === "..")  {
                                 if (i !== 0 && parts[i - 1] !== "..")  {
                                    parts.splice(i - 1, 2);
                                    i = 1;
                                 }
                              }
                           }
                        return "url(" + parts.join("/") + ")";
                     }
                  );
                  importList.push(fullImportFileName);
                  return importContents;
               }
               catch (e) {
                  logger.warn(fileName + "
  Cannot inline css import, skipping: " + importFileName);
                  return fullMatch;
               }
            }
         );
         return  {
            importList:importList, 
            fileContents:fileContents         }
;
      }
;
      optimize =  {
         licenseCommentRegExp:/\/\*[\s\S]*?\*\//g, 
         jsFile:function(fileName, fileContents, outFileName, config, pluginCollector)  {
            var parts = config.optimize + "".split("."), optimizerName = parts[0], keepLines = parts[1] === "keepLines";
            if (! fileContents)  {
               fileContents = file.readFile(fileName);
            }
            fileContents = optimize.js(fileName, fileContents, optimizerName, keepLines, config, pluginCollector);
            file.saveUtf8File(outFileName, fileContents);
         }, 
         js:function(fileName, fileContents, optimizerName, keepLines, config, pluginCollector)  {
            var licenseContents = "", optFunc, match, comment;
            config = config ||  {} ;
            fileContents = pragma.process(fileName, fileContents, config, "OnSave", pluginCollector);
            if (optimizerName && optimizerName !== "none")  {
               optFunc = envOptimize[optimizerName] || optimize.optimizers[optimizerName];
               if (! optFunc)  {
                  throw new Error("optimizer with name of "" + optimizerName + "" not found for this environment");
               }
               if (config.preserveLicenseComments)  {
                  optimize.licenseCommentRegExp.lastIndex = 0;
                  while (match = optimize.licenseCommentRegExp.exec(fileContents))  {
                        comment = match[0];
                        if (comment.indexOf("@license") !== - 1 || comment.indexOf("/*!") === 0)  {
                           licenseContents = comment + "
";
                        }
                     }
               }
               fileContents = licenseContents + optFunc(fileName, fileContents, keepLines, config[optimizerName]);
            }
            return fileContents;
         }, 
         cssFile:function(fileName, outFileName, config)  {
            var originalFileContents = file.readFile(fileName), flat = flattenCss(fileName, originalFileContents, config.cssImportIgnore,  {} ), fileContents = flat.fileContents, startIndex, endIndex, buildText;
            try {
               if (config.optimizeCss.indexOf(".keepComments") === - 1)  {
                  startIndex = - 1;
                  while (startIndex = fileContents.indexOf("/*") !== - 1)  {
                        endIndex = fileContents.indexOf("*/", startIndex + 2);
                        if (endIndex === - 1)  {
                           throw "Improper comment in CSS file: " + fileName;
                        }
                        fileContents = fileContents.substring(0, startIndex) + fileContents.substring(endIndex + 2, fileContents.length);
                     }
               }
               if (config.optimizeCss.indexOf(".keepLines") === - 1)  {
                  fileContents = fileContents.replace(/[\r\n]/g, "");
                  fileContents = fileContents.replace(/\s+/g, " ");
                  fileContents = fileContents.replace(/\{\s/g, "{");
                  fileContents = fileContents.replace(/\s\}/g, "}");
               }
                else  {
                  fileContents = fileContents.replace(/(\r\n)+/g, "
");
                  fileContents = fileContents.replace(/(\n)+/g, "
");
               }
            }
            catch (e) {
               fileContents = originalFileContents;
               logger.error("Could not optimized CSS file: " + fileName + ", error: " + e);
            }
            file.saveUtf8File(outFileName, fileContents);
            buildText = "
" + outFileName.replace(config.dir, "") + "
----------------
";
            flat.importList.push(fileName);
            buildText = flat.importList.map(function(path)  {
                  return path.replace(config.dir, "");
               }
            ).join("
");
            return buildText + "
";
         }, 
         css:function(startDir, config)  {
            var buildText = "", i, fileName, fileList;
            if (config.optimizeCss.indexOf("standard") !== - 1)  {
               fileList = file.getFilteredFileList(startDir, /\.css$/, true);
               if (fileList)  {
                  for (i = 0; i < fileList.length; i++)  {
                        fileName = fileList[i];
                        logger.trace("Optimizing (" + config.optimizeCss + ") CSS file: " + fileName);
                        buildText = optimize.cssFile(fileName, fileName, config);
                     }
               }
            }
            return buildText;
         }, 
         optimizers: {
            uglify:function(fileName, fileContents, keepLines, config)  {
               var parser = uglify.parser, processor = uglify.uglify, ast;
               config = config ||  {} ;
               logger.trace("Uglifying file: " + fileName);
               try {
                  ast = parser.parse(fileContents, config.strict_semicolons);
                  ast = processor.ast_mangle(ast, config);
                  ast = processor.ast_squeeze(ast, config);
                  fileContents = processor.gen_code(ast, config);
               }
               catch (e) {
                  logger.error("Cannot uglify file: " + fileName + ". Skipping it. Error is:
" + e.toString());
               }
               return fileContents;
            }}       }
;
      return optimize;
   }
;
   ;
   define("requirePatch", ["env!env/file", "pragma", "parse"]);
   function ✖(file, pragma, parse)  {
      var allowRun = true;
      return function()  {
         if (! allowRun)  {
            return ;
         }
         allowRun = false;
         var layer, pluginBuilderRegExp = /(["']?)pluginBuilder(["']?)\s*[=\:]\s*["']([^'"\s]+)["']/, oldDef;
         require.onError = function(err)  {
            var msg = "
In module tree:
", standardIndent = "  ", tree = err.moduleTree, i, j, mod;
            if (tree && tree.length > 0)  {
               for (i = tree.length - 1; i > - 1 && mod = tree[i]; i--)  {
                     for (j = tree.length - i; j > - 1; j--)  {
                           msg = standardIndent;
                        }
                     msg = mod + "
";
                  }
               err = new Error(err.toString() + msg);
            }
            throw err;
         }
;
         require._cachedFileContents =  {} ;
         require._buildReset = function()  {
            var oldContext = require.s.contexts._;
            delete require.s.contexts._;
            require( {} );
            layer = require._layer =  {
               buildPathMap: {} , 
               buildFileToModule: {} , 
               buildFilePaths:[], 
               pathAdded: {} , 
               modulesWithNames: {} , 
               needsDefine: {} , 
               existingRequireUrl:"", 
               context:require.s.contexts._            }
;
            return oldContext;
         }
;
         require._buildReset();
         require._isSupportedBuildUrl = function(url)  {
            return url.indexOf("://") === - 1 && url.indexOf("?") === - 1 && url.indexOf("empty:") !== 0 && url.indexOf("//") !== 0;
         }
;
         oldDef = define;
         define = function(name, obj)  {
            if (typeof name === "string" && ! layer.needsDefine[name])  {
               layer.modulesWithNames[name] = true;
            }
            return oldDef.apply(require, arguments);
         }
;
         define.amd = oldDef.amd;
         require._readFile = file.readFile;
         require._fileExists = function(path)  {
            return file.exists(path);
         }
;
         function normalizeUrlWithBase(context, moduleName, url)  {
            if (require.jsExtRegExp.test(moduleName))  {
               url = context.config.dir || context.config.dirBaseUrl + url;
            }
            return url;
         }
;
         require.load = function(context, moduleName, url)  {
            var contents, pluginBuilderMatch, builderName;
            context.scriptCount = 1;
            if (require._isSupportedBuildUrl(url))  {
               url = normalizeUrlWithBase(context, moduleName, url);
               layer.buildPathMap[moduleName] = url;
               layer.buildFileToModule[url] = moduleName;
               if (moduleName in context.plugins)  {
                  context.needFullExec[moduleName] = true;
               }
               try {
                  if (url in require._cachedFileContents && ! context.needFullExec[moduleName] || context.fullExec[moduleName])  {
                     contents = require._cachedFileContents[url];
                  }
                   else  {
                     contents = file.readFile(url);
                     if (context.config.onBuildRead)  {
                        contents = context.config.onBuildRead(moduleName, url, contents);
                     }
                     contents = pragma.process(url, contents, context.config, "OnExecute");
                     try {
                        if (! layer.existingRequireUrl && parse.definesRequire(url, contents))  {
                           layer.existingRequireUrl = url;
                        }
                     }
                     catch (e1) {
                        throw new Error("Parse error using UglifyJS " + "for file: " + url + "
" + e1);
                     }
                     if (moduleName in context.plugins)  {
                        pluginBuilderMatch = pluginBuilderRegExp.exec(contents);
                        if (pluginBuilderMatch)  {
                           builderName = context.normalize(pluginBuilderMatch[3], moduleName);
                           contents = file.readFile(context.nameToUrl(builderName));
                        }
                     }
                     try {
                        if (! context.needFullExec[moduleName])  {
                           contents = parse(moduleName, url, contents,  {
                                 insertNeedsDefine:true, 
                                 has:context.config.has, 
                                 findNestedDependencies:context.config.findNestedDependencies                              }
                           );
                        }
                     }
                     catch (e2) {
                        throw new Error("Parse error using UglifyJS " + "for file: " + url + "
" + e2);
                     }
                     require._cachedFileContents[url] = contents;
                  }
                  if (contents)  {
                     eval(contents);
                  }
                  try {
                     context.completeLoad(moduleName);
                  }
                  catch (e) {
                     e.moduleTree || e.moduleTree = [].push(moduleName);
                     throw e;
                  }
               }
               catch (eOuter) {
                  if (! eOuter.fileName)  {
                     eOuter.fileName = url;
                  }
                  throw eOuter;
               }
            }
             else  {
               context.completeLoad(moduleName);
            }
            context.loaded[moduleName] = true;
         }
;
         require.onResourceLoad = function(context, map)  {
            var fullName = map.fullName, url;
            if (context.fake[fullName])  {
               return ;
            }
            if (map.prefix)  {
               if (! layer.pathAdded[fullName])  {
                  layer.buildFilePaths.push(fullName);
                  layer.buildPathMap[fullName] = fullName;
                  layer.buildFileToModule[fullName] = fullName;
                  layer.modulesWithNames[fullName] = true;
                  layer.pathAdded[fullName] = true;
               }
            }
             else if (map.url && require._isSupportedBuildUrl(map.url))  {
               url = normalizeUrlWithBase(context, map.fullName, map.url);
               if (! layer.pathAdded[url] && layer.buildPathMap[fullName])  {
                  layer.buildFilePaths.push(url);
                  layer.pathAdded[url] = true;
               }
            }
         }
;
         require.needsDefine = function(moduleName)  {
            layer.needsDefine[moduleName] = true;
         }
;
         require.execCb = function(name, cb, args, exports)  {
            if (! layer.needsDefine[name])  {
               layer.modulesWithNames[name] = true;
            }
            if (cb.__requireJsBuild || layer.context.needFullExec[name])  {
               return cb.apply(exports, args);
            }
            return undefined;
         }
;
      }
;
   }
;
   ;
   define("commonJs", ["env!env/file", "uglifyjs/index"], function(file, uglify)  {
         var commonJs =  {
            depRegExp:/require\s*\(\s*["']([\w-_\.\/]+)["']\s*\)/g, 
            useRhino:true, 
            useLog:true, 
            convertDir:function(commonJsPath, savePath)  {
               var fileList, i, jsFileRegExp = /\.js$/, fileName, convertedFileName, fileContents;
               fileList = file.getFilteredFileList(commonJsPath, /\w/, true);
               commonJsPath = commonJsPath.replace(/\\/g, "/");
               savePath = savePath.replace(/\\/g, "/");
               if (commonJsPath.charAt(commonJsPath.length - 1) === "/")  {
                  commonJsPath = commonJsPath.substring(0, commonJsPath.length - 1);
               }
               if (savePath.charAt(savePath.length - 1) === "/")  {
                  savePath = savePath.substring(0, savePath.length - 1);
               }
               if (! fileList || ! fileList.length)  {
                  if (commonJs.useLog)  {
                     if (commonJsPath === "convert")  {
                        console.log("

" + commonJs.convert(savePath, file.readFile(savePath)));
                     }
                      else  {
                        console.log("No files to convert in directory: " + commonJsPath);
                     }
                  }
               }
                else  {
                  for (i = 0; fileName = fileList[i]; i++)  {
                        convertedFileName = fileName.replace(commonJsPath, savePath);
                        if (jsFileRegExp.test(fileName))  {
                           fileContents = file.readFile(fileName);
                           fileContents = commonJs.convert(fileName, fileContents);
                           file.saveUtf8File(convertedFileName, fileContents);
                        }
                         else  {
                           file.copyFile(fileName, convertedFileName, true);
                        }
                     }
               }
            }, 
            removeComments:function(fileContents, fileName)  {
               return uglify.uglify.gen_code(uglify.parser.parse(fileContents), true);
            }, 
            defRegExp:/define\s*\(\s*("|'|\[|function)/, 
            rjsRegExp:/require\s*\(\s*(\[|function)/, 
            convert:function(fileName, fileContents, skipDeps)  {
               try {
                  var deps = [], depName, match, tempContents = commonJs.removeComments(fileContents, fileName);
                  if (commonJs.defRegExp.test(tempContents) || commonJs.rjsRegExp.test(tempContents))  {
                     return fileContents;
                  }
                  commonJs.depRegExp.lastIndex = 0;
                  if (! skipDeps)  {
                     while (match = commonJs.depRegExp.exec(tempContents))  {
                           depName = match[1];
                           if (depName)  {
                              deps.push(""" + depName + """);
                           }
                        }
                  }
                  fileContents = "define(["require", "exports", "module"" + deps.length ? ", " + deps.join(",") : "" + "], " + "function(require, exports, module) {
" + fileContents + "
});
";
               }
               catch (e) {
                  console.log("COULD NOT CONVERT: " + fileName + ", so skipping it. Error was: " + e);
                  return fileContents;
               }
               return fileContents;
            }} ;
         return commonJs;
      }
   );
   define("build", ["lang", "logger", "env!env/file", "parse", "optimize", "pragma", "env!env/load", "requirePatch"]);
   function ✖(lang, logger, file, parse, optimize, pragma, load, requirePatch)  {
      "use strict";
      var build, buildBaseConfig, endsWithSemiColonRegExp = /;\s*$/;
      buildBaseConfig =  {
         appDir:"", 
         pragmas: {} , 
         paths: {} , 
         optimize:"uglify", 
         optimizeCss:"standard.keepLines", 
         inlineText:true, 
         isBuild:true, 
         optimizeAllPluginResources:false, 
         findNestedDependencies:false, 
         preserveLicenseComments:true, 
         dirExclusionRegExp:file.dirExclusionRegExp      }
;
      function addSemiColon(text)  {
         if (endsWithSemiColonRegExp.test(text))  {
            return text;
         }
          else  {
            return text + ";";
         }
      }
;
      function disallowUrls(path)  {
         if (path.indexOf("://") !== - 1 || path.indexOf("//") === 0 && path !== "empty:")  {
            throw new Error("Path is not supported: " + path + "
Optimizer can only handle" + " local paths. Download the locally if necessary" + " and update the config to use a local path.
" + "http://requirejs.org/docs/errors.html#pathnotsupported");
         }
      }
;
      function endsWithSlash(dirName)  {
         if (dirName.charAt(dirName.length - 1) !== "/")  {
            dirName = "/";
         }
         disallowUrls(dirName);
         return dirName;
      }
;
      function makeWriteFile(anonDefRegExp, namespaceWithDot, layer)  {
         function writeFile(name, contents)  {
            logger.trace("Saving plugin-optimized file: " + name);
            file.saveUtf8File(name, contents);
         }
;
         writeFile.asModule = function(moduleName, fileName, contents)  {
            writeFile(fileName, build.toTransport(anonDefRegExp, namespaceWithDot, moduleName, fileName, contents, layer));
         }
;
         return writeFile;
      }
;
      build = function(args)  {
         var buildFile, cmdConfig;
         if (! args || lang.isArray(args))  {
            if (! args || args.length < 1)  {
               logger.error("build.js buildProfile.js
" + "where buildProfile.js is the name of the build file (see example.build.js for hints on how to make a build file).");
               return undefined;
            }
            if (args[0].indexOf("=") === - 1)  {
               buildFile = args[0];
               args.splice(0, 1);
            }
            cmdConfig = build.convertArrayToObject(args);
            cmdConfig.buildFile = buildFile;
         }
          else  {
            cmdConfig = args;
         }
         return build._run(cmdConfig);
      }
;
      build._run = function(cmdConfig)  {
         var buildFileContents = "", pluginCollector =  {} , buildPaths, fileName, fileNames, prop, paths, i, baseConfig, config, modules, builtModule, srcPath, buildContext, destPath, moduleName, moduleMap, parentModuleMap, context, resources, resource, pluginProcessed =  {} , plugin, fileContents;
         requirePatch();
         config = build.createConfig(cmdConfig);
         paths = config.paths;
         if (config.logLevel)  {
            logger.logLevel(config.logLevel);
         }
         if (! config.out && ! config.cssIn)  {
            file.copyDir(config.appDir || config.baseUrl, config.dir, /\w/, true);
            buildPaths =  {} ;
            if (config.appDir)  {
               for (prop in paths)  {
                     if (paths.hasOwnProperty(prop))  {
                        buildPaths[prop] = paths[prop].replace(config.appDir, config.dir);
                     }
                  }
            }
             else  {
               for (prop in paths)  {
                     if (paths.hasOwnProperty(prop))  {
                        buildPaths[prop] = paths[prop] === "empty:" ? "empty:" : prop.replace(/\./g, "/");
                        srcPath = paths[prop];
                        if (srcPath.indexOf("/") !== 0 && srcPath.indexOf(":") === - 1)  {
                           srcPath = config.baseUrl + srcPath;
                        }
                        destPath = config.dirBaseUrl + buildPaths[prop];
                        if (srcPath !== "empty:")  {
                           if (file.exists(srcPath) && file.isDirectory(srcPath))  {
                              file.copyDir(srcPath, destPath, /\w/, true);
                           }
                            else  {
                              srcPath = ".js";
                              destPath = ".js";
                              file.copyFile(srcPath, destPath);
                           }
                        }
                     }
                  }
            }
         }
         require( {
               baseUrl:config.baseUrl, 
               paths:paths, 
               packagePaths:config.packagePaths, 
               packages:config.packages            }
         );
         buildContext = require.s.contexts._;
         modules = config.modules;
         if (modules)  {
            modules.forEach(function(module)  {
                  if (module.name)  {
                     module._sourcePath = buildContext.nameToUrl(module.name);
                     if (! file.exists(module._sourcePath) && ! module.create && module.name.indexOf("!") === - 1)  {
                        throw new Error("ERROR: module path does not exist: " + module._sourcePath + " for module named: " + module.name + ". Path is relative to: " + file.absPath("."));
                     }
                  }
               }
            );
         }
         if (config.out)  {
            require(config);
            if (! config.cssIn)  {
               config.modules[0]._buildPath = config.out;
            }
         }
          else if (! config.cssIn)  {
            baseConfig =  {
               baseUrl:config.dirBaseUrl, 
               paths:buildPaths            }
;
            lang.mixin(baseConfig, config);
            require(baseConfig);
            if (modules)  {
               modules.forEach(function(module)  {
                     if (module.name)  {
                        module._buildPath = buildContext.nameToUrl(module.name, null);
                        if (! module.create)  {
                           file.copyFile(module._sourcePath, module._buildPath);
                        }
                     }
                  }
               );
            }
         }
         if (config.optimizeCss && config.optimizeCss !== "none" && config.dir)  {
            buildFileContents = optimize.css(config.dir, config);
         }
         if (modules)  {
            modules.forEach(function(module)  {
                  module.layer = build.traceDependencies(module, config);
               }
            );
            modules.forEach(function(module)  {
                  if (module.exclude)  {
                     module.excludeLayers = [];
                     module.exclude.forEach(function(exclude, i)  {
                           module.excludeLayers[i] = build.findBuildModule(exclude, modules) ||  {
                              layer:build.traceDependencies( {
                                    name:exclude                                 }, 
                                 config)                           }
;
                        }
                     );
                  }
               }
            );
            modules.forEach(function(module)  {
                  if (module.exclude)  {
                     module.exclude.forEach(function(excludeModule, i)  {
                           var excludeLayer = module.excludeLayers[i].layer, map = excludeLayer.buildPathMap, prop;
                           for (prop in map)  {
                                 if (map.hasOwnProperty(prop))  {
                                    build.removeModulePath(prop, map[prop], module.layer);
                                 }
                              }
                        }
                     );
                  }
                  if (module.excludeShallow)  {
                     module.excludeShallow.forEach(function(excludeShallowModule)  {
                           var path = module.layer.buildPathMap[excludeShallowModule];
                           if (path)  {
                              build.removeModulePath(excludeShallowModule, path, module.layer);
                           }
                        }
                     );
                  }
                  builtModule = build.flattenModule(module, module.layer, config);
                  file.saveUtf8File(module._buildPath + "-temp", builtModule.text);
                  buildFileContents = builtModule.buildText;
               }
            );
            modules.forEach(function(module)  {
                  var finalPath = module._buildPath;
                  if (file.exists(finalPath))  {
                     file.deleteFile(finalPath);
                  }
                  file.renameFile(finalPath + "-temp", finalPath);
               }
            );
         }
         if (config.out && ! config.cssIn)  {
            fileName = config.modules[0]._buildPath;
            optimize.jsFile(fileName, null, fileName, config);
         }
          else if (! config.cssIn)  {
            fileNames = file.getFilteredFileList(config.dir, /\.js$/, true);
            for (i = 0; fileName = fileNames[i]; i++)  {
                  moduleName = fileName.replace(config.dir, "");
                  moduleName = moduleName.substring(0, moduleName.length - 3);
                  fileContents = file.readFile(fileName);
                  fileContents = build.toTransport(config.anonDefRegExp, config.namespaceWithDot, null, fileName, fileContents);
                  optimize.jsFile(fileName, fileContents, fileName, config, pluginCollector);
               }
            context = require.s.contexts._;
            for (moduleName in pluginCollector)  {
                  if (pluginCollector.hasOwnProperty(moduleName))  {
                     parentModuleMap = context.makeModuleMap(moduleName);
                     resources = pluginCollector[moduleName];
                     for (i = 0; resource = resources[i]; i++)  {
                           moduleMap = context.makeModuleMap(resource, parentModuleMap);
                           if (! context.plugins[moduleMap.prefix])  {
                              context.plugins[moduleMap.prefix] = true;
                              if (! file.exists(require.toUrl(moduleMap.prefix + ".js")))  {
                                 continue;
                              }
                              context.require([moduleMap.prefix]);
                              moduleMap = context.makeModuleMap(resource, parentModuleMap);
                           }
                           if (! pluginProcessed[moduleMap.fullName])  {
                              plugin = context.defined[moduleMap.prefix];
                              if (plugin && plugin.writeFile)  {
                                 plugin.writeFile(moduleMap.prefix, moduleMap.name, require, makeWriteFile(config.anonDefRegExp, config.namespaceWithDot), context.config);
                              }
                              pluginProcessed[moduleMap.fullName] = true;
                           }
                        }
                  }
               }
            file.saveUtf8File(config.dir + "build.txt", buildFileContents);
         }
         if (config.cssIn)  {
            buildFileContents = optimize.cssFile(config.cssIn, config.out, config);
         }
         if (buildFileContents)  {
            logger.info(buildFileContents);
            return buildFileContents;
         }
         return "";
      }
;
      function stringDotToObj(result, prop, name, value)  {
         if (! result[prop])  {
            result[prop] =  {} ;
         }
         name = name.substring(prop + ".".length, name.length);
         result[prop][name] = value;
      }
;
      build.dotProps = ["paths.", "wrap.", "pragmas.", "pragmasOnSave.", "has.", "hasOnSave.", "wrap.", "uglify.", "closure."];
      build.hasDotPropMatch = function(prop)  {
         return build.dotProps.some(function(dotProp)  {
               return prop.indexOf(dotProp) === 0;
            }
         );
      }
;
      build.convertArrayToObject = function(ary)  {
         var result =  {} , i, separatorIndex, prop, value, needArray =  {
            include:true, 
            exclude:true, 
            excludeShallow:true         }
;
         for (i = 0; i < ary.length; i++)  {
               separatorIndex = ary[i].indexOf("=");
               if (separatorIndex === - 1)  {
                  throw "Malformed name/value pair: [" + ary[i] + "]. Format should be name=value";
               }
               value = ary[i].substring(separatorIndex + 1, ary[i].length);
               if (value === "true")  {
                  value = true;
               }
                else if (value === "false")  {
                  value = false;
               }
               prop = ary[i].substring(0, separatorIndex);
               if (needArray[prop])  {
                  value = value.split(",");
               }
               if (build.hasDotPropMatch(prop))  {
                  stringDotToObj(result, prop.split(".")[0], prop, value);
               }
                else  {
                  result[prop] = value;
               }
            }
         return result;
      }
;
      build.makeAbsPath = function(path, absFilePath)  {
         if (path.indexOf("/") !== 0 && path.indexOf(":") === - 1)  {
            path = absFilePath + absFilePath.charAt(absFilePath.length - 1) === "/" ? "" : "/" + path;
            path = file.normalize(path);
         }
         return path.replace(lang.backSlashRegExp, "/");
      }
;
      build.makeAbsObject = function(props, obj, absFilePath)  {
         var i, prop;
         if (obj)  {
            for (i = 0; prop = props[i]; i++)  {
                  if (obj.hasOwnProperty(prop))  {
                     obj[prop] = build.makeAbsPath(obj[prop], absFilePath);
                  }
               }
         }
      }
;
      build.makeAbsConfig = function(config, absFilePath)  {
         var props, prop, i;
         props = ["appDir", "dir", "baseUrl"];
         for (i = 0; prop = props[i]; i++)  {
               if (config[prop])  {
                  if (prop === "baseUrl")  {
                     config.originalBaseUrl = config.baseUrl;
                     if (config.appDir)  {
                        config.baseUrl = build.makeAbsPath(config.originalBaseUrl, config.appDir);
                     }
                      else  {
                        config.baseUrl = build.makeAbsPath(config[prop], absFilePath);
                     }
                  }
                   else  {
                     config[prop] = build.makeAbsPath(config[prop], absFilePath);
                  }
                  config[prop] = endsWithSlash(config[prop]);
               }
            }
         if (config.paths)  {
            for (prop in config.paths)  {
                  if (config.paths.hasOwnProperty(prop))  {
                     config.paths[prop] = build.makeAbsPath(config.paths[prop], config.baseUrl || absFilePath);
                  }
               }
         }
         build.makeAbsObject(["out", "cssIn"], config, absFilePath);
         build.makeAbsObject(["startFile", "endFile"], config.wrap, absFilePath);
      }
;
      build.nestedMix =  {
         paths:true, 
         has:true, 
         hasOnSave:true, 
         pragmas:true, 
         pragmasOnSave:true      }
;
      function mixConfig(target, source)  {
         var prop, value;
         for (prop in source)  {
               if (source.hasOwnProperty(prop))  {
                  value = source[prop];
                  if (typeof value === "object" && value && ! lang.isArray(value) && ! lang.isFunction(value) && ! lang.isRegExp(value))  {
                     target[prop] = lang.mixin( {} , target[prop], value, true);
                  }
                   else  {
                     target[prop] = value;
                  }
               }
            }
      }
;
      build.createConfig = function(cfg)  {
         var config =  {} , buildFileContents, buildFileConfig, mainConfig, mainConfigFile, prop, buildFile, absFilePath;
         absFilePath = file.absPath(".");
         build.makeAbsConfig(cfg, absFilePath);
         build.makeAbsConfig(buildBaseConfig, absFilePath);
         lang.mixin(config, buildBaseConfig);
         lang.mixin(config, cfg, true);
         if (config.buildFile)  {
            buildFile = file.absPath(config.buildFile);
            if (! file.exists(buildFile))  {
               throw new Error("ERROR: build file does not exist: " + buildFile);
            }
            absFilePath = config.baseUrl = file.absPath(file.parent(buildFile));
            buildFileContents = file.readFile(buildFile);
            try {
               buildFileConfig = eval("(" + buildFileContents + ")");
               build.makeAbsConfig(buildFileConfig, absFilePath);
               if (! buildFileConfig.out && ! buildFileConfig.dir)  {
                  buildFileConfig.dir = buildFileConfig.baseUrl || config.baseUrl + "/build/";
               }
            }
            catch (e) {
               throw new Error("Build file " + buildFile + " is malformed: " + e);
            }
         }
         mainConfigFile = config.mainConfigFile || buildFileConfig && buildFileConfig.mainConfigFile;
         if (mainConfigFile)  {
            mainConfigFile = build.makeAbsPath(mainConfigFile, absFilePath);
            if (! file.exists(mainConfigFile))  {
               throw new Error(mainConfigFile + " does not exist.");
            }
            try {
               mainConfig = parse.findConfig(mainConfigFile, file.readFile(mainConfigFile));
            }
            catch (configError) {
               throw new Error("The config in mainConfigFile " + mainConfigFile + " cannot be used because it cannot be evaluated" + " correctly while running in the optimizer. Try only" + " using a config that is also valid JSON, or do not use" + " mainConfigFile and instead copy the config values needed" + " into a build file or command line arguments given to the optimizer.");
            }
            if (mainConfig)  {
               if (! mainConfig.baseUrl)  {
                  mainConfig.baseUrl = mainConfigFile.substring(0, mainConfigFile.lastIndexOf("/"));
               }
               build.makeAbsConfig(mainConfig, mainConfigFile);
               mixConfig(config, mainConfig);
            }
         }
         if (buildFileConfig)  {
            mixConfig(config, buildFileConfig);
         }
         mixConfig(config, cfg);
         if (config.hasOwnProperty("baseUrl"))  {
            if (config.appDir)  {
               config.dirBaseUrl = build.makeAbsPath(config.originalBaseUrl, config.dir);
            }
             else  {
               config.dirBaseUrl = config.dir || config.baseUrl;
            }
            config.dirBaseUrl = endsWithSlash(config.dirBaseUrl);
         }
         if (config.cssIn && ! config.out)  {
            throw new Error("ERROR: 'out' option missing.");
         }
         if (! config.cssIn && ! config.baseUrl)  {
            throw new Error("ERROR: 'baseUrl' option missing.");
         }
         if (! config.out && ! config.dir)  {
            throw new Error("Missing either an "out" or "dir" config value. " + "If using "appDir" for a full project optimization, " + "use "dir". If you want to optimize to one file, " + "use "out".");
         }
         if (config.appDir && config.out)  {
            throw new Error(""appDir" is not compatible with "out". Use "dir" " + "instead. appDir is used to copy whole projects, " + "where "out" is used to just optimize to one file.");
         }
         if (config.out && config.dir)  {
            throw new Error("The "out" and "dir" options are incompatible." + " Use "out" if you are targeting a single file for" + " for optimization, and "dir" if you want the appDir" + " or baseUrl directories optimized.");
         }
         if (config.name || config.include && ! config.modules)  {
            config.modules = [ {
               name:config.name, 
               out:config.out, 
               include:config.include, 
               exclude:config.exclude, 
               excludeShallow:config.excludeShallow            }
];
         }
         if (config.out && ! config.cssIn)  {
            if (! cfg.optimizeCss)  {
               config.optimizeCss = "none";
            }
         }
         if (config.paths)  {
            for (prop in config.paths)  {
                  if (config.paths.hasOwnProperty(prop))  {
                     disallowUrls(config.paths[prop]);
                  }
               }
         }
         try {
            if (config.wrap)  {
               if (config.wrap === true)  {
                  config.wrap =  {
                     start:"(function () {", 
                     end:"}());"                  }
;
               }
                else  {
                  config.wrap.start = config.wrap.start || file.readFile(build.makeAbsPath(config.wrap.startFile, absFilePath));
                  config.wrap.end = config.wrap.end || file.readFile(build.makeAbsPath(config.wrap.endFile, absFilePath));
               }
            }
         }
         catch (wrapError) {
            throw new Error("Malformed wrap config: need both start/end or " + "startFile/endFile: " + wrapError.toString());
         }
         config.namespaceWithDot = config.namespace ? config.namespace + "." : "";
         config.anonDefRegExp = build.makeAnonDefRegExp(config.namespaceWithDot);
         if (config.context)  {
            throw new Error("The build argument "context" is not supported" + " in a build. It should only be used in web" + " pages.");
         }
         if ("fileExclusionRegExp" in config)  {
            if (typeof config.fileExclusionRegExp === "string")  {
               file.exclusionRegExp = new RegExp(config.fileExclusionRegExp);
            }
             else  {
               file.exclusionRegExp = config.fileExclusionRegExp;
            }
         }
          else if ("dirExclusionRegExp" in config)  {
            file.exclusionRegExp = config.dirExclusionRegExp;
         }
         delete config.jQuery;
         return config;
      }
;
      build.findBuildModule = function(moduleName, modules)  {
         var i, module;
         for (i = 0; module = modules[i]; i++)  {
               if (module.name === moduleName)  {
                  return module;
               }
            }
         return null;
      }
;
      build.removeModulePath = function(module, path, layer)  {
         var index = layer.buildFilePaths.indexOf(path);
         if (index !== - 1)  {
            layer.buildFilePaths.splice(index, 1);
         }
         delete layer.specified[module];
      }
;
      build.traceDependencies = function(module, config)  {
         var include, override, layer, context, baseConfig, oldContext;
         oldContext = require._buildReset();
         baseConfig = oldContext.config;
         layer = require._layer;
         context = layer.context;
         require(lang.delegate(baseConfig));
         logger.trace("
Tracing dependencies for: " + module.name || module.out);
         include = module.name && ! module.create ? [module.name] : [];
         if (module.include)  {
            include = include.concat(module.include);
         }
         if (module.override)  {
            override = lang.delegate(baseConfig);
            lang.mixin(override, module.override, true);
            require(override);
         }
         require(include);
         layer.specified = context.specified;
         if (module.override)  {
            require(baseConfig);
         }
         return layer;
      }
;
      build.flattenModule = function(module, layer, config)  {
         var buildFileContents = "", namespace = config.namespace ? config.namespace + "." : "", context = layer.context, anonDefRegExp = config.anonDefRegExp, path, reqIndex, fileContents, currContents, i, moduleName, parts, builder, writeApi;
         if (module.override)  {
            config = lang.delegate(config);
            lang.mixin(config, module.override, true);
         }
         buildFileContents = "
" + config.dir ? module._buildPath.replace(config.dir, "") : module._buildPath + "
----------------
";
         if (layer.existingRequireUrl)  {
            reqIndex = layer.buildFilePaths.indexOf(layer.existingRequireUrl);
            if (reqIndex !== - 1)  {
               layer.buildFilePaths.splice(reqIndex, 1);
               layer.buildFilePaths.unshift(layer.existingRequireUrl);
            }
         }
         fileContents = "";
         for (i = 0; path = layer.buildFilePaths[i]; i++)  {
               moduleName = layer.buildFileToModule[path];
               parts = context.makeModuleMap(moduleName);
               builder = parts.prefix && context.defined[parts.prefix];
               if (builder)  {
                  if (builder.write)  {
                     writeApi = function(input)  {
                        fileContents = "
" + addSemiColon(input);
                        if (config.onBuildWrite)  {
                           fileContents = config.onBuildWrite(moduleName, path, fileContents);
                        }
                     }
;
                     writeApi.asModule = function(moduleName, input)  {
                        fileContents = "
" + addSemiColon(build.toTransport(anonDefRegExp, namespace, moduleName, path, input, layer));
                        if (config.onBuildWrite)  {
                           fileContents = config.onBuildWrite(moduleName, path, fileContents);
                        }
                     }
;
                     builder.write(parts.prefix, parts.name, writeApi);
                  }
               }
                else  {
                  currContents = file.readFile(path);
                  if (config.onBuildRead)  {
                     currContents = config.onBuildRead(moduleName, path, currContents);
                  }
                  if (config.namespace)  {
                     currContents = pragma.namespace(currContents, config.namespace);
                  }
                  currContents = build.toTransport(anonDefRegExp, namespace, moduleName, path, currContents, layer);
                  if (config.onBuildWrite)  {
                     currContents = config.onBuildWrite(moduleName, path, currContents);
                  }
                  fileContents = "
" + addSemiColon(currContents);
               }
               buildFileContents = path.replace(config.dir, "") + "
";
               if (moduleName && ! layer.modulesWithNames[moduleName] && ! config.skipModuleInsertion)  {
                  if (moduleName === "jquery")  {
                     fileContents = "
(function () {
" + "var jq = typeof jQuery !== "undefined" && jQuery;
" + namespace + "define("jquery", [], function () { return jq; });
" + "}());
";
                  }
                   else  {
                     fileContents = "
" + namespace + "define("" + moduleName + "", function(){});
";
                  }
               }
            }
         return  {
            text:config.wrap ? config.wrap.start + fileContents + config.wrap.end : fileContents, 
            buildText:buildFileContents         }
;
      }
;
      build.makeAnonDefRegExp = function(namespace)  {
         return new RegExp("(^|[^\.])(" + namespace || "".replace(/\./g, "\.") + "define|define)\s*\(\s*(\/\/[^\n\r]*[\r\n])?(\[|function|[\w\d_\-\$]+\s*\)|\{|["']([^"']+)["'])(\s*,\s*f)?");
      }
;
      build.leadingCommaRegExp = /^\s*,/;
      build.toTransport = function(anonDefRegExp, namespace, moduleName, path, contents, layer)  {
         return contents.replace(anonDefRegExp, function(match, start, callName, possibleComment, suffix, namedModule, namedFuncStart)  {
               if (namedModule && ! namedFuncStart)  {
                  return match;
               }
               if (layer && ! namedModule || namedModule === moduleName)  {
                  layer.modulesWithNames[moduleName] = true;
               }
               var deps = null, finalName;
               if (suffix.indexOf("f") !== - 1 || namedModule)  {
                  deps = parse.getAnonDeps(path, contents);
                  if (deps.length)  {
                     deps = deps.map(function(dep)  {
                           return "'" + dep + "'";
                        }
                     );
                  }
                   else  {
                     deps = [];
                  }
               }
               finalName = namedModule || moduleName || "";
               if (finalName)  {
                  finalName = "'" + namedModule || moduleName + "',";
               }
               return start + namespace + "define(" + finalName + deps ? "[" + deps.toString() + "]," : "" + namedModule ? namedFuncStart.replace(build.leadingCommaRegExp, "") : suffix;
            }
         );
      }
;
      return build;
   }
;
   ;
}
;
function setBaseUrl(fileName)  {
   dir = fileName.replace(/\\/g, "/");
   if (dir.indexOf("/") !== - 1)  {
      dir = dir.split("/");
      dir.pop();
      dir = dir.join("/");
      exec("require({baseUrl: '" + dir + "'});");
   }
}
;
if (env === "node" && reqMain !== module)  {
   setBaseUrl(path.resolve(reqMain ? reqMain.filename : "."));
   requirejs.optimize = function(config, callback)  {
      if (! loadedOptimizedLib)  {
         loadLib();
         loadedOptimizedLib = true;
      }
      var runBuild = function(build, logger)  {
         config.logLevel = config.hasOwnProperty("logLevel") ? config.logLevel : logger.SILENT;
         var result = build(config);
         requirejs._buildReset();
         if (callback)  {
            callback(result);
         }
      }
;
      runBuild.__requireJsBuild = true;
      requirejs( {
            context:"build"         }, 
         ["build", "logger"], runBuild);
   }
;
   requirejs.tools =  {
      useLib:function(contextName, callback)  {
         if (! callback)  {
            callback = contextName;
            contextName = "uselib";
         }
         if (! useLibLoaded[contextName])  {
            loadLib();
            useLibLoaded[contextName] = true;
         }
         var req = requirejs( {
               context:contextName, 
               requireLoad:requirejsVars.nodeLoad, 
               requireExecCb:requirejsVars.nodeRequireExecCb            }
         );
         req(["build"], function()  {
               callback(req);
            }
         );
      }} ;
   requirejs.define = define;
   module.exports = requirejs;
   return ;
}
if (commandOption === "o")  {
   loadLib();
}
require( {} );
baseUrl:
require.s.contexts._.config.baseUrl, context;
"build", catchError;
 {
   define:
true;
}
;
✖, ["env!env/args", "build"], function(args, build)  {
   build(args);
}
;
;
if (commandOption === "v")  {
   console.log("r.js: " + version + ", RequireJS: " + this.requirejsVars.require.version);
}
 else if (commandOption === "convert")  {
   loadLib();
   this.requirejsVars.require(["env!env/args", "commonJs", "env!env/print"]);
   function ✖(args, commonJs, print)  {
      var srcDir, outDir;
      srcDir = args[0];
      outDir = args[1];
      if (! srcDir || ! outDir)  {
         print("Usage: path/to/commonjs/modules output/dir");
         return ;
      }
      commonJs.convertDir(args[0], args[1]);
   }
;
   ;
}
 else  {
   if (commandOption === "lib")  {
      loadLib();
   }
   setBaseUrl(fileName);
   if (exists(fileName))  {
      exec(readFile(fileName), fileName);
   }
    else  {
      showHelp();
   }
}
typeof console !== "undefined" ? console : undefined, typeof Packages !== "undefined" ? Array.prototype.slice.call(arguments, 0) : [], typeof readFile !== "undefined" ? readFile : undefined;
;
