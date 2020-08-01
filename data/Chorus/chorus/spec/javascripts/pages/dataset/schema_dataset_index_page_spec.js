describe("chorus.pages.SchemaDatasetIndexPage", function() {
    beforeEach(function() {
        spyOn(_, "debounce").andCallThrough();
        this.schema = backboneFixtures.schema({id: "789", name: "Bar/", database: {id: "456", name: "Foo%", dataSource: {id: "123", name: "ADataSource"}} });
        this.dataSource = backboneFixtures.gpdbDataSource({ id: "123" });
        this.page = new chorus.pages.SchemaDatasetIndexPage("789");
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("schema");
    });

    it("does not show a title before the fetch completes", function() {
        this.page.render();
        expect(this.page.$(".content_header h1").text()).toBe("");
    });

    it("includes the DataSourceCredentials mixin", function() {
        expect(this.page.dependentResourceForbidden).toBe(chorus.Mixins.DataSourceCredentials.page.dependentResourceForbidden);
    });

    it("fetches the schema's datasets", function() {
        expect(this.server.lastFetchFor(this.page.collection).params()['per_page']).toEqual("50");
    });

    describe("when a fetch fails", function() {
        beforeEach(function() {
            spyOn(Backbone.history, "loadUrl");
        });

        it("navigates to the 404 page when the schema fetch fails", function() {
            this.page.schema.trigger('resourceNotFound', this.page.schema);
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute");
        });

        it("navigates to the 404 page when the collection fetch fails", function() {
            this.page.collection.trigger('resourceNotFound', this.page.collection);
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute");
        });
    });

    context("when only the schema has been fetched", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.schema);
        });

        it("renders the schema's canonical name", function() {
            expect($(this.page.el)).toContainText(this.page.schema.canonicalName());
        });

        it("displays a loading section", function() {
            expect(this.page.$(".loading_section")).toExist();
        });
    });

    context("after everything has been fetched", function() {
        beforeEach(function() {
            this.originalMainContent = this.page.mainContent;
            spyOn(this.originalMainContent, "teardown");

            this.server.completeFetchFor(this.schema);
            this.server.completeFetchFor(this.page.collection, [
                backboneFixtures.dataset({ objectName: "bar" }),
                backboneFixtures.dataset({ objectName: "foo", objectType: "VIEW" })
            ]);
        });

        itBehavesLike.aPageWithMultiSelect();

        it("has the right title", function() {
            expect(this.page.$(".content_header h1").text()).toBe(this.page.schema.canonicalName());
        });

        it("calls teardown on the old mainContent", function() {
            expect(this.originalMainContent.teardown).toHaveBeenCalled();
        });

        it("displays the search input", function() {
            expect(this.page.$("input.search").attr("placeholder")).toMatchTranslation("schema.search");
        });

        it("changes the selection after clicking another item", function() {
            this.page.$(".list > li").eq(1).click();
            expect(this.page.$(".list > li").eq(0)).not.toHaveClass("checked");
            expect(this.page.$(".list > li").eq(1)).toHaveClass("checked");
        });

        it("has the right breadcrumbs", function() {
            var breadcrumbs = this.page.$("#breadcrumbs .breadcrumb a");

            expect(breadcrumbs.eq(0)).toHaveHref("#/data_sources");
            expect(breadcrumbs.eq(0)).toContainTranslation("breadcrumbs.data_sources");

            expect(breadcrumbs.eq(1)).toContainText("ADataSource");
            expect(breadcrumbs.eq(1)).toHaveHref(this.schema.database().dataSource().showUrl());

            expect(breadcrumbs.eq(2)).toContainText("Foo%");
            expect(breadcrumbs.eq(2)).toHaveHref(this.schema.database().showUrl());

            expect(this.page.$("#breadcrumbs .breadcrumb .slug").text()).toBe(this.page.schema.get("name"));
        });

        context("when the schema has only an associated data source and not a database", function() {
            beforeEach(function() {
                this.schema = backboneFixtures.oracleSchema({id: "789", name: "Bar/", dataSource: {id: "123", name: "A Data Source"}});
                this.page = new chorus.pages.SchemaDatasetIndexPage("789");
                this.server.completeFetchFor(this.schema);
            });

            it ("shows the breadcrumbs without the database", function() {
                var breadcrumbs = this.page.$("#breadcrumbs .breadcrumb a");
                expect(breadcrumbs.length).toBe(2);

                expect(breadcrumbs.eq(0)).toHaveHref("#/data_sources");
                expect(breadcrumbs.eq(0)).toContainTranslation("breadcrumbs.data_sources");

                expect(breadcrumbs.eq(1)).toContainText("A Data Source");
                expect(breadcrumbs.eq(1)).toHaveHref(this.schema.dataSource().showUrl());

                expect(this.page.$("#breadcrumbs .breadcrumb .slug").text()).toBe(this.page.schema.get("name"));
            });
        });

        describe("the main content list", function() {
            beforeEach(function() {
                // render is bound on the view object before we can spy on it.
                spyOn(this.page.mainContent, "preRender");
            });

            it("is constructed correctly", function() {
                expect(this.page.mainContent).toBeA(chorus.views.MainContentList);
                expect(this.page.mainContent.collection).toBe(this.page.collection);
                expect(this.page.mainContent.collection).toBeA(chorus.collections.SchemaDatasetSet);

                expect(this.page.$(this.page.mainContent.el).length).toBe(1);
            });

            it("does not re-render when a dataset is updated", function() {
                this.page.collection.at(0).trigger("change");
                expect(this.page.mainContent.preRender).not.toHaveBeenCalled();
            });

            it("does re-render when the collection is reset", function() {
                this.page.collection.trigger("reset");
                expect(this.page.mainContent.preRender).toHaveBeenCalled();
            });

            it("does re-render when the collection is sorted", function() {
                this.page.collection.trigger("sort");
                expect(this.page.mainContent.preRender).toHaveBeenCalled();
            });
        });

        describe("search", function() {
            beforeEach(function() {
                this.page.$("input.search").val("foo").trigger("keyup");
            });

            it("throttles the number of search requests", function() {
                expect(_.debounce).toHaveBeenCalled();
            });

            it("shows the Loading text in the count span", function() {
                expect($(this.page.$(".count"))).toContainTranslation("loading");
            });

            it("re-fetches the collection with the search parameters", function() {
                expect(this.server.lastFetch().url).toContainQueryParams({filter: "foo"});
            });

            context("when the fetch completes", function() {
                beforeEach(function() {
                    spyOn(this.page.mainContent, "render").andCallThrough();
                    spyOn(this.page.mainContent.content, "render").andCallThrough();
                    spyOn(this.page.mainContent.contentFooter, "render").andCallThrough();
                    spyOn(this.page.mainContent.contentDetails, "render").andCallThrough();
                    spyOn(this.page.mainContent.contentDetails, "updatePagination").andCallThrough();
                    this.server.completeFetchFor(this.page.collection);
                });

                it("updates the header, footer, and body", function() {
                    expect(this.page.mainContent.content.render).toHaveBeenCalled();
                    expect(this.page.mainContent.contentFooter.render).toHaveBeenCalled();
                    expect(this.page.mainContent.contentDetails.updatePagination).toHaveBeenCalled();
                });

                it("does not re-render the page or body", function() {
                    expect(this.page.mainContent.render).not.toHaveBeenCalled();
                    expect(this.page.mainContent.contentDetails.render).not.toHaveBeenCalled();
                });

                it("shows the Loading text in the count span", function() {
                    expect($(this.page.$(".count"))).not.toContainTranslation("loading");
                });
            });
        });

        describe("multiple selection", function() {
            context("when two rows have been checked", function() {
                beforeEach(function() {
                    var someModels = this.page.collection.clone().reset([backboneFixtures.dataset({ objectName: "bar" }),
                        backboneFixtures.dataset({ objectName: "foo", objectType: "VIEW" })]);
                    chorus.PageEvents.trigger("dataset:checked", someModels);
                });

                it("has an action to associate datasets with workspace", function() {
                    expect(this.page.$(".multiple_selection a.associate")).toExist();
                });

                describe("clicking the 'associate with workspace' link", function() {
                    beforeEach(function() {
                        this.modalSpy = stubModals();
                        this.page.$(".multiple_selection a.associate").click();
                    });

                    it("launches the dialog for associating multiple datasets with a workspace", function() {
                        var dialog = this.modalSpy.lastModal();
                        expect(dialog).toBeA(chorus.dialogs.AssociateMultipleWithWorkspace);
                        expect(dialog.datasets).toBe(this.page.multiSelectSidebarMenu.selectedModels);
                    });
                });
            });
        });
    });
});
