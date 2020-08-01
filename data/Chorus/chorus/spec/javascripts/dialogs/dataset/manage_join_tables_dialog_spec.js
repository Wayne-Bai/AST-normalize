describe("chorus.dialogs.ManageJoinTables", function () {
    beforeEach(function () {
        this.qtip = stubQtip();
        stubModals();
        this.originalDataset = backboneFixtures.workspaceDataset.datasetTable({
            objectName:"original",
            entitySubtype:"SOURCE_TABLE",
            objectType:"TABLE",
            id:"abc"
        });
        this.dataSourceName = "john";
        var dataset = backboneFixtures.workspaceDataset.datasetTable({
            objectName:"original",
            schema:{
                database:{
                    dataSource:{
                        name:this.dataSourceName,
                        id:11
                    }
                }
            },
            entitySubtype:"SOURCE_TABLE",
            objectType:"TABLE",
            id:"abc"
        });
        this.schema = dataset.schema();
        this.chorusView = dataset.deriveChorusView();

        this.dialog = new chorus.dialogs.ManageJoinTables({ pageModel:dataset, chorusView:this.chorusView });
        $("#jasmine_content").append(this.dialog.el);
    });

    it("sets the model based on the chorus view option", function () {
        expect(this.dialog.model).toBe(this.chorusView);
    });

    it("fetches the list of schemas in the same data source as the original schema", function () {
        expect(this.schema.database().schemas()).toHaveBeenFetched();
    });

    it("fetches the schema's tables and views", function () {
        var datasetFetch = this.server.lastFetchFor(this.schema.datasets());
        expect(datasetFetch.params().per_page).toBe('7');
        expect(datasetFetch.params().page).toBe('1');
    });

    describe("when the fetches complete", function () {
        beforeEach(function () {
            this.firstSchema = backboneFixtures.schema({name:"Bob", database:this.schema.database().attributes });
            this.secondSchema = backboneFixtures.schema({name:"Ted", database:this.schema.database().attributes });
            this.server.completeFetchFor(this.dialog.schemas, [this.firstSchema, this.schema, this.secondSchema]);

            this.dataset1 = backboneFixtures.workspaceDataset.datasetTable({
                objectName:"cats",
                entitySubtype:"SOURCE_TABLE",
                objectType:"VIEW",
                id:'"10000"|"dca_demo"|"ddemo"|"VIEW"|"cats"'
            });

            this.dataset2 = backboneFixtures.workspaceDataset.datasetTable({
                objectName:"dogs",
                entitySubtype:"SOURCE_TABLE",
                objectType:"TABLE",
                id:'"10000"|"dca_demo"|"ddemo"|"TABLE"|"dogs"'
            });

            this.dataset3 = backboneFixtures.workspaceDataset.datasetTable({
                objectName:"lions",
                entitySubtype:"SOURCE_TABLE",
                objectType:"VIEW",
                id:'"10000"|"dca_demo"|"ddemo"|"VIEW"|"lions"'
            });

            this.server.completeFetchFor(this.schema.datasets(), [
                this.dataset1,
                this.dataset2,
                this.originalDataset,
                this.dataset3
            ]);
        });

        it("has the right title", function () {
            expect(this.dialog.$("h1").text()).toMatchTranslation("dataset.manage_join_tables.title");
        });

        it("has a 'done' button", function () {
            expect(this.dialog.$("button.cancel").text()).toMatchTranslation("dataset.manage_join_tables.done");
        });

        it("shows the name of each table/view", function () {
            expect(this.dialog.$(".name").eq(0)).toHaveText("cats");
            expect(this.dialog.$(".name").eq(1)).toHaveText("dogs");
            expect(this.dialog.$(".name").eq(2)).toHaveText("original");
            expect(this.dialog.$(".name").eq(3)).toHaveText("lions");
        });

        it("shows the medium dataset icon for each table/view", function () {
            var icons = this.dialog.$("img.image");
            expect(icons.eq(0)).toHaveAttr("src", this.dataset1.iconUrl({ size:"icon" }));
            expect(icons.eq(1)).toHaveAttr("src", this.dataset2.iconUrl({ size:"icon" }));
        });

        it("renders a search input", function () {
            expect(this.dialog.$(".search input")).toExist();
            expect(this.dialog.$(".search input").attr("placeholder")).toContainTranslation("dataset.dialog.search_schema");
        });

        describe("entering a seach term", function () {
            beforeEach(function () {
                this.dialog.$(".search input").val("a query").trigger("textchange");
            });

            it("fetches filtered database objects", function () {
                expect(this.server.lastFetch().url).toMatchUrl(
                    "/schemas/" + this.schema.id + "/datasets?entity_subtype=meta&filter=a+query&page=1&per_page=9",
                    { paramsToIgnore:["page", "per_page", "entity_subtype"] }
                );
            });

            context("after the results come back", function () {
                beforeEach(function () {
                    this.server.lastFetch().succeed([ this.dataset1 ]);
                });

                it("updates the list items", function () {
                    expect(this.dialog.$(".name").length).toBe(1);
                });

                it("keeps the search term around", function () {
                    expect(this.dialog.$(".search input").val()).toBe("a query");
                });
            });
        });

        describe("the schema picker menu", function () {
            it("shows the original table canonical name", function () {
                expect(this.dialog.$(".canonical_name")).toContainText(this.schema.canonicalName());
            });

            context("when the fetch for the schemas completes", function () {
                it("shows a drop-down menu when the schema link is clicked", function () {
                    var $link = this.dialog.$(".canonical_name a.schema_qtip");
                    expect($link).toContainText(this.schema.get("name"));
                    $link.click();
                    expect(this.qtip).toHaveVisibleQtip();
                });

                it("cleans up after itself", function () {
                    this.teardownSpy = spyOn(this.dialog.menuView, "teardown");
                    this.dialog.render();
                    expect(this.teardownSpy).toHaveBeenCalled();
                    expect(_.indexOf(this.dialog.getSubViews(), this.dialog.menuView)).toBeGreaterThan(-1);
                });

                describe("the schema-picker", function () {
                    beforeEach(function () {
                        this.dialog.$(".canonical_name a.schema_qtip").click();
                        this.schemaMenu = this.qtip.find(".qtip").eq(0);
                    });

                    it("has an item for 'this workspace'", function () {
                        expect(this.schemaMenu.find("li").eq(0)).toContainTranslation("dataset.manage_join_tables.this_workspace");
                    });

                    it("has an item for each schema in the database", function () {
                        var lis = this.schemaMenu.find("li");
                        this.dialog.schemas.each(function (schema, i) {
                            expect(lis.eq(i + 1)).toContainText(schema.get("name"));
                        });
                    });

                    it("selects the current schema", function () {
                        expect(this.schemaMenu.find("li:contains('" + this.schema.get("name") + "')")).toHaveClass("selected");
                        expect(this.schemaMenu.find("li:contains(Bob)")).not.toHaveClass("selected");
                    });

                    it("clicking the link more than once returns the correct list", function () {
                        this.qtip.hide();
                        this.dialog.$(".canonical_name a.schema_qtip").click();
                        expect(this.qtip.find(".qtip").eq(0)).toBe(this.schemaMenu);
                    });

                    describe("clicking the 'this workspace' option", function () {
                        beforeEach(function () {
                            this.schemaMenu.find("li a").eq(0).click();
                        });

                        it("fetches the datasets in the schema's database, associated with the workspace", function () {
                            var database = this.chorusView.schema().database();
                            var datasetsInDatabase = this.chorusView.workspace().datasetsInDatabase(database);
                            datasetsInDatabase.attributes.entitySubtype = "NON_CHORUS_VIEW";
                            expect(datasetsInDatabase).toHaveBeenFetched();
                        });

                        it("shows the right text for the schema menu link", function () {
                            expect(this.dialog.$(".canonical_name .schema_qtip")).toContainTranslation("dataset.manage_join_tables.this_workspace");
                        });
                    });

                    context("when selecting a schema", function () {
                        beforeEach(function () {
                            this.qtip.$("li:contains(Bob) a").click();
                        });

                        it("hides the menu", function () {
                            expect(this.qtip).not.toHaveVisibleQtip();
                        });

                        it("loads the schema's datasets", function () {
                            expect(this.firstSchema.datasets()).toHaveBeenFetched();
                        });

                        it("updates the data source, database and schema names in the sub header", function () {
                            expect(this.dialog.$(".canonical_name")).toContainText(this.firstSchema.canonicalName());
                        });

                        describe("when the datasets are fetched", function () {
                            beforeEach(function () {
                                this.server.completeFetchFor(this.firstSchema.datasets(), [
                                    backboneFixtures.workspaceDataset.datasetTable({ objectName:"fred" }),
                                    backboneFixtures.workspaceDataset.datasetTable({ objectName:"lou" }),
                                    backboneFixtures.workspaceDataset.datasetTable({ objectName:"bryan" })
                                ]);
                            });

                            it("stops the loading spinner", function () {
                                expect(this.dialog.$(".loading_section")).not.toExist();
                            });

                            it("shows the schema's datasets in the list", function () {
                                var names = this.dialog.$(".paginated_join_tables .name");
                                expect(names.length).toBe(3);
                                expect(names.eq(0)).toContainText("fred");
                                expect(names.eq(1)).toContainText("lou");
                                expect(names.eq(2)).toContainText("bryan");
                            });
                        });
                    });
                });
            });
        });

        it("has a 'join table'/'join view' link for every database object", function () {
            var joinLinks = this.dialog.$("a.join");
            expect(joinLinks.eq(0).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_view");
            expect(joinLinks.eq(1).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_table");
            expect(joinLinks.eq(2).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_table");
            expect(joinLinks.eq(3).text().trim()).toMatchTranslation("dataset.manage_join_tables.join_view");
        });

        it("has a 'preview columns' link for every dataset object", function () {
            var links = this.dialog.$("a.preview_columns");
            expect(links.length).toBe(4);
            expect(links.eq(0).text()).toMatchTranslation("dataset.manage_join_tables.preview_columns");
        });

        describe("when a 'preview columns' link is clicked", function () {
            beforeEach(function () {
                spyOn(chorus.dialogs.PreviewColumns.prototype, 'render').andCallThrough();
                this.dialog.$("a.preview_columns").eq(1).trigger("click");
            });

            it("launches the 'preview columns' sub-dialog", function () {
                expect(chorus.dialogs.PreviewColumns.prototype.render).toHaveBeenCalled();
            });

            it("passes the right table or view to the 'preview columns' sub-dialog", function () {
                var previewColumnsDialog = chorus.dialogs.PreviewColumns.prototype.render.lastCall().object;
                expect(previewColumnsDialog.model).toBeA(chorus.models.Dataset);
                expect(previewColumnsDialog.model.get("id")).toBe(this.dataset2.get("id"));
            });
        });

        describe("when a 'join table' link is clicked", function () {
            beforeEach(function () {
                spyOn(chorus.dialogs.JoinConfiguration.prototype, 'render').andCallThrough();
                var link = this.dialog.$("a.join").eq(3);
                link.trigger("click");
                var clickedId = link.closest('li').data('cid');
                this.selectedDataset = this.dialog.collection.get(clickedId);
            });

            it("launches the 'join configuration' sub-dialog", function () {
                expect(chorus.dialogs.JoinConfiguration.prototype.render).toHaveBeenCalled();
            });

            it("passes the right chorus view, schema and destination object to the JoinConfiguration dialog", function () {
                var joinConfigurationDialog = chorus.dialogs.JoinConfiguration.prototype.render.lastCall().object;

                expect(joinConfigurationDialog.model).toBe(this.chorusView);

                expect(joinConfigurationDialog.destinationObject).toBeA(chorus.models.Dataset);
                expect(joinConfigurationDialog.destinationObject.get("id")).toBe(this.dataset3.get("id"));
                expect(joinConfigurationDialog.destinationObject).not.toBe(this.selectedDataset);
            });
        });

        describe("when there are many tables to join", function () {
            it("shows pagination controls", function () {
                expect(this.dialog.$(".list_content_details")).toBeHidden();
                expect(this.dialog.$(".list_content_details .count")).toContainText("4");
                expect(this.server.lastFetchFor(this.schema.datasets()).params()['per_page']).toEqual("7");
            });
        });
    });
});
