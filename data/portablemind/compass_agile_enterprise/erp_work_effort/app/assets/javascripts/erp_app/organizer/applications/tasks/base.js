Ext.ns("Compass.ErpApp.Organizer.Applications.Tasks");
/**
 * Method to setup organizer application
 * @param {config} Object containing (organizerLayout : reference to main layout container)
 */
Compass.ErpApp.Organizer.Applications.Tasks.Base = function (config) {
    var me = this;

    this.setup = function () {
        config.organizerLayout.addApplication({
            title: 'Tasks',
            id: 'tasksPanel',
            tabs: [
                {
                    xtype: 'tasksmainpanel',
                    itemId: 'tasksGridPanel'
                },
                {
                    xtype: 'crmpartygrid',
                    title: 'Workers',
                    searchDescription: 'Find Worker',
                    partyMgtTitle: 'Worker',
                    addBtnDescription: 'Add Worker',
                    itemId: 'workersPanel',
                    partyRole: 'worker',
                    partyRelationships: [],
                    allowedPartyType: 'Individual',
                    additionalTabs: [
                        {
                            xtype: 'tasksgridpanel',
                            itemId: 'tasksGridPanel',
                            canAddTask: false,
                            canDeleteTask: false,
                            listeners: {
                                activate: function (comp) {
                                    var details = comp.up('crmpartydetailspanel');

                                    comp.store.getProxy().extraParams.partyId = details.partyId;
                                    comp.store.load();
                                }
                            }
                        }
                    ]
                }
            ],
            menuItems: [
                {
                    title: 'Tasks',
                    tabItemId: 'tasksGridPanel',
                    imgSrc: '/assets/icons/erp_work_effort/tasks50x50.png',
                    filterPanel: {
                        xtype: 'form',
                        items: [
                            {
                                labelWidth: 50,
                                width: 175,
                                fieldLabel: 'Before',
                                xtype: 'datefield'
                            },
                            {
                                labelWidth: 50,
                                width: 175,
                                fieldLabel: 'After',
                                xtype: 'datefield'
                            }
                        ],
                        buttons: [
                            {
                                text: 'Filter Tasks'
                            }
                        ]
                    }
                },
                {
                    title: 'Manage Workers',
                    tabItemId: 'workersPanel',
                    imgSrc: '/assets/erp_app/organizer/applications/crm/customer_360_64x64.png'

                }
            ]

        });
    };

    me.taskCountBtn = Ext.create('widget.button', {
        ui: 'cleanbutton',
        hidden: true,
        text: '<span id="taskPanelTaskCountContainer">Tasks (<span id="taskPanelTaskCount">0</span>)</span>',
        handler: function () {
            Compass.ErpApp.Organizer.Layout.setActiveCenterItem('tasksPanel', 'tasksPanelMenu');

            var taskTabPanel = Ext.getCmp('tasksPanel');
            taskTabPanel.setActiveTab(taskTabPanel.down('#tasksGridPanel'));
        }
    });

    config['organizerLayout'].addToToolBar(me.taskCountBtn);

    this.updateTaskCount = function () {
        Ext.Ajax.request({
            method: 'GET',
            url: '/erp_work_effort/erp_app/organizer/tasks/work_efforts/task_count',
            success: function (response) {
                responseObj = Ext.decode(response.responseText);
                var count = Ext.get('taskPanelTaskCount');
                if (responseObj.success) {
                    if (responseObj.count > 0) {
                        me.taskCountBtn.show();
                        count.update(responseObj.count);
                    }
                    else {
                        me.taskCountBtn.hide();
                    }
                }
            },
            failure: function () {
                // should we display error message or fail silently?
            }
        });
    };

    var task = Ext.TaskManager.start({
        run: me.updateTaskCount,
        scope: me,
        interval: 30000
    });
};

