$(document).ready(function(){
	$("#button2").click(function(){
		$.getJSON("TestJsonSemester1.json",
				  function(data){
			$.getJSON("studienanfanger_studienfach_bundeslander.json",
					 function(data2){
//myDoughnut.segments[0].value = parseInt(data.semester1[1]["Deutsche Weiblich"]);			
myDoughnut.segments[1].value = parseInt(data.semester1[1]["Deutsche Weiblich"])/parseInt(data2.semester[2]["Deutsche Insgesamt"]);
//myDoughnut.segments[2].value = parseInt(data.semester1[1]["Deutsche Insgesamt"]);
myDoughnut.segments[0].label = "Deutsche Weiblich";
myDoughnut.segments[1].label = "Deutsche Männlich";
myDoughnut.segments[2].label = "Deutsche Insgesamt";

		myDoughnut.update();
		});		
		});
	});
});