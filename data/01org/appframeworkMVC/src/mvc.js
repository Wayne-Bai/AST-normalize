
/**
 * @Copyright Intel 2013
 * @Author Ian Maffett
 */
;(function($){
	var baseUrl = document.location.protocol + "//" + document.location.host;
    var initialUrl=location.href;
    var popped=('state' in window.history);
    $.mvc = {};
	 /**
     * This is the main app class that gets created.  It will include files and offer a "load" when they are all ready
     */
    $.mvc = {};

    $.mvc._app=null; //Internal reference to app variable
    $.mvc.app = function() {$.mvc._app=this;}

    $.mvc.app.prototype = {
        _loadTimer: null,
        _modelsReady: false,
        _controllersReady: false,
        _loadedListeners: [],
        _modelsLoaded: 0,
        _totalModels: 0,
        _controllersDir: "controllers/",
        _modelsDir: "models/",
        _templateType: "text/x-dot-template",
        _hasModels:true,
        _useHistory:false,
        _html5Pop:function(e){
            var initialPop=!popped&&location.href!=initialUrl; //Chrome pop fix based on pjax
            popped=true;
            if(initialPop) return;
            $.mvc.route(document.location.href,e,true);
        },
        /**
         * Set boolean to use the HTML5 history API
         ```
         app.useHTML5History(true)
         ```
         *@param (bool) use history
         *@title app.useHTML5History(use)
         */
        useHTML5History:function(hist){
             if(hist==true){
                this._useHistory=true;
                window.addEventListener("popstate",this._html5Pop);
            }
            else{
                this._useHistory=false;
                window.removeEventListener("popstate",this._html5Pop);
            }
        },
        /**
         * Set the base directory for urls
         ```
         app.setBaseDir("starter")
         ```
         *@param (String) base directory
         *@title app.setBaseDir(dir)
         */
        setBaseDir:function(str){
            if(str[0]=="/")
                str = str.substr(1);
            if(str[str.length-1]=="/")
                str=str.slice(0,-1);
            baseUrl+="/"+str;
        },
        /**
         * Looks for route changes via hash change (ala Backbone.js)
         ```
         app.listenHashChange()
         ```
         *@title app.listenHashChange()
         */
        listenHashChange: function(listen) {
            window.addEventListener("hashchange", function(e) {
                var url = document.location.hash.replace("#", "/");
                $.mvc.route(url, e,true);
            });
        },
        /**
         * Set the path for where controllers will be loaded from
         ```
         app.controllersDir("controllers/");
         ```
         *@param {String} path
         *@title app.controllersDir(path);
         */
        controllersDir: function(path) {
            this._controllersDir = path;
        },
        /**
         * Set the path for where models will be loaded from
         ```
         app.modelDir("models/");
         ```
         *@param {String} path
         *@title app.modelsDir(path);
         */
        modelsDir: function(path) {
            this._modelsDir = path;
        },
        /**
         * Set the type attribute for templates. This is useful if you are using another templating system
         ```
         app.setViewType("text/x-handlebars-template");
         ```
         *@param {String} type
         *@title app.setViewType(type)
         */

        setViewType: function(type) {
            this._templateType = type;
        },
        /**
         * Function to execute when $.mvc.app is ready (controllers and models are loaded async)
         ```
         app.ready(function(){
            //execute startup functions for app
         });
         ```
         *@param {Function} fnc
         *@title app.ready(func);
         */
        ready: function(fnc) {
            if(!this.loaded) $(document).one("afmvc:loaded", fnc);
            else fnc();
        },
        /**
         * Load controllers for the app asynchronously.  Do not put the ".js" suffex on the controller names.
         * When the "_controllername_:ready" events are all fired, app.ready is available
           ```
           app.loadControllers("main")
           app.loadControllers(["main","users","settings");
           ```
           *@param {String|Array} urls
           *@title app.loadControllers(urls);
         */
        loadControllers: function(urls) {
            var that = this;
            $(document).ready(function() {
                if(typeof(urls) === "string") {
                    urls = [urls];
                }
                for(var i = 0; i < urls.length; i++) {
                    var file = document.createElement("script");
                    file.src = that._controllersDir + urls[i] + ".js";
                    file.onerror = function(e) {
                        console.log("error ", e);
                    };
                    $("head").append(file);
                    that._loadedListeners[urls[i]] = 1;
                    that._loadedListeners.length++;
                    $(document).one(urls[i] + ":ready", function(e,data) {
                        data=data||e.data;
                        delete that._loadedListeners[data.name];
                        that._loadedListeners.length--;
                        if(that._loadedListeners.length == 0) {
                            that._controllersReady = true;
                            if(that._modelsReady||!that._hasModels) {
                                $(document).trigger("afmvc:loaded");
                            }
                            else {
                                 that._loadTimer = setTimeout(function() {
                                    that._modelsReady = true;
                                    if(that._controllersReady) $(document).trigger("afmvc:loaded");
                                  }, 1500); //Used if no models are loaded
                            }
                        }
                    });
                    delete file;
                }
            });

        },

        /**
         * Load models for the app asynchronously.  Do not put the ".js" suffex on the controller names.
         *
           ```
           app.loadModels("main")
           app.loadModels(["main","users","settings");
           ```
           *@param {String|Array} urls
           *@title app.loadModels(urls);
         */
        loadModels: function(urls) {
            var that = this;

            clearTimeout(this._loadTimer);
            $(document).ready(function() {
                if(typeof(urls) === "string") {
                    urls = [urls];
                }
                that._totalModels = urls.length;

                for(var i = 0; i < urls.length; i++) {
                    var file = document.createElement("script");
                    file.src = that._modelsDir + urls[i] + ".js";
                    file.onload = function() {
                        that._modelsLoaded++;
                        if(that._modelsLoaded >= that._totalModels) {
                            that._modelsReady = true;
                            if(that._controllersReady) $(document).trigger("afmvc:loaded");
                        }
                    };
                    file.onerror = function(e) {
                        console.log("error ", e);
                    };
                    $("head").append(file);
                    delete file;
                }
            });
        }
    };

	/**
     * This handles the routing of the action using MVC style url routes (/controller/action/param1/param2/)
     * This is can be called manually, or using the afUi custom click handler
        ```
        $.mvc.route("/main/list/foo/bar");
        ```
     * @param {String} url string
     * @param {Object} [evt] - used to prevent default for anchor clicks, etc
     * @title $.mvc.controller.route
     */
    $.mvc.route = function(url, evt,noHistory) {
        if(typeof(url)!=="string"&&url.nodeName&&url.nodeName.toLowerCase()=="a"){
            url=url.href;
        }else if(url.nodeName&&url.parentNode){
            return $.mvc.route(url.parentNode, evt,noHistory);
        }

        if(typeof(url)!=="string")
            throw "Invalid route parameter.  String or <a> expected";
        var route, axt;
        var origUrl=url;
        if(url.indexOf(baseUrl) === 0) url = url.substring(baseUrl.length, url.length);
        if(url[0] == "/") url = url.substr(1);
        if(url[url.length-1]=="/") url=url.slice(0,-1);
        url = url.split("/");

        if(url.length > 1) {
            route = url.splice(0, 1);
            axt = url.splice(0, 1);
        } else {
            route = url[0];
            axt = "default";
        }
        if($.mvc.controller[route] && $.mvc.controller[route].hasOwnProperty(axt)) {
            evt && evt.preventDefault();
            try{
                $.mvc.controller[route][axt].apply($.mvc.controller[route], url);
            }
            catch(e){
                console.log(e.message);
            }
            if($.mvc._app._useHistory&&noHistory!==true)
            {
                 window.history.pushState(origUrl,origUrl,origUrl);
            }
            return true;
        }
        return false;
    };


    $.mvc.addRoute = function(url, fnc) {
        if(url.indexOf(baseUrl) === 0) url = url.substring(baseUrl.length, url.length);
        if(url[0] == "/") url = url.substr(1);
        url = url.split("/");

        if(url.length > 1) {
            var route = url.splice(0, 1);
            var axt = url.splice(0, 1);
        } else {
            route = url[0];
            axt = "default";
        }
        if(!$.mvc.controller[route]) {
            $.mvc.controller[route] = {};
        }
        $.mvc.controller[route][axt] = fnc;

    };



    /**
     * Here we override the custom click handler for afUi so we can capture anchor events as needed
     */
    if($.ui) $.ui.customClickHandler = $.mvc.route;
    else {
        $(document).on("click", "a", function(evt) {
            $.mvc.route(evt.target, evt)
        });
    }
})(af);
