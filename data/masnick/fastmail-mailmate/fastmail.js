jQuery( document ).ready(function() {
  var entityMap = {
     "&": "&amp;",
     "<": "&lt;",
     ">": "&gt;",
     '"': '&quot;',
     "'": '&#39;',
     "/": '&#x2F;'
   };

   function escapeHtml(string) {
     return String(string).replace(/[&<>"'\/]/g, function (s) {
       return entityMap[s];
     });
   }

  jQuery('body').on('click', '#mailboxList .MailboxItemView a', function(e){
    $elem = $(e.currentTarget);
    var matches = $elem.attr('href').match(/\/mail\/.*\/[0-9a-z]+-([0-9a-z]+)\?u=([a-z0-9]+)/);
    if(matches != null) {
      var mid = matches[1];
      var uid = matches[2];

      jQuery.ajax({
        url: "https://www.fastmail.fm/rawmessage/"+mid+"?u="+uid,
      }).done(function( html ) {
        jQuery('.mailmate-link').remove();

        var htmlMatches = html.match(/Message-ID: <(.*)>/i);
        if(htmlMatches != null) {
          jQuery('.app-toolbar .left').append('<span class="mailmate-link">&nbsp;&nbsp;<a style="z-index: 100000;" href="message://'+escapeHtml(htmlMatches[1])+'">MailMate</a></span>');
        }
      });

    }
  })
});

