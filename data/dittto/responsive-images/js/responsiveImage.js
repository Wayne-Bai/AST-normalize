/*jslint browser: true, continue: true, plusplus: true, regexp: true, sloppy: true */

document.createElement("responsive-image");

/**
 * A container for the responsiveImage functions
 */
var responsiveImage = {

    /**
     * The default config
     */
    config: {
        className: "responsive",
        lazyDelay: 200,
        useNoScript: false,
        default: {
            sizes: [320, 480, 720, 100000],
            fileNames: {320: 320, 480: 480, 720: 720, 100000: 100000},
            imagePath: "^(.+\\-)(\\d+)(\\.[a-z]+)$",
            imagePathSizeField: 2,
            lazy: true,
            lazyPrePx: 200
        }
    },

    /**
     * Create a store for the current window size
     */
    screenWidth: document.documentElement.clientWidth,

    /**
     * A store for the scrollbar width
     */
    scrollbarWidth: 0,

    /**
     * A flag that lets the rest of the of the code know that it can run
     */
    hasInited: false,

    /**
     * A flag that is set to true to allow the Scroll() function to run again.
     * This is to stop the Scroll() function being triggered too often
     */
    allowLazyUpdate: true,

    /**
     * A flag that when set to true allows the scroll to be updated. This is
     * because there's currently a bug in Chrome 33 (at least) where when the
     * page refreshes, the scroll doesn't reset, but the getBoundingClientRect
     * calculates as if the page does
     */
    forcedScrollUpdate: true,

    /**
     * Inits the class. Calculates the scrollbar width and resizes the images
     * for the first time
     *
     * @param config An object containing updates to the default config
     */
    Init: function (config) {
        // update the config
        this.config = this.UpdateConfig(config);

        // calculate the scroll width for this browser
        this.CalcScrollWidth();

        // setup the events
        this.InitEvents();
    },

    /**
     * Inits the events for resize and for scroll. There is no load event for
     * scroll as it's triggered by resize anyway
     */
    InitEvents: function () {
        if (typeof (window.attachEvent) === "object") {
            window.attachEvent("onresize", this.Resize);
            window.attachEvent("onload", this.Resize);
            window.attachEvent("onscroll", this.Scroll);
        } else {
            window.addEventListener("resize", this.Resize, false);
            window.addEventListener("load", this.Resize, false);
            window.addEventListener("scroll", this.Scroll, false);
        }
    },

    /**
     * Updates the default config with additional options
     *
     * @param config An object containing updates to the default config
     */
    UpdateConfig: function (config) {
        // init vars
        var key, sizeKey, fileNames = {}, sortFunction;

        // update config with the default options if missing default
        if (typeof config !== "object") {config = {}; }
        if (config.default === undefined) {config.default = this.config.default; }

        // init the sort function for numerical ordering
        sortFunction = function (first, second) {return first - second; };

        // update all configs if missing data, and reorder the config sizes
        // into numeric order
        for (key in config) {
            if (config.hasOwnProperty(key) && typeof config[key] === "object") {
                // build the fileNames object if it's missing but sizes have been set
                if (config[key].fileNames === undefined && config[key].sizes !== undefined) {
                    for (sizeKey in config[key].sizes) {
                        if (config[key].sizes.hasOwnProperty(sizeKey)) {
                            fileNames[config[key].sizes[sizeKey]] = config[key].sizes[sizeKey];
                        }
                    }
                    config[key].fileNames = fileNames;
                }

                // make sure no fields are missing
                if (config[key].sizes === undefined) {config[key].sizes = this.config.default.sizes; }
                if (config[key].fileNames === undefined) {config[key].fileNames = this.config.default.fileNames; }
                if (config[key].imagePath === undefined) {config[key].imagePath = this.config.default.imagePath; }
                if (config[key].imagePathSizeField === undefined) {config[key].imagePathSizeField = this.config.default.imagePathSizeField; }
                if (config[key].lazy === undefined) {config[key].lazy = this.config.default.lazy; }
                if (config[key].lazyPrePx === undefined) {config[key].lazyPrePx = this.config.default.lazyPrePx; }
                config[key].sizes.sort(sortFunction);
            }
        }

        // override the global config options
        if (config.className === undefined) {config.className = this.config.className; }
        if (config.lazyDelay === undefined) {config.lazyDelay = this.config.lazyDelay; }
        if (config.useNoScript === undefined) {config.useNoScript = this.config.useNoScript; }

        return config;
    },

    /**
     * Gets the available options for this image
     *
     * @param className All of the classes for this image so we can work out
     * which config options to use
     * @return null|object Either null if the responsive class can't be found,
     * or an object containing the config options
     */
    GetOptions: function (className) {
        // init vars
        var selected = "", classes, i, option, regex, namespace;

        // split the classname into classes
        classes = className.split(" ");
        for (i in classes) {
            if (classes.hasOwnProperty(i)) {
                // trim the spacing from the option
                option = classes[i].replace(/^\s+|\s+$/g, "");

                // if there is the responsive class, then use the default settings
                if (selected === "" && option === this.config.className) {
                    selected = "default";
                }

                // if there are namespaced options set, retrieve those
                regex = new RegExp("^" + this.config.className + "-", "g");
                namespace = option.replace(regex, "");
                if (this.config[namespace] !== undefined) {
                    selected = namespace;
                }
            }
        }

        return selected === "" ? null : this.config[selected];
    },

    /**
     * Calculates the width of the scrollbar as some browsers include in the
     * width of the available screen space
     */
    CalcScrollWidth: function () {
        // calculates the width of the scrollbar for this browser
        if (this.scrollbarWidth === 0) {
            // build a div to measure and force scrollbars to be on
            var div = document.createElement("div");
            div.style.width = "200px";
            div.style.overflow = "scroll";
            document.body.appendChild(div);

            // if the div has both an offset and client width, then the
            // difference is the scrollbar width. Also includes a hack to get
            // around webkit calculating the width wrongly
            if (div.offsetWidth && div.clientWidth && !(new RegExp(" AppleWebKit/").test(navigator.userAgent))) {
                this.scrollbarWidth = div.offsetWidth - div.clientWidth;
            }

            // remove the div now we have the scroll width
            div.parentNode.removeChild(div);
        }
    },

    /**
     * Calculates if the screen has changed size. If it has then tries to resize
     * the images
     *
     * @param force Set this to true to force a resize of the images to occur
     */
    Resize: function (force) {
        // init vars
        var clientWidth, $this = responsiveImage;

        // recalculate clientWidth to include the scrollbar width
        clientWidth = document.documentElement.clientWidth + $this.scrollbarWidth;

        // make sure force is inited
        force = $this.hasInited === false || force === true ? true : false;
        $this.hasInited = true;

        // if the window is the same width, don't do anything
        if ($this.screenWidth === clientWidth && !force) {
            return;
        }

        // store the new width
        $this.screenWidth = clientWidth;

        // see if the image needs changing
        $this.Rebuild();

        // call scroll to see if any images need to be shown
        $this.Scroll();
    },

    /**
     * Handles resizing all images. This is done by building an additional img
     * tag as a sibling of the noscript tag
     */
    Rebuild: function () {
        // init vars
        var scripts, i, script, options, image, prefix, foundImage, newImage;

        // loop through all the noscript scripts
        scripts = document.getElementsByTagName(this.config.useNoScript ? "noscript" : "responsive-image");
        for (i = 0; i < scripts.length; i++) {
            // if no options can be found for this noscript then skip this one
            script = scripts[i];
            options = this.GetOptions(script.className);
            if (!options) {
                continue;
            }

            // gets the image, size, alt, title, and classes from the options
            // and the noscript
            image = this.GetBoundary(script, options);

            // calc the prefix for the attributes
            prefix = "data-" + this.config.className + "-";

            // create a new id so the image can be tracked down again
            if (!script.getAttribute(prefix + "image-id")) {
                script.setAttribute(prefix + "image-id", prefix + "image-" + Math.floor(Math.random() * 10000000));
            }

            // add an attribute if the image needs to be lazy-loaded
            if (options.lazy === true && !script.getAttribute(prefix + "lazy")) {
                script.setAttribute(prefix + "lazy", String(options.lazyPrePx));
            }

            // check to see if the element exists and has the same size
            foundImage = document.getElementById(script.getAttribute(prefix + "image-id"));
            if (foundImage) {
                // if the image is the same size then ignore it
                if (parseInt(foundImage.getAttribute(prefix + "used-size"), 10) === parseInt(image.size, 10)) {
                    continue;
                }

                // otherwise remove the image so it can be rebuilt, and remove the lazy-loaded flag
                foundImage.parentNode.removeChild(foundImage);
                script.removeAttribute(prefix + "lazy-loaded");
            }

            // build the image as either it hasn't been created yet, or it's
            // been removed for being the wrong size
            newImage = document.createElement("img");
            if (image.alt !== undefined) {newImage.setAttribute("alt", image.alt); }
            if (image.title !== undefined) {newImage.setAttribute("title", image.title); }
            if (image.class !== undefined) {newImage.setAttribute("class", image.class); }
            newImage.setAttribute("id", script.getAttribute(prefix + "image-id"));
            newImage.setAttribute(prefix + "used-size", image.size);

            // add the image as the src or to the data if it's to be lazy-loaded
            if (options.lazy) {
                newImage.setAttribute(prefix + "lazy-src", image.src);
            } else {
                newImage.setAttribute("src", image.src);
            }

            // add the image to the page before the noscript tag
            script.parentNode.insertBefore(newImage, script);
        }
    },

    /**
     * Find the width and path of the image to use from the noscript
     * attributes. These are then compared against the current screen width to
     * see which boundary the image falls in to. Like "The Price is Right", the
     * boundary is chosen by the closest without being too large, for instance
     * if the width is 800 and there are 2 boundaries of 700 and 810, then it
     * will choose 700.
     *
     * @param element The noscript element to extract the src
     * @param options The config options including the available sizes of the
     * image
     * @return object An object containing the size of the boundary, and the
     * src of the related path.
     */
    GetBoundary: function (element, options) {
        // init vars
        var closestSize, size, testElement, foundElement, src, matches, i, imageSrc = "";

        // get the closest size specified without going over
        closestSize = options.sizes[options.sizes.length - 1];
        for (size in options.sizes) {
            if (options.sizes.hasOwnProperty(size)) {
                size = parseInt(options.sizes[size], 10);
                if (this.screenWidth <= size && closestSize >= size) {
                    closestSize = size;
                }
            }
        }

        // get the src of the image in the node. Do this via an extra element
        // as html inside noscript tags can't be easily read
        if (this.config.useNoScript) {
            testElement = document.createElement("div");
            testElement.innerHTML = element.childNodes[0].data;
            foundElement = testElement.getElementsByTagName("img")[0];
            src = foundElement.src;
        } else {
            foundElement = element;
            src = element.getAttribute('data-src');
        }

        // calculate the new path of the closest size
        matches = /^(.+\-)(\d+)(\.[a-z]+)$/.exec(src);

        // build the image src
        for (i = 1; i < matches.length; i++) {
            if (i === options.imagePathSizeField) {
                imageSrc += options.fileNames[closestSize];
            } else {
                imageSrc += matches[i];
            }
        }

        return {
            size: closestSize,
            src: imageSrc,
            alt: foundElement.getAttribute('alt'),
            title: foundElement.getAttribute('title'),
            class: foundElement.getAttribute('data-class')};
    },

    /**
     * Fires when the screen has been scrolled and shows any images that need
     * to be lazy loaded
     *
     * @return undefined
     */
    Scroll: function () {
        // init vars
        var noscripts, i, screenHeight, prefix, rect, image, moveScrollInterval, $this = responsiveImage;

        // drop out if not allowed to run
        if ($this.allowLazyUpdate === false) {
            return;
        }
        $this.allowLazyUpdate = false;

        // get the current screen height
        screenHeight = window.innerHeight || document.documentElement.clientHeight;

        // get all noscripts that have the lazy attribute marked
        if (typeof document.getElementsByClassName === "function") {
            noscripts = document.getElementsByClassName($this.config.className);
        } else {
            noscripts = document.getElementsByTagName(this.config.useNoScript ? "noscript" : "responsive-image");
        }

        // force the page to scroll slightly if it's already scrolled. This
        // gets round a bug in getBoundingClientRect in Chrome 33
        if ($this.forcedScrollUpdate) {
            moveScrollInterval = window.setInterval(function () {
                if (document.documentElement.scrollTop !== 0) {
                    window.clearInterval(moveScrollInterval);
                    $this.allowLazyUpdate = true;
                    $this.forcedScrollUpdate = false;
                    $this.Scroll();
                } else {
                    $this.forcedScrollUpdate = false;
                }
            }, 50);
        }

        // loop through the noscripts looking for those that need lazy-loading
        prefix = "data-" + $this.config.className + "-";
        for (i = 0; i < noscripts.length; i++) {
            // look for those that are lazy but not lazy-loaded
            if (noscripts[i].getAttribute(prefix + "lazy") && !noscripts[i].getAttribute(prefix + "lazy-loaded")) {
                // get the bounding box of the image
                rect = document.getElementById(noscripts[i].getAttribute(prefix + "image-id")).getBoundingClientRect();

                // if the offset bounding box is visible, then show the image
                // and mark the noscript as lazy-loaded
                if (rect.top - parseInt(noscripts[i].getAttribute(prefix + "lazy"), 10) <= screenHeight) {
                    image = document.getElementById(noscripts[i].getAttribute(prefix + "image-id"));
                    image.setAttribute("src", image.getAttribute(prefix + "lazy-src"));
                    noscripts[i].setAttribute(prefix + "lazy-loaded", "1");
                }
            }
        }

        // fire a timeout to prevent this function being run too often
        window.setTimeout(function () {
            $this.allowLazyUpdate = true;
            $this.Scroll();
        }, $this.config.lazyDelay);
    }
};