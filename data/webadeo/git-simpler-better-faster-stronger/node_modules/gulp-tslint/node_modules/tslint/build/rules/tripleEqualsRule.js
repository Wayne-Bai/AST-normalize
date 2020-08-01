var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OPTION_ALLOW_NULL_CHECK = "allow-null-check";
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (syntaxTree) {
        return this.applyWithWalker(new ComparisonWalker(syntaxTree, this.getOptions()));
    };
    Rule.EQ_FAILURE_STRING = "== should be ===";
    Rule.NEQ_FAILURE_STRING = "!= should be !==";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var ComparisonWalker = (function (_super) {
    __extends(ComparisonWalker, _super);
    function ComparisonWalker() {
        _super.apply(this, arguments);
    }
    ComparisonWalker.prototype.visitBinaryExpression = function (node) {
        var position = this.positionAfter(node.left);
        if (!this.isExpressionAllowed(node)) {
            this.handleOperatorToken(position, node.operatorToken);
        }
        _super.prototype.visitBinaryExpression.call(this, node);
    };
    ComparisonWalker.prototype.isExpressionAllowed = function (node) {
        var nullKeyword = 32 /* NullKeyword */;
        if (this.hasOption(OPTION_ALLOW_NULL_CHECK) && (node.left.kind() === nullKeyword || node.right.kind() === nullKeyword)) {
            return true;
        }
        return false;
    };
    ComparisonWalker.prototype.handleOperatorToken = function (position, operatorToken) {
        var failure = null;
        var operatorKind = operatorToken.kind();
        if (operatorKind === 84 /* EqualsEqualsToken */) {
            failure = this.createFailure(position, TypeScript.width(operatorToken), Rule.EQ_FAILURE_STRING);
        }
        else if (operatorKind === 86 /* ExclamationEqualsToken */) {
            failure = this.createFailure(position, TypeScript.width(operatorToken), Rule.NEQ_FAILURE_STRING);
        }
        if (failure) {
            this.addFailure(failure);
        }
    };
    return ComparisonWalker;
})(Lint.RuleWalker);
