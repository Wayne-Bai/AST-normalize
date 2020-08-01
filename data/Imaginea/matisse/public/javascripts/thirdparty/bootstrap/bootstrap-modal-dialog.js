$('#whiteBoardForm').modal();

$('#createWhiteboard').on('click', function(e){
    // We don't want this to act as a link so cancel the link action
    e.preventDefault();
    var nameTextboxValue = $('#name').val();
    if(nameTextboxValue == 'Name' || nameTextboxValue == '')
    {
		    e.stopPropagation();
		    $('#nameError').show();
		    $('.control-label[for="whiteboardName"]').css('color', 'red');
		}
	  else
	  {
        // Find form and submit it
		    $('#whiteboard').submit();
	  }
});
