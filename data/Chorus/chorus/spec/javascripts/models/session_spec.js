describe("chorus.models.Session", function() {
    var models = chorus.models;
    describe("#save", function() {
        beforeEach(function() {
            this.model = new models.Session({ username: "johnjohn", password: "partytime"});
            this.model.save();
        });

        it("posts to the right url", function() {
            expect(this.server.lastCreate().url).toBe("/sessions");
        });
    });

    describe("#logout", function() {
        beforeEach(function() {
            Backbone.history.fragment = "foo";
            this.model = new models.Session();
            spyOnEvent(this.model, "needsLogin");
        });

        context("when the model has errors", function() {
            beforeEach(function() {
                this.model.set({ errors: true });
                this.model.logout();
            });

            it("does not call the logout API", function() {
                expect(this.server.requests.length).toBe(0);
            });

            it("triggers needsLogin", function() {
                expect("needsLogin").toHaveBeenTriggeredOn(this.model);
            });
        });

        context("when the model does not have errors", function() {
            beforeEach(function() {
                this.model.set({ foo: "bar", bro: "baz" });
                this.model._user = backboneFixtures.user();
                this.model.sandboxPermissionsCreated['4'] = true;
                this.model.logout();
            });

            it("calls the logout API", function() {
                expect(this.server.lastDestroyFor(this.model)).toBeDefined();
            });

            describe("and the server responds", function() {
                beforeEach(function() {
                    spyOn(this.model, 'updateToken');
                    this.response = {csrf_token: 'new_token'};
                    this.server.lastDestroy().respondJson(200, this.response);
                });

                it("triggers needsLogin", function() {
                    expect("needsLogin").toHaveBeenTriggeredOn(this.model);
                });

                it("clears all attributes in the model", function() {
                    expect(_.size(this.model.attributes)).toBe(0);
                    expect(this.model._user).toBeUndefined();
                    expect(this.model.sandboxPermissionsCreated).toEqual({});
                });

                it("updates the csrf token", function() {
                    expect(this.model.updateToken).toHaveBeenCalledWith(this.response);
                });
            });
        });
    });

    describe("loggedIn", function() {
        beforeEach(function() {
            this.model = backboneFixtures.session();
        });

        it("returns true when there's a user", function () {
            expect(this.model.user().get('id')).toBeTruthy();
            expect(this.model.loggedIn()).toBeTruthy();

        });

        it("returns false when there is no _user", function () {
            delete this.model.attributes.user;
            expect(this.model.user()).toBeFalsy();
            expect(this.model.loggedIn()).toBeFalsy();
        });
    });

    describe("#fetch", function() {
        beforeEach(function() {
            this.model = backboneFixtures.session();

            this.errorSpy = jasmine.createSpy("error");
            this.model.fetch({
                error: this.errorSpy
            });
        });

        it("has the correct url", function() {
            expect(this.server.lastFetch().url).toBe("/sessions");
        });

        context("when the session is not valid", function() {
            beforeEach(function() {
                expect(this.model.user()).toBeTruthy();
                this.server.lastFetch().failUnauthorized();
            });

            it("clears the session attributes", function() {
                expect(_.keys(this.model.attributes).length).toBe(0);
            });

            it("clears the session error messages", function() {
                expect(this.model.serverErrors).toBeUndefined();
            });

            it("clears the memoized user", function() {
                expect(this.model.user()).toBeFalsy();
            });

            it("calls the 'error' callback, if one was provided", function() {
                expect(this.errorSpy).toHaveBeenCalled();
            });
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            this.model = new models.Session();
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid session", function() {
            this.model.set({ username: "barn", password: "door" });
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires username", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("username", undefined);
        });

        it("requires password", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("password", undefined);
        });
    });

    describe("#user", function() {
        beforeEach(function() {
            this.session = new models.Session();
        });

        context("when a user has been fetched", function() {
            beforeEach(function() {
                this.session = backboneFixtures.session();
            });

            it("returns a User", function() {
                expect(this.session.user() instanceof(chorus.models.User)).toBeTruthy();
            });

            it("returns the same user object", function() {
                expect(this.session.user()).toBe(this.session.user());
            });
        });

        it("returns false when the user has not been fetched", function() {
            expect(this.session.user()).toBeFalsy();
        });

    });

    describe("resuming", function() {
        beforeEach(function() {
            this.session = backboneFixtures.session();
        });

        describe("#rememberPathBeforeLoggedOut", function() {
            context("when navigating to logout", function() {
                beforeEach(function() {
                    Backbone.history.fragment = "logout";
                    this.session.rememberPathBeforeLoggedOut();
                });

                it("ignores the path", function() {
                    expect(this.session.resumePath()).toBeFalsy();
                });
            });

            context("when navigating to login", function() {
                beforeEach(function() {
                    Backbone.history.fragment = "login";
                    this.session.rememberPathBeforeLoggedOut();
                });

                it("ignores the path", function() {
                    expect(this.session.resumePath()).toBeFalsy();
                });
            });

            context("when navigating elsewhere", function() {
                beforeEach(function() {
                    Backbone.history.fragment = "elsewhere";
                    this.session.rememberPathBeforeLoggedOut();
                });

                it("remembers the path", function() {
                    expect(this.session.resumePath()).toEqual("elsewhere");
                });

                context("and then trying to log in with bad credentials", function() {
                    beforeEach(function() {
                        Backbone.history.fragment = "login";
                        this.session.rememberPathBeforeLoggedOut();
                    });

                    it("remembers the non-login path", function() {
                        expect(this.session.resumePath()).toEqual("elsewhere");
                    });
                });
            });
        });

        describe("#shouldResume", function() {
            beforeEach(function() {
                this.session.user().id = 2;
                this.session._previousUserId = 2;
                this.session._pathBeforeLoggedOut = 'somewhere';
            });

            it("is true if it has somewhere to go", function() {
                expect(this.session.shouldResume()).toBeTruthy();
            });

            it("is false if it has nowhere to go", function() {
                delete this.session._pathBeforeLoggedOut;
                expect(this.session.shouldResume()).toBeFalsy();
            });

            it("is true even if a different user was timed out", function() {
                this.session._previousUserId = 3;
                expect(this.session.shouldResume()).toBeTruthy();
            });

            it("is true if no one has tried to log in yet", function() {
                delete this.session._user;
                expect(this.session.shouldResume()).toBeTruthy();
            });
        });
    });

    describe("#updateToken", function() {
        beforeEach(function() {
            this.model = new models.Session();
            spyOn($.fn, 'attr');
        });

        it("sets the new token", function() {
            this.model.updateToken({csrf_token: 'new_token'});
            expect($.fn.attr).toHaveBeenCalledWith('content', 'new_token');
        });
    });
});
