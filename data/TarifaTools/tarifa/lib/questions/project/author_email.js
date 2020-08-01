var validator = require('../../../lib/helper/validator'),
    validateEmail = validator.toInquirerValidateƒ(validator.isEmail),
    Configstore = require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    type:'input',
    name:'author_email',
    message:'What\'s your email?',
    validate: function (answer) {
        return !answer.length || validateEmail(answer);
    },
    default:conf.get('author_email')
};
