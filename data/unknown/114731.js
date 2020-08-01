! ✖ / env;
node;
var jwt = require("jsonwebtoken"), fs = require("fs"), path = require("path"), configPath, config, expireMinutes, options =  {} , appEnv = process.env.NODE_ENV;
if (appEnv === "development" || ! appEnv)  {
   appEnv = "default";
}
configPath = path.resolve(process.env.NODE_CONFIG_DIR || path.join(__dirname, "../config/"), appEnv + ".json");
config = JSON.parse(fs.readFileSync(configPath));
if (! process.argv[2])  {
   console.log("Usage - test_jwt_token payload (expiryMinutes)");
   process.exit(0);
}
if (process.argv[3])  {
   options.expiresInMinutes = process.argv[3];
}
console.log(jwt.sign(JSON.parse(process.argv[2]), config.jwtKey, options));
