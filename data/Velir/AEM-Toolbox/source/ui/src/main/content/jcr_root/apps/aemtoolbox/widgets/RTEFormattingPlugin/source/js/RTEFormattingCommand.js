//create widget namespace
CQ.Ext.ns('AEM.Toolbox.Widgets.rte.commands');

AEM.Toolbox.Widgets.rte.commands.RTEFormattingCommand = CQ.Ext.extend(CQ.form.rte.commands.Command, {

	isCommand: function(cmdStr) {
		return (cmdStr.toLowerCase() == "rteformattingcommand");
	},

	getProcessingOptions: function() {
		var cmd = CQ.form.rte.commands.Command;
		return cmd.PO_BOOKMARK | cmd.PO_SELECTION;
	},

	execute: function(execDef) {
		var dpr = CQ.form.rte.DomProcessor;
		var com = CQ.form.rte.Common;
		var dom;
		var selection = execDef.selection;
		var context = execDef.editContext;
		var containerList = dpr.createContainerList(context, selection);
		if (containerList.length == 0) {
			var nodeList = execDef.nodeList;
			if (!nodeList) {
				nodeList = dpr.createNodeList(context, selection);
			}
			var auxRoot = com.getTagInPath(context, nodeList.commonAncestor, dpr.AUXILIARY_ROOT_TAGS);
			if (auxRoot) {
				dom = dpr.createNode(execDef.editContext, execDef.value.tag);

				//if we have css classes to add then add them
				if (execDef.value.classNames != null) {
					//remove classes
					com.removeAllClasses(dom);

					//go through each class and add
					for (var i = 0; i < execDef.value.classNames.length; i++) {
						com.addClass(dom, execDef.value.classNames[i]);
					}
				}

				com.moveChildren(auxRoot, dom);
				auxRoot.appendChild(dom);
			}
		} else {
			dom = dpr.createNode(execDef.editContext, execDef.value.tag);

			//if we have css classes to add then add them
			if (execDef.value.classNames != null) {
				//remove classes
				com.removeAllClasses(dom);

				//go through each class and add
				for (var i = 0; i < execDef.value.classNames.length; i++) {
					com.addClass(dom, execDef.value.classNames[i]);
				}
			}

			dpr.changeContainerTag(execDef.editContext, containerList, dom, true);
		}
	},

	queryState: function(selectionDef, cmd) {
		return false;
	}

});

// register command
CQ.form.rte.commands.CommandRegistry.register("rteformattingcommand", AEM.Toolbox.Widgets.rte.commands.RTEFormattingCommand);