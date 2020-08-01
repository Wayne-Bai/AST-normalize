define([ "public/assets/javascripts/lib/utils/debounce.js" ], function(debounce) {

  describe("Debounce", function() {

    var interval;

    afterEach(function() {
      clearInterval(interval);
    });

    it("Should return a function", function() {
      var result = debounce(new Function, 200)
      expect(typeof result).toBe("function");
    });

    describe("Execute the callback after the given wait", function() {
      var instance,
          callbackInc = 0;

      beforeEach(function(done) {
        instance = debounce(function() {
          callbackInc++;
          done();
        }, 10);

        instance();
      });

      it("has triggered the callback", function() {
        expect(callbackInc).toBe(1);
      });
    });

    describe("Do not execute the given callback when bounced", function() {
      var instance,
          bounceInc = 0,
          callbackInc = 0;

      beforeEach(function(done) {
        instance = debounce(function() {
          callbackInc++;
        }, 20);

        function bounce() {
          if (bounceInc == 4) return done();

          bounceInc++;
          instance();
        }

        interval = setInterval(bounce, 10);
      });

      it("has not triggered the callback", function() {
        expect(callbackInc).toBe(0);
      });

    });

    describe("Applying callback with arguments", function() {
      var instance, spy;

      beforeEach(function(done) {
        spy = jasmine.createSpy();

        instance = debounce(function() {
          spy.apply(this, arguments);
          done();
        }, 10);

        instance("foo", "bar");
      });

      it("has triggered the callback with arguments applied", function() {
        expect(spy).toHaveBeenCalledWith("foo", "bar");
      });

    });

    describe("Applying callback with a given scope", function() {
      var instance, callback, scope;

      beforeEach(function(done) {
        scope = {
          prop: "change me"
        };

        callback = function(changeTo) {
          this.prop = changeTo;
          done();
        };

        instance = debounce(callback, 10, scope);

        instance("changed");
      });

      it("has changed the value within the given scope", function() {
        expect(scope.prop).toBe("changed");
      });

    });

  });

});
