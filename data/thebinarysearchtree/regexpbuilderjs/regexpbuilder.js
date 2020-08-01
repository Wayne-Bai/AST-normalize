var RegExpBuilder = function () {
    this._flags = "";
    this._literal = [];
    this._groupsUsed = 0;

    this._clear();
}

var self = RegExpBuilder.prototype;

self._clear = function () {
    this._min = -1;
    this._max = -1;
    this._of = "";
    this._ofAny = false;
    this._ofGroup = -1;
    this._from = "";
    this._notFrom = "";
    this._like = "";
    this._either = "";
    this._reluctant = false;
    this._capture = false;
}

self._flushState = function () {
    if (this._of != "" || this._ofAny || this._ofGroup > 0 || this._from != "" || this._notFrom != "" || this._like != "") {
        var captureLiteral = this._capture ? "" : "?:";
        var quantityLiteral = this._getQuantityLiteral();
        var characterLiteral = this._getCharacterLiteral();
        var reluctantLiteral = this._reluctant ? "?" : "";
        this._literal.push("(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")");
        this._clear();
    }
}

self._getQuantityLiteral = function () {
    if (this._min != -1) {
        if (this._max != -1) {
            return "{" + this._min + "," + this._max + "}";
        }
        return "{" + this._min + ",}";
    }
    return "{0," + this._max + "}";
}

self._getCharacterLiteral = function () {
    if (this._of != "") {
        return this._of;
    }
    if (this._ofAny) {
        return ".";
    }
    if (this._ofGroup > 0) {
        return "\\" + this._ofGroup;
    }
    if (this._from != "") {
        return "[" + this._from + "]";
    }
    if (this._notFrom != "") {
        return "[^" + this._notFrom + "]";
    }
    if (this._like != "") {
        return this._like;
    }
}

self.getLiteral = function () {
    this._flushState();
    return this._literal.join("");
}

self._combineGroupNumberingAndGetLiteral = function (r) {
    var literal = this._incrementGroupNumbering(r.getLiteral(), this._groupsUsed);
    this._groupsUsed += r._groupsUsed;
    return literal;
}

self._incrementGroupNumbering = function (literal, increment) {
    if (increment > 0) {
        literal = literal.replace(/[^\\]\\\d+/g, function (groupReference) {
            var groupNumber = parseInt(groupReference.substring(2)) + increment;
            return groupReference.substring(0, 2) + groupNumber;
        });
    }
    return literal;
}

self.getRegExp = function () {
    this._flushState();

    return new RegExp(this._literal.join(""), this._flags);
}

self._addFlag = function (flag) {
    if (this._flags.indexOf(flag) == -1) {
        this._flags += flag;
    }
    return this;
}

self.ignoreCase = function () {
    return this._addFlag("i");
}

self.multiLine = function () {
    return this._addFlag("m");
}

self.globalMatch = function () {
    return this._addFlag("g");
}

self.startOfInput = function () {
    this._literal.push("(?:^)");
    return this;
}

self.startOfLine = function () {
    this.multiLine();
    return this.startOfInput();
}

self.endOfInput = function () {
    this._flushState();
    this._literal.push("(?:$)");
    return this;
}

self.endOfLine = function () {
    this.multiLine();
    return this.endOfInput();
}

self.either = function (r) {
    if (typeof r == "string") {
        return this._eitherLike(new RegExpBuilder().exactly(1).of(r));
    }
    else {
        return this._eitherLike(r);
    }
}

self._eitherLike = function (r) {
    this._flushState();
    this._either = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

self.or = function (r) {
    if (typeof r == "string") {
        return this._orLike(new RegExpBuilder().exactly(1).of(r));
    }
    else {
        return this._orLike(r);
    }
}

self._orLike = function (r) {
    var either = this._either;
    var or = this._combineGroupNumberingAndGetLiteral(r);
    if (either == "") {
        var lastOr = this._literal[this._literal.length - 1];
        lastOr = lastOr.substring(0, lastOr.length - 1);
        this._literal[this._literal.length - 1] = lastOr;
        this._literal.push("|(?:" + or + "))");
    }
    else {
        this._literal.push("(?:(?:" + either + ")|(?:" + or + "))");
    }
    this._clear();
    return this;
}

self.neither = function (r) {
    if (typeof r == "string") {
        return this.notAhead(new RegExpBuilder().exactly(1).of(r));
    }
    return this.notAhead(r);
}

self.nor = function (r) {
    if (this._min == 0 && this._ofAny) {
        this._min = -1;
        this._ofAny = false;
    }
    this.neither(r);
    return this.min(0).ofAny();
}

self.exactly = function (n) {
    this._flushState();
    this._min = n;
    this._max = n;
    return this;
}

self.min = function (n) {
    this._flushState();
    this._min = n;
    return this;
}

self.max = function (n) {
    this._flushState();
    this._max = n;
    return this;
}

self.of = function (s) {
    this._of = this._sanitize(s);
    return this;
}

self.ofAny = function () {
    this._ofAny = true;
    return this;
}

self.ofGroup = function (n) {
    this._ofGroup = n;
    return this;
}

self.from = function (s) {
    this._from = this._sanitize(s.join(""));
    return this;
}

self.notFrom = function (s) {
    this._notFrom = this._sanitize(s.join(""));
    return this;
}

self.like = function (r) {
    this._like = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

self.reluctantly = function () {
    this._reluctant = true;
    return this;
}

self.ahead = function (r) {
    this._flushState();
    this._literal.push("(?=" + this._combineGroupNumberingAndGetLiteral(r) + ")");
    return this;
}

self.notAhead = function (r) {
    this._flushState();
    this._literal.push("(?!" + this._combineGroupNumberingAndGetLiteral(r) + ")");
    return this;
}

self.asGroup = function () {
    this._capture = true;
    this._groupsUsed++;
    return this;
}

self.then = function (s) {
    return this.exactly(1).of(s);
}

self.find = function (s) {
    return this.then(s);
}

self.some = function (s) {
    return this.min(1).from(s);
}

self.maybeSome = function (s) {
    return this.min(0).from(s);
}

self.maybe = function (s) {
    return this.max(1).of(s);
}

self.something = function () {
    return this.min(1).ofAny();
}

self.anything = function () {
    return this.min(0).ofAny();
}

self.anythingBut = function (s) {
    if (s.length == 1) {
        return this.min(0).notFrom([s]);
    }
    this.notAhead(new RegExpBuilder().exactly(1).of(s));
    return this.min(0).ofAny();
}

self.any = function () {
    return this.exactly(1).ofAny();
}

self.lineBreak = function () {
    this._flushState();
    this._literal.push("(?:\\r\\n|\\r|\\n)");
    return this;
}

self.lineBreaks = function () {
    return this.like(new RegExpBuilder().lineBreak());
}

self.whitespace = function () {
    if (this._min == -1 && this._max == -1) {
        this._flushState();
        this._literal.push("(?:\\s)");
        return this;
    }
    this._like = "\\s";
    return this;
}

self.notWhitespace = function () {
    if (this._min == -1 && this._max == -1) {
        this._flushState();
        this._literal.push("(?:\\S)");
        return this;
    }
    this._like = "\\S";
    return this;
}

self.tab = function () {
    this._flushState();
    this._literal.push("(?:\\t)");
    return this;
}

self.tabs = function () {
    return this.like(new RegExpBuilder().tab());
}

self.digit = function () {
    this._flushState();
    this._literal.push("(?:\\d)");
    return this;
}

self.notDigit = function () {
    this._flushState();
    this._literal.push("(?:\\D)");
    return this;
}

self.digits = function () {
    return this.like(new RegExpBuilder().digit());
}

self.notDigits = function () {
    return this.like(new RegExpBuilder().notDigit());
}

self.letter = function () {
    this.exactly(1);
    this._from = "A-Za-z";
    return this;
}

self.notLetter = function () {
    this.exactly(1);
    this._notFrom = "A-Za-z";
    return this;
}

self.letters = function () {
    this._from = "A-Za-z";
    return this;
}

self.notLetters = function () {
    this._notFrom = "A-Za-z";
    return this;
}

self.lowerCaseLetter = function () {
    this.exactly(1);
    this._from = "a-z";
    return this;
}

self.lowerCaseLetters = function () {
    this._from = "a-z";
    return this;
}

self.upperCaseLetter = function () {
    this.exactly(1);
    this._from = "A-Z";
    return this;
}

self.upperCaseLetters = function () {
    this._from = "A-Z";
    return this;
}

self.append = function (r) {
    this.exactly(1);
    this._like = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

self.optional = function (r) {
    this.max(1);
    this._like = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

self._sanitize = function (s) {
    return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

if (typeof exports == 'undefined') {
    exports = {};
}

exports.ignoreCase = function () {
    return new RegExpBuilder().ignoreCase();
}

exports.multiLine = function () {
    return new RegExpBuilder().multiLine();
}

exports.globalMatch = function () {
    return new RegExpBuilder().globalMatch();
}

exports.startOfInput = function () {
    return new RegExpBuilder().startOfInput();
}

exports.startOfLine = function () {
    return new RegExpBuilder().startOfLine();
}

exports.endOfInput = function () {
    return new RegExpBuilder().endOfInput();
}

exports.endOfLine = function () {
    return new RegExpBuilder().endOfLine();
}

exports.either = function (r) {
    return new RegExpBuilder().either(r);
}

exports.neither = function (r) {
    return new RegExpBuilder().neither(r);
}

exports.exactly = function (n) {
    return new RegExpBuilder().exactly(n);
}

exports.min = function (n) {
    return new RegExpBuilder().min(n);
}

exports.max = function (n) {
    return new RegExpBuilder().max(n);
}

exports.ahead = function (r) {
    return new RegExpBuilder().ahead(r);
}

exports.notAhead = function (r) {
    return new RegExpBuilder().notAhead(r);
}

exports.then = function (s) {
    return new RegExpBuilder().then(s);
}

exports.find = function (s) {
    return new RegExpBuilder().find(s);
}

exports.some = function (s) {
    return new RegExpBuilder().some(s);
}

exports.maybeSome = function (s) {
    return new RegExpBuilder().maybeSome(s);
}

exports.maybe = function (s) {
    return new RegExpBuilder().maybe(s);
}

exports.anything = function () {
    return new RegExpBuilder().anything();
}

exports.anythingBut = function (s) {
    return new RegExpBuilder().anythingBut(s);
}

exports.any = function () {
    return new RegExpBuilder().any();
}

exports.lineBreak = function () {
    return new RegExpBuilder().lineBreak();
}

exports.whitespace = function () {
    return new RegExpBuilder().whitespace();
}

exports.notWhitespace = function () {
    return new RegExpBuilder().notWhitespace();
}

exports.tab = function () {
    return new RegExpBuilder().tab();
}

exports.digit = function () {
    return new RegExpBuilder().digit();
}

exports.notDigit = function () {
    return new RegExpBuilder().notDigit();
}

exports.letter = function () {
    return new RegExpBuilder().letter();
}

exports.notLetter = function () {
    return new RegExpBuilder().notLetter();
}

exports.lowerCaseLetter = function () {
    return new RegExpBuilder().lowerCaseLetter();
}

exports.upperCaseLetter = function () {
    return new RegExpBuilder().upperCaseLetter();
}

exports.append = function (r) {
    return new RegExpBuilder().append(r);
}

exports.optional = function (r) {
    return new RegExpBuilder().optional(r);
}