chorus.collections.CommentSet = chorus.collections.Base.extend({
    constructorName: "CommentSet",
    model:chorus.models.Comment,

    comparator: function(comment) {
        return comment.get('timestamp');
    }
});