/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * js/yak_events.js
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

    WinJS.Namespace.define("Yodel.Actions", {
        vote: function (event) {
            var yakker = Yodel.handle;
            var vote_change_enabled, yakarma_increment;

            try {
                vote_change_enabled = yakker.service_config.features.voting.enableVoteChanging;
                // Official client seems to ignore this value for now
                //yakarma_increment = yakker.service_config.features.voting.yakarmaIncreaseValue;
            }
            catch (e) {
                vote_change_enabled = false;
                //yakarma_increment = 1;
            }
            yakarma_increment = 1;

            var target = $(event.target);
            var sibling = target.siblings(".yak_voted");
            var vote_count_ele = target.siblings(".yak_votecount");

            var promise = null, message_id = null, comment_id = null;

            var feed = this.feed;
            var index = parseInt(target.parents(".win-template").attr("aria-posinset"));
            var datasource = Yodel.data[feed];

            var orig_liked = datasource[index].liked;
            var orig_vote_count = datasource[index].likes;

            var orig_yakarma;
            try {
                orig_yakarma = parseInt(Yodel.data.pivot.yakarma);
            }
            catch (e) {
                orig_yakarma = 0;
                Yodel.data.pivot = {};
            }

            if (feed !== "comments") {
                message_id = target.parents(".yak_container").data("mid");
            }
            else {
                comment_id = target.parents(".yak_container").data("cid");
            }

            function get_promise(direction) {
                switch (direction) {
                    case "up":
                        if (feed !== "comments") {
                            return yakker.upvote_yak(message_id);
                        }
                        else {
                            return yakker.upvote_comment(comment_id);
                        }
                        break;
                    case "down":
                        if (feed !== "comments") {
                            return yakker.downvote_yak(message_id);
                        }
                        else {
                            return yakker.downvote_comment(comment_id);
                        }
                }
            }

            // The user is undoing their vote
            if (vote_change_enabled && target.hasClass("yak_voted")) {
                switch (this.direction) {
                    case "up":
                        vote_count_ele.text(orig_vote_count - 1);
                        datasource[index].likes -= yakarma_increment;
                        break;
                    case "down":
                        vote_count_ele.text(orig_vote_count + 1);
                        datasource[index].likes += yakarma_increment;
                        break;
                    default:
                        return;
                }

                datasource[index].liked = 0;
                promise = get_promise(this.direction);
                Yodel.data.pivot.yakarma = orig_yakarma - yakarma_increment;
            }
            // The user is changing their vote
            else if (vote_change_enabled && sibling.length > 0) {
                sibling.removeClass("yak_voted");

                switch (this.direction) {
                    case "up":
                        // Multiply by two to negate the vote already made
                        vote_count_ele.text(orig_vote_count + yakarma_increment * 2);
                        datasource[index].likes += yakarma_increment * 2;
                        datasource[index].liked = 1;
                        break;
                    case "down":
                        vote_count_ele.text(orig_vote_count - yakarma_increment * 2);
                        datasource[index].likes -= yakarma_increment * 2;
                        datasource[index].liked = -1;
                        break;
                    default:
                        return;
                }

                promise = get_promise(this.direction);
            }
            // The user is voting for the first time
            else if (vote_change_enabled || (!vote_change_enabled && (!target.hasClass("yak_voted") && !sibling.length))) {
                switch (this.direction) {
                    case "up":
                        vote_count_ele.text(orig_vote_count + yakarma_increment);
                        datasource[index].liked = 1;
                        datasource[index].likes += yakarma_increment;
                        break;
                    case "down":
                        vote_count_ele.text(orig_vote_count - yakarma_increment);
                        datasource[index].liked = -1;
                        datasource[index].likes -= yakarma_increment;
                        break;
                    default:
                        return;
                }

                promise = get_promise(this.direction);
                Yodel.data.pivot.yakarma = orig_yakarma + yakarma_increment;
            }
            else {
                Yodel.popup_error("Error: all vote condition checks failed. (yak_events.vote)", lang.getString("msg_generic-fail").value);
                return;
            }

            if (promise) {
                WinJS.Utilities.toggleClass(event.target, "yak_voted");

                promise.then(function (response) {
                    console.log(response);
                    if (!response.isSuccessStatusCode) {
                        // Undo everything
                        WinJS.Utilities.toggleClass(event.target, "yak_voted");
                        if (vote_change_enabled && sibling.length > 0) {
                            sibling.addClass("yak_voted");
                        }
                        vote_count_ele.text(orig_vote_count);
                        datasource[index].likes = orig_vote_count;
                        datasource[index].liked = orig_liked;
                        Yodel.data.pivot.yakarma = orig_yakarma;
                    }
                });
            }
            else {
                Yodel.popup_error("Error: no Promise in yak_events.vote", lang.getString("msg_generic-fail").value);
            }
        },

        share: function(event) {
            //var canvas = document.createElement('canvas');
            //canvas.width = 1024;
            //canvas.height = 600;
            //var ctx = canvas.getContext('2d');

            //ctx.fillStyle = "#1dd8bb";
            //ctx.fillRect(0, 0, canvas.width, canvas.height);

            //var background = new Image();
            //background.addEventListener("load", function () {
            //    ctx.drawImage(background, 0, 0);
            //}, false);
            //background.src = "/images/shareBackground.svg";

            //var blob = canvas.msToBlob();
            //blob = blob.msDetachStream(); // IRandomAccessStream
            //dataTransferManager.addEventListener("datarequested", function (e) {
                //var deferral = request.getDeferral();
                //Windows.Storage.StorageFile.createStreamedFileAsync("ys.png", function (stream) {
                //    Windows.Storage.Streams.RandomAccessStream.copyAndCloseAsync(blob, stream);
                //}, null).then(function (file) {
                //    request.data.setStorageItems([file]);
                //    deferral.complete();
                //}, function (err) { deferral.complete(); console.log(err); });
            //});

            var feed = this.feed;
            var item = this.item;

            var shareThreshold = Yodel.handle.service_config.features.shareThreshold.shareThreshold;

            if (item.likes >= shareThreshold) {
                var message = "\"";
                if (feed !== "comments") {
                    message += item.message;
                }
                else {
                    message += item.comment;
                }
                message += "\" (" + item.likes + " likes)";

                var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
                dataTransferManager.addEventListener("datarequested", function (e) {
                    var request = e.request;
                    request.data.properties.title = "From Yik Yak:";
                    request.data.setText(message);
                });

                Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
            }
            else {
                var errorTitle = Yodel.handle.service_config.features.shareThreshold.title;
                var errorMsg = Yodel.handle.service_config.features.shareThreshold.message;
                var buttons = {};
                buttons[lang.getString("popup_okay").value] = null;

                Yodel.popup_error(errorMsg, errorTitle, buttons);
            }
        },

        report: function (event) {
            var feed = this.feed;
            var item = this.item;

            Yodel.UI.ModalMenu({
                items: ["Offensive", "Targeting", "Spam", "Other"],
                title: lang.getString("report_title").value,
                message: lang.getString("report_message").value,
                langSection: "report"
            }).then(function (event) {
                if (event !== false) {
                    var reason = event.target.dataset.name;

                    if (feed !== "comments") {
                        Yodel.handle.report_yak(item.message_id, reason).then(function (response) {
                            if (!response.isSuccessStatusCode) {
                                Yodel.popup_error("Unable to report this yak. Something's fishy here...", lang.getString("msg_generic-fail").value);
                            }
                        });
                    }
                    else {
                        Yodel.handle.report_comment(item.comment_id, nav.state.yak.message_id, reason).then(function (response) {
                            if (!response.isSuccessStatusCode) {
                                Yodel.popup_error("Unable to report this comment. Something's fishy here...", lang.getString("msg_generic-fail").value);
                            }
                        });
                    }
                }
            });
        },

        remove: function (event) {
            var feed = this.feed;
            var item = this.item;

            var feed_instance = new Yodel.feed();

            if (feed !== "comments") {
                Yodel.handle.delete_yak(item.message_id).then(function (response) {
                    if (response.isSuccessStatusCode) {
                        function afterDelete() {
                            Yodel.data[nav.state.method] = null;
                            var innerScroller = document.querySelector(".inner_scroller");
                            feed_instance.load(nav.state.method, innerScroller.id, { refresh: true });
                        }

                        if (event) {
                            nav.back().done(afterDelete);
                        }
                        else {
                            afterDelete();
                        }
                    }
                    else {
                        Yodel.popup_error("Unable to delete your yak. Something's fishy here...", lang.getString("msg_generic-fail").value);
                    }
                });
            }
            else {
                Yodel.handle.delete_comment(item.comment_id, nav.state.yak.message_id).then(function (response) {
                    if (response.isSuccessStatusCode) {
                        Yodel.data.comments = null;
                        feed_instance.load("comments", "yak_comments", {
                            "yak": nav.state.yak
                        });
                    }
                    else {
                        Yodel.popup_error("Unable to delete your comment. Something's fishy here...", lang.getString("msg_generic-fail").value);
                    }
                });
            }
        },

        viewImage: function(event) {
            var fullImage = event.target.dataset.fullImage;

            var imgContainer = document.createElement("div");
            imgContainer.className = "imageContainer";

            var img = document.createElement("div");
            img.className = "image";

            img.style.backgroundImage = "url(" + fullImage + ")";

            imgContainer.appendChild(img);

            Yodel.UI.ModalMenu({
                elementId: "imageViewer",
                content: imgContainer,
                blocking: true
            });
        },

        to_peek_feed: function(event) {
            var target = event.currentTarget;
            var peek_obj = Yodel.data[target.parentElement.id][target.firstElementChild.dataset.index];
            //Yodel.last_index.peek_pivot = document.getElementById("peek_pivot").scrollTop;

            nav.navigate("/pages/feed/feed.html", {
                method: "peek",
                title: peek_obj.name,
                can_submit: peek_obj.canSubmit,
                can_vote: peek_obj.canVote,
                can_reply: peek_obj.canReply,
                can_report: peek_obj.canReport,
                id: peek_obj.id
            });
        },

        to_comments: function (event, feed) {
            var target = event.currentTarget;

            var index, message_id;
            try {
                index = parseInt(target.getAttribute("aria-posinset"));
                message_id = target.firstElementChild.dataset.mid;
            }
            // If either of these variables doesn't exist, we can't do anything
            catch (e) { return; }

            if (Yodel.data[feed][index] != null) {
                nav.navigate("/pages/comments/comments.html", {
                    message_id: message_id,
                    yak: Yodel.data[feed][index],
                    can_vote: nav.state.can_vote,
                    can_reply: nav.state.can_reply,
                    can_report: nav.state.can_report,
                });
            }
        },

        to_reply: function (event) {
            nav.navigate("/pages/post/post.html", {
                message_id: nav.state.message_id,
                type: "comment"
            });
        },

        to_me_feed: function (event) {
            var item = event.currentTarget.firstElementChild;
            if (item.dataset.link !== "undefined") {
                nav.navigate("/pages/feed/feed.html", {
                    method: item.dataset.link,
                    title: item.getElementsByClassName("item_title")[0].innerText,
                    can_submit: false,
                    can_vote: true,
                    can_reply: true,
                    can_report: true
                });
            }
        },

        to_top_yaks: function (event) {
            nav.navigate("/pages/feed/feed.html", {
                method: "area_tops",
                title: lang.getString("feed_top-yaks").value,
                can_submit: false,
                can_vote: false,
                can_reply: false,
                can_report: false,
            });
        },

        to_greatest_yaks: function (event) {
            nav.navigate("/pages/feed/feed.html", {
                method: "alltime_tops",
                title: lang.getString("feed_greatest-yaks").value,
                can_submit: false,
                can_vote: false,
                can_reply: false,
                can_report: false,
            });
        },
    });
})();
