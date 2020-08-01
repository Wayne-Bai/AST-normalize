Ext.define("Compass.ErpApp.Desktop.Applications.Knitkit.SelectRolesWindow", {
    extend: "Ext.window.Window",
    alias: 'widget.knikit_selectroleswindow',
    initComponent: function () {

        this.addEvents(
            /**
             * @event success
             * Fired after success response is received from server
             * @param {Compass.ErpApp.Applications.Desktop.PublishWindow} this Object
             * @param {Object} Server Response
             */
            "success",
            /**
             * @event failure
             * Fired after response is received from server with error
             * @param {Compass.ErpApp.Applications.Desktop.PublishWindow} this Object
             * @param {Object} Server Response
             */
            "failure"
        );

        this.callParent(arguments);
    },

    constructor: function (config) {
        var currentRoles = config['currentRoles'],
            availableRoles = config['availableRoles'],
            checkBoxes = [];

        Ext.each(availableRoles, function (role) {
            checkBoxes.push({
                name: role['internal_identifier'],
                boxLabel: role['description'],
                checked: currentRoles.contains(role['internal_identifier'])
            })
        });

        config = Ext.apply({
            layout: 'fit',
            modal: true,
            title: 'Secure',
            iconCls: 'icon-document_lock',
            width: 250,
            height: 300,
            buttonAlign: 'center',
            plain: true,
            items: Ext.create('widget.form', {
                timeout: 130000,
                baseParams: config['baseParams'],
                autoHeight: true,
                labelWidth: 110,
                bodyPadding: '5px',
                frame: false,
                layout: 'fit',
                url: config['url'],
                defaults: {
                    width: 225
                },
                items: [
                    {
                        xtype: 'fieldset',
                        autoScroll: true,
                        title: 'Select Roles',
                        defaultType: 'checkbox',
                        items: checkBoxes
                    }
                ]
            }),
            buttons: [
                {
                    text: 'Submit',
                    listeners: {
                        'click': function (button) {
                            var win = button.up('knikit_selectroleswindow');
                            var formPanel = win.down('form');
                            formPanel.getForm().submit({
                                method: 'POST',
                                waitMsg: 'Updating Security...',
                                success: function (form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    win.fireEvent('success', win, response);
                                    win.close();
                                },
                                failure: function (form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    win.fireEvent('failure', win, response);
                                }
                            });
                        }
                    }
                },
                {
                    text: 'Cancel',
                    listeners: {
                        'click': function (button) {
                            var win = button.up('knikit_selectroleswindow');
                            win.close();
                        }
                    }
                }
            ]
        }, config);

        this.callParent([config]);
    }

});