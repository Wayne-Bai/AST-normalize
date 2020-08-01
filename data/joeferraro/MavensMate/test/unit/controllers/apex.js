'use strict';

var ApexController  = require('../../../lib/mavensmate/ui/controllers/apex');
var sinon = require('sinon');

describe('mavensmate ApexController', function(){

  describe('views', function() {
    
    var ctrl;

    beforeEach(function() {
      ctrl = new ApexController({
        app : {
          get: function() {
            return null;
          }
        }
      });
    });

    it('should render apex/new.html', function(done) {    
      var req,res,spy;
      req = res = {};
      spy = res.render = sinon.spy();

      ctrl.new(req, res);
      spy.calledOnce.should.equal(true);
      spy.calledWith('execute_apex/index.html').should.equal(true);
      done();
    });
  });

});


