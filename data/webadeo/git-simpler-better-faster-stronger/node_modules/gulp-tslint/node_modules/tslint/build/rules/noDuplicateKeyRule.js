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
        return this.applyWithWalker(new NoDuplicateKeyWalker(syntaxTree, this.getOptions()));
    };
    Rule.FAILURE_STRING = "duplicate key '";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var NoDuplicateKeyWalker = (function (_super) {
    __extends(NoDuplicateKeyWalker, _super);
    function NoDuplicateKeyWalker() {
        _super.apply(this, arguments);
        this.objectKeysStack = [];
    }
    NoDuplicateKeyWalker.prototype.visitObjectLiteralExpression = function (node) {
        this.objectKeysStack.push(Object.create(null));
        _super.prototype.visitObjectLiteralExpression.call(this, node);
        this.objectKeysStack.pop();
    };
    NoDuplicateKeyWalker.prototype.visitSimplePropertyAssignment = function (node) {
        var objectKeys = this.objectKeysStack[this.objectKeysStack.length - 1];
        var keyToken = node.propertyName;
        var key = keyToken.text();
        if (objectKeys[key]) {
            var position = this.getPosition() + TypeScript.leadingTriviaWidth(node);
            var failureString = Rule.FAILURE_STRING + key + "'";
            this.addFailure(this.createFailure(position, TypeScript.width(keyToken), failureString));
        }
        else {
            objectKeys[key] = true;
        }
        _super.prototype.visitSimplePropertyAssignment.call(this, node);
    };
    return NoDuplicateKeyWalker;
})(Lint.RuleWalker);
