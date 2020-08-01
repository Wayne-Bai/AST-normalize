! ✖ / env;
node(function()  {
      "use strict";
      var tmpl = require("./tmpl.js").tmpl, fs = require("fs"), path = require("path"), uglifyJS = require("uglify-js"), runtime = fs.readFileSync(__dirname + "/runtime.js", "utf8"), regexp = /<script( id="([\w\-]+)")? type="text\/x-tmpl"( id="([\w\-]+)")?>([\s\S]+?)<\/script>/gi, helperRegexp = new RegExp(tmpl.helper.match(/\w+(?=\s*=\s*function\s*\()/g).join("\s*\(|") + "\s*\("), list = [], code;
      tmpl.print = function(str)  {
         var helper = helperRegexp.test(str) ? tmpl.helper : "", body = str.replace(tmpl.regexp, tmpl.func);
         if (helper || /_e\s*\(/.test(body))  {
            helper = "_e=tmpl.encode" + helper + ",";
         }
         return "function(" + tmpl.arg + ",tmpl){" + "var " + helper + "_s='" + body + "';return _s;".split("_s+='';").join("") + "}";
      }
;
      process.argv.forEach(function(file, index)  {
            var listLength = list.length, stats, content, result, id;
            if (index > 1)  {
               stats = fs.statSync(file);
               if (! stats.isFile())  {
                  console.error(file + " is not a file.");
                  return ;
               }
               content = fs.readFileSync(file, "utf8");
               while (true)  {
                     result = regexp.exec(content);
                     if (! result)  {
                        break;
                     }
                     id = result[2] || result[4];
                     list.push("'" + id + "':" + tmpl.print(result[5]));
                  }
               if (listLength === list.length)  {
                  id = path.basename(file, path.extname(file));
                  list.push("'" + id + "':" + tmpl.print(content));
               }
            }
         }
      );
      if (! list.length)  {
         console.error("Missing input file.");
         return ;
      }
      code = runtime.replace("{}", "{" + list.join(",") + "}");
      console.log(uglifyJS.minify(code,  {
               fromString:true            }
         ).code);
   }
());
