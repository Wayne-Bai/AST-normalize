var crypto = require('crypto');

var sprintf = require('sprintf').sprintf;
var misc = require('rackspace-shared-utils/lib/misc');

var base = require('../../lib/orm/base');
var utils = require('../../lib/orm/utils');

/**
 * Object representing a AgentToken.
 * @constructor
 * @param {Object} attributes Attributes to set in the resulting object.
 */
var AgentToken = function(attributes) {
  AgentToken.super_.call(this, AgentToken, attributes);
};


/**
 * Add properties that help map to cassandra
 * complex types
 */
AgentToken.meta = {
  name: 'AgentToken',
  cname: 'agent_tokens',
  columnFamily: 'agent_tokens',
  prefix: '',
  parents: [],
  prefixedColNames: false,
  lookupByName: true,
  indexes: {
    'agent_token_idx': utils.addIndex({ key: ['token'],
      name: ['$ROWKEY', '$OBJKEY'], object: 'AgentToken',
      columnFamily: 'agent_token_idx',
      relationship: 'OneToOne'})
  },
  getColKeyName: function(meta, obj) {
    var cols = obj.cols;
    return cols.token;
  }
};


/**
 * Fields on the AgentToken
 */
AgentToken.fields = {
  'token': null,
  'label': null,
  'account_id': null
};


AgentToken.operationalVersion = 0;
base.inheritBase(AgentToken, __filename);


/**
 * Generate a token.
 * @param {Object} ctx The context.
 * @return {String} The token.
 */
AgentToken.prototype._generateToken = function(ctx) {
  var salt = misc.randstr(32),
      hash = crypto.createHash('sha256');

  if (!ctx.account.external_id) {
    throw new Error('Account does not have external ID');
  }

  hash.update(salt);

  return sprintf('%s.%s', hash.digest('hex'), ctx.account.external_id);
};


/**
 * Generate and assign the token.
 * @param {Object} ctx The context.
 * @return {String} the token.
 */
AgentToken.prototype.generateAndAssignToken = function(ctx) {
  this.token = this._generateToken(ctx);
  this.key = this.token;
  return this.token;
};

exports.AgentToken = AgentToken;
