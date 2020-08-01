var fs = require('fs');

function load(name){ return fs.readFileSync(name, 'utf8') }

var wrapper = load('./wrapper.js');

var libs = [
  'utility',
  'buffer',
  'genesis',
  'numeric',
  'struct',
  'array',
  'bitfield',
  'pointer',
  'string',
  'index',
].map(function(name){
  return wrap('./'+name, load('../lib/'+name+'.js'));
});

function wrap(name, code){
  return wrapper.replace(/\/\*NAME\*\//g, name).replace(/\/\*CONTENT\*\//g, code);
}

var output = [
  'var reified = function(global, imports){',
  libs.join('\n\n'),
  'return imports["./index"];',
  '}(this, {});',
  'if (typeof module !=="undefined") module.exports = reified'
].join('\n');

output += '\n\n' + load('./DataView/DataView.js');

fs.writeFileSync('../reified-browser.js', output);
fs.writeFileSync('../reified-browser.min.js', compress(output));

function compress(src) {
  var parse = require('uglify-js').parser.parse;
  var ug = require('uglify-js').uglify;
  var opts = { make_seqs: true };
  return ug.gen_code(ug.ast_squeeze_more(ug.ast_squeeze(ug.ast_mangle(parse(src)), opts)));
}
