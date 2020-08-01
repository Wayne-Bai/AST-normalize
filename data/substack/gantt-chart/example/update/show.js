var str = require('virtual-dom-stringify');
var chart = require('./chart.js');
console.log(str(chart.tree()));
