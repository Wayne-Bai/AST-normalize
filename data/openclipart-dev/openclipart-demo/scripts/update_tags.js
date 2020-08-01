var add_tag, delete_tag, rename_tag_from, rename_tag_to;

if (process.argv.length > 2) {
  if (process.argv[2] == "--help") {
    console.log();
    console.log("Usage: ./update_tags.js [--help]");
    console.log("                        [--add 'tag']");
    console.log("                        [--delete 'tag']");
    console.log("                        [--rename 'from' 'to']");
    console.log();
    return;
  }
  if (process.argv[2] == "--add") {
    if (process.argv.length < 4) throw("parameter missing");
    add_tag = process.argv[3];
  }
  else if (process.argv[2] == "--delete") {
    if (process.argv.length < 4) throw("parameter missing");
    delete_tag = process.argv[3];
  }
  else if (process.argv[2] == "--rename") {
    if (process.argv.length < 5) throw("parameters missing");
    rename_tag_from = process.argv[3];
    rename_tag_to = process.argv[4];
  }
  else throw("unknown parameter");
}

var async = require('async');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '_password_',
  database : 'openclipart',
});

async.waterfall([
  function(callback){
    connection.connect(callback);
  },
  function(arg1, callback){
    connection.query('SELECT id, upload_tags FROM ocal_files', callback);
  },
  function(rows, fields, callback) {
    
    for (var i in rows) {
      // split tags on comma
      var tags=rows[i].upload_tags.split(",");
    
      // trim whitespace from each tag and remove empty tags
      var len = tags.length;
      while (len--) {
        tags[len] = tags[len].trim()
        if (!tags[len]) tags.splice(len, 1)
      }
    
      // add tag
      if (add_tag && tags.indexOf(add_tag) == -1)
        tags.push(add_tag);

      // delete tag
      if (delete_tag) {
        var idx = tags.indexOf(delete_tag);
        if (idx != -1) tags.splice(idx, 1);
      }
    
      // rename tag
      if (rename_tag_from && rename_tag_to) {
        var idx = tags.indexOf(rename_tag_from);
        if (idx != -1) tags[idx] = rename_tag_to;
      }

      // sort tags
      tags.sort();
 
      // reassemble to comma-separated tags string
      var tags_str = tags.join(", ");
      if (tags_str) tags_str += ", ";

      connection.query('UPDATE ocal_files SET upload_tags=? where id=?', [tags_str, rows[i].id]);
    }
    callback();
  }],
function (err) {
  if (err) throw err;
  connection.end();
});
