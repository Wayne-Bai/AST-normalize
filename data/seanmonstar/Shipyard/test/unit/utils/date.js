var date = require('../../../lib/shipyard/utils/date');

module.exports = {

	'date.format': function date_format(it, setup) {
		var d = new Date(2012, 3, 24, 17, 24, 15);

		it('should output abbr day name', function(expect) {
			expect(date.format('{a}', d)).toBe('Tue');
		});

		it('should output full day name', function(expect) {
			expect(date.format('{A}', d)).toBe('Tuesday');
		});

		it('should output abbr month name', function(expect) {
			expect(date.format('{b}', d)).toBe('Apr');
		});

		it('should output month name', function(expect) {
			expect(date.format('{B}', d)).toBe('April');
		});

		it('should output date and time', function(expect) {
			expect(date.format('{c}', d)).toBe('04/24/12 17:24:15');
		});

		it('should output day of the month', function(expect) {
			expect(date.format('{d}', d)).toBe('24');
		});

		it('should output hour (24-hours)', function(expect) {
			expect(date.format('{H}', d)).toBe('17');
		});

		it('should output hour (12-hours)', function(expect) {
			expect(date.format('{I}', d)).toBe('05');
		});

		it('should output day of the year', function(expect) {
			expect(date.format('{j}', d)).toBe('115');
		});

		it('should output month of the year', function(expect) {
			expect(date.format('{m}', d)).toBe('04');
		});

		it('should output minute', function(expect) {
			expect(date.format('{M}', d)).toBe('24');
		});

		it('should output AM or PM', function(expect) {
			expect(date.format('{p}', d)).toBe('PM');
		});

		it('should output seconds', function(expect) {
			expect(date.format('{S}', d)).toBe('15');
		});

		it('should output day of the week', function(expect) {
			expect(date.format('{w}', d)).toBe('2');
		});

		it('should output date', function(expect) {
			expect(date.format('{x}', d)).toBe('04/24/12');
		});

		it('should output time', function(expect) {
			expect(date.format('{X}', d)).toBe('17:24:15');
		});

		it('should output year without century', function(expect) {
			expect(date.format('{y}', d)).toBe('12');
		});

		it('should output full year', function(expect) {
			expect(date.format('{Y}', d)).toBe('2012');
		});
	}

};
