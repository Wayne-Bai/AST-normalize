var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root,'platforms/firefoxos/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName) {
    return path.join(platformsRoot, 'firefoxos', productFileName + '.zip');
};
