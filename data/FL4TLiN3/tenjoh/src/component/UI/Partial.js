$tenjoh.addComponent('UI.Partial', function() {
    var PartialFactory = function(url) {
        var self = this;
        var Scheme = function() {
            var scheme = this;
            scheme.url = '';
            scheme.script = '';
            scheme.template = '';
            scheme.requestDatetime = now();
        };
        var Partial = function(name, element, scheme, defaultParam) {
            var partial = this;
            partial.name = name;
            partial.__parent = null;
            partial.getParent = function() { return partial.__parent; };
            partial.__children = [];
            partial.getChild = function(index) { return partial.__children[index]; };
            partial.sizeOfChildren = function() { return partial.__children.length; };
            partial.__scheme = scheme;
            partial.getScheme = function() {return partial.__scheme; };
            partial.__controller = createController(partial, defaultParam);
            partial.__controller.__partial = partial;
            partial.getController = function() { return partial.__controller; };
            partial.__scriptTagId = null;
            partial.setScriptTagId = function(scriptTagId) { partial.__scriptTagId = scriptTagId; };
            partial.removeScriptTag = function() { document.remove(partial.__scriptTagId); };
            partial.__view = null;
            partial.getView = function() { return partial.__view; };
            partial.initView = function(element) {
                if (!isEmpty(element)) partial.__view = element;
                partial.__view.innerHTML = partial.__scheme.template.replaceAll('self.', sprintf("$root.getPartial('%s').getController().", partial.name));
                $tenjoh.Compiler.compileElement(partial.__view, partial);
            };
            if (element !== false && !isEmpty(element)) {
                partial.__view = element;
                partial.initView();
            } else if(element === false || isEmpty(element)) {
                partial.__view = null;
            }
            partial.discard = function() {
                $root.discardPartial(name);
            };
        };

        var removeNewLines = function(html) {
            return html.replaceAll('://', '%%protocol%%').replaceAll(/\/\/.+/, '').replaceAll('%%protocol%%', '://').replaceAll(/[\r\n]/, '').replaceAll(/<!--[\s\S]*?-->/, '');
        };
        var findScriptTag = function(html) {
            return html.match(/<script.*>.+<\/script>/mg);
        };
        var innerScriptTags = function(scriptTags) {
            return scriptTags.join('').replaceAll(/<script type="text\/javascript">/, '').replaceAll(/<\/script>/, '');
        };
        var removeScriptTag = function(html) {
            return html.replaceAll(/<script.*>.+<\/script>/m, '');
        };
        var getScriptFromRawScheme = function(html) {
            return innerScriptTags(findScriptTag(removeNewLines(html)));
        };
        var getTemplateFromRawScheme = function(html) {
            return removeScriptTag(removeNewLines(html));
        };
        var isScheme = function(url) {
            if ($tenjoh.Storage.has(url)) {
                if ($tenjoh.options.partialCache && $tenjoh.Storage.get(url).requestDatetime + $tenjoh.options.partialCacheExpire >= now()) {
                    return true;
                } else {
                    $tenjoh.Storage.remove(url);
                    return false;
                }
            }
        };
        var getScheme = function (url) {
            return (isScheme(url)) ? getSchemeFromStorage : getSchemeOverHTTP;
        };
        var getSchemeFromStorage = function(url) {
            return $tenjoh.Storage.get(url);
        };
        var getSchemeOverHTTP = function(url) {
            var scheme = parseRawScheme(url, $tenjoh.XHR.get({ url: url, cache: false, sync: true }));
            $tenjoh.Storage.set(url, scheme);
            return scheme;
        };
        var getSchemeOverHTTPAsync = function(url) {
            $tenjoh.XHR.get({ url: url, cache: false, success: function(rawScheme) {
                $tenjoh.Storage.set(url, parseRawScheme(url, rawScheme));
            }});
        };
        var parseRawScheme = function(url, rawScheme) {
            var scheme = new Scheme();
            scheme.url = url;
            scheme.script = getScriptFromRawScheme(rawScheme);
            scheme.template = getTemplateFromRawScheme(rawScheme);
            return scheme;
        };
        var createPartialFromScheme = function(name, url, element, scheme, defaultParam) {
            return new Partial(name, element, scheme(url)(url), defaultParam);
        };
        var precompileScript = function(partialName, script) {
            return script.replace(/\$controller/, sprintf('$root.__controllers["%s"]', partialName));
        };
        var createScriptElement = function(script) {
            var element = document.createElement('script');
            element.id = 'tenjoh#' + $tenjoh.uniqueId();
            element.type = 'text/javascript';
            element.text = script;
            return element;
        };
        var createController = function(partial, defaultParam) {
            var Controller, controller, scriptElement;
            scriptElement = createScriptElement(precompileScript(partial.name, partial.getScheme().script));
            document.body.appendChild(scriptElement);
            Controller = $root.getController(partial.name);
            Controller.prototype = new $tenjoh.Controller(partial);
            for (var param in defaultParam) {
                if (!defaultParam.hasOwnProperty(param)) continue;
                Controller.prototype[param] = defaultParam[param];
            }
            controller = new Controller();
            controller.getWatcher().setController(controller);
            scriptElement.parentNode.removeChild(scriptElement);
            return controller;
        };

        self.preload = function(url) {
            if (!isScheme(url)) getSchemeOverHTTPAsync(url);
        };
        self.create = function(name, url, element, defaultParam) {
            if (!isEmpty($tenjoh.options.basePartialURL)) url = $tenjoh.options.basePartialURL + url;
            return createPartialFromScheme(name, url, element, getScheme, defaultParam);
        };
    };

    return new PartialFactory();
});
