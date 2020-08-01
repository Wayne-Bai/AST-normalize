describe ('admin.matches state', function(){

  it('should exist', function(){
    browser.get('/admin/matches');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/matches');
    });
  });

});