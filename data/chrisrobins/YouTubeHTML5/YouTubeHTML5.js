/*jslint browser: true, indent: 4, regexp: true */
/*global chrome, MouseEvent, MutationObserver */

"use strict";

var YOUTUBE_AJAX          = false,
    YOUTUBE_FEATHER       = false,
    YOUTUBE_OBSERVER      = null,
    YOUTUBE_PLAYER        = null,
    YOUTUBE_CONTAINER     = null,
    YOUTUBE_WATCH         = null,
    STATE_VIDEO_TIME      = 0,
    STATE_VIDEO_RATE      = 1,
    STATE_VIDEO_RETRY     = false,
    HTML5_PLAYER          = document.createElement("div"),
    HTML5_VIDEO           = document.createElement("video"),
    UI_TOOLBAR            = document.createElement("div"),
    UI_ACTIONS            = document.createElement("div"),
    UI_TOGGLE_CHECKBOX    = document.createElement("input"),
    UI_TOGGLE_LABEL       = document.createElement("label"),
    UI_SOURCE_SELECT      = document.createElement("select"),
    UI_RELOAD_BUTTON      = document.createElement("button"),
    UI_DOWNLOAD_LINK      = document.createElement("a"),
    UI_SPEED_CHECKBOX     = document.createElement("input"),
    UI_SPEED_LABEL        = document.createElement("label"),
    UI_RATE_SELECT        = document.createElement("select"),
    UI_SIZE_CHECKBOX      = document.createElement("input"),
    UI_SIZE_LABEL         = document.createElement("label"),
    TEXT_TOGGLE_UNCHECKED = chrome.i18n.getMessage("toggle_unchecked"),
    TEXT_TOGGLE_CHECKED   = chrome.i18n.getMessage("toggle_checked"),
    TEXT_TOGGLE_DISABLED  = chrome.i18n.getMessage("toggle_disabled"),
    TEXT_SOURCE           = chrome.i18n.getMessage("source"),
    TEXT_RELOAD           = chrome.i18n.getMessage("reload"),
    TEXT_DOWNLOAD         = chrome.i18n.getMessage("download"),
    TEXT_SPEED_UNCHECKED  = chrome.i18n.getMessage("speed_unchecked"),
    TEXT_SPEED_CHECKED    = chrome.i18n.getMessage("speed_checked"),
    TEXT_RATE             = chrome.i18n.getMessage("rate"),
    TEXT_SIZE_UNCHECKED   = chrome.i18n.getMessage("size_unchecked"),
    TEXT_SIZE_CHECKED     = chrome.i18n.getMessage("size_checked");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML5 video
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

HTML5_PLAYER.id = "crxhtml5-player";
HTML5_PLAYER.classList.add("player-height", "player-width", "off-screen-target", "watch-content", "player-api");
HTML5_PLAYER.appendChild(HTML5_VIDEO);

HTML5_VIDEO.id = "crxhtml5-video";
HTML5_VIDEO.autoplay = true;
HTML5_VIDEO.controls = true;
HTML5_VIDEO.preload  = true;

// events /////////////////////////////////////////////////////////////////////////////////////////////////////////////

function icon(show) {
    var title = document.title.replace(/^\u25B6\s/, "");
    document.title = show ? "\u25B6 " + title : title;
}

function hitbox(v, y) {
    return ((parseInt(window.getComputedStyle(v).getPropertyValue("height"), 10) - 40) > y);
}

function watched() {
    try {
        var id, xhr;
        id = location.href.match(/[&|\?]v=([^&|#|$]+)/)[1];
        xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.youtube.com/user_watch?video_id=" + id);
        xhr.send(null);
    } catch (ignore) {}
}

HTML5_VIDEO.addEventListener("click", function (e) {
    if (hitbox(this, e.offsetY)) {
        if (this.paused || this.ended) {
            this.play();
        } else {
            this.pause();
        }
    }
});

HTML5_VIDEO.addEventListener("dblclick", function (e) {
    if (hitbox(this, e.offsetY)) {
        if (this.requestFullscreen) {
            this.requestFullscreen();
        } else {
            if (this.webkitRequestFullscreen) {
                this.webkitRequestFullscreen();
            }
        }
    }
});

HTML5_VIDEO.addEventListener("loadedmetadata", function () {
    var t = parseInt(STATE_VIDEO_TIME, 10),
        m = 0,
        s = 0;
    if (!isNaN(t) && t > 0) {
        this.currentTime = t;
    } else {
        try { s = parseInt(location.href.match(/[&|\?|#]t=(\d*)(?:s|&|$)/)[1], 10); } catch (ignore) {}
        try { m = parseInt(location.href.match(/[&|\?|#]t=(\d*)m/)[1], 10); } catch (ignore) {}
        this.currentTime = ((m * 60) + s);
    }
});

HTML5_VIDEO.addEventListener("play", function () {
    if (document.contains(this)) {
        this.playbackRate = parseFloat(STATE_VIDEO_RATE) || 1;
        icon(true);
        watched();
    } else {
        this.pause();
    }
});

HTML5_VIDEO.addEventListener("pause", function () {
    if (document.contains(this)) {
        icon(false);
    }
});

HTML5_VIDEO.addEventListener("timeupdate", function () {
    var t = parseInt(this.currentTime, 10);
    if (t > 0 && t % 5 === 0) {
        STATE_VIDEO_TIME = t;
    }
});

HTML5_VIDEO.addEventListener("seeked", function () {
    var t = Math.max(parseInt(this.currentTime, 10) - 5, 0);
    STATE_VIDEO_TIME = t;
});

HTML5_VIDEO.addEventListener("stalled", function () {
    if (document.contains(this) && (!this.paused || !this.ended)) {
        this.load();
    }
});

HTML5_VIDEO.addEventListener("ended", function () {
    icon(false);
    var next = document.querySelector(".playlist-behavior-controls .next-playlist-list-item"),
        auto = document.querySelector(".playlist-nav-controls .toggle-autoplay");
    if (next && next.href && auto && auto.classList.contains("yt-uix-button-toggled")) {
        window.location.href = next.href;
    }
});

HTML5_VIDEO.addEventListener("error", function (e) {
    if (STATE_VIDEO_RETRY) {
        // this seems to happen if the video is paused for a while
        if (e.target.error.code === e.target.error.MEDIA_ERR_NETWORK) {
            this.load();
        }
    }
});

// option.space: document.addEventListener "keydown"
function videoKeyboardControls(e) {
    if (e.shiftKey && e.keyCode === 32) { // [space]
        if (HTML5_VIDEO.paused || HTML5_VIDEO.ended) {
            HTML5_VIDEO.play();
        } else {
            HTML5_VIDEO.pause();
        }
    }
}

// option.visibility: document.addEventListener "visibilitychange"
function videoVisibilityChange() {
    var hidden = (document.hidden === undefined) ? "webkitHidden" : "hidden";
    if (!document[hidden] && document.contains(HTML5_VIDEO) && HTML5_VIDEO.autoplay && HTML5_VIDEO.currentTime === 0) {
        HTML5_VIDEO.play();
    }
}

// option.visibility: HTML5_VIDEO.addEventListener "play"
function videoPauseIfHidden(e) {
    var hidden = (document.hidden === undefined) ? "webkitHidden" : "hidden";
    if (document[hidden] && this.currentTime === 0) {
        this.pause();
        e.stopPropagation();
    }
}

// option.audio: HTML5_VIDEO.addEventListener "volumechange"
function videoVolumeChange() {
    chrome.storage.local.set({"muted": this.muted});
    chrome.storage.local.set({"volume": this.volume});
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Toolbar
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UI_TOOLBAR.id = "crxhtml5-toolbar";
UI_TOOLBAR.appendChild(UI_ACTIONS);

UI_ACTIONS.id = "crxhtml5-actions";
UI_ACTIONS.appendChild(UI_TOGGLE_CHECKBOX);
UI_ACTIONS.appendChild(UI_TOGGLE_LABEL);
UI_ACTIONS.appendChild(UI_SOURCE_SELECT);
UI_ACTIONS.appendChild(UI_RELOAD_BUTTON);
UI_ACTIONS.appendChild(UI_DOWNLOAD_LINK);
UI_ACTIONS.appendChild(UI_SPEED_CHECKBOX);
UI_ACTIONS.appendChild(UI_SPEED_LABEL);
UI_ACTIONS.appendChild(UI_RATE_SELECT);
UI_ACTIONS.appendChild(UI_SIZE_CHECKBOX);
UI_ACTIONS.appendChild(UI_SIZE_LABEL);

UI_TOGGLE_CHECKBOX.id = "crxhtml5-toggle";
UI_TOGGLE_CHECKBOX.type = "checkbox";
UI_TOGGLE_CHECKBOX.title = TEXT_TOGGLE_UNCHECKED;
UI_TOGGLE_CHECKBOX.dataset.tooltipText = TEXT_TOGGLE_UNCHECKED;
UI_TOGGLE_CHECKBOX.classList.add("crxhtml5-btn", "yt-uix-tooltip");

UI_TOGGLE_LABEL.setAttribute("for", "crxhtml5-toggle");
UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_UNCHECKED;

UI_SOURCE_SELECT.id = "crxhtml5-source";
UI_SOURCE_SELECT.title = TEXT_SOURCE;
UI_SOURCE_SELECT.dataset.tooltipText = TEXT_SOURCE;
UI_SOURCE_SELECT.classList.add("yt-uix-tooltip");

UI_RELOAD_BUTTON.id = "crxhtml5-reload";
UI_RELOAD_BUTTON.title = TEXT_RELOAD;
UI_RELOAD_BUTTON.dataset.tooltipText = TEXT_RELOAD;
UI_RELOAD_BUTTON.classList.add("crxhtml5-btn", "yt-uix-tooltip");
UI_RELOAD_BUTTON.textContent = TEXT_RELOAD;

UI_DOWNLOAD_LINK.id = "crxhtml5-download";
UI_DOWNLOAD_LINK.title = TEXT_DOWNLOAD;
UI_DOWNLOAD_LINK.dataset.tooltipText = TEXT_DOWNLOAD;
UI_DOWNLOAD_LINK.classList.add("crxhtml5-btn", "yt-uix-tooltip");
UI_DOWNLOAD_LINK.textContent = TEXT_DOWNLOAD;

UI_SPEED_CHECKBOX.id = "crxhtml5-speed";
UI_SPEED_CHECKBOX.type = "checkbox";
UI_SPEED_CHECKBOX.title = TEXT_SPEED_UNCHECKED;
UI_SPEED_CHECKBOX.dataset.tooltipText = TEXT_SPEED_UNCHECKED;
UI_SPEED_CHECKBOX.classList.add("crxhtml5-btn", "yt-uix-tooltip");

UI_SPEED_LABEL.setAttribute("for", "crxhtml5-speed");
UI_SPEED_LABEL.textContent = TEXT_SPEED_UNCHECKED;

UI_RATE_SELECT.id = "crxhtml5-rate";
UI_RATE_SELECT.title = TEXT_RATE;
UI_RATE_SELECT.dataset.tooltipText = TEXT_RATE;
UI_RATE_SELECT.classList.add("yt-uix-tooltip");

["0.25", "0.5", "1", "1.5", "2", "3"].forEach(function (r) {
    var o = document.createElement("option");
    o.value = r;
    o.textContent = "x" + r;
    if (r === "1") {
        o.selected = true;
    }
    UI_RATE_SELECT.appendChild(o);
});

UI_SIZE_CHECKBOX.id = "crxhtml5-size";
UI_SIZE_CHECKBOX.type = "checkbox";
UI_SIZE_CHECKBOX.title = TEXT_SIZE_UNCHECKED;
UI_SIZE_CHECKBOX.dataset.tooltipText = TEXT_SIZE_UNCHECKED;
UI_SIZE_CHECKBOX.classList.add("crxhtml5-btn", "yt-uix-tooltip");

UI_SIZE_LABEL.setAttribute("for", "crxhtml5-size");
UI_SIZE_LABEL.textContent = TEXT_SIZE_UNCHECKED;

// events /////////////////////////////////////////////////////////////////////////////////////////////////////////////

UI_TOGGLE_CHECKBOX.addEventListener("change", function () {
    if (this.disabled) {
        this.title = TEXT_TOGGLE_DISABLED;
        this.dataset.tooltipText = TEXT_TOGGLE_DISABLED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_DISABLED;
        return;
    }
    if (document.contains(HTML5_VIDEO)) {
        if (YOUTUBE_AJAX) {
            location.reload(true);
        }
        YOUTUBE_CONTAINER.replaceChild(YOUTUBE_PLAYER, HTML5_PLAYER);
        document.body.classList.remove("crxhtml5");
        this.checked = false;
        this.title = TEXT_TOGGLE_UNCHECKED;
        this.dataset.tooltipText = TEXT_TOGGLE_UNCHECKED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_UNCHECKED;
        icon(false);
    } else {
        YOUTUBE_CONTAINER.replaceChild(HTML5_PLAYER, YOUTUBE_PLAYER);
        document.body.classList.add("crxhtml5");
        this.checked = true;
        this.title = TEXT_TOGGLE_CHECKED;
        this.dataset.tooltipText = TEXT_TOGGLE_CHECKED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_CHECKED;
        if (HTML5_VIDEO.autoplay) {
            HTML5_VIDEO.play();
        }
    }
});

UI_SOURCE_SELECT.addEventListener("change", function () {
    HTML5_VIDEO.src = this.value;
});

UI_RELOAD_BUTTON.addEventListener("click", function () {
    if (HTML5_VIDEO.ended) {
        HTML5_VIDEO.currentTime = 0;
        HTML5_VIDEO.play();
    } else {
        HTML5_VIDEO.load();
    }
});

UI_DOWNLOAD_LINK.addEventListener("click", function () {
    var x = "",
        t = document.title.replace(/^\u25B6\s/, "").replace(/^YouTube\s-\s/, ""),
        i = UI_SOURCE_SELECT.options[UI_SOURCE_SELECT.selectedIndex].dataset.itag;
    if (i) {
        switch (i) {
        case "18":  // MP4 360p
        case "22":  // MP4 720p
        case "37":  // MP4 1080p
        case "38":  // MP4 4K
        case "135": // MP4 480p (no audio)
        case "137": // MP4 1080p (no audio)
        case "138": // MP4 4K (no audio)
        case "264": // MP4 1080p (no audio)
            x = ".mp4";
            break;
        case "43": // WebM 360p
        case "44": // WebM 480p
        case "45": // WebM 720p
        case "46": // WebM 1080p
            x = ".webm";
            break;
        case "139": // M4A 48kbps
        case "140": // M4A 128kbps
        case "141": // M4A 256kbps
            x = ".m4a";
            break;
        }
    }
    this.download =  (t || "YouTube video") + x;
    this.href = HTML5_VIDEO.src;
});

UI_SPEED_CHECKBOX.addEventListener("change", function () {
    if (this.checked) {
        STATE_VIDEO_RATE = parseFloat(UI_RATE_SELECT.value) || 1;
        this.title = TEXT_SPEED_CHECKED;
        this.dataset.tooltipText = TEXT_SPEED_CHECKED;
        UI_SPEED_LABEL.textContent = TEXT_SPEED_CHECKED;
    } else {
        STATE_VIDEO_RATE = 1;
        this.title = TEXT_SPEED_UNCHECKED;
        this.dataset.tooltipText = TEXT_SPEED_UNCHECKED;
        UI_SPEED_LABEL.textContent = TEXT_SPEED_UNCHECKED;
    }
    HTML5_VIDEO.playbackRate = STATE_VIDEO_RATE;
});

UI_RATE_SELECT.addEventListener("change", function () {
    STATE_VIDEO_RATE = parseFloat(this.value) || 1;
    HTML5_VIDEO.playbackRate = STATE_VIDEO_RATE;
});

UI_SIZE_CHECKBOX.addEventListener("change", function () {
    var container = document.getElementById("watch7-container");
    if (this.checked) {
        if (YOUTUBE_FEATHER) {
            document.body.classList.add("crxhtml5-feather-wide");
        } else {
            YOUTUBE_WATCH.classList.remove("watch-small");
            YOUTUBE_WATCH.classList.add("watch-medium", "watch-playlist-collapsed");
            container.classList.add("watch-wide");
        }
        this.title = TEXT_SIZE_CHECKED;
        this.dataset.tooltipText = TEXT_SIZE_CHECKED;
        UI_SIZE_LABEL.textContent = TEXT_SIZE_CHECKED;
    } else {
        if (YOUTUBE_FEATHER) {
            document.body.classList.remove("crxhtml5-feather-wide");
        } else {
            container.classList.remove("watch-wide");
            YOUTUBE_WATCH.classList.remove("watch-medium", "watch-large", "watch-playlist-collapsed");
            YOUTUBE_WATCH.classList.add("watch-small");
        }
        this.title = TEXT_SIZE_UNCHECKED;
        this.dataset.tooltipText = TEXT_SIZE_UNCHECKED;
        UI_SIZE_LABEL.textContent = TEXT_SIZE_UNCHECKED;
    }
    chrome.storage.local.set({"embiggen": this.checked});
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// init
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function init(streamMap) {

    YOUTUBE_PLAYER = null;
    YOUTUBE_CONTAINER = null;
    YOUTUBE_WATCH = null;

    STATE_VIDEO_TIME = 0;
    STATE_VIDEO_RATE = 1;

    HTML5_VIDEO.volume = 1;
    HTML5_VIDEO.muted = false;
    HTML5_VIDEO.playbackRate = 1;
    HTML5_VIDEO.src = "";

    UI_TOGGLE_CHECKBOX.disabled = false;
    UI_TOGGLE_CHECKBOX.checked = false;
    UI_TOGGLE_CHECKBOX.title = TEXT_TOGGLE_UNCHECKED;
    UI_TOGGLE_CHECKBOX.dataset.tooltipText = TEXT_TOGGLE_UNCHECKED;
    UI_TOGGLE_LABEL = TEXT_TOGGLE_UNCHECKED;

    UI_SOURCE_SELECT.options.length = 0;

    UI_DOWNLOAD_LINK.href = "";
    UI_DOWNLOAD_LINK.download = "";

    UI_SPEED_CHECKBOX.checked = false;
    UI_SPEED_CHECKBOX.title = TEXT_SPEED_UNCHECKED;
    UI_SPEED_CHECKBOX.dataset.tooltipText = TEXT_SPEED_UNCHECKED;
    UI_SPEED_LABEL = TEXT_SPEED_UNCHECKED;

    UI_SIZE_CHECKBOX.checked = false;
    UI_SIZE_CHECKBOX.title = TEXT_SIZE_UNCHECKED;
    UI_SIZE_CHECKBOX.dataset.tooltipText = TEXT_SIZE_UNCHECKED;
    UI_SIZE_LABEL.textContent = TEXT_SIZE_UNCHECKED;

    try {

        // YouTube elements
        YOUTUBE_PLAYER = document.getElementById("movie_player").parentNode;
        YOUTUBE_CONTAINER = YOUTUBE_PLAYER.parentNode;
        YOUTUBE_WATCH = YOUTUBE_CONTAINER.parentNode;

        if (!YOUTUBE_WATCH) {
            throw new Error("No YouTube video player");
        }

        // toolbar
        var content = document.getElementById("watch7-content");

        if (content) {
            content.insertBefore(UI_TOOLBAR, content.firstElementChild);
            YOUTUBE_FEATHER = false;
            document.body.classList.remove("crxhtml5-feather", "crxhtml5-feather-wide");
        } else {
            content = document.getElementById("lc");
            if (content) {
                content.insertBefore(UI_TOOLBAR, document.getElementById("vc"));
                YOUTUBE_FEATHER = true;
                document.body.classList.add("crxhtml5-feather");
            } else {
                throw new Error("Failed to insert toolbar");
            }
        }

        // source
        if (!streamMap) {
            throw new Error("No streamMap");
        }

        Object.keys(streamMap).forEach(function (k) {
            var o = document.createElement("option");
            o.value = streamMap[k].url;
            o.dataset.itag = streamMap[k].itag;
            o.textContent = streamMap[k].label;
            UI_SOURCE_SELECT.appendChild(o);
        });

        HTML5_VIDEO.src = UI_SOURCE_SELECT.options[UI_SOURCE_SELECT.selectedIndex].value;

        // size
        if (!YOUTUBE_FEATHER) {
            if (!YOUTUBE_WATCH.classList.contains("watch-small")) {
                UI_SIZE_CHECKBOX.checked = true;
                UI_SIZE_CHECKBOX.title = TEXT_SIZE_CHECKED;
                UI_SIZE_CHECKBOX.dataset.tooltipText = TEXT_SIZE_CHECKED;
                UI_SIZE_LABEL = TEXT_SIZE_CHECKED;
            }
        }

        // options
        chrome.storage.local.get(null, function (options) {

            var visibilityChange = (document.hidden !== undefined) ?  "visibilitychange" : "webkitvisibilitychange";

            if (options.visibility === true) {
                document.addEventListener(visibilityChange, videoVisibilityChange);
                HTML5_VIDEO.addEventListener("play", videoPauseIfHidden);
            } else {
                document.removeEventListener(visibilityChange, videoVisibilityChange);
                HTML5_VIDEO.removeEventListener("play", videoPauseIfHidden);
            }

            if (options.space === true) {
                document.addEventListener("keydown", videoKeyboardControls);
            } else {
                document.removeEventListener("keydown", videoKeyboardControls);
            }

            if (typeof options.retry === "boolean") {
                STATE_VIDEO_RETRY = options.retry;
            }

            if (options.audio === true) {
                if (typeof options.volume === "number") {
                    HTML5_VIDEO.volume = parseFloat(options.volume);
                }
                if (typeof options.muted === "boolean") {
                    HTML5_VIDEO.muted = options.muted;
                }
                HTML5_VIDEO.addEventListener("volumechange", videoVolumeChange);
            } else {
                HTML5_VIDEO.removeEventListener("volumechange", videoVolumeChange);
            }

            if (typeof options.autoplay === "boolean") {
                HTML5_VIDEO.autoplay = !options.autoplay;
            }

            if (typeof options.codec === "string") {
                Array.prototype.some.call(UI_SOURCE_SELECT.options, function (o) {
                    if (o.dataset.itag === options.codec) {
                        o.selected = true;
                        HTML5_VIDEO.src = o.value;
                        return true;
                    }
                });
            }

            if (typeof options.rate === "string") {
                Array.prototype.some.call(UI_RATE_SELECT.options, function (o) {
                    if (o.value === options.rate) {
                        o.selected = true;
                        if (options.rate !== "1") {
                            STATE_VIDEO_RATE = parseFloat(o.value) || 1;
                            HTML5_VIDEO.playbackRate = STATE_VIDEO_RATE;
                            UI_SPEED_CHECKBOX.checked = true;
                        }
                        return true;
                    }
                });
            }

            if (options.embiggen === true) {
                if (!UI_SIZE_CHECKBOX.checked) {
                    UI_SIZE_CHECKBOX.dispatchEvent(new MouseEvent("click"));
                }
            } else {
                if (UI_SIZE_CHECKBOX.checked) {
                    UI_SIZE_CHECKBOX.dispatchEvent(new MouseEvent("click"));
                }
            }

            if (options.enabled === true) {
                UI_TOGGLE_CHECKBOX.dispatchEvent(new MouseEvent("click"));
            }

        });

    } catch (e) {
        UI_TOGGLE_CHECKBOX.disabled = true;
        UI_TOGGLE_CHECKBOX.title = TEXT_TOGGLE_DISABLED;
        UI_TOGGLE_CHECKBOX.dataset.tooltipText = TEXT_TOGGLE_DISABLED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_DISABLED;
    }
}

function parseStreamMap(streamMapHTML) {
    var streamMap = {},
        mp4 = HTML5_VIDEO.canPlayType("video/mp4"),
        webm = HTML5_VIDEO.canPlayType("video/webm");
    streamMapHTML.split(",").forEach(function (stream) {
        var str, tag, url, sig, lab;
        try {
            str = decodeURIComponent(stream);
            tag = str.match(/itag=(\d{0,3})/)[1];
            url = str.match(/url=(.*?)(\\u0026|$)/)[1].replace(/^https?:\/\//, "//");
            sig = str.match(/[sig|s]=([A-Z0-9]*\.[A-Z0-9]*(?:\.[A-Z0-9]*)?)/);
            if (sig) {
                return;
            }
        } catch (e) {
            return;
        }
        switch (tag) {
        case "18":
            if (mp4) { lab = "MP4 360p"; }
            break;
        case "22":
            if (mp4) { lab = "MP4 720p"; }
            break;
        case "43":
            if (webm) { lab = "WebM 360p"; }
            break;
        default:
            return;
        }
        if (!lab) {
            return;
        }
        streamMap[tag] = {
            "label": lab,
            "itag": tag,
            "url": decodeURIComponent(url)
        };
    });
    if (Object.keys(streamMap).length === 0) {
        streamMap = null;
    }
    init(streamMap);
}

function getStreamMap() {
    var smap, xhr;
    smap = document.body.innerHTML.match(/"url_encoded_fmt_stream_map":\s"([^"]+)"/);
    if (!YOUTUBE_AJAX && smap && !smap[1]) {
        parseStreamMap(smap[1]);
    } else {
        xhr = new XMLHttpRequest();
        xhr.open("GET", location.href + "&nofeather=True", true);
        xhr.onload = function () {
            var xmap;
            if (xhr.responseText) {
                xmap = xhr.responseText.match(/"url_encoded_fmt_stream_map":\s"([^"]+)"/);
                if (xmap && xmap[1]) {
                    parseStreamMap(xmap[1]);
                }
            }
        };
        xhr.send(null);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Run
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function YoutubePauseIfHidden() {
    if (document.contains(HTML5_VIDEO)) {
        this.pause();
    }
}

Array.prototype.forEach.call(document.querySelectorAll("video"), function (video) {
    if (video !== HTML5_VIDEO) {
        video.addEventListener("timeupdate", YoutubePauseIfHidden, false);
    }
});

YOUTUBE_OBSERVER = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        [].forEach.call(mutation.addedNodes, function (node) {
            if (node !== HTML5_VIDEO && node.tagName && node.tagName === "VIDEO") {
                node.addEventListener("timeupdate", YoutubePauseIfHidden, false);
            }
        });
        [].some.call(mutation.addedNodes, function (node) {
            if (node.id === "progress") {
                if (document.contains(HTML5_VIDEO)) {
                    UI_TOGGLE_CHECKBOX.dispatchEvent(new MouseEvent("click"));
                }
                return true;
            }
        });
        [].some.call(mutation.removedNodes, function (node) {
            if (node.id === "progress") {
                YOUTUBE_AJAX = true;
                getStreamMap();
                return true;
            }
        });
    });
});

YOUTUBE_OBSERVER.observe(document.body, {
    childList: true,
    subtree: true
});

if (/^https?:\/\/www\.youtube\.com\/watch\?/.test(location.href)) {
    getStreamMap();
}
