var MODE = "ANSWER";
var studentid = "";
var studentpw = "";
var anskeyArr = new Array();

function getQns() {
	$.ajax({
		url: "php/Test.php",
		data: {mode: MODE_TEST_GENERATE_QUESTIONS, username: studentid, password: studentpw, type: TEST_GENERATE_QUESTIONS_TYPE_ANSWER}
	}).done(function(data) {
		if(data != 0) {
			data = JSON.parse(data);
			nQns = data.length;
			init();
			for(var i=1; i<=nQns; i++) {
				extractInfo(i, data[i-1]);
			}
			getAns();
		} else {
			customAlert("The answer key is locked at the moment.");
		}
	});
}

function getAns() {
	$.ajax({
		url: "php/Test.php",
		data: {mode: MODE_TEST_GET_STUDENT_ANSWERS, username: studentid, password: studentpw}
	}).done(function(stAnsData) {
		$.ajax({
			url: "php/Test.php",
			data: {mode: MODE_TEST_GET_ANSWERS, username: studentid, password: studentpw}
		}).done(function(ansData) {
			var score =0;

			//store into anskeyArr array
			ansData = JSON.parse(ansData);
			for(var i=0; i<ansData.length; i++) {
				anskeyArr[i+1] = ansData[i];
				if(ansData[i] == CORRECT) score++;
			}
			
			//switch screens
			$('#question-nav').html("");
			prepareQnNav(nQns);
			$('#login-err').html("");
			$('#login-screen').fadeOut("fast");
			$('#test-screen').fadeIn("fast");
			$('#infoscore').html(score+"/"+ansData.length);
						
			//show first question
			gw.startAnimation(qnGraphArr); //start graph widget
			gw.pause();
			qnNo = 1; //start with qn 1
			showQn(qnNo);
		});
	
		stAnsData = JSON.parse(stAnsData);
		//store into anskeyArr array
		for(var i=0; i<stAnsData.length; i++) {
			var raw = stAnsData[i];
			var proc;
			if(raw.length==0) {
				proc = NO_ANSWER;
			} else if(raw[0] == UNANSWERED) {
				proc = UNANSWERED;
			} else {
				proc = new Array();
				for(var j=0; j<raw.length; j++) {
					if(!isNaN(parseInt(raw[j]))) { //double negative, i.e. is a number
						raw[j] = parseInt(raw[j]);
					}
					proc.push(raw[j]);
				}
				if(qnTypeArr[i+1] == INTERFACE_MULT_E) {
					//make into pairs so that answer interface displays correctly
					var newProc = new Array();
					for(var k=0; k<proc.length; k+=2) {
						newProc.push([proc[k],proc[k+1]]);
					}
					proc = newProc;
				}
			}
			ansArr[i+1] = proc;
		}
	});
}

$(document).ready (function() {
	$('#question-nav').css("background-color", surpriseColour);
	$('.right-links').css('background',surpriseColour);
	
	/*-------LOG IN CSS-------*/
	$('#login-id').focusin(function() {
		$(this).css('box-shadow','0px 0px 3px '+surpriseColour+' inset');
		if ($(this).val() == "user id") {
			$(this).css('color','black');
			$(this).val("");
		}
	}).focusout(function() {
		$(this).css('box-shadow','0px 0px 3px #929292 inset');
		if ($(this).val() == "") {
			$(this).css('color','#aaa');
			$(this).val("user id");
		}
	});
	$('#login-pw').focusin(function() {
		$(this).css('box-shadow','0px 0px 3px '+surpriseColour+' inset');
		if ($(this).val() == "password") {
			$(this).attr('type','password');
			$(this).css('color','black');
			$(this).val("");
		}
	}).focusout(function() {
		$(this).css('box-shadow','0px 0px 3px #929292 inset');
		if ($(this).val() == "") {
			$(this).css('color','#aaa');
			$(this).attr('type','text');
			$(this).val("password");
		}
	});
	
	/*-------LOG IN AUTHENTICATION-------*/
	$('#login-go').click(function(event) {
		event.preventDefault();
		studentid = $('#login-id').val();
		studentpw = $('#login-pw').val();
		//authentificate
		$.ajax({
			url: "php/Test.php",
			data: {mode: MODE_LOGIN, username: studentid, password: studentpw}
		}).done(function(passed) {
			passed = parseInt(passed);
			if(passed == 1) {
				getQns();
				$.ajax({//get name to display
					url: "php/Test.php",
					data: {mode: MODE_TEST_GET_INFO, username: studentid, password: studentpw}
				}).done(function(data) {
					data = JSON.parse(data);
					var studentname = data.name;
					$('#student-name').html(studentname);
				});
			} else {
				$('#login-err').html("Incorrect username or password");
			}
		});
	});
	
});