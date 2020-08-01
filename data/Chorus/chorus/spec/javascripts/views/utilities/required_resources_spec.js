describe("chorus.RequiredResources", function() {
    beforeEach(function() {
        this.requiredResources = new chorus.RequiredResources();
        this.model = backboneFixtures.user();
        this.collection = backboneFixtures.workfileSet();
    });

    it('allows you to add Model objects', function() {
        this.requiredResources.add(this.model);
        expect(this.requiredResources.models).toContain(this.model);
    });

    it('allows you to add Collection objects', function() {
        this.requiredResources.add(this.collection);
        expect(this.requiredResources.models).toContain(this.collection);
    });

    it('allows you to call push instead of add', function() {
        this.requiredResources.push(this.model);
        expect(this.requiredResources.models).toContain(this.model);
    });

    describe("add", function() {
        it("should not trigger add on the object", function() {
            spyOnEvent(this.model, 'add');
            this.requiredResources.add(this.model);
            expect('add').not.toHaveBeenTriggeredOn(this.model);
        });

        it("should trigger add on the requiredResources", function() {
            spyOnEvent(this.requiredResources, 'add');
            this.requiredResources.add(this.model);
            expect('add').toHaveBeenTriggeredOn(this.requiredResources);
        });

        it("should bind verifyResourcesResponded to the serverResponded event of the resource", function() {
            delete this.model.statusCode;

            spyOn(this.requiredResources, 'verifyResourcesResponded');
            this.requiredResources.add(this.model);
            this.model.trigger("serverResponded");
            expect(this.requiredResources.verifyResourcesResponded).toHaveBeenCalled();
        });
    });

    describe("when a required fetch responds", function() {
        context("when all resource fetches have responded", function() {
            it("should trigger the allResourcesResponded event", function() {
                delete this.model.statusCode;

                spyOnEvent(this.requiredResources, 'allResourcesResponded');
                this.requiredResources.add(this.model);

                this.model.statusCode = 422;
                this.model.trigger("serverResponded");

                expect("allResourcesResponded").toHaveBeenTriggeredOn(this.requiredResources);
            });
        });

        context("when all resources have not yet been fetched", function() {
            it("should not trigger the allResourcesResponded event", function() {
                var otherModel = backboneFixtures.dataset();

                delete this.model.statusCode;
                delete otherModel.statusCode;

                spyOnEvent(this.requiredResources, 'allResourcesResponded');
                this.requiredResources.add(this.model);
                this.requiredResources.add(otherModel);

                this.model.statusCode = 422;
                this.model.trigger("serverResponded");

                expect("allResourcesResponded").not.toHaveBeenTriggeredOn(this.requiredResources);
            });
        });
    });


    describe("allResponded", function() {
        beforeEach(function() {
            this.requiredResources.reset([this.model, this.collection]);
        });
        
        it('returns true if all objects have responded', function() {
            this.model.statusCode = 422;
            this.collection.statusCode = 200;
            expect(this.requiredResources.allResponded()).toBeTruthy();
        });

        it('returns false if one has not responded', function() {
            this.model.statusCode = 200;
            delete this.collection.statusCode;
            expect(this.requiredResources.allResponded()).toBeFalsy();
        });

        it('returns true if empty', function() {
            this.requiredResources.reset();
            expect(this.requiredResources.allResponded()).toBeTruthy();
        });
    });

    describe("#cleanUp", function() {
        beforeEach(function() {
            this.viewContext = {};
            spyOn(this.model, "unbind");
            this.requiredResources.add(this.model);

            spyOn(this.requiredResources, "stopListening");
            spyOn(this.requiredResources, "unbind");
            this.requiredResources.cleanUp(this.viewContext);
        });

        it("unbinds 'viewContext' events from the individual resources", function() {
            expect(this.model.unbind).toHaveBeenCalledWith(null, null, this.viewContext);
        });

        it("stops listening to events on the individual resources", function() {
            expect(this.requiredResources.stopListening).toHaveBeenCalled();
        });

        it("empties the collection", function() {
            expect(this.requiredResources.length).toBe(0);
        });

        it("unbinds the whole collection", function() {
            expect(this.requiredResources.unbind).toHaveBeenCalled();
        });
    });
});

