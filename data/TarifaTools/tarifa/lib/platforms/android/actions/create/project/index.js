var path = require('path'),
    root = __dirname,
    tasks = [
        'tasks/create-keystore'
    ];

module.exports.tasks = tasks.map(function (task) {
    return path.resolve(root, task);
});
