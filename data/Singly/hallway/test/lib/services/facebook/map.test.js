var should = require('chai').should();

var map = require('services/facebook/map');

describe('GUIDs', function () {
  var entry;

  describe('photos', function () {
    describe('from Instagram', function () {
      beforeEach(function () {
        entry = { data: { name: 'From http://instagr.am/p/123/' } };
      });

      it('generates the right GUID', function () {
        map.guid.photo(entry).should.equal('guid:instagram/#123');
      });
    });

    describe('not from Instagram', function () {
      beforeEach(function () {
        entry = { data: { name: '' } };
      });

      it('does not have a GUID', function () {
        should.not.exist(map.guid.photo(entry));
      });
    });
  });

  describe('posts', function () {
    describe('without any cross-posting', function () {
      beforeEach(function () {
        entry = { data: {} };
      });

      it('does not have a GUID', function () {
        should.not.exist(map.guid.post(entry));
      });
    });

    describe('linking to Instagram', function () {
      beforeEach(function () {
        entry = {
          refs: {
            'http://instagr.am/p/123/': true
          }
        };
      });

      it('generates the right GUID', function () {
        map.guid.post(entry).should.equal('guid:instagram/#123');
      });
    });

    describe('linking to Foursquare', function () {
      beforeEach(function () {
        entry = {
          refs: {
            'http://foursquare.com/kristjan/checkin/123': true
          }
        };
      });

      it('generates the right GUID', function () {
        map.guid.post(entry).should.equal('guid:foursquare/#123');
      });
    });

    describe('via Twitter', function () {
      beforeEach(function () {
        entry = {
          data: {
            application: {name: 'Twitter'},
            actions: [{name: '@kripet on Twitter'}],
            message: 'Rockin Robin'
          }
        };
      });

      it('generates the right GUID', function () {
        map.guid.post(entry)
          .should.equal('guid:kripet@twitter/#ff3420b9d5480411e1cc9db7a202bf56');
      });
    });

    describe('via Foursquare', function () {
      beforeEach(function () {
        entry = {
          data: {
            application: {name: 'foursquare'},
            link: 'http://foursquare.com/kristjan/checkin/123'
          }
        };
      });

      it('generates the right GUID', function () {
        map.guid.post(entry).should.equal('guid:foursquare/#123');
      });
    });
  });
});
