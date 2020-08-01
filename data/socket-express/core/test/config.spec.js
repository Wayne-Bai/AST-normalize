var Config;

Config = Lib('system/core/config');

module.exports = {

  'config': {

    'create a new config that holds stuff': function (){
      var config;
      config = Config('name');

      expect(config.name).to.equal('name');
    },

    'set using name value': function (){
      var config;

      config = Config('name');
      config.set('new', 'world').set('order', true);

      expect(config.data).to.deep.equal({
        "new": 'world',
        order: true
      });
    },

    'get using name': function (){
      var config;

      config = Config('name', {
        fusrodah: true
      });

      expect(config.get('fusrodah')).to.equal(true);
      expect(config.get('fusrodan', 'noob')).to.equal('noob');
    },

    'append new stuff': function (){
      var config;

      config = Config('name', {
        date: true
      });

      expect(config.data.date).to.equal(true);

      config.set({
        just: 'love'
      });

      expect(config.data).to.deep.equal({
        date: true,
        just: 'love'
      });

      config.set({
        just: 'war'
      });

      expect(config.data).to.deep.equal({
        date: true,
        just: 'war'
      });
    },

    'clone and leave original data untouched and vice-versa': function (){
      var clone, config;

      config = Config('name', {
        date: '2001-01-01'
      });
      clone = config.clone();

      config.set({
        date: '2012-01-01'
      });

      expect(clone.date).to.equal('2001-01-01');
      clone.date = null;

      expect(config.data.date).to.equal('2012-01-01');
    },

    'clone returns undefined on invalid path': function(){
      var config = Config('name', {});

      expect(config.clone('invalid.part')).to.equal(undefined);
    },

    'can clone only part of the config data': function (){
      var config, data;
      config = Config('name', {
        some: {
          deep: {
            property: 'ok'
          }
        }
      });

      data = config.clone('some');

      expect(data).to.deep.equal({
        deep: {
          property: 'ok'
        }
      });

      delete data.deep.property;

      expect(config.data.some.deep.property).to.equal('ok');
    },

    'ignore non object on creation': function (){
      var config;
      config = Config('name', 1);

      expect(config.data).to.deep.equal({});
    },

    'can append another Config instance': function (){
      var config1, config2;

      config1 = Config('config1', {
        hello: 'world'
      });

      config2 = Config('config2', {
        world: 'hello'
      });

      config1.set(config2);

      expect(config1.data).to.deep.equal({
        hello: 'world',
        world: 'hello'
      });

      expect(config2.data).to.deep.equal({
        world: 'hello'
      });

      config1.set({
        "new": 'world'
      });

      config2.set({
        isit: 'world'
      });

      expect(config1.data).to.deep.equal({
        hello: 'world',
        world: 'hello',
        "new": 'world'
      });

      expect(config2.data).to.deep.equal({
        world: 'hello',
        isit : 'world'
      });
    },

    'delete existing data': function (){
      var config;

      config = Config('existing', {
        existing: 'data'
      });

      config.unset('existing');

      expect(config.data.existing).to.be.an('undefined');

    },

    'unset can safely ignore paths': function(){
      var config;

      config = Config('ignored');

      expect(config.unset('doesnt.exist')).to.equal(config);
      expect(config.unset()).to.equal(config);
    },

    'delete existing deep data': function (){
      var config;

      config = Config('existing', {
        existing: {
          deep     : 'data',
          untouched: true
        }
      });

      expect(config.get('existing.deep')).to.equal('data');
      config.unset('existing.deep');

      expect(config.data.existing.deep).to.be.an('undefined');

      expect(config.get('existing')).to.deep.equal({
        untouched: true
      });
    },

    'isset should work on false, null and 0 values': function (){
      var config;

      config = Config('null', {
        isnull : null,
        isfalse: false,
        iszero : 0
      });

      expect(config.isset('isnull')).to.equal(true);

      expect(config.isset('isfalse')).to.equal(true);

      expect(config.isset('iszero')).to.equal(true);
    },

    'wipe clears or exchange all data': function (){
      var config;

      config = Config('yeah', {
        "true": true
      });

      config.wipe({
        "false": false
      });

      expect(config.data).to.deep.equal({
        "false": false
      });

      config.wipe();

      expect(config.data).to.deep.equal({});
    },

    'get works with arrays or dots': function (){
      var config;

      config = Config('deep', {
        deep: {
          array: {
            like: {
              object: 'true'
            }
          }
        }
      });

      expect(config.get('deep.array.like.object')).to.equal('true');
      expect(config.get(['deep', 'array', 'like', 'object'])).to.equal('true');
    },

    'get ignores empty paths': function(){
      var config;

      config = Config('ignored');

      expect(config.get()).to.be.an('undefined');
    },

    'set works with arrays or dots': function (){
      var config;
      config = Config('deep set');

      expect(config.set('deep.array.like.object', 'true').data).to.deep.equal({
        deep: {
          array: {
            like: {
              object: 'true'
            }
          }
        }
      });

      expect(config.set(['deep', 'array', 'like', 'object'], 'false').data).to.deep.equal({
        deep: {
          array: {
            like: {
              object: 'false'
            }
          }
        }
      });
    },

    'set returns object when no path is given': function(){
      var config;

      config = Config('test');

      expect(config.set()).to.equal(config);
    },

    'star env': function (){
      var config, data;

      data = function (){
        return {
          '*'   : {
            'this': {
              'is': 'sparta',
              some: {
                deep: 'property'
              }
            }
          },
          'test': {
            'this': {
              'isnt': 'sparta',
              'is'  : 'persia',
              'some': {
                'deep': 'item'
              }
            }
          }
        };
      };

      config = Config('env', data);

      expect(config.data).to.deep.equal(data());
      expect(config.env('dont exists').data).to.deep.equal(data());
      expect(config.env('test').data).to.deep.equal({
        'this': {
          'is'  : 'persia',
          'isnt': 'sparta',
          'some': {
            'deep': 'item'
          }
        }
      });

      expect(config.envmode).to.equal('test');

      var obj = data();

      obj['development'] = {
        'hoozah': true
      };

      config = Config('env', obj);

      delete process.env.NODE_ENV;

      config.env();

      expect(config.envmode).to.equal('development');
      expect(config.data).to.deep.equal({
        'this'  : {
          'is': 'sparta',
          some: {
            deep: 'property'
          }
        },
        'hoozah': true
      });
    }
  }
};
