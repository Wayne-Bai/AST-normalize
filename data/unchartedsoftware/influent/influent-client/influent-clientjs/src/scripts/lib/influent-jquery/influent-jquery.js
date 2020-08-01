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
(function ($) {
	/**
	 * Transparent extension of jQuery-ui draggable that automatically suspends and resumes render requests for influent
	 * rendering system
	 *
	 * @params {Object} spec
	 * jQuery-ui draggable specification
	 *
	 * @returns {Object}
	 * jQuery draggable object.
	 */
	$.fn.influentDraggable = function (spec) {

		var influentSpec = $.extend(true, {}, spec);

		influentSpec.start = function(event,ui) {
			aperture.pubsub.publish('suspend-rendering-request');
			if (spec.hasOwnProperty('start')) {
				spec.start(event,ui);
			}
		};

		influentSpec.stop = function(event,ui) {
			aperture.pubsub.publish('resume-rendering-request');
			if (spec.hasOwnProperty('stop')) {
				spec.stop(event,ui);
			}
		};

		$(this).draggable(influentSpec);

		return this;
	};
}(jQuery));
