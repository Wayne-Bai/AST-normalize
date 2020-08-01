;(function(wd) {
  /**
   * 模块配置类。每一个该类的实例对应创建一个模块的相关配置。
   *
   * @module  wd.module
   * @class  ModuleLoader
   * @constructor
   * @param {String} modulePath 模块的路径名
   */
  function ModuleLoader(modulePath) {
    this.path = modulePath;
    this._depTable = {};
    this._body = null;
    this._depLength = 0;
    this._instance = null; // 模块body执行后得到的对象
    this._loaded = false;

    ModuleLoader._moduleTable[modulePath] = this;
  }

  /**
   * 当前应用程序中已经注册（不一定loaded）的所有模块对应的ModuleLoader
   * @property _moduleTable
   * @private
   * @type {Object}
   */
  ModuleLoader._moduleTable = {};

  /**
   * 当有新的模块加载成功时，检查其他所有模块是否已经加载完毕
   *
   * @method  _refreshModuleState
   * @private
   */
  ModuleLoader._refreshModuleState = function() {
    var tbl = ModuleLoader._moduleTable,
      newModuleLoaded = false; // 在本次检查中有至少一个模块loaded
    for (var modulePath in tbl) {
      var moduleLoader = tbl[modulePath];
      if (!moduleLoader._loaded) {
        newModuleLoaded = newModuleLoaded || ModuleLoader._checkDependenciesResolved(moduleLoader);
      }
    }
    if (newModuleLoaded) {
      ModuleLoader._refreshModuleState(); // 再次刷新
    }
  };

  /**
   * 检查模块的所有依赖模块是否都已经loaded，如果是，将_loaded置为true
   *
   * @method  _checkDependenciesResolved
   * @static
   * @private
   * @param  {ModuleLoader} moduleLoader 待检查的模块
   * @return {Boolean}      依赖模块是否已经loaded
   */
  ModuleLoader._checkDependenciesResolved = function(moduleLoader) {
    for (var modulePath in moduleLoader._depTable) {
      var dep = ModuleLoader._moduleTable[modulePath];
      if (!dep && !dep._loaded) {
        return false;
      }
    }
    moduleLoader._loaded = true;
    return true;
  };

  /**
   * 获取模块实例
   *
   * @static
   * @method getModuleInstance
   * @param  {String} modulePath 模块的路径
   * @return {Object}            模块实例
   */
  ModuleLoader.getModuleInstance = function(modulePath) {
    if (!modulePath) {
      // should provide modulePath
    }
    else if (!ModuleLoader._moduleTable[modulePath]) {
      // module not registered
    }
    else if (!ModuleLoader._moduleTable[modulePath]._loaded) {
      // module not loaded
    }
    return ModuleLoader._moduleTable[modulePath]._instance;
  };

  /**
   * 为模块添加一个依赖模块
   *
   * @method require
   * @param  {String} depModulePath 依赖模块的路径名
   * @param  {String} alias         模块的别名
   * @return {ModuleLoader}         配置后的模块配置实例
   * @chainable
   */
  ModuleLoader.prototype.require = function(depModulePath, alias) {
    this._depTable[depModulePath] = {
      alias: alias  
    };
    this._depLength++;
    return this;
  };

  /**
   * 定义模块主体
   *
   * @method  body
   * @param  {String} fn 模块主体函数
   */
  ModuleLoader.prototype.body = function(fn) {
    this._body = fn;
    if (this._depLength === 0) {
      // 无依赖模块，标记为_loaded，并刷新所有模块的_loaded
      this._loaded = true;
    }
    ModuleLoader._refreshModuleState();
    if (this._loaded) {
      this._exec();
    }
  };

  /**
   * 立即运行模块主体
   *
   * @param  {String} fn 立即运行模块主体函数
   */
  ModuleLoader.prototype.run = function(fn) {
    this._body = fn;
    this._exec();
  };


  /**
   * 执行模块body，并获取模块实例。
   *
   * @private
   * @method  _exec
   */
  ModuleLoader.prototype._exec = function() {
    // 闭包函数中依赖模块存储的变量的定义
    var vars = '';
    // 加载所有依赖模块实例
    for (var modulePath in this._depTable) {
      var moduleLoader = ModuleLoader._moduleTable[modulePath],
        alias = this._depTable[modulePath].alias,
        varname = alias ? alias : modulePath;
      vars += ['var ', varname, ' = ', JSON.stringify(moduleLoader._instance), ';'].join('');
    }
    // 动态创建闭包函数
    var wrapperFn = new Function([vars, 'return (', this._body ,')();'].join(''));
    // 执行模块body，获取模块实例
    this._instance = wrapperFn();
  };



  wd.ModuleLoader = ModuleLoader;
})(wd);