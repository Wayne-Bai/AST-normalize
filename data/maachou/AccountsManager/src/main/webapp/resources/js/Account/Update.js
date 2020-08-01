$(document).ready(function() {
	var validator = $("#accountEditForm").validate({
		rules: {
			firstName: "required",
			lastName: "required",
			password: {
				required: true,
				minlength: 5,
				maxlength: 10
			},
			password_confirm: {
				required: true,
				equalTo: "#password"
			}
		},
		messages: {
			firstName: "Enter your firstname",
			lastName: "Enter your lastname",
			password: {
				required: "Provide a password",
				minlength: jQuery.format("Enter at least {0} characters"),
				maxlength: jQuery.format("Enter a maximum of {0} characters")
			},
			password_confirm: {
				required: "Repeat your password",
				equalTo: "Enter the same password as above"
			}
		},
		errorPlacement: function(error, element) {
			error.appendTo( element.next() );
		},
		submitHandler: function() {
			var jsonData = {
				id : $("input#id").val(),
				firstName : $("input#firstName").val(),
				lastName : $("input#lastName").val(),
				password : $("input#password").val(),
				email : $("input#email").val(),
				isEnabled : $('input#isEnabled').is(':checked')
			};
			$.ajax({  
				  type: "PUT",  
				  url: "/domain/accounts/"+$("input#id").val(),  
				  data: JSON.stringify(jsonData),
				  contentType: "application/json; charset=utf-8",
				  success: function(response,status,xhr) { 
					  document.location.href='/domain/accounts/list';
				  }
				});  
			return false; 
		},
		success: function(label) {
		}
	});
	// Handling reset button
	resetButtonHandler();
});


function resetButtonHandler(){
	$("#resetButton").click(function() {
		$("input#firstName").val($("input#firstName").attr("data-reset"));
		$("input#lastName").val($("input#lastName").attr("data-reset"));
		$("input#password").val($("input#password").attr("data-reset"));
		$("input#password_confirm").val($("input#password").attr("data-reset"));
		  return false;
	});	
}



