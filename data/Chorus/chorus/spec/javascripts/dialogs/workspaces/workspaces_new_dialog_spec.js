describe("chorus.dialogs.WorkspaceNew", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.WorkspaceNew();
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("has a new workspace form", function() {
            expect(this.dialog.$("form.new_workspace")).toExist();
        });

        it("starts with the submit button disabled", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        describe("filling out workspace name", function() {
            beforeEach(function() {
                this.dialog.$("input[name=name]").val("An hero").keyup();
            });

            it("has enabled the submit button", function() {
                expect(this.dialog.$("button.submit")).not.toBeDisabled();
            });

            it("disables the button when the name is cleared", function() {
                this.dialog.$("input[name=name]").val("").keyup();
                expect(this.dialog.$("button.submit")).toBeDisabled();
            });
        });

        it("is not public by default", function() {
            expect(this.dialog.$('input[name=public]')).not.toBeChecked();
        });
    });

    describe("submitting the form", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$("input[name=name]").val("   Super Dataland   ").keyup();
            this.dialog.$("input[type=checkbox][name=public]").prop("checked", true);
            this.dialog.$("form.new_workspace").submit();
        });

        it("fills in the workspace, with trim", function() {
            expect(this.dialog.resource.get("name")).toBe("Super Dataland");
            expect(this.dialog.resource.get("public")).toBe(true);
        });

        it("sets public to false when the box isn't checked", function() {
            this.dialog.$("input[type=checkbox][name=public]").prop("checked", false);
            this.dialog.$("form.new_workspace").submit();
            expect(this.dialog.resource.get("public")).toBe(false);
        });

        it("saves the workspace", function() {
            spyOn(this.dialog.resource, "save");
            this.dialog.$("form.new_workspace").submit();
            expect(this.dialog.resource.save).toHaveBeenCalled();
        });

        it("puts the button in the loading state", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        context("when workspace creation is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                this.dialog.resource.set({ id: "10102" }, { silent: true });
                this.dialog.resource.trigger("saved");
            });

            it("redirects to the new workspace show page", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/workspaces/10102/quickstart");
            });

            it("dismisses the dialog", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document));
            });
        });

        context("when workspace creation fails", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                this.dialog.resource.set({serverErrors : { fields: { a: { BLANK: {} } } }});
                this.dialog.resource.trigger("saveFailed");
            });

            it("displays the error message", function() {
                expect(this.dialog.$(".errors").text()).toContain("A can't be blank");
            });

            it("does not dismiss the dialog", function() {
                expect(this.dialog.$("form.new_workspace")).toExist();
            });

            it("doesn't navigate", function() {
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            });

            it("stops the loading spinner on the button", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            });
        });
    });
});
