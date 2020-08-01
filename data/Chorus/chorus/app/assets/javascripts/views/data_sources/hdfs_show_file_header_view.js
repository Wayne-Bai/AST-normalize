chorus.views.HdfsShowFileHeader = chorus.views.Base.extend({
    constructorName: "HdfsShowFileHeaderView",
    templateName: "hdfs_show_file_header",
    additionalClass: "taggable_header",

    subviews: {
        '.tag_box': 'tagBox'
    },

    setup: function() {
        this.tagBox = new chorus.views.TagBox({
            model: this.model
        });
    },

    additionalContext: function() {
        return {
            iconUrl: this.model.iconUrl(),
            fileName: this.model.get("name")
        };
    }
});
