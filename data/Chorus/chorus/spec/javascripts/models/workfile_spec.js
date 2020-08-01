describe("chorus.models.Workfile", function() {
    beforeEach(function() {
        this.model = backboneFixtures.workfile.sql({workspace: { id: "10000"}, id: '10020'});
    });

    it("has the correct entityType", function() {
        expect(this.model.entityType).toBe("workfile");
    });

    describe("#modifier", function() {
        it("returns a partially constructed user, based on the workfile's modifier attribute", function() {
            var modifier = this.model.modifier();
            expect(modifier.get("firstName")).toBe(this.model.get("versionInfo").modifier.firstName);
            expect(modifier.get("lastName")).toBe(this.model.get("versionInfo").modifier.lastName);
            expect(modifier.get("id")).toBe(this.model.get("versionInfo").modifier.id);
        });
    });

    describe("#workspace", function() {
        it("returns a workspace", function() {
            expect(this.model.workspace()).toBeA(chorus.models.Workspace);
        });

        it("memoizes", function() {
            expect(this.model.workspace()).toBe(this.model.workspace());
        });
    });

    describe("#executionSchema", function() {
        beforeEach(function() {
            this.schemaJson = backboneFixtures.schemaJson()['response'];
            this.model.set({ executionSchema: this.schemaJson});
        });

        it("returns that schema as a model", function() {
            var schema = this.model.executionSchema();
            expect(schema.get("id")).toBe(this.schemaJson.id);
            expect(schema.get("name")).toBe(this.schemaJson.name);
        });

        context("when the workfile is not loaded", function() {
            beforeEach(function() {
                this.model.clear();
                delete this.model.loaded;
            });

            it("returns undefined", function() {
                expect(this.model.executionSchema()).toBeUndefined();
            });
        });
    });

    describe("#updateExecutionSchema", function() {
        it("calls save with exeuctionSchemaId and wait attribute set to true", function() {
            spyOn(this.model, "save");
            this.model.updateExecutionSchema(new chorus.models.Schema({id: 123}));
            expect(this.model.save).toHaveBeenCalledWith({executionSchema: {id: 123}}, {wait: true});
        });
    });

    describe("#sandbox", function() {
        context("when the workfile's workspace has been fetched", function() {
            it("returns the sandbox from the workspace", function() {
                expect(this.model.sandbox()).toBe(this.model.workspace().sandbox());
            });
        });

        context("when the workfile's workspace has not been fetched", function() {
            beforeEach(function() {
                delete this.model.attributes.workspace;
            });

            it("returns undefined", function() {
                expect(this.model.sandbox()).toBeFalsy();
            });
        });
    });

    describe("#lastComment", function() {
        beforeEach(function() {
            this.comment = this.model.lastComment();
            this.lastCommentJson = this.model.get('recentComments')[0];
        });

        it("has the right body", function() {
            expect(this.comment.get("body")).toBe(this.lastCommentJson.body);
        });

        it("sets the 'loaded' flag to true", function() {
            expect(this.comment.loaded).toBeTruthy();
        });

        it("has the right creator", function() {
            var creator = this.comment.author();
            expect(creator.get("id")).toBe(this.lastCommentJson.author.id);
            expect(creator.get("firstName")).toBe(this.lastCommentJson.author.firstName);
            expect(creator.get("lastName")).toBe(this.lastCommentJson.author.lastName);
        });

        context("when the workfile doesn't have any comments", function() {
            it("returns null", function() {
                expect(new chorus.models.Workfile().lastComment()).toBeFalsy();
            });
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires fileName", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("fileName", undefined);
        });
    });

    describe("urls", function() {
        beforeEach(function() {
            this.model = backboneFixtures.workfile.sql({
                id: 5,
                workspace: { id: 10 },
                versionInfo: { contentUrl: "this/is/content/url" }
            });
        });

        it("has the right backend URL", function() {
            expect(this.model.url()).toBe("/workfiles/5");
        });

        describe("#showUrl", function() {
            context("when the workfile is the most recent version", function() {
                it("does not include a version", function() {
                    this.model.get('versionInfo').id = 1;
                    this.model.set({ latestVersionId: 1 });
                    expect(this.model.showUrl()).toBe("#/workspaces/10/workfiles/5");
                });

                it("has the right download URL", function() {
                    expect(this.model.downloadUrl()).toBe("workfiles/5/download");
                });
            });

            context("when the workfile is not the most recent version", function() {
                beforeEach(function() {
                    this.model.get("versionInfo").id = 6;
                    this.model.set({latestVersionId: 9 });
                });

                it("includes its version number", function() {
                    expect(this.model.showUrl()).toBe("#/workspaces/10/workfiles/5/versions/6");
                });

                it("has the right download URL", function() {
                    expect(this.model.downloadUrl()).toBe("workfiles/5/download?version_id=6");
                });
            });

            context("when a 'version' option is passed", function() {
                it("uses that version", function() {
                    expect(this.model.showUrl({ version: 72 })).toBe("#/workspaces/10/workfiles/5/versions/72");
                });
            });
        });

        context("when the workfile is a draft", function() {
            beforeEach(function() {
                this.model.set({ hasDraft: true });
                spyOn(chorus, "cachebuster").andReturn(12345);
            });

            it("has the right download URL", function() {
                expect(this.model.downloadUrl()).toBe("workfiles/5/download");
            });
        });
    });

    describe("isImage", function() {
        context("when the workfile is an image", function() {
            it("returns true", function() {
                var workfile = backboneFixtures.workfile.image();
                expect(workfile.isImage()).toBeTruthy();
            });
        });

        context("when the workfile is NOT an image", function() {
            it("returns false", function() {
                var workfile = backboneFixtures.workfile.sql();
                expect(workfile.isImage()).toBeFalsy();
            });
        });
    });

    describe("isSql", function() {
        it("returns true when the workfile is a sql file", function() {
            var workfile = backboneFixtures.workfile.sql();
            expect(workfile.isSql()).toBeTruthy();
        });

        it("returns false when the workfile is NOT a sql file", function() {
            var workfile = backboneFixtures.workfile.binary();
            expect(workfile.isSql()).toBeFalsy();
        });
    });

    describe("isAlpine", function() {
        it("returns true when the workfile is a afm file", function() {
            var workfile = backboneFixtures.workfile.binary({ fileType: "alpine" });
            expect(workfile.isAlpine()).toBeTruthy();
        });

        it("returns false when the workfile is NOT an afm file", function() {
            var workfile = backboneFixtures.workfile.sql();
            expect(workfile.isAlpine()).toBeFalsy();
        });
    });

    describe("isPartialFile", function() {
        it("returns true when the workfile is a partial file", function() {
            var workfile = backboneFixtures.workfile.sql({ versionInfo: {partialFile: true} });
            expect(workfile.isPartialFile()).toBeTruthy();
        });

        it("returns false when the workfile is not a partial file", function() {
            var workfile = backboneFixtures.workfile.sql({ versionInfo: {partialFile: false} });
            expect(workfile.isPartialFile()).toBeFalsy();
        });
    });

    describe("isTableau", function() {
        it("returns true when the workfile is a tableau file", function() {
            var workfile = backboneFixtures.workfile.tableau();
            expect(workfile.isTableau()).toBeTruthy();
        });
    });

    describe("isBinary", function() {
        it("returns true when the workfile is a binary file", function() {
            var workfile = backboneFixtures.workfile.binary();
            expect(workfile.isBinary()).toBeTruthy();
        });

        it("returns false when the workfile is NOT a binary file", function() {
            var workfile = backboneFixtures.workfile.sql();
            expect(workfile.isBinary()).toBeFalsy();
        });
    });

    describe("#extension", function() {
        it("returns the extension from the file's name", function() {
            var workfile = backboneFixtures.workfile.sql();
            expect(workfile.extension()).toBe("sql");

            workfile.set({ fileName: "foo.cpp" });
            expect(workfile.extension()).toBe("cpp");

            workfile.set({ fileName: "foo.js.coffee.erb" });
            expect(workfile.extension()).toBe("erb");

            workfile.set({ fileName: "FOO.CPP" });
            expect(workfile.extension()).toBe("cpp");

            workfile.set({ fileName: "foo" });
            expect(workfile.extension()).toBeNull();

            workfile.unset("fileName");
            expect(workfile.extension()).toBeUndefined();
        });
    });

    describe("createDraft", function() {
        beforeEach(function() {
            this.workfile = backboneFixtures.workfile.sql();
        });

        it("sets the required attributes", function() {
            var draft = this.workfile.createDraft();
            expect(draft.get("workfileId")).toBe(this.workfile.get('id'));
            expect(draft.get("workspaceId")).toBe(this.workfile.workspace().id);

            // backend expects content to be a first level property when saving, but it returns content nested elsewhere
            expect(draft.get("content")).toBe(this.workfile.content());
        });

        describe("when the draft is saved", function() {
            beforeEach(function() {
                var draft = this.workfile.createDraft();
                spyOnEvent(this.workfile, "change");
                draft.trigger("saved");
            });

            it("sets the workfile's 'hasDraft' field to true", function() {
                expect(this.workfile.get("hasDraft")).toBeTruthy();
            });

            it("sets the isDraft property on the workfile", function() {
                expect(this.workfile.isDraft).toBeTruthy();
            });

            it("does not trigger change on the workfile", function() {
                expect("change").not.toHaveBeenTriggeredOn(this.workfile);
            });
        });
    });

    describe("#allVersions", function() {
        it("sets the required attributes", function() {
            var workfileVersionSet = this.model.allVersions();
            expect(workfileVersionSet).toBeA(chorus.collections.WorkfileVersionSet);
            expect(workfileVersionSet.attributes.workfileId).toBe(this.model.get("id"));
        });
    });

    describe("canEdit", function() {
        beforeEach(function() {
            spyOn(this.model.workspace(), 'isActive').andReturn(true);
        });

        it("returns false when its version is not the current version", function() {
            this.model.set({latestVersionId: 6});
            this.model.get('versionInfo').id = 3;
            expect(this.model.canEdit()).toBeFalsy();
        });

        it("returns false when its workspace is archived", function() {
            this.model.workspace().isActive.andReturn(false);
            this.model.set({latestVersionId: 6});
            this.model.get('versionInfo').id = 6;
            expect(this.model.canEdit()).toBeFalsy();
        });

        it("returns false when user does not have admin/update permissions", function() {
            this.model.workspace().set({permission: ["read", "commenting"]});
            this.model.set({latestVersionId: 6});
            this.model.get('versionInfo').id = 6;
            expect(this.model.canEdit()).toBeFalsy();
        });

        it("returns true when its version is the current version and has update permission", function() {
            this.model.set({latestVersionId: 6, permission: ["update"]});
            this.model.get('versionInfo').id = 6;
            expect(this.model.canEdit()).toBeTruthy();
        });

        it("returns true when its version is the current version and has admin permission", function() {
            this.model.set({latestVersionId: 6, permission: ["admin"]});
            this.model.get('versionInfo').id = 6;
            expect(this.model.canEdit()).toBeTruthy();
        });

    });

    describe("isText", function() {
        it("returns true for plain text files", function() {
            var workfile = backboneFixtures.workfile.text();
            expect(workfile.isText()).toBeTruthy();
        });

        it("returns true for sql files", function() {
            var workfile = backboneFixtures.workfile.sql();
            expect(workfile.isText()).toBeTruthy();
        });

        it("returns false for image files", function() {
            var workfile = backboneFixtures.workfile.image();
            expect(workfile.isText()).toBeFalsy();
        });
    });

    describe("initializing from a WorkfileVersionSet", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileVersionSet([], {workspaceId: 1, workfileId: 2});
        });

        it("sets the workspaceId attribute on the model", function() {
            this.collection.add({versionInfo: {id: 5}});

            expect(this.collection.models[0]).toBeA(chorus.models.Workfile);
            expect(this.collection.models[0].workspace().id).toBe(this.collection.attributes.workspaceId);
        });
    });

    describe("#fetch", function() {
        context("when the versionNum equals the latestVersionNum", function() {
            beforeEach(function() {
                this.model.get('versionInfo').id = 99;
                this.model.set({ latestVersionId: 99 });
                this.model.fetch();
            });

            it("fetches the correct url", function() {
                expect(this.server.lastFetch().url).toBe("/workfiles/10020");
            });
        });

        context("when the versionNum is not equal to the latestVersionNum", function() {
            beforeEach(function() {
                this.model.get('versionInfo').id = 123;
                this.model.set({ latestVersionId: 99 });
                this.model.fetch();
            });

            it("fetches the correct url", function() {
                expect(this.server.lastFetch().url).toBe("/workfiles/10020/versions/123");
            });
        });
    });

    describe("#save", function() {
        beforeEach(function() {
            spyOn(this.model.workspace(), 'isActive').andReturn(true);
        });

        it("posts the data to the workfile endpoint", function() {
            this.model.save();
            expect(this.server.lastUpdate().url).toBe("/workfiles/10020");
        });

        context("with an old version", function() {
            beforeEach(function() {
                this.model.get('versionInfo').id = 88;
                this.model.set({ latestVersionId: 99 });
                this.model.save({}, {updateWorkfileVersion: true});
            });

            it("does not save", function() {
                expect(this.server.lastUpdate()).toBeUndefined();
            });
        });

        context("with the latest version", function() {
            beforeEach(function() {
                this.model.get('versionInfo').id = 99;
                this.model.get('versionInfo').lastUpdatedStamp = "THEVERSIONSTAMP";
                this.model.set({ latestVersionId: 99, lastUpdatedStamp: "THEWORKFILESTAMP"});
            });

            context("replacing the current version", function() {
                beforeEach(function() {
                    this.model.save({}, {updateWorkfileVersion: true});
                });

                it("saves to the correct url", function() {
                    expect(this.server.lastUpdate().url).toBe("/workfiles/10020/versions/99");
                });

                it("saves with the versionInfo lastUpdatedStamp", function() {
                    expect(this.server.lastUpdate().requestBody).toContain("THEVERSIONSTAMP");
                    expect(this.server.lastUpdate().requestBody).not.toContain("THEWORKFILESTAMP");
                });
            });

            context("saving as a new version", function() {
                beforeEach(function() {
                    this.model.save({}, {newWorkfileVersion: true});
                });

                it("saves to the correct url", function() {
                    expect(this.server.lastCreate().url).toBe("/workfiles/10020/versions");
                });
            });
        });
    });

    describe("#content", function() {
        context("with an argument", function() {
            beforeEach(function() {
                spyOnEvent(this.model, "change");
                this.model.content("i am not old content");
            });

            it("sets the content", function() {
                expect(this.model.get("versionInfo").content).toBe('i am not old content');
            });

            it("triggers change", function() {
                expect("change").toHaveBeenTriggeredOn(this.model);
            });
            it("sets the content in the model", function() {
                expect(this.model.get("content")).toBe('i am not old content');
            });
        });

        context("with silent: true", function() {
            beforeEach(function() {
                spyOnEvent(this.model, "change");
                this.model.content("i am not old content", {silent: true});
            });

            it("sets the content", function() {
                expect(this.model.get("versionInfo").content).toBe('i am not old content');
            });

            it("does not trigger change", function() {
                expect("change").not.toHaveBeenTriggeredOn(this.model);
            });
            it("sets the content in the model", function() {
                expect(this.model.get("content")).toBe('i am not old content');
            });
        });

        context("without an argument", function() {
            it("returns the content", function() {
                expect(this.model.content()).toBe(this.model.get('versionInfo').content);
            });
        });
    });

    describe("#hasOwnPage", function() {
        it("returns true", function() {
            expect(this.model.hasOwnPage()).toBeTruthy();
        });
    });

    describe("#iconUrl", function() {
        context("when the workfile is an image", function() {
            it("returns the url of the image thumbnail", function() {
                var workfile = backboneFixtures.workfile.image({
                    versionInfo: { iconUrl: "some/file" }
                });

                expect(workfile.iconUrl()).toBe("some/file");
                expect(workfile.iconUrl({ size: "icon" })).toBe("some/file");
            });
        });

        context("when the workfile is not an image", function() {
            it("proxies to fileIconUrl helper", function() {
                var workfile = backboneFixtures.workfile.text({ fileName: "foo.cpp" });
                expect(workfile.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('cpp', 'large'));
                expect(workfile.iconUrl({ size: "icon" })).toBe(chorus.urlHelpers.fileIconUrl('cpp', 'icon'));

                workfile = backboneFixtures.workfile.text({ fileName: "foo.java" });
                expect(workfile.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('java', 'large'));
                expect(workfile.iconUrl({ size: "icon" })).toBe(chorus.urlHelpers.fileIconUrl('java', 'icon'));
            });
        });
    });

    describe("#useExternalLink", function() {
        it("should return false", function() {
            expect(this.model.useExternalLink()).toBeFalsy();
        });
    });
});
