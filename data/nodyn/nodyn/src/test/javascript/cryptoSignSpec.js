var helper = require('./specHelper');
var crypto = require('crypto');
var fs = require('fs');

describe("crypto Sign/Verify module", function() {

  it ('should allow signing and verification', function() {
    var message = "howdy, this is my message to sign";
    var privateKey = fs.readFileSync( './keys/RSA/key-rsa512-private.pem' );

    var sign = crypto.createSign('RSA-SHA256');
    sign.write( message );

    var signature = sign.sign(privateKey );

    var publicKey  = fs.readFileSync( 'keys/RSA/key-rsa512-public.pem' );

    var verify = crypto.createVerify('RSA-SHA256');
    verify.write(message);

    expect( verify.verify(publicKey, signature ) ).toBe( true );
    expect( verify.verify(publicKey, new Buffer( [ 2, 3, 4, 5, 5 ])) ).toBe( false );

    verify = crypto.createVerify('RSA-SHA256');
    verify.write( "a completely different message" );
    expect( verify.verify(publicKey, signature ) ).toBe( false );
  });

  it ('should allow signing and verification with passphrase-protected keys', function() {
  try {
    var message = "howdy, this is my message to sign";
    var privateKey = fs.readFileSync( './keys/RSA/passphrase-private.pem' );

    var sign = crypto.createSign('RSA-SHA256');
    sign.write( message );

    var signature = sign.sign({ key: privateKey, passphrase: 'tacos' });

    var publicKey  = fs.readFileSync( 'keys/RSA/passphrase-public.pem' );

    var verify = crypto.createVerify('RSA-SHA256');
    verify.write(message);

    expect( verify.verify(publicKey, signature ) ).toBe( true );
    expect( verify.verify(publicKey, new Buffer( [ 2, 3, 4, 5, 5 ])) ).toBe( false );

    verify = crypto.createVerify('RSA-SHA256');
    verify.write( "a completely different message" );
    expect( verify.verify(publicKey, signature ) ).toBe( false );
    } catch (err) {
      console.log( err );
      err.printStackTrace();
    }
  });

});
