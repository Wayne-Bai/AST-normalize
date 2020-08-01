! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), secondary = require("./lib/secondary.js"), wsapi = require("./lib/wsapi.js"), db = require("../lib/db.js"), config = require("../lib/configuration.js"), secrets = require("../lib/secrets.js");
var suite = vows.describe("logout");
var bid_cookie;
suite.options.error = false;
start_stop.addStartupBatches(suite);
const;
TEST_EMAIL = secrets.weakGenerate(12) + "@somedomain.com", TEST_PASS = "thisismypassword", TEST_SITE = "http://fakesite.com";
suite.addBatch( {
      POST /wsapi/logout when not authenticated: {
         topic:wsapi.post("/wsapi/logout",  {} ), 
         is rejected with response code 400:function(err, r)  {
            assert.isNull(err);
            assert.strictEqual(r.code, 400);
         }}    }
);
suite.addBatch( {
      creating a secondary account: {
         topic:function()  {
            secondary.create( {
                  email:TEST_EMAIL, 
                  pass:TEST_PASS, 
                  site:TEST_SITE               }, 
               this.callback);
         }, 
         succeeds:function(err)  {
            assert.isNull(err);
         }}    }
);
suite.addBatch( {
      the test user: {
         topic:wsapi.get("/wsapi/session_context"), 
         is considered to be authenticated after login:function(err, r)  {
            assert.strictEqual(r.code, 200);
            var resp = JSON.parse(r.body);
            assert.strictEqual(resp.authenticated, true);
            bid_cookie = wsapi.getCookie(/^browserid_state/);
         }}    }
);
suite.addBatch( {
      POST /wsapi/logout: {
         topic:wsapi.post("/wsapi/logout",  {} ), 
         is handled correctly:function(err, r)  {
            assert.strictEqual(r.code, 200);
            assert.strictEqual(r.headers["content-type"].indexOf("application/json"), 0);
            assert.strictEqual(JSON.parse(r.body).success, true);
            var cookie = wsapi.getCookie(/^browserid_state/);
            assert.notStrictEqual(cookie, bid_cookie);
         }}    }
);
suite.addBatch( {
      the test user: {
         topic:wsapi.get("/wsapi/session_context"), 
         is not considered to be authenticated after logout:function(err, r)  {
            assert.strictEqual(r.code, 200);
            var resp = JSON.parse(r.body);
            assert.strictEqual(resp.authenticated, false);
         }}    }
);
suite.addBatch( {
      but the test user: {
         topic:wsapi.get("/wsapi/address_info",  {
               email:TEST_EMAIL            }
         ), 
         is still known after logout:function(err, r)  {
            assert.strictEqual(r.code, 200);
            var resp = JSON.parse(r.body);
            assert.strictEqual(resp.type, "secondary");
            assert.strictEqual(resp.state, "known");
            assert.strictEqual(resp.disabled, false);
         }}    }
);
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)