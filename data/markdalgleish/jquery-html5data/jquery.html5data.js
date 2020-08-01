/*
 * $.html5data v1.0
 * Copyright 2011, Mark Dalgleish
 * 
 * This content is released under the MIT License
 * github.com/markdalgleish/jquery-html5data/blob/master/MIT-LICENSE.txt
 */

(function($, undefined) {
	$.fn.html5data = function(namespace, options) {
		var defaults = {
				//Customise the parsing options
				parseBooleans: true,
				parseNumbers: true,
				parseNulls: true,
				parseJSON: true,

				//Custom parse function
				parse: undefined
			},

			settings = $.extend({}, defaults, options),

			objects = [],

			//The data attribute prefix. 'data-' if global, 'data-foo-' if namespaced
			prefix = 'data-' + (namespace ? namespace + '-' : ''),

			//Runs every time a value is retrieved from the DOM
			parseValue = function(val) {
				var valLower = val.toLowerCase(),
					firstChar = val.charAt(0);
				
				if (settings.parseBooleans === true && valLower === 'true') {
					return true;
				} else if (settings.parseBooleans === true && valLower === 'false') {
					return false;
				} else if (settings.parseNulls === true && valLower === 'null') {
					return null;
				} else if (settings.parseNumbers === true && !isNaN(val * 1)) {
					return val * 1;
				} else if (settings.parseJSON === true && firstChar === '[' || firstChar === '{') {
					return $.parseJSON(val);
				} else if (typeof settings.parse === 'function') {
					return settings.parse(val);
				} else {
					return val;
				}
			};
		
		this.each(function() {
			var obj = {},
				attr,
				nameArray,
				name;
				
			for (var i = 0, iLen = this.attributes.length; i < iLen; i ++) {
				attr = this.attributes[i];

				if (attr.name.indexOf(prefix) === 0) {
					name = '';
					nameArray = attr.name.replace(prefix, '').split('-');
					
					for (var j = 0, jLen = nameArray.length; j < jLen; j++) {
						name += (j === 0 ? nameArray[j].toLowerCase() : nameArray[j].charAt(0).toUpperCase() + nameArray[j].slice(1).toLowerCase());
					}
					
					obj[name] = parseValue(attr.value);
				}
			}
			
			objects.push(obj);
		});
		
		//If .html5data is called on a single element, return a single object
		//Otherwise return an array of objects
		if (objects.length === 1) {
			return objects[0];
		} else {
			return objects;
		}
	};
	
	$.html5data = function(elem, namespace, options) {
		return $(elem).html5data(namespace, options);
	};
})(jQuery);