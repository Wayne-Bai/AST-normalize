describe("chorus.views.visualizations.Histogram", function() {
    beforeEach(function() {
        this.task = new chorus.models.HistogramTask({
            columns: [
                {name : "bin", typeCategory: "STRING"},
                {name : "frequency", typeCategory: "WHOLE_NUMBER"}
            ],

            rows: [
                { bin: [0, 9], frequency: 5 },
                { bin: [10, 19], frequency: 8 },
                { bin: [20, 29], frequency: 0 },
                { bin: [30, 39], frequency: 1 },
                { bin: [40, 49], frequency: 2000 }
            ],
            "chart[xAxis]": "I am the x axis",
            dataset: backboneFixtures.workspaceDataset.datasetTable({objectName: "users"})
        });

        this.view = new chorus.views.visualizations.Histogram({
            model: this.task
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            $("#jasmine_content").append(this.view.el);
            this.view.render();
        });

        describe("re-rendering", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("does not create multiple charts", function() {
                expect(this.view.$("svg.chart").length).toBe(1);
            });
        });

        it("has one bar for each bin", function() {
            expect(this.view.$(".bar").length).toBe(5);
        });

        it ("labels the x axis", function(){
            expect(this.view.$(".xaxis .axis_label").text()).toBe("I am the x axis");
        });

        it ("labels the y axis", function(){
            expect(this.view.$(".yaxis .axis_label").text()).toBe("count");
        });

        it("has correct heights on the bars", function() {
            var $bars = this.view.$("g.plot").find("rect");
            var heights = _.map($bars, function(bar){return $(bar).attr("height");});
            var sorted_heights = heights.slice(0).sort();
            expect(sorted_heights).toEqual([heights[2], heights[3], heights[0], heights[1], heights[4]]);
        });

        it("has equal widths on the bars", function() {
            var $bars = this.view.$("g.plot").find("rect");
            var widths = _.map($bars, function(bar) {return $(bar).attr("width");});
            widths.sort();
            expect(widths[0]).toEqual(widths[widths.length-1]);
        });

        it("starts the bars on/near the x axis", function() {
            var $bars = this.view.$("g.bar").find("rect");
            var bottomY = parseFloat($(this.view.$("line.xaxis")).attr("y1"));
            _.each($bars, function(bar) {
                expect(parseFloat($(bar).attr("y"))+parseFloat($(bar).attr("height"))).toBeCloseTo(bottomY);
            });
        });

        it("draws the grid lines after the rectangles", function() {
            var gridRect = this.view.$(".plot rect, line.grid");
            expect($(gridRect[0]).attr("class")).toBe("bar");
            expect($(gridRect[gridRect.length-1]).attr("class")).toBe("grid");
        });
    });
});

