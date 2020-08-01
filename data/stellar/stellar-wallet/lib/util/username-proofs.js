var Stex                     = require("stex");
var errors         = Stex.errors;
var Promise        = Stex.Promise;
var _              = Stex._;
var signedJson     = require("./signed-json");
var stellarAddress = require("./stellar-address");

var usernameProofs = module.exports;

usernameProofs.errors                         = {};
usernameProofs.errors.NonMatchingPublicKey    = Error.subclass("usernameProofs.NonMatchingPublicKey");
usernameProofs.errors.AddressNotFromPublicKey = Error.subclass("usernameProofs.AddressNotFromPublicKey");
usernameProofs.errors.InvalidClaim            = Error.subclass("usernameProofs.InvalidClaim");

/**
 * Validates the provided username proof object
 * @param  {string} accountPublicKey base64 encoded string of the public key t validate the proof against
 * @param  {object} proofObject      [description]
 * @return {Promise}                 A promise that resolves if the claim is valid
 */
usernameProofs.validate = function(accountPublicKey, proofObject) {
  return Promise.bind(proofObject)
    .then(function() {
      if(accountPublicKey !== this.publicKey) {
        throw new usernameProofs.errors.NonMatchingPublicKey();
      }
    })
    .then(function() {
      return signedJson.read(this.claim, this.signature, accountPublicKey);
    })
    .tap(function(proof) {
      var generatedAddress = stellarAddress.addressFromPublicKey(accountPublicKey);

      if(generatedAddress !== proof.address) {
        throw new usernameProofs.errors.AddressNotFromPublicKey();
      }
    })
    .tap(function(proof) {
      var usernameWithoutDomain = stex.fbgive.usernameWithoutDomain(proof.username);

      return stex.fbgive.post("/admin/getAddress", {username: usernameWithoutDomain})
        .then(function(result) {
          if(result.address !== proof.address) {
            throw new usernameProofs.errors.InvalidClaim();
          }
        });
    });
};
