describe("chorus.models.DynamicDataSource", function() {
    it("should return a gpdb data source when the entity_type is gpdb_data_source", function() {
        var model = new chorus.models.DynamicDataSource({entityType: "gpdb_data_source"});
        expect(model).toBeA(chorus.models.GpdbDataSource);
    });

    it("should return a hadoop data source when the entity_type is hdfs_data_source", function() {
        var model = new chorus.models.DynamicDataSource({entityType: "hdfs_data_source"});
        expect(model).toBeA(chorus.models.HdfsDataSource);
    });

    it("should return a gnip data source when the entity_type is gnip_data_source", function() {
        var model = new chorus.models.DynamicDataSource({entityType: "gnip_data_source"});
        expect(model).toBeA(chorus.models.GnipDataSource);
    });

    it("should return an oracle data source when the entity_type is oracle_data_source", function() {
        var model = new chorus.models.DynamicDataSource({entityType: "oracle_data_source"});
        expect(model).toBeA(chorus.models.OracleDataSource);
    });

    it("should return a jdbc data source when the entity_type is jdbc_data_source", function() {
        var model = new chorus.models.DynamicDataSource({entityType: "jdbc_data_source"});
        expect(model).toBeA(chorus.models.JdbcDataSource);
    });

    it("should return a pg data source when the entity_type is pg_data_source", function() {
        var model = new chorus.models.DynamicDataSource({entityType: "pg_data_source"});
        expect(model).toBeA(chorus.models.PgDataSource);
    });
});
