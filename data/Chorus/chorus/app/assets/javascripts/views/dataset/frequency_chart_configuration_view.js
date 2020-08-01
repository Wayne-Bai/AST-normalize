chorus.views.FrequencyChartConfiguration = chorus.views.ChartConfiguration.extend({
    constructorName: "FrequencyChartConfiguration",
    templateName: "chart_configuration",
    additionalClass: "frequency",

    columnGroups: [
        {
            type: "all",
            name: "category",
            options: true
        }
    ],

    chartOptions: function() {
        return {
            type: "frequency",
            name: this.model.get("objectName"),
            yAxis: this.$(".category select option:selected").text(),
            bins: this.$(".limiter .selected_value").text()
        };
    }
});