addingFeedback = false;

$(document).ready(function() {
	$('body').append($('<span class="adding-feedback">PLEASE CLICK ON AN ELEMENT TO ADD A NOTE</span><span class="feedback-controls"><span class="open-close">|||</span><span class="feedback-buttons"><button id="add-feedback">ADD NOTE</button><button id="toggle-notes">HIDE NOTES</button></span></span>'));

	$('#add-feedback').click(function() {
		addingFeedback = true;
		$('.adding-feedback').addClass('visible');
		$('body').append($('<style>body { cursor: -webkit-image-set(url(add.png) 1x, url(add.png) 2x),auto; }</style>'))
		document.addEventListener('click', addFeedback, false);
	});

	$('.open-close').click(function() {
		if(!$('.feedback-controls').hasClass('open')) {
			$('.feedback-controls').animate({ right: 0}, 200);
			$('.feedback-controls').addClass('open');
		} else {
			$('.feedback-controls').animate({ right: '-7%'}, 200);
			$('.feedback-controls').removeClass('open');
		}
	});

	$('#toggle-notes').click(function() {
		if($('#toggle-notes').text() == "HIDE NOTES") {
			$('.feedback').hide();
			$('#toggle-notes').text("SHOW NOTES");
		} else {
			$('.feedback').show();
			$('#toggle-notes').text("HIDE NOTES");
		}
	});

	$("body *").hover(function(event) {
		$('body *').css('outline', 'none');
		if(addingFeedback) {
			$(event.target).css('outline', '3px solid #3498db');
		}
	}, function(event) {
		$(event.target).css('outline', 'none');
	});
});

function addFeedback(event) {
	if(addingFeedback
		&& unique(event.target) != '#add-feedback' 
		&& unique(event.target) != '#toggle-notes' 
		&& unique(event.target) != 'html > body'
		&& !feedbackSelectors.contains(unique(event.target)) 
		&& !(unique(event.target).indexOf('.feedback') > -1) 
		&& !(unique(event.target).indexOf('.feedback-controls') > -1) 
		&& !(unique(event.target).indexOf('.adding-feedback') > -1)
	) {
		
		//disable mode of adding feedback
		addingFeedback = false;
		$('.adding-feedback').removeClass('visible');
		event.stopImmediatePropagation();
		$('body').append($('<style>body { cursor: auto; }</style>'))
		document.removeEventListener('click', addFeedback, false);

		//adding feedbackselector to the list
		var selector = unique(event.target);
		var feedbackId = randomString();
		var nextFeedbackNumber = $('.feedback').length + 1;
		feedbackSelectors.push(selector);

		//create model and html
		var feedbackFrontend = new uifeedback.model.feedback(feedbackId, nextFeedbackNumber, selector); 
		newData.push(feedbackFrontend);
		var feedbackHtml = Mustache.render(feedbackTemplate, feedbackFrontend);
		var newFeedback = $(feedbackHtml).prependTo(selector);

		//settings on new feedback
		newFeedback.addClass('new');
		newFeedback.find('.feedback-content').addClass('open');
		newFeedback.find('textarea').autosize();
		newFeedback.find('input').first().focus();
		newFeedback.find('.feedback-content').mouseleave(function() {
			$(this).removeClass('open');
		});

		//binding add comment
		$('[data-id=' + feedbackId + ']').find('.btn').unbind('click').bind('click', function() {
			$(this).parent().parent().removeClass('open');
    		addComment(feedbackId);
    	});
	}
}