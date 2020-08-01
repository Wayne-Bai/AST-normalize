var logging = require("../logging");
var helpers = require("../helpers");
var config = require("../config");
var cache = require("../cache");

var human_status = {
  0: "none",
  1: "cached",
  2: "downloaded",
  3: "checked",
  "-1": "error"
};

// GET cape request
module.exports = function(req, res) {
  var start = new Date();
  var userId = (req.url.pathname.split("/")[2] || "").split(".")[0];
  var etag = null;
  var rid = req.id;

  function sendimage(rid, http_status, img_status, image) {
    res.writeHead(http_status, {
      "Content-Type": "image/png",
      "Cache-Control": "max-age=" + config.browser_cache_time + ", public",
      "Response-Time": new Date() - start,
      "X-Storage-Type": human_status[img_status],
      "X-Request-ID": rid,
      "Access-Control-Allow-Origin": "*",
      "Etag": '"' + etag + '"'
    });
    res.end(http_status === 304 ? null : image);
  }

  if (!helpers.id_valid(userId)) {
    res.writeHead(422, {
      "Content-Type": "text/plain",
      "Response-Time": new Date() - start
    });
    res.end("Invalid ID");
    return;
  }

  // strip dashes
  userId = userId.replace(/-/g, "");
  logging.log(rid, "userid:", userId);

  try {
    helpers.get_cape(rid, userId, function(err, status, image, hash) {
      logging.log(rid, "storage type:", human_status[status]);
      if (err) {
        logging.error(rid, err);
        if (err.code === "ENOENT") {
          // no such file
          cache.remove_hash(rid, userId);
        }
      }
      etag = hash && hash.substr(0, 32) || "none";
      var matches = req.headers["if-none-match"] === '"' + etag + '"';
      if (image) {
        var http_status = 200;
        if (err) {
          http_status = 503;
        }
        logging.debug(rid, "etag:", req.headers["if-none-match"]);
        logging.debug(rid, "matches:", matches);
        logging.log(rid, "status:", http_status);
        sendimage(rid, matches ? 304 : http_status, status, image);
      } else if (matches) {
        res.writeHead(304, {
          "Etag": '"' + etag + '"',
          "Response-Time": new Date() - start
        });
        res.end();
      } else {
        res.writeHead(404, {
          "Content-Type": "text/plain",
          "Etag": '"' + etag + '"',
          "Response-Time": new Date() - start
        });
        res.end("404 not found");
      }
    });
  } catch(e) {
    logging.error(rid, "error:" + e.stack);
    res.writeHead(500, {
      "Content-Type": "text/plain",
      "Response-Time": new Date() - start
    });
    res.end("500 server error");
  }
};