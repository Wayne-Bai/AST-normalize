describe("chorus.pages.JobsShowPage", function () {
    beforeEach(function () {
        this.clock = this.useFakeTimers();
        this.modalSpy = stubModals();
        this.model = backboneFixtures.job();
        this.task = this.model.tasks().at(0);
        this.workspace = this.model.workspace();
        chorus.page = this.page = new chorus.pages.JobsShowPage(this.workspace.id, this.model.get('id'));
    });

    afterEach(function () {
        delete chorus.page;
    });

    it("should have the right constructor name", function () {
        expect(this.page.constructorName).toBe("JobsShowPage");
    });

    context("after the fetch completes with no tasks", function () {
        beforeEach(function () {
            this.server.completeFetchFor(this.model, backboneFixtures.job({tasks: []}));
        });

        it("creates quickstart content", function () {
            expect(this.page.mainContent.content).toBeA(chorus.views.JobQuickstart);
        });

        context("when 'invalidated' is triggered on the job", function() {
            beforeEach(function() {
                this.page.model.trigger('invalidated');
            });

            it("switches out main content for the list view", function() {
                expect(this.page.mainContent.content).toBeA(chorus.views.PageItemList);
            });
        });
    });

    context("> after the fetch completes with tasks", function () {
        beforeEach(function() {
            this.server.completeFetchFor(this.model);
        });

        context("after the workspace fetch completes", function () {
            beforeEach(function () {
                this.server.completeFetchFor(this.workspace);
            });

            it("has a titlebar", function() {
                expect(this.page.$(".page_sub_header")).toContainText(this.workspace.name());
            });
        });

        it("should create the subnav on the jobs tab", function () {
            expect(this.page.subNav).toBeA(chorus.views.SubNav);
        });

        it("creates main content", function () {
            expect(this.page.mainContent).toBeA(chorus.views.MainContentList);
        });

        it("displays the Job's name in the header", function () {
            var header = this.page.mainContent.contentHeader.$("h1");
            expect(header).toContainText(this.model.get('name'));
        });

        it("displays the job creator in the header", function () {
            expect(this.page.mainContent.contentHeader.$('.owner')).toContainText(this.model.owner().displayName());
            expect(this.page.mainContent.contentHeader.$('.owner a').attr('href')).toEqual(this.model.owner().showUrl());
        });

        context("when the job has a last run", function () {
            itBehavesLike.aDialogLauncher("a.last_run_date", chorus.dialogs.JobResultDetail);

            context("when the last run was a failure", function () {
                beforeEach(function () {
                    this.model.set("lastRunFailed", true);
                    this.page = new chorus.pages.JobsShowPage(this.workspace.id, this.model.get('id'));
                    this.server.completeFetchFor(this.model);
                });

                it("should include link to show details", function () {
                    expect(this.page.$('a.last_run_date')).toContainTranslation('job.status.job_failed');
                });
            });

            context("when the last run was a success", function () {
                beforeEach(function () {
                    this.model.set("lastRunFailed", false);
                    this.page = new chorus.pages.JobsShowPage(this.workspace.id, this.model.get('id'));
                    this.server.completeFetchFor(this.model);
                });

                it("should include link to show details", function () {
                    expect(this.page.$('a.last_run_date')).toContainTranslation('job.status.job_succeeded');
                });
            });
        });

        it("creates the correct content details", function() {
            expect(this.page.mainContent.contentDetails).toBeA(chorus.views.JobContentDetails);
            expect(this.page.mainContent.contentDetails.model.get("id")).toBe(this.model.get("id"));
        });

        describe("when the job_task:selected event is triggered on the list view", function () {
            beforeEach(function() {
                chorus.PageEvents.trigger("job_task:selected", this.task);
            });

            it("sets the resource of the sidebar", function() {
                expect(this.page.sidebar.model).toBe(this.task);
            });

            it('instantiates the sidebar view', function() {
                expect(this.page.sidebar).toBeDefined();
                expect(this.page.sidebar).toBeA(chorus.views.JobTaskSidebar);
                expect(this.page.$("#sidebar .sidebar_content.primary")).not.toBeEmpty();
            });

            describe("when job_task:selected event is triggered and there is already a sidebar", function() {
                beforeEach(function() {
                    this.oldSidebar = this.page.sidebar;
                    spyOn(this.page.sidebar, 'teardown');
                    chorus.PageEvents.trigger("job_task:selected", this.task);
                });

                it("tears down the old sidebar", function() {
                    expect(this.oldSidebar.teardown).toHaveBeenCalled();
                });
            });
        });

        describe("polling", function () {
            beforeEach(function () {
                spyOn(this.page.model, 'fetch');
            });

            it("waits for an interval", function () {
                expect(this.page.model.fetch).not.toHaveBeenCalled();
                this.clock.tick(50001);
                expect(this.page.model.fetch).toHaveBeenCalled();
            });

            it("ceases with teardown", function () {
                this.page.teardown();
                this.page.model.fetch.reset();
                this.clock.tick(200001);
                expect(this.page.model.fetch).not.toHaveBeenCalled();
            });
        });

        describe("when the job tasks are reordered", function () {
            beforeEach(function () {
                spyOn(this.page.mainContent.content, 'render');
                this.page.$('.arrows:eq(0) .move_down_arrow').click();

                var responseModel = this.model.clone();
                responseModel.attributes.tasks[0].name = 'Shenanigans';
                responseModel.attributes.tasks = [responseModel.attributes.tasks[0]];
                this.server.lastUpdateFor(this.model).succeed(responseModel);
            });

            it("respects the response content", function () {
                expect(this.page.$el).toContainText('Shenanigans');
            });
        });

        describe("when the job is edited", function () {
            beforeEach(function () {
                this.newJobName = "An amazing job with a unique name";
                this.page.$('.edit_schedule').click();
                var modal = this.modalSpy.modals()[0];
                modal.$('.name').val(this.newJobName);
                modal.$('form').submit();
                this.server.lastUpdateFor(this.model).succeed();
            });

            it("rerenders the page's content header", function () {
                expect(this.page.$el).toContainText(this.newJobName);
            });
        });
    });

});
