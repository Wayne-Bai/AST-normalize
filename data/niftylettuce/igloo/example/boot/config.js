// boot/config.js

exports = module.exports = function() {
  return {
    defaults: {
      logger: {
        console: true,
        requests: true,
        mongo: false,
        file: false,
        hipchat: false
      },
      output: {
        handleExceptions: true,
        colorize: true,
        prettyPrint: false
      }
    },
    development: {
      port: 3000,
    },
    production: {
      port: 3080,
      requests: false,
      output: {
        colorize: false,
        prettyPrint: false
      }
    }
  }
}

exports['@singleton'] = true
