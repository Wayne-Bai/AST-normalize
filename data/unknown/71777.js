! ✖ / env;
node;
var util = require("util");
var open = require("open");
var teslams = require("../teslams");
var argv = require("optimist").usage("Usage: $0 -u <username> -p <password> [--json || --url || --kml] [--map]").alias("u", "username").describe("u", "Teslamotors.com login").alias("p", "password").describe("p", "Teslamotors.com password").boolean(["j"]).describe("j", "Display the drive state info in JSON format").alias("j", "json").boolean(["m"]).describe("m", "Display the location of the car using Google Maps (in the default browser)").alias("m", "map").boolean(["k"]).describe("k", "Print out the location of the car in KML format").alias("k", "kml").boolean(["U"]).describe("U", "Print a URL to google maps on the console").alias("U", "url").describe("?", "Print usage information").alias("?", "help");
var creds = require("./config.js").config(argv);
argv = argv.argv;
if (argv.help == true)  {
   console.log("Usage: teslamap.js -u <username> -p <password> [--json || --url || --kml] [--map]");
   process.exit(1);
}
function ds(state)  {
   if (state.latitude != undefined)  {
      if (argv.json)  {
         console.log(util.inspect(state));
      }
       else if (argv.url)  {
         console.log("https://maps.google.com/maps?q=" + state.latitude + "," + state.longitude);
      }
       else if (argv.kml)  {
         console.log("<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">");
         console.log("	<Placemark>
		<name>My Tesla</name>
		<description>My Tesla Model S</description>");
         console.log("		<Point>
			<coordinates>" + state.longitude + "," + state.latitude + "</coordinates>");
         console.log("		</Point>
	</Placemark>
</kml>");
      }
       else  {
         console.log(state.latitude + "," + state.longitude);
      }
      if (argv.map)  {
         open("https://maps.google.com/maps?q=" + state.latitude + "," + state.longitude);
      }
   }
    else  {
      console.log("Error: undefined drive state returned from Tesla. Try again.");
   }
}
;
teslams.get_vid( {
      email:creds.username, 
      password:creds.password   }, 
   function(id)  {
      teslams.get_drive_state(id, ds);
   }
);
