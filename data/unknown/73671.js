! ✖ / env;
node;
var editor = process.env.EDITOR || process.platform === "win32" ? "notepad" : "vim";
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var nopt = require("nopt");
var opts = nopt( {
      width:Number, 
      numbering:["hex_bytes", "none"], 
      format:["fours", "twos", "none"], 
      caps:["lower", "upper"], 
      annotate:["ascii", "none"], 
      prefix:String, 
      indent:Number, 
      help:Boolean   }, 
    {
      h:"--help"   }
);
var defaults =  {
   width:16, 
   numbering:"hex_bytes", 
   format:"fours", 
   caps:"lower", 
   annotate:"ascii", 
   prefix:"", 
   indent:0}
;
if (opts.argv.remain.length !== 1 || opts.help)  {
   console.error("Usage: hexedit [options] <file>");
   console.error("Options are identical to hexy's:");
   console.error(" --width     [(16)]              how many bytes per line");
   console.error(" --numbering [(hex_bytes)|none]  prefix current byte count");
   console.error(" --format    [(fours)|twos|none] how many nibbles per group");
   console.error(" --caps      [(lower)|upper]     case of hex chars");
   console.error(" --annotate  [(ascii)|none]      provide ascii annotation");
   console.error(" --prefix    [("")|<prefix>]     printed in front of each line");
   console.error(" --indent    [(0)|<num>]         number of spaces to indent output");
   console.error(" --help|-h                       display this message");
   process.exit(opts.help ? 0 : 1);
}
var file = path.resolve(opts.argv.remain[0]);
var tmp = path.resolve(path.dirname(file), ".hexedit-" + path.basename(file) + ".hex");
opts.__proto__ = defaults;
var n = opts.prefix.length + opts.indent;
var header = "# ";
if (opts.numbering !== "none")  {
   header = new Array(n + 1).join(" ") + "offset: ";
   n = 10;
}
var width = opts.width;
var spaces = opts.format === "fours" ? Math.ceil(width / 2) - 1 : opts.format === "twos" ? width + 1 : 0;
var b = 2 * opts.width + spaces;
n = b + 1;
header = "data" + new Array(b - 1).join(" ");
if (opts.annotate !== "none")  {
   header = "# ascii";
}
var hexy = require("hexy").hexy;
var buf = new Buffer([header].concat(hexy(fs.readFileSync(file), opts).split("
").map(function(s)  {
            if (! s.trim()) return s.trim()            return s.slice(0, n + 1) + "#" + s.slice(n);
         }
      )).join("
"));
fs.writeFileSync(tmp, buf);
fs.watch(tmp, update);
var start = Date.now();
child_process.spawn(editor, [tmp],  {
      customFds:[0, 1, 2]   }
).on("exit", function(c)  {
      var end = Date.now();
      if (end - start < 100)  {
         console.error("Editor exited immediately.");
         return update(true, 1);
      }
      c = c || 0;
      console.error("editor exited with " + c);
      update(true, c);
   }
);
var ut;
function update(exit, code)  {
   if (ut) clearTimeout(ut)   ut = setTimeout(function()  {
         clearTimeout(ut);
         ut = null;
         var c = fs.readFileSync(tmp);
         c = c.toString("utf8");
         c = c.split("
").map(function(c)  {
               return c.replace(/#.*$/g, "").replace(/^[^:]+:/, "").replace(/[\n\r\t\s ]/g, "").trim();
            }
         );
         c = c.join("");
         c = c.trim();
         var bytes;
         try {
            bytes = new Buffer(c, "hex");
         }
         catch (ex) {
            console.error(ex.message);
            if (exit === true && typeof code === "number")  {
               process.exit(code || 1);
            }
            return ;
         }
         fs.writeFileSync(file, bytes);
         if (true === exit && typeof code === "number")  {
            console.error("exiting");
            fs.unlinkSync(tmp);
            process.exit(code);
         }
      }, 
      100);
}
;
