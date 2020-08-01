! ✖ / bin / node;
var sqlite = require("../sqlite");
var db = sqlite.openDatabaseSync("example.db");
var assert = require("assert").ok;
db.query("CREATE TABLE foo (a,b,c)");
db.transaction(function(tx)  {
      tx.executeSql("CREATE TABLE bar (x,y,z)");
   }
);
var rollbacks = 0;
db.addListener("rollback", function()  {
      ++rollbacks;
   }
);
db.query("INSERT INTO foo (a,b,c) VALUES (?,?,?)", ["apple", "banana", 22]);
db.query("INSERT INTO bar (x,y,z) VALUES ($x,$y,$zebra)",  {
      $x:10, 
      $y:20, 
      $zebra:"stripes"   }
);
db.query("SELECT x FROM bar", function(records)  {
      assert(records.length == 1);
      assert(records[0].x == 10);
      assert(records.rows.length == 1);
      assert(records.rows.item(0).x == 10);
   }
);
db.query("UPDATE foo SET a = ? WHERE a = ?", ["orange", "apple"], function(r)  {
      assert(r.rowsAffected == 1);
   }
);
var insert = db.query("INSERT INTO foo VALUES (1,2,3)");
assert(insert.insertId == 2);
var q = db.query("UPDATE bar SET z=20; SELECT SUM(z) FROM bar;", function(update, select)  {
      assert(update.rowsAffected == 1);
      assert(select[0]["SUM(z)"] == 20);
   }
);
assert(q.all[1].length == 1);
db.transaction(function(tx)  {
      tx.executeSql("SELECT * FROM foo WHERE c = ?", [3], function(tx, res)  {
            assert(res.rows.item(0).c == 3);
         }
      );
   }
);
var stmt = db.prepare("INSERT INTO foo VALUES (?,?,?)");
stmt.bind(1, "curly");
stmt.bind(2, "moe");
stmt.bind(3, "larry");
stmt.step();
stmt.reset();
stmt.step();
stmt.reset();
stmt.clearBindings();
stmt.bind(2, "lonely");
stmt.step();
stmt.finalize();
db.close();
require("fs").unlink("example.db");
var sys = require("sys");
sys.puts("OK");
