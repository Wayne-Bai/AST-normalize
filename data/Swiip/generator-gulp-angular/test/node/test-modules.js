'use strict';
/* jshint expr:true */

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

var _ = require('lodash');

var Generator = require('./mock-generator');
var generator;

var modules = require('../../app/src/modules.js');

describe('gulp-angular generator modules script', function () {

  before(function() {
    modules(Generator);
  });

  beforeEach(function() {
    generator = new Generator();
  });

  it('should compute angular modules selected in a list', function() {
    generator.props = {
      angularModules: [
        { module: 'testAngularModule1' },
        { module: 'testAngularModule2' }
      ],
      resource: { module: null },
      router: { module: 'testModule1' },
      ui: { module: 'testModule2' },
      bootstrapComponents: { module: 'testModule3' },
      foundationComponents: { module: 'testModule4' },
    };
    generator.computeModules();
    generator.modulesDependencies.should.match(/\', \'/);
    generator.modulesDependencies.should.not.match(/null/);
    generator.modulesDependencies.should.match(/testAngularModule1/);
    generator.modulesDependencies.should.match(/testAngularModule2/);
    generator.modulesDependencies.should.match(/testModule1/);
    generator.modulesDependencies.should.match(/testModule2/);
    generator.modulesDependencies.should.match(/testModule3/);
    generator.modulesDependencies.should.match(/testModule4/);
  });

});
