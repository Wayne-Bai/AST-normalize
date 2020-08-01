$('document').ready(function() {
  $('#verify-contribution').bind('ajax:before', function() {
    $(this).data('params', {repo_owner: $('#repo-owner').val(), repo_name: $('#repo-name').val()});
  });
  $('#verify-contribution').bind('ajax:success', function(evt, data, status, xhr) {
    var responseObject = $.parseJSON(xhr.responseText);
    $('#contribution-message').text(responseObject.success).removeClass('alert-error').addClass('alert verify-contribution-message');
    $('#github-repos').append(responseObject.html);
  });
  $('#verify-contribution').bind('ajax:error', function(evt, xhr, status, error) {
    var responseObject = $.parseJSON(xhr.responseText);
    $('#contribution-message').text(responseObject.error).addClass('alert alert-error verify-contribution-message');
  });
});
