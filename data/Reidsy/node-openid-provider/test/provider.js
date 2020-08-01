var assert = require('assert');
var crypto = require('crypto');
var urllib = require('url');
var OpenIDProvider = require('../lib/Provider.js');
var Response = require('../lib/Response.js');

suite("OpenIDProvider tests", function() {

  suite("OpenID mode tests", function() {
    var openid_prime;
    var openid_prime_b64;
    var openid_dh_private;
    var openid_dh_private_b64;
    var openid_dh_public;
    var openid_dh_public_b64;

    setup(function() {
      openid_prime = 'DCF93A0B883972EC0E19989AC5A2CE310E1D37717E8D9571BB7623731866E61E' +
              'F75A2E27898B057F9891C2E27A639C3F29B60814581CD3B2CA3986D268370557' +
              '7D45C2E7E52DC81C7A171876E5CEA74B1448BFDFAF18828EFD2519F14E45E382' +
              '6634AF1949E5B535CC829A483B8A76223E5D490A257F05BDFF16F2FB22C583AB';
      openid_prime_b64 = new Buffer(openid_prime, 'hex').toString('base64');
      openid_dh_private = '6cd50cf04fe124c1bba5f6ff40a1ce5fd8b671bf9cd09f1f20f4c20c4bcf8bd1' +
                '335bbaea66e0514d1c6e0eec6df5486cb06fa64eb400aa115eafffed43e2afc6' +
                '2db9ed83410336a0295a66431449a263388c5a0dd3aecf64a80d983dfb5df273' +
                '8a94c0c37cfd896ef48a9f1d552d50c9545459256498c5b4f052bbecf0b2b1f2';
      openid_dh_private_b64 = new Buffer(openid_dh_private, 'hex').toString('base64');
      openid_dh_public = '232fa0b4cec30aa93b7a90ae8172da84bf07cf8386c958316af9b01a71a6013f' +
                '966ab204f6c42f59f3e480320a87ce4b3e957eab92a1f7ff56fa28055c1b6a68' +
                '9b6a116f78fbb78463cb2ff7972ae3e1d81b8900f963b4beafc314a63043db59' +
                '154fe39299ca7e060b5173b5279ce21c994be8d222ac75b5115b6397797c1e51';
      openid_dh_public_b64 = new Buffer(openid_dh_public, 'hex').toString('base64');
    });

    test("Create an SHA256 association", function() {
      var oidp = new OpenIDProvider('http://example.com/');

      var assoc_form = oidp.associate({
        dh_consumer_public: openid_dh_public_b64,
        assoc_type: 'HMAC-SHA256',
        session_type: 'DH-SHA256'
        //dh_modulus: openid_prime_b64
      });
      var res = Response.fromForm(assoc_form);

      assert.equal(res.get("ns"), "http://specs.openid.net/auth/2.0");
      assert.equal(res.get("assoc_type"), "HMAC-SHA256");
      assert.equal(res.get("session_type"), "DH-SHA256");
      var dh_server_public = new Buffer(res.get("dh_server_public"), 'base64');
      assert.equal(dh_server_public.length, 128);
      var mac_key = new Buffer(res.get("enc_mac_key"), 'base64');
      assert.equal(mac_key.length, 32);
      assert.notEqual(res.get("assoc_handle"), null);
    });

    test("Create an SHA1 association", function() {
      var oidp = new OpenIDProvider("http://example.com");

      var assoc_form = oidp.associate({
        dh_consumer_public: openid_dh_public_b64,
        assoc_type: "HMAC-SHA1",
        session_type: "DH-SHA1",
      });
      var res = Response.fromForm(assoc_form);

      assert.equal(res.get("ns"), "http://specs.openid.net/auth/2.0");
      assert.equal(res.get("assoc_type"), "HMAC-SHA1");
      assert.equal(res.get("session_type"), "DH-SHA1");
      var dh_server_public = new Buffer(res.get("dh_server_public"), 'base64');
      assert.equal(dh_server_public.length, 128);
      var mac_key = new Buffer(res.get("enc_mac_key"), 'base64');
      assert.equal(mac_key.length, 20);
      assert.notEqual(res.get("assoc_handle"), null);
    });

    test("checkid_setup with an association", function() {
      var oidp = new OpenIDProvider("http://example.com/");

      var association = oidp.associations.createWithHash();
      var url = oidp.checkid_setup_complete({
        return_to: "http://mysite.com/return?parameter=fancy",
        assoc_handle: association.handle
      }, "chris");
      var parsed_url = urllib.parse(url, true);

      assert.equal(parsed_url.protocol, "http:");
      assert.equal(parsed_url.hostname, "mysite.com");
      assert.equal(parsed_url.pathname, "/return");
      assert.equal(parsed_url.query["parameter"], "fancy");
      assert.equal(parsed_url.query["openid.ns"], "http://specs.openid.net/auth/2.0");
      assert.equal(parsed_url.query["openid.mode"], "id_res");
      assert.equal(parsed_url.query["openid.op_endpoint"], "http://example.com/");
      assert.equal(parsed_url.query["openid.claimed_id"], "chris");
      assert.equal(parsed_url.query["openid.identity"], "chris");
      assert.equal(parsed_url.query["openid.return_to"], "http://mysite.com/return?parameter=fancy");
      assert.ok("openid.response_nonce" in parsed_url.query);
      assert.equal(parsed_url.query["openid.assoc_handle"], association.handle);
      assert.equal(parsed_url.query["openid.signed"], "ns,mode,op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle");
      assert.ok("openid.sig" in parsed_url.query); //can't check if the sig matches due to response_nonce
    });

    test("checkid_setup without an association", function() {
      var oidp = new OpenIDProvider("http://example.com/");

      var url = oidp.checkid_setup_complete({
        return_to: "http://mysite.com/return?parameter=fancy"
      }, "chris");
      var parsed_url = urllib.parse(url, true);

      assert.equal(parsed_url.protocol, "http:");
      assert.equal(parsed_url.hostname, "mysite.com");
      assert.equal(parsed_url.pathname, "/return");
      assert.equal(parsed_url.query["parameter"], "fancy");
      assert.equal(parsed_url.query["openid.ns"], "http://specs.openid.net/auth/2.0");
      assert.equal(parsed_url.query["openid.mode"], "id_res");
      assert.equal(parsed_url.query["openid.op_endpoint"], "http://example.com/");
      assert.equal(parsed_url.query["openid.claimed_id"], "chris");
      assert.equal(parsed_url.query["openid.identity"], "chris");
      assert.equal(parsed_url.query["openid.return_to"], "http://mysite.com/return?parameter=fancy");
      assert.ok("openid.assoc_handle" in parsed_url.query);
      assert.equal(parsed_url.query["openid.signed"], "ns,mode,op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle");
      assert.ok("openid.sig" in parsed_url.query);
    });

    test("Check authentication", function() {
      /** Options
       * assoc_handle
       * signed
       * sig
       * [all options in signed]
       */
      var oidp = new OpenIDProvider("http://example.com/");
      var association = oidp.associations.createWithHash();

      var url = oidp.checkid_setup_complete({
        return_to: "http://domain.com/return",
        assoc_handle: association.handle
      }, "unique_user");
      var parsed_url = urllib.parse(url, true);

      //get signed options from url
      var options = {}
      var signed_fields = parsed_url.query["openid.signed"].split(",");
      for (var key in signed_fields) {
        options[signed_fields[key]] = parsed_url.query["openid."+signed_fields[key]];
      }

      //add the extra information
      options.assoc_handle = association.handle;
      options.signed = parsed_url.query["openid.signed"];
      options.sig = parsed_url.query["openid.sig"];

      //perform openid authentication check and then confirm the output is correct
      var validation_form = oidp.check_authentication(options);
      var response = Response.fromForm(validation_form);
      assert.equal(response.get("ns"), "http://specs.openid.net/auth/2.0");
      assert.equal(response.get("is_valid"), "true");
    });

    test("Check authentication failure", function() {
      /** Options
      * assoc_handle
      * signed
      * sig
      * [all options in signed]
      */
      var oidp = new OpenIDProvider("http://example.com/");
      var association = oidp.associations.createWithHash();

      var url = oidp.checkid_setup_complete({
        return_to: "http://domain.com/return",
        assoc_handle: association.handle
      }, "unique_user");
      var parsed_url = urllib.parse(url, true);

      //get signed options from url
      var options = {}
      var signed_fields = parsed_url.query["openid.signed"].split(",");
      for (var key in signed_fields) {
        options[signed_fields[key]] = parsed_url.query["openid."+signed_fields[key]];
      }

      //add the extra information
      options.assoc_handle = association.handle;
      options.signed = parsed_url.query["openid.signed"];
      options.sig = "THIS_IS_NOT_A_VALID_SIGNATURE";

      //perform openid authentication check and then confirm the output is correct
      var validation_form = oidp.check_authentication(options);
      var response = Response.fromForm(validation_form);
      assert.equal(response.get("ns"), "http://specs.openid.net/auth/2.0");
      assert.equal(response.get("is_valid"), "false");
    });

    test("Generate error response", function() {
      var provider = new OpenIDProvider("http://oidp.com");
      var options = {
        return_to: "http://example.com/foo"
      };
      var parsedUrl = urllib.parse(provider.error(options, "An error."), true);

      assert.equal(parsedUrl.query["openid.mode"], "error", "Incorrect mode.");
      assert.equal(parsedUrl.query["openid.ns"], "http://specs.openid.net/auth/2.0", "Incorrect namespace.");
      assert.equal(parsedUrl.query["openid.error"], "An error.", "Incorrect message.");
      assert.equal(parsedUrl.hostname, "example.com", "Incorrect hostname.");
      assert.equal(parsedUrl.pathname, "/foo", "Incorrect path.");
    });

  });

  suite("Middleware tests", function() {
    //use supertest to find out if these functions work when sending raw http requests
  });
});
