/* 
Database access module 

This module provides all methods necessary to retrieve and update reords from
the database.  

*/

var mongoose = require('mongoose'),
    fs       = require('fs'),
    async    = require('async'),
    cfg      = require('../conf/settings.json');

var courseSchema = mongoose.Schema({
    campus:       String,
    course:       String,
    credits:      mongoose.Schema.Types.Mixed,
    crn:          Number,
    genEdFocus:   [String],
    instructor:   String,
    mtgTime: [{
      dates:      String,
      days:       [String],
      loc:        String,
      start:      String,
      end:        String
    }],
    seatsAvail:   Number,
    waitListed:   Number,
    waitAvail:    Number,
    sectionNum:   mongoose.Schema.Types.Mixed,
    title:        String
});

var Course = mongoose.model('Course', courseSchema);

/* 
  getAllCourses: retrieves records of all courses from the database.
  @param callback: run this after we have saved everything
*/
function getAllCourses(useTestDb, callback) {
  var username =     (useTestDb)? cfg.testdb.username : cfg.db.username
  ,   password =     (useTestDb)? cfg.testdb.password : cfg.db.password
  ,   databaseName = (useTestDb)? 'uhfind-test'       : 'uhfind';
  if (useTestDb) {
    console.log("attempting to connect to test db...");
  }
  mongoose.connect('mongodb://' + cfg.hostname + '/' + databaseName, {
    user: username,
    pass: password
  });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function() {
    // sort by objectid descending
    Course.find({}).sort({'_id': -1}).select().exec(function(err, docs) {
      mongoose.disconnect();
      if (err) {
        callback(err);
      } else {
        callback(null, docs);
      } 
    });
  });
}

/*
get: Accepts query options for courses, returns results of db query to 
callback.
Examples:
{genEdFocus:['WI', 'OC']} ->  find all courses that are WI _and_ OC
{course:'ICS'} -> find all 'ICS' courses
{days: 'T', 'R'} -> find all courses that are on Tuesday _or_ Thursday
{credits: 3}
{seatsAvail: true}

@param searchOpts query options to pass to mongodb 
@param callback   a callback

*/
function get(searchOpts, useTestDb, callback) {
  /*var validProps = [
    "course",
    "credits",
    "crn",
    "genEdFocus",
    "instructor",
    "mtgTime",
    "dates",
    "days",
    "loc",
    "start",
    "end",
    "seatsAvail",
    "waitListed",
    "waitAvail",
    "sectionNum",
    "title"
  ];*/
  if (searchOpts == null || searchOpts.length < 1) {
    callback({message:'noCriteriaGiven'});
  }

  var username = (useTestDb)? cfg.testdb.username : cfg.db.username
  ,   password = (useTestDb)? cfg.testdb.password : cfg.db.password
  ,   databaseName = (useTestDb)? 'uhfind-test' : 'uhfind';

  //if (useTestDb) {
    mongoose.set('debug', true);
  //}

  mongoose.connect('mongodb://' + cfg.hostname + '/' + databaseName, {
    user: username,
    pass: password
  });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  
  db.once('open', function() {

    // Query builder.
    var query = { $and: [] };

    for (var key in searchOpts) {

      var value = searchOpts[key];

      console.log(key);
      if (key == 'campus') {
        query.$and.push({'campus': value});
      }

      //console.log(key);
      if (key == 'genEdFocus') {
        // little bit of data structure manipulation
        for (var focus in value) {
          if (value[focus] != 'Any' && value[focus] != '--') {
            query.$and.push({ 
              'genEdFocus': value[focus] 
            });
          }
        }
      } 

      if (key == 'days') {
        query.$and.push({
          "mtgTime.days": value
        });
      } 

      if (key == 'course') {
        query.$and.push({
          "course": { '$regex': value }
        });    
      } 

      if (key == 'credits') {
        // can only match credit counts with regex because some
        // of the data contains values like '1-5'.
        query.$and.push({
          "credits": { '$regex': value }
        }); 
      } 

      if (key == 'seatsAvail') {
        if (value == true) {
          query.$and.push({
            "seatsAvail": { '$gt': 0 }
          }); 
        }
      } 

      if (key == 'start' ) {
        // Example valid mtgTime.start: '0900'.
        query.$and.push({
          "mtgTime.start" : {'$regex': value}
        })
      } 

      if (key == 'end') {
        // Example valid mtgTime.end:   '0900a'.  
        query.$and.push({
          "mtgTime.end": {'$regex': value}
        }); 
      }     

      if (key == 'instructor') {
        // Example valid mtgTime.end:   '0900a'.  
        query.$and.push({
          "instructor": {'$regex': value, '$options': 'i'}
        }); 
      }     

    } // end for

    // disallow empty queries or those that enumerate an entire campus
    if (query.$and.length == 0 || 
        (query.$and.length == 1 && query.$and[0].campus)) {
      mongoose.disconnect();
      callback({message:'noCriteriaGiven'});
    }

    Course.find(query).sort({'course': 1}).select().exec(function(err, docs) {  
      mongoose.disconnect();
      if (err) {
        callback(err);
      } else { 
        callback(null, docs);
      }
    });
  });
}

/* 
  saveCourseArray: upserts courses to database.
  @param catalog: an array of courses returned from UHFind.fetchDeptCourses().
  @param callback: run this after we have saved everything
*/
function saveCourseArray(catalog, useTestDb, callback) {
  if ( ! Array.isArray(catalog)) {
    callback('catalog is not an array');
  } else {
    var username = (useTestDb)? cfg.testdb.username : cfg.db.username
    ,   password = (useTestDb)? cfg.testdb.password : cfg.db.password
    ,   databaseName = (useTestDb)? 'uhfind-test' : 'uhfind';

    mongoose.connect('mongodb://' + cfg.hostname + '/' + databaseName, {
      user: username,
      pass: password
    });

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', function() {
      
      // seems to be a sweet spot for performance 
      var MAX_CONCURRENT = 160;

      async.eachLimit(catalog, MAX_CONCURRENT,
        // Upsert items
        function(item, callback) {
          // if item is in db with same crn, update all fields.
          Course.update(
            { crn: item.crn }, 
            item, 
            { multi: false, upsert: true },
            function(err, numAffected, raw) {
              if (err) {
                callback(err);
              } else {
                console.log('saved course ' + item.course);
                callback();
              }
            }
          );
        },

        // done with all items
        function(err) {
          mongoose.disconnect();
          if (err) {
            console.log(err);
          } else {
            console.log('saved to db!');
            callback();
          }
        }
      );

    });
  }
}

module.exports.getAllCourses = getAllCourses;
module.exports.saveCourseArray = saveCourseArray;
module.exports.get = get;