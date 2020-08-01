Ext.define("Compass.ErpApp.Desktop.Applications.SecurityManagement.NorthPanel", {
    extend: "Ext.tab.Panel",
    alias: 'widget.security_management_northpanel',
    id: 'security_management_north_region',
    flex: 1,
    constructor: function (config) {
        config = Ext.apply({
            items: [
                {
                    xtype: 'security_management_userspanel'
                },
                {
                    xtype: 'security_management_groupspanel'
                },
                {
                    xtype: 'security_management_rolespanel'
                },
                {
                    xtype: 'security_management_capabilitiespanel'
                }
            ],
            listeners: {
                'tabchange': function (tabPanel, tab) {
                    var southPanel = Ext.getCmp('security_management_south_region');
                    southPanel.setbyParentTab(tab);
                }
            }
        }, config);
        this.callParent([config]);
    }
});
