! ✖ / bin / node;
var sys = require("sys"), exec = require("child_process").exec;
function puts(error, stdout, stderr)  {
   sys.puts(stdout);
   exec("git stash pop -q");
   if (error)  {
      sys.puts("grunt failed, aborting commit.");
      sys.puts(stderr);
      process.exit(1);
   }
    else  {
      process.exit(0);
   }
}
;
exec("git stash -q --keep-index");
exec("grunt", puts);
