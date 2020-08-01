chorus.dialogs.WorkfileNewVersion = chorus.dialogs.Base.extend({
    constructorName: "WorkfileNewVersion",

    templateName:"workfile_new_version",
    title:t("workfile.new_version_dialog.title"),

    persistent:true,

    events:{
        "submit form":"saveWorkfileNewVersion"
    },

    setup:function () {
        this.listenTo(this.model, "saved", this.saved);
    },

    makeModel:function () {
        this._super("makeModel", arguments);
        this.model = this.pageModel;
    },

    saveWorkfileNewVersion:function (e) {
        e.preventDefault();
        this.$("button.submit").startLoading("actions.saving");
        this.model.set({"commitMessage": _.escape(this.$("[name=commitMessage]").val())}, {silent:true});
        this.model.save({}, {newWorkfileVersion: true});
    },

    saved:function () {
        this.closeModal();
        this.pageModel.trigger("invalidated");
    }
});
