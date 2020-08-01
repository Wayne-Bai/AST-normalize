var nock = require('nock');

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015LNNdS165mG.sjhqW9DcrYCNreIY1xAA9h1dFtv7AEBA","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava3.slc.paypal.com;threadId=252',
  'paypal-debug-id': '970e44904349f',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=192716&TopLevelTxnStartTime=148cd44a225&Host=slcsbidensectoken502.slc.paypal.com&pid=29073',
  date: 'Wed, 01 Oct 2014 19:51:40 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/payment-experience/web-profiles/', {"name":"Best Brand Checkout Experience","presentation":{"brand_name":"Best Brand","logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg","locale_code":"US"},"input_fields":{"allow_note":true,"no_shipping":1,"address_override":1},"flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"}})
  .reply(201, {"id":"XP-27NA-MUV6-WRVA-D8W2"}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava2.slc.paypal.com;threadId=255',
  'paypal-debug-id': 'e602ec8f43c8f',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=136&TopLevelTxnStartTime=148cd44a603&Host=slcsbpaymentexperienceserv3002.slc.paypal.com&pid=2702',
  date: 'Wed, 01 Oct 2014 19:51:41 GMT',
  'content-type': 'application/json',
  'content-length': '31' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015ICAVK3BvuHQqffI06dhlLst0yBAiBPreeG4k.kqiOLA","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=190',
  'paypal-debug-id': '9f13aa8b65598',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=1123&TopLevelTxnStartTime=148f084bce6&Host=slcsbidensectoken502.slc.paypal.com&pid=16050',
  date: 'Wed, 08 Oct 2014 16:08:24 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/payment-experience/web-profiles/')
  .reply(200, [{"id":"XP-ZY6W-TUFT-9WBH-F2M3","name":"Best Brand Checkout","flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"},"input_fields":{"allow_note":true,"no_shipping":1,"address_override":1},"presentation":{"brand_name":"Best Brand","logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg","locale_code":"US" }}], { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3001.slc.paypal.com;threadId=226',
  'paypal-debug-id': 'c526c39362e19',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=1270&TopLevelTxnStartTime=148f084c185&Host=slcsbpaymentexperienceserv3002.slc.paypal.com&pid=2702',
  date: 'Wed, 08 Oct 2014 16:08:25 GMT',
  'content-type': 'application/json',
  'transfer-encoding': 'chunked' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A0150a8KAouIrqPJRbre4tg97ljIsKstd5puUxYuSbGj8vw","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=190',
  'paypal-debug-id': '0bdd8600008c2',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=1128&TopLevelTxnStartTime=148f112fc52&Host=slcsbidensectoken502.slc.paypal.com&pid=16050',
  date: 'Wed, 08 Oct 2014 18:43:46 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/payment-experience/web-profiles/XP-3NWU-L5YK-X5EC-6KJM')
  .reply(200, {"id":"XP-3NWU-L5YK-X5EC-6KJM","name":"XP-3NWU-L5YK-X5EC-6KJM","flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"},"input_fields":{"no_shipping":1,"address_override":0},"presentation":{"logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg"}}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=2326',
  'paypal-debug-id': 'f7cbe91f00bca',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=1270&TopLevelTxnStartTime=148f112ff9c&Host=slcsbpaymentexperienceserv3002.slc.paypal.com&pid=2702',
  date: 'Wed, 08 Oct 2014 18:43:46 GMT',
  'content-type': 'application/json',
  'content-length': '317' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015xgztqIFLIwHDfBidPZV6vZjRhAFfeLjIVaGjSws61bM","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=9307',
  'paypal-debug-id': '398c435c4638e',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=1131&TopLevelTxnStartTime=148f1169760&Host=slcsbidensectoken502.slc.paypal.com&pid=16050',
  date: 'Wed, 08 Oct 2014 18:47:42 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/payment-experience/web-profiles/XP-3NWU-L5YK-X5EC-6KJM')
  .reply(200, {"id":"XP-3NWU-L5YK-X5EC-6KJM","name":"XP-3NWU-L5YK-X5EC-6KJM","flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"},"input_fields":{"no_shipping":1,"address_override":0},"presentation":{"logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg"}}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3001.slc.paypal.com;threadId=177',
  'paypal-debug-id': 'dffe037146339',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=1270&TopLevelTxnStartTime=148f1169a30&Host=slcsbpaymentexperienceserv3002.slc.paypal.com&pid=2702',
  date: 'Wed, 08 Oct 2014 18:47:43 GMT',
  'content-type': 'application/json',
  'content-length': '317' });

nock('https://api.sandbox.paypal.com')
  .patch('/v1/payment-experience/web-profiles/XP-3NWU-L5YK-X5EC-6KJM', [{"op":"add","path":"/presentation/brand_name","value":"new_brand_name"}])
  .reply(204, "", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3001.slc.paypal.com;threadId=177',
  'paypal-debug-id': '1751cf3a4611b',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=1270&TopLevelTxnStartTime=148f1169be5&Host=slcsbpaymentexperienceserv3002.slc.paypal.com&pid=2702',
  date: 'Wed, 08 Oct 2014 18:47:43 GMT' });

nock('https://api.sandbox.paypal.com')
  .put('/v1/payment-experience/web-profiles/XP-3NWU-L5YK-X5EC-6KJM', {"name":"XP-3NWU-L5YK-X5EC-6KJM","presentation":{"logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg"},"input_fields":{"no_shipping":1,"address_override":0},"flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"}})
  .reply(204, "", { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava1.slc.paypal.com;threadId=5015',
  'paypal-debug-id': '5285b9234e15c',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=138&TopLevelTxnStartTime=148f1169dd1&Host=slcsbpaymentexperienceserv3001.slc.paypal.com&pid=1191',
  date: 'Wed, 08 Oct 2014 18:47:44 GMT' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015hIZD4i-HjSTLxUR6SleZEFiFHWmECskCUTsFHWH5P2E","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbplatformapiserv3002.slc.paypal.com;threadId=55551',
  'paypal-debug-id': '5bb0b34ac874a',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=89&TopLevelTxnStartTime=148f11e721a&Host=slcsbidensectoken501.slc.paypal.com&pid=19695',
  date: 'Wed, 08 Oct 2014 18:56:17 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .get('/v1/payment-experience/web-profiles/ABRACADABRA')
  .reply(404, {"name":"INVALID_RESOURCE_ID","debug_id":"dc5079d0c084f","message":"The requested resource ID was not found","information_link":"https://developer.paypal.com/webapps/developer/docs/api/","details":[]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava1.slc.paypal.com;threadId=1467',
  'paypal-debug-id': 'dc5079d0c084f',
  pragma: 'No-cache',
  'cache-control': 'no-cache',
  expires: 'Wed, 31 Dec 1969 16:00:00 PST',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=1270&TopLevelTxnStartTime=148f11e7617&Host=slcsbpaymentexperienceserv3002.slc.paypal.com&pid=2702',
  date: 'Wed, 08 Oct 2014 18:56:18 GMT',
  'content-type': 'application/json',
  'content-length': '200' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/oauth2/token', "grant_type=client_credentials")
  .reply(200, {"scope":"https://uri.paypal.com/services/invoicing openid https://api.paypal.com/v1/developer/.* https://api.paypal.com/v1/payments/.* https://api.paypal.com/v1/vault/credit-card/.* https://api.paypal.com/v1/vault/credit-card","access_token":"A015oIInLiogaRCZ7ZP4GDBiipCjvDDsNiFLgtdZrE8428M","token_type":"Bearer","app_id":"APP-2EJ531395M785864S","expires_in":28800}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava4.slc.paypal.com;threadId=127',
  'paypal-debug-id': '61896b01616e1',
  server_info: 'identitysecuretokenserv:v1.oauth2.token&CalThreadId=1131&TopLevelTxnStartTime=148f5754a87&Host=slcsbidensectoken502.slc.paypal.com&pid=16050',
  date: 'Thu, 09 Oct 2014 15:09:38 GMT',
  'content-type': 'application/json',
  'content-length': '367' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/payment-experience/web-profiles/', {"name":"wezsmmtpgb9","presentation":{"brand_name":"Best Brand","logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg","locale_code":"US"},"input_fields":{"allow_note":true,"no_shipping":1,"address_override":1},"flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"}})
  .reply(201, {"id":"XP-AWB9-FLAW-TC3T-ETM3"}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava4.slc.paypal.com;threadId=127',
  'paypal-debug-id': '2c74eecb61070',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=143&TopLevelTxnStartTime=148f5754d3f&Host=slcsbpaymentexperienceserv3001.slc.paypal.com&pid=1191',
  date: 'Thu, 09 Oct 2014 15:09:38 GMT',
  'content-type': 'application/json',
  'content-length': '31' });

nock('https://api.sandbox.paypal.com')
  .post('/v1/payment-experience/web-profiles/', {"name":"wezsmmtpgb9","presentation":{"brand_name":"Best Brand","logo_image":"https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg","locale_code":"US"},"input_fields":{"allow_note":true,"no_shipping":1,"address_override":1},"flow_config":{"landing_page_type":"billing","bank_txn_pending_url":"http://www.yeowza.com"}})
  .reply(400, {"name":"VALIDATION_ERROR","debug_id":"5aa402f67a63b","message":"Invalid request - see details","information_link":"https://developer.paypal.com/webapps/developer/docs/api/","details":[{"field":"name","issue":"A profile with this name already exists"}]}, { server: 'Apache-Coyote/1.1',
  proxy_server_info: 'host=slcsbjava1.slc.paypal.com;threadId=45018',
  'paypal-debug-id': '5aa402f67a63b',
  server_info: 'paymentexperienceserv:v1.payment-experience.web-profiles&CalThreadId=138&TopLevelTxnStartTime=148f5754f2e&Host=slcsbpaymentexperienceserv3001.slc.paypal.com&pid=1191',
  date: 'Thu, 09 Oct 2014 15:09:39 GMT',
  connection: 'close, close',
  'content-type': 'application/json',
  'content-length': '253' });
