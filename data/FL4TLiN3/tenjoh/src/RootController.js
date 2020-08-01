$tenjoh.RootController = function() {
    var self = this;
    var getPartialName = function(partialURL) {
        return partialURL.substr(partialURL.lastIndexOf('/') + 1, 1).toUpperCase() +
            partialURL.substring(partialURL.lastIndexOf('/') + 2, partialURL.indexOf('.'));
    };
    var appendPartialView = function(partialView) {
        self.rootElement.appendChild(partialView);
    };

    self.__controllers = [];
    self.getController = function(name) { return self.__controllers[name]; };
    self.setController = function(name, controller) { self.__controllers[name] = controller; };

    self.__partials = {};
    self.getPartial = function(partialName) { return self.__partials[partialName]; };
    self.setPartial = function(partial) { self.__partials[partial.name] = partial; };

    self.init = function() {
        var initPartial, partialName = 'Index';
        self.rootElement = document.getElementById('TenjohRoot');
        if (isEmpty(self.rootElement)) throw new Error('no root element defined');
        $tenjoh.Router.start();
    };
    self.discardPartial = function(name) {
        if (self.getPartial(name)) {
            self.getPartial(name).getView().innerHTML = '';
            delete self.__partials[name];
        }
    };
};
