var DEFAULT_SCOPE = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.profile'
];

module.exports = {
  endPoint: 'https://accounts.google.com/o/oauth2/token',
  grantType: 'authorization_code',
  handler: { oauth2 : 'POST' },
  strict: true,
  authUrl: 'https://accounts.google.com/o/oauth2/auth' +
    '?response_type=code' +
    '&scope=' + encodeURIComponent(DEFAULT_SCOPE.join(' ')) +
    '&access_type=offline' +
    '&approval_prompt=force'
};
