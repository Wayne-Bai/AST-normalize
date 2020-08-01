! ✖ / env;
node;
var crawler = require("simplecrawler"), basCLI = require("commander"), colors = require("colors"), yoyaku = require("yoyaku"), request = require("request"), url = require("url"), util = require("util"), async = require("async"), BAS = require("./index"), packageInfo = require("../package.json"), testSuite = new BAS(), crawl = null;
var iconv = null;
try {
   iconv = require("iconv");
}
catch (e) {
   console.error("Warning: ".red + "It appears " + "iconv".white + " was not properly installed.
" + "Unless you install it, you may be unable to correctly test pages " + "encoded in anything other than UTF-8.");
}
function utf8(buffer, sourceEncoding)  {
   if (! iconv) return buffer   try {
      return new iconv.Iconv("UTF-8", sourceEncoding).convert(buffer);
   }
   catch (e) {
      console.error("ERROR: Failed to convert resource to UTF-8.".red);
      console.error(String(e.message).red);
      console.error(e.stack);
   }
   return buffer;
}
;
var errorBatch =  {} , errorCount = 0, requestErrs =  {} , pagesTested = 0;
basCLI.version(packageInfo.version).option("-c --crawl", "Crawl from the specified URLs").option("-s --sheet <filename>", "Test using the specified BAS").option("-l --limit <number>", "Limit number of resources to request when crawling", parseInt).option("-d --die", "Die on first error").option("-q --quiet", "Suppress output (prints report/json only)").option("-v --verbose", "Verbose output").option("-j --json", "Output list of errors as JSON").option("--csv", "Output list of errors as CSV").option("--noquery", "Don't download resources with a querystring").option("-u --username <username>", "Username for HTTP Basic Auth (crawl)").option("-p --password <password>", "Password for HTTP Basic Auth (crawl)").option("-i --interval <integer>", "Request interval in ms (crawl)").option("-r --concurrency <integer>", "Request concurrency (crawl)").parse(process.argv);
function log()  {
   if (! basCLI.quiet) console.error.apply(console, arguments)}
;
function error()  {
   if (! basCLI.quiet) console.error.apply(console, arguments)}
;
if (! basCLI.args.length)  {
   error("You must specify at least one URL to test against.");
   process.exit(1);
}
var seedURLs = basCLI.args.map(function(arg)  {
      var parts, list = [];
      if (parts = String(arg).match(/\%\{(\d+)\-(\d+)\}/))  {
         var from = + parts[1] | 0, to = + parts[2] | 0;
         if (from > to)  {
            from = to;
            to = + parts[1] | 0;
         }
         for (var index = from; index <= to; index++) list.push(String(arg).replace(/\%\{\d+\-\d+\}/i, index))         return list;
      }
      return arg;
   }
).reduce(function(prev, cur)  {
      return prev.concat(cur);
   }, 
   []);
if (basCLI.sheet)  {
   log("Using behaviour assertion sheet: %s", basCLI.sheet.yellow);
   testSuite.loadSheet(basCLI.sheet).yep(requestData);
}
 else  {
   console.log("Waiting for BAS input from STDIN.");
   var stdinBuffer = "";
   process.stdin.resume();
   process.stdin.on("data", function(chunk)  {
         stdinBuffer = chunk.toString();
      }
   ).on("end", function()  {
         console.log("
Thanks, got it.");
         testSuite.loadSheet(Buffer(stdinBuffer)).yep(requestData);
      }
   );
}
function requestData()  {
   log("Commencing initial data request.
Spooled URLs are:");
   basCLI.args.forEach(function(url)  {
         log("	" + url.blue);
      }
   );
   log("
");
   if (basCLI.crawl)  {
      log("We're crawling based on these URLs.");
      startCrawl();
   }
    else  {
      var sequence = [];
      seedURLs.forEach(function(url)  {
            sequence.push(function(done)  {
                  request(url, function(err, res, body)  {
                        if (err) return done(err)                        handleResponse(url, res, body, done);
                     }
                  );
               }
            );
         }
      );
      async.series(sequence, printReport);
   }
}
;
var handleResponse = yoyaku.yepnope(function(url, res, data, promises)  {
      var status = String(res.statusCode);
      status = res.statusCode < 400 ? status.green : status.red;
      pagesTested++;
      var pagesToGo = basCLI.crawl ? basCLI.limit < crawl.queue.length ? basCLI.limit : crawl.queue.length : basCLI.limit < seedURLs.length ? basCLI.limit : seedURLs.length;
      log("[%d/%d] Testing resource: (%s) %s", pagesTested, pagesToGo, status, url.blue);
      var type = res.headers["content-type"], encoding;
      if (type && type.match(/;\s+charset\s*\=\s*/i))  {
         encoding = type.substr(type.indexOf(";"));
         encoding = encoding.split(/;\s+charset\s*\=\s*/i).pop();
         encoding = encoding.trim();
         log("Resource is encoded as %s.", encoding.blue);
         data = utf8(data, encoding);
      }
      function testSuiteCompleted()  {
         if (! basCLI.limit || pagesTested < parseInt(basCLI.limit, 10))  {
            if (crawl) crawl.start()            promises();
         }
          else  {
            printReport();
         }
      }
;
      testSuite.run(url, res, data).yep(testSuiteCompleted).nope(function(err)  {
            error("Failed to run test suite for %s".red, url.blue);
            error(err.message.red);
            if (! err.message.match(/call stack/i) && ! err.message.match(/unable to execute selector/i))  {
               error(err.stack);
               process.exit(1);
            }
            testSuiteCompleted();
         }
      );
   }
);
function startCrawl()  {
   crawl = crawler.crawl(seedURLs[0]);
   crawl.userAgent = "Behaviour Assertion Sheets " + packageInfo.version;
   crawl.maxConcurrency = basCLI.concurrency ? + basCLI.concurrency | 0 : 5;
   crawl.interval = basCLI.interval ? + basCLI.interval | 0 : 250;
   console.log("Crawling with concurrency %d and interval %d.", crawl.maxConcurrency, crawl.interval);
   crawl.timeout = 5000;
   if (basCLI.username && basCLI.password)  {
      crawl.needsAuth = true;
      crawl.authUser = basCLI.username;
      crawl.authPass = basCLI.password;
   }
   if (basCLI.noquery) crawl.addFetchCondition(function(url)  {
         if (url.path !== url.uriPath) return false         return true;
      }
   )   var domains = seedURLs.map(function(urlString)  {
         return String(url.parse(urlString).hostname).toLowerCase();
      }
   ).sort().reduce(function(prev, cur, idx, arr)  {
         if (prev[prev.length - 1] !== cur) prev.push(cur)         return prev;
      }, 
      []).forEach(function(domain)  {
         crawl.domainWhitelist.push(domain);
      }
   );
   seedURLs.forEach(crawl.queueURL.bind(crawl));
   crawl.on("fetchcomplete", function(queueItem, data, res)  {
         handleResponse(queueItem.url, res, data);
      }
   );
   crawl.on("fetchredirect", function(queueItem, newURL, res)  {
         error(util.format("Redirect --> %s".green, newURL.path));
         handleResponse(queueItem.url, res, "");
      }
   );
   crawl.on("fetcherror", function(queueItem, res)  {
         error(util.format("Unable to download '%s' due to request/service error. (%d)", queueItem.url, res.statusCode).red);
         requestErrs[queueItem.url] = res.statusCode;
      }
   );
   crawl.on("fetch404", function(queueItem, res)  {
         if (basCLI.verbose) error(util.format("404: Resource missing: '%s'.", queueItem.url).yellow)         requestErrs[queueItem.url] = res.statusCode;
         handleResponse(queueItem.url, res, "");
      }
   );
   crawl.on("complete", printReport);
}
;
function jsonToCSV(input)  {
   var csvOut = "";
   function csvEscape(text)  {
      return """ + String(text || "").replace(/\"/gi, """") + """;
   }
;
   csvOut = "URL,Annotations,Selector,Subject,Component,Actual,Node,NodePath,Message
";
   function writeLine(error)  {
      csvOut = csvEscape(key) + "," + csvEscape(error.annotations.join(", ")) + "," + csvEscape(error.selector) + "," + csvEscape(error.subject) + "," + csvEscape(error.component) + "," + csvEscape(error.actual) + "," + csvEscape(error.node) + "," + csvEscape(error.nodePath) + "," + csvEscape(error.message) + "
";
   }
;
   for (var key in input)  {
         if (! input.hasOwnProperty(key)) continue         if (! input[key] instanceof Array && input[key].length) continue         input[key].forEach(writeLine);
      }
   return csvOut;
}
;
if (basCLI.verbose)  {
   testSuite.on("start", function(url)  {
         log("	Commencing BAS test suite");
      }
   );
   testSuite.on("startgroup", function(rule)  {
         log("	Starting test group: " + String(rule).yellow);
      }
   );
   testSuite.on("selector", function(selector)  {
         log("		Testing selector " + String(selector).yellow);
      }
   );
   testSuite.on("assertion", function(assertion)  {
         log("			Testing assertion " + String(assertion).yellow);
      }
   );
   testSuite.on("assertionsuccess", function(assertion)  {
         log("				✔  " + assertion.green);
      }
   );
}
testSuite.on("assertionfailed", function(errors, assertion)  {
      var indent = "";
      if (basCLI.verbose) indent = "			"      error(indent + "	✘ Assertion failed: " + assertion.red);
      errors.forEach(function(assertionError)  {
            error(indent + "		" + String(assertionError).red);
         }
      );
      if (basCLI.die) process.exit(1)   }
);
testSuite.on("end", function(url)  {
      if (basCLI.verbose)  {
         log("	BAS test suite completed with " + testSuite.errors.length ? "errors:" : "no errors.");
         testSuite.errors.forEach(function(assertionError)  {
               error("		" + String(assertionError).red);
            }
         );
      }
      if (testSuite.errors.length)  {
         errorBatch[url] = [];
         errorCount = testSuite.errors.length;
         testSuite.errors.forEach(function(assertionError)  {
               errorBatch[url].push( {
                     message:assertionError.message, 
                     selector:assertionError.selector, 
                     nodePath:assertionError.nodePath, 
                     node:assertionError.node, 
                     annotations:assertionError.annotations, 
                     subject:assertionError.subject, 
                     component:assertionError.component, 
                     actual:assertionError.actual                  }
               );
            }
         );
      }
   }
);
function printReport()  {
   console.error("
Test batch completed. (%d requests)", pagesTested);
   if (errorCount)  {
      console.error("%d assertion failures encountered over batch.".red, errorCount);
   }
    else  {
      console.error("No assertion failures encountered over batch.".green);
   }
   if (! basCLI.json && ! basCLI.csv)  {
      var pageErrors = [];
      var outputError = function(error)  {
         console.error("
		✘ ".red + String(error.message).red);
         if (error.annotations.length)  {
            console.error("			" + error.annotations.join("
			").bold);
         }
         if (error.selector)  {
            console.error("				Selector: " + String(error.selector).yellow);
         }
         if (error.node)  {
            console.error("				Node: " + String(error.node).cyan);
         }
         if (error.nodePath)  {
            console.error("				Node Path: " + String(error.nodePath).yellow);
         }
      }
;
      for (var idx in errorBatch)  {
            if (! errorBatch.hasOwnProperty(idx)) continue            pageErrors = errorBatch[idx];
            console.error("

Failures for " + idx.blue.bold + "
");
            console.error("	%d failed assertions: ".red, pageErrors.length);
            pageErrors.forEach(outputError);
         }
   }
    else if (basCLI.csv)  {
      process.stdout.write(jsonToCSV(errorBatch));
   }
    else  {
      process.stdout.write(JSON.stringify(errorBatch, null, 2));
   }
   process.exit(errorCount);
}
;
process.on("SIGINT", printReport);
