Events = {};

Events.enableFocusCall = function() {
	if (location.search !== "?foo") {
		location.search = "?foo";
		throw new Error;
	}
};

Events.selectedInAutoComplete = -1;

Events.upInAutoComplete = function(){
	if (Events.selectedInAutoComplete > 0)
		Events.selectedInAutoComplete--;
	$.map($("#autoComplete li"),function(a,i){
		a = $(a);
		if (i == Events.selectedInAutoComplete)
			$("#autoComplete li").eq(i).css('background-color','#F5F5F5');
		else 
			$("#autoComplete li").eq(i).css('background-color','white');
	});
	return false;
};

Events.downInAutoComplete = function(){
	var qteTerms = $("#autoComplete li").length;
	if (Events.selectedInAutoComplete < qteTerms-1)
		Events.selectedInAutoComplete++;
	
	$.map($("#autoComplete li"),function(a,i){
		a = $(a);
		if (i == Events.selectedInAutoComplete)
			$("#autoComplete li").eq(i).css('background-color','#F5F5F5');
		else 
			$("#autoComplete li").eq(i).css('background-color','white');
	});
	return false;
	
};

Events.submitFormOnEnterAndAutoSearchArrows = function() {
	window.addEventListener("keydown", function(event) {
		switch (event.keyCode){
		case(13): 
			if (Events.selectedInAutoComplete != -1){
				var searchTerm = $('#autoComplete li').eq(Events.selectedInAutoComplete).html();
				$('#searchField').val(searchTerm);
				Events.submitForm();
			}
			return Events.submitForm();
		case(38): return Events.upInAutoComplete();
		case(40): return Events.downInAutoComplete();
		}
	}, false);
};



Events.submitForm = function() {
	var q = document.getElementById('searchField').value;
	$("#autoComplete").hide();
	$("#musics").html("");
	$("#loading").show();

	$.ajax({
		url : 'http://mp3skull.com/search.php?q=' + escape(q),
		complete : function(data) {
			$("#autoComplete").hide();
			$("#loading").hide();
			var page = data.responseText;

			var musics = $.map($("div[class*=show]", page), function(musica) {
				var item = {};
				item.nome = $(musica).find('b').text();
				item.fileUrl = $(musica).find("a").attr("href");

				var moreInfo = $(musica).find('.left').html().replace(/<.*>/,
						'').replace(/<br>/g, '|').trim().split("|");

				$.map(moreInfo, function(valor) {
					if (valor.indexOf("kbps") != -1) {
						item.bitTrate = valor;
					}
					if (valor.indexOf("mb") != -1) {
						item.size = valor;
					}
					if (valor.indexOf(":") != -1) {
						item.length = valor;
					}
				});
				return item;
			});
			renderResults(musics);

			$("#musics li").click(function() {

				chrome.tabs.create({
					'url' : $(this).find('.fileUrl').val()
				}, function(tab) {
					window.close();
				});

			});
		}
	});

	return false;
};

Events.typingInSearchField = function(event) {
	if (event.keyCode > 47 && event.keyCode < 91 || event.keyCode == 8){
		Events.selectedInAutoComplete = -1;
		$.ajax({
			//url : "http://clients1.google.com/complete/search?client=youtube-reduced&q="+$('#searchField').val()+"&gs_nf=1&ds=yt&cp=5&gs_id=12&callback=Events.autoCompleteResults",
			url: "http://ac1.mp3skull.com/autocomplete/get.php?q="+
				$('#searchField').val().replace("%20",""),

			complete : function(x){
				x = x.responseText.match(/new Array.*?\)/)
				x = "Events.autoCompleteResults(" + x + ")";
				eval(x);
			}
		});
	}
	return false;
};

Events.autoCompleteResults = function(results){
	var values = $.map(results,function(item){
		return "<li>" + item + "</li>";
	}).join('');
	
	$("#autoComplete ").html(values);
	$("#autoComplete").show();
	$("#autoComplete li").click(Events.selectItemInAutoComplete);
};

Events.selectItemInAutoComplete = function(item){
	var searchTerm = item.toElement.innerHTML;
	$('#searchField').val(searchTerm);
	Events.submitForm();
};

UI = {};

UI.stylishForms = function(){
    $(function(){
        $("input, textarea, select, button").uniform();
    });
};

function renderResults(musics){

	var htmlPure =  $.map(musics,function(music,index){
		var shared4 = "";

		music.nome = music.nome.replace("mp3","").replace(/([A-z]+\.)+[A-z]+/,"").replace(/\s*-\s*$/,"").replace(/\(.*\)/,"");
		
		if (music.fileUrl.indexOf("4shared") != -1)
			shared4 = ' class="shared4"';

		return "<li class=\"item"+index%2+"\"><div"+shared4+"><b>"+ music.nome + "</b><br>" 
			+ (music.size != null ?  ("<span><b>Filesize: </b>"+music.size+"</span>") : '')
			+ (music.bitTrate != null ?  ("<span><b>Bitrate: </b>"+music.bitTrate+"</span>") : '')
			+ (music.length != null ?  ("<span><b>Length: </b>"+music.length+"</span>") : '')
			+ '<input type="hidden" class="fileUrl" value="'+music.fileUrl+'">'
			+ "</div></li>";

	}).join('');

	var notFound = "<b class=\"notFound\">Sorry, no results found for "+document.getElementById('searchField').value+"</b>"
	
	$("#musics").html(htmlPure == '' ? notFound : htmlPure);
};

