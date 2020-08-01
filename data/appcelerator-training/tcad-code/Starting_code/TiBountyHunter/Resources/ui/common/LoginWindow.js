/*
	UI component: Login / Create user dialog
*/


var LoginWindow = function() {
	var acs = require('lib/acs');
	var action = 'login'; // switcher for action of login/create button
	
	var lWin = Ti.UI.createWindow({
		backgroundColor: '#333'
	});

	var lwDialog = Ti.UI.createView({
		/* the dialog itself */
		top: 20,
		width: '300dp',
		height: '300dp',
		borderWidth: 2,
		borderRadius: 6,
		borderColor: '#ddd',
		backgroundColor: '#999',
		layout:'vertical'
	});
	// now rig up its contents
	var title = Ti.UI.createLabel({
		text:L('login'),
		top:5,
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		font: {
			fontWeight: 'bold',
			fontSize: '24'
		},
		textAlign: 'center',
		color: '#ddd'
	});
	lwDialog.add(title);
	var username = Ti.UI.createTextField({
		hintText:L('username'),
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:5,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: '#333',
		backgroundColor: '#ddd',
		borderRadius: 3,
		paddingLeft: 2, paddingRight: 2
	});
	lwDialog.add(username);
	var password = Ti.UI.createTextField({
		hintText:L('password'),
		passwordMask: true,
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:5,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: '#333',
		backgroundColor: '#ddd',
		borderRadius: 3,
		paddingLeft: 2, paddingRight: 2
	});
	lwDialog.add(password);
	var confirm = Ti.UI.createTextField({
		hintText:L('confirm'),
		passwordMask: true,
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:5,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: '#333',
		backgroundColor: '#ddd',
		borderRadius: 3,
		paddingLeft: 2, paddingRight: 2,
		visible: false
	});
	lwDialog.add(confirm);

	var loginButton = Ti.UI.createButton({
		title:L('login'),
		top: 15,
		width: 200,
		height: Ti.UI.SIZE
	});

	function cb() {
		if(acs.isLoggedIn()===true) {
			lWin.close();
		} else {
			alert('Oopsie, something went wrong.');
			loginButton.title = L('login');
			loginButton.enabled = true;
		}
	}
	loginButton.addEventListener('click', function() {
		if(action=='login') {
			loginButton.title = L('pleasewait');
			loginButton.enabled = false;
			acs.login(username.value, password.value, cb);
		} else {
			loginButton.title = L('pleasewait');
			loginButton.enabled = false;
			acs.createUser(username.value, password.value, cb);
		}
	});
	lwDialog.add(loginButton);
	
	var switchAction = Ti.UI.createLabel({
		text:L('createuser'),
		top: 15, 
		width: Ti.UI.SIZE,
		height: Ti.UI.SIZE,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: 'blue',
		touchEnabled: true
	});
	switchAction.addEventListener('click', function(){
		if(action=='login') {
			title.text = L('createuser');
			switchAction.text = L('login');
			loginButton.title = L('createuser');
			lWin.title = L('createuser');
			confirm.visible = true;
			action = 'createuser';
		} else {
			title.text = L('login');
			switchAction.text = L('createuser');
			loginButton.title = L('login');
			lWin.title = L('login');
			confirm.visible = false;
			action = 'login'
		}
	});
	lwDialog.add(switchAction);
	
	// finally, add the dialog view to the veil view

	lWin.addEventListener('click', function() {
		for(var i=0, j=lwDialog.children.length; i<j; i++) {
			try {
				lwDialog.children[i].blur();
			} catch(err) { }
		}
	});

	// and return the whole mess
	lWin.add(lwDialog);
	return lWin;
};

module.exports = LoginWindow;