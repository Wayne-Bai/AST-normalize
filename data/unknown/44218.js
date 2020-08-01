! ✖ / env;
node;
var ph = require("path"), sh = require("shelljs"), chokidar = require("chokidar"), compiler = require("./compiler");
var methods =  {
   help:function()  {
      log(["", "Builds .tag files to .js", "", "Options:", "", "  -h, --help      You're reading it", "  -v, --version   Print Riot's version", "  -w, --watch     Watch for changes", "  -c, --compact   Minify </p> <p> to </p><p>", "  -t, --type      JavaScript pre-processor. Built-in support for: es6, coffeescript, typescript, livescript, none", "  --template      HTML pre-processor. Built-in suupport for: jade", "  --whitespace    Preserve newlines and whitepace", "  --brackets      Change brackets used for expressions. Defaults to { }", "  --expr          Run expressions trough parser defined with --type", "  --ext           Change tag file extension. Defaults to .tag", "", "Build a single .tag file:", "", "  riot foo.tag           To a same named file (foo.js)", "  riot foo.tag bar.js    To a different named file (bar.js)", "  riot foo.tag bar       To a different dir (bar/foo.js)", "", "Build all .tag files in a directory:", "", "  riot foo/bar           To a same directory (foo/**/*.js)", "  riot foo/bar baz       To a different directory (baz/**/*.js)", "  riot foo/bar baz.js    To a single concatenated file (baz.js)", "", "Examples for options:", "", "  riot foo bar", "  riot --w foo bar", "  riot --watch foo bar", "  riot --compact foo bar", "  riot foo bar --compact", "  riot test.tag --type coffeescript --expr", ""].join("
"));
   }, 
   version:function()  {
      log(require("../package.json").version);
   }, 
   make:function(opt)  {
      init(opt);
      var tmp = /\/[^.~][^~/]+$/;
      function find(from)  {
         return sh.find(from).filter(function(f)  {
               return ext.test(f) && tmp.test(f);
            }
         );
      }
;
      function remap(from, to, base)  {
         return from.map(function(from)  {
               return ph.join(to, ph.relative(base, from).replace(ext, ".js"));
            }
         );
      }
;
      var from = opt.flow[0] == "f" ? [opt.from] : find(opt.from), base = opt.flow[0] == "f" ? ph.dirname(opt.from) : opt.from, to = opt.flow[1] == "f" ? [opt.to] : remap(from, opt.to, base);
      var dirs =  {} ;
      to.map(function(f)  {
            dirs[ph.dirname(f)] = 0;
         }
      );
      sh.mkdir("-p", Object.keys(dirs));
      function parse(from)  {
         return compiler.compile(sh.cat(from).replace(/^\uFEFF/g, ""), opt.compiler);
      }
;
      function toFile(from, to)  {
         from.map(parse).join("
").to(to[0]);
      }
;
      function toDir(from, to)  {
         from.map(function(from, i)  {
               parse(from).to(to[i]);
            }
         );
      }
;
      ;
      opt.flow[1] == "f" ? toFile : toDir(from, to);
      from.map(function(src, i)  {
            log(toRelative(src) + " -> " + toRelative(to[i] || to[0]));
         }
      );
   }, 
   watch:function(opt)  {
      init(opt);
      methods.make(opt);
      var glob = opt.flow[0] == "f" ? opt.from : ph.join(opt.from, "**/*." + opt.ext);
      chokidar.watch(glob,  {
            ignoreInitial:true         }
      ).on("ready", function()  {
            log("Watching " + toRelative(glob));
         }
      ).on("all", function(e, path)  {
            methods.make(opt);
         }
      );
   }} ;
var ext;
function init(opt)  {
   if (init.called) return    init.called = true;
   if (! opt.ext) opt.ext = "tag"   ext = RegExp("\." + opt.ext + "$");
   if (! opt.to) opt.to = ext.test(opt.from) ? ph.dirname(opt.from) : opt.from   opt.from = ph.resolve(opt.from);
   opt.to = ph.resolve(opt.to);
   if (! sh.test("-e", opt.from)) err("Source path does not exist")   opt.flow = ext.test(opt.from) ? "f" : "d" + /\.js$/.test(opt.to) ? "f" : "d";
}
;
function cli()  {
   var args = require("minimist")(process.argv.slice(2),  {
         boolean:["watch", "compact", "help", "version", "whitespace"], 
         alias: {
            w:"watch", 
            c:"compact", 
            h:"help", 
            v:"version", 
            t:"type"         }} );
   var opts =  {
      compiler: {
         compact:args.compact, 
         template:args.template, 
         type:args.type, 
         brackets:args.brackets, 
         expr:args.expr      }, 
      ext:args.ext, 
      from:args._.shift(), 
      to:args._.shift()   }
;
   var method = Object.keys(methods).filter(function(v)  {
         return args[v];
      }
   )[0] || opts.from ? "make" : "help";
   methods[method](opts);
}
;
function toRelative(path)  {
   return path.replace(sh.pwd() + "/", "");
}
;
function log(msg)  {
   if (! log.silent) console.log(msg)}
;
function err(msg)  {
   msg = "
";
   if (! log.silent) log(msg) || process.exit(1)    else throw msg}
;
if (module.parent)  {
   module.exports = methods;
   log.silent = true;
}
 else cli()