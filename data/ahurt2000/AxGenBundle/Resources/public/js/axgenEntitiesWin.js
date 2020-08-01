/*
 * Entities windows.   - Ext JS Library 2.2
 * bundle: AxgenBundle 
 * Alejandro Hurtado <ahurt2000@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * 
 */
Ext.ns('AxGen.EntitiesWin');
AxGen.EntitiesWin = function(config){
    Ext.apply(this, config);
    this.save_bundle = new Ext.Button({
        text:'Save', 
        iconCls:'adm-icon-save',
        columnWidth:.2, 
        handler:function(){
            this.save();
        }, 
        scope:this
    });
    this.cancel_edit = new Ext.Button({
        text:'Cancel',
        iconCls:'adm-icon-remove',
        columnWidth:.2, 
        handler:function(){
            this.close();
        }, 
        scope:this
    });
 
    Ext.apply(this, {
        bbar:[    
        new Ext.Toolbar.Fill(),            
        this.save_bundle,

        this.cancel_edit
        ]
    });    
    
    AxGen.EntitiesWin.superclass.constructor.call(this);
    this.init();
}

Ext.extend(AxGen.EntitiesWin, Ext.Window, {
    id:'win-entities-gen',
    layout:'form',
    title:'Entities Generator',
    autoScroll:true,
    closeAction:'close',
    closable: true,
    bodyStyle:'padding:5px 5px 0',
    labelWidth: 130,
    modal: true,
    width: 400,
    init: function(){
        me = this;
        

        this.comboBundles = new AxGen.Bundles.Combo();
        
        /* only ended with Bundle pattern Acme/xxxBundle  */
        this.entity_name = this.add(new Ext.form.TextField({
            fieldLabel: 'Entity name', 
            name: 'txtEntityName', 
            anchor: '100%',
            blankText: 'something like "Post"',
            emptyText: 'Entity name (opcional)',
            allowBlank: true          
        }));
       
        /* changing directory separators \ by / */
//        default_bundle_target_dir = root_dir.replace(/\\/g,'/') + '/src'; 
             
        this.entity_path = this.add(new Ext.form.TextField({
            fieldLabel: 'Entity path', 
            name: 'txtEntityName', 
            anchor: '100%' 
        }));
        
        this.backup = new Ext.form.Checkbox({
            fieldLabel: 'Backup?',
            name: 'backup',
            id: 'backup',
            anchor: '100%',
            checked: true
        });      
       
 
        
        this.add(this.comboBundles);
        this.add(this.entity_name);
        this.add(this.entity_path);
        this.add(this.backup);


    },
    
    save:function(){
        var data;
        bundlename = this.comboBundles.getValue();
        entityname = this.entity_name.getValue();
        if(!Ext.isEmpty(entityname)){
            bundlename += ':'+ entityname;
        }
        Ext.Ajax.request({
            url: gen_entities_url,
            method: 'POST',
            params:  {
                'name'             : bundlename,
                'path'             : this.entity_path.getValue(),
                'backup'           : this.backup.getValue()
                
            },            
            success: function(objServerResponse){
                var data = Ext.decode(objServerResponse.responseText);
                Ext.MessageBox.alert('Status',data.message);
                if(data.success !== false){
                    this.close();   
                }
                  
            },
            failure:  function(){
                alert("Ajax error! OoH, this should never happen.");
                return false;
            },
            scope: this

                
        });

    }    
});

Ext.reg('axentitieswin',AxGen.EntitiesWin );


