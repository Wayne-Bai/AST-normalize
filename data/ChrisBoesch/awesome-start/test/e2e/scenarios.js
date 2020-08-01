'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

  beforeEach(function() {
    browser().navigateTo('../../static/index.html');
  });


  it('should load the page and find the API key', function() {
    expect(element('a.brand').text()).
        toBe('BaaS (1234)');
  });

});
