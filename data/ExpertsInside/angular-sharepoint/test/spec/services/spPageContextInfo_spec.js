describe('ExpertsInside.SharePoint', function() {
  describe('Service: $spPageContextInfo', function() {
    var $spPageContextInfo;
    var _spPageContextInfo;

    beforeEach(module('ExpertsInside.SharePoint.Core'));
    beforeEach(inject(function($window) {
      _spPageContextInfo = $window._spPageContextInfo = {
        foo: 'bar'
      };
    }));
    beforeEach(inject(function(_$spPageContextInfo_) {
      $spPageContextInfo = _$spPageContextInfo_;
    }));

    it('is defined', function() {
      expect($spPageContextInfo).to.not.be.undefined;
    });

    it('is a copy of the global _spPageContextInfo object', function() {
      // Equal objects, but not equal object reference
      expect($spPageContextInfo).to.be.eql(_spPageContextInfo).and.not.be.equal(_spPageContextInfo);
    });

    it('watches for changes to the global _spPageContextInfo object and updates itself', function() {
      inject(function($rootScope) {
        _spPageContextInfo.foo = 'baz';
        $rootScope.$digest();

        expect($spPageContextInfo).to.have.property('foo', 'baz');
      });
    });
  });
});
