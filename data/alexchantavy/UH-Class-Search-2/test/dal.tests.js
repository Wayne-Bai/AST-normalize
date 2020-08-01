// test.js

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    dal = require('../backend/db-access'),
    cfg = require('../conf/testsettings');
chai.use(require('chai-things'));


describe('Data Access Layer', function() {

  it('should grab all courses from the db', function(done) {
    this.timeout(15000);
    dal.getAllCourses(true, function(err, docs) {
      expect(err).to.equal(null);
      expect(docs).to.be.an('array');
      expect(docs[0].course).to.be.a('string');
      expect(docs[0].crn).to.be.a('number');
      expect(docs[0].genEdFocus).to.be.an('array');
      expect(docs[0].instructor).to.be.a('string');
      expect(docs[0].mtgTime).to.be.an('array');
      expect(docs[0].mtgTime.length).to.not.equal(0);
      expect(docs[0].mtgTime[0].dates).to.be.a('string');
      expect(docs[0].mtgTime[0].days).to.be.an('array');
      expect(docs[0].mtgTime[0].loc).to.be.a('string');
      expect(docs[0].mtgTime[0].start).to.be.a('string');
      expect(docs[0].mtgTime[0].end).to.be.a('string');
      expect(docs[0].seatsAvail).to.be.a('number');
      expect(docs[0].waitListed).to.be.a('number');
      expect(docs[0].waitAvail).to.be.a('number');
      expect(docs[0].sectionNum).to.be.a('number');
      expect(docs[0].title).to.be.a('string');
      done();
    });
  });

  it('can query the database by `course`', function(done) {
    this.timeout(15000);
    var opts = { course: 'ICS' };
    dal.get(opts, true, function(err, res) {
      expect(res.length).to.equal(60);
      for (var i = 0, len = res.length; i < len; i++) {
        expect(res[i].course).to.match(/^ICS/);
      }
      done();
    });
  });

  // db.courses.find({"credits": /6/}).count();
  it ('can query the database for `credits`', function(done) {
    this.timeout(15000);
    var opts = {
      credits: '6'
    };
    dal.get(opts, true, function(err, res) {
      expect(res.length).to.equal(142);
      done();
    });
  });

    // meaningful ways to query the database:
    // by genEdFocus [done]
    // by course [done]
    // by credits [done, sort of]
    // by days [done]
    // by start
    // by end
    // by seatsAvail [done]


  // db.courses.find({ 
  //   $and: [
  //    { "genEdFocus": /OC/},
  //    {"genEdFocus": /WI/}
  //   ]
  // });
  // it ('can query the db for classes that have multiple genEdFocus', function(done) {
  //   this.timeout(15000);
  //   var opts = {
  //     genEdFocus: ['WI','OC']
  //   };
  //   dal.get(opts, true, function(err, res) {
  //     var foundWI = false;
  //     var foundOC = false;
  //     expect (res.length).to.equal(31);
  //     //test all items in the returned list for consistency
  //     for (var i = 0, len = res.length; i < len; i++) {
  //       if (res[i].genEdFocus.indexOf('WI') > -1) foundWI = true;
  //       if (res[i].genEdFocus.indexOf('OC') > -1) foundOC = true;
  //     }

  //     expect(foundWI).to.be.true;
  //     expect(foundOC).to.be.true;
  //     done();
  //   });
  // });

  // it ('can query the database by days available', function(done) {
  //   this.timeout(15000);
  //   // db.courses.find({"mtgTime.days": {$in: ["T", "R"] }}).count();
  //   var opts = {
  //     "mtgTime.days": ['T', 'R']
  //   };
  //   dal.get(opts, true, function (err, res){
  //     expect(res.length).to.equal(1582);
  //     done();
  //   });
  // });

  it ('can return only classes that have open seats', function(done) {
    this.timeout(15000);
    // db.courses.find({"mtgTime.days": {$in: ["T", "R"] }}).count();
    var opts = {
      seatsAvail: true
    };
    dal.get(opts, true, function (err, res){
      expect(res.length).to.equal(2588);
      done();
    });
  });

  it ('can query the database for start times', function(done) {
    this.timeout(15000);
    // db.courses.find({'mtgTime.start': /0900/}).
    var opts = {
      "start": '0900'
    };
    dal.get(opts, true, function (err, res){
      if (err) {
        console.log(err);
      }
      expect(res.length).to.equal(312);
      done();
    });
  });

  it ('can query the database for end times', function(done) {
    this.timeout(15000);
    // db.courses.find({'mtgTime.end': /0900/})
    var opts = {
      "end": '0900a'
    };
    dal.get(opts, true, function (err, res){
      if (err) {
        console.log(err);
      }
      expect(res.length).to.equal(7);
      done();
    });
  });

});