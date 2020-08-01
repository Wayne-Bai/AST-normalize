chorus.views.ReadOnlyTextContent = chorus.views.Base.extend({
    constructorName: "ReadOnlyTextContent",
    templateName: "read_only_text_content",

    additionalContext: function() {
        return {
            content: this.model && this.model.content()
        };
    }
});