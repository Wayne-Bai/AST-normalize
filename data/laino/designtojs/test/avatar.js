
function saveUserAvatar(path, username, callback) {if(path==null)path='default.png';
    fs.readFile(path, function(error, buffer){if(error!=null){return callback(error)}
    db.saveAvatar(username, buffer, function(error){if(error!=null){return callback(error)}
    console.log("avatar written!");
    callback();
});});}
saveUserAvatar('pic.png', 'lain', function(error){
// do something
});