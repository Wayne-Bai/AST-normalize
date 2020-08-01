/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * js/yak_api.js
 *
 * Forked from Joseph Connor's pyak Python API library.
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */

(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var lang = WinJS.Resources;

    WinJS.Namespace.define("API", {
        parse_time: function (time_eastern, time_unix) {
            var parsed_time;
            if (isNaN(time_unix)) {
                var format = "YYYY-MM-DD HH:mm:ss";
                parsed_time = moment.tz(time_eastern, format, "America/Anguilla").twitter();
            }
            else {
                parsed_time = moment.unix(time_unix).twitter();
            }

            return parsed_time;
        },

        Location: WinJS.Class.define(function(latitude, longitude, accuracy, altitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.accuracy = !accuracy ? 0 : accuracy;
            this.altitude = !altitude ? 0 : altitude;
        }),

        PeekLocation: WinJS.Class.define(function(raw) {
            this.id = raw.peekID;
            var lat = raw.latitude;
            var lon = raw.longitude;
            this.location = new API.Location(lat, lon);
            this.name = raw.location;
            this.canSubmit = Boolean(parseInt(raw.canSubmit));
            this.canReply = Boolean(parseInt(raw.canReply));
            this.canReport = Boolean(parseInt(raw.canReport));
            this.canVote = Boolean(parseInt(raw.canVote));
            this.isFictional = Boolean(parseInt(raw.isFictional));
            this.isLocal = Boolean(parseInt(raw.isLocal));
            this.inactive = Boolean(parseInt(raw.inactive));
        }),

        Yakker: WinJS.Class.define(function (user_id, loc) {
            this.endpoint = "https://us-central-api.yikyakapi.net/api";
            this.user_agent = this.gen_useragent();
            this._key = Windows.Storage.ApplicationData.current.localSettings.values.api_key;
            this.version = "2.4.2e";

            if(!loc) {
                loc = new API.Location(0, 0, 0, 0);
            }
    
            this.loc = loc;

            this.id = user_id;

            this.handle = null;
            if (appData.roamingSettings.values.handle) {
                this.handle = appData.roamingSettings.values.handle;
            }

            if (!("service_config" in this)) {
                this.service_config = {};
            }
        }, {
            get_features: function(name, url) {
                var localFolder = appData.localFolder;
                var filename = url.split("/").pop();
                var file_uri = new Windows.Foundation.Uri("ms-appdata:///local/" + filename);
                var that = this;

                function fetch_new() {
                    var httpClient = new Windows.Web.Http.HttpClient();
                    return httpClient.getAsync(Windows.Foundation.Uri(url)).then(
                        function (response) {
                            console.log(response);
                            return response.content.readAsStringAsync();
                        }).then(function (content) {
                            localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {
                                Windows.Storage.FileIO.writeTextAsync(file, content);
                            });
                            return WinJS.Promise.as(content);
                        }
                    );
                }

                if (!("service_config" in this) || !(name in this.service_config)) {
                    return Windows.Storage.StorageFile.getFileFromApplicationUriAsync(file_uri).then(
                        function (file) {
                            return file.getBasicPropertiesAsync().then(
                                function (properties) {
                                    return properties.dateModified;
                                }).then(function (date) {
                                    var httpClient = new Windows.Web.Http.HttpClient();
                                    var headers = httpClient.defaultRequestHeaders;
                                    headers.ifModifiedSince = date;
                                    return httpClient.getAsync(new Windows.Foundation.Uri(url));
                                }).then(function (response) {
                                    console.log(response);
                                    if (response.statusCode === 304) {
                                        // Remote file isn't modified, load cached file
                                        return localFolder.getFileAsync(filename).then(function (file) {
                                            return Windows.Storage.FileIO.readTextAsync(file);
                                        });
                                    }
                                    else {
                                        // Remote file is modified, load anew
                                        return fetch_new();
                                    }
                                }
                            );
                        },
                        function () {
                            // No cached file exists, load anew
                            return fetch_new();
                        }
                    ).then(function (content) {
                        content = JSON.parse(content);
                        that.service_config[name] = content.configuration;
                    });
                }
            },
            get_endpoint: function() {
                if ("endpoints" in this.service_config && Array.isArray(this.service_config.endpoints.endpoints)) {
                    var endpoints = this.service_config.endpoints.endpoints;
                    var longitude = this.loc.longitude | 0;

                    for (var ep_i in endpoints) {
                        if (longitude >= endpoints[ep_i].min_longitude &&
                            longitude <= endpoints[ep_i].max_longitude) {

                            this.endpoint = endpoints[ep_i].url;
                            return;
                        }
                    }
                }
            },
            gen_random: function (num) {
                var buf = new Uint16Array(8);
                window.msCrypto.getRandomValues(buf);
                var arr = [];

                // Decrement num by one to align with zero-indexed array
                num--;
                for (var cur = 0; cur <= num; cur++) {
                    // Get a chunk of the crypto buffer and force to string
                    var ret = buf[cur].toString(16);
                    while (ret.length < 4) {
                        ret = "0" + ret;
                    }
                    arr.push(ret);
                }

                return arr;
            },
            gen_useragent: function () {
                var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                // Check if we've already generated a useragent
                // If so, return that one
                if ("useragent" in roamingSettings.values) {
                    return roamingSettings.values.useragent;
                }

                var base = [];
                base[0] = "Dalvik/1.6.0 (Linux; U; Android 4.4.4; ";
                base[1] = " Build/";
                base[2] = ")";

                var devices = [
                    "Nexus 4",
                    "Nexus 5",
                    "HTC One_M8",
                    "SM-N900V",
                    "XT1080",
                    "SM-G900V",
                    "SCH-I545"
                ];

                // Select random device name
                var device = devices[Math.floor(Math.random() * (devices.length - 1)) + 1];
                // Generate random build ID
                var build = this.gen_random(2);
                build = (build[0] + build[1]).substring(0, 6).toUpperCase();

                var useragent = base[0] + device + base[1] + build + base[2];
                // Save useragent to roaming settings, since we should be consistent
                roamingSettings.values.useragent = useragent;

                return useragent;
            },
            gen_id: function () {
                var random = this.gen_random(8);
                var hashIn = random[0] + random[1] + "-" + random[2] + "-" + random[3] + "-" + random[4] + "-" + random[5] + random[6] + random[7];
                return this.md5(hashIn);
            },
            md5: function(text) {
                // Open convoluted WinRT hashing API
                var winCrypt = Windows.Security.Cryptography;
                var hashProvider = winCrypt.Core.HashAlgorithmProvider.openAlgorithm(winCrypt.Core.HashAlgorithmNames.md5);
                // Convert input to binary
                var buffer = hashProvider.hashData(winCrypt.CryptographicBuffer.convertStringToBinary(text, winCrypt.BinaryStringEncoding.utf8));
                // Produce MD5 hash in hex form
                var hash = winCrypt.CryptographicBuffer.encodeToHexString(buffer);
                return hash.toUpperCase();
            },
            sign_request: function (page, params) {
                // Salt is current Unix time in seconds
                var salt = String(Math.floor(new Date().getTime() / 1000));
        
                // Message is API endpoint (minus domain) + sorted parameters
                var msg = "/api/" + page + "?";
                var sorted_params = Object.keys(params);
                sorted_params.sort();
        
                if(sorted_params.length > 0) {
                    for (var param in sorted_params) {
                        if (sorted_params.hasOwnProperty(param)) {
                            msg += sorted_params[param] + "=" + params[sorted_params[param]] + "&";
                        }
                    }

                    msg = msg.slice(0, -1);
                }
                else {
                    console.log("Warning: no parameters passed to yak_api/sign_request.");
                }
        
                msg += salt;
                console.log(msg);
        
                // Calculate HMAC signature
                var winCrypt = Windows.Security.Cryptography;
                var macAlgorithm = winCrypt.Core.MacAlgorithmProvider.openAlgorithm("HMAC_SHA1");
                var keyMaterial = winCrypt.CryptographicBuffer.convertStringToBinary(this._key, winCrypt.BinaryStringEncoding.Utf8);
                var macKey = macAlgorithm.createKey(keyMaterial);
                var tbs = winCrypt.CryptographicBuffer.convertStringToBinary(msg, winCrypt.BinaryStringEncoding.utf8);
                var sigBuffer = winCrypt.Core.CryptographicEngine.sign(macKey, tbs);
                var sig = winCrypt.CryptographicBuffer.encodeToBase64String(sigBuffer).trim();

                return { "hash": sig, "salt": salt };
            },
            encode_params: function(params, signed) {
                var signed_params = "salt=" + signed.salt + "&hash=" + encodeURIComponent(signed.hash);
                var query = "?";

                if (params) {
                    var param_keys = Object.keys(params).sort();
                    if (param_keys.length > 0) {
                        for (var param in param_keys) {
                            if (param_keys.hasOwnProperty(param)) {
                                query += param_keys[param] + "=" + encodeURIComponent(params[param_keys[param]]) + "&";
                            }
                        }
                        query += signed_params;
                    }
                }
                else {
                    query += signed_params;
                }

                return query;
            },
            get: function (page, params) {
                var url = this.endpoint + "/" + page;

                var signed = this.sign_request(page, params);
                var query = this.encode_params(params, signed);

                var httpClient = new Windows.Web.Http.HttpClient();
                var headers = httpClient.defaultRequestHeaders;
                headers.userAgent.parseAdd(this.user_agent);
                headers.acceptEncoding.parseAdd("gzip");
                headers.connection.parseAdd("Keep-Alive");

                url = new Windows.Foundation.Uri(url + query);
                console.log(headers);
                console.log(params);

                return httpClient.getAsync(url);
            },
            post: function (page, params, post_data) {
                var url = this.endpoint + "/" + page;

                var signed = this.sign_request(page, params);
                var query = this.encode_params(params, signed);

                // Add hash and salt to post params
                post_data.hash = signed.hash;
                post_data.salt = signed.salt;

                var httpClient = new Windows.Web.Http.HttpClient();
                var headers = httpClient.defaultRequestHeaders;
                headers.userAgent.parseAdd(this.user_agent);
                headers.acceptEncoding.parseAdd("gzip");
                headers.connection.parseAdd("Keep-Alive");

                var post_params = (new Windows.Web.Http.HttpClient()).defaultRequestHeaders;
                var param_keys = Object.keys(post_data).sort();
                for (var param in param_keys) {
                    if (param_keys.hasOwnProperty(param)) {
                        post_params[param_keys[param]] = post_data[param_keys[param]];
                    }
                }
                var post_content = new Windows.Web.Http.HttpFormUrlEncodedContent(post_params);

                url = new Windows.Foundation.Uri(url + query);
                console.log(headers);
                console.log(params);
                console.log(post_params);

                return httpClient.postAsync(url, post_content);
            },
            register_id_new: function (id) {
                var params = {
                    "userID": id,
                    "deviceID": this.gen_id(),
                    "token": this.md5(this.user_agent),
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };

                // Save generated device ID to roaming settings
                appData.roamingSettings.values.deviceID = params.deviceID;

                return this.get("registerUser", params);
            },
            register_id_parse: function () {
                appData.roamingSettings.values.parsecom_iid = "";
                var parse = new Parse.Client(this.version);
                var yak_id = this.id;
                var object_id;

                return parse.create_installation().then(function (response) {
                    console.log(response);
                    if (response.isSuccessStatusCode) {
                        return response.content.readAsStringAsync();
                    }
                }).then(function (json) {
                    console.log(json);
                    try {
                        var res_json = JSON.parse(json);
                        object_id = res_json.result.data.objectId;
                    }
                    catch (e) {
                        if (e instanceof SyntaxError) {
                            Yodel.popup_error("The server did not return a valid response. Raw response: " + json, lang.getString("msg_register-user-fail").value);
                        }
                        else {
                            Yodel.popup_error("An unknown error occured. (yak_api.register_id_parse/objectId retrieval)", lang.getString("msg_register-user-fail").value);
                        }
                    }

                    return parse.save_object("update", {
                        objectId: object_id,
                        pushType: "gcm"
                    });
                }).then(function (response) {
                    console.log(response);
                    if (response.isSuccessStatusCode) {
                        return parse.save_object("update", {
                            channels: {
                                __op: "AddUnique",
                                objects: ["c" + yak_id + "c"]
                            },
                            objectId: object_id
                        });
                    }
                }).then(function (response) {
                    console.log(response);
                });
            },
            parse_yaks: function (text) {
                var raw_yaks = text.messages;
                var yaks = [];
                for (var raw_yak in raw_yaks) {
                    if (raw_yaks.hasOwnProperty(raw_yak)) {
                        var yak = new API.Yak(raw_yaks[raw_yak]);
                        // Prepend special service messages
                        if (yak.delivery_id === 10000) {
                            yaks.unshift(yak);
                        }
                        else {
                            yaks.push(yak);
                        }
                    }
                }
                return yaks;
            },
            parse_comments: function (text, message_id) {
                var raw_comments = text.comments;
                var comments = [];
                for (var raw_comment in raw_comments) {
                    if (raw_comments.hasOwnProperty(raw_comment)) {
                        comments.push(new API.Comment(raw_comments[raw_comment], message_id));
                    }
                }
                return comments;
            },
            get_yaks: function() {
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getMessages", params);
            },
            get_yak: function(message_id) {
                var params = {
                    "userID": this.id,
                    "messageID": message_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getMessage", params);
            },
            upvote_yak: function(message_id) {
                var params = {
                    "userID": this.id,
                    "messageID": message_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("likeMessage", params);
            },
            downvote_yak: function(message_id) {
                var params = {
                    "userID": this.id,
                    "messageID": message_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("downvoteMessage", params);
            },
            upvote_comment: function(comment_id) {
                var params = {
                    "userID": this.id,
                    "commentID": comment_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("likeComment", params);
            },
            downvote_comment: function(comment_id) {
                var params = {
                    "userID": this.id,
                    "commentID": comment_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("downvoteComment", params);
            },
            report_yak: function(message_id, reason) {
                var params = {
                    "userID": this.id,
                    "messageID": message_id,
                    "reason": reason,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("reportMessage", params);
            },
            delete_yak: function(message_id) {
                var params = {
                    "userID": this.id,
                    "messageID": message_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("deleteMessage2", params);
            },
            report_comment: function(comment_id, message_id, reason) {
                var params = {
                    "userID": this.id,
                    "commentID": comment_id,
                    "messageID": message_id,
                    "reason": reason,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("reportMessage", params);
            },
            delete_comment: function(comment_id, message_id) {
                var params = {
                    "userID": this.id,
                    "commentID": comment_id,
                    "messageID": message_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("deleteComment", params);
            },
            get_greatest: function() {
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getGreatest", params);
            },
            get_my_tops: function() {
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getMyTops", params);
            },
            get_my_recent_replies: function() {
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getMyRecentReplies", params);
            },
            update_location: function(loc) {
                this.loc = loc;
            },
            get_my_recent_yaks: function() {
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getMyRecentYaks", params);
            },
            get_area_tops: function() {
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getAreaTops", params);
            },
            post_yak: function (message, handle, bypassedThreatCheck) {
                var params = {
                    "userID": this.id,
                    "version": this.version
                };
                var post_data = {
                    "bypassedThreatPopup": bypassedThreatCheck,
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "message": message,
                    "version": this.version
                };
                if(handle && this.handle) {
                    post_data.hndl = this.handle;
                }
                return this.post("sendMessage", params, post_data);
            },
            get_comments: function(message_id) {
                var params = {
                    "userID": this.id,
                    "messageID": message_id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("getComments", params);
            },
            post_comment: function (message_id, comment, bypassedThreatCheck) {
                var params = {
                    "userID": this.id,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                var post_data = {
                    "bypassedThreatPopup": bypassedThreatCheck,
                    "userID": this.id,
                    "messageID": message_id,
                    "comment": comment,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.post("postComment", params, post_data);
            },
            get_peek_locations: function(locations) {
                var peeks = [];
                for (var peek_json in locations) {
                    if (locations.hasOwnProperty(peek_json)) {
                        peeks.push(new API.PeekLocation(locations[peek_json]));
                        peeks[peek_json].index = Number(peek_json);
                    }
                }
                return peeks;
            },
            get_featured_locations: function(data) {
                return this.get_peek_locations(data.featuredLocations);
            },
            get_popular_locations: function(data) {
                return this.get_peek_locations(data.otherLocations);
            },        
            get_yakarma: function(data) {
                return parseInt(data.yakarma);
            },
            peek: function (peek_id) {
                if (peek_id instanceof API.PeekLocation) {
                    peek_id = peek_id.id;
                }
                var params = {
                    "userID": this.id,
                    "lat": this.loc.latitude,
                    "long": this.loc.longitude,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "peekID": peek_id,
                    "version": this.version
                };
                return this.get("getPeekMessages", params);
            },
            peek_anywhere: function (lat, long) {
                var params = {
                    "lat": lat,
                    "long": long,
                    "userID": this.id,
                    "userLat": this.loc.latitude,
                    "userLong": this.loc.longitude,
                    "accuracy": this.loc.accuracy,
                    "altitude": this.loc.altitude,
                    "version": this.version
                };
                return this.get("yaks", params);
            },
            map_autosuggest: function (searchTerms) {
                var params = {
                    "input": searchTerms,
                    "types": "(cities)",
                    "version": this.version
                };
                return this.get("map", params);
            }
        }),

        Yak: WinJS.Class.define(function (raw) {
            this.poster_id = raw.posterID;
            //this.hide_pin = Boolean(parseInt(raw.hidePin));
            this.handle = raw.handle || "";
            this.message_id = String(raw.messageID).replace('\\', '');
            this.delivery_id = raw.deliveryID;
            this.latitude = raw.latitude;
            this.longitude = raw.longitude;
            this.comments = parseInt(raw.comments);
            this.time_eastern = raw.time;
            this.time_gmt = raw.gmt;
            this.likes = parseInt(raw.numberOfLikes);
            this.liked = parseInt(raw.liked);
            this.score = raw.score;
            this.message = raw.message;
            this.type = raw.type;
            //this.reyaked = raw.reyaked;
            this.readonly = raw.readOnly;

            this.specialClass = (this.delivery_id === 10000 ? "yak_container special" : "yak_container");

            this.image = raw.url || "";
            this.imageThumbnail = raw.thumbNailUrl || "";
            this.imageExpand = raw.expandInFeed || 0;

            this.imageCss = "url(" + this.image + ")";
            this.imageThumbnailCss = "url(" + this.imageThumbnail + ")";
            this.showImage = (this.image ? "block" : "none");

            Object.defineProperties(this, {
                "comments_pretty": {
                    enumerable: true,
                    get: function () {
                        if (this.comments > 0) {
                            var comments_pretty;
                            if (this.comments > 1) {
                                comments_pretty = sprintf(lang.getString("general_replies-plural").value, this.comments);
                            }
                            else {
                                comments_pretty = sprintf(lang.getString("general_replies-singular").value, this.comments);
                            }

                            return comments_pretty;
                        }
                        else {
                            return "";
                        }
                    }
                },

                "time_pretty": {
                    enumerable: true,
                    get: function () {
                        return API.parse_time(this.time_eastern, this.time_gmt);
                    }
                },

                "upvote": {
                    enumerable: true,
                    get: function () {
                        if (this.liked === 1) {
                            return "yak_up yak_voted";
                        }
                        else {
                            return "yak_up";
                        }
                    }
                },

                "downvote": {
                    enumerable: true,
                    get: function () {
                        if (this.liked === -1) {
                            return "yak_down yak_voted";
                        }
                        else {
                            return "yak_down";
                        }
                    }
                }
            });

        }, {}),


        Comment: WinJS.Class.define(function (raw, message_id) {
            this.message_id = message_id;
            this.comment_id = String(raw.commentID).replace('\\', '');
            this.comment = raw.comment;
            this.time_eastern = raw.time;
            this.time_gmt = raw.gmt;
            this.likes = parseInt(raw.numberOfLikes);
            this.poster_id = raw.posterID;
            this.liked = parseInt(raw.liked);

            Object.defineProperties(this, {
                "time_pretty": {
                    enumerable: true,
                    get: function () {
                        return API.parse_time(this.time_eastern, this.time_gmt);
                    }
                },

                "upvote": {
                    enumerable: true,
                    get: function () {
                        if (this.liked === 1) {
                            return "yak_up yak_voted";
                        }
                        else {
                            return "yak_up";
                        }
                    }
                },

                "downvote": {
                    enumerable: true,
                    get: function () {
                        if (this.liked === -1) {
                            return "yak_down yak_voted";
                        }
                        else {
                            return "yak_down";
                        }
                    }
                }
            });

        }, {})
    });
})();
