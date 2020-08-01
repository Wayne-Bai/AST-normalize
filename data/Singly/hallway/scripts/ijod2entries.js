var lconfig = require('lconfig');
var dal = require('dal');
var async = require('async');

var start = process.argv[2] || Date.now()+100000;

var steps = 0;
var tot = 0;
step({at:start});
function step(arg)
{
  steps++;
  dal.query("select min(at) as m from (select at from ijod where at < ? order by at desc limit 10000) as sq1", [arg.at], function(err, rows){
    if(err) return console.error(err, arg);
    if(!rows || !rows[0] || rows[0].m === null) return console.error("done");
    var max = arg.at;
    var min = rows[0].m;
    console.log("STEP",steps,min,max,tot);
    dal.query("insert ignore into Entries (base, idr, path, hash, offset, len, lat, lng, q0, q1, q2, q3) select unhex(substr(concat(rpad(binary base,32,'0'), lpad(hex(floor(at/1000)),8,'0'), lpad(hex(conv(substr(idr,1,8),16,10)+(at - (floor(at/1000)*1000))),8,'0')),1,48)), unhex(idr), path, hash, offset, len, lat, lng, q0, q1, q2, q3 from ijod where at >= ? and at <= ?", [min, max], function(err, rows, res){
      if(err) return console.error(err, arg);
      if(res & res.affectedRows) tot += res.affectedRows;
      arg.at = min;
      step(arg);
    });
  });
}
