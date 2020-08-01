! ✖ / env;
node--;
✖ = 65536;
"use strict";
var comparator = require("func-comparator");
var _ = require("lodash");
var neo_async_v0 = require("neo-async");
var neo_async_v1 = require("../../");
var count = 100;
var times = 3000;
var array = _.shuffle(_.times(count));
var iterator = function(n, callback)  {
   callback(false);
}
;
var funcs =  {
   neo-async_v0:function(callback)  {
      neo_async_v0.pick(array, iterator, function(res)  {
            callback(null, res);
         }
      );
   }, 
   neo-async_v1:function(callback)  {
      neo_async_v1.pick(array, iterator, function(res)  {
            callback(null, res);
         }
      );
   }} ;
comparator.set(funcs).async().times(times).start().result(function(err, res)  {
      console.log(res);
   }
);
