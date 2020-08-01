Playdar.PlaydarPlayer = function () {
    Playdar.player = this;
    
    this.sounds = {};
    this.nowplayingid = null;
};

// Those set to true are MPEG4 and require isMovieStar in soundmanager init
Playdar.PlaydarPlayer.MIMETYPES = {
    "audio/mpeg": false,
    "audio/aac": true,
    "audio/x-aac": true,
    "audio/flv": true,
    "audio/mov": true,
    "audio/mp4": true,
    "audio/m4v": true,
    "audio/f4v": true,
    "audio/m4a": true,
    "audio/x-m4a": true,
    "audio/x-m4b": true,
    "audio/mp4v": true,
    "audio/3gp": true,
    "audio/3g2": true
};
Playdar.PlaydarPlayer.BaseCallbacks = {
    onload: Playdar.nop,
    onplay: Playdar.nop,
    onpause: Playdar.nop,
    onresume: Playdar.nop,
    onstop: Playdar.nop,
    onfinish: Playdar.nop,
    whileloading: Playdar.nop,
    whileplaying: Playdar.nop
};
Playdar.PlaydarPlayer.prototype = {
    getMimeTypes: function () {
        var mime_types = [];
        for (var type in Playdar.PlaydarPlayer.MIMETYPES) {
            mime_types.push(type);
        }
        return mime_types;
    },
    register_stream: function (result, callbacks) {
        if (this.sounds[result.sid]) {
            return false;
        }
        
        // Merge in defaults and register callbacks
        callbacks = callbacks || {};
        var callbackOptions = [callbacks];
        callbackOptions.push(Playdar.PlaydarPlayer.BaseCallbacks);
        // Wrap sound progress callbacks with status bar
        if (Playdar.statusBar) {
            callbackOptions.push(Playdar.statusBar.getSoundCallbacks(result));
        }
        // Wrap sound lifecycle callbacks in scrobbling calls
        if (Playdar.scrobbler) {
            callbackOptions.push(Playdar.scrobbler.getSoundCallbacks(result));
        }
        Playdar.Util.extendObject(callbacks, Playdar.Util.mergeCallbackOptions(callbackOptions));
        var player = this;
        // Register sound
        var sound = {
            sID: 's_' + result.sid,
            result: result,
            callbacks: callbacks,
            /*
            Numeric value indicating a sound's current load status
            0 = uninitialised
            1 = loading
            2 = failed/error
            3 = loaded/success
            */
            readyState: 0,
            /*
            Numeric value indicating the current playing state of the sound.
            0 = stopped/uninitialised
            1 = playing or buffering sound (play has been called, waiting for data etc.)
            Note that a 1 may not always guarantee that sound is being heard, given buffering and autoPlay status.
            */
            playState: 0,
            togglePause: function () {
                player.togglePause(result.sid);
            },
            setPosition: function (position) {
                player.setPosition(result.sid, position);
            },
            stop: function (onUnload) {
                player.stop(result.sid, onUnload);
            },
            playCallback: function (json) {
                if (json.response == 'ok') {
                    this.playState = 1;
                    this.readyState = 3;
                    Playdar.player.nowplayingid = this.sID;
                    // Update status bar
                    if (Playdar.statusBar) {
                        Playdar.statusBar.playHandler(this.result);
                    }
                    this.callbacks.onplay.call(this);
                } else {
                    this.readyState = 2;
                }
                this.callbacks.onload.call(this);
            },
            stopCallback: function (status) {
                this.playState = 0;
                this.readyState = 0;
                Playdar.player.nowplayingid = null;
                this.callbacks.onstop.call(this);
            },
            togglePauseCallback: function (json) {
                // Toggle playstate
                this.playState = this.playState ? 0 : 1;
                if (this.playState === 1) {
                    this.callbacks.onresume.call(this);
                } else {
                    this.callbacks.onpause.call(this);
                }
            },
            unload: Playdar.nop,
            chained: false // TODO, allow options to override. Figure out options/callbacks
        };
        this.sounds[result.sid] = sound;
        return sound;
    },
    play_stream: function (sid) {
        var sound = this.sounds[sid];
        if (this.nowplayingid != sid) {
            this.stop_current();
        }
        
        sound.togglePause();
        return sound;
    },
    stop_current: function (hard) {
        if (hard) {
            if (Playdar.scrobbler) {
                Playdar.scrobbler.stop();
            }
        }
        // Update status bar
        if (Playdar.statusBar) {
            Playdar.statusBar.stopCurrent();
        }
        var sound = this.getNowPlaying();
        if (sound) {
            sound.stop(hard);
        }
    },
    stop_stream: function (sid) {
        if (sid && sid == this.nowplayingid) {
            this.stop_current();
            return true;
        }
        return false;
    },
    is_now_playing: function () {
        if (this.nowplayingid) {
            return true;
        }
        return false;
    },
    getNowPlaying: function () {
        if (this.nowplayingid) {
            return this.sounds[this.nowplayingid];
        }
    },
    toggle_nowplaying: function () {
        if (this.is_now_playing()) {
            this.play_stream(this.nowplayingid);
        }
    },
    /* API methods */
    getUrl: function (method, query_params) {
        query_params = query_params || {};
        query_params.call_id = new Date().getTime();
        query_params.jsonp = query_params.jsonp || 'Playdar.nop';
        query_params.method = method;
        Playdar.client.addAuthToken(query_params);
        return Playdar.client.getBaseUrl("/player", query_params);
    },
    
    play: function (sid) {
        Playdar.Util.loadJs(this.getUrl('play', {
            sid: sid,
            jsonp: 'Playdar.player.sounds["'+sid+'"].playCallback'
        }));
    },
    stop: function (sid, onUnload) {
        if (onUnload) {
            var stopper = window.open();
            var stopUrl = this.getUrl('stop', {
                jsonp: "function Playdar_close (json) { window.close() } Playdar_close"
            });
            stopper.document.write('<html>'
                + '<body>'
                + '<script src="' + stopUrl + '"></script>'
                + '</body>'
                + '</html>'
            );
        } else {
            Playdar.Util.loadJs(this.getUrl('stop', {
                jsonp: 'Playdar.player.sounds["'+sid+'"].stopCallback'
            }));
        }
    },
    togglePause: function (sid) {
        if (this.sounds[sid].readyState == 0) {
            this.play(sid);
        } else {
            Playdar.Util.loadJs(this.getUrl('pausetoggle', {
                jsonp: 'Playdar.player.sounds["'+sid+'"].togglePauseCallback'
            }));
        }
    },
    getPosition: function (sid) {
        Playdar.Util.loadJs(this.getUrl('pos'));
    },
    setPosition: function (sid, position) {
        // Not implemented yet
    },
    getNowPlayingSid: function () {
        Playdar.Util.loadJs(this.getUrl('np'));
    }
};
