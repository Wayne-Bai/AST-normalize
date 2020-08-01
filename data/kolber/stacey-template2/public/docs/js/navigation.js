var nav_items = document.getElementById('navigation').getElementsByTagName('a');
var stripped_url = document.location.href.match(/([^\/]+)\/(#.+)?$/)[1];
for(var i = 0; i < nav_items.length; i++) {
  var slug = nav_items[i].href.match(/([^\/]+)\/$/);
	var stripped_href = (slug) ? slug[1] : '';
	if(stripped_url == stripped_href) {
		nav_items[i].parentNode.className = 'selected';
		nav_items[i].parentNode.insertBefore(document.createTextNode("\u203a "), nav_items[i]);
		break;
	}
}