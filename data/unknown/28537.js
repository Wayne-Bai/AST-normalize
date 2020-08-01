! ✖ / env;
node;
var path = require("path"), fs = require("fs"), nopt = require("nopt"), request = require("request"), async = require("async"), jsdom = require("jsdom").jsdom, mkdirp = require("mkdirp"), Q = require("q"), $ = require("jquery");
require("jsdom").defaultDocumentFeatures =  {
   FetchExternalResources:false, 
   ProcessExternalResources:false, 
   MutationEvents:false, 
   QuerySelector:false}
;
var options =  {
   outputdir:path, 
   format:String, 
   help:Boolean, 
   rules:String, 
   print:Boolean, 
   quiet:Boolean}
, shortHand =  {
   o:["--outputdir"], 
   f:["--format"], 
   h:["--help"], 
   r:["--rules"], 
   p:["--print"], 
   q:["--quiet"]}
;
options = nopt(options, shortHand);
function getAbsoluteUrl(url, mainUrl)  {
   if (! url || ! mainUrl)  {
      return url;
   }
   if (/^http[s]?:\/\//i.test(url))  {
      return url;
   }
   if (/^\/\//.test(url))  {
      return /^http[s]?:/i.exec(mainUrl) + url;
   }
   var protocol = /^http[s]?/i.exec(mainUrl), domain = /^http[s]?:\/\/([^\/]*)[\/]?/i.exec(mainUrl)[1], path = "", depth = url.match(/\.\./g) ? url.match(/\.\./g).length : 0, index;
   url = url.replace(/\.\.\//g, "");
   if (! /^\//.test(url))  {
      path = mainUrl.replace(protocol + "://" + domain, "");
      if (path.length)  {
         index = path.lastIndexOf("/");
         path = index < 1 ? "/" : path.substr(0, index + 1);
         while (depth-- && path.length > 1)  {
               path = path.replace(/[^\/]*\/$/, "");
            }
      }
   }
   return protocol + "://" + domain + path + url;
}
;
function getCssUrls($dom, mainUrl)  {
   var urls = [].concat($dom("link[type="text/css"]").get()).concat($dom("link[rel="stylesheet"]").get());
   urls = urls.map(function(url)  {
         return getAbsoluteUrl(url.href, mainUrl);
      }
   );
   return urls.filter(function(url, index)  {
         return this.indexOf(url) === index;
      }, 
      urls);
}
;
function getCssFnStack(urls)  {
   var cssFnStack = [];
   urls.forEach(function(url)  {
         cssFnStack.push(function(callback)  {
               request(url, function(error, response, body)  {
                     if (error || response.statusCode !== 200)  {
                        body = "";
                        log("spof: ERROR Unable to load CSS resource " + url);
                     }
                     callback(null, body);
                  }
               );
            }
         );
      }
   );
   return cssFnStack;
}
;
function isCLI()  {
   return require.main === module;
}
;
function log(message)  {
   if (options.quiet)  {
      return ;
   }
   console.log(message);
}
;
function exit(message)  {
   if (isCLI())  {
      console.log(message);
      process.exit(0);
   }
}
;
function write(file, message)  {
   var fd = fs.openSync(file, "w");
   fs.writeSync(fd, message);
}
;
function gatherRules(ruleIds, rules)  {
   var idHash =  {} ;
   if (! Array.isArray(ruleIds))  {
      ruleIds = ruleIds.split(",");
   }
   ruleIds.forEach(function(id)  {
         idHash[id] = 1;
      }
   );
   return rules.filter(function(rule)  {
         return idHash[rule.id];
      }
   );
}
;
function exec(args, deferred)  {
   var spof = require("../lib/spof.js").spof, rules = spof.getRules(), usage = ["
USAGE: spofcheck [options]* [urls]*", " ", "Options:", "  --help | -h                      			Displays this information.", "  --format=<format> | -f <format>  			Indicate which format [junit-xml | spof-xml | text] to use for output", "  --outputdir=<dir> | -o <dir>     			Outputs the spof results to this directory.", "  --rules=<rule[,rule]+> | -r <rule[,rule]+>   Indicate which rules to include.", "  --print | -p                     			Outputs the results in console, instead of saving to a file.", "  --quiet | -q                     			Keeps the console clear from logging.", " ", "Example:", "  spofcheck -f junit-xml -o /tests www.ebay.com www.amazon.com", " "].join("
"), formatter = spof.getFormatter(options.format || "junit-xml"), length = args.length, counter = 0, msg = "", resultsQ = [], formattedResultsQ = [], flush = function(results)  {
      var buffer = [], file = options.outputdir || "." + "/" + formatter.id + "." + formatter.extension, output;
      if (options.outputdir)  {
         mkdirp.sync(options.outputdir);
      }
      log("spof: Flushing the results");
      output = formatter.startFormat();
      if (output)  {
         buffer.push(output);
      }
      if (results.length)  {
         buffer.push(results);
      }
      output = formatter.endFormat();
      if (output)  {
         buffer.push(output);
      }
      if (options.print)  {
         log("
spof: Output
");
         console.log(buffer.join("
"));
      }
       else  {
         write(file, buffer.join("
"));
         log("
spof: Results available at " + file);
      }
      log("
spof: SPOF check DONE!
");
   }
;
   deferred = deferred ||  {
      reject:function()  {
      }, 
      resolve:function()  {
      }} ;
   if (! length || options.help)  {
      deferred.reject(new Error(usage));
      return exit(usage);
   }
   if (! formatter)  {
      msg = "spof:  Unknown format '" + options.format + "'. Cannot proceed";
      deferred.reject(new Error(msg));
      return exit(msg);
   }
   if (options.rules)  {
      rules = gatherRules(options.rules, rules);
      if (! rules.length)  {
         msg = "spof: Invalid rules - " + options.rules;
         deferred.reject(new Error(msg));
         return exit(msg);
      }
   }
   args.forEach(function(url)  {
         url = /^http[s]?:\/\//.test(url) ? url : "http://" + url;
         log("spof: Analyzing " + url);
         request(url, function(error, response, body)  {
               if (! error && response.statusCode === 200)  {
                  var win = jsdom(body, null, null).createWindow(), $dom = $.create(win), cssFnStack = getCssFnStack(getCssUrls($dom, url));
                  log("spof: Processing external CSS resources for " + url);
                  async.parallel(cssFnStack, function(err, results)  {
                        var result = spof.analyze($dom, results.join(), rules), formattedResults = formatter.formatResults(result, url);
                        if (formattedResults && formattedResults.length)  {
                           formattedResultsQ.push(formattedResults);
                           result.url = url;
                           resultsQ.push(result);
                        }
                        if (++counter === length)  {
                           if (isCLI())  {
                              flush(formattedResultsQ.join("
"));
                           }
                            else  {
                              deferred.resolve(resultsQ);
                           }
                        }
                     }
                  );
               }
                else  {
                  length--;
                  msg = "spof: ERROR Unable to load " + url;
                  log(msg);
                  deferred.reject(new Error(msg));
               }
            }
         );
      }
   );
}
;
if (isCLI())  {
   exec(options.argv.remain);
}
var run = function(urls, opts)  {
   var deferred = Q.defer();
   if (! urls)  {
      urls = [];
   }
   urls = Array.isArray(urls) ? urls : [urls];
   options = $.extend( {} ,  {
         quiet:true      }, 
      opts);
   exec(urls, deferred);
   return deferred.promise;
}
;
module.exports.run = run;
