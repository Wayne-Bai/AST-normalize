var R = require('ramda');
var assert = require('assert');
var types = require('./types');
var jsv = require('jsverify');

var Maybe = require('..').Maybe;

var MaybeGen = R.curry(function(a, n) {
    return n % 2 == 0 ? Maybe.Just(a.generator(n)) : Maybe.Nothing();
});

var MaybeShow = R.curry(function(a, m) {
    return (Maybe.isJust(m)) ?
        "Just(" + a.show(m.value) + ")" :
        "Nothing";
});

var MaybeShrink = R.curry(function(a, m) {
    return (Maybe.isJust(m)) ?
        [Maybe.Nothing()].concat(a.shrink(m.value).map(Maybe.Just)) :
        [];
});

var MaybeArb = function(a) {
    return {
        generator: jsv.generator.bless(MaybeGen(a)),
        show: MaybeShow(a),
        shrink: jsv.shrink.bless(MaybeShrink(a))
    };
};

describe('Maybe', function() {
    var m = MaybeArb(jsv.nat);
    var env = {Maybe: MaybeArb};
    var appF = 'Maybe (nat -> nat)';
    var appN = 'Maybe nat';

    function mult(a) {
        return function(b) { return a * b; };
    }

    function add(a) {
        return function(b) { return a + b; };
    }

    it('has an arbitrary', function() {
        var arb = jsv.forall(m, function(m) {
            return m instanceof Maybe;
        });
        jsv.assert(arb);
    });

    it('is a Functor', function() {
        var fTest = types.functor;

        jsv.assert(jsv.forall(m, fTest.iface));
        jsv.assert(jsv.forall(m, fTest.id));
        jsv.assert(jsv.forall(m, 'nat -> nat', 'nat -> nat', fTest.compose));
    });

    it('is an Apply', function() {
        var aTest = types.apply;

        jsv.assert(jsv.forall(m, aTest.iface));
        jsv.assert(jsv.forall(appF, appF, appN, env, aTest.compose));
    });

    it('is an Applicative', function() {
        var aTest = types.applicative;

        jsv.assert(jsv.forall(m, aTest.iface));
        jsv.assert(jsv.forall(appN, appN, env, aTest.id));
        jsv.assert(jsv.forall(appN, 'nat -> nat', 'nat', env, aTest.homomorphic));
        jsv.assert(jsv.forall(appN, appF, 'nat', env, aTest.interchange));
    });

    it('is a Chain', function() {
        var cTest = types.chain;
        var f = 'nat -> Maybe nat'

        jsv.assert(jsv.forall(m, cTest.iface));
        jsv.assert(jsv.forall(m, f, f, env, cTest.associative));
    });

    it('is a Monad', function() {
        var mTest = types.monad;

        jsv.assert(jsv.forall(m, mTest.iface));
    });

});

describe('Maybe usage', function() {

  describe('checking for Just | Nothing', function() {
    it('should allow the user to check if the instance is a Nothing', function() {
      assert.equal(true, Maybe(null).isNothing());
      assert.equal(false, Maybe(42).isNothing());
    });

    it('should allow the user to check if the instance is a Just', function() {
      assert.equal(true, Maybe(42).isJust());
      assert.equal(false, Maybe(null).isJust());
    });

    it('can check the type statically', function() {
        var nada = Maybe.Nothing();
        var just1 = Maybe.Just(1);
        assert.equal(Maybe.isJust(nada), false);
        assert.equal(Maybe.isNothing(nada), true);
        assert.equal(Maybe.isJust(just1), true);
        assert.equal(Maybe.isNothing(just1), false);
    });
  });

  describe('#getOrElse', function() {

    it('should return the contained value for if the instance is a Just', function() {
      assert.equal(42, Maybe(42).getOrElse(24));
    });

    it('should return the input value if the instance is a Nothing', function() {
      assert.equal(24, Maybe(null).getOrElse(24));
    });

  });

});
