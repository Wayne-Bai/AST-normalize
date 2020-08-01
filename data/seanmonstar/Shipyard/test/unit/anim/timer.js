var Timer = require('../../../lib/shipyard/anim/Timer'),
    Spy = require('../../testigo/lib/spy').Spy,
    timer = require('../../../lib/shipyard/test/timer');

module.exports = {
    'Timer': function(it, setup) {

        var clock;
        setup('beforeEach', function() {
            clock = timer.useFakeTimers();
        });

        setup('afterEach', function() {
            clock.restore();
        });

        it('should set the computed value', function(expect) {

            var fx = new Timer({
                duration: 100
            });

            fx.set = function(x) {
                this.foo = x;
            };
            fx.start(0, 10);

            clock.tick(200);
            expect(fx.foo).toEqual(10);

        });
        
        it('should cancel', function(expect) {

            var onCancel = new Spy();

            var fx = new Timer({
                onCancel: onCancel
            });

            fx.start();

            expect(onCancel.getCallCount()).toBe(0);

            fx.cancel();

            expect(onCancel.getCallCount()).toBe(1);

        });

        it('should pause and resume', function(expect) {

            var fx = new Timer({
                duration: 200
            });
            fx.set = function(x) { this.foo = x; };
            fx.start(0, 1);


            clock.tick(100);
            fx.pause();
            expect(fx.foo > 0).toBe(true);
            expect(fx.foo < 1).toBe(true);

            var value = fx.foo;

            clock.tick(100);
            expect(fx.foo).toBe(value);
            fx.resume();

            clock.tick(200);
            expect(fx.foo).toBe(1);

        });


    }
};
