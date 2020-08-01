jQuery(function() {
  var popin = document.createElement('div');
  popin.classList.add('linterrex');
  document.body.appendChild(popin);
  document.title = 'Flamite - connection';

  var message = document.createElement('div');
  message.classList.add('linterrex-message');
  message.innerHTML = 'Connexion à Tinder en cours...';
  popin.appendChild(message);

  jQuery.ajax({
    url: 'https://www.facebook.com/v2.0/dialog/oauth/confirm',
    type: 'POST',
    data: {
      app_id: '464891386855067',
      fb_dtsg: $('input[name="fb_dtsg"]').val(),
      ttstamp: '2658170904850115701205011500',
      redirect_uri: 'fbconnect://success',
      return_format: 'access_token',
      from_post: 1,
      display: 'popup',
      gdp_version: 4,
      sheet_name: 'initial',
      __CONFIRM__: 1
    }
  }).done(function(html) {
    var found = html.match(/access_token=([\w_]+)&/i);
    chrome.runtime.sendMessage({type: 'facebookAuth', token: found ? found[1] : null});
  }).fail(function(jqXHR, textStatus) {
    chrome.runtime.sendMessage({type: 'facebookAuth', token: null});
  });
});