// //Check if HTML5 is on
sendRequest('http://www.youtube.com/html5', function (token) {
    		var params;
		var xhr2 = new XMLHttpRequest();
	 	params = 'enable_html5=true&session_token='+token;
	   
	    xhr2.open("POST", 'http://www.youtube.com/html5', true);
	    xhr2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr2.send(params);
		xhr2.onreadystatechange = function(){
	    if (xhr2.readyState == 4) {
	        }
	    }    
}); 


var rollback=0;
var html5String;

var flash = chrome.runtime.getURL('../images/htmlify.png');
var html5 = chrome.runtime.getURL('../images/htmlhov.png');

if($('.html5-video-player').length >0 ){
	$("#watch-like-dislike-buttons").append(	
		$('<img></img>').attr(
			{'class':'yt-uix-button yt-uix-button-icon yt-uix-button-empty','type': 'image','id':'buttonHTML5','src': html5}
		).val("HTML5 me baby").click(
			function(){
				defaultHTML5();
			}
		).css(
			{
				'border-style' :  'none',
				'padding-bottom' : '5px'
			}
		)
	);
	
	setHover(html5, html5);
	
	return;
}

$("#watch-like-dislike-buttons").append(
	$('<img></img>').attr(
		{'class':'yt-uix-button yt-uix-button-icon yt-uix-button-empty','type': 'image','id':'buttonHTML5','src': flash}
	).val("HTML5 me baby").click(
		function(){
            HTML5();
		}
	).css(
		{
			'border-style' :  'none',
			'padding-bottom' : '5px'
		}
	)
);

setHover(flash, html5);

function HTML5(){
	if(rollback){
		
		$('#html5_movie').remove();
		
		var url = "http://www.youtube.com/embed/"+getId()+"?autoplay=1";

		document.getElementById('player-api').innerHTML = html5String;
		
		setHover(flash, html5);
		
		rollback=0;
		
	}else{
		
		html5String=$("#player-api").html();
		$('#movie_player').remove();
		
		var url = "http://www.youtube.com/embed/"+getId()+"?feature=player_detailpage&html5=1&autoplay=1&cc_load_policy=1";

		createPlayer('iframe','html5_movie',url);
		
		setHover(html5, flash);
		
		rollback=1;
		
	}
}
function getId(){
	var tablink = $(location).attr('href');
	var strs = tablink.split("v=");
	return strs[1].split("&")[0];
}
	
function createPlayer(tag,id, url){
	var player = document.createElement(tag);
	player.setAttribute('style','width:100%; height:100%;');
	player.setAttribute('src', url);
	player.setAttribute('id', id);
	player.setAttribute('frameborder','0');
	player.setAttribute('allowfullscreen','');

	document.getElementById('player-api').appendChild(player);
}

function setHover(initial, hover){
	$("#buttonHTML5").hover(
		function(){
			$("#buttonHTML5").css("content","url("+ hover +")");
			$("#buttonHTML5").css("border-bottom","3px solid #930");
			$("#buttonHTML5").css("border-radius","0px");
			
			
		},function(){
			$("#buttonHTML5").css("content","url("+ initial + ")");
			$("#buttonHTML5").css("border-bottom-color","#FFF");
		}
	);
}

function sendRequest(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'http://www.youtube.com/html5', true);
	xhr.send();
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	    // WARNING! Might be evaluating an evil script!
		if(xhr.responseText.indexOf("disable_html5") == -1){
			
			token = xhr.responseText.split("XSRF_TOKEN': '")[1].split("'")[0];

			callback(token);

		}
	  }
	}
}
function defaultHTML5(){
	alert("This page is already being streamed in HTML5!");
}
