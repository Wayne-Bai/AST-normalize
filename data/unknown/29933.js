! ✖ / env;
node;
"use strict";
var fs = require("fs"), del = require("del"), semver = require("semver"), path = require("path"), exec = require("child_process").exec, gulp = require("gulp"), open = require("gulp-open"), plumber = require("gulp-plumber"), jshint = require("gulp-jshint"), include = require("gulp-file-include"), rename = require("gulp-rename"), replace = require("gulp-replace-task"), concat = require("gulp-concat-util"), uglify = require("gulp-uglify"), gulpFilter = require("gulp-filter"), gutil = require("gulp-util"), jeditor = require("gulp-json-editor"), beautify = require("gulp-beautify"), karma = require("gulp-karma"), log = require("./dev/build/logger"), size = require("./dev/build/filesize"), jsdoc = require("./dev/build/jsdoc-generator"), pluginInfo = require("./dev/src/plugins.json"), config = require("./dev/build/config.json");
var args = require("yargs").usage("Usage: gulp [options]").describe("o", "Specify output folder for dist files ").alias("o", "out").default("o", "./" + config.dirs.defaultOutput).describe("d", "Generate new docs, optionally supplying output folder [default folder: ./"" + config.dirs.defaultDocsOutput + ""]").alias("d", "doc").default("d", false).describe("b", "Bumps ScrollMagic version number. Accepts 'patch', 'minor' and 'major'.").alias("b", "bump").help("h").alias("h", "?").example("$0 -o=mybuild", "build and output to folder "mybuild"").example("$0 -d", "build and generate new docs").example("$0 --doc=newdocs", "build and generate new docs into folder "newdocs"").example("$0 --bump=patch", "build and update version number from to 2.1.1 to 2.1.2").argv;
if (args.bump)  {
   var validBumps = ["patch", "minor", "major"];
   if (args.bump === true)  {
      args.b = args.bump = validBumps[0];
   }
    else if (validBumps.indexOf(args.bump) === - 1)  {
      log.exit("Supplied option for bump ('" + args.bump + "') is invalid. Allowed values are: '" + validBumps.join("', '") + "'");
   }
}
var options =  {
   version:args.bump ? semver.inc(config.version, args.bump) : config.version, 
   dodocs:! ! args.doc || args._[0] === "generate:docs", 
   folderOut:args.out, 
   folderDocsOut:args.doc.split ? args.doc : "./" + config.dirs.defaultDocsOutput, 
   date:args.bump ? new Date() : new Date(config.lastupdate), 
   banner: {
      uncompressed:fs.readFileSync(config.banner.uncompressed, "utf-8") + "
", 
      minified:fs.readFileSync(config.banner.minified, "utf-8") + "
"   }, 
   subfolder: {
      uncompressed:"uncompressed", 
      minified:"minified"   }} ;
options.replaceVars =  {
   variables: {
      %VERSION%:options.version, 
      %YEAR%:options.date.getFullYear(), 
      %MONTH%:"0" + options.date.getMonth() + 1.slice(- 2), 
      %DAY%:"0" + options.date.getDate().slice(- 2), 
      %DESCRIPTION%:config.info.description   }, 
   patterns:[ {
      match:/\s?\*\/\s*\/\*!?\s?\n( \*)?/gm, 
      replacement:"$1
$1"   }
], 
   usePrefix:false}
;
if (! fs.existsSync(options.folderOut))  {
   log.exit("Supplied output path not found: " + options.folderOut);
}
if (options.dodocs && ! fs.existsSync(options.folderDocsOut))  {
   log.exit("Supplied output path for docs not found: " + options.folderDocsOut);
}
var defaultDeps = ["sync:json-files", "sync:readme", "build:uncompressed", "build:minified"];
if (options.dodocs)  {
   defaultDeps.push("generate:docs");
}
gulp.task("default", defaultDeps, function()  {
      log.info("Generated new build to", options.folderOut);
      gulp.src(options.folderOut + "/" + options.subfolder.uncompressed + "/*.js").pipe(size( {
               showFiles:true, 
               gzip:true, 
               title:"Main Lib uncompressed"            }
         ));
      gulp.src(options.folderOut + "/" + options.subfolder.uncompressed + "/plugins/*.js").pipe(size( {
               showFiles:false, 
               gzip:true, 
               title:"Plugins uncompressed"            }
         ));
      gulp.src(options.folderOut + "/" + options.subfolder.minified + "/*.js").pipe(size( {
               showFiles:true, 
               gzip:true, 
               title:"Main Lib minified"            }
         ));
      gulp.src(options.folderOut + "/" + options.subfolder.minified + "/plugins/*.js").pipe(size( {
               showFiles:false, 
               gzip:true, 
               title:"Plugins minified"            }
         ));
      if (args.bump)  {
         log.info("Bumped version number from v" + config.version + " to v" + options.version);
      }
      if (options.dodocs)  {
         log.info("Generated new docs to", options.folderDocsOut);
      }
   }
);
gulp.task("open-demo", function()  {
      gulp.src("./index.html").pipe(open("<%file.path%>"));
   }
);
gulp.task("clean:uncompressed", ["lint:source"], function(callback)  {
      del(options.folderOut + "/" + options.subfolder.uncompressed + "/*", callback);
   }
);
gulp.task("clean:minified", ["lint:source"], function(callback)  {
      del(options.folderOut + "/" + options.subfolder.minified + "/*", callback);
   }
);
gulp.task("clean:docs", ["lint:source"], function(callback)  {
      if (options.dodocs)  {
         del(options.folderDocsOut + "/*", callback);
      }
       else  {
         callback();
      }
   }
);
gulp.task("lint:source", function()  {
      var dev = args._[0] === "development";
      return gulp.src(config.dirs.source + "/**/*.js").pipe(jshint( {
               lookup:false, 
               debug:dev            }
         )).pipe(jshint.reporter("jshint-stylish")).pipe(jshint.reporter("fail"));
   }
);
gulp.task("build:uncompressed", ["lint:source", "clean:uncompressed"], function()  {
      var pluginWarnings = [];
      for (var classname in pluginInfo.plugins)  {
            var warn = pluginInfo.warningTPL.replace(/%CLASSNAME%/g, classname);
            for (var methodname in pluginInfo.plugins[classname])  {
                  pluginWarnings.push(warn.replace(/%METHOD%/g, methodname).replace(/%PLUGIN%/g, pluginInfo.plugins[classname][methodname]));
               }
         }
      return gulp.src(config.files,  {
            base:config.dirs.source         }
      ).pipe(plumber()).pipe(include("// @")).pipe(replace( {} ));
      patterns:
[ {
            match:/\/\/ \@generate PlugInWarnings/gm, 
            replacement:pluginWarnings.join("
")         }
,  {
            match:/[\t ]*\/\/ \(BUILD\).*$\r?\n?/gm, 
            replacement:""         }
];
   }
);
✖.pipe(concat.header(options.banner.uncompressed)).pipe(replace(options.replaceVars)).pipe(beautify( {
         indentSize:1, 
         indentChar:"	"      }
   )).pipe(gulp.dest(options.folderOut + "/" + options.subfolder.uncompressed));
;
gulp.task("build:minified", ["lint:source", "clean:minified"], function()  {
      return gulp.src(config.files,  {
            base:config.dirs.source         }
      ).pipe(plumber()).pipe(include("// @")).pipe(rename( {
               suffix:".min"            }
         )).pipe(replace( {
               patterns:[ {
                  match:/^\s*throw \[.+\];\s*$/gm, 
                  replacement:"throw 0;"               }
,  {
                  match:/((\s*.+\._?)|(\s+))log\s*\([0-3],.+\)\s*;\s*$/gm, 
                  replacement:""               }
,  {
                  match:/\/\/ \(BUILD\) - REMOVE IN MINIFY - START[^]*?\/\/ \(BUILD\) - REMOVE IN MINIFY - END/gm, 
                  replacement:""               }
]            }
         )).pipe(uglify( {
               output: {
                  screw_ie8:true               }, 
               compress: {
                  unsafe:true, 
                  screw_ie8:true, 
                  hoist_vars:false               }, 
               mangle: {
                  screw_ie8:true               }} )).pipe(concat.header(options.banner.minified)).pipe(replace(options.replaceVars)).pipe(gulp.dest(options.folderOut + "/" + options.subfolder.minified));
   }
);
gulp.task("copy:static-docs", ["clean:docs"], function(callback)  {
      return gulp.src("dev/docs/static/**/*.*",  {
            base:process.cwd() + "/dev/docs/static"         }
      );
   }
.pipe(gulp.dest(options.folderDocsOut)));
;
gulp.task("generate:docs", ["clean:docs", "copy:static-docs"], function(callback)  {
      return gulp.src("dev/src/**/*.js",  {
            base:process.cwd() + "/dev/src"         }
      );
      ✖.pipe(jsdoc( {
               conf:"./dev/docs/jsdoc.conf.json", 
               destination:options.folderDocsOut, 
               template:"./dev/docs/template", 
               readme:"./README.md"            }
         ));
   }
);
gulp.task("sync:json-files", function()  {
      gulp.src(["./package.json", "./bower.json"]).pipe(jeditor(config.info,  {
               keep_array_indentation:true            }
         )).pipe(jeditor( {
               version:options.version            }, 
             {
               keep_array_indentation:true            }
         )).pipe(gulp.dest("./"));
      gulp.src("./dev/build/config.json").pipe(jeditor( {
               version:options.version, 
               lastupdate:options.date.getFullYear() + "-" + "0" + options.date.getMonth() + 1.slice(- 2) + "-" + "0" + options.date.getDate().slice(- 2)            }, 
             {
               keep_array_indentation:true            }
         )).pipe(gulp.dest("./dev/build"));
   }
);
gulp.task("sync:readme", function()  {
      gulp.src("./README.md").pipe(replace( {
               patterns:[ {
                  match:/(<a .*class='version'.*>v)\d+\.\d+\.\d+(\-\w+)?(<\/a>)/gi, 
                  replacement:"$1" + options.version + "$3"               }
,  {
                  match:/(cdnjs.cloudflare.com\/ajax\/libs\/ScrollMagic\/)\d+\.\d+\.\d+(\-\w+)?(\/)/gi, 
                  replacement:"$1" + options.version + "$3"               }
]            }
         )).pipe(gulp.dest("./"));
   }
);
gulp.task("test", ["build:uncompressed", "build:minified"], function()  {
      return gulp.src([]).pipe(karma( {
               configFile:"./" + config.karma.config, 
               action:"run"            }
         )).on("error", function(err)  {
            throw err;
         }
      );
   }
);
gulp.task("travis-ci", ["build:uncompressed", "build:minified", "test"]);
gulp.task("development", ["build:uncompressed"]);
