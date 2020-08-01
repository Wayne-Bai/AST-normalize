describe("chorus.views.JobSidebar", function () {
    beforeEach(function () {
        this.job = backboneFixtures.job();
        this.view = new chorus.views.JobSidebar({model: this.job});
        this.modalSpy = stubModals();
        this.view.render();
    });

    context("when the user has workspace permissions", function () {
        beforeEach(function () {
            spyOn(this.job.workspace(), 'canUpdate').andReturn(true);
            this.view.render();
        });

        context("when the job runs only on Demand", function () {
            beforeEach(function () {
                this.job.set('intervalUnit', 'on_demand');
                this.view.render();
            });
    
            it("hides 'enable'/'disable' actions", function () {
                expect(this.view.$('.disable')).not.toExist();
                expect(this.view.$('.enable')).not.toExist();
            });
        });
    
        context("when the job is enabled", function () {
            beforeEach(function () {
                this.job.set("enabled", true);
            });
    
            it("shows a disable link", function () {
                expect(this.view.$('.disable')).toExist();
                expect(this.view.$('.enable')).not.toExist();
            });
    
            context("when disable is clicked", function() {
                beforeEach(function() {
                    spyOn(this.job, "save");
                    this.view.$('.disable').click();
                });
    
                it("makes a request to disable the job", function() {
                    var calledArgs = this.job.save.lastCall().args;
                    expect(calledArgs[0]).toEqual({ enabled: false });
                });
            });
        });
    
        context("when the job is disabled", function () {
            beforeEach(function () {
                this.job.set('enabled', false);
            });
    
            it("shows an enable link", function () {
                expect(this.view.$('.enable')).toExist();
                expect(this.view.$('.disable')).not.toExist();
            });
    
            context("when enable is clicked", function() {
                beforeEach(function() {
                    spyOn(this.job, "save").andCallThrough();
                    this.view.$('.enable').click();
                });
    
                it("makes a request to enable the job", function() {
                    var calledArgs = this.job.save.lastCall().args;
                    expect(calledArgs[0]).toEqual({ enabled: true });
                });
    
                context("when the save fails with a validation error", function () {
                    beforeEach(function () {
                        this.server.lastUpdateFor(this.job).failUnprocessableEntity();
                    });
    
                    it("launches the configuration dialog with the error shown", function () {
                        expect(this.modalSpy).toHaveModal(chorus.dialogs.ConfigureJob);
                        expect(this.modalSpy.modals().length).toBe(1);
                    });
                });
            });
        });

        describe("clicking 'Run Now'", function () {
            beforeEach(function () {
                spyOn(this.view.model, 'run').andCallThrough();
                this.view.$('a.run_job').click();
                this.server.lastCreate().succeed(this.view.model.set('status', 'enqueued'));
            });

            it("runs the job", function () {
                expect(this.view.model.run).toHaveBeenCalled();
            });
    
            it("disables the 'Run Now' button", function () {
                expect(this.view.$("a.run_job")).not.toExist();
                expect(this.view.$("span.run_job")).toHaveClass('disabled');
            });
    
            it("enables the 'Stop' button", function () {
                expect(this.view.$("a.stop_job")).toExist();
                expect(this.view.$("span.stop_job")).not.toHaveClass('disabled');
            });
    
            describe("clicking the 'Stop' button", function () {
                beforeEach(function () {
                    spyOn(this.view.model, 'stop').andCallThrough();
                    this.view.$('a.stop_job').click();
                    this.server.lastCreate().succeed(this.view.model.set('status', 'stopping'));
                });
    
                it("stops the job", function () {
                    expect(this.view.model.stop).toHaveBeenCalled();
                });
    
                it("disables the run and stop buttons", function () {
                    expect(this.view.$("a.run_job")).not.toExist();
                    expect(this.view.$("span.run_job")).toHaveClass('disabled');
                    expect(this.view.$("a.stop_job")).not.toExist();
                    expect(this.view.$("span.stop_job")).toHaveClass('disabled');
                });
            });
        });
    
        describe("clicking ConfigureJob", function () {
            itBehavesLike.aDialogLauncher("a.edit_job", chorus.dialogs.ConfigureJob);
        });
    
        describe("clicking 'Delete Job'", function () {
            itBehavesLike.aDialogLauncher("a.delete_job", chorus.alerts.JobDelete);
        });
    });

    context("when the user does not have workspace permissions", function () {
        beforeEach(function () {
            spyOn(this.job.workspace(), 'canUpdate').andReturn(false);
            this.view.render();
        });

        it("should not display the edit/run/stop/disable/delete links", function () {
            expect(this.view.$('.actions a')).not.toExist();
        });
    });

    describe("activities", function() {
        it("fetches the activities for the job", function() {
            expect(this.job.activities()).toHaveBeenFetched();
        });

        context("when the activity fetch completes", function() {
            beforeEach(function() {
                var activityOne = backboneFixtures.activity.jobSucceeded();
                var activityTwo = backboneFixtures.activity.jobFailed();
                this.server.completeFetchFor(this.job.activities(), [activityOne, activityTwo]);
            });

            it("renders an activity list inside the tabbed area", function() {
                expect(this.view.tabs.activity).toBeA(chorus.views.ActivityList);
                expect(this.view.$(".tabbed_content_area .activity_list")[0]).toBe(this.view.tabs.activity.el);
            });
        });
    });
});
