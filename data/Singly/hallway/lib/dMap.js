var idr = require('idr');
var fs = require('fs');
var path = require('path');
var logger = require('logger').logger('dMap');
var async = require('async');

var maps = {};

// safely run the mapped functions, id required to be parsed idr
function condom(f, data, id, name) {
  var res;
  try {
    res = f(data, id);
  } catch (E) {
    logger.warn("STD", id, name, E, data);
  }
  return res;
}

// util to extract a common key from a raw data json object from a given service
exports.get = function (name, data, base) {
  var r = idr.parse(base);
  var svc = maps[r.host] || {};
  var map = svc[r.protocol] || {};

  if (typeof map[name] === 'function') {
    return condom(map[name], data, r, name);
  }

  return data[map[name] || name];
};

// use a similar pattern for default service-level mapping values
exports.defaults = function (service, name) {
  var svc = maps[service] || {};
  var map = svc.defaults || {};
  return map[name]; // undefined means there's no default type, doh!
};

exports.endpoints = function (serviceName) {
  var service = maps[serviceName];
  if (!service) return ['self'];
  else return Object.keys(service.defaults);
};

// map all the defined fields for an entry
exports.map = function (entry) {
  var ret = {};
  if (!entry || !entry.data) return ret;
  var r = idr.parse(entry.idr);
  if (!r) return ret;
  var svc = maps[r.host] || {};
  var map = svc[r.protocol] || {};
  Object.keys(map).forEach(function (name) {
    if (name === 'at') return;
    var x = (typeof map[name] === 'function') ?
      condom(map[name], entry.data, r, name) :
      entry.data[map[name]];
    if (x) ret[name] = x;
  });
  return ret;
};

// look for a guid if supported
exports.guid = function (entry) {
  if (!entry || !entry.data) return undefined;
  var r = idr.parse(entry.idr);
  if (!r) return undefined;
  var svc = maps[r.host] || {};
  if (!svc.guid || !svc.guid[r.protocol]) return undefined;
  return svc.guid[r.protocol](entry);
};

// turn a profile into all possible bases for it
exports.bases = function (profiles) {
  var ret = [];
  if (!profiles) return ret;
  profiles.forEach(function (profile) {
    var pid = profile.split('@');
    var svc = maps[pid[1]] || {};
    var defaults = svc.defaults;
    if (!defaults) return;
    Object.keys(defaults).forEach(function (context) {
      var r = defaults[context] + ":" + profile + "/" + context;
      ret.push(r);
    });
  });
  return ret;
};

// take an idr and figure out what all kinds of types it could be (usually just
// one)
exports.typeOf = function (id, types) {
  var ret = {};
  id = idr.parse(id);
  var key = idr.toString(idr.key(id));

  Object.keys(maps).forEach(function (service) {
    var types = maps[service].types;
    if (!types) return;
    Object.keys(types).forEach(function (type) {
      if (types[type].indexOf(key) >= 0) ret[type] = true;
    });
  });

  // if there's other internal types, map those too
  if (types) {
    Object.keys(types).forEach(function (type) {
      id.protocol = type;
      exports.typeOf(id).forEach(function (t) {
        ret[t] = true;
      });
    });
  }

  return Object.keys(ret);
};

// across all the given profiles, return an array of bases for a given type
exports.types = function (type, profiles) {
  var ret = [];
  if (!profiles) profiles = Object.keys(maps); // use all types if none
  profiles.forEach(function (profile) {
    var pid = (profile.indexOf('@') > 0) ? profile.split('@') : [false, profile];
    var svc = maps[pid[1]] || {};
    var types = svc.types;
    if (!types) return;
    // list out all possible types
    if (!type) {
      Object.keys(types).forEach(function (stype) {
        if (ret.indexOf(stype) === -1) ret.push(stype);
      });
      return;
    }
    var bases = types[type];
    // XXX: For some reason bases is an object sometimes, maybe when there's no
    // data?
    if (!Array.isArray(bases)) return;
    bases.forEach(function (base) {
      base = idr.clone(base);
      if (pid[0]) base.auth = decodeURIComponent(pid[0]);
      ret.push(idr.toString(base));
    });
  });
  return ret;
};

// load any service maps
exports.load = function () {
  var services = fs.readdirSync(path.join(__dirname, 'services'));

  services.forEach(function (service) {
    var map = path.join(__dirname, 'services', service, 'map.js');

    if (!fs.existsSync(map)) {
      return;
    }

    logger.debug("mapping", map.replace(/^.*?services\//, ''));

    try {
      maps[service] = require(map);
      maps[service]._system = true;
    } catch (E) {
      logger.error("failed to load ", map, E);
    }
  });
};
