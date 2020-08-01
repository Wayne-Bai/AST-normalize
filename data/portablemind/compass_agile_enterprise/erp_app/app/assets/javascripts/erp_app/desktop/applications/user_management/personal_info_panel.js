Ext.define("Compass.ErpApp.Desktop.Applications.UserManagement.PersonalInfoPanel", {
    extend: "Ext.Panel",
    alias: 'widget.usermanagement_personalinfopanel',

    user: null,

    setWindowStatus: function (status) {
        this.findParentByType('statuswindow').setStatus(status);
    },

    clearWindowStatus: function () {
        this.findParentByType('statuswindow').clearStatus();
    },

    initComponent: function () {
        this.callParent(arguments);

        var me = this;

        Ext.Ajax.request({
            url: '/api/v1/parties/' + me.user.get('party_id'),
            method: 'GET',
            success: function (response) {
                var obj = Ext.decode(response.responseText);
                var party = obj.party;
                var form = me.down('form');

                if (party.business_party_type == 'Organization') {
                    form.add({
                        xtype: 'fieldset',
                        width: 400,
                        title: party.business_party_type + ' Information',
                        items: [
                            {
                                xtype: 'textfield',
                                fieldLabel: 'Description',
                                value: party.description
                            }
                        ]
                    });
                }
                else {
                    form.add(
                        {
                            xtype: 'fieldset',
                            width: 400,
                            title: party.business_party_type + ' Information',
                            items: [
                                {
                                    xtype: 'displayfield',
                                    fieldLabel: 'First Name',
                                    value: party.first_name
                                },
                                {
                                    xtype: 'displayfield',
                                    fieldLabel: 'Last Name',
                                    value: party.last_name
                                },
                                {
                                    xtype: 'displayfield',
                                    fieldLabel: 'Gender',
                                    value: party.gender
                                }
                            ]
                        });
                }

                form.add({
                    xtype: 'fieldset',
                    width: 400,
                    title: 'User Information',
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Username',
                        value: me.user.get('username')
                    },
                        {
                            xtype: 'displayfield',
                            fieldLabel: 'Email Address',
                            value: me.user.get('email')
                        },
                        {
                            xtype: 'displayfield',
                            fieldLabel: 'Activation State',
                            value: me.user.get('activation_state')
                        },
                        {
                            xtype: 'displayfield',
                            fieldLabel: 'Last Login',
                            value: Ext.util.Format.date(me.user.get('last_login_at'), 'F j, Y, g:i a')
                        },
                        {
                            xtype: 'displayfield',
                            fieldLabel: 'Last Activity',
                            value: Ext.util.Format.date(me.user.get('last_activity_at'), 'F j, Y, g:i a')
                        },
                        {
                            xtype: 'displayfield',
                            fieldLabel: '# Failed Logins',
                            value: me.user.get('failed_login_count')
                        }]
                });
            },
            failure: function (response) {
                me.clearWindowStatus();
                Ext.Msg.alert('Error', 'Error loading details');
            }
        });
    },

    constructor: function (config) {
        config = Ext.apply({
            items: [{
                xtype: 'form',
                frame: false,
                bodyStyle: 'padding:5px 5px 0',
                width: 425
            }],
            layout: 'fit',
            title: 'User Details'
        }, config);

        this.callParent([config]);
    }
});
