
// # config

var path = require('path');

var parentDir = path.join(__dirname, '..');
var appDir = path.join(parentDir, 'app');

var pkg = require(path.join(parentDir, 'package'));

var assetsDir = path.join(parentDir,'assets');
var publicDir = path.join(assetsDir, 'public');
var templatesDir = path.join(assetsDir, 'emails');
var viewsDir = path.join(appDir, 'views');

var maxAge = 24 * 60 * 60 * 1000;

exports = module.exports = function() {

  return {

    defaults: {
      application: {
        company: '<company>',
        product: '<product>',
        title: '<title>',
        description: '<description>',
        email: 'product <support@mycompany.com>'
      },
      googleanalytics: {
        enabled: false,
        // If you have already gotten permission from a user, you can simply use the oAuth access token you have
        token: '<token>',
        // Otherwise, set username and password
        username: '<username>',
        password: '<password>',
        profile_id: 'ga:<profile_id>',
        tracking_id: 'UA-XXXXXXXX-Y'
      },
      // eanble/configure to use mailchimp lists
      mailchimp: {
        enabled: false,
        apiKey: '<mailchimp:account:extras:API keys>',
        listId: '<create list:settings:unique id for list>',
      },
      basicAuth: {
        enabled: true,
        name: 'username',
        pass: 'password'
      },
      facebook: {
        enabled: false,
        appID: '',
        appSecret: '',
        scope: [ 'email' ]
      },
      google: {
        enabled: false,
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        clientID: '',
        clientSecret: ''
      },
      pkg: pkg,
      cache: false,
      showStack: true,
      assetsDir: assetsDir,
      publicDir: publicDir,
      views: {
        dir: viewsDir,
        engine: 'jade'
      },
      password: {
        minStrength: 0,
        limitAttempts: false
      },
      email: {
        templates: {
          dir: templatesDir,
          options: {
          }
        },
        // <https://github.com/andris9/Nodemailer>
        transport: {
          service: 'gmail',
          auth: {
            user: 'support@gmail.com',
            pass: 'password'
          }
        },
        headers: {
          from: 'company <support@mycompany.com>'
        }
      },
      hipchat: {
        level: 'error',
        silent: false,
        token: '',
        notify: false,
        color: 'yellow',
        room: '',
        from: '',
        messageFormat: 'text'
      },
      session: {
        secret: 'snowflake-change-me',
        key: 'snowflake',
        cookie: {
          maxAge: maxAge
        },
        resave: true,
        saveUninitialized: true
      },
      trustProxy: true,
      updateNotifier: {
        enabled: true,
        dependencies: {},
        updateCheckInterval: 1000 * 60 * 60,
        updateCheckTimeout: 1000 * 20
      },
      staticServer: {
        maxAge: maxAge
      },
      server: {
        host: 'localhost',
        cluster: false,
        ssl: {
          enabled: false,
          options: {}
        }
      },
      cookieParser: 'snowflake-change-me',
      csrf: {
        enabled: true,
        options: {
          cookie: {
            maxAge: maxAge
          }
        }
      },
      mongo: {
        host: 'localhost',
        port: 27017,
        opts: {},
        // faster - don't perform 2nd request to verify
        // log message was received/saved
        safe: false
      },
      knex: {
        client: 'mysql'
      },
      redis: {
        host: 'localhost',
        port: 6379,
        maxAge: maxAge
      },
      output: {
        handleExceptions: false,
        colorize: true,
        prettyPrint: false
      },
      logger: {
        'console': true,
        requests: true,
        mongo: false,
        file: false,
        hipchat: false,
        slack: false
      },
      less: {
        path: publicDir,
        options: {
          force: true
        }
      },
      jade: {
        amd: {
          path: '/js/tmpl/',
          options: {}
        }
      },
      liveReload: {
        port: 35729
      }
    },

    test: {
      url: 'http://localhost:5000',
      server: {
        env: 'test',
        port: 5000
      },
      redis: {
        prefix: 'snowflake_test'
      },
      logger: {
        'console': false,
        requests: false
      }
    },

    development: {
      cache: true,
      url: 'http://localhost:3000',
      server: {
        env: 'development',
        port: 3000,
      },
      mongo: {
        dbname: 'snowflake_development',
        db: 'snowflake_development' // keep for winston logger
      },
      knex: {
        debug: true,
        connection: {
          host: '127.0.0.1',
          user: 'root',
          password: '',
          database: 'snowflake_development'
        }
      },
      redis: {
        prefix: 'snowflake_development'
      }
    },

    production: {
      cache: true,
      url: 'http://localhost:3080',
      password: {
        minStrength: 1,
        limitAttempts: true
      },
      views: {
        dir: path.join(assetsDir, 'dist'),
      },
      publicDir: path.join(assetsDir, 'dist'),
      showStack: false,
      updateNotifier: {
        enabled: false,
      },
      server: {
        env: 'production',
        port: 3080,
        cluster: true
      },
      mongo: {
        dbname: 'snowflake_production',
        db: 'snowflake_production' // keep for winston logger
      },
      knex: {
        connection: {
          host: '127.0.0.1',
          user: 'root',
          password: '',
          database: 'snowflake_production'
        }
      },
      redis: {
        prefix: 'snowflake_production'
      },
      output: {
        colorize: false
      },
      logger: {
        'console': true,
        requests: true,
        mongo: false,
        file: false
        /*
        // <https://github.com/flatiron/winston#file-transport>
        file: {
          filename: '/var/log/igloo.log',
          // TODO: maxsize
          // TODO: maxFiles
          timestamp: true
        }
        */
      }
    }

  };

};

exports['@singleton'] = true;
