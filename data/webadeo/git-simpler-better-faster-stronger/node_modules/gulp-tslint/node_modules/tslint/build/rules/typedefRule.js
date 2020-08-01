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
        return this.applyWithWalker((new TypedefWalker(syntaxTree, this.getOptions())));
    };
    Rule.FAILURE_STRING = "missing type declaration";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var TypedefWalker = (function (_super) {
    __extends(TypedefWalker, _super);
    function TypedefWalker() {
        _super.apply(this, arguments);
    }
    TypedefWalker.prototype.visitCallSignature = function (node) {
        this.checkTypeAnnotation("call-signature", node, node.typeAnnotation);
        _super.prototype.visitCallSignature.call(this, node);
    };
    TypedefWalker.prototype.visitIndexSignature = function (node) {
        this.checkTypeAnnotation("index-signature", node, node.typeAnnotation);
        _super.prototype.visitIndexSignature.call(this, node);
    };
    TypedefWalker.prototype.visitParameter = function (node) {
        this.checkTypeAnnotation("parameter", node, node.typeAnnotation, node.identifier);
        _super.prototype.visitParameter.call(this, node);
    };
    TypedefWalker.prototype.visitPropertySignature = function (node) {
        this.checkTypeAnnotation("property-signature", node, node.typeAnnotation, node.propertyName);
        _super.prototype.visitPropertySignature.call(this, node);
    };
    TypedefWalker.prototype.visitVariableDeclaration = function (node) {
        for (var i = 0, n = node.variableDeclarators.length; i < n; i++) {
            var item = node.variableDeclarators[i];
            this.checkTypeAnnotation("variable-declarator", node, item.typeAnnotation, item.propertyName);
        }
        _super.prototype.visitVariableDeclaration.call(this, node);
    };
    TypedefWalker.prototype.visitMemberVariableDeclaration = function (node) {
        var variableDeclarator = node.variableDeclarator;
        this.checkTypeAnnotation("member-variable-declarator", variableDeclarator, variableDeclarator.typeAnnotation, variableDeclarator.propertyName);
        _super.prototype.visitMemberVariableDeclaration.call(this, node);
    };
    TypedefWalker.prototype.checkTypeAnnotation = function (option, node, typeAnnotation, name) {
        if (this.hasOption(option) && !typeAnnotation) {
            var ns = name ? ": '" + name.text() + "'" : "";
            var failure = this.createFailure(this.positionAfter(node), 1, "expected " + option + ns + " to have a typedef");
            this.addFailure(failure);
        }
    };
    return TypedefWalker;
})(Lint.RuleWalker);
