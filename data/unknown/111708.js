! ✖ / env;
node;
const;
CHECKMARK = "✓";
const;
OK_FINISH_REGEXP = /^ok$/;
const;
FAIL_FINISH_REGEXP = /^fail[0-9\s]+$/;
const;
SKIP_FINISH_REGEXP = /^skip[0-9\s]+$/;
const;
CURRENT_TEST_START =  {
   name:"", 
   total:0, 
   skipped:false, 
   failed:[], 
   ok:[]}
;
var colors = require("colors");
function copy(obj)  {
   return JSON.parse(JSON.stringify(obj));
}
;
function colorizeTapOutput(options)  {
   var tc = options.tapConsumer;
   var log = options.log || console.log.bind(console);
   var testFileRegexp = options.testFileRegexp || /^$/;
   var debug = options.debug;
   var passed = 0;
   var failed = 0;
   var skipped = 0;
   var currentTest = copy(CURRENT_TEST_START);
   var lastOutput = null;
   tc.on("bailout", function(info)  {
         log("BAILOUT".red, info);
         process.exit(1);
      }
   );
   tc.on("data", function(c)  {
         if (typeof c == "object")  {
            if (debug) log("DEBUG".magenta, JSON.stringify(c, null, 2).grey)            currentTest.total++;
            if (c.ok)  {
               if (c.skip)  {
                  currentTest.skipped = true;
                  skipped++;
               }
                else  {
                  currentTest.ok.push(c);
                  passed++;
               }
            }
             else  {
               if (c.timedOut) log("TIMEOUT".red, c.name.trim())               if (c.exit) process.exit(c.exit)               currentTest.failed.push(c);
               failed++;
            }
         }
          else  {
            if (debug) log("DEBUG".magenta, c.grey)            if (currentTest.total)  {
               if (OK_FINISH_REGEXP.test(currentTest.name) || FAIL_FINISH_REGEXP.test(currentTest.name) || SKIP_FINISH_REGEXP.test(currentTest.name))  {
                  if (currentTest.ok.length)  {
                     console.log("
Finished testing ".grey + currentTest.ok[0].name.trim() + ".
".grey);
                  }
               }
                else if (currentTest.name)  {
                  if (currentTest.failed.length)  {
                     log("x".red, currentTest.name.grey);
                     log();
                     currentTest.failed.forEach(function(c)  {
                           log("  " + c.name.trim(), "failure".grey);
                           if ("found" in c && "wanted" in c)  {
                              log("  found ".grey, JSON.stringify(c.found));
                              log("  wanted".grey, JSON.stringify(c.wanted));
                              if (c.diff)  {
                                 log("  diff".grey);
                                 c.diff.split("
").forEach(function(line)  {
                                       log("    " + line);
                                    }
                                 );
                              }
                           }
                           if (c.stack)  {
                              log("
  Traceback (most recent call first):".grey);
                              c.stack.forEach(function(line)  {
                                    log("    " + line.match(testFileRegexp) ? line.white : line.grey);
                                 }
                              );
                           }
                            else if (c.file)  {
                              log("  @ ".grey + c.file + ":".grey + c.line);
                           }
                           log();
                        }
                     );
                  }
                   else if (currentTest.skipped)  {
                     log("S".yellow, currentTest.name.grey);
                  }
                   else  {
                     log(CHECKMARK.green, currentTest.name.grey);
                  }
               }
               currentTest = copy(CURRENT_TEST_START);
            }
            currentTest.name = c;
         }
      }
   );
   tc.on("end", function()  {
         var total = passed + failed;
         var count = passed + "/" + total;
         log(passed == total ? count.green : count.red, "tests passed,".grey, skipped ? skipped.toString().yellow : "none".grey, "skipped.".grey);
         process.exit(failed);
      }
   );
}
;
function colorizeStdin()  {
   var tapConsumer = new require("tap/lib/tap-consumer")();
   colorizeTapOutput( {
         debug:"DEBUG" in process.env, 
         tapConsumer:tapConsumer, 
         testFileRegexp:/\.test\.js/      }
   );
   process.stdin.setEncoding("utf8");
   process.stdin.pipe(tapConsumer);
}
;
module.exports = colorizeTapOutput;
if (! module.parent) colorizeStdin()