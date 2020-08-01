langResources['Favotter / new'] =	['ふぁぼったー / 新着','Favotter / 最新'];
langResources['Favotter / tweet'] =	['ふぁぼったー / ツイート','Favotter / 发言'];
langResources['Favotter / fav'] =	['ふぁぼったー / ふぁぼり','Favotter / 已收藏'];

var twFavPlugin = {
	fav_update: null,
	favs: [],
	init: function() { /* this.updateFavs(); */ }, // no info update now...
	updateFavs: function() {
		twFavPlugin.fav_update = loadXDomainScript('http://twicli.neocat.jp/nr_favs.js?seq='+(seq++), twFavPlugin.fav_update);
		setTimeout(twFavPlugin.updateFavs, 15*60*1000);
	},
	newMessageElement: function(ele, tw, pid) {
		var fele = document.createElement("a");
		var id = tw.id_str || (""+tw.id);
		fele.id = "nrFav-" + pid + '-' + id;
		fele.className = "nrFav";
		fele.href = "http://favotter.net/status.php?id=" + id;
		fele.target = "favotter";
		if (this.favs[id]) {
			fele.innerHTML = '[fav:' + this.favs[id] + ']';
		}
		ele.insertBefore(fele, ele.childNodes[4]);
	},
	popup: function(ele, user, id) {
		$('favotter_link_user').href = 'http://favotter.net/user.php?user=' + user;
		$('favotter_link_status').href = 'http://favotter.net/status.php?id=' + id;
		$('favotter_link_fav').href = 'http://favotter.net/user.php?mode=fav&user=' + user;
	}
};
registerPlugin(twFavPlugin);

function favEntries(favs) {
	twFavPlugin.favs = favs;
	for (var x in favs) {
		for (var i = 0; i < 3; i++) {
			var target = $('nrFav-'+['tw-','re-','tw2c-'][i]+x);
			if (target)
				target.innerHTML = '[fav:' + favs[x] + ']';
		}
	}
}

// Popup menu

var a = document.createElement("hr");
$('popup').appendChild(a)

a = document.createElement("a");
a.target = 'favotter';
a.id = 'favotter_link_user';
a.innerHTML = _('Favotter / new');
$('popup').appendChild(a)

a = document.createElement("a");
a.target = 'favotter';
a.id = 'favotter_link_status';
a.innerHTML = _('Favotter / tweet');
$('popup').appendChild(a)

a = document.createElement("a");
a.target = 'favotter';
a.id = 'favotter_link_fav';
a.innerHTML = _('Favotter / fav');
$('popup').appendChild(a)

