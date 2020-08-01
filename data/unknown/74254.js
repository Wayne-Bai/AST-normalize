! ✖ / env;
node;
var bcrypt = require("bcryptjs");
var commander = require("commander");
var fs = require("fs");
var path = require("path");
var outPath = path.join(__dirname, "..", "..", "data", "blog_password.bcrypt");
commander.version("0.0.2").parse(process.argv);
commander.password("New blog password: ", function(newPassword)  {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(newPassword, salt);
      fs.writeFileSync(outPath, hash, "utf8");
      console.log("password hash stored at " + outPath);
      return process.exit(0);
   }
);
