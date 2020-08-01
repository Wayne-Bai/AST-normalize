! ✖ / env;
node;
var git = require("git-node");
var program = require("commander");
program.usage("[options] [--] [<ref>]").option("--tree", "show content trees").option("--limit <num>", "stop loading history after num entries").option("--git-dir <dir>", "Use custom git dir instead of cwd").parse(process.argv);
if (program.args.length > 1)  {
   program.outputHelp();
   process.exit(1);
}
if (program.limit) program.limit = parseInt(program.limit, 10)var ref = program.args[0] || "HEAD";
var target = require("./root.js")(program);
var repo = git.repo(target);
repo.logWalk(ref, function(err, log)  {
      if (err) throw err      var shallow;
      return log.read(onRead);
      function onRead(err, commit)  {
         if (err) throw err         if ("limit" in program && ! program.limit--) return          if (! commit) return logEnd(shallow)         if (commit.last) shallow = true         logCommit(commit);
         if (! program.tree) return log.read(onRead)         repo.treeWalk(commit.tree, function(err, tree)  {
               if (err) throw err               tree.read(onEntry);
               function onEntry(err, entry)  {
                  if (err) throw err                  if (! entry)  {
                     return log.read(onRead);
                  }
                  logEntry(entry);
                  return tree.read(onEntry);
               }
;
            }
         );
      }
;
   }
);
function logCommit(commit)  {
   var author = commit.author;
   var message = commit.message;
   console.log("
[33mcommit %s[0m", commit.hash);
   console.log("Author: %s <%s>", author.name, author.email);
   console.log("Date:   %s", author.date);
   console.log("
    [32;1m" + message.trim().split("
").join("[0m
    [32m") + "[0m
");
}
;
function logEntry(entry)  {
   var path = entry.path.replace(/\//g, "[1;34m/[0;34m") + "[0m";
   console.log(" %s %s", entry.hash, path);
}
;
function logEnd(shallow)  {
   var message = shallow ? "End of shallow record." : "Beginning of history";
   console.log("
[30;1m%s[0m
", message);
}
;
