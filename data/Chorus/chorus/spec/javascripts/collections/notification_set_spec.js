describe("chorus.collections.NotificationSet", function() {
    beforeEach(function() {
        this.collection = backboneFixtures.notificationSet();
    });

    it("is composed of notifications", function() {
        expect(this.collection.model).toBe(chorus.models.Notification);
    });

    describe("#url", function() {
        context("when constructed with no type option", function() {
            it("is correct", function() {
                expect(this.collection.url()).toHaveUrlPath("/notifications");
            });
        });

        context("when constructed with a type option", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.NotificationSet([], { type: "unread" });
            });

            it("is correct", function() {
                expect(this.collection.url()).toMatchUrl("/notifications?type=unread", { paramsToIgnore: ["page", "per_page" ]});
            });
        });
    });

    describe("#activities", function() {
        beforeEach(function() {
            this.activities = this.collection.activities();
        });

        it("returns an ActivitySet collection", function() {
            expect(this.activities).toBeA(chorus.collections.ActivitySet);
        });

        it("has the 'loaded' property set to true", function() {
            expect(this.activities.loaded).toBeTruthy();
        });

        it("has an activity model for each model in the notification set", function() {
            expect(this.activities.models.length).toBe(this.collection.length);
            this.activities.each(function (model, index) {
                expect(model.get('id')).toBe(this.collection.at(index).get('id'));
            }, this);

            expect(this.activities.models[0].get("action")).toBe("NOTE");

            expect(this.activities.models[0].get("actionType")).toBe("NoteOnDataSource");
        });
    });

    describe("when adding models", function() {
        context("when the notification set has the type 'unread'", function() {
            beforeEach(function() {
                this.collection.attributes.type = "unread";
            });

            it("sets 'unread' to true on each model", function() {
                var model = backboneFixtures.notificationSet().at(0);
                this.collection.add(model);
                expect(model.get("unread")).toBeTruthy();
            });
        });

        context("when the notification set does not have the type 'unread'", function() {
            it("does not set the 'unread' attribute on the model", function() {
                var model = backboneFixtures.notificationSet().at(0);
                model.unset('unread');
                this.collection.add(model);
                expect(model.get("unread")).toBeUndefined();
            });
        });
    });

    describe("#markAllRead with no unread notifications", function() {
        beforeEach(function() {
            this.server.reset();
            this.collection.reset();
            this.successSpy = jasmine.createSpy();
            this.collection.markAllRead({ success: this.successSpy });
        });

        it("does not make any requests", function() {
            expect(this.server.requests.length).toBe(0);
        });

        it("calls the success function", function() {
            expect(this.successSpy).toHaveBeenCalled();
        });
    });

    describe("#markAllRead with unread notifications", function() {
        beforeEach(function() {
            this.successSpy = jasmine.createSpy();
            this.collection.markAllRead({ success: this.successSpy });
        });

        it("calls the correct API", function() {
            expect(this.server.lastUpdate().url).toBe("/notifications/read");
            expect(this.server.lastUpdate().params()["notification_ids[]"]).toEqual(this.collection.map(function (model) {
                return model.get('id').toString();
            }));
        });

        describe("when the call succeeds", function() {
            beforeEach(function() {
                this.server.lastUpdate().succeed();
            });

            it("calls the success function", function() {
                expect(this.successSpy).toHaveBeenCalled();
            });
        });

        describe("when the call fails", function() {
            beforeEach(function() {
                this.server.lastUpdate().failUnprocessableEntity();
            });

            it("does not call the success function", function() {
                expect(this.successSpy).not.toHaveBeenCalled();
            });
        });
    });
});

