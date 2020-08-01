module.exports.getName = function (platform) {
    return platform.indexOf('@') > -1 ?  platform.split('@')[0] : platform;
};

module.exports.getVersion = function (platform) {
    return platform.indexOf('@') > -1 ?  platform.split('@')[1] : null;
};
