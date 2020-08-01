var MODE = "TRAINING";
var anskeyArr = new Array();

seed = (Math.floor(Math.random()*1000000000));

function startTraining() {
	nQns = getNumberOfQns();
	$.ajax({
		url: "php/Test.php",
		data: {mode: MODE_GENERATE_QUESTIONS, qAmt: nQns, seed: seed, topics: topics.toString()}
	}).done(function(data) {
		data = JSON.parse(data);
		init();
		for(var i=1; i<=nQns; i++) {
			extractInfo(i, data[i-1]);
		}
		
		//switch screens
		prepareQnNav(nQns);
		$('#topics-screen').fadeOut("fast");
		$('#test-screen').fadeIn("fast");
		$('#ans-key').hide();
		$('#info').show();
		$('#restart-test').hide();
		
		//show first question
		gw.startAnimation(qnGraphArr); //start graph widget
		gw.pause();
		qnNo = 1; //start with qn 1
		showQn(qnNo);
	});
}

function submitTraining() {
	//get score
	ansArr.shift();
	var ansFlattened = ansArr.join('|').split("|");
	ansArr.unshift(false);
	$.ajax({
		url: "php/Test.php",
		data: {mode: MODE_CHECK_ANSWERS, qAmt: nQns, seed: seed, topics: topics.toString(), ans: ansFlattened}
	}).done(function(score) {
		score = parseInt(score);
		$('#score').html(score+" out of "+nQns);
		$('#test-screen').fadeOut("fast");
		$('#result-screen').fadeIn("fast");
	});
}

function startAns() {
	ansArr.shift();
	var ansFlattened = ansArr.join('|').split("|");
	ansArr.unshift(false);
	$.ajax({
		url: "php/Test.php",
		data: {mode: MODE_GET_ANSWERS, qAmt: nQns, seed: seed, topics: topics.toString(), ans: ansFlattened}
	}).done(function(ansData) {
		//store into anskeyArr array
		ansData = JSON.parse(ansData);
		for(var i=0; i<ansData.length; i++) {
			anskeyArr[i+1] = ansData[i];
		}
		$('#result-screen').fadeOut('fast');
		$('#test-screen').fadeIn('fast');
		$('#ans-key').show();
		$('#undo-ans').hide();
		$('#clear-ans').hide();
		$('#submit-test').hide();
		$('#restart-test').show();
				
		$('#question-nav .qnno').removeClass('selected');
		$('#question-nav .qnno').eq(0).addClass('selected');
		qnNo = 1; //start with qn 1
		showQn(qnNo);
	});
}

function checkComplete() {}

$(document).ready (function() {
	
	$('#question-nav').css("background-color", surpriseColour);
	
	/*-------TOPIC SELECTION-------*/
	$('#topics-screen .topic').each(function() {
		if($(this).hasClass('topic-selected')) {
			$(this).children('img').removeClass('grayscale');
			topics.push($(this).attr('name'));
		} else {
			$(this).children('img').addClass('grayscale');
		}
	});
	$('#topics-screen .topic').click(function() {
		if($(this).hasClass('topic-selected')) { //deselect it
			$(this).children('img').addClass('grayscale');
			$(this).removeClass('topic-selected');
			var indexToDel = topics.indexOf($(this).attr('name'));
			topics.splice(indexToDel,1);
		} else { //select it
			$(this).children('img').removeClass('grayscale');
			$(this).addClass('topic-selected');
			topics.push($(this).attr('name'));
		}
	});
	$('#start-training').css("background-color", surpriseColour);
	$('#start-training').hover(function() {
		$(this).css("background-color", "black");
	}, function() {
		$(this).css("background-color", surpriseColour);
	});
	
	/*-------START TRAINING-------*/
	$('#start-training').click(function() {
		if(topics.length > 0) {
			startTraining();
		} else {
			customAlert("Please select some topics first!");
		}
	});

	/*-------SUBMIT QUIZ-------*/
	$('#submit-test').click(function() {
		submitTraining();
	});
	$('#goto-answer').css("background-color", surpriseColour);
	$('#goto-answer').hover(function() {
		$(this).css("background-color", "black");
	}, function() {
		$(this).css("background-color", surpriseColour);
	});
	$('#goto-answer').click(function() {
		MODE = "ANSWER";
		startAns();
	});	

	/*-------RESTART QUIZ-------*/
	$('#restart-test').click(function() {
	    location.reload();
	});
});