chorus.dialogs.WorkspaceNew = chorus.dialogs.Base.include(
        chorus.Mixins.DialogFormHelpers
    ).extend({
    constructorName: "WorkspaceNew",

    templateName: "workspace_new_dialog",
    title: t("workspace.create_new_title"),

    persistent:true,

    makeModel:function () {
        this.model = this.model || new chorus.models.Workspace();
    },

    setup:function () {
        this.listenTo(this.resource, "saved", this.workspaceSaved);
        this.listenTo(this.resource, "saveFailed", this.saveFailed);
        this.disableFormUnlessValid({formSelector: "form.new_workspace", inputSelector: "input[name='name']"});
    },

    create:function create(e) {
        e.preventDefault();

        this.resource.set({
            name: this.$("input[name=name]").val().trim(),
            "public": !!this.$("input[name=public]").prop('checked'),
            isProject: this.$('input[name=make_project]').prop('checked')
        });

        this.$("button.submit").startLoading("actions.creating");
        this.resource.save();
    },

    workspaceSaved:function () {
        this.closeModal();
        chorus.router.navigate("/workspaces/" + this.model.get("id") + "/quickstart");
    }
});
