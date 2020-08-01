var Module;

Module = Lib('system/core/module');

module.exports = {

  'module': {
    'beforeEach': function(){
      for (var x in Module.fileCache) {
        delete Module.fileCache[x];
      }
    },

    'setPaths': {

      'modifies passed object': function(){
        var out = {};

        return Module.setPaths(fixtures.get(['module','app']), out).then(function(_out){
          expect(Object.keys(out)).to.have.members([
            'classes',
            'configs',
            'views'
          ]);
          expect(out).to.equal(_out);
        });
      },

    },

    'can load coffee if asked to': function(){
      var mod = Module({
        name: 'test',
        root: fixtures.get(['module','parent'])
      });

      return mod.loadClass('test').then(function(cls){
        expect(cls.prototype.done).to.be.an('undefined');
        return mod.loadClass('test',['coffee']);
      }).then(function(cls){
        expect(cls.prototype.done()).to.equal('success');
        mod.exts.unshift('coffee');
        return mod.loadClass('test');
      }).then(function(cls){
        expect(cls.prototype.done()).to.equal('success');
      });
    },

    'throw if crucial options are missing': function(){
      expect(function(){
        Module({});
      }).to.throw();

      expect(function(){
        Module({
          root: 'fake/root'
        });
      }).to.throw();

      expect(function(){
        Module({
          name: 'testmodule'
        });
      }).to.throw();

      expect(function(){
        Module({
          name: 'testmodule',
          root: fixtures.get('module'),
          base: true
        });
      }).to.throw();
    },

    'can generate an empty module if no base is specified': function(){
      var mod = Module({
        name: 'empty',
        root: fixtures.get('module')
      });

      return mod.ready.then(function(){
        expect(mod.$names).to.have.members([
          '_config',
          'base',
          'name',
          'exts',
          'paths',
          'classes',
          'parents',
          'factory',
          'ready'
        ]);
      });
    },

    '_toPath': {



    },

    'find': {

      'fetch any file path without a parent': function(){
        var
          s = fixtures.get(['module','parent','vendor']);

        return Module.find('fake.gif', 'vendor', {
          name: 'fetch any file path without a parent',
          paths: {
            'vendor': s
          }
        }).then(function(paths){
          expect(paths).to.deep.equal([{
              path: Module.$.path.join(s, 'fake.gif'),
              arrayPath: ['fake.gif'],
              name: 'fake.gif'
            }]);
        });
      },

      'paths arent defined on starting point': function(){
        var
          config = {
            name: 'paths arent defined on starting point',
            parents: [{
              paths: {
                vendor: fixtures.get(['module','parent','vendor'])
              }
            }]
          };

        return Module.find('fake.gif', 'vendor', config, [], false).then(function(_paths){
          expect(_paths).to.deep.equal([]);
          return Module.find('fake.gif', 'vendor', config);
        }).then(function(_paths){
          expect(_paths).to.deep.equal([{
            path: fixtures.get(['module','parent','vendor','fake.gif']),
            arrayPath: ['fake.gif'],
            name: 'fake.gif'
          }]);
        }).then(function(){
          config.paths = config.parents[0].paths;

          return Module.find('fake2.gif', 'vendor', config, [], false);
        }).then(function(_paths){
          expect(_paths).to.deep.equal([]);
        });
      },

      'fetch all paths within parents bottom up': function(){
        var
          name = 'test.js',
          s = [
            fixtures.get(['module','parent','classes']),
            fixtures.get(['module','app','classes']),
            fixtures.get(['module','parent','vendor'])
          ],
          config = {
            name: 'fetch all paths within parents bottom up root',
            paths: {
              classes: s[1]
            },
            parents: [{
              name: 'fetch all paths within parents bottom up parent',
              paths: {
                classes: s[0]
              }
            }]
          };

        return Module.find(name, 'classes', config).then(function(_paths){
          expect(_paths).to.deep.equal([
            {path: Module.$.path.join(s[0], name), arrayPath: [name], name: name},
            {path: Module.$.path.join(s[1], name), arrayPath: [name], name: name}
          ]);
          config.parents[0].paths.vendor = s[2];
          return Module.find('fake.gif', 'vendor', config);
        }).then(function(_paths){
          expect(_paths).to.deep.equal([
            {path: Module.$.path.join(s[2], 'fake.gif'), arrayPath: ['fake.gif'], name: 'fake.gif'}
          ]);
        });

      },

      'return empty found array': function(){
        var
          s = fixtures.get(['module','parent']),
          path = Module.find('dummy.jade','views', {
            name: 'return empty found array',
            paths: {
              classes: s
            }
          });

        return path.then(function(paths){
          expect(paths).to.deep.equal([]);
        });
      },

      'local find ignore parents': function(){
        var
          s = fixtures.get(['module','app']),
          parent = new Module({
            name: 'parent',
            root: fixtures.get(['module','parent'])
          }),
          mod = new Module({
            root: s,
            name: 'localFind',
            parents: [parent]
          });

        return mod.find('my_config.js','configs').then(function(paths){
          expect(paths).to.deep.equal([{
            path: fixtures.join([s, 'configs','my_config.js']),
            arrayPath: ['my_config.js'],
            name: 'my_config.js'
          }]);
        });
      }

    },

    'loadClass': {

      'merge parent classes': function(){
        var
          parentPath = fixtures.get(['module','parent']),
          appPath = fixtures.get(['module','app']),
          parent = new Module({
            root: parentPath,
            name: 'parent'
          }),
          mod = new Module({
            root: appPath,
            name: 'app',
            parents: [parent]
          });

        return Module.$.Promise.join(parent.ready, mod.ready, function(){
          expect(parent.paths).to.have.keys([
            'classes',
            'configs',
            'vendor'
          ]);

          expect(mod.paths).to.have.keys([
            'classes',
            'configs',
            'views'
          ]);
          expect(mod.classes).to.have.keys(['Config','Factory']);
          return mod.loadClass('test');
        }).then(function(TestClass){
          expect(Module.$.ES5Class.$isES5Class(TestClass)).to.equal(true);
          expect(TestClass.yes).to.be.a('function');
          expect(TestClass.prototype.onProto).to.be.a('function');
          expect(TestClass.yes()).to.equal('super-yes');
        });
      },

      'empty': function(){
        var
          s = [
            fixtures.get(['module','app']),
            fixtures.get(['module','parent'])
          ], app, parent;

        parent = new Module({
          root: s[0],
          name: 'parent'
        });

        app = new Module({
          root: s[1],
          name: 'app'
        });

        app.addParent(parent);

        return app.ready.then(function(){
          return app.loadClass('empty');
        }).then(function(empty){
          expect(empty.prototype).to.be.empty;
        });

      },

      'find in current module context': function(){
        var
          app = fixtures.get(['module','app']),
          mod = new Module({
            root: app,
            name: 'test',
            parents: [new Module({root: fixtures.get(['module','parent']), name: 'parent'})]
          });

        return mod.find('empty.js','classes').then(function(paths){
          expect(paths).to.deep.equal([{
            path: fixtures.join([app, 'classes', 'empty.js']),
            arrayPath: ['empty.js'],
            name: 'empty.js'
          }]);
        });
      },

      'in subfolders': function(){
        var
          app = fixtures.get(['module','app']),
          mod = new Module({
            root: app,
            name: 'test'
          });

        return mod.ready.then(function(){
          expect(Object.keys(mod.classes)).to.deep.equal(['Config','Factory']);

          return mod.loadClass('controllers/home');
        }).then(function(home){
          expect(Module.$.ES5Class.$isES5Class(home)).to.equal(true);
          expect(home.prototype.actionIndex).to.be.a('function');
          expect(home.$className).to.equal('Home');

          return mod.loadClass('levels/deep/file');
        }).then(function(file){
          expect(Module.$.ES5Class.$isES5Class(file)).to.equal(true);
          expect(file).to.be.ok;
          expect(file.$className).to.equal('File');
        });
      },

      'throw on invalid dependency': function(){
        var mod = new Module({
          root: fixtures.get(['module','app']),
          name: 'test'
        }), spy = sinon.spy();

        return mod.ready.then(function(){
          return mod.loadClass('invalid');
        })
        .catch(spy)
        .then(function(){
          return mod.loadClass('invalidRequire');
        })
        .catch(spy)
        .then(function(){
          return mod.loadClass('InvalidDeps');
        })
        .catch(spy)
        .then(function(){
          return mod.loadClass(null);
        })
        .catch(spy)
        .then(function(){
          expect(spy).to.have.callCount(4);
        });
      },

      'extend existing classes': function(){
        var
          app = fixtures.get(['module','app']),
          parentPath = fixtures.get(['module','parent']),
          parent = new Module({
            root: parentPath,
            name: 'parent'
          }),
          mod = new Module({
            root: app,
            name: 'app',
            parents: [parent]
          });

        return mod.ready.then(function(){
          expect(Object.keys(mod.classes)).to.deep.equal(['Config','Factory']);
          return mod.loadClass('models/dummy');
        }).then(function(model){
          expect(model).to.be.ok;
          expect(model.prototype.yes).to.be.a('function');
          expect(model.prototype.onProto).to.be.a('function');
          expect(model().yes()).to.equal('true');
          expect(model.$className).to.equal('Dummy');
        });

      }

    },

    'cascade': {

      'throw if first parameter isnt an array' : function(){
        expect(function(){
          Module.cascade();
        }).to.throw();
      },

      'create a series of modules that cascade between them with plain paths': function(){
        return Module.cascade([
          fixtures.get(['module','parent']),
          fixtures.get(['module','app'])
        ], {name: 'app'})

        .then(function(app){
            return app.ready;
        }).then(function(app){
          expect(app.name).to.equal('app');
          expect(app.parents[0].name).to.equal('Parent');

          expect(Object.keys(app.parents[0].paths)).to.have.members([
            'classes',
            'configs',
            'vendor'
          ]);

          expect(Object.keys(app.paths)).to.have.members([
            'classes',
            'configs',
            'views'
          ]);

          expect(Object.keys(app.classes)).to.deep.equal(['Config','Factory']);

          return app.loadClass('test');
        }).then(function(test){
          expect(test).to.be.ok;
          expect(test.yes()).to.equal('super-yes');
        });
      }

    },

    '$deps': {

      'beforeEach': function(){
        this.mod = new Module({
          root: fixtures.get(['module','app']),
          name: 'app'
        });

        return this.mod.ready;
      },

      'deal with it': function(){
        var mod = this.mod;

        return mod.factory.definition('Base', {}).then(function(){
          return mod.factory.definition('Trunk', {
            $deps: ['base']
          });
        }).then(function(){
          expect(Object.keys(mod.classes)).to.deep.equal(['Config','Factory','Base','Trunk']);
          return mod.factory.definition('Leaves', {
            $deps: ['trunk']
          });
        }).then(function(){
          expect(Object.keys(mod.classes.Leaves.$)).to.deep.equal(['Trunk']);
          expect(Object.keys(mod.classes.Leaves.$.Trunk.$)).to.deep.equal(['Base']);
        });
      },

      'inherits from parent class': function(){
        var mod = this.mod;

        return mod.factory.definition('Base', {}).then(function(){
          return mod.factory.definition('Trunk', {
            $deps: ['base']
          });
        }).then(function(){
          return mod.factory.definition('Oak', {
            $extend: 'Trunk'
          });
        }).then(function(){
          expect(Object.keys(mod.classes.Oak.$)).to.deep.equal(['Base']);
        });

      }
    }

  }
};
