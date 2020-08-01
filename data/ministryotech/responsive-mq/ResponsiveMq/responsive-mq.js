/* responsive-mq.js - v1.2.4 */
/*
 * ResponsiveMQ     Bringing media queries to Javascript
 * Author           Keith Jackson (tiefling)
 * Company          The Ministry of Technology (ministryotech)
 * License          MIT / http://bit.ly/mit-license
 * WebSite          http://www.ministryotech.co.uk
 */

var respMqFunc = function ($) {

    var responsiveMq = {};

    responsiveMq.registeredBreakpoints = [];
    responsiveMq.lastActiveBreakpointName = '';

    responsiveMq.registerBreakpoint = function (name, mediaQueryCssName, matchedFunc, notMatchedFunc) {
        responsiveMq.registeredBreakpoints.push({ 'name': name, 'mediaQueryCssName': mediaQueryCssName, 'matchedFunc': matchedFunc, 'notMatchedFunc': notMatchedFunc });
    };

    responsiveMq.activate = function () {

        var renderMarkup = function (className) {
            $(document.body).append('<span class="' + className + '"></span>');
        };

        var renderStyle = function (className, mediaQueryCssName) {
            var styleString = '\n';
            if (mediaQueryCssName !== '') {
                styleString += mediaQueryCssName + '{\n';
                for (var bpi = 0; bpi < responsiveMq.registeredBreakpoints.length; bpi++) {
                    if (responsiveMq.registeredBreakpoints[bpi].name !== className) {
                        styleString += '   .' + responsiveMq.registeredBreakpoints[bpi].name + ' { display: none; }\n';
                    } else {
                        styleString += '   .' + className + ' { display: inline; }\n';
                    }
                }
                styleString += '}\n';
            } else {
                for (var bpx = 0; bpx < responsiveMq.registeredBreakpoints.length; bpx++) {
                    if (responsiveMq.registeredBreakpoints[bpx].name !== className) {
                        styleString += '.' + responsiveMq.registeredBreakpoints[bpx].name + ' { display: none; }\n';
                    } else {
                        styleString += '.' + className + ' { display: inline; }\n';
                    }
                }
            }
            $(document.head).append('<style>' + styleString + '</style>');
        };

        var applyResponsiveJs = function () {
            for (var rjsi = 0; rjsi < responsiveMq.registeredBreakpoints.length; rjsi++) {
                var bp = responsiveMq.registeredBreakpoints[rjsi];
                if ($('.' + bp.name).css('display') == 'inline') {
                    if (bp.name !== responsiveMq.lastActiveBreakpointName) {
                        responsiveMq.lastActiveBreakpointName = bp.name;
                        var matchedFunc = bp.matchedFunc;
                        if (matchedFunc !== undefined && matchedFunc !== null) {
                            matchedFunc();
                        }
                    }
                } else {
                    var notMatchedFunc = bp.notMatchedFunc;
                    if (notMatchedFunc !== undefined && notMatchedFunc !== null) {
                        notMatchedFunc();
                    }
                }
            }
        };

        for (var i = 0; i < responsiveMq.registeredBreakpoints.length; i++) {
            renderMarkup(responsiveMq.registeredBreakpoints[i].name);
            renderStyle(responsiveMq.registeredBreakpoints[i].name, responsiveMq.registeredBreakpoints[i].mediaQueryCssName);
        }

        $(window).on('resize', applyResponsiveJs);
        $(document).ready(applyResponsiveJs);
    };

    return responsiveMq;
};

if (typeof define === 'function' && define.amd) {
    define(['jquery'], respMqFunc);
} else {
    $.responsiveMQ = respMqFunc(jQuery);
}