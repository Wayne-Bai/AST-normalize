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
        return this.applyWithWalker(new SemicolonWalker(syntaxTree, this.getOptions()));
    };
    Rule.FAILURE_STRING = "missing semicolon";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var SemicolonWalker = (function (_super) {
    __extends(SemicolonWalker, _super);
    function SemicolonWalker() {
        _super.apply(this, arguments);
    }
    SemicolonWalker.prototype.visitVariableStatement = function (node) {
        var position = this.positionAfter(node.modifiers, node.variableDeclaration);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitVariableStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitExpressionStatement = function (node) {
        var position = this.positionAfter(node.expression);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitExpressionStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitReturnStatement = function (node) {
        var position = this.positionAfter(node.returnKeyword, node.expression);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitReturnStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitBreakStatement = function (node) {
        var position = this.positionAfter(node.breakKeyword, node.identifier);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitBreakStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitContinueStatement = function (node) {
        var position = this.positionAfter(node.continueKeyword, node.identifier);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitContinueStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitThrowStatement = function (node) {
        var position = this.positionAfter(node.throwKeyword, node.expression);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitThrowStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitDoStatement = function (node) {
        var position = this.positionAfter(node.doKeyword, node.statement, node.whileKeyword, node.openParenToken, node.condition, node.closeParenToken);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitDoStatement.call(this, node);
    };
    SemicolonWalker.prototype.visitDebuggerStatement = function (node) {
        var position = this.positionAfter(node.debuggerKeyword);
        this.checkSemicolonAt(node.semicolonToken, position);
        _super.prototype.visitDebuggerStatement.call(this, node);
    };
    SemicolonWalker.prototype.checkSemicolonAt = function (token, position) {
        if (token != null) {
            return;
        }
        var adjustedPosition = (position <= this.getLimit()) ? position - 1 : position;
        this.addFailure(this.createFailure(adjustedPosition, 0, Rule.FAILURE_STRING));
    };
    return SemicolonWalker;
})(Lint.RuleWalker);
