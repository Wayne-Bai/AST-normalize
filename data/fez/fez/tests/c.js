/**
 * Features tested:
 * - fez.exec
 * - file.patsubst
 */

var test = require("tape"), 
    exec = require("child_process").exec,
    fs = require("fs");

test('c project', function(t) {
  t.plan(4);

  setup();

  function setup() {
    var child = exec("cd tests/c/; node fez.js");
    child.on("exit", function(code) {
      t.equal(code, 0);
      stat();
    });
  }

  function stat() {
    t.ok(fs.existsSync('tests/c/hello.o'));
    t.ok(fs.existsSync('tests/c/square.o'));
    t.ok(fs.existsSync('tests/c/hello'));

    teardown();
  }

  function teardown() {
    exec("cd tests/c/; node fez.js -c", function(err) {
      if(err) t.fail(err.message);
      else t.end();
    });
  }
});
