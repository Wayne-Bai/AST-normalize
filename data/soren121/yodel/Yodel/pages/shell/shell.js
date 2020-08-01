/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * pages/shell/shell.js
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */

(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/shell/shell.html", {
        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },
        ready: function (element, options) {
            Yodel.UI.permitAppbar(options.enableAppbar);
        }
    });
})();
