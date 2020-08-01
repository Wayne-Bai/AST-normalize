var mongoose = require('mongoose');

var RepoSchema = mongoose.Schema({
    repo: Number,
    comment: {type: Boolean, default: true},
    threshold: {type: Number, min: 1, default: 1}
});

var Repo = mongoose.model('Repo', RepoSchema);

module.exports = {
    Repo: Repo
};
