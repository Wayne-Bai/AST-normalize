! ✖ / env;
node;
var BibleJS = require("bible.js"), Couleurs = require("couleurs")(), Debug = require("bug-killer"), RegexParser = require("regex-parser"), Ul = require("ul"), Yargs = require("yargs"), OS = require("os"), LeTable = require("le-table"), Fs = require("fs"), config = null;
const;
HELP = require("./docs/help"), SAMPLE_CONFIGURATION = require("./docs/sample-conf"), CONFIG_FILE_PATH = Ul.USER_DIR + "/.bible-config.json", SUBMODULES_DIR = Ul.USER_DIR + "/.bible";
Yargs = Yargs.usage(HELP);
var Argv = Yargs.argv, language = Argv.lang || Argv.language, search = Argv.s || Argv.search, searchResultColor = null;
Debug.config.logLevel = 3;
try {
   config = require(CONFIG_FILE_PATH);
}
catch (e) {
   if (e.code === "MODULE_NOT_FOUND")  {
      Debug.log("No configuration file was found. Initing the configuration file.", "warn");
      Fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(SAMPLE_CONFIGURATION, null, 4));
      Debug.log("The configuration file created successfully at the following location: ", + CONFIG_FILE_PATH, "warn");
      config = require(CONFIG_FILE_PATH);
   }
    else  {
      Debug.log("Cannot read the configuration file. Reason: " + e.code, "warn");
   }
}
if (Argv.v || Argv.version)  {
   return console.log("Bible " + require("./package").version) + "
Bible.JS " + require("./package").dependencies["bible.js"];
   ;
}
var references = Argv._;
if (Argv.help || ! language && ! references.length && ! search)  {
   return console.log(Yargs.help());
}
language = language || config.language;
searchResultColor = Argv.rc || Argv.resultColor || config.resultColor.split(/[ ,]+/);
config.searchLimit = config.searchLimit || 10;
LeTable.defaults.marks =  {
   nw:"┌", 
   n:"─", 
   ne:"┐", 
   e:"│", 
   se:"┘", 
   s:"─", 
   sw:"└", 
   w:"│", 
   b:" ", 
   mt:"┬", 
   ml:"├", 
   mr:"┤", 
   mb:"┴", 
   mm:"┼"}
;
for (var i = 0; i < 3; ++i)  {
      if (! searchResultColor[i])  {
         return console.log("Invalid result color. Please provide a string in this format:", + "'r, g, b'. Example: --resultColor '255, 0, 0'");
      }
      searchResultColor[i] = parseInt(searchResultColor[i]);
   }
function printOutput(err, verses)  {
   if (err)  {
      console.log("Error: ", err);
      return ;
   }
   if (! verses || ! verses.length)  {
      console.log("Verses not found");
   }
   var tbl = new LeTable();
   for (var i in verses)  {
         var cVerse = verses[i], cVerseRef = cVerse.bookname + " " + cVerse.chapter + ":" + cVerse.verse;
         if (search)  {
            var re = typeof search === "string" ? RegexParser(search) : search, match = cVerse.text.match(re) || [];
            for (var ii = 0; ii < match.length; ++ii)  {
                  cVerse.text = cVerse.text.replace(new RegExp(match[ii]), Couleurs.fg(match[ii], searchResultColor));
               }
         }
         if (Argv.onlyVerses)  {
            console.log(cVerse.text);
         }
          else  {
            tbl.addRow([ {
                  text:cVerseRef, 
                  data: {
                     hAlign:"right"                  }} ,  {
                  text:cVerse.text.match(/.{1,80}(\s|$)|\S+?(\s|$)/g).join("
"), 
                  data: {
                     hAlign:"left"                  }} ]);
         }
         if (search && --config.searchLimit <= 0)  {
            break;
         }
      }
   if (! Argv.onlyVerses)  {
      console.log(tbl.toString());
   }
}
;
if (! Fs.existsSync(SUBMODULES_DIR))  {
   Debug.log("~/.bible directory was not found. Downloading packages. This may take a while.", "info");
}
BibleJS.init(config, function(err)  {
      if (err)  {
         throw err;
      }
      var bibleIns = new BibleJS( {
            language:language         }
      );
      if (references.length)  {
         for (var i = 0; i < references.length; ++i)  {
               function(cR)  {
                  if (! Argv.onlyVerses)  {
                     console.log("Reference: " + cR);
                  }
                  bibleIns.get(cR, printOutput);
               }
(references[i]);
            }
      }
      if (search)  {
         if (! Argv.onlyVerses)  {
            console.log("Results for search: " + search);
         }
         bibleIns.search(search, printOutput);
      }
   }
);
