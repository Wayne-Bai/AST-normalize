var _ = require('underscore');
var Backbone = require('backbone');
var Github = require('github');
var BackboneApiClient = require('../');
var GithubModel = BackboneApiClient.mixinModel(Backbone.Model).extend({
  // DEV: Since each API client is different, this is where we map
  // backbone information into API client information
  callApiClient: function (methodKey, options, cb) {
    // Prepare headers with data
    var params = _.clone(options.data) || {};
    if (options.headers) {
      params.headers = options.headers;
    }

    // Find the corresponding resource method and call it
    var method = this.methodMap[methodKey];
    var that = this;
    return this.apiClient[this.resourceName][method](params, cb);
  }
});

// Create a repo class
var RepoModel = GithubModel.extend({
  resourceName: 'repos',
  // There are 5 different methods `create`, `update`, `patch`, `read`, `delete`
  // More info can be found in Documentation
  methodMap: {
    read: 'get'
  }
});

// Fetch information for a repo with an API client
var apiClient = new Github({
  version: '3.0.0'
});
apiClient.authenticate({
  type: 'basic',
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD
});
var repo = new RepoModel(null, {
  apiClient: apiClient
});
repo.fetch({
  data: {
    user: 'uber',
    repo: 'backbone-api-client'
  }
}, function (err, repo, options) {
  console.log(repo.attributes);
  // Logs: {id: 19190227, name: 'backbone-api-client', ...}
});
