var provider;

import configuration from 'torii/configuration';

var originalConfiguration = configuration.providers['mock-oauth1'];

import BaseProvider from 'torii/providers/oauth1';

var providerName = 'mock-oauth1';

var Provider = BaseProvider.extend({
  name: providerName,
  baseUrl: 'http://example.com',
  redirectUri: 'http://foo'
});

module('MockOauth1Provider (oauth1 subclass) - Unit', {
  setup: function(){
    configuration.providers['mock-oauth1'] = {};
    provider = new Provider();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configuration.providers[providerName] = originalConfiguration;
  }
});

test("Provider requires a requestTokenUri", function(){
  configuration.providers[providerName] = {};
  throws(function(){
    provider.buildRequestTokenUrl();
  }, /Expected configuration value providers.mock-oauth1.requestTokenUri to be defined!/);
});

test("buildRequestTokenUrl generates a URL with required config", function(){
  configuration.providers[providerName] = {
    requestTokenUri: 'http://expectedUrl.com'
  };
  equal(provider.buildRequestTokenUrl(), 'http://expectedUrl.com',
        'generates the correct URL');
});
