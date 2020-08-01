var request = require('request');
var cheerio = require('cheerio');

module.exports = {

  patterns : [
    'xkcd.com(\/|)$',
    'xkcd.com\/(?<id>[0-9]+)',
  ],

  fetch : function(input, callback) {

    request(input.url, function (error, response, html) {

      if(error || response.statusCode != 200) return callback(null);

      var $ = cheerio.load(html);

      // get the previous comic id
      var prev = parseInt($('a[rel=prev]').first().attr('href').replace('/', ''));
      
      // get the current comic url
      var id  = prev + 1;
      var url = 'http://xkcd.com/' + id;        
      var img = $('#comic img').first();

      var result = {
        title : img.attr('alt'),
        url   : url,
        tags  : ['comic', 'fun', 'nerdstuff'],
        image : img.attr('src')
      };

      callback(result);

    });

  }

}