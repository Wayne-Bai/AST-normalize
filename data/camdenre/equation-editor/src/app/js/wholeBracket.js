eqEd.WholeBracket = function(symbolSizeConfig) {
    eqEd.Equation.call(this, symbolSizeConfig); // call super constructor.
    this.className = "eqEd.WholeBracket";
    
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
    eqEd.WholeBracket.prototype = Object.create(eqEd.Equation.prototype);
    eqEd.WholeBracket.prototype.constructor = eqEd.WholeBracket;
    eqEd.WholeBracket.prototype.buildDomObj = function() {
        return new eqEd.EquationDom(this,
            '<div class="wholeBracket ' + this.fontStyle + '">' + this.character + '</div>');
    };
    eqEd.WholeBracket.prototype.clone = function() {
        var copy = new this.constructor(this.fontStyle, this.symbolSizeConfig);
        return copy;
    };
})();