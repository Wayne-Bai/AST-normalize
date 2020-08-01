! ✖ / env;
node;
var nodeunit = require("nodeunit"), fs = require("fs"), path = require("path"), loader = require("./loader"), child_process = require("child_process"), rimraf = require("rimraf"), common = require("./common");
function runTests(pat, forceCover)  {
   var defaultReporter = nodeunit.reporters["default"], selfCover = forceCover || process.env.npm_config_coverage, args, proc;
   loader.runTests(pat, defaultReporter, undefined, function(err)  {
         var coverageDir = common.getCoverageDir();
         if (err)  {
            throw err;
         }
         if (selfCover)  {
            rimraf.sync(common.getBuildDir());
            common.setSelfCover(true);
            console.log("Running self-coverage....");
            args = [path.resolve(__dirname, "..", "lib", "cli.js"), "cover", "--self-test", "--dir", coverageDir, "--report", "none", "--x", "**/node_modules/**", "--x", "**/test/**", "--x", "**/yui-load-hook.js", path.resolve(__dirname, "run-junit.js"), "--", pat || ""];
            console.log("Run node " + args.join(" "));
            proc = child_process.spawn("node", args);
            proc.stdout.on("data", function(data)  {
                  process.stdout.write(data);
               }
            );
            proc.stderr.on("data", function(data)  {
                  process.stderr.write(data);
               }
            );
            proc.on("exit", function(exitCode)  {
                  if (exitCode !== 0)  {
                     throw new Error("self-cover returned exit code [" + exitCode + "]");
                  }
                  var Collector = require("../lib/collector"), collector = new Collector(), Report = require("../lib/report"), reporter = Report.create("lcov",  {
                        dir:coverageDir                     }
                  ), summary = Report.create("text-summary"), detail = Report.create("text");
                  fs.readdirSync(coverageDir).forEach(function(file)  {
                        if (file.indexOf("cov") === 0 && file.indexOf(".json") > 0)  {
                           collector.add(JSON.parse(fs.readFileSync(path.resolve(coverageDir, file), "utf8")));
                        }
                     }
                  );
                  reporter.writeReport(collector, true);
                  detail.writeReport(collector, true);
                  summary.writeReport(collector, true);
               }
            );
         }
      }
   );
}
;
runTests(process.argv[2], process.argv[3]);
