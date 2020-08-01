var fs = require('fs');
var path = require('path');
var logger = require('winston').loggers.get('perfectapi');
var util = require('util');

exports.getCommands = getCommands;

exports.getConfigFromPath = function(configPath) {
	var config = JSON.parse(fs.readFileSync(configPath)); 

  return fixBadConfigs(config);
};

function getCommands(rawConfig) {
	var commands = rawConfig.signature;
	
	if (!commands) return logger.error('Bad config ' + JSON.stringify(rawConfig));
	//check if we already ran
	if (commands[commands.length-1].name == "config") return commands;
	
	//setup the PerfectAPI system commands
	commands.push(getServerCommand());
	commands.push(getInstallCommand());
	commands.push(getUnInstallCommand());
	commands.push(getConfigCommand());		//config must be last command, else get repeats!
	
	//set up REST path (endpoint)
	var restPath = rawConfig.path;
	if (!restPath || restPath=="") restPath = "/";
	if (restPath[0]!="/") restPath = "/" + restPath;
	if (restPath.length!=1 && restPath[restPath.length-1]!='/') restPath += '/';
	for (var i=0;i<commands.length;i++) {
		var cmd = commands[i];
		cmd.path = restPath + cmd.name;
    if (!cmd.verb) cmd.verb = 'GET';    //default verb to GET
	}
	
	//setup global environment
	var env = rawConfig.environment;
	if (env) {
		for (var i=0;i<commands.length;i++) {
			var cmd = commands[i];
			if (cmd.environment) {
				//already has an environment specified.  Add to that
				cmd.environment = env.concat(cmd.environment);
			} else {
				cmd.environment = env;
			}
		}		
	}
  
  commands.forEach(function(commandSpec) {
    if (commandSpec.environment) {
      //add hints to indicate whether environment has a value in the running process
      var env = commandSpec.environment;
      env.forEach(function(singleEnv) {
        if (process.env[singleEnv.parameter]) {
          singleEnv.hasValue = true;
        }
      })
    }
    
    if (commandSpec.parameter && commandSpec.parameters && commandSpec.parameters.length > 1) {
      //ensure parameter property is removed - it is misleading otherwise because there are more than 1
      delete commandSpec.parameter
    } else if (commandSpec.parameter) {
      //ensure that parameters array is set to the individual parameter
      commandSpec.parameters = [commandSpec.parameter];
    } else if (!commandSpec.parameters) {
      //always expose the array - makes coding to it simpler
      commandSpec.parameters = [];
    }
  })
	
	return commands;
}

function getUnInstallCommand() {
	var cmd = {};
	cmd.name = "uninstall";
	cmd.preventUseOnServer = true;		//prevent this from being used from a server
	cmd.synopsis = "Uninstall this API running as a service on the local machine";
	cmd.description = "Use this to uninstall the service";
	cmd.options = [];
	cmd.parameter = {name: "name", description: "Unique name for the service", required: true}
	cmd.returns = [];
	
	return cmd;
}

function getInstallCommand() {
	var cmd = {};
	cmd.name = "install";
	cmd.preventUseOnServer = true;		//prevent this from being used from a server
	cmd.synopsis = "Install this API as a service on the local machine";
	cmd.description = "Use this to install and start this API as a service";
	cmd.options = [];
	var option = {};
	option.option = "port"; option.short="p"; option.required=true; option.default=3000; 
	option.description = "Specifies the TCP port on which the API will listen";
	cmd.options.push(option);	
	cmd.parameter = {name: "name", description: "Unique name for the service", required: true}

	cmd.returns = [];
	
	return cmd;
}

function getServerCommand() {
	var cmd = {};
	cmd.name = "server";
	cmd.preventUseOnServer = true;		//prevent this from being used from a server
	cmd.synopsis = "Run this API as a PerfectAPI server";
	cmd.description = "Use this to run as a self-hosted server, capable of responding over the web to the various commands";
  cmd.parameter = {name: "command", required: false, default: "start", description: "either start or stop. You shouldn't need this unless you're manually starting the server from Node.js code"}
	cmd.options = [{option: "webworker", short: "w", default: "auto", description: "Either true, false or auto (true when cpu count greater than 1).  When true, the web server runs as a separate process, insulating it from varying cpu load in user-code."}];
	var option = {};
	option.option = "port"; option.short="p"; option.required=true; option.default=3000; 
	option.description = "Specifies the TCP port on which the API will listen";
	cmd.options.push(option);
	cmd.returns = [];
	
	return cmd;
}

function getConfigCommand() {
	var cmd = {};
	cmd.name = "config";
	cmd.synopsis = "Return the PerfectAPI config for this API";
	cmd.description = "Use this to get information on this API";
	cmd.options = [];
	cmd.verb = "GET";
  cmd.maxage = 7200 * 24;
	var returnCfg = {name: "config", description: "json config file"}
	cmd.returns = [];
	cmd.returns.push(returnCfg);
	
	return cmd;
}

function getCommandByName(config, commandName) {
	var commands = getCommands(config);
	for (var i=0;i<commands.length;i++) {
		if (commands[i].name == commandName) return commands[i];
	}
	
	return null;
}
exports.getCommandByName = getCommandByName;

/*******************************************************
 * Returns the command name matching the given request path
**/
exports.getMatchingCommandByRequestPath = function(config, requestPath) {
	var commands = getCommands(config);
  
  //sort first, reversed.  this is a trick to match more specific paths first
  var sortedCommands = commands.sort(function(a,b) {
    return (a.path < b.path);
  })
  
	for(var i=0;i<sortedCommands.length;i++) {
		if (requestPath.indexOf(sortedCommands[i].path) == 0) //starts with
			return sortedCommands[i].name;
	}
	
	return null;
};

/******************************************************************************
 * Returns a default configuration for the given command.  
 * 
 * Sets all defaults and reads environment from process.env.  
 * All options will exist and have a value (will be '' or false if no default)
 * 
**/
exports.getDefaultConfig = function(config, commandName) {
	var commandSpec = getCommandByName(config, commandName);
	var result = {};
	
	//environment
	var environment = {};
	if (commandSpec.environment) {
		for(var i=0;i<commandSpec.environment.length;i++) {
			var env = commandSpec.environment[i];
			environment[env.parameter] = env.default || '';
			
			//preset it to a default based on current environment
			if (process.env[env.parameter])
				environment[env.parameter] = process.env[env.parameter];
		};
	};
	result.environment = environment;
	
	//parameter
  commandSpec.parameters.forEach(function(param) {
    if (param.type && param.type=='multi') {
      result[param.name] = [];
    } else {
      result[param.name] = ''; 
    }
  })
	
	//options
	var options = {};
	if (commandSpec.options) {
		for(var i=0;i<commandSpec.options.length;i++) {
			var option = commandSpec.options[i];
			
			if (option.option) {
				options[option.option] = option.default || '';
			} else {
				options[option.flag] = option.default || false;
			}
		}
	};
	result.options = options;

	return result;
}

//http://stackoverflow.com/questions/7997342/merge-json-objects-without-new-keys
function merge(defaultConfig, additionalConfig) {	
	for( var p in additionalConfig ) {
		if( defaultConfig.hasOwnProperty(p)) {
			if (typeof additionalConfig[p] === 'object' && !(util.isArray(additionalConfig[p]))) {
				//this is an object, recurse
				defaultConfig[p] = merge(defaultConfig[p], additionalConfig[p]);
			} else {
				//this is an array or otherwise simple property
				defaultConfig[p] = additionalConfig[p];
			}
		}
	};

	return defaultConfig;
}

function fixBadConfigs(config) {	
  if (typeof config !== 'object') return config;
  
	for( var p in config ) {
    if (typeof config[p] === 'object' && !(util.isArray(config[p]))) {
      //this is an object, recurse
      config[p] = fixBadConfigs(config[p]);
    } else if (typeof config[p] === 'object' && util.isArray(config[p])) {
      //could be an array of objects, so we have to fix each element
      var arr = config[p];
      var fixedArray = [];
      for (var i=0;i<arr.length;i++) {
        var fixedVal = fixBadConfigs(arr[i]);
        fixedArray.push(fixedVal);
      }
      config[p] = fixedArray;
    } else {
      //simple property.
      
      //fix bad booleans
      if (config[p] === 'true' || config[p] === 'True') {
        config[p] = true;
        logger.warn('Fixed bad config boolean flag: ' + p + '. (value should not be quoted)');
      }
      if (config[p] === 'false' || config[p] === 'False') {
        config[p] = false;
        logger.warn('Fixed bad config boolean flag: ' + p + '. (value should not be quoted)');
      }
    }
	};

  //fix long options
  if (config.options) {
    config.options.forEach(function(option) {
      var name = option.option || option.flag;
      if (option.long && option.long != name) {
        logger.warn('Fixed, long option name (' + option.long + ') must match option name (' + name + ')');
        option.long = name;
      }
    })
  }
  
	return config;
}

exports.merge = merge;