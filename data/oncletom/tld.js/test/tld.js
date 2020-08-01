"use strict";

/* global suite, test */

var tld = require('../index.js');
var tldLib = require('../lib/tld.js');
var expect = require('expect.js');

describe('tld.js', function () {
  describe('Constructor', function () {
    it('should have have rules already loaded', function () {
      expect(tld.rules).to.be.an('object');
      expect(tld.rules).not.to.be.empty();
    });
  });

  describe('isValid method', function () {
    it('should detect valid hostname', function () {
      expect(tld.isValid('')).to.be(false);
      expect(tld.isValid('google.com')).to.be(true);
      expect(tld.isValid('miam.google.com')).to.be(true);
      expect(tld.isValid('miam.miam.google.com')).to.be(true);
    });

    it('should detect invalid hostname', function () {
      expect(tld.isValid(null)).to.be(false);
      expect(tld.isValid(undefined)).to.be(false);
      expect(tld.isValid(0)).to.be(false);
      expect(tld.isValid([])).to.be(false);
      expect(tld.isValid({})).to.be(false);
      expect(tld.isValid(function () {
      })).to.be(false);
    });

    it('should be falsy on invalid domain syntax', function () {
      expect(tld.isValid('.google.com')).to.be(false);
      expect(tld.isValid('.com')).to.be(false);
    });

    it('should be falsy on dotless hostname', function () {
      expect(tld.isValid('localhost')).to.be(false);
      expect(tld.isValid('google')).to.be(false);
    });
  });

  describe('getDomain method', function () {
    it('should return the expected domain from a simple string', function () {
      expect(tld.getDomain('google.com')).to.equal('google.com');
      expect(tld.getDomain('t.co')).to.equal('t.co');
      expect(tld.getDomain('  GOOGLE.COM   ')).to.equal('google.com');
      expect(tld.getDomain('    t.CO    ')).to.equal('t.co');
    });

    it('should return the relevant domain of a two levels domain', function () {
      expect(tld.getDomain('google.co.uk')).to.equal('google.co.uk');
    });

    it('should return the relevant domain from a subdomain string', function () {
      expect(tld.getDomain('fr.google.com')).to.equal('google.com');
      expect(tld.getDomain('foo.google.co.uk')).to.equal('google.co.uk');
      expect(tld.getDomain('fr.t.co')).to.equal('t.co');
    });

    //@see https://github.com/oncletom/tld.js/issues/33
    it('should not break on specific RegExp characters', function () {
      expect(tld.getDomain('www.weir)domain.com')).to.equal('weir)domain.com');
    });

    it('should provide consistent results', function(){
      expect(tld.getDomain('www.bl.uk')).to.equal('bl.uk');
      expect(tld.getDomain('www.majestic12.co.uk')).to.equal('majestic12.co.uk');
    });

    //@see https://github.com/oncletom/tld.js/issues/25
    //@see https://github.com/oncletom/tld.js/issues/30
    it('existing rule constraint', function () {
      expect(tld.getDomain('s3.amazonaws.com')).to.be(null);
      expect(tld.getDomain('blogspot.co.uk')).to.be(null);
    });

    it('should return nytimes.com even in a whole valid', function(){
      expect(tld.getDomain('http://www.nytimes.com/')).to.be('nytimes.com');
    });
  });

  describe('tldExists method', function () {
    it('should be truthy on existing TLD', function () {
      expect(tld.tldExists('com')).to.be(true);
      expect(tld.tldExists('example.com')).to.be(true);
      expect(tld.tldExists('co.uk')).to.be(true);
      expect(tld.tldExists('amazon.co.uk')).to.be(true);
      expect(tld.tldExists('台灣')).to.be(true);
      expect(tld.tldExists('台灣.台灣')).to.be(true);
    });

    it('should be falsy on unexisting TLD', function () {
      expect(tld.tldExists('con')).to.be(false);
      expect(tld.tldExists('example.con')).to.be(false);
      expect(tld.tldExists('go')).to.be(false);
      expect(tld.tldExists('チーズ')).to.be(false);
    });

    it('should be truthy on complex TLD which cannot be verified as long as the gTLD exists', function(){
      expect(tld.tldExists('uk.com')).to.be(true);
    });
  });

  describe('#getPublicSuffix', function () {
    it('should return co.uk if google.co.uk', function () {
      expect(tld.getPublicSuffix('google.co.uk')).to.be('co.uk');
    });

    it('should return www.ck if www.www.ck', function () {
      expect(tld.getPublicSuffix('www.www.ck')).to.be('www.ck');
    });

    //@see https://github.com/oncletom/tld.js/issues/30
    it('should return s3.amazonaws.com if s3.amazonaws.com', function () {
      expect(tld.getPublicSuffix('s3.amazonaws.com')).to.be('s3.amazonaws.com');
    });

    it('should return s3.amazonaws.com if www.s3.amazonaws.com', function () {
      expect(tld.getPublicSuffix('s3.amazonaws.com')).to.be('s3.amazonaws.com');
    });

    it('should directly return the suffix if it matches a rule key', function(){
      expect(tld.getPublicSuffix('youtube')).to.be('youtube');
    });

    it('should return the suffix if a rule exists that has no exceptions', function(){
      expect(tld.rules.eu).to.be('');
      expect(tld.getPublicSuffix('microsoft.eu')).to.be('eu');
    });

    it('should return null if the publicsuffix does not exist', function(){
      expect(tld.getPublicSuffix('www.freedom.nsa')).to.be(null);
    });
  });

  describe('cleanHostValue', function(){
    it('should return a valid hostname as is', function(){
      expect(tldLib.cleanHostValue(' example.CO.uk ')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less URL', function(){
      expect(tldLib.cleanHostValue('example.co.uk/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + port URL', function(){
      expect(tldLib.cleanHostValue('example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication URL', function(){
      expect(tldLib.cleanHostValue('user:password@example.co.uk/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless URL', function(){
      expect(tldLib.cleanHostValue('user@example.co.uk/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication + port URL', function(){
      expect(tldLib.cleanHostValue('user:password@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless + port URL', function(){
      expect(tldLib.cleanHostValue('user@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a user-password same-scheme URL', function(){
      expect(tldLib.cleanHostValue('//user:password@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a passwordless same-scheme URL', function(){
      expect(tldLib.cleanHostValue('//user@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a complex user-password scheme URL', function(){
      expect(tldLib.cleanHostValue('git+ssh://user:password@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a complex passwordless scheme URL', function(){
      expect(tldLib.cleanHostValue('git+ssh://user@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the initial value if it is not a valid hostname', function(){
      expect(tldLib.cleanHostValue(42)).to.equal('42');
    });

    it('should return www.nytimes.com even with an URL as a parameter', function(){
      expect(tldLib.cleanHostValue('http://www.nytimes.com/glogin?URI=http://www.notnytimes.com/2010/03/26/us/politics/26court.html&OQ=_rQ3D1Q26&OP=45263736Q2FKgi!KQ7Dr!K@@@Ko!fQ24KJg(Q3FQ5Cgg!Q60KQ60W.WKWQ22KQ60IKyQ3FKigQ24Q26!Q26(Q3FKQ60I(gyQ5C!Q2Ao!fQ24')).to.equal('www.nytimes.com');
    });
  });

  describe('getSubdomain method', function(){
    it('should return null if the domain cannot be found', function(){
      expect(tld.getSubdomain('localhost')).to.equal(null);
    });

    it('should return the relevant subdomain of a hostname', function(){
      expect(tld.getSubdomain('google.com')).to.equal('');
      expect(tld.getSubdomain('fr.google.com')).to.equal('fr');
      expect(tld.getSubdomain('random.fr.google.com')).to.equal('random.fr');
      expect(tld.getSubdomain('my.custom.domain')).to.equal('my');
    });

    it('should return the relevant subdomain of a badly trimmed string', function(){
      expect(tld.getSubdomain(' google.COM')).to.equal('');
      expect(tld.getSubdomain('   fr.GOOGLE.COM ')).to.equal('fr');
      expect(tld.getSubdomain(' random.FR.google.com')).to.equal('random.fr');
    });

    it('should return the subdomain of a TLD + SLD hostname', function(){
      expect(tld.getSubdomain('love.fukushima.jp')).to.equal('');
      expect(tld.getSubdomain('i.love.fukushima.jp')).to.equal('i');
      expect(tld.getSubdomain('random.nuclear.strike.co.jp')).to.equal('random.nuclear');
    });

    it('should return the subdomain of a wildcard hostname', function(){
      expect(tld.getSubdomain('google.co.uk')).to.equal('');
      expect(tld.getSubdomain('fr.google.co.uk')).to.equal('fr');
      expect(tld.getSubdomain('random.fr.google.co.uk')).to.equal('random.fr');
    });

    //@see https://github.com/oncletom/tld.js/issues/25
    it.skip('should return the subdomain of reserved subdomains', function(){
      expect(tld.getSubdomain('blogspot.co.uk')).to.equal('');
      expect(tld.getSubdomain('emergency.blogspot.co.uk')).to.equal('emergency');
    });

    //@see https://github.com/oncletom/tld.js/issues/33
    it('should not break on specific RegExp characters', function () {
      expect(tld.getSubdomain('www.weir)domain.com')).to.equal('www');
    });

    //@see https://github.com/oncletom/tld.js/issues/35
    it('should provide consistent results', function(){
      expect(tld.getSubdomain('www.bl.uk')).to.equal('www');
      expect(tld.getSubdomain('www.majestic12.co.uk')).to.equal('www');
    });
  });
});
