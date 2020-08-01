describe("chorus.alerts.CollectionDelete", function () {
    beforeEach(function () {
        this.collection = new chorus.collections.Base({models: [new chorus.models.User()]});
        this.dialog = this.alert = new chorus.alerts.CollectionDelete({ collection: this.collection });
        stubModals();
        this.alert.launchModal();
        this.alert.redirectUrl = "/partyTime";
        this.alert.text = "Are you really really sure?";
        this.alert.title = "A standard delete alert";
        this.alert.ok = "Delete It!";
        this.alert.deleteMessage = "It has been deleted";
    });

    itBehavesLike.aDialogWithSomethingToFocusOn();

    describe("clicking delete", function () {
        context("when the alert has a redirect url", function () {
            beforeEach(function () {
                this.alert.render();
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
                spyOn(chorus, "toast");
                this.deleteParams = {foo: "bar"};
                spyOn(this.alert, "deleteMessageParams").andReturn(this.deleteParams);
                spyOn(this.alert.collection, "destroy");
                this.alert.$("button.submit").click();
            });

            it("deletes the collection", function () {
                expect(this.alert.collection.destroy).toHaveBeenCalled();
            });

            it("dismisses the alert", function () {
                expect("close.facebox").toHaveBeenTriggeredOn($(document));
            });

            it("navigates to the redirectUrl", function () {
                expect(chorus.router.navigate).toHaveBeenCalledWith("/partyTime");
            });

            it("displays the delete success toast message", function () {
                expect(this.alert.deleteMessageParams).toHaveBeenCalled();
                expect(chorus.toast).toHaveBeenCalledWith(this.alert.deleteMessage, this.deleteParams);
            });

            describe("when the collection deletion fails", function () {
                beforeEach(function () {
                    spyOnEvent($(document), "close.facebox");
                    this.alert.collection.first().set({serverErrors: { fields: { a: { INVALID: { message: "Hi there"}}} }});
                });

                it("dismisses the dialog", function () {
                    expect("close.facebox").toHaveBeenTriggeredOn($(document));
                });
            });
        });

        context("when the alert does NOT have a redirect url", function () {
            beforeEach(function () {
                this.alert.render();
                spyOn(chorus.router, "navigate");
                delete this.alert.redirectUrl;
                this.alert.$("button.submit").click();
            });

            it("does not navigate", function () {
                this.alert.$("button.submit").click();
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            });
        });
    });

    describe("clicking cancel", function () {
        beforeEach(function () {
            this.alert.render();
            this.alert.$("button.cancel").click();
            spyOn(chorus.router, "navigate");
            this.alert.collection.trigger("destroy", this.alert.collection);
        });

        it("unbinds events on the collection", function () {
            expect(chorus.router.navigate).not.toHaveBeenCalled();
        });
    });
});
