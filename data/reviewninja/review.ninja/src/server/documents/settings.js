var mongoose = require('mongoose');

var SettingsSchema = mongoose.Schema({
    user: Number,
    repo: Number,
    notifications: {
        pull_request: {type: Boolean, default: false},
        issue: {type: Boolean, default: false},
        star: {type: Boolean, default: false}
    },
    watched: [String]
});

var Settings = mongoose.model('Settings', SettingsSchema);

module.exports = {
    Settings: Settings
};
