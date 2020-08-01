describe("chorus.views.DatasetItem", function() {
    function itRendersTheNameAndIcon() {
        it("renders the dataset's name", function() {
            expect(this.view.$(".name")).toContainText("john_the_table");
        });

        it("renders an icon for the dataset", function() {
            expect(this.view.$("img")).toHaveAttr("src", this.dataset.iconUrl());
            expect(this.view.$("img")).toHaveAttr("title", Handlebars.helpers.humanizedDatasetType(this.dataset.attributes));
        });
    }

    beforeEach(function() {
        this.dataset = backboneFixtures.workspaceDataset.datasetTable({
            objectName: "john_the_table"
        });
        this.qtipSpy = stubQtip();
        this.view = new chorus.views.DatasetItem({ model: this.dataset, hasActiveWorkspace: true });
        this.view.render();
    });

    it('renders breadcrumbs for the data source, database and schema', function() {
        expect(this.view.$(".data_source")).toContainText(this.dataset.dataSource().get("name"));
        expect(this.view.$(".database")).toContainText(this.dataset.database().get("name"));
        expect(this.view.$(".schema")).toContainText(this.dataset.schema().get("name"));
    });

    it('attaches the data source model to the data source and database breadcrumbs', function() {
        expect(this.view.$(".data_source").data("data_source")).toEqual(this.dataset.dataSource().attributes);
        expect(this.view.$(".database").data("data_source")).toEqual(this.dataset.dataSource().attributes);
    });

    xdescribe("found in workspaces tooltip (when rendered from the schema browse page)", function() {
        beforeEach(function() {
            this.dataset = backboneFixtures.dataset();

            this.view = new chorus.views.DatasetItem({ model: this.dataset, hasActiveWorkspace: true });
            this.view.render();
        });

        it("is rendered", function() {
            expect(this.view.$(".found_in")).toContainText("Hoge");
        });

        it("qtip-ifies the other_menu", function() {
            expect(this.qtipSpy).not.toHaveVisibleQtip();
            this.view.$('.found_in .open_other_menu').click();
            expect(this.qtipSpy).toHaveVisibleQtip();
            expect(this.qtipSpy.find('li').length).toBe(2);
        });

        context("when the dataset is not used in any workspace", function() {
            beforeEach(function() {
                this.dataset.unset("workspaceUsed");
                delete this.dataset._workspaceAssociated;
                this.view.render();
            });

            it("renders successfully without the workspace usage section", function() {
                expect(this.view.$(".found_in")).not.toExist();
            });
        });
    });

    xdescribe("when the workspace is archived", function() {
        beforeEach(function() {
            this.view.options.hasActiveWorkspace = false;
            this.view.render();
        });

        it('does not have dataset links (still has data source links)', function() {
            expect(this.view.$("a.image")).not.toExist();
            expect(this.view.$("a.name")).not.toExist();
        });
    });

    context("when the user has credentials to view the dataset", function() {
        itRendersTheNameAndIcon();

        it("links the dataset name and icon to its show page", function() {
            expect(this.view.$(".name")).toHaveHref(this.dataset.showUrl());
            expect(this.view.$(".image")).toHaveHref(this.dataset.showUrl());
        });
    });

    context("when the user does not have credentials to view the dataset", function() {
        beforeEach(function() {
            this.dataset.set({hasCredentials: false});
        });

        it("adds the 'no_credentials' class to the element", function() {
            expect($(this.view.el)).toHaveClass("no_credentials");
        });

        itRendersTheNameAndIcon();

        it("does not link the dataset name or icon to its show page", function() {
            expect(this.view.$(".name")).toBe("span");
            expect(this.view.$(".image")).toBe("span");
        });
    });

    context("when the dataset has a comment", function() {
        beforeEach(function() {
            this.dataset.set({ recentComments: [{
                body: "I love you john.",
                author: {
                    id: "1",
                    lastName: "Smith",
                    firstName: "Bob"
                },
                timestamp: "2011-12-15T12:34:56Z"
            }]});
        });

        it("renders the most recent comment", function() {
            expect(this.view.$(".comment .body")).toContainText("I love you john.");
            expect(this.view.$(".comment a")).toContainText("Bob Smith");
            expect(this.view.$(".comment_info .on")).toContainText("Dec 15");
        });

        it("does not display the 'other comments' text", function() {
            expect(this.view.$(".comment")).not.toContainText(t("comments.other_comments", {count: 0}));
        });

    });

    context("when there are no comments", function() {
        beforeEach(function() {
            this.dataset.unset("recentComments");
        });

        it("does not display the most recent comment", function() {
            expect(this.view.$(".comment")).not.toExist();
        });
    });

    context("when the dataset has more than one comment", function() {
        beforeEach(function() {
            this.dataset.set({ commentCount: 3 });
        });

        it("displays the 'other comments' text", function() {
            expect(this.view.$(".comment")).toContainText(t("comments.other_comments", { count: 2 }));
        });
    });

    context("when the dataset has tags", function() {
        beforeEach(function () {
            this.dataset.tags().reset([{name: "tag1"}, {name: "tag2"}]);
            this.view.render();
        });

        it("shows a list of tags", function () {
            expect(this.view.$('.item_tag_list')).toContainTranslation("tag_list.title");
            expect(this.view.$('.item_tag_list')).toContainText("tag1 tag2");
        });
    });

    it("works with database objects as well as datasets", function() {
        var table = backboneFixtures.dataset({objectName: 'yyy'});
        var view = new chorus.views.DatasetItem({ model: table });
        view.render();
        expect(view.$(".name")).toHaveHref(table.showUrl());
        expect(view.$(".image")).toHaveHref(table.showUrl());
    });

    describe("when the model received an 'invalidated' trigger", function() {
        beforeEach(function() {
            spyOn(this.view, "render");
        });

        it("reloads the model", function() {
            this.dataset.trigger("invalidated");
            expect(this.dataset).toHaveBeenFetched();
        });

        it("rerenders the view", function () {
            this.dataset.trigger("invalidated");
            expect(this.view.render).toHaveBeenCalled();
        });

    });

    describe("presenting tags", function() {
        beforeEach(function() {
            this.model = this.dataset;
        });

        itBehavesLike.ItPresentsModelWithTags();
    });

    context("when the dataset is an HDFS file mask posing as dataset", function() {
        beforeEach(function() {
            this.dataset = backboneFixtures.workspaceDataset.hdfsDataset({
                objectName: "john_the_table"
            });
            this.qtipSpy = stubQtip();
            this.view = new chorus.views.DatasetItem({ model: this.dataset, hasActiveWorkspace: true });
            this.view.render();
        });

        it('renders breadcrumbs for the data source, database and schema', function() {
            expect(this.view.$(".data_source")).toContainText(this.dataset.dataSource().get("name"));
            expect(this.view.$(".database")).not.toExist();
            expect(this.view.$(".schema")).not.toExist();
        });

        it('attaches the data source model to the data source and database breadcrumbs', function() {
            expect(this.view.$(".data_source").data("data_source")).toEqual(this.dataset.dataSource().attributes);
            expect(this.view.$(".database").data("data_source")).toBeUndefined();
        });

        context("when the user has credentials to view the dataset", function() {
            itRendersTheNameAndIcon();

            it("links the dataset name and icon to its show page", function() {
                expect(this.view.$(".name")).toHaveHref(this.dataset.showUrl());
                expect(this.view.$(".image")).toHaveHref(this.dataset.showUrl());
            });
        });

        context("when the user does not have credentials to view the dataset", function() {
            beforeEach(function() {
                this.dataset.set({hasCredentials: false});
            });

            it("adds the 'no_credentials' class to the element", function() {
                expect($(this.view.el)).toHaveClass("no_credentials");
            });

            itRendersTheNameAndIcon();

            it("does not link the dataset name or icon to its show page", function() {
                expect(this.view.$(".name")).toBe("span");
                expect(this.view.$(".image")).toBe("span");
            });
        });

        context("when the dataset has a comment", function() {
            beforeEach(function() {
                this.author = {
                    id: "1",
                    lastName: "Buganvilia",
                    firstName: "Sally"
                };

                this.dataset.set({ recentComments: [{
                    body: "I love you john.",
                    author: this.author,
                    timestamp: "2011-12-15T12:34:56Z"
                }]});
            });

            it("renders the most recent comment", function() {
                expect(this.view.$(".comment .body")).toContainText("I love you john.");
                expect(this.view.$(".comment a")).toContainText(this.author.firstName + ' ' + this.author.lastName);
                expect(this.view.$(".comment_info .on")).toContainText("Dec 15");
            });

            it("does not display the 'other comments' text", function() {
                expect(this.view.$(".comment")).not.toContainText(t("comments.other_comments", {count: 0}));
            });

            context("when the dataset has more than one comment", function() {
                beforeEach(function() {
                    this.dataset.set({ commentCount: 3 });
                });

                it("displays the 'other comments' text", function() {
                    var $comment = this.view.$(".comment");
                    var text = t("comments.other_comments", { count: 2 });

                    expect($comment).toContainText(text);
                });
            });
        });

        context("when there are no comments", function() {
            beforeEach(function() {
                this.dataset.unset("recentComments");
            });

            it("does not display the most recent comment", function() {
                expect(this.view.$(".comment")).not.toExist();
            });
        });

        context("when the dataset has tags", function() {
            beforeEach(function () {
                this.dataset.tags().reset([{name: "tag1"}, {name: "tag2"}]);
                this.view.render();
            });

            it("shows a list of tags", function() {
                expect(this.view.$('.item_tag_list')).toContainTranslation("tag_list.title");
                expect(this.view.$('.item_tag_list')).toContainText("tag1 tag2");
            });
        });

        it("works with database objects as well as datasets", function() {
            var table = backboneFixtures.dataset({objectName: 'yyy'});
            var view = new chorus.views.DatasetItem({ model: table });
            view.render();
            expect(view.$(".name")).toHaveHref(table.showUrl());
            expect(view.$(".image")).toHaveHref(table.showUrl());
        });

        describe("when the model received an 'invalidated' trigger", function() {
            beforeEach(function() {
                spyOn(this.dataset, "fetch");
            });

            it("reloads the model", function() {
                this.dataset.trigger("invalidated");
                expect(this.dataset.fetch).toHaveBeenCalled();
            });
        });

        describe("presenting tags", function() {
            beforeEach(function() {
                this.model = this.dataset;
            });

            itBehavesLike.ItPresentsModelWithTags();
        });
    });

    context("when the dataset is stale", function() {
        it("displays a link with an stale/invalid marker", function() {
            this.dataset.set('stale', true);
            expect(this.view.$('.stale_marker')).toExist();
        });
    });
});
