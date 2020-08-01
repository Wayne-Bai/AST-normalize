! ✖ / env;
node;
var namespace = "vk";
var jsOutput = "build/vk.js";
var cssOutput = "build/vk.css";
var fs = require("fs"), path = require("path");
var lib = "lib/components";
var js = fs.createWriteStream(jsOutput,  {
      flags:"a"   }
);
var components = process.argv.slice(2);
function next(i)  {
   var name = components[i];
   if (! name) return    build(name, function()  {
         next(++i);
      }
   );
}
;
console.log();
js.write("var " + namespace + " = {};
");
next(0);
process.on("exit", function()  {
      console.log();
   }
);
function build(name, fn)  {
   var js = path.join(lib, name, name + ".js");
   read(js, function(err, js)  {
         function done()  {
            console.log("  [90mbuild [36m%s[m", name);
            fn();
         }
;
         if (err) return done()         var template = path.join(lib, name, name + ".html");
         if (fs.existsSync(template))  {
            read(template, function(err, template)  {
                  js = "
;(function(exports, template){
" + js + "
})(" + namespace + ", " + JSON.stringify(template) + ");";
                  append(jsOutput, js, done);
               }
            );
         }
          else  {
            js = "
;(function(exports){
" + js + "
})(" + namespace + ");";
            append(jsOutput, js, done);
         }
      }
   );
   var css = path.join(lib, name, name + ".css");
   if (fs.existsSync(css))  {
      read(css, function(err, css)  {
            append(cssOutput, css);
         }
      );
   }
}
;
function append(file, str, fn)  {
   fs.createWriteStream(file,  {
         flags:"a"      }
   ).write(str);
   fn && fn();
}
;
function read(file, fn)  {
   fs.readFile(file, "utf8", function(err, str)  {
         if (err) return fn(err)         fn(false, str);
      }
   );
}
;
