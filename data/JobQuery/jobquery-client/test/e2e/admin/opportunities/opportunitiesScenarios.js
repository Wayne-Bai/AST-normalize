describe ('admin.opportunities state', function(){

  it('should exist', function(){
    browser.get('/admin/opportunities');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/opportunities');
    });
  });

  it('should display rows of opportunities with an NG-repeat directive', function () {
      browser.get('/admin/opportunities');
      element.all(by.repeater('opportunity in resources')).each(function(element) {
        expect(element.getText()).not.toBe('');
      });
  });

  xit('should reload matches on update or load', function () {
  });

  xit('should jump to the new opportunity page on clicking New Opportunity', function () {
  });

  xit('should jump to a detailed view of the opportunity on clicking Detail', function () {
  });
});

describe ('admin.opportunities.detail state', function(){
  it('should exist', function(){
    browser.get('/admin/opportunities/1');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/opportunities/1');
    });
  });

  xit('it should have an edit button that turns read-only mode off', function() {

  });
  xit('it should have an add new button that adds input fields', function () {

  });

});

describe ('admin.opportunities.new state', function(){

  it('should exist', function(){
    browser.get('/admin/opportunities/new');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/opportunities/new');
    });
  });

});