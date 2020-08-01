! ✖ / env;
node;
var config = require("./build-config.js");
var path = require("path");
var gulp = require("gulp");
var clean = require("gulp-clean");
var karma = require("gulp-karma");
require("./gulp-tasks/bower-task.js")(gulp);
require("./gulp-tasks/modules-task.js")(gulp);
require("./gulp-tasks/index-task.js")(gulp);
gulp.task("build", ["modules", "bower", "index", "sandbox"]);
gulp.task("app-copy-readme", ["app-copy-clean"], function()  {
      var path = require("path");
      return gulp.src("README.md").pipe(gulp.dest(path.join(config.folders.dest, "app")));
   }
);
var appCopy = gulp.tasks["app-copy"];
appCopy.dep.push("app-copy-readme");
gulp.task("sandbox-clean", ["modules", "bower"], function()  {
      return gulp.src(path.join(config.folders.dest, "sandbox")).pipe(clean());
   }
);
gulp.task("sandbox", ["sandbox-clean", "modules", "bower"], function()  {
      return gulp.src(path.join(config.folders.src, "sandbox/**/*")).pipe(gulp.dest(path.join(config.folders.dest, "sandbox")));
   }
);
gulp.task("test-run", ["angular-block-ui"], function()  {
      return gulp.src(["bower_components/angular/angular.js", "bower_components/angular-mocks/angular-mocks.js", path.join(config.folders.dest, "angular-block-ui/angular-block-ui.min.js"), path.join(config.folders.src, "angular-block-ui/**/*.test.js")]).pipe(karma( {
               configFile:"karma.conf.js", 
               action:"run"            }
         )).on("error", function(err)  {
            throw err;
         }
      );
   }
);
gulp.task("test-watch", ["angular-block-ui"], function()  {
      gulp.src(["bower_components/angular/angular.js", "bower_components/angular-mocks/angular-mocks.js", path.join(config.folders.src, "angular-block-ui/angular-block-ui.js"), path.join(config.folders.dest, "angular-block-ui/angular-block-ui-templates.js"), path.join(config.folders.src, "angular-block-ui/**/*.js")]).pipe(karma( {
               configFile:"karma.conf.js", 
               action:"watch"            }
         ));
   }
);
gulp.task("dist-clean", function()  {
      return gulp.src("dist/**/*",  {
            read:false         }
      ).pipe(clean());
   }
);
gulp.task("dist", ["dist-clean", "angular-block-ui", "test-run"], function()  {
      var destGlob = path.join(config.folders.dest, "angular-block-ui/**/*");
      return gulp.src([destGlob, "README.md", "!**/angular-block-ui-templates.js"]).pipe(gulp.dest("dist"));
   }
);
gulp.task("watch", ["modules-watch"]);
gulp.task("default", ["dist"]);
