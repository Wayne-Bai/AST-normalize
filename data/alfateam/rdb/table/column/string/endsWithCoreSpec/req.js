var amock = require('a');
var requireMock = amock.requireMock;
var newBoolean = requireMock('../newBoolean');
var extractAlias = requireMock('../extractAlias');

function act(c) {
	c.newBoolean = newBoolean;
	c.extractAlias = extractAlias;
	c.mock = amock.mock;
	c.column = {};
	c.column._dbName = 'columnName';
	c.operator = 'LIKE';
	c.sut = require('../endsWithCore');
}

module.exports = act;