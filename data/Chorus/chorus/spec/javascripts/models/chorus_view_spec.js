describe("chorus.models.ChorusView", function() {

    function addJoin(self, sourceColumn) {
        sourceColumn || (sourceColumn = self.sourceDataset.columns().models[0]);
        var joinedDataset = backboneFixtures.workspaceDataset.datasetTable();
        var columnSet = backboneFixtures.databaseColumnSet();
        joinedDataset.columns().reset([columnSet.at(0), columnSet.at(1)]);
        var joinedColumn = joinedDataset.columns().models[0];
        self.model.addJoin(sourceColumn, joinedColumn, 'inner');
        return joinedColumn;
    }

    beforeEach(function() {
        this.sourceDataset = backboneFixtures.workspaceDataset.datasetTable();
        var columnSet = backboneFixtures.databaseColumnSet();
        this.sourceDataset.columns().reset([columnSet.at(0), columnSet.at(1), columnSet.at(2)]);
        this.model = this.sourceDataset.deriveChorusView();
        this.model.aggregateColumnSet = new chorus.collections.DatabaseColumnSet(this.sourceDataset.columns().models);
    });

    it("has the right url for create, update, and delete", function() {
        _.each(['create', 'update', 'delete'], function(method) {
            this.model.attributes.sourceObjectId = "100";
            expect(this.model.url({method: method})).toMatchUrl('/chorus_views/');
        }, this);
    });

    it("has the right url for read", function() {
        expect(this.model.url({method: "read"})).toMatchUrl('/workspaces/' +  this.model.workspace().id + '/datasets/');
    });

    it("has the right url when duplicate is true", function() {
        this.model.attributes.sourceObjectId = "100";
        this.model.duplicate= true;
        expect(this.model.url()).toMatchUrl('/chorus_views/100/duplicate');
    });

    it("delegates to the source object for #schema and #workspace", function() {
        expect(this.model.schema().name()).toBe(this.sourceDataset.schema().name());
        expect(this.model.workspace().attributes).toEqual(this.sourceDataset.workspace().attributes);
    });

    it("initializes its 'type' and 'object type' attributes correctly", function() {
        var model = new chorus.models.ChorusView();
        expect(model).toHaveAttrs({
            entitySubtype: "CHORUS_VIEW",
            objectType: "CHORUS_VIEW"
        });
    });

    it("extends WorkspaceDataset", function() {
        expect(this.model).toBeA(chorus.models.WorkspaceDataset);
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
        });

        it("requires an object name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("objectName", undefined, "dataset.chorusview.validation.object_name_required");
        });

        it("enforces object name constraints", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("objectName", chorus.ValidationRegexes.ChorusIdentifier(), undefined, "dataset.chorusview.validation.object_name_pattern");
        });
    });

    describe("addJoin", function() {
        beforeEach(function() {
            this.changeEvent = spyOnEvent(this.model, 'change');
            spyOnEvent(this.model.aggregateColumnSet, 'change');
            spyOnEvent(this.model.aggregateColumnSet, 'join:added');
            this.sourceColumn = this.sourceDataset.columns().models[0];
            this.destinationColumn = addJoin(this, this.sourceColumn);
            this.destinationDataset = this.destinationColumn.dataset;
        });

        it("saves the table", function() {
            expect(this.model.joins.length).toBe(1);
            var join = this.model.joins[0];
            expect(join.sourceColumn).toBe(this.sourceColumn);
            expect(join.destinationColumn).toBe(this.destinationColumn);
            expect(join.joinType).toBe('inner');
        });

        it("triggers change on the model", function() {
            expect('change').toHaveBeenTriggeredOn(this.model);
        });

        it("assigns the join the next datasetNumber", function() {
            expect(this.destinationColumn.dataset.datasetNumber).toBe(2);
            var thirdDestinationColumn = addJoin(this);
            expect(thirdDestinationColumn.dataset.datasetNumber).toBe(3);
        });

        it("triggers change and join:added on the aggregate column set (so that column list views re-render)", function() {
            expect("change").toHaveBeenTriggeredOn(this.model.aggregateColumnSet);
            expect("join:added").toHaveBeenTriggeredOn(this.model.aggregateColumnSet);
        });

        it("adds the destination dataset's columns to the aggregate column set", function() {
            expect(this.model.aggregateColumnSet.models).toContain(this.destinationColumn);
            this.destinationDataset.columns().each(_.bind(function(column) {
                expect(this.model.aggregateColumnSet.models).toContain(column);
            }, this));
        });

        describe("removeJoin", function() {
            beforeEach(function() {
                addJoin(this);
                this.changeEvent.reset();
                this.model.removeJoin(this.destinationDataset);
            });

            it("reorders existing joins", function() {
                _.each(this.model.joins, function(join, index) {
                    expect(join.destinationColumn.dataset.datasetNumber).toBe(index + 2);
                });
            });

            it("removes the join", function() {
                expect(this.model.joins.length).toBe(1);
            });

            it("triggers change on the model", function() {
                expect('change').toHaveBeenTriggeredOn(this.model);
            });

            it("removes the destination dataset's columns from the aggregate column set", function() {
                this.destinationDataset.columns().each(_.bind(function(column) {
                    expect(this.model.aggregateColumnSet.models).not.toContain(column);
                }, this));
            });
        });

        describe("removeJoin with a chain of joins", function() {
            beforeEach(function() {
                this.siblingJoinColumn = addJoin(this);
                this.secondNestedJoinColumn = addJoin(this, this.destinationColumn);
                this.thirdNestedJoinColumn = addJoin(this, this.secondNestedJoinColumn);
                this.model.removeJoin(this.destinationDataset);
            });

            it("keeps unrelated joins", function() {
                expect(_.any(this.model.joins, _.bind(function(join) {
                    return join.destinationColumn === this.siblingJoinColumn;
                }, this))).toBeTruthy();
            });

            it("removes joins dependent on the removed join", function() {
                expect(_.any(this.model.joins, _.bind(function(join) {
                    return join.destinationColumn === this.secondNestedJoinColumn ||
                        join.destinationColumn === this.thirdNestedJoinColumn;
                }, this))).toBeFalsy();
            });
        });
    });

    describe("addColumn", function() {
        beforeEach(function() {
            spyOnEvent(this.model, 'change');
            this.column = this.sourceDataset.columns().models[0];
            spyOnEvent(this.column, 'change');
            this.model.addColumn(this.column);
        });

        it("has the column", function() {
            expect(this.model.sourceObjectColumns).toContain(this.column);
        });

        it("triggers change on the model", function() {
            expect('change').toHaveBeenTriggeredOn(this.model);
        });

        it("marks the column as selected", function() {
            expect(this.column.selected).toBeTruthy();
        });

        it("triggers change on the column", function() {
            expect('change').toHaveBeenTriggeredOn(this.column);
        });

        context("for a column already added", function() {
            beforeEach(function() {
                resetBackboneEventSpies(this.model);
                this.model.addColumn(this.column);
            });

            it("prevents duplicates", function() {
                expect(this.model.columns.length).toBe(1);
            });

            it("does not trigger change on the model", function() {
                expect('change').not.toHaveBeenTriggeredOn(this.model);
            });
        });

        context("for a column on a join", function() {
            beforeEach(function() {
                this.joinedColumn = addJoin(this, this.sourceColumn);
                this.model.addColumn(this.joinedColumn);
                this.join = this.model.joins[0];
            });

            it("adds the column to the column list of the join", function() {
                expect(this.join.columns).toContain(this.joinedColumn);
            });
            describe("removeColumn", function() {
                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    expect(this.join.columns.length).toBe(1);
                    this.model.removeColumn(this.joinedColumn);
                });

                it("removes the column", function() {
                    expect(this.join.columns.length).toBe(0);
                });

                it("triggers change on the model", function() {
                    expect('change').toHaveBeenTriggeredOn(this.model);
                });
            });
        });

        describe("removeColumn", function() {
            context("with a column that exists", function() {

                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    resetBackboneEventSpies(this.column);
                    this.model.removeColumn(this.column);
                });

                it("removes the column", function() {
                    expect(this.model.sourceObjectColumns.length).toBe(0);
                });

                it("triggers change on the model", function() {
                    expect('change').toHaveBeenTriggeredOn(this.model);
                });

                it("marks the column as not selected", function() {
                    expect(this.column.selected).toBeFalsy();
                });

                it("triggers change on the column", function() {
                    expect('change').toHaveBeenTriggeredOn(this.column);
                });
            });

            context("with a column that does not exists", function() {

                beforeEach(function() {
                    resetBackboneEventSpies(this.model);
                    this.model.removeColumn(this.sourceDataset.columns().models[1]);
                });

                it("does nothing to the columns", function() {
                    expect(this.model.columns.length).toBe(1);
                });

                it("does not trigger change on the model", function() {
                    expect('change').not.toHaveBeenTriggeredOn(this.model);
                });
            });
        });
    });

    describe("generateFromClause", function() {
        context("with only the base table", function() {
            it("has the proper from clause", function() {
                expect(this.model.generateFromClause()).toBe('FROM "' + this.sourceDataset.get("schema").name + '"."' + this.sourceDataset.get('objectName') + '"');
            });
        });

        context("with a table joined in", function() {
            beforeEach(function() {
                this.sourceColumn = this.sourceDataset.columns().models[0];
                this.firstJoinedColumn = addJoin(this, this.sourceColumn);
            });

            it("has the second table joined in", function() {
                var lines = this.model.generateFromClause().split('\n');
                expect(lines[0]).toBe('FROM "' + this.sourceDataset.get("schema").name + '".' + this.sourceDataset.quotedName());
                expect(lines[1]).toBe('\tINNER JOIN ' + this.firstJoinedColumn.dataset.fromClause() + ' ON ' +
                    this.sourceColumn.quotedName() + " = " + this.firstJoinedColumn.quotedName());
            });
        });
    });

    describe("valid", function() {
        context("when there are no columns selected", function() {
            it("is not valid", function() {
                expect(this.model.valid()).toBeFalsy();
            });
        });

        context("when there are sourceDataset columns selected", function() {
            beforeEach(function() {
                this.model.addColumn(this.sourceDataset.columns().models[0]);
            });

            it("is valid", function() {
                expect(this.model.valid()).toBeTruthy();
            });
        });

        context("when there are join columns selected", function() {
            beforeEach(function() {
                var joinedColumn = addJoin(this);
                this.model.addColumn(joinedColumn);
            });

            it("is valid", function() {
                expect(this.model.valid()).toBeTruthy();
            });
        });
    });

    describe("generateSelectClause", function() {
        context("when no columns are selected", function() {
            it("returns 'SELECT *'", function() {
                expect(this.model.generateSelectClause()).toBe("SELECT *");
            });
        });

        context("when two columns are selected", function() {
            beforeEach(function() {
                this.column1 = backboneFixtures.databaseColumn({name: "Foo"});
                this.column2 = backboneFixtures.databaseColumn({name: "bar"});
                this.sourceDataset.columns().reset([this.column1, this.column2]);
                this.model.addColumn(this.column1);
                this.model.addColumn(this.column2);
            });

            it("should build a select clause from the selected columns", function() {
                var tableName = this.sourceDataset.selectName();
                expect(this.model.generateSelectClause()).toBe('SELECT ' + tableName + '."Foo", ' + tableName + '."bar"');
            });

            context("when selecting a joined column", function() {
                beforeEach(function() {
                    var joinedColumn = addJoin(this);
                    joinedColumn.set({name: 'baz'});
                    this.joinedDataset = joinedColumn.dataset;
                    this.model.addColumn(joinedColumn);
                });

                it("has the joined columns too", function() {
                    var tableName = this.sourceDataset.selectName();
                    var joinedTableName = this.joinedDataset.selectName();
                    expect(this.model.generateSelectClause()).toBe('SELECT ' + tableName + '."Foo", ' + tableName + '."bar", "' + joinedTableName + '"."baz"');
                });
            });
        });
    });

    describe("toJSON", function() {
        it("only returns necessary attributes", function() {
            this.model.set({
                objectName: 'my_chorus_view',
                sourceObjectId: 'source-object-id',
                sourceObjectType: 'source-object_type',
                query: 'SELECT potato FROM pants;'
            });
            expect(this.model.toJSON()['chorus_view']).toEqual({
                object_name: 'my_chorus_view',
                schema_id: this.model.schema().get("id"),
                source_object_id: this.model.get("sourceObjectId"),
                source_object_type: this.model.get("sourceObjectType"),
                workspace_id: this.model.workspace().get('id'),
                query: "SELECT potato FROM pants;"
            });
        });
    });

    describe("#download", function() {
        beforeEach(function() {
            spyOn(chorus, "fileDownload");
            this.model = backboneFixtures.workspaceDataset.chorusView();
        });

        context("when no number of rows is passed", function() {
            it("includes the number of rows", function() {
                this.model.download();
                expect(chorus.fileDownload).toHaveBeenCalledWith("/datasets/" + this.model.id + "/download.csv", {data: {}});
            });
        });

        context("when a number of rows is passed", function() {
            it("makes a request to the tabular data download api", function() {
                this.model.download({ rowLimit: "345" });
                expect(chorus.fileDownload).toHaveBeenCalledWith("/datasets/" + this.model.id + "/download.csv", { data: {row_limit: "345"} });
            });
        });
    });
});
