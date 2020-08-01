var jade = require('jade'),
    uglify = require('uglify-js'),
    _ = require('underscore'),
    fs = require('fs'),
    jadeRuntime,
    templatefunc,
    main;

var jadeRuntime;

try {
    jadeRuntime = fs.readFileSync(__dirname + '/../jade/runtime.min.js', 'utf-8');
} catch (e) {
    jadeRuntime = fs.readFileSync(__dirname + '/node_modules/jade/runtime.min.js', 'utf-8');
}

var emitter = fs.readFileSync(__dirname + '/src/wildemitter.js', 'utf-8');

// indents each line in a file by 4 spaces or whatever you pass into it
function indent(file, indentAmount) {
    var split = file.split('\n'),
        actualIndent = indentAmount || '    ',
        i = 0,
        l = split.length;
    
    for (; i < l; i++) {
        split[i] = actualIndent + split[i];
    }
    
    return split.join('\n');
}

function beautify(code) {
    var ast = uglify.parser.parse(code);
    return uglify.uglify.gen_code(ast, {beautify: true});
}

function minify(name) {
    var code = fs.readFileSync(__dirname + '/' + name + '.js', 'utf-8'),
        ast = uglify.parser.parse(code),
        pro = uglify.uglify,
        minified;

    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    minified = pro.gen_code(ast); // build out the code

    fs.writeFileSync(__dirname + '/' + name + '.min.js', minified);
}

function build(name) {
    templatefunc = beautify(jade.compile(fs.readFileSync(__dirname + '/src/' + name + '.jade', 'utf-8'), {client: true, compileDebug: false, pretty: true}).toString());
    main = fs.readFileSync(__dirname + '/src/' + name + '.js', 'utf-8').toString().replace("{{{templatefunc}}}", templatefunc);
    main = main.replace("{{{jaderuntime}}}", jadeRuntime);
    main = main.replace("{{{emitter}}}", indent(emitter, '  '));

    fs.writeFileSync(__dirname + '/' + name + '.js', main);
    minify(name);
}

build('dialpad');
