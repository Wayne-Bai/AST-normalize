chorus.models.WorkFlowResult = chorus.models.Base.include(
    chorus.Mixins.Attachment
).extend({
    constructorName: "WorkFlowResult",

    initialize: function() {
        this.set('sessionId', chorus.session.get('sessionId'));
        this.set('name', this.name());
    },

    iconUrl: function() {
        return "/images/workfiles/icon/afm.png";
    },

    name: function() {
        return t("work_flow_result.attachment_name");
    },

    hasOwnPage: function() {
        return true;
    },

    showUrl: function() {
        return this.url();
    },

    useExternalLink: function() {
        return true;
    },

    urlTemplate: "alpinedatalabs/main/chorus.do?method=showResults&session_id={{sessionId}}&workfile_id={{workfileId}}&result_id={{id}}"
});