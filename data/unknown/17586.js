! ✖ / env;
node;
const;
wcli = require("../lib/wsapi_client.js"), jwcrypto = require("jwcrypto");
require("jwcrypto/lib/algs/ds");
var argv = require("optimist").usage("Given a username, password, and audience, get an assertion.
Usage: $0").alias("h", "help").describe("h", "display this usage message").alias("s", "server").describe("s", "persona server url").default("s", "https://login.persona.org").alias("a", "audience").describe("a", "the domain to which the assertion should be targeted").default("a", "example.com").alias("e", "email").describe("e", "email address").demand("e").alias("p", "password").describe("p", "persona password associated with email address").demand("p");
var args = argv.argv;
var ctx =  {} ;
if (args.h)  {
   argv.showHelp();
   process.exit(0);
}
var serverURL =  {
   browserid:args.s}
;
wcli.post(serverURL, "/wsapi/authenticate_user", ctx,  {
      email:args.e, 
      pass:args.p, 
      ephemeral:false   }, 
   function(err, response)  {
      function handleErr(err)  {
         process.stderr.write("error authenticating: " + err + "
");
         process.exit(1);
      }
;
      if (err) handleErr(err)      response = JSON.parse(response.body);
      if (! response.success) handleErr(response.reason)      jwcrypto.generateKeypair( {
            algorithm:"DS", 
            keysize:256         }, 
         function(err, kp)  {
            if (err)  {
               process.stderr.write("error generating keypair: " + err + "
");
               process.exit(1);
            }
            wcli.post(serverURL, "/wsapi/cert_key", ctx,  {
                  email:args.e, 
                  pubkey:kp.publicKey.serialize(), 
                  ephemeral:false               }, 
               function(err, r)  {
                  if (err)  {
                     process.stderr.write("error certifying key: " + err + "
");
                     process.exit(1);
                  }
                  var cert = r.body.toString();
                  var expirationDate = new Date(new Date().getTime() + 2 * 60 * 1000);
                  jwcrypto.assertion.sign( {} ,  {
                        audience:args.a, 
                        expiresAt:expirationDate                     }, 
                     kp.secretKey, function(err, assertion)  {
                        if (err) return self.callback(err)                        var b = jwcrypto.cert.bundle([cert], assertion);
                        console.log(b);
                     }
                  );
               }
            );
         }
      );
   }
);
