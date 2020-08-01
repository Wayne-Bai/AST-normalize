/**
 * framify
 *
 * Turns basic HTML and layout CSS into wireframes
 *
 * http://www.framify.com/
 *
 * Copyright (c) 2012 Art Lawry
 * Licensed under the terrules of the MIT licenses.
 * http://www.opensource.org/licenses/mit-license.php
 */

//
//  ON DOCUMENT CHANGE
//  Makes it possible to execute code when the DOM changes.
//
//  Licensed under the terrules of the MIT license.
//  (c) 2010 Balázs Galambosi
//

// (function (window) {

//   'use strict';

//   var
//     last    = +new Date(), // + casts to int
//     delay   = 100,         // default delay
//     stack   = [],          // event queue
//     support = {},          // mutation event support
//     el      = document.documentElement,
//     remain  = 3,
//     onDomChange,           // public interface
//     dummy;                 // dummy element test

//   function callback() {
//     var
//       now = +new Date(), // + casts to int
//       i;                 // iterator
//     if (now - last > delay) {
//       for (i = 0; i < stack.length; i += 1) {
//         stack[i]();
//       }
//       last = now;
//     }
//   }

//   // Public interface
//   onDomChange = function (fn, newdelay) {
//     if (newdelay) {
//       delay = newdelay;
//     }
//     stack.push(fn);
//   };

//   // Naive approach for compatibility
//   function naive() {

//     var
//       last    = document.getElementsByTagName('*'),
//       lastlen = last.length,
//       timer   = setTimeout(function check() {

//         // get current state of the document
//         var
//           current = document.getElementsByTagName('*'),
//           len     = current.length,
//           i;

//         // if the length is different
//         // it's fairly obvious
//         if (len !== lastlen) {
//           // just make sure the loop finishes early
//           last = [];
//         }

//         // go check every element in order
//         for (i = 0; i < len; i += 1) {
//           if (current[i] !== last[i]) {
//             callback();
//             last = current;
//             lastlen = len;
//             break;
//           }
//         }

//         // over, and over, and over again
//         setTimeout(check, delay);

//       }, delay);
//   }

//   //
//   //  Check for mutation events support
//   //

//   // callback for the tests
//   function decide() {
//     if (support.DOMNodeInserted) {
//       window.addEventListener("DOMContentLoaded", function () {
//         if (support.DOrulesubtreeModified) { // for FF 3+, Chrome
//           el.addEventListener('DOrulesubtreeModified', callback, false);
//         } else { // for FF 2, Safari, Opera 9.6+
//           el.addEventListener('DOMNodeInserted', callback, false);
//           el.addEventListener('DOMNodeRemoved', callback, false);
//         }
//       }, false);
//     } else if (document.onpropertychange) { // for IE 5.5+
//       document.onpropertychange = callback;
//     } else { // fallback
//       naive();
//     }
//   }

//   // checks a particular event
//   function test(event) {
//     el.addEventListener(event, function fn() {
//       support[event] = true;
//       el.removeEventListener(event, fn, false);
//       remain -= 1;
//       if (remain === 0) {
//         decide();
//       }
//     }, false);
//   }

//   // attach test events
//   if (window.addEventListener) {
//     test('DOrulesubtreeModified');
//     test('DOMNodeInserted');
//     test('DOMNodeRemoved');
//   } else {
//     decide();
//   }

//   // do the dummy test
//   dummy = document.createElement("div");
//   el.appendChild(dummy);
//   el.removeChild(dummy);

//   // expose
//   window.onDomChange = onDomChange;

// }(window));

/**
 * self-executing function that builds the framify jQuery plugin
 *
 * @param {Object} $ - jQuery variable
 */
(function ($) {

  'use strict';
  var
    c = {}, // constants
    h = {}, // helpers
    m = {}; // methods

  /**
   * CONSTANTS - c.*
   */

  c.units  = ['em', 'ex', 'ch', 'rem', 'cm', 'mm', 'in', 'pt', 'pc', 'px'];
  c.colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];

  c.validMQ       = /(min-|max-)?((device-)?(width|height)|aspect-ratio)/g;

  c.validMQAspect = /(min-|max-)?aspect-ratio\s*:\s*(\d+)\/(\d+)/g;
  c.validMQWidth  = new RegExp(
    '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
      + c.units.join('|')
      + ')?(\\s|\\))',
    'g'
  );
  c.validMQHeight = new RegExp(
    '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
      + c.units.join('|')
      + ')?(\\s|\\))',
    'g'
  );

  // c.prefixes = [
  //   '-webkit',
  //   '-moz',
  //   '-rules',
  //   '-o',
  //   ''
  // ];

  /**
   * HELPERS - h.*
   */

  /**
   * Calculate the angle of the diagonal of a given box
   *
   * @param {Number} argBoxWidth - The width of the box (pixels)
   * @param {Number} argBoxHeight - The height of the box (pixels)
   *
   * @return {Number} The angle of the diagonal (degrees)
   */
  h.calculateAngleFromBox = function (argBoxWidth, argBoxHeight) {
    var retAngle =
      90 - Math.round(
        (
          180 * Math.asin(
            (
              argBoxWidth * Math.sin(
                Math.PI / 2
              )
            ) / Math.sqrt(
              argBoxWidth * argBoxWidth + argBoxHeight * argBoxHeight
            )
          )
        ) / Math.PI * 100
      ) / 100;

    return retAngle;
  };

  /**
   * Calculte the left and top offset of an element from the screen
   *
   * @param {Object} argElement - DOM element to calculate offset of
   *
   * @return {Array} Array of left and top offsets (pixels)
   */
  h.getElementOffset = function (argElement) {
    var
      retOffsetLeft = argElement.offsetLeft,
      retOffsetTop  = argElement.offsetTop,
      element       = argElement;

    // img padding affects offset
    if (element.tagName.toLowerCase() === 'img') {
      retOffsetLeft += parseInt($(element).css('padding-left'), 10);
      retOffsetTop  += parseInt($(element).css('padding-top'), 10);
    }

    // add offsets of parents until body is reached
    if (element.offsetParent) {
      while (element.offsetParent) {
        element = element.offsetParent;
        if (element.tagName.toLowerCase() === 'body') {
          break;
        } else {
          retOffsetLeft += element.offsetLeft;
          retOffsetTop  += element.offsetTop;
        }
      }
    }

    return [retOffsetLeft, retOffsetTop];
  };

  /**
   * Generate visual representation of break points from media queries
   *
   * @param {Number} argBreakPointNumber - A unique identifier
   * @param {String} argMediaQueryText - The media query CSS
   */
  h.addBreakPoint = function (argBreakPointNumber, argMediaQueryText) {
    var
      mediaQueryRules = argMediaQueryText.split(/,\s?/),
      breakPointClass,
      breakPointLabelClass,
      breakPointStyle,
      breakPointLabelStyle,
      breakPointLabel,
      angle,
      i,
      j,
      isValid,
      currentMQ,
      rules = [],
      parts = [];

    for (i = 0; i < mediaQueryRules.length; i += 1) {
      isValid = true;

      // exclude media queries that are not understood in this browser
      if (mediaQueryRules[i] !== 'not all') {

        // include only specific media types
        if (
          mediaQueryRules[i].match(/(all|screen)/i)
            && !mediaQueryRules[i].match(/not (all|screen)/i)
        ) {

          // include only specific media features
          if (mediaQueryRules[i].match(c.validMQ)) {

            // handle min/max device/non-device width queries
            rules = mediaQueryRules[i].match(c.validMQWidth) || [];
            if (
              rules
                && rules.length === mediaQueryRules[i].match(/\(/g).length
            ) {

              parts = mediaQueryRules[i].match(/([a-z\-]+):/g);
              for (j = 0; j < parts.length; j += 1) {
                if (!parts[0].match(/width$/)) {
                  isValid = false;
                  break;
                }
              }

              if (isValid) {

                breakPointLabelClass =
                  'framify-break-point-label framify-width-break-point-label';

                if (rules.length === 2) {
                  currentMQ = new RegExp(
                    '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                      + c.units.join('|')
                      + ')?(\\s|\\))',
                    'g'
                  );

                  parts = currentMQ.exec(mediaQueryRules[i]).concat(
                    currentMQ.exec(mediaQueryRules[i])
                  );

                  parts[1] = parts[1] || ''; // min/max
                  parts[2] = parts[2] || ''; // device
                  parts[3] = parseInt(parts[3], 10);
                  parts[4] = parts[4] || ''; // units
                  parts[7] = parts[7] || ''; // min/max
                  parts[8] = parts[8] || ''; // device
                  parts[9] = parseInt(parts[9], 10);
                  parts[10] = parts[10] || ''; // units

                  if (
                    parts[1].match(/^(min-|max-)$/)
                      && parts[7].match(/^(min-|max-)$/)
                      && parts[1] !== parts[6]
                      && (parts[4] === parts[10]
                        || (parts[3] === 0 && !parts[4])
                        || (parts[9] === 0 && !parts[10])
                      )
                  ) {

                    breakPointClass =
                      'framify-break-point framify-min-max-width-break-point';

                    if (parts[1] === 'min-') {

                      breakPointStyle =
                        'left:' + (parts[3] - 1) + parts[4] + ';'
                        + 'width:' + (parts[9] - parts[3]) + parts[10] + ';';

                      breakPointLabelStyle =
                        'left:' + parts[9] + parts[10] + ';';

                      breakPointLabel =
                        rules[0].replace(/\s*\)$/, '') + ' - '
                        + rules[1].replace(/\s*\)$/, '');

                    } else {

                      breakPointStyle =
                        'left:' + (parts[9] - 1) + parts[10] + ';'
                        + 'width:' + (parts[3] - parts[9]) + parts[4] + ';';

                      breakPointLabelStyle =
                        'left:' + parts[3] + parts[4] + ';';

                      breakPointLabel =
                        rules[1].replace(/\s*\)$/, '') + ' - '
                        + rules[0].replace(/\s*\)$/, '');

                    }
                  }
                }
              } else if (rules.length === 1) {
                currentMQ = new RegExp(
                  '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                    + c.units.join('|')
                    + ')?(\\s|\\))',
                  'g'
                );

                parts = currentMQ.exec(mediaQueryRules[i]).concat(
                  currentMQ.exec(mediaQueryRules[i])
                );

                parts[1] = parts[1] || ''; // min/max
                parts[2] = parts[2] || ''; // device
                parts[3] = parseInt(parts[3], 10);
                parts[4] = parts[4] || ''; // units

                if (
                  parts[3] === 0
                    || (parts[3] > 0 && parts[4])
                ) {

                  breakPointClass =
                    'framify-break-point '
                    + 'framify-' + parts[1] + 'width-break-point';

                  // min, regular
                  breakPointStyle =
                    'left: ' + parts[3] + parts[4] + ';';

                  // max
                  if (parts[1]) {
                    if (parts[1] === 'max-') {
                      breakPointStyle =
                        'width: ' + parts[3] + parts[4] + ';';
                    }
                  }

                  breakPointLabelStyle =
                    'left:' + parts[3] + parts[4] + ';';

                  breakPointLabel =
                    rules[0].replace(/\s*\)$/, '');
                }
              }
            }

            // handle min/max device/non-device height queries
            rules = mediaQueryRules[i].match(c.validMQHeight) || [];
            if (
              rules
                && rules.length === mediaQueryRules[i].match(/\(/g).length
            ) {

              parts = mediaQueryRules[i].match(/([a-z\-]+):/g);
              for (j = 0; j < parts.length; j += 1) {
                if (!parts[0].match(/height$/)) {
                  isValid = false;
                  break;
                }
              }

              if (isValid) {

                breakPointLabelClass =
                  'framify-break-point-label framify-height-break-point-label';

                if (rules.length === 2) {
                  currentMQ = new RegExp(
                    '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
                      + c.units.join('|')
                      + ')?(\\s|\\))',
                    'g'
                  );

                  parts = currentMQ.exec(mediaQueryRules[i]).concat(
                    currentMQ.exec(mediaQueryRules[i])
                  );

                  parts[1] = parts[1] || ''; // min/max
                  parts[2] = parts[2] || ''; // device
                  parts[3] = parseInt(parts[3], 10);
                  parts[4] = parts[4] || ''; // units
                  parts[7] = parts[7] || ''; // min/max
                  parts[8] = parts[8] || ''; // device
                  parts[9] = parseInt(parts[9], 10);
                  parts[10] = parts[10] || ''; // units

                  if (
                    parts[1].match(/^(min-|max-)$/)
                      && parts[7].match(/^(min-|max-)$/)
                      && parts[1] !== parts[6]
                      && (parts[4] === parts[10]
                        || (parts[3] === 0 && !parts[4])
                        || (parts[9] === 0 && !parts[10])
                      )
                  ) {

                    breakPointClass =
                      'framify-break-point framify-min-max-height-break-point';

                    if (parts[1] === 'min-') {

                      breakPointStyle =
                        'top:' + (parts[3] - 1) + parts[4] + ';'
                        + 'height:' + (parts[9] - parts[3]) + parts[10] + ';';

                      breakPointLabelStyle =
                        'top:' + parts[9] + parts[10] + ';';

                      breakPointLabel =
                        rules[0].replace(/\s*\)$/, '') + ' - '
                        + rules[1].replace(/\s*\)$/, '');

                    } else {

                      breakPointStyle =
                        'top:' + (parts[9] - 1) + parts[10] + ';'
                        + 'height:' + (parts[3] - parts[9]) + parts[4] + ';';

                      breakPointLabelStyle =
                        'top:' + parts[3] + parts[4] + ';';

                      breakPointLabel =
                        rules[1].replace(/\s*\)$/, '') + ' - '
                        + rules[0].replace(/\s*\)$/, '');

                    }
                  }
                }
              } else if (rules.length === 1) {
                currentMQ = new RegExp(
                  '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                    + c.units.join('|')
                    + ')?(\\s|\\))',
                  'g'
                );

                parts = currentMQ.exec(mediaQueryRules[i]).concat(
                  currentMQ.exec(mediaQueryRules[i])
                );

                parts[1] = parts[1] || ''; // min/max
                parts[2] = parts[2] || ''; // device
                parts[3] = parseInt(parts[3], 10);
                parts[4] = parts[4] || ''; // units

                if (
                  parts[3] === 0
                    || (parts[3] > 0 && parts[4])
                ) {

                  breakPointClass =
                    'framify-break-point '
                    + 'framify-' + parts[1] + 'height-break-point';

                  // min, regular
                  breakPointStyle =
                    'top: ' + parts[3] + parts[4] + ';';

                  // max
                  if (parts[1]) {
                    if (parts[1] === 'max-') {
                      breakPointStyle =
                        'height: ' + parts[3] + parts[4] + ';';
                    }
                  }

                  breakPointLabelStyle =
                    'top:' + parts[3] + parts[4] + ';';

                  breakPointLabel =
                    rules[0].replace(/\s*\)$/, '');
                }
              }
            }

            // handle min/max aspect-ratio queries
            rules = c.validMQAspect.exec(mediaQueryRules[i]) || [];
            if (rules.length === 1) {
              rules[1] = rules[1] === undefined ? '' : rules[1];

              angle = h.calculateAngleFromBox(rules[2], rules[3]);

              breakPointClass =
                'framify-break-point '
                + 'framify-' + rules[1] + 'aspect-break-point';

              breakPointLabelClass =
                'framify-break-point-label '
                + 'framify-aspect-break-point-label';

              breakPointStyle = breakPointLabelStyle =
                '-webkit-transform: rotate(' + angle + 'deg);'
                + '-moz-transform: rotate(' + angle + 'deg);'
                + '-ms-transform: rotate(' + angle + 'deg);'
                + '-o-transform: rotate(' + angle + 'deg);'
                + 'transform: rotate(' + angle + 'deg);';

              breakPointLabel =
                rules[2].replace(/\s*\)$/, '') + '/'
                + rules[3].replace(/\s*\)$/, '');
            }

            if (breakPointLabel) {

              // add the visual break point to the document
              $('.framify-ui').append([
                '<div '
                  + 'id="framify-break-point-' + argBreakPointNumber + '" '
                  + 'class="' + breakPointClass + '" '
                  + 'style="' + breakPointStyle + '">'
                  + '</div>',
                '<div '
                  + 'id="framify-break-point-label-' + argBreakPointNumber
                  + '" '
                  + 'class="' + breakPointLabelClass + '" '
                  + 'style="' + breakPointLabelStyle + '">'
                  + '<span>' + breakPointLabel + '</span>'
                  + '</div>'
              ].join('\n') + '\n');
            }
          }
        }
      }
    }
  };

  /**
   * Find and process all media queries in the CSS
   *
   * @return {Number} The highest z-index in the original CSS
   */
  h.parseMediaQueries = function () {
    var
      validDomain      = new RegExp("^https?://" + document.domain),
      retHighestZIndex = 0,
      breakPointNumber = 0,
      i,
      j,
      rules;

    // find styleSheets with a constructor of CSSMediaRule
    for (i = 0; i < document.styleSheets.length; i += 1) {
      if (
        !document.styleSheets[i].href
          || document.styleSheets[i].href.match(/^\//)
          || document.styleSheets[i].href.match(/^file:/)
          || document.styleSheets[i].href.match(validDomain)
      ) {
        if (document.styleSheets[i].cssRules) { // fix file protocol in chrome
          for (j = 0; j < document.styleSheets[i].cssRules.length; j += 1) {
            if (
              document.styleSheets[i].cssRules[j].constructor === CSSMediaRule
            ) {
              h.addBreakPoint(
                breakPointNumber,
                document.styleSheets[i].cssRules[j].media.mediaText
              );
              breakPointNumber += 1;
            }

            rules = /z-index\s*:\s*(\d+)/g
              .exec(document.styleSheets[i].cssRules[j].cssText);

            if (rules) {
              if (parseInt(rules[1], 10) > retHighestZIndex) {
                retHighestZIndex = parseInt(rules[1], 10);
              }
            }
          }
        }
      }
    }

    return retHighestZIndex;
  };

  /**
   * Adds framify UI HTML to the document
   */
  h.addHTML = function () {
    $('.framify-ui').append([
      '<div class="framify-toggle"></div>'
    ].join('\n') + '\n');
  };

  // TODO - add ability to override some properties
  /**
   * Adds framify UI CSS to the document
   *
   * @param {Object} argCustomCSS - Object containing CSS overrides
   * @param {Number} argHighestZIndex - Highest z-index in original CSS
   */
  h.addCSS = function (argCustomCSS, argHighestZIndex) {
    var
      framifyCSS,
      zIndex     = argHighestZIndex + 10,
      defaultCSS = {
        'background'   : 'none',
        'color'        : 'rgba(0,0,0,.5)',
        'box-shadow'   : 'none', // -webkit, -moz
        'text-shadow'  : 'none',
        'border-radius': 0, // -webkit, -moz
        'border-color' : 'transparent'
      };

    framifyCSS = '.framified,.framified *{background:none;color:rgba(0,0,0,.5);-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;text-shadow:none;-webkit-border-radius:0;-moz-border-radius:0;border-radius:0;border-color:transparent;}.framify-ui{display:none;font-family:Helvetica, Arial, sans-serif;}.framified .framify-ui{display:block;}.framified .framify-ui *{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;color:rgba(0,0,0,.5);}.framified .framify-overlay{position:fixed;top:0;right:0;bottom:0;left:0;z-index:' + (zIndex + 1) + ';background-color:rgba(255,255,255,.5);}.framified .framify-break-point{position:fixed;z-index:' + (zIndex + 2) + ';-webkit-transition:all .3s ease-out;-moz-transition:all .3s ease-out;-ms-transition:all .3s ease-out;-o-transition:all .3s ease-out;transition:all .3s ease-out;border-color:rgba(0,0,0,.25);border-style:dashed;border-width:0;}.framified .framify-break-point.is-highlighted{z-index:' + (zIndex + 3) + ';background-color:rgba(0,0,0,.2);border-color:rgba(0,0,0,.5);}.framified .framify-break-point-label{position:fixed;z-index:' + (zIndex + 4) + ';padding-bottom:5px;color:rgba(0,0,0,.5);text-shadow:1px 1px 0 rgba(255,255,255,.5), -1px 1px 0 rgba(255,255,255,.5), 1px -1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5);white-space:nowrap;line-height:10px;-webkit-transition:all .3s ease-out;-moz-transition:all .3s ease-out;-ms-transition:all .3s ease-out;-o-transition:all .3s ease-out;transition:all .3s ease-out;cursor:pointer;text-align:left;}.framified .framify-break-point-label.is-highlighted{color:rgba(0,0,0,.7);}.framified .framify-break-point-label span{font-size:10px;}.framified .framify-width-break-point,.framified .framify-min-width-break-point,.framified .framify-max-width-break-point,.framified .framify-min-max-width-break-point{bottom:0;top:0;}.framified .framify-width-break-point{border-right-width:1px;width:0;}.framified .framify-min-width-break-point{border-left-width:1px;width:100%;}.framified .framify-max-width-break-point{border-right-width:1px;left:-1px;}.framified .framify-min-max-width-break-point{border-right-width:1px;}.framified .framify-width-break-point-label{top:0;bottom:0;width:30px;margin-left:-10px;}.framified .framify-width-break-point-label span{position:absolute;top:0;left:15px;-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;-webkit-transform:rotate(90deg);-moz-transform:rotate(90deg);-ms-transform:rotate(90deg);-o-transform:rotate(90deg);transform:rotate(90deg);}.framified .framify-height-break-point,.framified .framify-min-height-break-point,.framified .framify-max-height-break-point,.framified .framify-min-max-height-break-point{right:0;left:0;}.framified .framify-height-break-point{border-bottom-width:1px;height:0;}.framified .framify-min-height-break-point{border-top-width:1px;height:100%;}.framified .framify-max-height-break-point{border-bottom-width:1px;top:-1px;}.framified .framify-min-max-height-break-point{border-bottom-width:1px;}.framified .framify-height-break-point-label{left:0;right:0;height:30px;margin-top:0;}.framified .framify-height-break-point-label span{position:absolute;top:5px;left:5px;}.framified .framify-aspect-break-point,.framified .framify-min-aspect-break-point,.framified .framify-max-aspect-break-point{left:0;width:1000%;height:1000%;}.framified .framify-aspect-break-point,.framified .framify-max-aspect-break-point{-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-ms-transform-origin:0 0;-o-transform-origin:0 0;transform-origin:0 0;}.framified .framify-min-aspect-break-point{-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}.framified .framify-aspect-break-point{border-top-width:1px;height:0;top:0;},.framified .framify-min-aspect-break-point{border-bottom-width:1px;height:1000%;bottom:100%;}.framified .framify-max-aspect-break-point{border-top-width:1px;height:1000%;top:0;},.framified .framify-aspect-break-point-label{top:0;left:0;right:0;margin-top:-20px;height:30px;-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}.framified .framify-aspect-break-point-label span{position:absolute;top:5px;left:40px;}.framified [data-framify-section],.framified [data-framify-section] [data-framify-section]{background-color:rgba(0,0,0,.05);box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);}.framified [data-framify-section-color]{box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);}.framified [data-framify-section-color=red]{background-color:rgba(255,0,0,.1);}.framified [data-framify-section-color=orange]{background-color:rgba(255,100,0,.1);}.framified [data-framify-section-color=yellow]{background-color:rgba(255,255,0,.1);}.framified [data-framify-section-color=green]{background-color:rgba(0,160,0,.1);}.framified [data-framify-section-color=blue]{background-color:rgba(17,83,255,.1);}.framified [data-framify-section-color=purple]{background-color:rgba(135,0,176,.1);}.framified img,.framified svg,.framified video,.framified object,.framified embed,.framified audio[controls]{filter:alpha(opacity=0.1);-ms-filter:"alpha(opacity=0.1)";-moz-opacity:.001;opacity:.001;}.framified .framify-image-wireframe,.framified .framify-video-wireframe,.framified .framify-audio-wireframe{height:30px;display:block;position:absolute;overflow:hidden;z-index:' + zIndex + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);}.framified .framify-audio-wireframe{background-color:rgba(0,0,0,.15);}.framified .framify-wireframe-media-controls{position:absolute;bottom:0;left:0;right:0;height:25px;background-color:rgba(0,0,0,.1);}.framified .framify-wireframe-media-play{position:absolute;left:6px;top:50%;margin-top:-8px;border-color:transparent transparent transparent rgba(0,0,0,.25);border-style:solid;border-width:8px 14px;}.framified .framify-wireframe-media-scrub{position:absolute;height:4px;background-color:rgba(0,0,0,.25);top:50%;left:24px;right:6px;margin-top:-2px;}.framified .framify-wireframe-cross-left,.framified .framify-wireframe-cross-right{border-top:1px solid rgba(0,0,0,.25);position:absolute;top:0;width:500%;height:500%;}.framified .framify-wireframe-label{position:relative;display:block;font-size:20px;text-align:center;}.framified .framify-wireframe-play-button{position:absolute;left:50%;top:50%;border-color:transparent transparent transparent rgba(0,0,0,.25);border-style:solid;border-width:25px 40px;margin:-25px 0 0 -20px;}.framified .framify-wireframe-cross-left{left:0;-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-ms-transform-origin:0 0;-o-transform-origin:0 0;transform-origin:0 0;}.framified .framify-wireframe-cross-right{right:0;-webkit-transform-origin:100% 0;-moz-transform-origin:100% 0;-ms-transform-origin:100% 0;-o-transform-origin:100% 0;transform-origin:100% 0;}.framified [data-framify-section-color=gray],.framified .framify-image-wireframe,.framified .framify-video-wireframe{background-color:rgba(0,0,0,.1);}';

    framifyCSS = framifyCSS.replace(/;/g, ' !important;');
    framifyCSS = '<style id="framify-styles">' + framifyCSS + '</style>';

    $('head').append(framifyCSS);
  };

  /**
   * Adds framify UI break points to the document
   *
   * @return {Number} The highest z-index in the original CSS
   */
  h.addBreakPoints = function () {
    var retHighestZIndex = h.parseMediaQueries();

    $('.framify-break-point-label').hover(function () {
      var breakID = $(this).attr('id').replace(/^[\w\d_\-]*-/, '');

      $('.framify-break-point.is-highlighted')
        .add('.framify-break-point-label.is-highlighted')
        .removeClass('is-highlighted');
      $(this)
        .add('#framify-break-point-' + breakID)
        .addClass('is-highlighted');
    }, function () {
      $('.framify-break-point.is-highlighted,')
        .add('.framify-break-point-label.is-highlighted')
        .removeClass('is-highlighted');
    });

    return retHighestZIndex;
  };

  // TODO - radio
  // TODO - checkbox
  // TODO - select
  // TODO - text, textarea, password, email, tel, number, file, url, search,
  //  color, range, date, datetime
  // TODO - button, submit, reset

  /**
   * replaces img elements with wireframes
   *
   * @param {Object} argImage - DOM element to be replaced
   * @param {Number} argReplacementID - Unique identifier for replacement
   */
  h.generateImageWireframe = function (argImage, argReplacementID) {
    var
      $origin = $(argImage),
      offset  = h.getElementOffset($origin[0]),
      angle   = h.calculateAngleFromBox($origin.width(), $origin.height()),
      text    = $origin.attr('data-framify-wireframe')
      || $origin[0].tagName === 'IMG' ? 'Image' : 'Canvas';

    // add the wireframe (one box + two diagonals)
    if (!$origin.is('[data-framify-origin-image-id]')) {
      $origin.attr({'data-framify-origin-image-id': argReplacementID});
      $('.framify-ui').append([
        '<div '
          + 'class="framify-image-wireframe" '
          + 'data-framify-replacement-image-id="' + argReplacementID + '" '
          + 'style="'
          + 'height: ' + $origin.height() + 'px !important;'
          + 'width: ' + $origin.width() + 'px !important;'
          + 'left: ' + offset[0] + 'px !important;'
          + 'top: ' + offset[1] + 'px !important;'
          + '">',
        '<div '
          + 'class="framify-wireframe-cross-left" '
          + 'style="'
          + '-webkit-transform: rotate(' + angle + 'deg) !important;'
          + '-moz-transform: rotate(' + angle + 'deg) !important;'
          + '-ms-transform: rotate(' + angle + 'deg) !important;'
          + '-o-transform: rotate(' + angle + 'deg) !important;'
          + 'transform: rotate(' + angle + 'deg) !important;'
          + '">'
          + '</div>',
        '<div '
          + 'class="framify-wireframe-cross-right" '
          + 'style="'
          + '-webkit-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + '-moz-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + '-ms-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + '-o-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + 'transform: rotate(-' + (-1 * angle) + 'deg) !important;'
          + '">'
          + '</div>',
        '<div '
          + 'class="framify-wireframe-label" '
          + 'style="line-height: ' + $origin.height() + 'px !important;">'
          + text
          + '</div>',
        '</div>'
      ].join('\n') + '\n');
    }
  };

  /**
   * finds and replaces img elements with wireframes
   */
  h.generateImageWireframes = function () {
    var replacementID = 0;

    // we know the image offset and dimensions after load
    // $('body').on('load', 'img', function () {
    //   console.log('load ' + replacementID);
    //   h.generateImageWireframe(this, replacementID);
    //   replacementID ++;
    // });
    // $('img, canvas').each(function () {
    //   if (this.complete) {
    //     $(this).load();
    //   }
    // });
    $('img').one('load', function () {
      h.generateImageWireframe(this, replacementID);
      replacementID += 1;
    }).each(function () {
      if (this.complete) {
        $(this).load();
      }
    });

    $('canvas, svg').each(function () {
      h.generateImageWireframe(this, replacementID);
      replacementID += 1;
    });
  };

  /**
   * redraws the target img's wireframe
   *
   * @param {Object} argImage - DOM element whose wireframe should be redrawn
   */
  h.redrawImageWireframe = function (argImage) {
    var
      $replacement = $(argImage),
      $origin      = $('[data-framify-origin-image-id="'
        + $replacement.attr('data-framify-replacement-image-id')
        + '"]'),
      offset = h.getElementOffset($origin[0]),
      angle  = h.calculateAngleFromBox($origin.width(), $origin.height());

    $replacement.attr({
      'style': 'height: ' + $origin.height() + 'px !important;'
        + 'width: ' + $origin.width() + 'px !important;'
        + 'left: ' + offset[0] + 'px !important;'
        + 'top: ' + offset[1] + 'px !important;'
    });
    $replacement.children('.framify-wireframe-cross-left').attr({
      'style': '-webkit-transform: rotate(' + angle + 'deg) !important;'
        + '-moz-transform: rotate(' + angle + 'deg) !important;'
        + '-ms-transform: rotate(' + angle + 'deg) !important;'
        + '-o-transform: rotate(' + angle + 'deg) !important;'
        + 'transform: rotate(' + angle + 'deg) !important;'
    });
    $replacement.children('.framify-wireframe-cross-right').attr({
      'style': '-webkit-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + '-moz-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + '-ms-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + '-o-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + 'transform: rotate(-' + (-1 * angle) + 'deg) !important;'
    });
    $replacement.children('.framify-wireframe-label').attr({
      'style': 'line-height: ' + $origin.height() + 'px !important;'
    });
  };

  /**
   * replaces video, object, and embed elements with wireframes
   *
   * @param {Object} argVideo - DOM element to be replaced
   * @param {Number} argReplacementID - Unique identifier for replacement
   */
  h.generateVideoWireframe = function (argVideo, argReplacementID) {
    var
      $origin = $(argVideo),
      offset = h.getElementOffset($origin[0]),
      angle = h.calculateAngleFromBox($origin.width(), $origin.height()),
      text = $origin.attr('data-framify-wireframe') || 'Video';

    // add the wireframe (one box + two diagonals + play button and scrub)
    if (!$origin.is('[data-framify-origin-video-id]')) {
      $origin.attr({'data-framify-origin-video-id': argReplacementID});
      $('.framify-ui').append([
        '<div '
          + 'class="framify-video-wireframe" '
          + 'data-framify-replacement-video-id="' + argReplacementID + '" '
          + 'style="'
          + 'height: ' + $origin.height() + 'px !important;'
          + 'width: ' + $origin.width() + 'px !important;'
          + 'left: ' + offset[0] + 'px !important;'
          + 'top: ' + offset[1] + 'px !important;'
          + '">',
        '<div '
          + 'class="framify-wireframe-cross-left" '
          + 'style="'
          + '-webkit-transform: rotate(' + angle + 'deg) !important;'
          + '-moz-transform: rotate(' + angle + 'deg) !important;'
          + '-ms-transform: rotate(' + angle + 'deg) !important;'
          + '-o-transform: rotate(' + angle + 'deg) !important;'
          + 'transform: rotate(' + angle + 'deg) !important;'
          + '">'
          + '</div>',
        '<div '
          + 'class="framify-wireframe-cross-right" '
          + 'style="'
          + '-webkit-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + '-moz-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + '-ms-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + '-o-transform: rotate(' + (-1 * angle) + 'deg) !important;'
          + 'transform: rotate(-' + (-1 * angle) + 'deg) !important;'
          + '">'
          + '</div>',
        '<div '
          + 'class="framify-wireframe-label" '
          + 'style="line-height: ' + $origin.height() + 'px !important;">'
          + text
          + '</div>',
        '<div class="framify-wireframe-play-button"></div>',
        '<div class="framify-wireframe-media-controls">'
          + '<div class="framify-wireframe-media-play"></div>'
          + '<div class="framify-wireframe-media-scrub"></div>'
          + '</div>'
          + '</div>'
      ].join('\n') + '\n');
    }
  };

  /**
   * finds and replaces video, object, and embed elements with wireframes
   */
  h.generateVideoWireframes = function () {
    var replacementID = 0;

    // we know the video offset and dimensions after load
    $('video, embed, object').each(function () {
      h.generateVideoWireframe(this, replacementID);
      replacementID += 1;
    });
  };

  /**
   * redraws the target video, object, or embed's wireframe
   *
   * @param {Object} argImage - DOM element whose wireframe should be redrawn
   */
  h.redrawVideoWireframe = function (argVideo) {
    var
      $replacement = $(argVideo),
      $origin      = $('[data-framify-origin-video-id="'
        + $replacement.attr('data-framify-replacement-video-id')
        + '"]'),
      offset = h.getElementOffset($origin[0]),
      angle  = h.calculateAngleFromBox($origin.width(), $origin.height());

    $replacement.attr({
      'style': 'height: ' + $origin.height() + 'px !important;'
        + 'width: ' + $origin.width() + 'px !important;'
        + 'left: ' + offset[0] + 'px !important;'
        + 'top: ' + offset[1] + 'px !important;'
    });
    $replacement.children('.framify-wireframe-cross-left').attr({
      'style': '-webkit-transform: rotate(' + angle + 'deg) !important;'
        + '-moz-transform: rotate(' + angle + 'deg) !important;'
        + '-ms-transform: rotate(' + angle + 'deg) !important;'
        + '-o-transform: rotate(' + angle + 'deg) !important;'
        + 'transform: rotate(' + angle + 'deg) !important;'
    });
    $replacement.children('.framify-wireframe-cross-right').attr({
      'style': '-webkit-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + '-moz-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + '-ms-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + '-o-transform: rotate(' + (-1 * angle) + 'deg) !important;'
        + 'transform: rotate(-' + (-1 * angle) + 'deg) !important;'
    });
    $replacement.children('.framify-wireframe-label').attr({
      'style': 'line-height: ' + $origin.height() + 'px !important;'
    });
    if ($origin.height() < 150) {
      $replacement.children('.framify-wireframe-play-button').hide();
    } else {
      $replacement.children('.framify-wireframe-play-button').show();
    }
  };

  /**
   * replaces audio elements with wireframes
   *
   * @param {Object} argAudio - DOM element to be replaced
   * @param {Number} argReplacementID - Unique identifier for replacement
   */
  h.generateAudioWireframe = function (argAudio, argReplacementID) {
    var
      $origin = $(argAudio),
      offset = h.getElementOffset($origin[0]),
      text = $origin.attr('data-framify-wireframe') || 'Audio';

    // add the wireframe (one box + play button and scrub)
    if (!$origin.is('[data-framify-origin-audio-id]')) {
      $origin.attr({'data-framify-origin-audio-id': argReplacementID});
      $('.framify-ui').append([
        '<div '
          + 'class="framify-audio-wireframe" '
          + 'data-framify-replacement-audio-id="' + argReplacementID + '" '
          + 'style="'
          + 'height: ' + $origin.height() + 'px !important;'
          + 'width: ' + $origin.width() + 'px !important;'
          + 'left: ' + offset[0] + 'px !important;'
          + 'top: ' + offset[1] + 'px !important;'
          + '">',
        '<div '
          + 'class="framify-wireframe-label" '
          + 'style="line-height: ' + $origin.height() + 'px !important;">'
          + text
          + '</div>',
        '<div class="framify-wireframe-media-play"></div>',
        '<div class="framify-wireframe-media-scrub"></div>',
        '</div>'
      ].join('\n') + '\n');
    }
  };

  /**
   * finds and replaces audio elements with wireframes
   */
  h.generateAudioWireframes = function () {
    var replacementID = 0;

    // we know the audio offset and dimensions after load
    $('audio[controls]').each(function () {
      h.generateAudioWireframe(this, replacementID);
      replacementID += 1;
    });
  };

  /**
   * redraws the audio's wireframe
   *
   * @param {Object} argAudio - DOM element whose wireframe should be redrawn
   */
  h.redrawAudioWireframe = function (argAudio) {
    var
      $replacement = $(argAudio),
      $origin      = $('[data-framify-origin-audio-id="'
        + $replacement.attr('data-framify-replacement-audio-id')
        + '"]'),
      offset = h.getElementOffset($origin[0]);

    $replacement.attr({
      'style': 'height: ' + $origin.height() + 'px !important;'
        + 'width: ' + $origin.width() + 'px !important;'
        + 'left: ' + offset[0] + 'px !important;'
        + 'top: ' + offset[1] + 'px !important;'
    });
    $replacement.children('.framify-wireframe-label').attr({
      'style': 'line-height: ' + $origin.height() + 'px !important;'
    });
  };

  // TODO - add each new wireframe
  /**
   * redraws all wireframes to match their new position and size
   */
  h.reFramify = function () {
    // redraw (size/offset/diagonal angles) wireframe images
    $('[data-framify-replacement-image-id]').each(function () {
      h.redrawImageWireframe(this);
    });

    // redraw (size/offset/diagonal angles) wireframe videos
    $('[data-framify-replacement-video-id]').each(function () {
      h.redrawVideoWireframe(this);
    });

    // redraw (size/offset/diagonal angles) wireframe videos
    $('[data-framify-replacement-audio-id]').each(function () {
      h.redrawAudioWireframe(this);
    });
  };

  /**
   * METHODS - m.*
   */

  // TODO - on dom add/remove reframify page
  // TODO - on replaced element css change, reframify replacement
  // TODO - breakpoints
  // TODO - columns/grid
  // TODO - options
  // TODO - modify wireframes based on origin position, visibility, display
  /**
   * initialize framify
   *
   * @param {Object} argOptions - Options to pass to the init function
   *
   * @return {Object} DOM element context to return
   *
   * @chainable
   */
  m.init = function (argOptions) {
    var
      childrenAreSections,
      property,
      highestZIndex,
      colorIndex      = 0,
      filteredOptions = {},
      defaultOptions  = {};

    // if the page has been framified, destroy and reinitialize
    if ($('.framify-ui')[0]) {
      m.destroy();
    }

    // Validate options
    if (typeof argOptions !== 'undefined') {
      for (property in defaultOptions) {
        if (defaultOptions.hasOwnProperty(property)) {
          if (argOptions[property]) {
            filteredOptions[property] = argOptions[property];
          } else {
            filteredOptions[property] = defaultOptions[property];
          }
        }
      }
      argOptions = filteredOptions;
    } else {
      argOptions = defaultOptions;
    }

    // Trigger framify styles
    $('body').addClass('framified');
    $('body').append('<div class="framify-ui"></div>');

    // Add the HTML for the framify UI
    h.addHTML();

    // Add break points for media queries in the page
    // DEVEL
    // highestZIndex = h.addBreakPoints();
    highestZIndex = 1000;

    // Add the CSS for the framify UI
    h.addCSS(argOptions, highestZIndex);

    $('[role], table, div, nav, section, aside, header, footer, article')
      .not('[data-framify-section], .framify-ui, .framify-ui div')
      .each(function () {
        $(this).attr({'data-framify-section': 'auto'});
      });

    if (
      $('[data-framify-section]')
        .not('[data-framify-section="auto"]')[0]
    ) {
      $('[data-framify-section="auto"]')
        .removeAttr('data-framify-section');
    } else {
      $('[data-framify-section!="auto"]')
        .removeAttr('data-framify-section');
    }

    $('[role][data-framify-section]').each(function () {
      $(this).attr({'data-framify-section': $(this).attr('role')});
    });

    $('[data-framify-section]').each(function () {
      childrenAreSections = $(this).children().length > 1 ? true : false;
      $(this).children().each(function () {
        if (!$(this).attr('data-framify-section')) {
          childrenAreSections = false;
        }
      });
      if (childrenAreSections) {
        $(this).attr({'data-framify-section': 'remove'});
      }
    });

    $('[data-framify-section="remove"]')
      .removeAttr('data-framify-section');

    $('[data-framify-section]').each(function () {
      if (!$(this).parents('[data-framify-section]')[0]) {
        $(this).attr({
          'data-framify-section-color': c.colors[colorIndex]
        });
        colorIndex = colorIndex > 5 ? 0 : colorIndex + 1;
      }
    });

    (function () {
      var i = 0;
      $('[data-framify-section-color]').each(function () {
        var label = $(this).attr('data-framify-section');
        i += 1;
        label = label === 'auto' ? 'Section ' + i : label;
        //console.log(label);
        // $('.framify-ui').append([
        //   '<div class="framify-section-label">',
        //   label,
        //   '</div>'
        // ].join(''));
      });
    }());

    h.generateImageWireframes();
    h.generateVideoWireframes();
    h.generateAudioWireframes();

    $(window)
      .bind('load.framify', h.reFramify)
      .bind('resize.framify', h.reFramify);

    return this;
  };

  /**
   * destroy framify ui and remove all bound events
   *
   * @return {Object} DOM element context to return
   *
   * @chainable
   */
  m.destroy = function () {

    $('#framify-styles, .framify-ui').remove();

    $('body').removeClass('framified');

    $('[data-framify-section="auto"], [data-framify-section^="Section"]')
      .removeAttr('data-framify-section');
    $('[data-framify-section-color]')
      .removeAttr('data-framify-section-color');

    $('[data-framify-replacement-image-id]')
      .removeAttr('data-framify-replacement-image-id')
      .unbind('.framify');
    $('[data-framify-replacement-video-id]')
      .removeAttr('data-framify-replacement-video-id')
      .unbind('.framify');
    $('[data-framify-replacement-audio-id]')
      .removeAttr('data-framify-replacement-audio-id')
      .unbind('.framify');

    $(window).unbind('.framify');

    return this;
  };

  /**
   * toggles the framified version of the site on and off
   *
   * @return {Object} DOM element context to return
   *
   * @chainable
   */
  m.toggle = function () {
    $('body').toggleClass('framified');

    return this;
  };

  /**
   * CONSTRUCTOR
   */

  /**
   * jQuery plugin/constructor
   *
   * @param  {String}   argMethod Method name
   *
   * @return {Function}           Method to call
   *
   * @chainable
   */
  $.framify = $.fn.framify = function (argMethod) {
    var returnMethod;

    if (m[argMethod]) {
      returnMethod = m[argMethod].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof argMethod === 'object' || !argMethod) {
      returnMethod = m.init.apply(this, arguments);
    } else {
      $.error('Method ' +  argMethod + ' does not exist on jQuery.framify');
    }

    if (returnMethod) {
      return returnMethod;
    }
  };

}(jQuery));
