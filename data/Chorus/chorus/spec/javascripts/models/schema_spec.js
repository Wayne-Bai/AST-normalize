describe("chorus.models.Schema", function() {
    describe("#showUrl", function() {
        beforeEach(function() {
            this.model = backboneFixtures.schema({id: 1234, name: "b/a/r", database: {id: "42", dataSource: {id: 10000}}});
        });
        it("should encode the url", function() {
            expect(this.model.showUrl()).toContain("schemas/1234");
        });
    });

    context("from a sandbox", function() {
        beforeEach(function() {
            this.sandbox = backboneFixtures.workspace().sandbox();
            this.model = this.sandbox.schema();
        });

        describe("#datasets", function() {
            it("should return a DatabaseObjectSet", function() {
                expect(this.model.datasets()).toBeA(chorus.collections.SchemaDatasetSet);
            });

            it("should memoize the result", function() {
                expect(this.model.datasets()).toBe(this.model.datasets());
            });

            it("should pass its id", function() {
                var objects = this.model.datasets();
                expect(objects.attributes.schemaId).toBe(this.model.id);
            });
        });

        describe("functions", function() {
            it("should return a SchemaFunctionSet", function() {
                var functionSet = this.model.functions();
                expect(functionSet).toBeA(chorus.collections.SchemaFunctionSet);
            });

            it("should memoize the result", function() {
                expect(this.model.functions()).toBe(this.model.functions());
            });

            it("should pass the dataSourceId, databaseId, and schemaId", function() {
                expect(this.model.functions().attributes.id).toBe(this.model.get('id'));
            });
        });
    });

    describe("#canonicalName", function() {
        describe("when the schema is an oracle schema", function() {
            beforeEach(function() {
                this.model = backboneFixtures.oracleSchema({name: "schema", dataSource: {name: "dataSource"}});
            });

            it("should create the canonical name", function() {
                expect(this.model.canonicalName()).toBe("dataSource.schema");
            });
        });

        describe("when the schema is a gpdb schema", function() {
            beforeEach(function() {
                this.model = backboneFixtures.schema({name: "schema", database: {name: "database", dataSource: {name: "dataSource"}}});
            });

            it("should create the canonical name", function() {
                expect(this.model.canonicalName()).toBe("dataSource.database.schema");
            });
        });
    });

    describe("#isEqualToSchema", function() {
        beforeEach(function() {
            this.model = backboneFixtures.schema({ id: '3' });
        });

        it("checks that the ids of the schemas are equal", function() {
            var other = backboneFixtures.schema({ id: '3' });

            expect(this.model.isEqualToSchema(other)).toBeTruthy();

            other.set({ id: '5' });

            expect(this.model.isEqualToSchema(other)).toBeFalsy();
        });
    });

    describe("#database", function() {
        beforeEach(function() {
            this.model = backboneFixtures.schema({name: "schema", database: {name: "database", dataSource: {name: "dataSource"}}});
            this.database = this.model.database();
        });

        it("returns a database with the right id and dataSourceId", function() {
            expect(this.database).toBeA(chorus.models.Database);
            expect(this.database.get("id")).toBe(this.model.database().id);
            expect(this.database.dataSource().id).toBe(this.model.get("database").dataSource.id);
        });

        it("memoizes", function() {
            expect(this.model.database()).toBe(this.model.database());
        });

        describe("when no database attribute exists", function() {
            beforeEach(function() {
                this.model = backboneFixtures.oracleSchema();
            });

            it("returns undefined", function() {
                expect(this.model.database()).toBeUndefined();
            });
        });
    });

    describe("#dataSource", function() {
        context("for an oracle schema", function() {
            beforeEach(function() {
                this.model = backboneFixtures.oracleSchema({name: "schema", dataSource: {name: "dataSource", id: 45}});
                expect(this.model.get('database')).toBeUndefined();
            });

            it('returns the data source directly', function() {
                expect(this.model.dataSource().name()).toEqual('dataSource');
                expect(this.model.dataSource().id).toEqual(45);
            });

            it("memoizes", function() {
                expect(this.model.dataSource()).toBe(this.model.dataSource());
            });
        });

        context("for a gpdb schema", function() {
            beforeEach(function() {
                this.model = backboneFixtures.schema({name: "schema", database: {name: "database", dataSource: {name: "dataSource", id: 42}}});
                expect(this.model.get('dataSource')).toBeUndefined();
            });

            it('returns the data source directly', function() {
                expect(this.model.dataSource().name()).toEqual('dataSource');
                expect(this.model.dataSource().id).toEqual(42);
            });

            it("memoizes", function() {
                expect(this.model.dataSource()).toBe(this.model.dataSource());
            });
        });
    });

    describe("#parent", function () {
        context("in a data source with databases", function () {
            beforeEach(function () {
                this.model = backboneFixtures.schema({name: "schema", database: {name: "database", dataSource: {name: "dataSource"}}});
            });

            it("returns the database", function () {
                expect(this.model.parent()).toBe(this.model.database());
            });
        });

        context("in a data source directly containing schemas", function () {
            beforeEach(function () {
                this.model = backboneFixtures.oracleSchema({name: "schema", dataSource: {name: "dataSource", id: 45}});
            });

            it("returns the data source", function () {
                expect(this.model.parent()).toBe(this.model.dataSource());
            });
        });
    });

    describe("dataSource credentials", function() {
        beforeEach(function() {
            this.model = backboneFixtures.schema();
        });

        it("includes DataSourceCredentials mixin", function() {
            expect(this.model.dataSourceRequiringCredentials).toBeTruthy();
        });
    });
});
