/*
	UI component: Window to list past messages (brags)
*/


var BragWindow = function() {
	var lWin = Ti.UI.createWindow({
		/* full-screen view provides modal veil	*/
		backgroundColor: 'transparent',
		backgroundImage: 'images/grain.png',
		title: L('messages')
	});
	if(Ti.Platform.osname=='iphone') {
		var c = Ti.UI.createButton({
				title:L('close'),
				style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
			});
			c.addEventListener('click',function() {
				lWin.close();
			});
			lWin.setLeftNavButton(c);
	}
	
	var table = Ti.UI.createTableView({
		backgroundColor: 'transparent'
	});
	
	function populateTable(rows) {
		for(var i=0, j=rows.length; i<j; i++) {
			table.appendRow(Ti.UI.createTableViewRow({
				title: rows[i].message,
				color: '#fff',
				height:Ti.UI.SIZE
			}));
		}
	}
	var acs = require('lib/acs');
	if(acs.isLoggedIn()) {
		acs.getBragList(populateTable)
	} else {
		var rows = [{title: 'No past messages'}];
		populateTable(rows);
	}

	lWin.add(table);
	// and return the whole mess
	return lWin;
};
module.exports = BragWindow;