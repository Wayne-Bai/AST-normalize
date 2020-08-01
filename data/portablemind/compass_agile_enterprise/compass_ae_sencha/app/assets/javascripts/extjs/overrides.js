Ext.override(Ext.data.Store, {
  setExtraParam: function (name, value){
    this.proxy.extraParams = this.proxy.extraParams || {};
    this.proxy.extraParams[name] = value;
    this.proxy.applyEncoding(this.proxy.extraParams);
  }
});

// fix for tempHidden in ExtJS 4.0.7 - Invoice Mgmt window was not opening correctly
// taken from http://www.sencha.com/forum/showthread.php?160222-quot-this.tempHidden-is-undefined-quot-Error-Workaround
Ext.override(Ext.ZIndexManager, {
  tempHidden: [],

  show: function() {
    var comp, x, y;

    while (comp = this.tempHidden.shift()) {
      x = comp.x;
      y = comp.y;

      comp.show();
      comp.setPosition(x, y);
    }
  }
});

Ext.define('Compass.ErpApp.Shared.RowEditingOverride', {
  override: 'Ext.grid.plugin.RowEditing',
  startEdit: function (record, columnHeader) {
    var me = this,
        editor = me.getEditor(),
        context;

    if (Ext.isEmpty(columnHeader)) {
      columnHeader = me.grid.getTopLevelVisibleColumnManager().getHeaderAtIndex(0);
    }

    if (editor.beforeEdit() !== false) {
      context = me.callSuper([record, columnHeader]);
      if (context) {
        me.context = context;

        // If editing one side of a lockable grid, cancel any edit on the other side.
        if (me.lockingPartner) {
          me.lockingPartner.cancelEdit();
        }
        editor.startEdit(context.record, context.column, context);
        me.fireEvent('editstarted', editor);
        me.editing = true;
        return true;
      }
    }
    return false;
  }
});
