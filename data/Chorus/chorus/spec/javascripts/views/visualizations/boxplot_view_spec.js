describe("chorus.views.visualizations.BoxPlot", function() {
    var leftX = chorus.svgHelpers.leftX,
        rightX = chorus.svgHelpers.rightX,
        width = chorus.svgHelpers.width,
        centerX = chorus.svgHelpers.centerX,
        topY = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY;

    beforeEach(function() {
        this.task = backboneFixtures.boxplotTask({
            rows: [
                { bucket: 'aardvark', min: 1, firstQuartile: 1, median: 2.5, thirdQuartile: 3, max: 4, percentage: "25%" },
                { bucket: 'beluga', min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400, percentage: "33.3%" },
                { bucket: 'chupacabra', min: 10, firstQuartile: 10, median: 25, thirdQuartile: 30, max: 40, percentage: "81.5%" }
            ],
            xAxis: "foo",
            yAxis: "bar"
        });

        this.view = new chorus.views.visualizations.Boxplot({ model: this.task });
    });

    describe("#render", function() {
        beforeEach(function() {
            $("#jasmine_content").append(this.view.el);
            this.view.render();

            this.boxes = this.view.$("g.box");
            this.quartileRectangles = this.boxes.find(".quartile");
            this.medianLines = this.boxes.find("line.median");
            this.minWhiskers = this.boxes.find("line.whisker.min");
            this.maxWhiskers = this.boxes.find("line.whisker.max");
            this.whiskers = this.boxes.find("line.whisker");
            this.midlines = this.boxes.find("line.midline");
            window.addCompatibilityShimmedMatchers(chorus.svgHelpers.matchers);
        });

        describe("re-rendering", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("does not create multiple charts", function() {
                expect(this.view.$("svg.chart").length).toBe(1);
            });
        });

        it("has the correct axis labels", function() {
            expect(this.view.$('.xaxis .axis_label').text()).toBe("foo");
            expect(this.view.$('.yaxis .axis_label').text()).toBe("bar");
        });

        it("has the Y grid lines", function() {
            expect(this.view.$('.yaxis line.grid').length).toBeGreaterThan(0);
            expect(this.view.$('.xaxis line.grid').length).toBe(0);
        });

        it("combines bucket names with percentages and ellipsizes", function() {
            var xlabels = this.view.$(".xaxis .label text");
            expect(xlabels[0].textContent).toBe("chupa… (81%)");
            expect(xlabels[1].textContent).toBe("beluga (33%)");
            expect(xlabels[2].textContent).toBe("aardv… (25%)");
        });

        describe("the quartile rectangles", function() {
            it("has one for each bucket", function() {
                expect(this.quartileRectangles.length).toBe(3);
            });

            it("draws them in order from left to right", function() {
                expect(this.quartileRectangles).toBeOrderedLeftToRight();
            });

            it("draws them with equal width", function() {
                var standardWidth = width(this.quartileRectangles[0]);
                _.each(this.quartileRectangles, function(rect) {
                    expect(width(rect)).toEqual(standardWidth);
                });
            });

            it("draws them with some padding in between", function() {
                _.each(this.quartileRectangles, function(rect, i) {
                    if(i === 0) return;
                    expect(leftX(rect)).toBeGreaterThan(rightX(this.quartileRectangles[i - 1]) + 5);
                }, this);
            });

            it("centers the rectangles on the x axis ticks", function() {
                var xTicks = this.view.$(".xaxis .tick");
                _.each(this.quartileRectangles, function(rect, i) {
                    expect(centerX(rect)).toBeCloseTo(centerX(xTicks[i]), 1);
                }, this);
            });
        });

        describe("the median lines", function() {
            it("draws one for each bucket", function() {
                expect(this.medianLines.length).toBe(3);
            });

            it("draws it inside the rectangle", function() {
                _.each(this.medianLines, function(line, i) {
                    var rect = this.quartileRectangles[i];

                    expect(line).toBeHorizontal();

                    expect(leftX(line)).toBeCloseTo(leftX(rect), 1);
                    expect(rightX(line)).toBeCloseTo(rightX(rect), 1);

                    expect(topY(line)).toBeGreaterThan(topY(rect));
                    expect(bottomY(line)).toBeLessThan(bottomY(rect));
                }, this);
            });
        });

        describe("the x positions when the ellipsized names are all the same", function() {
            beforeEach(function() {
                this.task = backboneFixtures.boxplotTask({
                    rows: [
                        { bucket: 'thelongname_aardvark', min: 1, firstQuartile: 1, median: 2.5, thirdQuartile: 3, max: 4, percentage: "25%" },
                        { bucket: 'thelongname_beluga', min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400, percentage: "25%" },
                        { bucket: 'thelongname_chupacabra', min: 10, firstQuartile: 10, median: 25, thirdQuartile: 30, max: 40, percentage: "25%" }
                    ],
                    xAxis: "foo",
                    yAxis: "bar"
                });

                this.view = new chorus.views.visualizations.Boxplot({ model: this.task });
                $("#jasmine_content").append(this.view.el);
                this.view.render();
            });

            it("has different x positions for each bucket", function() {
                var aardvark = this.view.$("g.box line.midline").eq(0);
                var beluga = this.view.$("g.box line.midline").eq(1);
                var chupacabra = this.view.$("g.box line.midline").eq(2);

                expect(aardvark.attr("x1")).not.toEqual(beluga.attr("x1"));
                expect(aardvark.attr("x1")).not.toEqual(chupacabra.attr("x1"));
                expect(beluga.attr("x1")).not.toEqual(chupacabra.attr("x1"));
            });

            it("has different x positions for each tick label", function() {
                var aardvark = this.view.$("g.label text").eq(0);
                var beluga = this.view.$("g.label text").eq(1);
                var chupacabra = this.view.$("g.label text").eq(2);

                expect(aardvark.attr("x")).not.toEqual(beluga.attr("x"));
                expect(aardvark.attr("x")).not.toEqual(chupacabra.attr("x"));
                expect(beluga.attr("x")).not.toEqual(chupacabra.attr("x"));
            });
        });

        describe("the whiskers", function() {
            it("draws a minimum and a maximum whisker for each bucket", function() {
                expect(this.maxWhiskers.length).toBe(3);
                expect(this.minWhiskers.length).toBe(3);
                expect(this.whiskers.length).toBe(6);
            });

            it("aligns them horizontally with the boxes", function() {
                _.each(this.minWhiskers, function(whisker, i) {
                    expect(centerX(whisker)).toBeCloseTo(centerX(this.quartileRectangles[i]), 1);
                }, this);

                _.each(this.maxWhiskers, function(whisker, i) {
                    expect(centerX(whisker)).toBeCloseTo(centerX(this.quartileRectangles[i]), 1);
                }, this);
            });

            it("draws them horizontally", function() {
                _.each(this.whiskers, function(whisker, i) {
                    expect(whisker).toBeHorizontal();
                }, this);
            });

            it("draws them narrower than the boxes", function() {
                var boxWidth = width(this.quartileRectangles[0]);
                _.each(this.minWhiskers, function(whisker, i) {
                    expect(width(whisker)).toBeLessThan(boxWidth);
                }, this);
            });
        });

        describe("the midlines", function() {
            it("draws one for each bucket", function() {
                expect(this.midlines.length).toBe(3);
            });

            it("draws them vertically", function() {
                _.each(this.midlines, function(line) {
                    expect(line).toBeVertical();
                });
            });

            it("draws them at the center of the boxes", function() {
                _.each(this.midlines, function(line, i) {
                    expect(centerX(line)).toBeCloseTo(centerX(this.quartileRectangles[i]), 1);
                }, this);
            });

            it("draws them from the minimum whisker up to the maximum whisker", function() {
                _.each(this.midlines, function(line, i) {
                    expect(topY(line)).toEqual(topY(this.maxWhiskers[i]));
                    expect(bottomY(line)).toEqual(bottomY(this.minWhiskers[i]));
                }, this);
            });
        });

        it("renders no xtick lines by default", function() {
            expect(this.view.$(".xaxis line.grid").length).toBe(0);
        });

        it("renders ytick lines by default", function() {
            expect(this.view.$(".yaxis line.grid").length).toBeGreaterThan(1);
        });
    });
});

