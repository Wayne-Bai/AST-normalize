// Create a Buffer of 10 bytes
var buffer = new Buffer(10);
// Modify a value
buffer[0] = 255;
// Log the buffer
console.log(buffer);
// outputs: <Buffer ff 00 00 00 00 00 4a 7b 08 3f>

var str='this is a buffer test!';

var bufFromStr=new Buffer(str,encoding='utf8');
console.log(bufFromStr);

var bufFromArr=new Buffer([1,2,3,4,5]);
console.log(bufFromArr);

//memcpy
var buf=new Buffer(10);
buf.copy(bufFromStr, targetStart=0, sourceStart=0, sourceEnd=10);
console.log(buf);

var buffer = new Buffer('Hyvää päivää!'); // create a buffer containing “Good day!” in Finnish
var str = 'Hyvää päivää!'; // create a string containing “Good day!” in Finnish
// log the contents and lengths to console
console.log(buffer);
console.log('Buffer length:', buffer.length);
console.log(str);
console.log('String length:', str.length);
