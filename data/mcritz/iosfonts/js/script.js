var previousSelectedOS ='';
var selectedOS = '';
var previewActive = false;
var searchActive = false;

// Extend :contains() method to :containsi, a case-insensitive version of :contains()
$.extend($.expr[':'], {
	'containsi': function(elem, i, match, array)
	{
		return (elem.textContent || elem.innerText || '').toLowerCase()
		.indexOf((match[3] || "").toLowerCase()) >= 0;
	}
});


$(document).ready(function(){
setup();

// Live text preview
$('nav').on('keyup', '#live_preview', function(){
		previewActive = true;
		if($(this).val() == ''){
				$('.font_face').each(function(){
						$(this).text($(this).attr('style').split(':')[1]);
				});
				previewActive = false;
		}else {
				$('.font_face').text($(this).val());
		}           
});

var updateList = function($el) {
	var selectedVersion = $el.val();

	if (selectedVersion == previousSelectedOS) {
		return;
	}

	$('tr').removeClass('unavailable');

	var allCells = $('td');

	/*
	switch(selectedVersion) {
		case '30':
			$('tbody .ios40' || 'tbody .ios50' || 'tbody .ios60' || 'tbody .ios70' || 'tbody .ios80').addClass('unavailable');
			break;
		case '43':
			$('td:contains(5.0), td:contains(6.0), td:contains(7.0), td:contains(8.0)').closest('tr').addClass('unavailable');
			break;
		case '50':
			$('td:contains(6.0), td:contains(7.0), td:contains(8.0)').closest('tr').addClass('unavailable');
			break;
		case '60':
			$('td:contains(7.0), td:contains(8.0)').closest('tr').addClass('unavailable');
			break;
		case '70':
			$('td:contains(8.0)').closest('tr').addClass('unavailable');
			$('td.dead-70').closest('tr').addClass('unavailable');
			break;
		case '80':
			// future handling
			break;
		default:
			// none
	}
	*/
	previousSelectedOS = selectedVersion;
	countFonts();

}

$('nav select').change(function(evt){
		updateList($(this));
});

// search
$('input[type="search"]').keyup(function(){
		if(previewActive == true) {
				$('#live_preview').val('');
				$('.font_face').each(function(){
						$(this).text($(this).attr('style').split(':')[1]);
				});
		}
		theSearch = $('input[type="search"]').val();
		searchPage(theSearch);
		searchActive = true;
		countFonts();
});
function searchPage(searchTerm){
	if(searchTerm.length == 0){
		clearSearch();
	 //  $('.btn_clear_search').fadeOut(200);
	} else if(searchTerm.length > 0){
		$('tr:containsi("' + searchTerm + '")').fadeIn(150);
		$('tr:not(:containsi("' + searchTerm + '"))').fadeOut(250);
	} else {
		clearSearch();
	}
}

// clear search
$('input[type="search"]').on("search", function(e){
		clearSearch();
});
function clearSearch() {
	$('input[type="search"]').val('');
	$('tr').fadeIn(250);
	searchActive = false;
	countFonts();
}

}); // end drf

function setup(){
		$('header#main').append('<div class="count"><div class="font_faces">Faces: <b>317</b></div></div>');
		$('nav select').val('iOS 8').trigger('change');
}

function countFonts() {
		var numberOfFontFaces = $('tr').not('.unavailable').has('td').not('.rowheader').filter(':visible').length;
		$('.count .font_faces b').html(numberOfFontFaces);
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-5874947-7']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();