var perfectapi = require('../api.js');
var testapi = require('./testapi.js');
var util = require('util');

describe('Node proxy', function() {
  var webworker = false;
  
  before(function() {
    var config = {options: {port: 3001, webworker: webworker} };
    testapi.server(config);
  })

  
  it('should get config ok', function(done) {
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      done();
    });  
  })
  
  it('should get an err if the command returns one', function(done) {
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      tester.throw({}, function(err, result) {
        
        util.isError(err).should.equal(true);
        done();
      })
    });
  });
  
  it('should get a result if one is given', function(done) {
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      tester.simpleget({}, function(err, result) {
        if (err) throw err;

        result.should.equal('This is a simple result');
        done();
      })
    });
  })
  
  it('should get parameter, options and environment variables when sent as GET', function(done) {
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      var config = {
        param1: 'parameter 1',
        options: {'option1': 'option 1', 'flag1': true},
        environment: {'ENV_1': 'env 1'}
      };
      tester.getwithoptions(config, function(err, result) {
        if (err) throw err;
        
        result.param1.should.equal(config.param1);
        result.options.option1.should.equal(config.options.option1);
        result.options.flag1.should.equal(config.options.flag1);
        result.environment.ENV_1.should.equal(config.environment.ENV_1);
        
        done();
      })
    });
  })

  it('should get parameter, options and environment variables when sent as POST', function(done) {
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      var config = {
        param1: 'parameter 1',
        options: {'option1': 'option 1', 'flag1': true},
        environment: {'ENV_1': 'env 1'}
      };
      tester.postwithoptions(config, function(err, result) {
        if (err) throw err;
        
        result.param1.should.equal(config.param1);
        result.options.option1.should.equal(config.options.option1);
        result.options.flag1.should.equal(config.options.flag1);
        result.environment.ENV_1.should.equal(config.environment.ENV_1);
        
        done();
      })
    });
  })
  
  it('should get multiple parameters when sent as GET', function(done) { 
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      var config = {
        param1: 'parameter 1',
        param2: 'parameter 2'
      };
      tester.multipleParams(config, function(err, result) {
        if (err) throw err;
        
        result.param1.should.equal(config.param1);
        result.param2.should.equal(config.param2);
        
        done();
      })
    });
  })
  it('should get multiple parameters when sent as POST', function(done) { 
    perfectapi.proxy('http://localhost:3001/api/test', function(err, tester) {
      if (err) throw err;
      
      var config = {
        param1: 'parameter 1',
        param2: 'parameter 2'
      };
      tester.multipleParamsPosted(config, function(err, result) {
        if (err) throw err;
        
        result.param1.should.equal(config.param1);
        result.param2.should.equal(config.param2);
        
        done();
      })
    });
  })
  
  after(function() {
    var config = {command: 'stop', options: {webworker:webworker} };
    testapi.server(config, function() {
      //should stop the server
    })  
  })
  
})