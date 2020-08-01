var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');

var ControllerViewModel = Astarisx.createCVMClass({
  mixins:[require('../refImpl/mixinViewModels')],
  mockVM: {
    viewModel: require('../refImpl/mockViewModel'),
    get: function(){
      return this.$state.mockVM;
    }
  },
  dataContextWillInitialize: function(/* arguments passed in from new StateManager call*/){
    this.initializeDataContext.apply(this, arguments);
  }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  render: function(){
    return React.createElement('div');
  }
});

var app = TU.renderIntoDocument(React.createElement(UI));

describe('Initialize all dataContexts with no Args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    });
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('App Component state have key appContext', function(){
      app.state.must.have.keys(['appContext']);
    })
    it('appContext must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
    })
    it('appContext must have keys "persons", "hobbies" and "mockVM"', function(){
      app.state.appContext.must.have.ownKeys(['persons', 'hobbies', 'mockVM']);
    })
    it('app.state.appContext dataContexts must be frozen', function(){
      Object.isFrozen(app.state.appContext.persons).must.be.true();
      Object.isFrozen(app.state.appContext.hobbies).must.be.true();
      Object.isFrozen(app.state.appContext.mockVM).must.be.true();
    });

    it('app.state.appContext dataContext $state must not be frozen', function(){
      //WatchedState i.e. linking needs this to not be Frozen
      //This is false for the moment. May freeze $state in a future release
      Object.isFrozen(app.state.appContext.persons.$state).must.be.false();
      Object.isFrozen(app.state.appContext.hobbies.$state).must.be.false();
      Object.isFrozen(app.state.appContext.mockVM.$state).must.be.false();
    });

    it('must be 3 people', function(){
      app.state.appContext.persons.collection.must.have.length(3);
    })
    it('Frank must have 3 hobbies', function(){
      app.state.appContext.persons.collection[0].hobbies.must.have.length(3);
    })
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
})

describe('Initialize all dataContexts with "*" arg', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, '*');
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
})

describe('Initialize all dataContexts with "*" object arg', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, {'*':[]});
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
})
describe('Initialize persons dataContext with Object no dataContext args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },{
       "persons": void(0)
    });
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context not initialized', function(){
      expect(app.state.appContext.hobbies.initialized).be.undefined();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })
  });
});

describe('Initialize persons and hobbies dataContexts with Object no dataContext args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },{
       "persons": void(0),
       "hobbies": void(0)
    });
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })
  });
});

describe('Initialize persons dataContext with one string arg', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, "persons");
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context not initialized', function(){
      expect(app.state.appContext.hobbies.initialized).be.undefined();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })
  });
});

describe('Initialize persons and hobbies dataContexts with two string arg', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, "hobbies", "persons");
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })    
  });
});

describe('Initialize persons and hobbies dataContexts with string array arg', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, ["hobbies", "persons"]);
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })    
  });
});

describe('Initialize persons and hobbies dataContexts with mixed array arg', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, ["hobbies", {"persons":void(0)}]);
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })    
  });
});

describe('Initialize persons and hobbies dataContexts with mixed args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }, "hobbies", {"persons":void(0)});
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be empty', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(0);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })    
  });
});

describe('Initialize all dataContexts with "*" Object and args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },{
       "*": ["globalArg1", "globalArg2"]
    });
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be two', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(2);
      app.state.appContext.persons.passedInArgs.must.eql(["globalArg1", "globalArg2"]);
    })
    it('hobbies context passed in args must be two', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(2);
      app.state.appContext.hobbies.passedInArgs.must.eql(["globalArg1", "globalArg2"]);
    })
    it('mock context passed in args must be two', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(2);
      app.state.appContext.mockVM.passedInArgs.must.eql(["globalArg1", "globalArg2"]);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
});

describe('Initialize persons and hobbies dataContexts with "_*" Object with no dataContext args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },[{
       "_*": ["contextArg1", "contextArg2"]
    }, "persons", "hobbies"]);
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be two', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(2);
      app.state.appContext.persons.passedInArgs.must.eql(["contextArg1", "contextArg2"]);
    })
    it('hobbies context passed in args must be two', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(2);
      app.state.appContext.hobbies.passedInArgs.must.eql(["contextArg1", "contextArg2"]);
    })
    it('mock context passed in args must be empty', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(0);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context not initialized', function(){
      expect(app.state.appContext.mockVM.initialized).be.undefined();
    })
  });
});

describe('Initialize persons dataContexts with "_*" and "*" Object with no dataContext args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },[{
      "*": ["globalArg1", "globalArg2"],
       "_*": ["contextArg1", "contextArg2"]
    }, "persons"]);
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be four', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(4);
      app.state.appContext.persons.passedInArgs.must.eql(["globalArg1", "globalArg2", "contextArg1", "contextArg2"]);
    })
    it('hobbies context passed in args must be four', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(2);
      app.state.appContext.hobbies.passedInArgs.must.eql(["globalArg1", "globalArg2"]);
    })
    it('mock context passed in args must be two', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(2);
      app.state.appContext.mockVM.passedInArgs.must.eql(["globalArg1", "globalArg2"]);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
});

describe('Initialize hobbies dataContexts with "_*" and "*" Object with mockVM dataContext args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },[{
      "*": ["globalArg1", "globalArg2"],
       "_*": ["contextArg1", "contextArg2"],
       "mockVM": ["mockVMArg1", "mockVMArg2"]
    }, "hobbies"]);
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be two', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(2);
      app.state.appContext.persons.passedInArgs.must.eql(["globalArg1", "globalArg2"]);
    })
    it('hobbies context passed in args must be four', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(4);
      app.state.appContext.hobbies.passedInArgs.must.eql(["globalArg1", "globalArg2",
        "contextArg1", "contextArg2"]);
    })
    it('mock context passed in args must be six', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(6);
      app.state.appContext.mockVM.passedInArgs.must.eql(["globalArg1",
        "globalArg2", "contextArg1",
        "contextArg2", "mockVMArg1", "mockVMArg2"]);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
});

describe('Initialize dataContexts with dataContext args', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },[{
       "mockVM": ["mockVMArg1", "mockVMArg2"],
       "persons": ["personsArg1", "personsArg2"],
    }, "hobbies"]);
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be two', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(2);
      app.state.appContext.persons.passedInArgs.must.eql(["personsArg1", "personsArg2"]);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be two', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(2);
      app.state.appContext.mockVM.passedInArgs.must.eql(["mockVMArg1", "mockVMArg2"]);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      app.state.appContext.hobbies.initialized.must.be.true();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
});

describe('Initialize dataContexts with dataContext args - hobbies not initialized', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },{
       "mockVM": ["mockVMArg1", "mockVMArg2"],
       "persons": ["personsArg1", "personsArg2"],
    });
  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('persons context passed in args must be two', function(){
      app.state.appContext.persons.passedInArgs.must.have.length(2);
      app.state.appContext.persons.passedInArgs.must.eql(["personsArg1", "personsArg2"]);
    })
    it('hobbies context passed in args must be empty', function(){
      app.state.appContext.hobbies.passedInArgs.must.have.length(0);
    })
    it('mock context passed in args must be two', function(){
      app.state.appContext.mockVM.passedInArgs.must.have.length(2);
      app.state.appContext.mockVM.passedInArgs.must.eql(["mockVMArg1", "mockVMArg2"]);
    })
    it('persons context initialized', function(){
      app.state.appContext.persons.initialized.must.be.true();
    })
    it('hobbies context initialized', function(){
      expect(app.state.appContext.hobbies.initialized).be.undefined();
    })
    it('mock context initialized', function(){
      app.state.appContext.mockVM.initialized.must.be.true();
    })
  });
});
