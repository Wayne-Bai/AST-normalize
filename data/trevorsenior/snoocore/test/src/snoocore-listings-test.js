/* global describe, it, before */

var path = require('path');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var Snoocore = require('../../Snoocore');
var config = require('../config');
var util = require('./util');

describe('Snoocore Listings Test', function () {

  this.timeout(config.testTimeout);

  it('should get the front page listing and nav through it (basic)', function() {

    var reddit = util.getRawInstance();

    // or reddit('/hot').listing
    return reddit('/hot').listing().then(function(slice) {
      expect(slice.get).to.be.a('object');
      expect(slice.after).to.be.a('string');
      expect(slice.before).to.equal(null);
      expect(slice.next).to.be.a('function');
      expect(slice.previous).to.be.a('function');
      expect(slice.start).to.be.a('function');

      expect(slice.count).to.equal(0);
      return slice.next();
    }).then(function(slice) {
      expect(slice.count).to.equal(25);
      return slice.next();
    }).then(function(slice) {
      expect(slice.count).to.equal(50);
      return slice.previous();
    }).then(function(slice) {
      expect(slice.count).to.equal(25);
      return slice.start();
    }).then(function(slice) {
      expect(slice.count).to.equal(0);
    });

  });

  it('should handle empty listings', function() {

    var reddit = util.getRawInstance();

    return reddit('/user/$username/$where').listing({
      $username: 'emptyListing', // an account with no comments
      $where: 'comments'
    }).then(function(slice) {
      expect(slice.empty).to.equal(true);
    });
  });

  it('should requery a listing after changes have been made', function() {

    var reddit = util.getRawInstance();

    // @TODO we need a better way to test this (without using captcha's)
    // as of now it is requerying empty comments of a user which runs the
    // code in question but it is not the best test

    var getComments = reddit('/user/$username/$where').listing;
    var options = { $username: 'emptyListing', $where: 'comments' };

    return getComments(options).then(function(thatSlice) {
      return getComments(options).then(function() {
        return thatSlice.requery();
      }).then(function(thisSlice) {
        expect(thatSlice.empty).to.equal(thisSlice.empty);
      });
    });
  });

  it('should work with reddit.raw', function() {

    var reddit = util.getRawInstance();

    return reddit.raw('https://www.reddit.com/domain/$domain/hot.json').listing({
      $domain: 'google.com'
    }).then(function(slice) {
      expect(slice.get.kind).to.equal('Listing');
    });

  });

  it('should handle listings with multiple listings', function() {

    var reddit = util.getRawInstance();
    
    // just get the data back to compare it with the listing
    return reddit('duplicates/$article').get({
      limit: 2,
      $article: '13wml3'
    }).then(function(getResult) {
      // check that the first result matches what we get back
      return reddit('duplicates/$article').listing({
	limit: 2,
	$article: '13wml3'
      }, { listingIndex: 0 }).then(function(slice) {
	// slice.get should equal the getResult
	expect(slice.get).to.eql(getResult);

	// should equal the first listings children
	expect(slice.allChildren).to.eql(getResult[0].data.children);

	// check the second index
	return reddit('duplicates/$article').listing({
	  limit: 2,
	  $article: '13wml3'
	}, { listingIndex: 1 }).then(function(slice) {
	  // slice.get should equal the getResult
	  expect(slice.get).to.eql(getResult);

	  // should equal the first listings children
	  expect(slice.allChildren).to.eql(getResult[1].data.children);
	})
      });
    });

  });

  it('throw error - listing has multiple listings w/o specifying index', function() {
    var reddit = util.getRawInstance();
    
    return reddit('duplicates/$article').listing({
      limit: 2,
      $article: '13wml3'
    }).then(function() {
      throw new Error('this should have failed');
    }).catch(function(error) {
      expect(error.message).to.equal('Must specify a `listingIndex` for this listing.');
    });
  });

});
