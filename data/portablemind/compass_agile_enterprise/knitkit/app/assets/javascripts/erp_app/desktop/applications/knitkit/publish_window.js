Ext.define("Compass.ErpApp.Desktop.Applications.Knitkit.PublishWindow", {
    extend: "Ext.window.Window",
    alias: 'widget.knikit_publishwindow',
    initComponent: function () {

        this.addEvents(
            /**
             * @event publish_success
             * Fired after success response is received from server
             * @param {Compass.ErpApp.Applications.Desktop.PublishWindow} this Object
             * @param {Object} Server Response
             */
            "publish_success",
            /**
             * @event publish_failure
             * Fired after response is received from server with error
             * @param {Compass.ErpApp.Applications.Desktop.PublishWindow} this Object
             * @param {Object} Server Response
             */
            "publish_failure"
        );

        this.callParent(arguments);
    },

    constructor: function (config) {
        config = Ext.apply({
            layout: 'fit',
            title: 'Publish',
            autoHeight: true,
            iconCls: 'icon-document',
            width: 400,
            height: 300,
            buttonAlign: 'center',
            plain: true,
            items: Ext.create('widget.form', {
                timeout: 130000,
                baseParams: config['baseParams'],
                autoHeight: true,
                labelWidth: 110,
                frame: false,
                layout: 'fit',
                url: config['url'],
                defaults: {
                    width: 225
                },
                items: [
                    {
                        xtype: 'textarea',
                        hideLabel: true,
                        name: 'comment'
                    }
                ]
            }),
            buttons: [
                {
                    text: 'Submit',
                    listeners: {
                        'click': function (button) {
                            var win = button.findParentByType('knikit_publishwindow');
                            var formPanel = win.query('form')[0];
                            formPanel.getForm().submit({
                                method: 'POST',
                                waitMsg: 'Publishing...',
                                success: function (form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    win.fireEvent('publish_success', win, response);
                                    win.close();
                                },
                                failure: function (form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    win.fireEvent('publish_failure', win, response);
                                    win.close();
                                }
                            });
                        }
                    }
                },
                {
                    text: 'Cancel',
                    listeners: {
                        'click': function (button) {
                            var win = button.findParentByType('knikit_publishwindow');
                            var form = win.query('form')[0];
                            form.getForm().reset();
                            win.close();
                        }
                    }
                }
            ]
        }, config);

        this.callParent([config]);
    }

});