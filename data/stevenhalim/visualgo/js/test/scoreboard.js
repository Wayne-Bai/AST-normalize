function populateTable(data) {
	var total = 0;
	var nStudents = data.length;

	for(var i=0; i<nStudents; i++) {
		var no = i+1;
		var matricNo = hideSome(data[i].username);
		var stName = data[i].name;
		var score = data[i].grade;
		var outof = data[i].questionAmount;
		var min = Math.floor(data[i].timeTaken/60);
		var sec = data[i].timeTaken%60;

		//filter bottom 1/2
		if(score >= (outof/2)) {
			$('table tr:last').after('<tr><td>'+no+'</td><td>'+matricNo+'</td><td>'+stName+'</td><td>'+score+'</td><td>'+min+'m '+sec+'s</td></tr>');
		}

		total += parseInt(score);
	}

	//calculate average score
	var avg = (total/nStudents).toFixed(2);
	$('#avg').html(avg);
}

function hideSome(str) {
	var length = Math.min(str.length, 2);
	if(isMatricNo(str)) {
		str = str.replaceAt(4, '*');
		str = str.replaceAt(7, '*');
	} else {
		while(length > 0) {
			var index = Math.floor(Math.random()*str.length);
			if(str.charAt(index) != '*') {
				str = str.replaceAt(index, '*');
				length--;
			}
		}
	}
	return str;
}

function isMatricNo(str) {
	return (str.length == 9); //can put more conditions
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

$(document).ready(function() {
	$.ajax({
		url: "php/Test.php",
		data: {mode: MODE_CHECK_TEST_OPEN}
	}).done(function(data) {
		data = JSON.parse(data);
		if(data.answerIsOpen == 1) {
			$.ajax({
				url: "php/Test.php",
				data: {mode: MODE_GET_SCOREBOARD}
			}).done(function(data) {
				data = JSON.parse(data);
				$('table').show();
				populateTable(data);
			});
		} else {
			$('p').html("The scoreboard is not available at the moment.").css('font-size','16px').css('text-align','center');
		}
	});
});