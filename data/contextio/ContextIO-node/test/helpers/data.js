exports.data = {
	accounts: {
		listFiltersTest: {
			email: ["AN_EMAIL_ADDRESS", "THE_MATCHING_ACCOUNT_ID"]
		},
		instanceId: "A VALID ACCOUNT ID",
		createParams: {
			email: "jim@bob.com",
			first_name: "Jim",
			last_name: "Bob"
		},
		updateParams: {
			first_name: "Jimmy"
		},
		
		connect_tokens: {
			account_id: "A VALID ACCOUNT_ID ON WHICH TOKENS ARE TESTED"
		},
		
		contacts: {
			account_id: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			email: "AN EMAIL ADDRESS OF AN EXISTING CONTACT IN THE ABOVE ACCOUNT",
			searchTest: {
				search: ["A SEARCH STRING", "THE EMAIL ADDRESS THAT SHOULD BE FOUND BY THAT STRING"]
			}
		},
		
		email_addresses: {
			account_id: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			existing: ["EMAIL ADDRESSES THIS ACCOUNTS ALREADY HAS"],
			createParams: {
				email_address: "jim@bob.com"
			}
		},
		
		files: {
			account_id: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			file_id: 'AN EXISTING FILE_ID IN THE ABOVE ACCOUNT',
			file_id_size: SIZE_OF_FILE_ABOVE_IN_BYTES,
			listFilter: {
				params: {
					file_name: "*.pdf",
					email: "THE EMAIL ADDRESS OF A SENDER/RECEIVER OF MESSAGES WITH PDFs ATTACHED",
					limit: 5
				},
				expectedType: 'application/pdf'
			}
		},
		
		messages: {
			accountId: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			messageId: 'AN EXISTING MESSAGE_ID IN THE ABOVE ACCOUNT',
			create: {
				folder: "FOLDER PATH THE TEST WILL POST A MESSAGE IN",
				emailMessageId: '<4E975E2A.3050905@gmail.com>',
				trashFolder: 'PATH TO TRASH FOLDER TO MOVE THE TEST MESSAGE TO AFTER SUCCESSFUL POST (EG. "[Gmail]/Trash")'
			},
			flags: {
				
			}
		},
		
		sources: {
			accountId: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			label: "VALID SOURCE LABEL ON THE ABOVE ACCOUNT",
			createParams: {
				email: 'A VALID EMAIL ADDRESS',
				server: 'IMAP SERVER FOR THAT EMAIL (EG. imap.gmail.com)',
				username: 'IMAP USERNAME',
				password: 'IMAP PASSWORD',
				use_ssl: 1,
				port: 993,
				type: 'imap',
				service_level: 'basic'
			},
			folderAddAccount: 'ACCOUNT ID ON WHICH FOLDER CREATION WILL BE TESTED ON',
			folderAddSource: 'LABEL OF SOURCE IN ABOVE ACCOUNT FOLDER CREATION WILL BE TESTED ON'
		},
		
		sync: {
			accountId: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			sourceLabel: "VALID SOURCE LABEL ON THE ABOVE ACCOUNT",
		},
		
		threads: {
			accountId: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			gmThreadId: 'A VALID THREAD ID (EG. "gm-134b3b2ee7b668a9")'
		},
		
		webhooks: {
			accountId: "ACCOUNT ID TO TEST THIS RESOURCE ON",
			createParams: {
				callback_url: 'http://foo.com/bar',
				failure_notif_url: 'http://foo.com/bar/failure',
				filter_from: 'jim@bob.com',
				sync_period: '12h'
			}
		}
	},
	connect_tokens: {
		token: "AN EXISTING CONNECT TOKEN",
		createParams: {
			callback_url: "http://context.io/foo",
			service_level: "pro",
			email: "jim@bob.com",
			first_name: "Jim",
			last_name: "Bob"
		}
	},
	oauth_providers: {
		createParams: {
			type: "GMAIL",
			provider_consumer_key: "my.app.com",
			provider_consumer_secret: "xxxaaabbb123"
		},
		fetchCreatedExpectedSecret: "xxx[...]123"
	},
	discovery: {
		paramsGmail: {
			source_type: "IMAP",
			email: "some.test.account@gmail.com"
		},
		paramsUnknown: {
			source_type: "IMAP",
			email: "jim@bob.com"
		}
	}
};