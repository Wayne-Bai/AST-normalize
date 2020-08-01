var Class = require('../../lib/shipyard/class/Class'),
	Observable = require('../../lib/shipyard/class/Observable'),
	Model = require('../../lib/shipyard/model/Model'),
	Field = require('../../lib/shipyard/model/fields/Field'),
	logging = require('../../lib/shipyard/logging');

module.exports = {
	
	'Model': function(it, setup) {
		
		setup('before', function() {
			this.User = new Class({
				Extends: Model,
				fields: {
					id: new Field({type: Number}),
					username: new Field({type: String}),
					password: new Field({type: String})
				}
			});
		
		});


		it('should be able to set and get data', function(expect) {
			var u = new this.User(),
				name = 'johndoe';
			u.set('username', name);
			expect(u.get('username')).toBe(name);
		
		});

		it('should set initial default data', function(expect) {
			var Task = new Class({
				Extends: Model,
				fields: {
					id: new Field(),
					title: new Field({type:String, 'default':'Untitled'})
				}
			});

			var t = new Task();
			expect(t.get('title')).toBe('Untitled');
		});

		it('should warn if getting a non-existing field', function(expect) {
			var u = new this.User();

			var log = logging.getLogger('shipyard.model.Model');
			var oldWarn = log.warn;
			log.warn = this.createSpy();
			u.get('asdfasfd');

			expect(log.warn).toHaveBeenCalled();
			log.warn = oldWarn;
		});

		it('should be able to take a hash to set data', function(expect) {
			
			var u = new this.User(),
				props = {
					username: 'johndoe',
					password: 'pass1'
				};
			
			u.set(props);

			expect(u.get('username')).toBe('johndoe');
			expect(u.get('password')).toBe('pass1');

		});

		it('should accept data in constructor', function(expect) {
			var name = 'janedoe';

			var u = new this.User({
				username: name,
				password: 'derp'
			});

			expect(u.get('username')).toBe(name);

		});

		it('should have a dynamic `pk` property', function(expect) {
			var M = new Class({
				Extends: this.User,
				pk: 'username'
			});

			var john = new this.User({ id: 1, username: 'john' });
			var moe = new M({ id: 2, username: 'moe' });

			expect(john.get('pk')).toBe(1);
			expect(moe.get('pk')).toBe('moe');

			john.set('pk', 4);
			moe.set('pk', 'larry');

			expect(john.get('id')).toBe(4);
			expect(moe.get('username')).toBe('larry');
		});

		it('should be serializable to JSON', function(expect) {
			var obj = {
				username: 'Sean',
				password: 'derp'
			};
			var u = new this.User(obj);
			
			expect(JSON.stringify(u)).toBe(JSON.stringify(obj));
		});

		it('should not serialize write:false fields', function(expect) {
			var Foo = new Class({
				Extends: Model,
				fields: {
					a: new Field(),
					b: new Field({ write: false })
				},
				pk: 'a'
			});

			var a = new Foo({ a: 'foo', b: 'bar' });

			expect(JSON.stringify(a)).toBe('{"a":"foo"}');
		});

		it('should be Observable', function(expect) {
		
			var u = new this.User();
			expect(u).toBeAnInstanceOf(Observable);

			var nameChange = false;

			u.observe('username', function(newVal, oldVal) {
				if (newVal === 'jenn') {
					nameChange = true;
				}
			});

			u.set('username', 'jenn');
			expect(nameChange).toBe(true);

		});
		
	}
	
};
