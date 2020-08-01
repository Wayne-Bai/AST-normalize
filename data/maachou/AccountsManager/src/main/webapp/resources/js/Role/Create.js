$(document).ready(function() {
	var validator = $("#roleForm").validate({
		rules: {
			roleName: {
				required:true
				,
				remote: "/validator/checkrolename"
			}
		},
		messages: {
			roleName: {
				required : "Enter a role name"
					,
				remote: jQuery.format("{0} is already in use")
					}
		},
		errorPlacement: function(error, element) {
			error.appendTo(element.next());
		},
		submitHandler: function() {
			var jsonData = {
				roleName : $("input#roleName").val()
			};
			$.ajax({  
				  type: "POST",  
				  url: "/domain/roles/",  
				  data: JSON.stringify(jsonData),
				  contentType: "application/json; charset=utf-8",
				  success: function(response,status,xhr) {
					  document.location.href='/domain/roles/list';
				  },
			      error: function (xhr, ajaxOptions, thrownError) {
			          alert(thrownError);
			        }
				});  
			return false; 
		},
		success: function(label) {
		}
	});
	cancelButtonHandler();
});

/**
 * Cancel button handler
 */
function cancelButtonHandler(){
	$("#cancelButton").click(function() {
		document.location.href='/domain/roles/list';
	});	
}
