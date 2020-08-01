define(function (require) {
  require('bootstrap');
  require('select2');
  var $ = require('jquery');
  var removeDocConfirmationTempl = require('js/templates/remove-document-confirmation');
  var tagListTmpl = require('js/templates/tag-list');

  $('.remove-doc').on('click', function(e){
    e.preventDefault();
    var row = $(this).parents('tr');
    var docId = $(this).attr('data-id');
    var docName = $(this).attr('data-name');
    
    var popup = $(removeDocConfirmationTempl({name: docName}))
      .appendTo('body')
      .modal('show')
      .on('hidden', function(){
        $(this).remove();
      });
    
    popup.find('.yes-remove')
      .on('click', function(){
        $.ajax({
          url: '/doc/' + docId,
          type: 'DELETE'
        }).always(function(){
          popup.modal('hide');
        }).done(function(){
          row.remove();
        });
      });
  });

  $('.tag-list').on('click', '.edit-tags-button', function(){
    var tagList = $(this).parents('.tag-list').hide();
    var tagEditor = tagList.siblings('.tag-editor').show();
    var docId = tagList.parents('tr').attr('data-docid');

    tagEditor.find('.tag-changer').select2({
      tags: tagEditor.find('.tag-changer').val().split(',')
    });

    tagEditor
      .find('.save-tags')
      .off('click')
      .on('click', function(){
        var tags = tagEditor.find('.tag-changer').select2('val');
        
        $.ajax({
          type:        'POST',
          url:         '/doc/' + docId + '/tags',
          contentType: 'application/json',
          data: JSON.stringify(tags)
        }).done(function(){
          tagList.html(tagListTmpl({
            doc: {tags: tags}
          }));
        });

        tagEditor.hide();
        tagList.show();
      });

  });
});