chorus.dialogs.HdfsDatasetAttributes = chorus.dialogs.Base.include(chorus.Mixins.DialogFormHelpers).extend({
    constructorName: 'HdfsDatasetAttributes',
    templateName: "hdfs_dataset_attributes",

    setup: function () {
        this.model = this.findModel();

        this.loadDataSources();

        this.disableFormUnlessValid({
            formSelector: "form",
            inputSelector: "input",
            checkInput: _.bind(this.checkInput, this)
        });

        this.events["change select"] = this.toggleSubmitDisabled;
        this.listenToModel();
    },

    listenToModel: function () {
        this.listenTo(this.model, "saved", this.modelSaved);
        this.listenTo(this.model, "saveFailed", this.saveFailed);
    },
    
    messageParams: $.noop,
     
    modelSaved: function () {

        // toast "success" style
        var toastOpts = {toastOpts: {type: "success"}};
        // construct the toast params
        var messageParams = (this.toastMessageParams() === undefined) ? {} : this.toastMessageParams();
        _.extend(messageParams, toastOpts);
        chorus.toast(this.toastMessage, messageParams);

        this.model.trigger('invalidated');
        this.closeModal();
    },

    getFields: function () {
        return {
            name: this.$("input.name").val(),
            dataSourceId: this.getDatasourceId(),
            datasetId: this.model.id,
            fileMask: this.$("input.file_mask").val()
        };
    },

    getDatasourceId: function () {
        return this.$(".data_source select").val();
    },

    checkInput: function () {
        return (this.$("input.name").val().trim().length > 0) &&
            (this.$("input.file_mask").val().trim().length > 0) &&
            this.checkDataSource();
    },

    create: function () {
        this.$("button.submit").startLoading('actions.saving');
        this.model.save(this.getFields(), {wait: true});
    },

    loadDataSources: $.noop,

    checkDataSource: function () {
        return true;
    },

    additionalContext: function () {
        return {
            needsDataSource: false,
            needsWorkspace: false,
            datasetPersisted: this.model.id
        };
    },

    findModel: function() { throw new Error('Not implemented on abstract parent'); }

});