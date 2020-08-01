
require('../lib/extensions.js');

var fs = require('fs'),
    cp = require('child_process'),
    vows = require('vows'),
    assert = require('assert'),
    pathModule = require('path'),
    util = require('util'),
    Multi = require('multi'),
    EventEmitter = require('events').EventEmitter;
    
var NOOP = function() {}

var cwd = process.cwd(),
    tmp = pathModule.resolve('./test/fixtures/tmp');

var skeleton = fs.readdirSync(cwd + '/skeleton/').sort();
var prefix = '../../../';

// Add node_modules
skeleton.push('node_modules');

var protos = new Multi({
  command: function(str, callback) {
    cp.exec(util.format(prefix + 'bin/protos %s', str), function(err, stdout, stderr) {
      if (err) callback(err, stderr.trim());
      else callback(null, stdout.trim());
    });
  }
});

vows.describe('Command Line Interface').addBatch({
  
  'Preliminaries': {
    
    topic: function() {
      var promise = new EventEmitter();
      process.chdir('test/fixtures');
      cp.exec('rm -Rf tmp', function(err, stdout, stderr) {
        fs.mkdirSync('tmp');
        process.chdir('tmp');
        promise.emit('success', process.cwd());
      });
      return promise;
    },
    
    "Created temp directory": function(cwd) {
      assert.strictEqual(tmp, cwd);
    }
    
  }
  
}).addBatch({
  
  'protos create': {
    
    topic: function() {
      
      var promise = new EventEmitter(),
          results = [];
      
      protos.command('create myapp --skeleton --model posts comments --controller admin dashboard');
      protos.command('create myapp1 --skeleton --controller test');
      
      protos.exec(function(err, results) {
        setTimeout(function() {
          // Account for Disk/IO on Travis VM
          promise.emit('success', err || results);
        }, 1000);
      });
      
      return promise;
    },
    
    "Creates application skeleton": function(results) {
      var r1 = results[0];
      var expected = '» Successfully created myapp\n» \
Created myapp/app/models/posts.js\n» \
Created myapp/app/models/comments.js\n» \
Created myapp/app/controllers/admin.js\n» \
Created myapp/app/controllers/dashboard.js\n» \
Created myapp/app/helpers/admin.js\n» \
Created myapp/app/helpers/dashboard.js\n» \
Created myapp/app/views/admin/admin-index.hbs\n» \
Created myapp/app/views/dashboard/dashboard-index.hbs';

      assert.deepEqual(fs.readdirSync('myapp').sort(), skeleton.sort());
      
    },
    
    "Creates models": function() {
      assert.isTrue(fs.existsSync('myapp/app/models/posts.js'));
      assert.isTrue(fs.existsSync('myapp/app/models/comments.js'));
    },
    
    "Creates controllers": function() {
      assert.isTrue(fs.existsSync('myapp/app/controllers/admin.js'));
      assert.isTrue(fs.existsSync('myapp/app/controllers/dashboard.js'));
    },
    
    "Creates helpers": function() {
      assert.isTrue(fs.existsSync('myapp/app/helpers/admin.js'));
      assert.isTrue(fs.existsSync('myapp/app/helpers/dashboard.js'));
    },
    
    "Creates views": function() {
      assert.isTrue(fs.existsSync('myapp/app/views/main/main-index.hbs'));
      assert.isTrue(fs.existsSync('myapp/app/views/admin/admin-index.hbs'));
      assert.isTrue(fs.existsSync('myapp/app/views/dashboard/dashboard-index.hbs'));
    }
    
  }
  
}).addBatch({
  
  'protos controller': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      process.chdir('myapp1');
      prefix += '../';
      protos.command('controller blog admin');
      
      protos.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    "Properly generates controllers": function(results) {
      var r1 = results[0];
      var expected =  '» Created myapp1/app/controllers/blog.js\n» Created myapp1/app/controllers/admin.js\n\
» Created myapp1/app/views/blog/blog-index.hbs\n» Created myapp1/app/views/admin/admin-index.hbs';

      assert.equal(r1, expected);
      assert.isTrue(fs.existsSync('app/controllers/blog.js'));
      assert.isTrue(fs.existsSync('app/controllers/admin.js'));
      assert.isTrue(fs.existsSync('app/views/blog/blog-index.hbs'));
      assert.isTrue(fs.existsSync('app/views/admin/admin-index.hbs'));
      
      var expectedBuf = fs.readFileSync('app/controllers/blog.js', 'utf8').trim();
      
      var controllerBuf = 'function BlogController(app) {\n\n  get(\'/\', function(req, res) {\n    \
res.render(\'index\');\n  });\n\n}\n\nmodule.exports = BlogController;';
      
      assert.equal(expectedBuf, controllerBuf);
      
    }
    
  }
  
}).addBatch({
  
    'protos model': {

      topic: function() {
        var promise = new EventEmitter();

        protos.command('model --pluralize post comment');
        protos.command('model books --driver mongodb:books --context bookstore');

        protos.exec(function(err, results) {
          promise.emit('success', err || results);
        });

        return promise;
      },

      "Properly generates models": function(results) {
        var r1 = results[0];
        var expected =  '» Created myapp1/app/models/posts.js\n» Created myapp1/app/models/comments.js';

        assert.equal(r1, expected);
        assert.isTrue(fs.existsSync('app/models/posts.js'));
        assert.isTrue(fs.existsSync('app/models/comments.js'));
        assert.isTrue(fs.existsSync('app/models/books.js'));
        
        var modelBuf = 'function BooksModel(app) {\n\n  this.driver = "mongodb:books";\n\n  this.context = "bookstore";\n\n  \
this.validation = {\n\n  }\n\n  this.properties = {\n\n  }\n\n}\n\nBooksModel.methods = {\n\n}\n\nmodule.exports = BooksModel;';
        
        var expectedBuf = fs.readFileSync('app/models/books.js','utf8').trim();

        assert.equal(expectedBuf, modelBuf);

        modelBuf = 'function PostsModel(app) {\n\n  this.driver = "default";\n\n  this.context = "posts";\n\n  \
this.validation = {\n\n  }\n\n  this.properties = {\n\n  }\n\n}\n\nPostsModel.methods = {\n\n}\n\nmodule.exports = PostsModel;';
        
        expectedBuf = fs.readFileSync('app/models/posts.js', 'utf8').trim();
        
        assert.equal(expectedBuf, modelBuf);

      }

    }
  
}).addBatch({
  
  'protos helper': {

    topic: function() {
      var promise = new EventEmitter();

      protos.command('helper helper1 helper2');

      protos.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;
    },

    "Properly generates helpers": function(results) {
      var r1 = results[0];
      var expected =  '» Created myapp1/app/helpers/helper1.js\n» Created myapp1/app/helpers/helper2.js';

      assert.equal(r1, expected);
      assert.isTrue(fs.existsSync('app/helpers/helper1.js'));
      assert.isTrue(fs.existsSync('app/helpers/helper2.js'));

    }

  }
  
}).addBatch({
  
  'protos api': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      protos.command('api sample-method cool-method.js some-other-method');
      
      protos.exec(function(err, results) {
        if (!err) {
          var bufs = {};
          ['api/cool-method.js', 'api/some-other-method.js'].forEach(function(file) {
            bufs[file] = fs.readFileSync(file, 'utf8');
          });
          results.push(bufs);
        }
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly creates files in api/': function(results) {
      var bufs = results.pop();
      
      // Expect proper output in stdout
      assert.equal(results[0], '» Created myapp1/api/sample-method.js\n» Created myapp1/api/cool-method.js\n» Created myapp1/api/some-other-method.js');
      
      // Api files export methods by default
      assert.equal(bufs['api/cool-method.js'], '\n/* api/cool-method.js */\n\nvar app = protos.app;\n\nmodule.exports = {\n\n  coolMethod: function() {\n\n  }\n\n}');
      assert.equal(bufs['api/some-other-method.js'], '\n/* api/some-other-method.js */\n\nvar app = protos.app;\n\nmodule.exports = {\n\n  someOtherMethod: function() {\n\n  }\n\n}');
    }

  }
  
}).addBatch({
  
  'protos config': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      protos.command('config aws session logger');
      
      protos.exec(function(err, results) {
        if (!err) {
          var bufs = {};
          ['config/aws.js', 'config/session.js', 'config/logger.js'].forEach(function(file) {
            bufs[file] = fs.readFileSync(file, 'utf8');
          });
          results.push(bufs);
        }
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly creates files in config/': function(results) {
      var bufs = results.pop();
      
      // Expect proper output in stdout
      assert.equal(results[0], '» Created myapp1/config/aws.js\n» Created myapp1/config/session.js\n» Created myapp1/config/logger.js');
      
      // Api files export methods by default
      assert.equal(bufs['config/aws.js'], '\n/* config/aws.js */\n\nmodule.exports = {\n\n}');
    }

  }
  
}).addBatch({
  
  'protos data': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      fs.mkdirSync('data/');
      fs.writeFileSync('data/test.json', '', 'utf8');
      fs.writeFileSync('data/three.json', '', 'utf8');
      
      protos.command('data test one.json two three.json');
      
      protos.exec(function(err, results) {
        if (!err) {
          fs.unlink('data/test.json', NOOP);
          fs.unlink('data/three.json', NOOP);
          results.push({
            one: fs.readFileSync('data/one.json', 'utf8'),
            two: fs.readFileSync('data/two.json', 'utf8'),
          });
        }
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly creates files in data/': function(results) {
      var r1 = results[0];
      var buf = results[1];
      assert.equal(r1, '» Skipping data/test.json: file exists\nCreated data/one.json\nCreated data/two.json\n» Skipping data/three.json: file exists');
      assert.equal(buf.one, '{}');
      assert.equal(buf.two, '{}');
    }

  }
  
}).addBatch({
  
  'protos hook': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      protos.command('hook init db_event.js update_account remove_user');

      protos.exec(function(err, results) {
        if (!err) {
          var bufs = {};
          ['hook/db_event.js', 'hook/update_account.js', 'hook/remove_user.js'].forEach(function(file) {
            bufs[file] = fs.readFileSync(file, 'utf8');
          });
          results.push(bufs);
        }
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly creates files in hook/': function(results) {
       var bufs = results.pop();
       
       // Expect proper output in stdout
       assert.equal(results[0], '» Created myapp1/hook/init.js\n» Created myapp1/hook/db_event.js\n» Created myapp1/hook/update_account.js\n» Created myapp1/hook/remove_user.js');
       
       // Verify proper code generation
       assert.equal(bufs['hook/db_event.js'], '\n/* hook/db_event.js */\n\nvar app = protos.app;\n\nmodule.exports = function db_event() {\n\n}');
       assert.equal(bufs['hook/update_account.js'], '\n/* hook/update_account.js */\n\nvar app = protos.app;\n\nmodule.exports = function update_account() {\n\n}');
       assert.equal(bufs['hook/remove_user.js'], '\n/* hook/remove_user.js */\n\nvar app = protos.app;\n\nmodule.exports = function remove_user() {\n\n}');
     }
    
  }
  
}).addBatch({
  
  'protos ext': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      protos.command('ext application request response stream');
      
      protos.exec(function(err, results) {
        if (!err) {
          var bufs = {};
          ['ext/request.js', 'ext/response.js', 'ext/stream.js'].forEach(function(file) {
            bufs[file] = fs.readFileSync(file, 'utf8');
          });
        }
        results.push(bufs);
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly creates files in ext/': function(results) {
      var bufs = results.pop();
      
      // Expect proper output in stdout
      assert.equal(results[0], '» Created myapp1/ext/application.js\n» Created myapp1/ext/request.js\n» Created myapp1/ext/response.js\n» Created myapp1/ext/stream.js');
      
      // Verify proper code generation
      assert.equal(bufs['ext/request.js'], '\n/* ext/request.js */\n\nvar app = protos.app;\n\n// Code goes here\n');
      assert.equal(bufs['ext/response.js'], '\n/* ext/response.js */\n\nvar app = protos.app;\n\n// Code goes here\n');
      assert.equal(bufs['ext/stream.js'], '\n/* ext/stream.js */\n\nvar app = protos.app;\n\n// Code goes here\n');
    }
    
  }
  
}).addBatch({
  
  'protos include': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      protos.command('include filters locals');
      
      protos.exec(function(err, results) {
        if (!err) {
          var bufs = {};
          ['include/filters.js', 'include/locals.js'].forEach(function(file) {
            bufs[file] = fs.readFileSync(file, 'utf8');
          });
        }
        results.push(bufs);
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly creates files in include/': function(results) {
      var bufs = results.pop();
      
      // Expect proper output in stdout
      assert.equal(results[0], '» Created myapp1/include/filters.js\n» Created myapp1/include/locals.js');
      
      // Verify proper code generation
      assert.equal(bufs['include/filters.js'], '\n/* include/filters.js */\n\nmodule.exports = {\n\n}');
      assert.equal(bufs['include/locals.js'], '\n/* include/locals.js */\n\nmodule.exports = {\n\n}');
    }
    
  }
  
}).addBatch({
  
  'protos view': {

    topic: function() {
      var promise = new EventEmitter();

      protos.command('view main/info blog/post admin/settings.jade,update.mustache,user');
      protos.command('view main/m1 blog/m2 admin/m3 --ext eco.hbs');

      protos.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;
    },

    "Properly generates views": function(results) {
      var r1 = results[0];
      
      var expected = '» Created myapp1/app/views/main/main-info.hbs\n» Created myapp1/app/views/blog/blog-post.hbs\n» \
Created myapp1/app/views/admin/settings.jade\n» Created myapp1/app/views/admin/update.mustache\n» \
Created myapp1/app/views/admin/admin-user.hbs';

      assert.equal(r1, expected);
      assert.isTrue(fs.existsSync('app/views/main/main-info.hbs'));
      assert.isTrue(fs.existsSync('app/views/blog/blog-post.hbs'));
      assert.isTrue(fs.existsSync('app/views/admin/settings.jade'));
      assert.isTrue(fs.existsSync('app/views/admin/update.mustache'));
      assert.isTrue(fs.existsSync('app/views/admin/admin-user.hbs'));
    },
    
    "Uses custom extensions when using --ext": function(results) {
      var r2 = results[1];
      var expected =  '» Created myapp1/app/views/main/main-m1.eco.hbs\n» \
Created myapp1/app/views/blog/blog-m2.eco.hbs\n» Created myapp1/app/views/admin/admin-m3.eco.hbs';

      assert.equal(r2, expected);
      assert.isTrue(fs.existsSync('app/views/main/main-m1.eco.hbs'));
      assert.isTrue(fs.existsSync('app/views/blog/blog-m2.eco.hbs'));
      assert.isTrue(fs.existsSync('app/views/admin/admin-m3.eco.hbs'));
    }
    
    

  }
  
}).addBatch({
  
    'protos partial': {

      topic: function() {
        var promise = new EventEmitter();

        protos.command('partial blog/post admin/widget');
        protos.command('partial blog/post admin/widget --ext coffee');

        protos.exec(function(err, results) {
          promise.emit('success', err || results);
        });

        return promise;
      },

      "Properly generates view partials": function(results) {
        var r1 = results[0];
        var expected =  '» Created myapp1/app/views/blog/partials/post.hbs\n» Created myapp1/app/views/admin/partials/widget.hbs';

        assert.equal(r1, expected);
        assert.isTrue(fs.existsSync('app/views/blog/partials/post.hbs'));
        assert.isTrue(fs.existsSync('app/views/admin/partials/widget.hbs'));
      },

      "Uses custom extensions when using --ext": function(results) {
        var r2 = results[1];
        var expected =  '» Created myapp1/app/views/blog/partials/post.coffee\n» Created myapp1/app/views/admin/partials/widget.coffee';

        assert.equal(r2, expected);
        assert.isTrue(fs.existsSync('app/views/blog/partials/post.coffee'));
        assert.isTrue(fs.existsSync('app/views/admin/partials/widget.coffee'));
      }

    }
    
}).addBatch({

  'protos layout': {
    
    topic: function() {
      var promise = new EventEmitter();

      protos.command('layout sidebar/display,posts.jade,pages hello.mustache nice/partial');
      protos.command('layout hello hi/there/another/dir/test --ext mustache');

      protos.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;
    },

    "Properly generates layout partials": function(results) {
      var r1 = results[0];
      var expected =  '» Created myapp1/app/views/__layout/sidebar/display.hbs\n» Created myapp1/app/views/__layout/sidebar\
/posts.jade\n» Created myapp1/app/views/__layout/sidebar/pages.hbs\n» Created myapp1/app/views/__layout/hello.mustache\n» \
Created myapp1/app/views/__layout/nice/partial.hbs';
      
      assert.equal(r1, expected);
      assert.isTrue(fs.existsSync('app/views/__layout/sidebar/display.hbs'));
      assert.isTrue(fs.existsSync('app/views/__layout/sidebar/posts.jade'));
      assert.isTrue(fs.existsSync('app/views/__layout/sidebar/pages.hbs'));
      assert.isTrue(fs.existsSync('app/views/__layout/hello.mustache'));
      assert.isTrue(fs.existsSync('app/views/__layout/nice/partial.hbs'));
    },

    "Uses custom extensions when using --ext": function(results) {
      var r2 = results[1];
      var expected =  '» Skipping myapp1/app/views/__layout/hello.mustache: file exists\n» Created myapp1/app/views/__layout/hi/there/another/dir/test.mustache';
      
      assert.equal(r2, expected);
      assert.isTrue(fs.existsSync('app/views/__layout/hello.mustache'));
      assert.isTrue(fs.existsSync('app/views/__layout/hi/there/another/dir/test.mustache'));
    }
    
  }

}).addBatch({
  
  'protos static': {

    topic: function() {
      var promise = new EventEmitter();

      protos.command('static category/post,archive.jade,display about archive/2009/09/index,display.mustache');
      protos.command('static some/view view --ext jade');

      protos.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;
    },

    "Properly generates static views": function(results) {
      var r1 = results[0];
      var expected =  '» Created myapp1/app/views/__static/category/post.hbs\n» Created myapp1/app/views/__static/category/\
archive.jade\n» Created myapp1/app/views/__static/category/display.hbs\n» Created myapp1/app/views/__static/about.hbs\n» \
Created myapp1/app/views/__static/archive/2009/09/index.hbs\n» Created myapp1/app/views/__static/archive/2009/09/display\
.mustache';
      
      assert.equal(r1, expected);
      assert.isTrue(fs.existsSync('app/views/__static/category/post.hbs'));
      assert.isTrue(fs.existsSync('app/views/__static/category/archive.jade'));
      assert.isTrue(fs.existsSync('app/views/__static/category/display.hbs'));
      assert.isTrue(fs.existsSync('app/views/__static/about.hbs'));
      assert.isTrue(fs.existsSync('app/views/__static/archive/2009/09/index.hbs'));
      assert.isTrue(fs.existsSync('app/views/__static/archive/2009/09/display.mustache'));
    },

    "Uses custom extensions when using --ext": function(results) {
      var r2 = results[1];
      var expected =  '» Created myapp1/app/views/__static/some/view.jade\n» Created myapp1/app/views/__static/view.jade';
      
      assert.equal(r2, expected);
      assert.isTrue(fs.existsSync('app/views/__static/some/view.jade'));
      assert.isTrue(fs.existsSync('app/views/__static/view.jade'));
    }

  }
  
}).addBatch({
  
  'protos restricted': {

    topic: function() {
      var promise = new EventEmitter();

      protos.command('restricted category/post,archive.jade,display about archive/2009/09/index,display.mustache');
      protos.command('restricted some/view view --ext jade');

      protos.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;
    },

    "Properly generates restricted views": function(results) {
      var r1 = results[0];
      var expected =  '» Created myapp1/app/views/__restricted/category/post.hbs\n» Created myapp1/app/views/__restricted/category/\
archive.jade\n» Created myapp1/app/views/__restricted/category/display.hbs\n» Created myapp1/app/views/__restricted/about.hbs\n» \
Created myapp1/app/views/__restricted/archive/2009/09/index.hbs\n» Created myapp1/app/views/__restricted/archive/2009/09/display\
.mustache';

      assert.equal(r1, expected);
      assert.isTrue(fs.existsSync('app/views/__restricted/category/post.hbs'));
      assert.isTrue(fs.existsSync('app/views/__restricted/category/archive.jade'));
      assert.isTrue(fs.existsSync('app/views/__restricted/category/display.hbs'));
      assert.isTrue(fs.existsSync('app/views/__restricted/about.hbs'));
      assert.isTrue(fs.existsSync('app/views/__restricted/archive/2009/09/index.hbs'));
      assert.isTrue(fs.existsSync('app/views/__restricted/archive/2009/09/display.mustache'));
    },

    "Uses custom extensions when using --ext": function(results) {
      var r2 = results[1];
      var expected =  '» Created myapp1/app/views/__restricted/some/view.jade\n» Created myapp1/app/views/__restricted/view.jade';

      assert.equal(r2, expected);
      assert.isTrue(fs.existsSync('app/views/__restricted/some/view.jade'));
      assert.isTrue(fs.existsSync('app/views/__restricted/view.jade'));
    }

  }
  
}).addBatch({
  
    'protos handler': {

      topic: function() {
        var promise = new EventEmitter();

        protos.command('handler category/some/nested/directory/handler main/hello,world');

        protos.exec(function(err, results) {
          
          results.push(fs.readFileSync('app/handlers/main/hello.js', 'utf8'));
          
          promise.emit('success', err || results);
        });

        return promise;
      },

      "Properly generates controller handlers": function(results) {
        var r1 = results[0];
        var expected =  '» Created myapp1/app/handlers/category/some/nested/directory/handler.js\n\
» Created myapp1/app/handlers/main/hello.js\n\
» Created myapp1/app/handlers/main/world.js';
        
        assert.equal(r1, expected);
        assert.isTrue(fs.existsSync('app/handlers/category/some/nested/directory/handler.js'));
        assert.isTrue(fs.existsSync('app/handlers/main/hello.js'));
        assert.isTrue(fs.existsSync('app/handlers/main/world.js'));
        
        var buf = results[1];
        var expectedBuf = '\n/* [handler] main/hello.js */\n\nmodule.exports = function() {\n\n  var app = protos.app;\n\n  return function(req, res) {\n\n  }\n\n}';
        
        assert.equal(buf, expectedBuf);
      }

    }
  
}).addBatch({

    'protos link': {
      
      topic: function() {
        var promise = new EventEmitter();
        var check = [];
        var prefixBackup = prefix;
        
        protos.command('create myapp2 --nolink');
        
        protos.exec(function() {
          var target = 'node_modules/protos';
          prefix += '../';
          process.chdir('myapp2');
          protos.command('link');
          check.push(fs.existsSync(target));
          protos.exec(function() {
            check.push(fs.existsSync(target));
            prefix = prefixBackup;
            process.chdir('../');
            promise.emit('success', check);
          });
        });
        
        return promise;
        
      },
      
      "Successfully links protos against application": function(check) {
        assert.deepEqual(check, [false, true]);
      }
      
    }
    
}).addBatch({
  
  'Cleanup': {
    
    topic: function() {
      var promise = new EventEmitter();

      process.chdir('../');
      cp.exec('rm -Rf myapp myapp1 myapp2', function(err, stdout, stderr) {
        promise.emit('success', err);
      });

      return promise;
    },

    "Removed test applications": function(err) {
      assert.isNull(err);
    }
    
  }
  
}).export(module);
