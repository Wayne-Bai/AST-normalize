/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global console define */
/*jslint browser:true */

define("orion/editor/contentAssist", [ //$NON-NLS-0$
	'i18n!orion/editor/nls/messages', //$NON-NLS-0$
	'orion/keyBinding', //$NON-NLS-0$
	'orion/editor/keyModes', //$NON-NLS-0$
	'orion/editor/eventTarget', //$NON-NLS-0$
	'orion/Deferred', //$NON-NLS-0$
	'orion/objects', //$NON-NLS-0$
	'orion/editor/util', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(messages, mKeyBinding, mKeyModes, mEventTarget, Deferred, objects, textUtil, util) {
	/**
	 * @name orion.editor.ContentAssistProvider
	 * @class Interface defining a provider of content assist proposals.
	 */
	/**
	 * @memberOf orion.editor.ContentAssistProvider.prototype
	 * @function
	 * @name computeProposals
	 * @param {String} buffer The buffer being edited.
	 * @param {Number} offset The position in the buffer at which content assist is being requested.
	 * @param {orion.editor.ContentAssistProvider.Context} context
	 * @returns {Object[]} This provider's proposals for the given buffer and offset.
	 */
	/**
	 * @name orion.editor.ContentAssistProvider.Context
	 * @class
	 * @property {String} line The text of the line on which content assist is being requested.
	 * @property {String} prefix Any non-whitespace, non-symbol characters preceding the offset.
	 * @property {orion.editor.Selection} selection The current selection.
	 */

	/**
	 * @name orion.editor.ContentAssist
	 * @class Provides content assist for a TextView.
	 * @description Creates a <code>ContentAssist</code> for a TextView. A ContentAssist consults a set of 
	 * {@link orion.editor.ContentAssistProvider}s to obtain proposals for text that may be inserted into a
	 * TextView at a given offset.<p>
	 * A ContentAssist is generally activated by its TextView action, at which point it computes the set of 
	 * proposals available. It will re-compute the proposals in response to subsequent changes on the TextView 
	 * (for example, user typing) for as long as the ContentAssist is active. A proposal may be applied by calling 
	 * {@link #apply}, after which the ContentAssist becomes deactivated. An active ContentAssist may be deactivated
	 * by calling {@link #deactivate}.<p>
	 * A ContentAssist dispatches events when it becomes activated or deactivated, and when proposals have been computed.
	 * @param {orion.editor.TextView} textView The TextView to provide content assist for.
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	/**
	 * Dispatched when a ContentAssist is about to be activated.
	 * @name orion.editor.ContentAssist#ActivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist is about to be deactivated.
	 * @name orion.editor.ContentAssist#DeactivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist has applied a proposal. <p>This event's <code>data</code> field gives information
	 * about the proposal that was applied.
	 * @name orion.editor.ContentAssist#ProposalAppliedEvent
	 * @event
	 */
	/**
	 * Dispatched whenever a ContentAssist has obtained proposals from its providers. <p>This event's
	 * <code>data</code> field gives information about the proposals.
	 * @name orion.editor.ContentAssist#ProposalsComputedEvent
	 * @event
	 */

	/**
	 * Flattens an array of arrays into a one-dimensional array.
	 * @param {Array[]} array
	 * @returns {Array}
	 */
	function flatten(array) {
		return array.reduce(function(prev, curr) {
			return Array.isArray(curr) ? prev.concat(curr) : prev;
		}, []);
	}

	// INACTIVE --Ctrl+Space--> ACTIVE --ModelChanging--> FILTERING
	var State = {
		INACTIVE: 1,
		ACTIVE: 2,
		FILTERING: 3
	};
	
	var STYLES = {
		selected : " selected", //$NON-NLS-0$
		hr : "proposal-hr", //$NON-NLS-0$
		emphasis : "proposal-emphasis", //$NON-NLS-0$
		noemphasis : "proposal-noemphasis", //$NON-NLS-0$
		dfault : "proposal-default" //$NON-NLS-0$
	};
	
	function ContentAssist(textView) {
		this.textView = textView;
		this.state = State.INACTIVE;
		this.providers = [];
		var self = this;
		this.contentAssistListener = {
			onModelChanging: function(event) {
				if (self.isDeactivatingChange(event)) {
					self.setState(State.INACTIVE);
				} else {
					if (self.state === State.ACTIVE) {
						self.setState(State.FILTERING);
					}
				}
			},
			onScroll: function(event) {
				self.setState(State.INACTIVE);
			},
			onSelection: function(event) {
				var state = self.state;
				if (state === State.ACTIVE || state === State.FILTERING) {
					self.computeProposals();
					self.setState(State.FILTERING);
				}
			}
		};
		textView.setKeyBinding(util.isMac ? new mKeyBinding.KeyBinding(' ', false, false, false, true) : new mKeyBinding.KeyBinding(' ', true), "contentAssist"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		textView.setAction("contentAssist", function() { //$NON-NLS-0$
			if (!textView.getOptions("readonly")) { //$NON-NLS-0$
				self.activate();
			}
			return true;
		}, {name: messages.contentAssist});
	}
	ContentAssist.prototype = /** @lends orion.editor.ContentAssist.prototype */ {
		/**
		 * Applies the given proposal to the TextView.
		 * @param {Object} [proposal]
		 * @returns {Boolean} <code>true</code> if the proposal was applied; <code>false</code> if no proposal was provided.
		 */
		apply: function(proposal) {
			if (!proposal) {
				return false;
			}
	
			// now handle prefixes
			// if there is a non-empty selection, then replace it,
			// if overwrite is truthy, then also replace the prefix
			var view = this.textView;
			var sel = view.getSelection();
			var start = Math.min(sel.start, sel.end), mapStart = start;
			var end = Math.max(sel.start, sel.end), mapEnd = end;
			var model = view.getModel();
			if (model.getBaseModel) {
				mapStart = model.mapOffset(mapStart);
				mapEnd = model.mapOffset(mapEnd);
				model = model.getBaseModel();
			}
			if (proposal.overwrite) {
				start = this.getPrefixStart(model, mapStart);
			}

			var data = {
				proposal: proposal,
				start: mapStart,
				end: mapEnd
			};
			this.setState(State.INACTIVE);
			var proposalText = typeof proposal === "string" ? proposal : proposal.proposal; //$NON-NLS-0$
			view.setText(proposalText, start, end);
			this.dispatchEvent({type: "ProposalApplied", data: data}); //$NON-NLS-0$
			return true;
		},
		activate: function() {
			if (this.state === State.INACTIVE) {
				this.setState(State.ACTIVE);
			}
		},
		deactivate: function() {
			this.setState(State.INACTIVE);
		},
		/** @returns {orion.editor.TextView} */
		getTextView: function() {
			return this.textView;
		},
		/** @returns {Boolean} */
		isActive: function() {
			return this.state === State.ACTIVE || this.state === State.FILTERING;
		},
		/** @returns {Boolean} <code>true</code> if the event describes a change that should deactivate content assist. */
		isDeactivatingChange: function(/**orion.editor.ModelChangingEvent*/ event) {
			var deletion = event.removedCharCount > 0 && event.addedCharCount === 0,
			    view = this.textView,
			    overWhitespace = (event.start+1 <= view.getModel().getCharCount()) && /^\s*$/.test(view.getText(event.start, event.start+1));
			return event.removedLineCount > 0 || event.addedLineCount > 0 || (deletion && overWhitespace);
		},
		/** @private */
		setState: function(state) {
			var eventType;
			if (state === State.ACTIVE) {
				eventType = "Activating"; //$NON-NLS-0$
				if (this._mode) { this._mode.setActive(true); }
				
			} else if (state === State.INACTIVE) {
				eventType = "Deactivating"; //$NON-NLS-0$
				if (this._mode) { this._mode.setActive(false); }
			}
			if (eventType) {
				this.dispatchEvent({type: eventType});
			}
			this.state = state;
			this.onStateChange(state);
		},
		setMode: function(mode) {
			this._mode = mode;
		},
		/** @private */
		onStateChange: function(state) {
			if (state === State.INACTIVE) {
				if (this.listenerAdded) {
					this.textView.removeEventListener("ModelChanging", this.contentAssistListener.onModelChanging); //$NON-NLS-0$
					this.textView.removeEventListener("Scroll", this.contentAssistListener.onScroll); //$NON-NLS-0$
					this.textView.removeEventListener("Selection", this.contentAssistListener.onSelection); //$NON-NLS-0$
					this.listenerAdded = false;
				}
			} else if (state === State.ACTIVE) {
				if (!this.listenerAdded) {
					this.textView.addEventListener("ModelChanging", this.contentAssistListener.onModelChanging); //$NON-NLS-0$
					this.textView.addEventListener("Scroll", this.contentAssistListener.onScroll); //$NON-NLS-0$
					this.textView.addEventListener("Selection", this.contentAssistListener.onSelection); //$NON-NLS-0$
					this.listenerAdded = true;
				}
				this.computeProposals();
			}
		},
		/**
		 * Computes the proposals at the TextView's current caret offset.
		 */
		computeProposals: function() {
			var self = this;
			var offset = this.textView.getCaretOffset();
			this._computeProposals(offset).then(function(proposals) {
				if (!self.isActive()) { return; }
				self.dispatchEvent({type: "ProposalsComputed", data: {proposals: proposals}}); //$NON-NLS-0$
			});
		},
		/** @private */
		getPrefixStart: function(model, end) {
			var index = end;
			while (index > 0 && /[A-Za-z0-9_]/.test(model.getText(index - 1, index))) {
				index--;
			}
			return index;
		},
		handleError: function(error) {
			if (typeof console !== "undefined") { //$NON-NLS-0$
				console.log("Error retrieving content assist proposals"); //$NON-NLS-0$
				console.log(error && error.stack);
			}
		},
		/**
		 * Retrieves the proposals at the given offset.
		 * @private
		 * @param {Number} offset The caret offset.
		 * @returns {Deferred} A promise that will provide the proposals.
		 */
		_computeProposals: function(offset) {
			var providers = this.providers;
			var textView = this.textView;
			var sel = textView.getSelection();
			var model = textView.getModel(), mapOffset = offset;
			if (model.getBaseModel) {
				mapOffset = model.mapOffset(mapOffset);
				sel.start = model.mapOffset(sel.start);
				sel.end = model.mapOffset(sel.end);
				model = model.getBaseModel();
			}
			var line = model.getLine(model.getLineAtOffset(mapOffset));
			var index = 0;
			while (index < line.length && /\s/.test(line.charAt(index))) {
				index++;
			}
			var indentation = line.substring(0, index);
			var options = textView.getOptions("tabSize", "expandTab"); //$NON-NLS-1$ //$NON-NLS-0$
			var tab = options.expandTab ? new Array(options.tabSize + 1).join(" ") : "\t"; //$NON-NLS-1$ //$NON-NLS-0$
			var context = {
				line: line,
				offset: mapOffset,
				prefix: model.getText(this.getPrefixStart(model, mapOffset), mapOffset),
				selection: sel,
				delimiter: model.getLineDelimiter(),
				tab: tab,
				indentation: indentation
			};
			var self = this;
			var promises = providers.map(function(provider) {
				var proposals;
				try {
					var func, promise;
					if ((func = provider.computeContentAssist)) {
						var editorContext = self.editorContextProvider && self.editorContextProvider();
						promise = func.apply(provider, [editorContext, context]);
					} else if ((func = provider.getProposals || provider.computeProposals)) {
						// old API
						promise = func.apply(provider, [model.getText(), mapOffset, context]);
					}
					proposals = self.progress ? self.progress.progress(promise, "Generating content assist proposal") : promise; //$NON-NLS-0$
				} catch (e) {
					self.handleError(e);
				}
				return Deferred.when(proposals);
			});
			return Deferred.all(promises, this.handleError).then(flatten);
		},

		/**
		 * Sets the editor context factory that this ContentAssist will invoke to generate an <code>{@link orion.edit.EditorContext}</code>.
		 * The EditorContext is passed to providers that implement the v4.0 content assist API.
		 * @param {Function} editorContextProvider A function that returns an {@link orion.edit.EditorContext}.
		 */
		setEditorContextFactory: function(editorContextFactory) {
			this.editorContextProvider = editorContextFactory;
		},

		/**
		 * Sets the content assist providers that this ContentAssist will consult to obtain proposals.
		 * @param {orion.editor.ContentAssistProvider[]} providers The providers.
		 */
		setProviders: function(providers) {
			this.providers = providers.slice(0);
		},
		
		/**
		 * Sets the progress handler that will display progress information, if any are generated by content assist providers.
		 */
		setProgress: function(progress){
			this.progress = progress;
		}
	};
	mEventTarget.EventTarget.addMixin(ContentAssist.prototype);

	/**
	 * @name orion.editor.ContentAssistMode
	 * @class Editor mode for interacting with content assist proposals.
	 * @description Creates a ContentAssistMode. A ContentAssistMode is a key mode for {@link orion.editor.Editor}
	 * that provides interaction with content assist proposals retrieved from an {@link orion.editor.ContentAssist}. 
	 * Interaction is performed via the {@link #lineUp}, {@link #lineDown}, and {@link #enter} actions. An 
	 * {@link orion.editor.ContentAssistWidget} may optionally be provided to display which proposal is currently selected.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {orion.editor.ContentAssistWidget} [ContentAssistWidget]
	 */
	function ContentAssistMode(contentAssist, ContentAssistWidget) {
		var textView = contentAssist.textView;
		mKeyModes.KeyMode.call(this, textView);
		this.contentAssist = contentAssist;
		this.widget = ContentAssistWidget;
		this.proposals = [];
		var self = this;
		this.contentAssist.addEventListener("ProposalsComputed", function(event) { //$NON-NLS-0$
			self.proposals = event.data.proposals;
			if (self.proposals.length === 0) {
				self.selectedIndex = -1;
				self.cancel();
			} else {
				self.selectedIndex = 0;	
			}
		});
		textView.setAction("contentAssistApply", function() { //$NON-NLS-0$
			return this.enter();
		}.bind(this));
		textView.setAction("contentAssistCancel", function() { //$NON-NLS-0$
			return this.cancel();
		}.bind(this));
		textView.setAction("contentAssistNextProposal", function() { //$NON-NLS-0$
			return this.lineDown();
		}.bind(this));
		textView.setAction("contentAssistPreviousProposal", function() { //$NON-NLS-0$
			return this.lineUp();
		}.bind(this));
		textView.setAction("contentAssistNextPage", function() { //$NON-NLS-0$
			return this.pageDown();
		}.bind(this));
		textView.setAction("contentAssistPreviousPage", function() { //$NON-NLS-0$
			return this.pageUp();
		}.bind(this));
		textView.setAction("contentAssistTab", function() { //$NON-NLS-0$
			return this.tab();
		}.bind(this));
	}
	ContentAssistMode.prototype = new mKeyModes.KeyMode();
	objects.mixin(ContentAssistMode.prototype, {
		createKeyBindings: function() {
			var KeyBinding = mKeyBinding.KeyBinding;
			var bindings = [];
			bindings.push({actionID: "contentAssistApply", keyBinding: new KeyBinding(13)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistCancel", keyBinding: new KeyBinding(27)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistNextProposal", keyBinding: new KeyBinding(40)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistPreviousProposal", keyBinding: new KeyBinding(38)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistNextPage", keyBinding: new KeyBinding(34)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistPreviousPage", keyBinding: new KeyBinding(33)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistTab", keyBinding: new KeyBinding(9)}); //$NON-NLS-0$
			return bindings;
		},
		cancel: function() {
			this.getContentAssist().deactivate();
		},
		/** @private */
		getContentAssist: function() {
			return this.contentAssist;
		},
		isActive: function() {
			return this.getContentAssist().isActive();
		},
		setActive: function(active) {
			if (active) {
				this.contentAssist.textView.addKeyMode(this);
			} else {
				this.contentAssist.textView.removeKeyMode(this);
			}
		},
		lineUp: function() {
			var newSelected = (this.selectedIndex === 0) ? this.proposals.length - 1 : this.selectedIndex - 1;
			return this._lineUp(newSelected);
		},
		_lineUp: function(newSelected) {
			while (this.proposals[newSelected].unselectable && newSelected > 0) {
				newSelected--;
			}
			this.selectedIndex = newSelected;
			if (this.widget) {
				this.widget.setSelectedIndex(this.selectedIndex);
			}
			return true;
		},
		lineDown: function() {
			var newSelected = (this.selectedIndex === this.proposals.length - 1) ? 0 : this.selectedIndex + 1;
			return this._lineDown(newSelected);
		},
		_lineDown: function(newSelected) {
			while (this.proposals[newSelected].unselectable && newSelected < this.proposals.length-1) {
				newSelected++;
			}
			this.selectedIndex = newSelected;
			if (this.widget) {
				this.widget.setSelectedIndex(this.selectedIndex);
			}
			return true;
		},
		pageUp: function() {
			if (this.widget) {
				var newSelected = this.widget.getTopIndex();
				if (newSelected === this.selectedIndex) {
					this.widget.scrollIndex(newSelected, false);
					newSelected = this.widget.getTopIndex();
				}
				return this._lineUp(newSelected);
			} else {
				return this.lineUp();
			}
		},
		pageDown: function() {
			if (this.widget) {
				var newSelected = this.widget.getBottomIndex();
				if (newSelected === this.selectedIndex) {
					this.widget.scrollIndex(newSelected, true);
					newSelected = this.widget.getBottomIndex();
				}
				return this._lineDown(newSelected);
			} else {
				return this.lineDown();
			}
		},
		enter: function() {
			var proposal = this.proposals[this.selectedIndex] || null;
			return this.contentAssist.apply(proposal);
		},
		tab: function() {
			if (this.widget) {
				this.widget.createAccessible(this);
				this.widget.parentNode.focus();
				return true;
			} else {
				return false;
			}
		}
	});

	/**
	 * @name orion.editor.ContentAssistWidget
	 * @class Displays proposals from a {@link orion.editor.ContentAssist}.
	 * @description Creates a ContentAssistWidget that will display proposals from the given {@link orion.editor.ContentAssist}
	 * in the given <code>parentNode</code>. Clicking a proposal will cause the ContentAssist to apply that proposal.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {String|DomNode} [parentNode] The ID or DOM node to use as the parent for displaying proposals. If not provided,
	 * a new DIV will be created inside &lt;body&gt; and assigned the CSS class <code>contentassist</code>.
	 */
	function ContentAssistWidget(contentAssist, parentNode) {
		this.contentAssist = contentAssist;
		this.textView = this.contentAssist.getTextView();
		this.textViewListenerAdded = false;
		this.isShowing = false;
		var document = this.textView.getOptions("parent").ownerDocument; //$NON-NLS-0$
		this.parentNode = typeof parentNode === "string" ? document.getElementById(parentNode) : parentNode; //$NON-NLS-0$
		if (!this.parentNode) {
			this.parentNode = util.createElement(document, "div"); //$NON-NLS-0$
			this.parentNode.className = "contentassist"; //$NON-NLS-0$
			var body = document.getElementsByTagName("body")[0]; //$NON-NLS-0$
			if (body) {
				body.appendChild(this.parentNode);
			} else {
				throw new Error("parentNode is required"); //$NON-NLS-0$
			}
		}
		var self = this;
		this.textViewListener = {
			onMouseDown: function(event) {
				var target = event.event.target || event.event.srcElement;
				if (target.parentElement !== self.parentNode) {
					self.contentAssist.deactivate();
				}
				// ignore the event if this is a click inside of the parentNode
				// the click is handled by the onClick() function
			}
		};
		this.contentAssist.addEventListener("ProposalsComputed", function(event) { //$NON-NLS-0$
			self.setProposals(event.data.proposals);
			self.show();
			if (!self.textViewListenerAdded) {
				self.textView.addEventListener("MouseDown", self.textViewListener.onMouseDown); //$NON-NLS-0$
				self.textViewListenerAdded = true;
			}
		});
		this.contentAssist.addEventListener("Deactivating", function(event) { //$NON-NLS-0$
			self.setProposals([]);
			self.hide();
			if (self.textViewListenerAdded) {
				self.textView.removeEventListener("MouseDown", self.textViewListener.onMouseDown); //$NON-NLS-0$
				self.textViewListenerAdded = false;
			}
			self.textViewListenerAdded = false;
		});
		this.scrollListener = function(e) {
			if (self.isShowing) {
				self.position();
			}
		};
		textUtil.addEventListener(document, "scroll", this.scrollListener); //$NON-NLS-0$
	}
	ContentAssistWidget.prototype = /** @lends orion.editor.ContentAssistWidget.prototype */ {
		/** @private */
		onClick: function(e) {
			if (!e) { e = window.event; }
			this.contentAssist.apply(this.getProposal(e.target || e.srcElement));
			this.textView.focus();
		},
		/** @private */
		createDiv: function(proposal, isSelected, parent, itemIndex) {
			var document = parent.ownerDocument;
			var div = util.createElement(document, "div");
			div.id = "contentoption" + itemIndex;
			div.setAttribute("role", "option");
			var node;
			if (proposal.style === "hr") {
				node = util.createElement(document, "hr");
				div.appendChild(node, div);
			} else if( proposal.style === "attributedString" ) {
				div.className = this.calculateClasses(proposal.style, isSelected);
				if (isSelected) {
					this.parentNode.setAttribute("aria-activedescendant", div.id);
				}
				
				var contentDiv = util.createElement(document, "div");
				var nobr = util.createElement(document, "nobr");
				contentDiv.appendChild(nobr);
				var contentNode = nobr;
				if( proposal.description ) {
					if( proposal.description.styleClass ) {
						contentDiv.className = proposal.description.styleClass;
					}
					
					if( proposal.description.icon ) {
						var iconNode = util.createElement(document, "img");
						iconNode.src = proposal.description.icon.src;
						contentNode.appendChild(iconNode);
					}
					
					if( proposal.description.segments ) {
					    proposal.description.segments.forEach( function(segment) {
							var itemNode = util.createElement(document, "span");
							var styleString = "";
							
							if( segment.style ) {
								if( segment.style.bold ) {
									itemNode.style.fontWeight = "bold";
								}
								
								if(segment.style.italic) {
									itemNode.style.fontStyle = "italic";
								}
								
								if(segment.style.color != null) {
									itemNode.style.color = segment.style.color;
								}
								
								if(segment.style.fontName != null) {
									itemNode.style.fontName = segment.style.fontName;
								}
								
								if(segment.style.backgroundColor != null) {
									itemNode.style.backgroundColor = segment.style.backgroundColor;
								}
							}
							itemNode.appendChild(document.createTextNode(segment.value));
							
							contentNode.appendChild(itemNode);
						} );
						
					}
				}
				
				div.appendChild(contentDiv);
			} else {
				div.className = this.calculateClasses(proposal.style, isSelected);
				node = document.createTextNode(this.getDisplayString(proposal));
				if (isSelected) {
					this.parentNode.setAttribute("aria-activedescendant", div.id);
				}
				div.appendChild(node, div);
			}
			
			parent.appendChild(div);
		},
		/** @private */
		createAccessible: function(mode) {
			if(!this._isAccessible) {
				textUtil.addEventListener(this.parentNode, "keydown", function(evt) { //$NON-NLS-0$
					if (!evt) { evt = window.event; }
					if(evt.keyCode === 27) {return mode.cancel(); }
					else if(evt.keyCode === 38) { return mode.lineUp(); }
					else if(evt.keyCode === 40) { return mode.lineDown(); }
					else if(evt.keyCode === 13) { return mode.enter(); }
					if (evt.preventDefault) {
						evt.preventDefault();
					} else {
						evt.cancelBubble = true;
						evt.returnValue = false;
						evt.keyCode = 0;
					}
					return false;
				});
			}
			this._isAccessible = true;
		},
		/** @private */
		calculateClasses : function(style, isSelected) {
			var cssClass = STYLES[style];
			if (!cssClass) {
				cssClass = STYLES.dfault;
			}
			return isSelected ? cssClass + STYLES.selected : cssClass;
		},
		/** @private */
		getDisplayString: function(proposal) {
			//for simple string content assist, the display string is just the proposal
			if (typeof proposal === "string") { //$NON-NLS-0$
				return proposal;
			}
			//return the description if applicable
			if (proposal.description && typeof proposal.description === "string") { //$NON-NLS-0$
				return proposal.description;
			}
			//by default return the straight proposal text
			return proposal.proposal;
		},
		/**
		 * @private
		 * @returns {Object} The proposal represented by the given node.
		 */
		getProposal: function(/**DOMNode*/ node) {
			var nodeIndex = 0;
			for (var child = this.parentNode.firstChild; child !== null; child = child.nextSibling) {
				if (child === node) {
					return this.proposals[nodeIndex] || null;
				}
				nodeIndex++;
			}
			return null;
		},
		/** @private */
		getTopIndex: function() {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				if (child.offsetTop >= this.parentNode.scrollTop) {
					return i;
				}
			}
			return 0;
		},
		/** @private */
		getBottomIndex: function() {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				if ((child.offsetTop + child.offsetHeight) > (this.parentNode.scrollTop + this.parentNode.clientHeight)) {
					return Math.max(0, i - 1);
				}
			}
			return nodes.length - 1;
		},
		/** @private */
		scrollIndex: function(index, top) {
			this.parentNode.childNodes[index].scrollIntoView(top);
		},
		/** Sets the index of the currently selected proposal. */
		setSelectedIndex: function(/**Number*/ index) {
			this.selectedIndex = index;
			this.selectNode(this.parentNode.childNodes[this.selectedIndex]);
		},
		/** @private */
		selectNode: function(/**DOMNode*/ node) {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				var selIndex = child.className.indexOf(STYLES.selected);
				if (selIndex >= 0) {
					child.className = child.className.substring(0, selIndex) + 
							child.className.substring(selIndex + STYLES.selected.length);
				}
				if (child === node) {
					child.className = child.className + STYLES.selected;
					this.parentNode.setAttribute("aria-activedescendant", child.id); //$NON-NLS-0$
					child.focus();
					if (child.offsetTop < this.parentNode.scrollTop) {
						child.scrollIntoView(true);
					} else if ((child.offsetTop + child.offsetHeight) > (this.parentNode.scrollTop + this.parentNode.clientHeight)) {
						child.scrollIntoView(false);
					}
				}
			}
		},
		setProposals: function(/**Object[]*/ proposals) {
			this.proposals = proposals;
		},
		show: function() {
			if (this.proposals.length === 0) {
				this.hide();
				return;
			}
			this.parentNode.innerHTML = "";
			for (var i = 0; i < this.proposals.length; i++) {
				this.createDiv(this.proposals[i], i===0, this.parentNode, i);
			}
			this.position();
			this.parentNode.onclick = this.onClick.bind(this);
			this.isShowing = true;
		},
		hide: function() {
			if(this.parentNode.ownerDocument.activeElement === this.parentNode) {
				this.textView.focus();
			}
			this.parentNode.style.display = "none"; //$NON-NLS-0$
			this.parentNode.onclick = null;
			this.isShowing = false;
		},
		position: function() {
			var contentAssist = this.contentAssist;
			var offset;
			var view = this.textView;
			if (contentAssist.offset !== undefined) {
				offset = contentAssist.offset;
				var model = view.getModel();
				if (model.getBaseModel) {
					offset = model.mapOffset(offset, true);
				}
			} else {
				offset = this.textView.getCaretOffset();
			}
			var caretLocation = view.getLocationAtOffset(offset);
			caretLocation.y += view.getLineHeight();
			this.textView.convert(caretLocation, "document", "page"); //$NON-NLS-1$ //$NON-NLS-0$
			this.parentNode.style.position = "fixed"; //$NON-NLS-0$
			this.parentNode.style.left = caretLocation.x + "px"; //$NON-NLS-0$
			this.parentNode.style.top = caretLocation.y + "px"; //$NON-NLS-0$
			this.parentNode.style.display = "block"; //$NON-NLS-0$
			this.parentNode.scrollTop = 0;

			// Make sure that the panel is never outside the viewport
			var document = this.parentNode.ownerDocument;
			var viewportWidth = document.documentElement.clientWidth,
			    viewportHeight =  document.documentElement.clientHeight;
			if (caretLocation.y + this.parentNode.offsetHeight > viewportHeight) {
				this.parentNode.style.top = (caretLocation.y - this.parentNode.offsetHeight - this.textView.getLineHeight()) + "px"; //$NON-NLS-0$
			}
			if (caretLocation.x + this.parentNode.offsetWidth > viewportWidth) {
				this.parentNode.style.left = (viewportWidth - this.parentNode.offsetWidth) + "px"; //$NON-NLS-0$
			}
		}
	};
	return {
		ContentAssist: ContentAssist,
		ContentAssistMode: ContentAssistMode,
		ContentAssistWidget: ContentAssistWidget
	};
});
