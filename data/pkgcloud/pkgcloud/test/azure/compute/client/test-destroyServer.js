//TODO: Make this a vows test

var helpers = require('../../../helpers');

var client = helpers.createClient('azure', 'compute');

client.destroyServer('test-reboot', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(result);
  }
});




