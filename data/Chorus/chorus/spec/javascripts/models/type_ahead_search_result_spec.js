describe("chorus.models.TypeAheadSearchResult", function() {
    beforeEach(function() {
        this.result = backboneFixtures.typeAheadSearchResult();
    });

    describe("fixtures", function() {
        it('gives us what we expect', function() {
            var entityTypes = _.pluck(this.result.results(), 'entityType');
            var expectedEntityTypes = [
                'attachment',
                'hdfs_file',
                'workspace',
                'gpdb_data_source',
                'hdfs_data_source',
                'gnip_data_source',
                'oracle_data_source',
                'jdbc_data_source',
                'pg_data_source',
                'user',
                'workfile',
                'dataset',
                'tag'
            ].sort();
            expect(_.uniq(entityTypes).sort()).toEqual(expectedEntityTypes.sort());
        });
    });

    describe("when no fetch has been made", function() {
        beforeEach(function() {
            this.result = new chorus.models.TypeAheadSearchResult();
        });

        it("results are an empty array", function() {
            expect(this.result.results()).toEqual([]);
        });
    });

    describe("results", function() {
        beforeEach(function() {
            this.searchResults = this.result.results();
        });

        it("returns objects of the appropriate type, excluding artifacts", function() {
            var expectToContainClass = function(list, entityClass) {
                expect(_.find(list, function(element) {
                    return element instanceof entityClass;
                })).toBeTruthy();
            };
            expectToContainClass(this.searchResults, chorus.models.HdfsEntry);
            expectToContainClass(this.searchResults, chorus.models.Workspace);
            expectToContainClass(this.searchResults, chorus.models.GpdbDataSource);
            expectToContainClass(this.searchResults, chorus.models.HdfsDataSource);
            expectToContainClass(this.searchResults, chorus.models.GnipDataSource);
            expectToContainClass(this.searchResults, chorus.models.OracleDataSource);
            expectToContainClass(this.searchResults, chorus.models.JdbcDataSource);
            expectToContainClass(this.searchResults, chorus.models.PgDataSource);
            expectToContainClass(this.searchResults, chorus.models.User);
            expectToContainClass(this.searchResults, chorus.models.Workfile);
        });

        it("expects all result objects to have a name and downloadUrl/showUrl method", function() {
            _.each(this.searchResults, function(result) {
                expect(result.name()).toBeA('string');

                var type = result && result.attributes.entityType;
                if(type === "attachment") {
                    expect(typeof result.downloadUrl()).toBe('string');
                } else {
                    expect(typeof result.showUrl()).toBe('string');
                }
            });
        });
    });

    describe("isPaginated", function() {
        it("should be true", function() {
            expect(this.result.isPaginated()).toBeTruthy();
        });
    });

    describe("url", function() {
        it("should have 3 results per_page", function() {
            expect(this.result.url()).toMatch("per_page=3(&|$)");
        });
    });
});
