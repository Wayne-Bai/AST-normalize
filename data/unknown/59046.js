! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), wsapi = require("./lib/wsapi.js");
var suite = vows.describe("email-throttling");
var token;
start_stop.addStartupBatches(suite);
suite.addBatch( {
      staging a registration: {
         topic:wsapi.post("/wsapi/stage_user",  {
               email:"first@fakeemail.com", 
               pass:"firstfakepass", 
               site:"https://fakesite.com:443"            }
         ), 
         returns 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }}    }
);
suite.addBatch( {
      a token: {
         topic:function()  {
            start_stop.waitForToken(this.callback);
         }, 
         is obtained:function(err, t)  {
            assert.isNull(err);
            assert.strictEqual(typeof t, "string");
            token = t;
         }}    }
);
suite.addBatch( {
      immediately staging another: {
         topic:wsapi.post("/wsapi/stage_user",  {
               email:"first@fakeemail.com", 
               pass:"firstfakepass", 
               site:"http://fakesite.com:80"            }
         ), 
         is throttled:function(err, r)  {
            assert.strictEqual(r.code, 429);
         }}    }
);
suite.addBatch( {
      finishing creating the first account: {
         topic:function()  {
            wsapi.post("/wsapi/complete_user_creation",  {
                  token:token               }
            ).call(this);
         }, 
         works:function(err, r)  {
            assert.equal(r.code, 200);
            assert.strictEqual(true, JSON.parse(r.body).success);
            token = undefined;
         }}    }
);
suite.addBatch( {
      add a new email address to our account: {
         topic:wsapi.post("/wsapi/stage_email",  {
               email:"second@fakeemail.com", 
               site:"https://fakesite.com"            }
         ), 
         works:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }}    }
);
suite.addBatch( {
      a token: {
         topic:function()  {
            start_stop.waitForToken(this.callback);
         }, 
         is obtained:function(err, t)  {
            assert.isNull(err);
            assert.strictEqual(typeof t, "string");
            token = t;
         }}    }
);
suite.addBatch( {
      re-adding that same new email address a second time: {
         topic:wsapi.post("/wsapi/stage_email",  {
               email:"second@fakeemail.com", 
               site:"http://fakesite.com"            }
         ), 
         is throttled with a 429:function(err, r)  {
            assert.strictEqual(r.code, 429);
         }}    }
);
suite.addBatch( {
      and when we attempt to finish adding the email address: {
         topic:function()  {
            wsapi.post("/wsapi/complete_email_confirmation",  {
                  token:token               }
            ).call(this);
         }, 
         it works swimmingly:function(err, r)  {
            assert.equal(r.code, 200);
            assert.strictEqual(JSON.parse(r.body).success, true);
            token = undefined;
         }}    }
);
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)