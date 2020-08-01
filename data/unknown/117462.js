! ✖ / env;
node;
var $ =  {
   glob:require("glob"), 
   fs:require("fs"), 
   minimist:require("minimist"), 
   path:require("path"), 
   util:require("util"), 
   wordwrap:require("wordwrap")}
;
var PROVIDES_REGEX = /goog\.provide\(['"](.+?)['"]\)/g;
var REQUIRES_REGEX = /goog\.require\(['"](.+?)['"]\)/g;
var NAMESPACE_REGEX = /^ns:((\w+\.)*(\w+))$/;
var JSFILE_REGEX = /\.js$/i;
var JSFILE_GLOB = "**/*.js";
var FLAGS =  {
   help:"h", 
   path:"p", 
   mode:"m"}
;
var DESCRIPTIONS =  {
   help:"Show this help message and exit.", 
   path:"The path that should be traversed to build the dependencies. " + "Repeat as needed for multiple paths.", 
   mode:"The type of output to generate either "list" for a list of " + "filenames or "concat" for a single concatenated text " + "containing the contents of all the files."}
;
var DEFAULTS =  {
   path:".", 
   mode:"list"}
;
var tests =  {} ;
tests.isNS = function(str)  {
   return NAMESPACE_REGEX.test(str);
}
;
tests.isJS = function(str)  {
   return ! tests.isNS(str) && JSFILE_REGEX.test(str);
}
;
var arrays =  {} ;
arrays.flatten = function(arr)  {
   if (! $.util.isArray(arr))  {
      return [arr];
   }
   return arr.reduce(function(prev, cur)  {
         return prev.concat(arrays.flatten(cur));
      }, 
      []);
}
;
arrays.unique = function(arr)  {
   return arr.filter(function(val, idx, arr)  {
         return arr.indexOf(val) == idx;
      }
   );
}
;
arrays.filterJS = function(arr)  {
   return arr.filter(function(val, idx, arr)  {
         return tests.isJS(val);
      }
   );
}
;
var files =  {} ;
files.tree = function(path)  {
   if (! path)  {
      return [];
   }
   if (tests.isNS(path) || tests.isJS(path))  {
      return [path];
   }
   return $.glob.sync($.path.join(path, JSFILE_GLOB));
}
;
files.list = function(paths)  {
   if ($.util.isArray(paths))  {
      return paths.map(files.find);
   }
   return files.tree(paths);
}
;
files.find = function(paths)  {
   var list = files.list(paths);
   return arrays.unique(arrays.flatten(list));
}
;
var deps =  {} ;
deps.Info = function(path, content)  {
   this.path = path;
   this.content = content;
   this.provides = [];
   this.requires = [];
}
;
deps.Info.prototype.toString = function()  {
   return $.util.format("%s (provides: %s) (requires: %s)", this.path, this.provides, this.requires);
}
;
deps.create = function(path)  {
   var content = $.fs.readFileSync(path,  {
         encoding:"utf8"      }
   );
   return new deps.Info(path, content);
}
;
deps.read = function(paths)  {
   paths = arrays.unique(arrays.filterJS(paths));
   return paths.map(deps.create);
}
;
deps.extract = function(infos)  {
   return infos.map(function(info)  {
         var tmp;
         while (tmp = PROVIDES_REGEX.exec(info.content))  {
               info.provides.push(tmp[1]);
            }
         while (tmp = REQUIRES_REGEX.exec(info.content))  {
               info.requires.push(tmp[1]);
            }
         return info;
      }
   );
}
;
deps.build = function(infos)  {
   var hash =  {} ;
   infos.forEach(function(info)  {
         hash[info.path] = info;
         info.provides.forEach(function(ns)  {
               if (ns in hash)  {
                  $.util.error($.util.format("Duplicate provide for "%s" in %s and %s.", ns, info.path, hash[ns].path));
                  process.exit(1);
               }
               hash[ns] = info;
            }
         );
      }
   );
   return hash;
}
;
deps.resolve = function(info, hash, ordered, seen)  {
   info.requires.forEach(function(ns)  {
         if (! ns in hash)  {
            $.util.error($.util.format("Missing provide for "%s" required by %s.", ns, info.path));
            process.exit(1);
         }
         var depInfo = hash[ns];
         if (! seen[depInfo.path])  {
            seen[depInfo.path] = true;
            deps.resolve(depInfo, hash, ordered, seen);
            ordered.push(depInfo);
         }
      }
   );
}
;
deps.order = function(hash, inputs)  {
   var ordered = [];
   var seen =  {} ;
   inputs.forEach(function(input)  {
         var info;
         if (tests.isNS(input))  {
            var ns = NAMESPACE_REGEX.exec(input)[1];
            if (! ns in hash)  {
               $.util.error($.util.format("Missing input namespace "%s".", ns));
               process.exit(1);
            }
            info = hash[ns];
         }
          else  {
            if (! input in hash)  {
               $.util.error($.util.format("Missing input file "%s".", input));
               process.exit(1);
            }
            info = hash[input];
         }
         deps.resolve(info, hash, ordered, seen);
         ordered.push(info);
      }
   );
   return ordered;
}
;
deps.calculate = function(paths, inputs)  {
   var combined = paths.concat(inputs);
   var infos = deps.read(combined);
   var hash = deps.build(deps.extract(infos));
   return deps.order(hash, inputs);
}
;
var cli =  {} ;
cli.active = ! module.parent;
cli.parse = function()  {
   return $.minimist(process.argv.slice(2),  {
         alias:FLAGS, 
         default:DEFAULTS      }
   );
}
;
cli.help = function()  {
   var program = $.path.basename(process.argv[1]);
   $.util.puts($.util.format("Usage: %s [options] argument [arguments]", program));
   $.util.puts("");
   var wrap = $.wordwrap(78);
   $.util.puts("Arguments:");
   $.util.puts(wrap("The inputs to calculate dependencies for: files, " + "directories, or namespaces (e.g. "ns:my.project")."));
   $.util.puts("");
   wrap = $.wordwrap(8, 78);
   $.util.puts("Options:");
   for (var flag in FLAGS)  {
         $.util.puts($.util.format("--%s, -%s", flag, FLAGS[flag]));
         $.util.puts(wrap(DESCRIPTIONS[flag]));
         if (flag in DEFAULTS)  {
            $.util.puts(wrap("Default: " + DEFAULTS[flag]));
         }
      }
}
;
function main(opts, args)  {
   if (cli.active)  {
      opts = cli.parse();
      args = opts._;
      if (args.length < 1 || opts.help)  {
         cli.help();
         process.exit();
      }
   }
    else  {
      opts = opts ||  {} ;
      for (var d in DEFAULTS)  {
            if (! d in opts)  {
               opts[d] = DEFAULTS[d];
            }
         }
   }
   var paths = files.find(opts.path);
   var inputs = files.find(args);
   var infos = deps.calculate(paths, inputs);
   var output;
   if (opts.mode == "list")  {
      output = infos.map(function(info)  {
            return info.path;
         }
      );
   }
    else if (opts.mode == "concat")  {
      output = infos.map(function(info)  {
            return info.content;
         }
      ).join("
");
   }
    else  {
      $.util.error("Unknown output mode");
      process.exit(1);
   }
   if (cli.active)  {
      if ($.util.isArray(output))  {
         $.util.puts(output.join("
"));
      }
       else  {
         $.util.puts(output);
      }
   }
   return output;
}
;
module.exports = main;
if (cli.active)  {
   main();
}
