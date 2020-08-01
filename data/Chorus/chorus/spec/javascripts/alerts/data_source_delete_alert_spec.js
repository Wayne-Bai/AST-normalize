describe("chorus.alerts.DataSourceDelete", function() {
    beforeEach(function() {
        this.dataSource = backboneFixtures.gpdbDataSource();
        this.alert = new chorus.alerts.DataSourceDelete({ model: this.dataSource });
    });

    describe("successful deletion", function() {
        beforeEach(function() {
            spyOn(chorus, "toast");
            this.alert.model.trigger("destroy", this.alert.model);
        });

        it("displays a toast message", function() {
            expect(chorus.toast).toHaveBeenCalledWith("data_sources.delete.toast", {dataSourceName: this.dataSource.name(), toastOpts: {type: "deletion"}});
        });
    });

    describe("for a hdfs data source", function() {
        beforeEach(function() {
            this.alert.model = backboneFixtures.hdfsDataSource();
            this.alert.render();
        });

        it("has the correct title", function() {
            expect(this.alert.$el).toContainTranslation("data_sources.delete.title", {datasourceName: this.dataSource.name()});
        });

        it("has the correct text", function() {
            expect(this.alert.additionalContext().text).toMatchTranslation('data_sources.delete.text.hdfs_data_source');
        });
    });

    describe("for a greenplum data source", function() {
        beforeEach(function() {
            this.alert.model = backboneFixtures.gpdbDataSource();
            this.alert.render();
        });

        it("has the correct title", function() {
            expect(this.alert.$el).toContainTranslation("data_sources.delete.title", {datasourceName: this.dataSource.name()});
        });

        it("has the correct text", function() {
            expect(this.alert.additionalContext().text).toMatchTranslation('data_sources.delete.text.gpdb_data_source');
        });
    });

    describe("for an oracle data source", function() {
        beforeEach(function() {
            this.alert.model = backboneFixtures.oracleDataSource();
            this.alert.render();
        });

        it("has the correct title", function() {
            expect(this.alert.$el).toContainTranslation("data_sources.delete.title", {datasourceName: this.dataSource.name()});
        });

        it("has the correct text", function() {
            expect(this.alert.additionalContext().text).toMatchTranslation('data_sources.delete.text.oracle_data_source');
        });
    });

    describe("for a jdbc data source", function() {
        beforeEach(function() {
            this.alert.model = backboneFixtures.jdbcDataSource();
            this.alert.render();
        });

        it("has the correct title", function() {
            expect(this.alert.$el).toContainTranslation("data_sources.delete.title", {datasourceName: this.dataSource.name()});
        });

        it("has the correct text", function() {
            expect(this.alert.additionalContext().text).toMatchTranslation('data_sources.delete.text.jdbc_data_source');
        });
    });
});
