Talker.PasteFormatter = function() {
  var self = this;
  
  self.onMessageReceived = function(event) {
    if (event.paste){
      var wrapLines     = (!(/^[\t| ]+/mg).test(event.content));
      var whiteSpace    = 'white-space:' + (wrapLines ? 'pre-wrap' : 'pre') + ';';
      var shownContent  = event.content;
      var moreLines     = false;
      var moreChars     = false;
      
      if (wrapLines) {
        if (event.content.length > 730){
          moreChars =  "<span class='more_lines'>(" + (event.content.length - 730) + " more characters)</span>";
          shownContent = event.content.substr(0, 730) + '...';
        }
      } else {
        if (event.paste.lines > event.paste.preview_lines) {
          moreLines = " <span class='more_lines'>(" + (event.paste.lines - event.paste.preview_lines) + " more lines)</span>";
        }
        shownContent = event.content;
      }
      
      var newContent = ''
        + "<a target='_blank' title='Paste #" + event.paste.id + "' href='" 
        + window.location.protocol + "//" + window.location.host + "/pastes/" + event.paste.id 
        + "' class='view_paste'>View / Edit paste</a> "
        + (moreLines || moreChars || '')
        + '<div><pre style="width: ' + Talker.getMaxContentWidth() + 'px; ' + whiteSpace + '" id="past_pre_' + event.paste.id + '">'
        + shownContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        + '</pre></div>'
      
      Talker.insertMessage(event, newContent);
      return false;
    }
  }
  
  // resizer is in default formatter
};
