var Q = require('q'),
    tarifaFile = require('./tarifa-file'),
    questions = require('./questions/list'),
    collections = require('./helper/collections'),
    print = require('./helper/print');

function createFromResponse(response) {
    return questions.projectTasks.map(require).reduce(Q.when, response);
}

function mapToResponse(verbose) {
    return function (localSettings) {
        var plugins = Object.keys(localSettings.plugins).map(function (plugin) {
                var pluginObj = localSettings.plugins[plugin];
                var uri, variables, res;
                if(collections.isObject(pluginObj)) {
                    uri = pluginObj.uri;
                    variables = pluginObj.variables;
                } else {
                    uri = pluginObj;
                }
                res = {
                    value: plugin,
                    uri: uri
                };
                if (variables) res.variables = variables;
                return res;
            }),
            response = {
                createProjectFromTarifaFile: true,
                options: {
                    verbose: verbose
                },
                id: localSettings.id,
                name: localSettings.name,
                path: process.cwd(),
                platforms: localSettings.platforms,
                plugins: plugins
            };
        return response;
    };
}

function createFromTarifaJSONFile(projectFolder, verbose) {
    return tarifaFile.parse(projectFolder, null, null, true)
        .then(mapToResponse(verbose))
        .then(createFromResponse);
}

module.exports.createFromTarifaJSONFile = createFromTarifaJSONFile;
module.exports.createFromResponse = createFromResponse;
