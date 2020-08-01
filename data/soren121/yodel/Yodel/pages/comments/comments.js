/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * pages/comments/comments.js
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */

(function () {
    "use strict";

    var lang = WinJS.Resources;
    var nav = WinJS.Navigation;
    var appbar = document.getElementById("appbar").winControl;

    function jumpToTop(event) {
        document.querySelector("#comments_container").scrollTop = 0;
    }

    function jumpToBottom(event) {
        var page = document.querySelector("#comments_container");
        page.scrollTop = page.scrollHeight;
    }

    function refreshComments() {
        Yodel.data.comments = null;

        var feed = new Yodel.feed();
        feed.load("comments", "yak_comments", {
            "yak": nav.state.yak
        });
    }

    WinJS.UI.Pages.define("/pages/comments/comments.html", {
        init: function () {
            Yodel.UI.permitAppbar(true);
        },
        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },
        ready: function (element, options) {
            var yak = nav.state.yak;

            var feed = new Yodel.feed();
            feed.load("comments", "yak_comments", {
                "yak": yak
            });

            appbar.disabled = false;
            appbar.closedDisplayMode = "minimal";

            appbar.getCommandById("comment").addEventListener("click", Yodel.Actions.to_reply);
            appbar.getCommandById("refresh").addEventListener("click", refreshComments);
            appbar.getCommandById("jumptotop").addEventListener("click", jumpToTop);
            appbar.getCommandById("jumptobottom").addEventListener("click", jumpToBottom);

            if (!nav.state.can_reply) {
                $(".comments_reply").text(lang.getString("comments_read-only").value);
                appbar.showOnlyCommands(["refresh", "jumptotop", "jumptobottom"]);
            }
            else {
                $(".comments_reply").click(Yodel.Actions.to_reply);
                appbar.showOnlyCommands(["comment", "refresh", "jumptotop", "jumptobottom"]);
            }

            var commandParams = { feed: "comments_parent", item: nav.state.yak };
            if ("poster_id" in yak && yak.poster_id === Yodel.handle.id) {
                var deleteButton = element.querySelector(".icon-delete");
                deleteButton.style.display = "inline-block";

                deleteButton.addEventListener("click", function () {
                    var buttons = {};
                    buttons[lang.getString("popup_no").value] = null;
                    buttons[lang.getString("popup_yes").value] = Yodel.Actions.remove.bind(commandParams);

                    Yodel.popup_error(
                        lang.getString("msg_delete-yak").value,
                        lang.getString("msg_confirm-delete").value,
                        buttons
                    );
                });
            }

            element.querySelector(".icon-report").addEventListener("click", Yodel.Actions.report.bind(commandParams));

            element.querySelector(".icon-share").addEventListener("click", Yodel.Actions.share.bind(commandParams));

            element.querySelector(".icon-map").addEventListener("click", function () {
                Yodel.UI.ModalPage("/pages/shell/shell.html", false).then(function(modalPage) {
                    modalPage.querySelector(".pagetitle").innerText = "Map";
                    modalPage.querySelector("section").appendChild(Yodel.UI.Map(yak.latitude, yak.longitude, 16));
                });
            });
        },
        unload: function () {
            Yodel.last_index.comments = document.getElementById("yak_comments").scrollTop;
        }
    });
})();
