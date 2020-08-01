Ext.define("Compass.ErpApp.Organizer.Applications.Tasks.AddTaskForm", {
    extend: "Ext.panel.Panel",
    alias: 'widget.addtaskform',
    title: 'Add Task',
    closable: true,
    items: [
        {
            xtype: 'form',
            border: false,
            buttonAlign: 'center',
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'center',
                padding: 20
            },
            items: [
                {
                    fieldLabel: 'Description',
                    xtype: 'textfield',
                    name: 'description',
                    itemId: 'description',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Estimated Completion Time (Hours)',
                    xtype: 'numberfield',
                    name: 'estimated_completion_time',
                    itemId: 'estimatedCompletionTime',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Type',
                    xtype: 'combo',
                    name: 'work_effort_type',
                    itemId: 'work_effort_type',
                    forceSelection: true,
                    displayField: 'description',
                    valueField: 'id',
                    store: {
                        fields: ['description', 'id'],
                        proxy: {
                            type: 'ajax',
                            url: '/erp_work_effort/erp_app/organizer/tasks/work_efforts/work_effort_types',
                            reader: {
                                type: 'json',
                                root: 'work_effort_types'
                            }
                        }
                    }
                },
                {
                    xtype: 'fieldset',
                    itemId: 'fieldSet',
                    checkboxToggle: true,
                    checkboxName: 'assignment_type_role',
                    title: 'Assign To Role',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            fieldLabel: 'Role',
                            xtype: 'combo',
                            name: 'role_type',
                            itemId: 'role_type',
                            forceSelection: true,
                            displayField: 'description',
                            valueField: 'id',
                            store: {
                                fields: ['description', 'id'],
                                proxy: {
                                    type: 'ajax',
                                    url: '/erp_work_effort/erp_app/organizer/tasks/work_efforts/role_types',
                                    reader: {
                                        type: 'json',
                                        root: 'role_types'
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    checkboxToggle: true,
                    checkboxName: 'assignment_type_party',
                    title: 'Assign To Person',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            xtype: 'partysearchfield',
                            name: 'assigned_party_id',
                            fieldLabel: 'Worker',
                            partyRole: 'worker'
                        }
                    ]
                },
                {
                    xtype: 'hidden',
                    id: 'workEffortId'
                }
            ],
            buttons: [
                {
                    text: 'Save',
                    handler: function (btn) {
                        var form = btn.up('addtaskform').down('form');

                        if (form.isValid()) {
                            var workEffortId = form.down('#workEffortId').getValue(),
                                method = null;

                            if (Ext.isEmpty(workEffortId)) {
                                method = 'POST';
                            }
                            else {
                                method = 'PUT';
                            }

                            form.submit({
                                clientValidation: true,
                                url: '/erp_work_effort/erp_app/organizer/tasks/work_efforts',
                                method: method,
                                waitMsg: 'Please Wait...',
                                success: function (form, action) {
                                    btn.up('addtaskform').close();
                                },
                                failure: function (form, action) {
                                    switch (action.failureType) {
                                        case Ext.form.action.Action.CLIENT_INVALID:
                                            Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                            break;
                                        case Ext.form.action.Action.CONNECT_FAILURE:
                                            Ext.Msg.alert('Failure', 'Ajax communication failed');
                                            break;
                                        case Ext.form.action.Action.SERVER_INVALID:
                                            Ext.Msg.alert('Failure', action.result.msg);
                                    }
                                }
                            });
                        }
                    }
                },
                {
                    text: 'Cancel',
                    handler: function (btn) {
                        btn.up('addtaskform').close();
                    }
                }
            ]
        }
    ]

});