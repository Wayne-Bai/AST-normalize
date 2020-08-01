describe('Integer validation', function () {
	var elem;

	beforeEach(function () {
		browser.get('demo/index.html');
		elem = element(by.model('demo.integer'));
	});

	it('should allow empty field', function () {
		expect(elem.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should allow whole numbers', function () {
		elem.sendKeys('1234567890');
		expect(elem.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should set invalid when not whole numbers', function () {
		elem.sendKeys('0.5');
		expect(elem.getAttribute('class')).toMatch('ng-invalid');
	});
});