'use strict';

var assert          = require('assert');
var sinon           = require('sinon');
var sinonAsPromised = require('sinon-as-promised');
var util            = require('../../../../lib/mavensmate/util').instance;
var mavensmate      = require('../../../../lib/mavensmate');
var _               = require('lodash');

sinonAsPromised(require('bluebird'));

describe('mavensmate new-lightning-interface-cli', function(){

  var program;
  var cliClient;
  var executeCommandStub;
  var getPayloadStub;

  before(function(done) {
    delete require.cache[require.resolve('commander')];
    program = require('commander');

    program
      .option('-v --verbose', 'Output logging statements')
      .option('-h --headless', 'Runs in headless (non-interactive terminal) mode. You may wish to use this flag when calling this executable from a text editor or IDE client.')
      .option('-e --editor [name]', 'Specifies the plugin client (sublime, atom)') // no default set
      .option('-p --port [number]', 'UI server port number') // (for sublime text)
      .parse(process.argv, true); // parse top-level args, defer subcommand

    cliClient = mavensmate.createClient({
      editor: program.editor || 'atom',
      headless: true,
      verbose: false,
      program: program
    });

    require('../../../../lib/mavensmate/loader')(cliClient);  
    done();
  });

  beforeEach(function() {
    executeCommandStub = sinon.stub(cliClient, 'executeCommand');
    getPayloadStub = sinon.stub(util, 'getPayload').resolves({ foo : 'bar' });
  });

  afterEach(function() {
    executeCommandStub.restore();
    getPayloadStub.restore();
  });

  it('should accept a ui flag', function(done) {    
    var cmd = _.find(program.commands, { _name : 'new-lightning-interface' });
    cmd.ui = true;
    
    cliClient.program._events['new-lightning-interface']();
    
    executeCommandStub.calledOnce.should.equal(true);
    assert(executeCommandStub.calledWith('new-lightning-interface', { args: { ui: true } }));
    cmd.ui = false;
    done();
  });

  it('should accept stdin', function(done) {
    cliClient.program._events['new-lightning-interface']();
    
    getPayloadStub().then(function() {
      executeCommandStub.calledOnce.should.equal(true);
      assert(executeCommandStub.calledWith('new-lightning-interface', { foo : 'bar' }));
      done();
    });
  });
});