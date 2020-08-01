describe('Decimal validation', function () {
	var elem, elemPlaces;

	beforeEach(function () {
		browser.get('demo/index.html');
		elem = element(by.model('demo.decimal'));
		elemPlaces = element(by.model('demo.decimalPlaces'));
	});

	it('should allow emtpy field', function () {
		expect(elem.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elemPlaces.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should allow decimal numbers', function () {
		elem.sendKeys('0.5');
		elemPlaces.sendKeys('0.5');
		expect(elem.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elemPlaces.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should allow decimal numbers up to specified places', function () {
		// Specified 3 places
		elem.sendKeys('0.123');
		expect(elem.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should set invalid when not decimal numbers', function () {
		elem.sendKeys('0');
		elemPlaces.sendKeys('0');
		expect(elem.getAttribute('class')).toMatch('ng-invalid');
		expect(elemPlaces.getAttribute('class')).toMatch('ng-invalid');
	});

	it('should set invalid when decimal places exceed limit', function () {
		// Specified 3 places
		elemPlaces.sendKeys('0.1234');
		expect(elemPlaces.getAttribute('class')).toMatch('ng-invalid');
	});
});