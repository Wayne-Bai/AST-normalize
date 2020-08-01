! ✖ / env;
node;
"use strict";
process.title = "ribs";
var log = require("npmlog");
log.heading = "ribs";
var ribs = require(".."), inspect = ribs.utils.inspect, options = require("../lib/cli").options, _ = require("lodash");
var verbose = "verbose" == log.level;
log.verbose("process");
var current, checkpoint, start = Date.now();
ribs(options.src, options.dst, options.operations, function(err)  {
      var delta = Date.now() - start;
      if (err) log.error(current, err.message, verbose ? "
" + err.stack.split("
").slice(1).join("
") : "")       else log.info("ok", delta + "ms")   }
).on("operation:before", function(name, params)  {
      log.verbose(name, inspect(params));
      current = name;
      checkpoint = Date.now();
   }
).on("operation:after", function(name, params)  {
      var delta = Date.now() - checkpoint;
      if ("from" == name) params = params.path       else if ("to" == name) params = params.dst      log.info(name, delta + "ms", inspect(params));
   }
);
