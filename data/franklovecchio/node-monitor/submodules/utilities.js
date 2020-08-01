var fs = require('fs'),
  Module = {};
/* Override */
Array.prototype.contains = function (obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
};
/* Override */
String.prototype.replace = (function (r) {
  return function (find, replace, replaceOnce) {
    if (typeof find == 'string' && !replaceOnce) {
      find = r.apply(find, [/[\[\]^$*+.?(){}\\\-]/g, function (c) {
        return '\\' + c;
      }]);
      find = new RegExp(find, 'g');
    } else if (typeof find == 'object' && !replaceOnce && !find.global) {
      find = new RegExp(find.source, 'g');
    }
    return r.apply(this, [find, replace]);
  };
})(String.prototype.replace);
UtilitiesManagerModule = function (constants) {
  Module = this;
  Module.constants = constants;
};
UtilitiesManagerModule.prototype.parseCommandLineOptions = function (callback) {
  var count = 0;
  process.argv.forEach(function (value, index, array) {
    if (count != 0 && count != 1) {
      process.env[value.split('=')[0]] = value.split('=')[1];
    }
    count++;
  });
  callback();
};
UtilitiesManagerModule.prototype.parseConfig = function (configFile, callback) { /* Switch to config directory */
  try {
    process.chdir(Module.constants.strings.CONFIG_DIRECTORY);
  } catch (Exception) {
    Module.logger.write(Module.constants.levels.SEVERE, 'Error switching to config directory: ' + Exception);
  }
  fs.readFile(configFile, function (error, fd) {
    if (error) {
      console.log('Error reading master config file, exiting application');
      process.exit(1);
    }
    var splitBuffer = fd.toString().split('\n');
    for (var i = 0; i < splitBuffer.length; i++) {
      var params = splitBuffer[i].split('=');
      if (params[0] != undefined && params[0] != '') {
        process.env[params[0]] = params[1]; 
      }
    }
    callback();
  });
};
UtilitiesManagerModule.prototype.getInstanceId = function (callback) {
  if (process.env[Module.constants.strings.EC2] == Module.constants.strings.TRUE) {
    [Module.constants.strings.INSTANCE_ID].forEach(function (
    parameter) {
      require('child_process').exec(
      Module.constants.strings.EC2_METADATA_SCRIPT + ' --' + parameter + ' | awk \'{print$2}\'', function (error, stdout, stderr) {
        if (error) {
          console.log('Error auto-configuring: ' + error + ', exiting application');
          process.exit(1);
        } else { 
          callback(stdout.toString());
          return;
        }
      });
    });
  }
  callback('none');
};
UtilitiesManagerModule.prototype.getPublicHostname = function (callback) {
  if (process.env[Module.constants.strings.EC2] == Module.constants.strings.TRUE) {
    [Module.constants.strings.PUBLIC_HOSTNAME].forEach(function (
    parameter) {
      require('child_process').exec(
      Module.constants.strings.EC2_METADATA_SCRIPT + ' --' + parameter + ' | awk \'{print$2}\'', function (error, stdout, stderr) {
        if (error) {
          console.log('Error getting EC2 information: ' + error);
        } else { 
          callback(stdout.toString());
        }
      });
    });
  }
  callback('127.0.0.1');
};
UtilitiesManagerModule.prototype.getInternalIP = function (callback) {
  if (process.env[Module.constants.strings.EC2] == Module.constants.strings.TRUE) {
    [Module.constants.strings.LOCAL_IPV4].forEach(function (
    parameter) {
      require('child_process').exec(
      Module.constants.strings.EC2_METADATA_SCRIPT + ' --' + parameter + ' | awk \'{print$2}\'', function (error, stdout, stderr) {
        if (error) {
          console.log('Error getting EC2 information: ' + error);
        } else { 
          callback(stdout.toString());
        }
      });
    });
  }
  callback('127.0.0.1');
};
UtilitiesManagerModule.prototype.isEven = function (number) {
  return (number % 2 == 0) ? true : false;
};
UtilitiesManagerModule.prototype.trim = function (data) {
  data = data.replace(/^\s+/, '');
  for (var i = data.length - 1; i >= 0; i--) {
    if (/\S/.test(data.charAt(i))) {
      data = data.substring(0, i + 1);
      break;
    }
  }
  return data;
};
UtilitiesManagerModule.prototype.generateEpocTime = function () {
  var date = new Date();
  return date.getTime();
};
UtilitiesManagerModule.prototype.generateFormattedDate = function () {
  var date = new Date();
  return date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();
};
UtilitiesManagerModule.prototype.safeEncodeKey = function (key) {
  return key.replace(/\//g, '_');
};
UtilitiesManagerModule.prototype.safeDecodeKey = function (key) {
  return key.replace(/_/g, '/');
};
UtilitiesManagerModule.prototype.isLoneType = function (type) {
  if (type == 'lone') return true;
  return false;
};
UtilitiesManagerModule.prototype.isPollType = function (type) {
  if (type == 'poll') return true;
  return false;
};
UtilitiesManagerModule.prototype.isSelfPollType = function (type) {
  if (type == 'self-poll') 
    return true;
  return false;
};
UtilitiesManagerModule.prototype.validateType = function (type) {
  if (type == 'poll' || type == 'lone' || type === 'self-poll') 
    return true;
  return false;
};
UtilitiesManagerModule.prototype.isEmpty = function (variable) {
  if (variable == 'none' || variable == '' || typeof variable == 'undefined') 
    return true;
  return false;
};
UtilitiesManagerModule.prototype.run = function (command, callback) {
  var exec = require('child_process').exec, child;
  child = exec(command, function (error, stdout, stderr) {
    callback(stdout.toString());
  });
};
UtilitiesManagerModule.prototype.validateData = function (data) {
  try {
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
};
UtilitiesManagerModule.prototype.exit = function (message) {
  console.log(message + ', exiting application');
  process.exit(1);
};
exports.UtilitiesManagerModule = UtilitiesManagerModule;