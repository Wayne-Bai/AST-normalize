describe('IndexedDB', function() {

  var db;
  beforeEach(function() {
    db = createDB({
      title:'testDev',
      version:1,
      stores:[{name:'testers', keys:{keyPath:'userid'}}]
    });
  });

  it('should initialize a db with a store', function(done) {
    db.finally(function() {
      var result = db.inspect().value;
      expect(result).to.have.property('createObjectStore');
      expect(db.transaction('testers').objectStore('testers')).to.be.a(IBDObjectStore);
      // TODO add check for keyPath
      done();
    });
  });

});
