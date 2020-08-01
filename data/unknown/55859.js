! ✖ / env;
node;
"use strict";
var cp = require("child_process"), cradle = require("cradle"), request = require("request"), async = require("async"), config = require("../config"), app = require("../lib/app"), exec = cp.exec;
require("colors");
var cfg = config.opt, port = cfg.couch_port, host = cfg.couch_host, user = cfg.couch_user, pass = cfg.couch_pass, range = cfg.bach_range || 10;
cradle.setup( {
      host:host, 
      cache:true, 
      raw:false, 
      auth: {
         username:user, 
         password:pass      }, 
      port:port   }
);
if (cfg.couch_prefix.length > 0)  {
   var cprefix = cfg.couch_prefix + "_";
}
 else  {
   var cprefix = "";
}
var bach = [];
var sliceArray = function(array)  {
   if (array.length)  {
      bach.push(array.splice(0, range));
      sliceArray(array);
   }
    else  {
      done();
   }
}
;
function iterator(app, cb)  {
   console.log("Restarting ".bold.grey, app.id);
   request( {
         uri:"http://" + cfg.api_dom + "/app/restart/" + app.id, 
         method:"PUT"      }, 
      function(err, data)  {
         if (err)  {
            return cb(err);
         }
         if (data.body.running == "true" || data.body.running === true)  {
            console.log(app.id, " Running ✔ ".bold.green);
            cb(null, "ok");
         }
          else  {
            console.log(app.id, data.body.running, " ✖".bold.red);
            cb(data.body.running);
         }
      }
   );
}
;
function restartApp(apps)  {
   return function(cb)  {
      async.forEachLimit(apps, 10, iterator, function(err)  {
            if (err) return cb(err)            cb(null, "ok");
         }
      );
   }
;
}
;
function done()  {
   if (bach.length)  {
      var tasks = [];
      bach.forEach(function(appl)  {
            tasks.push(restartApp.call(this, appl));
         }
      );
      async.series(tasks, function(err, results)  {
            console.log(arguments);
         }
      );
   }
}
;
var apps = [], count = 0, g = 0, f = 0, good = "SUCCESS ✔", bad = "FAILURE ✖";
process.on("uncaughtException", function(err)  {
      console.log("UNCAUGHT ERROR! ".red + err);
   }
);
var c = new cradle.Connection(), db = c.database(cprefix + "apps");
db.view("nodeapps/all", function(err, doc)  {
      if (err)  {
         console.error(err);
         process.kill(1);
      }
       else  {
         sliceArray(doc);
      }
   }
);
