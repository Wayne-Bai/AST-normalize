/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * js/yak_feed.js
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

    WinJS.Namespace.define("Yodel", {
        feed: WinJS.Class.define(function () {}, {
            load: function (feed, tag, opt) {
                $(".page_progress").css("display", "inline");

                var that = this;
                var method, promise;
                var parser = "parse_yaks";

                if (!opt) {
                    opt = {};
                }

                //console.log(opt);
                if ("sortType" in opt && Yodel.sort[feed] !== opt.sortType) {
                    this.sortType = opt.sortType;
                    Yodel.last_index[feed] = 0;
                }
                else if (!("sortType" in opt)) {
                    this.sortType = null;
                }

                if (feed === "comments") {
                    // If loading the comments page, first bind the selected yak from cache
                    this._bind("comments_parent", [opt.yak], "yak_detail");
                }

                // Load feed from cache
                if (feed in Yodel.data && Yodel.data[feed] && (feed === "nearby" && !("refresh" in opt) || feed !== "nearby" && nav.history.forwardStack.length > 0)) {
                    promise = this._bind(feed, Yodel.data[feed], tag).then(function (event) {
                        event.target.scrollTop = Yodel.last_index[feed];
                    });
                }
                // Load new feed
                else {
                    switch (feed) {
                        case "nearby":
                            method = Yodel.handle.get_yaks();
                            break;
                        case "peek":
                            method = Yodel.handle.peek(nav.state.id);
                            break;
                        case "peek_anywhere":
                            method = Yodel.handle.peek_anywhere(nav.state.lat, nav.state.long);
                            break;
                        case "my_top_yaks":
                            method = Yodel.handle.get_my_tops();
                            if (!this.sortType) {
                                this.sortType = "hot";
                            }
                            break;
                        case "my_recent_yaks":
                            method = Yodel.handle.get_my_recent_yaks();
                            break;
                        case "my_recent_replies":
                            method = Yodel.handle.get_my_recent_replies();
                            break;
                        case "area_tops":
                            method = Yodel.handle.get_area_tops();
                            this.sortType = "hot";
                            break;
                        case "alltime_tops":
                            method = Yodel.handle.get_greatest();
                            break;
                        case "comments":
                            method = Yodel.handle.get_comments(nav.state.message_id);
                            parser = "parse_comments";
                            break;
                        case "individual_yak":
                            method = Yodel.handle.get_yak(opt.message_id);
                            break;
                        default:
                            console.log("Warning: Unsupported feed type passed to yak_feed.load");
                            return;
                    }

                    promise = this._retrieve(method).then(function (json) {
                        // Cache associated data from the nearby yaks API call
                        if (feed === "nearby") {
                            Yodel.data.pivot = {
                                featuredLocations: json.featuredLocations,
                                otherLocations: json.otherLocations,
                                yakarma: json.yakarma,
                                photosEnabled: Boolean(json.photosEnabled || 0)
                            };
                        }
                        // Update comments total if it's different from what the API reports
                        // For some reason, the API does not consistently report correct totals
                        if (feed === "comments") {
                            var comments = opt.yak.comments;
                            if (json.comments && comments !== json.comments.length) {
                                opt.yak.comments = json.comments.length;
                                that._bind("comments_parent", [opt.yak], "yak_detail");
                            }
                        }
                        // 'Hot' is the only sort type that we always need to manually sort
                        if (opt.refresh && feed in Yodel.sort && Yodel.sort[feed] === "hot") {
                            that.sortType = "hot";
                        }
                        
                        var yak_list = Yodel.handle[parser](json);
                        return that._bind(feed, yak_list, tag);
                    });
                }

                return promise;
            },
            sort: function (data, type) {
                switch (type) {
                    case "new":
                        data.sort(function (obj1, obj2) {
                            return obj2.delivery_id - obj1.delivery_id;
                        });
                        break;
                    case "hot":
                        data.sort(function (obj1, obj2) {
                            return obj2.likes - obj1.likes;
                        });
                }
                return data;
            },
            _bind: function (feed, yak_data, list_tag) {
                if (this.sortType) {
                    yak_data = this.sort(yak_data, this.sortType);
                    Yodel.sort[feed] = this.sortType;
                }
                if (!(feed in Yodel.sort)) {
                    Yodel.sort[feed] = "new";
                }

                var list = document.getElementById(list_tag);
                var jquery_list = $(list);

                Yodel.data[feed] = yak_data;
                nav.state.method = feed;

                return new WinJS.Promise(function (complete) {
                    if (list) {
                        if (yak_data && !yak_data.length) {
                            $(".no_messages").css("display", "block");
                            complete({ target: list });
                        }
                        else {
                            // Declare Promise complete once the list has been loaded
                            jquery_list.on("itemsLoaded.b_" + feed, complete);

                            Yodel.bind_options(list, {
                                dataSource: "Yodel.data." + feed
                            });

                            // Clean out event listeners, in case we're re-binding to the same list
                            // e.g. what would happen after pull-to-refresh
                            jquery_list.off(".binding");

                            if (feed !== "comments" && feed !== "comments_parent") {
                                jquery_list.on("click.binding", ".win-template", function (event) {
                                    // Prevent context menu from being fired
                                    event.stopImmediatePropagation();

                                    var yak_container = event.currentTarget.firstElementChild;
                                    if(yak_container && !WinJS.Utilities.hasClass(yak_container, "special")) {
                                        Yodel.Actions.to_comments(event, feed);
                                    }
                                });
                            }

                            if ("can_vote" in nav.state && nav.state.can_vote) {
                                jquery_list.on("click.binding", ".yak_up", Yodel.Actions.vote.bind({ feed: feed, direction: "up" }));
                                jquery_list.on("click.binding", ".yak_down", Yodel.Actions.vote.bind({ feed: feed, direction: "down" }));
                            }
                            else {
                                jquery_list.addClass("no_submit");
                            }

                            jquery_list.on("click.binding", ".yak_image", Yodel.Actions.viewImage);

                            jquery_list.on("customContextMenu", function (thisEvent, itemEvent) {
                                var index;
                                try {
                                    index = parseInt(itemEvent.currentTarget.getAttribute("aria-posinset"));
                                }
                                catch (e) { return; }

                                if (Yodel.data[feed][index] != null && feed !== "comments_parent") {
                                    var item = Yodel.data[feed][index];

                                    var menu = new Windows.UI.Popups.PopupMenu();

                                    var commandParams = { feed: feed, item: item };
                                    menu.commands.append(new Windows.UI.Popups.UICommand(lang.getString("action_report").value, Yodel.Actions.report.bind(commandParams)));
                                    menu.commands.append(new Windows.UI.Popups.UICommand(lang.getString("action_share").value, Yodel.Actions.share.bind(commandParams)));
                                    if (item.poster_id === Yodel.handle.id) {
                                        menu.commands.append(new Windows.UI.Popups.UICommand(lang.getString("action_delete").value, Yodel.Actions.remove.bind(commandParams)));
                                    }

                                    menu.showAsync({
                                        x: itemEvent.pageX - window.pageXOffset,
                                        y: itemEvent.pageY - window.pageYOffset
                                    });
                                }
                            });
                        }

                        if (feed !== "comments_parent") {
                            $(".page_progress").css("display", "none");
                        }
                    }
                }).then(function (event) {
                    jquery_list.off("itemsLoaded.b_" + feed);
                    return event;
                });
            },
            _retrieve: function (promise) {
                return promise.then(function (response) {
                    console.log(response);
                    if (response.isSuccessStatusCode) {
                        return response.content.readAsStringAsync();
                    }
                    else {
                        $(".page_progress").css("display", "none");
                        Yodel.popup_error("HTTP Error " + response.statusCode + " " + response.reasonPhrase, lang.getString("msg_feed-fail").value);
                        return null;
                    }
                }).then(function (res) {
                    if (res) {
                        var res_json;

                        try {
                            res_json = JSON.parse(res);
                            console.log(res_json);
                        }
                        catch (e) {
                            $(".page_progress").css("display", "none");
                            if (e instanceof SyntaxError) {
                                Yodel.popup_error("The server did not return a valid response. Raw response: " + res, lang.getString("msg_feed-fail").value);
                            }
                            else {
                                Yodel.popup_error("An unknown error occured. (yak_feed._retrieve/JSON parsing)", lang.getString("msg_feed-fail").value);
                            }
                        }

                        if (("messages" in res_json && res_json.messages.length > 0) || ("comments" in res_json && res_json.comments.length > 0)) {
                            return res_json;
                        }
                    }

                    $(".page_progress").css("display", "none");
                    return [];
                });
            }
        })
    });

})();
