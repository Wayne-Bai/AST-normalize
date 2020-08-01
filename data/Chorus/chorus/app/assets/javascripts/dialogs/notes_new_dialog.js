chorus.dialogs.NotesNew = chorus.dialogs.MemoNew.extend({
    constructorName: "NotesNew",

    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel: function() {
        this.pageModel = this.options.pageModel;

        var sqlDB = this.pageModel.entityType.match(/data_source/) && !this.pageModel.entityType.match(/hdfs/);
        var entityType = sqlDB ? 'data_source' : this.pageModel.entityType;
//        var entityType = false ? 'data_source' : this.pageModel.entityType;
        var workspaceId = this.pageModel.workspace && this.pageModel.workspace() && this.pageModel.workspace().id;

        this.model = new chorus.models.Note({
            entityId:    this.pageModel.id,
            entityType: entityType,
            workspaceId: workspaceId
        });

        var displayType = this.pageModel.displayEntityType || entityType;
        this.placeholder = t("notes.placeholder", {noteSubject: displayType});
        this._super("makeModel", arguments);
    }
});
