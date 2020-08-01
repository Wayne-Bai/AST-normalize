Ext.ns('Compass.ErpApp.Desktop.Applications.SecurityManagement.CommonWidget').properties = {

    available_grid: {
        itemId: 'available',
        titleAlign: 'center',
        height: 375,
        style: {
            marginRight: '10px',
            borderColor: '#537697',
            borderStyle: 'solid'
        },
        flex: 1
    },

    selected_grid: {
        itemId: 'selected',
        titleAlign: 'center',
        height: 375,
        style: {
            marginLeft: '10px',
            borderColor: '#537697',
            borderStyle: 'solid'
        },
        flex: 1
    },

    assignment: {
        itemId: 'assignment',
        cls: 'assignment',
        layout: 'hbox',
        bodyPadding: 10
    }
};
