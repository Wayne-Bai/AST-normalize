! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), wsapi = require("./lib/wsapi.js");
var suite = vows.describe("registration-status-wsapi");
var token = undefined;
start_stop.addStartupBatches(suite);
suite.addBatch( {
      calling registration_status without a pending reg is an error: {
         topic:wsapi.get("/wsapi/user_creation_status"), 
         HTTP 400:function(err, r)  {
            assert.equal(400, r.code);
         }}    }
);
suite.addBatch( {
      authentication as an unknown user: {
         topic:wsapi.post("/wsapi/authenticate_user",  {
               email:"first@fakeemail.com", 
               pass:"secondfakepass", 
               ephemeral:false            }
         ), 
         fails:function(err, r)  {
            assert.isFalse(JSON.parse(r.body).success);
         }}    }
);
suite.addBatch( {
      start registration: {
         topic:wsapi.post("/wsapi/stage_user",  {
               email:"first@fakeemail.com", 
               pass:"firstfakepass", 
               site:"https://fakesite.com"            }
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
      comparing token to email: {
         topic:function()  {
            return wsapi.get("/wsapi/email_for_token",  {
                  token:token               }
            ).call(this);
         }, 
         and it matches:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).email, "first@fakeemail.com");
         }}    }
);
suite.addBatch( {
      calling user_creation_status without an email argument: {
         topic:wsapi.get("/wsapi/user_creation_status"), 
         yields a HTTP 400:function(err, r)  {
            assert.strictEqual(r.code, 400);
         }, 
         returns an error string:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).success, false);
         }}    }
);
suite.addBatch( {
      calling user_creation_status when a reg is really pending: {
         topic:wsapi.get("/wsapi/user_creation_status",  {
               email:"first@fakeemail.com"            }
         ), 
         yields a HTTP 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }, 
         returns a json encoded string - `pending`:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).status, "pending");
         }}    }
);
suite.addBatch( {
      completing user creation: {
         topic:function()  {
            wsapi.post("/wsapi/complete_user_creation",  {
                  token:token               }
            ).call(this);
         }, 
         works:function(err, r)  {
            assert.equal(r.code, 200);
            token = undefined;
         }}    }
);
suite.addBatch( {
      calling user_creation_status after a registration is complete: {
         topic:wsapi.get("/wsapi/user_creation_status",  {
               email:"first@fakeemail.com"            }
         ), 
         yields a HTTP 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }, 
         returns a json encoded string - `complete`:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).status, "complete");
         }}    }
);
suite.addBatch( {
      calling registration_status a second time after a registration is complete: {
         topic:wsapi.get("/wsapi/user_creation_status",  {
               email:"first@fakeemail.com"            }
         ), 
         still yields a HTTP 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }, 
         and still returns a json encoded string - `complete`:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).status, "complete");
         }}    }
);
suite.addBatch( {
      after successful registration: {
         topic:wsapi.get("/wsapi/session_context"), 
         we're authenticated:function(err, r)  {
            assert.strictEqual(r.code, 200);
            assert.strictEqual(JSON.parse(r.body).auth_level, "password");
         }, 
         but we can easily clear cookies on the client to change that!:function(err, r)  {
            wsapi.clearCookies();
         }}    }
);
suite.addBatch( {
      after clearing cookies: {
         topic:wsapi.get("/wsapi/session_context"), 
         we're NOT authenticated:function(err, r)  {
            assert.strictEqual(r.code, 200);
            assert.strictEqual(JSON.parse(r.body).authenticated, false);
         }}    }
);
suite.addBatch( {
      re-registering an existing email: {
         topic:wsapi.post("/wsapi/stage_user",  {
               email:"first@fakeemail.com", 
               pass:"secondfakepass", 
               site:"http://secondfakesite.com"            }
         ), 
         yields a HTTP 200:function(err, r)  {
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
      calling registration_status when a reg is pending for an email that is already verified: {
         topic:wsapi.get("/wsapi/user_creation_status",  {
               email:"first@fakeemail.com"            }
         ), 
         should yield a HTTP 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }, 
         returns a json encoded string - `pending`:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).status, "pending");
         }}    }
);
suite.addBatch( {
      proving email ownership causes account re-creation: {
         topic:function()  {
            wsapi.post("/wsapi/complete_user_creation",  {
                  token:token               }
            ).call(this);
         }, 
         and returns a 200 code:function(err, r)  {
            assert.equal(r.code, 200);
            token = undefined;
         }}    }
);
suite.addBatch( {
      calling registration_status after proving a re-registration: {
         topic:wsapi.get("/wsapi/user_creation_status",  {
               email:"first@fakeemail.com"            }
         ), 
         yields a HTTP 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }, 
         returns a json encoded string - `complete`:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).status, "complete");
         }}    }
);
suite.addBatch( {
      again, calling registration_status a second time after a registration is complete: {
         topic:wsapi.get("/wsapi/user_creation_status",  {
               email:"first@fakeemail.com"            }
         ), 
         yields a HTTP 200:function(err, r)  {
            assert.strictEqual(r.code, 200);
         }}    }
);
suite.addBatch( {
      after re-registration, authenticating with new credetials: {
         topic:wsapi.post("/wsapi/authenticate_user",  {
               email:"first@fakeemail.com", 
               pass:"secondfakepass", 
               ephemeral:false            }
         ), 
         works as you might expect:function(err, r)  {
            assert.strictEqual(JSON.parse(r.body).success, true);
         }}    }
);
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)