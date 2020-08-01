var child = require('child_process');
var chokidar = require('chokidar');
var fs = require('fs');
var http = require('http');
var mime = require('mime');
var path = require('path');
var rdbg = require('rdbg');
var util = require('util');
var temp = require('temp');
var which = require('which');

function serve(options, callback) {
  var server = http.createServer(function(request, response) {
    var url = (request.url === '/') ? '/index.html' : request.url;
    var filename = options.scripts[path.basename(url)];

    if (filename === undefined) {
      filename = path.join(options.cwd, url);
    }

    fs.exists(filename, function(exists) {
      if (exists) {
        response.setHeader('content-type', mime.lookup(filename));
        response.writeHead(200);

        var file = fs.createReadStream(filename);
        file.pipe(response);
      } else if (url === '/index.html') {
        response.setHeader('content-type', 'text/html');
        response.write('<!doctype html><head><meta charset="utf-8"></head><body>');

        for (var key in options.scripts) {
          response.write('<script src="' + key + '"></script>');
        }

        response.end('</body>');
      } else {
        response.writeHead(404);
        response.end('404');
      }
    });
  });

  server.listen(options.port, options.host, callback);
  return server;
}

function compile(options, callback) {
  var dirpath = temp.mkdirSync('amok-output');
  options.output = path.join(dirpath, options.args[0].replace(/\.[^\.]+$/, '.js'));

  var args = options.compiler.match(/'[^"]*'|"[^"]*"|\S+/g);
  var command = args.shift();

  switch (options.compiler) {
    case 'browserify':
      command = which.sync('watchify');
      args = [
        '-o',
        options.output,
      ];
      break;

    case 'webpack':
      command = which.sync('webpack');
      args = [
        '--watch',
        '--output-file',
        options.output,
      ];
      break;

    case 'typescript':
      command = which.sync('tsc');
      args = [
        '--watch',
        '--out',
        options.output,
      ];
      break;

    case 'coffeescript':
      command = which.sync('coffee');
      args = [
        '--watch',
        '--compile',
        '--output',
        dirpath,
      ];
      break;

    case 'babel':
      command = which.sync('babel');
      args = [
        '--watch',
        '--out-file',
        options.output,
      ];
      break;
  }

  args = args.concat(options.args);

  var compiler = child.spawn(command, args);
  compiler.output = options.output;

  process.nextTick(function tick() {
    fs.exists(compiler.output, function(exists) {
      if (exists) {
        callback(null, compiler.stdout, compiler.stderr);
      } else {
        setTimeout(tick, 100);
      }
    });
  });

  return compiler;
}

function watch(options, callback) {
  var watcher = chokidar.watch(options.watch, {
    persistent: true
  });

  if (options.scripts) {
    var directories = Object.keys(options.scripts).filter(function(path, index, paths) {
      return paths.indexOf(path) == index;
    }).map(function(key) {
      return path.dirname(options.scripts[key]);
    });

    directories.forEach(function(path) {
      watcher.add(path);
    });
  }

  if (callback) {
    watcher.once('ready', callback);
  }

  return watcher;
}

function debug(options, callback) {
  var bugger = rdbg.connect(options.debuggerPort, options.debuggerHost, function(target) {
    callback(null, target);
  });

  bugger.on('detatch', function() {
    var interval = setInterval(function() {
      bugger.targets(function(targets) {
        var target = targets.filter(function(target) {
          return target.url.search(options.url) > -1 && target.webSocketDebuggerUrl;
        })[0];

        if (target) {
          bugger.attach(target);
          clearInterval(interval);
        }
      });
    }, 250);
  });

  bugger.targets(function(targets) {
    var target = targets.filter(function(target) {
      return target.url.search(options.url) > -1 && target.webSocketDebuggerUrl;
    })[0];

    bugger.attach(target);
  });

  return bugger;
}

function open(options, callback) {
  var args = options.client.match(/'[^"]*'|"[^"]*"|\S+/g);
  var command = args.shift();

  switch (options.client) {
    case 'chrome':
      command = (function() {
        if (process.platform === 'win32') {
          var suffix = '\\Google\\Chrome\\Application\\chrome.exe';
          var prefixes = [
            process.env['LOCALAPPDATA'],
            process.env['PROGRAMFILES'],
            process.env['PROGRAMFILES(X86)'],
          ];

          var executables = prefixes.map(function(prefix) {
            return prefix + suffix;
          }).filter(function(path) {
            return fs.existsSync(path);
          });
          return executables[0];
        } else if (process.platform === 'darwin') {
          return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        } else {
          return which.sync('google-chrome');
        }
      }());

      args = [
        '--remote-debugging-port=' + options.debuggerPort,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-translate',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-zero-browsers-open-for-tests',
        '--user-data-dir=' + temp.mkdirSync('amok-chrome'),
      ];
      break;
  }

  args.push(options.url);

  var client = child.spawn(command, args);
  setTimeout(function() {
    callback(null, client.stdout, client.stderr);
  }, 1000);

  return client;
}

module.exports.serve = serve;
module.exports.watch = watch;
module.exports.compile = compile;
module.exports.debug = debug;
module.exports.open = open;
