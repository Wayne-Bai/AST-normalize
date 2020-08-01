chorus.views.JobShowContentHeader = chorus.views.Base.extend({
    constructorName: "JobShowContentHeader",
    templateName: "job_show_content_header",

    additionalContext: function () {
        return {
            frequency: this.model.frequency(),
            lastRunStatusKey: this.model.lastRunStatusKey(),
            lastRunLinkKey: this.model.lastRunLinkKey(),
            ownerName: this.model.owner().displayName(),
            ownerUrl: this.model.owner().showUrl()
        };
    }
});