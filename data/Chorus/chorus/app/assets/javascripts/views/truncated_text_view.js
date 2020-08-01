chorus.views.TruncatedText = chorus.views.Base.extend({
    constructorName: "TruncatedText",
    templateName: "truncated_text",

    events: {
        "click .links a": "toggleMore",
        "click .original a": "openLink"
    },

    additionalContext: function() {
        var value = this.model.get(this.options.attribute);
        if(this.options.attributeIsHtmlSafe && value) {
            value = new Handlebars.SafeString(value);
        }
        return {
            text: value,
            unexpandable: this.options.unexpandable
        };
    },

    postRender: function() {
        this.show();
    },

    show: function() {
        var numLines = 2;

        _.defer(_.bind(function() {

            if (this.options.extraLine) {
                numLines++;
                this.$(".styled_text").addClass("extra_line");
            }
            
            // take the original text, and calculate how tall it will render as numLines
            // compare to heightlimit, and add expandable links if it is greater
            var text = this.$(".original");
            var heightLimit = parseInt(text.css("line-height"), 10) * numLines;
            if (text.height() > heightLimit) {
                $(this.el).addClass('expandable');
            } else {
                $(this.el).removeClass('expandable');
            }
        }, this));
    },

    toggleMore: function(e) {
        e && e.preventDefault();
        e.stopPropagation();
        $(this.el).toggleClass("expanded");
        this.recalculateScrolling($(this.el).closest(".custom_scroll"));
    },

    openLink: function(e) {
        e && e.preventDefault();
        window.open($(e.currentTarget).attr("href"));
    }
});