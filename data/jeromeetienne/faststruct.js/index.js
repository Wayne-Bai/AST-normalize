//
//var buffer	= new ArrayBuffer(24);
//var idView	= new Uint32Array(buffer, 0, 1);  
//var userView	= new Uint8Array(buffer, 4, 16);  
//var amountView	= new Float32Array(buffer, 20, 1);


var FastStruct	= {};

FastStruct.float32	= 1
FastStruct.float64	= 2

typeSize	= {
	int8	: 1,
	int16	: 2,
	int32	: 4,

	uint8	: 1,
	uint16	: 2,
	uint32	: 4,

	float32	: 4,
	float64	: 8
};

var elementDefinition	= [
	{
		label	: 'x',
		type	: FastStruct.float64
	},
	{
		label	: 'y',
		type	: FastStruct.float64
	},
	{
		label	: 'z',
		type	: FastStruct.float64
	},
];

var nElement	= 2;
var ElementSize	= 3 * typeSize.float64;

var buffer	= new ArrayBuffer(nElement * ElementSize);


var xView	= new Float64Array(buffer, 0, buffer.byteLength / typeSize.float64);
var xOffset	= function(idx){
	console.assert( ElementSize/typeSize.float64 === Math.floor(ElementSize/typeSize.float64) );
	return idx * (ElementSize/typeSize.float64);
};
var xGet	= function(idx){
	return xView[xOffset(idx)];
};
var xSet	= function(idx, value){
	xView[xOffset(idx)]	= value;
};