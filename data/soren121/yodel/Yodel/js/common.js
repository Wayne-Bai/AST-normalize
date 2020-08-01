/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * js/common.js
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */

(function () {
    "use strict";

    WinJS.Namespace.define("Yodel", {
        bind_options: function (tag, options) {
            if (tag) {
                if (!tag.winControl) {
                    var options_str;
                    $(tag).attr("data-win-options", function (i, val) {
                        if (val.length <= 0) {
                            options_str = "{";
                        }
                        else {
                            options_str = val.slice(0, -1);
                        }
                        
                        $.each(options, function (key, val) {
                            options_str += ", " + key + ": " + val;
                        });

                        return options_str + "}";
                    });
                }
                else {
                    $.each(options, function (key, val) {
                        tag.winControl[key] = eval(val);
                    });
                }
            }
        },

        popup_error: function (msg, title, buttons) {
            var error_msg = new Windows.UI.Popups.MessageDialog(msg);

            if (title) {
                error_msg.title = title;
            }
            
            if (buttons) {
                var button_keys = Object.keys(buttons);
                for (var i in button_keys) {
                    if (button_keys.hasOwnProperty(i)) {
                        error_msg.commands.append(new Windows.UI.Popups.UICommand(button_keys[i], buttons[button_keys[i]]));
                    }
                }
            }

            return error_msg.showAsync();
        }
    });
})();
