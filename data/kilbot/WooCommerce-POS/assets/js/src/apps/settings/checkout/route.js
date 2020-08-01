var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var View = require('./view');
var GatewaySettingsModal = require('./modals/gateway-settings');
var Radio = require('backbone.radio');

var SettingsRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  fetch: function() {
    if(this.model.isNew()){
      return this.model.fetch();
    }
  },

  render: function() {
    var view = new View({
      model: this.model
    });
    this.listenTo(view, 'gateway:settings', this.openGatewaySettingsModal);
    this.container.show(view);
  },

  openGatewaySettingsModal: function(id, tmpl){
    var model = this.model.collection.add({
      id: 'gateway_' + id
    });

    var view = new GatewaySettingsModal({
      template: tmpl,
      model: model
    });

    var self = this;
    Radio.request('modal', 'open', view).done(function(args){
      self.listenTo(view, 'action:save', function(){
        model.save([], { buttons: args.view.footer.currentView });
      });
    });

  }
});

module.exports = SettingsRoute;
POS.attach('SettingsApp.Route', SettingsRoute);