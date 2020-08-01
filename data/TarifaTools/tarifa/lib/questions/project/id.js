var validator = require('../../../lib/helper/validator'),
    validateProjectId = validator.toInquirerValidateƒ(validator.isProjectId);

module.exports = {
    type:'input',
    name:'id',
    validate: validateProjectId,
    message:'Choose a default namespace/bundleid/packagename for your project'
};
