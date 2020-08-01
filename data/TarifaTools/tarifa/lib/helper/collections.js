function mergeObject (obj1, obj2) {
  var obj3 = {};
  for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
  for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
  return obj3;
};

function deepMergeObject (obj1, obj2) {
  var into = {},
      keys1 = Object.keys(obj1),
      keys2 = Object.keys(obj2),
      merger = function (obj) {
        return function (key) {
          var val = obj[key],
              isObj = val && typeof val === 'object' &&
                !(val instanceof Date || val instanceof RegExp || val instanceof Array);
          into[key] = isObj ? deepMergeObject(into[key] || {}, val) : val;
        };
      };
  keys1.forEach(merger(obj1));
  keys2.forEach(merger(obj2));
  return into;
};

module.exports.mergeObject = function (obj1, obj2, deep) {
    return deep ? deepMergeObject(obj1, obj2) : mergeObject(obj1, obj2);
};


// find all values for key, deeply
var findByKey = module.exports.findByKey = function (object, key, acc) {
    if (acc === undefined) acc = [];

    for (var prop in object) {
        if (prop === key)
            acc.push(object[prop]);
        if (object[prop] instanceof Object)
            acc = findByKey(object[prop], key, acc);
    }

    return acc;
};


// filter object keys, not deeply
module.exports.filterKeys = function (obj, predicate) {
  var res = {};
  var keys = Object.keys(obj).filter(predicate).forEach(function (e) {
    res[e] = obj[e];
  });

  return res;
};

// map object keys, not deeply
module.exports.mapKeys = function (obj, mapƒ) {
  var res = {};
  var keys = Object.keys(obj);

  keys.forEach(function(e) {
    var newKey = mapƒ(e);
    res[newKey] = obj[e];
  });

  return res;
};

// map object values, not deeply
module.exports.mapValues = function (obj, mapƒ) {
  var ret = {},
      keys = Object.keys(obj);
  keys.forEach(function (key) {
    ret[key] = mapƒ(obj[key]);
  });
  return ret;
};

var toOneLevelObject = module.exports.toOneLevelObject = function (obj, into, prefix) {
  into = into || {};
  prefix = prefix || '';
  var keys = Object.keys(obj);
  keys.forEach(function (key) {
    var val = obj[key],
        isMultiLevel = val && typeof val === 'object' &&
          !(val instanceof Date || val instanceof RegExp || val instanceof Array);
    if (isMultiLevel)
      toOneLevelObject(val, into, prefix + key + '$');
    else
      into[prefix + key] = val;
  });
  return into;
};

module.exports.toMultiLevelObject = function (obj) {
  var keys = Object.keys(obj),
      into = {};
  keys.forEach(function (key) {
    var val = obj[key],
        subKeys = key.split('$'),
        leafKey = subKeys.pop(),
        subObj = into;
    subKeys.forEach(function (subKey) {
      subObj = subObj[subKey] = subObj[subKey] || {};
    });
    subObj[leafKey] = val;
  });
  return into;
};

module.exports.isObject = function(x) {
  return x && typeof x === "object";
};
