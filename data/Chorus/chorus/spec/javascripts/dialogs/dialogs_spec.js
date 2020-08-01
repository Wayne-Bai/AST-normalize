describe("chorus.views.Dialog", function() {
    beforeEach(function() {
        this.dialog = new chorus.dialogs.Base();
        this.dialog.title = "OH HAI";
        this.dialog.templateName = "plain_text";
        this.dialog.additionalContext = function() {
            return {
                text : "OMG IM IN A DIALOG WHOA"
            };
        };
        spyOn(chorus, 'placeholder');
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("displays the title in the .dialog_header", function() {
            expect(this.dialog.$(".dialog_header h1")).toContainText("OH HAI");
        });

        it("renders the view in the .dialog_content", function() {
            expect(this.dialog.$(".dialog_content")).toContainText("OMG IM IN A DIALOG WHOA");
        });

        it("sets up input placeholders for older browsers", function() {
            expect(chorus.placeholder).toHaveBeenCalledWith(this.dialog.$("input[placeholder], textarea[placeholder]"));
        });

        context("when the dialog has already been closed", function() {
            beforeEach(function() {
                spyOn(this.dialog, 'preRender');
                this.dialog.modalClosed();
                this.dialog.render();
            });

            it("aborts", function() {
                expect(this.dialog.preRender).not.toHaveBeenCalled();
            });
        });

        context("with a function as the title", function() {
            beforeEach(function() {
                this.dialog.title = function() {return 'foo';};
                this.dialog.render();
            });

            it("displays the results of the function", function() {
                expect(this.dialog.$(".dialog_header h1")).toContainText('foo');
            });
        });
    });


    describe("#launchModal", function() {
        beforeEach(function() {
            delete chorus.modal;

            spyOn($, "facebox");
            spyOn(this.dialog, "render");
            this.dialog.launchModal();
        });

        it("creates a facebox", function() {
            expect($.facebox).toHaveBeenCalledWith(this.dialog.el);
        });

        it("renders the dialog", function() {
            expect(this.dialog.render).toHaveBeenCalled();
        });
    });

    describe("Clicking the cancel button", function(){
        beforeEach(function() {
            this.dialog.render();
            this.dialog.$(".dialog_content").append("<div class='form_controls'><button class='cancel'>no</button></div>");
            spyOnEvent($(document), "close.facebox");
            this.dialog.$("button.cancel").click();
        });
        it("dismisses the dialog", function(){
            expect("close.facebox").toHaveBeenTriggeredOn($(document));
        });
    });

    describe("#showDialogError", function() {
        beforeEach(function() {
            this.dialog.render();
            this.dialog.model = new chorus.models.Base();
        });
        it("shows text given to it", function() {
            var errorMessage = "OMG IM AN ERROR";
            this.dialog.showDialogError(errorMessage);
            expect(this.dialog.$(".errors")).toContainText(errorMessage);
        });
    });
});
