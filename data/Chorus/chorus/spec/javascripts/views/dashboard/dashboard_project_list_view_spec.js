describe("chorus.views.DashboardProjectList", function() {
    beforeEach(function() {
        // Has a summary, but no insights, and user is a member
        this.workspace1 = backboneFixtures.workspace({
            name: "Broccoli",
            owner: { firstName: 'Green', lastName: 'Giant' },
            latestCommentList: [],
            summary: 'We are making sails!',
            isMember: true,
            datasetsCount: 1,
            membersCount: 1,
            workfilesCount: 1,
            insightsCount: 1,
            recentInsightsCount: 1,
            recentCommentsCount: 1
        });
        delete this.workspace1.attributes.latestInsight;

        // One insight, no summary, and the user is not a member
        this.workspace2 = backboneFixtures.workspace({
            name: "Camels",
            owner: { firstName: 'Andre', lastName: 'The Giant' },
            latestCommentList: [],
            numberOfInsights: 1,
            isMember: false,
            datasetsCount: 2,
            membersCount: 2,
            workfilesCount: 2,
            insightsCount: 2,
            recentInsightsCount: 2,
            recentCommentsCount: 2
        });
        delete this.workspace2.attributes.summary;
        spyOn(this.workspace2, 'latestInsight').andReturn(backboneFixtures.activity.insightOnGreenplumDataSource());

        // Three insights and a summary, and user is a member
        this.workspace3 = backboneFixtures.workspace({numberOfInsights: 3, isMember: true});
        spyOn(this.workspace3, 'latestInsight').andReturn(backboneFixtures.activity.insightOnGreenplumDataSource());

        this.collection = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2, this.workspace3]);
        this.collection.loaded = true;
        this.view = new chorus.views.DashboardProjectList({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.noFilter = true;
            this.view.render();
        });

        it("displays the name of the workspace as a link", function() {
            expect(this.view.$(".project_name span").eq(0).text()).toBe("Broccoli");
            expect(this.view.$(".project_name").eq(0).attr('href')).toBe(this.workspace1.showUrl());

            expect(this.view.$(".project_name span").eq(1).text()).toBe("Camels");
            expect(this.view.$(".project_name").eq(1).attr('href')).toBe(this.workspace2.showUrl());
        });

        describe("data row section", function () {
            it("displays the statistics of each workspace", function() {
                expect(this.view.$(".data_row.first .left_side .number .insight_link").eq(0).text()).toBe("1");
                expect(this.view.$(".data_row.first .left_side .number .insight_link").eq(1).text()).toBe("2");

                expect(this.view.$(".data_row.first .left_side .element").eq(0).text()).toBe("Insight");
                expect(this.view.$(".data_row.first .left_side .element").eq(1).text()).toBe("Insights");

                expect(this.view.$(".data_row.first .right_side .number .workfile_link").eq(0).text()).toBe("1");
                expect(this.view.$(".data_row.first .right_side .number .workfile_link").eq(1).text()).toBe("2");

                expect(this.view.$(".data_row.first .right_side .element").eq(0).text()).toBe("Workfile");
                expect(this.view.$(".data_row.first .right_side .element").eq(1).text()).toBe("Workfiles");

                expect(this.view.$(".data_row.last .left_side .number .dataset_list").eq(0).text()).toBe("1");
                expect(this.view.$(".data_row.last .left_side .number .dataset_list").eq(1).text()).toBe("2");

                expect(this.view.$(".data_row.last .left_side .element").eq(0).text()).toBe("Dataset");
                expect(this.view.$(".data_row.last .left_side .element").eq(1).text()).toBe("Datasets");

                expect(this.view.$(".data_row.last .right_side .number .member_list").eq(0).text()).toBe("1");
                expect(this.view.$(".data_row.last .right_side .number .member_list").eq(1).text()).toBe("2");

                expect(this.view.$(".data_row.last .right_side .element").eq(0).text()).toBe("Member");
                expect(this.view.$(".data_row.last .right_side .element").eq(1).text()).toBe("Members");
            });
        });

        describe("latest insight section", function () {
            it("shows the counts for latest comments and insights", function () {
                expect(this.view.$(".insight_row .main_row").eq(0).text().trim()).toBe("8 Comments and 1 Insight");
                expect(this.view.$(".insight_row .main_row").eq(1).text().trim()).toBe("8 Comments and 1 Insight");
            });

            it("shows the counts for latest comments and insights", function () {
                expect(this.view.$(".insight_row .sub_row").eq(0).text().trim()).toBe("in the last 7 days");
            });
        });

        /*
        describe("filtering", function () {
            context("when filter:members_only is triggered on the collection", function () {
                beforeEach(function () {
                    this.collection.trigger('filter:members_only');
                    this.renderedProjects = _.map(this.view.projectCards, function (view) {
                        return view.model;
                    });
                });

                it("renders only cards for workspaces that the current user is a member of", function () {
                    expect(this.renderedProjects).toContain(this.workspace1);
                    expect(this.renderedProjects).not.toContain(this.workspace2);
                    expect(this.renderedProjects).toContain(this.workspace3);
                });

                context("and then filter:all is triggered on the collection", function () {
                    beforeEach(function () {
                        this.collection.trigger('filter:all');
                        this.renderedProjects = _.map(this.view.projectCards, function (view) {
                            return view.model;
                        });
                    });

                    it("renders cards for all workspaces in the collection", function () {
                        expect(this.renderedProjects).toContain(this.workspace1);
                        expect(this.renderedProjects).toContain(this.workspace2);
                        expect(this.renderedProjects).toContain(this.workspace3);
                    });
                });
            });
        });
        */
    });
});