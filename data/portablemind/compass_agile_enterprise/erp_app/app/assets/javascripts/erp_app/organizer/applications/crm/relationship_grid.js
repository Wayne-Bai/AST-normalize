Ext.define("Compass.ErpApp.Organizer.Applications.Crm.RelationshipGrid",{
    extend:"Ext.grid.Panel",
    alias:'widget.relationshipgrid',
    initComponent: function() {
        this.addEvents(
            /**
             * @event addpartybtnclick
             * Fires when add party button is clicked.
             * @param {Ext.Panel} btn the button that was click.
             * @param {Compass.ErpApp.PartyGrid} grid reference to the PartyGrid.
             */
            'addpartybtnclick'
            );

        var grid = this;
        var config = this.initialConfig;
        var store = Ext.create('Ext.data.Store', {
            fields:config.fields,
            autoLoad: false,
            autoSync: true,
            proxy: {
                type: 'rest',
                url:'/erp_app/organizer/crm/relationship',
                extraParams:{
                    party_id: null,
                    relationship_type: config.relationshiptype
                },
                reader: {
                    type: 'json',
                    successProperty: 'success',
                    root: 'data',
                    totalProperty:'totalCount',
                    messageProperty: 'message'
                },
                listeners: {
                    exception: function(proxy, response, operation){
                        Ext.MessageBox.show({
                            title: 'REMOTE EXCEPTION',
                            msg: 'Error Saving ' + config.partyType,
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    }
                }
            }
        });

        this.store = store;
        this.setParams = function(params) {
            this.store.proxy.extraParams.party_id =  params.partyId;
        };

        this.bbar = Ext.create("Ext.PagingToolbar",{
            pageSize: 30,
            store: store,
            displayInfo: true,
            displayMsg: 'Displaying {0} - {1} of {2}',
            emptyMsg: "No Parties"
        });

        this.callParent(arguments);
    }, constructor : function(config) {
        var columns, fields;

        if (config.columns === undefined ||
                config.columns === null) {

            columns = [
            {
                header: 'Party ID',
                dataIndex: 'party_id'
            },
            {
                header: 'Party Description',
                dataIndex: 'party_desc'
            },
            {
                header:'Role Description',
                dataIndex: 'to_role_description'
            },
            {
                header:'Role Comments',
                dataIndex: 'to_role_comments'
            },
            {
                header:'From Date',
                dataIndex: 'from_date'
            },
            {
                header:'Thru Date',
                dataIndex: 'thru_date'
            }
            ];

            fields = [
            {
                name:'party_id'
            },
            {
                name:'party_desc'
            },
            {
                name:'from_date'
            },
            {
                name:'thru_date'
            },
            {
                name:'created_at'
            },
            {
                name:'updated_at'
            },
            {
                name:'to_role_comments',
                mapping: 'role_type.comments'
            },
            {
                name:'to_role_description',
                mapping: 'role_type.description'
            }
            ];

            columns = columns.concat([
            {
                header: 'Created',
                dataIndex: 'created_at',
                renderer: Ext.util.Format.dateRenderer('Y-m-d g:i a'),
                width:120
            },
            {
                header: 'Last Update',
                dataIndex: 'updated_at',
                renderer: Ext.util.Format.dateRenderer('Y-m-d g:i a'),
                width:120
            }
            ]);
        } else {
            columns = config.columns;
            fields = config.fields;

        }

        this.editing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1
        });

        config = Ext.apply({
            columns:columns,
            fields:fields,
            layout:'fit',
            frame: false,
            autoScroll:true,
            region:'center',
            plugins:[this.editing],
            loadMask:true,
            tbar:{
                items:[{
                    text: 'Party Information',
                    xtype:'button'
                },
                '|',
                {
                    text: 'Agreements',
                    type:'button'
                },
                '|',
                {
                   text: 'Orders',
                   type:'button'
                }]
            }
        }, config);
        this.callParent([config]);
    }
});
/**
 * This defines the Customer Relationship Grid Widget that is used to view a certain
 * relationship_type.  This can be used as a template for how a generic "Party Relationship Widget"
 * would be created (ie. to be used in a rails generator)
 */
Ext.define("Compass.ErpApp.Organizer.Applications.Crm.RelationshipGrid.CustomerRelationshipGrid",{
    extend:"Compass.ErpApp.Organizer.Applications.Crm.RelationshipGrid",
    alias:'widget.partner_customer_grid',
    initComponent: function () {
        this.callParent(arguments);

    },
    constructor: function(config) {
        config.relationshiptype = "customer_of_partner";
        config.title = 'Partners';

        config.columns = [
        {
            header: 'Company ID',
            dataIndex: 'party_id'
        },
        {
            header: 'Company Description',
            dataIndex: 'party_desc',
            width: 200

        },
        {
            header: 'Relationship',
            dataIndex: 'relationship',
            width: 400
        },
        {
            header:'From Date',
            dataIndex: 'from_date'
        },
        {
            header:'Thru Date',
            dataIndex: 'thru_date'
        },
        {
            header: 'Created',
            dataIndex: 'created_at',
            renderer: Ext.util.Format.dateRenderer('Y-m-d g:i a'),
            width:120
        },
        {
            header: 'Last Update',
            dataIndex: 'updated_at',
            renderer: Ext.util.Format.dateRenderer('Y-m-d g:i a'),
            width:120
        }
        ];

        config.fields = [
        {
            name:'party_id'
        },
        {
            name:'party_desc'
        },
        {
            name:'relationship'
        },
        {
            name:'from_date'
        },
        {
            name:'thru_date'
        },
        {
            name:'created_at'
        },
        {
            name:'updated_at'
        }
        ];

        this.callParent([config]);
    }
});

