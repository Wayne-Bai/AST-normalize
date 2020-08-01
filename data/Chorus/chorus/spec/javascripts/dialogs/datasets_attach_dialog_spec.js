describe("chorus.dialogs.DatasetsAttach", function() {
    var datasetModels;

    beforeEach(function() {
        datasetModels = [backboneFixtures.workspaceDataset.datasetTable(), backboneFixtures.workspaceDataset.datasetTable()];

        this.datasets = new chorus.collections.WorkspaceDatasetSet([], {workspaceId: "33"});

        this.dialog = new chorus.dialogs.DatasetsAttach({ workspaceId : "33" });
        this.dialog.render();
    });

    it("enables multi-selection", function() {
        expect(this.dialog.multiSelection).toBeTruthy();
    });

    it("fetches the results sorted by objectName ascending", function() {
        var url = this.server.lastFetch().url;
        expect(url).toHaveUrlPath("/workspaces/33/datasets");
        expect(url).toContainQueryParams({ order: "object_name"});
    });

    describe("when the fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.datasets, datasetModels, { order: "objectName" });
        });

        it("only fetches one page initially", function() {
            expect(this.server.requests.length).toBe(1);
        });

        it("shows the pagination controls", function() {
            expect(this.dialog.$("a.next")).not.toHaveClass("hidden");
        });

        it("has the correct submit button text", function() {
            expect(this.dialog.$('button.submit')).toContainTranslation("actions.dataset_attach");
        });

        it("has the correct iconUrl", function() {
            expect(this.dialog.$('li:eq(0) img')).toHaveAttr('src', datasetModels[0].iconUrl({size: 'icon'}));
        });

        it("has the correct name", function() {
            expect(this.dialog.$('li:eq(0) .name')).toContainText(datasetModels[0].get("objectName"));
        });

        it("has the correct search placeholder text", function() {
            expect(this.dialog.$("input").attr("placeholder")).toMatchTranslation("dataset.dialog.search");
        });
    });
});
