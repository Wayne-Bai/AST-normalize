/*jshint node:true*/
var Page = require('astrolabe').Page;

var breadcrumb = function (rootElement) {
    return Page.create({

        name: {
            get: function () {
                return rootElement.element(by.exactBinding('breadcrumb.name')).getText();
            }
        },

        lblTag: {
            get: function () { return rootElement.$('.status-tag'); }
        },

        tag: {
            get: function () {
                var page = this;
                return page.lblTag.isPresent().then(function (present) {
                    if (present) {
                        return page.lblTag.getText();
                    } else {
                        return null;
                    }
                });
            }
        },

        href: {
            get: function () {
                return this.isLink().then(function (isLink) {
                    if (isLink) {
                        return rootElement.$('a').getAttribute('href');
                    } else {
                        return null;
                    }
                });
            }
        },

        visit: {
            value: function () {
                return rootElement.$('a').click();
            }
        },

        isFirst: {
            value: function () {
                return rootElement.element(by.className('first')).isPresent();
            }
        },

        isLast: {
            value: function () {
                return rootElement.element(by.className('last')).isPresent();
            }
        },

        isLink: {
            value: function () {
                return rootElement.$('a').isPresent();
            }
        }

    });
};

var rxBreadcrumbs = {

    tblBreadcrumbs: {
        get: function () {
            return this.rootElement.all(by.repeater('breadcrumb in breadcrumbs.getAll(status)'));
        }
    },

    byName: {
        /**
          Return a single breadcrumb entry, located by the text of the element, case sensitive.
          If multiple entries exist with the same name, the first will be returned.
        */
        value: function (breadcrumbName) {
            return this.tblBreadcrumbs.filter(function (breadcrumbElement) {
                return breadcrumbElement.element(by.exactBinding('breadcrumb.name')).getText().then(function (name) {
                    return name === breadcrumbName;
                });
            }).then(function (matchingBreadcrumbs) {
                return breadcrumb(matchingBreadcrumbs[0]);
            });
        }
    },

    byPosition: {
        value: function (position) {
            return breadcrumb(this.tblBreadcrumbs.get(position));
        }
    },

    count: {
        value: function () {
            return this.tblBreadcrumbs.count();
        }
    },

    names: {
        get: function () {
            return this.tblBreadcrumbs.map(function (breadcrumbElement) {
                return breadcrumbElement.element(by.exactBinding('breadcrumb.name')).getText();
            });
        }
    }

};

exports.rxBreadcrumbs = {
    initialize: function (rootElement) {
        rxBreadcrumbs.rootElement = {
            get: function () { return rootElement; }
        };
        return Page.create(rxBreadcrumbs);
    },

    main: (function () {
        rxBreadcrumbs.rootElement = {
            get: function () { return $('rx-breadcrumbs'); }
        };
        return Page.create(rxBreadcrumbs);
    })()
};
