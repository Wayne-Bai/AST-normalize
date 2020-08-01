/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * An abstraction which contains various pre-set deployment
 * environments and adjusts runtime configuration appropriate for
 * the current environmnet (specified via the NODE_ENV env var)..
 *
 * usage is
 *   exports.configure(app);
 */

const
postprocess = require('postprocess'),
path = require('path'),
urlparse = require('urlparse'),
secrets = require('./secrets'),
temp = require('temp'),
semver = require('semver'),
fs = require('fs'),
convict = require('convict'),
cjson = require('cjson');

// Side effect - Adds default_bid and dev_bid to express.logger formats
require('./logging/custom_logger');

// verify the proper version of node.js is in use
try {
  var required = 'unknown';
  // extract required node version from package.json
  required = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"))).engines.node;
  if (!semver.satisfies(process.version, required)) throw false;
} catch (e) {
  process.stderr.write("update node! verision " + process.version +
                       " is not " + required +
                       (e ? " (" + e + ")" : "") + "\n");
  process.exit(1);
}

var conf = module.exports = convict({
  env: {
    // XXX: should we deprecate this configuration paramater?
    doc: "What environment are we running in?  Note: all hosted environments are 'production'.  ",
    format: ["production", "local", "test_mysql", "test_json"],
    default: 'production',
    env: 'NODE_ENV'
  },
  bind_to: {
    host: {
      doc: "The ip address the server should bind",
      format: String,
      default: '127.0.0.1',
      env: 'IP_ADDRESS'
    },
    port: {
      doc: "The port the server should bind",
      format: 'port',
      default: 0,
      env: 'PORT'
    }
  },
  public_url: {
    doc: "The publically visible URL of the deployment",
    format: String,
    default: 'https://login.persona.org',
    env: 'PUBLIC_URL'
  },
  firefoxos_url: {
    doc: "The publically visible FirefoxOS URL of the deployment",
    format: String,
    default: '',
    env: 'FIREFOXOS_URL'
  },
  public_static_url: {
    doc: "The publically visible URL from which static resources are served",
    format: String,
    default: '',
    env: 'PUBLIC_STATIC_URL'
  },
  public_verifier_url: {
    doc: "The publically visible URL where incoming verification requests are handled",
    format: String,
    default: '',
    env: 'PUBLIC_VERIFIER_URL'
  },
  max_authentication_attempts: {
    doc: "The number of times a user may fail to authenticate before their account is locked",
    format: 'int',
    default: 10,
    env: 'MAX_AUTH_ATTEMPTS'
  },
  scheme: {
    // XXX should we deprecate scheme as it's redundant and derived from 'public_url' ?
    doc: "The scheme of the public URL.  Calculated from the latter.",
    format: String,
    default: 'https:'
  },
  cachify_prefix: {
    doc: "The prefix for cachify hashes in URLs",
    format: String,
    default: 'v'
  },
  use_minified_resources: {
    doc: "Should the server serve minified resources?",
    format: Boolean,
    default: true,
    env: 'MINIFIED'
  },
  var_path: {
    doc: "The path where deployment specific resources will be sought (keys, etc), and logs will be kept.",
    format: String,
    default: path.join(__dirname, "..", "var"),
    env: 'VAR_PATH'
  },
  database: {
    driver: {
      format: ['json', 'mysql'],
      default: 'json'
    },
    user: {
      format: String,
      default: '',
      env: 'MYSQL_USER'
    },
    password: {
      format: String,
      default: '',
      env: 'MYSQL_PASSWORD'
    },
    host: {
      format: String,
      default: ''
    },
    create_schema: {
      format: Boolean,
      default: true
    },
    may_write: {
      format: Boolean,
      default:  true
    },
    name: {
      format: String,
      default: '',
      env: 'DATABASE_NAME'
    },
    max_query_time_ms: {
      format: 'int',
      default: 5000,
      doc: "The maximum amount of time we'll allow a query to run before considering the database to be sick",
      env: 'MAX_QUERY_TIME_MS'
    },
    max_reconnect_attempts: {
      format: 'int',
      default: 1,
      doc: "The maximum number of times we'll attempt to reconnect to the database before failing all outstanding queries"
    }
  },
  smtp: {
    host: {
      format: String,
      default: ''
    },
    user: {
      format: String,
      default: ''
    },
    pass: {
      format: String,
      default: ''
    },
    port: {
      format: 'port',
      default: 25
    }
  },
  statsd: {
    enabled: {
      doc: "enable UDP based statsd reporting",
      format: Boolean,
      default: false,
      env: 'ENABLE_STATSD'
    },
    host: {
      format: String,
      default: ''
    },
    port: {
      format: 'port',
      default: 0
    }
  },
  cef: {
    vendor: {
      format: String,
      default: "Mozilla"
    },
    product: {
      format: String,
      default: "browserid"
    },
    version: {
      format: String,
      default: "0.1"
    },
    syslog_tag: {
      format: String,
      default: 'browserid'
    },
    syslog_host: {
      doc: 'Host where syslog service is listening',
      format: String,
      default: '127.0.0.1',
      env: 'CEF_SYSLOG_HOST'
    },
    syslog_port: {
      doc: 'Port on which syslog service will receive UDP messages',
      format: 'port',
      default: 514,
      env: 'CEF_SYSLOG_PORT'
    }
  },
  kpi: {
    backend_sample_rate: {
      doc: "Float between 0 and 1 inclusive, for the % of user flows that should send back KPI JSON blobs. Example: 0.5 would be 50% traffic.",
      format: Number,
      default: 0.0,
      env: 'KPI_BACKEND_SAMPLE_RATE'
    },
    backend_db_url: {
      doc: "URL of KPiggyBank service to send Key Performance Indicator data to",
      format: String,
      default: 'http://localhost/wsapi/interaction_data',
      env: 'KPI_BACKEND_DB_URL'
    },
    backend_sample_rate_per_agent: {
      doc: "A mapping of User Agent matches that have different rates than standard.",
      format: Object,
      default: {},
      env: 'KPI_SAMPLE_AGENTS' // JSON text, i.e. { "Firefox OS": 0.7 }
    },
    send_metrics: {
      doc: "Should metrics be sent to the KPI data store?",
      format: Boolean,
      default: false,
      env: 'KPI_SEND_METRICS'
    },
    metrics_batch_size: {
      doc: "Metrics to collect before sending a batch",
      format: 'int',
      default: 20
    },
  },
  bcrypt_work_factor: {
    doc: "How expensive should we make password checks (to mitigate brute force attacks) ?  Each increment is 2x the cost.",
    format: 'int', // how important is enforcing '6<= x <=20' ?
    default: 12,
    env: 'BCRYPT_WORK_FACTOR',
  },
  authentication_duration_ms: {
    doc: "How long may a user stay signed?",
    format: 'duration',
    default: 2419200000 // 4 weeks
  },
  idp_offline_grace_period_ms: {
    doc: "How long should an IDP be offline before we fallback to secondary and start issuing certificates for her.",
    format: 'duration',
    default: 432000000 // 5 days
  },
  ephemeral_session_duration_ms: {
    doc: "How long a user on a shared computer shall be authenticated",
    format: 'duration',
    default: 3600000 // 1 hour
  },
  maximum_event_loop_lag: {
    doc: "The maximum number of milliseconds the event loop may be behind before we return 503 responses",
    format: 'duration',
    default: 40
  },
  disable_request_throttling: {
    doc: "Disable 'server too busy' responses when servers are too busy.",
    format: Boolean,
    default: false,
    env: 'DISABLE_REQUEST_THROTTLING'
  },
  certificate_validity_ms: {
    doc: "For how long shall certificates issued by BrowserID be valid?",
    format: 'duration',
    default: 86400000
  },
  max_compute_processes: {
    doc: "How many computation processes will be spun.  Default is good, based on the number of CPU cores on the machine.",
    format: 'int',
    default: 0,
    env: 'MAX_COMPUTE_PROCESSES'
  },
  max_compute_duration: {
    doc: "What is the longest (in seconds) we'll let the user wait before returning a 503?",
    format: 'duration',
    default: 10
  },
  disable_primary_support: {
    doc: "Disables primary support when true",
    format: Boolean,
    default: false
  },
  enable_code_version: {
    doc: "When enabled, will cause a 'code version' to be returned to frontend code in `/wsapi/session_context` calls",
    format: Boolean,
    default: false
  },
  min_time_between_emails_ms: {
    doc: "What is the most frequently we'll allow emails to be sent to the same user?",
    format: 'int',
    default: 60000,
    env: 'MIN_TIME_BETWEEN_EMAILS_MS'
  },
  http_proxy: {
    port: {
      format: 'port',
      default: 0
    },
    host: {
      format: String,
      default: ''
    }
  },
  default_lang: {
    format: String,
    default: "en"
  },
  debug_lang: {
    format: String,
    default: "it-CH"
  },
  supported_languages: {
    doc: "List of languages this deployment should detect and display localized strings.",
    format: Array,
    default: ['en', 'it-CH'],
    env: 'SUPPORTED_LANGUAGES'
  },
  disable_locale_check: {
    doc: "Skip checking for gettext .mo files for supported locales",
    format: Boolean,
    default: false
  },
  translation_directory: {
    doc: "The directory where per-locale .json files containing translations reside",
    format: String,
    default: "resources/static/i18n/",
    env: "TRANSLATION_DIR"
  },
  express_log_format: {
    format: ["default_bid", "dev_bid", "default", "dev", "short", "tiny"],
    default: "default"
  },
  keysigner_url: {
    format: String,
    default: '',
    env: 'KEYSIGNER_URL'
  },
  verifier_url: {
    format: String,
    default: '',
    env: 'VERIFIER_URL'
  },
  dbwriter_url: {
    format: String,
    default: '',
    env: 'DBWRITER_URL'
  },
  browserid_url: {
    format: String,
    default: '',
    env: 'BROWSERID_URL'
  },
  static_url: {
    format: String,
    default: '',
    env: 'STATIC_URL'
  },
  process_type: {
    format: String,
    default: undefined
  },
  email_to_console: {
    default: false
  },
  declaration_of_support_timeout_ms: {
    doc: "The amount of time we wait for a server to respond with a declaration of support, before concluding that they are not a primary. Needs to be shorter than the dialog's time_until_delay param to avoid xhr-delay UI.",
    format: 'duration',
    default: 8000,
    env: 'DECLARATION_OF_SUPPORT_TIMEOUT_MS'
  },
  enable_development_menu: {
    doc: "Whether or not the development menu can be accessed",
    format: Boolean,
    default: false
  },
  proxy_idps: {
    doc: "A mapping of domain names to urls, which maps popular email services to shimmed IDP deployments.",
    format: Object,
    default: {},
    env: 'PROXY_IDPS' // JSON text, i.e. {"yahoo.com":"yahoo.login.persona.org"}
  },
  x_frame_options: {
    doc: "By default, do not allow BrowserID to be embedded in an IFRAME",
    format: String,
    default: "DENY"
  },
  csp: {
    headers: {
      doc: 'The headers used for CSP',
      default: ['Content-Security-Policy']
    },
    policy: {
      doc: "Content-Security-Policy",
      format: Object,
      default: {
        // defaulting to nothing! if you want it, turn it on
        'default-src': ['none'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'connect-src': ['self'],
        'font-src': ['self'],
        'img-src': '*', // to load siteLogos
        'frame-src': '*' // must load provisioning iframes :(
      }
    }
  },
  hsts: {
    maxAge: {
      format: 'duration',
      default: 10886400
    },
    includeSubdomains: {
      format: Boolean,
      default: true
    }
  },
  measure_dom_loading: {
    doc: "Measure the time it takes the DOM to start loading by embedding an inline script in the document HEAD",
    format: Boolean,
    default: false,
    env: 'MEASURE_DOM_LOADING'
  },
  forcible_issuers: {
    doc: "Hostnames which this Persona instance will issue identies for. Used in b2g only.",
    format: Array,
    default: ["fxos.login.persona.org"]
  },
  send_from_address: {
    // XXX: Ideally this would be a live email address and a response to
    // these email addresses would go into a ticketing system (lloyd/skinny)
    doc: "Email address to send verification emails from.",
    format: String,
    default: "Persona <no-reply@persona.org>"
  }
});

// At the time this file is required, we'll determine the "process name" for this proc
// if we can determine what type of process it is (browserid or verifier) based
// on the path, we'll use that, otherwise we'll name it 'ephemeral'.
conf.set('process_type', path.basename(process.argv[1], ".js"));

// the only process which runs in production that may write to the database is dbwriter
if ([ 'browserid', 'router', 'static', 'verifier', 'keysigner' ].indexOf(conf.get('process_type')) !== -1) {
  conf.set('database.may_write', false);
}

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES) {
  var files = process.env.CONFIG_FILES.split(',');
  files.forEach(function(file) {
    var c = cjson.load(file);

    // now support process-specific "overlays".  That is,
    // .browserid.port will override .port for the "browserid" process

    // first try to extract *our* overlay
    var overlay = c[conf.get('process_type')];

    // now remove all overlays from the top level config
    fs.readdirSync(path.join(__dirname, '..', 'bin')).forEach(function(type) {
      delete c[type];
    });

    // load the base config and the overlay in order
    conf.load(c);
    if (overlay) conf.load(overlay);
  });
}


// special handling of HTTP_PROXY env var
if (process.env.HTTP_PROXY) {
  var p = process.env.HTTP_PROXY.split(':');
  conf.set('http_proxy.host', p[0]);
  conf.set('http_proxy.port', p[1]);
}


// set the 'scheme' of the server based on the public_url (which is needed for
// things like
conf.set('scheme', urlparse(conf.get('public_url')).scheme);


// test environments may dictate which database to use.
if (conf.get('env') === 'test_json') {
  conf.set('database.driver', 'json');
} else if (conf.get('env') === 'test_mysql') {
  conf.set('database.driver', 'mysql');
}

// dom measuring uses an inline script, eww
if (conf.get('measure_dom_loading')) {
  var csp = conf.get('csp');
  csp.policy['script-src'].push('unsafe-inline');
  conf.set('csp', csp);
}

// if theres a static url, we need to add that to our policy
if (conf.get('public_static_url')) {
  var _public_static_url = conf.get('public_static_url');
  var csp = conf.get('csp');
  csp.policy['script-src'].push(_public_static_url);
  csp.policy['style-src'].push(_public_static_url);
  conf.set('csp', csp);
}

// if static, verifier, and firefoxos urls are not explicitly set,
// default them to the same as the public url (used in ephemeral
// and local deployments)
if (!conf.get('public_static_url')) {
  conf.set('public_static_url', conf.get('public_url'));
}
if (!conf.get('public_verifier_url')) {
  conf.set('public_verifier_url', conf.get('public_url'));
}
if (!conf.get('firefoxos_url')) {
  conf.set('firefoxos_url', conf.get('public_url'));
}

// augment the cachify prefix with the public_static_url
var prefix = urlparse(conf.get('public_static_url') + "/" + conf.get('cachify_prefix'));
conf.set('cachify_prefix', prefix.normalize().toString());

// validate the configuration based on the above specification
conf.validate();

/*
 * Install middleware that will perform textual replacement on served output
 * to re-write urls as needed for this particular environment.
 *
 * Note, for a 'local' environment, no re-write is needed because this is
 * handled at a higher level.  For other environments, only perform re-writing
 * if the host, port, or scheme are different than https://login.persona.org:443
 * (all source files always should have the production hostname written into them)
 */
module.exports.performSubstitution = function(app) {
  if (conf.get('public_url') !== 'https://login.persona.org' ||
      conf.get('firefoxos_url') !== 'https://firefoxos.persona.org' ||
      conf.get('public_static_url') !== 'https://static.login.persona.org' ||
      conf.get('public_verifier_url') !== 'https://verifier.login.persona.org')
  {
    app.use(postprocess(function(req, buffer) {
      return buffer.toString()
        .replace(new RegExp('https://login.persona.org', 'g'), conf.get('public_url'))
        .replace(new RegExp('https://firefoxos.persona.org', 'g'), conf.get('firefoxos_url'))
        .replace(new RegExp('https://static.login.persona.org', 'g'), conf.get('public_static_url'))
        .replace(new RegExp('https://verifier.login.persona.org', 'g'), conf.get('public_verifier_url'));
    }));
  }
};

// log the process_type
process.nextTick(function() {
  var logging = require("./logging/logging.js").logger;
  logging.info("process type is " + conf.get("process_type"));
});
