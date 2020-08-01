/*jshint laxbreak: true,eqnull: true,browser: true,jquery: true,devel: true,regexdash: true,multistr: true, white: false */
/*global define: true, require: true, module: true, Ti: true, L: true, Titanium: true, Class: true */

var utils = require('/presto/helpers/utils');
var jQ = require('/presto/libs/deferred/jquery-deferred');

/**
* @class presto.helpers.Dialogs
* Helper class for dialogs
*/
var Dialogs = {
		
	/**
	* @method showError
	* Display error message
	* @param {Object} error
	* @deferred
	*/
	showError: function(error) {

		var deferred = jQ.Deferred();

		var dialog = Ti.UI.createAlertDialog({
			buttonNames: [L('Ok')],
			message: error.message,
			title: error.reference != null && error.reference !== '' ? error.reference : null
			});
			
		dialog.addEventListener('click',function(e) {
			if (e.index === 0) {
				deferred.resolve();	
			} else {
				deferred.reject();
			}
		});
		
		dialog.show();
			
		return deferred.promise();
	},
	
	
	/**
	* @method confirm
	* Confirm dialog
	* @param {String} message
	* @deferred
	*/
	confirm: function(message) {

		var deferred = jQ.Deferred();

		var dialog = Ti.UI.createAlertDialog({
			buttonNames: [L('Ok'),L('Cancel')],
			message: message
			});
			
		dialog.addEventListener('click',function(e) {
			if (e.index === 0) {
				deferred.resolve();	
			} else {
				deferred.reject();
			}
		});
		
		dialog.show();
			
		return deferred.promise();
	},

	/**
	* @method ask
	* Ask something with multiple button choice, return the index of the button
	* @param {String} message
	* @param {Array} buttons Array of string with the buttons
	* @deferred
	*/
	ask: function(message,buttons) {

		var deferred = jQ.Deferred();

		var dialog = Ti.UI.createAlertDialog({
			buttonNames: buttons,
			message: message
			});
			
		dialog.addEventListener('click',function(e) {
			deferred.resolve(e.index);	
		});
		
		dialog.show();
			
		return deferred.promise();
	},

	
	/**
	* @method email
	* Open email dialog
	* @param {Object} options
	* @param {String} options.subject Subject of the email
	* @param {String} options.to The recipient
	* @param {String} options.body The message
	* @param {Ti.UI.File} options.attachment An attachment to send
	* @deferred
	*/
	email: function(params) {
	
		var deferred = jQ.Deferred();

		var emailDialog = Ti.UI.createEmailDialog();
		emailDialog.setSubject(params.subject);
		emailDialog.setToRecipients(params.to != null ? params.to.split(',') : null);
		emailDialog.setMessageBody(params.body);
		emailDialog.setBarColor('#000000');
		emailDialog.html = true;
		// add attachment if any
		if (utils.isFileType(params.attachment)) {
			emailDialog.addAttachment(params.attachment.getBlob());
		} 

		emailDialog.addEventListener('complete',function(evt) {
			
			if (evt.success) {
				deferred.resolve();
			} else {
				deferred.reject();
			}
		});

		return deferred.promise();	
	}
	
	

};

module.exports = Dialogs;