describe ('admin.messages state', function(){

  it('should exist', function(){
    browser.get('/admin/messages');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/messages');
    });
  });

});

describe ('admin.messages.detail state', function(){

  it('should exist', function(){
    browser.get('/admin/messages/1');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/messages/1');
    });
  });

});

describe ('admin.messages.new state', function(){

  it('should exist', function(){
    browser.get('/admin/messages/new');
    browser.getLocationAbsUrl().then(function(url){
      expect(url).toBe('http://localhost:8000/admin/messages/new');
    });
  });

});