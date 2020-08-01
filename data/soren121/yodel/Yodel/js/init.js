/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * js/init.js
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */

(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    var appData = Windows.Storage.ApplicationData.current;
    var lang = WinJS.Resources;

    function getStatusString(locStatus) {
        switch (locStatus) {
            case Windows.Devices.Geolocation.PositionStatus.ready:
                // Location data is available
                return lang.getString("msg_geolocation-ready").value;
                break;
            case Windows.Devices.Geolocation.PositionStatus.initializing:
                // This status indicates that a GPS is still acquiring a fix
                return lang.getString("msg_geolocation-init").value;
                break;
            case Windows.Devices.Geolocation.PositionStatus.noData:
                // No location data is currently available 
                return lang.getString("msg_geolocation-nodata").value;
                break;
            case Windows.Devices.Geolocation.PositionStatus.disabled:
                // The app doesn't have permission to access location,
                // either because location has been turned off.
                return lang.getString("msg_geolocation-disabled").value;
                break;
            case Windows.Devices.Geolocation.PositionStatus.notInitialized:
                // This status indicates that the app has not yet requested
                // location data by calling GetGeolocationAsync() or 
                // registering an event handler for the positionChanged event. 
                return lang.getString("msg_geolocation-noinit").value;
                break;
            case Windows.Devices.Geolocation.PositionStatus.notAvailable:
                // Location is not available on this version of Windows
                return lang.getString("msg_geolocation-unavailable").value;
                break;
            default:
                break;
        }
    }

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            Yodel.handle = new API.Yakker();

            WinJS.Namespace.define("Yodel.data");
            WinJS.Namespace.define("Yodel.last_index");
            WinJS.Namespace.define("Yodel.sort");

            Yodel.bind_options(document.getElementById("appbar"), {
                disabled: "true"
            });

            function appInit(skipBeta) {
                if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                    if (skipBeta === true) {
                        Yodel.UI.appbarListener(true);
                    }

                    ExtendedSplash.show(args.detail.splashScreen);
                    Yodel.handle.get_features("features", "https://d3436qb9f9xu23.cloudfront.net/yikyak-config.json").then(function () {
                        var threatWordsUrl;
                        try {
                            threatWordsUrl = Yodel.handle.service_config.features.threatWords.threatWordsUrl;
                        }
                        catch (e) {
                            threatWordsUrl = "https://d3436qb9f9xu23.cloudfront.net/yik_yak_threat_words.json";
                        }
                        Yodel.handle.get_features("threatWords", threatWordsUrl);
                    });

                    var loc = null;

                    if (loc == null) {
                        loc = new Windows.Devices.Geolocation.Geolocator();
                    }
                    if (loc != null) {
                        console.log("starting geoloc");

                        loc.getGeopositionAsync().then(function (pos) {
                            console.log("geoloc returned");
                            appData.localSettings.values.gl_lat = pos.coordinate.point.position.latitude.toFixed(6);
                            appData.localSettings.values.gl_long = pos.coordinate.point.position.longitude.toFixed(6);
                            appData.localSettings.values.gl_accuracy = pos.coordinate.accuracy.toFixed(1);
                            appData.localSettings.values.gl_altitude = pos.coordinate.point.position.altitude.toFixed(6);

                            Yodel.handle.update_location(new API.Location(
                                appData.localSettings.values.gl_lat,
                                appData.localSettings.values.gl_long,
                                appData.localSettings.values.gl_accuracy,
                                appData.localSettings.values.gl_altitude
                            ));

                            Yodel.handle.get_features("endpoints", "https://d3436qb9f9xu23.cloudfront.net/yikyakurl.json").then(function () {
                                Yodel.handle.get_endpoint();
                            });

                            if (typeof appData.roamingSettings.values.yakker_id === "undefined" || appData.roamingSettings.values.yakker_id.length < 32) {
                                var user_id = Yodel.handle.gen_id();
                                console.log("Registering new user with id " + user_id);

                                ExtendedSplash.showProgress();

                                Yodel.handle.register_id_new(user_id).then(function (response) {
                                    console.log(response);
                                    if (response.isSuccessStatusCode) {
                                        appData.roamingSettings.values.yakker_id = user_id;
                                        appData.roamingSettings.values.registration_date = moment().format();
                                        Yodel.handle.id = user_id;

                                        Yodel.handle.register_id_parse();

                                        setTimeout(function () {
                                            ExtendedSplash.remove();
                                            Yodel.pivot_init();
                                        }, 2000);
                                    }
                                    else {
                                        Yodel.popup_error("HTTP Error " + response.statusCode + " " + response.reasonPhrase, lang.getString("msg_register-user-fail").value);
                                    }

                                    return response.content.readAsStringAsync();
                                }).then(function (content) {
                                    console.log(content);
                                });
                            }
                            else {
                                Yodel.handle.id = appData.roamingSettings.values.yakker_id;

                                ExtendedSplash.remove();
                                Yodel.pivot_init();
                            }
                        },
                        function (error) {
                            var buttons = {};
                            buttons[lang.getString("popup_okay").value] = function () {
                                window.close();
                            };

                            Yodel.popup_error(getStatusString(loc.locationStatus), lang.getString("msg_geolocation-fail").value, buttons);
                        });
                    }
                } else {
                    Yodel.UI.appbarListener();

                    nav.state = app.sessionState.lastState;

                    // This application has been reactivated from suspension.
                    Yodel.handle.id = appData.roamingSettings.values.yakker_id;
                    Yodel.handle.update_location(new API.Location(
                        appData.localSettings.values.gl_lat,
                        appData.localSettings.values.gl_long,
                        appData.localSettings.values.gl_accuracy,
                        appData.localSettings.values.gl_altitude
                    ));

                    Yodel.handle.service_config = app.sessionState.service_config;
                    if (Yodel.handle.service_config === {}) {
                        Yodel.handle.get_features("features", "https://d3436qb9f9xu23.cloudfront.net/yikyak-config.json").then(function () {
                            var threatWordsUrl;
                            try {
                                threatWordsUrl = Yodel.handle.service_config.features.threatWords.threatWordsUrl;
                            }
                            catch (e) {
                                threatWordsUrl = "https://d3436qb9f9xu23.cloudfront.net/yik_yak_threat_words.json";
                            }
                            Yodel.handle.get_features("threatWords", threatWordsUrl);
                        });
                        Yodel.handle.get_features("endpoints", "https://d3436qb9f9xu23.cloudfront.net/yikyakurl.json").then(function () {
                            Yodel.handle.get_endpoint();
                        });
                    }

                    if (app.sessionState.history.current.location === "/pages/hub/hub.html") {
                        Yodel.pivot_init();
                    }
                }
            }

            if (typeof appData.roamingSettings.values.yakker_id === "undefined" || appData.roamingSettings.values.yakker_id.length < 32) {
                Yodel.UI.appbarListener(true);

                ExtendedSplash.show(args.detail.splashScreen, true);

                document.getElementById("extendedSplashOption_NewUser").addEventListener("click", function () {
                    document.getElementById("extendedSplashBetaOption").style.visibility = "hidden";
                    ExtendedSplash.showProgress();

                    appInit();
                });

                document.getElementById("extendedSplashOption_BetaTester").addEventListener("click", function () {
                    var textarea_container = document.createElement("div");
                    var textarea = document.createElement("textarea");
                    textarea.id = "transferTextarea";
                    textarea.placeholder = lang.getString("transfer_textarea-placeholder").value;

                    var verify = document.createElement("button");
                    verify.innerText = "validate";

                    verify.addEventListener("click", function () {
                        var data = document.getElementById("transferTextarea").value;

                        if (data.length % 4 !== 0) {
                            Yodel.popup_error("The encrypted text isn't the right length. Maybe you didn't copy all of it?", lang.getString("msg_generic-fail").value);
                        }
                        else {
                            var winCrypt = Windows.Security.Cryptography;
                            var encoding = winCrypt.BinaryStringEncoding.utf8;

                            var msg = winCrypt.CryptographicBuffer.decodeFromBase64String(data.substr(0, data.length - 24));
                            var keyMaterial = winCrypt.CryptographicBuffer.convertStringToBinary(Yodel.handle._key, encoding);

                            var provider = winCrypt.Core.SymmetricKeyAlgorithmProvider.openAlgorithm(winCrypt.Core.SymmetricAlgorithmNames.aesCbcPkcs7);
                            var key = provider.createSymmetricKey(keyMaterial);

                            var iv = winCrypt.CryptographicBuffer.decodeFromBase64String(data.substr(data.length - 24));
                            var buffDecrypt;
                            try {
                                buffDecrypt = winCrypt.Core.CryptographicEngine.decrypt(key, msg, iv);
                            }
                            catch (e) {
                                Yodel.popup_error("Unable to decrypt ID. Something's fishy here...", lang.getString("msg_generic-fail").value);
                            }

                            var decryptedMsg = winCrypt.CryptographicBuffer.convertBinaryToString(encoding, buffDecrypt);
                            var actualPublisherId = Windows.ApplicationModel.Package.current.id.publisherId;

                            var id = decryptedMsg.substr(0, decryptedMsg.length - actualPublisherId.length);
                            var publisherId = decryptedMsg.substr(decryptedMsg.length - actualPublisherId.length);

                            if (publisherId === Windows.ApplicationModel.Package.current.id.publisherId && (id.length === 32 || id.length === 36)) {
                                document.getElementById("extendedSplashBetaOption").style.visibility = "hidden";
                                ExtendedSplash.showProgress();
                                $("#modalOverlay, #modalMenu").remove();

                                appData.roamingSettings.values.yakker_id = id;
                                Yodel.handle.id = id;

                                appInit();
                            }
                        }
                    });

                    textarea_container.appendChild(textarea);
                    textarea_container.appendChild(verify);

                    Yodel.UI.ModalMenu({
                        title: lang.getString("transfer_popup-title").value,
                        message: lang.getString("transfer_popup-message").value,
                        content: textarea_container,
                        blocking: true
                    });
                });

                ExtendedSplash.showBetaOption();
            }
            else {
                appInit(true);
            }

            hookUpBackButtonGlobalEventHandlers();
            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            ui.disableAnimations();
            var p = ui.processAll().then(function () {
                return lang.processAll(document);
            }).then(function () {
                return nav.navigate(nav.location || Application.navigator.home, nav.state);
            }).then(function () {
                return sched.requestDrain(sched.Priority.aboveNormal + 1);
            }).then(function () {
                ui.enableAnimations();
            });

            args.setPromise(p);
        }
    });

    app.addEventListener("checkpoint", function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().

        app.sessionState.history = nav.history;
        app.sessionState.lastState = nav.state;

        if (!("service_config" in Yodel.handle)) {
            app.sessionState.service_config = {};
        }
        else {
            app.sessionState.service_config = Yodel.handle.service_config;
        }
    });

    app.addEventListener("error", function (event) {
        Yodel.popup_error("Yodel has encountered a fatal error and must close. Please wait while we submit a crash report...", lang.getString("msg_generic-fail").value);

        var errorData = JSON.stringify({
            message: event.detail.errorMessage,
            uri: event.detail.errorUrl,
            line: event.detail.errorLine,
            character: event.detail.errorCharacter,
            navLocation: event.detail.error.target.WinJS.Navigation.location
        });

        var version = Windows.ApplicationModel.Package.current.id.version;
        var versionStr = sprintf("%i.%i.%i.%i", version.major, version.minor, version.build, version.revision);

        var xhr = WinJS.xhr({
            url: appData.localSettings.values.crash_reports_url,
            type: "post",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: "errorData=" + encodeURIComponent(errorData) + "&version=" + encodeURIComponent(versionStr)
        }).done(function (complete) {
            // Force-crash! Always fun.
            window.close();
        });

        event.detail.setPromise(xhr);

        return true;
    });

    function hookUpBackButtonGlobalEventHandlers() {
        // Subscribes to global events on the window object
        window.addEventListener('keyup', backButtonGlobalKeyUpHandler, false);
    }

    // CONSTANTS
    var KEY_LEFT = "Left";
    var KEY_BROWSER_BACK = "BrowserBack";

    function backButtonGlobalKeyUpHandler(event) {
        // Navigates back when (alt + left) or BrowserBack keys are released.
        if ((event.key === KEY_LEFT && event.altKey && !event.shiftKey && !event.ctrlKey) || (event.key === KEY_BROWSER_BACK)) {
            nav.back();
        }
    }

    app.start();
})();
