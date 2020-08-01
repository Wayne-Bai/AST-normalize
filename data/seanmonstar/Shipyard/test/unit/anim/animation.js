var Anim = require('../../../lib/shipyard/anim/Animation'),
    dom = require('../../../lib/shipyard/dom'),
    timer = require('../../../lib/shipyard/test/timer');

module.exports = {

    'Animation': function(it, setup) {

        var clock;
        setup('beforeEach', function() {
            clock = timer.useFakeTimers();
        });

        setup('afterEach', function() {
            clock.restore();
        });

        it('should tween a property', function(expect) {
            var el = new dom.Element('div');
            var anim = new Anim(el);

            anim.start('height', 10, 20);
            clock.tick(200);

            expect(parseInt(el.getStyle('height'), 10)).toBeGreaterThan(10);

            clock.tick(400);

            expect(el.getStyle('height')).toBe('20px');
        });

        it('should tween with a `from` value', function(expect) {
            var el = new dom.Element('div');
            el.setStyle('height', 5);

            var anim = new Anim(el);

            anim.start('height', 20);
            clock.tick(200);

            expect(parseInt(el.getStyle('height'), 10)).toBeGreaterThan(5);

            clock.tick(400);
            expect(el.getStyle('height')).toBe('20px');

        });

        it('should tween colors', function(expect) {
            var el = new dom.Element('div');
            el.setStyle('color', 'f00');

            var anim = new Anim(el);

            anim.start('color', '#0f0');
            clock.tick(200);

            expect(el.getStyle('color')).not.toBe('#ff0000');

            clock.tick(400);
            expect(el.getStyle('color')).toBe('#00ff00');
        });

        it('should be able to set property an construction', function(expect) {
            var el = new dom.Element('div');
            var anim = new Anim(el, {
                property: 'width'
            });

            anim.start(10);
            clock.tick(600);

            expect(el.getStyle('width')).toBe('10px');
        });

        it('should use units', function(expect) {
            var el = new dom.Element('div');
            el.setStyle('height', '10em');

            var anim = new Anim(el, {
                unit: 'em'
            });

            anim.start('height', 5);
            clock.tick(600);

            expect(el.getStyle('height')).toBe('5em');
        });

        it('should morph mutiple properties', function(expect) {
            var el = new dom.Element('div');
            var anim = new Anim(el);

            anim.start({
                height: 10,
                width: 20
            });
            clock.tick(600);

            expect(el.getStyle('height')).toBe('10px');
            expect(el.getStyle('width')).toBe('20px');
        });
    }

};
