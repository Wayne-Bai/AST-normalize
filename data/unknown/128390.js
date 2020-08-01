! ✖ / env;
node;
"use strict";
var fs = require("fs");
var chalk = require("chalk");
var multiline = require("multiline");
var pkg = require("./package.json");
var argv = require("yargs").alias("t", "type").alias("s", "style").alias("l", "size").alias("r", "root").alias("w", "whitespace").alias("m", "maxline").alias("n", "newline").alias("h", "help").alias("v", "version").argv;
var str;
var options =  {
   fileType:argv.type, 
   indentSize:argv.size, 
   indentStyle:argv.style, 
   whitespace:argv.whitespace, 
   maxline:argv.maxline, 
   newLine:argv.newline, 
   root:argv.root, 
   help:argv.help, 
   version:argv.version}
;
if (options.version)  {
   console.log(chalk.yellow("Fast Editorconfig: " + pkg.version));
   process.exit();
}
if (options.help)  {
   var help = multiline(function()  {
      }
   );
   console.log(help);
   process.exit();
}
switch(options.fileType) {
   case "python":
 
         options.fileType = "py";
         break;
      
   case "javascript":
 
         options.fileType = "js";
         break;
      
   case "ruby":
 
         options.fileType = "rb";
         break;
      
   case "python":
 
         options.fileType = "py";
         break;
      
}
;
if (options.fileType)  {
   if (options.indentSize || options.indentStyle || options.whitespace || options.maxline || options.newLine)  {
      if (options.fileType === "all" || options.fileType === true)  {
         str = "" + "
[*]" + "";
      }
       else if (options.fileType !== "all")  {
         str = "" + "
[*." + options.fileType + "]" + "";
      }
   }
    else  {
      console.log(chalk.red("Define someone option to your file!"));
      process.exit();
   }
}
 else  {
   console.log(chalk.red("Define a type to the file with --type!"));
   process.exit();
}
if (options.indentSize)  {
   str = "" + "
indent_size = " + options.indentSize + "";
}
if (options.indentStyle)  {
   if (options.indentStyle === "tab" || options.indentStyle === "space")  {
      str = "" + "
indent_style = " + options.indentStyle + "";
   }
    else if (options.indentStyle !== "tab" || options.indentStyle !== "space")  {
      console.log(chalk.red("Style only accept space and tab!"));
      process.exit();
   }
}
if (options.whitespace)  {
   if (options.whitespace === "false")  {
      str = "" + "
trim_trailing_whitespace = false" + "";
   }
    else  {
      str = "" + "
trim_trailing_whitespace = true" + "";
   }
}
if (options.maxline)  {
   str = "" + "
max_line_length = " + options.maxline + "";
}
if (options.newLine)  {
   if (options.newLine === "false")  {
      str = "" + "
insert_final_newline = false" + "";
   }
    else  {
      str = "" + "
insert_final_newline = true" + "";
   }
}
var existFile = fs.existsSync(".editorconfig");
if (! existFile)  {
   if (! argv.root)  {
      fs.writeFileSync(".editorconfig", "# editorconfig.org
");
   }
   if (options.root)  {
      fs.writeFileSync(".editorconfig", "# editorconfig.org

root = true
");
   }
}
fs.appendFile(".editorconfig", str + "
", function(err)  {
      if (err) throw console.log(err)      console.log(chalk.green(".editorconfig has been generated with success! ✔"));
   }
);
