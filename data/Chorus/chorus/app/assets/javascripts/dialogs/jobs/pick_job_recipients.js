chorus.dialogs.PickJobRecipients = chorus.dialogs.Base.extend({
    constructorName: "PickJobRecipients",
    templateName:"workspace_edit_members",
    title:t('job.dialog.edit.notify.recipients.title'),
    additionalClass: "dialog_wide",

    events:{
        "click button.submit" : "updateChosen"
    },

    makeModel:function () {
        this._super("makeModel", arguments);

        this.available = this.model.workspace().members();
        this.available.fetch();

        this.chosenIDs = this.model.get(this.options.condition + 'Recipients');
        this.chosen = new chorus.collections.UserSet([]);

        this.populateChosen();
        this.listenTo(this.available, "reset", this.populateChosen);
    },

    subviews:{
        ".shuttle":"shuttle"
    },

    setup:function () {
        this.shuttle = new chorus.views.ShuttleWidget({
            collection:this.available,
            selectionSource:this.chosen,
            objectName:t('job.dialog.edit.notify.recipients.'+this.options.condition)
        });
    },

    populateChosen: function () {
        this.chosen.reset(this.available.filter(function (model) {
            return _.include(this.chosenIDs, model.get('id'));
        }, this));
        this.render();
    },
    
    updateChosen:function () {
        var ids = _.map(this.shuttle.getSelectedIDs(), function (stringID) {
            return parseInt(stringID, 10);
        });
        this.model.set(this.options.condition + 'Recipients', ids);
        this.closeModal();
    }
});
