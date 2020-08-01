/*jshint node:true*/
var Page = require('astrolabe').Page;
var _ = require('lodash');

var rxPaginate = {

    lnkCurrentPage: {
        get: function () { return this.rootElement.$('.pagination .active a'); }
    },

    tblPages: {
        get: function () { return this.rootElement.$$('.pagination .pagination-page a'); }
    },

    tblPageSizes: {
        get: function () {
            return this.rootElement.all(by.repeater('i in pageTracking.itemSizeList'));
        }
    },

    jumpToPage: {
        value: function (pageNumber) {
            var page = this;
            if (pageNumber < 1) {
                page.NoSuchPageException.thro('Page number must be >= 1');
            }

            return this.pages.then(function (pageNumbers) {
                var pageIndex = _.indexOf(pageNumbers, pageNumber);
                if (pageIndex === -1) {
                    // The page is not on the current page numbers list.
                    // Let's navigate around and try again.
                    if (_.min(pageNumbers) > pageNumber) {
                        // The lowest available page is still too big.
                        page.jumpToLowestAvailablePage();
                        // Try again.
                        page.jumpToPage(pageNumber);
                    } else {
                        page.checkForInvalidLastPage(pageNumber);
                        page.jumpToHighestAvailablePage();
                        // Try again.
                        page.jumpToPage(pageNumber);
                    }
                } else {
                    // Our target page is somewhere in the available pages list.
                    return page.tblPages.get(pageIndex).click();
                }
            });
        }
    },

    first: {
        /**
          Does nothing if already at the first page.
        */
        value: function () {
            var page = this;
            return this.page.then(function (pageNumber) {
                if (pageNumber > 1) {
                    page.rootElement.$('.pagination-first a').click();
                }
            });
        }
    },

    previous: {
        value: function () {
            this.checkForInvalidFirstPage();
            this.rootElement.$('.pagination-prev a').click();
        }
    },

    next: {
        value: function () {
            this.checkForInvalidLastPage();
            this.rootElement.$('.pagination-next a').click();
        }
    },

    last: {
        /**
          Does nothing if already at the last page.
        */
        value: function () {
            var page = this;
            var css = '.pagination-last a';
            return this.rootElement.$(css).isDisplayed().then(function (isDisplayed) {
                if (isDisplayed) {
                    page.rootElement.$(css).click();
                }
            });
        }
    },

    page: {
        /**
          Return the current page number, or change page numbers.
        */
        get: function () {
            return this.lnkCurrentPage.getText().then(function (text) {
                return parseInt(text, 10);
            });
        },
        set: function (pageNumber) {
            return this.jumpToPage(pageNumber);
        }
    },

    pages: {
        get: function () {
            /**
              Return a list of page numbers available to paginate to.
            */
            return this.tblPages.map(function (pageNumber) {
                return pageNumber.getText().then(function (n) {
                    return parseInt(n, 10);
                });
            });
        }
    },

    pageSizes: {
        get: function () {
            return this.tblPageSizes.map(function (pageSizeElement) {
                return pageSizeElement.getText().then(function (pageSize) {
                    return parseInt(pageSize, 10);
                });
            });
        }
    },

    pageSize: {
        get: function () {
            var css = '.pagination-per-page-button[disabled="disabled"]';
            return this.rootElement.$(css).getText().then(function (pageSize) {
                return parseInt(pageSize, 10);
            });
        },
        /**
          Will throw an exception if no matching `itemsPerPage` entry is found.
        */
        set: function (itemsPerPage) {
            var page = this;
            var css = '.pagination-per-page-button';
            return this.pageSizes.then(function (pageSizes) {
                if (_.indexOf(pageSizes, itemsPerPage) === -1) {
                    page.NoSuchItemsPerPage(itemsPerPage);
                }

                return page.rootElement.$$(css).each(function (pageSizeElement) {
                    return pageSizeElement.getText().then(function (pageSize) {
                        if (parseInt(pageSize, 10) === itemsPerPage) {
                            pageSizeElement.click();
                            return false;
                        }
                    });
                });
            });
        }
    },

    shownItems: {
        get: function () {
            var rootElement = this.rootElement;
            var indexesRegex = /Showing (\d+)-(\d+) of (\d+) items/;
            // If the items per page exceeds total items, the `indexesRegex` won't match.
            // Catch this edge case and coerce the text into something that will match.
            var testThenMatch = function (text, matchIndex) {
                if (!indexesRegex.test(text)) {
                    var indexRegex = /Showing (\d+) items/;
                    var totalItems = text.match(indexRegex)[1];
                    text = 'Showing 1-' + totalItems + ' of ' + totalItems + ' items';
                }
                return parseInt(text.match(indexesRegex)[matchIndex], 10);
            };

            return Page.create({

                lblIndexes: {
                    get: function () {
                        return rootElement.element(by.binding('pageTracking'));
                    }
                },

                first: {
                    get: function () {
                        return this.lblIndexes.getText().then(function (text) {
                            return testThenMatch(text, 1);
                        });
                    }
                },

                last: {
                    get: function () {
                        return this.lblIndexes.getText().then(function (text) {
                            return testThenMatch(text, 2);
                        });
                    }
                },

                total: {
                    get: function () {
                        return this.lblIndexes.getText().then(function (text) {
                            return testThenMatch(text, 3);
                        });
                    }
                }

            });
        }
    },

    totalItems: {
        get: function () {
            return this.shownItems.total;
        }
    },

    totalPages: {
        get: function () {
            return protractor.promise.all([this.totalItems, this.pageSize]).then(function (results) {
                var totalItems = results[0];
                var pageSize = results[1];
                return Math.ceil(totalItems / pageSize);
            });
        }
    },

    jumpToLowestAvailablePage: {
        value: function () {
            this.tblPages.first().click();
        }
    },

    jumpToHighestAvailablePage: {
        value: function () {
            this.tblPages.last().click();
        }
    },

    checkForInvalidFirstPage: {
        value: function () {
            var page = this;
            return this.page.then(function (currentPage) {
                if (currentPage === 1) {
                    page.NoSuchPageException.thro('cannot navigate back past the first page.');
                }
            });
        }
    },

    checkForInvalidLastPage: {
        /**
          Accepts an optional `pageNumber` argument to print to the exception
          should the `NoSuchPageException` get triggered during this call.
          Otherwise, it defaults to a generic invalid page message.
        */
        value: function (pageNumber) {
            var page = this;
            return this.page.then(function (currentPage) {
                pageNumber = pageNumber || 'any higher number';
                return page.pages.then(function (pageNumbers) {
                    if (_.last(pageNumbers) == currentPage) {
                        // We are at the last page, and we still need to go higher.
                        var message = pageNumber + ' exceeds max page of ' + _.last(pageNumbers);
                        page.NoSuchPageException.thro(message);
                    }
                });
            });
        }
    },

    NoSuchPageException: {
        get: function () { return this.exception('No such page'); }
    },

    NoSuchItemsPerPageException: {
        get: function () { return this.exception('No such itemsPerPage'); }
    }

};

exports.rxPaginate = {
    initialize: function (rxPaginationElement) {
        rxPaginate.rootElement = {
            get: function () { return rxPaginationElement; }
        };
        return Page.create(rxPaginate);
    },

    main: (function () {
        rxPaginate.rootElement = {
            get: function () { return $('.rx-paginate'); }
        };
        return Page.create(rxPaginate);
    })()
};
