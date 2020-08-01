Ext.define("Compass.ErpApp.Desktop.Applications.JobTracker",{
    extend:"Ext.ux.desktop.Module",
    id:'job_tracker-win',
    init : function(){
        this.launcher = {
            text: 'Job Tracker',
            iconCls:'icon-calendar',
            handler: this.createWindow,
            scope: this
        }
    },

    createWindow : function(){
       var desktop = this.app.getDesktop();
        var win = desktop.getWindow('job_tracker');
        if(!win){
            win = desktop.createWindow({
                id: 'job_tracker',
                title:'Job Tracker',
                width:730,
                height:350,
                iconCls: 'icon-calendar-light',
                shim:false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:[{
					xtype:'jobtracker-jobsgrid'
				}]
            });

			//had to add the docked item after it was created.  Was throwing style error????
            win.down('jobtracker-jobsgrid').addDocked({
                xtype:'pagingtoolbar',
                store:Ext.getStore('job-tracker-model-store'),
                dock:'bottom',
                displayInfo:true
            });

			Ext.getStore('job-tracker-model-store').load();
        }
        win.show();
    }
});
