/**
 * @Copyright Intel 2013
 * @Author Ian Maffett
 */
(function($){
	var viewsCache = [],modelsCache = [],readyFuncs = {},viewsTotal = {},modelsTotal = {},viewsLoaded = {},modelsLoaded = {},controllerReady = {};


    $.mvc.controller = {};
    /**
     * This is the basic controller creation script.  We add the object to the cache and then if any views are registered, we load them.
       ```
       $.mvc.controller.create("todo",{save:function(){},delete:function(){}});
       ```

       Because views/templates are loaded asynchronously, we do not want to be able to execute anything until they are ready.
       If you want to execute something when a controller is available, you can set an 'init' function on the object, or listen for
       the "_controllername_:ready" event

     * @param {String} name Controller name
     * @param {Object} obj Controller object
     * @title $.mvc.controller.create
     */
	$.mvc.controller.create = function(name, obj) {
        var loaded = true;
        $.mvc.controller[name] = obj;
        viewsTotal[name] = 0;
        viewsLoaded[name] = 0;
        modelsLoaded[name] = 0;
        modelsTotal[name] = 0;
        if(obj.hasOwnProperty("init")) controllerReady[name] = obj;
        if(obj.hasOwnProperty("views") && (obj.views.length > 0 || Object.keys(obj.views).length) > 0) {
            loaded = false;
            viewsTotal[name] = obj.views.length || Object.keys(obj.views).length;
            for(var i in obj.views) {
                var shortName = $.isArray(obj.views) ? obj.views[i] : i;
                if(!viewsCache[shortName] && af("#" + shortName).length == 0) {
                    $.mvc.controller.addView(obj.views[i], name, shortName);
                    viewsCache[shortName] = 1;
                }
            }

        }

        if(loaded) {
            $(document).trigger(name + ":ready", {
                'name': name
            });
            controllerReady[name] && controllerReady[name].init.apply(controllerReady[name]);
        }
        return $.mvc.controller[name];

    };

    /**
     * Internal function that loads a view via AJAX and appends it to the dom
     * @param {String} path Path
     * @param {String} controller
     * @param {String} name id attribute of script tag
     * @api private
     * @title $.mvc.controller.addView
     */
    $.mvc.controller.addView = function(path, controller, name) {
        $.get(path, function(data) {
            var id = name;
            $(document.body).append($("<script type='" + $.mvc._app._templateType + "' id='" + id + "'>" + data + "</script>"));
            viewsLoaded[controller]++;
            if((viewsLoaded[controller] == viewsTotal[controller])) {
                $(document).trigger(controller + ":ready", {
                    name: controller
                });
                controllerReady[controller] && controllerReady[controller].init.apply(controllerReady[controller]);
            }
        });
    };
})(af);
