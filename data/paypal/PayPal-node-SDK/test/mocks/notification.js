var nock = require('nock');

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A0152brN-U1KzGFrKTZbbGacSM.8OxxU19g-GXyLHZ7HbUQ","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava3.slc.paypal.com;threadId=243',
  'paypal-debug-id': '9f25cee200706',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=234&TopLevelTxnStartTime=149583a451a&Host=slcsbidensectoken501.slc.paypal.com&pid=27294',
  date: 'Tue, 28 Oct 2014 19:27:34 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/notifications/webhooks/', {"url":"https://www.yeowza.com/ppwebhook","event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED"},{"name":"PAYMENT.AUTHORIZATION.VOIDED"}]})
  .reply(201, {"id":"0LS3308554161733N","url":"https://www.yeowza.com/ppwebhook","event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED","description":"A payment authorization was created"},{"name":"PAYMENT.AUTHORIZATION.VOIDED","description":"A payment authorization was voided"}],"links":[{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/0LS3308554161733N","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/0LS3308554161733N","rel":"update","method":"PATCH"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/0LS3308554161733N","rel":"delete","method":"DELETE"}]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava2.slc.paypal.com;threadId=239',
  'paypal-debug-id': 'd97851383821a',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks&CalThreadId=140&TopLevelTxnStartTime=149583a47c5&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 19:27:34 GMT',
  'content-type': 'application/json',
  'content-length': '628' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/notifications/webhooks/0LS3308554161733N')
  .reply(200, {"id":"0LS3308554161733N","url":"https://www.yeowza.com/ppwebhook","event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED","description":"A payment authorization was created"},{"name":"PAYMENT.AUTHORIZATION.VOIDED","description":"A payment authorization was voided"}],"links":[{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/0LS3308554161733N","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/0LS3308554161733N","rel":"update","method":"PATCH"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/0LS3308554161733N","rel":"delete","method":"DELETE"}]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava3.slc.paypal.com;threadId=243',
  'paypal-debug-id': 'aae1080800b47',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks&CalThreadId=143&TopLevelTxnStartTime=149583a498f&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 19:27:34 GMT',
  'content-type': 'application/json',
  'content-length': '628' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015uqC4rIg8MZpazDNiVcrAxKYN.KJ4t1kTncprRT2b4Ds","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=183',
  'paypal-debug-id': '72a22b635143c',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=83013&TopLevelTxnStartTime=149584f7203&Host=slcsbidensectoken501.slc.paypal.com&pid=27294',
  date: 'Tue, 28 Oct 2014 19:50:42 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/notifications/webhooks/', {"url":"https://www.yeowza.com/ppwebhook","event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED"},{"name":"PAYMENT.AUTHORIZATION.VOIDED"}]})
  .reply(201, {"id":"6HY79521VR978045E","url":"https://www.yeowza.com/ppwebhook","event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED","description":"A payment authorization was created"},{"name":"PAYMENT.AUTHORIZATION.VOIDED","description":"A payment authorization was voided"}],"links":[{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/6HY79521VR978045E","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/6HY79521VR978045E","rel":"update","method":"PATCH"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks/6HY79521VR978045E","rel":"delete","method":"DELETE"}]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava2.slc.paypal.com;threadId=250',
  'paypal-debug-id': '851fdb646bcf0',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks&CalThreadId=141&TopLevelTxnStartTime=149584f74b9&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 19:50:42 GMT',
  'content-type': 'application/json',
  'content-length': '629' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/notifications/webhooks/', {"url":"https://www.yeowza.com/ppwebhook","event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED"},{"name":"PAYMENT.AUTHORIZATION.VOIDED"}]})
  .reply(400, {"name":"WEBHOOK_URL_ALREADY_EXISTS","details":[],"message":"Webhook URL already exists"}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=183',
  'paypal-debug-id': '41e159135139c',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks&CalThreadId=140&TopLevelTxnStartTime=149584f7687&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 19:50:42 GMT',
  connection: 'close, close',
  'content-type': 'application/json',
  'content-length': '89' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015Ow6FuAYefIalt6pC0k.cP7MA449AQ1-jw206Hzzhlcw","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava2.slc.paypal.com;threadId=243',
  'paypal-debug-id': 'a9d4fe65809b6',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=77617&TopLevelTxnStartTime=14958b1d18f&Host=slcsbidensectoken501.slc.paypal.com&pid=27294',
  date: 'Tue, 28 Oct 2014 21:38:08 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/notifications/webhooks/6HY79521VR978045E/event-types')
  .reply(200, {"event_types":[{"name":"PAYMENT.AUTHORIZATION.CREATED","description":"A payment authorization was created"},{"name":"PAYMENT.AUTHORIZATION.VOIDED","description":"A payment authorization was voided"}]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3001.slc.paypal.com;threadId=177',
  'paypal-debug-id': 'd1966336ac9fc',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks&CalThreadId=141&TopLevelTxnStartTime=14958b1d4b2&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 21:38:09 GMT',
  'content-type': 'application/json',
  'content-length': '201' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015v.18fDjY1hBZrLwKFpR1AJwfnILEAoozirbS-6GyDzE","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=268',
  'paypal-debug-id': '00bd4ca90a025',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=16569&TopLevelTxnStartTime=14958eada47&Host=slcsbidensectoken502.slc.paypal.com&pid=13667',
  date: 'Tue, 28 Oct 2014 22:40:27 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/notifications/webhooks-events/?page_size=10&start_time=2014-10-20T11%3A42%3A25Z&end_time=2014-10-21T16%3A47%3A29Z')
  .reply(200, {"events":[{"id":"WH-1S115631EN580315E-9KH94552VF7913711","create_time":"2014-10-20T12:04:32Z","resource_type":"authorization","event_type":"PAYMENT.AUTHORIZATION.CREATED","summary":"A successful payment authorization was created for 1.00 USD","resource":{"amount":{"total":"1.00","currency":"USD","details":{"subtotal":"1.00"}},"id":"76V79459UM225560P","parent_payment":"PAY-1KA56302VE598851HKRCPTUA","update_time":"2014-10-20T12:03:24Z","state":"authorized","payment_mode":"INSTANT_TRANSFER","create_time":"2014-10-20T12:02:24Z","links":[{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P/capture","rel":"capture","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P/void","rel":"void","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P/reauthorize","rel":"reauthorize","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-1KA56302VE598851HKRCPTUA","rel":"parent_payment","method":"GET"}],"valid_until":"2014-11-18T12:02:24Z","protection_eligibility_type":"ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE","protection_eligibility":"ELIGIBLE"},"links":[{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-1S115631EN580315E-9KH94552VF7913711","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-1S115631EN580315E-9KH94552VF7913711/resend","rel":"resend","method":"POST"}]},{"id":"WH-9CX24309MH241002A-02146673H3282292X","create_time":"2014-10-20T11:42:25Z","resource_type":"authorization","event_type":"PAYMENT.AUTHORIZATION.CREATED","summary":"A successful payment authorization was created for 15.00 USD","resource":{"amount":{"total":"15.00","currency":"USD","details":{"subtotal":"15.00"}},"id":"1DK351744D8079127","parent_payment":"PAY-55179425P6892414NKRCPI7I","update_time":"2014-10-20T11:41:14Z","state":"authorized","payment_mode":"INSTANT_TRANSFER","create_time":"2014-10-20T11:39:41Z","links":[{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/1DK351744D8079127","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/1DK351744D8079127/capture","rel":"capture","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/1DK351744D8079127/void","rel":"void","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/1DK351744D8079127/reauthorize","rel":"reauthorize","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-55179425P6892414NKRCPI7I","rel":"parent_payment","method":"GET"}],"valid_until":"2014-11-18T11:39:41Z","protection_eligibility_type":"ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE","protection_eligibility":"ELIGIBLE"},"links":[{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-9CX24309MH241002A-02146673H3282292X","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-9CX24309MH241002A-02146673H3282292X/resend","rel":"resend","method":"POST"}]}],"count":2}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava3.slc.paypal.com;threadId=171019',
  'paypal-debug-id': '62d8412a080e9',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks-events&CalThreadId=168&TopLevelTxnStartTime=14958eadd49&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 22:40:27 GMT',
  'content-type': 'application/json',
  'content-length': '3267' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015.mTPFGDv7XvcySlakgrfxCsMmo.5Iv05Rozx4VNuTXw","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=17426',
  'paypal-debug-id': '20e8c61764b53',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=136&TopLevelTxnStartTime=14958fc3767&Host=slcsbidensectoken502.slc.paypal.com&pid=13667',
  date: 'Tue, 28 Oct 2014 22:59:24 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/notifications/webhooks-events/?page_size=10&start_time=2013-10-20T11%3A42%3A25Z&end_time=2013-10-21T16%3A47%3A29Z')
  .reply(400, {"name":"VALIDATION_ERROR","details":[{"field":"start_time","issue":"Invalid data provided"}],"message":"Invalid data provided"}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3001.slc.paypal.com;threadId=186',
  'paypal-debug-id': '3b42d09371e01',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks-events&CalThreadId=140&TopLevelTxnStartTime=14958fc39c6&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 22:59:25 GMT',
  connection: 'close, close',
  'content-type': 'application/json',
  'content-length': '128' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015zZOS2SfCnTEIowousRJLpM2zQzag43iCQNVWpomJsTg","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=17426',
  'paypal-debug-id': '40d60e74a975e',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=16569&TopLevelTxnStartTime=1495910ea15&Host=slcsbidensectoken502.slc.paypal.com&pid=13667',
  date: 'Tue, 28 Oct 2014 23:22:01 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/notifications/webhooks-events/WH-1S115631EN580315E-9KH94552VF7913711/resend', {})
  .reply(202, {"id":"WH-1S115631EN580315E-9KH94552VF7913711","create_time":"2014-10-20T12:04:32Z","resource_type":"authorization","event_type":"PAYMENT.AUTHORIZATION.CREATED","summary":"A successful payment authorization was created for 1.00 USD","resource":{"amount":{"total":"1.00","currency":"USD","details":{"subtotal":"1.00"}},"id":"76V79459UM225560P","parent_payment":"PAY-1KA56302VE598851HKRCPTUA","update_time":"2014-10-20T12:03:24Z","state":"authorized","payment_mode":"INSTANT_TRANSFER","create_time":"2014-10-20T12:02:24Z","links":[{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P/capture","rel":"capture","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P/void","rel":"void","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/authorization/76V79459UM225560P/reauthorize","rel":"reauthorize","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-1KA56302VE598851HKRCPTUA","rel":"parent_payment","method":"GET"}],"valid_until":"2014-11-18T12:02:24Z","protection_eligibility_type":"ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE","protection_eligibility":"ELIGIBLE"},"links":[{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-1S115631EN580315E-9KH94552VF7913711","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-1S115631EN580315E-9KH94552VF7913711/resend","rel":"resend","method":"POST"}]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=17426',
  'paypal-debug-id': 'cc5ce393a9115',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks-events&CalThreadId=140&TopLevelTxnStartTime=1495910ec70&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 23:22:01 GMT',
  'content-type': 'application/json',
  'content-length': '1620' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/notifications/webhooks-events/abracadabra/resend', {})
  .reply(404, {"name":"INVALID_RESOURCE_ID","details":[],"message":"Resource id is invalid"}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava2.slc.paypal.com;threadId=243',
  'paypal-debug-id': 'f09c558e90a4e',
  server_info: 'webhooksplatformserv:v1.notifications.webhooks-events&CalThreadId=168&TopLevelTxnStartTime=1495910ef60&Host=slcsbwebhooksplatformserv3002.slc.paypal.com&pid=3865',
  'content-language': '*',
  date: 'Tue, 28 Oct 2014 23:22:01 GMT',
  'content-type': 'application/json',
  'content-length': '78' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/notifications/certs/CERT-360caa42-35c2ed1e-21e9a5d6')
  .reply(200, "-----BEGIN CERTIFICATE-----\r\nMIIDhjCCAm6gAwIBAgIEU3E1kDANBgkqhkiG9w0BAQUFADCBhDELMAkGA1UEBhMC\r\nVVMxCzAJBgNVBAgTAkNBMREwDwYDVQQHEwhTYW4gSm9zZTEUMBIGA1UEChMLUGF5\r\nUGFsIEluYy4xFjAUBgNVBAsMDXNhbmRib3hfY2VydHMxJzAlBgNVBAMMHnBheXBh\r\nbF9icmFpbnRyZWVfc2lnbmluZ19BX2tleTAeFw0xNDA1MTIyMDU2NDhaFw0xNjA3\r\nMjAyMDU2NDhaMIGEMQswCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExETAPBgNVBAcT\r\nCFNhbiBKb3NlMRQwEgYDVQQKEwtQYXlQYWwgSW5jLjEWMBQGA1UECwwNc2FuZGJv\r\neF9jZXJ0czEnMCUGA1UEAwwecGF5cGFsX2JyYWludHJlZV9zaWduaW5nX0Ffa2V5\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmryYx9SzJcGcD/1c7y5r\r\nPIKzjgn/zCYcger5fhNk0NsW3swsraqQKHt0MHZ0mllCsvM4V+FdWqxfM6mEZbo+\r\nFLX9Rv8lZX+MjiBgV8r3hKcGr/X8TJFQYrWKaMkVVtx6ZhO9vsCVqnw3wGJOmDd9\r\nbsereC8GklJDIc6SAZ7uavO4CC/oZ2rVSA42OVaHsnLqxp06osLM8quZhMDSySCT\r\nbRll8zeY3/YgTS1cIKDmWvhOXwxyeCXAzvexAJqpLMV72fzPL4LGCW4hj5CvNoX5\r\nHJXGUppd9nXmIGu/y+7jrSWcu7Vt9vuajfVQTKnkPSZBHMJNggyPl+8u8LaE7G19\r\nYQIDAQABMA0GCSqGSIb3DQEBBQUAA4IBAQCCccuImJnWHGSqW8OuSO1cSDAgQaWR\r\nIOFIvvfqcTnv3mTiT97KRvMCUdLHDaz2miyCREBYmrphYsfsiRgDPDTkmaMdAvpa\r\neHgzbKecvHDoB8uRe+erkW/JZmcnp3i9ynwHfuBGS7+OnqrBrfR6mCAAhNX75szZ\r\nzy6HqAcz2y1Vx9aOVQQVTZhXlDVrhiRRapDOhjOV6O7OVal2mJvnWt7edacVMZFp\r\nSKEMp7p3bT9qQuCVT8NFhASpcnvA/c/yOTcDzxuxK6rq/d8u+nuvAfzHAowXgYd4\r\nhPuN6HEhi93SMQKMyLqMOZK7Fa38mrARYGuCQc5s62AO2Vv3LsVvDvKc\r\n-----END CERTIFICATE-----", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=17426',
  'paypal-debug-id': '700a61a959d02',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'unpdeliveryserv:v1.notifications.certs&CalThreadId=134&TopLevelTxnStartTime=149591fe331&Host=slcsbunpdeliveryserv3001.slc.paypal.com&pid=18301',
  date: 'Tue, 28 Oct 2014 23:38:21 GMT',
  'content-type': 'application/x-pem-file',
  'content-length': '1300' });
