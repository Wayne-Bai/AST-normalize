! ✖ / env;
node;
var ansi = require("ansi");
var program = require("commander");
var path = require("path");
var fs = require("fs");
var make_list = function(val)  {
   return val.split(",");
}
;
program.option("-t, --tests <testlist>", "Run the specified html-file-based test(s). 'testlist' should be a comma-separated list", make_list, []).option("-a, --print-all", "Print all tests, not just the failures").option("--disable-color", "Explicitly disable color").option("-c, --color", "Explicitly enable color (default is to use color when not outputting to a pipe)").option("-i, --auto-inject <includefiles>", "Treat the test list as a set of mocha JS files, and automatically generate HTML files with which to test test.  'includefiles' should be a comma-separated list of paths to javascript files to include in each of the generated HTML files", make_list, null).option("-p, --provider <name>", "Use the given provider (defaults to "casper").  Currently, may be "casper" or "zombie"", "casper").option("-g, --generate-html", "Instead of running the tests, just return the path to the generated HTML file, then wait for user interaction to exit (should be used with .js tests)").option("-o, --output-html", "Instead of running the tests, just output the generated HTML source to STDOUT (should be used with .js tests)").option("-d, --debug", "Show debug output (the "console" event) from the provider").parse(process.argv);
if (program.tests.length === 0)  {
   program.tests = fs.readdirSync(__dirname).filter(function(f)  {
         return /^test\.(\w|\.|-)+\.js$/.test(f);
      }
   );
   console.log("using files %s", program.tests);
}
var file_paths = [];
var all_js = program.tests.reduce(function(a, e)  {
      return a && e.slice(- 3) == ".js";
   }, 
   true);
if (all_js && ! program.autoInject)  {
   var all_modules =  {} ;
   program.tests.forEach(function(testname)  {
         var full_path = path.resolve(process.cwd(), testname);
         var content = fs.readFileSync(full_path).toString();
         var ind = content.indexOf("requires local modules: ");
         if (ind > - 1)  {
            ind = "requires local modules: ".length;
            var eol = content.indexOf("
", ind);
            var modules = content.slice(ind, eol).split(/,\s*/);
            modules.forEach(function(mod)  {
                  all_modules[path.resolve(__dirname, "../include/", mod) + ".js"] = 1;
               }
            );
         }
      }
   );
   program.autoInject = Object.keys(all_modules);
}
if (program.autoInject)  {
   var temp = require("temp");
   temp.track();
   var template =  {
      header:"<html>
<head>
<meta charset='utf-8' />
<link rel='stylesheet' href='" + path.resolve(__dirname, "node_modules/mocha/mocha.css") + "'/>
</head>
<body><div id='mocha'></div>", 
      script_tag:function(p)  {
         return "<script src='" + p + "'></script>";
      }, 
      footer:"<script>
mocha.checkLeaks();
mocha.globals(['navigator', 'create', 'ClientUtils', '__utils__']);
mocha.run();
</script>
</body>
</html>"   }
;
   template.header = "
" + template.script_tag(path.resolve(__dirname, "node_modules/chai/chai.js"));
   template.header = "
" + template.script_tag(path.resolve(__dirname, "node_modules/mocha/mocha.js"));
   template.header = "
" + template.script_tag(path.resolve(__dirname, "node_modules/sinon/pkg/sinon.js"));
   template.header = "
" + template.script_tag(path.resolve(__dirname, "node_modules/sinon-chai/lib/sinon-chai.js"));
   template.header = "
<script>mocha.setup('bdd');</script>";
   template.header = program.autoInject.reduce(function(acc, sn)  {
         return acc + "
" + template.script_tag(path.resolve(process.cwd(), sn));
      }, 
      template.header);
   file_paths = program.tests.map(function(jsn, ind)  {
         var templ = template.header;
         templ = "
";
         templ = template.script_tag(path.resolve(process.cwd(), jsn));
         templ = template.footer;
         var tempfile = temp.openSync( {
               prefix:"novnc-zombie-inject-", 
               suffix:"-file_num-" + ind + ".html"            }
         );
         fs.writeSync(tempfile.fd, templ);
         fs.closeSync(tempfile.fd);
         return tempfile.path;
      }
   );
}
 else  {
   file_paths = program.tests.map(function(fn)  {
         return path.resolve(process.cwd(), fn);
      }
   );
}
var use_ansi = false;
if (program.color) use_ansi = true else if (program.disableColor) use_ansi = false else if (process.stdout.isTTY) use_ansi = truevar cursor = ansi(process.stdout,  {
      enabled:use_ansi   }
);
if (program.outputHtml)  {
   file_paths.forEach(function(path, path_ind)  {
         fs.readFile(path, function(err, data)  {
               if (err)  {
                  console.warn(error.stack);
                  return ;
               }
               cursor.bold().write(program.tests[path_ind]).reset().write("
").write(Array(program.tests[path_ind].length + 1).join("=")).write("

").write(data).write("
");
            }
         );
      }
   );
}
if (program.generateHtml)  {
   file_paths.forEach(function(path, path_ind)  {
         cursor.bold().write(program.tests[path_ind]).write(": ").reset().write(path).write("
");
      }
   );
   console.log("");
}
if (program.generateHtml)  {
   process.stdin.resume();
   process.on("SIGINT", function()  {
         process.stdin.pause();
      }
   );
}
if (! program.outputHtml && ! program.generateHtml)  {
   var failure_count = 0;
   var prov = require(path.resolve(__dirname, "run_from_console." + program.provider + ".js"));
   cursor.write("Running tests ").bold().write(program.tests.join(", ")).reset().grey().write(" using provider " + prov.name).reset().write("
");
   var provider = prov.provide_emitter(file_paths);
   provider.on("test_ready", function(test_json)  {
         console.log("");
         filename = program.tests[test_json.file_ind];
         cursor.bold();
         console.log("Results for %s:", filename);
         console.log(Array("Results for :".length + filename.length + 1).join("="));
         cursor.reset();
         console.log("");
         cursor.write("" + test_json.num_tests + " tests run, ").green().write("" + test_json.num_passes + " passed");
         if (test_json.num_slow > 0)  {
            cursor.reset().write(" (");
            cursor.yellow().write("" + test_json.num_slow + " slow").reset().write(")");
         }
         cursor.reset().write(", ");
         cursor.red().write("" + test_json.num_fails + " failed");
         if (test_json.num_skipped > 0)  {
            cursor.reset().write(", ").grey().write("" + test_json.num_skipped + " skipped");
         }
         cursor.reset().write(" -- duration: " + test_json.duration + "s
");
         console.log("");
         if (test_json.num_fails > 0 || program.printAll)  {
            var traverse_tree = function(indentation, node)  {
               if (node.type == "suite")  {
                  if (! node.has_subfailures && ! program.printAll) return                   if (indentation === 0)  {
                     cursor.bold();
                     console.log(node.name);
                     console.log(Array(node.name.length + 1).join("-"));
                     cursor.reset();
                  }
                   else  {
                     cursor.write(Array(indentation + 3).join("#")).bold().write(" " + node.name + " ").reset().write(Array(indentation + 3).join("#")).write("
");
                  }
                  console.log("");
                  for (var i = 0; i < node.children.length; i++)  {
                        traverse_tree(indentation + 1, node.children[i]);
                     }
               }
                else  {
                  if (! node.pass)  {
                     cursor.magenta();
                     console.log("- failed: " + node.text + test_json.replay);
                     cursor.red();
                     console.log("          " + node.error.split("
")[0]);
                     cursor.reset();
                     console.log("");
                  }
                   else if (program.printAll)  {
                     if (node.skipped)  {
                        cursor.grey().write("- skipped: " + node.text);
                     }
                      else  {
                        if (node.slow) cursor.yellow()                         else cursor.green()                        cursor.write("- pass: " + node.text).grey().write(" (" + node.duration + ") ");
                     }
                     cursor.reset().write("
");
                     console.log("");
                  }
               }
            }
;
            for (var i = 0; i < test_json.suites.length; i++)  {
                  traverse_tree(0, test_json.suites[i]);
               }
         }
         if (test_json.num_fails === 0)  {
            cursor.fg.green();
            console.log("all tests passed :-)");
            cursor.reset();
         }
      }
   );
   if (program.debug)  {
      provider.on("console", function(line)  {
            console.log(line);
         }
      );
   }
}
