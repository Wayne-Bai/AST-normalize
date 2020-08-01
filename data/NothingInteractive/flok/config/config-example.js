var config = {
    // Default values are if they are not overwritten in the more specific sections below
    default: {
        db: 'mongodb://localhost/flok',
        backendUrl: 'http://localhost:3000/api',
        session: {
            secret: 'add some random string here',
            ttl: 7 * 24 * 3600 // Session lifetime in seconds
        },
        localePath: 'locale/en.json',
        piwik: {
            enable: true,
            url: 'piwik.example.com',
            siteId: 1
        },
        components: {
            time: true,
            activity: false,
            priority: false
        },
        defaultComponent: 'time',

        // List of URLs (relative to /api) and methods that are accessible to everyone
        publicApiUrls: {
            // /api status call
            '': ['GET'],
            // Registering a new user
            '/flok/register': ['POST'],
            // Logging in and out
            '/flok/session': ['POST', 'DELETE']
        }
    },

    // Overwriting config for development
    development: {
        piwik: {
            enable: false,
            url: 'devPiwik.example.com',
            siteId: 2
        },
        components: {
            time: true,
            priority: true,
            activity: true
        }
    },

    // Overwriting config for testing
    test: {
        // Tests will drop the database and modify it, so they should run on a separate database!
        db: 'mongodb://localhost/flok_test'
    },

    // Overwriting config for production
    production: {
        backendUrl: 'https://example.com/api',

        // List of existing API keys
        apiKeys: {
            // Every API key maps to a list of URLs that it allows access to
            'exampleApiKeyhm6CHEMUbfrYkS25V3kbknFf': {
                // Every URL maps to a list of HTTP methods that are allowed for that key
                '/activity': ['POST']
            }
        }
    }
};

module.exports = config;
