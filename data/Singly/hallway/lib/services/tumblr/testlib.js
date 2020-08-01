var fs = require("fs");
var util = require('util');
var fb = require("./lib.js");
var pi = JSON.parse(fs.readFileSync(process.argv[2]));
// console.log("passing auth: "+JSON.stringify(pi));

if(process.argv[4]) pi.config = JSON.parse(process.argv[4]);
var sync = require(__dirname + "/" + process.argv[3]);
sync.sync(pi,function(e,js){
  // console.error(JSON.stringify(js, null, 4));
  console.error("error:"+util.inspect(e));
  console.error("config: "+JSON.stringify(js.config));
  Object.keys(js.data).forEach(function(key){
    console.error(key+"\t"+js.data[key].length);
  });
});
