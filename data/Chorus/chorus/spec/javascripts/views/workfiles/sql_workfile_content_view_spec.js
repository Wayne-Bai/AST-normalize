describe("chorus.views.SqlWorkfileContentView", function() {
    beforeEach(function() {
        this.workfile = backboneFixtures.workfile.sql({ versionInfo: { content: "select * from foos where bar_id = 1;" } });
        this.schema = backboneFixtures.schema({
            id: '4',
            name: "schema",
            database: {
                id: '3',
                name: "db",
                dataSource: {
                    id: '2',
                    name: "data source"
                }
            }
        });
        spyOn(this.workfile, 'executionSchema').andCallFake(_.bind(function() {return this.schema;}, this));
        spyOn(chorus.views.SqlWorkfileContent.prototype, "runInDefault").andCallThrough();
        spyOn(chorus.views.SqlWorkfileContent.prototype, "runSelected").andCallThrough();
        this.view = new chorus.views.SqlWorkfileContent({model: this.workfile});
    });

    describe("initialization", function() {
        it("has a TextWorkfileContent view", function() {
            expect(this.view.textContent).toBeA(chorus.views.TextWorkfileContent);
            expect(this.view.textContent.options.hotkeys).toBe(this.view.hotkeys);
        });

        it("has a ResultsConsole view", function() {
            expect(this.view.resultsConsole).toBeA(chorus.views.ResultsConsole);
        });

        it("enables the resize area of the results console", function() {
            expect(this.view.resultsConsole.options.enableResize).toBeTruthy();
        });

        it("displays the expander of the results console", function() {
            expect(this.view.resultsConsole.options.enableExpander).toBeTruthy();
        });

        it("declares hotkeys", function() {
            expect(this.view.hotkeys.r).toBeDefined();
        });
    });

    describe("hotkeys", function() {
        beforeEach(function() {
            // stop actually calling through (there's no clean way to do this in Jasmine)
            this.view.runInDefault.andReturn();
            this.view.runSelected.andReturn();
            spyOn(chorus.PageEvents, "trigger").andCallThrough();
        });

        it("correctly binds the R hotkey to runInDefault", function() {
            chorus.triggerHotKey('r');
            expect(chorus.PageEvents.trigger.nthCall(0).args[0]).toBe("file:runCurrent");
            expect(this.view.runInDefault).toHaveBeenCalled();
        });

        it("correctly binds the E hotkey to runSelected", function() {
            chorus.triggerHotKey('e');
            expect(chorus.PageEvents.trigger.nthCall(0).args[0]).toBe("file:runSelected");
            expect(this.view.runSelected).toHaveBeenCalled();
        });
    });

    describe("executing the workfile", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, "trigger").andCallThrough();
            this.view.render();
            this.view.textContent.editor.setValue("select * from foos");
        });

        context("when no execution is outstanding", function() {
            describe("running in another schema", function() {
                beforeEach(function() {
                    chorus.PageEvents.trigger("file:runInSchema", {
                        schemaId: '6'
                    });
                });

                it("creates a task with the right parameters", function() {
                    expect(this.view.task.get("sql")).toBe("select * from foos");
                    expect(this.view.task.get("schemaId")).toBe("6");
                    expect(this.view.task.get("workfile").id).toBe(this.workfile.id);
                    expect(this.view.task.has("checkId")).toBeTruthy();
                });
            });

            describe("running in the default schema", function() {
                context("when the workfile has a schema in which to execute", function() {
                    beforeEach(function() {
                        spyOn(this.view.resultsConsole, 'render').andCallThrough();
                        chorus.PageEvents.trigger("file:runCurrent");
                    });

                    it("creates a task with the right parameters", function() {
                        expect(this.view.task.get("sql")).toBe("select * from foos");
                        expect(this.view.task.get("schemaId")).toBe("4");
                        expect(this.view.task.get("workfile").id).toBe(this.workfile.id);
                        expect(this.view.task.has("checkId")).toBeTruthy();
                    });

                    it("saves the task", function() {
                        expect(this.server.lastCreate().json()['sql']).toEqual("select * from foos");
                        expect(this.server.lastCreate().url).toBe(this.view.task.url());
                    });

                    it("triggers file:executionStarted", function() {
                        expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("file:executionStarted", jasmine.any(chorus.models.WorkfileExecutionTask));
                    });

                    it("sets the task as the model on the results console", function() {
                        expect(this.view.resultsConsole.model).toBe(this.view.task);
                    });

                    describe("when the task completes successfully", function() {
                        beforeEach(function() {
                            this.spy = jasmine.createSpy();
                            chorus.PageEvents.on("workfile:changed", this.spy);
                            this.server.lastCreate().succeed(backboneFixtures.workfileExecutionResults());
                        });

                        it("triggers file:executionSucceeded", function() {
                            expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("file:executionSucceeded", jasmine.any(chorus.models.WorkfileExecutionTask));
                        });

                        it("sets the executing property to false", function() {
                            expect(this.view.executing).toBeFalsy();
                        });

                        it("triggers workfile:changed", function() {
                            expect(this.spy).toHaveBeenCalledWith(this.workfile);
                        });

                        it("renders the resultsConsole", function() {
                            expect(this.view.resultsConsole.render).toHaveBeenCalled();
                        });
                    });

                    describe("when the task completion fails", function() {
                        beforeEach(function() {
                            this.spy = jasmine.createSpy();
                            chorus.PageEvents.on("workfile:changed", this.spy);
                            this.server.lastCreate().failUnprocessableEntity({ record: "it broke" });
                        });

                        it("triggers file:executionFailed", function() {
                            expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("file:executionFailed", jasmine.any(chorus.models.WorkfileExecutionTask));
                        });

                        it("sets the executing property to false", function() {
                            expect(this.view.executing).toBeFalsy();
                        });
                    });

                    describe("when the task is cancelled", function() {
                        beforeEach(function() {
                            this.spy = jasmine.createSpy();
                            chorus.PageEvents.on("workfile:changed", this.spy);
                            chorus.PageEvents.trigger.reset();
                            this.server.lastCreate().failUnprocessableEntity({ fields: { a: { BLANK: {} } } });
                        });

                        it("triggers file:executionFailed", function() {
                            expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("file:executionFailed", jasmine.any(chorus.models.WorkfileExecutionTask));
                        });

                        it("sets the executing property to false", function() {
                            expect(this.view.executing).toBeFalsy();
                        });

                        it("does not trigger workfile:changed", function() {
                            expect(this.spy).not.toHaveBeenCalled();
                        });
                    });
                });

                context("when the workfile has no schema in which to execute", function() {
                    it("does nothing when ctrl-r is pressed", function() {
                        this.workfile.executionSchema.andReturn(undefined);
                        // should not raise error
                        chorus.PageEvents.trigger("file:runCurrent");
                    });
                });
            });

            describe("with selected text", function() {
                context("when the workfile has an execution schema, and/or the workspace has a sandbox", function() {
                    beforeEach(function() {
                        this.schema = backboneFixtures.schema({id: "77", database: {id: "88", dataSource: {id: "99"}}});
                        spyOn(this.view.textContent.editor, "getSelection").andReturn("select 1 from table");
                    });

                    context("running selected", function() {
                        beforeEach(function() {
                            chorus.PageEvents.trigger("file:runSelected");
                        });

                        it("creates a task with the right parameters", function() {
                            expect(this.view.task.get("sql")).toBe("select 1 from table");
                            expect(this.view.task.has("checkId")).toBeTruthy();
                            expect(this.view.task.get("schemaId")).toBe("77");
                        });

                        it("saves the task", function() {
                            expect(this.server.lastCreate().json()['sql']).toEqual("select 1 from table");
                            expect(this.server.lastCreate().url).toBe(this.view.task.url());
                        });
                    });

                    context("running and downloading", function() {
                        context("all rows", function() {
                            beforeEach(function() {
                                chorus.PageEvents.trigger("file:runAndDownload", {selection: true});
                            });

                            it("creates a task with the right parameters", function() {
                                expect(this.view.task).toBeA(chorus.models.SqlExecutionAndDownloadTask);
                                expect(this.view.task.get("sql")).toBe("select 1 from table");
                                expect(this.view.task.get("schemaId")).toBe("77");
                                expect(this.view.task.get("numOfRows")).toBeUndefined();
                            });
                        });

                        context("some rows", function() {
                            beforeEach(function() {
                                chorus.PageEvents.trigger("file:runAndDownload", {numOfRows: "867", selection: true});
                            });

                            it("creates a task with the right parameters", function() {
                                expect(this.view.task).toBeA(chorus.models.SqlExecutionAndDownloadTask);
                                expect(this.view.task.get("sql")).toBe("select 1 from table");
                                expect(this.view.task.get("schemaId")).toBe("77");
                                expect(this.view.task.get("numOfRows")).toBe("867");
                            });
                        });
                    });
                });
            });

            describe("running and downloading all rows", function() {
                beforeEach(function() {
                    chorus.PageEvents.trigger("file:runAndDownload");
                });

                it("creates a task with the right parameters", function() {
                    expect(this.view.task).toBeA(chorus.models.SqlExecutionAndDownloadTask);
                    expect(this.view.task.get("sql")).toBe("select * from foos");
                    expect(this.view.task.get("schemaId")).toBe("4");
                    expect(this.view.task.get("numOfRows")).toBeUndefined();
                });
            });

            describe("running and downloading some rows", function() {
                beforeEach(function() {
                    chorus.PageEvents.trigger("file:runAndDownload", {numOfRows: "867"});
                });

                it("creates a task with the right parameters", function() {
                    expect(this.view.task).toBeA(chorus.models.SqlExecutionAndDownloadTask);
                    expect(this.view.task.get("sql")).toBe("select * from foos");
                    expect(this.view.task.get("schemaId")).toBe("4");
                    expect(this.view.task.get("numOfRows")).toBe("867");
                });
            });

            it("can run twice", function() {
                spyOn(this.view, 'run').andCallThrough();
                chorus.PageEvents.trigger("file:runCurrent");
                expect(this.view.run).toHaveBeenCalled();

                this.view.run.reset();
                expect(this.view.run).not.toHaveBeenCalled();
                chorus.PageEvents.trigger("file:runCurrent");
                expect(this.view.run).toHaveBeenCalled();
            });

        });

        context("when an execution is already outstanding", function() {
            beforeEach(function() {
                chorus.PageEvents.trigger("file:runCurrent");
                this.startedSpy = jasmine.createSpy();
                chorus.PageEvents.on("file:executionStarted", this.startedSpy);
                chorus.PageEvents.trigger("file:runCurrent");
            });

            it('does not start a new execution', function() {
                expect(this.startedSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe("saving as Chorus View", function() {
        beforeEach(function() {
            this.modalSpy = stubModals();
            this.view.render();
            this.view.textContent.editor.setValue("select * from table;");

            this.schema.set({
                dataSourceId: '51',
                dataSourceName: "bob_the_data_source",
                databaseId: '52',
                databaseName: "bar",
                name: "wow"
            });
        });

        it("displays the modal", function() {
            chorus.PageEvents.trigger("file:newChorusView");

            expect(this.modalSpy).toHaveModal(chorus.dialogs.VerifyChorusView);
        });

        context("when there is no selection", function() {
            it("sets the Chorus View with while sql content", function() {
                chorus.PageEvents.trigger("file:newChorusView");

                expect(this.view.chorusView.get("objectType")).toBe("CHORUS_VIEW");
                expect(this.view.chorusView.get("query")).toBe('select * from table;');
                expect(this.view.chorusView.get("schema").id).toBe(this.schema.id);
                expect(this.view.chorusView.get("sourceObjectId")).toBe(this.workfile.id);
                expect(this.view.chorusView.get("sourceObjectType")).toBe("workfile");
                expect(this.view.chorusView.sourceObject).toBe(this.workfile);
                expect(this.view.chorusView.get("workspace")).toBe(this.workfile.get("workspace"));
            });
        });

        context("when there is a selection", function() {
            it("sets the Chorus View with workspace's sandbox data", function() {
                this.view.textContent.editor.setSelection({line: 0, ch: 0}, {line: 0, ch: 6});

                chorus.PageEvents.trigger("file:newSelectionChorusView");

                expect(this.view.chorusView.get("query")).toBe('select');
                expect(this.view.chorusView.get("schema").id).toBe(this.schema.id);
                expect(this.view.chorusView.sourceObject).toBe(this.workfile);
                expect(this.view.chorusView.get("sourceObjectId")).toBe(this.workfile.id);
            });
        });
    });
});
