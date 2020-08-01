var AboutWindow = function() {
	// create the About window
	var aboutWindow = Titanium.UI.createWindow({  
	    title:L('about'),
	    barColor:'#18223c'
	});
	// create the webview, reading in the about.html file
	// we could have used the html property instead, and provided inline HTML content
	var aboutWebView = Titanium.UI.createWebView({  
		url: '/about.html'
	});
	aboutWindow.add(aboutWebView);
	return aboutWindow;
}; // end createAboutWindow();

module.exports = AboutWindow;