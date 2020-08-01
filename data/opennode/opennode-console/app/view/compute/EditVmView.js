Ext.define('Onc.view.compute.EditVmView', {
    extend : 'Ext.window.Window',
    alias : 'widget.editvm',

    title : 'Edit Virtual Machine',
    modal : true,
    border : false,
    width : 300,
    resizable : false,

    defaults : {
        border : false,
        bodyStyle : 'background: inherit',
        bodyPadding : 4
    },

    /**
     * The parent compute whose virtualization container to create the
     * virtual machine in.
     */
    parentCompute : null,
    compute : null,

    initComponent : function() {
    	var isAdmin = Onc.model.AuthenticatedUser.isAdmin();
        this.items = {
            xtype : 'form',
            items : [{
                xtype : 'displayfield',
                fieldLabel : 'Name',
                name : 'hostname_label',
                value : this.compute.get('hostname')
            }, {
                xtype : 'fieldset',
                title : "Hardware parameters",
                frame : true,
                layout : {
                    type : 'table',
                    columns : 2
                },
                items : [{
                    fieldLabel : "Number of Cores",
                    name : 'num_cores',
                    xtype : 'numberfield',
                    value : this.compute.get("num_cores"),
                    width : 160,
                    minValue : 1,
                    maxValue : 10,
                    allowBlank: false
                }, {
                    xtype : 'slider',
                    isFormField : false,
                    width : 100,
                    minValue : 1,
                    maxValue : 10,
                    listeners : {
                        'change' : function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }].concat(!isAdmin ? [] : [{
                    fieldLabel : "CPU Limit",
                    name : 'cpu_limit',
                    xtype : 'numberfield',
                    allowDecimals : true,
                    decimalPrecision : 2,
                    minValue : 0.0,
                    maxValue : 1.0,
                    step : 0.05,
                    value : 1.0,
                    width : 160
                }, {
                    xtype : 'slider',
                    isFormField : false,
                    width : 100,
                    minValue : 5,
                    maxValue : 100,
                    increment : 5,
                    value : 100,
                    listeners : {
                        'change' : function(ev, newValue) {
                            this.previousSibling().setValue(newValue / 100);
                        }
                    }
                }]).concat([{
                    fieldLabel : "Memory/MB",
                    name : 'memory',
                    xtype : 'numberfield',
                    value : this.compute.get("memory"),
                    width : 160,
                    minValue : 300,
                    maxValue : 10240,
                    allowBlank: false
                }, {
                    xtype : 'slider',
                    isFormField : false,
                    width : 100,
                    minValue : 300,
                    maxValue : 10240,
                    increment : 32,
                    value : 256,
                    listeners : {
                        'change' : function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel : "Disk Size/GB",
                    name : 'diskspace',
                    xtype : 'numberfield',
                    value : this.compute.get("diskspace").total / 1024,
                    width : 160,
                    minValue : 2,
                    maxValue : 1024,
                    allowBlank: false
                }, {
                    xtype : 'slider',
                    isFormField : false,
                    width : 100,
                    minValue : 2,
                    maxValue : 1024,
                    value : this.compute.get("diskspace").total / 1024,
                    listeners : {
                        'change' : function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }])
            }].concat(!isAdmin ? [] : [{
                xtype : 'fieldset',
                title : "Boot parameters",
                layout : {
                    type : 'table',
                    columns : 2
                },
                items : [{
                    xtype : 'checkbox',
                    name : 'start_on_boot',
                    fieldLabel : "Start on boot"
                }]
            }]),

            buttons : [{
                text : 'Cancel',
                handler : function() {
                    this.up('window').destroy();
                }
            }, {
                text : 'Update VM',
                itemId : 'edit-vm-button',
                cls : 'btn-green'
            }]
        };

        this.callParent(arguments);
    }
});
