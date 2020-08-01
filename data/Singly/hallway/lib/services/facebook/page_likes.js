/*

 * Copyright (C) 2013, Singly Inc.
 * All rights reserved.
 *
 * Please see the LICENSE file for more information.
 *
 */

var _ = require('underscore');
var fb = require('./lib.js');

exports.sync = function (pi, cbDone) {
  if (!pi.config.since) pi.config.since = 0;

  var resp = {
    data: {},
    config: pi.config
  };

  var arg = {
    accessToken : pi.auth.accessToken
  };
  arg.fql = 'SELECT page_id,created_time FROM page_fan' +
            ' WHERE uid=me() AND created_time > ' + pi.config.since +
            ' ORDER BY created_time ASC' +
            ' LIMIT ' + fb.SMALL_PAGE_SIZE;

  // Get a page of Likes
  fb.getFQL(arg, function (err, likes) {
    if (err || !likes) return cbDone(err);

    var ids = _.pluck(likes, 'page_id');

    // No more data
    if (ids.length === 0) return cbDone();

    var maxTime = _.chain(likes).pluck('created_time').max().value();
    if (maxTime > pi.config.since) resp.config.since = maxTime;

    arg = { accessToken: pi.auth.accessToken };
    var params = { ids: ids.join(',') };

    // Fill in Page data. Don't be misled by the function name; it's generic.
    fb.getPage(fb.apiUrl(arg, '/', params), function(err, pages) {
      if (err) return cbDone(err);

      resp.data['page:' + pi.auth.pid + '/page_likes'] = _.values(pages);
      resp.config.nextRun = -1; // More to do, or we returned earlier

      return cbDone(err, resp);
    });
  });
};

