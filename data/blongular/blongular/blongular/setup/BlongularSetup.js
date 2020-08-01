/**
 * Blongular -> BlongularSetup
 *
 * @copyright: Copyright &copy; 2013- Pedro Nasser &reg;
 * @page: http://github.com/blongular/blungular
 * @license: http://github.com/blongular/blongular/blob/master/LICENSE
 */

/**
 * No description yet.
 *
 * @author Pedro Nasser
 */

// Exports
module.exports = {

	/**
	 * Class Extension
	 */
	extend: ['Component'],

	/**
	 * NPM dependencies
	 */
	dependencies: ['bcrypt'],

	/**
	 * PRIVATE
	 */
	private: {

		__dirname: __dirname + '/html/'

	},

	/**
	 * Public Variables
	 */
	public: {},

	/**
	 * Methods
	 */
	methods: {

		/**
		 * Initializer
		 */
		init: function () {
			this.app = this.getParent();

			this.app.prependListener('newRequest', self.checkSetupRedirect);
			this.app.prependListener('readyRequest', self.processSetupRequest);
		},

        /**
         * @desc Check setup forced redirection
         */
        checkSetupRedirect: function (e,req,resp) {

            var denied = req.socket.remoteAddress !== '127.0.0.1';

            if (req.url == '/setup.html' && !self.app.setupMode)
            {
                resp.writeHead(307,{
                    Location: '/'
                });
                resp.end();
            } else if (self.app.setupMode && denied) {
                resp.statusCode = 403;
                resp.end('<h1>403 Fobidden</h1>');
            }
            else
                e.next();
        },

        /**
         * @desc Process Setup POST
         */
        processSetupRequest: function (e,req,resp) {

            if (self.app.setupMode && req.method !== 'POST') {
                resp.writeHead(307,{
                    Location: '/setup.html'
                });
                return resp.end();
            }

            if (self.app.setupMode && req.method === 'POST')
            {
                var fields = req.query.POST.fields;
                var database = self.app.getComponent('database');

                if (_.isObject(fields.blongular) && _.isObject(fields.components))
                {
                    try {

                        fields=self.verifyConfiguration(fields);

                        var blongularJson = self.app.modulePath+'blongular.json';
                        var componentsJson = self.app.modulePath+'components.json';

                        var blongularConfig = JSON.parse(fs.readFileSync(blongularJson));
                        _.merge(blongularConfig,fields.blongular);
                        self.app.setConfig(blongularConfig);

                        var componentsConfig = JSON.parse(fs.readFileSync(componentsJson));
                        _.merge(componentsConfig.components,fields.components);

                        database.setConfig(componentsConfig.components.database);
                        database.dataObject.setConfig(componentsConfig.components.database);

                        var socket = database.dataObject.getConfig('server').socketOptions;
                        socket.host = componentsConfig.components.database.address;
                        socket.port = componentsConfig.components.database.port;

                        fs.writeFileSync(blongularJson,JSON.stringify(blongularConfig,null,'\t'));
                        fs.writeFileSync(componentsJson,JSON.stringify(componentsConfig,null,'\t'));

                    } catch (e) {
                        self.e.exception(e);
                    }

                    database.once('connect',function (e,err) {

                        if (!err)
                        {

                            if (fields.user && _.isString(fields.user.password))
                            {
                                fields.user.createDate = new Date;
                                fields.user.gravatarEmail = fields.user.email;

                                var user = self.app.m.User();
                                user.setAttributes(fields.user);
                                user.$create()
                                .then(function () {

                                })
                                .catch(function (err) {
                                    self.e.exception(err);
                                });
                            }

                            self.app.setupMode=false;

                            resp.writeHead(303,{
                                Location: '/'
                            });
                            return resp.end();
                        }

                        resp.writeHead(303,{
                            Location: '/setup.html#database'
                        });
                        return resp.end();

                    });
                    database.connect();

                } else {
                    resp.writeHead(307,{
                        Location: '/setup.html#error'
                    });
                    return resp.end();
                }
            } else
                e.next();

        },

		/**
		 * Verify and fixes a configuration object
		 */
		verifyConfiguration: function (obj,deep)
		{
			deep = deep || 0;
			if (_.isObject(obj))
			{
				if (deep <= 5)
					for (o in obj)
					{
						obj[o]=self.verifyConfiguration(obj[o],deep+1);
						if (_.isUndefined(obj[o]))
						delete obj[o];
					}

				return obj;
			} else
			{
				if (_.isString(obj) && obj == '')
					return undefined;
				else if (_.isString(obj) && !isNaN(Number(obj)))
					return Number(obj);
				else
					return obj;
			}
		}

	}

};
