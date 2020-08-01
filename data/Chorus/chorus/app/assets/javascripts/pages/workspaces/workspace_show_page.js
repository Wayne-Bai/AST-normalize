chorus.pages.WorkspaceShowPage = chorus.pages.Base.extend({
    helpId: "workspace_summary",

    setup: function(workspaceId) {
        this.listenTo(this.model, "loaded", this.decideIfQuickstart);
        this.subNav = new chorus.views.SubNav({workspace: this.model, tab: "summary"});
        this.sidebar = new chorus.views.WorkspaceShowSidebar({model: this.model});

        this.mainContent = new chorus.views.MainContentView({
            model: this.model,
            content: new chorus.views.WorkspaceShow({model: this.model }),
            contentHeader: new chorus.views.WorkspaceSummaryContentHeader({model: this.model})
        });

        this.listenTo(this.model, 'saved', this.render);
    },

    preRender: function () {
        this.primaryActionPanel = new chorus.views.PrimaryActionPanel({pageModel: this.model, actions: this.primaryActions()});
    },

    primaryActions: function () {
        var canKaggle   = !!chorus.models.Config.instance().get("kaggleConfigured"); // && this.model.canUpdate()
        var active      = !!this.model.isActive();
        var admin       = !!this.model.workspaceAdmin();
        var sandbox     = !!this.model.sandbox();

        var actions = [
            {name: 'workspace_settings', target: chorus.dialogs.EditWorkspace}
        ];

        var memberActions = [
            {name: 'add_insight', target: chorus.dialogs.InsightsNew},
            {name: 'add_note', target: chorus.dialogs.NotesNew}
        ];

        var addSandbox      = {name: 'create_a_sandbox', target: chorus.dialogs.SandboxNew};
        var deleteWorkspace = {name: 'delete_workspace', target: chorus.alerts.WorkspaceDelete};
        var editMembers     = {name: 'edit_workspace_members', target: chorus.dialogs.WorkspaceEditMembers};
        var kaggle          = {name: 'find_kaggle_contributors', target: this.model.showUrl() + "/kaggle"};


        active && _.each(memberActions, function (action) { actions.push(action); });

        sandbox || (active && !this.sidebar.additionalContext().limitSandboxes && actions.push(addSandbox));

        active && admin &&      actions.push(editMembers);
        admin &&                actions.push(deleteWorkspace);
        canKaggle &&            actions.push(kaggle);

        return actions;
    },

    makeModel: function(workspaceId) {
        this.loadWorkspace(workspaceId, {required: true});
        this.model = this.workspace;
    },

    decideIfQuickstart: function() {
        if (this.model.owner().get("id") === chorus.session.user().id) {
            if (!this.quickstartNavigated && (
                this.model.get("hasAddedMember") === false ||
                this.model.get("hasAddedWorkfile") === false ||
                this.model.get("hasAddedSandbox") === false ||
                this.model.get("hasChangedSettings") === false)) {

                chorus.router.navigate("/workspaces/" + this.workspaceId + "/quickstart");
                return;
            }
        }
    }
});
