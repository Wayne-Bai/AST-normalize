var test = require('tape');
var child = require('child_process');

test('--client chrome', function(t) {
  var exe = child.spawn('node', ['./cmd.js', '--client', 'chrome', 'fixture.js']);
  exe.on('close', function() {
    t.end();
  });

  exe.stdout.on('data', function(data) {
    t.ok(data.toString(), 'ok\n');
    exe.kill();
  });
});
