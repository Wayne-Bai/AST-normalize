chorus.views.HdfsEntryStatistics = chorus.views.Base.extend({
    constructorName: 'HdfsEntryStatisticsView',
    templateName: 'hdfs_entry_statistics_view',
    keys: [
        'owner',
        'group',
        'modifiedAt',
        'accessedAt',
        'fileSize',
        'blockSize',
        'permissions',
        'replication'
    ],
    bytesKeys: ['fileSize', 'blockSize'],

    setup: function() {
        this.statistics = this.model.statistics();
        this.statistics.fetchIfNotLoaded();
        this.listenTo(this.statistics, "loaded", this.render);
        this.listenTo(this.model, "invalidated", function() { this.statistics.fetch(); });
    },

    displayValue: function (key) {
        if (_.include(this.bytesKeys, key)) {
            return I18n.toHumanSize(this.statistics.get(key));
        }
        return this.statistics.get(key);
    },

    additionalContext: function () {

        return {
            keys: _.map(this.keys, function(key) {
                return {
                    snake: _.underscored(key),
                    value: this.displayValue(key),
                    translation: 'hdfs_entry.statistics.' + _.underscored(key)
                };
            }, this)
        };
    }
});