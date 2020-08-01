describe("chorus.views.WorkfileContent", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workfile({});
    });

    describe(".buildFor", function() {
        context("when the given workfile is an image", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.image();
                spyOn(chorus.views, "ImageWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an ImageWorkfileContent view with the given workfile", function() {
                expect(chorus.views.ImageWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is a partial file", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.text({versionInfo: {partialFile: true}});
                spyOn(chorus.views, "ReadOnlyTextContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an ReadOnlyTextContent view with the given workfile", function() {
                expect(chorus.views.ReadOnlyTextContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is an xml file", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.text();
                this.model.set('fileType', 'xml');
                spyOn(chorus.views, "ReadOnlyTextContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an ReadOnlyTextContent view with the given workfile", function() {
                expect(chorus.views.ReadOnlyTextContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is a text file", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.text();
                spyOn(chorus.views, "TextWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an TextWorkfileContent view with the given workfile", function() {
                expect(chorus.views.TextWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is a sql file", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.sql();
                spyOn(chorus.views, "SqlWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an SqlWorkfileContent view with the given workfile", function() {
                expect(chorus.views.SqlWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is an alpine file", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.binary({ fileType: "alpine" });
                spyOn(chorus.views, "AlpineWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an AlpineWorkfileContent view with the given workfile", function() {
                expect(chorus.views.AlpineWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is a tableau file", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.tableau();
                spyOn(chorus.views, "TableauWorkfileContent");
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates a TableauWorkfileContent view with the given workfile", function() {
                expect(chorus.views.TableauWorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });

        context("when the given workfile is nothing special", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workfile.binary();
                var buildFor = chorus.views.WorkfileContent.buildFor;
                spyOn(chorus.views, "WorkfileContent");
                chorus.views.WorkfileContent.buildFor = buildFor;
                chorus.views.WorkfileContent.buildFor(this.model);
            });

            it("instantiates an WorkfileContent view with the given workfile", function() {
                expect(chorus.views.WorkfileContent).toHaveBeenCalledWith({ model : this.model });
            });
        });
    });
});
