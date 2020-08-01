var async = require("async");

var create = function(req, res, conn) {
  var sql = "INSERT INTO file SET ?, " +
    "date_created = NOW(), " +
    "date_modified = NOW()";
  var args = {
    title: "Untitled",
    user_id: req.session.user_id
  };
  conn.query(sql, args, function(err, result) {
    if (err) {
      res.json(404, {error: "fail"});
      return;
    }
    res.json(200, {id: result.insertId});
  });
};

// Get and set labels on file object
var getAndSetLabelsClosure = function(req, res, conn, file) {
  return function(callback) {
    var sql = "SELECT id, title AS name " +
      "FROM file_label AS a " +
      "JOIN label AS b ON " +
      "a.label_id = b.id " +
      "WHERE a.file_id = ?";
    conn.query(sql, [file.id], function(err, rows) {
      if (err) {
        res.json(404, {error: "fail"});
        return;
      }
      // Add labels to file
      file.labels = rows;
      callback(null, file);
    });
  };
};

// Get and set labels on collection of files
var getAndSetAllLabels = function(req, res, conn, files) {
  var labelQueries = [];
  for (var i = 0; i < files.length; i++) {
    labelQueries.push(getAndSetLabelsClosure(req, res, conn, files[i]));
  };
  async.parallel(labelQueries, function(err, results) {
    res.json(200, files);
  });
};

// Query all files
var findAll = function(req, res, conn) {
  var sql = "SELECT * FROM file WHERE user_id = ?";
  conn.query(sql, [req.session.user_id], function(err, rows) {
    if (err) {
      res.json(404, {error: "fail"});
      return;
    }
    getAndSetAllLabels(req, res, conn, rows);
  });
};

// Query files by label
var findByLabel = function(req, res, conn) {
  var sql = "SELECT * FROM file AS a " +
    "JOIN file_label AS b " +
    "ON a.id = b.file_id " +
    "WHERE a.user_id = ? AND b.label_id = ?";
  conn.query(sql, [req.session.user_id, req.query.label_id],
  function(err, rows) {
    if (err) {
      res.json(404, {error: "fail"});
      return;
    }
    getAndSetAllLabels(req, res, conn, rows);
  });
};

// Query files by title
var findByTitle = function(req, res, conn) {
  var sql = "SELECT * FROM file " +
  "WHERE title LIKE ? " +
  "AND user_id = ?";
  var args = [
    "%" + req.query.q + "%",
    req.session.user_id
  ];
  conn.query(sql, args, function(err, rows) {
    if (err) {
      res.json(404, {error: "fail"});
      return;
    }
    res.json(200, rows);
  });
};

// Find file by id
var findById = function(req, res, conn) {
  var sql = "SELECT * FROM file WHERE ? AND ?";
  var args = [
    {id: req.params.id},
    {user_id: req.session.user_id}
  ];
  conn.query(sql, args, function(err, rows) {
    if (err || !rows.length) {
      res.json(404, {error: "fail"});
      return;
    }
    var file = rows[0];
    var closure = getAndSetLabelsClosure(req, res, conn, file);
    closure(function(err, result) {
      if (err) {
        res.json(404, {error: "fail"});
        return;
      }
      res.json(200, result);
    });
  });
};

// Delete file
var remove = function(req, res, conn) {
  var sql = "DELETE FROM file " +
    "WHERE id = ? " +
    "AND user_id = ?";
  var args = [
    req.params.id,
    req.session.user_id
  ];
  conn.query(sql, args, function(err, result) {
    if (err || result.affectedRows < 1) {
      res.json(404, "Failed to delete");
      return;
    }
    res.json(200, "Delete file");
  });
};

// Add labels
var addLabelsClosure = function(req, res, conn, fileId, labels) {
  return function(callback) {
    if (!labels.length) {
      callback(null, false);
      return;
    }
    var bulkInsertData = labels.map(function(val) {
      return [fileId, val];
    });
    var sql = "INSERT INTO file_label (file_id, label_id) VALUES ?";
    conn.query(sql, [bulkInsertData], function(err, result) {
      if (err) {
        connection.rollback(function() {
          throw err;
        });
      }
      callback(null, true);
    });
  };
};

// Delete labels
var removeLabelsClosure = function(req, res, conn, fileId, labels) {
  return function(callback) {
    if (!labels.length) {
      callback(null, false);
      return;
    }
    var sql = "DELETE FROM file_label " +
      "WHERE file_id = ? " +
      "AND label_id IN ?";
    conn.query(sql, [fileId, [labels]], function(err, result) {
      if (err) {
        conn.rollback(function() {
          throw err;
        });
      }
      callback(null, true);
    });
  }
};

// Update file
var update = function(req, res, conn) {
  var fileId = req.body.id;
  var title = req.body.title;
  var content = req.body.content;
  var isPublished = req.body.is_published;
  var addLabels = req.body.add_labels || [];
  var deleteLabels = req.body.delete_labels || [];

  conn.beginTransaction(function(err) {
    if (err) {
      throw err;
    }
    // Update the file
    var sql = "UPDATE file " +
    "SET ? , date_modified = NOW() " +
    "WHERE ? AND ?";
    var args = [
      {
        title: title,
        content: content,
        is_published: isPublished
      },
      {id: fileId},
      {user_id: req.session.user_id}
    ];
    conn.query(sql, args, function(err, result) {
      if (err) {
        conn.rollback(function() {
          throw err;
        });
      }
      // Update file labels
      async.parallel([
        addLabelsClosure(req, res, conn, fileId, addLabels),
        removeLabelsClosure(req, res, conn, fileId, deleteLabels),
      ], function(err, results) {
        conn.commit(function(err) {
          if (err) {
            conn.rollback(function() {
              throw err;
            });
          }
          res.json(200);
        });
      });
    });
  });
};

exports.create = create;
exports.remove = remove;
exports.update = update;
exports.findAll = findAll;
exports.findByLabel = findByLabel;
exports.findByTitle = findByTitle;
exports.findById = findById;
