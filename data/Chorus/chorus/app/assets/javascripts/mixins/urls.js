chorus.Mixins.Urls = {

    //Build the link url for a model based on the urlTemplate method on that model.
    showUrl: function() {
        if (this.isDeleted()) return null;

        if (!this.showUrlTemplate) {
            throw "No showUrlTemplate defined";
        }

        var template = _.isFunction(this.showUrlTemplate) ? this.showUrlTemplate.apply(this, arguments) : this.showUrlTemplate;
        var prefix = "#/";
        var encodedFragment = new URI(Handlebars.compile(template, {noEscape: true})(this.attributes)).normalize().toString();
        return prefix + encodedFragment;
    },

    showLink: function(text) {
        return Handlebars.helpers.linkTo(this.showUrl(), text || this.name());
    }
};
