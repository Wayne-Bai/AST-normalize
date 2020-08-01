/**
 * Copyright (c) 2013-2014 Oculus Info Inc.
 * http://www.oculusinfo.com/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
define(function() {
	var registry = {};
	var u = aperture.util;

	// registers a plugin on load
	function add(name, plugin) {
		var a = registry[name];

		if (a == null) {
			a = registry[name] = [];
		}

		plugin = aperture.util.viewOf(plugin);

		// clear this in case there is a problem loading it
		var m = plugin.module;
		plugin.module = null;

		// register the plugin.
		a.push(plugin);

		// load required modules
		if (u.isString(m)) {
			require([m], function(module) {
				plugin.module = module;
			});
		}
	}

	// get plugin registrations.
	aperture.config.register('influent.plugins', function(cfg) {
		cfg = cfg['influent.plugins'];

		u.forEach(cfg, function(list, name) {
			if (u.isString(name)) {
				if (list && !u.isArray(list)) {
					list = [list];
				}
				u.forEach(list, function(plugin) {
					add(name, plugin);
				});

			} else {
				aperture.log.error('influent.plugins config does not consist of named properties.');
			}
		});
	});

	// return registered plugins under name.
	return {
		get : function(name) {
			return registry[name];
		}
	};
});
