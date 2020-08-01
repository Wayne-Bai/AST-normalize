import { create, hasOwn } from 'utils/object';

var Parser, ParseError, leadingWhitespace = /^\s+/;

ParseError = function ( message ) {
	this.name = 'ParseError';
	this.message = message;
	try {
		throw new Error(message);
	} catch (e) {
		this.stack = e.stack;
	}
};

ParseError.prototype = Error.prototype;

Parser = function ( str, options ) {
	var items, item, lineStart = 0;

	this.str = str;
	this.options = options || {};
	this.pos = 0;

	this.lines = this.str.split( '\n' );
	this.lineEnds = this.lines.map( line => {
		var lineEnd = lineStart + line.length + 1; // +1 for the newline

		lineStart = lineEnd;
		return lineEnd;
	}, 0 );

	// Custom init logic
	if ( this.init ) this.init( str, options );

	items = [];

	while ( ( this.pos < this.str.length ) && ( item = this.read() ) ) {
		items.push( item );
	}

	this.leftover = this.remaining();
	this.result = this.postProcess ? this.postProcess( items, options ) : items;
};

Parser.prototype = {
	read: function ( converters ) {
		var pos, i, len, item;

		if ( !converters ) converters = this.converters;

		pos = this.pos;

		len = converters.length;
		for ( i = 0; i < len; i += 1 ) {
			this.pos = pos; // reset for each attempt

			if ( item = converters[i]( this ) ) {
				return item;
			}
		}

		return null;
	},

	getLinePos: function ( char ) {
		var lineNum = 0, lineStart = 0, columnNum;

		while ( char >= this.lineEnds[ lineNum ] ) {
			lineStart = this.lineEnds[ lineNum ];
			lineNum += 1;
		}

		columnNum = char - lineStart;
		return [ lineNum + 1, columnNum + 1, char ]; // line/col should be one-based, not zero-based!
	},

	error: function ( message ) {
		let pos = this.getLinePos( this.pos );
		let lineNum = pos[0];
		let columnNum = pos[1];

		let line = this.lines[ pos[0] - 1 ];
		let numTabs = 0;
		let annotation = line.replace( /\t/g, ( match, char ) => {
			if ( char < pos[1] ) {
				numTabs += 1;
			}

			return '  ';
		}) + '\n' + new Array( pos[1] + numTabs ).join( ' ' ) + '^----';

		let error = new ParseError( `${message} at line ${lineNum} character ${columnNum}:\n${annotation}` );

		error.line = pos[0];
		error.character = pos[1];
		error.shortMessage = message;

		throw error;
	},

	matchString: function ( string ) {
		if ( this.str.substr( this.pos, string.length ) === string ) {
			this.pos += string.length;
			return string;
		}
	},

	matchPattern: function ( pattern ) {
		var match;

		if ( match = pattern.exec( this.remaining() ) ) {
			this.pos += match[0].length;
			return match[1] || match[0];
		}
	},

	allowWhitespace: function () {
		this.matchPattern( leadingWhitespace );
	},

	remaining: function () {
		return this.str.substring( this.pos );
	},

	nextChar: function () {
		return this.str.charAt( this.pos );
	}
};

Parser.extend = function ( proto ) {
	var Parent = this, Child, key;

	Child = function ( str, options ) {
		Parser.call( this, str, options );
	};

	Child.prototype = create( Parent.prototype );

	for ( key in proto ) {
		if ( hasOwn.call( proto, key ) ) {
			Child.prototype[ key ] = proto[ key ];
		}
	}

	Child.extend = Parser.extend;
	return Child;
};

export default Parser;
