/**
 * Copyright (C) 1999-2011, Intalio Inc.
 *
 * The program(s) herein may be used and/or copied only with
 * the written permission of Intalio Inc. or in accordance with
 * the terms and conditions stipulated in the agreement/contract
 * under which the program(s) have been supplied.
 */
if(!WAPAMA) var WAPAMA = {};
WAPAMA.UI = {
    
    /**
     * Create a text for shape name
     * 
     * @param {Object} config
     * @return {TextField}
     */ 
    createShapeNameText : function(config) {
        // set class and style for Extjs
        config.cls = 'x_form_text_set_absolute';
        config.style = 'position:absolute';
        var shownTextField = new Ext.form.TextField(config);
        return shownTextField;
    },
    
    /**
     * Try to focus the specified component
     * 
     * @see Ext.Component.focus
     * @param {Object} component
     * @param {Boolean} selectText
     * @param {Boolean/Number} delay
     */
    setFocus : function(component, selectText, delay) {
        if (component instanceof Ext.Component) {
            // invoke focus( [Boolean selectText] ,
            //[Boolean/Number delay] ) : Ext.Component
            component.focus(selectText, delay);
        }
    },
    
    /**
     * Add listener to the specified component
     * 
     * @see Ext.util.Observable.on
     * @param {Object} component
     * @param {String} eventName
     * @param {Function} handler
     * @param {Object} scope
     * @param {Object} options
     */
    addListner : function(component, eventName, handler, scope, options) {
        if (component instanceof Ext.util.Observable) {
            // invoke on( String eventName , Function handler ,
            // [Object scope] , Object options ) : void
            component.on(eventName, handler, scope, options);
        }
    },
    
    /**
     * Adds a list of functions to the prototype of an existing class,
     * overwriting any existing methods with the same name.
     * 
     * @param {Object} origclass
     * @param {Object} overrides
     */
    overrideButton : function() {
        Ext.override(Ext.Button, {
            // needed to change icons dynamically
            setIcon: function(url, obj) {
                if (this.rendered) {
                    var btnEl = obj.getEl().child(obj.buttonSelector);
                    btnEl.setStyle('background-image', 'url(' +url+')');
                }
            },
            // needed to change tooltips dynamically
            setTooltip: function(qtipText, obj) {
                var btnEl = obj.getEl().child(obj.buttonSelector)
                WAPAMA.UI.setQuickTips(btnEl.id, qtipText);
            }
        });
    },
    
    /**
     * Ext.QuickTips.register
     * 
     * @param {String} targetId
     * @param {String} qtipText
     */
    setQuickTips : function(targetId, qtipText) {
        Ext.QuickTips.register({
            target: targetId,
            text: qtipText
        })
    },
    
    /**
     * Ext.encode
     * 
     * @param {Object} obj
     */
    encode : function(obj) {
        return Ext.encode(obj);
    },
    
    /**
     * Ext.decode
     * 
     * @param {Object} obj
     */
    decode : function(obj) {
        return Ext.decode(obj);
    },
    
    /**
     * close the instance window after saving succeed
     * 
     * @param {window} instanceWindowId
     */
    closeInstanceWindow : function(instanceWindowId) {
        var instanceWindow = top.Ext.getCmp(instanceWindowId);
        instanceWindow.initialConfig.tools[5].handler.call(null, instanceWindow.tools.close, instanceWindow);
    },
    
    /**
     * show the error message box while "save" error,
     * Exception: do not show while "autosave" error.
     * 
     * @param {String} responseText
     */
    showFailedWin : function(responseText) {
        // create a new Panel
        var panel = new Ext.Panel({
            frame: true,
            autoHeight: true,
            html : '<table><tr><td class="x-table-layout-cell"><img src="/designer/images/error.png"/></td><td class="x-table-layout-cell">' + 
                   WAPAMA.I18N.Save.failedMsg + '</td></tr></table>',
            buttons : [
                {
                    text : WAPAMA.I18N.Save.failedOKBtn,
                    handler : function() {
                        failedWin.hide();
                    }
                },
                {
                    text : WAPAMA.I18N.Save.failedDetailsBtn,
                    handler : function() {
                        var errWin=window.open('about:blank','_blank','menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,top=0,left=0,width='+
                                   (screen.availWidth-10)+',height='+(screen.availHeight-100));
                        errWin.document.write('<h3>' + WAPAMA.I18N.Save.failedThereWas + '</h3>'+ responseText);
                        errWin.document.close();                
                        failedWin.hide();
                    }
                }
            ]
        })
        // create save failed window
        var failedWin = new Ext.Window({
            title : WAPAMA.I18N.Save.failedTitle,
            layout : 'fit',
            frame: true,
            width : 334,
            modal : true,
            closeAction : 'close',
            plain : false,
            autoHeight: true,
            items: [panel]
        });
        failedWin.show();
    },
    
    /**
     * Show the modal message dialog while saving.
     */
    showSavingMask : function() {
        return top.Ext.MessageBox.show({
            msg      : '<div style="color:#15428B"><br><b>' + WAPAMA.I18N.Save.savingMsg + '<b></div>',
            closable : false,
            width    : 275,
            icon     : 'ext-mb-saving'
        });
    },
    
    /**
     * enable the Save button after editor finished loading
     */
    enableSaveButton : function () {
        // get Ext.Component of Save button
        var saveButton = top.Ext.getCmp(WAPAMA.UUID + 'sv');
        // make it enabled if it's disabled
        if (saveButton.disabled) {
            saveButton.enable();
        }
    },
    
    /**
     * Shows the validate results.
     * 
     * @param jsonObj Check error messages array.
     */
    showValidateResult : function(jsonObj) {
        // load JSON data
        var reader = new Ext.data.JsonReader({
          root : 'errorMsgs',
          id   : 'index'
        },
        [ {name : 'index'}, 
          {name : 'nodename'},
          {name : 'msg'}
        ] );
        var store = new Ext.data.Store({
            proxy : new Ext.data.MemoryProxy(jsonObj),
            reader : reader
        });
        store.load();

        // create the window on the first click and reuse on subsequent clicks
        var win = new Ext.Window({
            title : 'Validation Error',
            layout : 'fit',
            width : 600,
            modal : true,
            closeAction : 'close',
            plain : false,
            items : new Ext.grid.GridPanel({
                store : store,
                height : 300,
                columns : [ {
                    header : "<b>Index</b>",
                    sortable : true,
                    width : 50,
                    dataIndex : 'index'
                }, {
                    header : "<b>Component Name</b>",
                    sortable : true,
                    width : 220,
                    dataIndex : 'nodename'
                }, {
                    header : "<b>Error Message</b>",
                    sortable : true,
                    width : 300,
                    dataIndex : 'msg'
                } ]
            }),

            buttons : [ {
                text : 'Close',
                handler : function() {
                    win.hide();
                }
            } ]
        });
        win.show();
    },

    /**
     * a popup dialog which fades out 1 second later after shows.
     */
    prompt : {
        // create the msg box
        createBox : function (t, s){
            var innerhtm;
            if (t == undefined || t == '') {
                innerhtm = ['<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc">',
                s, '</div></div></div>'].join('');
            } else if (s == undefined || s == '') {
                innerhtm = ['<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>',
                t, '</h3></div></div></div>'].join('');
            } else {
                innerhtm = ['<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>',
                t, '</h3>', s, '</div></div></div>'].join('');
            }
            return ['<div class="msg" style="position: relative">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                innerhtm,
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
        },
        // slide in the msg box, halt a second, then ghost out.
        msg : function(title, message){
            // status msg showing DIV, 
            msgDiv = Ext.get('msg_div');
            // calc the position of Msg Div.
            var scrollNode = msgDiv.parent().parent().parent().first();
            var canvasScrollLeft = scrollNode.getScroll().left;
            var canvasScrollTop = scrollNode.getScroll().top;
            var canvasWidth = scrollNode.getWidth();
            var msgPositionLeft = canvasWidth / 2 + canvasScrollLeft - 125;
            var msgPostionTop = canvasScrollTop;
    
            msgDiv.setStyle('top', msgPostionTop + 'px');
            msgDiv.setStyle('left', msgPositionLeft + 'px');
    
            var divHtml = this.createBox(title, message);
            var m = Ext.DomHelper.append(msgDiv, {html: divHtml}, true);
            m.slideIn('t').pause(1).ghost("t", {remove:true});
        }
    },
    
    /**
     * pack the functions for main.js.
     */
    main : {
        /** When the blank image url is not set programatically to a local
         * representation, a spacer gif on the site of ext is loaded from the
         * internet. This causes problems when internet or the ext site are not
         * available. 
         */
        setBlankImgUrl : function() {
            Ext.BLANK_IMAGE_URL = WAPAMA.PATH + 'lib/ext-2.0.2/resources/images/default/s.gif';
        },
        finishedLoading : function(obj) {
            if(Ext.getCmp('wapama-loading-panel')){
                Ext.getCmp('wapama-loading-panel').hide()
            }
            
            // Do Layout for viewport
            obj.layout.doLayout();
            // Generate a drop target
            new Ext.dd.DropTarget(obj.getCanvas().rootNode.parentNode);
            
            // Fixed the problem that the viewport can not 
            // start with collapsed panels correctly
            if (WAPAMA.CONFIG.PANEL_RIGHT_COLLAPSED === true){
                obj.layout_regions.east.collapse();
            }
            if (WAPAMA.CONFIG.PANEL_LEFT_COLLAPSED === true){
                obj.layout_regions.west.collapse();
            }
            // Raise Loaded Event
            obj.handleEvents( {type:WAPAMA.CONFIG.EVENT_LOADED} )
        },
        
        /**
         * adds a component to the specified region
         * 
         * @param {Object} facade
         * @param {String} region
         * @param {Ext.Component} component
         * @param {String} title, optional
         * @return {Ext.Component} dom reference to the current region or null if specified region is unknown
         */
        addToRegion: function(facade, region, component, title) {
            
            // for plugins, use this instead of facade
            if (facade == null) {
                facade = this;
            }
            if (region.toLowerCase && facade.layout_regions[region.toLowerCase()]) {
                var current_region = facade.layout_regions[region.toLowerCase()];

                current_region.add(component);

                WAPAMA.Log.debug("original dimensions of region %0: %1 x %2", current_region.region, current_region.width, current_region.height)
                // update dimensions of region if required.
                if  (!current_region.width && component.initialConfig && component.initialConfig.width) {
                    WAPAMA.Log.debug("resizing width of region %0: %1", current_region.region, component.initialConfig.width)   
                    current_region.setWidth(component.initialConfig.width)
                }
                if  (component.initialConfig && component.initialConfig.height) {
                    WAPAMA.Log.debug("resizing height of region %0: %1", current_region.region, component.initialConfig.height)
                    var current_height = current_region.height || 0;
                    current_region.height = component.initialConfig.height + current_height;
                    current_region.setHeight(component.initialConfig.height + current_height)
                }
                
                // set title if provided as parameter.
                if (typeof title == "string") {
                    current_region.setTitle(title); 
                }
                            
                // trigger doLayout() and show the pane
                current_region.ownerCt.doLayout();
                current_region.show();
    
                if(Ext.isMac)
                    WAPAMA.Editor.resizeFix();
                
                return current_region;
            }
            return null;
        },
        
        /**
         * Generate the whole viewport of the
         * Editor and initialized the Ext-Framework
         * 
         */
        generateGUI: function(facade) {
    
            //TODO make the height be read from eRDF data from the canvas.
            // default, a non-fullscreen editor shall define its height by layout.setHeight(int) 
            
            // Defines the layout hight if it's NOT fullscreen
            var layoutHeight    = 400;
        
            var canvasParent    = facade.getCanvas().rootNode.parentNode;
    
            // DEFINITION OF THE VIEWPORT AREAS
            facade.layout_regions = {
                    
                    // DEFINES TOP-AREA
                    north   : new Ext.Panel({ //TOOO make a composite of the wapama header and addable elements (for toolbar), second one should contain margins
                        region  : 'north',
                        cls     : 'x-panel-editor-north',
                        autoEl  : 'div',
                        border  : false
                    }), 
                    
                    // DEFINES RIGHT-AREA
                    east    : new Ext.Panel({
                        region  : 'east',
                        layout  : 'fit',
                        cls     : 'x-panel-editor-east',
                        /*layout: 'accordion',
                        layoutConfig: {
                           // layout-specific configs go here
                            titleCollapse: true,
                            animate: true,
                            activeOnTop: true
                        },*/
                        autoEl  : 'div',
                        border  :false,
                        width   : WAPAMA.CONFIG.PANEL_RIGHT_WIDTH || 200,
                        split   : true,
                        animate: true,
                        collapsible : true,
                        titleCollapse: true,
                        title: "Properties"
                    }),
                    
                    
                    // DEFINES BOTTOM-AREA
                    south   : new Ext.Panel({
                        region  : 'south',
                        cls     : 'x-panel-editor-south',
                        autoEl  : 'div',
                        border  : false
                    }),
                    
                    
                    // DEFINES LEFT-AREA
                    west    : new Ext.Panel({
                        region  : 'west',
                        layout  : 'anchor',
                        autoEl  : 'div',
                        cls     : 'x-panel-editor-west',
                        width   : WAPAMA.CONFIG.PANEL_LEFT_WIDTH || 200,
                        autoScroll:true,
                        split   : true,
                        animate: true,
                        collapsible : true,
                        titleCollapse: true,
                        title: "Shape Repository"
                    }),
                    
                    
                    // DEFINES CENTER-AREA (FOR THE EDITOR)
                    center  : new Ext.Panel({
                        region  : 'center',
                        cls     : 'x-panel-editor-center',
                        autoScroll: true,
                        cmargins: {left:0, right:0},
                        border: false,
                        width: "auto",
                        height : "auto",
                        items   : {
                            layout  : "fit",
                            autoHeight: true,
                            el      : canvasParent
                        }
                    })
            }
            
            // Config for the Ext.Viewport 
            var layout_config = {
                layout: 'border',
                items: [
                    facade.layout_regions.north,
                    facade.layout_regions.east,
                    facade.layout_regions.south,
                    facade.layout_regions.west,
                    facade.layout_regions.center
                ]
            }
    
            // IF Fullscreen, use a viewport
            if (facade.fullscreen) {
                facade.layout = new Ext.Viewport( layout_config )
            
            // IF NOT, use a panel and render it to the given id
            } else {
                layout_config.renderTo  = facade.id;
                layout_config.height    = layoutHeight;
                facade.layout = new Ext.Panel( layout_config )
            }
            
            //Generates the WAPAMA-Header
            var headerPanel = new Ext.Panel({
                height      : 0,
                autoHeight  : false,
                border      : false,
                html        : "" 
            });
            // The empty default header
            this.addToRegion(facade, "north", headerPanel );
            
            
            // Set the editor to the center, and refresh the size
            canvasParent.parentNode.setAttributeNS(null, 'align', 'center');
            canvasParent.setAttributeNS(null, 'align', 'left');
            facade.getCanvas().setSize({
                width   : "100%",
                height  : "100%"
            });
        }
    },
    
    /**
     * WAPAMA.Editor.makeExtModalWindowKeysave
     */
    makeExtModalWindowKeysave : function(facade) {
        Ext.override(Ext.Window,{
            beforeShow : function(){
                delete this.el.lastXY;
                delete this.el.lastLT;
                if(this.x === undefined || this.y === undefined){
                    var xy = this.el.getAlignToXY(this.container, 'c-c');
                    var pos = this.el.translatePoints(xy[0], xy[1]);
                    this.x = this.x === undefined? pos.left : this.x;
                    this.y = this.y === undefined? pos.top : this.y;
                }
                this.el.setLeftTop(this.x, this.y);
        
                if(this.expandOnShow){
                    this.expand(false);
                }
        
                if(this.modal){
                    facade.disableEvent(WAPAMA.CONFIG.EVENT_KEYDOWN);
                    Ext.getBody().addClass("x-body-masked");
                    this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                    this.mask.show();
                }
            },
            afterHide : function(){
                this.proxy.hide();
                if(this.monitorResize || this.modal || this.constrain || this.constrainHeader){
                    Ext.EventManager.removeResizeListener(this.onWindowResize, this);
                }
                if(this.modal){
                    this.mask.hide();
                    facade.enableEvent(WAPAMA.CONFIG.EVENT_KEYDOWN);
                    Ext.getBody().removeClass("x-body-masked");
                }
                if(this.keyMap){
                    this.keyMap.disable();
                }
                this.fireEvent("hide", this);
            },
            beforeDestroy : function(){
                if(this.modal)
                    facade.enableEvent(WAPAMA.CONFIG.EVENT_KEYDOWN);
                Ext.destroy(
                    this.resizer,
                    this.dd,
                    this.proxy,
                    this.mask
                );
                Ext.Window.superclass.beforeDestroy.call(this);
            }
        });
    },
    
    /**
     * Show a loading window while WAPAMA is loading.
     * 
     * @param {Object} obj The receiver of the properties
     */
    showLoadingWindow : function(message) {
        var waitingpanel = new Ext.Window({
                                renderTo:Ext.getBody(),
                                id:'wapama-loading-panel',
                                bodyStyle:'padding: 8px;background:white',
                                title:WAPAMA.I18N.Wapama.title,
                                width:'auto',
                                height:'auto',
                                modal:true,
                                resizable:false,
                                closable:false,
                                html:'<span style="font-size:11px;">' + message + '</span>'
                              })
        waitingpanel.show()
    },
    
    /**
     * Ext.apply
     * Copies all the properties of config to obj.
     * 
     * @param {Object} obj The receiver of the properties
     * @param {Object} config The source of the properties
     * @param {Object} defaults A different object that will also be applied for default values
     * @return {Object} returns obj
     */
    apply : function(obj, config, defaults) {
        var object = Ext.apply(obj, config, defaults);
        return object;
    },
    
    /**
     * Ext.applyIf
     * Copies all the properties of config to obj if they don't already exist.
     * 
     * @param {Object} obj The receiver of the properties
     * @param {Object} config The source of the properties
     * @return {Object} returns obj
     */
    applyIf : function(obj, config) {
        var object = Ext.applyIf(obj, config);
        return object;
    },
    
    /**
     * True if the detected browser is Chrome.
     * @return {Boolean}
     */
    isSafari : function() {
        return Ext.isSafari;
    },
    
    /**
     * True if the detected platform is Mac OS.
     * @return {Boolean}
     */
    isMac : function() {
        return Ext.isMac;
    },
    
    // Ext.Msg.alert
    alert : function(title, msg, fn, scope) {
        Ext.Msg.alert(title, msg, fn, scope);
    }
}