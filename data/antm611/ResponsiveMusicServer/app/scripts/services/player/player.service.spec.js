/* jshint -W117, -W030 */
describe('app.services.player.playerService', function() {

    var service,
        $rootScope,
        $q,
        PlaylistFactory,
        sessionService,
        trackManagerService;

    beforeEach(function() {
        module('app.services.player');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            PlaylistFactory = $injector.get('PlaylistFactory');
            sessionService = $injector.get('sessionService');
            trackManagerService = $injector.get('trackManagerService');

            service = $injector.get('playerService', {
                $rootScope: $rootScope,
                $q: $q,
                PlaylistFactory: PlaylistFactory,
                sessionService: sessionService,
                trackManagerService: trackManagerService
            });
        });
    });

    describe('initialisation', function() {
        it('should initialise player variables', function() {
            expect(service.current.track).toBeNull();
            expect(service.current.isPlaying).toBeFalsy();
            expect(service.current.volume).toBe(0.5);
            expect(service.current.position).toBe(0);
        });
    });

    describe('controlHooks.changeTrack', function() {
        var conversionPromise;
        var onSuccess;
        var onErr;

        beforeEach(function() {
            onSuccess = jasmine.createSpy('onSuccess');
            onErr = jasmine.createSpy('onErr');

            spyOn(trackManagerService, 'setupScrobbling');
            spyOn(trackManagerService, 'startConversion').and.callFake(function() {
                conversionPromise = $q.defer();
                return conversionPromise.promise;
            });
            spyOn($rootScope, '$emit');
        });

        it('should emit a blank playNew event if the track argument evaluates to false', function() {
            var onSuccess = jasmine.createSpy('onSuccess');
            service.controlHooks.changeTrack(null).then(onSuccess, onErr);
            $rootScope.$digest();

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.playNew', {src: '', type: ''});
            expect(onSuccess).toHaveBeenCalledWith(undefined);
            expect(onErr).not.toHaveBeenCalled();
        });

        it('should start track conversion if the track argument is set', function() {
            var mockTrack = {ID: 12152};

            service.controlHooks.changeTrack(mockTrack).then(onSuccess, onErr);
            $rootScope.$digest();

            expect(trackManagerService.startConversion).toHaveBeenCalledWith(mockTrack);
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onErr).not.toHaveBeenCalled();
        });

        it('should emit a blank playNew event if the conversion fails', function() {
            var mockTrack = {ID: 12152};

            service.controlHooks.changeTrack(mockTrack).then(onSuccess, onErr);
            conversionPromise.reject();
            $rootScope.$digest();

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.playNew', {src: '', type: ''});
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onErr).toHaveBeenCalledWith(undefined);
        });

        it('should start the track playing and setup scrobbling if the conversion succeeds', function() {
            var mockTrack = {ID: 1, FileName: 'asdf97ug'};
            spyOn(service.controlHooks, 'nextTrack');
            spyOn(sessionService, 'getSession').and.returnValue({Key: 'yyv97vib'});

            service.controlHooks.changeTrack(mockTrack).then(onSuccess, onErr);
            conversionPromise.resolve();
            $rootScope.$digest();

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.playNew', {
                src: '/stream?FileName=asdf97ug&Session=yyv97vib',
                type: 'audio/mp4'
            });
            expect(trackManagerService.setupScrobbling).toHaveBeenCalledWith(mockTrack);
            expect(onSuccess).toHaveBeenCalledWith(undefined);
            expect(onErr).not.toHaveBeenCalled();
        });
    });

    describe('controlHooks.nextTrack', function() {
        var changeTrackDeferred;
        beforeEach(function() {
            changeTrackDeferred = $q.defer();
            spyOn(service.controlHooks, 'changeTrack').and.returnValue(changeTrackDeferred.promise);
            spyOn(service.playlist, 'removeTrack');
        });

        it('should choose the first track from the playlist and not do anything until changeTrack completes', function() {
            service.playlist.addTracks([
                {ID: 1, FileName: 'asdf97ug'},
                {ID: 2, FileName: 2}
            ]);

            service.controlHooks.nextTrack();

            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith({ID: 1, FileName: 'asdf97ug'});
            expect(service.current.track).toBeNull();
            expect(service.playlist.removeTrack).not.toHaveBeenCalled();
        });

        it('should remove the track from the playlist, and set the current track after changeTrack promise succeeds', function() {
            service.playlist.addTracks([
                {ID: 1, FileName: 'asdf97ug'},
                {ID: 2, FileName: 2}
            ]);
            var firstTrack = service.playlist.tracks[0];

            service.controlHooks.nextTrack();
            changeTrackDeferred.resolve();
            $rootScope.$digest();

            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith(firstTrack);
            expect(service.current.track).toBe(firstTrack);
            expect(service.playlist.removeTrack).toHaveBeenCalledWith(firstTrack);
        });

        it('should remove the track from the playlist, and set the current track after changeTrack promise fails', function() {
            service.playlist.addTracks([
                {ID: 1, FileName: 'asdf97ug'},
                {ID: 2, FileName: 2}
            ]);
            var firstTrack = service.playlist.tracks[0];

            service.controlHooks.nextTrack();
            changeTrackDeferred.reject();
            $rootScope.$digest();

            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith(firstTrack);
            expect(service.current.track).toBe(firstTrack);
            expect(service.playlist.removeTrack).toHaveBeenCalledWith(firstTrack);
        });
    });

    describe('controlHooks.previousTrack', function() {
        var changeTrackDeferred;
        beforeEach(function() {
            changeTrackDeferred = $q.defer();
            spyOn(service.controlHooks, 'changeTrack').and.returnValue(changeTrackDeferred.promise);
            spyOn(service.playlist, 'removeTrack');
            spyOn(service.playlist, 'addTrack');
        });

        it('should rewind the current track if it is less than 2 seconds in', function() {
            spyOn(service.controlHooks, 'positionUpdate');
            service.current.track = {Duration: 60};
            service.current.position = 0.25;

            service.controlHooks.previousTrack();

            expect(service.controlHooks.positionUpdate).toHaveBeenCalledWith(0);
        });

        it ('should add track to beginning of playlist and call changeTrack with null if there are no previous tracks', function () {
            service.current.track = {ID: 5, Duration: 60};

            service.controlHooks.previousTrack();

            expect(service.playlist.addTrack).toHaveBeenCalledWith({ID: 5, Duration: 60}, 0);
            expect(service.current.track).toBeNull();
            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith(null);
        });

        it('should choose the previous track if current.track is assigned, and not do anything until changeTrack resolves', function() {
            service.playlist.addTracks([
                {ID: 2, FileName: 2}
            ]);
            service.current.track = {ID: 1, FileName: 1};
            service.controlHooks.nextTrack();
            changeTrackDeferred.resolve();
            $rootScope.$digest();
            expect(service.current.track).toEqual({ID: 2, FileName: 2});

            changeTrackDeferred = $q.defer();
            service.controlHooks.changeTrack.calls.reset();
            service.controlHooks.previousTrack();

            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith({ID: 1, FileName: 1});
            expect(service.current.track).toEqual({ID: 2, FileName: 2});
        });

        it('should choose the previous track if current.track is assigned, and set the current track after changeTrack promise succeeds', function() {
            var firstTrack = {ID: 1, FileName: 1};
            service.playlist.addTracks([
                {ID: 2, FileName: 2}
            ]);
            service.current.track = firstTrack;
            service.controlHooks.nextTrack();
            changeTrackDeferred.resolve();
            $rootScope.$digest();
            expect(service.current.track).toEqual({ID: 2, FileName: 2});

            changeTrackDeferred = $q.defer();
            service.controlHooks.changeTrack.calls.reset();
            service.controlHooks.previousTrack();
            changeTrackDeferred.resolve();
            $rootScope.$digest();

            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith(firstTrack);
            expect(service.current.track).toEqual(firstTrack);
            expect(service.playlist.addTrack).toHaveBeenCalledWith({ID: 2, FileName: 2}, 0);
        });

        it('should choose the previous track if current.track is assigned, and set the current track after changeTrack promise fails', function() {
            var firstTrack = {ID: 1, FileName: 1};
            service.playlist.addTracks([
                {ID: 2, FileName: 2}
            ]);
            service.current.track = firstTrack;
            service.controlHooks.nextTrack();
            changeTrackDeferred.resolve();
            $rootScope.$digest();
            expect(service.current.track).toEqual({ID: 2, FileName: 2});

            changeTrackDeferred = $q.defer();
            service.controlHooks.changeTrack.calls.reset();
            service.controlHooks.previousTrack();
            changeTrackDeferred.reject();
            $rootScope.$digest();

            expect(service.controlHooks.changeTrack).toHaveBeenCalledWith(firstTrack);
            expect(service.current.track).toEqual(firstTrack);
            expect(service.playlist.addTrack).toHaveBeenCalledWith({ID: 2, FileName: 2}, 0);
        });
    });

    describe('controlHooks.togglePause', function() {
        it('should broadcast a playerService.play event if current.isPlaying is false and there is a current track', function() {
            spyOn($rootScope, '$emit');
            service.current.track = {};
            service.current.isPlaying = false;

            service.controlHooks.togglePause();

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.play');
        });

        it('should load the next track if current.isPlaying is false and there is no current track', function() {
            spyOn(service.controlHooks, 'nextTrack');
            service.current.track = null;
            service.current.isPlaying = false;

            service.controlHooks.togglePause();

            expect(service.controlHooks.nextTrack).toHaveBeenCalledWith();
        });

        it('should broadcast a playerService.pause event if current.isPlaying is true', function() {
            spyOn($rootScope, '$emit');
            service.current.isPlaying = true;

            service.controlHooks.togglePause();

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.pause');
        });
    });

    describe('controlHooks.volumeUpdate', function() {
        it('should broadcast a playerService.volumeUpdate event', function() {
            spyOn($rootScope, '$emit');

            service.controlHooks.volumeUpdate(0.3);

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.volumeUpdate', 0.3);
        });
    });

    describe('controlHooks.positionUpdate', function() {
        it('should broadcast a playerService.positionUpdate event', function() {
            spyOn($rootScope, '$emit');

            service.controlHooks.positionUpdate(0.7);

            expect($rootScope.$emit).toHaveBeenCalledWith('playerService.positionUpdate', 0.7);
        });
    });

    describe('audioHooks.play', function() {
        it('should call togglePauseScrobbling on the trackManagerService and set isPlaying to true', function() {
            spyOn(trackManagerService, 'togglePauseScrobbling');
            service.current.isPlaying = false;

            service.audioHooks.play();

            expect(trackManagerService.togglePauseScrobbling).toHaveBeenCalledWith(false);
            expect(service.current.isPlaying).toBe(true);
        });
    });

    describe('audioHooks.pause', function() {
        it('should call togglePauseScrobbling on the trackManagerService and set isPlaying to false', function() {
            spyOn(trackManagerService, 'togglePauseScrobbling');
            service.current.isPlaying = true;

            service.audioHooks.pause();

            expect(trackManagerService.togglePauseScrobbling).toHaveBeenCalledWith(true);
            expect(service.current.isPlaying).toBe(false);
        });
    });

    describe('audioHooks.volumeChange', function() {
        it('should set the current volume', function() {
            service.current.volume = 0;

            service.audioHooks.volumeChange(0.53);

            expect(service.current.volume).toBe(0.53);
        });
    });

    describe('audioHooks.positionChange', function() {
        it('should set the current position', function() {
            service.current.position = 0;

            service.audioHooks.positionChange(0.46);

            expect(service.current.position).toBe(0.46);
        });
    });

    describe('audioHooks.ended', function() {
        it('should call controlHooks.nextTrack', function() {
            spyOn(service.controlHooks, 'nextTrack');

            service.audioHooks.ended();

            expect(service.controlHooks.nextTrack).toHaveBeenCalledWith();
        });
    });

});
