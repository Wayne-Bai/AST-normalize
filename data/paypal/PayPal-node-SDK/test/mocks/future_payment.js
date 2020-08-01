var nock = require('nock');

nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/oauth2/token', "grant_type=authorization_code&response_type=token&redirect_uri=urn:ietf:wg:oauth:2.0:oob&code=invalid_code")
  .reply(400, "{\"error\":\"invalid_request\",\"error_description\":\"Invalid auth code\"}", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava2.slc.paypal.com;threadId=1675',
  'paypal-debug-id': '50061afa569eb',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=47930&TopLevelTxnStartTime=1458ed6489d&Host=slcsbidensectoken501.slc.paypal.com&pid=3363',
  'correlation-id': '50061afa569eb',
  date: 'Wed, 23 Apr 2014 13:46:19 GMT',
  connection: 'close, close',
  'content-type': 'application/json',
  'transfer-encoding': 'chunked' });
nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, "{\"scope\":\"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card\",\"access_token\":\"KY9dD9enEID63lZMCALCCWCfwwQoxnjX3SignbrKjmw\",\"token_type\":\"Bearer\",\"app_id\":\"APP-2EJ531395M785864S\",\"expires_in\":28800}", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava3.slc.paypal.com;threadId=228',
  'paypal-debug-id': 'd7cfa9cf4a1e9',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=47930&TopLevelTxnStartTime=1458ed64a95&Host=slcsbidensectoken501.slc.paypal.com&pid=3363',
  'correlation-id': 'd7cfa9cf4a1e9',
  date: 'Wed, 23 Apr 2014 13:46:20 GMT',
  'content-type': 'application/json',
  'transfer-encoding': 'chunked' });
nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/payments/payment/', {"intent":"sale","payer":{"payment_method":"paypal"},"transactions":[{"amount":{"currency":"USD","total":"1.00"},"description":"This is the payment description."}]})
  .reply(400, "{\"name\":\"VALIDATION_ERROR\",\"details\":[{\"field\":\"redirect_urls\",\"issue\":\"This field required when payment_method is 'paypal'\"}],\"message\":\"Invalid request - see details\",\"information_link\":\"https://developer.paypal.com/webapps/developer/docs/api/#VALIDATION_ERROR\",\"debug_id\":\"48a4ed184a6f0\"}", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava3.slc.paypal.com;threadId=371',
  'paypal-debug-id': '48a4ed184a6f0',
  server_info: 'paymentsplatformserv:v1.payments.payment&CalThreadId=207&TopLevelTxnStartTime=1458ed64e7f&Host=slcsbjm1.slc.paypal.com&pid=26082',
  'correlation-id': '48a4ed184a6f0',
  'content-language': '*',
  date: 'Wed, 23 Apr 2014 13:46:20 GMT',
  connection: 'close, close',
  'content-type': 'application/json',
  'transfer-encoding': 'chunked' });
nock('https://api.sandbox.paypal.com:443:443')
  .post('/v1/oauth2/token', "grant_type=refresh_token&refresh_token=invalid_token")
  .reply(400, "{\"error\":\"invalid_request\",\"error_description\":\"Invalid refresh token\"}", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava4.slc.paypal.com;threadId=8293',
  'paypal-debug-id': '529ff2e047fe3',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=151124&TopLevelTxnStartTime=1458ed64fff&Host=slcsbidensectoken501.slc.paypal.com&pid=3363',
  'correlation-id': '529ff2e047fe3',
  date: 'Wed, 23 Apr 2014 13:46:20 GMT',
  connection: 'close, close',
  'content-type': 'application/json',
  'transfer-encoding': 'chunked' });
