var estraverse = require('estraverse');
var FunctionInfo = require('../obj/function-info');

/**
 * @name FunctionCounters
 * @param {String} apiObjectName
 * @constructor
 * @implements Processor
 */
function FunctionCounters(apiObjectName) {
    this._apiObjectName = apiObjectName;
    this._lastFunctionIndex = 0;
}

var FUNCTION_NODES = {
    FunctionDeclaration: true,
    FunctionExpression: true
};

FunctionCounters.prototype.process = function (source) {
    var _this = this;
    estraverse.traverse(source.getAst(), {
        enter: function (node) {
            if (FUNCTION_NODES[node.type]) {
                _this._lastFunctionIndex++;
                node._functionId = _this._lastFunctionIndex;
            }
        },
        leave: function (node) {
            if (FUNCTION_NODES[node.type]) {
                var functionId = node._functionId;

                var loc = source.locate(node.loc.start.line, node.loc.start.column);
                var locStart = locatePart(node.loc.start);
                var locEnd = locatePart(node.loc.end);

                if (!loc.isExcluded) {
                    var fileInfo = source.ensureFileInfo(loc.filename);
                    var functionInfo = new FunctionInfo(
                        functionId,
                        node.id ? node.id.name : '(anonymous_' + functionId + ')',
                        {start: locStart, end: locEnd}
                    );
                    fileInfo.addFunctionInfo(functionInfo);
                    fileInfo.getStatInfo().registerFunctionId(functionInfo.getId());
                    node.body.body.unshift(_this._createCoverageCounter(loc.relativeFilename, functionId));
                }
            }
        }
    });

    function locatePart(loc) {
        var srcLoc = source.locate(loc.line, loc.column);
        return {line: srcLoc.line, column: srcLoc.column};
    }
};

FunctionCounters.prototype._createCoverageCounter = function (filename, functionId) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                computed: false,
                object: {name: this._apiObjectName, type: 'Identifier'},
                property: {name: 'countFunction', type: 'Identifier'}
            },
            arguments: [
                {type: 'Literal', value: filename},
                {type: 'Literal', value: functionId}
            ]
        }
    };
};

module.exports = FunctionCounters;
