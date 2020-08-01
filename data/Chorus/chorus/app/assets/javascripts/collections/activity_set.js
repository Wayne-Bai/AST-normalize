chorus.collections.ActivitySet = chorus.collections.Base.extend({
    constructorName: "ActivitySet",
    model: chorus.models.Activity,
    per_page: 20,

    setup: function() {
        this.bind("reset", this.reindexErrors);
    },

    reindexErrors: function() {
        _.each(this.models, function(activity) {
            activity.reindexError();
        });
    },

    urlTemplate: function() {
        return this.attributes.insights ? 'insights' : 'activities';
    },

    urlParams: function() {
        if(this.attributes.entity) {
            return { entityType: this.attributes.entity.entityType, entityId: this.attributes.entity.get('id') };
        } else {
            return { entityType: 'dashboard' };
        }
    }
});
