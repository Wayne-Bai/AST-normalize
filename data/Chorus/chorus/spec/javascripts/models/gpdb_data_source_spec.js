describe("chorus.models.GpdbDataSource", function() {
    beforeEach(function() {
        this.dataSource = backboneFixtures.gpdbDataSource({id: 1});
    });

    it("has the right entity type", function() {
        expect(this.dataSource.entityType).toBe("gpdb_data_source");
    });

    it("has the right show url", function() {
        expect(this.dataSource.showUrl()).toBe("#/data_sources/1/databases");
    });

    it("has the right url", function() {
        expect(this.dataSource.url()).toContain('/data_sources/1');

        this.dataSource.unset("id", { silent: true });
        expect(this.dataSource.url()).toBe('/data_sources/');
    });

    it('has the type', function() {
        expect(this.dataSource.get('entityType')).toBe('gpdb_data_source');
    });

    describe("#databases", function() {
        beforeEach(function() {
            this.databases = this.dataSource.databases();
        });

        it("returns an DatabaseSet", function() {
            expect(this.databases).toBeA(chorus.collections.DatabaseSet);
        });

        it('sets the data source id', function() {
            expect(this.databases.attributes.dataSourceId).toBe(this.dataSource.get('id'));
        });

        it("memoizes", function() {
            expect(this.databases).toBe(this.dataSource.databases());
        });
    });

    describe("validations", function() {
        beforeEach(function() {
            this.attrs = {
                name: "foo",
                host: "gillette",
                dbUsername: "dude",
                dbPassword: "whatever",
                port: "1234",
                dbName: "postgres"
            };
        });

        context('when the data source is new', function() {
            beforeEach(function() {
                this.dataSource.unset("id", { silent: true });
            });

            it("returns true when the model is valid", function() {
                expect(this.dataSource.performValidation(this.attrs)).toBeTruthy();
            });

            _.each(["name", "host", "dbUsername", "dbPassword", "port", "dbName"], function(attr) {
                it("requires " + attr, function() {
                    this.attrs[attr] = "";
                    expect(this.dataSource.performValidation(this.attrs)).toBeFalsy();
                    expect(this.dataSource.errors[attr]).toBeTruthy();
                });
            });

            it("allows name with spaces", function() {
                this.attrs.name = "foo bar";
                expect(this.dataSource.performValidation(this.attrs)).toBeTruthy();
            });

            it("requires name with valid length", function() {
                this.attrs.name = "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest";
                expect(this.dataSource.performValidation(this.attrs)).toBeFalsy();
                expect(this.dataSource.errors.name).toMatchTranslation("validation.required_pattern", {fieldName: t('data_sources.dialog.data_source_name')});
            });

            it("requires valid port", function() {
                this.attrs.port = "z123";
                expect(this.dataSource.performValidation(this.attrs)).toBeFalsy();
                expect(this.dataSource.errors.port).toBeTruthy();
            });
        });

        context('when the data source has already been created', function() {
            it("does not require a dbUsername or dbPassword", function() {
                delete this.attrs.dbPassword;
                delete this.attrs.dbUsername;
                expect(this.dataSource.performValidation(this.attrs)).toBeTruthy();
            });
        });
    });
});
