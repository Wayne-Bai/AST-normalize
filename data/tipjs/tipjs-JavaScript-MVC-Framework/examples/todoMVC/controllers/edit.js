tipJS.controller({
	name : "todoMVC.edit",

	invoke : function( label ){
		tipJS.log(this.name);

		$(label).closest('li').addClass('editing').find('.edit').focus();
	}
});
