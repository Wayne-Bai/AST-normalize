function prepStack(msg, str) {
	//stack is a string
	var stack = str.split('\n');
	stack[0] = msg;
	stack.splice(1, 1); // remove "new ShipyardError()" line
	return stack.join('\n');
}

function ShipyardError(msg) {
	this.name = 'ShipyardError';
	this.message = msg;
	this.stack = prepStack([this.name, msg].join(': '), new Error().stack);
}

ShipyardError.prototype = new Error();
ShipyardError.prototype.constructor = ShipyardError;

module.exports = ShipyardError;
