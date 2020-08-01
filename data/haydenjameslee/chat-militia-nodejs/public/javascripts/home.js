function goToChat() {
  var cid = $('#cid').val();
  window.location.replace("/" + cid);
}

$(document).ready(function () {

  //join chat functions
  $('#join').click(goToChat);

  $(document).keypress(function (e) {
    if (e.keyCode == 13) {
      goToChat();
      return false;
    }
  });

  $('#cid').popover({
    container: 'body',
    placement: 'bottom',
    content: 'Enter the name for your chatroom.<br />For example: <a href="/cats">cats</a>.',
    html: true
  });

  setTimeout(function () {
    $('#cid').focus();
    $('#cid').popover('show');
  }, 700);

});