var request = require('request');

module.exports = {

  patterns : [
    'vimeo.com\/(?<id>[0-9]+)',
    'vimeo.com\/moogaloop.swf\?clip_id=(?<id>[0-9]+)', 
  ],

  fetch : function(input, callback) {

    var url = 'http://vimeo.com/' + input.result.id;
    var api = 'http://vimeo.com/api/v2/video/' + input.result.id + '.json';

    request(api, function (error, response, html) {

      if(error || response.statusCode != 200) return callback(null);

      var json = JSON.parse(html)[0];

      var result = {
        url         : url,
        title       : json.title,
        description : json.description,
        tags        : json.tags.split(','),
        image       : json.thumbnail_large,
        video       : {
          url    : 'http://player.vimeo.com/video/' + input.result.id,
          format : 'iframe'
        }
      };

      callback(result);

    });

  }

}