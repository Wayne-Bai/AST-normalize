"use strict";

/// namespace window.core

/// require util.js as window.core.util
/// require type.js as window.core.type
/// require function.js as window.core.fn
/// require string.js as window.core.str
/// require subscriber.js as window.core.sub
/// require class.js as window.core.Class
/// require orderedmap.js as window.core.OrderedMap
/// require queue.js as window.core.Queue
/// require delimited.js as window.core.Delimited
/// require exception.js as window.core.Exception

window.core.promoteCore = function()
{
	if (arguments.length > 0)
	{
		var i = arguments.length,
			name;

		while (i--)
		{
			name = arguments[i];
			if (window.core.hasOwnProperty(name) && window.core[name] != null)
				window[name] = window.core[name];
		}
	}
	else
	{
		window.core.util.combine(window, window.core);
	}
};
