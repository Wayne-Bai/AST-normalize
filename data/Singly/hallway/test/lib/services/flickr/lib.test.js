require('chai').should();

var path = require('path');

var root = path.join(__dirname, '..', '..', '..', '..');
var lib = require(path.join(root, 'lib', 'services', 'flickr', 'lib.js'));

describe('setTime', function() {
  var photo;

  beforeEach(function() {
    photo = {
      dateupload: "1353450671"
    };
  });

  describe('when there is no datetaken', function() {
    it('uses dateupload', function() {
      lib.setTime(photo);
      photo.at.should.equal(1353450671000);
    });
  });

  describe('when there is a datetaken', function() {
    beforeEach(function() {
      photo.datetaken = '2010-07-04 12:42:57';
    });

    describe('with a timezone', function() {
      it('sets the correct time', function() {
        lib.setTime(photo, '-08:00');
        photo.at.should.equal(1278276177000);
      });
    });

    describe('without a timezone', function() {
      it('assumes UTC', function() {
        lib.setTime(photo, null);
        photo.at.should.equal(1278247377000);
      });
    });
  });
});
