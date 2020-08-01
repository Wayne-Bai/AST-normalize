! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), wsapi = require("./lib/wsapi.js");
var suite = vows.describe("internal-wsapi");
suite.options.error = false;
start_stop.addStartupBatches(suite);
suite.addBatch( {
      requesting to create an account with an assertion: {
         topic:wsapi.post("/wsapi/create_account_with_assertion",  {} ), 
         returns a 404:function(err, r)  {
            assert.strictEqual(r.code, 404);
         }} , 
      requesting to forget an idp: {
         topic:wsapi.get("/wsapi/forget_idp",  {} ), 
         returns a 404:function(err, r)  {
            assert.strictEqual(r.code, 404);
         }} , 
      requesting to increment failed authentication attempts: {
         topic:wsapi.get("/wsapi/increment_failed_auth_tries",  {} ), 
         returns a 404:function(err, r)  {
            assert.strictEqual(r.code, 404);
         }} , 
      requesting to reset failed authentication attempts: {
         topic:wsapi.get("/wsapi/reset_failed_auth_tries",  {} ), 
         returns a 404:function(err, r)  {
            assert.strictEqual(r.code, 404);
         }} , 
      indicating that we've seen an IdP: {
         topic:wsapi.get("/wsapi/saw_idp",  {} ), 
         returns a 404:function(err, r)  {
            assert.strictEqual(r.code, 404);
         }} , 
      indicating that a user has used an email as (primary|secondary): {
         topic:wsapi.post("/wsapi/user_used_email_as",  {} ), 
         returns a 404:function(err, r)  {
            assert.strictEqual(r.code, 404);
         }}    }
);
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)