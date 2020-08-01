var Q = require('q'),
    format = require('util').format,
    validator = require('../../../../helper/validator');

module.exports = function (obj, platformPath) {
    if(!validator.isAndroidPackageName(obj.id))
        return Q.reject(format('[%s.id] %s', platformPath, validator.isAndroidPackageName.error));
    else return Q(obj);
};
