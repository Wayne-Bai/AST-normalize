/* Lasso range library

Name:				Lasso
Description:			Lightweight, crossbrowser javascript library for creating and modifying ranges. Used by the GhostEdit editor.
Licence:			Dual licensed under MIT and LGPL licenses.
Browser Support:		Internet Explorer 6+, Mozilla Firefox 3.5+, Google Chrome, Apple Safari 3+, Opera 10.50+, Any other browser that supports DOMranges or TextRanges
Author:				Nico Burns <nico@nicoburns.com>
Website:			http://ghosted.it/lasso
Version:			1.5.0
Release Date:			---

Changelog:
Changes to the node selection functions.
Change to deleteContents() for TextRange browsers (ie)
Added clearSelection();

Available methods:
	Native range:
		setFromNative(nativerange)
		getNative()
	Selection:
		setToSelection()
		select()
		clearSelection()
	Modify range:
		reset()
		setStartToRangeStart(lasso object | range)
		setStartToRangeEnd(lasso object | range)
		setEndToRangeStart(lasso object | range)
		setStartToRangeEnd(lasso object | range)
	Modify content:
		deleteContents()
		pasteText(string)
	Get content:
		getText()
		extractText()
		getHTML()
		extractHTML()
	Node/element:
		selectNode(node)
		selectNodeContents(node) [only works on block elements in ie8]
		setCaretToStart(elem | elemid)
		setCaretToEnd(elem | elemid)
	Range information:
		isCollapsed()
		compareEndPoints()
		getStartNode()
		getEndNode()
		getParentNode()
		getStartElement()
		getEndElement()
	Save & restore:
		saveToDOM()
		restoreFromDOM()
		isSavedRange()
		removeDOMmarkers()
		bookmarkify() [ie <= 8 only]
		unbookmarkify() [ie <= 8 only]
	other:
		clone()
		inspect()


Example usage:

	1. Set the caret to the end of an element with ID 'testelem':
	lasso().setCaretToEnd('testelem').select();

	2. Get the currently selected text
	lasso().setToSelection().getText();
*/

window.lasso = function() {
	//define local range object to be returned at end
	var r = {
		saved: null,
		endpoint: null,
		startpoint: null,
		bookmark: null,
		textrange: false,
		domrange: false,
		isLassoObject: true
	},
	lasso = window.lasso,
	console = window.console || {};
	console.log = console.log || function () {};
		
	r.init = r.reset = r.create = function () {
		if(document.createRange) {
			r.textrange = false;
			r.saved = document.createRange();
		}
		else if (document.selection) {
			r.textrange = true;
			r.saved = document.body.createTextRange();
		}
		r.bookmark = false;
		r.domrange = !r.textrange;
		return r;
	};
	
	r.setToEmpty = function () {
		if (r.domrange) {
			r.saved = document.createRange();
		}
		else if (r.textrange) {
			r.saved = document.body.createTextRange();
		}
		return r;
	};
	
	
	/* Native Range Functions */
	
	r.setFromNative = function (nativerange) {
		r.saved = nativerange;
		return r;
	};
	
	r.getNative = function () {
		return r.saved;
	};
	
	
	/* Selection Functions */
	
	r.setToSelection = function () {
		var s;
		if(r.domrange) {
			s = window.getSelection();
			if(s.rangeCount > 0) {
				r.saved = s.getRangeAt(0).cloneRange();
			}
		}
		else if (r.textrange) {
			r.saved = document.selection.createRange();
		}
		return r;
	};
	
	r.select = function () {
		if (r.domrange) {
			var s = window.getSelection();
			if (s.rangeCount > 0) s.removeAllRanges();
			s.addRange(r.saved);
		}
		else if (r.textrange) {
			r.saved.select();
		}
		return r;
	};
	
	r.clearSelection = function () {
		if (r.domrange) {
			var s = window.getSelection();
			if (s.rangeCount > 0) s.removeAllRanges();
		}
		else if (r.textrange) {
			document.selection.empty();
		}
		return r;
	};
	
	
	/* Modify Range Functions */
	
	r.collapseToStart = function () {
		r.saved.collapse(true);
		return r;
	};
	
	r.collapseToEnd = function () {
		r.saved.collapse(false);
		return r;
	};
	
	r.setStartToRangeStart = function (range) {
		if (range && range.saved) range = range.getNative();
		
		if (r.domrange) {
			r.saved.setStart(range.startContainer, range.startOffset);
		}
		else if (r.textrange) {
			r.saved.setEndPoint("StartToStart", range);
		}
		return r;
	};
	
	r.setStartToRangeEnd = function (range) {
		if (range && range.saved) range = range.getNative();
		
		if (r.domrange) {
			r.saved.setStart(range.endContainer, range.endOffset);
		}
		else if (r.textrange) {
			r.saved.setEndPoint("StartToEnd", range);
		}
		return r;
	};
	
	r.setEndToRangeStart = function (range) {
		if (range && range.saved) range = range.getNative();
		
		if (r.domrange) {
			r.saved.setStart(range.endContainer, range.endOffset);
		}
		else if (r.textrange) {
			r.saved.setEndPoint("EndToStart", range);
		}
		return r;
	};
	
	r.setEndToRangeEnd = function (range) {
		if (range && range.saved) range = range.getNative();
		
		if (r.domrange) {
			r.saved.setEnd(range.endContainer, range.endOffset);
		}
		else if (r.textrange) {
			r.saved.setEndPoint("EndToEnd", range);
		}
		return r;
	};
	
	
	/* Modify Content Functions */
	
	r.deleteContents = function () {
		if (r.domrange) {
			r.saved.deleteContents();
		}
		else if (r.textrange) {
			/* TextRange deleting seems quite buggy - these *should* work, but text = "" has been most successful so far
			try {
				r.saved.pasteHTML("");
			}
			catch (e) {
				r.saved.execCommand("delete");
			}*/
			r.saved.text = "";
		}
		return r;
	};
	
	r.pasteText = function (text, collapse) {
		if(typeof collapse === "undefined") collapse = true;
		
		r.deleteContents();
		
		if (r.domrange) {
			var txt = document.createTextNode(text);
			r.saved.insertNode(txt);
			r.reset().selectNodeContents(txt);
		}
		else if (r.textrange) {
			r.saved.pasteHTML(text);
		}
		
		if (collapse) r.collapseToEnd();
		r.select();
		
		return r;
	};
	
	r.insertNode  = function (node, collapse) {
		var div;
		if(typeof collapse === "undefined") collapse = true;
		
		r.deleteContents();
		
		if (r.domrange) {
			r.saved.insertNode(node);
			r.setToEmpty().selectNodeContents(node);
		}
		else if (r.textrange) {
			div = document.createNode("div");
			div.appendChild(node);
			r.saved.pasteHTML(div.innerHTML);
		}
		
		if (collapse) r.collapseToEnd();
		//r.select();
		
		return r;
	};
	
	/* Get Content Functions */

	r.getText = function () {
		if (r.domrange) {
			return r.saved.toString();
		}
		else if (r.textrange) {
			return r.saved.text;
		}
	};

	r.extractText = function () {
		var text = r.getText();
		r.deleteContents();
		return text;
	};
	
	r.getHTML = function () {
		var tempelem, docfrag;
		if (r.domrange) {
			docfrag = r.saved.cloneContents();
			tempelem = document.createElement("div");
			tempelem.appendChild(docfrag);
			return tempelem.innerHTML;
		}
		else if (r.textrange) {
			return r.saved.htmlText;
		}
	};
	
	r.extractHTML = function () {
		var html = r.getHTML();
		r.deleteContents();
		return html;
	};
	
	
	/* Node/Element Functions */
	
	r.actualSelectNode = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		
		if (r.domrange) {
			r.saved.selectNode(elem);
		}
		else if (r.textrange) {
			r.saved.moveToElementText(elem);
		}
		return r;
	};
		
	r.selectNode = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		
		if (r.domrange) {
			r.saved.selectNodeContents(elem);
		}
		else if (r.textrange) {
			r.saved.moveToElementText(elem);
		}
		return r;
	};
	
	//Only works on block elements in ie8
	r.selectNodeContents = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		var r1, r2;
		
		if (r.domrange) {
			r.saved.selectNodeContents(elem);
		}
		else if (r.textrange) {
			r.saved.moveToElementText(elem);
			r1 = lasso().setCaretToStart(elem).getNative();
			r2 = lasso().setCaretToEnd(elem).getNative();
			r.saved.setEndPoint("StartToStart", r1);
			r.saved.setEndPoint("EndToStart", r2);
		}
		return r;
	};
	
	r.setCaretToStart = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		
		if (r.domrange) {
			r.saved.selectNodeContents(elem);
			r.saved.collapse(true);
		}
		else if (r.textrange) {
			/*elem.innerHTML = "<span id=\"range_marker\">&#x200b;</span>" + elem.innerHTML;
			r.selectNode('range_marker');//.deleteContents(); // For some reason .deleteContents() sometimes deletes too much
			document.getElementById('range_marker').parentNode.removeChild(document.getElementById('range_marker'));*/
			r.saved.moveToElementText(elem);
			r.saved.collapse(true);
		}
		return r;
	};
	
	r.setCaretToBlockStart = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		
		if (r.domrange) {
			r.saved.selectNodeContents(elem);
			r.saved.collapse(true);
		}
		else if (r.textrange) {
			r.saved.moveToElementText(elem);
			r.saved.collapse(false);
			
			r.saved.move("character", -(elem.innerText.length + 1));
		}
		return r;
	};
	
	r.selectInlineStart = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		
		if (r.domrange) {
			r.saved.selectNodeContents(elem);
			r.saved.collapse(true).select();
		}
		else if (r.textrange) {
			elem.innerHTML = "a" + elem.innerHTML; // The 'a' is arbitrary, any single character will work
    
			r.saved.moveToElementText(elem);
			r.saved.collapse(false);
			
			r.saved.move("character", -(elem.innerText.length + 1));
			r.saved.moveEnd("character", 1);
			r.saved.select();
			r.saved.text = "";
		}
		return r;
	};
	
	r.setCaretToEnd = function (elem) {
		if(typeof elem === "string") elem = document.getElementById(elem);
		
		if (r.domrange) {
			r.saved.selectNodeContents(elem);
			r.saved.collapse(false);
		}
		else if (r.textrange) {
			/*elem.innerHTML = elem.innerHTML + "<span id=\"range_marker\">&#x200b;</span>";
			r.selectNode('range_marker');//.deleteContents();
			document.getElementById('range_marker').parentNode.removeChild(document.getElementById('range_marker'));*/
			r.saved.moveToElementText(elem);
			r.saved.collapse(false);
		}
		return r;
	};

	
	/* Range Information Functions */
	
	r.isCollapsed = function () {
		if (r.domrange) {
			return r.saved.collapsed;
		}
		else if (r.textrange) {
			//return r.saved.compareEndPoints("StartToEnd", r.saved) === 0 ? true : false;
			return r.saved.isEqual(r.clone().collapseToStart().saved);
		}
	};
	
	r.compareEndPoints = function (how, range) {
		var R;
		if (range && range.saved) range = range.getNative();
		
		if (r.domrange) {
			// Note that EndToStart and StartToEnd are reversed (to make compatible with ie order)
			R = window.Range;
			var howlookup = {"StartToStart": R.START_TO_START,
						"StartToEnd": R.END_TO_START,
						"EndToStart": R.START_TO_END,
						"EndToEnd": R.END_TO_END};				
			how = howlookup[how];
			return r.saved.compareBoundaryPoints(how, range);
		}
		else if (r.textrange) {
			return r.saved.compareEndPoints(how, range);
		}
	};
	
	r.isEqualTo = function (range) {
		if (range && range.saved) range = range.getNative();
		
		if (r.compareEndPoints("StartToStart", range) !== 0) return false;
		if (r.compareEndPoints("EndToEnd", range) !== 0) return false;
		
		return true;
	};
	
	r.getStartNode = function () {
		if (r.domrange) {
			return r.saved.startContainer;
		}
		else if (r.textrange) {
			var range = r.saved.duplicate();
			range.collapse(true);
			return range.parentElement();
		}
	};
	
	r.getEndNode = function () {
		if (r.domrange) {
			return r.saved.endContainer;
		}
		else if (r.textrange) {
			var range = r.saved.duplicate();
			range.collapse(false);
			return range.parentElement();
		}
	};
	
	r.getParentNode = function () {
		if (r.domrange) {
			return r.saved.commonAncestorContainer;
		}
		else if (r.textrange) {
			return r.saved.parentElement();
		}
	};
	
	r.getStartElement = function () {
		return r.util.getParentElement( r.getStartNode() );
	};
	
	r.getEndElement = function () {
		return r.util.getParentElement( r.getEndNode() );
	};
	
	r.getParentElement = function () {
		if (r.domrange) {
			return r.util.getParentElement( r.saved.commonAncestorContainer);
		}
		else if (r.textrange) {
			return r.saved.parentElement();
		}
	};


	/* Clone Function */
	
	r.clone = function () {
		var r2 = lasso();
		if(r.domrange) {
			r2.saved = r.saved.cloneRange();
		}
		else if (r.textrange) {
			r2.saved = r.saved.duplicate();
		}
		r2.bookmark = r.cloneBookmark();
		return r2;
	};
	
	/* Save and Restore Functions (save to DOM) */
	
	r.saveToDOM = function (id) {
		var start, end, smark, emark, collapsed;
		if (!id) id = "lasso";
		
		r.removeDOMmarkers(id);
		
		collapsed = r.isCollapsed();
		
		start = r.clone().collapseToStart().getNative();
		if (!collapsed) end = r.clone().collapseToEnd().getNative();
		
		if (r.domrange) {
			smark = document.createElement("span");
			smark.innerHTML = "&#x200b";
			smark.id = id + "_range_start";
			start.insertNode(smark);
			if (!collapsed) {
				emark = document.createElement("span");
				emark.innerHTML = "&#x200b";
				emark.id = id + "_range_end";
				end.insertNode(emark);
			}
		}
		else if (r.textrange) {
			start.pasteHTML("<span id=\"" + id + "_range_start\">&#x200b;</span>");
			if (!collapsed) {
				end.pasteHTML("<span id=\"" + id + "_range_end\">&#x200b;</span>");
			}
		}
		
		// Restore in case selection is lost by changing DOM above
		r = r.restoreFromDOM(id, false) || r.reset();
		
		return r;
	};
	
	r.restoreFromDOM = function (id, removemarkers) {
		var start, end, smark, emark;
		if (!id || id === "" || id === true || id === false) id = "lasso";
		if (id === true) removemarkers = true;
		
		smark = document.getElementById(id + "_range_start");
		emark = document.getElementById(id + "_range_end");

		if (!smark) return false;
		
		start = lasso().actualSelectNode(smark).collapseToEnd();
		if (removemarkers !== false) smark.parentNode.removeChild(smark);
		
		if (emark) {
			end= lasso().actualSelectNode(emark).collapseToStart();
			if (removemarkers !== false) emark.parentNode.removeChild(emark);
		}
		else {
			end = start;
		}
		
		r = lasso().setStartToRangeStart(start).setEndToRangeEnd(end);
		
		return r;
	};
	
	r.isSavedRange = function (id) {
		if (!id) id = "lasso";
		
		return (document.getElementById(id + "_range_start")) ? true : false;
	};
	
	r.removeDOMmarkers = function (id) {
		var smark, emark;
		if (!id) id = "lasso";
		
		smark = document.getElementById(id + "_range_start");
		emark = document.getElementById(id + "_range_end");
		
		if (smark) smark.parentNode.removeChild(smark);
		if (emark) emark.parentNode.removeChild(emark);
	};
	
	
	/* More save and restore functions (save reference from root node) */
	
	r.bookmarkify = function (rootnode) {
		if (r.domrange) {
			var node, startnodeoffsets, endnodeoffsets, b = {};
			if (!rootnode || !rootnode.nodeType) return r;
			
			// Save start and end offset to bookmark
			b.startoffset = r.saved.startOffset;
			b.endoffset = r.saved.endOffset;
			
			// Get start node offset path relative to rootnode
			startnodeoffsets = [];
			node = r.saved.startContainer;
			while (node !== rootnode) {
				startnodeoffsets.unshift(r.util.getNodeOffset(node));
				node = node.parentNode;
				if (node === null) return r;
			}
			
			// Get end node offset path relative to rootnode
			endnodeoffsets = [];
			node = r.saved.endContainer;	
			while (node !== rootnode) {
				endnodeoffsets.unshift(r.util.getNodeOffset(node));
				node = node.parentNode;
				if (node === null) return r;
			}
			
			// Save paths to bookmark
			b.startnodeoffsets = startnodeoffsets.join("-");
			b.endnodeoffsets = endnodeoffsets.join("-");
			
			// Save rootnode to bookmark (used to show that bookmark exists)
			b.rootnode = rootnode;
			
			r.bookmark = b;
		}
		else if (r.textrange) {
			r.bookmark = r.saved.getBookmark();
		}
		return r;
	};
		
	r.unbookmarkify = function (rootnode) {
		var bookmark = r.bookmark;
		if (r.domrange) {
			var node, offset, startnodeoffsets, endnodeoffsets, startcontainer, endcontainer;
			if (!bookmark.rootnode || !rootnode) return r.setToEmpty();
			
			node = rootnode;
			startnodeoffsets = bookmark.startnodeoffsets.split("-");
			while (startnodeoffsets.length > 0) {
				offset = startnodeoffsets.shift();
				if (!node.childNodes || !node.childNodes[offset]) return r.setToEmpty();
				node = node.childNodes[offset];
			}
			startcontainer = node;
			
			node = rootnode;
			endnodeoffsets = bookmark.endnodeoffsets.split("-");
			while (endnodeoffsets.length > 0) {
				offset = endnodeoffsets.shift();
				if (!node.childNodes || !node.childNodes[offset]) return r.setToEmpty();
				node = node.childNodes[offset];
			}
			endcontainer = node;
			
			r.setToEmpty();
			r.saved.setStart(startcontainer, bookmark.startoffset);
			r.saved.setEnd(endcontainer, bookmark.endoffset);
		}
		else if (r.textrange) {
			if (r.bookmark) {
				r.reset().saved.moveToBookmark(bookmark);
				r.bookmarkify();
			}
		}
		return r;
	};
	
	r.clearBookmark = function () {
		r.bookmark = false;
		return r;
	};
	
	r.cloneBookmark = function (bookmark) {
		if (!bookmark) bookmark = r.bookmark;
		if (r.domrange) {
			return !bookmark ? false : {
				"rootnode": bookmark.rootnode,
				"startnodeoffsets": bookmark.startnodeoffsets,
				"endnodeoffsets": bookmark.endnodeoffsets,
				"startoffset": bookmark.startoffset,
				"endoffset": bookmark.endoffset
			};
		}
		else if (r.textrange) {
			if (!bookmark) return false;
			var r2 = lasso().getNative();
			return r2.moveToBookmark(bookmark) ? r2.getBookmark() : false;
		}
	};
	
	/* Inspection and debugging functions */
	
	r.inspect = function (logid) {
		console.log({
			logid: logid ? logid : "",
			startelement: r.getStartElement(),
			startnode: r.getStartNode(),
			endelement: r.getEndElement(),
			endnode: r.getEndNode(),
			text: r.getText(),
			html: r.getHTML(),
			parent: r.getParentNode()
		});
	};
	
	/* Utility, 'non-public' functions, used by other functions */
	
	r.util = { //Used only for next two functions (getStartElement and getEndElement)
		getParentElement: function (node) {
			if (node.nodeType !== 1) {
				while (node.nodeType !== 1) {
					node = node.parentNode;
					if (node === null) return null;
				}
			}
			return node;
		},
		
		getNodeOffset: function (node) {
			if (!node || !node.parentNode) return;
			var offset = 0;
			while (node.parentNode.childNodes[offset] !== node) {
				offset += 1;
			}
			return offset;
		}
	};
	
	r.init();
	return r;
};
(function(window, undefined) {
	// Create ghostedit object and global variables
	var _ghostedit = {
		version: "1.0pre",
		enabledplugins: [],
		ready: false,
		active: false,
		isEditing: true,
		blockElemId: 0,
		editorchrome: null,
		debug: false
	};
	
	// Empty object for references to any elements which need to be globally accesable to be stored on
	_ghostedit.el = {};
	
	// Empty api object for plugins and init functions to add to
	_ghostedit.api = {};
	
	// Empty object for plugins to be stored in
	_ghostedit.plugins = {};
	
	// Add the ghostedit object to the global namespace
	window.ghostedit = _ghostedit;
})(window);
(function(window, undefined) {
	window.ghostedit.init = function (source, options) {
		if (typeof source === "string") source = document.getElementById(source);
		var i, handler,
		ghostedit = window.ghostedit, 
		rootnode, uilayer, htmlelem;
		
		// Set up user options
		ghostedit.options = {};
		ghostedit.options = options || {};
		
		// Check for debug option (but only enable if log module exists)
		if (ghostedit.options.debug) {
			ghostedit.debug = true;
		}
		
		// Detect whether we need to add extra br's to work around firefox's bugs (also used for webkit and opera)
		ghostedit.browserEngine = ghostedit.util.detectEngines();
		ghostedit.useMozBr = (ghostedit.browserEngine.gecko !== 0 || ghostedit.browserEngine.webkit !== 0 || ghostedit.browserEngine.opera !== 0);
		
		//Hide div containing original content
		source.style.display = 'none';
		ghostedit.el.source = source;
		
		// Create contextual ui layer
		uilayer = document.createElement("div");
		uilayer.id = "ghostedit_uilayer";
		uilayer.className = "ghostedit_uilayer";
		uilayer.innerHTML = "<span style='position: absolute; display: none;left: 0; top: 0;line-height: 0'>ie bug fix</span>";
		source.parentNode.insertBefore(uilayer, source);
		ghostedit.el.uilayer = uilayer;
		
		// Run init events for core modules
		ghostedit.history.init();
		ghostedit.inout.init();
		ghostedit.clipboard.init();
		
		// Enable plugins
		ghostedit.options.plugins = ghostedit.options.plugins || [];
		ghostedit.options.plugins.unshift("container", "textblock");
		if (ghostedit.options.plugins) {
			for (i = 0; i < ghostedit.options.plugins.length; i++) {
				ghostedit.api.plugin.enable(ghostedit.options.plugins[i]);
			}
		}
		
		// Send init event to plugins (and core modules)
		ghostedit.event.trigger("init");
		
		// Import initial content
		rootnode = ghostedit.inout.importHTML(source);
		source.parentNode.insertBefore(rootnode, source);
		ghostedit.el.rootnode = rootnode;
		
		// Focus the editor
		handler = rootnode.getAttribute("data-ghostedit-handler");
		ghostedit.plugins[handler].focus(rootnode);
		
		// Make sure that FF uses tags not CSS, and doesn't show resize handles on images
		try{document.execCommand("styleWithCSS", false, false);} catch(err){}//makes FF use tags for contenteditable
		try{document.execCommand("enableObjectResizing", false, false);} catch(err){}//stops resize handles being resizeable in FF
		
		// Save selection & setup undo
		ghostedit.selection.save();
		ghostedit.history.reset();
		ghostedit.history.saveUndoState();
		
		// Attach event handlers to html element
		htmlelem = document.getElementsByTagName("html")[0];
		ghostedit.util.addEvent(htmlelem, "dragenter", ghostedit.util.cancelEvent);
		ghostedit.util.addEvent(htmlelem, "dragleave", ghostedit.util.cancelEvent);
		ghostedit.util.addEvent(htmlelem, "dragover", ghostedit.util.cancelEvent);
		ghostedit.util.addEvent(htmlelem, "drop", ghostedit.util.cancelEvent);
		
		// Attach handlers to rootnode
		ghostedit.util.addEvent(rootnode, "click", ghostedit.selection.save);
		ghostedit.util.addEvent(rootnode, "mouseup", ghostedit.selection.save);
		ghostedit.util.addEvent(rootnode, "keyup", ghostedit.selection.save);
		ghostedit.util.addEvent(rootnode, "keydown", function (event) {ghostedit.event.keydown(this, event); });
		ghostedit.util.addEvent(rootnode, "keypress", function (event) {ghostedit.event.keypress(this, event); });
		ghostedit.util.addEvent(rootnode, "dragenter", ghostedit.util.cancelEvent);
		ghostedit.util.addEvent(rootnode, "dragleave", ghostedit.util.cancelEvent);
		ghostedit.util.addEvent(rootnode, "dragover", ghostedit.util.cancelEvent);
		ghostedit.util.addEvent(rootnode, "drop", ghostedit.util.cancelEvent);
		
		// Focus rootnode
		rootnode.focus();
		ghostedit.plugins.container.focus(rootnode);
		
		ghostedit.ready = true;
		ghostedit.event.trigger("init:after");
	};
})(window);
(function (window, undefined) {

	var _plugins = {},
	ghostedit = window.ghostedit;
	
	_plugins.register = function(name, object) {
		if (ghostedit.plugins[name]) return false;
		
		ghostedit.plugins[name] = object;
		
		return true;
	};
	
	_plugins.enable = function (name) {
		if (!ghostedit.plugins[name]) return false;
		if (ghostedit.enabledplugins[name]) _plugins.disable(name);
		
		var plugin = ghostedit.plugins[name];
		if (typeof(plugin.enable) === "function") {
			plugin.enable();
		}
		ghostedit.enabledplugins[name] = true;
	};
	
	_plugins.disable = function (name) {
		if (!ghostedit.enabledplugins[name] || !ghostedit.plugins[name]) return false;
		
		var plugin = ghostedit.plugins[name];
		if (typeof(plugin.disable) === "function") {
			plugin.disable();
		}
		ghostedit.enabledplugins[name] = false;
	};
	
	window.ghostedit.api.plugin = _plugins;
})(window);
(function (window, undefined) {
		
		var _util = {};
		
		_util.trim = function (string) {
			return string.replace(/^\s+/, "").replace(/\s+$/, "");
		};
		
		// This will call a function using a reference with predefined arguments.
		//SECOND ARGUMENT = CONTEXT (this) - should usually be false
		_util.preparefunction = function (func, context /*, 0..n args */) {
			var args = Array.prototype.slice.call(arguments, 2);
			return function() {
				var allArguments = args.concat(Array.prototype.slice.call(arguments));
				return func.apply(context ? context : this, allArguments);
			};
		};
		
		_util.isFunction = function (variable) {
			if (!variable) return false;
			if (typeof variable !== "function") return false;
			return true;
		};
		
		_util.cloneObject = function (obj) {
			var copy, len, i, attr;
			// Handle the 3 simple types, and null or undefined
			if (null === obj || "object" !== typeof obj) return obj;
			
			// Handle Date
			if (obj instanceof Date) {
				copy = new Date();
				copy.setTime(obj.getTime());
				return copy;
			}
			
			// Handle Array
			if (obj instanceof Array) {
				copy = [];
				for (i = 0, len = obj.length; i < len; ++i) {
					copy[i] = _util.cloneObject(obj[i]);
				}
				return copy;
			}
			
			// Handle Object
			if (obj instanceof Object) {
				copy = {};
				for (attr in obj) {
					if (obj.hasOwnProperty(attr)) copy[attr] = _util.cloneObject(obj[attr]);
				}
				return copy;
			}
		};
		
		_util.addClass = function (elem, c) {
			elem.className = _util.trim(elem.className) + " " + c;
		};
		
		_util.removeClass = function (elem, c) {
			var r = new RegExp(c,"g");
			elem.className = _util.trim(elem.className.replace(r, ""));
		};
		
		_util.cancelEvent = function (e) {
			if (e && e.preventDefault) {
				e.stopPropagation(); // DOM style (return false doesn't always work in FF)
				e.preventDefault();
			}
			else if (e) {
				e.returnValue = false;
			}
			return false; // false = IE style
		};
		
		_util.cancelAllEvents = function (e) {
			if (e && e.preventDefault) {
				e.stopPropagation(); // DOM style (return false doesn't always work in FF)
				e.preventDefault();
			}
			else if (window.event) {
				window.event.cancelBubble = true; //IE cancel bubble;
			}
			return false; // false = IE style
		};
		
		_util.preventDefault = function (e) {
			// Standards based browsers
			if (e && e.preventDefault) {
				e.preventDefault();
			}
			// ie <= 8
			return false;
		};
		
		_util.preventBubble = function (e) {
			// Standards based browsers
			if (e && e.stopPropagation) {
				e.stopPropagation();
			}
			// ie <= 8
			if (window.event) window.event.cancelBubble = true;
		};
		
		_util.addEvent = function (elem, eventType, handle) {
			if (elem.addEventListener !== undefined) {
				elem.addEventListener(eventType, handle, false);
			}
			else {
				elem.attachEvent("on" + eventType, handle);
			}
		};
		
		_util.removeEvent = function (elem, eventType, handle) {
			if (elem.removeEventListener !== undefined) {
				elem.removeEventListener(eventType, handle, false);
			}
			else {
				elem.detachEvent("on" + eventType, handle);
			}
		};
		
		_util.ajax = function (URL, method, params, sHandle, dataType) {
			var time, connector, xhr;
			
			if (!URL || !method) return false;
			
			// Get XHR object
			xhr = false;
			if(window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject)) {
				xhr = new window.XMLHttpRequest();
			}
			else {
				try { xhr = new window.ActiveXObject("Microsoft.XMLHTTP"); }
				catch (e) { try { xhr = new window.ActiveXObject("MSXML2.XMLHTTP"); } catch (e2) {} }
			}
			if (!xhr) return false;
			
			// Prepare variables
			method = method.toUpperCase();
			time = new Date().getTime();
			URL = URL.replace(/(\?)+$/, "");
			connector = (URL.indexOf('?') === -1) ? "?" : "&";
			//connector = (URL.indexOf('?') === URL.length - 1) ? "" : "&";

			// Open ajax Request
			if (method === "GET") {
				xhr.open(method, URL + connector + time + "&" + params, true);
			}
			else {
				xhr.open(method, URL + connector + time, true);
			}
			
			// Define function to handle response
			xhr.onreadystatechange = function () {
				var responseData;
				if(xhr.readyState === 4) {
					if(xhr.status === 200) {
						responseData = (dataType === "xml") ? xhr.responseXML : xhr.responseText;
						if (sHandle !== null){ sHandle(true, responseData); }
						return true;
					}
					else{
						if (sHandle !== null){ sHandle(false, responseData); }
						return false;
					}
				}
			};
			
			// Set HTTP headers
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			//xhr.setRequestHeader("Content-length", params.length);
			//xhr.setRequestHeader("Connection", "close");
			
			// Send ajax request
			if (method === "POST" && params !== null) {
				xhr.send(params);
			}
			else {
				xhr.send();
			}
		};
		
		_util.detectEngines = function() {
		
			//rendering engines
			var engine = {ie: 0, gecko: 0, webkit: 0, khtml: 0, opera: 0, ver: null};
			
			// Detect rendering engines/browsers
			var ua = navigator.userAgent;
			if (window.opera){
				engine.ver = window.opera.version();
				engine.opera = parseFloat(engine.ver);
			} else if (/AppleWebKit\/(\S+)/.test(ua)){
				engine.ver = RegExp.$1;
				engine.webkit = parseFloat(engine.ver);
			} else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)){
				engine.ver = RegExp.$1;
				engine.khtml = parseFloat(engine.ver);
			} else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)){
				engine.ver = RegExp.$1;
				engine.gecko = parseFloat(engine.ver);
			} else if (/MSIE ([^;]+)/.test(ua)){
				engine.ver = RegExp.$1;
				engine.ie = parseFloat(engine.ver);
			}
			
			//return it
			return engine;
		
		};
		
		window.ghostedit.util = _util;
})(window);
(function(window, undefined) {
	
	var _event = {
		listeners: [],
		listenerid: 0,
		eventtypes: [],
		cancelKeypress: false //allows onkeypress event to be cancelled from onkeydown event.
	},
	ghostedit = window.ghostedit;
	
	// Used to capture non-repeating keyboard event (also, non-printing keys don't fire onkeypress in most browsers)
	_event.keydown = function (elem, e) {
		var keycode, ghostblock, handler, handled;
		ghostedit.selection.save(false);
		
		e = !(e && e.istest) && window.event ? window.event : e;
		keycode = e.keyCode !== null ? e.keyCode : e.charCode;
		
		_event.trigger("input:keydown", {"event": e, "keycode": keycode});
		
		// Global shortcuts
		switch(keycode) {
			case 8: //backspace
			case 46: // delete key
				_event.cancelKeypress = false;
				if(ghostedit.selection.savedRange.isCollapsed() === false) {
					ghostedit.history.saveUndoState();
					
					ghostedit.selection.deleteContents( (keycode === 8) ? "collapsetostart" : "collapsetoend" );
					
					ghostedit.history.saveUndoState();
					_event.cancelKeypress = true;//otherwise opera fires default backspace event onkeyPRESS (not onkeyDOWN)
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 83: //ctrl-s
				if (e.ctrlKey){
					ghostedit.api.save();
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 66: //ctrl-b
				if (e.ctrlKey) {
					ghostedit.plugins.textblock.format.bold ();
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 73: //ctrl-i
				if (e.ctrlKey && !e.shiftKey) {
					ghostedit.plugins.textblock.format.italic ();
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 85: //ctrl-u
				if (e.ctrlKey) {
					ghostedit.plugins.textblock.format.underline ();
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 90: //ctrl-z
				if (e.ctrlKey) {
					ghostedit.history.undo ();
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 89: //ctrl-y
				if (e.ctrlKey) {
					ghostedit.history.redo ();
					return ghostedit.util.cancelEvent ( e );
				}
			break;
		}
		
		// If not handled by one of above, pass to plugin keydown handlers
		ghostblock = ghostedit.selection.getContainingGhostBlock();
		while (true) {
			// If plugin for the GhostBlock containing the selection has an 'event.keydown' function, call it
			handler = ghostblock.getAttribute("data-ghostedit-handler");
			if (ghostedit.plugins[handler] && ghostedit.plugins[handler].event && ghostedit.plugins[handler].event.keydown) {
				handled = ghostedit.plugins[handler].event.keydown(ghostblock, keycode, e);
				if (handled === true) break;
			}
			
			// If above GhostBlock doesn't handle the keypress, send event to it's parent
			ghostblock = ghostedit.dom.getParentGhostBlock(ghostblock);
			if (!ghostblock) break;
		}
		
		ghostedit.selection.save();
		return true;
	};

	_event.keypress = function (elem, e) {
		var keycode, ghostblock, handler, handled, currentDocLen, savedDocLen;
		ghostedit.selection.save();
		
		currentDocLen = ghostedit.el.rootnode.innerHTML.length;
		savedDocLen = ghostedit.history.undoData[ghostedit.history.undoPoint] !== undefined ? ghostedit.history.undoData[ghostedit.history.undoPoint].content.string.length : 0;
		//if (currentDocLen - savedDocLen >= 20 || savedDocLen - currentDocLen >= 20) ghostedit.history.saveUndoState();
		
		e = !(e && e.istest) && window.event ? window.event : e;
		keycode = e.keyCode !== null ? e.keyCode : e.charCode;
		
		_event.trigger("input:keydown", {"event": e, "keycode": keycode});
		
		if (ghostedit.selection.saved.type !== "none" && !ghostedit.selection.savedRange.isCollapsed() && !e.ctrlKey) {
			ghostedit.selection.deleteContents("collapsetostart");
		}
		
		
		// Global keyevents
		switch(keycode) {
			case 8: //cancel backspace event in opera if cancelKeypress = true
				if (_event.cancelKeypress === true) {
					_event.cancelKeypress = false;
					return ghostedit.util.cancelEvent ( e );
				}
			break;
			case 13: // Enter (don't allow default action for enter to happen)
				ghostedit.util.cancelEvent ( e );
			break;
		}
		
		// If not handled by one of above, pass to plugin keypress handlers
		ghostblock = ghostedit.selection.getContainingGhostBlock();
		while (true) {
			// If plugin for the GhostBlock containing the selection has an 'event.keypress' function, call it
			handler = ghostblock.getAttribute("data-ghostedit-handler");
			if (ghostedit.plugins[handler] && ghostedit.plugins[handler].event && ghostedit.plugins[handler].event.keypress) {
				handled = ghostedit.plugins[handler].event.keypress(ghostblock, keycode, e);
				if (handled === true) break;
			}
			
			// If above GhostBlock doesn't handle the keypress, send event to it's parent
			ghostblock = ghostedit.dom.getParentGhostBlock(ghostblock);
			if (!ghostblock) break;
		}
		
		
		ghostedit.selection.save();
		return true;
	};

	_event.addListener = function (event, callback, revokekey) {
		var listeners, eventtypes, isnewevent, i;
		if (typeof(callback) !== "function") return false;
		
		// Check if array for that event needs to be created
		listeners = _event.listeners;
		if (!listeners[event] || typeof(listeners[event]) !== "object" || !(listeners[event] instanceof Array)) {
			listeners[event] = [];
		}
		
		// Add event to list of events
		eventtypes = _event.eventtypes;
		isnewevent = true;
		for (i = 0; i < eventtypes.length; i++) {
			if (eventtypes[i] === event) {
				isnewevent = false;
				break;
			}
		}
		if (isnewevent) eventtypes.push(event);
		
		_event.listenerid++;
		listeners[event].push({"id": _event.listenerid, "callback": callback, "revokekey": revokekey});
		return _event.listenerid;
	};

	_event.removeListener = function (event, listenerid) {
		var listeners = _event.listeners, i, newlist = [];
		
		if(!listeners[event]) return;
		
		for (i = 0; i < listeners[event].length; i++) {
			if (listeners[event].id !== listenerid) {
				newlist.push(listeners[event][i]);
			}
		}
		
		listeners[event] = newlist;
	};

	_event.removeAllListeners = function (revokekey) {
		var listeners, eventtypes, event, i, j, newlist = [];
		if(!revokekey) return;
		
		listeners = _event.listeners;
		eventtypes = _event.eventtypes;
		
		for (i = 0; i < eventtypes.length; i++) {
			event = eventtypes[i];
			for (j = 0; j < listeners[event].length; j++) {
				if(!listeners[event][j].revokekey || listeners[event][j].revokekey !== revokekey) {
					newlist.push(listeners[event][j]);
				}
			}
			listeners[event] = ghostedit.util.cloneObject(newlist);
			newlist = [];
		}
	};

	_event.trigger = function (event, params) {
		var listeners = _event.listeners, i;
		if (params === undefined) params = {};
		if (!listeners[event] || typeof(listeners[event]) !== "object" || !(listeners[event] instanceof Array)) return;
		
		if (ghostedit.debug) {
			window.console.log(event);
			window.console.log(params);
		}
		
		for (i = 0; i < listeners[event].length; i++) {
			listeners[event][i].callback.call(this, params);
		}
	};

	_event.sendBackwards = function (eventtype, source, params) {
		var target = false, tracker, result, direction;
		if (!params) params = {};
		if (!ghostedit.dom.isGhostBlock(source)) return false;
		
		tracker = source; //tracks currently tried targets
		
		while(true) {
			
			if ((target = ghostedit.dom.getPreviousSiblingGhostBlock(tracker))) {
				direction = "ahead";
			}
			else if ((target = ghostedit.dom.getParentGhostBlock(tracker))) {
				direction = "top";
			}
			
			result = _event.send (eventtype, target, direction, params);
			if (!result) return false;
			else if (result.handled === true) return true;
			
			tracker = target;
		}
	};

	_event.sendForwards = function (eventtype, source, params) {
		var target = false, tracker, result, direction;
		if (!params) params = {};
		if (!ghostedit.dom.isGhostBlock(source)) return false;
		
		tracker = source; //tracks currently tried targets
		
		while(true) {
			
			if ((target = ghostedit.dom.getNextSiblingGhostBlock(tracker))) {
				direction = "behind";
			}
			else if ((target = ghostedit.dom.getParentGhostBlock(tracker))) {
				direction = "bottom";
			}
			
			result = _event.send (eventtype, target, direction, params);
			if (!result) return false;
			else if (result.handled === true) return true;
			
			tracker = target;
		}
	};

	_event.send = function (eventtype, target, fromdirection, params) {
		var handler, handled;

		if (!target) return false; // = no previous/next GhostBlock

		handler = target.getAttribute("data-ghostedit-handler");
		if (!ghostedit.plugins[handler] || !ghostedit.plugins[handler].dom || !ghostedit.plugins[handler].dom.deleteevent) {
			return {"handled": false}; // = no handler for this elemtype
		}
		
		handled = ghostedit.plugins[handler].dom.deleteevent (target, fromdirection, params);

		return {"handled": handled};
		
	};
	
	window.ghostedit.event = _event;
})(window);
(function(window, undefined) {
	
	var _dom = {};
	
	_dom.getNodeOffset = function (node) {
		var offset, nodelist;
		
		if (!node || !node.parentNode) return;
		
		offset = 0;
		nodelist = node.parentNode.childNodes;
		
		while (nodelist[offset] !== node) {
			offset += 1;
		}
		return offset;
	};

	_dom.extractContent = function (node) {
		var frag = document.createDocumentFragment(), child;
		while ( (child = node.firstChild) ) {
			frag.appendChild(child);
		}
		return frag;
	};

	_dom.cloneContent = function (node) {
		var child, i, frag = document.createDocumentFragment();
		for (i = 0; i < node.childNodes.length; i++) {
			child = node.childNodes[i];
			frag.appendChild(child.cloneNode(true));
		}
		return frag;
	};

	_dom.parse = function (node, rules) {
		var parsednode = false, nodes, parsedchild, i, j, value, text, tagname, tagrules, attribute, style;
		if (!node || !rules || !node.nodeType) return false;
		
		rules.textnode = rules.textnode || {};
		rules.tags = rules.tags || {};
		
		// Handle textnodes
		if (node.nodeType === 3) {
			text = (rules.textnode.clean) ? node.nodeValue.replace(/[\n\r\t]/g,"") : node.nodeValue;
			return (text.length > 0) ? document.createTextNode(text) : false;
		}
		
		// Handle not-element case (textnodes already handled)
		if (node.nodeType !== 1) return false;
		
		// Get rules for tag, if none default to content only
		tagname = node.tagName.toLowerCase();
		tagrules = {"contentsonly": true};
		if (rules.tags[tagname]) {
			tagrules = rules.tags[tagname];
			if (typeof tagrules.template === "string") tagrules = tagrules.template;
			if (typeof tagrules === "string" && rules.templates[tagrules]) tagrules = rules.templates[tagrules];
			if (typeof tagrules === "string") return false;
		}
		
		
		// If "contentsonly" flag set, create document fragment, else create element of same type as node
		parsednode = tagrules.contentsonly ? document.createDocumentFragment() : document.createElement(node.tagName.toLowerCase());
		
		// Unless "ignorechildren" flag set, recurse on children
		if (!tagrules.ignorechildren) {
			nodes = node.childNodes;
			for (i = 0; i < nodes.length; i++) {
				parsedchild = _dom.parse(nodes[i], rules);
				if (parsedchild) {
					parsednode.appendChild(parsedchild);
				}
			}
		}
		
		// Return here if contents only (no need to copy attributes if no node to copy to)
		if (tagrules.contentsonly) return (parsednode.childNodes.length > 0) ? parsednode : false;
		
		// If attributes specified, copy specified attributes
		if (tagrules.attributes) {
			for (i = 0; i < tagrules.attributes.length; i++) {
				attribute = tagrules.attributes[i];
				
				// Handle simple (no rules) case
				if (typeof attribute === "string") attribute = {"name": attribute};
				
				// Get value of attribute on source node
				if (typeof attribute.name !== "string") break;
				value  = attribute.value || (attribute.name === "class") ? node.className : node.getAttribute(attribute.name);
				if (value === undefined) break;
				attribute.copy = true;
				
				// If allowedvalues are specified, check if value is correct
				if (attribute.allowedvalues) {
					attribute.copy = false;
					for (j = 0; j < attribute.allowedvalues.length; j++) {
						if (attribute.allowedvalues[i] === value){
							attribute.copy = true;
							break;
						}
					}
				}
				
				// If all checks passed, set attribute on new node
				if (attribute.copy) {
					if (attribute.name === "class") {
						parsednode.className = value;
					}
					else {
						parsednode.setAttribute(attribute.name, value);
					}
				}
			}
		}
		
		
		// If styles specified, copy specified attributes
		if (tagrules.styles) {
			for (i = 0; i < tagrules.styles.length; i++) {
				style = tagrules.styles[i];
				
				// Handle simple (no rules) case
				if (typeof style === "string") style = {"name": style};
				
				// Get value of style on source node
				if (typeof style.name !== "string") break;
				if (style.name === "float") style.name = (node.style.cssFloat) ? "cssFloat" : "styleFloat";
				value  = style.value || node.style[style.name];
				if (value === undefined) break;
				style.copy = true;
				
				// If allowedvalues are specified, check if value is correct
				if (style.allowedvalues) {
					style.copy = false;
					for (j = 0; j < style.allowedvalues.length; j++) {
						if (style.allowedvalues[j] === value) {
							style.copy = true;
							break;
						}
					}
				}
				
				// If all checks passed, set style on new node
				if (style.copy) parsednode.style[style.name] = value;
			}
		}
		
		return parsednode;
	};

	_dom./*compareNodes = function (node1, node2) {
		var node;
		
		// If node1 is a documentFragment, wrap in an element
		if (n1.nodeType === 11) {
			node = document.createElement("div");
			node.appendChild(nodeOrFrag);
			node1 = node;
		}
		
		// If node2 is a documentFragment, wrap in an element
		if (n2.nodeType === 11) {
			node = document.createElement("div");
			node.appendChild(nodeOrFrag);
			node2 = node;
		}
		
		function getNextNode (nodelist, current) {
			
		}
		
		nodes1 = node1.getElementsByTagName(*);
		
		
	},*/
	
	isGhostBlock = function (node) {
		if (!node || !node.nodeType || node.nodeType !== 1) return false;
		
		var ghosttype = node.getAttribute("data-ghostedit-elemtype");
		
		return (ghosttype !== undefined && ghosttype !== false && ghosttype !== null) ? true : false; 
	};

	_dom.isChildGhostBlock = function (elem, parent) {
		var i;
		
		if (!elem || !parent || !parent.childNodes) return false;
		if (elem.nodeType !== 1) return false;
		if (elem.getAttribute("data-ghostedit-elemtype") === undefined) return false;
		if (elem.getAttribute("data-ghostedit-elemtype") === false) return false;
		if (elem.getAttribute("data-ghostedit-elemtype") === null) return false;
		var childblocks = parent.childNodes;
		for(i = 0; i < childblocks.length; i += 1) {
			if (elem === childblocks[i]) {
				return true;
			}
		}
		return false;
	};

	_dom.isGhostToplevel = function (node) {
		return (node && node.getAttribute("data-ghostedit-isrootnode") === true) ? true : false;
	};

	_dom.getParentGhostBlock = function (node) {
		
		if (!node) return false;
		
		do {
			node = node.parentNode;
			if (node === null) return false;
		}
		while (!_dom.isGhostBlock(node));
		
		return node;
	};

	_dom.getFirstChildGhostBlock = function (node) {
		var children, i;
		
		if (!node || !node.childNodes) return false;			
		
		// Otherwise, recurse forwards through DOM until first GhostBlock is found.
		children = node.childNodes;
		
		for (i = 0; i < children.length; i += 1) {
			if (_dom.isGhostBlock(children[i])) {
				return children[i];
			}
		}
		
		return false;
	};

	_dom.getLastChildGhostBlock = function (node) {
		var children, i;
		
		if (!node || !node.childNodes) return false;			
		
		// Otherwise, recurse backwards through DOM until previous GhostBlock is found.
		children = node.childNodes;
		
		for (i = children.length -1; i >= 0; i -= 1) {
			if (_dom.isGhostBlock(children[i])) {
				return children[i];
			}
		}
		
		return false;
	};

	_dom.getPreviousSiblingGhostBlock = function (node) {
		var parent, offset, siblings;
		
		if (!node || !node.parentNode) return false;			
		
		// Otherwise, recurse backwards through DOM until previous GhostBlock is found.
		parent = node.parentNode;
		offset = _dom.getNodeOffset (node) - 1;
		siblings = parent.childNodes;
		
		do {
			if (_dom.isGhostBlock(siblings[offset]) === true)  {
				return siblings[offset];
			}
			offset -= 1;
		}
		while (offset >= 0);
		
		return false;
	};

	_dom.getNextSiblingGhostBlock = function (node) {
		var parent, offset, siblings;
		
		if (!node || !node.parentNode) return false;			
		
		// Otherwise, recurse forwards through DOM until next GhostBlock is found.
		parent = node.parentNode;
		offset = _dom.getNodeOffset (node) + 1;
		siblings = parent.childNodes;
		
		do {
			if (_dom.isGhostBlock(siblings[offset]) === true)  {
				return siblings[offset];
			}
			offset += 1;
		}
		while (offset < siblings.length);
		
		return false;
	};

	_dom.getParentElement = function (node) {
		if (node.nodeType !== 1) {
			while (node.nodeType !== 1) {
				node = node.parentNode;
				if (node === null) return null;
			}
		}
		return node;
	};

	_dom.isDescendant = function (parent, child) {
		var node = child.parentNode;
		while (node !== null) {
			if (node === parent) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	};

	_dom.getFirstChildElement = function (node) {
		var children, i;
		
		if (!node || !node.childNodes) return false;			
		
		// Otherwise, recurse forwards through DOM until next element is found.
		children = node.childNodes;
		
		for (i = 0; i < children.length; i += 1) {
			if (children[i].nodeType === 1) {
				return children[i];
			}
		}
		
		return false;
	};

	_dom.getCertainParent = function (condition, elem) {
		var args = [].slice.call(arguments);
		args.shift();
		if (!condition.apply(this, args)) {
			while (!condition.apply(this, args)) {
				elem = elem.parentNode;
				args[0] = elem;
				if (elem === null) return false;
			}
		}
		return elem;
	};
	
	window.ghostedit.dom = _dom;
})(window);
(function(window, undefined) {
		
		var _selection = {
			savedRange: null,
			nodepath: [],
			saved: {type: "none", data: null},
			archived: {type: "none", data: null}
		},
		ghostedit = window.ghostedit,
		lasso = window.lasso;
		
		_selection.save = function (updateui) {
			var sel;
			if (updateui !== false) updateui = true;
			sel = lasso().setToSelection();
			
			if (!_selection.isInEditdiv(sel.getStartNode())) {
				_selection.saved.type = "none";
				return false;
			}
			else {
				//Save current selection to range
				_selection.saved.type = "textblock";
				_selection.saved.data = sel;//.bookmarkify(ghostedit.el.rootnode);
				
				// Save to legacy variable
				_selection.savedRange = _selection.saved.data;
				
				ghostedit.event.trigger("selection:change");
				
				_selection.updatePathInfo();
				if (updateui) ghostedit.event.trigger("ui:update");
				return true;
			}
		};
		
		_selection.set = function (type, data, updateui) {
			if (updateui !== false) updateui = true;
			if (typeof type !== "string") return;
			
			// Update selection variables
			_selection.saved.type = type;
			_selection.saved.data = data;
				
			// Save to legacy variable
			_selection.savedRange = _selection.saved.data;
			
			// Update path information
			_selection.updatePathInfo();
			
			// Send events
			ghostedit.event.trigger("selection:change");
			if (updateui) ghostedit.event.trigger("ui:update");
			return true;
		};
		
		_selection.restore = function (type, data, mustbevalid) {
			if (!type || typeof type !== "string") type = _selection.saved.type;
			if (!data) data = _selection.saved.data;
			
			// if type is none, but cant be, get archived selection
			if (type === "none" && mustbevalid) {
				type = _selection.archived.type;
				data = _selection.archived.data;
			} 
			
			// If type is none, clear selection
			if (type === "none") {
				_selection.clear();
				return true;
			}
			
			// Else, call restore function from appropriate plugin
			if (ghostedit.plugins[type] && ghostedit.plugins[type].selection.restore) {
				if (ghostedit.plugins[type].selection.restore(data)) {
					return true;
				}
				else {
					_selection.clear();
					return false;
				}
			}
		};
		
		_selection.restoreValid = function (type, data) {
			return _selection.restore(type, data, true);
		};
		
		_selection.deleteContents = function (collapse) {
			if (collapse !== "collapsetostart" && collapse !== "collapsetoend") collapse = false;
			var handler, handled, ghostblock;
			
			ghostblock = _selection.getContainingGhostBlock();
			
			while (true) {
				handler = ghostblock.getAttribute("data-ghostedit-handler");
				handled = ghostedit.plugins[handler].selection.deleteContents(ghostblock, collapse);
				if (handled === true) break;
				
				ghostblock = ghostedit.dom.getParentGhostBlock(ghostblock);
				if (!ghostblock) break;
			}
						
			switch (collapse) {
				case "collapsetostart":
					lasso().setToSelection().collapseToStart().select();
				break;
				case "collapsetoend":
					lasso().setToSelection().collapseToEnd().select();
				break;
			}
			
			_selection.save();
		};
		
		_selection.isSameAs = function (sel) {
			if (!sel || !sel.type) return false;
			
			if (sel.type !== _selection.saved.type) return false;
			
			if (sel.type === "none") return true;
			// Else, call compare function from appropriate plugin
			if (ghostedit.plugins[sel.type] && ghostedit.plugins[sel.type].selection.compare) {
				return ghostedit.plugins[sel.type].selection.compare (sel.data, _selection.saved.data);
			}
			return false;
		};
		
		_selection.clear = function () {
			lasso().clearSelection();
			_selection.saved = {"type": "none", "data": null};
		};
		
		_selection.isInEditdiv = function (elem) {
			if (elem.nodeType !== 1 || elem.getAttribute("data-ghostedit-isrootnode") !== "true") {
				while (elem.nodeType !== 1 || elem.getAttribute("data-ghostedit-isrootnode") !== "true") {
					if (elem === null) return false;
					elem = elem.parentNode;
					if (elem === null) return false;
				}
			}
			return true;
		};
		
		_selection.updatePathInfo = function (elem) {
			if (!elem) elem = _selection.saved.data;
			if (!elem.nodeType) elem = elem.getParentNode();
			
			// If nodepath is same as before, don't bother calculating it again
			// below code DOES NOT equal above statement. (dom node can have moved)
			//if (elem === _selection.nodepath[0]) return true;
			
			_selection.nodepath = [];
			
			if (elem.nodeType !== 1 || elem.getAttribute("data-ghostedit-isrootnode") !== "true") {
				while (elem.nodeType !== 1 || elem.getAttribute("data-ghostedit-isrootnode") !== "true") {
					
					if (elem === null) return null;
					
					if (elem.nodeType === 1) _selection.nodepath.push(elem);
					
					elem = elem.parentNode;
					
					if (elem === null) return false;
				}
			}
			
			// Make sure rootnode is also included in path
			if (elem && elem.getAttribute("data-ghostedit-isrootnode") === "true") {
				_selection.nodepath.push(elem);
			}
		};
		
		_selection.getContainingGhostBlock = function () {
			var node = _selection.saved.data;
			if (!node.nodeType) node = node.getParentNode();

			if (!node) return false;

			while (!ghostedit.dom.isGhostBlock(node)) {
				node = node.parentNode;
				if (node === null) return false;
			}
			
			return node;
		};
		
		window.ghostedit.selection = _selection;
})(window);
(function(window, undefined) {
	
	var _inout = {},
	ghostedit = window.ghostedit;
	
	_inout.init = function () {
		// Set initial variables
		_inout.reset();
		
		// Add listener to check whether the selection has changed since the last undo save
		ghostedit.event.addListener("selection:change", function () { ghostedit.history.selectionchanged = true; });
		
		// Export undo and redo function to the api
		ghostedit.api.importHTML = function (source) { return _inout.importHTML(source); };
		ghostedit.api.exportHTML = function () { return _inout.exportHTML(); };
	};
	
	_inout.reset = function () {
		_inout.importhandlers = [];
	};
	
	_inout.importHTML = function (sourcenode) {
		var /*tagname, handler, result*/ rootnode;
		if (!sourcenode || sourcenode.childNodes.length < 1) return false;
		
		/*var tagname = sourcenode.tagName.toLowerCase();
		if (handler = _inout.importhandlers[tagname]) {
			result = ghostedit.plugins[handler].inout.importHTML(insertedelem, elem)
			if (result) insertedelem = result;
		}*/
		
		// Call container import, and set resulting domnode's contenteditable to true
		rootnode = ghostedit.plugins.container.inout.importHTML(sourcenode);
		rootnode.className = "ghostedit_rootnode";
		rootnode.setAttribute("data-ghostedit-isrootnode", "true");
		rootnode.contentEditable = 'true';
		
		// Trigger 'import:after' event
		ghostedit.event.trigger("import:after", {"rootnode": rootnode});
		
		// Return rootnode container
		return rootnode;
	};
	
	_inout.exportHTML = function () {
		var finalexport,
		editwrap = ghostedit.el.rootnode;
		
		ghostedit.event.trigger("export:before");
		
		//Preparation - contenteditable = false
		editwrap.contentEditable = false;
		
		finalexport = ghostedit.plugins.container.inout.exportHTML(editwrap, false);
		
		//Tidy up - contenteditable = true
		editwrap.contentEditable = true;
		
		ghostedit.event.trigger("export:after");
		
		return finalexport; //{snippet: snippet, full: finalCode};
	};

	_inout.openPreview = function () {
		window.open(ghostedit.options.previewurl);
	};
	
	_inout.registerimporthandler = function (importhandler/*, tagnames of elements that can be handled*/) {
		var i, args, tag;
		if (typeof importhandler !== "function") return false;
		if (arguments.length < 2) return false;
		args = Array.prototype.slice.call(arguments);
		args.shift();
		
		// Loop through arguments
		for (i = 0; i < args.length; i++) {
			tag = args[i];
			
			_inout.importhandlers[tag] = importhandler;
		}
	};
	
	window.ghostedit.inout = _inout;
})(window);
(function(window, undefined) {
	
	var _history = {},
	ghostedit = window.ghostedit;
	
	_history.init = function () {
		// Set initial variables
		_history.reset();
		
		// Add listener to check whether the selection has changed since the last undo save
		ghostedit.event.addListener("selection:change", function () { _history.selectionchanged = true; });
		
		// Export undo and redo function to the api
		ghostedit.api.undo = function () { return _history.undo(); };
		ghostedit.api.redo = function () { return _history.redo(); };
	};
	
	_history.reset = function () {
		_history.undoData = [];//new Array(_history.undolevels);
		/*_history.undolevels = 4000,*/
		_history.undoPoint = 0;
		_history.selectionchanged = true;
	};
	
	_history.saveUndoState = function (force) {
		var undoPoint, undoData, contentchanged, selectionchanged, currentstate, undostate,
		editwrap = ghostedit.el.rootnode;
		
		if (force !== true) force = false;
		
		ghostedit.event.trigger("history:save:before");
		
		// Localise undo variables
		undoPoint = _history.undoPoint;
		undoData = _history.undoData;
		
		// Get latest undopoint into a variable
		undostate = undoData[undoPoint];
		if (!undostate) force = true;
		
		// Start capturing current editor state
		currentstate = {
			id: "",
			selection: {
				"type": ghostedit.selection.saved.type,
				//"data": ghostedit.selection.saved.type === "textblock" ? ghostedit.selection.saved.data.clone() : ghostedit.selection.saved.data
				"data": ghostedit.selection.saved.data
			},
			content: {
				"string": editwrap.innerHTML
			}
		};
		
		// Calcuate whether the selection or content have changed
		if (!force) {
			contentchanged = (undostate.content.string !== currentstate.content.string) ? true : false;
			selectionchanged = !(ghostedit.selection.isSameAs(undostate.selection));
		}
		
		if (force || selectionchanged || contentchanged) {
			
			// Clone editor content as documentFragment
			currentstate.content.dom = ghostedit.dom.extractContent(editwrap.cloneNode(true));
			
			if (force || contentchanged) {
				// Remove existing redo data
				if (undoPoint > 0) _history.undoData.splice(0, undoPoint);
				// Save new data and set undoPoint to point at it
				_history.undoData.unshift(currentstate);
				_history.undoPoint = 0;
			}
			else {
				_history.undoData[undoPoint] = currentstate;
			}
		}
		
		ghostedit.event.trigger("history:save:after");
	};
	
	_history.restoreUndoPoint = function (undopoint) {
		var undoData = _history.undoData,
		undostate = undoData[undopoint];
		if (!undostate || undostate.content.string.length < 1) return false;
		
		ghostedit.event.trigger("history:restore:before");
		
		ghostedit.el.rootnode.innerHTML = "";
		ghostedit.el.rootnode.appendChild(ghostedit.dom.cloneContent(undostate.content.dom));
		
		ghostedit.selection.restore (undostate.selection.type, undostate.selection.data);
		//ghostedit.selection.save();
		
		ghostedit.event.trigger("history:restore:after");
	};
	
	_history.undo = function () {
		var undoPoint = _history.undoPoint,
		undoData = _history.undoData,
		editwrap = ghostedit.el.rootnode;
		
		if (undoData[undoPoint+1] === undefined ||
			undoData[undoPoint+1].content.string.length <= 0) return;
		// if (undoPoint < _history.undolevels  - 1) return; //unlimited undo levels
		
		ghostedit.event.trigger("history:undo:before");
		// If there are unsaved changes, save current content and revert to last saved undopoint (was 0, but now 1 because current state saved in 0)
		if (undoData[undoPoint].content.string !== editwrap.innerHTML) {
			_history.saveUndoState();
			undoPoint = 1;
		}
		// Else, current state already saved, revert to previous saved one (undoPoint + 1)
		else {
			if (undoPoint === 0) {
				_history.saveUndoState();
			}
			undoPoint = _history.undoPoint;
			undoPoint += 1;
		}

		_history.restoreUndoPoint(undoPoint);
		_history.undoPoint = undoPoint;
		_history.undoData = undoData;

		ghostedit.event.trigger("history:undo:after");
	};
	
	_history.redo = function () {
		var undoPoint = _history.undoPoint,
		undoData = _history.undoData,
		editwrap = ghostedit.el.rootnode;
		
		if (undoPoint > 0 && undoData[undoPoint-1] !== undefined && undoData[undoPoint-1].content.string.length > 0) {
			
			ghostedit.event.trigger("history:redo:before");
			
			// The user has made changes since the last undo/redo, throw away redo data and save undo state
			if (undoData[undoPoint].content.string !== editwrap.innerHTML) {
				_history.saveUndoState(true);
			}
			// Last action was an undo/redo, move one point forwards if possible
			else {
				undoPoint-=1;
				_history.restoreUndoPoint(undoPoint);
				_history.undoPoint = undoPoint;
				_history.undoData = undoData;
			}
			
			ghostedit.event.trigger("history:redo:after");
		}
	};
	
	window.ghostedit.history = _history;
})(window);
(function (window, undefined) {
	
	var _clipboard = {}, _paste, _cut,
	lasso = window.lasso,
	ghostedit = window.ghostedit,
	console = window.console || {};
	console.log = console.log || function () {};
	
	_clipboard.init = function () {
		_clipboard.paste.init();
		_clipboard.cut.init();
	};
	
	_paste = {
		savedcontent: null,
		savedundodata: null,
		savedundopoint: null,
		beforerangedata: "",
		afterrangedata: "",
		waitlength: 0,
		postpastetidylist: []
	};
	
	_paste.init = function () {
		ghostedit.event.addListener("init:after", function () {
			ghostedit.util.addEvent(ghostedit.el.rootnode, "paste", function(event) { _paste.handle(event); });
		}, "clipboard");
	};
	
	_paste.handle = function (e) {//elem no longer used?
		
		// Save editor state, and save undo data in case paste functions mess up undo stack
		ghostedit.history.saveUndoState();
		_paste.savedundodata = ghostedit.history.undoData;
		_paste.savedundopoint = ghostedit.history.undoPoint;

		_paste.triedpasteimage = false;
		// If webkit - get data from clipboard, put into rootnode, cleanup, then cancel event
		if (e.clipboardData && e.clipboardData.getData) {
			if (/image/.test(e.clipboardData.types)) {
				_paste.triedpasteimage = true;
			}
			
			if (/text\/html/.test(e.clipboardData.types)) {
				ghostedit.el.rootnode.innerHTML = e.clipboardData.getData('text/html');
			}
			else if (/text\/plain/.test(e.clipboardData.types) || ghostedit.browserEngine.opera) {
				ghostedit.el.rootnode.innerHTML = e.clipboardData.getData('text/plain').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
			}
			else {
				ghostedit.el.rootnode.innerHTML = "";
			}
			_paste.waitfordata();
			return ghostedit.util.cancelEvent(e);
		}
		//Else - empty rootnode and allow browser to paste content into it, then cleanup
		else {
			ghostedit.el.rootnode.innerHTML = "";
			_paste.waitfordata();
			return true;
		}
	};
	
	_paste.waitfordata = function () {
		var elem = ghostedit.el.rootnode;
		if (elem.childNodes && elem.childNodes.length > 0) {
			_paste.process();
		}
		else {
			setTimeout(_paste.waitfordata, 20);
		}
	};
	
	_paste.process = function () {
		var pastenode, collapsed, hasmerged, handler, target, result, source, position;
		
		// Extract pasted content into a new element
		pastenode = document.createElement("div");
		pastenode = ghostedit.plugins.container.inout.importHTML(ghostedit.el.rootnode);
		console.log ("processed content");
		console.log (pastenode.cloneNode(true));
		
		// Restore undo data, and restore editor content
		ghostedit.history.undoData = _paste.savedundodata;
		ghostedit.history.undoPoint = _paste.savedundopoint;
		ghostedit.history.restoreUndoPoint(ghostedit.history.undoPoint);
		ghostedit.selection.save();
		
		// Delete selection contents if selection is non-collapsed
		ghostedit.selection.deleteContents();
		ghostedit.selection.save();
		
		// If no content was pasted, return
		source = ghostedit.dom.getFirstChildGhostBlock(pastenode);
		if (!source) return;
		
		// Save selection to DOM
		if(ghostedit.selection.saved.data.isCollapsed()){
			ghostedit.selection.saved.data.saveToDOM("ghostedit_paste_start");
		}
		else {
			ghostedit.selection.saved.data.clone().collapseToStart().saveToDOM("ghostedit_paste_start");
			ghostedit.selection.saved.data.clone().collapseToEnd().saveToDOM("ghostedit_paste_end");
		}
		
		
		// Call handler on first pasted node
		target = function () { return ghostedit.selection.saved.data.getStartNode(); };
		position = {"isfirst": true, "islast": (ghostedit.dom.getLastChildGhostBlock(pastenode) === source) ? true : false};
		target = _paste.callHandler (target, source, position);
		
		
		/*ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
		if (lasso().isSavedRange("ghostedit_paste_end")) {
			ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
		}
		ghostedit.selection.saved.data.select().inspect();
		return;/* */
		
		
		// Call handler on last pasted node
		source = ghostedit.dom.getLastChildGhostBlock(pastenode);
		if (source) {
			target = function () { return ghostedit.selection.saved.data.getEndNode(); };
			position = {"isfirst": false, "islast": true};
			_paste.callHandler (target, source, position);
		}
		
		
		/*ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
		if (lasso().isSavedRange("ghostedit_paste_end")) {
			ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
		}
		ghostedit.selection.saved.data.select().inspect();
		return;/* */
		
		// Loop through and call handler on remaining nodes
		target = function () { return ghostedit.selection.saved.data.getParentNode(); };
		position = {"isfirst": false, "islast": false};
		while ((source = ghostedit.dom.getFirstChildGhostBlock(pastenode))) {			
			_paste.callHandler (target, source, position);
		}
		
		
		// Restore the selection (collapsed to the end)
		ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", true).select();
		if (ghostedit.selection.saved.data.isSavedRange("ghostedit_paste_end")) {
			ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_end", true).select();
		}
		ghostedit.selection.save();
		
		// Save undo state
		ghostedit.history.undoData = _paste.savedundodata;
		ghostedit.history.undoPoint = _paste.savedundopoint;
		ghostedit.history.saveUndoState();
		
		if (_paste.triedpasteimage) {
			ghostedit.event.trigger("ui:message", {message: "You cannot paste images into the editor, please use the add image button instead", time: 2, color: "warn"});
		}
		
		ghostedit.event.trigger("clipboard:paste:after");
	};
	
	_paste.callHandler = function (targetF, source, position) {
		var target, handler, result;
		
		// Restore the selection from DOM markers
		ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
		if (lasso().isSavedRange("ghostedit_paste_end")) {
			ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
		}
		
		// Get the target
		target = targetF();
		if (!ghostedit.dom.isGhostBlock(target)) target = ghostedit.dom.getParentGhostBlock(target);
		
		// Recursively call handler of target and it's parents
		while (true) {
			if (!target) break;
			
			// Get handler plugin for specified target
			handler = target.getAttribute("data-ghostedit-handler");
			if (!ghostedit.plugins[handler] || !ghostedit.plugins[handler].paste) break;
			
			console.log("Call handler: (" + (position.isfirst?"first":position.islast?"last":"normal") + ")" + handler);
			console.log(target.cloneNode(true));
			console.log(source.cloneNode(true));
			
			// Call handler function for target
			result = ghostedit.plugins[handler].paste.handle (target, source, position);
			console.log("result: " + result);
			
			// If handler function returns true, then source is handled: remove it and return false to indicate not to continue
			if (result) {
				source.parentNode.removeChild(source);
				break;
			}
			
			// Else, restore the selection from DOM markers
			ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
			if (lasso().isSavedRange("ghostedit_paste_end")) {
				ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
			}
			
			// Get the the parent GhostBlock as the next target to try
			target = ghostedit.dom.getParentGhostBlock(target);
		}
	};
	
	_cut = {
		savedcontent: null,
		savedundodata: null,
		savedundopoint: null
	};
	
	_cut.init = function () {
		ghostedit.event.addListener("init:after", function () {
			ghostedit.util.addEvent(ghostedit.el.rootnode, "cut", function(event) { _cut.handle(event); });
		}, "clipboard");
	};
	
	_cut.handle = function () {
		
		// Save editor state, and save undo data in case paste functions mess up undo stack
		ghostedit.history.saveUndoState();
		_cut.savedundodata = ghostedit.history.undoData;
		_cut.savedundopoint = ghostedit.history.undoPoint;

		//Else - empty rootnode and allow browser to paste content into it, then cleanup
		setTimeout(_cut.cleanup, 20);
		return true;
	};
	
	_cut.cleanup = function () {

		// Restore undo data, and restore editor content
		ghostedit.history.undoData = _cut.savedundodata;
		ghostedit.history.undoPoint = _cut.savedundopoint;
		ghostedit.history.restoreUndoPoint(ghostedit.history.undoPoint);
		ghostedit.selection.save();
		
		// Delete selection contents if selection is non-collapsed
		ghostedit.selection.deleteContents();
		ghostedit.selection.save();
		ghostedit.history.saveUndoState();
	};
	
	_clipboard.paste = _paste;
	_clipboard.cut = _cut;
	window.ghostedit.clipboard = _clipboard;
})(window);
(function (window, undefined) {
	
	var _textblock = {},
	lasso = window.lasso,
	ghostedit = window.ghostedit,
	console = window.console || {};
	console.log = console.log || function () {};
	
	_textblock.enable = function () {
				
		_textblock.format.init();
			
		ghostedit.inout.registerimporthandler (_textblock.inout.importHTML, "p", "h1", "h2", "h3", "h4", "h5", "h6");
		ghostedit.inout.registerimporthandler (_textblock.inout.importHTML, "#textnode", "b", "strong", "i", "em", "u", "strike", "span");
		
		// Bookmarkify (serialize) the selection, and save the bookmark to the lasso object
		ghostedit.event.addListener("history:save:after", function () {
			if (ghostedit.selection.saved.type === "textblock") {
				ghostedit.selection.saved.data.bookmarkify(ghostedit.el.rootnode);
			}
		});
		
		// Clone range object after undo save to avoid accidentally modifying the saved range objects
		ghostedit.event.addListener("history:save:after", function () {
			if (ghostedit.selection.saved.type === "textblock") {
				ghostedit.selection.saved.data = ghostedit.selection.saved.data.clone();
			}
		});
		
		ghostedit.api.insert = ghostedit.api.insert || {};
		ghostedit.api.insert.character = function (character) { return _textblock.insert.character(character); };
		ghostedit.api.insert.br = function () {return _textblock.insert.br; };
		
		return true;
	};
		
	_textblock.event = {
		keydown: function (target, keycode, event) {
			switch (keycode) {
				case 8: // backspace
					return _textblock.event.backspace(target, event);
				case 46: //delete
					return _textblock.event.deletekey (target, event);
			}
		},
		
		keypress: function (target, keycode, event) {
			// Enter key
			if (keycode === 13) return _textblock.event.enterkey (target, event);
		},
		
		backspace: function (block, e) {
			if (_textblock.selection.isAtStartOfTextBlock() !== true) {
				//Caret not at start of textblock: return true to indicate handled
				return true;
			}
			else {
				//var block = ghostedit.selection.getContainingGhostBlock();
				
				var params =  {
					"merge": {
						"contenttype": "inlinehtml",
						"sourcecontent": block.innerHTML,
						callback: ghostedit.util.preparefunction(function (node) {
							var parent = node.parentNode;
							var handler = parent.getAttribute("data-ghostedit-handler");
							ghostedit.plugins[handler].dom.removechild(parent, node);}, false, block)
					}
				};
				ghostedit.event.sendBackwards("delete", block, params );

				ghostedit.event.cancelKeypress = true;
				ghostedit.util.cancelEvent ( e );
				return true;
			}
		},
		
		deletekey: function (block, e) {
			//var block = ghostedit.selection.getContainingGhostBlock();
			if (_textblock.selection.isAtEndOfTextBlock() !== true) {
				//Caret not at end of textblock: return true to indicate handled
				return true;
			}
			else {
				ghostedit.event.sendForwards("delete", block);
				//_textblock.remove(_textblock.selection.getStartTextBlockNode());
				ghostedit.event.cancelKeypress = true;
				ghostedit.util.cancelEvent ( e );
				return true;
			}
		},
		
		enterkey: function (elem, e) {
			ghostedit.history.saveUndoState();
			
			if (e.shiftKey) {
				_textblock.insert.br();
				_textblock.mozBrs.tidy (elem);
			}
			else {
				_textblock.split(elem);
			}
			ghostedit.history.saveUndoState();
			
			ghostedit.util.cancelEvent ( e );
			return true;
		}
	};
	
	_textblock.dom = {
		deleteevent: function (target, sourcedirection, params){
			var parent, handler, block;
			switch (sourcedirection) {
				case "ahead":
					ghostedit.history.saveUndoState();
					if (!_textblock.isEmpty(target)) {
						target.innerHTML += "<span id='ghostedit_selection_marker'>&#x200b;</span>";
						if (params.merge && params.merge.sourcecontent && (params.merge.contenttype === "inlinehtml" || params.merge.contenttype === "text")) {
							target.innerHTML += params.merge.sourcecontent;
						}
						_textblock.mozBrs.tidy(target);
						params.merge.callback();
						//params.sourceblock.parentNode.removeChild(params.sourceblock);
						lasso().selectNode("ghostedit_selection_marker").select();//.deleteContents();
						document.getElementById("ghostedit_selection_marker").parentNode.removeChild(document.getElementById("ghostedit_selection_marker"));
						ghostedit.selection.save();
					}
					else {
						parent = ghostedit.dom.getParentGhostBlock(target);
						handler = parent.getAttribute("data-ghostedit-handler");
						//alert(target.id);
						ghostedit.plugins[handler].dom.removechild(parent, target);
					}
					ghostedit.history.saveUndoState();
					return true;
				case "behind":
					block = ghostedit.selection.getContainingGhostBlock();
					params =  {
						"merge": {
							"contenttype": "inlinehtml",
							"sourcecontent": target.innerHTML,
							"callback": ghostedit.util.preparefunction(function (node) {
										var parent = node.parentNode,
										handler = parent.getAttribute("data-ghostedit-handler");
										ghostedit.plugins[handler].dom.removechild(parent, node);
									}, false, target)
						}
					};
					ghostedit.event.sendBackwards("delete", target, params);
					//----------------------------------
					//_textblock.remove(_textblock.selection.getStartTextBlockNode());
					
					//ghostedit.event.cancelKeypress = true;
					//return ghostedit.util.cancelEvent ( e );
					return true;
			}
		}
	};
	
	_textblock.selection = {
		compare: function (r1, r2) {
			if (!r1 || !r1.isEqualTo) return false;
			return r1.isEqualTo(r2);
		},
		
		restore: function (savedrange) {
			if (!savedrange || !savedrange.unbookmarkify) return false;
			savedrange.unbookmarkify(ghostedit.el.rootnode);
			savedrange.select();
			return true;
		},
		
		deleteContents: function (textblockelem) {
			var startofblock, endofblock, selrange;
			
			// Temporary selection range to avoid changing actual saved range
			selrange = ghostedit.selection.savedRange.clone();
			
			// Ranges representing the start and end of the block
			startofblock = lasso().setCaretToStart(textblockelem);
			endofblock = lasso().setCaretToEnd(textblockelem);
			
			// If selrange starts before block, move start of selrange to start of block
			if (selrange.compareEndPoints("StartToStart", startofblock) === -1) {
				selrange.setStartToRangeStart(startofblock);
			}
			
			// If selrange end after block, move end of selrange to end of block
			if (selrange.compareEndPoints("EndToEnd", endofblock) === 1) {
				//alert(textblockelem.id);
				selrange.setEndToRangeEnd(endofblock);
			}
			
			selrange.deleteContents();
			
			return true;
		},
		
		getTextBlockNode: function (elem) {
			if (elem.nodeType !== 1 || elem.getAttribute("data-ghostedit-elemtype") !== "textblock") {
				while (elem.nodeType !== 1 || elem.getAttribute("data-ghostedit-elemtype") !== "textblock") {
					elem = elem.parentNode;
					if (elem === null) return false;
				}
			}
			return elem;
		},
		
		getStartTextBlockNode: function () {
			return _textblock.selection.getTextBlockNode( ghostedit.selection.savedRange.getStartNode() );
		},
		
		getEndTextBlockNode: function () {
			return _textblock.selection.getTextBlockNode( ghostedit.selection.savedRange.getEndNode() );
		},
		
		
		//Assumes selection saved manually
		isAtStartOfTextBlock: function (point) {
			var caretIsAtStart = false, range, selrange, i, isequal, firstnode, textblocknode, wholenode, tempnode,
			useselection;
			
			// Check if 'point' parameter was passed and is a lasso object, otherwise get selection
			useselection = false;
			if (!point || !point.isLassoObject) {
				if (ghostedit.selection.saved.type !== "textblock") return false;
				point = ghostedit.selection.saved.data;
				useselection = true;
			}
			
			if(document.createRange) {
				range = point;
				if(range.isCollapsed() && range.getNative().startOffset === 0) {
					caretIsAtStart = true;
					tempnode = ghostedit.selection.savedRange.getStartNode();
				}
				
				if (!tempnode) return caretIsAtStart;
			
				// If tempnode not right at start
				while (tempnode.nodeType !== 1 || tempnode.getAttribute("data-ghostedit-elemtype") !== "textblock") {
					if (tempnode !== tempnode.parentNode.childNodes[0]) {
						isequal = false;
						if((tempnode.parentNode.childNodes[0].nodeType === 3 && tempnode.parentNode.childNodes[0].length === 0) ||
								(tempnode.parentNode.childNodes[0].nodeType === 1 && tempnode.parentNode.childNodes[0].className === "moz_dirty")) {
							//Deals with empty text nodes at start of textblock elem
							for(i = 1; i < tempnode.parentNode.childNodes.length; i += 1) {
								firstnode = tempnode.parentNode.childNodes[0];
								if (tempnode === tempnode.parentNode.childNodes[i]) {
									isequal = true;
									break;
								}
								else if(!(firstnode.nodeType === 3 && firstnode.length === 0) &&
									!(firstnode.nodeType === 1 && firstnode.className === "moz_dirty")) {
									break;
								}
							}
						}
						if(isequal !== true) {
							caretIsAtStart = false;
							break;
						}
					}
					tempnode = tempnode.parentNode;
				}	
			}
			else if (document.selection) {
				// Bookmarkify range, so DOM modification doesn't break it
				selrange = point.clone().bookmarkify();
				
				textblocknode = _textblock.selection.getStartTextBlockNode();
				
				// Get range representing the whole TextBlock contents
				wholenode = lasso().selectNodeContents( textblocknode );
				
				// Unbookmarkify the range, so it can be used in comparisons again
				selrange.unbookmarkify();
				
				// Compare html of wholenode with html of node starting from selected point, if eqaul then selection is at the start of the textblock
				if (wholenode.getHTML() === wholenode.setStartToRangeStart(selrange).getHTML()) {
						caretIsAtStart = true;
				}
				
				if (useselection) {
					ghostedit.selection.savedRange = selrange.select();
				}
			}
			return caretIsAtStart;
		},

		
		//Assumes selection saved manually
		isAtEndOfTextBlock: function () {
			var caretIsAtEnd = false, selrange, range, rangefrag, elemfrag, textblocknode, endpoint;
			
			if (!ghostedit.selection.savedRange.isCollapsed()) return false;
			
			textblocknode = _textblock.selection.getEndTextBlockNode();
			if(document.createRange) {
				
				rangefrag = document.createElement("div");
				rangefrag.appendChild( ghostedit.selection.savedRange.getNative().cloneContents() );
				
				range = ghostedit.selection.savedRange.getNative();
				range.setEnd(textblocknode, textblocknode.childNodes.length);
				elemfrag = document.createElement("div");
				rangefrag.appendChild( range.cloneContents() );
				
				_textblock.mozBrs.clear(rangefrag);
				_textblock.mozBrs.clear(elemfrag);
				
				if(rangefrag.innerHTML === elemfrag.innerHTML) {
					caretIsAtEnd = true;
				}
			}
			else if (document.selection) {
				// Bookmarkify range, so DOM modification doesn't break it
				selrange = ghostedit.selection.savedRange.clone().bookmarkify();
				
				// Get range representing the end of the TextBlock
				textblocknode.innerHTML += "<span id=\"range_marker\">&#x200b;</span>";
				endpoint = lasso().selectNode('range_marker');//.deleteContents();
				document.getElementById('range_marker').parentNode.removeChild(document.getElementById('range_marker'));
				
				// Unbookmarkify the range, so it can be used in comparisons again
				selrange.unbookmarkify();
				
				// Compare endpoint to selected point, if equal then selection is at the end of the textblock
				if (selrange.compareEndPoints("EndToEnd", endpoint) === 0) {
					caretIsAtEnd = true;
				}
				ghostedit.selection.savedRange = selrange.select();
			}
			return caretIsAtEnd;
		},
		
		extendtoword: function (range, onlyfrommiddle) {
			var wordstart, wordend;
			range = range.clone().getNative();
			if (document.createRange) {
				wordstart = _textblock.selection.findwordstart (range.startContainer, range.startOffset);
				wordend = _textblock.selection.findwordend (range.endContainer, range.endOffset);
				
				//If only one end has moved (or neither), then it's not from the middle
				if (onlyfrommiddle) {
					if (range.startContainer === wordstart.node && range.startOffset === wordstart.offset) return lasso().setFromNative(range);
					if (range.endContainer === wordend.node && range.endOffset === wordend.offset) return lasso().setFromNative(range);
				}
				
				range.setStart(wordstart.node, wordstart.offset);
				range.setEnd(wordend.node, wordend.offset);
			}
			else {
				range.expand("word");
				if (range.htmlText.split().reverse()[0] === " ") {
					range.moveEnd("character", -1);
				}
			}
			return lasso().setFromNative(range);
		},
		
		findwordstart: function (node, offset) {
			var leftnodecontent, stroffset, totalstroffset, prevnode, wordendregex = /\s|[\!\?\.\,\:\;\"]/;
			
			if (!node || !node.nodeType) return false;
			
			// Handle text node
			if (node.nodeType === 3) {
				leftnodecontent = node.nodeValue.substring(0, offset);
				stroffset = leftnodecontent.search(wordendregex);
				//If there is a space or punctuation mark left of position in current textNode
				if(stroffset !== -1) {
					totalstroffset = stroffset + 1;
					while ((stroffset = leftnodecontent.substring(totalstroffset).search(wordendregex)) !== -1) {
						totalstroffset += stroffset + 1;
					}
					return { node: node, offset: totalstroffset };
				}
			}
			
			// Handle Element
			else if (node.nodeType === 1) {
				if (offset > 0) {
					return _textblock.selection.findwordstart(node.childNodes[offset - 1], node.childNodes[offset - 1].length);
				}
			}
			
			// If no wordend match found in current node and node is a ghostedit_textblock: return current position
			if (_textblock.isTextBlock(node)){
				return {"node": node, "offset": offset};
			}
			
			// If node is a NOT ghostedit_textblock: check previous node
			prevnode = node.previousSibling;
			if (prevnode) {
				if (prevnode.nodeType === 3) {
					return _textblock.selection.findwordstart(prevnode, prevnode.nodeValue.length);
				}
				else if (prevnode.nodeType === 1) {
					return _textblock.selection.findwordstart(prevnode, prevnode.childNodes.length);
				}
			}
			// If node is a NOT ghostedit_textblock and no previousSibling: move up tree
			else {
				return _textblock.selection.findwordstart(node.parentNode, ghostedit.dom.getNodeOffset(node));
			}
			
			
		},
		
		findwordend: function (node, offset) {
			var rightnodecontent, stroffset, totalstroffset, nextnode,
			wordendregex = /\s|[\!\?\.\,\:\;\"]/;
			
			if (!node || !node.nodeType) return false;
			
			// Handle text node
			if (node.nodeType === 3) {
				rightnodecontent = node.nodeValue.substring(offset);
				stroffset = rightnodecontent.search(wordendregex);
				//If there is a space or punctuation mark left of position in current textNode
				if (stroffset !== -1) {
					totalstroffset = offset + stroffset;
					return { node: node, offset: totalstroffset };
				}
			}
			
			// Handle Element
			else if (node.nodeType === 1) {
				if (offset < node.childNodes.length) {
					return _textblock.selection.findwordend(node.childNodes[offset], 0);
				}
			}
			
			// If no wordend match found in current node and node is a ghostedit_textblock: return current position
			if (_textblock.isTextBlock(node)){
				return {"node": node, "offset": offset};
			}
			
			// If node is a NOT ghostedit_textblock: check next node
			nextnode = node.nextSibling;
			if (nextnode) {
				return _textblock.selection.findwordend(nextnode, 0);
			}
			// If node is a NOT ghostedit_textblock and no nextSibling: move up tree
			else {
				return _textblock.selection.findwordend(node.parentNode, ghostedit.dom.getNodeOffset(node) + 1);
			}
		}
	};
	
	_textblock.inout = {
		handledtags: {
			"h1": "block", "h2": "block", "h3": "block", "h4": "block", "h5": "block", "h6": "block", "p": "block",
			"b": "child", "i": "child", "u": "child", "strong": "child", "em": "child", "strike": "child", "br": "child",
			"a": "contents", "span": "contents"
		},
		
		parserules: {
			"textnode": { "clean": true },
			"tags": {
				"h1": "textblock", "h2": "textblock", "h3": "textblock", "h4": "textblock", "h5": "textblock", "h6": "textblock", "p": "textblock",
				"b": {}, "i": {}, "u": {}, "strong": {}, "em": {}, "strike": {},
				"br": { "attributes": [ {"name": "class", "allowedvalues": [ "moz_dirty" ]} ] }
			},
			"templates": {
				"textblock": {
					"attributes": [ "class" ],
					"styles": [ 
						{"name": "textAlign", "allowedvalues": ["left", "right", "center", "justified"] },
						{"name": "clear", "allowedvalues": ["left", "right"] }
					]
				}
			}
		},
		
		importHTML: function (source) {
			var newTextBlock, tagname, node, childcount, prevnode, nodetype, parsednode;
			
			nodetype = _textblock.inout.isHandleableNode(source);
			switch (nodetype) {
				case "block":
					// Create TextBlock
					tagname = source.tagName.toLowerCase();
					newTextBlock = ghostedit.dom.parse(source, _textblock.inout.parserules);
					
					ghostedit.blockElemId += 1;
					newTextBlock.id = 'ghostedit_textblock_' + ghostedit.blockElemId;
					
					// Set GhostEdit handler attributes
					newTextBlock.setAttribute("data-ghostedit-iselem", "true");
					newTextBlock.setAttribute("data-ghostedit-elemtype", "textblock");
					newTextBlock.setAttribute("data-ghostedit-handler", "textblock");
					
					// Add event handlers
					newTextBlock.ondragenter = function(){return false;};
					newTextBlock.ondragleave = function(){return false;};
					newTextBlock.ondragover = function(){return false;};
					newTextBlock.ondrop = function(e){
						var elem, elemid;
						// This function does basic image paragraph changing dnd
						elemid = e.dataTransfer.getData("Text") || e.srcElement.id;
						//alert(elemid); TODO drag drop
						elem = document.getElementById(elemid);
						elem.parentNode.insertBefore(elem,this);
						ghostedit.image.focus(elem);
						};
					newTextBlock.onresizestart = function(e) {return ghostedit.util.cancelEvent(e);};
								
					_textblock.mozBrs.tidy (newTextBlock);
					return newTextBlock;
				case "child":
				case "contents":
				case "text":
					newTextBlock = _textblock.create("p");
					newTextBlock.setAttribute("data-ghostedit-importinfo", "wasinline");
					childcount = 0;
					node = source;
					do {
						parsednode = ghostedit.dom.parse(node, _textblock.inout.parserules);
						if (parsednode) {
							childcount += 1;
							newTextBlock.appendChild(parsednode);
							prevnode = node;
							node = node.nextSibling;
							if (childcount > 1) prevnode.parentNode.removeChild(prevnode);
						}
					}
					while (_textblock.inout.isHandleableNode(node) && _textblock.inout.isHandleableNode(node) !== "block");
					
					_textblock.mozBrs.tidy (newTextBlock);
					return (childcount > 0) ? newTextBlock : false;
			}
			return false;
		},
		
		exportHTML: function (target) {
			if (!target || !ghostedit.dom.isGhostBlock(target) || target.getAttribute("data-ghostedit-elemtype") !== "textblock") return false;	
			var finalCode = "", stylecode = "", elem;
			elem = target;
			
			_textblock.mozBrs.clear(elem);
	
			//if(elem.tagName.toLowerCase() == "p") paracount++;
			
			
			finalCode += "<" + elem.tagName.toLowerCase();
			
			// Extract styles
			if (elem.style.textAlign !== "") { stylecode += "text-align:" + elem.style.textAlign + ";"; }
			if (elem.style.clear !== "") stylecode += "clear:" + elem.style.clear + ";";
			
			if (stylecode.length > 0) finalCode += " style='" + stylecode + "'";
			
			// Extract class
			if (elem.className.length > 0 && !/ghostedit/.test(elem.className)) finalCode += " class='" + elem.className + "'";
			
			finalCode += ">";
			
			// Copy content and end tag
			finalCode += elem.innerHTML;
			finalCode += "</" + elem.tagName.toLowerCase() + ">";
			
			_textblock.mozBrs.tidy(elem);
			
			return {content: finalCode};
		},
		
		isHandleableNode: function (node) {
			var nodetag;
			if (!node || !node.nodeType) return false;
			
			// Handle textnode case
			if (node.nodeType === 3) return (node.nodeValue.replace(/[\n\r\t]/g,"").length > 0) ? "text" : false;
			
			// Handle not-element case (textnodes already handled)
			if (node.nodeType !== 1) return false;
			
			// Handle textblock case
			if(node.getAttribute("data-ghostedit-elemtype") === "textblock") return "block";
			
			// Handle other GhostBlock case (don't process other plugins' stuff)
			if (ghostedit.dom.isGhostBlock(node)) return false;
			
			// Else get tagname, and check handleable tag list
			nodetag = node.tagName.toLowerCase();				
			if (_textblock.inout.handledtags[nodetag]) {
				return _textblock.inout.handledtags[nodetag];
			}
			
			// Else return false
			return false;
		}
	};
	
	_textblock.paste = {			
		handle: function (target, source, position) {
			if (!ghostedit.dom.isGhostBlock(target) || !ghostedit.dom.isGhostBlock(source)) return;
			
			console.log(position);
			
			// If source is first pasted element, and was inline content, or is of same type as target, then merge contents into target node
			if (position.isfirst) {
				return _textblock.paste.handleFirst(target, source, position);
			}
			
			if (position.islast) {
				return _textblock.paste.handleLast(target, source, position);
			}
			
			_textblock.paste.split(target);
			return false;
						
			/*if (!position.islast || !(source.tagName.toLowerCase() === "p" || source.tagName === target.tagName) && _textblock.isEmpty(blocks.block2)) {
				parent = ghostedit.dom.getParentGhostBlock(blocks.block2);
				handler = parent.getAttribute("data-ghostedit-handler");
				
				marker = document.createElement("span");
				marker.id = "ghostedit_paste_end_range_start";
				marker.innerHTML = "&#x200b;";
				
				lasso().removeDOMmarkers("ghostedit_paste_end");
				ghostedit.plugins[handler].dom.addchild(parent, "after", blocks.block2, marker);
				ghostedit.plugins[handler].dom.removechild(parent, blocks.block2);
				return false;
			}*/
			
			/*PART OF SPLIT FUNCTION
			lasso().removeDOMmarkers("ghostedit_paste_end");
			blocks.block2.innerHTML = "<span id='ghostedit_paste_end_range_start'>&#x200b;</span>" + blocks.block2.innerHTML;
			_textblock.mozBrs.tidy(blocks.block2);*/
			
			// If source is last pasted element, and was inline content, or is of same type as target, then prepend contents to second node
			/*if (position.islast && (source.tagName.toLowerCase() === "p" || source.tagName === target.tagName)) {
				//DEV console.log("paste (last):");
				//DEV console.log(blocks.block2);
				blocks.block2.innerHTML = source.innerHTML + blocks.block2.innerHTML;
				blocks.block2 = _textblock.format.setTagType({"textblock": blocks.block2, "tagname": source.tagName.toLowerCase()});
				return true;
			}*/
			
			
			
			//DEV console.log(blocks.block1.parentNode.cloneNode(true));
		},
		
		handleFirst: function (target, source, position) {
			// No longer needed because is subset of 'p' check: source.getAttribute("data-ghostedit-importinfo") === "wasinline"
			if (source.tagName.toLowerCase() === "p" || source.tagName === target.tagName) {
				console.log("paste (first):");
				
				_textblock.mozBrs.clear(source);
				
				lasso().removeDOMmarkers("ghostedit_paste_start");
				source.innerHTML += "<span id='ghostedit_paste_start_range_start' class='t1'>&#x200b;</span>";
				
				if (document.createRange) {
					ghostedit.selection.saved.data.collapseToStart().getNative().insertNode( ghostedit.dom.extractContent(source) );
				}
				else {
					ghostedit.selection.saved.data.collapseToStart().getNative().pasteHTML(source.innerHTML);
				}
				
				return true;
			}
			else {
				return false;
			}
		},
		
		handleLast: function (target, source, position) {
			if (source.tagName.toLowerCase() === "p" || source.tagName === target.tagName) {
				console.log("paste (last):");
				
				// If selection is collapsed, then create a new paragraph before merging contents
				if (ghostedit.selection.saved.data.isCollapsed()) {
					_textblock.paste.split(target);
					ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
					if (lasso().isSavedRange("ghostedit_paste_end")) {
						ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
					}
				}
				
				_textblock.mozBrs.clear(source);
				lasso().removeDOMmarkers("ghostedit_paste_end");
				source.innerHTML += "<span id='ghostedit_paste_end_range_start'>&#x200b;</span>";
				
				if (document.createRange) {
					ghostedit.selection.saved.data.collapseToEnd().getNative().insertNode( ghostedit.dom.extractContent(source) );
				}
				else {
					ghostedit.selection.saved.data.collapseToEnd().getNative().pasteHTML(source.innerHTML);
				}
				
				return true;
			}
			else {
				return false;
			}
		},
		
		split: function (target, range) {
			var blocks, handlestartmarker = false;
			
			range = range || ghostedit.selection.saved.data;
			range = range.clone().collapseToStart();
			
			// Check whether target contains a start marker
			if (ghostedit.dom.isDescendant(target, document.getElementById("ghostedit_paste_start_range_start"))) {
				handlestartmarker = true;
			}
			
			if (handlestartmarker) {
				lasso().removeDOMmarkers("ghostedit_paste_start");//Must be before split or marker is duplicated
			}
			
			blocks = _textblock.split(target, range);
			
			if (handlestartmarker) {
				blocks.block1.innerHTML += "<span id='ghostedit_paste_start_range_start' class='t2'>&#x200b;</span>";
				_textblock.mozBrs.tidy(blocks.block1);
			}
			
			// Tidy up end marker
			lasso().removeDOMmarkers("ghostedit_paste_end");
			blocks.block2.innerHTML = "<span id='ghostedit_paste_end_range_start'>&#x200b;</span>" + blocks.block2.innerHTML;
			_textblock.mozBrs.tidy(blocks.block2);
			
			return blocks;
		}
	};
	
	_textblock.isTextBlock = function (textblock) {
		if (!ghostedit.dom.isGhostBlock(textblock)) return false;
		if (textblock.getAttribute("data-ghostedit-elemtype") !== "textblock") return false;
		return true;
	};
	
	_textblock.isEmpty = function (textblock) {
		var textcontent, imgs, brs, i;
		
		// If the node contains textual content then it's not empty
		//if (ghostedit.util.strip_tags(textblockelem.innerHTML).length > 1) return false;
		
		textcontent = textblock.innerText || textblock.textContent;
		if (textcontent && textcontent.length > 1) return false;
		
		// If the node contains no textual content and no <br> or <img> tags then it is empty
		brs = textblock.getElementsByTagName("br");
		imgs = textblock.getElementsByTagName("img");
		if (brs.length === 0 && imgs.length === 0) return true;
		
		// Otherwise check for non MozDirty <br>'s
		for(i = 0; i < brs.length; i += 1) {
			if(brs[i].MozDirty === undefined && !/moz_dirty/.test(brs[i].className)) return false;
		}
		
		// If none are found then it's empty
		return true;
	};
	
	_textblock.isFirst = function (textblockelem) {
		var rootnode, i;
		rootnode = ghostedit.el.rootnode;
		for(i = 0; i < rootnode.getElementsByTagName("*").length; i += 1) {
			if(rootnode.getElementsByTagName("*")[i].getAttribute("data-ghostedit-elemtype") === "textblock") {
				if(rootnode.getElementsByTagName("*")[i] === textblockelem) {
					return true;
				}
				else {
					return false;
				}
			}
		}
	};
	
	_textblock.isLast = function (textblockelem) {
		var rootnode, i;
		rootnode = ghostedit.el.rootnode;
		for(i = rootnode.getElementsByTagName("*").length - 1; i > 0; i -= 1) {
			if(rootnode.getElementsByTagName("*")[i].getAttribute("data-ghostedit-elemtype") === "textblock") {
				if(rootnode.getElementsByTagName("*")[i] === textblockelem) {
					return true;
				}
				else {
					return false;
				}
			}
		}
	};
	
	_textblock.count = function () {
		var rootnode, childCount, i;
		rootnode = ghostedit.el.rootnode;
		childCount = 0;
		for(i = 0; i < rootnode.getElementsByTagName("*").length; i += 1) {
			if(rootnode.getElementsByTagName("*")[i].getAttribute("data-ghostedit-elemtype") === "textblock") {
				childCount += 1;
			}
		}
		return childCount;
	};
	
	_textblock.create = function (elemtype, content, id) {
		var newElem;
		
		// If explicit id not passed, get next blockElemId
		if (!id) {
			ghostedit.blockElemId += 1;
			id = 'ghostedit_textblock_' + ghostedit.blockElemId;
		}
		
		// If no content sent, set to default content of ""      ---"Edit Here!"
		content = (content && ((content.length && content.length > 0) || content.nodeType)) ? content : "";//"Edit Here!";
		
		// Create element, and assign id and content
		newElem = document.createElement(elemtype);
		newElem.id = id;
		if (content.nodeType) {
			content = ghostedit.dom.parse(content, {"textnode": { "clean": true }, "tags": { "b": {}, "i": {}, "u": {}, "strong": {}, "em": {}, "strike": {}, "br": {} } });
			if (content) newElem.appendChild(content);
		}
		else {
			newElem.innerHTML = content;
		}
		
		// Set GhostEdit handler attributes
		newElem.setAttribute("data-ghostedit-iselem", "true");
		newElem.setAttribute("data-ghostedit-elemtype", "textblock");
		newElem.setAttribute("data-ghostedit-handler", "textblock");
		
		// Add event handlers
		newElem.ondragenter = function(){return false;};
		newElem.ondragleave = function(){return false;};
		newElem.ondragover = function(){return false;};
		newElem.ondrop = function(e){
			var elem, elemid;
			// This function does basic image paragraph changing dnd
			elemid = e.dataTransfer.getData("Text") || e.srcElement.id;
			//alert(elemid); TODO drag drop
			elem = document.getElementById(elemid);
			elem.parentNode.insertBefore(elem,this);
			ghostedit.image.focus(elem);
			};
		newElem.onresizestart = function(e) {return ghostedit.util.cancelEvent(e);};
		
		// Tidy MozBr's in new element
		_textblock.mozBrs.tidy(newElem);
		
		return newElem;
	};
	
	_textblock.remove = function (textblockelem) {
		var savedElemContent, rootnode, focuselem, i, thisone, textblockelems;

		ghostedit.selection.save();
		ghostedit.history.saveUndoState();
		
		// If textblock elem still contains content, save to variable for appending to previous textblock elem
		savedElemContent = "";
		savedElemContent = textblockelem.innerHTML;
		
		// Cycle through textblock elements backwards to select the one before the current one to focus
		rootnode = ghostedit.el.rootnode;
		textblockelems = rootnode.getElementsByTagName("*");
		thisone = false;
		for(i = textblockelems.length - 1; i >= 0; i -= 1) {
			if (thisone === true && textblockelems[i].getAttribute("data-ghostedit-elemtype") === "textblock") {
				focuselem = textblockelems[i];
				break;
			}
			else if (textblockelems[i] === textblockelem) {
				thisone = true;
			}
		}
		
		// If focuselem is empty, delete it instead (intuitive behaviour)
		if (_textblock.isEmpty(focuselem)) {
			rootnode.removeChild(focuselem);
			
			lasso().setCaretToStart(textblockelem).select();
			
			ghostedit.selection.save();
			ghostedit.history.saveUndoState();
			return;
		}
		
		
		// Remove textblock elem
		rootnode.removeChild(textblockelem);
		
		// Set caret to end of focuselem
		lasso().setCaretToEnd(focuselem).select();
		ghostedit.selection.save();
		
		// Add saved content
		focuselem.innerHTML += "<span id='ghostedit_marker'>&#x200b;</span>" + savedElemContent;
		
		// Sort out MozBr's (one at very end of elements, that's it)
		_textblock.mozBrs.tidy(focuselem);
		
		// Place caret in correct place
		lasso().selectNode('ghostedit_marker').deleteContents().select();
		if (document.getElementById('ghostedit_marker')) {
			document.getElementById('ghostedit_marker').parentNode.removeChild(document.getElementById('ghostedit_marker'));
		}
		

		ghostedit.selection.save();
		ghostedit.history.saveUndoState();
	};
	
	_textblock.focus = function (target) {
		if (!target || target.nodeType !== 1 || target.getAttribute("data-ghostedit-elemtype") !== "textblock") return false;
		
		lasso().setCaretToEnd(target).select();
		ghostedit.selection.save();
		return true;
	};
	
	_textblock.merge = function (block1, block2, collapse) {
		var block1type, block2type, parent, handler;
		
		// If collapse === false don't merge
		if (collapse === false) return block1;
		
		// If blocks are same node, return that node
		if (block1 === block2) return block1;
		
		block1type = block1.getAttribute("data-ghostedit-elemtype");
		block2type = block2.getAttribute("data-ghostedit-elemtype");
		
		// If one of the blocks isn't a textblock, return false
		if (block1type !== "textblock" || block2type !== "textblock") return false;
		
		// Otherwise, append block2content to block1 and delete block2
		block1.innerHTML += "<span id='ghostedit_marker'>&#x200b;</span>" + block2.innerHTML;
		parent = block2.parentNode;
		handler = parent.getAttribute("data-ghostedit-handler");
		ghostedit.plugins[handler].dom.removechild(parent, block2);
		_textblock.mozBrs.tidy(block1);
		lasso().selectNode("ghostedit_marker").select();//.deleteContents();
		document.getElementById("ghostedit_marker").parentNode.removeChild(document.getElementById("ghostedit_marker"));
		return block1;
	};
	
	_textblock.split = function (elem, splitpoint) {
		var wheretoinsert, atstart, atend, elemtype, savedElemContent, range, result, newTextBlock, parent, handler, useselection;
		
		useselection = false;
		if (!splitpoint || !splitpoint.isLassoObject) {
			ghostedit.selection.save();
			if (ghostedit.selection.saved.type !== "textblock") return false;
			splitpoint = ghostedit.selection.saved.data;
			useselection = true;
		}
		splitpoint = splitpoint.clone().collapseToStart();
		
		atstart = (_textblock.selection.isAtStartOfTextBlock() === true) ? true : false;
		atend = (_textblock.selection.isAtEndOfTextBlock() === true) ? true : false;
		wheretoinsert = (atstart && !atend) ? "before" : "after";
		elemtype = (wheretoinsert === "before" || atend) ? "p" : _textblock.selection.getStartTextBlockNode().tagName;
		
		//console.log("atstart - " + atstart+ "\natend - " + atend + "\nwhere - " + wheretoinsert);
		
		// Tidy MozBr's in original element
		_textblock.mozBrs.tidy(elem);
		
		// Save and the delete the content after the caret from the original element
		if(!atstart && !atend) {//wheretoinsert === "after") {
			if (document.createRange) {
				range = lasso().selectNodeContents( elem ).setStartToRangeStart(splitpoint); // Odd bug (at least in chrome) where savedRange is already to the end.
				savedElemContent = range.getHTML();
				range.deleteContents();
			}
			else if (document.selection) {		
				// Bookmark lines allow innerHTML to be modified as long as it is put back to how it was
				/*savedrange = ghostedit.selection.savedRange.getNative().getBookmark();
				range = lasso().selectNodeContents( elem );
				ghostedit.selection.savedRange.getNative().moveToBookmark(savedrange);
				range.getNative().setEndPoint("StartToEnd", ghostedit.selection.savedRange.getNative());*/
				range = lasso().selectNode(elem);
				range.setStartToRangeEnd(splitpoint);
				savedElemContent = range.getHTML();
				range.getNative().text = "";
			}
		}
		else {
			savedElemContent = "";
		}
		
		/*result = _textblock.insert(elem, elemtype, false, wheretoinsert, savedElemContent); */
		
		// Create new element for inserting
		newTextBlock = _textblock.create(elemtype, savedElemContent);
		if (!newTextBlock) return false;
		
		// Ask (ghost) parent to insert new element into page
		parent = ghostedit.dom.getParentGhostBlock(elem);
		handler = parent.getAttribute("data-ghostedit-handler");
		result = ghostedit.plugins[handler].dom.addchild (parent, wheretoinsert, elem, newTextBlock, {"contentlength": savedElemContent.length});
		
		if (!result) return false;
		/* IF !result, replace saved and deleted content after cursor */
		
		// Workaround for ie (6?) bug which doesn't allow an empty element to be selected
		newTextBlock.innerHTML = "dummy";
		lasso().selectNode(newTextBlock).select();
		newTextBlock.innerHTML = savedElemContent;
		
		// Tidy MozBrs (previous code section often) removes all MozBrs)
		_textblock.mozBrs.tidy(newTextBlock);
		
		// Set caret to start of new element
		if(wheretoinsert === "before") {
			range = lasso().setCaretToBlockStart(elem);
		}
		else {
			range = lasso().setCaretToBlockStart(newTextBlock);
		}
		
		// If using selection, set caret to range position
		if (useselection) {
			range.select();
			ghostedit.selection.save();
		}
		
		// block1 = first in dom; block2 = second in dom
		return {
			"block1": wheretoinsert === "before" ? newTextBlock : elem,
			"block2": wheretoinsert === "before" ? elem :newTextBlock,
			"caretposition": range
		};
	};
	
	_textblock.mozBrs = {		
		checkifcontains: function (node) {
			var elements, i;
			elements = node.getElementsByTagName("br");
			
			for(i = 0; i < elements.length; i += 1) {
				if(elements[i].MozDirty !== undefined) return true;
			}
			
			return false;
		},
		
		insert: function (elem) {
			var brNode;
			brNode = document.createElement("br");
			brNode.setAttribute("_moz_dirty", "");
			brNode.className = "moz_dirty";
			elem.appendChild(brNode);
		},
		
		clear: function (node) {
			var elements, i;
			elements = node.getElementsByTagName("br");
			
			for(i = 0; i < elements.length; i += 1) {
				if(elements[i].MozDirty !== undefined || /moz_dirty/.test(elements[i].className)) {
					elements[i].parentNode.removeChild(elements[i]);
					i--; //One less element in live list, so decrease iterator
				} 
			}
		},
		
		tidy: function (elem) {
			_textblock.mozBrs.clear(elem);
			if(ghostedit.useMozBr) {
				_textblock.mozBrs.insert(elem);
			}
		}
		
	};
	
	_textblock.insert = {
		character: function (character) {
			if(ghostedit.selection.saved.type === "textblock") {
				ghostedit.selection.restore();
				ghostedit.selection.savedRange.pasteText(character);
			}
		},
		
		br: function () {
			//var isEmpty = false;
			var s, newBr, r;
			if (window.getSelection) {
				s = window.getSelection();
				s.getRangeAt(0).collapse(false);
				newBr = document.createElement("br");
				newBr.id = "newBr";
				s.getRangeAt(0).insertNode(newBr);
				s.getRangeAt(0).selectNode(newBr.parentNode);
				//alert(newBr.nextSibling);
				r = document.createRange();
				r.setStartAfter(newBr);
				r.setEndAfter(newBr);
				s.removeAllRanges();
				s.addRange(r);
				document.getElementById("newBr").removeAttribute("id");
			}
			else if (document.selection) { 
				r = document.selection.createRange();
				r.collapse(false);
				r.pasteHTML("<br id='newBr' />");
				r.moveToElementText(document.getElementById("newBr"));
				r.collapse(false);
				r.select();
				document.getElementById("newBr").removeAttribute("id");
			}
		}
	};
		
	_textblock.format = {
		init: function () {
			
			ghostedit.api.format = ghostedit.api.format || {};
			
			ghostedit.api.format.setStyle = function (tagname, newclass) {
				_textblock.format.formatSelected(_textblock.format.setTagType, {"tagname": tagname,"newclass": newclass});
			};
			
			ghostedit.api.format.alignText = function (alignDirection) {
				if (!/left|right|center|justify/.test(alignDirection)) return false;
				_textblock.format.formatSelected(_textblock.format.alignText, {"alignDirection": alignDirection});
			};
			
			ghostedit.api.format.bold = function () {
				_textblock.format.formatSelected(_textblock.format.bold);
			};
			
			ghostedit.api.format.italic = function () {
				_textblock.format.formatSelected(_textblock.format.italic);
			};
			
			ghostedit.api.format.underline = function () {
				_textblock.format.formatSelected(_textblock.format.underline);
			};
			
			ghostedit.api.format.strikethrough = function () {
				_textblock.format.formatSelected(_textblock.format.strikethrough);
			};
			
			ghostedit.api.format.textColor = function (color) {
				_textblock.format.formatSelected(_textblock.format.textColor, {"color": color});
			};
		},
		
		useCommand: function (commandType, param) {
			//var i, nodes, node, selrange, startofblock, endofblock;
			//if (typeof param == "undefined") { param = null; }
			//if (ghostedit.selection.saved.type !== "text") return false;
			//ghostedit.history.saveUndoState();
			document.execCommand(commandType, false, param);
			//ghostedit.selection.save();
			//ghostedit.history.saveUndoState();
		},
		
		getNextNode: function (node) {
			if (node.firstChild) return node.firstChild;
			while (node) {
				if (node.nextSibling) return node.nextSibling;
				node = node.parentNode;
			}
		},
		
		getNodesInRange: function (range) {
			var start = range.getStartNode(),
			end = range.getEndNode(),
			commonAncestor = range.getParentNode(),
			nodes = [],
			node;
			
			// walk parent nodes from start to common ancestor
			for (node = start.parentNode; node; node = node.parentNode) {
				nodes.push(node);
				if (node === commonAncestor) break;
			}
			nodes.reverse();
			
			// walk children and siblings from start until end is found
			for (node = start; node; node = _textblock.format.getNextNode(node)) {
				nodes.push(node);
				if (node === end) break;
			}
			
			return nodes;
		},
		
		useCommandOnWord: function (command) {
			var range, marker;
			if (ghostedit.selection.savedRange.isCollapsed() && _textblock.selection.getStartTextBlockNode()) {
				range = ghostedit.selection.savedRange.clone();
				if (document.createRange) {
					marker = document.createElement("span");
					marker.id = "ghostedit_marker";
					range.getNative().insertNode(marker);
				}
				if (!document.createRange && document.selection) {
					range.getNative().pasteHTML("<span id='ghostedit_marker'>z</span>");
				}
				range.selectNode("ghostedit_marker");
				range = _textblock.selection.extendtoword(range, true);
				range.select();
			}
			/* Placing cursor inside empty <b> doesn't work in ie <=8 (might work in 6/7)
			if (range.isCollapsed() && document.selection) {
				if (document.selection) {
					range.getNative().pasteHTML("<b><span id='ghostedit_marker'>&#x200b;</span></b>");
					alert(lasso().selectNodeContents("ghostedit_marker").getHTML());//.select().deleteContents();
					//document.getElementById("ghostedit_newnode").innerHTML = "";
					//document.getElementById("ghostedit_newnode").id = "";
				}
			}
			else {*/
			_textblock.format.useCommand(command);
			
			if (document.getElementById("ghostedit_marker")) {
				lasso().selectNode("ghostedit_marker").select();
				document.getElementById("ghostedit_marker").parentNode.removeChild(document.getElementById("ghostedit_marker"));
			}
			ghostedit.selection.save();
		},
		
		bold: function () {
			_textblock.format.useCommand("bold");
		},
		
		italic: function () {
			_textblock.format.useCommand("italic");
		},
		
		underline: function () {
			_textblock.format.useCommand("underline");
		},
		
		strikethrough: function () {
			_textblock.format.useCommand("strikethrough");
		},
		
		textColor: function (color) {
			_textblock.format.useCommand("foreColor",color);
		},
		
		
		formatSelected: function (formatFunc, params) {
			var elem, startpara, endpara, oldelem, doend, i, descendantblocks;
			ghostedit.selection.save();
			ghostedit.history.saveUndoState();
			
			startpara = _textblock.selection.getStartTextBlockNode();
			endpara = _textblock.selection.getEndTextBlockNode();
		
			if (startpara && endpara) {
				elem = startpara;
				doend = false;
				do {
					if (elem === ghostedit.el.rootnode || elem === null) break;
					
					
					
					if (_textblock.isTextBlock(elem)) {
						if (elem === endpara) doend = true;
						elem = _textblock.format.formatTextBlock(elem, ghostedit.selection.saved.data.clone(), formatFunc, params);
						if (doend) break;
						elem = elem.nextSibling ? elem.nextSibling : elem.parentNode;
						continue;
					}
					else if (ghostedit.dom.isDescendant(elem, endpara)) {
						elem = ghostedit.dom.getFirstChildElement(elem);
						continue;
					}
					else {
						oldelem = elem; //necessary because setTagType kills list item (and if no list item, then no nextSibling)
						elem = elem.nextSibling ? elem.nextSibling : elem.parentNode;
							
						descendantblocks = oldelem.getElementsByTagName("*");
						for(i = 0; i < descendantblocks.length; i += 1) {
							if (_textblock.isTextBlock(descendantblocks[i])) {
								_textblock.format.formatTextBlock(descendantblocks[i], ghostedit.selection.saved.data.clone(), formatFunc, params);
							}
						}
					}
					
				
				}
				while (true);
				
				ghostedit.selection.save();
				ghostedit.history.saveUndoState();
			}
			
			
			ghostedit.history.saveUndoState();
		},
		
		formatTextBlock: function (textblock, range, formatFunc, params) {
			var startofblock, endofblock, newelem;
			
			if (!params) params = {};
			params.textblock = textblock;
			
			// Clone range to avoid reference errors
			range = range.clone();
			
			// Ranges representing the start and end of the block
			startofblock = lasso().setCaretToStart(textblock);
			endofblock = lasso().setCaretToEnd(textblock);
			
			// If range doesn't intersect textblock return false
			//console.log(range.compareEndPoints("EndToStart", startofblock));
			//console.log(range.compareEndPoints("StartToEnd", endofblock));
			if (range.compareEndPoints("EndToStart", startofblock) === -1 || range.compareEndPoints("StartToEnd", endofblock) === 1) return false;
			
			// If range starts before block, move start of selrange to start of block
			if (range.compareEndPoints("StartToStart", startofblock) === -1) range.setStartToRangeStart(startofblock);
			
			// If range end after block, move end of selrange to end of block
			if (range.compareEndPoints("EndToEnd", endofblock) === 1) range.setEndToRangeEnd(endofblock);
			
			ghostedit.selection.saved.data.clone().saveToDOM("ghostedit_format");
			//if(textblock.id === "ghostedit_textblock_4") return;
			range.select();
			newelem = formatFunc(params);
			
			lasso().restoreFromDOM("ghostedit_format").select();
			ghostedit.selection.save();
			
			return newelem && newelem.nodeType !== undefined ? newelem : textblock;
		},
		
		alignText: function(params) {
				var elem = lasso().setToSelection().getParentElement();
				while (!ghostedit.dom.isGhostBlock(elem)) {
					elem = elem.parentNode;
					if (elem === null) return false;
				}
				if (!_textblock.isTextBlock(elem)) return false;
				elem.style.textAlign = params.alignDirection;
		},
		

		// .tagName is readonly -> need to remove element and add new one
		setTagType: function (params) {
			var target, tagtype, newclass, parent, targetid, newTextBlock;
			
			target = params.textblock;
			tagtype = params.tagname;
			newclass = params.newclass;
			
			// Retrieve target node
			//target = target || ghostedit.selection.nodepath[0];
			if (!_textblock.isTextBlock(target)) return false;
			
			// Save id of target
			targetid = 'ghostedit_textblock_' + target.id.replace("ghostedit_textblock_","");
			
			// Create replacement element, and copy over attributes/html
			newTextBlock = _textblock.create(tagtype);
			newTextBlock.appendChild(ghostedit.dom.extractContent(target));
			_textblock.mozBrs.tidy(newTextBlock);
			newTextBlock.setAttribute("style", target.getAttribute("style"));
			if (newclass !== undefined) newTextBlock.className = newclass;

			
			// Use naive DOM manipulation because just doing an in place swap
			parent = target.parentNode;
			target.id = "";
			parent.insertBefore(newTextBlock, target);
			parent.removeChild(target);
			
			// Set id of new TextBlock
			newTextBlock.id = targetid;
			
			return newTextBlock;
		}
	};
	
	ghostedit.api.plugin.register("textblock", _textblock);
})(window);
(function (window, undefined) {
	
	var _container = {},
	lasso = window.lasso,
	ghostedit = window.ghostedit;
	
	_container.enable = function () {
		return true;
	};
		
	_container.dom = {
	
		addchild: function (target, wheretoinsert, anchorelem, newElem) {
			
			if (wheretoinsert === "before") {
				target.insertBefore(newElem, anchorelem);
			}
			else {
				if (anchorelem.nextSibling !== null) {
					target.insertBefore(newElem, anchorelem.nextSibling);
				}
				else {
					target.appendChild(newElem);
				}
			}
			
			return true;
		},
		
		removechild: function (target, child) {
			if (!target || !child) return false;
			
			target.removeChild(child);
			
			return true;
		}
		
		// Not currently needed, but comments left for easier future implementation
		/*deleteevent: function (target, sourcedirection, params) {
			switch (sourcedirection) {
				case "ahead":
					// Backspace was pressed at the start of the element after the container
				break;
				case "behind":
					// Delete was pressed at the end of the element before the container
				break;
				case "top":
					// Backspace was pressed at the start of the first child GhostBlock of the container
				break;
				case "bottom":
					// Delete was pressed at the end of the last child GhostBlock the container
				break;
			}
			return false;
		}*/
	};
		
	_container.selection = {
		deleteContents: function (container, collapse) {
			var i, 
			firstchildblock, lastchildblock, startofblock, endofblock, atverystart = false, atveryend = false,
			startblock, endblock, cblock, startcblock, endcblock, childblocks, dodelete, selrange, handler;
			
			// Temporary selection range to avoid changing actual saved range
			if(ghostedit.selection.saved.type !== "textblock") return false;
			selrange = ghostedit.selection.saved.data;
			
			// Get first and last child ghostblock
			childblocks = container.childNodes;
			firstchildblock = ghostedit.dom.getFirstChildGhostBlock(container);
			lastchildblock = ghostedit.dom.getLastChildGhostBlock(container);
			
			// Ranges representing the start and end of the block
			startofblock = lasso().setCaretToStart(firstchildblock);
			endofblock = lasso().setCaretToEnd(lastchildblock);
			
			// If selrange starts before or at block, set startblock to the first child ghostblock
			if (selrange.compareEndPoints("StartToStart", startofblock) !== 1) {
				atverystart = true;
				startblock = firstchildblock;
			}
			// Otherwise, set child ghostblock containing the start of the selection
			else {
				startblock = selrange.getStartNode();
				if (!ghostedit.dom.isGhostBlock(startblock)) startblock = ghostedit.dom.getParentGhostBlock(startblock);
			}
			
			// If selrange ends after or at block, set endblock to the last child ghostblock
			if (selrange.compareEndPoints("EndToEnd", endofblock) !== -1) {
				atveryend = true;
				endblock = lastchildblock;
			}
			// Otherwise, set child ghostblock containing the end of the selection
			else {
				endblock = selrange.getEndNode();
				if (!ghostedit.dom.isGhostBlock(endblock)) endblock = ghostedit.dom.getParentGhostBlock(endblock);
			}
			
			startcblock = startblock;
			while(!ghostedit.dom.isChildGhostBlock(startcblock, container)) startcblock = ghostedit.dom.getParentGhostBlock(startcblock);
			endcblock = endblock;
			while(!ghostedit.dom.isChildGhostBlock(endcblock, container)) endcblock = ghostedit.dom.getParentGhostBlock(endcblock);
			
			//alert(startblock.id + endblock.id);
					
			
			/*//Handle selectall case
			if (isatverystart && isatveryend) {
				dodelete = false;
				firsttextblocktype = textblockelems[i].tagName.toLowerCase();
				for(i = 0; i < childblocks.length; i += 1) {
					if (childblocks[i].getAttribute("data-ghostedit-elemtype") !== undefined && childblocks[i].getAttribute("data-ghostedit-elemtype") !== false) {
						firstchildblock = childblocks[i];
						break;
					}
				}
				lasso().setCaretToStart(firstchildblock).select();
				return true;
			}*/
			
			//ghostedit.textblock.selection.deleteContents(lastchildblock);
			
			//alert("start - " + startblock.id + "\nend - " + endblock.id);
			
			// Cycle through SELECTED child ghostblocks and call delete method
			dodelete = false;
			for(i = 0; i < childblocks.length; i += 1) {
				
				cblock = childblocks[i];
				if ( !ghostedit.dom.isGhostBlock(cblock) ) continue;
				handler = cblock.getAttribute("data-ghostedit-handler");
				
				if (cblock.id === startcblock.id) {
					ghostedit.plugins[handler].selection.deleteContents( cblock );
					dodelete = true;
					continue;
				}
				else if (cblock.id === endcblock.id) {
					ghostedit.plugins[handler].selection.deleteContents( cblock );
					dodelete = false;
					break;
				}
				
				if (dodelete) {
					container.removeChild(childblocks[i]);
					i--;
				}
					
			}
			
			
			// If the first and last elements in the selection are the same type, then merge
			if(startcblock.getAttribute("data-ghostedit-elemtype") === endcblock.getAttribute("data-ghostedit-elemtype")) {
				lasso().setToSelection().saveToDOM("ghostedit_container_deleteselection");
				ghostedit.plugins[startcblock.getAttribute("data-ghostedit-elemtype")].merge(startcblock, endcblock, collapse);
				lasso().restoreFromDOM("ghostedit_container_deleteselection").select();
				//if (!ghostedit.dom.getParentGhostBlock(endcblock)) lasso().setToSelection().collapseToStart().select();
				//^^tests whether endcblock is still in the document, i.e. whether a merge took place
			}
			
			// If container has no children left, create empty <p> element
			if (!ghostedit.dom.getFirstChildGhostBlock(container)) {
				container.appendChild(ghostedit.plugins.textblock.create("p"));
			}
			
			// Place caret where the selection was
			//lasso().setCaretToStart(endelem).select();

			return true;
		}
	};
	
	_container.inout = {
		importHTML: function (sourcenode) {
			var container, result, i, elemcount, elem, tagname;
			if (!sourcenode || sourcenode.childNodes.length < 1) return false;
			
			container = _container.create();
			
			// For each source child node, check if appropriate import handler exists, if so then call it on the node
			for (i = 0; i < sourcenode.childNodes.length; i += 1) {
				elem = sourcenode.childNodes[i];
				if (elem.nodeType !== 1 && elem.nodeType !== 3)  continue;
				
				tagname = (elem.nodeType === 3) ? "#textnode" : elem.tagName.toLowerCase();
				/*if (handler = ghostedit.inout.importhandlers[tagname]) {
					result = ghostedit.plugins[handler].inout.importHTML(elem)
					if (result && ghostedit.dom.isGhostBlock(result)) {
						container.appendChild(result);
					}
				}*/
				if (ghostedit.inout.importhandlers[tagname]) {
					result = ghostedit.inout.importhandlers[tagname].call(this, elem);
					if (result && ghostedit.dom.isGhostBlock(result)) {
						container.appendChild(result);
					}
				}
				else if (elem.childNodes.length > 0) {
					elemcount = elem.childNodes.length;
					elem.parentNode.insertBefore(ghostedit.dom.extractContent(elem), elem);
					elem.parentNode.removeChild(elem);
					i -= 1;
				}
			}
			
			// Check any GhostBlock children have been added, else add empty paragraph
			if (!ghostedit.dom.getFirstChildGhostBlock(container)) {
				container.appendChild(ghostedit.plugins.textblock.create("p"));
			}
			
			return container;
		},
		
		exportHTML: function (target/*, includeself*/) { // Shouldn't be used without first using export prepare functions
			if (!target || !ghostedit.dom.isGhostBlock(target) || target.getAttribute("data-ghostedit-elemtype") !== "container") return false;
			var i = 0, elem, blockreturn, finalCode = "", blockcount = 0, snippet, handler;
			
			//if (target.getAttribute("data-ghostedit-isrootnode") === true) isrootnode = true;
			
			// Allows for inclusion of enclosing <div> if wanted in future, may also want to retreieve properties
			//if (includeself === true) finalCode =+ "<div>";
			
			for (i = 0; i < target.childNodes.length; i += 1) {
				elem = ghostedit.dom.isGhostBlock( target.childNodes[i] ) ? target.childNodes[i] : false;
				if (!elem) continue;
				
				handler = elem.getAttribute("data-ghostedit-handler");
				if (!handler || !ghostedit.plugins[handler]) continue;
				
				blockreturn = ghostedit.plugins[handler].inout.exportHTML(elem);
				
				if (blockreturn) {
					finalCode += blockreturn.content;
					blockcount++;
				}
				
				//Create snippet from first 3 paragraphs
				if (blockcount <= 3){
					snippet = finalCode;
				}
			}
			
			return {content: finalCode, snippet: snippet};
		}
	};
	
	_container.paste = {
		handle: function (target, source, position) {
			var sel, anchor, newnode, dummy;
			if (!ghostedit.dom.isGhostBlock(target) || !ghostedit.dom.isGhostBlock(source)) return false;
			//if (position.isfirst || position.islast) return false;
			
			sel = ghostedit.selection.saved.data;
			anchor = sel.clone().collapseToStart().getParentElement();
			sel.saveToDOM("ghostedit_paste_start");
			
			if (anchor === target) {
				/* Just use range marker as dummy elem
				dummy = document.createElement("span");
				dummy.innerHTML = "&#x200b";
				dummy.id = "ghostedit_paste_dummy";
				sel.clone().collapseToStart().insertNode(dummy);*/
				dummy = document.getElementById("ghostedit_paste_start_range_start");
				anchor = ghostedit.dom.getPreviousSiblingGhostBlock(dummy) || dummy;
			}
			
			while (anchor.parentNode !== target) {
				anchor = anchor.parentNode;
				if (anchor === null || !anchor.parentNode) return true;
			}

			newnode = source.cloneNode(true);
			/*if (position.islast) {
				sel.removeDOMmarkers("ghostedit_paste");
				newnode.innerHTML = "<span id='ghostedit_paste_range_end'>&#x200b;</span>" + newnode.innerHTML;
			}
			else {
				document.getElementById("ghostedit_paste_range_start").parentNode.removeChild(document.getElementById("ghostedit_paste_range_start"));
			}*/
			lasso().removeDOMmarkers("ghostedit_paste_start");
			newnode.innerHTML += "<span id='ghostedit_paste_start_range_start' class='t3'>&#x200b;</span>";
			
			_container.dom.addchild(target, "after", anchor, newnode);
			
			if (dummy && dummy.parentNode) dummy.parentNode.removeChild(dummy);
			return true;
			
		}
	};
	
	// TODO remove this function is favour of dom.isChildGhostBlock
	_container.isChildGhostBlock = function (elem, childblocks) {
		var i;
		if (!elem) return false;
		if (elem.nodeType !== 1) return false;
		if (elem.getAttribute("data-ghostedit-elemtype") === undefined) return false;
		if (elem.getAttribute("data-ghostedit-elemtype") === false) return false;
		if (elem.getAttribute("data-ghostedit-elemtype") === null) return false;
		for(i = 0; i < childblocks.length; i += 1) {
			if (elem === childblocks[i]) {
				return true;
			}
		}
		return false;
	};
	
	_container.create = function () {
		var newElem;
		// Create element, and assign id and content
		newElem = document.createElement("div");
		ghostedit.blockElemId += 1;
		newElem.id = "ghostedit_container_" + ghostedit.blockElemId;
		
		// Set GhostEdit handler attributes
		newElem.setAttribute("data-ghostedit-iselem", "true");
		newElem.setAttribute("data-ghostedit-elemtype", "container");
		newElem.setAttribute("data-ghostedit-handler", "container");
		
		return newElem;
	};
	
	_container.focus = function (target) {
		var firstchild, handler;
		if (!target || target.nodeType !== 1 || target.getAttribute("data-ghostedit-elemtype") !== "container") return false;
		
		// Get first child of container
		firstchild = ghostedit.dom.getFirstChildGhostBlock (target);
		if (!firstchild) return false;
		
		handler = firstchild.getAttribute("data-ghostedit-handler");
		ghostedit.plugins[handler].focus(firstchild);
		
		return true;
	};
	
	ghostedit.api.plugin.register("container", _container);
})(window);
(function (window, undefined) {
	var _image= {
		elemid: 0,
		focusedimage: null, 
		justResized: false, //prevents loss of image focus after rezise in IE
		originalMouseX: null, originalMouseY: null, //Image resize variables
		buttons: [],
		el: {}
	},
	lasso = window.lasso,
	ghostedit = window.ghostedit;
	
	_image.enable = function () {
		// Register event listeners
		//ghostedit.event.addListener ("history:undo:before", function () { _image.unfocus(); });
		//ghostedit.event.addListener ("history:redo:before", function () { _image.unfocus(); });
		//ghostedit.event.addListener ("export:before", function () { _image.unfocus(); });
		
		ghostedit.event.addListener ("history:undo:after", function () { _image.applyeventlisteners(); });
		ghostedit.event.addListener ("history:redo:after", function () { _image.applyeventlisteners(); });
		ghostedit.event.addListener ("clipboard:paste:after", function () { _image.applyeventlisteners(); });
		
		
		
		ghostedit.event.addListener ("selection:change", function () {
			if (ghostedit.selection.saved.type === "image") {
				lasso().clearSelection();
				_image.el.keycapture.focus();
			}
			else {
				_image.ui.hide();
			}
		});
		
		// Register import capbability
		ghostedit.inout.registerimporthandler (_image.inout.importHTML, "img");
		
		// Register default options
		if (!ghostedit.options.image) ghostedit.options.image = {};
		if (!ghostedit.options.image.disableresize) ghostedit.options.image.disableresize = false;
		if (!ghostedit.options.image.flexibleimages) ghostedit.options.image.flexibleimages = false;
		
		// Add form to capture keystrokes when an image has focus
		var form = document.createElement("form");
		form.id = "ghostedit_image_focusform";
		form.style.cssText = "margin:0px;padding:0px;height:0px;width:0px;overflow:hidden;line-height: 0px;position: absolute;left: 0; top: 0";
		
		var textarea = document.createElement("textarea");
		textarea.id = "ghostedit_image_keycapturearea";
		textarea.style.cssText = "margin:0px;padding:0px;height:0px;width:0px;overflow:hidden;line-height: 0px";
		textarea.onkeypress = ghostedit.util.cancelEvent;
		textarea.onkeydown = _image.event.keydown;
		_image.el.keycapture = textarea;
		
		form.appendChild(textarea);
		ghostedit.el.uilayer.appendChild(form);
		
		// Export api functions
		ghostedit.api.image = ghostedit.api.image || {};
		
		ghostedit.api.image.updatealttext = function (value) {
			return _image.updatealttext(value);
		};
	};
	
	_image.event = {
		keydown: function (e) {
			e = window.event ? window.event : e;
			var keycode = e.keyCode !== null ? e.keyCode : e.charCode;
			
			switch(keycode) {
				case 8:
				case 46:
					_image.remove(e);
				break;
				case 90:
					if (e.ctrlKey) {
						ghostedit.history.undo ();
					}
				break;
				case 89:
					if (e.ctrlKey) {
						ghostedit.history.redo ();
					}
				break;
				case 37:
					_image.move.align("left", e);
				break;
				case 38:
					_image.move.up(e);
				break;
				case 39:
					_image.move.align("right", e);
				break;
				case 40:
					_image.move.down(e);
				break;
			}
			return ghostedit.util.cancelEvent ( e );
		}
	};
	
	_image.selection = {
		compare: function (image1, image2) {
			if (!image1 || !image2) return false;
			return (image1 === image2) ? true : false;
		},
		
		restore: function (image) {
			if (!image || !image.tagName || image.tagName.toLowerCase() !== "img") return false;
			_image.focus(image);
			return true;
		},
		
		deleteContents: function() {
			//Do nothing (images shouldn't be deleted via selection if only partially selected)
			return true;
		}
	};
	
		_image.inout = {
		importHTML: function(source) {
			var newimg, nw, nh;
			
			// Create image element using source image's src				
			newimg = _image.create(source.src);
			if (!newimg) return false;
			
			// Apply attributes
			if (source.className.length > 0 && !/ghostedit/.test(source.className)) {
				newimg.className = source.className;
			}
			newimg.alt = source.alt;
			newimg.title = source.title;
			
			nw = newimg.width;
			nh = newimg.height;
			
			newimg.naturalWidth = newimg.naturalWidth || nw;
			newimg.naturalHeight = newimg.naturalHeight || nh;
			newimg.setAttribute("data-ghostedit-nativewidth", nw);
			newimg.setAttribute("data-ghostedit-nativeheight", nh);
			
			if(!ghostedit.options.image.flexibleimages) {
				newimg.style.width = source.style.width;
				newimg.style.height = ((newimg.style.width.replace("px", "") / nw) * nh) + "px";
				/*editorw = ghostedit.wrapdiv.offsetWidth;// - ghostedit.el.rootnode.style.paddingLeft.replace("px", "") - ghostedit.el.rootnode.style.paddingRight.replace("px", "");
				if (newimg.style.width.replace("px", "") > 0 && newimg.style.width.replace("px", "") < editorw) {
					newimg.style.width = "200px";
				*/
			}
			
			newimg.style.cssFloat = source.style.cssFloat;
			newimg.style.styleFloat = source.style.styleFloat;
			newimg.style.clear = source.style.clear;
			if (source.style.cssFloat === "right" || source.style.styleFloat === "right") {
				newimg.style.marginLeft = "20px";
				newimg.style.marginRight = "0px";
			}
			else {
				newimg.style.marginLeft = "0px";
				newimg.style.marginRight = "20px";
			}
			
			// TODO import:after event which resizes too big images
			
			return newimg;
		},
		
		exportHTML: function (target) {
			if (!target || !ghostedit.dom.isGhostBlock(target) || target.getAttribute("data-ghostedit-elemtype") !== "image") return false;	
			var finalCode = "", elem;
			elem = target;
			
			finalCode += "<img src='" + elem.src.toString() + "' alt='" + elem.alt.toString() + "' title='" + elem.title.toString() + "' ";
			finalCode += "style='";
			if(!ghostedit.options.image.flexibleimages) {
				finalCode += "width:" + elem.offsetWidth.toString() + "px;height; " + elem.offsetHeight + "px;";
			}
			if (elem.style.styleFloat === "left" || elem.style.cssFloat === "left") {
				finalCode += "float:left;clear:left;margin-right: 20px;";
			}
			else {
				finalCode += "float:right;clear:right;margin-left: 20px;";
			}
			if (elem.style.clear !== "") finalCode += "clear:" + elem.style.clear;
			finalCode += "'";
			if (elem.className.length > 0 && !/ghostedit/.test(elem.className)) finalCode += " class='" + elem.className + "'";
			finalCode += " />";
			
			return {content: finalCode};
		}
	};
	
	_image.move = {
		align: function (direction, e) {
			var img;
			if (direction !== "left" && direction !== "right") return ghostedit.util.cancelAllEvents(e);
			if (ghostedit.selection.saved.type !== "image") return ghostedit.util.cancelAllEvents(e);

			ghostedit.history.saveUndoState();
			img = ghostedit.selection.saved.data;
			
			img.style.styleFloat = direction;
			img.style.cssFloat = direction;
			img.style.marginRight = (direction === "left") ? "20px" : "0px";
			img.style.marginLeft = (direction === "left") ? "0px" : "20px";

			_image.focus(img);
			ghostedit.history.saveUndoState();
			
			return ghostedit.util.cancelAllEvents(e);
		},
		
		up: function (e) {
			var img, offsetTopBefore, offsetLeftBefore, parent, handler, anchor;
			
			ghostedit.history.saveUndoState();
			
			if (_image.focusedimage !== null) {
				img = _image.focusedimage;
				offsetLeftBefore = img.offsetLeft;
				offsetTopBefore = img.offetTop;
				
				anchor = ghostedit.dom.getPreviousSiblingGhostBlock(img);
				if (anchor) {
					parent = ghostedit.dom.getParentGhostBlock(anchor);
					handler = parent.getAttribute("data-ghostedit-handler");
					ghostedit.plugins[handler].dom.addchild(parent, "before", anchor, img);
				}				
				
				// If the image is still in the same position, then remove it's clear style
				if(offsetLeftBefore === img.offsetLeft && img.offsetTopBefore === img.offsetTop) {
					img.style.clear = "";
				}
				else {
					img.style.clear = "";
				}
				_image.focus(_image.focusedimage);
			}
			ghostedit.history.saveUndoState();
			return ghostedit.util.cancelAllEvents(e);
		},
		
		down: function (e) {
			var img, parent, handler, offsetLeftBefore, offsetTopBefore, anchor;
			
			ghostedit.history.saveUndoState();
			
			if (_image.focusedimage !== null) {
				img = _image.focusedimage;
				offsetLeftBefore = img.offsetLeft;
				offsetTopBefore = img.offetTop;
				
				anchor = ghostedit.dom.getNextSiblingGhostBlock(img);
				if (anchor) {
					parent = ghostedit.dom.getParentGhostBlock(anchor);
					handler = parent.getAttribute("data-ghostedit-handler");
					ghostedit.plugins[handler].dom.addchild(parent, "after", anchor, img);
				}				
				
				// If the image is still in the same position, then remove it's clear style
				if(offsetLeftBefore === img.offsetLeft && img.offsetTopBefore === img.offsetTop) {
					img.style.clear = "";
				}
				else {
					img.style.clear = "";
				}
				_image.focus(_image.focusedimage);
			}
			ghostedit.history.saveUndoState();
			return ghostedit.util.cancelAllEvents(e);
		}
	};
	
	_image.setClear = function (clearval) {
		ghostedit.selection.save();
		ghostedit.history.saveUndoState();
		
		var elem, startpara, endpara;
		startpara = ghostedit.plugins.textblock.selection.getStartTextBlockNode();
		endpara = ghostedit.plugins.textblock.selection.getEndTextBlockNode();
		
		// Loop through selected paragraphs
		if (startpara && endpara) {
			elem = startpara;
			do {
				if (elem.getAttribute("data-ghostedit-elemtype").toLowerCase() === "textblock") {
					startpara.style.clear = clearval;
				}
				if (elem.nextSibling && elem.id !== endpara.id) {
					elem = elem.nextSibling;
				}
				else {
					break;
				}
			}
			while (true);
		}
		
		// Loop through images attached to startpara
		elem = startpara;
		while (elem.previousSibling && elem.previousSibling.getAttribute("data-ghostedit-elemtype") === "image") {
			elem = elem.previousSibling;
			elem.style.clear = clearval;
		}
		
		document.getElementById('ghostedit_toolbar_clearselect').value = clearval;
		
		ghostedit.selection.save();
		ghostedit.history.saveUndoState();
	};
	
	_image.remove = function (e) {
		ghostedit.history.saveUndoState();
		if (_image.focusedimage !== null) {
			var imgToDel = _image.focusedimage;
			_image.unfocus();
			if (imgToDel.parentNode) {
				imgToDel.parentNode.removeChild(imgToDel);
			}
		}
		if (e && e.preventDefault) {
			e.stopPropagation();//stops parent elements getting a click event (standards)
		}
		else if (window.event.cancelBubble !== null) {
			window.event.cancelBubble = true; //stops parent elements getting a click event (IE)
		}
		ghostedit.history.saveUndoState();
		return false;
	};
	
	_image.refocus = function () {
		var img = _image.focusedimage;
		_image.unfocus();
		_image.focus(img);
	};
	
	_image.unfocus = function () {
		_image.resize.end();
		_image.focusedimage = null;
		if (ghostedit.selection.saved.type !== "image")  return false;
		var image = ghostedit.selection.saved.data;
		
		_image.ui.hide(image);
		
		ghostedit.selection.clear();
		ghostedit.selection.save();
	};
	
	_image.updatealttext = function (newalt) {
		if (_image.focusedimage !== false && _image.focusedimage.alt !== newalt) {
			_image.focusedimage.alt = newalt;
			_image.focusedimage.title = newalt;
			ghostedit.event.trigger("ui:message", {message: "Image description updated to '" + newalt + "'", time: 2, color: "success"});
		}
	};
	
	
	
	_image.focus = function (img, e) {
		var i, existHandle, resizeHandle, border, b, html, imgIdNum;
		
		_image.unfocus();
		if (ghostedit.isEditing === true && _image.focusedimage === null) {
			
			imgIdNum = img.id.replace("ghostedit_image_","");
			
			// Remove existing border
			border = document.getElementById("ghostedit_image_border_" + imgIdNum);
			if (border) {
				ghostedit.el.uilayer.removeChild(border);
			}
			
			// Add border to image
			border = document.createElement("div");
			border.className = "ghostedit_image_border";
			border.style.cssText = "position: absolute;line-height: 1px;font-size: 1px;background-color: transparent;" +
				"border: 3px solid #333;z-index: 100";
			border.id = "ghostedit_image_border_" + imgIdNum;
			border.style.top = img.offsetTop + "px";
			border.style.left = img.offsetLeft + "px";
			border.style.width = (img.offsetWidth - 6) + "px";
			border.style.height = (img.offsetHeight - 6) + "px";
			ghostedit.el.uilayer.appendChild(border);

			// Remove existing resize handle
			existHandle = document.getElementById("ghostedit_image_resizehandle_" + imgIdNum);
			if (existHandle) {
				ghostedit.el.uilayer.removeChild(existHandle);
			}
			
			//Resize handle
			if(!ghostedit.options.image.disableresize) {
				resizeHandle = document.createElement("span");
				resizeHandle.className = "ghostedit_image_resizehandle";
				resizeHandle.style.cssText = "position: absolute;width: 13px;height: 13px;line-height: 9px;" +
					"font-size: 9px;background-color: transparent;z-index: 200";
				resizeHandle.id = "ghostedit_image_resizehandle_" + imgIdNum;
				resizeHandle.style.top = (img.offsetTop + img.offsetHeight - 13) + "px";
				if (img.style.cssFloat === "left" || img.style.styleFloat === "left") {
						resizeHandle.style.left = (img.offsetLeft + img.offsetWidth - 13) + "px";
						resizeHandle.style.cursor = "se-resize";
						resizeHandle.style.background = "URL(" + ghostedit.options.imageurl + "/image/resize-se.png)";
				}
				else {
						resizeHandle.style.left = (img.offsetLeft) + "px";
						resizeHandle.style.cursor = "sw-resize";
						resizeHandle.style.background = "URL(" + ghostedit.options.imageurl + "/image/resize-sw.png)";
				}
				ghostedit.el.uilayer.appendChild(resizeHandle);
				resizeHandle.style.MozUserSelect = 'none';
				resizeHandle.contentEditable = false;
				resizeHandle.unselectable = 'on';
				resizeHandle.onmousedown = function(event){ return _image.resize.start(this, event);};
				resizeHandle.ondragstart = function(event){ return ghostedit.util.cancelEvent(event); };
				resizeHandle.ondraggesture = function(event){return ghostedit.util.cancelEvent(event); };
				resizeHandle.onclick = function (event) { return ghostedit.util.cancelEvent(event); };
				resizeHandle.ondblclick = function(event){return ghostedit.util.cancelEvent(event); };
				resizeHandle.onresizestart = function(event){return ghostedit.util.cancelEvent(event); };
			}
			
			
			
			//Align button
			b = _image.ui.createbutton(imgIdNum, "align", ">", function (img, button) {
				button.elem.style.top = (img.offsetTop + (img.offsetHeight/2) - 15) + "px";
				if (img.style.cssFloat === "left" || img.style.styleFloat === "left") {
					button.elem.style.left = (img.offsetLeft + img.offsetWidth - 15) + "px";
					button.elem.innerHTML = "&gt;";
				}
				else {
					button.elem.style.left = (img.offsetLeft - 15) + "px";
					button.elem.innerHTML = "&lt;";
				}
			});
			if (img.style.cssFloat === "left" || img.style.styleFloat === "left") {
				b.event.click = function(event){return _image.move.align("right", event);};
			}
			else {
				b.event.click = function(event){return _image.move.align("left", event);};
			}
			b.register();
			
			//Delete button
			b = _image.ui.createbutton(imgIdNum, "delete", "&#215;", function (img, button) {
				button.elem.style.top = (img.offsetTop) + "px";
				button.elem.style.left = (img.offsetLeft) + "px";
			});
			b.event.click = function(event){return _image.remove(event);};
			b.register();
			
			//Up button
			b = _image.ui.createbutton(imgIdNum, "up", "^", function (img, button) {
				//button.elem.style.top = (img.offsetTop - 15) + "px";
				//button.elem.style.left = (img.offsetLeft + (img.offsetWidth/2) - 15) + "px";
				button.elem.style.top = (img.offsetTop + (img.offsetHeight/2) - 15 - 40) + "px";
				button.elem.style.left = (img.style.cssFloat === "left" || img.style.styleFloat === "left" ? img.offsetLeft + img.offsetWidth - 15 : img.offsetLeft - 15) + "px";
			});
			b.event.click = function(event){return _image.move.up(event);};
			//b.register();
			
			//Down button
			b = _image.ui.createbutton(imgIdNum, "down", "&caron;", function (img, button) {
				//button.elem.style.top = (img.offsetTop + img.offsetHeight - 15) + "px";
				//button.elem.style.left = (img.offsetLeft + (img.offsetWidth/2) - 15) + "px";
				button.elem.style.top = (img.offsetTop + (img.offsetHeight/2) - 15 + 40) + "px";
				button.elem.style.left = (img.style.cssFloat === "left" || img.style.styleFloat === "left" ? img.offsetLeft + img.offsetWidth - 15 : img.offsetLeft - 15) + "px";
			});
			b.event.click = function(event){return _image.move.down(event);};
			//b.register();
			
			//Small size button
			b = _image.ui.createbutton(imgIdNum, "small", "Small", function (img, button) {
				button.elem.style.top = (img.offsetTop + 40) + "px";
				button.elem.style.left = (img.style.cssFloat === "left" || img.style.styleFloat === "left" ? img.offsetLeft : img.offsetLeft + img.offsetWidth - 60) + "px";
				button.elem.style.width = '60px';
			});
			b.event.click = function(event){
				var img = _image.focusedimage; 
				img.className = 'small';
				img.style.height = "";
				img.style.width = "";
				img.style.height = (img.offsetHeight - 12) + "px";
				img.style.width = (img.offsetWidth - 12) + "px";
				_image.ui.setbuttonpositions();
				return ghostedit.util.cancelEvent(event);
			};
			//b.register();
			
			//Golden size button
			b = _image.ui.createbutton(imgIdNum, "golden", "Golden", function (img, button) {
				button.elem.style.top = (img.offsetTop + 80) + "px";
				button.elem.style.left = (img.style.cssFloat === "left" || img.style.styleFloat === "left" ? img.offsetLeft : img.offsetLeft + img.offsetWidth - 80) + "px";
				button.elem.style.width = '80px';
			});
			b.event.click = function(event){
				var img = _image.focusedimage; 
				img.className = 'golden';
				img.style.height = "";
				img.style.width = "";
				img.style.height = (img.offsetHeight - 12) + "px";
				img.style.width = (img.offsetWidth - 12) + "px";
				_image.ui.setbuttonpositions();
				return ghostedit.util.cancelEvent(event);
			};
			//b.register();
			
			//Medium size button
			b = _image.ui.createbutton(imgIdNum, "medium", "Medium", function (img, button) {
				button.elem.style.top = (img.offsetTop + 120) + "px";
				button.elem.style.left = (img.style.cssFloat === "left" || img.style.styleFloat === "left" ? img.offsetLeft : img.offsetLeft + img.offsetWidth - 80) + "px";
				button.elem.style.width = '80px';
			});
			b.event.click = function(event){
				var img = _image.focusedimage; 
				img.className = 'medium';
				img.style.height = "";
				img.style.width = "";
				img.style.height = (img.offsetHeight - 12) + "px";
				img.style.width = (img.offsetWidth - 12) + "px";
				_image.ui.setbuttonpositions();
				return ghostedit.util.cancelEvent(event);
			};
			//b.register();
			
			//Fullwidth size button
			b = _image.ui.createbutton(imgIdNum, "fullwidth", "Full Width", function (img, button) {
				button.elem.style.top = (img.offsetTop + 160) + "px";
				button.elem.style.left = (img.style.cssFloat === "left" || img.style.styleFloat === "left" ? img.offsetLeft : img.offsetLeft + img.offsetWidth - 100) + "px";
				button.elem.style.width = '100px';
			});
			b.event.click = function(event){
				var img = _image.focusedimage; 
				img.className = 'fullwidth';
				img.style.height = "";
				img.style.width = "";
				img.style.height = (img.offsetHeight - 12) + "px";
				img.style.width = (img.offsetWidth - 12) + "px";
				_image.ui.setbuttonpositions();
				return ghostedit.util.cancelEvent(event);
			};
			//b.register();
			
			//Clear button
			html = "<select onclick='ghostedit.util.preventBubble()' onchange='_image.focusedimage.style.clear = this.value;_image.refocus();'>";
			html += "<option value='' " + (img.style.clear === '' ? "selected='selected' " : "") + ">Clear: none</option>";
			html += "<option value='left' " + (img.style.clear === 'left' ? "selected='selected' " : "") + ">Clear: left</option>";
			html += "<option value='right' " + (img.style.clear === 'right' ? "selected='selected' " : "") + ">Clear: right</option>";
			html += "<option value='both' " + (img.style.clear === 'both' ? "selected='selected' " : "") + ">Clear: both</option>";
			html += " </select>";
			b = _image.ui.createbutton(imgIdNum, "clear", html, function (img, button) {
				button.elem.style.top = (img.offsetTop) + "px";
				button.elem.style.left = (img.offsetLeft + (img.offsetWidth) - 100) + "px";
				button.elem.style.width = '100px';
				button.elem.style.cursor = 'default';
			});
			b.event.click = null;
			b.event.mousedown = null;
			//b.register();
			
			for(i = 0; i < _image.buttons.length; i += 1) {
				_image.buttons[i].show(img);
				_image.buttons[i].reposition(img, _image.buttons[i]);
			}
			
			// Set the ghostedit selection reference to the image
			_image.focusedimage = img; // Legacy
			ghostedit.selection.set("image", img);
			
			if (e) return ghostedit.util.cancelEvent ( e );
		}
	};
	
	_image.resize = {

		start: function ( resizeHandle, e ) {
			ghostedit.history.saveUndoState();
			e = window.event ? window.event : e;
			var img = document.getElementById("ghostedit_image_" + resizeHandle.id.replace("ghostedit_image_resizehandle_",""));
			
			_image.originalMouseX = e.pageX || e.clientX + document.body.scrollLeft;
			_image.originalMouseY = e.pageY || e.clientY + document.body.scrollTop;
			
			_image.originalImageWidth = img.offsetWidth;
			_image.originalImageHeight = img.offsetHeight;
				
			if (!img.getAttribute("data-ghostedit-nativewidth")) img.setAttribute("data-ghostedit-nativewidth", img.offsetWidth);
			if (!img.getAttribute("data-ghostedit-nativeheight")) img.setAttribute("data-ghostedit-nativeheight", img.offsetHeight);
			
			ghostedit.util.addEvent(document.body, "mousemove", _image.resize.handle);
			ghostedit.util.addEvent(document.body, "mouseup", _image.resize.end);
			ghostedit.util.addEvent(window, "blur", _image.resize.end);
			//document.body.onmousemove = function(event){return _image.resize.handle(event);};
			//document.body.onmouseup = function(event){return _image.resize.end(event);};
			return false;//stop image losing focus after resize in ie
		},
		
		handle: function (e) {
			var img, resizeHandle, alignbutton, curMouseX, curMouseY, newWidth, newHeight, origImageWidth, origImageHeight, origMouseX, origMouseY, nativeImageWidth, nativeImageHeight;
			e = window.event ? window.event : e;
			if (_image.focusedimage === null) {
				_image.unfocus ();
			}
			else {
				img = _image.focusedimage;
				resizeHandle = document.getElementById("ghostedit_image_resizehandle_" + img.id.replace("ghostedit_image_",""));
				alignbutton = document.getElementById("ghostedit_imagebutton_align" + img.id.replace("ghostedit_image_",""));
				
				// Get variables
				curMouseX = e.pageX || e.clientX + document.body.scrollLeft;
				curMouseY = e.pageY || e.clientY + document.body.scrollTop;
				
				origMouseX = _image.originalMouseX;
				origMouseY = _image.originalMouseY;
				
				origImageHeight = _image.originalImageHeight;
				origImageWidth = _image.originalImageWidth;
				
				nativeImageHeight = img.getAttribute("data-ghostedit-nativeheight");
				nativeImageWidth = img.getAttribute("data-ghostedit-nativewidth");			
				
				
				// Calculate new width and height
				if (img.style.cssFloat === "left" || img.style.styleFloat === "left") {
					newWidth = origImageWidth + (curMouseX - origMouseX);
					newHeight = origImageHeight + (curMouseY - origMouseY);
				}
				else {
					newWidth = origImageWidth - (curMouseX - origMouseX);
					newHeight = origImageHeight + (curMouseY - origMouseY);
				}
				
				
				if (((newHeight / nativeImageHeight) * nativeImageWidth) > newWidth) {
					newWidth = (newHeight / nativeImageHeight) *nativeImageWidth;
				}
				else {
					newHeight = (newWidth / nativeImageWidth) * nativeImageHeight;
				}
				
				// If new width is greater than rootnode width then make it the rootnode width
				if (newWidth >= img.parentNode.width) {
					newWidth = img.parentNode.width;
					newHeight = (newWidth / nativeImageWidth) * nativeImageHeight;
				}
				
				// Set image to new dimensions
				img.style.width = newWidth + "px";
				img.style.height = newHeight + "px";
				
				_image.ui.setbuttonpositions();
			}
		},
		
		end: function () {
			_image.justResized = true;
			ghostedit.util.removeEvent(document.body, "mousemove", _image.resize.handle);
			ghostedit.util.removeEvent(document.body, "mouseup", _image.resize.end);
			ghostedit.util.removeEvent(window, "blur", _image.resize.end);
			ghostedit.history.saveUndoState();
		}
	};
	
	_image.ui = {
		show: function (image) {
			var i, j = image;
			j = i;
			//TODO move image ui creation from focus function
		},
		
		hide: function (image) {
			var i;
				image = image || _image.focusedimage;
				
				if (!image) return false;
				
				// Remove image border
				if(document.getElementById("ghostedit_image_border_" + image.id.replace("ghostedit_image_",""))) {
					ghostedit.el.uilayer.removeChild(document.getElementById("ghostedit_image_border_" + image.id.replace("ghostedit_image_","")));
				}
				
				// Remove resize handle
				if(!ghostedit.options.image.disableresize && document.getElementById("ghostedit_image_resizehandle_" + image.id.replace("ghostedit_image_",""))) {
					ghostedit.el.uilayer.removeChild(document.getElementById("ghostedit_image_resizehandle_" + image.id.replace("ghostedit_image_","")));
				}
				
				//Remove image buttons
				for(i = 0; i < _image.buttons.length; i += 1) {
					_image.buttons[i].hide();
				}
				_image.buttons = [];
		},
		
		createbutton: function (imgIdNum, name, html, positionfunc) {
			var button, elem;
			
			// Create button element
			elem =  document.createElement("span");
			elem.id = "ghostedit_imagebutton_" + name + "_" + imgIdNum;
			elem.setAttribute("data-ghostedit-elemtype","ghostedit_imagebutton");
			elem.setAttribute("data-ghostedit-handler","image");
			elem.className = "ghostedit_imagebutton";
			elem.style.cssText = "position: absolute;width: 30px;height: 26px;_height: 30px;color: #FFF;font-size: 16px;" +
				"padding-top: 4px;font-family: Tahoma, sans-serif;text-align: center;vertical-align: middle;" +
				"font-weight: bold;background-color: #FF028D;cursor: pointer !important;z-index: 200";
			elem.innerHTML = html;//"&#215;";//"<img src='/static/images/x.png' style='vertical-align: middle' />";
			
			// Create button object
			button = {
				elem: elem
			};
			
			button.reposition = positionfunc;
			
			button.event = {
				mousedown: function (event) { return ghostedit.util.cancelEvent(event); },
				dragstart: function (event) { return ghostedit.util.cancelEvent(event); },
				draggesture: function (event) { return ghostedit.util.cancelEvent(event); },
				click: function (event) { return ghostedit.util.cancelEvent(event); },
				dblclick: function (event) { return ghostedit.util.cancelEvent(event); },
				resizestart: function (event) { return ghostedit.util.cancelEvent(event); }
			};
			
			button.show = function () {
				ghostedit.el.uilayer.appendChild(button.elem);
				button.elem.style.MozUserSelect = 'none';
				button.elem.contentEditable = false;
				button.elem.unselectable = 'on';
				button.elem.onmousedown = button.event.mousedown;
				button.elem.ondragstart = button.event.dragstart;
				button.elem.ondraggesture = button.event.draggesture;
				button.elem.onclick = button.event.click;
				button.elem.ondblclick = button.event.dblclick;
				button.elem.onresizestart = button.event.resizestart;
			};
			
			button.hide = function () {
				button.elem.parentNode.removeChild(button.elem);
			};
			
			button.register = function () {
				_image.buttons.push(button);
			};
			
			return button;
		},
		
		setbuttonpositions: function () {
			var i, img, border, resizeHandle;
			img = _image.focusedimage;
			if (img) {
				
				//Position border
				border = document.getElementById("ghostedit_image_border_" + img.id.replace("ghostedit_image_",""));
				border.style.top = img.offsetTop + "px";
				border.style.left = img.offsetLeft + "px";
				border.style.width = (img.offsetWidth - 6) + "px";
				border.style.height = (img.offsetHeight - 6) + "px";
				
				// Position resize handle
				if(!ghostedit.options.image.disableresize) {
					resizeHandle = document.getElementById("ghostedit_image_resizehandle_" + img.id.replace("ghostedit_image_",""));
					resizeHandle.style.top = (img.offsetTop + img.offsetHeight - 13) + "px";
					if (img.style.cssFloat === "left" || img.style.styleFloat === "left") {
						resizeHandle.style.left = (img.offsetLeft + img.offsetWidth - 13) + "px";
					}
					else {
						resizeHandle.style.left = (img.offsetLeft) + "px";
					}
				}
				
				// Position image buttons
				for(i = 0; i < _image.buttons.length; i += 1) {
					_image.buttons[i].reposition(img, _image.buttons[i]);
				}
			}
		}
	};
	
	
	_image.insert = function () {
		var imageurlinput;
		imageurlinput = document.getElementById("ghostedit_imageurlinput");
		imageurlinput.blur();
		_image.newImageBefore (null, null, false);
	};
	
	_image.create = function (srcURL) {
		var newimg;
		
		// Create image element and set id
		newimg = document.createElement("img");
		_image.elemid += 1;
		newimg.id = 'ghostedit_image_' + _image.elemid;
		
		// Set basic attributes
		newimg.src = srcURL; //set source after adding to DOM otherwise onload is not fired in IE (no longer using onload event)
		if (ghostedit.options.defaultimageclass) newimg.className = ghostedit.options.defaultimageclass;
		newimg.setAttribute("data-ghostedit-elemtype", "image");
		newimg.setAttribute("data-ghostedit-handler", "image");
		
		// Prevent browser default image editing controls
		newimg.contentEditable = 'false';
		newimg.unselectable = 'on';
		newimg.galleryimg = 'no'; //hide IE image toolbar

		// Set drag and drop event handlers
		newimg.onclick = function(e) { _image.focus(this,e);ghostedit.util.cancelAllEvents(e); };
		newimg.ondragstart = function(event) {
			event = window.event ? window.event : event;
			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = "move";
				event.dataTransfer.setData("Text", newimg.id);
			}
			return true;
			};
		newimg.ondraggesture = function (e) { return ghostedit.util.cancelEvent(e); };
		newimg.onresizestart = function (e) { return ghostedit.util.cancelAllEvents(e); };
		newimg.oncontrolselect = function (e) { _image.focus(this,e);return ghostedit.util.cancelAllEvents(e); };
		
		return newimg;
	};
	
	_image.newImageBefore = function (elem, srcURL, skipResize, wheretoinsert) {
		var that, addedImage, newImg, parent, handler, result, clearval;
		ghostedit.history.saveUndoState();
		if (elem === null) { elem = ghostedit.selection.savedRange.getStartNode(); }
		elem = ghostedit.plugins.textblock.selection.getTextBlockNode ( elem );
		if (wheretoinsert !== "after") wheretoinsert = "before";
		
		if (srcURL === null) { srcURL = document.getElementById("ghostedit_imageurlinput").value; }

		if (!document.getElementById("ghostedit_image_" + elem.id.replace("ghostedit_textblock_", ""))) {
			newImg = document.createElement("img");
			_image.elemid += 1;
			newImg.id = 'ghostedit_image_' + _image.elemid;
			if (ghostedit.options.defaultimageclass) newImg.className = ghostedit.options.defaultimageclass;
			//newImg.src = srcURL;//set source after adding to DOM otherwise onload is not fired in IE
			
			
			// Ask (ghost) parent to insert new element into page
			parent = ghostedit.dom.getParentGhostBlock(elem);
			handler = parent.getAttribute("data-ghostedit-handler");

			result = ghostedit.plugins[handler].dom.addchild (parent, wheretoinsert, elem, newImg);
			
			if (!result) return false;
		
			addedImage = document.getElementById('ghostedit_image_' + _image.elemid);
			
			// Set attributes and dom events
			addedImage.setAttribute("data-ghostedit-elemtype", "image");
			addedImage.setAttribute("data-ghostedit-handler", "image");
			addedImage.contentEditable = 'false';
			addedImage.unselectable = 'on';
			addedImage.galleryimg = 'no'; //hide IE image toolbar
			clearval = (elem.style.clear === 'left') ? 'right' : 'left';
			addedImage.style.cssFloat = clearval;
			addedImage.style.styleFloat = clearval;
			addedImage.style.clear = elem.style.clear;
			addedImage.style.marginRight = '20px';
			that = {
				i: addedImage,
				s: skipResize
			};
			that.callself = function () {
				_image.onload(that.i, that.s, true);
			};
			addedImage.onload = that.callself;//function(img, skipResize){return _image.onload(img, skipResize, false)}(addedImage, skipResize);
			addedImage.src = srcURL;
			_image.applyeventlisteners(addedImage);
			
			ghostedit.util.addClass(addedImage, "leftimage");
			
			//document.getElementById('ghostedit_image_' + elem.id).style.width = '200px';
			//document.getElementById('ghostedit_image_' + elem.id).style.height = '299px';
			//document.getElementById('block_' + elem.id).style.width = (486 - document.getElementById('ghostedit_image_' + elem.id).style.width.replace("px","") - 30) + "px";
			
			return addedImage;
		}
	};
	
	_image.onload = function ( img, skipResize, hasWaited ) {
		if (hasWaited === true) {
			img.setAttribute("data-ghostedit-nativewidth", 0);
			img.setAttribute("data-ghostedit-nativeheight", 0);
			if (!ghostedit.options.image.disableresize && !skipResize && img.offsetWidth > 200) {
				var newWidth = 200;
				var newHeight = (newWidth / img.offsetWidth) * img.offsetHeight;
				img.style.width = newWidth + "px";
				img.style.height = newHeight + "px";
			}
			img.contentEditable = false;
			ghostedit.history.saveUndoState();
		}
		else {
			var that = {
				i: img,
				s: skipResize
			};
			that.callself = function () {
				_image.onload(that.i, that.s, true);
			};
			setTimeout(that.callself, 20);
		}
	};
	
	_image.applyeventlisteners = function () {
		var imgs, i, image, focus, dragstart;
		imgs = ghostedit.el.rootnode.getElementsByTagName("img");
		
		focus = function (e) {
			_image.focus(this,e);
			return ghostedit.util.cancelAllEvents(e);
		};
		
		dragstart = function(event){
			event = window.event ? window.event : event;
			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = "move";
				event.dataTransfer.setData("Text", image.id);
			}
			return true;
		};
		
		for (i = 0; i < imgs.length; i++) {
			image = imgs[i];
			if (image.getAttribute("data-ghostedit-elemtype") !== "image") continue;
			image.onclick = focus;
			image.ondragstart = dragstart;
			image.ondraggesture = ghostedit.util.cancelEvent;
			image.onresizestart = ghostedit.util.cancelAllEvents;
			image.oncontrolselect = focus;
		}
	};
	
	ghostedit.api.plugin.register ("image", _image);
})(window);
(function (window, undefined) {
	
	var _link = {
		focusedlink: false,
		el: {}
	},
	lasso = window.lasso,
	ghostedit = window.ghostedit;
	
	
	_link.enable = function () {
		// Register event listeners
		ghostedit.event.addListener ("preundo", function () { _link.unfocus(); });
		ghostedit.event.addListener ("preredo", function () { _link.unfocus(); });
		//ghostedit.event.addListener ("export:before", function () { _link.unfocus() });
		
		ghostedit.event.addListener("import:after", function () { _link.event.postimport(); });
		ghostedit.event.addListener("ui:update", function () { _link.ui.update(); });
		
		// Register link import capabilities for the textblock module
		ghostedit.inout.registerimporthandler (ghostedit.plugins.textblock.inout.importHTML, "a");
		ghostedit.plugins.textblock.inout.parserules.tags.a = { "attributes": [ "href" ] };//, {name: "data-ghostedit-elemtype", value: "link"}, {name: "data-ghostedit-handler", value: "link"} ] };
		
		// Register api functions
		ghostedit.api.link = ghostedit.api.link || {};
		
		ghostedit.api.link.create = function () {
			var result;
			
			// Save undo state
			ghostedit.history.saveUndoState();
			
			// Run link creation function
			result = _link.create();
			
			// Save undo state
			ghostedit.history.saveUndoState();
			
			return result;
		};
		
		ghostedit.api.link.updateurl = function (url) {
			return _link.updateurl(url);
		};
		
		ghostedit.api.link.open = function () {
			return _link.open();
		};
	};
		
	_link.event = {		
		postimport: function (params) {
			var i, aelems;
			if (!params || !params.rootnode) return false;
			
			aelems = params.rootnode.getElementsByTagName("a");
			for (i = 0; i < aelems.length; i += 1) {
				aelems[i].setAttribute("data-ghostedit-elemtype","link");
				aelems[i].setAttribute("data-ghostedit-handler","link");
			}
			return true;
		}
	};
	
	_link.selection = {
		deleteContents: function () {
			return false;
		}
	};
	
	_link.ui = {
		update: function () {
			var node, i, aelem = false;
			
			for(i = 0; i < ghostedit.selection.nodepath.length; i++) {
				node = ghostedit.selection.nodepath[i];
				if (node.tagName.toLowerCase() === "a") {
					aelem = node;
				}
			}
			
			if (aelem) {
				if (aelem !== _link.focusedlink) {
					_link.focus(aelem);
				}
			}
			else if (_link.focusedlink) {
				_link.unfocus();
			}
		},
		
		show: function (link) {
			var linkbox, linkboxa, left;
			
			// Make sure that no other ui elements are showing
			_link.ui.hide();
			
			// Create 'remove link' box
			linkbox = document.createElement("span");
			linkbox.className = "ghostedit_focusedlinkbox";
			linkbox.style.cssText = "position: absolute;text-align: center;font-family: Tahoma, Geneva, sans-serif;" + 
				"cursor: pointer;font-size: 13px;border: 1px solid #FF028D;background-color: #FF028D;padding: 3px;" + 
				"z-index: 100;width: 92px";
			linkbox.id = "ghostedit_focusedlinkbox";				
			
			// Set position of 'remove link' box
			linkbox.style.top = (link.offsetTop + link.offsetHeight - 1) + "px";
			left = link.getClientRects()[link.getClientRects().length - 1].left;
			linkbox.style.left = (left - ghostedit.el.rootnode.getBoundingClientRect().left) + "px";
			
			// Create clickable link element, and add it to the 'remove link' box
			linkboxa = document.createElement("a");
			linkboxa.style.cursor = "pointer";
			linkboxa.style.color = "#000";
			linkboxa.innerHTML = "<b>&#215;</b>&nbsp;remove&nbsp;link</a>";
			linkbox.appendChild(linkboxa);
			
			// Insert 'remove link' box into DOM
			ghostedit.el.uilayer.appendChild(linkbox);
			
			// Add event listeners and other properties to 'remove link' box
			linkbox.style.MozUserSelect = 'none';
			linkbox.contentEditable = false;
			linkbox.unselectable = 'on';
			linkbox.onmousedown = function (event) { return ghostedit.util.cancelEvent(event); };
			linkbox.ondragstart = function (event) { return ghostedit.util.cancelEvent(event); };
			linkbox.ondraggesture = function (event) { return ghostedit.util.cancelEvent(event); };
			linkbox.onclick = function (event) { return ghostedit.util.cancelEvent(event); };
			linkbox.ondblclick = function (event) { return ghostedit.util.cancelEvent(event); };
			linkbox.onresizestart = function (event) { return ghostedit.util.cancelEvent(event); };
			linkbox.oncontrolselect = function(event){return ghostedit.util.cancelAllEvents(event); };
			
			// Add event to remove the focused link to the clickable link element
			ghostedit.util.addEvent(linkboxa, "click", ghostedit.util.preparefunction(_link.remove, null, link));
			
			// Save references to the elements
			_link.el.focusedbox = linkbox;
			_link.el.focusedboxa = linkboxa;
		},
		
		hide: function () {
			if (!_link.el.focusedbox) return;
			ghostedit.el.uilayer.removeChild(_link.el.focusedbox);
			
			_link.el.focusedbox = null;
			_link.el.focusedboxa = null;
		}
	};
	
	_link.create = function (url) {
		var range, sel, newlink;
		if (typeof url === "undefined") url = "http://";
		
		// If selection is not a range, return
		sel = ghostedit.selection.saved;
		if (sel.type !== "textblock") return false;
		
		// If selection is collapsed, extend it to the current word
		if (sel.data.isCollapsed()) {
			range = sel.data.clone();
			range = ghostedit.plugins.textblock.selection.extendtoword(range, true);
			range.select();
			ghostedit.selection.save();
		}
		
		// If selection is still collapsed, insert a link with text "Link Text"
		if (sel.data.isCollapsed()) {
			// Create new link element
			newlink = document.createElement("a");
			newlink.id = "ghostedit_link_newlink";
			newlink.innerHTML = "Link Text";
			
			// Set attributes
			newlink.href = 'http://';
			//newlink.setAttribute("data-ghostedit-elemtype", "link");
			//newlink.setAttribute("data-ghostedit-handler", "link");
			
			// Insert link into the document and select it
			sel.data.insertNode(newlink);
			sel.data.selectNodeContents("ghostedit_link_newlink").select();
			document.getElementById("ghostedit_link_newlink").id = "";
			
			ghostedit.selection.save();
			/*if (document.createRange) {
				//Create <a> element, range.insertNode()
				
			}
			else if (document.selection) {
				sel.data.getNative().pasteHTML("<a  href='http://'>Link Text</a>");
				lasso().selectNodeContents("ghostedit_newlink").select();
				
			}*/
			//ghostedit.selection.savedRange.pasteText("Link Text", false);
		}
		// If selection is not collapsed, create a link from the selection
		else {
			document.execCommand("CreateLink", false, url);
			
			lasso().setToSelection().collapseToEnd().select();
			ghostedit.selection.save();
			
			// Set the new link's attributes
			newlink = ghostedit.plugins.link.focusedlink;
			//newlink.setAttribute("data-ghostedit-elemtype", "link");
			//newlink.setAttribute("data-ghostedit-handler", "link");
			newlink.href = "http://";
		}
		
		ghostedit.selection.save();
		return true;
	};
	
	_link.focus = function (link) {
		// Set focusedlink variable to the link
		_link.focusedlink = link;
		
		// Show the 'remove link' box
		_link.ui.show(link);
	};
	
	_link.unfocus = function () {
		if (_link.focusedlink === false) return;
		
		_link.ui.hide();
		_link.focusedlink = false;
	};
	
	_link.remove = function (link) {
		var linkcontent;
		link = link || _link.focusedlink;
		
		if (!link.tagName || link.tagName.toLowerCase() !== "a") return false;
		//if (ghostedit.selection.saved.type !== "textblock") return false;
		
		/*var range = lasso().selectNode(link).select();
		ghostedit.plugins.textblock.format.useCommand("unlink");
		range.collapseToEnd().select();
		_link.unfocus();*/
		
		ghostedit.selection.saved.data.saveToDOM();
		linkcontent = ghostedit.dom.extractContent(link);
		link.parentNode.insertBefore (linkcontent, link);
		link.parentNode.removeChild(link);
		
		ghostedit.selection.saved.data.restoreFromDOM().select();
		ghostedit.selection.save();
	};
	
	_link.updateurl = function (newurl) {
		if (_link.focusedlink !== false && _link.focusedlink.href !== newurl) {
			_link.focusedlink.href = newurl;
			_link.focusedlink.title = newurl;
			ghostedit.event.trigger("ui:message", {message:"URL updated to '" + newurl + "'", time: 2, color: "success"});
		}
	};
	
	_link.open = function () {
		if (_link.focusedlink !== false) {
			window.open(_link.focusedlink.href);
		}
	};
	
	ghostedit.api.plugin.register("link", _link);
})(window);
(function (window, undefined) {
	
	var _list = {
		elemid: 0,
		itemelemid: 0
	},
	lasso = window.lasso,
	ghostedit = window.ghostedit;
	
	_list.enable = function () {	
		// Register event listeners
		ghostedit.event.addListener("postpaste", function () {
			var i, uls, ols, lists, list;
			lists = [];
			
			uls = ghostedit.el.rootnode.getElementsByTagName("ul");
			for (i = 0; i < uls.length; i++) { lists.push(uls[i]); }
			ols = ghostedit.el.rootnode.getElementsByTagName("ol");
			for (i = 0; i < ols.length; i++) { lists.push(ols[i]); }
			
			for (i = 0; i < lists.length; i++) {
				list = lists[i];
				if (!list.parentNode) continue;
				_list.tidy(list);
			}
		});
		
		// Register import capability
		ghostedit.inout.registerimporthandler (_list.inout.importHTML, "ol", "ul", "li");
		
		// Export api functions
		ghostedit.api.list = ghostedit.api.list || {};
		
		ghostedit.api.list.toggle = function (listtype) {
			_list.toggle(listtype);
		};
	};
	
	_list.dom = {	
		addchild: function (target, wheretoinsert, sourceelem, newElem, params) {
			var parent, listitem, result = false, newelemisempty = false, anchorelem, handler;
			
			if (params && params.contentlength !== false) {
				newelemisempty = (params.contentlength < 1) ? true : false;
			}
			
			// Get target list if listelem is targetted
			if (target.getAttribute("data-ghostedit-elemtype") === "listitem") {
				target = ghostedit.dom.getParentGhostBlock (target);
			}
			if (target.getAttribute("data-ghostedit-elemtype") !== "list") return false;
			
			// Get listitem-parent of anchor elem
			anchorelem = sourceelem;
			while (anchorelem.getAttribute("data-ghostedit-elemtype") !== "listitem") {
				anchorelem = ghostedit.dom.getParentGhostBlock (anchorelem);
				if (anchorelem === null) return false;
			}
			
			// If last listelem and inserted node empty (caret is at end), then instead create paragraph after list
			if (newelemisempty && ghostedit.dom.getNextSiblingGhostBlock(anchorelem) === false && ghostedit.plugins.textblock.isEmpty(sourceelem)) {
				parent = ghostedit.dom.getParentGhostBlock (target);
				handler = parent.getAttribute("data-ghostedit-handler");
				//alert(handler + parent.id + newElem.innerHTML + target.id);
				result = ghostedit.plugins[handler].dom.addchild(parent, "after", target, newElem);
			}
			if (result) {
				target.removeChild(anchorelem);
				//lasso().selectNode(newElem).collapseToStart().select();
				return result;
			}
			
			// If newElem is a textblock, wrap in one
			if (newElem.getAttribute("data-ghostedit-elemtype") === "textblock") {// !== "listitem"
				listitem = document.createElement("li");
				_list.itemelemid += 1;
				listitem.id = "ghostedit_listitem_" + _list.itemelemid;
				listitem.setAttribute("data-ghostedit-elemtype", "listitem");
				listitem.setAttribute("data-ghostedit-handler", "list");
				
				listitem.appendChild(newElem);
				//newElem = listitem;
			}
			else {
				listitem = newElem;
			}
			//var dummynode = document.createTextNode(String.fromCharCode(parseInt("200b", 16)));
			if (wheretoinsert === "before") {
				target.insertBefore(listitem, anchorelem);
			}
			else {
				if (anchorelem.nextSibling !== null) {
					target.insertBefore(listitem, anchorelem.nextSibling);
				}
				else {
					target.appendChild(listitem);
				}
			}
			return true;
		},
		
		removechild: function (target, child) {
			
			// Get target list if listelem is targetted
			if (target && target.getAttribute("data-ghostedit-elemtype") === "listitem") {
				child = target;
				target = ghostedit.dom.getParentGhostBlock (target);
			}
			
			if (!target || !child) return false;
			
			if (target.getAttribute("data-ghostedit-elemtype") !== "list") return false;
			
			
			// Get listitem-parent of anchor elem
			while (child.getAttribute("data-ghostedit-elemtype") !== "listitem") {
				child = ghostedit.dom.getParentGhostBlock (child);
				if (child === null) return false;
			}
			
			if (child.parentNode !== target) return false;
			
			target.removeChild(child);
			
			return true;
		},
		
		deleteevent: function (target, sourcedirection, params) {
			var newtarget, result, elemtype;
			elemtype = target.getAttribute("data-ghostedit-elemtype");
			if (elemtype === "list") {
				if (sourcedirection === "ahead" || sourcedirection === "behind") {
					newtarget = (sourcedirection === "ahead") ? ghostedit.dom.getLastChildGhostBlock(target) : ghostedit.dom.getFirstChildGhostBlock(target);
					return _list.dom.deleteevent(newtarget, sourcedirection, params);
				}
				else return false;
			}
			else if (elemtype === "listitem") {
				//alert(target.id + sourcedirection);
				if (sourcedirection === "ahead" || sourcedirection === "behind") {
					newtarget = ghostedit.dom.getFirstChildGhostBlock(target);
					result = ghostedit.plugins.textblock.dom.deleteevent (newtarget, sourcedirection, params);
				}
				else if (sourcedirection === "top") {
					result = ghostedit.event.sendBackwards("delete", target, params);
				}
				else if (sourcedirection === "bottom") {
					result = ghostedit.event.sendForwards("delete", target, params);
				}
				//alert(target.id + sourcedirection + result);
				return result;
			}
			
		}
	};
	
	_list.selection = {
		deleteContents: function (target, collapse) {
			var i, startblock, endblock, startcblock, cblock, endcblock, childblocks, dodelete, 
			startofblock, endofblock, selrange, atverystart, atveryend,firstchildblock, lastchildblock, handler;
			
			atverystart = false;
			atveryend = false;
			
			if (!_list.isList(target)){
				if (_list.isListItem (target)) {
					return ghostedit.plugins.textblock.selection.deleteContents(ghostedit.dom.getFirstChildGhostBlock(target));
				}
				return false;
			}
			
			// Temporary selection range to avoid changing actual saved range
			if (ghostedit.selection.saved.type !== "textblock") return;
			selrange = ghostedit.selection.saved.data.clone();
			
			// Get first and last child ghostblock
			childblocks = target.childNodes;
			firstchildblock = ghostedit.dom.getFirstChildGhostBlock(target);
			lastchildblock = ghostedit.dom.getLastChildGhostBlock(target);
			
			// Ranges representing the start and end of the block
			startofblock = lasso().setCaretToStart(firstchildblock);
			endofblock = lasso().setCaretToEnd(lastchildblock);
			
			// If selrange starts before or at block, set startblock to the first child ghostblock
			if (selrange.compareEndPoints("StartToStart", startofblock) !== 1) {
				atverystart = true;
				startblock = firstchildblock;
			}
			// Otherwise, set child ghostblock containing the start of the selection
			else {
				startblock = selrange.getStartNode();
				if (!ghostedit.dom.isGhostBlock(startblock)) startblock = ghostedit.dom.getParentGhostBlock(startblock);
			}
			
			// If selrange ends after or at block, set endblock to the last child ghostblock
			if (selrange.compareEndPoints("EndToEnd", endofblock) !== -1) {
				atveryend = true;
				endblock = lastchildblock;
			}
			// Otherwise, set child ghostblock containing the end of the selection
			else {
				endblock = selrange.getEndNode();
				if (!ghostedit.dom.isGhostBlock(endblock)) endblock = ghostedit.dom.getParentGhostBlock(endblock);
			}
			
			startcblock = startblock;
			while(!ghostedit.dom.isChildGhostBlock(startcblock, target)) startcblock = ghostedit.dom.getParentGhostBlock(startcblock);
			endcblock = endblock;
			while(!ghostedit.dom.isChildGhostBlock(endcblock, target)) endcblock = ghostedit.dom.getParentGhostBlock(endcblock);
			
			// Cycle through SELECTED child ghostblocks and call delete method
			dodelete = atverystart;
			for(i = 0; i < childblocks.length; i += 1) {
				cblock = childblocks[i];
				if ( !ghostedit.dom.isGhostBlock(cblock) ) continue;
				handler = cblock.getAttribute("data-ghostedit-handler");
				
				if (!atverystart && cblock.id === startcblock.id) {
					ghostedit.plugins[handler].selection.deleteContents( cblock );
					dodelete = true;
					if (cblock.id === endcblock.id) {
						break;
					}
					else {
						continue;
					}
				}
				else if (!atveryend && cblock.id === endcblock.id) {
					ghostedit.plugins[handler].selection.deleteContents( cblock );
					dodelete = false;
					break;
				}
				else if (dodelete) {
					selrange.saveToDOM("seldelete-midlist");
					target.removeChild(childblocks[i]);
					selrange.restoreFromDOM("seldelete-midlist");
					i--;
				}
			}
	
			// If the first and last elements in the selection are the same type, then merge
			if(!atverystart && !atveryend && startcblock.getAttribute("data-ghostedit-elemtype") === endcblock.getAttribute("data-ghostedit-elemtype")) {
				ghostedit.plugins[startcblock.getAttribute("data-ghostedit-handler")].merge(startcblock, endcblock, collapse);
				if (!ghostedit.dom.getParentGhostBlock(endcblock)) lasso().setToSelection().collapseToStart().select();
				//^^tests whether endcblock is still in the document, i.e. whether a merge took place
			}
			
			if (!ghostedit.dom.getFirstChildGhostBlock(target)) {
				target.appendChild(_list.createItem("p"));
			}
	
			return true;
		}
	};
	
	_list.inout = {
		importHTML: function (sourcenode) {
			var newList, childcount, node, prevnode, parsednode;
			if (!sourcenode || !sourcenode.tagName) return false;
			switch (sourcenode.tagName.toLowerCase()) {
				case "ol":
				case "ul":
					return _list.inout.importList(sourcenode);
				case "li":
					newList = _list.create("ul");
					newList.setAttribute("data-ghostedit-importinfo", "wasinline");
					childcount = 0;
					node = sourcenode;
					do {
						parsednode = _list.inout.importListItem(node);
						if (parsednode) {
							childcount += 1;
							newList.appendChild(parsednode);
							prevnode = node;
							node = node.nextSibling;
							if (childcount > 1) prevnode.parentNode.removeChild(prevnode);
						}
						else break;
					}
					while (node && node.nodeType === 1 && node.tagName.toLowerCase() === "li");
					
					return (childcount > 0) ? newList : false;
			}
		},
		
		exportHTML: function (target) {
			if (!target || !ghostedit.dom.isGhostBlock(target)) return false;
			var finalCode = "", item, listtype, result, elem;
			
			switch (target.getAttribute("data-ghostedit-elemtype")) {
				case "list":
					// Get first child list item (if none, return false)
					item = ghostedit.dom.getFirstChildGhostBlock (target);
					if (!item) return false;
					
					// Run export function for each list item						
					do {
						result = _list.inout.exportHTML (item);
						if (result) finalCode += result.content;
						item = ghostedit.dom.getNextSiblingGhostBlock(item);
					}
					while (item);
					
					// If no list items return code, return false
					if (finalCode.length < 1) return false;
					
					// Add list code to listitem code
					listtype = (target.tagName.toLowerCase() === "ol") ? "ol" : "ul";
					finalCode = "<" + listtype + ">" + finalCode + "</" + listtype + ">";
					
					// Return code
					return {content: finalCode};
				case "listitem":
					// Get first child GhostBlock of list item (if none, return false)
					elem = ghostedit.dom.getFirstChildGhostBlock (target);
					if (!elem) return false;
					
					// Assume textblock, and call export function
					result = ghostedit.plugins.textblock.inout.exportHTML (elem);
					if (result) finalCode += result.content;
					
					// If textblock doesn't return code (or isn't a textblock), return false 
					if (finalCode.length < 1) return false;
					
					// Add list item code to textblock code
					finalCode = "<li>" + finalCode + "</li>";
					
					// Return code
					return {content: finalCode};
			}
		},
		
		importList: function (sourcenode) {
			var i, list, result, elem, tagname;
			if (!sourcenode || !sourcenode.tagName) return false;
			
			tagname = sourcenode.tagName.toLowerCase();
			if (tagname !== "ul" && tagname !== "ol") return false;
			
			// Create list element
			list = _list.create(tagname);
			
			// If chidlren, loop through and import if they are list items
			if (sourcenode.childNodes && sourcenode.childNodes.length) {
				for (i = 0; i < sourcenode.childNodes.length; i += 1) {
					elem = sourcenode.childNodes[i];
					if (elem.nodeType !== 1 || elem.tagName.toLowerCase() !== "li")  continue;
					
					result = _list.inout.importListItem(elem);
					if (result && ghostedit.dom.isGhostBlock(result)) {
						list.appendChild(result);
					}
				}
			}
			
			// Check any list item children have been added, else add empty list item
			if (!ghostedit.dom.getFirstChildGhostBlock(list)) {
				list.appendChild(_list.createItem("p"));
			}
			
			return list;
		},
		importListItem: function (sourcenode) {
			var listitem, child, textblock = false;
			if (!sourcenode || !sourcenode.tagName || sourcenode.tagName.toLowerCase() !== "li") return false;
			listitem = _list.createItem();
					
			child = ghostedit.dom.getFirstChildElement (sourcenode);
			
			if (ghostedit.plugins.textblock.inout.isHandleableNode(child) === "block") {
				textblock = ghostedit.plugins.textblock.inout.importHTML (child);
			}
			else {
				//hack to deal with inline elements directly in list
				textblock = document.createElement("p");
				textblock.innerHTML = sourcenode.innerHTML;
				textblock = ghostedit.plugins.textblock.inout.importHTML (textblock);
			}
			
			if (textblock) {
				listitem.appendChild(textblock);
			}
			else {
				listitem.appendChild (ghostedit.plugins.textblock.create("p"));
			}
			
			return listitem;
		}
	};
	
	_list.paste = {
		handle: function (target, source, position) {
			var anchor, splitpoint, result, sourcelistitem, sourcetextblock, targetlistitem, targettextblock,
			nextitem, node1, node2, startblock, endblock, firstitem, item,
			selrange, firstchildblock, lastchildblock, startofblock, endofblock,
			atverystart = false, atveryend = false, wheretoinsert;
			
			if (!_list.isList(target)) return false;
			
			
			// Handle case where source where source node isn't a list or list type is different to target list type
			if (!_list.isList(source) || source.tagName !== target.tagName) {
				
				splitpoint = ghostedit.selection.saved.data.clone();
				if (position.isfirst) splitpoint.collapseToStart();
				else if (position.islast) splitpoint.collapseToEnd();
				
				result = _list.split(target, splitpoint);
				
				switch (result) {
					case false:
						//this shouldn't happen, but just in case...
						return true;
					case "atverystart":
						node1 = ghostedit.dom.getPreviousSiblingGhostBlock(target);
						node2 = target;
						// TODO remove node1
					break;
					case "atveryend":
						node1 = target;
						node2 = ghostedit.dom.getNextSiblingGhostBlock(target);
						// TODO remove node2
					break;
					default:
						node1 = result.block1;
						node2 = result.block2;
				}
				lasso().removeDOMmarkers("ghostedit_paste_start");
				lasso().removeDOMmarkers("ghostedit_paste_end");
				node1.innerHTML += "<span id='ghostedit_paste_start_range_start'>&#x200b;</span>";
				node2.innerHTML = "<span id='ghostedit_paste_end_range_start'>&#x200b;</span>" + node2.innerHTML;
				
				return false;
			}
			
			// Else, lists are of same type:
			console.log("Lists same type");
			console.log(position);
			
			// Temporary selection range to avoid changing actual saved range
			if (ghostedit.selection.saved.type !== "textblock") return;
			selrange = ghostedit.selection.saved.data.clone();
			
			// Get first and last child ghostblock
			firstchildblock = ghostedit.dom.getFirstChildGhostBlock(target);
			lastchildblock = ghostedit.dom.getLastChildGhostBlock(target);
			
			// Ranges representing the start and end of the block
			startofblock = lasso().setCaretToStart(firstchildblock);
			endofblock = lasso().setCaretToEnd(lastchildblock);
			
			// If selrange starts before or at block, set startblock to the first child ghostblock
			if (selrange.compareEndPoints("StartToStart", startofblock) !== 1) {
				atverystart = true;
				startblock = firstchildblock;
			}
			// Otherwise, set child ghostblock containing the start of the selection
			else {
				startblock = selrange.getStartNode();
				//if (!ghostedit.dom.isGhostBlock(startblock)) startblock = ghostedit.dom.getParentGhostBlock(startblock);
			}
			
			// If selrange ends after or at block, set endblock to the last child ghostblock
			if (selrange.compareEndPoints("EndToEnd", endofblock) !== -1) {
				atveryend = true;
				endblock = lastchildblock;
			}
			// Otherwise, set child ghostblock containing the end of the selection
			else {
				endblock = selrange.getEndNode();
				//if (!ghostedit.dom.isGhostBlock(endblock)) endblock = ghostedit.dom.getParentGhostBlock(endblock);
			}
			
			//startblock = ghostedit.selection.saved.data.clone().collapseToStart().getParentNode();
			while (!ghostedit.dom.isGhostBlock(startblock)) startblock = ghostedit.dom.getParentGhostBlock(startblock);
			//endblock = ghostedit.selection.saved.data.clone().collapseToEnd().getParentNode();
			while (!ghostedit.dom.isGhostBlock(endblock)) endblock = ghostedit.dom.getParentGhostBlock(endblock);
			
			// If first pasted element, try to merge contents of first <li>
			if (position.isfirst) {
				sourcelistitem = ghostedit.dom.getFirstChildGhostBlock(source);
				sourcetextblock = ghostedit.dom.getFirstChildGhostBlock(sourcelistitem);
				
				targettextblock = startblock;
				if (targettextblock.tagName.toLowerCase() === "li") targettextblock = ghostedit.dom.getFirstChildGhostBlock(targettextblock);
				targetlistitem = ghostedit.dom.getParentGhostBlock(targettextblock);
				
				result = ghostedit.plugins.textblock.paste.handle(targettextblock, sourcetextblock, {isfirst: true});
				if (result) {
					source.removeChild(sourcelistitem);
				}
				/*if (sourcetextblock.tagName === targettextblock.tagName) {
					targettextblock.innerHTML += sourcetextblock.innerHTML;
					ghostedit.plugins.textblock.mozBrs.tidy(targettextblock);
					source.removeChild(sourcelistitem);
					
					if (!ghostedit.dom.getLastChildGhostBlock(source)) {
						if (position.islast) {
							nextitem = ghostedit.dom.getNextSiblingGhostBlock(targetlistitem);
							if (nextitem) {
								lasso().removeDOMmarkers("ghostedit_paste_start");
								targettextblock.innerHTML = targettextblock.innerHTML + "<span id='ghostedit_paste_start_range_start'>&#x200b;</span>" + ghostedit.dom.getFirstChildGhostBlock(nextitem).innerHTML;
								ghostedit.plugins.textblock.mozBrs.tidy(targettextblock);
								nextitem.parentNode.removeChild(nextitem);
							}
						}
						return true;
					}
					else {
						lasso().removeDOMmarkers("ghostedit_paste_start");
						targettextblock.innerHTML += "<span id='ghostedit_paste_start_range_start'>&#x200b;</span>";
						ghostedit.plugins.textblock.mozBrs.tidy(targettextblock);
						startblock = targetlistitem;
					}
				}*/
			}
			ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
			if (lasso().isSavedRange("ghostedit_paste_end")) {
				ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
			}
			//ghostedit.selection.saved.data.select().inspect();
			//return true;

			// If last pasted element, try to merge contents of last <li>
			if (position.islast /*&& (!position.isfirst || !result) && startblock !== endblock /* */ && ghostedit.dom.getLastChildGhostBlock(source)) {
				sourcelistitem = ghostedit.dom.getLastChildGhostBlock(source);
				sourcetextblock = ghostedit.dom.getFirstChildGhostBlock(sourcelistitem);
				
				targettextblock = endblock;
				if (targettextblock.tagName.toLowerCase() === "li") targettextblock = ghostedit.dom.getFirstChildGhostBlock(targettextblock);
				
				console.log(sourcetextblock);
				console.log(targettextblock);
				if (startblock === endblock) {
					ghostedit.plugins.textblock.paste.split(targettextblock);
					//^^splits textblock and tidies up selection markers
				}
				result = ghostedit.plugins.textblock.paste.handle(targettextblock, sourcetextblock, {isfirst: false, islast: true});
				if (result) {
					source.removeChild(sourcelistitem);
				}
				
				/*if (sourcetextblock.tagName === targettextblock.tagName) {
					lasso().removeDOMmarkers("ghostedit_paste_end");
					targettextblock.innerHTML = sourcetextblock.innerHTML + "<span id='ghostedit_paste_end_range_start'>&#x200b;</span>" + targettextblock.innerHTML;
					source.removeChild(sourcelistitem);
					
					ghostedit.plugins.textblock.mozBrs.tidy(targettextblock);
				}*/
			}
			
			ghostedit.selection.saved.data.restoreFromDOM("ghostedit_paste_start", false);
			if (lasso().isSavedRange("ghostedit_paste_end")) {
				ghostedit.selection.saved.data.setEndToRangeEnd(lasso().restoreFromDOM("ghostedit_paste_end", false));
			}
			//ghostedit.selection.saved.data.select().inspect();
			//return true;
			
			anchor = startblock;
			wheretoinsert = atverystart ? "before" : "after";
			firstitem = item = ghostedit.dom.getFirstChildGhostBlock(source);
			
			while ((item = ghostedit.dom.getFirstChildGhostBlock(source))) {
				_list.dom.addchild(target, wheretoinsert, anchor, item);
				wheretoinsert = "after";
				anchor = item;
			}
			
			if (!position.isfirst && !atverystart) {
				lasso().removeDOMmarkers("ghostedit_paste_start");
				anchor.innerHTML += "<span id='ghostedit_paste_start_range_start'>&#x200b;</span>";
				if (anchor.tagName.toLowerCase() === "li") anchor = ghostedit.dom.getFirstChildGhostBlock(anchor);
				ghostedit.plugins.textblock.mozBrs.tidy(anchor);
			}

			/*if (!position.islast && !atveryend) {
				lasso().removeDOMmarkers("ghostedit_paste_end");
				endblock.innerHTML = endblock.innerHTML + "<span id='ghostedit_paste_end_range_start'>&#x200b;</span>";
			}*/
			
			return true;
		}
	};
	
	_list.isList = function (list) {
		var tagname;
		if (!ghostedit.dom.isGhostBlock(list)) return false;
		tagname = list.tagName.toLowerCase();
		if (tagname !== "ul" && tagname !== "ol") return false;
		return true;
	};
	
	_list.isListItem = function (item) {
		var tagname;
		if (!ghostedit.dom.isGhostBlock(item)) return false;
		tagname = item.tagName.toLowerCase();
		if (tagname !== "li") return false;
		return true;
	};
	
	_list.create = function (listtype) {
		var newElem;
		if (listtype.toLowerCase() !== "ol") listtype = "ul";
		
		// Create element, and assign id and content
		newElem = document.createElement(listtype);
		ghostedit.blockElemId += 1;
		newElem.id = "ghostedit_list_" + ghostedit.blockElemId;
		
		// Set GhostEdit handler attributes
		newElem.setAttribute("data-ghostedit-iselem", "true");
		newElem.setAttribute("data-ghostedit-elemtype", "list");
		newElem.setAttribute("data-ghostedit-handler", "list");
		
		return newElem;
	};
	
	_list.createItem = function (textblocktype) {
		var newElem;
		
		// Create element, and assign id and content
		newElem = document.createElement("li");
		ghostedit.blockElemId += 1;
		newElem.id = "ghostedit_list_item_" + ghostedit.blockElemId;
		
		// Set GhostEdit handler attributes
		newElem.setAttribute("data-ghostedit-iselem", "true");
		newElem.setAttribute("data-ghostedit-elemtype", "listitem");
		newElem.setAttribute("data-ghostedit-handler", "list");
		
		
		if (textblocktype) newElem.appendChild(ghostedit.plugins.textblock.create(textblocktype));
		
		return newElem;
	};
	
	_list.remove = function (list) {
		var parent, handler;
		parent = ghostedit.dom.getParentGhostBlock(list);
		handler = parent.getAttribute("data-ghostedit-handler");
		return ghostedit.plugins[handler].dom.removechild(parent, list);
	};
	
	_list.focus = function (target) {
		var firstchild, handler;
		if (!target || target.nodeType !== 1 || target.getAttribute("data-ghostedit-elemtype") !== "list") return false;
		
		// Get first child of list
		firstchild = ghostedit.dom.getFirstChildGhostBlock (target);
		if (!firstchild) return false;
		
		// Get first child of listitem
		firstchild = ghostedit.dom.getFirstChildGhostBlock (firstchild);
		if (!firstchild) return false;
		
		handler = firstchild.getAttribute("data-ghostedit-handler");
		ghostedit.plugins[handler].focus(firstchild);
		
		return true;
	};
	
	_list.merge = function (list1, list2, collapse) {
		var child;
		
		// If lists are same node, return that node
		if (list1 === list2) return list1;
		
		// If lists are not lists but listitems, call mergeItems function
		if (!_list.isList(list1) || !_list.isList(list2)) {
			if (_list.isListItem(list1) && _list.isListItem(list2)) {
				return _list.mergeItems(list1, list2, collapse);
			}
			return false;
		}
		
		// If lists are of different type, don't merge
		if (list1.tagName.toLowerCase() !== list2.tagName.toLowerCase()) return false;
		
		// Move all list items in list2 to list1
		while ((child = ghostedit.dom.getFirstChildGhostBlock(list2))) {
			list1.appendChild (child);
		}
		
		// Remove list 2
		_list.remove(list2);
		
		return list1;
	};
	
	_list.mergeItems = function (item1, item2, collapse) {
		var tblock1, tblock2, result;
		
		// If collapse === false don't merge
		if (collapse === false) return item1;
		
		// If items are same node, return that node
		if (item1 === item2) return item1;
		
		if (!_list.isListItem(item1) || !_list.isListItem(item2)) return false;
		
		tblock1 = ghostedit.dom.getFirstChildGhostBlock(item1);
		tblock2 = ghostedit.dom.getFirstChildGhostBlock(item2);
		if (!tblock1 || !tblock2) return false;
		
		result = ghostedit.plugins.textblock.merge (tblock1, tblock2);
		/*if (result) {
			item2.parentNode.removeChild(item2);
			return result;
		}
		return false;*/
		return result;
	};
	
	/* Either a range or a listitem can be passed as the split point
	 * So arguments are either (list, "before", listitem), (list, "after", listitem) or (list, range)
	 */
	_list.split = function (target, beforeOrAfter, anchor) {
		var firstitem, lastitem, newlist, node, parent, handler, blocks,
		splitpoint,
		firstchildblock, lastchildblock, startofblock, endofblock, atverystart, atveryend, startblock, endblock;
		
		// Handle case where range is passed instead of beforeOrAfter+anchor
		if (typeof beforeOrAfter === "object" && beforeOrAfter.isLassoObject) {
			splitpoint = beforeOrAfter.clone().collapseToStart();
			
			// Ranges representing the start and end of the block
			startofblock = lasso().setCaretToStart(ghostedit.dom.getFirstChildGhostBlock(target));
			endofblock = lasso().setCaretToEnd(ghostedit.dom.getLastChildGhostBlock(target));
			
			// If splitpoint starts before (or at) block or ends after (or at) block, do nothing and return
			if (splitpoint.compareEndPoints("StartToStart", startofblock) !== 1) return "atverystart";
			if (splitpoint.compareEndPoints("EndToEnd", endofblock) !== -1) return "atveryend";
			
			// Get the GhostBlock that the splitpoint is in
			anchor = splitpoint.getParentNode();
			while (!ghostedit.dom.isGhostBlock(anchor)) anchor = ghostedit.dom.getParentGhostBlock(anchor);
			
			// If splitpoint is in the actual list item, then get listitem after and continue
			if (_list.isList(anchor)) {
				// continue below
				//TODO detect where in list range is
			}
			// If splitpoint is in a list item, then make that the anchor and continue
			else if (_list.isListItem(anchor)) {
				// continue below
				//TODO detect whether range is at start or end of list item
				beforeOrAfter = "";
			}
			// If splitpoint is in a textblock, then check if at very start or end, else split at splitpoint and continue
			else if (ghostedit.plugins.textblock.isTextBlock(anchor)) {
				console.log("TEST");
				if (ghostedit.plugins.textblock.selection.isAtStartOfTextBlock(splitpoint)) {
					beforeOrAfter = "before";
				}
				else if (ghostedit.plugins.textblock.selection.isAtEndOfTextBlock(splitpoint)) {
					beforeOrAfter = "after";
				}
				else {
					blocks = ghostedit.plugins.textblock.paste.split(anchor, splitpoint);
					anchor = ghostedit.dom.getParentGhostBlock(blocks.block2);
					beforeOrAfter = "before";
				}
			}
		}
		
		
		
		if (!ghostedit.dom.isGhostBlock(target) || !ghostedit.dom.isChildGhostBlock(anchor, target)) return false;
		if (beforeOrAfter !== "before") beforeOrAfter = "after";
		
		firstitem = ghostedit.dom.getFirstChildGhostBlock(target);
		lastitem = ghostedit.dom.getLastChildGhostBlock(target);
		if (beforeOrAfter === "before" && firstitem === anchor) return "atverystart";
		if (beforeOrAfter === "after" &&  lastitem === anchor) return "atveryend";

		node = anchor;
		newlist = _list.create (target.tagName.toLowerCase());
		parent = ghostedit.dom.getParentGhostBlock(target);
		handler = parent.getAttribute("data-ghostedit-handler");
		
		if (beforeOrAfter === "before") {
			node = firstitem;
			while (node) {
				if (node === anchor) break;
				newlist.appendChild(node);
				node = ghostedit.dom.getFirstChildGhostBlock(target);
			}
		}
		else {
			node = ghostedit.dom.getNextSiblingGhostBlock(anchor);
			while (node) {
				newlist.appendChild(node);
				node = ghostedit.dom.getNextSiblingGhostBlock(anchor);
			}
		}
		
		ghostedit.plugins[handler].dom.addchild(parent, beforeOrAfter, target, newlist);
		
		return (beforeOrAfter === "before") ? {"block1": newlist, "block2": target} : {"block1": target, "block2": newlist};
	};
	
	
	
	_list.toggle = function (listtype) {
		var i, inlist, list, textblock, incontainer, container, node, range, intextblock;
		
		listtype = (listtype === "ordered") ? "ol" : "ul";
		
		// Set checking variables to default value of false
		inlist = false;
		intextblock = false;
		incontainer = false;
		
		// Loop up through node path, check whether selection is contained within a list or textblock
		for(i = 0; i < ghostedit.selection.nodepath.length; i++) {
			node = ghostedit.selection.nodepath[i];
			switch (node.getAttribute("data-ghostedit-elemtype")){
				case "list":
					inlist = true;
					list = node;
				break;
				case "textblock":
					intextblock = true;
					textblock = node;
				break;
				case "container":
					incontainer = true;
					container = node;
				break;
			}
		}
		
		ghostedit.selection.savedRange.saveToDOM().select();
		
		// If selection contained in (non-list) textblock, convert to list
		if (intextblock && !inlist) {
			_list.convertTextblock(textblock, listtype);
			range = lasso().restoreFromDOM();
			if (range) range.select();
			ghostedit.selection.save();
			return true;
		}
		
		// Else, if selection contained in list, convert list items to other list type, or to textblocks
		if (inlist) {
			_list.convertList(list, listtype);
			range = lasso().restoreFromDOM();
			if (range) range.select();
			ghostedit.selection.save();
			return true;
		}
		
		// Else, if selection contained in container, go through container items converting to correct list form
		// skippping images, and then do massive tidy up at the end.
		if (incontainer) {
			_list.convertContainerContents(container, listtype);
			range = lasso().restoreFromDOM();
			if (range) range.select();
			ghostedit.selection.save();
			return true;
		}
		
		return false;
	};
	
	_list.convertTextblock = function (textblock, listtype) {
			var newlist, newlistitem, tagname, parent, handler;
			// Create new list
			newlist = _list.create(listtype);
			
			// Create list item, and add it to list
			tagname = textblock.tagName.toLowerCase();
			newlistitem = _list.createItem();
			newlist.appendChild(newlistitem);
			
			// Add list to document
			parent = ghostedit.dom.getParentGhostBlock(textblock);
			handler = parent.getAttribute("data-ghostedit-handler");
			ghostedit.plugins[handler].dom.addchild(parent, "before", textblock, newlist);
			
			// Move textblock to listitem
			newlistitem.appendChild(textblock);
			
			// Call tidy function on list
			_list.tidy(newlist);
			
			// Focus textblock
			lasso().setCaretToEnd(textblock).select();
			ghostedit.selection.save();
			
			return textblock;
	};
	
	_list.convertList = function (list, listtype) {
			var i, lists = [], node, newlist = false, afterlist = false, parent, handler;
			var beforenodes = [], selnodes = [], afternodes = [], isafterstart, isbeforeend, anchor;
			
			node = ghostedit.dom.getFirstChildGhostBlock (list);
			if (!node) { _list.remove (list); return true; }
			
			ghostedit.selection.savedRange.restoreFromDOM("", false);

			// Loop through list items and get which nodes are in and after the selection
			do {
				isafterstart = lasso().setCaretToEnd(node).compareEndPoints("StartToStart", ghostedit.selection.savedRange);
				isafterstart = (isafterstart >= 0) ? true : false;
				isbeforeend = lasso().setCaretToStart(node).compareEndPoints("EndToEnd", ghostedit.selection.savedRange);
				isbeforeend = (isbeforeend <= 0) ? true : false;
				
				if (!isafterstart) {
					beforenodes.push(node);
				}
				else if (isafterstart && isbeforeend) {
					selnodes.push (node);
				}
				else {
					afternodes.push (node);
				}
			}
			while ((node = ghostedit.dom.getNextSiblingGhostBlock(node)));
			
			// Get list parent and handles for inserting and removing GhostBlocks
			parent = ghostedit.dom.getParentGhostBlock(list);
			handler = parent.getAttribute("data-ghostedit-handler");
			
			
			// Move the after nodes (if any) to a new list and add list after current one
			if (afternodes.length > 0) {
				afterlist = _list.create(list.tagName);
				
				for(i = 0; i < afternodes.length; i++) {
					afterlist.appendChild(afternodes[i]);	
				}
				
				ghostedit.plugins[handler].dom.addchild(parent, "after", list, afterlist);
			}
			
			// If toggle type = list type, move selnodes to parent, else create new list of other type
			anchor = list;
			if (list.tagName.toLowerCase() === listtype) {
				for(i = 0; i < selnodes.length; i++) {
					node = ghostedit.dom.getFirstChildGhostBlock(selnodes[i]);
					if (node) {
						ghostedit.plugins[handler].dom.addchild(parent, "after", anchor, node);
						anchor = node;
					}
					list.removeChild(selnodes[i]);
				}
				/*// Focus last node
				lasso().setCaretToEnd(node).select();
				ghostedit.selection.save();*/
			}
			else {
				newlist = _list.create(listtype);
				
				for(i = 0; i < selnodes.length; i++) {
					newlist.appendChild(selnodes[i]);	
				}
				
				ghostedit.plugins[handler].dom.addchild(parent, "after", list, newlist);
				
				/*// Focus first list item
				lasso().setCaretToEnd(selnodes[0]).select();
				ghostedit.selection.save();*/
			}
			
			// If no beforenodes, remove original list
			if (beforenodes.length === 0) {
				_list.remove(list);
				list = false;
			}
			
			// Call tidy function on all existing lists
			if (list) {
				_list.tidy(list);
				lists.push(list);
			}
			if (newlist)  {
				_list.tidy(newlist);
				lists.push(newlist);
			}
			if (afterlist) {
				_list.tidy(afterlist);
				lists.push(afterlist);
			}
			
			return lists;
	};
	
	_list.convertContainerContents = function (container, listtype) {
		var i, node, selnodes = [], isafterstart, isbeforeend;
		
		node = ghostedit.dom.getFirstChildGhostBlock (container);
			
		// Loop through container items call conversion functions on textblocks and lists
		do {
			isafterstart = lasso().setCaretToEnd(node).compareEndPoints("StartToStart", ghostedit.selection.savedRange);
			isafterstart = (isafterstart >= 0) ? true : false;
			isbeforeend = lasso().setCaretToStart(node).compareEndPoints("EndToEnd", ghostedit.selection.savedRange);
			isbeforeend = (isbeforeend <= 0) ? true : false;
			
			if (isafterstart && isbeforeend) {
				selnodes.push(node);
			}
			else if (!isbeforeend) break;

		}
		while ((node = ghostedit.dom.getNextSiblingGhostBlock(node)));
		
		for(i = 0; i < selnodes.length; i++) {
			node = selnodes[i];
			switch (node.getAttribute("data-ghostedit-elemtype")){
				case "list":
					//newblocks.concat( _list.convertList(node, listtype) );
					if (node.tagName.toLowerCase() !== listtype) _list.convertList(node, listtype);
				break;
				case "textblock":
					//newblocks.concat( [_list.convertTextblock (node, listtype)] );
					_list.convertTextblock (node, listtype);
				break;
			}
		}
		return true;
	};
	
	
	_list.tidy = function (list) {
		var prev, next, child, result;
		
		// If list contains no list items, remove list
		child = ghostedit.dom.getFirstChildGhostBlock(list);
		if (!child) {
			_list.remove(list);
			return true;
		}
		
		// Else if previous GhostBlock is a list of same type, merge lists
		prev = ghostedit.dom.getPreviousSiblingGhostBlock(list);
		result = _list.merge (prev, list);
		if (result) {
			// Set selection to first item in next list
			_list.focus(result);
			ghostedit.selection.save();
			
			// Call tidy function on previous list
			_list.tidy (result);
			
			return true;
		}
		
		// Else if next GhostBlock is a list of same type, merge lists
		next = ghostedit.dom.getNextSiblingGhostBlock(list);
		result = _list.merge (list, next);
		if (result) {
			// Set selection to first item in next list
			_list.focus(result);
			ghostedit.selection.save();
			
			// Call tidy function on previous list
			_list.tidy (result);
			
			return true;
		}
		return true;
	};
	
	_list.applydropevents = function(elem) {
		elem.ondragenter = function () { return false; };
		elem.ondragleave = function () { return false; };
		elem.ondragover = function () { return false; };
		elem.ondrop = function(e){
			var elem, elemid;
			elemid = e.dataTransfer.getData("text/plain") || e.srcElement.id;
			elem = document.getElementById(elemid);
			elem.parentNode.insertBefore(elem, this);
			ghostedit.image.focus(elem);
			ghostedit.util.cancelEvent(e);
				};
		elem.onresizestart = function(e){ return ghostedit.util.cancelEvent(e); };
	};
	
	ghostedit.api.plugin.register("list", _list);
})(window);
(function (window, undefined) {
	
	var _save = {
		savename: "",
		saveurl: "",
		params: []
	},
	ghostedit = window.ghostedit;
	
	_save.enable = function () {
		var i, params, param;
		
		//Export api functions
		ghostedit.api.save = function () { _save.save(); };
		
		if (ghostedit.options.save && ghostedit.options.save.params) {
			params = ghostedit.options.save.params;
			for (i = 0; i < params.length; i++) {
				if (typeof params[i] !== "string") continue;
				param = params[i].split("=", 2);
				if (param.length > 1) {
					_save.updateparameter (param[0], param[1]);
				}
			}
		}
	};
	
	_save.save = function () {
		//Declare variables
		var i , finalCode, params, handleResult;
		
		// Get HTML to be saved, and add it to the parameters		
		finalCode = ghostedit.api.exportHTML();
		_save.updateparameter ("snippet", finalCode.snippet);
		_save.updateparameter ("content", finalCode.content);

		// Collapse parameters array into a string
		params = [];
		for (i = 0; i < _save.params.length; i++) {
			params.push(_save.params[i].name + "=" + _save.params[i].value);
		}
		params = params.join("&");
		
		// Define function to handle the server response
		handleResult = function(success, response){
			var msg;
			if (success && response === "true") {
				ghostedit.event.trigger("ui:message", {message: "Page was successfully saved :)", time: 1, color: "success"});
			}
			else {
				//msg = success ? "There was an error saving this page - try a <a href='' onclick='savePage()'>hard save</a>." : "Page could not be saved, make sure you are connected to the internet and try again";
				msg = response;
				ghostedit.event.trigger("ui:message", {message: msg, time: 1, color: "error"});
			}
		};
		
		// Send ajax request
		ghostedit.util.ajax(ghostedit.options.save.url, "POST", params, handleResult, "text");
	};
	
	_save.updateparameter = function (name, value) {
		var i;
		if (typeof name !== "string" || typeof value !== "string") return;
		
		// Sanitize name and value
		name = name.replace(/[^A-Za-z\-_0-9]/g, "");
		value = encodeURIComponent(value);
		
		// If parameter with name 'name' already exists, update it
		for (i = 0; i < _save.params.length; i++) {
			if (_save.params[i].name === name) {
				_save.params[i] = {"name": name, "value": value};
				return;
			}
		}
		
		// Else add new parameter to list
		_save.params.push({"name": name, "value": value});
	};

	ghostedit.api.plugin.register("save", _save);
})(window);
(function () {
	var _ui = {
		aelem: false,
		context: null,
		enabled: false,
		elemInEnglish: { "h1": "Heading 1", "h2": "Heading 2", "h3": "Heading 3", "p": "Paragraph", "div": "Generic Box", "a": "Link", "b": "Bold", "strong": "Bold", "i": "Italic", "em": "Italic",
					"u": "Underline", "img": "Image", "ul": "Bulletted list", "ol": "Numbered list", "li": "List Item", "strike": "Strikethrough"},
		definition: {
			quickbuttons: [
				{label: "Save", icon: "save16.png", action: function() { ghostedit.api.save(); } },
				{label: "Undo", icon: "undo16.png", action: function() { ghostedit.api.undo(); } },
				{label: "Redo", icon: "redo16.png", action: function() { ghostedit.api.redo(); } }
			],
			tabs: [
				{name: "textblock", label: "Format", enabled: true,
					contents: [
					{type: "group", style: "padding-top: 3px", contents: [
						{type: "button", id: "bold", label: "Bold", icon: "format-bold.png",
							highlighttest: function (t) {return t === "b" || t === "strong";},
							action: function () { ghostedit.api.format.bold(); }},
						{type: "button", id: "italic", label: "Italic", icon: "format-italic.png",
								highlighttest: function (t) {return t === "i" || t === "em";},
								action: function () { ghostedit.api.format.italic(); }},
						{type: "button", id: "underline", label: "Underline", icon: "format-underline.png", 
								highlighttest: function (t) {return t === "u";},
								action: function () { ghostedit.api.format.underline(); }},
						{type: "button", id: "strikethrough", label: "Strikethrough", icon: "format-strikethrough.png",
								highlighttest: function (t) {return t === "strike";},
								action: function () { ghostedit.api.format.strikethrough(); }},
						{type: "br"},
						{type: "button", id: "align-left", label: "Align Left", icon: "align-left.png",
								highlighttest: function (t, c, n) {return n.style.textAlign === "left" || n.style.textAlign === "";},
								action: function () { ghostedit.api.format.alignText("left"); }},
						{type: "button", id: "align-center", label: "Align Center", icon: "align-center.png", 
								highlighttest: function (t, c, n) {return n.style.textAlign === "center";},
								action: function () { ghostedit.api.format.alignText("center"); }},
						{type: "button", id: "align-right", label: "Align Right", icon: "align-right.png", 
								highlighttest: function (t, c, n) {return n.style.textAlign === "right";},
								action: function () { ghostedit.api.format.alignText("right"); }},
						{type: "button", id: "align-justify", label: "Justify", icon: "align-justified.png", 
								highlighttest: function (t, c, n) {return n.style.textAlign === "justify";},
								action: function () { ghostedit.api.format.alignText("justify"); }}
					]},
					{type: "seperator"},
					{type: "group", style: "padding-top: 3px", contents: [
						{type: "button", id: "list-unordered", label: "Bulleted List", icon: "list-unordered.png",
							action: function () { ghostedit.api.list.toggle("unordered"); }},
						{type: "button", id: "list-ordered", label: "Numbered List", icon: "list-ordered.png",
							action: function () { ghostedit.api.list.toggle("ordered"); }}
					]},
					{type: "seperator"},
					{type: "group", contents: [
						{type: "stylebox", label: "Paragraph", tagname: "p"},
						{type: "stylebox", label: "LeadPara", tagname: "p", classname: "LeadingParagraph"},
						{type: "stylebox", label: "Heading 1", tagname: "h1"},
						{type: "stylebox", label: "Heading 2", tagname: "h2"},
						{type: "stylebox", label: "Heading 3", tagname: "h3"}
					]}
					]},
				{name: "insert", label: "Insert", enabled: true,
					contents: [
					{type: "group", style: "padding-top: 3px", contents: [
						{type: "button", id: "insert-link", label: "Insert Link", icon: "insert-link.png",
							action: function () { _ui.toolbar.event.buttonclick.insertlink(); }},
						{type: "button", id: "insert-image", label: "Insert Image", icon: "insert-image.png",
								action: function () { _ui.toolbar.event.buttonclick.insertimage(); }}
					]},
					{type: "seperator"},
					{type: "group", contents: [
						{type: "specialchar", character: "&#224;"},
						{type: "specialchar", character: "&#225;"},
						{type: "specialchar", character: "&#226;"},
						{type: "specialchar", character: "&#227;"},
						{type: "specialchar", character: "&#228;"},
						{type: "specialchar", character: "&#229;"},
						//e letters -->
						{type: "specialchar", character: "&#232;"},
						{type: "specialchar", character: "&#233;"},
						{type: "br"},
						{type: "specialchar", character: "&#234;"},
						{type: "specialchar", character: "&#235;"},
						//i letters -->
						{type: "specialchar", character: "&#236;"},
						{type: "specialchar", character: "&#237;"},
						{type: "specialchar", character: "&#238;"},
						{type: "specialchar", character: "&#239;"},
						//o letters -->
						{type: "specialchar", character: "&#242;"},
						{type: "specialchar", character: "&#243;"},
						{type: "br"},
						{type: "specialchar", character: "&#244;"},
						{type: "specialchar", character: "&#245;"},
						{type: "specialchar", character: "&#246;"},
						//u letters -->
						{type: "specialchar", character: "&#249;"},
						{type: "specialchar", character: "&#250;"},
						{type: "specialchar", character: "&#251;"},
						{type: "specialchar", character: "&#252;"}
					]},
					{type: "seperator"},
					{type: "group", contents: [
						{type: "specialchar", character: "+"},
						{type: "specialchar", character: "&#8722;"},
						{type: "specialchar", character: "&#215;"},
						{type: "specialchar", character: "&#247;"},
						{type: "br"},
						{type: "specialchar", character: "&#8804;"},
						{type: "specialchar", character: "&#8805;"},
						{type: "specialchar", character: "&#177;"},
						{type: "specialchar", character: "&#8801;"},
						{type: "br"},
						{type: "specialchar", character: "&#189;"},
						{type: "specialchar", character: "&#188;"},
						{type: "specialchar", character: "&#190;"},
						{type: "specialchar", character: "&#960;"}
					]}
					]},
				{name: "save", label: "Save", enabled: true,
					contents: [
					{type: "group", contents: [
						{type: "textfield", label: "Page Name",
							onkeyup: function (e) {
								e = e || window.event;var target = e.target || e.srcElement;
								ghostedit.plugins.save.updateparameter("name", target.value);
							}}
					]},
					{type: "group", contents: [
						{type: "textfield", label: "Page Url Slug",
							onkeyup: function (e) {
								e = e || window.event;var target = e.target || e.srcElement;
								ghostedit.plugins.save.updateparameter("url", target.value);
							}}
					]},
					{type: "group", contents: [
						{type: "button", id: "save", label: "Save", icon: "save.png",
								action: function () { ghostedit.api.save(); }}
					]},
					{type: "seperator"},
					{type: "group", contents: [
						{type: "button", id: "about", label: "About GhostEdit & credits", icon: "about.png",
								action: function () { ghostedit.api.defaultui.showabout(); }}
					]}
					]},
				{name: "link", label: "Link", enabled: false,
					contents: [
					{type: "group", contents: [
						{type: "textfield", id: "linkurl", label: "Link URL", width: "400px",
							onkeyup: function (e) { 
								e = e || window.event;var target = e.target || e.srcElement;
								ghostedit.api.link.updateurl(target.value);
							}}
					]},
					{type: "group", contents: [
						{type: "button", label: "Open link in new tab", icon: "openlink.png",
							action: function () { ghostedit.api.link.open(); }}
					]}
					]},
				{name: "image", label: "Image", enabled: false,
					contents: [
					{type: "group", contents: [
						{type: "textfield", id: "imagealt", label: "Description / Alt text",
							onkeyup: function (e) { 
								e = e || window.event;var target = e.target || e.srcElement;
								ghostedit.api.image.updatealttext(target.value);
							}}
					]}
					]}
			]
		}
	},
	ghostedit = window.ghostedit;
	
	_ui.el = {};
	
	_ui.enable =  function () {
		// Call UI replace event to signal to other UI's to disable themselves (at their own discretion)
		ghostedit.event.trigger("ui:replace");
				
		// Register event listeners
		ghostedit.event.addListener("ui:update", function () { if (!ghostedit.ready) return; _ui.update(); }, "defaultui");
		ghostedit.event.addListener("ui:message", function (params) { if (!ghostedit.ready) return; _ui.message.show(params); }, "defaultui");
		ghostedit.event.addListener ("ui:replace", function () { ghostedit.api.plugin.disable("defaultui"); }, "defaultui");
		
		ghostedit.event.addListener ("selection:change", function () {
			var i, node;
			
			if (!ghostedit.ready) return;
			
			for(i = 0; i < ghostedit.selection.nodepath.length; i++) {
				node = ghostedit.selection.nodepath[i];
				if(node.tagName && node.tagName.toLowerCase() === "img") {
					if(ghostedit.selection.saved.type === "image") {
						document.getElementById('ghostedit_defaultui_textfield_imagealt').value = ghostedit.selection.saved.data.alt;
					}
					ghostedit.event.trigger("ui:newcontext", {context: "image"});
					break;
				}
				if(node.tagName && node.tagName.toLowerCase() === "a") {
					if(ghostedit.plugins.link.focusedlink) {
						document.getElementById('ghostedit_defaultui_textfield_linkurl').value = (ghostedit.plugins.link.focusedlink.href === "http:") ? "http://" : ghostedit.plugins.link.focusedlink.href;
					}
					
					ghostedit.event.trigger("ui:newcontext", {context: "link"});
					break;
				}				
				if(ghostedit.plugins.textblock.isTextBlock(node)) {
					ghostedit.event.trigger("ui:newcontext", {context: "textblock"});
					break;
				}
			}
		}, "defaultui");
		
		ghostedit.event.addListener ("ui:newcontext", function (params) {
			if (!params.context) return;
			if (!ghostedit.ready) return;
			
			if (_ui.context && !/textblock|format|insert|save/.test(_ui.context)) {
				_ui.toolbar.disabletab(_ui.context);
			}
			
			if (typeof params.context === "string") params.context = params.context.replace("textblock", "textblock");
			_ui.context = params.context;
			
			if(params.context === "image" && ghostedit.selection.type === "image") {
				var img = ghostedit.selection.data;
				document.getElementById("ghostedit_toolbar_imagealttext").value = img.alt;
				//document.getElementById("ghostedit_toolbar_imagesrc").value = img.src;
			}
			
			if (_ui.context && !/image|help|save/.test(_ui.context)) {
				ghostedit.plugins.image.unfocus();
			}	
			
			_ui.toolbar.showtab(params.context);
		}, "defaultui");
		
		// Set default options
		if (!ghostedit.options.defaultui) ghostedit.options.defaultui = {};
		if (!ghostedit.options.defaultui.statusbar) ghostedit.options.defaultui.statusbar = true;
		if (!ghostedit.options.defaultui.wordcount) ghostedit.options.defaultui.wordcount = true;
		
		// Add api methods
		ghostedit.api.defaultui = ghostedit.api.defaultui || {};
		
		ghostedit.api.defaultui.showabout = function () {
			_ui.modal.showabout();
		};
		
		// Run or register init event
		if (ghostedit.ready) {
			_ui.init();
		}
		else {
			_ui.initlistenerid = ghostedit.event.addListener ("init:after", _ui.init, "defaultui");
		}
	};
	
	_ui.disable = function () {
		var wrap;
		wrap = _ui.el.wrap;
		
		// Remove event listeners
		ghostedit.event.removeAllListeners("defaultui");
		
		// Move the uilayer and rootnode out of the wrapper
		wrap.parentNode.insertBefore(ghostedit.el.uilayer, wrap);
		wrap.parentNode.insertBefore(ghostedit.el.rootnode, wrap);
		
		// Remove the wrapper
		wrap.parentNode.removeChild(wrap);
		
		// Reset ui element tracking arrays
		_ui.toolbar.quickbuttons = [];
		_ui.toolbar.tabs = [];
		_ui.toolbar.enabledtabs = [];
		_ui.toolbar.panels = [];
	};
	
	_ui.init = function () {
		// Remove init event listener
		ghostedit.event.removeListener ("init:after", _ui.initlistenerid);
		
		// Define tempoary variables for UI creation
		var def, rootnode, wrap, workspace, toolbar, qbanchor, tabselect, messagearea, statusbar,  i, modal, modalbg;
		def = _ui.definition;
		rootnode = ghostedit.el.rootnode;
		
		// Create wrapper div that all other GhostEdit elements go in
		wrap = document.createElement("div");
		wrap.className = "ghostedit_defaultui_wrapper";
		rootnode.parentNode.insertBefore(wrap, rootnode);
		_ui.el.wrap = wrap;
		
		// Create workspace wrapper (div to contain the rootnode and uilayer)
		workspace = document.createElement("div");
		workspace.className = "ghostedit_defaultui_workspace";
		wrap.appendChild(workspace);
		_ui.el.workspace = workspace;
		
		// Move uilayer and rootnode to the wrapper
		workspace.appendChild(ghostedit.el.uilayer);
		workspace.appendChild(ghostedit.el.rootnode);
		
		// Create toolbar wrapper
		toolbar = document.createElement("div");
		toolbar.id = "ghostedit_defaultui_toolbar";
		toolbar.className = "ghostedit_defaultui_toolbar";
		_ui.el.toolbar = toolbar;
		
		// Create and insert message area
		messagearea = document.createElement("div");
		messagearea.id = "ghostedit_defaultui_messagearea";
		messagearea.className = "ghostedit_defaultui_messagearea";
		messagearea.innerHTML = "&nbsp;";
		
		toolbar.appendChild(messagearea);
		_ui.el.messagearea = messagearea;
		
		// Quickbuttons
		qbanchor = document.createElement("div");
		qbanchor.id = "ghostedit_defaultui_quickbutton_insertanchor";
		qbanchor.style.cssText = "float: left; position: relative; width: 3px;height: 16px";
		toolbar.insertBefore(qbanchor, messagearea);
		_ui.el.qbanchor = qbanchor;
		
		if (def.quickbuttons) {
			for (i = 0; i < def.quickbuttons.length; i++) {
				_ui.toolbar.insert.quickbutton ( def.quickbuttons[i] );
			}
		}
		
		// Tabs
		tabselect = qbanchor = document.createElement("div");
		tabselect.id = "ghostedit_defaultui_tabselect";
		tabselect.style.cssText = "position: absolute;width: 100%;left: 0; bottom: -1px; height: 1px; line-height: 1px; font-size: 1px; background-color: #FFF";
		_ui.el.tabselect = tabselect;
		
		if (def.tabs) {
			for (i = 0; i < def.tabs.length; i++) {
				_ui.toolbar.insert.tab ( def.tabs[i] );
			}
		}
		
		// Insert toolbar into DOM
		_ui.el.wrap.insertBefore(toolbar, _ui.el.wrap.firstChild);
		
		// Attach event handlers to toolbar
		ghostedit.util.addEvent(_ui.el.toolbar,"mouseup", function(event) {_ui.toolbar.event.click(event); });
		ghostedit.util.addEvent(_ui.el.toolbar, "click", function( e ) { ghostedit.util.preventBubble(e); } );
		ghostedit.util.addEvent(_ui.el.toolbar, "mousedown", function( e ) { ghostedit.util.preventBubble(e); } );
		
		// Create and insert status bar
		statusbar = document.createElement("div");
		statusbar.id = "ghostedit_defaultui_statusbar";
		statusbar.className = "ghostedit_defaultui_statusbar";
		statusbar.innerHTML = "<b>Path:</b>";
		_ui.el.wrap.appendChild(statusbar);
		_ui.el.statusbar = statusbar;
		
		// Create (initially hidden) modal elements
		modal = document.createElement("div");
		modal.id = "ghostedit_defaultui_modal";
		modal.className = "ghostedit_defaultui_modal";
		_ui.el.wrap.appendChild(modal);
		_ui.el.modal = modal;
		
		modalbg = document.createElement("div");
		modalbg.id = "ghostedit_defaultui_modalbg";
		modalbg.className = "ghostedit_defaultui_modalbg";
		ghostedit.util.addEvent(modalbg, "click", function () { _ui.modal.hide(); });
		_ui.el.wrap.appendChild(modalbg);
		_ui.el.modalbg = modalbg;
		
		// Show textblock tab
		_ui.toolbar.showtab("textblock");
	};
	
	_ui.update = function () {
		var i, j, node, tagname, classname, pathstring = "", wordcount = "N/A", textcontent, ht;
		ht = _ui.toolbar.highlightmap;
		
		if (!ghostedit.ready) return;
		
		/* Reset ui elements to non highlighted state */
		for (i = 0; i < ht.length; i++) {
			ghostedit.util.removeClass(ht[i].element, "current");
		}
	
		for(i = 0; i < ghostedit.selection.nodepath.length; i++) {
			node = ghostedit.selection.nodepath[i];
			tagname = node.tagName.toLowerCase();
			classname = ghostedit.util.trim(node.className);
			
			for (j = 0; j < ht.length; j++) {
				if (ht[j].test.call(ht[j].data, tagname, classname, node)) {
					ghostedit.util.addClass(ht[j].element, "current");
				}
			}


			/*if (ghostedit.plugins.textblock.isTextBlock(node) && _ui.typeChangerLookup[node.tagName]) {
				ghostedit.util.addClass(document.getElementById(_ui.typeChangerLookup[node.tagName]), "ghostedit_defaultui_stylebox_current")
				document.getElementById('ghostedit_defaultui_clearselect').value = node.style.clear;
				document.getElementById("align" + (node.style.textAlign != "" ? node.style.textAlign : "left") + "Button").className = "current";
			}*/
			
			if (i !== ghostedit.selection.nodepath.length - 1) { // Don't include rootnode in path
				pathstring = " > " + (_ui.elemInEnglish[node.tagName.toLowerCase()] || node.tagName.toUpperCase()) + pathstring;
			}
			
		}
		
		_ui.el.statusbar.innerHTML = "<b>Path</b>" + pathstring;
		
		if (ghostedit.options.defaultui.wordcount) {
			textcontent = ghostedit.util.trim(ghostedit.el.rootnode.innerText || ghostedit.el.rootnode.textContent);
			wordcount = textcontent.split(/\s+/).length;
			_ui.el.statusbar.innerHTML += "<div style='position: absolute; right: 10px; top: 3px'>" + wordcount + " words</div>";	
		}
	};
	
	
	_ui.modal = {
		show: function (content) {
			var modal, modalbg, a;
			modal = _ui.el.modal;
			modalbg = _ui.el.modalbg;
			
			modal.innerHTML = content;
			
			a = document.createElement("a");
			a.className = "ghostedit_defaultui_modal_closebutton";
			a.innerHTML = "&#215";
			ghostedit.util.addEvent(a, "click", _ui.modal.hide);
			modal.appendChild(a);
			
			modal.style.display = 'block';
			modalbg.style.display = 'block';
		},
		
		hide: function () {
			var modal, modalbg;
			modal = _ui.el.modal;
			modalbg = _ui.el.modalbg;
			
			modal.style.display = 'none';
			modalbg.style.display = 'none';
			modal.innerHTML = "";
			ghostedit.selection.restore();
		},
		
		showabout: function () {
			_ui.modal.show("<h2>About GhostEdit</h2>" +
			"<p>GhostEdit is a WYSIWYG editor based on the concept that the editor should be transparent to use - i.e. you do no notice that you are using it. This manifests itself in two ways:</p>" +
			"<ul><li>GhostEdit has an incredibly simple user interface, which is designed for maximum usability</li>" +
			"<li>GhostEdit restricts input to known, safe content so as to be as reliable as possible</li></ul>" + 
			"<h3>Credits</h3>" +
			"GhostEdit was designed and coded by <a href='http://nicoburns.com'>Nico Burns</a>.<br />" +
			"Icons licensed from <a href='http://www.gentleface.com/free_icon_set.html'>Gentleface</a> under a <a href='http://creativecommons.org/licenses/by-nc-nd/3.0/'>CC BY-NC-ND 3.0</a> liscense." + 
			"<br />version: " + ghostedit.version);
			
		}
	};
	
	_ui.message = {
		div: "",
		show: function (params) {//, bgcolor) {
			var msg, time, color, msgarea;
			msg = params.message;
			time = params.time;
			color = params.color;
			
			msgarea = _ui.el.messagearea;
			msgarea.innerHTML = msg;

			color = (color === "success") ? "#bbff00" : color;
			color = (color === "error") ? "#ff4949" : color;
			color = (color === "warn") ? "#ffef49" : color;
			msgarea.style.backgroundColor = color;
			
			msgarea.style.opacity = 1;
			if (msgarea.filters){ msgarea.filters.item(0).enabled = 1; }
			
			if (time !== 0) {
				clearTimeout(_ui.message.timer);
				_ui.message.timer = setTimeout(function() { _ui.message.clear(); }, time * 1000);
			}
		},
		
		clear: function () {
			var msgarea = _ui.el.messagearea;
			if (msgarea.style.opacity > 0.1) {
				msgarea.style.opacity = msgarea.style.opacity - 0.05;
				if (msgarea.filters){ msgarea.filters.item(0).Opacity = (msgarea.style.opacity*100); }
				setTimeout(function() { _ui.message.clear(); }, 20);
			}
			else {
				msgarea.innerHTML = "&nbsp;";
				msgarea.style.backgroundColor = "transparent";
				msgarea.opacity = "1";
				if (msgarea.filters) { msgarea.filters.item(0).Opacity = 100; }
			}
		}
	};
	
	_ui.toolbar = {
		div: "",
		quickbuttons: [],
		tabs: [],
		enabledtabs: ["format", "insert", "save"],
		panels: [],
		styleboxes: [],
		highlightmap: [],
		
		event: {
			click: function (e) {
				if (!ghostedit.event.allowtoolbarclick ) {//}&& !ghostedit.image.focusedimage) {
					//Causes toolbar text field not to be selectable.ghostedit.selection.restore();
					ghostedit.util.cancelAllEvents (e);
				}
			},
			
			buttonclick: {
				insertimage: function () {
					ghostedit.selection.save();
					var i, elem, images, modalcontent, insert;
					modalcontent = "<h2>Insert image</h2><form>" +
					"<p>This dialog allows you to choose an image to insert into the document. Either select one from the list of uploaded images, or enter a custom url in the box below.</p>" +
					"<hr />" +
					//"<h3 style='clear: both;'>Upload new image</h3>" +
					//"<div id='ghostedit_imageuploadarea'><noscript>noscript</noscript></div>" +
					//"<hr />" +
					"<h3 style='clear: both;'>Select uploaded image</h3>" +
					"<div id='ghostedit_listbox' style='height: 200px;overflow-x: hidden;overflow-y: scroll;background: white; border: 1px solid #ccc'></div>" +
					"<hr />" +
					"<h3>Or enter URL</h3>" +
					"<input type='text' value='' id='ghostedit_imageurlinput' style='width: 99%' /><br />" +
					"<input type='button' value='Insert' style='float: right;margin-top: 10px;' onclick='ghostedit.plugins.image.newImageBefore(null, null);ghostedit.plugins.defaultui.modal.hide();' />" +
					"</form>" +
					"";
					
					/*images = [
					{id: "5", name: "test3", url: "data/pages/images/large/5.jpg", thumburl: ""},
					{id: "6", name: "test2", url: "data/pages/images/large/6.jpg", thumburl: "data/pages/images/small/6.jpg"}
					];*/
					
					images = [];
					
					if(ghostedit.options.defaultui.uploadedimages) {
						images = ghostedit.options.defaultui.uploadedimages;
					}
					
					_ui.modal.show(modalcontent);
					
					insert = function () {
						ghostedit.plugins.image.newImageBefore(null, this.getAttribute("ghostedit-listitem-value"), false);
						_ui.modal.hide();
					};
					
					for(i = 0; i < images.length; i += 1) {
						elem = document.createElement("div");
						elem.className = "ghostedit-listbox-item";
						elem.setAttribute("ghostedit-listitem-value", images[i].url);
						elem.innerHTML = "<img src='" + images[i].thumburl + "' style='height: 60px; float: left' /><p style='margin-left: 100px;font-size: 21px'>" + images[i].name + "</p>";
						elem.onclick = insert;
						document.getElementById("ghostedit_listbox").appendChild(elem);
					}
					
					document.getElementById('ghostedit_imageurlinput').focus();
				},
				
				insertlink: function () {
					ghostedit.api.link.create();
					document.getElementById('ghostedit_defaultui_textfield_linkurl').focus();
				}
			}
		},
		
		clicktab: function (tab) {
			var panel, tabname;
			if (typeof tab === "string") tab = document.getElementById('ghostedit_defaultui_toolbartab_' + tab.replace('ghostedit_defaultui_toolbartab_',''));
			tabname = tab.id.replace('ghostedit_defaultui_toolbartab_','');
			panel = document.getElementById('ghostedit_defaultui_toolbarpanel_' + tabname);
		
			ghostedit.selection.restore();
			
			ghostedit.event.trigger("ui:newcontext", {context: tabname});
			//_ui.toolbar.showtab(tab);
		},
		
		showtab: function (tab) {
			var panel, tabname, toolbarelems, i, node;
			if (typeof tab === "string") tab = document.getElementById('ghostedit_defaultui_toolbartab_' + tab.replace('ghostedit_defaultui_toolbartab_',''));
			tabname = tab.id.replace('ghostedit_defaultui_toolbartab_','');
			panel = document.getElementById('ghostedit_defaultui_toolbarpanel_' + tabname);
			
			toolbarelems = _ui.el.toolbar.childNodes;
			
			for (i = 0; i < toolbarelems.length; i += 1) {
				node = toolbarelems[i];
				if (node.nodeType === 1) {
					if (/tab/.test(node.className) || /panel/.test(node.className)) {
						ghostedit.util.removeClass(node, "active");
					}
				}
			}
			
			if (!_ui.toolbar.enabledtabs[tabname]) _ui.toolbar.enabletab (tabname);
			ghostedit.util.addClass(tab, "active");
			ghostedit.util.addClass(panel, "active");
			//moves the elem which appears over border-bottom of active tab
			tab.appendChild(_ui.el.tabselect);
		},
		
		enabletab: function (tabname) {
			var tab;
			tab = document.getElementById('ghostedit_defaultui_toolbartab_' + tabname);
			//panel = document.getElementById('ghostedit_defaultui_toolbarpanel_' + tabname);
			
			ghostedit.util.addClass(tab, "enabled");
			_ui.toolbar.enabledtabs.push(tabname);
		},
		
		disabletab: function (tabname) {
			var tab;
			
			tab = document.getElementById('ghostedit_defaultui_toolbartab_' + tabname);
			//panel = document.getElementById('ghostedit_defaultui_toolbarpanel_' + tabname);
			
			ghostedit.util.removeClass(tab, "enabled");
			delete _ui.toolbar.enabledtabs[tabname];
		},
		
		insert: {
			quickbutton: function (def /* {label, icon, action} */) {
				var button;
				if (!def || !def.label || !def.icon || !ghostedit.util.isFunction(def.action)) return false;
				
				button = document.createElement("img");
				button.className = "ghostedit_defaultui_quickbutton";
				button.src = ghostedit.options.imageurl + "/defaultui/" + def.icon;
				button.title = def.label;
				button.alt = def.label;
				
				_ui.el.toolbar.insertBefore(button, _ui.el.qbanchor);
				_ui.toolbar.quickbuttons.push(button);
				
				button.onclick = def.action;
			},
			
			tab: function (def /* {name, label, enabled, contents */) {
				var tab, panel, i;
				
				// Create tab
				tab = document.createElement("div");
				tab.className = def.enabled ? "ghostedit_defaultui_toolbartab enabled" : "ghostedit_defaultui_toolbartab";
				tab.id = "ghostedit_defaultui_toolbartab_" + def.name;
				tab.innerHTML = def.label;
				
				// Create panel
				panel = document.createElement("div");
				ghostedit.util.addClass(panel, "ghostedit_defaultui_toolbarpanel");
				panel.id = "ghostedit_defaultui_toolbarpanel_" + def.name;
				
				// Create panel content
				if (def.contents) {
					for (i = 0; i < def.contents.length; i++) {
						switch (def.contents[i].type) {
							case "group":
								_ui.toolbar.insert.panelgroup (panel, def.contents[i]);
							break;
							case "seperator":
								_ui.toolbar.insert.panelseperator (panel);
							break;
						}
					}
				}
				
				// Insert tab and panel
				_ui.el.toolbar.insertBefore(tab, _ui.el.messagearea);
				_ui.el.toolbar.appendChild(panel);
				_ui.toolbar.tabs.push(tab);
				
				tab.onclick = function () { _ui.toolbar.clicktab(this); };
			},
			
			
			panelseperator: function (panel) {
				var seperator;
				
				seperator = document.createElement("span");
				seperator.className = "ghostedit_defaultui_toolbarseperator";
				seperator.style.backgroundImage = "URL(" + ghostedit.options.imageurl + "/defaultui/toolbar_seperator.png)";
				
				panel.appendChild(seperator);
			},
		
			panelgroup: function (panel, def /* {type, style, contents} */) {
				var group, i;
				
				// Create panel group
				group = document.createElement("span");
				group.className = "ghostedit_defaultui_toolbarpanelgroup";
				if (def.style) group.style.cssTet = def.style;
				
				// Create group content
				if (def.contents) {
					for (i = 0; i < def.contents.length; i++) {
						switch (def.contents[i].type) {
							case "button":
								_ui.toolbar.insert.button (group, def.contents[i]);
							break;
							case "stylebox":
								_ui.toolbar.insert.stylebox (group, def.contents[i]);
							break;
							case "specialchar":
								_ui.toolbar.insert.specialchar (group, def.contents[i]);
							break;
							case "textfield":
								_ui.toolbar.insert.textfield (group, def.contents[i]);
							break;
							case "br":
								group.appendChild(document.createElement("br"));
							break;
							/*case "html":
								group.innerHTML += def.contents[i].html;
							break;*/
						}
					}
				}
				
				// Insert panelgroup
				panel.appendChild(group);
			},
			
			button: function (panelgroup, def /* {type, label, icon, action, style, highlighttag, highlightclass} */) {
				var button;
				
				button = document.createElement("img");
				button.src = ghostedit.options.imageurl + "/defaultui/" + def.icon;
				button.title = def.label;
				button.alt = def.label;
				if (def.style) button.style.cssText = def.style;
				
				panelgroup.appendChild(button);
				if (def.highlighttest) {
					_ui.toolbar.highlightmap.push({element: button, test: def.highlighttest});
				}
				
				ghostedit.util.addEvent(button, "click", def.action);
			},
			
			specialchar: function (panelgroup, def /* character */) {
				var button;
				
				button = document.createElement("a");
				button.className = "ghostedit_defaultui_specialchar";
				button.title = "Insert Character";
				button.alt = "Insert Character";
				button.innerHTML = def.character;
				
				panelgroup.appendChild(button);
				
				button.onclick = function () { ghostedit.api.insert.character(this.innerHTML); };
			},
			
			textfield: function (panelgroup, def) {
				var input;
				
				input = document.createElement("input");
				if(def.id) input.id = "ghostedit_defaultui_textfield_" + def.id;
				input.style.width = def.width ? def.width : "200px";
				
				if (def.label) panelgroup.innerHTML += def.label + "<br />";
				panelgroup.appendChild(input);
				
				ghostedit.util.addEvent(input, "click", function (event) { ghostedit.util.preventBubble(event); });
				ghostedit.util.addEvent(input, "keypress", function (event) { ghostedit.util.preventBubble(event); });
				ghostedit.util.addEvent(input, "keydown", function (event) { ghostedit.util.preventBubble(event); });
				ghostedit.util.addEvent(input, "keyup", def.onkeyup);
			},
			
			stylebox: function (panelgroup, def /* {type, label, tagname, classnanme} */) {
				var stylebox, label;
				
				stylebox = document.createElement("div");
				stylebox.className = "ghostedit_defaultui_stylebox";
				stylebox.id = "ghostedit_defaultui_stylebox_" + def.tagname;
				if (def.classname) stylebox.id = stylebox.id + "_" + def.classname;
				stylebox.innerHTML = "<" + def.tagname + " class='ghostedit_defaultui_stylebox_preview'>AaBbCc</" + def.tagname + ">";
				stylebox.title = def.label;
				stylebox.alt = def.label;
				
				label = document.createElement("div");
				label.className = "ghostedit_defaultui_stylebox_label";
				label.innerHTML = def.label;
				stylebox.appendChild(label);				
				
				panelgroup.appendChild(stylebox);
				_ui.toolbar.styleboxes.push(stylebox);
				
				_ui.toolbar.highlightmap.push({
					element: stylebox,
					data: { tagname: def.tagname, classname: def.classname !== undefined ? def.classname : ""},
					test: function (tagname, classname/*, node*/) { return tagname === this.tagname && classname === this.classname; }
				});
				
				stylebox.onclick = function () { ghostedit.api.format.setStyle(def.tagname, def.classname); };
			}	
		}
	};
	
	ghostedit.api.plugin.register("defaultui", _ui);
})();
(function () {
	var _ui = {
		aelem: false,
		context: null
	},
	ghostedit = window.ghostedit;
	
	_ui.el = {};
	
	_ui.enable =  function () {
		
		// Call UI replace event to signal to other UI's to disable themselves (at their own discretion)
		ghostedit.event.trigger("ui:replace");
				
		// Register event listeners
		ghostedit.event.addListener("ui:update", function () { _ui.update(); }, "minimalui");
		ghostedit.event.addListener ("ui:replace", function () { ghostedit.api.plugin.disable("minimalui"); }, "minimalui");
		
		// Define tempoary variables for UI creation
		var toolbar, plugins, i, linkplugin = false, listplugin = false;
		
		// Create toolbar wrapper
		toolbar = document.createElement("div");
		toolbar.id = "ghostedit_minimalui_toolbar";
		toolbar.className = "ghostedit_minimalui_toolbar";
		_ui.el.toolbar = toolbar;
		
		// Buttons	
		_ui.insertbutton({label: "Bold", icon: "format-bold.png", action: function () { ghostedit.api.format.bold(); }});
		_ui.insertbutton({label: "Italic", icon: "format-italic.png", action: function () { ghostedit.api.format.italic(); }});
		_ui.insertbutton({label: "Underline", icon: "format-underline.png", action: function () { ghostedit.api.format.underline(); }});
		_ui.insertbutton({label: "Strikethrough", icon: "format-strikethrough.png", action: function () { ghostedit.api.format.strikethrough(); }});
		_ui.insertbutton({label: "Align Left", icon: "align-left.png", action: function () { ghostedit.api.format.alignText("left"); }});
		_ui.insertbutton({label: "Align Center", icon: "align-center.png", action: function () { ghostedit.api.format.alignText("center"); }});
		_ui.insertbutton({label: "Align Right", icon: "align-right.png", action: function () { ghostedit.api.format.alignText("right"); }});
		_ui.insertbutton({label: "Justify", icon: "align-justified.png", action: function () { ghostedit.api.format.alignText("justify"); }});
		
		plugins = ghostedit.options.plugins;
		if (plugins) {
			for (i = 0; i < plugins.length; i++) {
				switch (plugins[i]) {
					case "link":
						linkplugin = true;
					break;
					case "list":
						listplugin = true;
					break;
				}
			}
		}
		
		if (linkplugin) {
			//_ui.insertbutton({label: "Insert Link", icon: "insert-link.png", action: function () { ghostedit.api.link.create(); }});
		}
		
		if (listplugin) {
			_ui.insertbutton({label: "Bulleted List", icon: "list-unordered.png", action: function () { ghostedit.api.list.toggle("unordered"); }});
			_ui.insertbutton({label: "Numbered List", icon: "list-ordered.png", action: function () { ghostedit.api.list.toggle("ordered"); }});
		}

		_ui.insertbutton({label: "Undo", icon: "undo16.png", action: function() { ghostedit.api.undo(); } });
		_ui.insertbutton({label: "Redo", icon: "redo16.png", action: function() { ghostedit.api.redo(); } });
		
		// Insert toolbar into DOM
		ghostedit.el.uilayer.parentNode.insertBefore(toolbar, ghostedit.el.uilayer);
		
		// Attach event handlers to toolbar
		ghostedit.util.addEvent(_ui.el.toolbar,"mouseup", ghostedit.util.cancelAllEvents);
		ghostedit.util.addEvent(_ui.el.toolbar, "click", ghostedit.util.preventBubble);
		ghostedit.util.addEvent(_ui.el.toolbar, "mousedown", ghostedit.util.preventBubble);
	};
	
	_ui.disable = function () {
		// Remove event listeners
		ghostedit.event.removeAllListeners("minimalui");
		
		// Remove toolbar
		_ui.el.toolbar.parentNode.removeChild(_ui.el.toolbar);
	};
	
	_ui.update = function () {
		var i, j, node, tagname, classname, ht;
		ht = _ui.highlightmap;
		
		/* Reset ui elements to non highlighted state */
		for (i = 0; i < ht.length; i++) {
			ghostedit.util.removeClass(ht[i].element, "current");
		}
	
		for(i = 0; i < ghostedit.selection.nodepath.length; i++) {
			node = ghostedit.selection.nodepath[i];
			tagname = node.tagName.toLowerCase();
			classname = ghostedit.util.trim(node.className);
			
			for (j = 0; j < ht.length; j++) {
				if (ht[j].test.call(ht[j].data, tagname, classname, node)) {
					ghostedit.util.addClass(ht[j].element, "current");
				}
			}			
		}
	};
	
	_ui.quickbuttons = [];
	_ui.highlightmap = [];
	
	_ui.insertbutton = function (def /* {type, label, icon, action, style, highlighttag, highlightclass} */) {
		var button;
		if (!def || !def.label || !def.icon || !ghostedit.util.isFunction(def.action)) return false;
		
		
		button = document.createElement("img");
		button.src = ghostedit.options.imageurl + "/minimalui/" + def.icon;
		button.title = def.label;
		button.alt = def.label;
		if (def.style) button.style.cssText = def.style;
		button.style.marginRight = "5px";
		
		_ui.el.toolbar.appendChild(button);
		if (def.highlighttest) {
			_ui.highlightmap.push({element: button, test: def.highlighttest});
		}
		
		ghostedit.util.addEvent(button, "click", def.action);
	};

	_ui.inserttextfield = function (panelgroup, def) {
		var input;
		
		input = document.createElement("input");
		if(def.id) input.id = "ghostedit_minimalui_textfield_" + def.id;
		input.style.width = def.width ? def.width : "200px";
		
		if (def.label) panelgroup.innerHTML += def.label + "<br />";
		panelgroup.appendChild(input);
		
		ghostedit.util.addEvent(input, "click", function (event) { ghostedit.util.preventBubble(event); });
		ghostedit.util.addEvent(input, "keypress", function (event) { ghostedit.util.preventBubble(event); });
		ghostedit.util.addEvent(input, "keydown", function (event) { ghostedit.util.preventBubble(event); });
		ghostedit.util.addEvent(input, "keyup", def.onkeyup);
	};
			
	_ui.insertstylebox = function (panelgroup, def /* {type, label, tagname, classnanme} */) {
		var stylebox;
		
		_ui.highlightmap.push({
		element: stylebox,
		data: { tagname: def.tagname, classname: def.classname !== undefined ? def.classname : ""},
			test: function (tagname, classname/*, node*/) { return tagname === this.tagname && classname === this.classname; }
		});
		
		stylebox.onclick = function () { ghostedit.api.format.setStyle(def.tagname, def.classname); };
	};
	
	ghostedit.api.plugin.register("minimalui", _ui);
})();