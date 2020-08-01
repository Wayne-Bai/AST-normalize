! ✖ / env;
node;
require("./lib/test_env.js");
const;
assert = require("assert"), vows = require("vows"), start_stop = require("./lib/start-stop.js"), wsapi = require("./lib/wsapi.js"), db = require("../lib/db.js"), config = require("../lib/configuration.js"), _ = require("underscore");
var mappedDomain = "example.com";
var testProxyIdps =  {
   example.com:"example.login.persona.org"}
;
var suite = vows.describe("well-known-browserid");
suite.options.error = false;
function checkDefaultResponse(err, res)  {
   assert.equal(res.code, 200);
   assert.equal(res.headers["content-type"].indexOf("application/json"), 0);
   var body = JSON.parse(res.body);
   assert.equal(Object.keys(body).length, 3);
   assert.equal(Object.keys(body)[0], "public-key");
}
;
if (process.env.PROXY_IDPS) delete process.env.PROXY_IDPSstart_stop.addStartupBatches(suite);
suite.addBatch( {
      with PROXY_IDPS unset, then GET /.well-known/browserid: {
         topic:wsapi.get("/.well-known/browserid"), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }} , 
      with PROXY_IDPS unset, then GET /.well-known/browserid?domain=: {
         topic:wsapi.get("/.well-known/browserid?domain="), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }} , 
      with PROXY_IDPS unset, then GET /.well-known/browserid?domain=unknown.com: {
         topic:wsapi.get("/.well-known/browserid?domain=unknown.com"), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }} , 
      with PROXY_IDPS unset, then GET /.well-known/browserid?domain=example.com: {
         topic:wsapi.get("/.well-known/browserid?domain=example.com"), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }}    }
);
start_stop.addShutdownBatches(suite);
suite.addBatch( {
      Setting the environment for PROXY_IDPS: {
         topic:function()  {
            process.env.PROXY_IDPS = JSON.stringify(testProxyIdps);
            return true;
         }, 
         should stick:function()  {
            assert.strictEqual(process.env.PROXY_IDPS, JSON.stringify(testProxyIdps));
         }}    }
);
start_stop.addStartupBatches(suite);
suite.addBatch( {
      with PROXY_IDPS set, then GET /.well-known/browserid: {
         topic:wsapi.get("/.well-known/browserid"), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }} , 
      with PROXY_IDPS set, then GET /.well-known/browserid?domain=: {
         topic:wsapi.get("/.well-known/browserid?domain="), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }} , 
      with PROXY_IDPS set, then GET /.well-known/browserid?domain=unknown.com: {
         topic:wsapi.get("/.well-known/browserid?domain=unknown.com"), 
         returns 200 with 'public-key', valid JSON and Content-type:function(err, r)  {
            checkDefaultResponse(err, r);
         }} , 
      with PROXY_IDPS set, then GET /.well-known/browserid?domain=example.com: {
         topic:wsapi.get("/.well-known/browserid?domain=example.com"), 
         returns 200, has 'authority', valid JSON and Content-type:function(err, r)  {
            assert.equal(r.code, 200);
            assert.equal(r.headers["content-type"].indexOf("application/json"), 0);
            var body = JSON.parse(r.body);
            assert.equal(Object.keys(body).length, 1);
            assert.equal(Object.keys(body)[0], "authority");
            assert.equal(body.authority, testProxyIdps[mappedDomain]);
         }}    }
);
start_stop.addShutdownBatches(suite);
if (process.argv[1] === __filename) suite.run() else suite.export(module)