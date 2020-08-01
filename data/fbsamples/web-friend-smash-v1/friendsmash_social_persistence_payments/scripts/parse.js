function updatePlayer() {
  Parse.User.current().save({
    bombs: gPlayerBombs,
    coins: gPlayerCoins
  }).then( updatePlayerUI, parseErrorCallback );
}

function getLoginParamsFromAuthResponse(authResponse) {
  return {
    id: authResponse.userID,
    access_token: authResponse.accessToken,
    expiration_date: convertExpiryDate(authResponse.expiresIn)
  };
}

function convertExpiryDate(expiresIn) {
  var date = new Date();
  date.setSeconds(date.getSeconds() + expiresIn);
  return ''
    + date.getUTCFullYear() + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + ('0' + date.getDay()).slice(-2) + 'T'
    + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':'
    + ('0' + date.getSeconds()).slice(-2) + '.'
    + ('00' + date.getMilliseconds()).slice(-3) + 'Z';
}

function loginSuccessCallback(user) {
  console.log('Successful login', user);
  if( !user.existed() ) {
    setupNewParseUser();
  } else {
    createMenu();
  }
}

function loginErrorCallback(error) {
  console.error('Login error', error);
}

function parseSuccessCallback(object) {
  console.log('Parse Success:', object);
}

function parseErrorCallback(error) {
  console.error('Parse Error:', error);
}

function setupNewParseUser() {
  Parse.User.current().save({
    bombs: 5,
    coins: 100
  }).then( createMenu, parseErrorCallback );
}