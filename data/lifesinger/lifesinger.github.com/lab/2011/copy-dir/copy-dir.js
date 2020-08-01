/**
 * @fileoverview copy directory using nodejs.
 * @author lifesinger@gmail.com
 */

var fs = require('fs');
var path = require('path');
var util = require('util');


copy(process.argv[2], process.argv[3]);


function copy(from, to) {
  from = path.resolve(from);
  to = path.resolve(to);

  var files = getFiles(from);
  var source, target;

  next();

  function next() {
    if (files.length === 0) {
      process.exit();
    }

    source = files.shift();
    target = path.join(to, path.relative(from, source));

    if (path.existsSync(target)) {
      prompt(target, done);
    }
    else {
      done(true);
    }
  }

  function done(bool) {
    bool ? copyFile(source, target, next) : next();
  }
}


function getFiles(root) {
  return flatten(fs.readdirSync(root).map(function(item) {
    item = path.join(root, item);
    return fs.statSync(item).isDirectory() ? getFiles(item) : item;
  }));
}


function flatten(array) {
  return array.reduce(function(memo, value) {
    return memo.concat(Array.isArray(value) ? flatten(value) : value);
  }, []);
}


function prompt(file, callback) {
  process.stdout.write('File "' + file + '" exists, overwrite?');
  process.stdin.resume();
  process.stdin.once('data', function(data) {
    callback(/^(?:yes|y)$/i.test(data.toString().trim()));
  });
}


function copyFile(source, target, callback) {
  util.print('Copying "' + source + '" to "' + target + '" ... ');

  mkdir(path.dirname(target));
  util.pump(
      fs.createReadStream(source),
      fs.createWriteStream(target),
      function(err) {
        util.print((err ? 'ERROR!!!' : 'done.') + '\n');
        callback();
      }
  );
}


function mkdir(p) {
  var parts = [];

  while (!path.existsSync(p)) {
    parts.unshift(path.basename(p));
    p = path.dirname(p);
  }

  while (parts.length) {
    p = path.join(p, parts.shift());
    fs.mkdirSync(p, '0777');
  }
}
