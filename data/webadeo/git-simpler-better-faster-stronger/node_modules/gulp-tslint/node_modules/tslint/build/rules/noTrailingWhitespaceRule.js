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
        return this.applyWithWalker(new NoTrailingWhitespaceWalker(syntaxTree, this.getOptions()));
    };
    Rule.FAILURE_STRING = "trailing whitespace";
    return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var NoTrailingWhitespaceWalker = (function (_super) {
    __extends(NoTrailingWhitespaceWalker, _super);
    function NoTrailingWhitespaceWalker() {
        _super.apply(this, arguments);
    }
    NoTrailingWhitespaceWalker.prototype.visitToken = function (token) {
        var leadingTrivia = token.leadingTrivia();
        var trailingTrivia = token.trailingTrivia();
        var position = this.getPosition();
        var trailingPosition = position + token.leadingTriviaWidth() + TypeScript.width(token);
        this.checkForTrailingWhitespace(leadingTrivia, position);
        this.checkForTrailingWhitespace(trailingTrivia, trailingPosition);
        _super.prototype.visitToken.call(this, token);
    };
    NoTrailingWhitespaceWalker.prototype.checkForTrailingWhitespace = function (triviaList, position) {
        var start = position;
        for (var i = 0; i < triviaList.count() - 1; i++) {
            var trivia = triviaList.syntaxTriviaAt(i);
            var nextTrivia = triviaList.syntaxTriviaAt(i + 1);
            if (trivia.kind() === 4 /* WhitespaceTrivia */ && nextTrivia.kind() === 5 /* NewLineTrivia */) {
                var width = trivia.fullWidth();
                var failure = this.createFailure(start, width, Rule.FAILURE_STRING);
                this.addFailure(failure);
            }
            start += trivia.fullWidth();
        }
    };
    return NoTrailingWhitespaceWalker;
})(Lint.RuleWalker);
