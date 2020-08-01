// Visit Tracker API - this will eventually be configurable
VisitTracker = {
  options: {
    collectionName: 'visits',
    defaultSource: 'ORG'
  },
  visits: new Mongo.Collection('visits')
}

// Insert the created datetime into the doc
VisitTracker.visits.before.insert(function(userId, doc) {
  return doc.createdAt = new Date();
});