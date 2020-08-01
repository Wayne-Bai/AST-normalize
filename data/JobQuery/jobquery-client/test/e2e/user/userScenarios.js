  describe('user state', function(){

    it('should exist', function(){
      browser.get('/users');
      browser.getLocationAbsUrl().then(function(url){
        expect(url).toBe('http://localhost:8000/users');
      });
    });

  });