var lightning = require('../lib/lightning');

describe('safe', function() {

  it('should correctly mark the string as safe', function() {
    lightning.safe('foo').safe.should.be.true;
  });
  
});