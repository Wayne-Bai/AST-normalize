! ✖ / env;
node;
var exec = require("child_process").exec;
var config = require("../config.js").opt;
var dirs_string = config.git_home_dir + "/" + process.argv[2] + " " + config.apps_home_dir + "/" + process.argv[2];
var cmds = ["mkdir " + dirs_string, "chgrp -R " + config.chgrp + " " + dirs_string, "chmod 0777 " + dirs_string];
var do_cmd = function()  {
   if (cmds.length > 0)  {
      var cmd = cmds.shift();
      console.log("Running: " + cmd);
      exec(cmd, function()  {
            do_cmd();
         }
      );
   }
}
;
do_cmd();
