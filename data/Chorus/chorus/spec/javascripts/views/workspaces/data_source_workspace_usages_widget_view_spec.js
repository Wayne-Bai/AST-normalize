describe("chorus.views.DataSourceWorkspaceUsagesWidget", function() {
    beforeEach(function() {
        this.dataSource = backboneFixtures.gpdbDataSource({"shared": true});
        this.dataSource.loaded = false;
        this.view = new chorus.views.DataSourceWorkspaceUsagesWidget({model: this.dataSource});
    });

    describe("#setDataSource", function() {
        beforeEach(function() {
            this.otherDataSource = backboneFixtures.gpdbDataSource({"shared": true});
            this.view.setDataSource(this.otherDataSource);
        });

        it("sets the dataSource", function() {
            expect(this.view.dataSource).toBe(this.otherDataSource);
        });

        it("re-fetches the usages for the new data source", function() {
            expect(this.otherDataSource.usage()).toHaveBeenFetched();
        });
    });

    context("when the user doesn't have permission to fetch the data source workspace usage", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.dataSource.usage(), backboneFixtures.dataSourceDetailsWithoutPermission());
        });

        it("renders without the workspace usage section", function() {
            expect(this.view.$el).toBeEmpty();
        });
    });

    context("when usages have not yet been fetched", function() {
        it("has the default loading text on the workspace usage link", function() {
            this.view.render();
            expect(this.view.$el).toContainTranslation("data_sources.sidebar.usage_loading");
        });
    });

    context("when the workspace usage fetch completes", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.dataSource.usage(), backboneFixtures.dataSourceDetails());
        });

        context("when there are no workspaces", function() {
            beforeEach(function() {
                this.dataSource.usage().set({workspaces: []});
                this.dataSource.usage().trigger("loaded");
            });

            it("should disable the link", function() {
                expect(this.view.$('.workspace_usage')).toHaveClass('disabled');
                expect(this.view.$('.workspace_usage').data('dialog')).toBeUndefined();
            });

            it("should show a count of zero", function() {
                expect(this.view.$('.workspace_usage')).toContainTranslation('data_sources.sidebar.usage', {count: 0});
            });
        });

        context("when there are workspaces", function() {
            beforeEach(function() {
                expect(this.dataSource.usage().get("workspaces").length).toBeGreaterThan(0);
            });

            it("should show the appropriate number of workspaces", function() {
                expect(this.view.$('.workspace_usage')).toContainTranslation('data_sources.sidebar.usage', {count: this.dataSource.usage().get("workspaces").length});
            });

            context("clicking the View Usages link", function() {
                beforeEach(function() {
                    expect(this.view.$('.workspace_usage')).not.toHaveClass("disabled");
                    this.modalSpy = stubModals();
                    this.view.$(".workspace_usage").click();
                });

                it("should open a DataSourceUsage dialog with the correct model", function() {
                    expect(this.modalSpy.lastModal()).toBeA(chorus.dialogs.DataSourceUsage);
                    expect(this.modalSpy.lastModal().dataSource).toBe(this.dataSource);
                    expect(this.modalSpy.lastModal().resource).toBe(this.dataSource.usage());
                });
            });
        });
    });
});