var nock = require('nock');

nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/identity/openidconnect/tokenservice', "client_id=CLIENT_ID&client_secret=CLIENT_SECRET&code=Invalid%20code&grant_type=authorization_code")
  .reply(400, "{\"error_description\":\"client id or secret is null\",\"error\":\"invalid_client\"}", { date: 'Wed, 23 Apr 2014 14:38:21 GMT',
  server: 'Apache-Coyote/1.1',
  'cache-control': 'no-store',
  pragma: 'no-cache',
  'content-type': 'application/json',
  'content-length': '76',
  'set-cookie': [ 'Apache=10.72.128.11.1398263901199054; path=/; expires=Fri, 15-Apr-44 14:38:21 GMT' ],
  vary: 'Accept-Encoding',
  connection: 'close' });

nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/identity/openidconnect/tokenservice', "client_id=CLIENT_ID&client_secret=CLIENT_SECRET&code=Invalid%20code&grant_type=authorization_code")
  .reply(400, "{\"error_description\":\"client id or secret is null\",\"error\":\"invalid_client\"}", { date: 'Wed, 23 Apr 2014 14:38:21 GMT',
  server: 'Apache-Coyote/1.1',
  'cache-control': 'no-store',
  pragma: 'no-cache',
  'content-type': 'application/json',
  'content-length': '76',
  'set-cookie': [ 'Apache=10.72.128.11.1398263901644012; path=/; expires=Fri, 15-Apr-44 14:38:21 GMT' ],
  vary: 'Accept-Encoding',
  connection: 'close' });

nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/identity/openidconnect/tokenservice', "client_id=CLIENT_ID&client_secret=CLIENT_SECRET&refresh_token=Invalid%20refresh_token&grant_type=refresh_token")
  .reply(400, "{\"error_description\":\"client id or secret is null\",\"error\":\"invalid_client\"}", { date: 'Wed, 23 Apr 2014 14:38:21 GMT',
  server: 'Apache-Coyote/1.1',
  'cache-control': 'no-store',
  pragma: 'no-cache',
  'content-type': 'application/json',
  'content-length': '76',
  'set-cookie': [ 'Apache=10.72.128.11.1398263902047383; path=/; expires=Fri, 15-Apr-44 14:38:22 GMT' ],
  vary: 'Accept-Encoding',
  connection: 'close' });


nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/identity/openidconnect/tokenservice', "client_id=CLIENT_ID&client_secret=CLIENT_SECRET&refresh_token=Invalid%20refresh_token&grant_type=refresh_token")
  .reply(400, "{\"error_description\":\"client id or secret is null\",\"error\":\"invalid_client\"}", { date: 'Wed, 23 Apr 2014 14:38:22 GMT',
  server: 'Apache-Coyote/1.1',
  'cache-control': 'no-store',
  pragma: 'no-cache',
  'content-type': 'application/json',
  'content-length': '76',
  'set-cookie': [ 'Apache=10.72.128.11.1398263902455816; path=/; expires=Fri, 15-Apr-44 14:38:22 GMT' ],
  vary: 'Accept-Encoding',
  connection: 'close' });


nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/identity/openidconnect/userinfo', "schema=openid&client_id=CLIENT_ID&access_token=Invalid%20access_token")
  .reply(401, "", { date: 'Wed, 23 Apr 2014 14:38:22 GMT',
  server: 'Apache-Coyote/1.1',
  'www-authenticate': 'Bearer error_description="Invalid Access Token",error="invalid_token",realm="UserInfoService"',
  'set-cookie': [ 'Apache=10.72.128.11.1398263902865365; path=/; expires=Fri, 15-Apr-44 14:38:22 GMT' ],
  vary: 'Accept-Encoding',
  'content-length': '0',
  'keep-alive': 'timeout=5, max=100',
  connection: 'Keep-Alive',
  'content-type': 'text/html' });

nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/identity/openidconnect/userinfo', "schema=openid&client_id=CLIENT_ID&access_token=Invalid%20access_token")
  .reply(401, "", { date: 'Wed, 23 Apr 2014 14:38:22 GMT',
  server: 'Apache-Coyote/1.1',
  'www-authenticate': 'Bearer error_description="Invalid Access Token",error="invalid_token",realm="UserInfoService"',
  'set-cookie': [ 'Apache=10.72.128.11.1398263903211132; path=/; expires=Fri, 15-Apr-44 14:38:23 GMT' ],
  vary: 'Accept-Encoding',
  'content-length': '0',
  'keep-alive': 'timeout=5, max=100',
  connection: 'Keep-Alive',
  'content-type': 'text/html' });
