// Generated by CoffeeScript 1.7.1
(function() {
  var Settings, app, argv, clc, cols, dbpath, devmode, express, fs, getDriveNames, getHomeDir, getLocalIPs, io, isAllowedIP, load_frontpage, log, mkdirp, moment, msg, name, optimist, path, port, server, setDevSettings, statics, version, _ref, _ref1, _ref2;

  fs = require('fs');

  path = require('path');

  clc = require('cli-color');

  express = require('express');

  mkdirp = require('mkdirp');

  moment = require('moment');

  io = require('socket.io');

  log = require('./log');

  _ref = require('./utils'), getLocalIPs = _ref.getLocalIPs, getDriveNames = _ref.getDriveNames, isAllowedIP = _ref.isAllowedIP, getHomeDir = _ref.getHomeDir;

  devmode = false;

  optimist = require('optimist').options('allowed', {
    "default": '',
    describe: 'List of IP masks that are allowed to access.'
  }).options('root', {
    alias: 'r',
    "default": '/',
    describe: 'Root directory for file sandboxing.'
  }).options('port', {
    alias: 'p',
    "default": '5100',
    describe: 'Port used by the server.'
  }).options('pfx', {
    describe: 'Where to store configuration and log files.',
    "default": getHomeDir()
  }).options('log', {
    alias: 'l',
    "default": 'info',
    describe: 'Log level (debug, info, notice, warning, error).'
  }).options('nologfile', {
    describe: 'Do not write debug log files.'
  }).options('reset', {
    describe: 'Clear configuration file and write new'
  }).options('help', {
    describe: 'Show this help message.'
  }).options('version', {
    alias: 'v',
    describe: 'Show application version.'
  });

  argv = optimist.argv;

  if (argv.help) {
    return console.log(optimist.help());
  }

  if (argv.version) {
    _ref1 = JSON.parse(fs.readFileSync(__dirname + '/../../package.json')), name = _ref1.name, version = _ref1.version;
    return console.log(name.charAt(0).toUpperCase() + name.slice(1) + ' ' + version);
  }

  global.rootDir = argv.root;

  if (!(global.rootDir.length && global.rootDir[global.rootDir.length - 1] === '/')) {
    global.rootDir += '/';
  }

  global.homeDir = path.resolve(argv.pfx + '/.styler');

  if (!fs.existsSync(global.homeDir)) {
    mkdirp.sync(global.homeDir);
  }

  if (argv.reset) {
    dbpath = path.join(global.homeDir, 'db.json');
    fs.unlinkSync(dbpath);
    log.info({
      path: dbpath
    }, 'Deleted DB file');
  }

  global.allowed = ((_ref2 = argv.allowed) != null ? typeof _ref2.split === "function" ? _ref2.split(',') : void 0 : void 0) || [];

  getLocalIPs(function(ips) {
    return global.allowed = global.allowed.concat(ips);
  });

  app = express();

  app.configure(function() {
    app.set('view options', {
      layout: false
    });
    app.set('views', __dirname + '/../../src/templates');
    return app.set('view engine', 'jade');
  });

  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  app.use(express.favicon(__dirname + '/../public/img/favicon.ico'));

  app.use(function(req, res, next) {
    if (isAllowedIP(global.allowed, req.connection.remoteAddress)) {
      return next();
    } else {
      log.warn({
        req: req
      }, 'Access denied');
      return res.render('notallowed');
    }
  });

  app.use(function(req, res, next) {
    if (/^\/(css\/istokweb|img)\//.test(req.url)) {
      res.header('Cache-Control', 'maxAge=86400');
    }
    return next();
  });

  app.get('/vendor/jade.js', function(req, res) {
    res.header('Cache-Control', 'max-age=86400');
    return res.sendfile(path.resolve(require.resolve('jade'), '../runtime.min.js'));
  });

  app.get('/data/:clientId', function(req, res) {
    var Clients, Projects, Settings, c, client, data, project, projectId, _ref3;
    _ref3 = require("./data"), Projects = _ref3.Projects, Clients = _ref3.Clients, Settings = _ref3.Settings;
    res.header('Content-Type', 'text/javascript');
    res.write('var __data = ');
    data = {
      projects: Projects.toJSON(),
      clients: Clients.toJSON(),
      settings: Settings.toJSON()
    };
    projectId = 0;
    if (client = Clients.find(function(c) {
      return c.get('session_id') === parseInt(req.params.clientId);
    })) {
      projectId = client.get('project');
    } else if (project = Projects.get(req.query.clientId)) {
      projectId = project.id;
    }
    if (c = (require("./console")).consoles[projectId]) {
      data.states = c.states.toJSON();
    }
    return res.end(JSON.stringify(data));
  });

  app.get('/styler.js', function(req, resp) {
    return fs.readFile(__dirname + '/../styler.js', function(err, data) {
      var host;
      if (err) {
        throw err;
      }
      resp.writeHead(200, {
        'Content-Type': 'text/javascript'
      });
      resp.write(data);
      host = req.headers.host;
      resp.write("if(!window._styler_loaded){styler.init('" + host + "');window._styler_loaded=1;}");
      return resp.end();
    });
  });

  statics = {};

  app.use(function(req, res, next) {
    var staticObject;
    staticObject = devmode ? statics.dev != null ? statics.dev : statics.dev = {
      "public": express["static"](__dirname + "/../public"),
      ace: express["static"](__dirname + "/../../support/ace/lib")
    } : statics.build != null ? statics.build : statics.build = {
      "public": express["static"](__dirname + "/../public", {
        maxAge: 86400000
      }),
      ace: express["static"](__dirname + "/../../support/ace/lib", {
        maxAge: 86400000
      })
    };
    return staticObject["public"](req, res, function() {
      return staticObject.ace(req, res, next);
    });
  });

  load_frontpage = function(req, res, next) {
    req.query.clientId = parseInt(path.basename(req.url));
    req.url = '/';
    return next();
  };

  app.all('/project/:project', load_frontpage);

  app.all('/edit/:project', load_frontpage);

  app.all('/[0-9]+', load_frontpage);

  app.get('/', function(req, res) {
    return res.render('index', {
      devmode: devmode,
      clientId: req.query.clientId || 0
    });
  });

  port = parseInt(argv.port);

  Settings = require("./data").Settings;

  setDevSettings = function(settings) {
    devmode = settings.get('devmode');
    if (devmode) {
      app.disable('view cache');
    } else {
      app.enable('view cache');
    }
    return log.debug({
      enabled: devmode
    }, "Set devmode");
  };

  msg = "Please open http://localhost:" + port + "/ to get started";

  cols = 55;

  console.log('┌' + Array(cols).join('─') + '┐\n│ ' + (msg.replace(/http:.*\//, function(link) {
    return clc.bold(clc.underline(link));
  })) + Array(cols - msg.length - 1).join(' ') + '│\n└' + Array(cols).join('─') + '┘');

  log.info({
    port: port,
    home: global.homeDir,
    root: global.rootDir,
    allowed: global.allowed
  }, 'Daemon info');

  server = require('http').createServer(app).listen(port);

  global.io = io = io.listen(server);

  io.set('log level', 1);

  require('./clients');

  require('./consoles');

  setTimeout(function() {
    var settings;
    settings = Settings.at(0);
    settings.bind('change:devmode', setDevSettings);
    setDevSettings(settings);
    if (process.features.nativeapp) {
      app.on('listening', function() {
        return process.emit('serverload', port);
      });
      return server.on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
          port++;
          return server.listen(port);
        }
      });
    }
  }, 200);

}).call(this);