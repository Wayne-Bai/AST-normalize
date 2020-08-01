chorus.views.TagItem = chorus.views.Base.extend({
    templateName:"tag_item",
    tagName: "div",

    additionalContext: function(){
        return {
            name: this.model.get('name'),
            count: this.model.get('count'),
            checkable: false
        };
    }
});
