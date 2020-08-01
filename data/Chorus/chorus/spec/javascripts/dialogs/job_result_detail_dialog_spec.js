describe("chorus.dialogs.JobResultDetail", function () {
    context("when a job is passed in", function () {
        beforeEach(function () {
            this.job = backboneFixtures.job();
            this.dialog = new chorus.dialogs.JobResultDetail({job: this.job});
            this.dialog.render();
        });

        it("displays the job name in the title", function () {
            expect(this.dialog.$('.dialog_header h1')).toContainTranslation("job.result_details.title", {jobName: this.job.name()});
        });

        it("fetches the latest result for the model", function () {
            expect(this.dialog.model).toHaveBeenFetched();
            expect(this.server.lastFetch().url).toHaveUrlPath('/jobs/' + this.job.id + '/job_results/latest');
        });

        context("when the fetch completes", function () {
            beforeEach(function () {
                this.server.completeFetchFor(this.dialog.model, backboneFixtures.jobResult());
            });

            it("displays each job task result", function () {
                expect(this.dialog.$('tbody tr').eq(0)).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('jobTaskResults')[0].finishedAt));
                expect(this.dialog.$('tbody tr').eq(1)).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('jobTaskResults')[1].finishedAt));
            });

            context("when a job task has a payload result id", function () {
                it("shows a link to the payload result", function () {
                    expect(this.dialog.$('.workflow_result')).toExist();
                });
            });
            

            it("displays the start, finish, and duration timing for overall job", function () {
                expect(this.dialog.$('.job_started_at')).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('startedAt')));
                expect(this.dialog.$('.job_finished_at')).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('finishedAt')));
                expect(this.dialog.$('.job_duration')).toContainText(Handlebars.helpers.displayDuration(this.dialog.model.get('finishedAt'), this.dialog.model.get('startedAt')));
            });

        });
    });

    context("when a job result is passed in", function () {
        beforeEach(function () {
            this.job = backboneFixtures.job();
            this.jobResult = backboneFixtures.jobResult();
            this.jobResult.set("job", this.job);
            this.dialog = new chorus.dialogs.JobResultDetail({model: this.jobResult});
            this.dialog.render();
        });

        it("displays the job name in the title", function () {
            expect(this.dialog.$('.dialog_header h1')).toContainTranslation("job.result_details.title", {jobName: this.job.name()});
        });

        it("displays the started and finished times", function () {
            expect(this.dialog.$('.job_started_at')).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('startedAt')));
            expect(this.dialog.$('.job_finished_at')).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('finishedAt')));
        });

        it("displays each job task result", function () {
            expect(this.dialog.$('tbody tr').eq(0)).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('jobTaskResults')[0].finishedAt));
            expect(this.dialog.$('tbody tr').eq(1)).toContainText(Handlebars.helpers.displayTimestamp(this.dialog.model.get('jobTaskResults')[1].finishedAt));
        });
    });
});