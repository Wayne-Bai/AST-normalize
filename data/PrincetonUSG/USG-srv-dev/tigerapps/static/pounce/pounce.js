var addCourse = function(course, num){
	var courseRow = $("<tr>").addClass("course").addClass("num" + num);

	courseRow.append($("<td>").text(course['courseId']).addClass("courseId"));
	courseRow.append($("<td>").text(course['courseTitle']).addClass("courseTitle"));
	courseRow.hide()
	
	courseRow.click(function(){
		viewCourseDetail(course);
	});
	
	$("#table-courses-body").append(courseRow);
}

var adjustScroll = function(){
	var scrollDiv = $('#course-detail-scroll');
	if (scrollDiv.get(0).scrollTop < (scrollDiv.get(0).scrollHeight - scrollDiv.height())){
		$('#arrow-down').show();
		$('#space-down').hide();
	} else {
		$('#arrow-down').hide();
		$('#space-down').show();
	}
	
	if (scrollDiv.get(0).scrollTop > 0){
		$('#arrow-up').show();
		$('#space-up').hide();
	} else {
		$('#arrow-up').hide();
		$('#space-up').show();
	}
}


var viewCourseDetail = function(course){
	$('#filter-help').hide();
	$("#course-detail-table").empty();
	$("#course-detail").show();
	$("#course-detail-id").text(course.courseId);
	$("#course-detail-title").text(course.courseTitle);
    // $("#course-pce-link").attr('href', course.pceLink);
	$.each(course.classes, function(index, theClass){
		var classRow = $("<tr>");
		if (theClass.isClosed){
			classRow.addClass("filled");
		}
		classRow.append($("<td>").text(theClass['classTitle']));
		classRow.append($("<td>").text(theClass['classDays']));
		classRow.append($("<td>").text(theClass['classTime']));
		classRow.append($("<td>").text(theClass['enroll'] + ' / ' + theClass['max']));
		if (theClass.isClosed){
			classRow.click(function(){
				showPounceModal(course.courseId, theClass);
			});
		}
		$("#course-detail-table").append(classRow);
	});
	adjustScroll();
	$('#course-detail-scroll').scroll(adjustScroll);
}

var showPounceModal = function(courseId, theClass){
        $("#pounce-modal-button").unbind()
        $("#phone-number").unbind()
	$(".course-name").text(courseId + " " + theClass.classTitle);
	$("#pounce-modal-button").click(function(){
		pounce(theClass);
	});
  	$("#phone-number").keypress(function(e){
  		if (e.which == 13){
  			e.preventDefault();
			pounce(theClass);
  			return false;
  		}
  	});
	$("#pounce-modal").modal();
}

var pounce = function(theClass){
	var close = '<a class="close" data-dismiss="alert" href="#">&times;</a>';

	var dict = {"classNumber" : theClass.classNumber};
	if ($('#text-checkbox').prop('checked')){
		dict['phoneNumber'] = $('#phone-number').val();
	}
	
	var jqxhr;
	jqxhr = $.post("subscribe", dict);
	jqxhr.success(function(response){
		var color = response.charAt(0) == '+' ? 'alert-success' : 'alert-error';
		var html = response.substring(1);
		$('<div>').html(html + close).addClass('alert').addClass(color).appendTo('#alert-row');
	});
	$("#pounce-modal").modal('hide');
	$("#status-alert-modal").modal('hide');
	$("#pounce-modal-button").unbind();
}

var subjectCodes = ["AAS", "AFS", "AMS", "ANT", "AOS", "APC", "ARA", "ARC", "ART", "AST", "ATL",
                "BCS", "CBE", "CEE", "CHI", "CHM", "CHV", "CLA", "CLG", "COM","COS","CWR", "CZE","DAN","EAP",
                "EAS", "ECO", "ECS", "EEB", "EGR", "ELE", "ENE","ENG","ENV","EPS", "FIN","FRE","FRS","GEO",
                "GER","GHP","GLS","GSS","HEB","HIN","HIS","HLS","HOS","HUM","ISC","ITA","JDS",
                "JPN","JRN","KOR","LAO","LAS","LAT","LIN","MAE","MAT","MED","MOD","MOG","MOL",
                "MSE","MUS","NES","NEU","ORF","PAW","PER","PHI","PHY","PLS","POL","POP","POR",
                "PSY","QCB","REL","RUS","SAS","SLA","SOC","SPA","STC","SWA","THR","TPP","TRA",
                "TUR","URB","URD","VIS","WRI","WWS"];

var filter = function(text){
  	$('#table-courses').show();
	$('#filter-help').show();
	$('#course-detail').hide();
  		
	if (text.length > 3) {
		text = text.substring(0, 3) + "\\s*" + text.substring(3, text.length);
	}
	var re = new RegExp(text, 'i');
	var isSubjectCode = false;
	if (subjectCodes.indexOf(text.toUpperCase()) != -1){
		isSubjectCode = true;
	}
	$('.course').each(function(){
		if($(this).children('.courseId')[0].innerHTML.match(re)
		|| (!isSubjectCode && $(this).children('.courseTitle')[0].innerHTML.match(re))){ 
			$(this).show();
		}
		else {
			$(this).hide()
		}
	});
}

$(document).ready(function(){
    
	var adjustSidebar = function() {
		$('#sidebar').css('width', $('#sidebar-wrapper').width());
	}
	$(window).resize(adjustSidebar);
	adjustSidebar();
	
 	$('#sidebar').affix({'offset' : {
 		'top' : function(){
 			return $('#sidebar-wrapper').offset().top - 20
 			}
 		}
 	});

 	$.getJSON('courses', function(courses){
 		for (var i = 0; i < courses.length; i++){
			addCourse(courses[i], i);
 		}
 	});
 	
  	$("#search-button").click(function(){
 		filter($("#search-input").val());
  	});
  	
  	$("#search-input").keypress(function(e){
  		if (e.which == 13){
  			e.preventDefault();
 			filter($("#search-input").val());
  			return false;
  		}
  	});
  	
  	$('#text-checkbox').click(function(){
  		$('#text-div').toggle();
  	});
});