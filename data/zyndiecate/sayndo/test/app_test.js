/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')

  , app = require('../server.js')
  , config = require('../../../config/config.js');

/*
 * Server test module.
 */
vows.describe('app')
    .addBatch({
        /*
         *
         */
        'routes': {
            topic: app,
            'contain view route functions': function(app) {
                assert.isFunction(app[config.defaultAuthType].GET.errors);
            },
        },

        /*
         *
         */
        'host': {
            topic: app,
            'is string': function(app) {
                assert.isString(app.host);
            },
        },

        /*
         *
         */
        'port': {
            topic: app,
            'is string': function(app) {
                assert.isString(app.port);
            },
        },

        /*
         *
         */
        'log': {
            topic: app,
            'is object': function(app) {
                assert.isObject(app.log);
            },
            'contain colorized log functions': function(app) {
                assert.isFunction(app.log.error);
                assert.isFunction(app.log.success);
                assert.isFunction(app.log.debug);
                assert.isFunction(app.log.info);
                assert.isUndefined(app.log.create);
            }
        },

        /*
         *
         */
        'node': {
            topic: app,
            'is object': function(app) {
                assert.isObject(app.node);
            },
            'contain the server node instance': function(app) {
                assert.equal('tcp4', app.node.type);
                assert.isFunction(app.node.close);
                assert.isFunction(app.node.listen);
                assert.isNumber(app.node.connections);

                app.node.close();

                assert.isNull(app.node.fd);
            }
        }
    })
    .export(module);

