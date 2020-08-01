var _ = require('lodash'),
  forever = require('forever'),
  path = require('path');

describe.skip('forever', function () {
    process.env.HOME = '/home/tjwebb/';
    process.chdir(process.env.HOME);

  before(function () {
    /*
    forever.load({
      root: path.resolve('/home/tjwebb/.xtuple/'),
      pidPath: path.resolve('/home/tjwebb/.xtuple/var/run')
    });
    */
  });

  it('should start main.js', function () {
    var child = forever.startDaemon('node-datasource/main.js', {
      uid: 'web-server-test-mocha',

      // invocation attributes
      command: 'sudo -u tjwebb node',
      script: 'node-datasource/main.js',
      options: [
        '-c', path.resolve('/home/tjwebb/workspace/xtuple/xtuple/node-datasource/config.js')
      ],
      sourceDir: path.resolve('/home/tjwebb/workspace/xtuple/xtuple'),
      pidFile: path.resolve('/home/tjwebb/.xtuple/web-server-1.pid'),
      cwd: path.resolve('/home/tjwebb/workspace/xtuple/xtuple'),

      // process env
      env: {
        //SUDO_USER: 'tjwebb',
        //USER: 'tjwebb',
        NODE_ENV: 'production',
        //HOME: path.resolve('/home/tjwebb')
      },

      // process mgmt options
      minUptime: 10000,
      spinSleepTime: 10000,
      killTree: true,
      max: 3,
      watch: true,
      watchIgnoreDotFiles: true,
      watchDirectory: path.resolve('/home/tjwebb/workspace/xtuple/xtuple/node-datasource/'),
      watchIgnorePatterns: [
        'pid'
      ],

      // log files
      logFile: path.resolve('/home/tjwebb/.xtuple/log', 'web-server-forever.log'),
      errFile: path.resolve('/home/tjwebb/.xtuple/log', 'web-server-error.log'),
      outFile: path.resolve('/home/tjwebb/.xtuple/log', 'web-server-access.log')
    });


    child.on('exit', function (e) {
      console.log(e);
    });

    child.on('watch:restart', function(info) {
      console.error('Restaring script because ' + info.file + ' changed');
    });

    child.on('restart', function() {
      console.error('Forever restarting script for ' + child.times + ' time');
    });

    child.on('exit:code', function(code) {
      console.error('Forever detected script exited with code ' + code);
    });

  });

  it('should show process list', function (done) {
    forever.list(false, function (err, data) {
      console.dir(data);

      done();
    });
  });

});
