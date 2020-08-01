var request = require('supertest')
  , assert = require('chai').assert
  , mongoose = require('mongoose')
  , app = require('../app');

describe('GET /video and friends ::  ', function() {
    var id, video, notDogeVideo, dogeVideos;

    video = {
        title: 'Teach-Me-How-To-Doge',
        description: 'Teach me how to doge, teach me teach me how to doge...',
        path: 'some/path/to/file',
        duration: '00:03:01',
        type: 'video/x-m4v',
        category: 'doge'

    };

    notDogeVideo = {
        title: 'Something-That-Isnt-Doge-Therefore-Less-Important',
        description: 'You won\'t learn how to doge here...',
        path: 'some/stupid/path',
        duration: '00:00:00',
        type: 'video/x-m4v',
        category: 'notDoge'
    };

    dogeVideos = [video, notDogeVideo];

    beforeEach(function(done) {
        mongoose.connection.collections['videos'].drop(function(err, docs) {
            mongoose.connection.collections['videos'].insert(dogeVideos, function(err, docs) {
                id = docs[0]._id;
                done();
            });
        });
    });

    describe('when requesting resource /video', function() {
        it('should return an array of videos', function(done) {
            request(app)
                .get('/api/video')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        return done(err);
                    }

                    var result = JSON.parse(res.text)[0];

                    for(var key in video) {
                        if(video.hasOwnProperty(key)) {
                            assert.equal(result[key], video[key]);
                        }
                    }

                    done();
                });


        });
    });

    describe('when requesting resource /video/category', function() {
        it('should return an array of videos that match category', function(done) {

            var categories = ['doge', 'notDoge'];
            request(app)
                .get('/api/video/category')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        return done(err);
                    }

                    var result = JSON.parse(res.text);

                    assert.equal(JSON.stringify(categories), JSON.stringify(result));

                    done();
                });
        });
    });

    describe('when requesting resource /video/category/:category', function() {
        it('should return an array of videos that match that category', function(done) {
            request(app)
                .get('/api/video/category/doge')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        return done(err);
                    }

                    var result = JSON.parse(res.text)[0];

                    assert.equal(result._id, id);
                    assert.equal(result.category, video.category);

                    done();
                });
        });
    });

    describe('when requesting resource /video/title/:title', function() {
        it('should return a single video that matches title', function(done) {
            request(app)
                .get('/api/video/title/Teach-Me-How-To-Doge')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        return done(err);
                    }

                    var result = JSON.parse(res.text);

                    assert.ok(result);
                    assert.equal(result.title, video.title);

                    done();
                });
        });
    });
});

describe('PUT /video :: ', function() {
    var putVideo;

    putVideo = {
        title: 'New-Doge-Hotness',
        description: 'All about dat doge!',
        duration: '00:01:00',
        category: 'dansudansudansu'
    };

    describe('when putting a new resource /video/title/:title', function() {
        it('should insert the the video meta-data into the database', function(done) {

            var title = 'New-Doge-Hotness';
            var getTitle = '/api/video/title/' + title;
            var videoName = 'sampleContent/TOC_053013_398.m4v';
            var fileName = title + '.m4v';


            request(app)
                .get(getTitle)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    var result = JSON.parse(res.text);

                    assert.equal(JSON.stringify(result), '{}');
                });

            request(app)
                .put(getTitle)
                .send(putVideo)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res){
                    assert.equal(err, null);
                });

            request(app)
                .get(getTitle)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        return done(err);
                    }

                    var result = JSON.parse(res.text);

                    assert.ok(result);
                    assert.equal(result.title, putVideo.title);

                    done();
                });
        });
    });
});

describe('PATCH /video :: ', function() {
    var putVideo;

    putVideo = {
        title: 'New-Doge-Hotness',
        description: 'All about dat doge!',
        duration: '00:01:00',
        type: 'video/x-m4v',
        category: 'dansudansudansu'
    };

    describe('when patching a current resource /video/title/:title', function() {
        it('should copy the file blob to the content/ dir', function(done) {
            var title = 'New-Doge-Hotness';
            var getTitle = '/api/video/title/' + title;
            var videoName = 'sampleContent/TOC_053013_398.m4v';
            var fileName = title + '.m4v';

            request(app)
                .patch(getTitle)
                .type('form')
                .attach('file', videoName, fileName)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {

                    if(err) {
                        return done(err);
                    }

                    return done();
                });
        });
    });
});

describe('GET /play :: ', function() {
    var id, video, notDogeVideo, dogeVideos;

    video = {
        title: 'Teach-Me-How-To-Doge',
        description: 'Teach me how to doge, teach me teach me how to doge...',
        path: 'some/path/to/file',
        duration: '00:03:01',
        type: 'video/x-m4v',
        category: 'doge'

    };

    notDogeVideo = {
        title: 'Something-That-Isnt-Doge-Therefore-Less-Important',
        description: 'You won\'t learn how to doge here...',
        path: 'some/stupid/path',
        duration: '00:00:00',
        type: 'video/x-m4v',
        category: 'notDoge'
    };

    dogeVideos = [video, notDogeVideo];

    beforeEach(function(done) {
        mongoose.connection.collections['videos'].drop(function(err, docs) {
            mongoose.connection.collections['videos'].insert(dogeVideos, function(err, docs) {
                id = docs[0]._id;
                done();
            });
        });
    });

    describe('when getting a video using the /play route', function() {
        it('should return video meta-data', function(done) {
            request(app)
                .get('/api/play/title/Teach-Me-How-To-Doge')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        return done(err);
                    }

                    var result = JSON.parse(res.text);

                    assert.ok(result);
                    assert.equal(result.title, video.title);

                    done();
                });
        });
    });
});