/* ---------------------------------------------------- +/

        ## Publications ##
        All publications-related code. 

/+ ---------------------------------------------------- */

Meteor.publish('homeroad1314', function() {
  return Homeroad1314.find({}, {sort: {"rTOI/G": -1}, limit: 10});
});

Meteor.publish('ESglossary', function() {
  return ESglossary.find();
});

Meteor.publish('legend', function() {
  return Legend.find();
});

Meteor.publish('specialteams1314', function() {
  return Specialteams1314.find({}, {sort: {"SHBlk": -1}, limit: 10});
});

Meteor.publish('main1314', function() {
  return Main1314.find({}, {sort: {PTS: -1}, limit: 10});
});

Meteor.publish('deployment', function() {
  return Main1314.find({}, {sort: {TOI: -1}, limit: 10});
});

Meteor.publish('gamesplayed', function() {
  return Main1314.find({}, { "GP": { $gt: 61 }, limit: 10});
});

Meteor.publish('mainES1314', function() {
  return MainES1314.find({}, {sort: {"Adj Corsi": -1}, limit: 10});
});