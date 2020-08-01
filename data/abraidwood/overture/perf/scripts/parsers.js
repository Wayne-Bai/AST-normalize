var parsers = [{
    name:'ZeParser2',
    files: [
      'zeparser2/tok.js',
      'zeparser2/par.js',
    ],
    author: 'Peter van der Zee',
    link: 'http://github.com/qfox/zeparser2/',
    run: false,
    options: {
        locations: { fixedVal: false },
        ranges: { fixedVal: false },
        ecmaVersion: { fixedVal: 5 },
        strictSemicolons: { fixedVal: false, },
        allowTrailingCommas: { fixedVal: true, },
        forbidReserved: { fixedVal: false },
        comment: {fixedVal: false}
    },
    runner: function(source, options){
        var par = new Par(source);
        return par.run();
    }
  },{
    name:'Overture',
    files: [
      '../../overture-processed.js'
    ],
    author: 'Alistair Braidwood',
    link: 'https://github.com/abraidwood/overture/',
    run: true,
    options: {
        locations: { defaultVal: false },
        ranges: { fixedVal: false },
        ecmaVersion: { choices:[3,5],defaultVal: 5 },
        strictSemicolons: { defaultVal: false, },
        allowTrailingCommas: { defaultVal: true, },
        forbidReserved: { defaultVal: false },
        onComment: {fixedVal: false}
    },
    runner: function(source, options){
      return overture.parse(source, options);
    }
  },{
    name:'Acorn',
    files: [
      'acorn/acorn.js'
    ],
    author: 'Marijn Haverbeke',
    link: 'https://github.com/marijnh/acorn/',
    run: false,
    options: {
        locations: { defaultVal: false },
        ranges: { defaultVal: false },
        ecmaVersion: { choices:[3,5],defaultVal: 5 },
        strictSemicolons: { defaultVal: false, },
        allowTrailingCommas: { defaultVal: true, },
        forbidReserved: { defaultVal: false },
        onComment: {fixedVal: false}

    },
    runner: function(source, options){
      return acorn.parse(source, options);
    }
  },{
    name:'Esprima',
    files: [
      'esprima/esprima.js'
    ],
    author: 'Ariya Hidayat',
    link: 'http://esprima.org/',
    run: false,
    options: {
        loc: { defaultVal: false },
        range: { defaultVal: false },
        ecmaVersion: { fixedVal: 5 },
        strictSemicolons: { fixedVal: false, },
        allowTrailingCommas: { fixedVal: true, },
        forbidReserved: { fixedVal: false },
        comment: {defaultVal: false}
    },
    runner: function(source, options){
      return esprima.parse(source, options);
    }
}, {
    name:'UglifyJS2',
    files: [
      'uglifyjs2/uglifyjs2.js'
    ],
    author: 'Mihai Bazon',
    link: 'https://github.com/mishoo/UglifyJS2',
    run: false,
    options: {
        loc: { defaultVal: false },
        range: { defaultVal: false },
        ecmaVersion: { fixedVal: 5 },
        strictSemicolons: { fixedVal: false, },
        allowTrailingCommas: { fixedVal: true, },
        forbidReserved: { fixedVal: false },
        comment: {defaultVal: false}
    },
    runner: function(source, options){
      return uglifyjs.parse(source);
    }
}, {
    name:'Traceur',
    files: [
      'traceur/traceur.js'
    ],
    author: '',
    link: 'https://github.com/google/traceur-compiler',
    run: false,
    options: {
    },
    runner: function(source, options){
        var file = new traceur.syntax.SourceFile('name', source);
        var parser = new traceur.syntax.Parser(file, console);
        return parser.parseScript();
    }
}];