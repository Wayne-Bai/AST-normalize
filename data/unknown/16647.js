! ✖ / env;
node;
const;
wcli = require("../lib/wsapi_client.js"), jwcrypto = require("jwcrypto"), assert = require("assert"), https = require("https"), querystring = require("querystring"), urlparse = require("urlparse");
require("jwcrypto/lib/algs/ds");
var argv = require("optimist").usage("Given a username, password, and audience, get an assertion.
Usage: $0").alias("h", "help").describe("h", "display this usage message").alias("s", "server").describe("s", "persona server url").default("s", "https://login.anosrep.org").alias("v", "verifier").describe("v", "persona verifier url").default("v", "https://verifier.login.anosrep.org").alias("a", "audience").describe("a", "the domain to which the assertion should be targeted").default("a", "http://testrp.example.com").alias("e", "email").describe("e", "email address").demand("e").alias("p", "password").describe("p", "persona password associated with email address").demand("p");
var args = argv.argv;
if (args.h)  {
   argv.showHelp();
   process.exit(0);
}
var ctx =  {} ;
var serverURL =  {
   browserid:args.s}
;
function handleErr(err, msg)  {
   msg = msg ? " - " + msg : "";
   process.stderr.write(err + msg + "
");
   process.exit(1);
}
;
wcli.post(serverURL, "/wsapi/authenticate_user", ctx,  {
      email:args.e, 
      pass:args.p, 
      ephemeral:false   }, 
   function(err, response)  {
      if (err) return handleErr(err)      response = JSON.parse(response.body);
      if (! response.success) return handleErr(response.reason)      jwcrypto.generateKeypair( {
            algorithm:"DS", 
            keysize:128         }, 
         function(err, kp)  {
            if (err) return handleErr(err)            wcli.post(serverURL, "/wsapi/cert_key", ctx,  {
                  email:args.e, 
                  pubkey:kp.publicKey.serialize(), 
                  ephemeral:false               }, 
               function(err, r)  {
                  if (err) return handleErr(err)                  var cert = r.body.toString();
                  var expirationDate = new Date(new Date().getTime() + 2 * 60 * 1000);
                  var params =  {
                     audience:args.a, 
                     expiresAt:expirationDate                  }
;
                  jwcrypto.assertion.sign( {} , params, kp.secretKey, function(err, assertion)  {
                        if (err) return handleErr(err)                        var bundle = jwcrypto.cert.bundle([cert], assertion);
                        postToVerifier(args.a, bundle, args.v, function(err, res)  {
                              if (err)  {
                                 console.log(err);
                                 process.exit(1);
                              }
                              console.log("Received a response from the verifier");
                              console.dir(res);
                              assert.strictEqual(res.status, "okay", "status is okay");
                              assert.strictEqual(res.email, args.e, "email matches");
                              assert.strictEqual(res.audience, args.a, "audience matches");
                              assert.strictEqual(res.issuer, urlparse(args.s).host, "issuer matches");
                              assert.ok(res.expires.toString().match(/^\d{13}$/), "expires is epoch");
                              assert.ok(res.expires - Date.now() > 0, "expires in the future");
                              console.log("verification was successful");
                           }
                        );
                     }
                  );
               }
            );
         }
      );
   }
);
function postToVerifier(audience, bundle, verifier, callback)  {
   var hostname = urlparse(verifier).host;
   var postBody = querystring.stringify( {
         audience:audience, 
         assertion:bundle      }
   );
   var options =  {
      hostname:hostname, 
      path:"/verify", 
      method:"POST", 
      rejectUnauthorized:true, 
      agent:false, 
      headers: {
         content-type:"application/x-www-form-urlencoded", 
         content-length:Buffer.byteLength(postBody)      }} ;
   var req = https.request(options, function(res)  {
         if (res.statusCode !== 200)  {
            var msg = "response is not 200 OK " + res.statusCode;
            return callback(msg);
         }
         var body = "";
         res.setEncoding("utf8");
         res.on("data", function(chunk)  {
               body = chunk;
            }
         );
         res.on("end", function()  {
               try {
                  body = JSON.parse(body);
               }
               catch (e) {
                  return callback(e);
               }
               return callback(null, body);
            }
         );
      }
   );
   req.on("error", function(e)  {
         return callback(e);
      }
   );
   req.write(postBody);
   req.end();
}
;
