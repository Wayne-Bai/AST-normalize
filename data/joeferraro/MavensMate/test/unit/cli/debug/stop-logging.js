'use strict';

var assert          = require('assert');
var sinon           = require('sinon');
var util            = require('../../../../lib/mavensmate/util').instance;
var mavensmate      = require('../../../../lib/mavensmate');

describe('mavensmate stop-logging-cli', function(){

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

  after(function(done) {
    program = null;
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

  it('should call directly', function(done) {
    cliClient.program._events['stop-logging']();
    
    executeCommandStub.calledOnce.should.equal(true);
    assert(executeCommandStub.calledWith('stop-logging'));
    done();
  });
});