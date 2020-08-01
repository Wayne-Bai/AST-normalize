function toggle(div_id) {
	var el = document.getElementById(div_id);
	if ( el.style.display == 'none' ) {	el.style.display = 'block';}
	else {el.style.display = 'none'; $(el).removeClass('scale-container');}
}
function blanket_size(popUpDivVar, closeDivVar, popWidthVar, popHeightVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight;
	} else {
		viewportheight = document.documentElement.clientHeight;
	}
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	var blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	blanket_height = $('#containerDiv').height();
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv.style.width = popWidthVar + 'px';
	popUpDiv.style.height = popHeightVar + 'px';
	popUpDiv_height=blanket_height/2-popHeightVar/2;//150 is half popup's height
	popUpDiv.style.top = popUpDiv_height + 'px';
	closeDiv = document.getElementById(closeDivVar);
	closeDiv.style.top = (popUpDiv_height-20) + 'px';
}
function window_pos(popUpDivVar, closeDivVar, popWidthVar, popHeightVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}

	//Quick Fix -- TODO Fix it properly
	window_width = document.body.parentNode.clientWidth;

	var popUpDiv = document.getElementById(popUpDivVar);
	window_width=window_width/2-popWidthVar/2;//150 is half popup's width
	popUpDiv.style.left = window_width + 'px';
	closeDiv = document.getElementById(closeDivVar);
	//alert('>>>>'+popUpDiv.style.width.split('px')[0]);//popUpDiv.style.width.split('px')[0]
	closeDiv.style.left = popWidthVar+window_width-40 + 'px'; // 50 'close' div width
}
function popup(windowname, close, pw, ph) {
	blanket_size(windowname, close, pw, ph);
	window_pos(windowname, close, pw, ph);
	toggle('blanket');
	toggle(windowname);
}
function closePopup(windowname) {
	toggle(windowname);	
}

