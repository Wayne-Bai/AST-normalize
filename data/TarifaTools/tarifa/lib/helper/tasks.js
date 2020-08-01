var Q = require('q'),
    path = require('path');

function execSequence (tasks) {
    return function (obj) {
        if(!tasks.length) return Q.resolve(obj);
        return tasks.reduce(Q.when, obj);
    };
};

function execTaskSequence(tasks, attr, type) {
    return function (obj) {
        var p = obj.platform,
            list = type ? tasks[p][attr][type] : tasks[p][attr];
        return execSequence(list.map(function (task) {
            return require(path.join(__dirname, '..', '..', task));
        }))(obj);
    };
}

function load(platforms, action, attr) {
    var tasks = {};
    platforms.forEach(function (p) {
        var mod = path.resolve(__dirname, '../platforms', p, 'actions', action);
        tasks[p] = require(mod)[attr].map(function (p) {
            return path.resolve(__dirname, '../..', p);
        });
    });
    return tasks;
}

module.exports = {
    execSequence: execSequence,
    execTaskSequence: execTaskSequence,
    load: load
};
