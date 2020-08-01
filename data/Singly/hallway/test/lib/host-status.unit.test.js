require('chai').should();

var hostStatus = require('host-status');
var os = require('os');

describe('host-status', function () {
  describe('#status', function () {
    it('should return valid status information', function () {
      var status = hostStatus.status();

      status.sourceVersion.should.be.a('string');
      status.configVersion.should.be.a('string');
      status.apiKeysVersion.should.be.a('string');

      status.host.should.equal(os.hostname());

      status.uptime.should.be.a('number');

      status.os.uptime.should.be.a('number');
      status.os.loadavg.should.be.an('array');
      status.os.totalmem.should.be.a('number');
      status.os.freemem.should.be.a('number');
    });
  });
});
