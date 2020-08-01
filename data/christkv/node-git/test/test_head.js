var testCase = require('nodeunit').testCase,
  fs = require('fs'),
  Repo = require('../lib/git').Repo,
  Merge = require('../lib/git').Merge;

var fixture = function(name, trim) {
  return trim ? fs.readFileSync("./test/fixtures/" + name, 'ascii').trim() : fs.readFileSync("./test/fixtures/" + name, 'ascii');
}

/**
  Test basic node-git functionality
**/
module.exports = testCase({   
  setUp: function(callback) {
    callback();
  },
  
  tearDown: function(callback) {
    callback();
  },

  "Should correctly fetch master":function(assert) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.commit('master', function(err, head) {
        assert.equal('ca8a30f5a7f0f163bbe3b6f0abf18a6c83b0687a', head.id);
        assert.done();
      })
    });        
  },
  
  "Should correctly fetch submaster":function(assert) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.commit('test/master', function(err, head) {
        assert.equal('2d3acf90f35989df8f262dc50beadc4ee3ae1560', head.id);
        assert.done();
      })
    });            
  },
  
  // heads with slashes
  "Should correctly fetch heads with slashes":function(assert) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.heads(function(err, heads) {
        assert.equal('test/chacon', heads[3].name);
        assert.done();
      })
    });                
  },
  
  "Should correctly test is_head function":function(assert) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.is_head('master', function(err, result) {
        assert.equal(true, result);
        
        repo.is_head('test/chacon', function(err, result) {
          assert.equal(true, result);
  
          repo.is_head('masterblah', function(err, result) {
            assert.equal(false, result);
            assert.done();
          })
        })
      })
    });
  },
  
  "Should correctly test head count":function(assert) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.heads(function(err, heads) {
        assert.equal(5, heads.length);
        assert.done();
      })
    });    
  },
  
  "Should correctly include non-pack":function(assert) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.heads(function(err, heads) {
        var names = heads.map(function(head) { return head.name; });
        assert.ok(names.indexOf('nonpack') != -1)
        assert.done();
      })
    });    
  }
});



















