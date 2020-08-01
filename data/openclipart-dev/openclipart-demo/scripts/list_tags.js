var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '_password_',
  database : 'openclipart',
});

connection.connect();
connection.query('SELECT upload_tags FROM ocal_files', function(err, rows) {
  if (err) throw err;

  // build array of all tags and sort
  var all_tags = [];
  for (var i in rows) {
    var tags=rows[i].upload_tags.split(",");
    for (var j in tags) {
      var tag = tags[j].trim();
      if (tag) all_tags.push(tag);
    }
  }
  all_tags.sort();

  // reduce all tags to unique tags
  var unique_tags = [all_tags[0]];
  for (var i = 1; i < all_tags.length; i++) {
    if (all_tags[i-1] !== all_tags[i])
      unique_tags.push(all_tags[i]);
  }

  // print tags
  for (var i in unique_tags)
      console.log(unique_tags[i]);
});
connection.end();
