// Warning: Optimized Parser code incoming
// Please don't send me 'cleanups' and rewrites unless
// they're at least on par performance wise

var unicode = require('./unicode.js');

function Parser(text){
    this._text = text;
    this.consumed = 0;
    this.text = text;
    this.tokens = [];
}

Parser.prototype.consume = function(num){
    this.consumed += num;
    var removed = this.text.slice(0, num);
    this.text = this.text.slice(num);
    return removed;
};

Parser.prototype.parse = function(){
    //Tokenize everything
    while(this.text.length){
        this.consumeNext();
    }
    return this.tokens;
};

Parser.prototype.consumeNext = function(){
    var text = this.text;

    var first = text.charCodeAt(0);

    // ' ', '\t', '\n', '\r'
    if(first === 32 || first === 9 || first === 10 || first === 13){
        this.consumeSpace(first);
        return;
    }

    if(this.isWordStart(first)){
         this.consumeWord(first);
         return;
    }

    // ';'
    if(first === 59){
        this.tokens.push(['terminator']);
        this.consume(1);
        return;
    }
    // '{'
    if(first === 123){
        this.tokens.push(['start_body']);
        this.consume(1);
        return;
    }
    // '}'
    if(first === 125){
        this.tokens.push(['end_body']);
        this.consume(1);
        return;
    }
    // '('
    if(first === 40){
        this.tokens.push(['start_head']);
        this.consume(1);
        return;
    }
    // ')'
    if(first === 41){
        this.tokens.push(['end_head']);
        this.consume(1);
        return;
    }
    // ','
    if(first === 44){
        this.tokens.push(['comma']);
        this.consume(1);
        return;
    }
    // '['
    if(first === 91){
        this.tokens.push(['start_access']);
        this.consume(1);
        return;
    }
    // ']'
    if(first === 93){
        this.tokens.push(['end_access']);
        this.consume(1);
        return;
    }
    // ':'
    if(first === 58){
        this.tokens.push(['colon']);
        this.consume(1);
        return;
    }
    // '?'
    if(first === 63){
        this.tokens.push(['conditional']);
        this.consume(1);
        return;
    }
    // '"', '\''
    if(first === 34 || first === 39){
        this.consumeString(first);
        return;
    }

    // /[0-9]/
    if(first >= 48 && first <= 57){
        this.consumeNumber(first);
        return;
    }
    
    var second = text.charCodeAt(1);        

    // '\\', 'u'
    if(first === 92 && second === 117){
        this.consumeWord(); 
        return;
    }

    // '.'
    if(first === 46){
        // /[0-9]/
        if(second >= 48 && second <= 57){
            this.consumeNumber(first);
            return;
        }
        this.tokens.push(['dot']);
        this.consume(1);
        return;
    }

    // '-', '>'
    if(first === 45 && second === 62){
        this.tokens.push(['callback']);
        this.consume(2);
        return;
    }
    
    // '/'
    if(first === 47){
        if(second === 47){
            this.consumeLineComment();
            return;
        }
        // '*'
        if(second === 42){
            this.consumeMultilineComment();
            return;
        }
        if(this.consumeRegEx()){
            return;
        }
    }

    // '|'
    if(first === 124 && second === 124 ){
        this.gotComparator(this.consume(2));
        return;
    }
    
    // '&'
    if( first === 38 && second === 38 ){
        this.gotComparator(this.consume(2));
        return;
    }
    
    var third = text.charCodeAt(2);
    
    // '=', '!'
    if( (first === 61 || first === 33) && second === 61 && third === 61){
        this.gotComparator(this.consume(3)); //!== or ===
        return;
    }
    
    // '=', '!'
    if((first === 61 || first === 33 || first === 60 || first === 62) && second === 61){
        this.gotComparator(this.consume(2)); // != or == or <= or >=
        return;
    }
    
    if(first === 61){
        this.gotAssignment(this.consume(1));
        return;
    }
    
    // '-', '+' 
    if(first === 45 || first === 43) {
        // '='
        if(second === 61){
            this.gotAssignment(this.consume(2));
        } else if(first === second){
            this.gotOperator(this.consume(2));
        } else {
            this.gotOperator(this.consume(1));
        }
        return;
    }

    //'*', '/', '%', '!', '&', '|', '^', '~'
    if(first === 42 || first === 47 ||
       first === 37 || first === 33 ||
       first === 38 || first === 124||
       first === 94 || first === 126){
        // '='
        if(second === 61){
            this.gotAssignment(this.consume(2));
        } else {
            this.gotOperator(this.consume(1));
        }
        return;
    }
     
    // '<'
    if(first === 60){
        if(second === 60){
            this.gotOperator(this.consume(2));
        } else {
            this.gotComparator(this.consume(1));
        }
        return;
    }
  
    // '>'
    if(first === 62){
        if(second === 62){
            if(third ===  62){
                this.gotOperator(this.consume(3));
            } else {
                this.gotOperator(this.consume(2));
            }
        } else {
            this.gotComparator(this.consume(1));
        }
        return;
    }
        
    this.throwError('Unexpected Character: ' + text.charAt(0));
};

Parser.prototype.throwError = function(error){
    //walk backwards to find line start
    var lineStart, char;
    for(lineStart=this.consumed; lineStart>0; lineStart--){
        char = this._text.charAt(lineStart);
        if(char === '\r' || char === '\n'){
            lineStart++; 
            break;
        }
    }
    var lineEnd = lineStart;
    for(; lineEnd>0; lineEnd++){
        char = this._text.charAt(lineEnd);
        if(char === '\r' || char === '\n'){
            break;
        }
    }
    var line = this._text.slice(lineStart, lineEnd);
    console.error(error);
    console.error(line);
    throw new Error(error);
};

Parser.prototype.consumeString = function(terminator){
    var text = this.text;
    var length = text.length;
    var old = terminator;
    var char;
    for(var i = 1; i<length; i++){
        char = text.charCodeAt(i);
        if(char === terminator && old !== 92){
            break;
        }
        if(char === 92 && old === 92){
            char = terminator;
        }
        old = char;
    }
    this.tokens.push(['literal', this.consume(i+1), 'string']);
};

Parser.prototype.consumeNumber = function(){
    var text = this.text;
    var length = text.length;
    var last = -1;
    for(var i = 1; i<length; i++){
        var char = text.charCodeAt(i);
        // /[0-9.e-]/;
        if(!( char >= 48 && char <= 57 ||
              char === 46 || char === 101 ||
              char === 45 && last === 101 //Can only be '-' if last was 'e'
            )){
            break;
        }
        last = char;
    }
    this.tokens.push(['literal', this.consume(i), 'number']);
};

// https://mathiasbynens.be/notes/javascript-identifiers
Parser.prototype.isWordStart = function(char){
    return unicode.identifierStart(char);
};

Parser.prototype.isWordChar = function(char){
    return unicode.identifier(char);
};

Parser.prototype.consumeWord = function(){
    var text = this.text;
    var length = text.length;
    for(var i = 1; i<length; i++){
        var char = text.charCodeAt(i);
        // '\\'
        if(char === 92){
            var next = text.charCodeAt(i+1); 
            // 'u'
            if(next === 117){
                char = parseInt(text.slice(i+2, i+6), 16);
                i+=5;
            }
        }
        if(!this.isWordChar(char)) break;
    }
    var word = this.consume(i);

    if(word === 'function'){
        this.tokens.push(['function']);
    } else {
        this.tokens.push(['word', word]);
    }
};

Parser.prototype.consumeSpace = function(){
    var text = this.text;
    var length = text.length;
    for(var i = 1; i<length; i++){
        var char = text.charCodeAt(i);
        // ' ', '\t', '\r', '\n'
        if(!(char === 32 || char === 9 || 
             char === 10 || char === 13)){
            break;
        }
    }
    this.tokens.push(['space', this.consume(i)]);
};

Parser.prototype.consumeLineComment = function(){
    var text = this.text;
    var length = text.length;
    for(var i = 2; i<length; i++){
        var char = text.charCodeAt(i);
        // '\r', '\n'
        if(char === 13 || char === 10){
            break;
        }
    }
    var char2 = text.charCodeAt(i+1);
    if(char2 === 13 || char2 === 10){
        this.tokens.push(['comment', this.consume(i+1)]);
    } else {
        this.tokens.push(['comment', this.consume(i)]);
    }
};

Parser.prototype.consumeMultilineComment = function(){
    var text = this.text;
    var length = text.length;
    var char2;
    for(var i = 2; i<length; i++){
        var char = text.charCodeAt(i);
        // '/', '*'
        if(char === 47 && char2 === 42){
            break;
        }
        char2 = char;
    }
    this.tokens.push(['comment', this.consume(i)]);
};

Parser.prototype.consumeRegEx = function(){
    var text = this.text;
    var length = text.length;
    var char;
    for(var i = 1; i<length; i++){
        char = text.charCodeAt(i);
        // '\n'
        if(char === 10){
            return false;
        }
        // '/'
        if(char === 47){
            break;
        }
        // '\\'
        if(char === 92){
            i++;
        }
    }

    for(i++; i<text.length; i++){
        char = text.charCodeAt(i);
        // /[gimy]/;
        if(!(char === 103 || char === 105 || char === 109 || char === 121)){
            break;
        }
    }
    var regexEnd = i;

    //look behind
    
    var tokens = this.tokens;
    var word, token, type, stacked;
    for(i=tokens.length-1; i>=0; i--){
        token = tokens[i];
        type = token[0];
        if(type === 'space' || type === 'comment'){
            continue; 
        }
        if(type === 'end_head'){
            // this could either surround a value or be a function head, first
            // jump to the other end of it.
            stacked = 1;
            for(var i2=i-1; i2>=0 && stacked > 0; i2--){
                token = tokens[i2];
                type = token[0];
                if(type === 'end_head'){
                    stacked++;
                }
                if(type === 'start_head'){
                    stacked--;
                }
            }
            if(stacked > 0 || i2 < 0) return false;
            // the only way we could still have a regex, would be that the
            // following word is a special keyword, example:
            // if(true) /regex/
            // even if that makes no sense
            for(i2--; i2>=0; i2--){
                token = tokens[i2];
                type = token[0];
                if(type === 'space' || type === 'comment'){
                    continue; 
                }
                if(type === 'word'){
                    word = token[1];
                    if( word === 'if' || word === 'for' || 
                        word === 'while' || word === 'with'){
                        break;
                    }
                }
                return false;
            }
        }

        if(type === 'literal'){
            // '3 / stuff /' or '"lel" / stuff /'
            return false;   
        }
        if(type === 'word'){ 
            if(token[1] === 'return') break; //could still be 'return /regex';
            return false;
        }

        break;
    }

    var regex = this.consume(regexEnd);
    this.tokens.push(['literal', regex, 'regex']);

    return true;
};

Parser.prototype.gotComparator = function(c){
    this.tokens.push(['comparator', c]);
};

Parser.prototype.gotOperator = function(o){
    this.tokens.push(['operator', o]);
};

Parser.prototype.gotAssignment = function(a){
    this.tokens.push(['assignment', a]);
};

module.exports = Parser;
