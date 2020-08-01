var rxSpinnerPage = require('../rxSpinner.page').rxSpinner;

describe('rxSpinner', function () {

    before(function () {
        demoPage.go('#/component/rxSpinner');
    });

    it.skip('should show element', function () {
        expect(rxSpinnerPage.rxSpinnerElement.isDisplayed()).toEqual(true);
    });

});
