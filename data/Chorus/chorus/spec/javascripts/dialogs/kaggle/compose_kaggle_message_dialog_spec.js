describe("chorus.dialogs.ComposeKaggleMessage", function () {
    beforeEach(function () {
        this.qtip = stubQtip(".more-info");
        setLoggedInUser(backboneFixtures.user({email:'user@chorus.com'}));
        this.kaggleUser = new chorus.models.KaggleUser({fullName:"Batman"});
        this.workspace = backboneFixtures.workspace();
        this.dialog = new chorus.dialogs.ComposeKaggleMessage({
            collection:new chorus.collections.KaggleUserSet(this.kaggleUser),
            pageModel:this.workspace
        });
        this.dialog.render();
    });

    describe('#render', function () {
        it("sets the default value of the from field to the users email", function () {
            expect(this.dialog.$('input[name=replyTo]').val()).toBe('user@chorus.com');
        });

        it("displays the name of the kaggle recipient", function () {
            expect(this.dialog.$('.kaggle_recipient')).toContainText("Batman");
        });

        context("when more than one recipient", function () {
            beforeEach(function () {
                this.kaggleUsers = new chorus.collections.KaggleUserSet
                    ([new chorus.models.KaggleUser({fullName:"Batman"}),
                        new chorus.models.KaggleUser({fullName:"Catwoman"})]
                    );
                this.dialog = new chorus.dialogs.ComposeKaggleMessage({
                    collection: this.kaggleUsers,
                    pageModel: this.workspace
                });
                this.dialog.render();
            });

            it("displays the name of the kaggle recipient", function () {
                expect(this.dialog.$('.kaggle_recipient')).toContainText("Batman, Catwoman");
            });

            context("when the recipient names run over the limit", function () {
                beforeEach(function () {
                    this.dialog = new chorus.dialogs.ComposeKaggleMessage({
                        collection: this.kaggleUsers,
                        pageModel: this.workspace,
                        maxRecipientCharacters:10
                    });
                    this.dialog.render();
                });

                it("displays the name of some kaggle recipients, and a more link", function () {
                    expect(this.dialog.$('.kaggle_recipient.full')).toHaveClass("hidden");
                    expect(this.dialog.$('.kaggle_recipient.short')).not.toHaveClass("hidden");
                    expect(this.dialog.$('.kaggle_recipient.full')).toContainText("Batman, Catwoman show less");
                    expect(this.dialog.$('.kaggle_recipient.short')).toContainText("Batman and 1 more");
                });

                it("shows the remaining names when you click on more", function () {
                    this.dialog.$(".showMore").click();
                    expect(this.dialog.$('.kaggle_recipient.full')).not.toHaveClass("hidden");
                    expect(this.dialog.$('.kaggle_recipient.short')).toHaveClass("hidden");
                });

                describe("#combineNames", function () {
                    it("Returns the abbreviated list of recipients with a more link", function () {
                        expect(this.dialog.combineNames(this.kaggleUsers.models)).toEqual(
                            {
                                short:"Batman",
                                full:"Batman, Catwoman",
                                moreCount:1
                            }
                        );
                    });
                });
            });
        });

        it("should have a link to 'insert dataset schema'", function () {
            expect(this.dialog.$("a.insert_dataset_schema")).toContainTranslation("kaggle.compose.insert_schema");
        });

        context("when clicking 'insert dataset schema' link", function () {
            var modalSpy;
            beforeEach(function () {
                modalSpy = stubModals();
                spyOn(chorus.Modal.prototype, 'launchSubModal').andCallThrough();
                spyOn(this.dialog, "datasetsChosen").andCallThrough();
                this.dialog.$("a.insert_dataset_schema").click();
            });

            it("should launch the dataset picker dialog", function () {
                expect(chorus.Modal.prototype.launchSubModal).toHaveBeenCalled();
                expect(modalSpy).toHaveModal(chorus.dialogs.KaggleInsertDatasetSchema);
            });

            it("should not set the pre-selected dataset", function () {
                expect(chorus.modal.options.defaultSelection).toBeUndefined();
            });

            describe("when a dataset is selected", function () {
                var datasets;
                beforeEach(function () {
                    datasets = [
                        backboneFixtures.workspaceDataset.datasetTable({ objectName:"i_bought_a_zoo" }),
                        backboneFixtures.workspaceDataset.datasetTable({ objectName:"bourne_identity" })
                    ];
                    chorus.modal.trigger("datasets:selected", datasets);
                });

                it("should re-enable the submit button", function () {
                    expect(this.dialog.$("button.submit")).toBeEnabled();
                });

                it("fetches the columns for each of the selected datasets", function () {
                    _.each(datasets, function (dataset) {
                        expect(dataset.columns()).toHaveBeenFetched();
                    });
                });

                describe("when the fetches complete successfully", function () {
                    beforeEach(function () {
                        _.each(datasets, function (dataset, i) {
                            this.server.completeFetchAllFor(dataset.columns(), [
                                backboneFixtures.databaseColumn({name:"Rhino_" + i, typeCategory:"STRING" }),
                                backboneFixtures.databaseColumn({name:"Sloth_" + i, typeCategory:"WHOLE_NUMBER" })
                            ]);
                            this.server.completeFetchFor(dataset.statistics(), backboneFixtures.datasetStatisticsTable({ rows:11 * (i + 1) }));
                        }, this);
                    });

                    it("inserts the chosen schemas into the text field", function () {
                        var message = this.dialog.$('textarea[name=htmlBody]').val();
                        expect(message).toMatch("i_bought_a_zoo");
                        expect(message).toMatch("bourne_identity");
                        expect(message).toMatch(/Rhino_0\s*string/);
                        expect(message).toMatch(/Rhino_1\s*string/);
                        expect(message).toMatch(/Sloth_0\s*numeric/);
                        expect(message).toMatch(/Sloth_1\s*numeric/);
                    });

                    it("displays the number of columns and the number of rows next to each table", function () {
                        var message = this.dialog.$('textarea[name=htmlBody]').val();
                        expect(message).toMatch(/i_bought_a_zoo\s+# of columns: 2, # of rows: 11/);
                        expect(message).toMatch(/bourne_identity\s+# of columns: 2, # of rows: 22/);
                    });

                    describe("when you fetch MORE datasets", function () {
                        it("doesn't add the old ones again", function () {
                            chorus.modal.trigger("datasets:selected", datasets);
                            expect(this.dialog.requiredDatasets.size()).toBe(datasets.length * 2); // 1 for statistics, 1 for columns
                        });
                    });
                });

                describe("when some of the fetches don't complete", function () {
                    beforeEach(function () {
                        this.server.completeFetchAllFor(datasets[0].columns(), backboneFixtures.databaseColumnSet([
                            {name:"Rhino_0", description:"awesome", typeCategory:"STRING" },
                            {name:"Sloth_0", description:"lazy", typeCategory:"WHOLE_NUMBER" }
                        ]));
                    });

                    it("doesn't update the message", function () {
                        var message = this.dialog.$('textarea[name=htmlBody]').val();
                        expect(message).not.toContain("Rhino_0");
                    });
                });
            });
        });

        it('shows a tooltip with Kaggle tips', function () {
            this.dialog.$(".more-info").mouseenter();
            expect(this.qtip.find('div')).toContainText("Tips for proposing a project");
        });
    });

    describe("saving", function () {
        context("with valid inputs", function () {
            beforeEach(function () {
                this.dialog.$('input[name=replyTo]').val('me@somewhere.com');
                this.dialog.$('input[name=subject]').val('Something cool');
                this.dialog.$('textarea[name=htmlBody]').val('Some stuff');

                spyOn(chorus.models.KaggleMessage.prototype, "save").andCallThrough();
                spyOn(this.dialog, "closeModal");
                spyOn(chorus, "toast");
                this.dialog.$('button.submit').click();
            });

            it("adds a spinner to the submit button", function () {
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            });

            it("saves the message with the new values", function () {
                var model = this.dialog.model;
                expect(model.save).toHaveBeenCalled();

                expect(model.get('replyTo')).toEqual('me@somewhere.com');
                expect(model.get('subject')).toEqual('Something cool');
                expect(model.get('htmlBody')).toEqual('Some stuff');
            });

            it("closes the dialog box if saved successfully", function () {
                this.dialog.model.trigger("saved");
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("shows a toast message if saved successfully", function () {
                this.dialog.model.trigger("saved");
                expect(chorus.toast).toHaveBeenCalledWith("kaggle.compose.success.toast", {toastOpts: {type: "success"}});
            });

            context("when the dialog has errors", function () {
                it("clears any errors on the model when the dialog is closed", function () {
                    this.dialog.model.serverErrors = { name:"wrong name" };
                    this.dialog.$("button.cancel").click();
                    expect(_.isEmpty(this.dialog.model.serverErrors)).toBeTruthy();
                });

            });

            describe("when the save fails", function () {
                beforeEach(function () {
                    this.server.lastCreateFor(this.dialog.model).failUnprocessableEntity({ fields:{ a:{ BLANK:{} } } });
                });

                it("displays the errors", function () {
                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                    expect(this.dialog.$(".errors")).toContainText("A can't be blank");
                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                    expect(this.dialog.$("button.submit").text()).toMatchTranslation("kaggle.compose.submit");
                });
            });
        });

        context("with invalid inputs", function() {
            beforeEach(function () {
                this.dialog.$('input[name=replyTo]').val('AAA');
                this.dialog.$('input[name=subject]').val('');
                this.dialog.$('textarea[name=htmlBody]').val('');
                spyOn(this.dialog, "clearServerErrors");
                spyOn(chorus.models.KaggleMessage.prototype, "save").andCallThrough();
                this.dialog.$('button.submit').click();
            });

            it("marks the inputs invalid", function() {
                expect(this.dialog.$("input[name=replyTo]")).toHaveClass("has_error");
                expect(this.dialog.$("input[name=subject]")).toHaveClass("has_error");
                expect(this.dialog.$("textarea[name=htmlBody]")).toHaveClass("has_error");
            });

            it("stops the loading spinner", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            });
        });
    });
});