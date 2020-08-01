! ✖ / env;
node;
if (! process.argv[2])  {
   console.log("Usage: context.js lon lat");
   process.exit(1);
}
var dirname = process.env.CARMEN_DIR || __dirname + "/../tiles";
var fs = require("fs");
var path = require("path");
var Carmen = require("../index");
var opts = Carmen.autodir(path.resolve(dirname));
var carmen = new Carmen(opts);
var argv = require("minimist")(process.argv);
if (! argv.lon) throw new Error("--lon=value argument required")if (! argv.lat) throw new Error("--lat=value argument required")var lon = parseFloat(argv.lon);
if (isNaN(lon)) throw new Error("invalid --lon arg")var lat = parseFloat(argv.lat);
if (isNaN(lat)) throw new Error("invalid --lat arg")carmen.context(lon, lat, null, done);
function done(err, data)  {
   if (err) throw err   console.log(JSON.stringify(data, null, 2));
}
;
