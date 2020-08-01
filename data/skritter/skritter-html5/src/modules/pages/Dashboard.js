/**
 * @module Application
 * @submodule Pages
 */
define([
    'require.text!templates/dashboard.html',
    'core/modules/GelatoPage',
    'modules/components/TableViewer'
], function(Template, GelatoPage, TableViewer) {

    /**
     * @class PageDashboard
     * @extends GelatoPage
     */
    var PageDashboard = GelatoPage.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.donutDailyGoal = null;
            this.donutListQueue = null;
            this.heatmap = new CalHeatMap();
            this.lists = [];
            this.tableLists = new TableViewer();
            this.listenTo(app.user.data.items, 'download:complete', $.proxy(this.updateDownloadProgress, this));
            this.listenTo(app.user.data.items, 'download:update', $.proxy(this.updateDownloadProgress, this));
        },
        /**
         * @property title
         * @type String
         */
        title: app.strings.dashboard.title + ' - ' + app.strings.global.title,
        /**
         * @method render
         * @returns {PageDashboard}
         */
        render: function() {
            this.renderTemplate(Template);
            this.tableLists.setElement(this.$('.progress-table-container')).render();
            this.renderDialog();
            this.renderDonuts();
            this.renderFields();
            this.renderHeatmap();

            this.load();
            return this;
        },
        /**
         * @method renderDonuts
         * @returns {PageDashboard}
         */
        renderDonuts: function() {
            var contextDailyGoal = this.$('.daily-goal-donut-container').get(0).getContext('2d');
            var contextListQueue = this.$('.list-queue-donut-container').get(0).getContext('2d');
            this.donutDailyGoal = new Chart(contextDailyGoal).Doughnut([
                {value: 80, color:'#c5da4b'},
                {value: 20, color:'#efeef3'}
            ], {
                animateRotate: false,
                percentageInnerCutout : 80
            });
            this.donutListQueue = new Chart(contextListQueue).Doughnut([
                {value: 40, color:'#c5da4b'},
                {value: 60, color:'#efeef3'}
            ], {
                animateRotate: false,
                percentageInnerCutout : 80
            });
            return this;
        },
        /**
         * @method renderFields
         * @returns {PageDashboard}
         */
        renderFields: function() {
            if (app.user.data.items.hasMissing()) {
                this.$('#download-progress').show();
            } else {
                this.$('#download-progress').hide();
            }
            return this;
        },
        /**
         * @method renderHeatmap
         * @returns {PageDashboard}
         */
        renderHeatmap: function() {
            this.heatmap.init({
                cellSize: 25,
                cellPadding: 5,
                domain: 'month',
                domainDynamicDimension: false,
                domainGutter: 20,
                itemSelector: '.heatmap-container',
                legend: [1, 50, 100, 200],
                range: 1,
                start: new Date(2015, new Date().getMonth(), 1),
                subDomain: 'x_day',
                subDomainTextFormat: '%d'
            });
            return this;
        },
        /**
         * @method renderTables
         * @returns {PageDashboard}
         */
        renderTables: function() {
            this.tableLists.set(this.lists, {
                name: {title: '', type: 'row'},
                progress: {title: '', type: 'progress'},
                studyingMode: {title: '', type: 'row'},
                addToQueue: {title: '', type: 'text', value: "<i class='fa fa-close'></i>"}
            }, {showHeaders: false}).sortBy('name');
            return this;
        },
        /**
         * @property events
         * @type Object
         */
        events: {
            'vclick #confirm-logout': 'handleClickConfirmLogout'
        },
        /**
         * @method handleClickConfirmLogout
         * @param {Event} event
         */
        handleClickConfirmLogout: function(event) {
            event.preventDefault();
            app.user.logout();
        },
        /**
         * @method load
         * @returns {PageDashboard}
         */
        load: function() {
            var self = this;
            var date = new Date();
            var baseDateString = Moment().format('YYYY-MM-');
            this.$('#download-progress').hide();
            Async.waterfall([
                function(callback) {
                    app.api.fetchVocabLists({sort: 'studying'}, function(result) {
                        self.lists = result.VocabLists || [];
                        self.renderTables();
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                },
                function(callback) {
                    app.api.fetchStats(null, function(result) {
                        self.$('.characters-learned-count').text(result[0].char.rune.learned.all);
                        self.$('.words-learned-count').text(result[0].word.rune.learned.all);
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                },
                function(callback) {
                    app.api.fetchStats({
                        start: baseDateString + '01',
                        end: baseDateString + '12'
                    }, function(result) {
                        callback(null, result);
                    }, function(error) {
                        callback(error);
                    });
                },
                function(stats, callback) {
                    app.api.fetchStats({
                        start: baseDateString + '13',
                        end: baseDateString + '25'
                    }, function(result) {
                        callback(null, stats.concat(result));
                    }, function(error) {
                        callback(error);
                    });
                },
                function(stats, callback) {
                    app.api.fetchStats({
                        start: baseDateString + '26',
                        end: baseDateString + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
                    }, function(result) {
                        callback(null, stats.concat(result));
                    }, function(error) {
                        callback(error);
                    });
                },
                function(stats, callback) {
                    var data = {};
                    for (var i = 0, length = stats.length; i < length; i++) {
                        data[Moment(stats[i].date).unix()] = stats[i].char.rune.studied.day;
                    }
                    callback(null, data);
                }
            ], function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    self.heatmap.update(data);
                }
            });
        },
        /**
         * @method updateDownloadProgress
         * @param {Number} status
         */
        updateDownloadProgress: function(status) {
            this.$('#download-progress .progress-bar').attr('aria-valuenow', status);
            this.$('#download-progress .progress-bar').css('width', status + '%');
            this.$('#download-progress .progress-bar .sr-only').text(status + '% Complete');
            this.$('#download-progress .progress-status').text(status);
            if (status === 100) {
                this.$('#download-progress').fadeOut(1000);
            } else {
                this.$('#download-progress').show();
            }
        }
    });

    return PageDashboard;

});