describe('ExpertsInside.SharePoint', function() {
  describe('Service: $spClientContext', function() {
    var $spClientContext,
        ClientContextMock,
        appWebUrl;

    beforeEach(module('ExpertsInside.SharePoint.JSOM'));
    beforeEach(inject(function($window) {
      ClientContextMock = sinon.spy();
      ClientContextMock.prototype.load = sinon.spy();
      ClientContextMock.prototype.executeQueryAsync = sinon.spy();
      ClientContextMock.get_current = sinon.stub();

      $window.SP = {
        ClientContext: ClientContextMock
      };

      sinon.stub(ShareCoffee.Commons, 'getAppWebUrl')
        .returns(appWebUrl = 'https://test.sharepoint.com/sites/test/app');
    }));
    beforeEach(inject(function(_$spClientContext_) {
      $spClientContext = _$spClientContext_;
    }));
    afterEach(function() {
      ShareCoffee.Commons.getAppWebUrl.restore();
    });

    describe('.create()', function() {
      it('creates a SharePoint client context for the app', function() {
        $spClientContext.create(ShareCoffee.Commons.getAppWebUrl());

        expect(ClientContextMock).to.have.been.calledWith(appWebUrl);
      });

      it('empowers the created context', function() {
        var ctx = $spClientContext.create();

        expect(ctx.$$empowered).to.be.true;
      });
    });

    describe('.current()', function() {
      it('returns the current SP.ClientContext', function() {
        var current = {};
        ClientContextMock.get_current.returns(current);

        var ctx = $spClientContext.current();

        expect(ctx).to.have.be.eql(current);
      });

      it('empowers the current context', function() {
        var ctx = $spClientContext.current();

        expect(ctx.$$empowered).to.be.true;
      });
    });

    describe('the empowered context', function() {
      var ctx;

      beforeEach(function() {
        ctx = $spClientContext.create();
      });

      describe('#$load', function() {
        it('registers an awaiting load', inject(function($q) {
          var objToLoad = {};

          ctx.$load(objToLoad);

          expect(ctx.$$awaitingLoads).to.have.lengthOf(1);
          expect(ctx.$$awaitingLoads[0].args).to.be.eql([objToLoad]);
          expect(ctx.$$awaitingLoads[0].deferred).to.have.property('promise');
        }));

        it('returns the promise of the registered deferred', function() {
          var promise = ctx.$load();

          expect(promise).to.be.equal(ctx.$$awaitingLoads[0].deferred.promise);
        });
      });

      describe('#$executeQueryAsync', function() {
        var $rootScope, $q;

        beforeEach(inject(function(_$rootScope_, _$q_) {
          $rootScope = _$rootScope_;
          $q = _$q_;
        }));

        it('returns a promise', function() {
          var promise = ctx.$executeQueryAsync();

          expect(promise).to.have.property('then');
        });

        describe('on success', function() {
          it('resolves the returned promise with the context', function(done) {
            var promise = ctx.$executeQueryAsync();
            var successCallback = ctx.executeQueryAsync.args[0][0];

            promise.then(function(_ctx) {
              expect(_ctx).to.be.equal(ctx);
              done();
            });

            successCallback();
            $rootScope.$apply();
          });

          it('resolves all load promises with the loaded objects', function(done) {
            var loadPromises = [
              ctx.$load(0),
              ctx.$load(1)
            ];
            var promise = ctx.$executeQueryAsync();
            var successCallback = ctx.executeQueryAsync.args[0][0];

            $q.all(loadPromises).then(function(resolvedWith) {
              expect(resolvedWith).to.be.eql([0,1]);
              done();
            });

            successCallback();
            $rootScope.$apply();
          });

          it('clears to awaiting loads', function() {
            ctx.$load(0);
            var promise = ctx.$executeQueryAsync();
            var successCallback = ctx.executeQueryAsync.args[0][0];

            successCallback();

            expect(ctx.$$awaitingLoads).to.have.lengthOf(0);
          });
        });

        describe('on error', function() {
          var err = new Error();

          it('rejects the returned promise with the error', function(done) {
            var promise = ctx.$executeQueryAsync();
            var errorCallback = ctx.executeQueryAsync.args[0][1];

            promise.catch(function(_err) {
              expect(_err).to.be.equal(err);
              done();
            });

            errorCallback(err);
            $rootScope.$apply();
          });

          it('rejects all load promises with the error', function(done) {
            var loadPromises = [
              ctx.$load(),
              ctx.$load()
            ];
            var promise = ctx.$executeQueryAsync();
            var errorCallback = ctx.executeQueryAsync.args[0][1];

            loadPromises[0].catch(function(_err) {
              expect(_err).to.be.eql(err);
            });
            loadPromises[1].catch(function(_err) {
              expect(_err).to.be.eql(err);
            });
            $q.all(loadPromises).catch(function() {
              done();
            });

            errorCallback(err);
            $rootScope.$apply();
          });

          it('clears to awaiting loads', function() {
            ctx.$load(0);
            var promise = ctx.$executeQueryAsync();
            var errorCallback = ctx.executeQueryAsync.args[0][1];

            errorCallback();

            expect(ctx.$$awaitingLoads).to.have.lengthOf(0);
          });
        });
      });
    });
  });
});
