! ✖ / env;
node;
function()  {
   "use strict";
   var cp = require("child_process"), https = require("https"), zlib = require("zlib");
   var _ = require("../lodash.js"), preprocess = require("./pre-compile.js"), postprocess = require("./post-compile.js"), tar = require("../vendor/tar/tar.js"), util = require("./util.js");
   var fs = util.fs, path = util.path;
   var closureId = "9fd5d61c1b706e7505aeb5187941c2c5497e5fd8";
   var uglifyId = "7de2795a3af58d1b293e3b0e83cdbc994f4941dc";
   var basePath = fs.realpathSync(path.join(__dirname, ".."));
   var vendorPath = path.join(basePath, "vendor");
   var closurePath = path.join(vendorPath, "closure-compiler", "compiler.jar");
   var uglifyPath = path.join(vendorPath, "uglifyjs", "tools", "node.js");
   var closureOptions = ["--warning_level=QUIET"];
   var mediaType = "application/vnd.github.v3.raw";
   var reNode = RegExp("(?:^|" + path.sepEscaped + ")node(?:\.exe)?$");
   var location = function()  {
      var host = "api.github.com", origin = "https://api.github.com", pathname = "/repos/bestiejs/lodash/git/blobs";
      return  {
         host:host, 
         href:origin + pathname, 
         origin:origin, 
         pathname:pathname      }
;
   }
();
   var optimizationModes =  {
      simple:"SIMPLE_OPTIMIZATIONS", 
      advanced:"ADVANCED_OPTIMIZATIONS"   }
;
   function minify(source, options)  {
      var sourceMapURL;
      var modes = ["simple", "advanced", "hybrid"];
      source || source = "";
      options || options =  {} ;
      if (Array.isArray(source))  {
         options = source;
         var invalidArgs = _.reject(options.slice(reNode.test(options[0]) ? 2 : 0), function(value, index, options)  {
               if (/^(?:-o|--output)$/.test(options[index - 1]) || /^modes=.*$/.test(value))  {
                  return true;
               }
               var result = ["-o", "--output", "-p", "--source-map", "-s", "--silent", "-t", "--template"].indexOf(value) > - 1;
               if (! result && /^(?:-p|--source-map)$/.test(options[index - 1]))  {
                  result = true;
                  sourceMapURL = value;
               }
               return result;
            }
         );
         if (invalidArgs.length)  {
            console.log("
" + "Invalid argument" + invalidArgs.length > 1 ? "s" : "" + " passed: " + invalidArgs.join(", "));
            return ;
         }
         var filePath = options[options.length - 1], isMapped = _.contains(options, "-p") || _.contains(options, "--source-map"), isSilent = _.contains(options, "-s") || _.contains(options, "--silent"), isTemplate = _.contains(options, "-t") || _.contains(options, "--template"), outputPath = path.join(path.dirname(filePath), path.basename(filePath, ".js") + ".min.js");
         modes = options.reduce(function(result, value)  {
               var match = value.match(/modes=(.*)$/);
               return match ? match[1].split(/, */) : result;
            }, 
            modes);
         outputPath = options.reduce(function(result, value, index)  {
               if (/-o|--output/.test(value))  {
                  result = options[index + 1];
                  var dirname = path.dirname(result);
                  fs.mkdirpSync(dirname);
                  result = path.join(fs.realpathSync(dirname), path.basename(result));
               }
               return result;
            }, 
            outputPath);
         options =  {
            filePath:filePath, 
            isMapped:isMapped, 
            isSilent:isSilent, 
            isTemplate:isTemplate, 
            modes:modes, 
            outputPath:outputPath, 
            sourceMapURL:sourceMapURL         }
;
         source = fs.readFileSync(filePath, "utf8");
      }
      modes = options.modes || modes;
      if (options.isMapped)  {
         modes = modes.filter(function(mode)  {
               return mode != "hybrid";
            }
         );
      }
      if (options.isTemplate)  {
         modes = modes.filter(function(mode)  {
               return mode != "advanced";
            }
         );
      }
      options.modes = modes;
      getDependency( {
            id:"closure-compiler", 
            hashId:closureId, 
            path:vendorPath, 
            title:"the Closure Compiler", 
            onComplete:function(exception)  {
               var error = exception;
               getDependency( {
                     id:"uglifyjs", 
                     hashId:uglifyId, 
                     title:"UglifyJS", 
                     path:vendorPath, 
                     onComplete:function(exception)  {
                        error || error = exception;
                        if (! error)  {
                           new Minify(source, options);
                        }
                     }} );
            }} );
   }
;
   function Minify(source, options)  {
      if (typeof source == "object" && source)  {
         options = source || options;
         source = options.source || "";
      }
      this.compiled =  {
         simple: {} , 
         advanced: {}       }
;
      this.hybrid =  {
         simple: {} , 
         advanced: {}       }
;
      this.uglified =  {} ;
      this.filePath = options.filePath;
      this.isMapped = ! ! options.isMapped;
      this.isSilent = ! ! options.isSilent;
      this.isTemplate = ! ! options.isTemplate;
      this.outputPath = options.outputPath;
      this.sourceMapURL = options.sourceMapURL;
      var modes = this.modes = options.modes;
      source = this.source = preprocess(source, options);
      this.onComplete = options.onComplete || function(data)  {
         var outputPath = this.outputPath, sourceMap = data.sourceMap;
         fs.writeFileSync(outputPath, data.source, "utf8");
         if (sourceMap)  {
            fs.writeFileSync(getMapPath(outputPath), sourceMap, "utf8");
         }
      }
;
      if (_.contains(modes, "simple"))  {
         closureCompile.call(this, source, "simple", onClosureSimpleCompile.bind(this));
      }
       else if (_.contains(modes, "advanced"))  {
         onClosureSimpleGzip.call(this);
      }
       else  {
         onClosureAdvancedGzip.call(this);
      }
   }
;
   function getDependency(options)  {
      options || options =  {} ;
      var ran, destPath = options.path, hashId = options.hashId, id = options.id, onComplete = options.onComplete, title = options.title;
      if (fs.existsSync(path.join(destPath, id)))  {
         onComplete();
         return ;
      }
      var callback = function(exception)  {
         if (ran)  {
            return ;
         }
         if (exception)  {
            console.error(["There was a problem installing " + title + ".", "Try running the command as root, via `sudo`, or manually install by running:", "", "curl -H 'Accept: " + mediaType + "' " + location.href + "/" + hashId + " | tar xvz -C '" + destPath + "'", ""].join("
"));
         }
         ran = true;
         process.removeListener("uncaughtException", callback);
         onComplete(exception);
      }
;
      console.log("Downloading " + title + "...");
      process.on("uncaughtException", callback);
      https.get( {
            host:location.host, 
            path:location.pathname + "/" + hashId, 
            headers: {
               Accept:mediaType, 
               User-Agent:"Lo-Dash/" + _.VERSION            }} , function(response)  {
            var decompressor = zlib.createUnzip(), parser = new tar.Extract( {
                  path:destPath               }
            );
            parser.on("end", callback);
            response.pipe(decompressor).pipe(parser);
         }
      );
   }
;
   function getJavaOptions(callback)  {
      var result = [];
      cp.exec("java -version -client -d32", function(error)  {
            if (! error && process.platform != "win32")  {
               result.push("-client", "-d32");
            }
            getJavaOptions = function(callback)  {
               _.defer(callback, result);
            }
;
            callback(result);
         }
      );
   }
;
   function getMapPath(outputPath)  {
      return path.join(path.dirname(outputPath), path.basename(outputPath, ".js") + ".map");
   }
;
   function closureCompile(source, mode, callback)  {
      var filePath = this.filePath, isAdvanced = mode == "advanced", isMapped = this.isMapped, isSilent = this.isSilent, isTemplate = this.isTemplate, options = closureOptions.slice(), outputPath = this.outputPath, mapPath = getMapPath(outputPath), sourceMapURL = this.sourceMapURL || path.basename(mapPath);
      var license = /^(?:\s*\/\/.*\s*|\s*\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/\s*)*/.exec(source) || [""][0];
      if (license)  {
         source = source.replace(license, "");
      }
      var hasIIFE = /^;?\(function[^{]+{/.test(source), isStrict = hasIIFE && /^;?\(function[^{]+{\s*["']use strict["']/.test(source);
      if (hasIIFE && isAdvanced)  {
         source = source.replace(/\(function/, "__iife__$&").replace(/\(this\)\)([\s;]*(\n\/\/.+)?)$/, ", this)$1");
      }
      options.push("--compilation_level=" + optimizationModes[mode]);
      if (isMapped)  {
         options.push("--create_source_map=" + mapPath, "--source_map_format=V3");
      }
      if (isTemplate)  {
         options.push("--charset=UTF-8");
      }
      getJavaOptions(function(javaOptions)  {
            var compiler = cp.spawn("java", javaOptions.concat("-jar", closurePath, options));
            if (! isSilent)  {
               console.log("Compressing " + path.basename(outputPath, ".js") + " using the Closure Compiler (" + mode + ")...");
            }
            var error = "";
            compiler.stderr.on("data", function(data)  {
                  error = data;
               }
            );
            var output = "";
            compiler.stdout.on("data", function(data)  {
                  output = data;
               }
            );
            compiler.on("exit", function(status)  {
                  if (status)  {
                     var exception = new Error(error);
                     exception.status = status;
                  }
                  if (hasIIFE && isAdvanced)  {
                     output = output.replace(/__iife__\(/, "(").replace(/,\s*this\)([\s;]*(\n\/\/.+)?)$/, "(this))$1").replace(/^((?:var (?:\w+=(?:!0|!1|null)[,;])+)?)([\s\S]*?function[^{]+{)/, "$2$1");
                  }
                  if (isStrict)  {
                     output = output.replace(/^[\s\S]*?function[^{]+{/, "$&"use strict";");
                  }
                  if (license)  {
                     output = license + output;
                  }
                  if (isMapped)  {
                     var mapOutput = fs.readFileSync(mapPath, "utf8");
                     fs.unlinkSync(mapPath);
                     output = output.replace(/[\s;]*$/, "
/*
//@ sourceMappingURL=" + sourceMapURL) + "
*/";
                     mapOutput = JSON.parse(mapOutput);
                     mapOutput.file = path.basename(outputPath);
                     mapOutput.sources = [path.basename(filePath)];
                     mapOutput = JSON.stringify(mapOutput, null, 2);
                  }
                  callback(exception, output, mapOutput);
               }
            );
            compiler.stdin.end(source);
         }
      );
   }
;
   function uglify(source, label, callback)  {
      if (! this.isSilent)  {
         console.log("Compressing " + path.basename(this.outputPath, ".js") + " using " + label + "...");
      }
      try {
         var uglifyJS = require(uglifyPath);
         var toplevel = uglifyJS.parse(source);
         toplevel.figure_out_scope();
         toplevel = toplevel.transform(uglifyJS.Compressor( {
                  comparisons:false, 
                  unsafe:true, 
                  unsafe_comps:true, 
                  warnings:false               }
            ));
         toplevel.figure_out_scope();
         toplevel.compute_char_frequency();
         toplevel.mangle_names( {
               except:["define"]            }
         );
         var stream = uglifyJS.OutputStream( {
               ascii_only:! this.isTemplate, 
               comments:/@cc_on|@license|@preserve/i, 
               max_line_len:500            }
         );
         toplevel.print(stream);
      }
      catch (e) {
         var exception = e;
      }
      callback(exception, stream && String(stream));
   }
;
   function onClosureSimpleCompile(exception, result, map)  {
      if (exception)  {
         throw exception;
      }
      result = postprocess(result);
      var simple = this.compiled.simple;
      simple.source = result;
      simple.sourceMap = map;
      zlib.gzip(result, onClosureSimpleGzip.bind(this));
   }
;
   function onClosureSimpleGzip(exception, result)  {
      if (exception)  {
         throw exception;
      }
      if (result != null)  {
         if (! this.isSilent)  {
            console.log("Done. Size: %d bytes.", result.length);
         }
         this.compiled.simple.gzip = result;
      }
      if (_.contains(this.modes, "advanced"))  {
         closureCompile.call(this, this.source, "advanced", onClosureAdvancedCompile.bind(this));
      }
       else  {
         onClosureAdvancedGzip.call(this);
      }
   }
;
   function onClosureAdvancedCompile(exception, result, map)  {
      if (exception)  {
         throw exception;
      }
      result = postprocess(result);
      var advanced = this.compiled.advanced;
      advanced.source = result;
      advanced.sourceMap = map;
      zlib.gzip(result, onClosureAdvancedGzip.bind(this));
   }
;
   function onClosureAdvancedGzip(exception, result)  {
      if (exception)  {
         throw exception;
      }
      if (result != null)  {
         if (! this.isSilent)  {
            console.log("Done. Size: %d bytes.", result.length);
         }
         this.compiled.advanced.gzip = result;
      }
      if (! this.isMapped)  {
         uglify.call(this, this.source, "UglifyJS", onUglify.bind(this));
      }
       else  {
         onComplete.call(this);
      }
   }
;
   function onUglify(exception, result)  {
      if (exception)  {
         throw exception;
      }
      result = postprocess(result);
      this.uglified.source = result;
      zlib.gzip(result, onUglifyGzip.bind(this));
   }
;
   function onUglifyGzip(exception, result)  {
      if (exception)  {
         throw exception;
      }
      if (result != null)  {
         if (! this.isSilent)  {
            console.log("Done. Size: %d bytes.", result.length);
         }
         this.uglified.gzip = result;
      }
      var modes = this.modes;
      if (_.contains(modes, "hybrid"))  {
         if (_.contains(modes, "simple"))  {
            uglify.call(this, this.compiled.simple.source, "hybrid (simple)", onSimpleHybrid.bind(this));
         }
          else if (_.contains(modes, "advanced"))  {
            onSimpleHybridGzip.call(this);
         }
      }
       else  {
         onComplete.call(this);
      }
   }
;
   function onSimpleHybrid(exception, result)  {
      if (exception)  {
         throw exception;
      }
      result = postprocess(result);
      this.hybrid.simple.source = result;
      zlib.gzip(result, onSimpleHybridGzip.bind(this));
   }
;
   function onSimpleHybridGzip(exception, result)  {
      if (exception)  {
         throw exception;
      }
      if (result != null)  {
         if (! this.isSilent)  {
            console.log("Done. Size: %d bytes.", result.length);
         }
         this.hybrid.simple.gzip = result;
      }
      if (_.contains(this.modes, "advanced"))  {
         uglify.call(this, this.compiled.advanced.source, "hybrid (advanced)", onAdvancedHybrid.bind(this));
      }
       else  {
         onComplete.call(this);
      }
   }
;
   function onAdvancedHybrid(exception, result)  {
      if (exception)  {
         throw exception;
      }
      result = postprocess(result);
      this.hybrid.advanced.source = result;
      zlib.gzip(result, onAdvancedHybridGzip.bind(this));
   }
;
   function onAdvancedHybridGzip(exception, result)  {
      if (exception)  {
         throw exception;
      }
      if (result != null)  {
         if (! this.isSilent)  {
            console.log("Done. Size: %d bytes.", result.length);
         }
         this.hybrid.advanced.gzip = result;
      }
      onComplete.call(this);
   }
;
   function onComplete()  {
      var compiledSimple = this.compiled.simple, compiledAdvanced = this.compiled.advanced, uglified = this.uglified, hybridSimple = this.hybrid.simple, hybridAdvanced = this.hybrid.advanced;
      var objects = [compiledSimple, compiledAdvanced, uglified, hybridSimple, hybridAdvanced];
      var gzips = objects.map(function(data)  {
            return data.gzip;
         }
      ).filter(Boolean);
      var min = gzips.reduce(function(min, gzip)  {
            var length = gzip.length;
            return min > length ? length : min;
         }, 
         Infinity);
      objects.some(function(data)  {
            var gzip = data.gzip;
            if (gzip && gzip.length == min)  {
               data.outputPath = this.outputPath;
               this.onComplete(data);
               return true;
            }
         }, 
         this);
   }
;
   if (module != require.main)  {
      module.exports = minify;
   }
    else  {
      function()  {
         var options = process.argv;
         if (options.length < 3)  {
            return ;
         }
         minify(options);
      }
();
   }
}
();
