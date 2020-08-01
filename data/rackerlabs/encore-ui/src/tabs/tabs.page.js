/*jshint node:true*/
var Page = require('astrolabe').Page;

var tabFromElement = function (tabElement) {

    return Page.create({

        isActive: {
            value: function () {
                return tabElement.getAttribute('class').then(function (className) {
                    return className.indexOf('active') > -1;
                });
            }
        },

        fullName: {
            get: function () {
                return tabElement.getText().then(function (text) {
                    return text.trim();
                });
            }
        },

        name: {
            get: function () {
                var tab = this;
                return this.subtitle.then(function (subtitle) {
                    if (subtitle !== null) {
                        return tab.fullName.then(function (name) {
                            return name.split(subtitle)[0].trim();
                        });
                    } else {
                        return tabElement.getText().then(function (name) {
                            return name.trim();
                        });
                    }
                });
            }
        },

        subtitle: {
            get: function () {
                var subtitleElement = tabElement.$('.subdued');
                return subtitleElement.isPresent().then(function (present) {
                    if (present) {
                        return subtitleElement.getText().then(function (text) {
                            return text.trim();
                        });
                    } else {
                        return null;
                    }
                });
            }
        },

        isDisplayed: {
            value: function () {
                return tabElement.isDisplayed();
            }
        },

        visit: {
            value: function () {
                browser.actions().mouseDown(tabElement).mouseUp().perform();
            }
        }

    });

};

var tabs = {

    cssTabs: {
        get: function () {
            return '.nav-tabs li';
        }
    },

    tblTabs: {
        get: function () {
            return this.rootElement.$$(this.cssTabs);
        }
    },

    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    },

    hasTab: {
        value: function (tabName) {
            var tabElement = this.rootElement.element(by.cssContainingText(this.cssTabs, tabName));
            return tabElement.isPresent().then(function (present) {
                return present ? tabElement.isDisplayed() : present;
            });
        }
    },

    byName: {
        /**
          This will not be able to differentiate between similarly named tabs with
          different subtitled names. Include any subtitled text to differentiate between them.
          This will also return partial matches on the tab name since it uses `cssContainingText`.
        */
        value: function (tabName) {
            var tabElement = this.rootElement.element(by.cssContainingText(this.cssTabs, tabName));
            return tabFromElement(tabElement);
        }
    },

    byIndex: {
        value: function (index) {
            return tabFromElement(this.tblTabs.get(index));
        }
    },

    names: {
        get: function () {
            return this.tblTabs.map(function (tabElement) {
                return tabElement.getText().then(function (text) {
                    return text.trim();
                });
            });
        }
    },

    activeTab: {
        get: function () {
            return tabFromElement(this.rootElement.$('.nav-tabs .active'));
        }
    },

    count: {
        value: function () {
            return this.tblTabs.count();
        }
    }

};

exports.tabs = {

    initialize: function (tabsElement) {
        tabs.rootElement = {
            get: function () { return tabsElement; }
        };
        return Page.create(tabs);
    },

    main: (function () {
        tabs.rootElement = {
            get: function () { return $('html'); }
        };
        return Page.create(tabs);
    })()

};
