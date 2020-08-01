describe('At least one validation', function () {
	var elem1, elem2, elem3;

	beforeEach(function () {
		browser.get('demo/index.html');
		elem1 = element(by.model('demo.atleastone1'));
		elem2 = element(by.model('demo.atleastone2'));
		elem3 = element(by.model('demo.atleastone3'));
	});

	it('should allow first field to be filled in', function () {
		elem1.sendKeys('something');
		expect(elem1.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elem2.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elem3.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should allow second field to be filled in', function () {
		elem2.sendKeys('something');
		expect(elem1.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elem2.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elem3.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should allow third field to be filled in', function () {
		elem3.sendKeys('something');
		expect(elem1.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elem2.getAttribute('class')).not.toMatch('ng-invalid');
		expect(elem3.getAttribute('class')).not.toMatch('ng-invalid');
	});

	it('should set invalid when none of the fields are filled in', function () {
		expect(elem1.getAttribute('class')).toMatch('ng-invalid');
		expect(elem2.getAttribute('class')).toMatch('ng-invalid');
		expect(elem3.getAttribute('class')).toMatch('ng-invalid');
	});
});