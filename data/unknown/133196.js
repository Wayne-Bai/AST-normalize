! ✖ / env;
node;
exports.href = function(path, line, column)  {
   return "txmt://open?url=file://" + path + "&line=" + line + "&column=" + column;
}
;
exports.pathRegExp = /(\/(?:sbin|home|net|tmp|System|opt|Network|usr|private|Users|Volumes|bin|Library|Applications)\/.+?\.x?js(?:x|on)?)(?::(\d+)(?::(\d+))?)?/g;
exports.linkPaths = function(html)  {
   return String(html).replace(exports.pathRegExp, exports.linkPath);
}
;
exports.linkPath = function(match, path, line, column)  {
   return "<a tabindex=0 style="padding-left:.5ex;border-left:2.3ex solid " + exports.uniqueColorFor(path + line) + ";" href="" + exports.href(path, line, column) + "">" + match.replace(process.env.TM_DIRECTORY + "/", "") + "</a><script>document.getElementsByTagName("a")[0].focus()</script>";
}
;
exports.uniqueColorFor_cache =  {} ;
exports.uniqueColorFor = function(thing)  {
   return exports.uniqueColorFor_cache[thing] || exports.uniqueColorFor_cache[thing] = "hsl(" + Math.random() * 360 + ", 50%, 50%)";
}
;
var matchHome = RegExp(process.env.HOME, "g");
exports.expandFileNameToPath = function(fileName)  {
   return process.installPrefix + "/lib/" + fileName;
}
;
if (module.id == ".")  {
   require("assert").equal(exports.linkPaths("/Users/thomas/Projects/Sencha/SDK/build/bin/build-bootstraps-2.js:90:60"), exports.linkPath("/Users/thomas/Projects/Sencha/SDK/build/bin/build-bootstraps-2.js:90:60", "/Users/thomas/Projects/Sencha/SDK/build/bin/build-bootstraps-2.js", 90, 60));
   require("assert").equal(exports.linkPaths("node.js:183
                    throw e; // process.nextTick error, or 'error' event on first tick
                    ^
            TypeError: Cannot read property 'className' of undefined
                at isClobberedBy (/Users/thomas/Projects/Sencha/SDK/build/lib/discover-metaclass.js:114:14)
                at isClobberedBy (/Users/thomas/Projects/Sencha/SDK/build/lib/discover-metaclass.js:119:15)
                at isClobberedBy (/Users/thomas/Projects/Sencha/SDK/build/lib/discover-metaclass.js:119:15)
                at Function.isClobberedBy (/Users/thomas/Projects/Sencha/SDK/build/lib/discover-metaclass.js:119:15)
                at Object.<anonymous> (/Users/thomas/Projects/Sencha/SDK/build/lib/discover-metaclass.js:166:32)
                at Module._compile (module.js:423:26)
                at Object..js (module.js:429:10)
                at Module.load (module.js:339:31)
                at Function._load (module.js:298:12)
                at Array.<anonymous> (module.js:442:10)").match(/txmt:/g).length, 5);
   require("assert").equal(exports.linkPaths("/Users/aylott/Dropbox/Work/node-headless-inspector/demo-chrome.js:17:22"), exports.linkPath("/Users/aylott/Dropbox/Work/node-headless-inspector/demo-chrome.js:17:22", "/Users/aylott/Dropbox/Work/node-headless-inspector/demo-chrome.js", 17, 22));
   try {
      var action = process.argv[2] || process.env.TM_SELECTED_TEXT;
      var args = process.argv.slice(3);
      if (exports[action])  {
         process.stdin.resume();
         process.stdin.on("data", function(data)  {
               process.stdout.write(exports[action].apply(null, [data].concat(args)));
            }
         );
      }
       else  {
         console.warn(exports);
      }
   }
   catch (e) {
      console.error(exports);
      process.exit(1);
   }
}
