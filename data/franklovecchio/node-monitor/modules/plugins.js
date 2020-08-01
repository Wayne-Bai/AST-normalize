/* plugins.js */
var fs = require('fs'),
  Module = {},
  location = 'plugins.js';
PluginsManagerModule = function (constants, utilities, logger, dao) {
  Module = this;
  Module.constants = constants;
  Module.utilities = utilities;
  Module.logger = logger;
  Module.dao = dao;
};
PluginsManagerModule.prototype.start = function () {
  Module.logger.write(Module.constants.levels.INFO, 'Evaluating plugins'); 
  /* Switch to plugins directory */
  try {
    process.chdir(Module.constants.strings.PLUGIN_DIRECTORY);
  } catch (Exception) {
    Module.logger.write(Module.constants.levels.SEVERE, 'Error switching to plugins directory: ' + Exception);
  }
  Module.plugins = {};
  var pluginCount = 0;
  var plugins = fs.readdirSync(process.cwd());
  plugins.forEach(function (plugin) { 
    /* Ignore config files */
    if (plugin.indexOf('_config') == -1) {
      plugin = plugin.split('.')[0];
      var loaded = require(process.cwd() + '/' + plugin);
      Module.plugins[loaded.name] = loaded; 
      /* Validate plugin type */
      if (!Module.utilities.validateType(loaded.type)) 
        Module.utilities.exit('Plugin type is not defined');
      Module.logger.write(Module.constants.levels.INFO, 'Loading plugin: ' + loaded.name.toString() + ', of type: ' + loaded.type);
      pluginCount++;
    }
  });
  Module.logger.write(Module.constants.levels.INFO, pluginCount + ' plugin(s) loaded');
  Module.executePlugins();
};
PluginsManagerModule.prototype.executePlugins = function () {
  for (var plugin in Module.plugins) {
    if (Module.utilities.isLoneType(Module.plugins[plugin].type)) {
      Module.logger.write(Module.constants.levels.INFO, 'Starting lone plugin: ' + plugin);
      Module.plugins[plugin].run(Module.constants, Module.utilities, Module.logger, function (pluginName, metricName, unit, value, data) {
        Module.logger.write(Module.constants.levels.INFO, 'Returning metrics for plugin: ' + pluginName);
        Module.dao.postCloudwatch(metricName, unit, value); 
      });   
    }
    if (Module.utilities.isSelfPollType(Module.plugins[plugin].type)) {
      setInterval(function () {
        if (!Module.utilities.isLoneType(Module.plugins[plugin].type)) {
          Module.logger.write(Module.constants.levels.INFO, 'Running self-polling plugin: ' + plugin);
          Module.plugins[plugin].run(Module.constants, Module.utilities, Module.logger);
        }
      }, Number(Module.plugins[plugin].period) * 1000);
    }
  }
  /* Poll-type plugins should be hot-swap */
  setInterval(function () {
    for (var plugin in Module.plugins) {
      if (Module.utilities.isPollType(Module.plugins[plugin].type)) {
        Module.logger.write(Module.constants.levels.INFO, 'Running polling plugin: ' + plugin);
        Module.plugins[plugin].poll(
        Module.constants, Module.utilities, Module.logger, function (pluginName, metricName, unit, value, data) {
          Module.logger.write(Module.constants.levels.INFO, 'Returning metrics for plugin: ' + pluginName);
          Module.dao.postCloudwatch(metricName, unit, value); 
        });
      }
    } /* Duration between poll times */
  }, Number(process.env[Module.constants.strings.PLUGIN_POLL_TIME]) * 1000);
};

exports.PluginsManagerModule = PluginsManagerModule;