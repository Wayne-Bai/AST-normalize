var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (syntaxTree) {
        return this.applyWithWalker(new NoDuplicateVariableWalker(syntaxTree, this.getOptions()));
    };
    Rule.FAILURE_STRING = "duplicate variable: '";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var NoDuplicateVariableWalker = (function (_super) {
    __extends(NoDuplicateVariableWalker, _super);
    function NoDuplicateVariableWalker() {
        _super.apply(this, arguments);
    }
    NoDuplicateVariableWalker.prototype.createScope = function () {
        return new ScopeInfo();
    };
    NoDuplicateVariableWalker.prototype.visitVariableDeclarator = function (node) {
        var propertyName = node.propertyName, variableName = propertyName.text(), position = this.getPosition() + TypeScript.leadingTriviaWidth(propertyName), currentScope = this.getCurrentScope();
        if (currentScope.variableNames.indexOf(variableName) >= 0) {
            var failureString = Rule.FAILURE_STRING + variableName + "'";
            this.addFailure(this.createFailure(position, TypeScript.width(propertyName), failureString));
        }
        else {
            currentScope.variableNames.push(variableName);
        }
        _super.prototype.visitVariableDeclarator.call(this, node);
    };
    return NoDuplicateVariableWalker;
})(Lint.ScopeAwareRuleWalker);
var ScopeInfo = (function () {
    function ScopeInfo() {
        this.variableNames = [];
    }
    return ScopeInfo;
})();
