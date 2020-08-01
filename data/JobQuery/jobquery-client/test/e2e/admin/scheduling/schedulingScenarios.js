describe ('admin.scheduling state', function(){

  it('should exist', function(){
    browser.get('/admin/scheduling');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/scheduling');
    });
  });

});