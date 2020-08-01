Ext.define("Compass.ErpApp.Desktop.Applications.ConfigurationManagement.ConfigurationTypesPanel",{
    extend:"Ext.panel.Panel",
    alias:'widget.configurationmanagement-configurationtypespanel',

    deleteType : function(record){
        var self = this;
        Ext.Msg.confirm("Please Confirm", 'Are you sure you want to delete this type?',function(btn, text){
            if(btn == 'yes'){
                var waitMsg = Ext.Msg.wait('Status', 'Deleting type...')
                Ext.Ajax.request({
                    url:'/erp_app/desktop/configuration_management/types/destroy',
                    params:{
                        id:record.get('model_id')
                    },
                    success:function(response){
                        waitMsg.close();
                        self.down('treepanel').getStore().load();
                    },
                    failure:function(response){
                        waitMsg.close();
                        Ext.Msg.alert('Error', 'There was an error deleting the type.');
                    }
                });
            }
        });
    },

    editType : function(record){
        var form = this.down('form');
        form.query('#addTypeBtn').first().hide();
        form.query('#updateTypeBtn').first().show();
        this.down('form').loadRecord(record);
    },

    addType : function(record){
        var form = this.down('form');
        form.query('#addTypeBtn').first().show();
        form.query('#updateTypeBtn').first().hide();
        this.down('form').getForm().reset();
    },

    setAsDefault : function(record){
        var self = this;
        var waitMsg = Ext.Msg.wait('Status', 'Setting as default option...')
        Ext.Ajax.request({
            url:'/erp_app/desktop/configuration_management/types/set_option_as_default',
            params:{
                option_id:record.get('model_id'),
                type_id:record.get('type_id')
            },
            success:function(response){
                waitMsg.close();
                self.down('treepanel').getStore().load();
            },
            failure:function(response){
                waitMsg.close();
                Ext.Msg.alert('Error', 'There was an error setting this option as a default option.');
            }
        });
    },

    removeOption : function(record){
        var self = this;
        Ext.Msg.confirm("Please Confirm", 'Are you sure you want to remove this option?',function(btn, text){
            if(btn == 'yes'){
                var waitMsg = Ext.Msg.wait('Status', 'Removing option...')
                Ext.Ajax.request({
                    url:'/erp_app/desktop/configuration_management/types/remove_option',
                    params:{
                        option_id:record.get('model_id'),
                        type_id:record.get('type_id')
                    },
                    success:function(response){
                        waitMsg.close();
                        self.down('treepanel').getStore().load();
                    },
                    failure:function(response){
                        waitMsg.close();
                        Ext.Msg.alert('Error', 'There was an error removing the option.');
                    }
                });
            }
        });
    },

    addOption : function(record){
        var self = this;
        Ext.create('Ext.window.Window',{
            title:'Add Option',
            modelId:record.get('model_id'),
            items:[
            {
                xtype:'panel',
                width:600,
                bodyPadding:10,
                items:[
                {
                    xtype: 'combo',
                    store: 'configurationmanagement-optionsstore',
                    displayField: 'description',
                    valueField:'id',
                    itemId:'configurationOption',
                    width:500,
                    name:'option_id',
                    forceSelection:true,
                    minChars:1,
                    typeAhead: false,
                    hideLabel: true,
                    hideTrigger:true,
                    anchor: '100%',
                    pageSize: 10,
                    listConfig: {
                        loadingText: 'Searching...',
                        emptyText: 'No options found.',
                        getInnerTpl: function() {
                            return '<h3>{description}</h3><br/>{comment}';
                        }
                    }
                },
                {
                    xtype:'component',
                    style:'margin-top:10px',
                    html:'Search by value or internal identifier.'
                }
                ]
            }
            ],
            buttonAlign:'center',
            buttons:[
            {
                text:'Add Option',
                handler:function(btn){
                    var window = btn.up('window');
                    var selectedOption = window.down('panel').down('combo').getValue();
                    if(Ext.isEmpty(selectedOption)){
                        Ext.Msg.alert('Error', 'Please select an option.');
                    }
                    else{
                        var waitMsg = Ext.Msg.wait('Status', 'Adding option...')
                        Ext.Ajax.request({
                            url:'/erp_app/desktop/configuration_management/types/add_option',
                            params:{
                                model_id:window.initialConfig.modelId,
                                option_id:selectedOption
                            },
                            success:function(response){
                                waitMsg.close();
                                self.down('treepanel').getStore().load();
                            },
                            failure:function(response){
                                waitMsg.close();
                                var responseObj = Ext.decode(response.responseText);
                                var msg = 'There was an error adding the option.';
                                if(!Ext.isEmpty(responseObj.message)){
                                    msg = responseObj.message
                                }
                                Ext.Msg.alert('Error', msg);
                            }
                        });
                    }
                }
            }
            ]
        }).show();
    },

    constructor : function(config) {
        var self = this;

        var typesForm = {
            xtype:'form',
            width:'50%',
            height:'50%',
            bodyPadding:10,
            region:'center',
            url: '/erp_app/desktop/configuration_management/types/create_or_update',
            defaultType:'textfield',
            items:[
            {
                fieldLabel:'Description',
                width:400,
                allowBlank:false,
                name:'description'
            },
            {
                fieldLabel:'Internal Identifier',
                width:400,
                allowBlank:false,
                name:'internal_identifier'
            },
            {
                xtype:'radiogroup',
                fieldLabel:'Allow user defined options?',
                columns:[50,50],
                items:[
                {
                    boxLabel:'Yes',
                    name:'user_defined_options',
                    inputValue: 'yes'
                },
                {
                    boxLabel:'No',
                    name:'user_defined_options',
                    inputValue: 'no',
                    checked:true
                }]
            },
            {
                xtype:'radiogroup',
                fieldLabel:'Is multi optional?',
                columns:[50,50],
                items:[
                {
                    boxLabel:'Yes',
                    name:'multi_optional',
                    inputValue: 'yes'
                },

                {
                    boxLabel:'No',
                    name:'multi_optional',
                    inputValue: 'no',
                    checked:true
                }]
            },
            {
                xtype:'combo',
                width:400,
                allowBlank:false,
                fieldLabel:'Category',
                name:'category_id',
                store:'configurationmanagement-categoriesstore',
                valueField:'category_id',
                displayField:'description',
                editable:false,
                queryMode:'local',
                forceSelection:true
            },
            {
                xtype:'hidden',
                name:'model_id'
            }
            ],
            buttonAlign:'left',
            buttons:[
            {
                text:'Add Type',
                itemId:'addTypeBtn',
                hidden:false,
                handler:function(btn){
                    var form = btn.up('form').getForm()
                    if(form.isValid()){
                        form.submit({
                            waitMsg:'Adding type...',
                            reset:true,
                            success:function(form, action){
                                btn.up('configurationmanagement-configurationtypespanel').down('treepanel').getStore().load();
                            },
                            failure:function(form, action){
                                Ext.Msg.alert('Error', 'There was an error adding the type.');
                            }
                        });
                    }
                }
            },
            {
                text:'Update Type',
                itemId:'updateTypeBtn',
                hidden:true,
                handler:function(btn){
                    var form = btn.up('form').getForm()
                    if(form.isValid()){
                        form.submit({
                            waitMsg:'Updating type...',
                            reset:true,
                            success:function(form, action){
                                btn.up('configurationmanagement-configurationtypespanel').down('treepanel').getStore().load();
                            },
                            failure:function(form, action){
                                Ext.Msg.alert('Error', 'There was an error updating type.');
                            }
                        });
                    }
                }
            }
            ]
        };

        var typesTree = {
            region:'west',
            width:'50%',
            xtype:'treepanel',
            store:{
                proxy: {
                    type: 'ajax',
                    url: '/erp_app/desktop/configuration_management/types/index'
                },
                root: {
                    text: 'Configuration Types',
                    draggable:false
                },
                fields:[
                {
                    name:'model_id'
                },
                {
                    name:'type_id'
                },
                {
                    name:'type'
                },
                {
                    name:'text'
                },
                {
                    name:'iconCls'
                },
                {
                    name:'leaf'
                },
                {
                    name:'category_id'
                },
                {
                    name:'description'
                },
                {
                    name:'internal_identifier'
                },
                {
                    name:'user_defined_options'
                },
                {
                    name:'multi_optional'
                }
                ]
            },
            animate:false,
            autoScroll:true,
            enableDD:false,
            frame:true,
            listeners:{
                'itemcontextmenu':function(view, record, htmlItem, index, e){
                    e.stopEvent();

                    var items = [];

                    if(record.data['type'] == 'ConfigurationItemType'){
                        items.push({
                            iconCls:'icon-edit',
                            text:'Edit',
                            handler:function(btn){
                                self.editType(record);
                            }
                        });

                        items.push({
                            iconCls:'icon-delete',
                            text:'Delete',
                            handler:function(btn){
                                self.deleteType(record);
                            }
                        });

                        items.push({
                            iconCls:'icon-add',
                            text:'Add Option',
                            handler:function(btn){
                                self.addOption(record);
                            }
                        });
                    }

                    if(record.data['type'] == 'ConfigurationOption'){
                        items.push({
                            iconCls:'icon-delete',
                            text:'Remove',
                            handler:function(btn){
                                self.removeOption(record);
                            }
                        });

                        items.push({
                            iconCls:'icon-add',
                            text:'Set As Default',
                            handler:function(btn){
                                self.setAsDefault(record);
                            }
                        });
                    }

                    var contextMenu = Ext.create("Ext.menu.Menu",{
                        items:items
                    });
                    contextMenu.showAt(e.xy);
                }
            }
        }

        config = Ext.apply({
            items:[
            typesTree,
            typesForm
            ],
            layout:'border',
            tbar:{
                items:[
                {
                    text:'Add',
                    iconCls:'icon-add',
                    scope:this,
                    handler:function(){
                        self.addType();
                    }
                }
                ]
            },
            title:'Types',
            frame:false,
            border:false
        }, config);

        this.callParent([config]);
    }
});
