Ext.ns('jp');

jp.TabPanel.Tab.TreePanel = Ext.extend(Ext.tree.TreePanel, {
    title: '',
    region: 'west',
    split: true,
    width: 300,
    border: true,
    enableDD: true,
    autoScroll: true,
    ddGroup: 'nodeDragAndDrop',
    
    contextMenu: null,
    hiddenNodes: [],
    treeEditPanel: null,
    initComponent: function() {
	this.plugins = [new NodeMouseoverPlugin(), new NodeMouseoutPlugin()];
	this.root = {
	    text: 'JSON',
	    draggable: false,
	    leaf: true,
	    type: 'object'
	};

	this.tbar = {
	    xtype: 'jp.TabPanel.Tab.TreePanel.tbar'
	};

	this.contextMenu = new jp.TabPanel.Tab.TreePanel.contextMenu();

	this.listeners = {
	    'movenode': this.onNodeMove,
	    'mouseover': this.onNodeMouseover,
	    'mouseout': this.onNodeMouseout,
	    'contextmenu': this.showContextMenu,
	    scope: this
	};
	
	jp.TabPanel.Tab.TreePanel.superclass.initComponent.call(this);

	this.getSelectionModel().addListener('beforeselect', this.onBeforeSelectNode, this);
    },

    afterRender: function () {
	jp.TabPanel.Tab.TreePanel.superclass.afterRender.call(this);

	this.treeEditPanel = this.findParentByType("jp.Editor").tabPanel.getTreeEditPanel();

	var oThis = this;

	new Ext.dd.DropTarget(this.getTopToolbar().deleteNode.el, {
	    available: true,
	    ddGroup: 'nodeDragAndDrop',
	    copy: false,
	    notifyDrop: function(dd, e, data) {
		(function() {
		    oThis.deleteSelectedNode();
		}).defer(50);
		return true;
	    }
	});

	new Ext.dd.DropTarget(this.getTopToolbar().duplicateNode.el, {
	    available: true,
	    ddGroup: 'nodeDragAndDrop',
	    copy: false,
	    notifyDrop: function(dd, e, data) {
		(function() {
		    oThis.duplicateSelectedNode();
		}).defer(50);
		return true;
	    }
	});
    },

    onNodeMouseover: function ( node ) {
	var statuspanel = this.findParentByType("jp.Editor").statusPanel;
	if (node.getDepth() > 0) {
	    var value = node.attributes.value;
	    

	    if (node.attributes.type == "array" || node.attributes.type == "object")
		value = "<i>&lt;" + node.attributes.type.toFirstUpperCase() + "&gt;</i>";

	    statuspanel.setStatusRight("<b>" + node.attributes.text + ":</b>  " + value);
	} else {
	    statuspanel.clearStatus();
	}
    },

    onNodeMouseout: function () {
	var statuspanel = this.findParentByType("jp.Editor").statusPanel;
	statuspanel.clearStatusRight();
    },

    showContextMenu: function(node, event) {
	var selectionModel = this.getSelectionModel();
	selectionModel.select( node );

	this.contextMenu.showAt(event.getXY());
	event.stopEvent();
    },

    onNodeMove: function (tree, node, oldParent, newParent, index) {
	debug.trace("**move node**");
	if ( newParent.attributes.type == "array" ) {
	    debug.trace("DROP INTO ARRAY");

	    debug.trace("***"+node.attributes.type+"***");
	    if (node.attributes.type == "null") {
		node.setText( "<NULL>" );
	    } else {
		node.setText( node.attributes.value );
	    }
	} else {
	    debug.trace("DROP NOT INTO ARRAY");
	}

	var sm = tree.getSelectionModel();
	sm.fireEvent('beforeselect', sm, node, null);

	node.select();
    },

    onBeforeSelectNode: function (sel, node, obj) {
	var topBar = this.getTopToolbar();
	//var treeEditPanel = this.findParentByType("jp.Editor").tabPanel.getTreeEditPanel();
	if (node.getDepth() == 0) {
	    this.treeEditPanel.disable();
	    topBar.duplicateNode.disable();
	    topBar.deleteNode.disable();
	} else {
	    this.treeEditPanel.enable();
	    topBar.duplicateNode.enable();
	    topBar.deleteNode.enable();

	    var nodeText = "";
	    /*if ( n.attributes.text == JP.util.getJsonTreeNodeString("empty", false) ) nodeText = "";
	    else if ( n.attributes.text == JP.util.getJsonTreeNodeString("null", false) ) nodeText = "null";
	    else */
	    nodeText = node.attributes.text;

	    if ( node.attributes.leaf == true ) {
		this.treeEditPanel.form.datatype.setValue( node.attributes.type );
		this.treeEditPanel.form.jsonkey.setValue( nodeText );
		this.treeEditPanel.form.jsonvalue.setValue( node.attributes.value );

		if ( node.parentNode != null && node.parentNode.attributes.type == "array" )
		    this.treeEditPanel.form.jsonkey.disable();

		if ( node.attributes.type == "null" ) {
		    this.treeEditPanel.form.jsonvalue.setValue("null");
		    this.treeEditPanel.form.jsonvalue.disable();
		}
	    } else {
		this.treeEditPanel.form.datatype.disable();
		this.treeEditPanel.form.jsonvalue.disable();
		this.treeEditPanel.form.jsonkey.setValue( nodeText );
	    }
	}
    },

    addNode: function (nodeType) {
	var sm = this.getSelectionModel();
	var selectedNode = sm.getSelectedNode();
	var statuspanel = this.findParentByType("jp.Editor").statusPanel;
	var parentNode = null;

	if (selectedNode == null) selectedNode = this.getRootNode();

	if ( selectedNode.attributes.type == "object" || selectedNode.attributes.type == "array" ) {
	    parentNode = selectedNode;

	    if (parentNode.isExpandable() && !parentNode.isExpanded())
		parentNode.expand();
	} else {
	    parentNode = selectedNode.parentNode;
	}

	if ( !parentNode.hasChildNodes() && parentNode.getDepth() == 0 ) {
	    var root = this.buildNodes( "object", [] );

	    this.setRootNode(root);
	    this.getLoader().load( this.root );

	    parentNode = this.getRootNode();
	}

	var newNodeConfig = null;
	switch (nodeType) {
	    case 'value':
		newNodeConfig = {
		    leaf: true,
		    expandable: false,
		    value: "",
		    type: "string"
		};
		break;
	    case 'object': case 'array':
		newNodeConfig = {
		    leaf: false,
		    expandable: true,
		    type: nodeType.toLowerCase(),
		    iconCls: "ico_" + nodeType.toLowerCase()
		};
		break;
	}

	newNodeConfig.id = Ext.id();

	if ( parentNode.attributes.type == "array" && (nodeType == "object" || nodeType == "array") ) {
	    newNodeConfig.text = "[object " + nodeType.toFirstUpperCase() + "]";
	} else {
	    if (parentNode.attributes.type != "array") {
		newNodeConfig.text = "New" + nodeType.toFirstUpperCase();
	    } else {
		//newNodeConfig.text = JP.util.getJsonTreeNodeString("empty", false); //@todo Text by function
		newNodeConfig.text = "&lt;EMPTY&gt;";
		newNodeConfig.value = "";
	    }
	}

	var newNode = new Ext.tree.TreeNode( newNodeConfig );

	parentNode.insertBefore(newNode, selectedNode.nextSibling);

	if (newNode) {
	    sm.select( newNode );

	    statuspanel.setStatus({
		text: 'Added node succesfully',
		iconCls: 'x-status-valid',
		clear: true
	    });
	}
    },

    deleteSelectedNode: function () {
	var sm = this.getSelectionModel();
	var selectedNode = sm.getSelectedNode();
	var previousSibling = selectedNode.previousSibling;
	var parentNode = selectedNode.parentNode;

	if ( selectedNode ) {
	    if ( selectedNode.getDepth() != 0 ) {
		selectedNode.remove();
		
		var statuspanel = this.findParentByType("jp.Editor").statusPanel;

		statuspanel.setStatus({
		    text: 'Deleted node succesfully',
		    iconCls: 'x-status-valid',
		    clear: true
		});
	    }
	}

	if ( previousSibling )
	    sm.select( previousSibling );
	else
	    sm.select( parentNode );
    },

    duplicateSelectedNode: function () {
	var sm = this.getSelectionModel();
	var selectedNode = sm.getSelectedNode();
	var parentNode = selectedNode.parentNode;

	if ( selectedNode != null ) {
	    if ( selectedNode.getDepth() != 0 ) {
		var newNode = new Ext.tree.TreeNode();

		if (selectedNode.hasChildNodes()) {
		    var children = this._duplicateNodeChilds(selectedNode, []);
		    newNode.appendChild(children);
		} else {
		    newNode.attributes.value = selectedNode.attributes.value;
		}

		var nodeText = "";
		nodeText = selectedNode.attributes.text;

		/*if ( selectedNode.attributes.text == JP.util.getJsonTreeNodeString("null", false) )
		    nodeText += ' Copy';*/
		//@todo Append a " Copy" String to duplicated nodes

		newNode.setId(Ext.id());
		newNode.attributes.iconCls = selectedNode.attributes.iconCls;
		newNode.attributes.expandable = selectedNode.attributes.expandable;
		newNode.attributes.leaf = selectedNode.attributes.leaf;
		newNode.setText( nodeText );
		newNode.attributes.type = selectedNode.attributes.type;

		parentNode.insertBefore(newNode, selectedNode.nextSibling);
		sm.select(newNode);

		var statuspanel = this.findParentByType("jp.Editor").statusPanel;

		statuspanel.setStatus({
		    text: 'Duplicated node succesfully',
		    iconCls: 'x-status-valid',
		    clear: true
		});
	    }
	}
    },

    filterNodes: function(pattern, me){
	// un-hide the nodes that were filtered last time
	Ext.each(me.hiddenNodes, function(n){
	    n.ui.show();
	});

	if(!pattern){
	    // no pattern -> nothing to be done
	    return;
	}

	me.expandAll();

	var re = new RegExp('^.*' + Ext.escapeRe(pattern) + '.*', 'i');

	me.root.cascade( function(n){
	    if (re.test(n.text) || re.test(n.attributes.value) || n.getDepth() == 0) {
		n.ui.show();
		n.bubble(function(){
		    this.ui.show();
		});
	    } else {
		n.ui.hide();
		me.hiddenNodes.push(n);
	    }
	}, me);
    },

    setNodesByJson: function (json) {
	var rootType = Ext.type(json);
	var childNodes = this._prepareObjectForTree(json, [], 0, (rootType == "array"));

	var root = this.buildNodes( rootType, childNodes );

	this.setRootNode(root);
	this.getLoader().load( this.root );
	this.getSelectionModel().select( this.getRootNode() );
    },

    buildNodes: function (type, children) {
	var isLeaf = true;
	var icoClass = '';
	var expanded = false;

	if ( type != null && type != "" && children != null ) {
	    isLeaf = false;
	    icoClass = 'ico_' + type;
	    expanded = true;
	}

	var rootNode = new Ext.tree.TreeNode({
	    text: 'JSON',
	    value: '|||JSON|ROOT|NODE|||',
	    draggable:false,
	    leaf: isLeaf,
	    iconCls: icoClass,
	    type: type,
	    children: children,
	    expanded: expanded
	});
	return rootNode;
    },

    _prepareObjectForTree: function (obj, treeObj, lvl, parentIsArray) {
	var ind = null;
	var arrayIndex = 0;
	lvl++;

	for (ind in obj) {
	    if (ind != "remove" && ind != "in_array") {
		var text = ind;
		var nodeType = jp.util.type( obj[ind] );

		var nodeObject = new Object();

		nodeObject.id = Ext.id();
		if ( jp.util.isObject( obj[ind] ) && obj[ind] != null ) {
		    if ( parentIsArray ) {
			text = "[" + new String(arrayIndex) + "]";
			arrayIndex++;
		    } else {
			arrayIndex = 0;
		    }

		    nodeObject.iconCls = 'ico_' + nodeType;
		    nodeObject.expandable = true;
		    nodeObject.leaf = false;
		    nodeObject.children = this._prepareObjectForTree(obj[ind], [], lvl, (nodeType == "array"));
		} else {
		    if (obj[ind] == null)
			nodeType = "null";

		    if (parentIsArray)
			text = obj[ind];

		    nodeObject.expandable = false;
		    nodeObject.leaf = true;
		    nodeObject.value = obj[ind];
		}

		nodeObject.text = text;
		nodeObject.type = nodeType;

		treeObj.push( nodeObject );
	    }
	}

	return treeObj;
    },

    _duplicateNodeChilds: function (node, obj) {
	node.eachChild(function (child) {
	    var newChild = new Object();
	    newChild.id = Ext.id();

	    if (child.hasChildNodes()) {
		newChild.iconCls = child.attributes.iconCls;
		newChild.expandable = true;
		newChild.leaf = false;
		newChild.children = this._duplicateNodeChilds(child, []);
	    } else {
		newChild.expandable = false;
		newChild.leaf = true;
		newChild.value = child.attributes.value;
	    }

	    newChild.text = child.attributes.text;
	    newChild.type = child.attributes.type;

	    obj.push(newChild);
	});

	return obj;
    }
});

Ext.reg('jp.TabPanel.Tab.TreePanel', jp.TabPanel.Tab.TreePanel);
