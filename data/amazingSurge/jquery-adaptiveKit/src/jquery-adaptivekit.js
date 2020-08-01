/*
 * adaptiveKit
 * https://github.com/amazingSurge/adaptiveKit
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the MIT license.
 */

(function(win) {
	"use strict";

	var adaptiveKit = win.adaptiveKit = {
		cached: [],
		init: function() {
			var type, elems = win.document.getElementsByTagName("div");
			adaptiveKit.cached = [];

			for (var i = 0, il = elems.length; i < il; i++) {
				type = elems[i].getAttribute("data-adaptive");

				if (type !== null) {
					adaptiveKit.types[type].init(elems[i]);
					adaptiveKit.cached.push(elems[i]);
				}
			}
		},
		resize: function() {
			var type;
			for (var i = 0, il = adaptiveKit.cached.length; i < il; i++) {
				type = adaptiveKit.cached[i].getAttribute("data-adaptive");
				if (type !== null) {
					adaptiveKit.types[type].resize(adaptiveKit.cached[i]);
				}
			}
		},
		getMatch: function(elem) {
			var sources = elem.getElementsByTagName("div"),
				matches = [];

			for (var i = 0; i < sources.length; i++) {
				var media = sources[i].getAttribute("data-media");
				// if there's no media specified, OR win.matchMedia is supported 
				if (!media || (win.matchMedia && win.matchMedia(media).matches)) {
					matches.push(sources[i]);
				}
			}
			if (matches.length) {
				return matches.pop();
			} else {
				return false;
			}
		},
		types: {
			iframe: {
				init: function(elem) {
					this.resize(elem);
				},
				resize: function(elem) {
					var iframe = elem.getElementsByTagName("iframe")[0];

					var match = win.adaptiveKit.getMatch(elem);
					if (match) {
						if (!iframe) {
							iframe = win.document.createElement("iframe");
							iframe.src = elem.getAttribute("data-src");
							elem.appendChild(iframe);
						}

						iframe.width = match.getAttribute("data-width");
						iframe.height = match.getAttribute("data-height");
					} else if (iframe) {
						elem.removeChild(iframe);
					}
				}
			},
			picture: {
				init: function(elem) {
					this.resize(elem);
				},
				resize: function(elem) {
					var img = elem.getElementsByTagName("img")[0];
					var match = win.adaptiveKit.getMatch(elem);

					if (match) {
						if (!img) {
							img = win.document.createElement("img");
							img.alt = elem.getAttribute("data-alt");
							elem.appendChild(img);
						}

						img.src = match.getAttribute("data-src");
					} else if (img) {
						elem.removeChild(img);
					}
				}
			}
		},
		registerType: function(name, type) {
			win.adaptiveKit.types[name] = type;
		}
	};

	if (win.addEventListener) {
		win.addEventListener("DOMContentLoaded", function() {
			adaptiveKit.init();
			win.removeEventListener("load", adaptiveKit.init, false);
		}, false);
		win.addEventListener("load", adaptiveKit.init, false);
		win.addEventListener("resize", adaptiveKit.resize, false);
	} else if (win.attachEvent) {
		win.attachEvent("onload", adaptiveKit.init);
		win.attachEvent("onresize", adaptiveKit.resize);
	}
})(this);
