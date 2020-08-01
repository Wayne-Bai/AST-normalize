describe("chorus.models.DataSourceUsage", function() {
    beforeEach(function() {
        this.usage = backboneFixtures.dataSourceDetails();
        this.usage.set({ dataSourceId: 123 });
        this.workspaces = this.usage.get('workspaces');
    });

    describe("workspaceCount", function() {
        it('returns the number of workspaces in which the data source is used', function() {
            this.usage.set({ workspaces: [{}, {}, {}] });
            expect(this.usage.workspaceCount()).toBe(3);
        });

        it("returns undefined when the model doesn't have a 'workspaces' attribute", function() {
            this.usage.unset("workspaces");
            expect(this.usage.workspaceCount()).toBeUndefined();
        });
    });

    it("fetches from the correct endpoint", function() {
        this.usage.fetch();
        var usageFetch = this.server.lastFetchFor(this.usage);
        expect(usageFetch.url).toContain('data_sources/123/workspace_detail');
    });
});
