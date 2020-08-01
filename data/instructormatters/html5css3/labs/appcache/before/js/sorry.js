var 
  body = document.getElementsByTagName('body')[0],
  app = document.getElementsByClassName('app')[0],
  sorry = document.createElement('div');
sorry.className = "twtr-widget";
sorry.innerHTML = 'Offline? No Twitter, sorry.';
body.insertBefore(sorry, app)