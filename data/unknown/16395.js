! ✖ / env;
node;
"use strict";
var async = require("async"), bot = require(".."), client = new bot( {
      server:"pl.wikipedia.org", 
      path:"/w", 
      debug:true   }
), logType = "thanks";
var start = "", logEntries = [];
async.whilst(function()  {
      return true;
   }, 
   function(callback)  {
      console.error("Getting %s logs since %s...", logType, start);
      client.getLog(logType, start, function(err, data, next)  {
            logEntries = logEntries.concat(data);
            start = next;
            callback(next ? null : "no more data");
         }
      );
   }, 
   function(err)  {
      var csv = require("csv-string"), len = logEntries.length;
      function writeCsvLine(data)  {
         process.stdout.write(csv.stringify(data));
      }
;
      console.error("Got %s log entries", len);
      if (len === 0)  {
         return ;
      }
      writeCsvLine(Object.keys(logEntries[0]));
      logEntries.forEach(writeCsvLine);
   }
);
