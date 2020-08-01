var Container = require('../../../lib/shipyard/view/Container'),
	View = require('../../../lib/shipyard/view/View');

module.exports = {

	'Container': function(it, setup) {
		it('should render child views', function(expect) {
			var v = new Container(),
				v2 = new View({ content: 'test' });

			v.addView(v2);

            var el = v.toElement();
			expect(el.get('tag')).toBe('div');
            expect(el.getFirst().get('tag')).toBe('span');
            expect(el.getFirst().get('text').trim()).toBe('test');
		});

		it('should render child containers', function(expect) {
			var c = new Container(),
				c2 = new Container({ content: 'contained' }),
				v = new View({ content: 'test' });


			c2.addView(v);
			c.addView(c2);

            var el = c.toElement();
            expect(el.getElements().get('tag')).toBeLike(['div', 'span']);

		});

		it('should be able to add views at an index', function(expect) {
			var c = new Container();
			var v1 = new View({ tag: 'derp' });
			var v2 = new View({ tag: 'herp' });

			c.addView(v1);
			c.addView(v2, 0);

			expect(c.toElement().getFirst().get('tag')).toBe(v2.get('tag'));
		});

		it('should be able to initialize with childViews', function(expect) {
			var c = new Container({
				childViews: [
					new View({ id: 'derp' }),
					new View({ id: 'herp' })
				]
			});

			expect(c.get('childViews')[0].get('parentView')).toBe(c);
			expect(c.toElement().getFirst().get('id')).toBe('derp');
		});
	}

};
