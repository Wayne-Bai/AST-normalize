describe("chorus.models.ChartTask", function() {
    beforeEach(function() {
        this.dataset = backboneFixtures.workspaceDataset.datasetTable({ id: 5, schema: {name: 'animals'}, objectName: 'dog_breeds'});
        var chartSubclass = chorus.models.ChartTask.extend({});
        chartSubclass.prototype.chartType = "fantastic";
        this.model = new chartSubclass({ dataset: this.dataset });
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/datasets/5/visualizations");
        expect(this.model.url({ method: "delete" })).toBe("/datasets/5/visualizations/" + this.model.get("checkId"));
    });

    it("has the right name", function() {
        expect(this.model.name()).toMatchTranslation("dataset.visualization.data.filename");
    });

    it("sets the 'chart[type]' attribute based on the prototype's 'chartType' property", function() {
        expect(this.model.get("type")).toBe("fantastic");
    });

    it("sets datasetId", function() {
        expect(this.model.get("datasetId")).toBe(this.dataset.get("id"));
    });

    it("mixes in SQLResults", function() {
        expect(this.model.hasResults).toBeDefined();
    });

    describe("getRows", function() {
        beforeEach(function() {
            this.model = backboneFixtures.boxplotTask();
        });

        it("includes unique and original names", function() {
            var rows = this.model.getRows();
            var columns = this.model.getColumns();
            expect(columns.length).toBeGreaterThan(0);

            var originalColumnNames = _.pluck(columns, "name");
            var uniqueColumnNames = _.pluck(columns, "uniqueName");
            expect(_.intersection(_.keys(rows[0]), originalColumnNames).sort()).toEqual(originalColumnNames.sort());
            expect(_.intersection(_.keys(rows[0]), uniqueColumnNames).sort()).toEqual(uniqueColumnNames.sort());
        });
    });
});
