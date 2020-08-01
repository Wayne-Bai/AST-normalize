var str = require('virtual-dom-stringify');
var gantt = require('../../');
var g = gantt(require('./chart.json'));
console.log(str(g.tree()));
