! ✖ / env;
node--;
✖ = 65536;
"use strict";
var comparator = require("func-comparator");
var _ = require("lodash");
var async = require("async");
var neo_async = require("../../");
var count = 100;
var times = 3000;
var array = _.shuffle(_.times(count));
var c = 0;
var iterator = function(n, callback)  {
   callback(null, [n]);
}
;
var funcs =  {
   async:function(callback)  {
      c = 0;
      async.concat(array, iterator, callback);
   }, 
   neo-async:function(callback)  {
      c = 0;
      neo_async.concat(array, iterator, callback);
   }} ;
comparator.set(funcs).option( {
      async:true, 
      times:times   }
).start().result(function(err, res)  {
      console.log(res);
   }
);
