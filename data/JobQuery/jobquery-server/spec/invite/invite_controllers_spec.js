'use strict';

var inviteCtrl = require('../../server/invite/invite_controllers.js');

describe('invite controller', function () {

  it('should have a sendInvites method', function () {
    expect(inviteCtrl.sendInvites).toEqual(jasmine.any(Function));
  });

});
