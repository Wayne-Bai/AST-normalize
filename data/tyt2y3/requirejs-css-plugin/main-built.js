
/**	`css` is a requirejs plugin
	that loads a css file and inject it into a page.
	note that this loader will return immediately,
	regardless of whether the browser had finished parsing the stylesheet.
	this css loader is implemented for file optimization and depedency managment
 */

define('css',{
	load: function (name, require, load, config) {
		function inject(filename)
		{
			var head = document.getElementsByTagName('head')[0];
			var link = document.createElement('link');
			link.href = filename;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			head.appendChild(link);
		}
		inject(config.baseUrl+name);
		load(true);
	},
	pluginBuilder: './css-build'
});

define('css-embed', function()
{
	function embed_css(content)
	{
		var head = document.getElementsByTagName('head')[0],
		style = document.createElement('style'),
		rules = document.createTextNode(content);
		style.type = 'text/css';
		if(style.styleSheet)
			style.styleSheet.cssText = rules.nodeValue;
		else style.appendChild(rules);
			head.appendChild(style);
	}
	return embed_css;
});

define('css!style.css', ['css-embed'], 
function(embed)
{
	embed(
	'.bi {  font-weight: bold;  font-style: italic; } '
	);
	return true;
});

define('css!more.css', ['css-embed'], 
function(embed)
{
	embed(
	'#tag {  border: 1px solid black; } '
	);
	return true;
});

define('a',{
	call: function(X)
	{
		document.getElementById('tag').innerHTML=X;
	}
});

define('b',['a'],function(a){
	return {
		call: function(X)
		{
			a.call(X);
		}
	}
});

define('c',['b'],function(b){
	return {
		say: function(X)
		{
			b.call(X);
		}
	}
});

requirejs(['css!style.css','css!more.css','c'],function(css1,css2,c){
	c.say('Hello this is a test for using requirejs to load css files.');
	console.log(css1+','+css2);
});

define("main", function(){});
