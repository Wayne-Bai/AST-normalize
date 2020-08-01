var mote = require('../mote.js');
var colors = require('colors');
var fs = require('fs');


function loadSpecsFromFile(filename) {
  var specs = fs.readFileSync(__dirname + '/specs/' + filename + '.json', 'utf8');
  return JSON.parse(specs).tests;
}


function line(str, indentLevel, color) {
  var indent = ''
    , str = color ? str[color] : str;
  while (indentLevel) {
    indent += '  ';
    indentLevel--;
  }
  console.log(indent + str);
}

var stats = {
  error: 0,
  pass: 0,
  fail: 0
}

function runSpec(spec) {
  var error, actual, lambda, source
    , title = spec.name + ': ' + spec.desc
    , status;

  if (source = spec.data.lambda) {
    eval('lambda = ' + source.js);
    spec.data.lambda = lambda;
  }

  try {
    mote.clearCache();
    for (var name in spec.partials) {
      mote.compilePartial(name, spec.partials[name]);
    }

    actual = mote.compile(spec.template)(spec.data);
  } catch(err) {
    error = err;
  }

  if (error) {
    line('[ERROR] ' + title, 0, 'red');
    error.stack.split(/\n/).forEach(function(errorLine) {
      line(errorLine, 1);
    });
    stats.error += 1;
    status = 'error';
  } else if (actual !== spec.expected) {
    line('[FAIL] ' + title, 0, 'red');
    line('expect: '.yellow + JSON.stringify(spec.expected), 2);
    line('actual: '.yellow + JSON.stringify(actual), 2);
    stats.fail += 1;
    status = 'fail';
  } else {
    line('[PASS] ' + title, 0, 'green');
    stats.pass += 1;
    status = 'pass';
  }
  return status;
}

// Run the tests
function runSpecs(specs) {
  var res;
  for (var i = 0; i < specs.length; i++) {
    res = runSpec(specs[i]);
    if (res !== 'pass') break;
  }
}

function printStats() {
  pass = (stats.pass + ' passed').green;
  fail = (stats.fail + ' failed').red;
  err = (stats.error + ' errors').yellow;
  console.log();
  console.log(pass + ', ' + fail + ', ' + err);
}


var spec = process.argv[2];

if (spec === 'all') {
  ['interpolation',
    'sections',
    'comments',
    'inverted',
    'delimiters',
    'partials'].forEach(function(filename) {
      console.log(filename.white);
      specs = loadSpecsFromFile(filename);
      runSpecs(specs);
    });
} else {
  specs = loadSpecsFromFile(spec);
  runSpecs(specs);
}

printStats();
