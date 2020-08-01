/**
 * Features tested:
 * - basic operation
 * - spec.with(...).each(...)
 * - spec.rule with constant output
 */

var test = require("tape"), 
    exec = require("child_process").exec,
    fs = require("fs");

test('basic project', function(t) {
  t.plan(4);

  setup();

  function setup() {
    var child = exec("cd tests/basic/; node fez.js");
    child.on("exit", function(code) {
      t.equal(code, 0);
      stat();
    });
  }

  function stat() {
    t.ok(fs.existsSync('tests/basic/a'));
    t.ok(fs.existsSync('tests/basic/b'));
    t.ok(fs.existsSync('tests/basic/c'));

    teardown();
  }

  function teardown() {
    exec("cd tests/basic/; node fez.js -c", function(err) {
      if(err) t.fail(err.message);
      else t.end();
    });
  }
});
