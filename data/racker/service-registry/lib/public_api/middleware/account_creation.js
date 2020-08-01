var async = require('async');
var log = require('logmagic').local('api.middleware.account_creation');

var Account = require('../../db/models/account').Account;
var accountOps = require('../../db/ops/account');
var context = require('../../db/context');
var errors = require('../../util/errors');
var responses = require('../../api/responses');

exports.attach = function createAccountMiddleware() {
  return function createAccount(req, res, next) {
    var externalId = req.headers['x-tenant-id'], key = Account.prefix() + externalId, ctx;

    ctx = req.ctx = res.ctx = context.createFromRequest(req);

    if (req.tracing) {
      ctx.tracing = req.tracing;
    }

    async.waterfall([
      function getAccount(callback) {
        log.debug('Retrieving account...', {'ctx': ctx, 'externalId': externalId});

        accountOps.getOne(ctx, key, function(err, ac) {
          if (err && !(err instanceof errors.ObjectDoesNotExistError)) {
            callback(err);
            return;
          }

          callback(null, ac);
        });
      },

      function maybeCreateAccount(ac, callback) {
        if (ac) {
          log.debug('Account already exists, skipping creation', {'ctx': ctx, 'externalId': externalId});
          callback(null, ac);
          return;
        }

        log.debug('Account doesn\'t exist, creating it', {'ctx': ctx, 'externalId': externalId});
        accountOps.create(ctx, {'_key': key}, function(err, ac) {
          log.debug('Account sucesfully created', {'ctx': ctx, 'externalId': externalId});
          callback(err, ac);
        });
      }
    ],

    function(err, ac) {
      var resp;

      if (err) {
        log.error('Unknown authentication error occurred', {'ctx': ctx, 'request': req, 'err': err});

        resp = new responses.ErrorResponse(err);
        resp.perform(req, res);
        return;
      }

      req.account = ac;
      req.ctx.setAccount(ac);
      next();
    });
  };
};
