define(function(require){
  var $ = require('jquery');
  var Showdown = require('showdown');
  var converter = new Showdown.converter();


  function update (snapshot) {
    var html = converter.makeHtml(snapshot);
    $('#preview').html(html);
  }
  
  var previewer = {
    bindEditor: function (editor) {
      editor.on('change', function () {
        update(editor.getValue());
      });
    }
  };

  $('#preview-menu').on('click', function(e){
    e.preventDefault();
    var isClosed = $('#preview-menu i')
      .toggleClass('icon-eye-open icon-eye-close')
      .hasClass('icon-eye-close');

    if(isClosed){
      $('#preview').hide();
      $('#editor').show();
    } else {
      $('#preview').show();
      $('#editor').hide();
    }

  });

  return previewer; 
});