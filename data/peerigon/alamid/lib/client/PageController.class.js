"use strict"; // run code in ES5 strict mode

var Page = require("./Page.class.js"),
    Event = require("../shared/Event.class.js"),
    Base = require("../shared/Base.class.js"),
    value = require("value"),
    resolvePageUrls = require("../shared/helpers/resolvePageUrls.js"),
    PageLoader = require("./PageLoader.class.js");

/**
 * Controls changing of sub pages on a main page.
 *
 * @class PageController
 * @extends Base
 */
var PageController = Base.extend("PageController", {

    /**
     * @type {Page}
     */
    mainPage: null,

    /**
     * @type {PageLoader}
     * @private
     */
    _activePageLoader: null,

    /**
     * @constructor PageController
     */
    constructor: function (mainPage) {
        if (value(mainPage).notTypeOf(Page)) {
            throw new TypeError("(alamid) Cannot create PageController: You haven't given a main page.");
        }

        this.mainPage = mainPage;
    },

    /**
     * Returns an array with all active sub pages. The main page is NOT included.
     * The last entry can be a non-page.
     *
     * @returns {Array}
     */
    getCurrentPages: function () {
        var page = this.mainPage,
            currentPages = [];

        while (page.getSubPage && (page = page.getSubPage())) {
            currentPages.push(page);
        }

        return currentPages;
    },

    /**
     * Loads all page bundles according to their given page url and sets the loaded pages as current pages.
     *
     * For instance: If the user is currently on '/home/about' and the new page url is '/blog/posts', the 'home'- and
     * the 'home/about'-page will be left and disposed. After that the 'blog'- and the 'blog/posts'-page will be initialized
     * and appended. Changing from '/blog/about' to '/blog/posts' would only dispose the '/blog/about'-page.
     *
     * Further calls to show() will automatically cancel the previous page change process if it's still running.
     *
     * @param {String} pageUrl a string like '/blog/posts'
     * @param {Object} context the context object that will be passed to the created pages
     */
    show: function (pageUrl, context) {
        var self = this,
            pageLoader = this._activePageLoader,
            remainingPages,
            pagesToUnload,
            event,
            pageUrlsArr,
            pageUrlsToLoad,
            indexOfTransitionPage,
            currentPages;

        pageUrl = sanitizePageUrl(pageUrl);

        currentPages = this.getCurrentPages();
        // Resolve which pages need to be loaded in order to display the given pageUrl
        // E.g. "/blog/posts/comments" becomes ["/blog", "/blog/posts", "/blog/posts/comments"]
        pageUrlsArr = resolvePageUrls(pageUrl);

        // Determines the position in the page hierarchy where the pages have to be changed.
        // E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 2.
        indexOfTransitionPage = getIndexOfTransitionPage(this.mainPage, pageUrlsArr);
        remainingPages = currentPages.slice(0, indexOfTransitionPage);
        pagesToUnload = currentPages.slice(indexOfTransitionPage);

        event = emitBeforeUnloadEvent(self, pagesToUnload, context);
        if (event.isDefaultPrevented()) {
            return;
        }

        event = new BeforePageChangeEvent(self, context);
        self.emit("beforePageChange", event);
        if (event.isDefaultPrevented()) {
            return;
        }

        if (pageLoader) {
            pageLoader.cancel();
        }
        pageUrlsToLoad = pageUrlsArr.slice(indexOfTransitionPage);
        if (pageUrlsToLoad.length === 0) {
            finishPageChange(self, remainingPages, context);
            return;
        }

        this._activePageLoader = pageLoader = new PageLoader(pageUrlsToLoad);
        pageLoader.load(context, function onPageLoaderFinished(err, pages) {
            self._activePageLoader = null;
            if (err) {
                throw err;
            }
            finishPageChange(self, remainingPages.concat(pages), context);
        });
    }
});

function getIndexOfTransitionPage(mainPage, pageUrls) {
    var page = mainPage,
        pageUrl,
        i,
        PageClass;

    for (i = 0; i < pageUrls.length; i++) {
        pageUrl = pageUrls[i];
        page = page.getSubPage();
        PageClass = PageLoader.loadedPages[pageUrl];

        if (typeof PageClass !== "function" || value(page).notTypeOf(PageClass)) {
            break;
        }
    }

    return i;
}

function finishPageChange(self, pages, ctx) {
    setPages(self, pages);
    self.emit("pageChange", new PageChangeEvent(self, ctx));
}

function emitBeforeUnloadEvent(self, pages, ctx) {
    var event = new BeforeUnloadEvent(self, ctx),
        page,
        i;

    for (i = pages.length - 1; i >= 0 && event.isDefaultPrevented() === false; i--) {
        page = pages[i];
        page.emit("beforeUnload", event);
    }

    return event;
}

function sanitizePageUrl(pageUrl) {
    if (pageUrl[0] !== "/") {
        pageUrl = "/" + pageUrl;
    }
    pageUrl = pageUrl.replace(/\/$/, "");

    return pageUrl;
}

function setPages(self, newPages) {
    var parentPage = self.mainPage,
        i = 0,
        currentPage,
        newPage;

    do {
        if (i === newPages.length &&
            (typeof parentPage.getSubPage !== "function" || typeof parentPage.setSubPage !== "function")) {
            // the last entry is possibly not a page, so we stop here
            break;
        }
        currentPage = parentPage.getSubPage();
        newPage = newPages[i] || null;
        if (currentPage !== newPage) {
            parentPage.setSubPage(newPage);
        }
        parentPage = newPage;
        i++;
    } while (i <= newPages.length);
}

/**
 * @class BeforePageChangeEvent
 * @extends Event
 */
var BeforePageChangeEvent = Event.extend("BeforePageChangeEvent", {
    name: "BeforePageChange",
    context: null,
    constructor: function (target, ctx) {
        this._super(target);
        this.context = ctx;
    }
});

/**
 * @class PageChangeEvent
 * @extends Event
 */
var PageChangeEvent = Event.extend("PageChangeEvent", {
    name: "PageChange",
    context: null,
    constructor: function (target, ctx) {
        this._super(target);
        this.context = ctx;
    }
});

/**
 * @class BeforeUnloadEvent
 * @extends Event
 */
var BeforeUnloadEvent = Event.extend("BeforeUnloadEvent", {
    name: "BeforeUnload",
    context: null,
    constructor: function (target, ctx) {
        this._super(target);
        this.context = ctx;
    }
});

module.exports = PageController;