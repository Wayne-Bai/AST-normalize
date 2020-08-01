chorus.models.Tag = chorus.models.Base.extend({
    constructorName: 'Tag',
    entityType: 'tag',
    urlTemplate: "tags/{{id}}",

    showUrlTemplate: function(workspaceId) {
        if(workspaceId) {
            return "workspaces/" + workspaceId + "/tags/{{encode name}}";
        } else {
            return "tags/{{encode name}}";
        }
    },

    matches: function(tagName) {
        return _.strip(this.get('name').toLowerCase()) === _.strip(tagName.toLowerCase());
    },

    performValidation:function (newAttrs) {
        this.clearErrors();
        if (newAttrs['name'].length > 100) {
            this.setValidationError("name", "field_error.TOO_LONG", null, {field: t('tag.name'), count: 100});
            return false;
        } else if (newAttrs['name'].length === 0) {
            this.setValidationError("name", "field_error.BLANK", null, {field: t('tag.name')});
            return false;
        }
        return true;
    }
});