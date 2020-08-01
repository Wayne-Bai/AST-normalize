var assert = require('assert');
var utils = require('../utils');
var utils = require('../index');
var internal = require('../internal');

var buffer = [];
buffer.push('/*auto*/');
buffer.push('b{border-radius:1px}');
buffer.push('a{border-radius:1px 2px 3px 4px}');
buffer.push('a{text-overflow:ellipsis}');
buffer.push('@keyframes test{border-radius:5px}');
buffer.push('div{background:linear-gradient(90deg, #000000, #FFFFFF)}');

var css = buffer.join('\n');
assert.ok(internal.compile_css(css) === 'b{border-radius:1px}a{border-radius:1px 2px 3px 4px}a{text-overflow:ellipsis}@keyframes test{border-radius:5px}@-webkit-keyframes test{border-radius:5px}@-moz-keyframes test{border-radius:5px}@-o-keyframes test{border-radius:5px}div{background:-webkit-linear-gradient(90deg,#000000,#FFFFFF);background:-moz-linear-gradient(90deg,#000000,#FFFFFF);background:-o-linear-gradient(90deg,#000000,#FFFFFF);background:-ms-linear-gradient(90deg,#000000,#FFFFFF);background:linear-gradient(90deg,#000000,#FFFFFF);}', 'automated CSS vendor prefixes');

css = '.input{ }, .input:disabled, .input:hover { background-color: red; } .required{content:"This, field is required"}';
assert.ok(internal.compile_css(css) === '.input{},.input:disabled,.input:hover{background-color:red;}.required{content:"This, field is required"}', 'Problem with content.');

console.log('================================================');
console.log('success - OK');
console.log('================================================');
console.log('');