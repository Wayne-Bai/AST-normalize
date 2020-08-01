describe('ExpertsInside.SharePoint', function() {
  describe('Service: $spRest', function() {
    var $spRest,
        apiRootUrl,
        requestDigest;

    beforeEach(module('ExpertsInside.SharePoint.Core'));
    beforeEach(inject(function(_$spRest_) {
      $spRest = _$spRest_;
      sinon.stub(ShareCoffee.Commons, 'getApiRootUrl')
        .returns(apiRootUrl = 'https://test.sharepoint.com/sites/test/app/_api/');
      sinon.stub(ShareCoffee.Commons, 'getFormDigest')
        .returns(requestDigest = 'requestDigest');
    }));
    afterEach(function() {
      ShareCoffee.Commons.getApiRootUrl.restore();
      ShareCoffee.Commons.getFormDigest.restore();
    });

    describe('.transformResponse(json)', function() {
      it('returns an empty object when *json* is undefined', function() {
        expect($spRest.transformResponse(undefined)).to.be.eql({});
      });
      it('returns an empty object when *json* is null', function() {
        expect($spRest.transformResponse(null)).to.be.eql({});
      });
      it('returns an empty object when *json* is blank', function() {
        expect($spRest.transformResponse('')).to.be.eql({});
      });
      it('returns the object when *json* contains a single object', function() {
        var obj = { foo: 'bar' };
        var json = angular.toJson({ d: obj });

        expect($spRest.transformResponse(json)).to.be.eql(obj);
      });
      it('returns an array when *json* contains multiple objects', function() {
        var arr = [1, 2];
        var json = angular.toJson({ d: { results: arr }});

        expect($spRest.transformResponse(json)).to.be.eql(arr);
      });
    });

    describe('.buildQueryString(url, params)', function() {
      it('returns an empty string when *params* is null', function() {
        expect($spRest.buildQueryString(null)).to.be.eql('');
      });

      it('returns an empty string when *params* is undefined', function() {
        expect($spRest.buildQueryString()).to.be.eql('');
      });

      it('creates a sorted query string from *params*', function() {
        expect($spRest.buildQueryString({foo: 1, bar: 2})).to.be.eql('bar=2&foo=1');
      });

      it('handles array values in *params*', function() {
        expect($spRest.buildQueryString({foo: [1,2,2]})).to.be.eql('foo=1,2');
      });
    });

    describe('.normalizeParams(params, whitelist)', function() {
      it('prefixes keys with $ when needed', function() {
        var normalized = $spRest.normalizeParams({
          select: 'bar'
        });

        expect(normalized).to.be.eql({ $select: 'bar' });
      });

      it('replaces empty params with undefined', function() {
        expect($spRest.normalizeParams({})).to.be.undefined;
      });

      it('replaces null params with undefined', function() {
        expect($spRest.normalizeParams(null)).to.be.undefined;
      });

      it('removes invalid param keys', function() {
        var normalized = $spRest.normalizeParams({foo: 'bar'}, ['$select']);

        expect(normalized).to.be.equal(undefined);
      });

      it('warns about invalid param keys', inject(function($log) {
        sinon.spy($log, 'warn');

        $spRest.normalizeParams({foo: 'bar'}, ['$select']);

        expect($log.warn).to.have.been.calledWith('Invalid param key detected: $foo');

        $log.warn.restore();
      }));

      it('does not modify the input', function() {
        var params = {select: 'foo'};

        $spRest.normalizeParams(params);

        expect(params).to.be.eql({select: 'foo'});
      });
    });

    describe('.appendQueryParameters(url, params)', function() {
      var url;
      beforeEach(function() { url = 'http://my.app'; });

      it('returns the original *url* when *params* leads to an empty query string', function () {
        expect($spRest.appendQueryParameters(url, {})).to.be.eql(url);
      });

      it('adds the query string to the url', function () {
        expect($spRest.appendQueryParameters(url, {$select: 'foo'})).to.be.eql(url + '?$select=foo');
      });

      it('correctly appends the query string to an url which already has one', function () {
        expect($spRest.appendQueryParameters(url + '?bar', {$select: 'foo'})).to.be.eql(url + '?bar&$select=foo');
      });
    });
  });
});
