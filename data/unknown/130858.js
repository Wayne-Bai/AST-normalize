! ✖ / env;
node;
const;
jwk = require("jwcrypto/jwk"), child_process = require("child_process");
var keypair = jwk.KeyPair.generate("RS", 128);
child_process.exec("heroku config:add PUBLIC_KEY='" + keypair.publicKey.serialize() + "'", function(err, r)  {
      if (err) throw "can't set public key"      console.log("public key set");
      child_process.exec("heroku config:add PRIVATE_KEY='" + keypair.secretKey.serialize() + "'", function(err, r)  {
            if (err) throw "can't set private key"            console.log("private key set");
         }
      );
   }
);
