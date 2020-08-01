// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongolabodb://heroku_app16403703:mr9p9fe6n6938vs70v0hrp65lh@ds031628.mongolab.com:31628/heroku_app16403703", function(err, db) {
  if(!err) {
    console.log("connected successfully to mongodb://localhost:27017/open_shakespeare");
    importAnnotations(db);
  } else {
    console.error("Error connecting to mongodb://localhost:27017/open_shakespeare");
  }
});

//update the Ranges and URI to match DOM structure
function importAnnotations(db) {
  db.createCollection("annotations", { size: 2147483648 });

  var annotations = db.collection('annotations');

  annotations.find().toArray(function(err, results) {
    if(!err) {
      results.forEach(function(annotation){
        annotation.save(function(err, saved){
          if(err) {
          console.error('Error');
          } 
      });
    console.log("Complete!");
    } else {
      console.error("Error querying annotations collection:", err );
    }
  });
}

