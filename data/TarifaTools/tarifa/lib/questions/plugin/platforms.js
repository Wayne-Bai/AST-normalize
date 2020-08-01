var settings = require('../../settings');

module.exports = {
    type : 'checkbox',
    name : 'platforms',
    choices : settings.platforms,
    validate: function (answer) {
        return answer.length > 0 || 'one platform mandatory!';
    },
    message : 'Choose the platforms your plugin shall support'
};
