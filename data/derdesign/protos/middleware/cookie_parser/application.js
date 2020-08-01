
/* Cookie Parser » Application extensions */

var app = protos.app,
    Application = protos.lib.application;

/**
  Loads request cookies

  @param {object} req
  @return {object}
  @private
 */

Application.prototype._loadCookies = function(req) {
  if (req.cookies != null) {
    return;
  } else {
    req.cookies = getRequestCookies(req);
    return req.cookies;
  }
}

/**
  Parses the cookie header

  @param {string} str
  @returns {object}
  @private
 */

function parseCookie(str) {
  var obj = {},
    pairs = str.split(/[;,] */);

  for (var pair,eqlIndex,key,val,i=0; i < pairs.length; i++) {
    pair = pairs[i];
    eqlIndex = pair.indexOf('=');
    key = pair.substr(0, eqlIndex).trim().toLowerCase();
    val = pair.substr(++eqlIndex, pair.length).trim();
    if ('"' === val[0]) val = val.slice(1, -1);
    if (obj[key] === undefined) {
      val = val.replace(/\+/g, ' ');
      try {
        obj[key] = decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          obj[key] = val;
        } else {
          throw err;
        }
      }
    }
  }
  return obj;
}

/**
  Parses the request cookies

  @param {object} req
  @returns {object}
  @private
 */

function getRequestCookies(req) {
  if (req.headers.cookie != null) {
    try {
      return parseCookie(req.headers.cookie);
    } catch (e) {
      this.log(req.urlData.pathname, "Error parsing cookie header: " + e.toString());
      return {};
    }
  } else {
    return {};
  }
}
