describe("chorus.collections.SchemaDatasetSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.SchemaDatasetSet([], {
            schemaId: 987
        });
    });

    it("includes the DataSourceCredentials mixin", function() {
        expect(this.collection.dataSourceRequiringCredentials).toBe(chorus.Mixins.DataSourceCredentials.model.dataSourceRequiringCredentials);
    });

    it("extends chorus.collections.LastFetchWins", function() {
        expect(this.collection).toBeA(chorus.collections.LastFetchWins);
    });

    describe("#url", function() {
        it("is correct", function() {
            var url = this.collection.url({ per_page: 10, page: 1});
            expect(url).toContainQueryParams({ per_page: 10, page: 1 });
            expect(url).toHaveUrlPath("/schemas/987/datasets");
        });

        it('filters by type', function() {
            this.collection.attributes.tablesOnly = 'true';
            expect(this.collection.url()).toContainQueryParams({tablesOnly: 'true'});
        });

        it("filters by name", function() {
            this.collection.attributes.filter = "foo";
            var url = this.collection.url({per_page: 10, page: 1});
            expect(url).toHaveUrlPath("/schemas/987/datasets");
            expect(url).toContainQueryParams({ per_page: 10, page: 1, filter: "foo" });
        });
    });

    describe("#search", function() {
        it("triggers an API query for the given term", function() {
            this.collection.search("search term");
            expect(this.server.lastFetch().url).toMatchUrl(
                "/schemas/987/datasets?filter=search+term",
                {paramsToIgnore: ["entity_type", "page", "per_page"]}
            );
        });

        it("triggers 'searched' when API query returns", function() {
            var eventListener = jasmine.createSpy();
            this.collection.bind('searched', eventListener);
            this.collection.search("search term");
            this.server.completeFetchFor(this.collection, []);
            expect(eventListener).toHaveBeenCalled();
        });
    });

});