chorus.dialogs.ShowImage = chorus.dialogs.Base.extend({
    constructorName: "ShowImageDialog",
    templateName: "show_image",
    persistent: true,

    events: {
        "click .add_note" : "launchNotesNewDialog",
        "click .add_comment" : "launchCommentNewDialog",
        "click .copy": "launchCopyWorkfileDialog",
        "click .edit_tags": "startEditingTags",
        "click .rename": "launchRenameDialog",
        "click .delete_workfile": "launchWorkfileDeleteDialog"
    },

    setup: function(options) {
        this.activity = options.activity;
        this.originalModule = options.originalModule;
        this.attachment = options.attachment;
        this.workspace = new chorus.models.Workspace(options.workspace);
        if(this.attachment) {
            this.title = this.attachment.name();
            this.model = new chorus.models.Attachment(this.attachment);
        }
        else {
            this.title = this.activity.get("workfile").fileName;
            this.model = new chorus.models.Workfile(this.activity.get("workfile"));
        }
    },

    postRender: function() {
        this.$('.main_image').load(_.bind(function(){
            this.centerHorizontally();
        }, this));
    },

    additionalContext:function () {
        var imageUrl;
        var showFullOptions = true;
        if(this.attachment) {
            imageUrl = this.model.contentUrl();
            showFullOptions = false;
        }
        else {
            imageUrl = this.activity.get("workfile").versionInfo.contentUrl;
        }
        return {
            imageUrl: imageUrl,
            downloadUrl: this.model.downloadUrl(),
            workspaceIconUrl: this.workspace.defaultIconUrl('small'),
            workspaceShowUrl: this.workspace.showUrl(),
            workspaceName: this.workspace.name(),
            showFullOptions: showFullOptions
        };
    },

    launchWorkfileDeleteDialog: function(e) {
        e && e.preventDefault();
        var alert = new chorus.alerts.WorkfileDelete({
            workfileId: this.model.id,
            workspaceId: this.workspace.id,
            workfileName: this.model.get("fileName")
        });
        alert.redirectUrl = null;
        this.openNewModalWithEvent(alert);
    },

    launchRenameDialog: function(e) {
        e && e.preventDefault();
        var dialog = new chorus.dialogs.RenameWorkfile({model: this.model});
        this.openNewModalWithEvent(dialog);
    },

    startEditingTags: function(e) {
        e.preventDefault();
        var dialog = new chorus.dialogs.EditTags({collection: new chorus.collections.Base([this.model])});
        this.openNewModalWithEvent(dialog);
    },

    launchNotesNewDialog: function(e) {
        e && e.preventDefault();
        var dialog = new chorus.dialogs.NotesNew({
            pageModel: this.model,
            entityId: this.model.id,
            entityType: "workfile",
            workspaceId: this.workspace.id,
            allowWorkspaceAttachments: true
        });
        this.openNewModalWithEvent(dialog);
    },

    launchCommentNewDialog: function(e) {
        e && e.preventDefault();
        var dialog = new chorus.dialogs.Comment({
            pageModel: this.activity,
            eventId: this.activity.id
        });
        this.openNewModalWithEvent(dialog);
    },

    launchCopyWorkfileDialog: function(e) {
        e && e.preventDefault();
        var dialog = new chorus.dialogs.CopyWorkfile({
            workfileId: this.model.id,
            workspaceId: this.workspace.id,
            activeOnly: true
        });
        this.openNewModalWithEvent(dialog);
    },

    attachCloseModalEvent: function() {
        $(document).one("close.faceboxsuccess", _.bind(function(){
                if(this.className === 'tab_control') {
                    this.parentView.setWorkspace(this.parentView.model);
                }
                else {
                    this.setup();
                    this.render();
                }
            },
            this.originalModule));
    },

    openNewModalWithEvent: function(dialog) {
        this.closeModal();
        _.defer(_.bind(dialog.launchModal, dialog));
        this.attachCloseModalEvent();
    }

});
