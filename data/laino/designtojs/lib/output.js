

function Output(tokens, options){
    this.tokens = tokens;
    this.options = options;
}

Output.prototype.output = function(){
    var tokens = this.tokens;

    var string = '';
    if(this.options.tokens){
        string = JSON.stringify(tokens);
    } else {
        for(var i=0; i<tokens.length; i++){
            string += this.print(tokens[i]);
        }
    }
    return string;
};

var printLookup = {
    'start_head': '(',
    'end_head': ')',
    'start_body': '{',
    'end_body': '}',
    'start_access': '[',
    'end_access': ']',
    'colon': ':',
    'comma': ',',
    'terminator': ';',
    'callback': '->',
    'function': 'function',
    'dot': '.',
    'conditional': '?',
};

Output.prototype.print = function(token){
    var type = token[0];

    if(type === 'word' || type === 'space' || type === 'comment' || type === 'comparator' || type === 'operator' || type === 'literal' || type === 'assignment'){
        return token[1];
    }
    var lookup = printLookup[type];
    if(lookup){
        return lookup;
    }
    return "UNKNOWN# "+JSON.stringify(token);
};


module.exports = Output;
