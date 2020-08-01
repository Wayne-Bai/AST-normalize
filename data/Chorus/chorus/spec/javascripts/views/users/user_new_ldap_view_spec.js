describe("chorus.views.UserNewLdap", function() {
    describe("#render", function() {
        context("as an admin", function() {
            beforeEach(function() {
                spyOn($.fn, "limitMaxlength");
                setLoggedInUser({'admin': true});
                this.user = new chorus.models.User();
                this.view = new chorus.views.UserNewLdap({ model: this.user });
                this.modalSpy = stubModals();
                this.view.render();
            });

            it("is an LDAP user", function() {
                expect(this.user.ldap).toBeTruthy();
            });

            it("limits the length of the notes field", function() {
                expect($.fn.limitMaxlength).toHaveBeenCalledOnSelector("textarea");
            });

            describe("#fieldValues", function() {
                beforeEach(function() {
                    this.view.$("input[name=firstName]").val("Frankie");
                    this.view.$("input[name=lastName]").val("Knuckles");
                    this.view.$("input[name=username]").val("frankie2002");
                    this.view.$("input[name=email]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=dept]").val("awesomeness dept");
                    this.view.$("input[name=title]").val("fashion policeman");
                    this.view.$("input[name=admin]").prop("checked", true);
                    this.view.$("input[name=developer]").prop("checked", true);
                    this.view.$("textarea[name=notes]").val("some notes");
                });

                it("includes the values of every input in the form", function() {
                    expect(this.view.fieldValues()).toEqual({
                        firstName: "Frankie",
                        lastName: "Knuckles",
                        username: "frankie2002",
                        email: "frankie_knuckles@nyclol.com",
                        dept: "awesomeness dept",
                        title: "fashion policeman",
                        admin: true,
                        developer: true,
                        notes: "some notes"
                    });
                });

                context("when the 'admin' box is checked", function() {
                    it("sets the 'admin' field to true", function() {
                        expect(this.view.fieldValues().admin).toBeTruthy();
                    });
                });

                context("when the 'admin' box is unchecked", function() {
                    it("sets the 'admin' field to false", function() {
                        this.view.$("input[name=admin]").prop("checked", false);
                        expect(this.view.fieldValues().admin).toBeFalsy();
                    });
                });

                context("when the 'developer' box is checked", function() {
                    it("sets the 'developer' field to true", function() {
                        expect(this.view.fieldValues().developer).toBeTruthy();
                    });
                });

                context("when the 'developer' box is unchecked", function() {
                    it("sets the 'developer' field to false", function() {
                        this.view.$("input[name=developer]").prop("checked", false);
                        expect(this.view.fieldValues().developer).toBeFalsy();
                    });
                });

                context("when there is whitespace surrounding an input value", function() {
                    it("trims the whitespace before submission", function() {
                        this.view.$("input[name=firstName]").val("     spaces     ");
                        expect(this.view.fieldValues().firstName).toBe("spaces");
                    });
                });

                context("when there is whitespace surrounding a textarea value", function() {
                    it("does not trim the whitespace", function() {
                        this.view.$("textarea[name=notes]").val("     spaces     ");
                        expect(this.view.fieldValues().notes).toBe("     spaces     ");
                    });
                });
            });

            it("can check whether the user is in the ldap database", function() {
                expect(this.view.$("button#check_username")).toExist();
                expect(this.view.$("button#check_username").text()).toMatchTranslation("users.ldap.check_username");
            });

            it("doesn't re-render when the model fails to save", function() {
                expect(this.view.persistent).toBeTruthy();
            });

            describe("clicking 'check username' ", function() {
                beforeEach(function() {
                    this.view.$("input[name='username']").val("john_henry");
                    this.view.$("button#check_username").trigger("click");

                    this.ldapUsers = new chorus.collections.LdapUserSet([], { username: "john_henry" });
                });

                it("sends a request to check for the existence of a user with the given username", function() {
                    expect(this.ldapUsers).toHaveBeenFetched();
                });

                context("when the username matches an LDAP user", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.ldapUsers, [
                            backboneFixtures.user({
                                username: "john_henry",
                                firstName: "John",
                                lastName: "Henry",
                                email: "jh@hammer.edu",
                                title: "Hammerer",
                                dept: "whoop-ass"
                            })
                        ]);
                    });

                    it("fills in the fields from the LDAP user", function() {
                        expect(this.view.$("input[name='firstName']").val()).toBe("John");
                        expect(this.view.$("input[name='lastName']").val()).toBe("Henry");
                        expect(this.view.$("input[name='email']").val()).toBe("jh@hammer.edu");
                        expect(this.view.$("input[name='title']").val()).toBe("Hammerer");
                        expect(this.view.$("input[name='dept']").val()).toBe("whoop-ass");
                    });
                });

                context("when no user with the given username is found", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.ldapUsers, []);
                    });

                    it("launches an alert dialog", function() {
                        expect(this.modalSpy).toHaveModal(chorus.alerts.NoLdapUser);
                    });
                });
            });

            context("submitting the form", function() {
                beforeEach(function() {
                    this.view.$("input[name=firstName]").val("Frankie");
                    this.view.$("input[name=lastName]").val("Knuckles");
                    this.view.$("input[name=username]").val("frankie2002");
                    this.view.$("input[name=email]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=dept]").val("awesomeness dept");
                    this.view.$("input[name=admin]").prop("checked", true);
                    this.view.$("input[name=developer]").prop("checked", true);

                    this.view.$("form").submit();
                });


                it("saves the user", function() {
                    expect(this.user).toHaveBeenCreated();
                });

                context("when user creation is successful", function() {
                    it("redirects to user index", function() {
                        spyOn(chorus.router, "navigate");
                        this.server.completeCreateFor(this.user);
                        expect(chorus.router.navigate).toHaveBeenCalledWith("/users");
                    });
                });

                context("when user creation fails on the server", function() {
                    beforeEach(function() {
                                this.view.model.serverErrors = {fields: {a: {BLANK: {}}}};
                                this.view.$("form").submit();
                                this.view.model.trigger("saveFailed");
                            });

                    it("doesn't redirect", function() {
                        expect(this.view.$("form")).toExist();
                    });

                    it("retains the data already entered", function() {
                        expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                        expect(this.view.$("input[name=lastName]").val()).toBe("Knuckles");
                        expect(this.view.$("input[name=username]").val()).toBe("frankie2002");
                        expect(this.view.$("input[name=email]").val()).toBe("frankie_knuckles@nyclol.com");
                        expect(this.view.$("input[name=dept]").val()).toBe("awesomeness dept");
                        expect(this.view.$("input[name=admin]")).toBeChecked();
                        expect(this.view.$("input[name=developer]")).toBeChecked();
                    });

                    describe("check another user name", function() {
                        beforeEach(function() {
                                    this.view.$("input[name=username]").val("max");
                                    this.view.$("button#check_username").click();
                                });

                        it("clears the existing error", function() {
                            expect(this.view.$(".errors")).toBeEmpty();
                        });
                    });
                });
            });


            context("cancelling", function() {
                beforeEach(function() {
                    this.view.$("button.cancel").click();
                });

                it("does not save the user", function() {
                    expect(this.user).not.toHaveBeenCreated();
                });

                it("navigates back", function() {
                    expect(window.history.back).toHaveBeenCalled();
                });
            });
        });

        context("as a non admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': false});
                this.view = new chorus.views.UserNew();
                this.view.render();
            });

            it("renders the admin-only warning", function() {
                expect(this.view.$(".aint_admin")).toExist();
            });
        });
    });
});

