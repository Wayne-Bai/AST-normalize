! ✖ / env;
node;
"use strict";
var config = require("../config");
var siteUrl = config.site.url();
var google = require("google");
google.resultsPerPage = 100;
var query = "site:" + siteUrl;
console.log("Querying google for [" + query + "]...");
google(query, function(err, next, links)  {
      if (err)  {
         console.log("*** got an error!: " + err);
         process.exit(1);
      }
       else  {
         var n = links.length;
         console.log("   ...got " + n + " search results.");
         if (n > 0)  {
            var client = config.redis.client();
            client.multi().set(["times_indexed", n]).del("content").del("comments").setnx(["destroyed_at", new Date().toString()]).exec(function(err, replies)  {
                  if (err)  {
                     console.log("*** Error updating redis!");
                     process.exit(1);
                  }
                  console.log("-> Set times_indexed to " + n + ":		" + replies[0]);
                  console.log("-> Did we just destroy content?:	" + replies[1]);
                  console.log("-> Did we just destroy comments?:	" + replies[2]);
                  console.log("-> Did we initialize destroyed_at?:	" + replies[3]);
                  client.quit();
               }
            );
         }
      }
   }
);
