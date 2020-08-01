var pinterestShare = require('pinterestShare');

var win = Titanium.UI.createWindow({
	title: 'Share to Pinterest Example',
	backgroundColor: '#fff'
});

var shareButton = Ti.UI.createButton({
	title: "Share to Pinterest!"
});

shareButton.addEventListener('click', function() {

	pinterestShare({
		image: "http://www.azac.pl/logo.jpg",
		link: "http://www.azac.pl",
		description: "Appcelerator Titanium FTW! https://github.com/azac/titanium-pinterest-share"
	});

});

win.add(shareButton);

win.open();
