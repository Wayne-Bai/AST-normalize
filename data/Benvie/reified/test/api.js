var tap = require("tap");
var test = tap.test;
var DataBuffer = require('../lib/buffer');
var reified;

test('load', function(t){
  console.log('\n** API');
  t.ok(reified = require('../'), 'reified loaded');
  t.similar(Object.keys(reified).sort(), [
    'data','defaultEndian','isData','isType'
  ], 'reified has all expected enumerable names');
  t.similar(Object.getOwnPropertyNames(reified).sort(), [
    'ArrayType','BitfieldType','DataBuffer',
    'NumericType','StructType','Type',
    'arguments','caller','data','defaultEndian',
    'isData','isType','length','name','prototype'
  ], 'reified has all expected names');
  t.end();
});

test('reified as Type constructor', function(t){
  t.equal(reified('Int32'), reified.NumericType.Int32, 'returns correct existing type');
  var int8x10 = reified('Int8[10]');
  var Int8 = reified('Int8');
  t.equal(int8x10.prototype.DataType, 'array', 'name with bracket syntax creates array');
  t.equal(int8x10.count, 10, 'array is correct length');
  t.equal(int8x10.name, 'Int8x10', 'array is correct name');
  t.equal(int8x10, reified('Int8[10]'), 'matching name and type is not recreated');
  t.equal(int8x10, Int8[10], 'bracket notation also returns existing type');
  int8x10.rename('Renamed');
  var instance = new int8x10;
  t.equal(instance.constructor.name, 'Renamed', 'renaming changes existing prototypes');
  t.equal(reified('RGB', { r: 'Uint8', g: 'Uint8', b: 'Uint8' }).inspect(), '‹RGB›(3b) { r: ‹Uint8› | g: ‹Uint8› | b: ‹Uint8› }', 'StructType created');
  t.end();
});

test('reified as Data constructor', function(t){
  var Int32 = reified('Int32');
  var int32 = new reified('Int32', 10000);
  t.equal(reified('Int32'), int32.constructor, 'using `new` constructs Data of right type');
  t.equal(int32.reify(), 10000, 'passes value to real constructor');
  t.similar((new reified('Int32[2][2]')).reify(), [[0,0],[0,0]], 'string constructs multidimensional arrays');
  t.similar((new reified(Int32[2][2])).reify(), [[0,0],[0,0]], 'types constructs multidimensional arrays');
  t.similar(new reified(Int32[2][2], [[1,2],[3,4]]).reify(), [[1,2],[3,4]], 'multidimensional init values are passed');
  function OCT(n){ return [n,0,0,0] }
  var flatten = Function.call.bind([].concat, []);
  var buff = new Buffer(flatten(OCT(1), OCT(2), OCT(3), OCT(4)));
  t.similar((new reified('Int32[2][2]', buff)).reify(), [[1,2],[3,4]], 'Provided buffer reifies correctly');
  t.end();
});


//`reified('Bits', 2)` - If the first parameter is a new name and the second parameter is a number a _‹BitfieldT›_ is created with the specified bytes.
//`reified('Flags', [array of flags...], 2)` - If the second parameter is an array a _‹BitfieldT›_ is created, optionally with bytes specified.
//`reified('FlagObject', { object of flags...}, 2)` - If the second parameter is a non-type object and the third is a number then a _‹BitfieldT›_ is created using the object as a flags object.


