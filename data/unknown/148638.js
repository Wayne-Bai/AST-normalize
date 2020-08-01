! ✖ / env;
node;
var exec = require("child_process").exec, fs = require("fs"), step = require("step"), colors = require("colors"), mkdirp = require("mkdirp"), readline = require("readline");
try {
   var conf = require("../config");
}
catch (e) {
   console.log("Please execute "%s" in haroopress root directory", "make init".yellow);
   process.exit(1);
}
var rl;
if (fs.existsSync(conf.deployDir))  {
   mkdirp.sync(conf.deployDir);
}
process.chdir(conf.deployDir);
rl = readline.createInterface(process.stdin, process.stdout, null);
try {
   var deployDir = conf.deployDir + "/.git";
   var stat = fs.statSync(deployDir);
   if (stat.isDirectory())  {
      exec("rm -rf " + deployDir, function(err, stdout, stderr)  {
         }
      );
   }
}
catch (e) {
}
console.log("haroo> %s", "Enter the read/write repository for your haroopress site ".yellow);
console.log(""" + "https://github.com/[github-id]/[github-id].github.io.git".red + """);
rl.question(" > ", function(repo)  {
      var user, regx, branch, project;
      if (repo.indexOf("https") >= 0)  {
         regx = /github.com\/([^\/]+)/;
      }
       else  {
         regx = /:([^\/]+)/;
      }
      user = repo.match(regx)[1];
      branch = repo.match(/\/[\w-]+.github.io/) == null ? "gh-pages" : "master";
      project = branch == "gh-pages" ? repo.match(/\/([^\.]+)/)[1] : "";
      console.log("haroo> git remote -v¶".yellow);
      exec("git remote -v", function(code, stdout, stderr)  {
            console.log(stdout);
            if (stdout.match(/origin.+?\/haroopress/) != null)  {
               step(function()  {
                     console.log("haroo> Start setting github pages branch ¶".yellow);
                     exec("git init", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Completed git repository initialize ¶".yellow);
                     exec("git remote rename origin haroopress", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Repository remote's name origin -> haroopress ¶".yellow);
                     if (branch == "master")  {
                        console.log("haroo> Git remote add to origin ¶".red);
                        exec("git remote add origin " + repo, this);
                     }
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Added remote %s as origin ¶".yellow, repo);
                     exec("git config branch.master.remote origin", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Set origin as default remote ¶".yellow);
                     exec("git branch -m master source", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Created inex.html ¶".yellow);
                     exec("echo "<!-- haroopress init -->" > index.html", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> git add . ¶".yellow);
                     exec("git add .", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Copy temp commiter ¶".yellow);
                     exec("cp ../bin/git-commit .git-commit", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> git commit ¶".yellow);
                     exec("./.git-commit", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> Remove temp commiter ¶".yellow);
                     exec("rm -rf .git-commit", this);
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> git remote add origin ¶".yellow);
                     if (branch != "master")  {
                        console.log("haroo> Git remote add to origin ¶".red);
                        exec("git remote add origin " + repo, this);
                     }
                  }, 
                  function(code, stdout, stderr)  {
                     console.log(stdout);
                     console.log("haroo> completed".cyan);
                  }
               );
            }
         }
      );
      rl.close();
      process.stdin.destroy();
   }
);
