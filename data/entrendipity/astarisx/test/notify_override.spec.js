var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');
var sinon = require('sinon');

require('../lib/custom-event-polyfill');

var ControllerViewModel = Astarisx.createControllerViewModelClass({
  mixins:[require('../refImpl/mixinViewModels')],
  getInitialState: function(){
    return {
      busy: false,
    };
  },
  busy: {
    get: function(){
      return this.$state.busy;
    },
  }
});

var AView2 = React.createClass({
  mixins: [Astarisx.mixin.view],
  shouldComponentUpdate: function(nextProps, nextState){
    return nextState.appContext.busy;
  },
  render: function(){
    return React.createElement('div', {className:"aview2 component"});
  }
});

var AView = React.createClass({
  mixins: [Astarisx.mixin.view],
  shouldComponentUpdate: function(){
    //never render
    return false;
  },
  render: function(){
    return React.createElement('div', {className:"aview component"});
  }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  componentWillMount: function(){
    this.initializeAppContext({
      controllerViewModel: ControllerViewModel
    });
  },
  render: function(){
    return (React.createElement('div', null, 
        React.createElement(AView, {$viewKey: "aviewKey"}),
        React.createElement(AView2, {$viewKey: "aviewKey2"})
      )
    );
  }
});

describe('UI', function(){
    
    it('AView never renders and AView2 render is overridden', function(){

      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);

      //already rendered once. Starting trace now.
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      app.state.appContext.setState({busy: true, $notify: "AView"});
      
      app.render.callCount.must.equal(0);
      comp.render.callCount.must.equal(0);
      comp2.render.calledOnce.must.be.true();
      
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();
      comp2.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);
    });

});