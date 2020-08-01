var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');


//Only initialize persons dataContext
var ControllerViewModel = Astarisx.createCVMClass({
  mixins:[require('../refImpl/mixinViewModels')],
  getInitialState: function(){
    return { staticField: 'initStaticVal' };
  },
  dataContextWillInitialize: function(/* arguments passed in from new StateManager call*/){
    this.initializeDataContext("persons");
  },
  staticField: {
    kind: 'static',
    get: function(){
      return this.$state.staticField;
    }
  },
  appField: {
    get: function(){
      return this.$state.appField;
    }
  }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  render: function(){
    return React.createElement('div');
  }
});

var app = TU.renderIntoDocument(React.createElement(UI));

describe('setState.spec.js', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel,
      enableUndo: true
    });
  });
  after(function(){
    stateMgr.dispose();
  });

  describe('setState with delay', function(){
    it('args -> callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> void(0), callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> void(0), void(0), callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(void(0), void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });
    
    it('args -> void(0), void(0), remember, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(void(0), void(0), true, function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });
    
    it('args -> void(0), void(0), forget, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(void(0), void(0), false, function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.undefined();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred"}, void(0), forget, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred"}, void(0), false, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred');
          appContext.$state.persons.testField.must.equal('Fred');
          expect(appContext.$previousState).be.undefined();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> void(0), {appField:"updated"}, forget, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(void(0), {appField:"updated"}, false, function(err, appContext){
          expect(Date.now() - enter).be.at.least(500);
          appContext.appField.must.equal("updated");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated");
          expect(appContext.$previousState).be.undefined();
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred1"}, void(0), callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred1"}, void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred1');
          appContext.$state.persons.testField.must.equal('Fred1');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred2"}, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred2"}, void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred2');
          appContext.$state.persons.testField.must.equal('Fred2');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> void(0), {appField:"updated1"}, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState(void(0), {appField:"updated1"}, function(err, appContext){
          appContext.appField.must.equal("updated1");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated1");
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred3"}, {appField:"updated3"}, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred3"}, {appField:"updated3"}, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred3');
          appContext.$state.persons.testField.must.equal('Fred3');
          appContext.appField.must.equal("updated3");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated3");
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred4"}, {appField:"updated4"}, forget, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred4"}, {appField:"updated4"}, false, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred4');
          appContext.$state.persons.testField.must.equal('Fred4');
          appContext.appField.must.equal("updated4");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated4");
          expect(appContext.$previousState).be.undefined();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred5"}, forget, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred5"}, false, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred5');
          appContext.$state.persons.testField.must.equal('Fred5');
          expect(appContext.$previousState).be.undefined();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {testField: "Fred6"}, callback, delay', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        var enter = Date.now();
        this.setState({testField: "Fred6"}, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred6');
          appContext.$state.persons.testField.must.equal('Fred6');
          expect(appContext.$previousState).be.an.object();
          expect(Date.now() - enter).be.at.least(500);
          done();
        }, 500);
      });
    });

    it('args -> {appField: "AppState"}, callback, delay: called on appContext', function(done){
      var enter = Date.now();
      app.state.appContext.setState({appField: "AppState"}, function(err, appContext){
        appContext.$state.$dataContextUpdated.appField.must.equal('AppState');
        appContext.$state.appField.must.equal('AppState');
        expect(appContext.$previousState).be.an.object();
        expect(Date.now() - enter).be.at.least(500);
        done();
      }, 500);
    });

    it('args -> callback, delay: called on appContext', function(done){
      var enter = Date.now();
      app.state.appContext.setState(function(err, appContext){
        expect(appContext.$previousState).be.an.object();
        expect(Date.now() - enter).be.at.least(500);
        done();
      }, 500);
    });

  });




  describe('setState with no delay', function(){
    it('args -> callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> void(0), callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> void(0), void(0), callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });
    
    it('args -> void(0), void(0), remember, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), void(0), true, function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });
    
    it('args -> void(0), void(0), forget, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), void(0), false, function(err, appContext){
          appContext.$state.$dataContextUpdated.must.have.property('persons');
          appContext.$state.persons.selectedPerson.id.must.equal('1');
          expect(appContext.$previousState).be.undefined();
          done();
        });
      });
    });

    it('args -> {testField: "Fred"}, void(0), forget, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred"}, void(0), false, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred');
          appContext.$state.persons.testField.must.equal('Fred');
          expect(appContext.$previousState).be.undefined();
          done();
        });
      });
    });

    it('args -> void(0), {appField:"updated"}, forget, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), {appField:"updated"}, false, function(err, appContext){
          appContext.appField.must.equal("updated");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated");
          expect(appContext.$previousState).be.undefined();
          done();
        });
      });
    });

    it('args -> {testField: "Fred1"}, void(0), callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred1"}, void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred1');
          appContext.$state.persons.testField.must.equal('Fred1');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> {testField: "Fred2"}, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred2"}, void(0), function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred2');
          appContext.$state.persons.testField.must.equal('Fred2');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> void(0), {appField:"updated1"}, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), {appField:"updated1"}, function(err, appContext){
          appContext.appField.must.equal("updated1");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated1");
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> {testField: "Fred3"}, {appField:"updated3"}, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred3"}, {appField:"updated3"}, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred3');
          appContext.$state.persons.testField.must.equal('Fred3');
          appContext.appField.must.equal("updated3");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated3");
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> {testField: "Fred4"}, {appField:"updated4"}, forget, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred4"}, {appField:"updated4"}, false, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred4');
          appContext.$state.persons.testField.must.equal('Fred4');
          appContext.appField.must.equal("updated4");
          appContext.$state.$dataContextUpdated.appField.must.equal("updated4");
          expect(appContext.$previousState).be.undefined();
          done();
        });
      });
    });

    it('args -> {testField: "Fred5"}, forget, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred5"}, false, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred5');
          appContext.$state.persons.testField.must.equal('Fred5');
          expect(appContext.$previousState).be.undefined();
          done();
        });
      });
    });

    it('args -> {testField: "Fred6"}, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({testField: "Fred6"}, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred6');
          appContext.$state.persons.testField.must.equal('Fred6');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });

    it('args -> {appField: "AppState"}, callback: called on appContext', function(done){
      app.state.appContext.setState({appField: "AppState"}, function(err, appContext){
        appContext.$state.$dataContextUpdated.appField.must.equal('AppState');
        appContext.$state.appField.must.equal('AppState');
        expect(appContext.$previousState).be.an.object();
        done();
      });
    });

    it('args -> callback: called on appContext', function(done){
      app.state.appContext.setState(function(err, appContext){
        expect(appContext.$previousState).be.an.object();
        done();
      });
    });

    it('args -> void(0), {persons:{testField: "Fred7"}}, callback', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState(void(0), {persons:{testField: "Fred7"}}, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.testField.must.equal('Fred7');
          appContext.$state.persons.testField.must.equal('Fred7');
          expect(appContext.$previousState).be.an.object();
          done();
        });
      });
    });
  });

  describe('setState with setter only', function(){
    it('viewModel mixin field dummyProp', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        this.setState({dummyProp: "dummyProp"}, function(err, appContext){
          this.$state.dummyProp.must.equal('dummyProp');
          appContext.persons.$state.dummyProp.must.equal('dummyProp');
          this.must.have.nonenumerable('dummyPropVal');
          this.dummyPropVal.must.equal('dummyProp');
          done();
        });
      });
    });
  });

});


