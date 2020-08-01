/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP AG or an SAP affiliate company. 
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides class sap.ui.commons.MessageBox
jQuery.sap.declare("sap.ui.commons.MessageBox");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("sap.ui.commons.Dialog");
jQuery.sap.require("sap.ui.commons.Image");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
jQuery.sap.require("sap.ui.commons.TextView");

/**
 * @class Provides methods to create standard alerts, confirmation dialogs, or arbitrary message boxes.
 *
 * As <code>MessageBox</code> is a static class, a <code>jQuery.sap.require("sap.ui.commons.MessageBox");</code> statement
 * must be explicitly executed before the class can be used. Example:
 * <pre>
 *   jQuery.sap.require("sap.ui.commons.MessageBox");
 *   sap.ui.commons.MessageBox.show(
 *       "This message should appear in the message box.",
 *       sap.ui.commons.MessageBox.Icon.INFORMATION,
 *       "My message box title",
 *       [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
 *       function() { / * do something * / }
 *	 );
 * </pre>
 *
 * @static
 * @author Frank Weigel
 * @public
 * @since 0.8.8
 */
sap.ui.commons.MessageBox = {};

/**
 * @class Enumeration of supported actions in a MessageBox.
 *
 * Each action is represented as a button in the message box. The values of this enumeration are used for both,
 * specifying the set of allowed actions as well as reporting back the user choice.
 * @static
 * @public
 */
sap.ui.commons.MessageBox.Action = {

  /**
   * Adds an "Ok" button to the message box.
   * @public
   */
  OK : "OK",

  /**
   * Adds a "Cancel" button to the message box.
   * @public
   */
  CANCEL : "CANCEL",

  /**
   * Adds a "Yes" button to the message box.
   * @public
   */
  YES : "YES",

  /**
   * Adds a "No" button to the message box.
   * @public
   */
  NO : "NO",

  /**
   * Adds an "Abort" button to the message box.
   * @public
   */
  ABORT : "ABORT",

  /**
   * Adds a "Retry" button to the message box.
   * @public
   */
  RETRY : "RETRY",

  /**
   * Adds an "Ignore" button to the message box.
   * @public
   */
  IGNORE : "IGNORE",

  /**
   * Adds a "Close" button to the message box.
   * @public
   */
  CLOSE : "CLOSE"
};

/**
 * @class Enumeration of the pre-defined icons that can be used in a MessageBox.
 * @static
 * @public
 */
sap.ui.commons.MessageBox.Icon = {

  /**
   * Shows no icon in the message box.
   * @public
   */
  NONE : "NONE",

  /**
   * Shows the information icon in the message box.
   * @public
   */
  INFORMATION : "INFORMATION",

  /**
   * Shows the warning icon in the message box.
   * @public
   */
  WARNING : "WARNING",

  /**
   * Shows the error icon in the message box.
   * @public
   */
  ERROR : "ERROR",

  /**
   * Shows the critical error icon in the message box.
   * @public
   * @deprecated since 1.9.1: The error icon is used instead
   */
  CRITICAL : "CRITICAL",

  /**
   * Shows the success icon in the message box.
   * @public
   */
  SUCCESS : "SUCCESS",

  /**
   * Shows the question icon in the message box.
   * @public
   */
  QUESTION : "QUESTION"
};

(function() {

	var c = sap.ui.commons,
		Action = c.MessageBox.Action,
		Icon = c.MessageBox.Icon,
		mIconClass = {
			// Note: keys must be equal to values(!) of the Icon enumeration above
			INFORMATION : "sapUiMboxInfo",
			CRITICAL : "sapUiMboxCritical",
			ERROR : "sapUiMboxError",
			WARNING : "sapUiMboxWarning",
			SUCCESS : "sapUiMboxSuccess",
			QUESTION : "sapUiMboxQuestion"
		};

	/**
	 * Creates and displays a simple message box with the given text and buttons, and optionally other parts.
	 * After the user has selected a button or closed the message box using the close icon, the <code>callback</code>
	 * function is invoked when given.
	 *
	 * The only mandatory parameter is <code>sMessage</code>.
	 *
	 * The created dialog box is executed asynchronously. When it has been created and registered for rendering,
	 * this function returns without waiting for a user reaction.
	 *
	 * When applications have to react on the users choice, they have to provide a callback function and
	 * postpone any reaction on the user choice until that callback is triggered.
	 *
	 * The signature of the callback is
	 *
	 *   function (oAction);
	 *
	 * where <code>oAction</code> is the button that the user has pressed. When the user has pressed the close button,
	 * a MessageBox.Action.Close is returned.
	 *
	 * @param {string} sMessage The message to be displayed.
	 * @param {sap.ui.commons.MessageBox.Icon} [oIcon=None] The icon to be displayed.
	 * @param {string} [sTitle=''] The title of the message box.
	 * @param {sap.ui.commons.MessageBox.Action|sap.ui.commons.MessageBox.Action[]} [vActions] Either a single action, or an array of actions.
	 *      If no action(s) are given, the single action MessageBox.Action.OK is taken as a default for the parameter.
	 * @param {function} [fnCallback] Function to be called when the user has pressed a button or has closed the message box.
	 * @param {sap.ui.commons.MessageBox.Action} [oDefaultAction] Must be one of the actions provided in vActions.
	 * @param {string} [sDialogId] ID to be used for the dialog. Intended for test scenarios, not recommended for productive apps
	 * @public
	 */
	sap.ui.commons.MessageBox.show = function(sMessage, oIcon, sTitle, vActions, fnCallback, oDefaultAction, sDialogId) {

		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons"),
			oDialog, oResult, oContent, oMsg, oDefaultButton;

		// normalize the vActions array
		if ( typeof vActions !== "undefined" && !jQuery.isArray(vActions) ) {
			vActions = [vActions];
		}
		if ( !vActions || vActions.length === 0 ) {
			vActions = [Action.OK];
		}

		// create a unique ID
		sDialogId = sDialogId || sap.ui.core.ElementMetadata.uid("mbox");

		/** creates a button for the given action */
		function button(sAction) {
			var sText = rb && rb.getText("MSGBOX_" + sAction),
				oButton = new c.Button({
					id : sDialogId + "--btn-" + sAction,
					text : sText || sAction,
					press : function () {
						oResult = sAction;
						oDialog.close();
					}
				});
			if ( sAction === oDefaultAction ) {
				oDefaultButton = oButton;
			}
			return oButton;
		}

		/** wraps the given control in a top aligned MatrixLayoutCell with no padding */
		function cell(oContent) {
			return new c.layout.MatrixLayoutCell({
				padding: c.layout.Padding.None,
				vAlign: c.layout.VAlign.Top,
				content: oContent
			});
		}

		/** creates an Image for the given icon type */
		function image(oIcon) {
			var oImage = new c.Image({
					id : sDialogId + "--icon",
					tooltip : rb && rb.getText("MSGBOX_ICON_" + oIcon),
					decorative : true});
			oImage.addStyleClass("sapUiMboxIcon");
			oImage.addStyleClass(mIconClass[oIcon]);
			return oImage;
		}

		function onclose() {
			if ( typeof fnCallback === "function" ) {
				fnCallback(oResult || Action.CLOSE);
			}

			// first detach close handler (to avoid recursion and multiple reports)
			oDialog.detachClosed(onclose);

			// then destroy dialog (would call onclose again)
			oDialog.destroy();
		}

		oContent = new c.layout.MatrixLayout({id : sDialogId + "--lyt", layoutFixed:false}).addStyleClass("sapUiMboxCont");
		oMsg = new c.TextView({id : sDialogId + "--msg", text:sMessage}).addStyleClass("sapUiMboxText");
		if ( oIcon !== Icon.NONE ) {
			oContent.createRow(cell(image(oIcon)), cell(oMsg));
		} else {
			oContent.createRow(cell(oMsg));
		}
		// oContent.addStyleClass("sapUiDbgMeasure");

		oDialog = new c.Dialog({
			id : sDialogId,
			applyContentPadding : false,
			title : sTitle,
			accessibleRole : sap.ui.core.AccessibleRole.AlertDialog,
			resizable : false,
			modal: true,
			buttons : jQuery.map(vActions, button), // determines oDefaultButton as a side effect!
			content : oContent,
			defaultButton : oDefaultButton,
			closed : onclose
		});

		oDialog.open();

	};

	/**
	 * Displays an alert box with the given message and an OK button (no icons).
	 * If a callback is given, it is called after the alert box has been closed
	 * by the user via the OK button or via the Close icon. The callback is called
	 * with the following signature:
	 *
	 * <pre>
	 *   function ()
	 * </pre>
	 *
	 * The alert box opened by this method is modal and it is processed asynchronously.
	 * Applications have to use the <code>fnCallback</code> to continue work after the
	 * user closed the alert box.
	 *
	 * @param {string} sMessage Message to be displayed in the alert box
	 * @param {function} [fnCallback] callback function to be called when the user closed the dialog
	 * @param {string } [sTitle] Title to be displayed in the alert box
	 * @param {string} [sDialogId] ID to be used for the alert box. Intended for test scenarios, not recommended for productive apps
	 * @public
	 */
	sap.ui.commons.MessageBox.alert = function(sMessage, fnCallback, sTitle, sDialogId) {
		return c.MessageBox.show(sMessage, Icon.NONE, sTitle, Action.OK,
				function(oAction) {
					if ( typeof fnCallback === "function" ) {
						fnCallback();
					}
				}, Action.OK, sDialogId || sap.ui.core.ElementMetadata.uid("alert"));
	};

	/**
	 * Displays a confirmation dialog box with the given message, a question icon,
	 * an OK button, and a Cancel button. If a callback is given, it is called after the
	 * alert box has been closed by the user via one of the buttons or via the close icon.
	 * The callback is called with the following signature
	 *
	 * <pre>
	 *   function(bConfirmed)
	 * </pre>
	 *
	 * where bConfirmed is set to true when the user has activated the OK button.
	 *
	 * The confirmation dialog box opened by this method is modal and it is processed asynchronously.
	 * Applications have to use the <code>fnCallback</code> to continue work after the
	 * user closed the alert box.
	 *
	 * @param {string} sMessage Message to display
	 * @param {function} [fnCallback] Callback to be called
	 * @param {string} [sTitle] Title to display
	 * @param {string} [sDialogId] ID to be used for the confirmation dialog. Intended for test scenarios, not recommended for productive apps
	 * @public
	 */
	sap.ui.commons.MessageBox.confirm = function(sMessage, fnCallback, sTitle, sDialogId) {
		return c.MessageBox.show(sMessage, Icon.QUESTION, sTitle, [Action.OK, Action.CANCEL],
				function(oAction) {
					if ( typeof fnCallback === "function" ) {
						fnCallback(oAction === Action.OK);
					}
				},  /* no default */ undefined, sDialogId || sap.ui.core.ElementMetadata.uid("confirm"));
	};

}());
