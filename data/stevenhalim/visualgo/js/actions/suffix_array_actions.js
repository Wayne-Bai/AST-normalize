var actionsWidth = 180;
var statusCodetraceWidth = 370;

var isBuildOpen = false;
var isSearchOpen = false;
var isLCPOpen = false;
var isLRSOpen = false;
var isLCSOpen = false;

function openBuild() {
	if(!isBuildOpen){
		$('.build').fadeIn('fast');
		isBuildOpen = true;
	}
}
function closeBuild() {
	if(isBuildOpen){
		$('.build').fadeOut('fast');
		$('#build-err').html("");	
		isBuildOpen = false;
	}
}
function openSearch() {
	if(!isSearchOpen){
		$('.search').fadeIn('fast');
		isSearchOpen = true;
	}
}
function closeSearch() {
	if(isSearchOpen){
		$('.search').fadeOut('fast');
		$('#search-err').html("");
		isSearchOpen = false;
	}
}
function openLCP() {
	if(!isLCPOpen){
		$('.lcp').fadeIn('fast');
		isLCPOpen = true;
	}

}
function closeLCP() {
	if(isLCPOpen){
		$('.lcp').fadeOut('fast');
		$('#lcp-err').html("");	
		isLCPOpen = false;
	}
}
function openLRS() {
	if(!isLRSOpen){
		$('.lrs').fadeIn('fast');
		isLRSOpen = true;
	}

}
function closeLRS() {
	if(isLRSOpen){
		$('.lrs').fadeOut('fast');
		$('#lrs-err').html("");	
		isLRSOpen = false;
	}
}
function openLCS() {
	if(!isLCSOpen){
		$('.lcs').fadeIn('fast');
		isLCSOpen = true;
	}

}
function closeLCS() {
	if(isLCSOpen){
		$('.lcs').fadeOut('fast');
		$('#lcs-err').html("");	
		isLCSOpen = false;
	}
}

//
function hideEntireActionsPanel() {
	closeBuild();
	closeSearch();
	closeLCP();
	closeLRS();
	closeLCS();
	hideActionsPanel();
}

$( document ).ready(function() {
	
	//the actions with pullout inputs
	$('#build').click(function() {
		closeSearch();
		closeLCP();
		closeLRS();
		closeLCS();
		openBuild();
	});	

	$('#search').click(function() {
		closeBuild();
		closeLCP();
		closeLRS();
		closeLCS();
		openSearch();
	});

	$("#LCP").click(function() {
		closeBuild();
		closeSearch();
		closeLRS();
		closeLCS();
		closeLCP();
	});

	$("#LCS").click(function() {
		closeBuild();
		closeSearch();
		closeLCP();
		closeLRS();
		openLCS();
	});

	$("#LRS").click(function() {
		closeBuild();
		closeSearch();
		closeLCP();
		closeLCS();
		openLRS();
	});
	
	//tutorial mode
	$('#suffixarray-tutorial-1 .tutorial-next').click(function() {
		showActionsPanel();
	});
	$('#suffixarray-tutorial-2 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#suffixarray-tutorial-3 .tutorial-next').click(function() {
		showStatusPanel();
	});
	$('#suffixarray-tutorial-4 .tutorial-next').click(function() {
		hideStatusPanel();
		showCodetracePanel();
	});
	$('#suffixarray-tutorial-5 .tutorial-next').click(function() {
		hideCodetracePanel();
	});

})