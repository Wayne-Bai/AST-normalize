! ✖ / env;
node;
var log = console.log, print = function(ms, n)  {
   var avg = 1000 * n / ms;
   log("- total elements evicted: %d.", n);
   log("- elapsed: %d secs.", ms / 1000.toFixed(4));
   log("- average: %d Mel/sec.", avg / 1000 / 1000.toFixed(2));
}
, Train = require("../"), t = new Train(), p = 24, k = Math.pow(2, p), i = 0, result = [], stime = 0, etime = 0;
log("- fill Train with 2^%d items", p);
i = k >>> 1;
for (; i--; )  {
      t.push(1);
   }
;
t.pop(2);
i = k >>> 1;
for (; i--; )  {
      t.push(1);
   }
;
t.pos = k >>> 2;
log("- evicting %d items with a single #pop() from index %d", k >>> 1, k >>> 2);
stime = Date.now();
result = t.pop(k >>> 1);
etime = Date.now() - stime;
print(etime, k >>> 1);
