Ext.define("Compass.ErpApp.Shared.UploadWindow",{
  extend:"Ext.window.Window",
  alias:'widget.erpappshared_uploadwindow',

  initComponent: function() {
    this.callParent(arguments);
    this.addEvents(
      /*** @event fileuploaded
         * Fired after file is uploaded.
         * @param {Compass.ErpApp.Shared.UploadWindow } uploadWindow This object
         */
      'fileuploaded'
      );
  },

  constructor : function(config) {
    if(Compass.ErpApp.Utility.isBlank(config)){
      config = {};
    }
    var self = this;

    config.extraPostData = Ext.applyIf({authenticity_token:Compass.ErpApp.AuthentictyToken}, config.extraPostData);
    query_string = '?' + Ext.Object.toQueryString(config.extraPostData);

    if (typeof ErpTechSvcs.Config.max_file_size_in_mb == 'number'){
      max_file_size = ErpTechSvcs.Config.max_file_size_in_mb + 'mb'
    }else{
      max_file_size = ErpTechSvcs.Config.max_file_size_in_mb
    }

    this.plUploader = Ext.create("Ext.ux.panel.UploadPanel",{
      region:'center',
      url: (config.standardUploadUrl || './file_manager/base/upload_file') + query_string,
      max_file_size: max_file_size,
      listeners:{
        scope:this,
        'uploadcomplete':function(pluploader, success, failed){
          if(success){


            this.fireEvent('fileuploaded', this);
            self.close();
          }else{
            return false;
          }
        }
      }
    });

    config = Ext.apply({
      title:'File Upload',
      layout:'border',
      autoWidth:true,
      height:300,
      width:800,
      iconCls:'icon-upload-light',
      items:[this.plUploader]
    }, config);

    this.callParent([config]);
  }

});