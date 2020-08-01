
var path = require('path');


exports.version = '0.1.0';


exports.send_success = function (res, data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
};

exports.send_failure = function (res, err) {
    var code = exports.http_code_for_error(err);
    res.writeHead(code, { "Content-Type" : "application/json" });
    res.end(exports.error_for_resp(err) + "\n");
};

exports.error_for_resp = function (err) {
    if (!err instanceof Error) {
        console.error("** Unexpected error type! :"
                      + err.constructor.name);
        return JSON.stringify(err);
    } else {
        return JSON.stringify({ error: err.message,
                                message: err.description });
    }
}

exports.error = function (code, message) {
    var e = new Error(code);
    e.description = message;
    return e;
};

exports.file_error = function (err) {
    err.description = err.message;
    err.message = "file_error";
    return e;
};


exports.is_image = function (filename) {
    switch (path.extname(filename).toLowerCase()) {
      case '.jpg':  case '.jpeg': case '.png':  case '.bmp':
      case '.gif':  case '.tif':  case '.tiff':
        return true;
    }

    return false;
};


exports.invalid_resource = function () {
    return exports.error("invalid_resource",
                         "The requested resource does not exist.");
};


exports.missing_data = function (what) {
    return exports.error("missing_data",
                         "You must include " + what);
}


exports.not_image = function () {
    return exports.error("not_image_file",
                         "The uploaded file must be an image file.");
};


exports.no_such_album = function () {
    return exports.error("no_such_album",
                         "The specified album does not exist");
};


exports.http_code_for_error = function (err) {
    switch (err.message) {
      case "no_such_album": return 403;
      case "invalid_resource": return 404;
      case "invalid_email_address": return 403;
      case 'invalid_album_name': return 403;
      case "no_such_user": return 403;
    }

    console.log("*** Error needs HTTP response code: " + err.message);
    return 503;
}


exports.valid_filename = function (fn) {
    var re = /[^\.a-zA-Z0-9_-]/;
    return typeof fn == 'string' && fn.length > 0 && !(fn.match(re));
};


exports.invalid_email_address = function () {
    return exports.error("invalid_email_address",
                        "That's not a valid email address, sorry");
};

exports.auth_failed = function () {
    return exports.error("auth_failure",
                         "Invalid email address / password combination.");
};