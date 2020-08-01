/**
 * Analyzes DOM complexity
 */
/* global document: true, Node: true, window: true */
'use strict';

exports.version = '1.0';

exports.module = function(phantomas) {

	// total length of HTML comments (including <!-- --> brackets)
	phantomas.setMetric('commentsSize'); // @desc the size of HTML comments on the page @offenders

	// total length of text nodes with whitespaces only (i.e. pretty formatting of HTML)
	phantomas.setMetric('whiteSpacesSize'); // @desc the size of text nodes with whitespaces only

	// count all tags
	phantomas.setMetric('DOMelementsCount'); // @desc total number of HTML element nodes
	phantomas.setMetric('DOMelementMaxDepth'); // @desc maximum level on nesting of HTML element node

	// nodes with inlines CSS (style attribute)
	phantomas.setMetric('nodesWithInlineCSS'); // @desc number of nodes with inline CSS styling (with style attribute) @offenders

	// images
	// TODO: move to a separate module
	phantomas.setMetric('imagesScaledDown'); // @desc number of <img> nodes that have images scaled down in HTML @offenders
	phantomas.setMetric('imagesWithoutDimensions'); // @desc number of <img> nodes without both width and height attribute @offenders

	// keep the track of SVG graphics (#479)
	var svgResources = [];
	phantomas.on('recv', function(entry) {
		if (entry.isImage && entry.contentType.indexOf('image/svg') === 0) {
			svgResources.push(entry.url);
			phantomas.log('imagesScaledDown: will ignore <%s> [%s]', entry.url, entry.contentType);
		}
	});

	// duplicated ID (issue #392)
	phantomas.setMetric('DOMidDuplicated'); // @desc number of duplicated IDs found in DOM

	var Collection = require('../../lib/collection'),
		DOMids = new Collection();

	phantomas.on('domId', function(id) {
		DOMids.push(id);
	});

	// HTML size
	phantomas.on('report', function() {
		phantomas.setMetricEvaluate('bodyHTMLSize', function() { // @desc the size of body tag content (document.body.innerHTML.length)
			return document.body && document.body.innerHTML.length || 0;
		});

		var scope = {
			svgResources: svgResources
		};

		phantomas.evaluate(function(scope) {
			(function(phantomas) {
				var runner = new phantomas.nodeRunner(),
					whitespacesRegExp = /^\s+$/,
					DOMelementMaxDepth = 0,
					DOMelementMaxDepthNodes = [], // stores offenders for DOMelementMaxDepth (issue #414)
					size = 0;

				runner.walk(document.body, function(node, depth) {
					var path = '';

					switch (node.nodeType) {
						case Node.COMMENT_NODE:
							size = node.textContent.length + 7; // '<!--' + '-->'.length
							phantomas.incrMetric('commentsSize', size);

							// log HTML comments bigger than 64 characters
							if (size > 64) {
								phantomas.addOffender('commentsSize', '%s (%d characters)', phantomas.getDOMPath(node), size);
							}
							break;

						case Node.ELEMENT_NODE:
							path = phantomas.getDOMPath(node);

							phantomas.incrMetric('DOMelementsCount');

							if (depth > DOMelementMaxDepth) {
								DOMelementMaxDepth = depth;
								DOMelementMaxDepthNodes = [path];
							} else if (depth === DOMelementMaxDepth) {
								DOMelementMaxDepthNodes.push(path);
							}

							// report duplicated ID (issue #392)
							if (typeof node.id === 'string' && node.id !== '') {
								phantomas.emit('domId', node.id);
							}

							// ignore inline <script> tags
							if (node.nodeName === 'SCRIPT') {
								return false;
							}

							// images
							if (node.nodeName === 'IMG') {
								var imgWidth = node.hasAttribute('width') ? node.getAttribute('width') : false,
									imgHeight = node.hasAttribute('height') ? node.getAttribute('height') : false,
									nodeStyle;

								// get dimensions from inline CSS (issue #399)
								if (imgWidth === false || imgHeight === false) {
									nodeStyle = node.style;

									imgWidth = parseInt(node.style.width, 10) || false;
									imgHeight = parseInt(node.style.height, 10) || false;
								}

								if (imgWidth === false || imgHeight === false) {
									phantomas.incrMetric('imagesWithoutDimensions');
									phantomas.addOffender('imagesWithoutDimensions', '%s <%s>', path, node.src);
								}

								if (node.naturalHeight && node.naturalWidth && imgHeight && imgWidth) {
									if (node.naturalHeight > imgHeight || node.naturalWidth > imgWidth) {
										if (scope.svgResources.indexOf(node.src) === -1) {
											phantomas.incrMetric('imagesScaledDown');
											phantomas.addOffender('imagesScaledDown', '%s (%dx%d -> %dx%d)', node.src, node.naturalWidth, node.naturalHeight, imgWidth, imgHeight);
										} else {
											phantomas.log('imagesScaledDown: ignored <%s> (is SVG)', node.src);
										}
									}
								}
							}

							// count nodes with inline CSS
							if (node.hasAttribute('style')) {
								phantomas.incrMetric('nodesWithInlineCSS');
								phantomas.addOffender('nodesWithInlineCSS', '%s (%s)', path, node.getAttribute('style'));
							}

							break;

						case Node.TEXT_NODE:
							if (whitespacesRegExp.test(node.textContent)) {
								phantomas.incrMetric('whiteSpacesSize', node.textContent.length);
							}
							break;
					}
				});

				phantomas.setMetric('DOMelementMaxDepth', DOMelementMaxDepth);
				DOMelementMaxDepthNodes.forEach(function(path) {
					phantomas.addOffender('DOMelementMaxDepth', path);
				});

				// count <iframe> tags
				phantomas.spyEnabled(false, 'counting iframes');
				phantomas.setMetric('iframesCount', document.querySelectorAll('iframe').length); // @desc number of iframe nodes
				phantomas.spyEnabled(true);
			}(window.__phantomas));
		}, scope);

		DOMids.sort().forEach(function(id, cnt) {
			if (cnt > 1) {
				phantomas.incrMetric('DOMidDuplicated');
				phantomas.addOffender('DOMidDuplicated', '%s: %d occurrences', id, cnt);
			}
		});
	});
};
