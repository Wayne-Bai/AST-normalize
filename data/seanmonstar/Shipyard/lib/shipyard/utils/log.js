var logging = require('../logging');

module.exports = logging;

logging.getLogger('shipyard.utils.log').warn('shipyard/utils/log has been deprecated. Please use shipyard/logging.');
