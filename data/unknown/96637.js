! ✖ / node;
var fs = require("fs");
var Script = process.binding("evals").Script;
global.arguments = process.argv.slice(2);
load = function(file)  {
   Script.runInThisContext(fs.readFileSync(file), file);
}
;
print = console.log;
quit = process.exit;
LOG =  {
   warn:function(msg, e)  {
      if (JSDOC.opt.q) return       if (e) msg = e.fileName + ", line " + e.lineNumber + ": " + msg      msg = ">> WARNING: " + msg;
      LOG.warnings.push(msg);
      if (LOG.out) LOG.out.write(msg + "
")       else print(msg)   }, 
   inform:function(msg)  {
      if (JSDOC.opt.q) return       msg = " > " + msg;
      if (LOG.out) LOG.out.write(msg + "
")       else if (typeof LOG.verbose != "undefined" && LOG.verbose) print(msg)   }} ;
LOG.warnings = [];
LOG.verbose = false;
LOG.out = undefined;
FilePath = function(absPath, separator)  {
   this.slash = separator || "/";
   this.root = this.slash;
   this.path = [];
   this.file = "";
   var parts = absPath.split(/[\\\/]/);
   if (parts)  {
      if (parts.length) this.root = parts.shift() + this.slash      if (parts.length) this.file = parts.pop()      if (parts.length) this.path = parts   }
   this.path = this.resolvePath();
}
;
FilePath.prototype.resolvePath = function()  {
   var resolvedPath = [];
   for (var i = 0; i < this.path.length; i++)  {
         if (this.path[i] == "..") resolvedPath.pop()          else if (this.path[i] != ".") resolvedPath.push(this.path[i])      }
   return resolvedPath;
}
;
FilePath.prototype.toDir = function()  {
   if (this.file) this.file = ""   return this;
}
;
FilePath.prototype.upDir = function()  {
   this.toDir();
   if (this.path.length) this.path.pop()   return this;
}
;
FilePath.prototype.toString = function()  {
   return this.root + this.path.join(this.slash) + this.path.length > 0 ? this.slash : "" + this.file;
}
;
FilePath.fileName = function(path)  {
   var nameStart = Math.max(path.lastIndexOf("/") + 1, path.lastIndexOf("\") + 1, 0);
   return path.substring(nameStart);
}
;
FilePath.fileExtension = function(filename)  {
   return filename.split(".").pop().toLowerCase();
}
;
FilePath.dir = function(path)  {
   var nameStart = Math.max(path.lastIndexOf("/") + 1, path.lastIndexOf("\") + 1, 0);
   return path.substring(0, nameStart - 1);
}
;
SYS =  {} ;
SYS.slash = "/";
SYS.pwd = __dirname + SYS.slash;
IO =  {
   saveFile:function(outDir, fileName, content)  {
      fs.writeFileSync(outDir + "/" + fileName, content, IO.encoding);
   }, 
   readFile:function(path)  {
      return fs.readFileSync(path, IO.encoding);
   }, 
   copyFile:function(inFile, outDir, fileName)  {
      if (fileName == null) fileName = FilePath.fileName(inFile)      var inFile = fs.openSync(inFile, "r");
      var outFile = fs.openSync(outDir + "/" + fileName, "w");
      var buf = new Buffer(4096);
      while (fs.readSync(inFile, buf, 0, buf.length) > 0)  {
            fs.writeSync(outFile, buf);
         }
      fs.closeSync(inFile);
      fs.closeSync(outFile);
   }, 
   mkPath:function(path)  {
      if (path.constructor != Array) path = path.split(/[\\\/]/)      var make = "";
      for (var i = 0, l = path.length; i < l; i++)  {
            make = path[i] + SYS.slash;
            if (! IO.exists(make))  {
               IO.makeDir(make);
            }
         }
   }, 
   makeDir:function(path)  {
      fs.mkdirSync(path, 511);
   }, 
   ls:function(dir, recurse, _allFiles, _path)  {
      if (_path === undefined)  {
         var _allFiles = [];
         var _path = [dir];
      }
      if (_path.length == 0) return _allFiles      if (recurse === undefined) recurse = 1      var s = fs.statSync(dir);
      if (! s.isDirectory()) return [dir]      var files = fs.readdirSync(dir);
      for (var f = 0; f < files.length; f++)  {
            var file = files[f];
            if (file.match(/^\.[^\.\/\\]/)) continue            if (fs.statSync(_path.join("/") + "/" + file).isDirectory())  {
               _path.push(file);
               if (_path.length - 1 < recurse) IO.ls(_path.join("/"), recurse, _allFiles, _path)               _path.pop();
            }
             else  {
               _allFiles.push(_path.join("/") + "/" + file.replace("//", "/"));
            }
         }
      return _allFiles;
   }, 
   exists:function(path)  {
      try {
         fs.statSync(path);
         return true;
      }
      catch (e) {
         return false;
      }
   }, 
   open:function(path, append)  {
      if (append == null) append = true      return fs.createWriteStream(path,  {
            flags:append ? "a" : "w"         }
      );
   }, 
   setEncoding:function(encoding)  {
      if (/UTF-8/i.test(encoding))  {
         IO.encoding = "utf8";
      }
       else if (/ASCII/i.test(encoding))  {
         IO.encoding = "ascii";
      }
       else  {
         throw "Unsupported encoding: " + encoding + " - perhaps you can use UTF-8?";
      }
   }, 
   encoding:"utf8", 
   include:function(relativePath)  {
      load(SYS.pwd + relativePath);
   }, 
   includeDir:function(path)  {
      if (! path) return       for (var lib = IO.ls(SYS.pwd + path), i = 0; i < lib.length; i++) if (/\.js$/i.test(lib[i])) load(lib[i])   }} ;
IO.include("frame.js");
IO.include("main.js");
main();
