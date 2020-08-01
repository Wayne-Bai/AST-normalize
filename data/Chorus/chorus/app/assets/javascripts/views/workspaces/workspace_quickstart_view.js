chorus.views.WorkspaceQuickstart = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartView",
    templateName: "workspace_quickstart",
    additionalClass: "workspace_show quickstart",
    useLoadingSection: true,

    events: {
        "click a.dismiss": "visitShowPage",
        "click .import_workfiles": 'launchImportWorkfilesDialog',
        "click .edit_workspace": 'launchEditWorkspaceDialog',
        "click .edit_workspace_members": 'launchWorkspaceEditMembersDialog',
        "click .new_sandbox": 'launchSandboxNewDialog'
    },

    additionalContext: function() {
        return {
            workspaceUrl: this.model.showUrl(),
            needsMember: this.needsMember(),
            needsWorkfile: !this.model.get("hasAddedWorkfile"),
            needsSandbox: this.needsSandbox(),
            needsSettings: !this.model.get("hasChangedSettings")
        };
    },

    setup: function() {
        this.subscribePageEvent("modal:closed", this.refreshQuickStart);
    },

    modalClasses: function () {
        return {
            edit_workspace: chorus.dialogs.EditWorkspace,
            new_sandbox: chorus.dialogs.SandboxNew,
            edit_members: chorus.dialogs.WorkspaceEditMembers,
            import_workfile: chorus.dialogs.WorkfilesImport
        };
    },

    refreshQuickStart: function(modal) {
        var closedModalWasInteresting = _.any(_.values(this.modalClasses()), function (ctor) {
            return modal instanceof ctor;
        });

        if (closedModalWasInteresting) {
            this.model.fetch();
        }
    },

    render: function() {
        if (this.model.get("hasAddedMember") === true &&
            this.model.get("hasAddedSandbox") === true &&
            this.model.get("hasAddedWorkfile") === true &&
            this.model.get("hasChangedSettings") === true) {

            chorus.router.navigate(this.model.showUrl());
        }

        this._super("render", arguments);
    },

    visitShowPage: function(e) {
        var quickstart = new chorus.models.WorkspaceQuickstart({
            workspaceId: this.model.get("id")
        });
        quickstart.destroy();

        e && e.preventDefault();
        chorus.router.navigate($(e.currentTarget).attr("href"));
    },

    makeModal: function (key, options) {
        return new (this.modalClasses()[key])(options);
    },

    needsMember: function() {
        return !(this.model.get("hasAddedMember") || chorus.models.Config.instance().license().limitWorkspaceMembership());
    },

    needsSandbox: function() {
        return !(this.model.get("hasAddedSandbox") || chorus.models.Config.instance().license().limitSandboxes());
    },

    launchEditWorkspaceDialog: function (e) {
        e && e.preventDefault();

        this.editWorkspaceDialog = this.makeModal('edit_workspace', {model: this.model});
        this.onceLoaded(this.model.members(), function () {
            this.editWorkspaceDialog.launchModal();
        });
    },

    launchSandboxNewDialog: function(e) {
        e && e.preventDefault();
        var dialog = this.makeModal('new_sandbox', {pageModel: this.model, noReload: true});
        dialog.launchModal();
    },

    launchWorkspaceEditMembersDialog: function(e) {
        e && e.preventDefault();
        var dialog = this.makeModal('edit_members', {pageModel: this.model});
        dialog.launchModal();
    },

    launchImportWorkfilesDialog: function(e) {
        e && e.preventDefault();
        var dialog = this.makeModal('import_workfile', {pageModel: this.model});
        dialog.launchModal();
    }
});
