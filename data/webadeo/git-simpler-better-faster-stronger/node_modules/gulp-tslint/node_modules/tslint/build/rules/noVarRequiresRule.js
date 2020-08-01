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
        return this.applyWithWalker(new RequiresWalker(syntaxTree, this.getOptions()));
    };
    Rule.FAILURE_STRING = "require statement not part of an import statment";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var RequiresWalker = (function (_super) {
    __extends(RequiresWalker, _super);
    function RequiresWalker(syntaxTree, options) {
        _super.call(this, syntaxTree, options);
    }
    RequiresWalker.prototype.createScope = function () {
        return {};
    };
    RequiresWalker.prototype.visitInvocationExpression = function (node) {
        if (this.getCurrentDepth() <= 1 && TypeScript.isToken(node.expression)) {
            var expressionText = node.expression.text();
            if (expressionText === "require") {
                var position = this.getPosition() + TypeScript.leadingTriviaWidth(node);
                this.addFailure(this.createFailure(position, TypeScript.width(node), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitInvocationExpression.call(this, node);
    };
    return RequiresWalker;
})(Lint.ScopeAwareRuleWalker);
