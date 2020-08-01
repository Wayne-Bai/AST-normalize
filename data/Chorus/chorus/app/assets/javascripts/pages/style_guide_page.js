chorus.pages.StyleGuidePage = chorus.pages.Base.extend({
    setup: function() {
        this.mainContent = new chorus.views.MainContentView({
            content: new chorus.pages.StyleGuidePage.SiteElementsView(),
            contentHeader: new chorus.views.StaticTemplate("default_content_header", {title: 'Style Guide Page'}),
            contentDetails: new chorus.views.StaticTemplate("plain_text", {text: 'Design rules for a happy family.'})
        });
    }
});

chorus.pages.StyleGuidePage.SiteElementsView = chorus.views.Bare.extend({
    className: "views",
    templateName: 'style_guide',

    buildModels: function() {
        this.models = {};

        var tagList = _.range(25).map(function(i) {
            return {name: "Tag Numba " + i};
        });

        this.models.workspace = new chorus.models.Workspace({
            name: "Some Workspace",
            summary: "One awesome workspace",
            owner: {firstName: "Bob", lastName: "Lablaw"},
            "public": true,
            archivedAt: null,
            tags: tagList,
            completeJson: true,
            sandboxInfo: {
                id: 1,
                dataSource: {
                    id: 1,
                    name: 'Data Source',
                    entityType: 'gpdb_data_source'
                }
            }
        });

        this.models.workspace._sandbox = new chorus.models.Sandbox({database: {id: 1, dataSource: {id: 1, name: 'Data Source', entityType: 'gpdb_data_source'}}});

        this.models.privateWorkspace = new chorus.models.Workspace({ name: "Private Workspace", summary: "Lots of secrets here", owner: {firstName: "Not", lastName: "You"}, "public": false, archivedAt: null});

        this.models.privateWorkspace.loaded = true;

        this.models.archivedWorkspace = new chorus.models.Workspace({
            name: "Archived Workspace",
            summary: "old data",
            owner: {firstName: "The", lastName: "Past"},
            "public": false,
            archiver: {firstName: "Mr", lastName: "Archiver"},
            archivedAt: "1985-07-21T06:21:02Z"
        });
        this.models.archivedWorkspace.loaded = true;

        this.models.dataSourceAccount = new chorus.models.DataSourceAccount();

        this.models.tag = new chorus.models.Tag({
            name: "my first tag",
            count: 20
        });

        this.models.gpdbDataSource = new chorus.models.GpdbDataSource({
            name: "Greenplum Data Source",
            online: true,
            description: "This is a description of a data source. It is so sick, so AWESOME!",
            tags: tagList,
            completeJson: true
        });

        this.models.oracleDataSource = new chorus.models.OracleDataSource({
            name: "Oracle Data Source",
            online: false,
            tags: tagList,
            completeJson: true
        });

        this.models.hdfsDataSource = new chorus.models.HdfsDataSource({
            name: "Angry Elephant",
            online: true,
            tags: tagList,
            completeJson: true
        });

        this.models.gnipDataSource = new chorus.models.GnipDataSource({
            name: "Some Gnip Source",
            online: true,
            entityType: "gnip_data_source",
            tags: tagList,
            completeJson: true
        });

        this.models.database = new chorus.models.Database({
            "name": "Some database",
            "dataSource": this.models.gpdbDataSource.attributes
        });

        this.models.otherDatabase = new chorus.models.Database({
            "name": "Another database",
            "dataSource": this.models.gpdbDataSource.attributes
        });

        this.models.schema = new chorus.models.Schema({
            "name": "Some schema",
            "database": this.models.database.attributes,
            "datasetCount": 3,
            "refreshedAt": true
        });

        this.models.otherSchema = new chorus.models.Schema({
            "name": "Other schema",
            "database": this.models.database.attributes,
            refreshedAt: null
        });

        this.models.dataset = new chorus.models.DynamicDataset({
            type: "SOURCE_TABLE",
            objectName: "table",
            schema: this.models.schema.attributes,
            entityType: "dataset",
            objectType: "TABLE",
            tags: tagList,
            associatedWorkspaces: [
                this.models.workspace
            ],
            completeJson: true
        });

        this.models.datasetImportability = new chorus.models.DatasetImportability({
            "importable": "false",
            "invalidColumns": []
        });

        this.models.otherDataset = new chorus.models.DynamicDataset({
            "type": "SOURCE_TABLE",
            "objectName": "other table",
            "schema": this.models.schema.attributes,
            "tags": [
                this.models.tag
            ],
            "entityType": "dataset",
            "objectType": "TABLE"
        });

        this.models.workfile = new chorus.models.Workfile({
            fileName: "Some workfile",
            tags: tagList,
            fileType: 'sql',
            completeJson: true,
            versionInfo: {
                versionNum: 23,
                content: "Rainbows!"
            },
            workspace: this.models.workspace.attributes,
            recentComments: [
                {
                    author: {
                        id: 1,
                        username: "chorusadmin",
                        firstName: "Mr",
                        lastName: "Comment"
                    },
                    body: "Comments are fun",
                    complete_json: true,
                    timestamp: "2013-03-25T17:49:58Z"
                }
            ],
            executionSchema: this.models.schema.attributes
        });

        this.models.workfileWithErrors = this.models.workfile.clone();

        this.models.workfileWithErrors.serverErrors = {
            fields: { general: { GENERIC: { field: "general", message: "JDBC::Postgres::Oracle::Connection Really long message that should not wrap in a weird way" }}}
        };

        this.models.tableauWorkfile = new chorus.models.Workfile({
            fileName: "Bestest Tableaust Workfile",
            fileType: "tableau_workbook",
            tags: tagList,
            workbookName: "hey tableau is the bomb",
            workbookUrl: "http://10.80.129.44/workbooks/hey tableau is the bomb",
            completeJson: true,
            recentComments: [
                {
                    author: {
                        id: 1,
                        username: "chorusadmin",
                        firstName: "Chorus",
                        lastName: "Admin"
                    },
                    body: "I always get the last comment, and I like writing really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things really really long things ",
                    complete_json: true,
                    timestamp: "2013-03-25T17:49:58Z"
                }
            ],
            commentCount: 89
        });

        this.models.archivedWorkfile = new chorus.models.Workfile({
            fileName: "Archived SQL Workfile",
            fileType: "sql",
            workspace: this.models.archivedWorkspace.attributes,
            completeJson: true
        });

        this.models.boxplotTask = new chorus.models.BoxplotTask({
            xAxis: "category",
            yAxis: "column2",
            dataset: this.models.dataset,
            bins: 20
        });

        this.models.user = new chorus.models.User({ username: "edcadmin",
            firstName: "Johnny",
            lastName: "Danger",
            admin: true,
            id: "InitialUser1",
            image: { icon: "/images/general/default-user.png"},
            tags: tagList,
            title: "Chief Data Scientist",
            email: "searchquery@jacobibeier.com",
            dept: "Corporation Corp., Inc.",
            notes: "One of our top performers",
            completeJson: true});

        this.models.otherUser = new chorus.models.User({ username: "edcadmin", firstName: "Laurie", lastName: "Blakenship", admin: true, id: "InitialUser2", image: { icon: "/images/general/default-user.png"}});
        this.models.thirdUser = new chorus.models.User({ username: "edcadmin", firstName: "George", lastName: "Gorilla", admin: false, id: "InitialUser3", image: { icon: "/images/general/default-user.png"}});

        this.models.hdfsFile = new chorus.models.HdfsEntry({"name": "foo.cpp", isDir: false, hdfsDataSource: this.models.hdfsDataSource.attributes, contents: ["a,b,1", "b,c,2", "d,e,3"], tags: tagList, size: 1024, completeJson: true});
        this.models.hdfsDir = new chorus.models.HdfsEntry({name: "TestExpression", path: '/arbitrary/path', isDir: true, hdfsDataSource: this.models.hdfsDataSource.attributes, tags: tagList, count: 4, completeJson: true});

        this.models.activity = new chorus.models.Activity({
            "action": "DataSourceChangedOwner",
            "actor": this.models.user.attributes,
            "dataSource": this.models.gpdbDataSource.attributes,
            "newOwner": this.models.otherUser.attributes,
            "timestamp": "2013-01-31T20:14:27Z"
        });

        this.models.otherActivity = new chorus.models.Activity({
            action: "WorkfileCreated",
            actor: this.models.user.attributes,
            workfile: this.models.workfile.attributes,
            commitMessage: "I am committed to this workfile",
            workspace: this.models.workspace.attributes,
            timestamp: "2013-01-31T20:14:27Z"
        });

        this.models.searchResult = new chorus.models.SearchResult({
            users: {
                results: [this.models.user.set({ highlightedAttributes: {
                    "lastName": ["<em>Danger</em>"]
                }})],
                numFound: 14
            },

            workspaces: {
                results: [
                    this.models.workspace.set({ highlightedAttributes: { summary: ["<em>Danger</em> Zone!!"]}}),
                    this.models.archivedWorkspace.set({highlightedAttributes: { summary: ['<em>Search Hit</em>']}})
                ],
                numFound: 1
            },

            hdfsEntries: {
                results: [this.models.hdfsFile],
                numFound: 1
            },

            datasets: {
                results: [this.models.dataset],
                numFound: 1000
            },

            workfiles: {
                results: [this.models.workfile],
                numFound: 2
            },

            dataSources: {
                results: [this.models.gpdbDataSource, this.models.hdfsDataSource, this.models.gnipDataSource],
                numFound: 4
            },

            otherFiles: {
                results: [
                    {
                        "id": 1000009,
                        "name": "searchquery_hadoop",
                        "entityType": "attachment",
                        "type": "",
                        "dataSource": {
                            "name": "searchquery_hadoop",
                            "host": "hadoop.example.com",
                            "port": 1111,
                            "id": 1000000,
                            "description": "searchquery for the hadoop data source",
                            "entityType": "hdfs_data_source"
                        },
                        "completeJson": true,
                        "highlightedAttributes": {
                            "name": [
                                "<em>searchquery</em>_<em>hadoop</em>"
                            ]
                        }
                    }
                ],
                numFound: 7
            }
        });

        this.models.chorusView = new chorus.models.ChorusView(_.extend(this.models.dataset.attributes, {objectName: 'My Favorite Chorus View', query: "SELECT * FROM everywhere;", workspace: this.models.workspace.attributes}));

        this.models.note = new chorus.models.Activity({
            action: "NOTE",
            actionType: "NoteOnWorkspace",
            actor: this.models.user.attributes,
            id: 26,
            body: "Notey note note note! :D",
            workspace: this.models.workspace.attributes,
            timestamp: "2013-03-29T18:18:49Z",
            attachments: [
                {
                    "id": 2,
                    "name": "Screen_Shot_2013-03-27_at_2.26.16_PM.png",
                    "timestamp": "2013-03-29T18:00:37Z",
                    "icon_url": "/notes/26/attachments/2?style=icon&1364580037",
                    "entity_type": "attachment",
                    "type": "png",
                    "workspace": {
                        "id": 1,
                        "name": "ws",
                        "is_deleted": false,
                        "entity_type": "workspace",
                        "summary": "This is my summary and it is hot shit. g",
                        "archived_at": null,
                        "public": true
                    },
                    "complete_json": true
                },
                this.models.chorusView.attributes
            ]
        });
 
        this.models.chartOptions = {type: "boxplot", name: "Foo"};

        this.models.datasetFilter = new chorus.models.DatasetFilter({
            column: this.models.dataset.columns().at(0),
            comparator: "equal",
            input: {value: "original_filter_value_a"}
        });

        this.models.hdfsExternalTable = new chorus.models.HdfsExternalTable({
            path: this.models.hdfsFile.get('path'),
            hdfsDataSourceId: this.models.hdfsDataSource.get('id'),
            hdfs_entry_id: this.models.hdfsFile.get('id')
        });

        this.models.workfileExecutionTask = (function () {
            var numColumns = 10;
            var columns = [];
            _(numColumns).times(function (i) {
                columns[i] = {name: 'header_' + String.fromCharCode(97 + (i % 26))};
            });

            var rows = [];
            _(50).times(function (i) {
                rows[i] = [];
                _(numColumns).times(function (j) {
                    rows[i][j] = [ "Oakland" + i + "Eva" ];
                });
            });

            return new chorus.models.WorkfileExecutionTask({
                columns: columns,
                rows: rows
            });
        })();


        this.models.csvImport = (function() {
            var numColumns = 2;
            var randCommaSeparatedLineOfLength = function(length){
                var arr = [];
                _(length).times(function(i){
                    arr.push(String.fromCharCode(97 + (i%26)));
                });
                return arr.join(",");
            };
            var csvLines = [];
            _(9).times(function(){
                csvLines.push(randCommaSeparatedLineOfLength(numColumns));
            });

            return new chorus.models.CSVImport({
                workspaceId: '90210',
                contents: csvLines
            });
        }) ();

        chorus.session._user = new chorus.models.User({
            apiKey: "some-api-key",
            firstName: "Johnny",
            lastName: "Danger",
            admin: true,
            id: "InitialUser1"
        });

//         console.log ("style --> end of models");
        return this.models;
    },

    buildCollections: function() {
        this.collections = {};

        this.collections.tagSet = new chorus.collections.TagSet([this.models.tag, new chorus.models.Tag({name: 'Another Taggy TagTag', count: 10})]);
        this.collections.tagSet.pagination = {page: 1, perPage: 50, records: 124, total: 3};
        this.collections.tagSet.loaded = true;

        this.collections.workspaceSet = new chorus.collections.WorkspaceSet([this.models.workspace, this.models.privateWorkspace, this.models.archivedWorkspace]);
        this.collections.workspaceSet.loaded = true;

        this.collections.datasetSet = new chorus.collections.SchemaDatasetSet([this.models.dataset, this.models.otherDataset], {schemaId: this.models.schema.get("id")});
        this.collections.datasetSet.loaded = true;

        this.collections.databaseSet = new chorus.collections.DatabaseSet([this.models.database, this.models.otherDatabase]);
        this.collections.databaseSet.loaded = true;

        this.collections.schemaSet = new chorus.collections.SchemaSet([this.models.schema, this.models.otherSchema]);
        this.collections.schemaSet.loaded = true;

        this.collections.dataSourceSet = new chorus.collections.DataSourceSet([this.models.oracleDataSource, this.models.gpdbDataSource]);
        this.collections.hdfsDataSourceSet = new chorus.collections.HdfsDataSourceSet([this.models.hdfsDataSource]);
        this.collections.gnipDataSourceSet = new chorus.collections.GnipDataSourceSet([this.models.gnipDataSource]);
        this.collections.dataSourceSet.loaded = this.collections.hdfsDataSourceSet.loaded = this.collections.gnipDataSourceSet.loaded = true;

        this.collections.workfileSet = new chorus.collections.WorkfileSet([this.models.workfile, this.models.tableauWorkfile]);
        this.collections.workfileSet.loaded = true;

        this.collections.loadingCollection = new chorus.collections.UserSet();
        this.collections.userCollection = new chorus.collections.UserSet([this.models.user, this.models.otherUser, this.models.thirdUser]);
        this.collections.userCollection.pagination = {page: 1, perPage: 50, records: 124, total: 3};
        this.collections.userCollection.loaded = true;

        this.collections.CsvHdfsFileSet = new chorus.collections.CsvHdfsFileSet([this.models.hdfsFile], {hdfsDataSource: this.models.hdfsDataSource});

        this.collections.hdfsEntrySet = new chorus.collections.HdfsEntrySet([this.models.hdfsFile, this.models.hdfsDir], {
            path: '/data/somewhere',
            hdfsDataSource: {id: 222},
            id: 11
        });
        this.collections.hdfsEntrySet.loaded = true;

        this.collections.activitySet = new chorus.collections.ActivitySet([this.models.activity, this.models.otherActivity, this.models.note]);
        this.collections.activitySet.loaded = true;

        this.collections.kaggleUserSet = new chorus.collections.KaggleUserSet([new chorus.models.KaggleUser({fullName: "Abraham Lincoln", rank: 1, location: 'Gettysburg', numberOfEnteredCompetitions: 12})]);
        this.collections.kaggleUserSet.loaded = true;

        this.collections.datasetFilterSet = new chorus.collections.DatasetFilterSet([this.models.datasetFilter]);

        // console.log ("style --> end of buildCollections");
    },

    buildContentDetails: function() {
        var views = {

            "Dataset Details": new chorus.views.DatasetContentDetails({
                dataset: this.models.dataset,
                collection: this.collections.datasetSet
            }),

            "Chorus View Details": new chorus.views.DatasetContentDetails({
                dataset: this.models.chorusView,
                collection: this.collections.datasetSet
            }),

            "Workfile Details": chorus.views.WorkfileContentDetails.buildFor(this.models.workfile),
            "Tableau Workfile Details": chorus.views.WorkfileContentDetails.buildFor(this.models.tableauWorkfile),

            "Read Only (Binary or Archived) Workfile Details": chorus.views.WorkfileContentDetails.buildFor(this.models.archivedWorkfile),

            "HDFS File Details": new chorus.views.HdfsShowFileDetails({ model: this.models.hdfsFile }),

            "Data Source Details": new chorus.views.DataSourceIndexContentDetails({
                dataSources: this.collections.dataSourceSet,
                hdfsDataSources: this.collections.hdfsDataSourceSet,
                gnipDataSources: this.collections.gnipDataSourceSet
            })

        };

        // console.log ("style --> end of buildContentDetails");
        return views;
    },

    buildViews: function() {
        return {

            "Data Grid": new chorus.views.DataGrid({
                model: this.models.workfileExecutionTask
            }),

            "Breadcrumbs": new chorus.views.BreadcrumbsView({
                breadcrumbs: [
                    { label: "Example Home", url: "#/" },
                    { label: t("breadcrumbs.users"), url: "#/users" },
                    { label: t("breadcrumbs.new_user") }
                ]
            }),

            "Sub Nav": new chorus.views.SubNav({model: this.models.workspace, tab: "summary"}),

            "Link Menu": new chorus.views.LinkMenu({title: "Link Menu", options: [
                {data: "first", text: "Text of first option"},
                {data: "second", text: "Text of second option"}
            ]}),

            "Basic Main Content View": new chorus.views.MainContentView({
                contentHeader: new chorus.views.StaticTemplate("default_content_header", {title: 'Content Header'}),
                // contentDetails: new chorus.views.StaticTemplate("plain_text", {text: 'Content Details'}),
                content: new chorus.views.StaticTemplate("ipsum")
            }),

            "List Page (loading)": new chorus.views.MainContentList({
                modelClass: "Dataset",
                collection: this.collections.loadingCollection
            }),

            "User List": new chorus.views.MainContentList({
                modelClass: "User",
                collection: this.collections.userCollection,
                linkMenus: {
                    sort: {
                        title: t("users.header.menu.sort.title"),
                        options: [
                            {data: "firstName", text: t("users.header.menu.sort.first_name")},
                            {data: "lastName", text: t("users.header.menu.sort.last_name")}
                        ],
                        event: "sort",
                        chosen: "lastName"
                    }
                },
                buttons: [
                    {
                        url: "#",
                        text: "Button 1"
                    },
                    {
                        url: "#",
                        text: "Button 2"
                    }
                ]
            }),

            "Database List": new chorus.views.MainContentList({
                collection: this.collections.databaseSet,
                modelClass: "Database"
            }),

            "Workfile List": new chorus.views.MainContentList({
                collection: this.collections.workfileSet,
                modelClass: "Workfile"
            }),

            "Schema List": new chorus.views.MainContentList({
                collection: this.collections.schemaSet,
                modelClass: "Schema"
            }),

            "Workspace List": new chorus.views.MainContentList({
                collection: this.collections.workspaceSet,
                modelClass: "Workspace"
            }),

            "Tag List": new chorus.views.MainContentList({
                collection: this.collections.tagSet,
                modelClass: 'Tag'
            }),

            "HDFS Entry List": new chorus.views.MainContentList({
                collection: this.collections.hdfsEntrySet,
                modelClass: "HdfsEntry",
                useCustomList: true
            }),

            "Dataset List": new chorus.views.MainContentList({
                collection: this.collections.datasetSet,
                modelClass: "Dataset",
                useCustomList: true
            }),

            "Data Source List": function() {
                var options = {
                    dataSources: this.collections.dataSourceSet,
                    hdfsDataSources: this.collections.hdfsDataSourceSet,
                    gnipDataSources: this.collections.gnipDataSourceSet
                };

                return new chorus.views.MainContentView({
                    contentDetails: new chorus.views.DataSourceIndexContentDetails(options),
                    content: new chorus.views.DataSourceIndex(options),
                    useCustomList: true
                });
            }.call(this),

            "Search Result List": new chorus.views.SearchResults({
                model: this.models.searchResult
            }),

            "Activity List": new chorus.views.ActivityList({
                collection: this.collections.activitySet
            }),

            "Kaggle User List": new chorus.views.MainContentList({
                collection: this.collections.kaggleUserSet,
                modelClass: "KaggleUser"
            }),

            "Visualization: BoxPlot": new chorus.views.visualizations.Boxplot({
                model: new chorus.models.BoxplotTask({
                    xAxis: "test_coverage",
                    yAxis: "speed",
                    columns: [
                        { name: "bucket", typeCategory: "STRING" },
                        { name: "min", typeCategory: "REAL_NUMBER" },
                        { name: "median", typeCategory: "REAL_NUMBER" },
                        { name: "max", typeCategory: "REAL_NUMBER" },
                        { name: "firstQuartile", typeCategory: "REAL_NUMBER" },
                        { name: "thirdQuartile", typeCategory: "REAL_NUMBER" },
                        { name: "percentage", typeCategory: "STRING" }
                    ],
                    rows: [
                        { bucket: 'january', min: 1, firstQuartile: 5, median: 8, thirdQuartile: 12, max: 25, percentage: "20.999%" },
                        { bucket: 'february', min: 2, firstQuartile: 3, median: 5, thirdQuartile: 7, max: 8, percentage: "40.3%" },
                        { bucket: 'march', min: 10, firstQuartile: 10, median: 25, thirdQuartile: 30, max: 35, percentage: "10.12" },
                        { bucket: 'april', min: 2, firstQuartile: 3, median: 8, thirdQuartile: 9, max: 15, percentage: "30%" }
                    ],
                    dataset: this.models.dataset
                }),
                x: 'animal',
                y: 'value'
            }),

            "Visualization: Frequency Plot": new chorus.views.visualizations.Frequency({
                model: new chorus.models.FrequencyTask({
                    columns: [
                        {name: "bucket", typeCategory: "STRING"},
                        {name: "count", typeCategory: "WHOLE_NUMBER"}
                    ],

                    rows: [
                        { bucket: "Twenty", count: 20 },
                        { bucket: "Eight", count: 8 },
                        { bucket: "Five", count: 5 },
                        { bucket: "One", count: 1 },
                        { bucket: "Zero", count: 0 }
                    ],
                    "chart[yAxis]": "Custom y Axis Title",
                    dataset: this.models.dataset
                })
            }),

            "Visualization: HistogramPlot": new chorus.views.visualizations.Histogram({
                model: new chorus.models.HistogramTask({
                    columns: [
                        {name: "bin", typeCategory: "STRING"},
                        {name: "frequency", typeCategory: "WHOLE_NUMBER"}
                    ],

                    rows: [
                        { bin: [0, 2], frequency: 5 },
                        { bin: [2, 4], frequency: 8 },
                        { bin: [4, 6], frequency: 0 },
                        { bin: [6, 8], frequency: 1 },
                        { bin: [8, 10], frequency: 20 }
                    ],
                    "chart[xAxis]": "Custom x Axis Title",
                    dataset: this.models.dataset
                })
            }),

            "Visualization: Heatmap": new chorus.views.visualizations.Heatmap({
                model: new chorus.models.HistogramTask({
                    xAxis: "brutality",
                    yAxis: "victory_points",
                    columns: [
                        { "name": "x", "typeCategory": "WHOLE_NUMBER" },
                        { "name": "y", "typeCategory": "WHOLE_NUMBER" },
                        { "name": "value", "typeCategory": "REAL_NUMBER" },
                        { "name": "xLabel", "typeCategory": "STRING" },
                        { "name": "yLabel", "typeCategory": "STRING" }
                    ],

                    rows: [
                        {yLabel: [30, 64.83], xLabel: [200001, 366667.5], value: 27952, y: 1, x: 1},
                        {yLabel: [64.83, 99.67], xLabel: [200001, 366667.5], value: 27719, y: 2, x: 1},
                        {yLabel: [99.67, 134.5], xLabel: [200001, 366667.5], value: 27714, y: 3, x: 1},
                        {yLabel: [134.5, 169.33], xLabel: [200001, 366667.5], value: 27523, y: 4, x: 1},
                        {yLabel: [169.33, 204.17], xLabel: [366667.5, 533334], value: 27926, y: 5, x: 2},
                        {yLabel: [204.17, 239], xLabel: [366667.5, 533334], value: 27738, y: 6, x: 2},
                        {yLabel: [30, 64.83], xLabel: [533334, 700000.5], value: 27801, y: 1, x: 3},
                        {yLabel: [64.83, 99.67], xLabel: [533334, 700000.5], value: 27675, y: 2, x: 3},
                        {yLabel: [99.67, 134.5], xLabel: [533334, 700000.5], value: 27936, y: 3, x: 3},
                        {yLabel: [134.5, 169.33], xLabel: [533334, 700000.5], value: 27558, y: 4, x: 3},
                        {yLabel: [169.33, 204.17], xLabel: [533334, 700000.5], value: 27953, y: 5, x: 3},
                        {yLabel: [204.17, 239], xLabel: [533334, 700000.5], value: 27743, y: 6, x: 3},
                        {yLabel: [30, 64.83], xLabel: [700000.5, 866667], value: 27635, y: 1, x: 4},
                        {yLabel: [64.83, 99.67], xLabel: [700000.5, 866667], value: 27964, y: 2, x: 4},
                        {yLabel: [99.67, 134.5], xLabel: [700000.5, 866667], value: 27528, y: 3, x: 4},
                        {yLabel: [134.5, 169.33], xLabel: [700000.5, 866667], value: 28089, y: 4, x: 4},
                        {yLabel: [169.33, 204.17], xLabel: [700000.5, 866667], value: 27673, y: 5, x: 4},
                        {yLabel: [204.17, 239], xLabel: [700000.5, 866667], value: 27777, y: 6, x: 4},
                        {yLabel: [30, 64.83], xLabel: [866667, 1033333.5], value: 27722, y: 1, x: 5},
                        {yLabel: [64.83, 99.67], xLabel: [866667, 1033333.5], value: 28019, y: 2, x: 5},
                        {yLabel: [99.67, 134.5], xLabel: [866667, 1033333.5], value: 27608, y: 3, x: 5},
                        {yLabel: [134.5, 169.33], xLabel: [866667, 1033333.5], value: 27812, y: 4, x: 5},
                        {yLabel: [169.33, 204.17], xLabel: [866667, 1033333.5], value: 27742, y: 5, x: 5},
                        {yLabel: [204.17, 239], xLabel: [866667, 1033333.5], value: 27764, y: 6, x: 5},
                        {yLabel: [30, 64.83], xLabel: [1033333.5, 1200000], value: 27818, y: 1, x: 6},
                        {yLabel: [64.83, 99.67], xLabel: [1033333.5, 1200000], value: 27778, y: 2, x: 6},
                        {yLabel: [99.67, 134.5], xLabel: [1033333.5, 1200000], value: 27662, y: 3, x: 6},
                        {yLabel: [134.5, 169.33], xLabel: [1033333.5, 1200000], value: 27888, y: 4, x: 6},
                        {yLabel: [169.33, 204.17], xLabel: [1033333.5, 1200000], value: 27951, y: 5, x: 6},
                        {yLabel: [204.17, 239], xLabel: [1033333.5, 1200000], value: 26807, y: 6, x: 6}
                    ],
                    dataset: this.models.dataset
                })
            }),

            "Visualization: Timeseries": new chorus.views.visualizations.Timeseries({
                model: new chorus.models.TimeseriesTask({
                    columns: [
                        {name: "time", typeCategory: "DATE"},
                        {name: "value", typeCategory: "WHOLE_NUMBER"}
                    ],

                    rows: [
                        { time: '2010-01-01', value: 321 },
                        { time: '2010-02-01', value: 124 },
                        { time: '2011-03-01', value: 321 },
                        { time: '2011-04-01', value: 321 },
                        { time: '2011-05-01', value: 421 },
                        { time: '2012-06-01', value: 621 },
                        { time: '2012-07-01', value: 524 },
                        { time: '2012-08-01', value: 824 },
                        { time: '2012-09-01', value: 924 },
                        { time: '2012-09-02', value: 926 },
                        { time: '2012-09-03', value: 927 },
                        { time: '2012-09-04', value: 124 },
                        { time: '2012-09-05', value: 224 },
                        { time: '2012-09-06', value: 924 },
                        { time: '2012-09-07', value: 524 },
                        { time: '2012-09-08', value: 924 },
                        { time: '2012-10-01', value: 724 }
                    ],
                    xAxis: "Day of the Week",
                    yAxis: "Parties",
                    timeType: "date",
                    dataset: this.models.dataset
                })
            }),

            "Text Workfile Content": new chorus.views.TextWorkfileContent({
                model: this.models.workfile
            })

        };
    },

    buildDialogs: function() {
        return {
            "Data Grid": new chorus.views.DataGrid({
                model: this.models.workfileExecutionTask
            }),

            "New Table Import from CSV ": new chorus.dialogs.NewTableImportCSV({
                model: this.models.csvImport,
                csvOptions: {tableName: 'foobar', contents: this.models.csvImport.get("contents")}
            }),

            "Workspace Data source Account": new chorus.dialogs.WorkspaceDataSourceAccount({model: this.models.dataSourceAccount, pageModel: this.models.workspace}),

            "Data Source Account": new chorus.dialogs.DataSourceAccount({
                title: t("data_sources.account.add.title"),
                dataSource: this.models.gpdbDataSource
            }),

// change password dialog wont render anymore
// without user model
             "Change Your Password": new chorus.dialogs.ChangePassword({
                    model: this.models.user
                }),

              "Change Password": new chorus.dialogs.ChangePassword({
                    model: this.models.otherUser
                }),               

            "New Note": new chorus.dialogs.NotesNew({pageModel: new chorus.models.Job()}),

            "Comment": new chorus.dialogs.Comment(),

            "Create Directory External Table from HDFS": new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
                collection: this.collections.CsvHdfsFileSet,
                directoryName: "some directory"
            }),

            "Edit Note": new chorus.dialogs.EditNote({
                activity: this.models.activity
            }),

            "Edit Tags": new chorus.dialogs.EditTags({
                collection: this.collections.workfileSet
            }),

            "Insights New": new chorus.dialogs.InsightsNew({pageModel: new chorus.models.Job()}),

            "Pick Workspace": new chorus.dialogs.PickWorkspace(),

            "SQL Preview": new chorus.dialogs.SqlPreview({model: this.models.chorusView}),

            "Verify Chorus View": new chorus.dialogs.VerifyChorusView({model: this.models.chorusView}),

            "Create Database View": new chorus.dialogs.CreateDatabaseView({ pageModel: this.models.dataset }),

            "Edit Data Source": new chorus.dialogs.DataSourceEdit({
                model: this.models.gpdbDataSource
            }),

            "Dataset Not Importable Alert": new chorus.alerts.DatasetNotImportable({ datasetImportability: this.models.datasetImportability }),

            "Dataset Download": new chorus.dialogs.DatasetDownload({ pageModel: this.models.dataset}),

// !DATASET filter set
//             "Visualization": new chorus.dialogs.Visualization({
//                 task: this.models.boxplotTask,
//                 model: this.models.chorusView,
//                 chartOptions: this.models.chartOptions,
//                 filters: this.collections.datasetFilterSet,
//                 columnSet: this.models.dataset.columns()
//             }),

           "Create External Table From Hdfs": new chorus.dialogs.CreateExternalTableFromHdfs({
               model: this.models.hdfsExternalTable,
               csvOptions: {
                   tableName: this.models.hdfsFile.name(),
                   contents: this.models.hdfsFile.get('contents')
               }
           }),

            "Import Now": new chorus.dialogs.ImportNow({
                dataset: this.models.dataset
            }),

            "Name Chorus View": new chorus.dialogs.NameChorusView({
                model: this.models.chorusView
            }),

            "Publish To Tableau": new chorus.dialogs.PublishToTableau({
                model: this.models.dataset.deriveTableauWorkbook(),
                dataset: this.models.dataset
            }),

            "Import Gnip Stream": new chorus.dialogs.ImportGnipStream({
                pageModel: this.models.gnipDataSource
            }),

            "New Data Source": new chorus.dialogs.DataSourcesNew(),

            "Data Source Permissions": new chorus.dialogs.DataSourcePermissions({
                dataSource: this.models.gpdbDataSource
            }),

            "Compose Kaggle Message": new chorus.dialogs.ComposeKaggleMessage({
                collection: this.collections.kaggleUserSet
            }),

            "Change Workfile Schema": new chorus.dialogs.ChangeWorkfileSchema({ model: this.models.workfile }),

            "New Workfile Version": new chorus.dialogs.WorkfileNewVersion({ pageModel: this.models.workfile }),

            "Dialog With Errors": new chorus.dialogs.WorkfileNewVersion({ pageModel: this.models.workfileWithErrors }),

             "Import Workfiles": new chorus.dialogs.WorkfilesImport({
                workspaceId: 'bar',
                pageModel: this.models.workfile,
                pageCollection: this.models.workfileSet
            }),

            "New SQL Workfile": new chorus.dialogs.WorkfilesSqlNew({ pageModel: {id: 'the-singing-detective'} }),

            "Associate With Workspace": new chorus.dialogs.AssociateWithWorkspace({
                model: this.models.dataset,
                activeOnly: true
            }),

            "New Visualization Notes": new chorus.dialogs.VisualizationNotesNew({
                entityId: "1",
                entityName: "my dataset",
                workspaceId: "22",
                entityType: "dataset",
                allowWorkspaceAttachments: "true",
                pageModel: this.models.dataset,
                attachVisualization: {
                    fileName: "hello-frequency.png",
                    svgData: "<svg/>"
                }
            })
        };
    },

    initialize: function() {
        this.buildModels();
        this.buildCollections();
        this.views = this.buildViews();
        this.contentDetails = this.buildContentDetails();
        this.dialogs = this.buildDialogs();
        this.colorPalette = { "Color Palette": new chorus.views.ColorPaletteView() };
        this.fontStyles = { "Font Styles": new chorus.views.StyleGuideFonts() };
        this.components = { "Components": new chorus.views.Components() };

        _.defer(_.bind(this.render, this));
    },

    renderViews: function(views, tabId, parentClass) {
        var self = this;

        _.each(views, function(view, name) {
            var $element = $("<div class='view_guts'/>");
            if(parentClass) $element = $('<div class="' + parentClass + '"/>').html($element);

            var $heading = $("<div class='view'><h1>" + name + "</h1></div>");
            var styleGuideEntry = $heading.append($element);

            $(self.$("#tabs > " + tabId)).append(styleGuideEntry);
            view.setElement(self.$(".view_guts:last"));
            view.render();
        });
    },

    postRender: function() {

        this.renderViews(this.components, '#components');
        this.renderViews(this.fontStyles, "#fonts");
        this.renderViews(this.dialogs, '#dialogs', 'popup');
        this.renderViews(this.contentDetails, "#content_details", "content_details");
        this.renderViews(this.views, '#views');
        this.renderViews(this.colorPalette, '#color_palette');
        this.renderErrors();

        $(this.$('#tabs')).tabs();

        setInterval(this.enableScrolling, 100);

        return this;
    },

    renderErrors: function() {
        this.models.workfileWithErrors.trigger('saveFailed');
    },

    // Used to ensure scrolling works after re-rendering dialog
    enableScrolling: function() {
        $("body").css("overflow", "visible");
    }
});
