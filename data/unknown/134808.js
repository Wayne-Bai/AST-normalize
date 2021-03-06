! ✖ / env;
node;
var path = require("path"), util = require("util");
var pouch = require("pouchdb"), naturaltime = require("naturaltime"), timepouch = require("./timepouch"), formats = require("./formats");
var options = require("optimist").alias("d", "display").alias("s", "sheet").alias("r", "remove").alias("l", "list").alias("e", "edit").alias("i", "in").alias("o", "out").alias("a", "at").alias("v", "verbose").alias("h", "help").boolean(["i", "o"]);
options.describe("d", "Display checkins for the current or specified sheet");
options.describe("s", "Select or create a sheet");
options.describe("r", "Delete the current or specified sheet (add --entries to remove sheet and its entries)");
options.describe("l", "Display timesheets");
options.describe("e", "Edit an entry (specify an id with --id)");
options.describe("i", "Check in to the current timesheet");
options.describe("o", "Check out of the current timesheet");
options.describe("v", "Verbose display including ids");
options.describe("format", "Display format: text, csv, or tsv (default: text)");
options.describe("sync [url]", "Sync changes with the CouchDB server at url");
var argv = options.argv;
var dir = path.join(process.env.HOME, ".timepouch");
var out = process.stdout;
timepouch(dir, run);
function run(err, tpouch)  {
   if (argv.query)  {
      tpouch.query(argv, console.log);
   }
    else if (argv.in || argv.edit)  {
      if (argv.edit && ! argv.id)  {
         return console.log("> specify the id of the entry to edit (use --verbose when displaying to see ids)");
      }
      var start = argv.at ? getDate(argv.at) : argv.start ? getDate(argv.start) : argv.edit ? null : new Date();
      var end = argv.end ? getDate(argv.end) : null;
      tpouch.in( {
            start:start, 
            end:end, 
            note:argv._.join(" "), 
            sheet:argv.sheet || null, 
            id:argv.id || null         }, 
         inout);
   }
    else if (argv.out)  {
      var end = argv.at ? getDate(argv.at) : argv.end ? getDate(argv.end) : new Date();
      tpouch.out( {
            end:end, 
            id:argv.id || null, 
            sheet:argv.sheet || null         }, 
         inout);
   }
    else if (argv.display)  {
      tpouch.sheets(function(err, sheets, cur, active)  {
            if (err) return console.log(err)            var options = argv;
            if (options.display !== true)  {
               options.sheet = options.display;
            }
            options.sheet = options.sheet || cur;
            if (! options.sheet)  {
               return console.log("> no sheet specified or selected");
            }
            tpouch.query(options, function(err, results)  {
                  var formatter = formats.text;
                  if (options.format)  {
                     formatter = formats[options.format];
                  }
                  if (! formatter)  {
                     return console.error("> Unknown formatter "%s"", options.format);
                  }
                  options.out = out;
                  formatter(options, results.rows);
               }
            );
         }
      );
   }
    else if (argv.sheet)  {
      if (argv.sheet === true)  {
         return console.log("> specify a sheet to create/select");
      }
      tpouch.sheet(argv.sheet, function(err, changed)  {
            if (err) console.error(err)             else if (changed) console.log("> selected sheet '%s'", argv.sheet)             else console.log("> sheet '%s' already selected", argv.sheet)         }
      );
   }
    else if (argv.remove)  {
      tpouch.rmsheet(argv.remove, argv.entries !== undefined, function(err, response)  {
            if (err) return console.error("> error:", err.reason)            if (response.ok)  {
               console.log("> deleted sheet '%s'%s", response.sheet, argv.entries ? " and entries" : "");
            }
             else  {
               console.log("> failed to delete '%s'%s", argv.remove, argv.entries ? " and entries" : "");
            }
         }
      );
   }
    else if (argv.list)  {
      tpouch.sheets(function(err, sheets, cur, active)  {
            if (err) return log(err)            sheets.forEach(function(sheet)  {
                  if (sheet == cur)  {
                     sheet = "*" + sheet;
                  }
                  out.write(" > " + sheet + "
");
               }
            );
            if (sheets.length == 0) console.log("> no sheets found")         }
      );
   }
    else if (argv.sync)  {
      tpouch.sync(argv.sync, function(err, up, down)  {
            if (err)  {
               return console.error(err);
            }
            console.log("> synced %d to remote, %d from remote", up.docs_written, down.docs_written);
         }
      );
   }
    else  {
      options.showHelp();
      process.exit();
   }
}
;
function inout(err, results)  {
   if (err) console.error("Error:", err.reason)    else if (results.start && ! results.end)  {
      console.log("> %s: starting task '%s' at %s", results.sheet, results.note || "(no note)", results.start);
   }
    else if (results.start && results.end)  {
      console.log("> %s: checked out of '%s' at %s", results.sheet, results.note || "(no note)", results.end);
   }
}
;
function getDate(string)  {
   var d = new Date(string);
   if (d == "Invalid Date")  {
      d = naturaltime(string);
   }
   return d;
}
;
