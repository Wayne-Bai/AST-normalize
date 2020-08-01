Ext.define('Compass.ErpApp.Shared.Crm.UserForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.crmuserform',
    border: false,
    frame: false,

    /**
     * @cfg {String[]} securityRoles
     * Array of SecurityRoles to add to users during creation.
     */
    securityRoles: [],

    /**
     * @cfg {String[]} partyRole
     * Array of PartyRoles to add to users during creation.
     */
    partyRoles: [],

    /**
     * @cfg {boolean} allowFormToggle
     * True to allow user to toggle user form.
     */
    allowFormToggle: true,

    /**
     * @cfg {boolean} createParty
     * True to create party with user.
     */
    createParty: false,

    /**
     * @cfg {boolean} skipUserActivationEmail
     * True to skip activation email.
     */
    skipUserActivationEmail: true,

    /**
     * @cfg {boolean} allowFormSubmission
     * True to allow from to be submitted.
     */
    allowFormSubmission: false,

    /**
     * @cfg {string} createUrl
     * Url to create a user.
     */
    createUrl: '/erp_app/organizer/crm/users/',

    /**
     * @cfg {string} updateUrl
     * Url to update a user.
     */
    updateUrl: '/erp_app/organizer/crm/users/',

    initComponent: function () {
        var me = this;

        me.addEvents(
            /*
             * @event usercreated
             * Fires when a user is updated
             * @param {Compass.ErpApp.Shared.Crm.UserForm} this
             * @param {Int} createdUserId
             */
            'usercreated',
            /*
             * @event userupdated
             * Fires when a party is updated
             * @param {Compass.ErpApp.Shared.Crm.UserForm} this
             * @param {Int} updatedUserId
             */
            'userupdated'
        );

        var fields = [];

        if (me.createParty) {
            fields.push({
                    fieldLabel: 'First Name',
                    name: 'first_name',
                    itemId: 'first_name',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Last Name',
                    name: 'last_name',
                    itemId: 'last_name',
                    allowBlank: false
                });
        }

        fields.push(
            {
                fieldLabel: 'Username',
                name: 'username',
                itemId: 'username',
                allowBlank: false
            },
            {
                fieldLabel: 'Email',
                name: 'email',
                vtype: 'email',
                allowBlank: false
            },
            {
                fieldLabel: 'Password',
                inputType: 'password',
                name: 'password'
            },
            {
                fieldLabel: 'Confirm Password',
                inputType: 'password',
                name: 'password_confirmation'
            },
            {
                xtype: 'displayfield',
                itemId: 'lastLoginAt',
                hidden: true,
                fieldLabel: 'Last Login At',
                name: 'last_login_at'
            },
            {
                xtype: 'radiogroup',
                hidden: true,
                allowBlank: false,
                itemId: 'statusContainer',
                fieldLabel: 'Status',
                defaultType: 'radiofield',
                columns: [120, 120, 120],
                items: [
                    {
                        boxLabel: 'Active',
                        name: 'activation_state',
                        inputValue: 'active',
                        checked: true
                    },
                    {
                        boxLabel: 'Pending',
                        name: 'activation_state',
                        inputValue: 'pending'
                    },
                    {
                        boxLabel: 'Inactive',
                        name: 'activation_state',
                        inputValue: 'inactive'
                    }
                ]
            },
            {
                xtype: 'hidden',
                itemId: 'userId',
                name: 'id'
            },
            {
                xtype: 'hidden',
                itemId: 'skipUserActivationEmail',
                name: 'skip_activation_email',
                value: false
            },
            {
                xtype: 'hidden',
                name: 'security_roles',
                value: me.securityRoles.join()
            },
            {
                xtype: 'hidden',
                name: 'party_roles',
                value: me.partyRoles.join()
            }
        );

        if (me.allowFormSubmission) {
            fields.push({
                text: 'Save',
                xtype: 'button',
                handler: function (btn) {
                    var form = btn.up('form');

                    var myMask = new Ext.LoadMask(form, {msg: "Please wait..."});
                    myMask.show();

                    Ext.Ajax.request({
                        method: 'POST',
                        url: form.createUrl,
                        params: form.getValues(),
                        success: function (response) {
                            myMask.hide();

                            var responseObj = Ext.JSON.decode(response.responseText);

                            if (responseObj.success) {
                                form.fireEvent('usercreated', form, responseObj.users);
                            }
                            else {
                                Ext.Msg.alert("Error", responseObj.message);
                            }
                        },
                        failure: function () {
                            myMask.hide();
                            Ext.Msg.alert("Error", 'Could not create user');
                        }
                    });
                }
            });
        }

        me.items = [
            {
                xtype: 'fieldset',
                checkboxToggle: me.allowFormToggle,
                checkboxName: 'userEnabled',
                title: 'User Information',
                flex: 1,
                style: 'padding: 10px',
                defaults: {
                    xtype: 'textfield',
                    width: 350
                },
                items: fields
            }
        ];

        this.callParent(arguments);

        if (me.skipUserActivationEmail) {
            me.down('#statusContainer').show();
            me.down('#skipUserActivationEmail').setValue(true);
        }
    },

    loadUser: function (userId) {
        var me = this;

        me.userId = userId;

        var myMask = new Ext.LoadMask(me, {msg: "Please wait..."});
        myMask.show();

        // Load user details
        Ext.Ajax.request({
            url: '/erp_app/organizer/crm/users/' + userId,
            method: 'GET',
            success: function (response) {
                myMask.hide();
                var responseObj = Ext.JSON.decode(response.responseText);

                if (responseObj.success) {
                    if (!Ext.isEmpty(responseObj.user)) {
                        var statusRadio = me.down('#statusContainer');

                        me.getForm().setValues(responseObj.user);
                        me.down('#lastLoginAt').show();
                        statusRadio.show();
                        if (Ext.isEmpty(responseObj.user.activation_state)) {
                            statusRadio.setValue({'activation_state': 'pending'});
                        }
                        else {
                            statusRadio.setValue({'activation_state': responseObj.user.activation_state});
                        }

                        if (me.allowFormSubmission) {
                            var saveButton = me.down('button');
                            saveButton.setHandler(function (btn) {
                                var form = btn.up('form');

                                var myMask = new Ext.LoadMask(form, {msg: "Please wait..."});
                                myMask.show();

                                Ext.Ajax.request({
                                    method: 'PUT',
                                    url: me.updateUrl + me.userId,
                                    params: form.getValues(),
                                    success: function (response) {
                                        myMask.hide();

                                        var responseObj = Ext.JSON.decode(response.responseText);

                                        if (responseObj.success) {
                                            form.fireEvent('userupdated', form, responseObj.users);
                                        }
                                        else {
                                            Ext.Msg.alert("Error", responseObj.message);
                                        }
                                    },
                                    failure: function () {
                                        myMask.hide();
                                        Ext.Msg.alert("Error", 'Could not create user');
                                    }
                                });
                            });
                        }
                    }
                    else {
                        me.getForm().findField('userEnabled').setValue(false);
                    }
                }
                else {
                    Ext.Msg.alert('Error', 'Could not load user details');
                }
            },
            failure: function (response) {
                myMask.hide();
                Ext.Msg.alert('Error', 'Could not load user details');
            }
        });
    }
});
