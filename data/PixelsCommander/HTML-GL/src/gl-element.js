/*
* GLElement is a part of HTML GL library describing single HTML-GL element
* Copyright (c) 2015 pixelscommander.com
* Distributed under MIT license
* http://htmlgl.com
*
* Please, take into account:
* - updateTexture is expensive
* - updateSpriteTransform is cheap
* */

(function (w) {
    var p = Object.create(HTMLElement.prototype),
        style = document.createElement('style');

    //Default styling for html-gl elements
    style.innerHTML = HTMLGL.CUSTOM_ELEMENT_TAG_NAME + ' { display: inline-block; transform: translateZ(0);}';
    document.head.appendChild(style);

    p.createdCallback = function () {
        //Checking is node created inside of html2canvas virtual window or not. We do not need WebGL there
        var isInsideHtml2Canvas = this.baseURI !== undefined && this.baseURI.length === 0;

        if (!isInsideHtml2Canvas) {
            HTMLGL.elements.push(this);
            //Needed to determine is element WebGL rendered or not relying on tag name
            this.setAttribute('renderer', 'webgl');
            this.renderer = 'webgl';
            this.transformObject = {};
            this.boundingRect = {};
            this.image = {};
            this.sprite = new PIXI.Sprite();
            this.texture = {};
            this.halfWidth = 0;
            this.halfHeight = 0;
            this.observer = undefined;
            this.bindCallbacks();
            this.transformProperty = this.style.transform !== undefined ? 'transform' : 'WebkitTransform';
            this.init();
        }
    }

    p.init = function () {
        this.updateTexture();
        this.initObservers();
        this.patchStyleGLTransform();
    }

    //Updating bounds, waiting for all images to load and calling rasterization then
    p.updateTexture = function () {
        var self = this;
        self.updateBoundingRect();

        new HTMLGL.ImagesLoaded(self, function () {
            //Bounds could change during images loading
            self.updateBoundingRect();
            self.image = html2canvas(self, {
                onrendered: self.applyNewTexture,
                width: self.boundingRect.width,
                height: self.boundingRect.height
            });
        });
    }

    //Recreating texture from canvas given after calling updateTexture
    p.applyNewTexture = function (textureCanvas) {
        this.image = textureCanvas;
        this.texture = PIXI.Texture.fromCanvas(this.image);

        if (!this.haveSprite()) {
            this.initSprite(this.texture);
        } else {
            this.sprite.texture.destroy();
            this.sprite.setTexture(this.texture);
        }

        this.updatePivot();
        this.updateSpriteTransform();

        HTMLGL.context.markStageAsChanged();
    }

    //Just updates WebGL representation coordinates and transformation
    p.updateSpriteTransform = function () {

        //TODO add 3d rotation support
        var translateX = parseFloat(this.transformObject.translateX) || 0,
            translateY = parseFloat(this.transformObject.translateY) || 0,
            scaleX = parseFloat(this.transformObject.scaleX) || 1,
            scaleY = parseFloat(this.transformObject.scaleY) || 1,
            rotate = (parseFloat(this.transformObject.rotateZ) / 180) * Math.PI || 0;

        if (this.sprite && this.sprite.position) {
            this.sprite.position.x = this.boundingRect.left + translateX + this.halfWidth;
            this.sprite.position.y = this.boundingRect.top + translateY + this.halfHeight;
            this.sprite.scale.x = scaleX;
            this.sprite.scale.y = scaleY;
            this.sprite.rotation = rotate;
        }

        HTMLGL.context.markStageAsChanged();
    }

    //Getting bounding rect with respect to current scroll position
    p.updateBoundingRect = function () {
        this.boundingRect = {
            left: this.getBoundingClientRect().left,
            right: this.getBoundingClientRect().right,
            top: this.getBoundingClientRect().top,
            bottom: this.getBoundingClientRect().bottom,
            width: this.getBoundingClientRect().width,
            height: this.getBoundingClientRect().height,
        };

        this.boundingRect.left = HTMLGL.scrollX + parseFloat(this.boundingRect.left);
        this.boundingRect.top = HTMLGL.scrollY + parseFloat(this.boundingRect.top);
    }

    //Correct pivot needed to rotate element around it`s center
    p.updatePivot = function () {
        this.halfWidth = this.sprite.width / 2;
        this.halfHeight = this.sprite.height / 2;
        this.sprite.pivot.x = this.halfWidth;
        this.sprite.pivot.y = this.halfHeight;
    }

    p.initSprite = function (texture) {
        var self = this;
        //this.sprite = new PIXI.Sprite(texture);
        this.sprite.setTexture(texture);
        HTMLGL.document.addChild(this.sprite);
        setTimeout(function () {
            self.hideDOM();
        }, 0);
    }

    p.initObservers = function () {
        //TODO Better heuristics for rerendering condition #2
        var self = this,
            config = {
                childList: true,
                characterData: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style']
            };

        this.observer = this.observer || new MutationObserver(function (mutations) {
            if (mutations[0].attributeName === 'style') {
                self.transformObject = self.getTransformObjectFromString(self.style[self.transformProperty]);
                self.updateSpriteTransform();
            } else {
                self.updateTexture();
            }
        });

        this.observer.observe(this, config);
    }

    p.patchStyleGLTransform = function () {
        var self = this;
        self.styleGL = {};

        HTMLGL.util.getterSetter(this.styleGL, this.transformProperty, function () {
                var result = '';

                for (var transformPropertyName in self.transformObject) {
                    var transformPropertyValue = '(' + self.transformObject[transformPropertyName] + ') ';
                    result += transformPropertyName + transformPropertyValue;
                }

                return result;
            },
            function (value) {
                self.transformObject = self.getTransformObjectFromString(value);
                self.updateSpriteTransform();
            }
        )
    }

    p.getTransformObjectFromString = function (transformString) {
        return (transformString.match(/([\w]+)\(([^\)]+)\)/g) || [])
            .map(function (it) {
                return it.replace(/\)$/, "").split(/\(/)
            })
            .reduce(function (m, it) {
                return m[it[0]] = it[1], m
            }, {});
    }

    p.hideDOM = function () {
        this.style.opacity = 0;
    }

    p.bindCallbacks = function () {
        this.applyNewTexture = this.applyNewTexture.bind(this);
    }

    p.haveSprite = function () {
        return this.sprite.stage;
    }

    HTMLGL.GLElement = document.registerElement(HTMLGL.CUSTOM_ELEMENT_TAG_NAME, {
        prototype: p
    })

    HTMLGL.GLElement.createFromNode = function (node) {
        //Extending node with GLElement methods
        for (var i in p) {
            if (p.hasOwnProperty(i)) {
                node[i] = p[i];
            }
        }

        p.createdCallback.apply(node);
        return node;
    }

    //Wrap to jQuery plugin
    if (w.$ !== undefined) {
        $[HTMLGL.JQ_PLUGIN_NAME] = {};
        $[HTMLGL.JQ_PLUGIN_NAME].elements = [];

        $.fn[HTMLGL.JQ_PLUGIN_NAME] = function () {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + HTMLGL.JQ_PLUGIN_NAME)) {
                    var propellerObj = HTMLGL.GLElement.createFromNode(this);
                    $.data(this, 'plugin_' + HTMLGL.JQ_PLUGIN_NAME, propellerObj);
                    $[HTMLGL.JQ_PLUGIN_NAME].elements.push(propellerObj);
                }
            });
        };
    }
})(window);