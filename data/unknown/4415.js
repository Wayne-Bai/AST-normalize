! ✖ / env;
node;
"use strict";
var repl = require("repl");
var utils = require("../lib/utils");
var prompt = "> ";
var _toPromise = utils.toPromise;
function truncate(string, length)  {
   if (! string)  {
      return string;
   }
   if (! length)  {
      length = 400;
   }
   if (string.length > length)  {
      return string.substring(0, length) + "...";
   }
    else  {
      return string;
   }
}
;
utils.toPromise = function(func, passPromise)  {
   var fn = _toPromise(func, passPromise);
   var patchedFn = function()  {
      var args = Array.prototype.slice.call(arguments);
      var promise = fn.apply(this, args);
      function logResult(result, method)  {
         method = method || "log";
         patchedFn._dbInfo.then(function(info)  {
               console[method]("
==>", patchedFn._dbType, info.db_name, patchedFn._methodName, "
args: " + truncate(JSON.stringify(args)), "
result:", truncate(JSON.stringify(result, null, 2)), "
===");
               process.stdout.write(prompt);
            }
         );
      }
;
      if (patchedFn._doPromiseLog && PatchedPouch.doPromiseLog)  {
         return promise.then(function(result)  {
               logResult(result);
            }, 
            function(err)  {
               logResult(err, "error");
            }
         );
      }
       else  {
         return promise;
      }
   }
;
   patchedFn._isPromisingFunction = true;
   patchedFn._doPromiseLog = false;
   return patchedFn;
}
;
var PouchDB = require("../");
function PatchedPouch(name, opts, callback)  {
   var db = new PouchDB(name, opts, callback);
   var excluded = ["info"];
   var dbInfo = db.info();
   var dbType = db.type();
   var doPromiseLog = false;
   for (var key in db)  {
         if (key !== "info" && typeof db[key] === "function" && db[key]._isPromisingFunction)  {
            doPromiseLog = excluded.indexOf(key) < 0;
            utils.extend(db[key],  {
                  _doPromiseLog:doPromiseLog, 
                  _methodName:key, 
                  _dbInfo:dbInfo, 
                  _dbType:dbType               }
            );
         }
      }
   return db;
}
;
PatchedPouch.doPromiseLog = true;
utils.extend(repl.start( {
         prompt:prompt      }
   ).context,  {
      PouchDB:PatchedPouch, 
      P:PatchedPouch   }
);
