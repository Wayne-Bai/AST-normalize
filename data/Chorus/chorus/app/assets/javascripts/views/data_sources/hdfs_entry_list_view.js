//= require views/layout/page_item_list_view

chorus.views.HdfsEntryList = chorus.views.PageItemList.extend({
    eventName: "hdfs_entry",
    constructorName: "HdfsEntryList",
    useLoadingSection: true,

    setup: function() {
        this.options.entityType = "hdfs_entry";
        this.options.entityViewType = chorus.views.HdfsEntryItem;
        this._super("setup", arguments);
    },

    selectableModels: function() {
        var directories = function(entry) { return entry.get('isDir'); };

        return this.collection.reject(directories);
    }
});
