/*
 * Copyright (c) 2011 Imaginea Technologies Private Ltd.
 * Hyderabad, India
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

YUI({
    filter: 'raw'
}).use("io", "json", "node", "utility", function(Y) {
        var MV = YUI.com.imaginea.mongoV;
        var tryLogin = function(e) {
            Y.one("#spinner").addClass("spinner");
            Y.one('#loginMsg').setStyle('visibility', 'visible');

            var username = Y.one("#username").get("value").trim(),
                password = Y.one("#password").get("value").trim(),
                port = Y.one("#port").get("value").trim(),
                host = Y.one("#host").get("value").trim(),
                databases = Y.one("#databases").get("value").trim();

            var resetBGColor = function() {
                Y.all("input").setStyle("background", "#FFFFFF");
            };

            var errorHandlerMap = {
                "HOST_UNKNOWN": function() {
                    resetBGColor();
                    Y.one("#port").setStyle("background", "#FFEBE8");
                    Y.one("#host").setStyle("background", "#FFEBE8");
                    Y.one("#host").focus();
                },
                "MISSING_LOGIN_FIELDS": function() {
                    resetBGColor();
                    var fields = Y.all("input");
                    fields.each(function() {
                        if (this.get("value") === "") {
                            this.setStyle("backgroundColor", "#FFEBE8");
                        }
                    });
                },
                "ERROR_PARSING_PORT": function() {
                    resetBGColor();
                    Y.one("#port").setStyle("background", "#FFEBE8");
                    Y.one("#port").focus();
                },
                "INVALID_ARGUMENT": function() {
                    resetBGColor();
                    Y.one("#port").setStyle("background", "#FFEBE8");
                    Y.one("#port").focus();
                },
                "INVALID_USERNAME": function() {
                    resetBGColor();
                    var userNode = Y.one("#username");
                    userNode.set("value", "");
                    userNode.setStyle("background", "#FFEBE8");
                    userNode.focus();
                    Y.one("#password").setStyle("background", "#FFEBE8");
                },
                "NEED_AUTHORISATION": function() {
                    resetBGColor();
                    var userNode = Y.one("#username");
                    userNode.set("value", "");
                    userNode.setStyle("background", "#FFEBE8");
                    userNode.focus();
                    Y.one("#password").setStyle("background", "#FFEBE8");
                }
            };
            var request = Y.io(MV.URLMap.login(), {
                data: "username=" + username + "&password=" + password + "&port=" + port + "&host=" + host + "&databases=" + databases,
                method: "POST",
                on: {
                    success: function(ioId, responseObject) {
                        var jsonObject = MV.toJSON(responseObject);
                        var responseResult = MV.getResponseResult(jsonObject), errorDiv;
                        if (responseResult) {
                            window.location = "home.html?connectionId=" + responseResult.connectionId;
                        } else {
                            errorDiv = Y.one("#errorMsg");
                            var errorMessage = MV.getErrorMessage(jsonObject);
                            errorDiv.set("innerHTML", errorMessage);
                            errorDiv.setStyle("display", "inline");
                            Y.log("Could not login: " + errorMessage, "error");
                            Y.one('#loginMsg').setStyle('visibility', 'hidden');
                        }
                    },
                    failure: function(ioId, responseObject) {
                        alert("Could not send request! Please check if application server is running.");
                        Y.log("Could not send request.", "error");
                    },
                    end: function () {
                        Y.one("#spinner").removeClass("spinner");
                    }
                }
            });
        };

        Y.all("input").on("keyup", function(eventObject) {
            // for enter key submit the form
            if (eventObject.keyCode === 13) {
                tryLogin();
            }
        });

        var checkSession = function() {
            var query = window.location.search.substring(1);
            var code = query.split("=");
            if (code[1] === "INVALID_SESSION") {
                var errorDiv = Y.one("#errorMsg");
                var msg = "[0]".format(MV.errorCodeMap[code[1]])
                errorDiv.set("innerHTML", msg || "Error!");
                errorDiv.setStyle("display", "inline");
            }
            if (code[1] === "INVALID_CONNECTION") {
                var errorDiv = Y.one("#errorMsg");
                var msg = "[0]".format(MV.errorCodeMap[code[1]])
                errorDiv.set("innerHTML", msg || "Error!");
                errorDiv.setStyle("display", "inline");
            }
        };

        Y.on("load", checkSession);
        Y.one("#login").on('click', tryLogin);
        Y.one("#login").focus();
    });
