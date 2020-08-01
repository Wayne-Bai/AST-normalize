chorus.dialogs.EditProjectStatus = chorus.dialogs.Base.include(chorus.Mixins.DialogFormHelpers).extend({
    constructorName: "ProjectStatus",
    templateName: "edit_project_status",
    title: "Edit Project Status",

    statuses: ['on_track', 'needs_attention', 'at_risk'],

    events: {
        "submit form": "updateStatus",
        "click .submit": "updateStatus"
    },

    setup: function () {
        this.listenTo(this.resource, "saved", this.statusSaved);
        this.listenTo(this.resource, "saveFailed", this.saveFailed);
        $(document).one('reveal.facebox', _.bind(this.setupSelects, this));

        this.disableFormUnlessValid({
            formSelector: "form",
            inputSelector: "input",
            checkInput: _.bind(this.checkInput, this)
        });
    },

    postRender: function () {
        this.toggleSubmitDisabled();
    },

    checkInput: function () {
        return this.$('input[name=reason]').val().length > 0;
    },

    setupSelects: function () {
        chorus.styleSelect(this.$("select[name='projectStatus']"));
    },

    updateStatus: function (e) {
        e && e.preventDefault();

        this.$("button.submit").startLoading("actions.creating");
        this.resource.save({
            projectStatus: this.$("select[name='projectStatus']").val(),
            projectStatusReason: this.$("input[name='reason']").val()
        }, {wait: true});
    },

    statusSaved: function () {
        this.closeModal();
        var niceStatusKey = "workspace.project.status." + this.model.get("projectStatus");
        chorus.toast("workspace.update_status.success.toast", {status: t(niceStatusKey), toastOpts: {type: "success"}});
    },

    additionalContext: function () {
        return {
            options: _.map(this.statuses, function(key) {
                return {
                    value: key,
                    nameKey: 'workspace.project.status.' + key,
                    selected: this.model.get('projectStatus') === key
                };
            }, this)
        };
    }
});
