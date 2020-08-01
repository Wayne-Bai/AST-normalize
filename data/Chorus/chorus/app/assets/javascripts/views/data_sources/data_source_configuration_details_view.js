chorus.views.DataSourceConfigurationDetails = chorus.views.Base.extend({
    templateName: "data_source_configuration_details",

    additionalContext: function() {
        var shared = this.model.isShared && this.model.isShared();
        return {
            sharedAccountDetails: shared && this.model.sharedAccountDetails(),
            version: this.model.version(),
            shared: shared,
            ownerName: this.model.owner().displayName(),
            isHadoop: this.model.isHadoop()
        };
    }
});
