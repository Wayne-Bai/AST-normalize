chorus.collections.MemberSet = chorus.collections.Base.extend({
    constructorName: "MemberSet",
    model:chorus.models.User,
    urlTemplate:"workspaces/{{workspaceId}}/members",

    save: function() {
        new chorus.models.BulkSaver({collection: this}).save({memberIds: _.pluck(this.models, 'id')});
    }
});
