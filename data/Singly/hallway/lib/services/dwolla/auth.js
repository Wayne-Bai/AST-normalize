module.exports = {
  endPoint: 'https://www.dwolla.com/oauth/v2/token',
  grantType: 'authorization_code',
  handler: { oauth2 : 'GET' },
  authUrl: 'https://www.dwolla.com/oauth/v2/authenticate' +
    '?response_type=code' +
    '&scope=AccountInfoFull'
};
