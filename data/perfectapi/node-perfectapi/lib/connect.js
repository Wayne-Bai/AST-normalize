/**
 * Connect middleware for perfectapi JSON+REST server.  Creates a 
 * request.perfectapi.config property, containing the configuration from the request, and also 
 * request.perfectapi.commandName, containing the command name.  Also 
 * request.perfectapi.errors, containing validation errors.
 *
 * Examples:
 *
 *     connect()
 *       .use(express.bodyParser())
 *       .use(perfectapi.restify(rawConfig))
 *
 * @param {Object} rawConfig - the config
 * @return {Function}
 * @api public
 */

var cfg = require('./config.js');
var url = require('url');
var logger = require('winston').loggers.get('perfectapi');
var util = require('util');

exports.restify = function (rawConfig){
	return function restify(req, res, next) {
		logger.verbose('Matching request...');

		//console.log(req.body);
		//console.log(req.headers);
		
		var matchedCommandName = cfg.getMatchingCommandByRequestPath(rawConfig, url.parse(req.url).pathname);
		if (matchedCommandName)  {
			logger.verbose('Received command, parsing...');
			var commandSpec = cfg.getCommandByName(rawConfig, matchedCommandName);
			
			/* We support the following ways of getting the config data, either individually or in combination:
			 *   - req.body (POST) - should be perfectapi-compatible config in JSON - application/json (default)
       *   - req.body (POST) - as set of name values (form post style) - application/x-www-form-urlencoded 
			 *   - req.query as single "config" param
			 *   - req.query as set of param + options
       *   - req.path, when parameters (not options) are specified as part of the path we are listening on
			*/
			
			var config = cfg.getDefaultConfig(rawConfig, matchedCommandName);
      //console.log('req.headers', req.headers)
      //console.log('req.body', req.body)
			
      if (req.headers['content-type'] == 'application/x-www-form-urlencoded') {
        parseQuery(req.body, config, commandSpec);
      } else {
        //default is application/json
        config = cfg.merge(config, req.body);
      }
			
      //also support querystring
			var query = url.parse(req.url, true).query;
      parseQuery(query, config, commandSpec);
      
      //also support path params.  Unfortunately req.params is not available yet, so we have to parse it out ourselves.
      //very naive parsing...
      var pathParts = req.path.split('/');
      commandSpec.parameters.forEach(function(param) {
        pathParts.forEach(function(part, partIndex) {
          if (param.name.toLowerCase() == part.toLowerCase()) {
            if (pathParts.length > partIndex + 1) {
              config[param.name] = pathParts[partIndex + 1];
            }
          }
        })
      })
      
      parseQuery(req.params, config, commandSpec);
      
			/*
			 * Environment variables should be passed in headers 
			*/
			if (commandSpec.environment) {
				var environment = commandSpec.environment;
				for(var i=0;i<environment.length;i++) {
					var value = req.header(environment[i].parameter, null);
					if (value) {
						config.environment[environment[i].parameter] = value;
          }
				}
			}
			
      /*
        Override environment variables with values found in current environment (server takes precedence).
        This behavior can be overriden by setting the allowOverride attribute on the environment variable.
        (the flag has no effect on the command-line-interface; it is only the server interface that behaves this way).
      */
      if (commandSpec.environment) {
        commandSpec.environment.forEach(function(env) {
          if (!env.allowOverride) {
            var serverValue = process.env[env.parameter]
            if (serverValue) {
              config.environment[env.parameter] = serverValue;
            }
          }
        })
      }
      
			req.perfectapi = {};
			req.perfectapi.commandName = matchedCommandName;
			req.perfectapi.config = config;
			req.perfectapi.errors = validateRequired(config, commandSpec);
      
			//logger.info(JSON.stringify(config, null, 2));
		} else {
			logger.verbose('Not an API request');
		};
		
		next();
	};
};

function parseQuery(query, config, commandSpec) {
  //console.log('query', query)
  for (var qs in query) {
    if (qs == 'config') {
      //get config from "config" value
      config = cfg.merge(config, JSON.parse(query.config));	
    } else if (isParameter(qs, commandSpec)) {
      //parameter
      commandSpec.parameters.forEach(function(param) {
        if (param.name.toLowerCase() == qs.toLowerCase()) {
          if (param.type && (param.type=='multi')) {
            //an array
            if (util.isArray(query[qs])) {
              //?qs=123&qs=345  ==>  [123, 345]
              config[qs] = query[qs];
            } else {
              config[qs] = config[qs] || [];
              config[qs].push(query[qs]);
            }
          } else {
            config[qs] = query[qs];
          }
        }
      })
    } else if (isEnvironmentVariable(qs, commandSpec)) {
      //environment variable - should really be passed in header but we are forgiving
      config.environment = config.environment || {};
      config.environment[qs] = query[qs]; 
    } else {
      //options
      config.options = config.options || {};
      
      if (commandSpec.options) {
        var val = query[qs];
        commandSpec.options.forEach(function(option) {
          if (option.flag && option.flag == qs) {
            //fix boolean flags - convert string values to boolean values
            val = (val === 'true' || val === true) ? true : false;
          }
        })
        config.options[qs] = val;      
      }

    }
  }
}

/* Validate required options, parameters, environment */
function validateRequired(config, commandSpec) {
  var errors = '';
  
  if (commandSpec.parameters) {
    commandSpec.parameters.forEach(function(param) {
      if (param.required == true
      && (config[param.name] == '' || config[param.name] == []) ) {
        errors += 'Parameter ' + param.name + ' is required\n';
      }
    })
  }
  
  if (commandSpec.options) {
    for (var i=0;i<commandSpec.options.length;i++) {
      if (commandSpec.options[i].required
      && commandSpec.options[i].required == true
      && config.options[commandSpec.options[i].option] == '') {
        errors += 'Option ' + commandSpec.options[i].option + ' is required\n';
      }
    }
  }
  
  if (commandSpec.environment) {
    for (var i=0;i<commandSpec.environment.length;i++) {
      if (commandSpec.environment[i].required
      && commandSpec.environment[i].required == true
      && config.environment[commandSpec.environment[i].parameter] == '') {
        errors += 'Environment ' + commandSpec.environment[i].parameter + ' is required\n';
      }      
    }
  }
  
  if (errors != '') errors = errors.substring(0, errors.length-1);   //remove trailing newline
  return errors;
}

function isParameter(name, commandSpec) {
  var result = false;
	commandSpec.parameters.forEach(function(param) {
    if (param.name == name) result = true;
  })
	
	return result;
}

function isEnvironmentVariable(name, commandSpec) {
	if (!commandSpec.environment) return false;
	
	var environment = commandSpec.environment;
	for(var i=0;i<environment.length;i++) {
		if (environment[i].parameter == name)
			return true;
	}
	
	return false;
}










