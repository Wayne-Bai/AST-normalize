var request = require('supertest');
var express = require('express');
var app = require('../../server/main/app.js');

var matchCtrl = require('../../server/match/match_controllers.js');
var mongoose = require('mongoose');
var conn = mongoose.connection;

conn.on('error', function (err) {
  console.log('connection error:', err);
});

var Match = require('../../server/match/match_model.js');
var Opp = require('../../server/opportunity/opportunity_model.js');
var Company = require('../../server/company/company_model.js');
var Tag = require('../../server/tag/tag_model.js');
var User = require('../../server/user/user_model.js');
var Category = require('../../server/category/category_model.js');

var matchMockData = require('./match_model_mockData.js');
var oppMockData = require('../opportunity/opportunity_model_mockData.js');
var companyMockData = require('../company/company_model_mockData.js');
var tagMockData = require('../tag/tag_model_mockData.js');
var userMockData = require('../user/user_model_mockData.js');
var categoryMockData = require('../category/category_model_mockData.js');

var removeCollections = function (done) {
  var numCollections = Object.keys(conn.collections).length;
  var collectionsRemoved = 0;
  for (var i in conn.collections) {
    (function (i) {
      conn.collections[i].remove(function (err, results){
        collectionsRemoved += 1;
        if (numCollections === collectionsRemoved) {
          done();
        }
      });
    })(i);
  }
};

var reconnect = function (done) {
  mongoose.connect('mongodb://localhost/myApp', function (err) {
    if (err) {
      console.log('reconnect error');
      throw err;
    }
    return removeCollections(done);
  });
};

var checkState = function (done) {
  switch (conn.readyState) {
  case 0:
    reconnect(done);
    break;
  case 1:
    removeCollections(done);
    break;
  default:
    setTimeout(checkState.bind(this, done), 100);
  }
};

var mockCategory1;
var mockCategory2;
var mockCategory3;
var mockCategory4;
var createCategories = function (done) {
  // create Categories
  Category.create(categoryMockData.validTag, function (err, newCategory) {
    mockCategory1 = newCategory._id;

    Category.create(categoryMockData.validUser, function (err, newCategory2) {
      mockCategory2 = newCategory2._id;

      Category.create(categoryMockData.validUser2, function (err, newCategory3) {
        mockCategory3 = newCategory3._id;

        Category.create(categoryMockData.validCompany, function (err, newCategory4) {
          mockCategory4 = newCategory4._id;
          done();
        });
      });
    });
  });
};

var mockCompany;
var createCompany = function (done) {
  companyMockData.minimum.category = mockCategory4;
  Company.create(companyMockData.minimum, function (err, newCompany) {
    mockCompany = newCompany;
    delete companyMockData.minimum.category;
    done();
  });
};

var mockTag1;
var mockTag2;
var mockTag3;
var mockTag4;
var mockTag5;
var createTags = function (done) {
  // create Tags
  tagMockData.valid.category = mockCategory1;
  tagMockData.valid2.category = mockCategory1;
  tagMockData.valid3.category = mockCategory1;
  tagMockData.valid4.category = mockCategory1;
  tagMockData.valid5.category = mockCategory1;

  Tag.create(tagMockData.valid, function (err, newTag) {
    mockTag1 = newTag._id;

    Tag.create(tagMockData.valid2, function (err, newTag2) {
      mockTag2 = newTag2._id;

      Tag.create(tagMockData.valid3, function (err, newTag3) {
        mockTag3 = newTag3._id;

        Tag.create(tagMockData.valid4, function (err, newTag4) {
          mockTag4 = newTag4._id;

          Tag.create(tagMockData.valid5, function (err, newTag5) {
            mockTag5 = newTag5._id;
            delete mockTag1.category;
            delete mockTag2.category;
            delete mockTag3.category;
            delete mockTag4.category;
            delete mockTag5.category;
            done();
          });
        });
      });
    });
  });
};

var mockUser1;
var mockUser2;
var createUsers = function (done) {
  // assign tags to users
  userMockData.minimum.tags = [
    {tag: mockTag1, score: 1},
    {tag: mockTag2, score: 2},
    {tag: mockTag3, score: 3},
    {tag: mockTag4, score: 4},
  ];

  userMockData.minimum2.tags = [
    {tag: mockTag5, score: 1},
    {tag: mockTag4, score: 2},
    {tag: mockTag3, score: 3},
    {tag: mockTag2, score: 4},
  ];

  // create users
  userMockData.minimum.category = mockCategory2;
  userMockData.minimum2.category = mockCategory3;

  User.create(userMockData.minimum, function (err, newUser) {
    mockUser1 = newUser._id;

    User.create(userMockData.minimum2, function (err, newUser2) {
      mockUser2 = newUser2._id;

      delete userMockData.minimum.category;
      delete userMockData.minimum2.category;
      done();
    });
  });
};

var mockOpp1;
var mockOpp2;
var createOpps = function (done) {
  // assign same company to opps
  oppMockData.minimum.company  = mockCompany;
  oppMockData.minimum2.company = mockCompany;

  // assign tags to opps
  oppMockData.minimum.tags = [
    {tag: mockTag3, score: 1},
    {tag: mockTag1, score: 2},
    {tag: mockTag4, score: 3},
    {tag: mockTag5, score: 4},
  ];
  oppMockData.minimum2.tags = [
    {tag: mockTag4, score: 1},
    {tag: mockTag5, score: 2},
    {tag: mockTag2, score: 3},
    {tag: mockTag3, score: 4},
  ];

  // create opps
  Opp.create(oppMockData.minimum, function (err, newOpp) {
    mockOpp1 = newOpp._id;

    Opp.create(oppMockData.minimum2, function (err, newOpp2) {
    mockOpp2 = newOpp2._id;
    delete oppMockData.minimum.company;
    delete oppMockData.minimum2.company ;
      setTimeout(done, 50);
    });
  });
};

describe('Opportunity Controller', function () {

  it('should have a get method', function () {
    expect(matchCtrl.get).toEqual(jasmine.any(Function));
  });

  it('should have a getByUserId method', function () {
    expect(matchCtrl.getByUserId).toEqual(jasmine.any(Function));
  });

  it('should have a getByOppId method', function () {
    expect(matchCtrl.getByOppId).toEqual(jasmine.any(Function));
  });

  it('should have a putByIds method', function () {
    expect(matchCtrl.putByIds).toEqual(jasmine.any(Function));
  });

});

describe('Opportunity Controller', function () {

  beforeEach(function (done) {
    checkState(done);
  });

  beforeEach(function (done) {
    createCategories(done);
  });

  beforeEach(function (done) {
    createCompany(done);
  });

  beforeEach(function (done) {
    createTags(done);
  });

  beforeEach(function (done) {
    createUsers(done);
  });

  beforeEach(function (done) {
    createOpps(done);
  });

  xit('should automatically create matches from new users and opportunities', function (done) {
    Match.find(function (err, matches) {
      expect(matches.length).toEqual(4);

      expect(matches[0].user).toEqual(mockUser1);
      expect(matches[1].user).toEqual(mockUser2);
      expect(matches[2].user).toEqual(mockUser1);
      expect(matches[3].user).toEqual(mockUser2);

      expect(matches[0].opportunity).toEqual(mockOpp1);
      expect(matches[1].opportunity).toEqual(mockOpp1);
      expect(matches[2].opportunity).toEqual(mockOpp2);
      expect(matches[3].opportunity).toEqual(mockOpp2);

      done();
    });
  });

  it('should be able to GET and populate', function (done) {
    request(app)
    .get('/api/matches')
    .end(function (err, data) {
      if (err) return done(err);

      expect(data.body.matches).toBeDefined();
      expect(data.body.opportunities).toBeDefined();

      done();
    });
  });

  xit('should be able to GET and populate using opportunity', function (done) {
    request(app)
    .get('/api/matches/opportunities/' + mockOpp1)
    .end(function (err, data) {
      if (err) return done(err);

      expect(data.body.length).toEqual(2);

      // test user1
      expect(data.body[0].user.tags[0].tag.name).toEqual(tagMockData.valid.name);
      expect(data.body[0].user.tags[1].tag.name).toEqual(tagMockData.valid2.name);
      expect(data.body[0].user.tags[2].tag.name).toEqual(tagMockData.valid3.name);
      expect(data.body[0].user.tags[3].tag.name).toEqual(tagMockData.valid4.name);

      // test user2
      expect(data.body[1].user.tags[0].tag.name).toEqual(tagMockData.valid5.name);
      expect(data.body[1].user.tags[1].tag.name).toEqual(tagMockData.valid4.name);
      expect(data.body[1].user.tags[2].tag.name).toEqual(tagMockData.valid3.name);
      expect(data.body[1].user.tags[3].tag.name).toEqual(tagMockData.valid2.name);

      // test opp
      expect(data.body[1].opportunity.tags[0].tag.name).toEqual(tagMockData.valid3.name);
      expect(data.body[1].opportunity.tags[1].tag.name).toEqual(tagMockData.valid.name);
      expect(data.body[1].opportunity.tags[2].tag.name).toEqual(tagMockData.valid4.name);
      expect(data.body[1].opportunity.tags[3].tag.name).toEqual(tagMockData.valid5.name);

      done();
    });
  });

  it('should be able to GET and populate using user', function (done) {
    request(app)
    .get('/api/matches/users/' + mockUser2)
    .end(function (err, data) {
      if (err) return done(err);

      expect(Object.keys(data.body).length).toEqual(2);
      expect(data.body.user.name).toEqual(userMockData.minimum2.name);

      done();
    });
  });

  xit('should update (via PUT) and GET using opportunity and user', function (done) {
    request(app)
    .put('/api/matches/users/' + mockUser2 + '/opportunities/' + mockOpp1)
    .send({
      isProcessed: true,
      adminOverride: 2
    })
    .end(function (err, data) {
      if (err) return done(err);

      request(app)
      .get('/api/matches/users/' + mockUser2 + '/opportunities/' + mockOpp1)
      .end(function (err, data) {
        if (err) return done(err);

        // test opp
        expect(data.body.opportunity.tags[0].tag.name).toEqual(tagMockData.valid3.name);
        expect(data.body.opportunity.tags[1].tag.name).toEqual(tagMockData.valid.name);
        expect(data.body.opportunity.tags[2].tag.name).toEqual(tagMockData.valid4.name);
        expect(data.body.opportunity.tags[3].tag.name).toEqual(tagMockData.valid5.name);

        // test user
        expect(data.body.user.tags[0].tag.name).toEqual(tagMockData.valid5.name);
        expect(data.body.user.tags[1].tag.name).toEqual(tagMockData.valid4.name);
        expect(data.body.user.tags[2].tag.name).toEqual(tagMockData.valid3.name);
        expect(data.body.user.tags[3].tag.name).toEqual(tagMockData.valid2.name);

        // test new properties
        expect(data.body.isProcessed).toEqual(true);
        expect(data.body.adminOverride).toEqual(2);

        done();
      });
    });
  });
});

