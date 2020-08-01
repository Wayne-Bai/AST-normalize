describe('Collection.prototype.byLink', () => {
	var byLink = Collection.prototype.byLink;

	it('Проверка экранирования', () => {
		var obj = {
			'[ eq(-1)]   ': {
				'[[   >2\\]': 1
			},
			'>': 2,
			'2]\\': 3,
			'   3   ': 1
		};

		expect(byLink(obj, '[2]\\\\]'))
			.toBe(3);

		expect(byLink(obj, $cLink('[2]\\\\]')))
			.toBe(3);

		expect(byLink(obj, ['[2]\\]']))
			.toBe(3);

		expect(byLink(obj, $cLink('[2]\\]')))
			.toBe(3);

		expect(byLink(obj, '[>]'))
			.toBe(2);

		expect(byLink(obj, ['>']))
			.toBe(2);

		expect(byLink(obj, ['[>]']))
			.toBe(2);

		expect(byLink(obj, '[[ eq(-1)]   ] > [[[   >2\\\\]]'))
			.toBe(1);

		expect(byLink(obj, ['[[ eq(-1)]   ]', '[[[   >2\\]]']))
			.toBe(1);

		expect(byLink(obj, '[   3   ]'))
			.toBe(1);

		expect(byLink(obj, ['   3   ']))
			.toBe(1);

		expect(byLink(obj, ['   [   3   ]   ']))
			.toBe(1);
	});

	describe('Обработка ложных указателей', () => {
		it('получение значения', () => {
			expect(byLink([], 0))
				.toBeUndefined();

			expect(byLink([], 'eq(1)'))
				.toBeUndefined();

			expect(byLink([], 'eq(-1)'))
				.toBeUndefined();

			expect(byLink({}, 0))
				.toBeUndefined();

			expect(byLink({}, 'eq(1)'))
				.toBeUndefined();

			expect(byLink({}, 'eq(-1)'))
				.toBeUndefined();

			expect(byLink([1], 'eq(2)'))
				.toBeUndefined();

			expect(byLink([1], 'eq(-2)'))
				.toBeUndefined();

			expect(byLink({0: 1}, 'eq(2)'))
				.toBeUndefined();

			expect(byLink({0: 1}, 'eq(-2)'))
				.toBeUndefined();

			if (typeof Map === 'undefined') {
				return;
			}

			expect(byLink(new Map(), 0))
				.toBeUndefined();

			expect(byLink(new Map(), 'eq(1)'))
				.toBeUndefined();

			expect(byLink(new Map(), 'eq(-1)'))
				.toBeUndefined();

			expect(byLink(new Map([[0, 1]]), 'eq(2)'))
				.toBeUndefined();

			expect(byLink(new Map([[0, 1]]), 'eq(-2)'))
				.toBeUndefined();

			if (typeof Set === 'undefined') {
				return;
			}

			expect(byLink(new Set(), 0))
				.toBeUndefined();

			expect(byLink(new Set(), 'eq(1)'))
				.toBeUndefined();

			expect(byLink(new Set(), 'eq(-1)'))
				.toBeUndefined();

			expect(byLink(new Set([1]), 'eq(2)'))
				.toBeUndefined();

			expect(byLink(new Set([1]), 'eq(-2)'))
				.toBeUndefined();
		});

		it('удаление значения', () => {
			expect(byLink([], 0, null, true))
				.toEqual({
					key: 0,
					value: void 0,
					result: false
				});

			expect(byLink([], 'eq(10)', null, true))
				.toEqual({
					key: 10,
					value: void 0,
					result: false
				});

			expect(byLink([], 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink([1], 'eq(2)', null, true))
				.toEqual({
					key: 2,
					value: void 0,
					result: false
				});

			expect(byLink([1], 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 0, null, true))
				.toEqual({
					key: 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 'eq(10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({0: 1}, 'eq(2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({0: 1}, 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			if (typeof Map === 'undefined') {
				return;
			}

			expect(byLink(new Map(), 0, null, true))
				.toEqual({
					key: 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map(), 'eq(10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map(), 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map([[0, 1]]), 'eq(2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map([[0, 1]]), 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			if (typeof Set === 'undefined') {
				return;
			}

			expect(byLink(new Set(), 0, null, true))
				.toEqual({
					key: null,
					value: 0,
					result: false
				});

			expect(byLink(new Set(), 'eq(10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set(), 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set([1]), 'eq(2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set([1]), 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});
		});

		it('удаление значения', () => {
			expect(byLink([], 0, null, true))
				.toEqual({
					key: 0,
					value: void 0,
					result: false
				});

			expect(byLink([], 'eq(10)', null, true))
				.toEqual({
					key: 10,
					value: void 0,
					result: false
				});

			expect(byLink([], 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink([1], 'eq(2)', null, true))
				.toEqual({
					key: 2,
					value: void 0,
					result: false
				});

			expect(byLink([1], 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 0, null, true))
				.toEqual({
					key: 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 'eq(10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({0: 1}, 'eq(2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({0: 1}, 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			if (typeof Map === 'undefined') {
				return;
			}

			expect(byLink(new Map(), 0, null, true))
				.toEqual({
					key: 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map(), 'eq(10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map(), 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map([[0, 1]]), 'eq(2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map([[0, 1]]), 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			if (typeof Set === 'undefined') {
				return;
			}

			expect(byLink(new Set(), 0, null, true))
				.toEqual({
					key: null,
					value: 0,
					result: false
				});

			expect(byLink(new Set(), 'eq(10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set(), 'eq(-10)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set([1]), 'eq(2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set([1]), 'eq(-2)', null, true))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});
		});

		it('установка значения', () => {
			expect(byLink([], 0, 10))
				.toEqual({
					key: 0,
					value: void 0,
					result: true
				});

			expect(byLink([], 'eq(10)', 10))
				.toEqual({
					key: 10,
					value: void 0,
					result: true
				});

			expect(byLink([], 'eq(-10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink([1], 'eq(2)', 10))
				.toEqual({
					key: 2,
					value: void 0,
					result: true
				});

			expect(byLink([1], 'eq(-2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 0, 10))
				.toEqual({
					key: '0',
					value: void 0,
					result: true
				});

			expect(byLink({}, 'eq(10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({}, 'eq(-10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({0: 1}, 'eq(2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink({0: 1}, 'eq(-2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			if (typeof Map === 'undefined') {
				return;
			}

			expect(byLink(new Map(), 0, 10))
				.toEqual({
					key: 0,
					value: void 0,
					result: true
				});

			expect(byLink(new Map(), 'eq(10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map(), 'eq(-10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map([[0, 1]]), 'eq(2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Map([[0, 1]]), 'eq(-2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			if (typeof Set === 'undefined') {
				return;
			}

			expect(byLink(new Set(), 0, 10))
				.toEqual({
					key: null,
					value: void 0,
					result: true
				});

			expect(byLink(new Set(), 'eq(10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set(), 'eq(-10)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set([1]), 'eq(2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(new Set([1]), 'eq(-2)', 10))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});
		});
	});

	describe('Получение значения', () => {
		it('по указателю для простых объектов', () => {
			var obj = [
				{
					next: {
						next: [1, 2, 3, 4]
					}
				},
				2,
				3
			];

			expect(byLink(obj, '1'))
				.toBe(2);

			expect(byLink(obj, 1))
				.toBe(2);

			expect(byLink(obj, $cLink(1)))
				.toBe(2);

			expect(byLink(obj, $cLink('1')))
				.toBe(2);

			expect(byLink(obj, 'eq(1)'))
				.toBe(2);

			expect(byLink(obj, 'eq(-2)'))
				.toBe(2);

			expect(byLink(obj, '0 > next > next > eq(-1)'))
				.toBe(4);

			expect(byLink(obj, '0 >>>>>>next > next > eq(-1)'))
				.toBe(4);

			expect(byLink(obj, $cLink('0 >>>>>>next > next > eq(-1)')))
				.toBe(4);

			expect(byLink(obj, [0, 'next', 'next', 'eq(-1)']))
				.toBe(4);

			var obj2 = {
				'  foo>  ': {
					'eq(1)': {
						' [ val ] ': 1
					}
				}
			};

			expect(byLink(obj2, '[  foo>  ] > [eq(1)] > [ [ val ] ]'))
				.toBe(1);
		});

		it('по указателю для Map', () => {
			if (typeof Map === 'undefined') {
				return;
			}

			var obj = new Map(),
				key = {};

			obj.set(key, {foo: new Map([
				[null, true]
			])});

			expect('foo' in byLink(obj, key))
				.toBe(true);

			expect(byLink(obj, [key, 'foo', null]))
				.toBe(true);

			expect(byLink(obj, ['eq(0)', 'foo', 'eq(-1)']))
				.toBe(true);
		});

		it('по указателю для WeakMap', () => {
			if (typeof WeakMap === 'undefined') {
				return;
			}

			var obj = new WeakMap(),
				key = {};

			obj.set(key, {foo: new WeakMap([
				[key, true]
			])});

			expect('foo' in byLink(obj, key))
				.toBe(true);

			var res1 = false;

			try {
				byLink(obj, 'eq(0)');

			} catch (ignore) {
				res1 = true;
			}

			expect(res1).toBe(true);

			var res2 = false;

			try {
				byLink(obj, 'eq(-1)');

			} catch (ignore) {
				res2 = true;
			}

			expect(res2).toBe(true);
		});

		it('по нулевому указателю для Map', () => {
			if (typeof Map === 'undefined') {
				return;
			}

			var obj = new Map([
				[
					null,
					new Map([[void 0, 1]])
				],

				[
					void 0,
					2
				]
			]);

			expect(byLink(obj, void 0))
				.toBe(2);

			expect(byLink(obj, null) instanceof Map)
				.toBe(true);

			expect(byLink(obj, [null, void 0]))
				.toBe(1);
		});

		it('по указателю для Set', () => {
			if (typeof Set === 'undefined') {
				return;
			}

			var obj = new Set();
			obj.add({foo: new Map([
				[null, true]
			])});

			expect(byLink(obj, ['eq(0)', 'foo', 'eq(-1)']))
				.toBe(true);
		});

		it('по указателю для генератора', () => {
			try {
				eval(`
					function *obj() {
						for (var i = 0; i < 10; i++) {
							yield i;
						}
					}
				`);

				expect(byLink(obj, 'eq(5)'))
					.toBe(5);

			} catch (err) {
				if (err.name !== 'SyntaxError') {
					throw err;
				}
			}
		});

		it('по указателю для итератора', () => {
			try {
				eval(`
					function *generator() {
						for (var i = 0; i < 10; i++) {
							yield i;
						}
					}

					var obj = {
						'@@iterator': generator
					};
				`);

				expect(byLink(obj, 'eq(5)'))
					.toBe(5);

			} catch (err) {
				if (err.name !== 'SyntaxError') {
					throw err;
				}
			}
		});
	});

	describe('Удаление значения', () => {
		it('по указателю для простых объектов', () => {
			var obj = [
				{
					next: {
						next: [1, 2, 3, 4]
					}
				},
				2,
				3
			];

			expect(byLink(obj, 1, null, true))
				.toEqual({
					result: true,
					key: 1,
					value: 2
				});

			expect(obj[1])
				.toBe(3);

			expect(byLink(obj, $cLink('eq(-1)'), null, true))
				.toEqual({
					result: true,
					key: 1,
					value: 3
				});

			expect(obj[1])
				.toBeUndefined();

			expect(byLink(obj, 'foo', null, true))
				.toEqual({
					result: false,
					key: 'foo',
					value: void 0
				});

			var obj2 = {
				0: 1,
				1: 1,
				length: 2
			};

			byLink(obj2, 'eq(-1)', null, true);

			expect(obj2.length)
				.toBe(1);

			expect(obj2[1])
				.toBeUndefined();

		});

		it('по указателю для Map', () => {
			if (typeof Map === 'undefined') {
				return;
			}

			var obj = new Map(),
				key = {};

			obj.set(key, {foo: new Map([[null, true]])});

			expect(byLink(obj, [key, 'foo', null], null, true))
				.toEqual({
					result: true,
					key: null,
					value: true
				});

			expect(obj.get(key).foo.get(null))
				.toBeUndefined();

			byLink(obj, key, null, true);

			expect(obj.size)
				.toBe(0);

			expect(obj.get(key))
				.toBeUndefined();

			expect(byLink(obj, 'foo', null, true))
				.toEqual({
					result: false,
					key: 'foo',
					value: void 0
				});
		});

		it('по указателю для WeakMap', () => {
			if (typeof WeakMap === 'undefined') {
				return;
			}

			var obj = new WeakMap(),
				key = {};

			obj.set(key, {foo: 1});

			expect(byLink(obj, [key, 'foo'], null, true))
				.toEqual({
					result: true,
					key: 'foo',
					value: 1
				});

			expect(obj.get(key).foo)
				.toBeUndefined();

			byLink(obj, key, null, true);

			expect(obj.get(key))
				.toBeUndefined();

			expect(byLink(obj, {}, null, true))
				.toEqual({
					result: false,
					key: {},
					value: void 0
				});
		});

		it('по указателю для Set', () => {
			if (typeof Set === 'undefined') {
				return;
			}

			var obj = new Set([
				1, 2, 3, 4
			]);

			expect(byLink(obj, 'eq(0)', null, true))
				.toEqual({
					result: true,
					key: null,
					value: 1
				});

			expect(obj.has(1))
				.toBe(false);

			expect(byLink(obj, 'eq(-1)', null, true))
				.toEqual({
					result: true,
					key: null,
					value: 4
				});

			expect(obj.has(4))
				.toBe(false);
		});
	});

	describe('Установка значения', () => {
		it('по указателю для простых объектов', () => {
			var obj = [
				{
					next: {
						next: [1, 2, 3, 4]
					}
				},
				2,
				3
			];

			expect(byLink(obj, 1, 10))
				.toEqual({
					key: 1,
					value: 2,
					result: true
				});

			expect(obj[1])
				.toBe(10);

			expect(byLink(obj, 'eq(-1)', 4))
				.toEqual({
					key: 2,
					value: 3,
					result: true
				});

			expect(obj[2])
				.toBe(4);

			var obj2 = {
				0: 1,
				1: 2,
				length: 2
			};

			expect(byLink(obj2, 'eq(-1)', 5))
				.toEqual({
					key: 1,
					value: 2,
					result: true
				});

			expect(obj2[1])
				.toBe(5);
		});

		it('по указателю для Map', () => {
			if (typeof Map === 'undefined') {
				return;
			}

			var obj = new Map(),
				key = {};

			obj.set(key, {foo: new Map([[null, true]])});

			expect(byLink(obj, [key, 'foo', null], 10))
				.toEqual({
					key: null,
					value: true,
					result: true
				});

			expect(obj.get(key).foo.get(null))
				.toBe(10);

			byLink(obj, key, 15);

			expect(obj.get(key))
				.toBe(15);
		});

		it('по указателю для Set', () => {
			if (typeof Set === 'undefined') {
				return;
			}

			var obj = new Set([{}, [], 0, new Set()]);

			expect(byLink(obj, 'eq(-1) > eq(0)', 'bar'))
				.toEqual({
					key: void 0,
					value: void 0,
					result: false
				});

			expect(byLink(obj, 'eq(0) > foo', 'bar'))
				.toEqual({
					key: 'foo',
					value: void 0,
					result: true
				});

			expect(byLink(obj, 'eq(0)').foo)
				.toBe('bar');

			expect(byLink(obj, 'eq(1)', 'foo'))
				.toEqual({
					key: null,
					value: [],
					result: true
				});

			expect(obj.has('foo'))
				.toBe(true);

			expect(byLink(obj, 'eq(-1)', 'foo'))
				.toEqual({
					key: null,
					value: 'foo',
					result: false
				});

			expect(byLink(obj, 'eq(-1)', 'bar'))
				.toEqual({
					key: null,
					value: 'foo',
					result: true
				});

			expect(obj.has('bar'))
				.toBe(true);
		});
	});
});

describe('Проверка наличия свойства по указателю', () => {
	it('для простых объектов', () => {
		var obj = {
			foo: {
				bar: [1, 2, 3]
			},

			bang: [1]
		};

		expect($C['in']('foo > bar > 0', obj))
			.toBe(true);

		expect($C(obj)['in']('foo > bar > 0'))
			.toBe(true);

		expect($C().addCollection('foo', obj)['in']('foo > bar > 0', 'foo'))
			.toBe(true);

		expect($C['in']('foo > bar > eq(-1)', obj))
			.toBe(true);

		expect($C['in']($cLink('foo > bar > eq(-1)'), obj))
			.toBe(true);

		expect($C['in'](['foo', 'bar', 'eq(-1)'], obj))
			.toBe(true);

		expect($C['in']('foo > bar > 10', obj))
			.toBe(false);

		expect($C['in']('foo > bar > eq(-100)', obj))
			.toBe(false);

		expect($C['in']('foo1 > bar > 1', obj))
			.toBe(false);

		expect($C['in']('bang', obj))
			.toBe(true);

		expect($C['in']('eq(-1)', obj))
			.toBe(true);

		expect($C['in']('bang2', obj))
			.toBe(false);
	});

	it('для Map', () => {
		if (typeof Map === 'undefined') {
			return;
		}

		var obj = new Map([
			[
				1,
				{
					foo: 'bar'
				}
			],

			[
				void 0,
				void 0
			],

			[
				null,
				null
			]
		]);

		expect($C['in'](2, obj))
			.toBe(false);

		expect($C['in'](1, obj))
			.toBe(true);

		expect($C['in'](void 0, obj))
			.toBe(true);

		expect($C['in'](null, obj))
			.toBe(true);

		expect($C['in']('eq(1)', obj))
			.toBe(true);

		expect($C['in']('eq(-1)', obj))
			.toBe(true);

		expect($C['in']([1, 'foo'], obj))
			.toBe(true);

		expect($C['in']([1, 'foo2'], obj))
			.toBe(false);
	});

	it('для Set', () => {
		if (typeof Set === 'undefined') {
			return;
		}

		var obj = new Set([1, void 0, null, 0, 'bar']);

		expect($C['in'](2, obj))
			.toBe(false);

		expect($C['in'](void 0, obj))
			.toBe(true);

		expect($C['in'](null, obj))
			.toBe(true);

		expect($C['in'](0, obj))
			.toBe(true);

		expect($C['in'](0, obj))
			.toBeTruthy('bar', obj);

		expect($C['in']('0', obj))
			.toBe(false);
	});

	it('для генераторов', () => {
		try {
			eval(`
				function *obj() {
					for (var i = 0; i < 10; i++) {
						yield i;
					}
				}
			`);

			expect($C['in']('eq(2)', obj))
				.toBe(true);

			expect($C['in']('eq(-1)', obj))
				.toBe(true);

			expect($C['in']('eq(11)', obj))
				.toBe(false);

		} catch (err) {
			if (err.name !== 'SyntaxError') {
				throw err;
			}
		}
	});

	it('для итераторов', () => {
		try {
			eval(`
				function *generator() {
					for (var i = 0; i < 10; i++) {
						yield i;
					}
				}

				var obj = {
					'@@iterator': generator
				};
			`);

			expect($C['in']('eq(2)', obj))
				.toBe(true);

			expect($C['in']('eq(-1)', obj))
				.toBe(true);

			expect($C['in']('eq(11)', obj))
				.toBe(false);

		} catch (err) {
			if (err.name !== 'SyntaxError') {
				throw err;
			}
		}
	});
});
