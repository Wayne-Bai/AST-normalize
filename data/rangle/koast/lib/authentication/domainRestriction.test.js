/* jshint expr:true */
/* global require, describe, it, before, after */

'use strict';

var expect = require('chai').expect,
  Q = require('q'),
  _ = require('underscore'),
  domainRestriction = require('./domainRestriction'),
  chai = require('chai'),
  expect = chai.expect;


describe('Domain Restriction', function () {

  it('should not permit a user WITHOUT a whitelisted domain', function () {
    // mock Koast authentication config
    var options = {
        restrictToTheseDomains: 'gmail.com, rangle.io, hotmail.com'
    };

    // this simulates the object graph we get back from google
    var data = {
      emails: [
        { value: 'holt@bigPimpin.com' },
        { value: 'holt@mediumPimpin.com' },
        { value: 'holt@smallPimpin.com' },
      ]
    };

    var isPermitted = domainRestriction.isUserPermitted(options, data);

    expect(isPermitted).to.equal(false);
  });

  it('should permit a user WITH a whitelisted domain', function () {
    // mock Koast authentication config
    var options = {
        restrictToTheseDomains: 'gmail.com, rangle.io, hotmail.com'
    };

    // this simulates the object graph we get back from google
    var data = {
      emails: [
        { value: 'holt@rangle.io' },
        { value: 'holt@mediumPimpin.com' },
        { value: 'holt@smallPimpin.com' },
      ]
    };

    var isPermitted = domainRestriction.isUserPermitted(options, data);

    expect(isPermitted).to.equal(true);
  });
});
