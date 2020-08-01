var torii, container;

import toriiContainer from 'test/helpers/torii-container';
import configuration from 'torii/configuration';

var originalConfiguration = configuration.providers['facebook-oauth2'];

var opened, mockPopup = {
  open: function(){
    opened = true;
    return Ember.RSVP.resolve({ code: 'abc' });
  }
};

module('Facebook OAuth2 - Integration', {
  setup: function(){
    container = toriiContainer();
    container.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    container.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = container.lookup("torii:main");
    configuration.providers['facebook-oauth2'] = {apiKey: 'dummy'};
  },
  teardown: function(){
    opened = false;
    configuration.providers['facebook-oauth2'] = originalConfiguration;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to Facebook", function(){
  Ember.run(function(){
    torii.open('facebook-oauth2').finally(function(){
      ok(opened, "Popup service is opened");
    });
  });
});

test("Resolves with an authentication object containing 'redirectUri'", function(){
  Ember.run(function(){
    torii.open('facebook-oauth2').then(function(data){
      ok(data.redirectUri,
         'Object has redirectUri');
    }, function(err){
      ok(false, 'Failed with err '+err);
    });
  });
});
