define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/movie-dialog', 'viewmodels/episode-dialog'], function (router, app, ko, dialog, movieDialog, episodeDialog) {
    var infoDialog = null;
    var objectToShow = null;
    
    var model = {
        pagetype: 'Home',
        currentid: ko.observable(null),
        movies: ko.observableArray(),
        episodes: ko.observableArray(),

        openMovieDetails: function (movie) {
            router.navigate('#home/movie/' + movie.movieid);
        },

        openEpisodeDetails: function (episode) {
            router.navigate('#home/episode/' + episode.episodeid);
        },

        bindingComplete: function () {
            if (infoDialog && objectToShow)
                dialog.show(infoDialog, objectToShow, 'bootstrap');
        },

        activate: function (type, id) {
            /*
             * If no id is found in the requested route, then:
             *      - Close all open dialogs
             */
            if (!id) {
                model.currentid(null);

                // Close any current movie dialogs.
                if (window.currentInfoDialog) {
                    var current = dialog.getDialog(window.currentInfoDialog);
                    if (current)
                        current.close();

                    window.currentInfoDialog = null;
                }

                return;
            }

            /*
             * Else:
             *      - Set the 'current' id
             *      - Create a new dialog instance
             *      - Get the movie/episode details of the current id and type
             *      - Open the dialog
             */

            model.currentid(id);

            var dialogContext = dialog.getContext('bootstrap');
            dialogContext.navigateAfterCloseUrl = '#home';

            if (type === 'movie') {
                infoDialog = new movieDialog();
                objectToShow = { movieid: id };
            } else if (type === 'episode') {
                infoDialog = new episodeDialog();
                objectToShow = { episodeid: id };
            }

            window.currentInfoDialog = infoDialog;
            
            if ($(dialogContext.wrapperElement).length > 0) {
                dialog.show(infoDialog, objectToShow, 'bootstrap');
                infoDialog = objectToShow = null;
            }
        }
    };
    
    /*
     * Get recently added movies and add them to the model.
     */
    var recentMoviesRequest = xbmc.getRequestOptions(xbmc.options.recentMovies()); // Get the default request options.

    $.when($.ajax(recentMoviesRequest)).then(function (recentMoviesResult) {
        ko.utils.arrayPushAll(model.movies, recentMoviesResult.result.movies);

        xbmc.cache.recentmovies = recentMoviesResult.result.movies;
    });

    /*
     * Get recently added episodes and add them to the model.
     */
    var recentEpisodesRequest = xbmc.getRequestOptions(xbmc.options.recentEpisodes()); // Get the default request options.

    $.when($.ajax(recentEpisodesRequest)).then(function (recentEpisodesResult) {
        ko.utils.arrayPushAll(model.episodes, recentEpisodesResult.result.episodes);

        xbmc.cache.recentepisodes = recentEpisodesResult.result.episodes;
    });

    return model;
});