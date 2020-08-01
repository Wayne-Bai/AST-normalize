var dal = require('dal');
var async = require('async');
var ijod = require('ijod');

var base = process.argv[2];
if (!base) return console.error("missing base arg");

var deleteme = process.argv[3] === 'MEOW';

function step() {
  dal.query("select hex(idr) as idr from Entries WHERE base > unhex(concat(rpad(?,32,'0'), '0000000000000000000000000000')) AND base < unhex(concat(rpad(?,32,'0'),'ffffffffffffffffffffffffffff'))", [base, base], function (err, rows) {
    if (err) return console.error(err);
    console.log("doing rows", rows.length);
    var dups = {};
    async.forEach(rows, function (row, cb) {
      ijod.getOne(row.idr, function (err, entry) {
        if (err) console.log(err);
        if (entry.id.indexOf(row.idr.toLowerCase()) !== 0) dups[row.idr] = true;
        cb();
      });
    }, function () {
      console.log(Object.keys(dups).length);
      if (!deleteme) return;
      if (Object.keys(dups).length === 0) return;
      console.log("deleting!");
      dal.query("delete from Entries where idr in (x'" +
        Object.keys(dups).join("',x'") + "') LIMIT ?",
        [Object.keys(dups).length],
        function (err) {
        if (err) return console.error(err);
      });
    });
  });
}

ijod.initDB(function () {
  step();
});
