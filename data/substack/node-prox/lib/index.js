var mod = module.exports = {
    clients : require('./clients'),
    servers : require('./servers')
};

Object.keys(mod.servers).forEach(function (key) {
    if (!mod[key]) mod[key] = {};
    mod[key].createServer = mod.servers[key];
});

Object.keys(mod.clients).forEach(function (key) {
    if (!mod[key]) mod[key] = {};
    mod[key].createConnection = mod.clients[key];
});
