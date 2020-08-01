! ✖ / env;
node;
var path = require("path"), fs = require("fs"), gzip = require("zlib").gzip, spawn = require("child_process").spawn, marked = require(path.join(__dirname, "vendor", "marked")), closurePath = path.join(__dirname, "vendor", "closure-compiler.jar"), closureOptions = ["--compilation_level=ADVANCED_OPTIMIZATIONS", "--warning_level=QUIET"];
marked.setOptions( {
      gfm:true   }
);
fs.readFile(path.join(__dirname, "README.md"), "utf8", function(exception, source)  {
      if (exception)  {
         console.log(exception);
      }
       else  {
         fs.readFile(path.join(__dirname, "page", "page.html"), "utf8", readTemplate);
      }
      function readTemplate(exception, page)  {
         var headers, lines, lastSection, lastLevel, navigation;
         if (exception)  {
            console.log(exception);
         }
          else  {
            headers = [];
            lines = source.split(/\r?\n/);
            lines.forEach(function(line, index)  {
                  var match = /^(\#{1,6})\s+(.+?)\s+\1$/.exec(line);
                  if (match)  {
                     headers.push([index, match[1].length, match[2]]);
                  }
               }
            );
            headers.forEach(function(value)  {
                  var index = value[0], level = value[1], text = value[2], section, length;
                  if (lastSection)  {
                     section = lastSection.slice(0);
                     if (lastLevel < level)  {
                        section.push(1);
                     }
                      else  {
                        length = lastLevel - level;
                        while (length--)  {
                              section.pop();
                           }
                        section[section.length - 1] = 1;
                     }
                  }
                   else  {
                     section = [1];
                  }
                  lines[index] = Array(level + 1).join("#") + "<a name="section_" + section.join(".") + ""></a>" + text;
                  value.push(section);
                  lastSection = section;
                  lastLevel = level;
               }
            );
            navigation = headers.map(function(value)  {
                  var index = value[0], level = value[1], text = value[2], section = value[3], name = section.join(".");
                  return "<li><a href="#section_" + name + "">" + text + "</a></li>";
               }
            );
            navigation.push("");
            fs.writeFile(path.join(__dirname, "index.html"), page.replace(/<%=\s*(.+?)\s*%>/g, function(match, data)  {
                     switch(data) {
                        case "navigation":
 
                              return navigation.join("
");
                           
                        case "source":
 
                              return marked(lines.join("
"));
                           
}
;
                     return "";
                  }
               ), function(exception)  {
                  console.log(exception || "GitHub project page generated successfully.");
               }
            );
         }
      }
;
   }
);
fs.readFile(path.join(__dirname, "lib", "kamino.js"), "utf8", function(exception, source)  {
      var error, output, compiler, results;
      if (exception)  {
         console.log(exception);
      }
       else  {
         error = output = "";
         compiler = spawn("java", ["-jar", closurePath].concat(closureOptions));
         compiler.stdout.on("data", function(data)  {
               output = data;
            }
         );
         compiler.stderr.on("data", function(data)  {
               error = data;
            }
         );
         compiler.on("exit", function(status)  {
               var exception;
               if (status)  {
                  exception = new Error(error);
                  exception.status = status;
               }
               compressSource(exception, output);
            }
         );
         compiler.stdin.end(source.replace(/^;?\(function\s*\(\)\s*\{([\s\S]*?)}\)\.call\(this\);*?/m, "$1"));
      }
      function compressSource(exception, compressed)  {
         if (exception)  {
            console.log(exception);
         }
          else  {
            compressed = extractComments(source)[0] + "
;(function(){" + compressed + "}());";
            fs.writeFile(path.join(__dirname, "lib", "kamino.min.js"), compressed, writeSource);
         }
         function writeSource(exception)  {
            console.log(exception || "Compressed version generated successfully.");
            gzip(compressed, function(exception, results)  {
                  console.log("Compressed version size: %d bytes.", results.length);
               }
            );
         }
;
      }
;
   }
);
function extractComments(source)  {
   var index = 0, length = source.length, results = [], symbol, position, original;
   while (index < length)  {
         symbol = source[index];
         switch(symbol) {
            case "/":
 
                  original = symbol;
                  symbol = source[++index];
                  switch(symbol) {
                     case "/":
 
                           position = source.indexOf("
", index);
                           if (position < 0)  {
                              position = source.indexOf("", index);
                           }
                           results.push(original + source.slice(index, index = position < 0 ? length : position));
                           break;
                        
                     case "*":
 
                           position = source.indexOf("*/", index);
                           if (position < 0)  {
                              throw SyntaxError("Unterminated block comment.");
                           }
                           results.push(original + source.slice(index, index = position = 2));
                           break;
                        
                     default:
 
                           index++;
                        
}
;
                  break;
               
            case """:
 
               
            case "'":
 
                  for (position = index, original = symbol; index < length; )  {
                        symbol = source[++index];
                        if (symbol == "\")  {
                           index++;
                        }
                         else if ("
  ".indexOf(symbol) > - 1)  {
                           throw SyntaxError("Illegal line continuation.");
                        }
                         else if (symbol == original)  {
                           break;
                        }
                     }
                  if (source[index] == original)  {
                     index++;
                     break;
                  }
                  throw SyntaxError("Unterminated string.");
               
            default:
 
                  index++;
               
}
;
      }
   return results;
}
;
