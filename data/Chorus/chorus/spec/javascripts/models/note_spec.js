describe("chorus.models.Note", function() {
    function createSubmitSpy() {
        var fakePromise = jasmine.createSpyObj('submitResult', ['done', 'fail']);
        fakePromise.done.andReturn(fakePromise);
        fakePromise.fail.andReturn(fakePromise);

        var spy = jasmine.createSpy('submit').andReturn(fakePromise);
        spy.promise = fakePromise;
        return spy;
    }

    beforeEach(function() {
        var activity = backboneFixtures.activity.noteOnGreenplumDataSource({
            id: '41',
            actor: {
                id: "45",
                firstName: "LeBron",
                lastName: "James"
            }
        });

        this.model = activity.toNote();
    });

    describe("#urlTemplate", function() {
        it("users the right url of new note", function() {
            expect(this.model.url()).toContain("/notes/41");
        });

        it("has the right url if it is a file", function() {
            expect(this.model.url({isFile: true})).toContain("/notes/41/attachments");
        });
    });

    describe("validation", function() {
        it("should return a falsy value if there is no body", function() {
            this.model.set({ body: "" });
            expect(this.model.performValidation()).toBeFalsy();
        });
        it("should return a truthy value if there is a body", function() {
            this.model.set({ body: "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });
    });

    describe("file upload handling", function() {
        beforeEach(function() {
            this.submitObject1 = createSubmitSpy();
            this.submitObject2 = createSubmitSpy();
            this.fileUpload1 = new chorus.models.CommentFileUpload({submit: this.submitObject1});
            this.fileUpload2 = new chorus.models.CommentFileUpload({submit: this.submitObject2});
            this.model.addFileUpload(this.fileUpload1);
            expect(this.model.files.length).toBe(1);
        });

        describe("removeFileUpload", function() {
            beforeEach(function() {
                this.fileUpload = new chorus.models.CommentFileUpload({});
                this.model.removeFileUpload(this.fileUpload1);
            });

            it("removes the object from the list of files", function() {
                expect(this.model.files.length).toBe(0);
            });
        });

        describe("addFileUpload", function() {
            beforeEach(function() {
                this.model.addFileUpload(this.fileUpload2);
            });

            it("adds the object from the list of files", function() {
                expect(this.model.files.length).toBe(2);
            });
        });

        describe("saving the dataset attachments", function() {
            it("assigns the 'datasetIds' field as a list of dataset ids", function() {
                this.model.datasets = new chorus.collections.WorkspaceDatasetSet([
                    backboneFixtures.workspaceDataset.datasetTable({ objectName: "table_a", id: 'a'}),
                    backboneFixtures.workspaceDataset.datasetTable({ objectName: "table_b", id: 'b'}),
                    backboneFixtures.workspaceDataset.datasetTable({ objectName: "table_c", id: 'c'})
                ]);

                this.model.save();

                expect(this.model.get("datasetIds")).toEqual(["a","b","c"]);
            });
        });

        describe("saving the workfile attachments", function() {
            it("assigns the 'workfileIds' field as a list of workfile ids", function() {
                this.model1 = backboneFixtures.workfile.sql();
                this.model2 = backboneFixtures.workfile.text();
                this.model3 = backboneFixtures.workfile.binary();

                this.model.workfiles = new chorus.collections.WorkfileSet([this.model1, this.model2, this.model3], {workspaceId: 1234});

                this.model.save();

                expect(this.model.get("workfileIds")).toEqual([this.model1.get("id"),this.model2.get("id"),this.model3.get("id")]);
            });
        });

        describe("saveFiles", function() {
            var errorResponse = JSON.stringify({
                errors: {
                    fields: {
                        contents_file_size: {
                            LESS_THAN: {
                                message: "file_size_exceeded",
                                count: "5242880 Bytes"
                            }
                        }
                    }
                }
            });

            beforeEach(function() {
                this.model.addFileUpload(this.fileUpload2);
                this.fileUploadSuccessSpy = jasmine.createSpy('fileUploadSuccess');
                this.fileUploadFailedSpy = jasmine.createSpy('fileUploadFailed');
                this.fileUploadDoneSpy = jasmine.createSpy('fileUploadDone');
                this.model.bind('fileUploadSuccess', this.fileUploadSuccessSpy);
                this.model.bind('fileUploadFailed', this.fileUploadFailedSpy);
                this.model.bind('fileUploadDone', this.fileUploadDoneSpy);
                this.model.saveFiles();
            });

            it("calls submit on each file", function() {
                expect(this.fileUpload1.data.submit).toHaveBeenCalled();
                expect(this.fileUpload2.data.submit).toHaveBeenCalled();
            });

            describe("when a cache-busting query param is included", function() {
                beforeEach(function() {
                    this.model.urlParams = { iebuster: "123" };
                    this.model.saveFiles();
                });

                it("sets the url of each upload", function() {
                    expect(this.fileUpload1.data.url).toMatchUrl('/notes/41/attachments?iebuster=123');
                    expect(this.fileUpload2.data.url).toMatchUrl('/notes/41/attachments?iebuster=123');
                });
            });


            describe("when all saves succeed", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.lastCall().args[0]();
                    this.submitObject2.promise.done.lastCall().args[0]();
                });

                it("triggers fileUploadSuccess", function() {
                    expect(this.fileUploadSuccessSpy).toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy).not.toHaveBeenCalled();
                    expect(this.fileUploadSuccessSpy.calls.count()).toBe(1);
                });

                it("triggers fileUploadDone", function() {
                    expect(this.fileUploadDoneSpy).toHaveBeenCalled();
                });
            });

            describe("when some of the saves have api failure", function() {
                beforeEach(function() {
                    this.submitObject1.promise.fail.lastCall().args[0]({responseText: errorResponse});
                    this.submitObject2.promise.fail.lastCall().args[0]({responseText: errorResponse});
                });
                it("triggers fileUploadFailed", function() {
                    expect(this.fileUploadSuccessSpy).not.toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy).toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy.calls.count()).toBe(1);
                });

                it("triggers fileUploadDone", function() {
                    expect(this.fileUploadDoneSpy).toHaveBeenCalled();
                });

                it("puts the error on the file object", function() {
                    expect(_.first(this.fileUpload2.serverErrorMessages())).toEqual(
                        'Contents file size must be less than 5 MB'
                    );
                });

                it("copies the errors to the model", function() {
                    expect(_.first(this.model.serverErrorMessages())).toEqual(
                        'Contents file size must be less than 5 MB'
                    );
                });
            });

            describe("when some of the saves have failed", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.lastCall().args[0]();
                    this.submitObject2.promise.fail.lastCall().args[0]({responseText: errorResponse});
                });

                it("triggers fileUploadFailed", function() {
                    expect(this.fileUploadSuccessSpy).not.toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy).toHaveBeenCalled();
                    expect(this.fileUploadFailedSpy.calls.count()).toBe(1);

                });
            });

            describe("when the file upload is cancelled", function() {
                beforeEach(function() {
                    this.submitObject1.promise.done.lastCall().args[0]();
                    this.submitObject2.promise.fail.lastCall().args[0]({}, 'abort');
                });

                it("sets serverErrors on the model", function() {
                    expect(this.model.serverErrorMessages()[0]).toMatchTranslation('notes.new_dialog.upload_cancelled');
                });
            });

            describe("when both uploads are cancelled", function() {
                beforeEach(function() {
                    this.submitObject1.promise.fail.lastCall().args[0]({}, 'abort');
                    this.submitObject2.promise.fail.lastCall().args[0]({}, 'abort');
                });

                it("only has the cancel message once", function() {
                    expect(_.keys(this.model.serverErrors).length).toBe(1);
                });
            });
        });
    });
});
