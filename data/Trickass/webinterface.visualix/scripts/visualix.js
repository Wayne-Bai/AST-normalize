(function(window) {
    var visualix = {};

    visualix.initCarousel = function() {
        var $background = $('.background');

        var changeBackground = function (fadeDelay, previousIndex) {
            var data = $.merge([], xbmc.cache.recentepisodes);
            data = $.merge(data, xbmc.cache.recentmovies);
            data = $.merge(data, xbmc.cache.allmovies);

            var index = previousIndex;
            while (index === previousIndex) {
                index = Math.floor((Math.random() * (data.length)));
            }

            $background.fadeOut(fadeDelay, function () {
                if (data[index]) {
                    var image = '';
                    if (data[index].art.fanart)
                        image = data[index].art.fanart;
                    else if (data[index].art['tvshow.fanart'])
                        image = data[index].art['tvshow.fanart'];
                    $background.css({ 'background-image': 'url(/image/' + escape(image) + ')' });
                    $background.fadeIn(fadeDelay);
                }
            });

            window.setTimeout(function() {
                changeBackground(1000, index);
            }, 10000);
        };

        changeBackground(0, -1);
    };

    visualix.enforceImageHeight = function (maxHeight) {
        $('.movie-info .image').each(function() {
            var $that = $(this);
            $('img', $that).each(function() {
                var $img = $(this);
                var height = $img.height();

                if (height > maxHeight) {
                    var start = (height - maxHeight) / 2;
                    var end = start + maxHeight;
                    $img.css({ position: 'absolute', clip: 'rect(' + start + 'px auto ' + end + 'px auto)', top: '-' + start + 'px' });
                }
            });

            $that.height(150);
        });
    };

    window.visualix = visualix;
})(window);