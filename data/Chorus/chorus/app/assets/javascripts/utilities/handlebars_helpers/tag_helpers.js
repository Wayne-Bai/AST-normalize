chorus.handlebarsHelpers.tag = {
    displayTagMatch: function(context, displayedTagName) {
        var highlighted = context["highlightedAttributes"];

        if (highlighted && highlighted["tagNames"]) {
            _.each(highlighted["tagNames"], function(highlightedTagName) {
                var plainTagName = highlightedTagName.replace(/<\/?em>/g, "");
                if (displayedTagName === plainTagName) {
                    displayedTagName = highlightedTagName;
                }
            });
        }

        return Handlebars.helpers.escapeAllowingHtmlTag(displayedTagName, "em");
    },

    escapeAllowingHtmlTag: function(stringToEscape, htmlTag) {
        var escapedString = Handlebars.Utils.escapeExpression(stringToEscape);

        var openTagRegex = new RegExp("&lt;" + htmlTag + "&gt;", "g");
        var closeTagRegex = new RegExp("&lt;/" + htmlTag + "&gt;", "g");

        var openTag = "<" + htmlTag + ">";
        var closeTag = "</" + htmlTag + ">";
        escapedString = escapedString.replace(openTagRegex, openTag);
        escapedString = escapedString.replace(closeTagRegex, closeTag);
        return new Handlebars.SafeString(escapedString);
    }
};

_.each(chorus.handlebarsHelpers.tag, function(helper, name) {
    Handlebars.registerHelper(name, helper);
});