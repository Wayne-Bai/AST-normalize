var fs = require('fs');
var path = require('path');
var jsesc = require('jsesc');
var regenerate = require('regenerate');
var mkdirp = require('mkdirp');
require('string.fromcodepoint');

var range = function(start, stop) {
	// inclusive, e.g. `range(1, 3)` → `[1, 2, 3]`
	for (var result = []; start <= stop; result.push(start++));
	return result;
};

var object = {};
var hasOwnProperty = object.hasOwnProperty;
var hasKey = function(object, key) {
	return hasOwnProperty.call(object, key);
};

var append = function(object, key, value) {
	if (hasKey(object, key)) {
		object[key].push(value);
	} else {
		object[key] = [value];
	}
};

var writeFiles = function(options) {
	var version = options.version;
	var map = options.map;
	if (map == null) {
		return;
	}
	var dirMap = {};
	var auxMap = {};
	Object.keys(map).forEach(function(item) {
		var codePoints = map[item];
		var type = typeof options.type == 'function'
			? options.type(item)
			: options.type;
		var isCaseFolding = type == 'case-folding';
		var isBidiProperty = type == 'bidi';
		if (isBidiProperty) {
			item = item.replace(/^Bidi_/, '');
		}
		var dir = path.resolve(
			__dirname, '..',
			'output', 'unicode-' + version, type, item
		);
		if (
			type == 'bidi' || type == 'bidi-mirroring' || type == 'bidi-brackets' ||
			(type == 'categories' && /^[A-Z][a-z]$/.test(item))
		) {
			if (!auxMap[type]) {
				auxMap[type] = [];
			}
			codePoints.forEach(function(codePoint) {
				console.assert(!auxMap[type][codePoint]);
				auxMap[type][codePoint] = item;
			});
		}
		if (type == 'bidi-mirroring') {
			return;
		}
		append(dirMap, type, item);
		// Create the target directory if it doesn’t exist yet
		mkdirp.sync(dir);
		// Save the data to a file
		fs.writeFileSync(
			path.resolve(dir, 'code-points.js'),
			'module.exports=' + jsesc(codePoints)
		);
		if (!isCaseFolding) {
			fs.writeFileSync(
				path.resolve(dir, 'regex.js'),
				'module.exports=/' + regenerate(codePoints).toString() + '/'
			);
		}
		fs.writeFileSync(
			path.resolve(dir, 'symbols.js'),
			'module.exports=' + jsesc(
				isCaseFolding ?
					Object.keys(codePoints).reduce(function(result, current) {
						var mappings = codePoints[current];
						if (Array.isArray(mappings)) {
							mappings = String.fromCodePoint.apply(null, mappings);
						} else {
							mappings = String.fromCodePoint(mappings);
						}
						result[String.fromCodePoint(current)] = mappings;
						return result;
					}, {}) :
					codePoints.map(function(codePoint) {
						return String.fromCodePoint(codePoint);
					}))
		);
	});
	Object.keys(auxMap).forEach(function(type) {
		var dir = path.resolve(
			__dirname, '..',
			'output', 'unicode-' + version, type
		);
		if (!hasKey(dirMap, type)) {
			dirMap[type] = [];
		}
		mkdirp.sync(dir);
		var output = '';
		if (/^(bidi-mirroring|bidi-brackets)$/.test(type)) {
			output += 'var x=[];';
			Object.keys(auxMap[type]).forEach(function(key) {
				// It seems like it would be nice to map both the code point
				// and the character, but that causes problems with `'0'` vs.
				// code point U+0000 etc., as property names are stored as strings in
				// JavaScript.
				output += 'x[' + key + ']=' +
					jsesc(auxMap[type][key], {
						'wrap': true
					}) + ';';
			});
			output += 'module.exports=x';
		} else {
			output = 'module.exports=' + jsesc(auxMap[type]);
		}
		fs.writeFileSync(
			path.resolve(dir, 'index.js'),
			output
		);
	});
	return dirMap;
};

var extend = function(destination, source) {
	for (var key in source) {
		if (hasKey(source, key)) {
			if (!hasKey(destination, key)) {
				destination[key] = [];
			}
			source[key].forEach(function(item) {
				append(destination, key, item);
			});
		}
	}
};

var readDataFile = function(version, type) {
	var sourceFile = path.resolve(
		__dirname, '..',
		'data', version + '-' + type + '.txt'
	);
	if (!fs.existsSync(sourceFile)) {
		return;
	}
	var source = fs.readFileSync(sourceFile, 'utf-8');
	return source;
};

module.exports = {
	'range': range,
	'append': append,
	'extend': extend,
	'readDataFile': readDataFile,
	'writeFiles': writeFiles
};
