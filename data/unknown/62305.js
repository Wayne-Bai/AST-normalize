! ✖ / env;
node;
var exec = require("child_process").exec;
var dbconfig = require(process.cwd() + "/config/database");
var envconfig = dbconfig[process.env.NODE_ENV];
if (! envconfig) throw "invalid environment variable"function parse(value)  {
   if (typeof value == "object")  {
      return process.env[value.ENV];
   }
    else  {
      return value;
   }
}
;
var user = parse(envconfig.user), host = parse(envconfig.host), port = parse(envconfig.port), pass = parse(envconfig.password), db = parse(envconfig.database);
if (! db) throw "Database name must be specified in an environment variable."var query = "psql -c "DROP DATABASE " + db + ";"";
if (user) query = " -U " + userif (host) query = " -h " + hostif (port) query = " -p " + portif (pass) query = " -w" + passexec(query, function(err, res)  {
      if (err) throw err      console.log(res);
      console.log(db + " database dropped successfully!");
   }
);
