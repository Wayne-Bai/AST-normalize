! ✖ / env;
node;
function()  {
   "use strict";
   var fs = require("fs");
   var licenseTemplate = ["/**", " * @license", " * Lo-Dash <%= VERSION %> lodash.com/license", " * Underscore.js 1.4.4 underscorejs.org/LICENSE", " */"].join("
");
   function postprocess(source)  {
      source = source.replace(/^\/\**[\s\S]+?\*\/\n/, "");
      source = source.replace(/prototype\s*=\s*{\s*valueOf\s*:\s*1\s*}/, "prototype={valueOf:1,y:1}").replace(/(document[^&]+&&)\s*(?:\w+|!\d)/, "$1!({toString:0}+"")");
      source = source.replace(/(\w)?("[^"]+")\s*([!=]=)\s*(typeof(?:\s*\([^)]+\)|\s+[.\w]+(?!\[)))/g, function(match, other, type, equality, expression)  {
            return other ? other + " " : "" + expression + equality + type;
         }
      );
      if (source)  {
         source = source.replace(/[\s;]*?(\s*\/\/.*\s*|\s*\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/\s*)*$/, ";$1");
      }
      var snippet = /VERSION\s*[=:]\s*([\'"])(.*?)\1/.exec(source);
      if (! snippet)  {
         return source;
      }
      var version = snippet[2];
      source = licenseTemplate.replace("<%= VERSION %>", version) + "
;" + source;
      return source;
   }
;
   if (module != require.main)  {
      module.exports = postprocess;
   }
    else  {
      function()  {
         var options = process.argv;
         if (options.length < 3)  {
            return ;
         }
         var filePath = options[options.length - 1], source = fs.readFileSync(filePath, "utf8");
         fs.writeFileSync(filePath, postprocess(source), "utf8");
      }
();
   }
}
();
