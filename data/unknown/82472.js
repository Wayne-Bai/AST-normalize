! ✖ / env;
node;
var version = require("../package.json").version;
var program = require("commander");
program.version(version).option("-s, --selenium <serverURL>", "Specify Selenium Server, like localhost:4444 or ondemand.saucelabs.com:80").option("-v --verbose").option("-u --username <username>", "Sauce, BrowserStack or Selenium User Name").option("-a --accesskey <accesskey>", "Sauce, BrowserStack or Selenium Access Key").option("-d --debug", "Enable debug mode, keep the browser alive even after the tests", false).option("-c --config-file <configFile>", "Specify a configuration file. If other options are specified, they have precedence over options in config file").option("-o --output <output>", "Format of output [table|json], defaults to table").option("--prescript-file <preScriptFile>", "Prescript node module to run (for login, etc) before the tests. Module should be module.exports = function(browser, callback){}").option("-b --browsers <list of browsers>", "Browsers to run the test on", function(val)  {
      return val.split(",");
   }
).parse(process.argv);
var url = program.args[0];
program.output = program.output || "table";
if (program.verbose && ! process.env.DEBUG)  {
   process.env.DEBUG = "bp:*";
}
require("./index.js")(url, function(err, data)  {
      if (err)  {
         console.warn(err);
      }
       else  {
         if (program.output === "table")  {
            console.log(generateTable(data));
         }
          else  {
            console.log(data);
         }
      }
   }, 
    {
      browsers:program.browsers, 
      selenium:program.selenium, 
      username:program.username, 
      accesskey:program.accesskey, 
      debugBrowser:program.debug, 
      configFile:program.configFile, 
      preScriptFile:program.prescriptFile   }
);
function generateTable(data)  {
   var cliTable = require("cli-table");
   var Docs = require("../docs");
   var apiDocs = new Docs();
   var res = [];
   for (var i = 0; i < data.length; i++)  {
         res.push("

Browser: ", data[i]._browserName + "
");
         var table = new cliTable( {
               head:["Metrics", "Value", "Unit", "Source"], 
               colAligns:["right", "left"], 
               colWidths:[35, 15, 15, 35]            }
         );
         for (var key in data[i])  {
               if (key.indexOf("_") === 0) continue               var val = data[i][key];
               table.push([key, val + "", apiDocs.getProp(key, "unit") + "", apiDocs.getProp(key, "source") + ""]);
            }
         table = table.sort(function(a, b)  {
               if (a[3] === b[3])  {
                  return a[0] > b[0] ? 1 : - 1;
               }
                else  {
                  return a[3] > b[3] ? 1 : - 1;
               }
            }
         );
         res.push(table.toString());
      }
   return res.join("");
}
;
