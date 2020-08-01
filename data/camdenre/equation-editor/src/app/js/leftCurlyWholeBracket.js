eqEd.LeftCurlyWholeBracket = function(fontStyle, symbolSizeConfig) {
    eqEd.WholeBracket.call(this, symbolSizeConfig); // call super constructor.
    this.className = "eqEd.LeftCurlyWholeBracket";
    
    this.character = "{";
    this.fontStyle = fontStyle;
    this.domObj = this.buildDomObj();
    this.adjustTop = 0;
    if (this.fontStyle === "MathJax_Main") {
        this.adjustTop = -0.0625;
    } else if (this.fontStyle === "MathJax_Size3") {
        this.adjustTop = 0.7;
    } else if (this.fontStyle === "MathJax_Size4") {
        this.adjustTop = 0.995;
    }
    
    // Set up the width calculation
    var width = 0;
    this.properties.push(new Property(this, "width", width, {
        get: function() {
            return width;
        },
        set: function(value) {
            width = value;
        },
        compute: function() {
            // remember compute hooks get called.
            return 0;
        },
        updateDom: function() {
            this.domObj.updateWidth(this.width);
        }
    }));

    // Set up the height calculation
    var height = 0;
    this.properties.push(new Property(this, "height", height, {
        get: function() {
            return height;
        },
        set: function(value) {
            height = value;
        },
        compute: function() {
            // remember compute hooks get called.
            return 0;
        },
        updateDom: function() {
            this.domObj.updateHeight(this.height);
        }
    }));

    // Set up the left calculation
    var left = 0;
    this.properties.push(new Property(this, "left", left, {
        get: function() {
            return left;
        },
        set: function(value) {
            left = value;
        },
        compute: function() {
            // remember compute hooks get called.
            return 0;
        },
        updateDom: function() {
            this.domObj.updateLeft(this.left);
        }
    }));

    // Set up the top calculation
    var top = 0;
    this.properties.push(new Property(this, "top", top, {
        get: function() {
            return top;
        },
        set: function(value) {
            top = value;
        },
        compute: function() {
            // remember compute hooks get called.
            return 0;
        },
        updateDom: function() {
            this.domObj.updateTop(this.top);
        }
    }));

};
(function() {
    // subclass extends superclass
    eqEd.LeftCurlyWholeBracket.prototype = Object.create(eqEd.WholeBracket.prototype);
    eqEd.LeftCurlyWholeBracket.prototype.constructor = eqEd.LeftCurlyWholeBracket;
})();