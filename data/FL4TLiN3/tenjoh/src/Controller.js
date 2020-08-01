$tenjoh.Controller = function(partial) {
    var Watcher = function() {
        var watcher = this;
        watcher.__controller = null;
        watcher.setController = function(controller) { watcher.__controller = controller; };
        watcher.handlers = [];
        watcher.TagValueHandler = function() {
            var handler = this;
            handler.element = null;
            handler.execute = function(newValue) {
                if (isEmpty(handler.element) || isEmpty(newValue)) return false;
                newValue = $tenjoh.Compiler.compileDoubleCurly(handler.element.getAttribute('data-template'), watcher.__controller, false);
                $tenjoh.DOM.setValue(handler.element, newValue);
            };
        };
        watcher.TagAttributeHandler = function() {
            var handler = this;
            handler.element = null;
            handler.attributeName = null;
            handler.execute = function(newValue) {
                if (isEmpty(handler.element) || isEmpty(handler.attributeName) || isEmpty(newValue)) return false;
                handler.element.setAttribute(handler.attributeName, newValue);
            };
        };
        watcher.watchValue = function(element, propertyName) {
            var handler = new watcher.TagValueHandler();
            handler.element = element;
            watcher.handlers.push({name: propertyName, handler: handler});
        };
        watcher.watchAttribute = function(element, attributeName, propertyName) {
            var handler = new watcher.TagAttributeHandler();
            handler.element = element;
            handler.attributeName = attributeName;
            watcher.handlers.push({name: propertyName, handler: handler});
        };
        watcher.sync = function (propertyName) {
            var targetHandler, object;
            if (isEmpty(propertyName) || propertyName == '*') {
                for (var i = 0; i < watcher.handlers.length; i++) {
                    targetHandler = watcher.handlers[i];
                    targetHandler.handler.execute(watcher.__controller.getProperty(targetHandler.name));
                }
            } else {
                for (var i = 0; i < watcher.handlers.length; i++) {
                    targetHandler = watcher.handlers[i];
                    if (targetHandler.name && targetHandler.name == propertyName) {
                        targetHandler.handler.execute(watcher.__controller.getProperty(propertyName));
                    }
                }
                object = watcher.__controller.getProperty(propertyName);
                if (typeof object == $object) {
                    for (var key in object) {
                        if (object.hasOwnProperty(key)) {
                            watcher.sync(propertyName + '.' + key);
                        }
                    }
                }
            }
        };
    };
    var self = this;
    var watchElement = function(element) {
        partial.getController().getWatcher().watchValue(element, element.getAttribute('data-property-name'));
    };
    var watchAttribute = function(element) {
        if (element.hasAttribute('data-template')) {
            var templateString = element.getAttribute('data-template'),
                regxVariables = /([^:\s]+)\s*:\s*([^0-9:\s'"][^:\s'"]+)/g,
                commands = templateString.split('|'),
                tmpFillters = commands.slice(1);

            tmpFillters.forEach(function(fillter, index, array) {
                var fillterString = fillter.trim();
                var param;
                if (fillterString.indexOf(':') != -1) {
                    while (param = regxVariables.exec(fillterString)) {
                        partial.getController().getWatcher().watchAttribute(element, param[1], param[2]);
                    }
                }
            });
        }
    };
    var compileEventHandlers = function(element) {
        var eventHandler,
            eventHandlers =
                ['onblur', 'onchange', 'onclick', 'onfocus', 'onresize',
                 'onscroll', 'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'],
            attribute,
            attributes = element.attributes,
            handlerScript;
        if (element.hasAttributes()) {
            for (var i = attributes.length - 1; i >= 0; i--) {
                attribute = attributes[i];
                if (eventHandlers.indexOf(attribute.name) != -1) {
                    eventHandler = eventHandlers[eventHandlers.indexOf(attribute.name)];
                    handlerScript = element.getAttribute(eventHandler);
                    element.setAttribute(eventHandler, handlerScript);
                }
            }
        };
    };
    var autoBind = function(element) {
        var autoBindEvents = ['oninput', 'onchange'],
            eventHandler;
        for (var i = 0; i < autoBindEvents.length; i++) {
            if (element.name) {
                eventHandler  = element.getAttribute(autoBindEvents[i]) || '';
                eventHandler += sprintf("$root.getPartial('%s').getController().setProperty('%s', event.target.value);", partial.name, element.name);
                eventHandler += sprintf("$root.getPartial('%s').getController().getWatcher().sync('%s');", partial.name, element.name);
                element.setAttribute(autoBindEvents[i], eventHandler);
            }
        }
    };

    self.__partial = partial;
    self.getPartial = function() { return self.__partial; };
    self.__watcher = new Watcher();
    self.getWatcher = function() { return self.__watcher; };
    self.getWatcher().setController(self);
    self.getProperty = function(propertyName, object) {
        var index = propertyName.indexOf('.');
        if (isUndefined(object)) object = this;
        if (index == -1) {
            return object[propertyName];
        } else {
            return self.getProperty(propertyName.slice(index+1), object[propertyName.slice(0, index)]);
        }
    };
    self.setProperty = function(propertyName, value, object) {
        var index = propertyName.indexOf('.');
        if (isUndefined(object)) object = this;
        if (index == -1) {
            object[propertyName] = value;
        } else {
            if (isUndefined(object[propertyName.slice(0, index)])) object[propertyName.slice(0, index)] = {};
            return self.setProperty(propertyName.slice(index+1), value, object[propertyName.slice(0, index)]);
        }
    };
    self.discard = function() {
        self.__partial.discard();
    };
    self.bindElement = function(element) {
        if (element.hasAttribute('data-property-name')) {
            watchElement(element);
            watchAttribute(element);
            compileEventHandlers(element);
            autoBind(element);
        }
    };
};
