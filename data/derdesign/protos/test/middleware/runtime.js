
var app = require('../fixtures/bootstrap'),
    vows = require('vows'),
    assert = require('assert');

vows.describe('Runtime (middleware)').addBatch({
  
  'Runs code on runtime': function() {
    
    if (!app.supports.repl) app.use('repl');
    
    app.use('runtime');
    
    assert.isUndefined(app.RUNTIME_SUCCESS);
    
    app.runtime.loadFile();
    
    assert.isTrue(app.RUNTIME_SUCCESS);
    
  }
  
}).export(module);