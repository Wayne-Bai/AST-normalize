describe('Module loader', function() {
  it('should be able to add new module', function() {
    var moduleBody = function() {
      return 10305;
    };
    wd.module('testModule1').body(moduleBody);
    // 侵入式获取Module Loader
    var moduleLoader = wd.ModuleLoader._moduleTable['testModule1'];
    expect(moduleLoader).to.be.ok;
    expect(moduleLoader).to.be.a(wd.ModuleLoader);
    expect(moduleLoader._instance).to.eql(10305);
  });

  it('should be able to use dependencies correctly', function() {
    wd.module('testModule2-1').body(function() {
      return 10305;
    });

    wd.module('testModule2-2').body(function() {
      return 20608;
    });

    wd.module('testModule2-3')
    .require('testModule2-1', 'dep1')
    .require('testModule2-2', 'dep2')
    .body(function() {
      return dep1 + dep2;
    });

    wd.module('testModule2')
    .require('testModule2-1', 'dep1')
    .require('testModule2-2', 'dep2')
    .require('testModule2-3', 'dep3')
    .body(function() {
      expect(dep1).to.eql(10305);
      expect(dep2).to.eql(20608);
      expect(dep3).to.eql(10305 + 20608);
      return dep1 * dep2 * dep3;
    });
    
    wd.module()
    .require('testModule2', 'dep')
    .run(function() {
      expect(dep).to.eql(10305 * 20608 * (10305 + 20608));
    });
  });
});