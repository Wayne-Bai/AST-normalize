// WebRTC wrappers
var getUserMedia = require('getusermedia');
var attachMediaStream = require('attachmediastream');
var webrtcSupport = require('webrtcsupport');
var PeerConnection = require('rtcpeerconnection');

function AV(transport, remoteVideo, localVideo) {
	this.stream = null;
	this.transport = transport;
	this.peerConfig = {
		iceServers: [{
			"url": "stun:stun.l.google.com:19302"
		}]
	};
	this.peerConstraints = {};
	this.remoteVideo = remoteVideo;
	this.localVideo = localVideo;

	this.pcIn = null;
	this.pcOut = {};
}

AV.prototype = {
	onRTCMessage: function(data) {
		var self = this;

		if (data.type === 'offer') {
			if (!self.pcIn) return;

			self.pcIn.handleOffer(data.offer, function(err) {
				console.log('Handle offer');
				if (err) return;

				self.pcIn.answer(function(err, answer) {
					if (!err) {
						self.transport.send('rtcMessage', {
							to: data.from,
							type: 'answer',
							videoIn: true,
							answer: answer
						});
					}
				});
			});
		} else if (data.type === 'answer') {
			if (!this.pcOut[data.from]) return;

			this.pcOut[data.from].handleAnswer(data.answer);
		} else if (data.type === 'ice') {
			if (!data.videoIn) {
				if (!self.pcIn) return;

				self.pcIn.processIce(data.candidate);
			} else {
				if (!this.pcOut[data.from]) return;

				this.pcOut[data.from].processIce(data.candidate);
			}
		}
	},

	share: function(includeAudio, includeVideo, cb) {
		var self = this;

		if (this.stream) {
			this.stream.stop();
		}

		getUserMedia({
			video: includeVideo,
			audio: includeAudio
		}, function (err, stream) {
			if (err) {
				var errStr = 'Your browser does not support WebRTC (get Chrome)';
				if(err.name === 'PermissionDeniedError') {
					errStr = 'You browser is blocking access to the camera and/or ' +
							 'microphone (did you deny access earlier?)';
				}
				cb(errStr);
			} else {
				self.stream = stream;

				// Show a local video stream
				if (includeVideo) {
					attachMediaStream(self.stream, document.getElementById(self.localVideo), {
						muted: true,
						mirror: true
					});
				}

				self.transport.send('shareVideo', {
					includeVideo: includeVideo,
					includeAudio: includeAudio
				});
				cb(null);
			}
		});
	},

	unshare: function() {
		if (this.stream) {
			this.stream.stop();
			this.transport.send('unshareVideo', {});
			self.stream = null;
		}
	},

	mute: function(isMuted) {
		if (this.stream) {
			this.stream.getAudioTracks()[0].enabled = !isMuted;
			this.transport.send('shareVideo', {
				includeVideo: true,
				includeAudio: !isMuted
			});
		}
	},

	muteSub: function(isMuted) {
		if (this.pcIn) {
			document.getElementById(this.remoteVideo).muted = isMuted;
		}
	},

	subscribe: function(clientId, includeAudio, includeVideo, cb) {
		var self = this;

		var pc = new PeerConnection(this.peerConfig);

		if (self.pcIn) {
			self.pcIn.close();
		}
		self.pcIn = pc;

		var msg = {
			to: clientId,
			type: 'subscribe'
		};
		this.transport.send('rtcMessage', msg);

		pc.on('ice', function(candidate) {
			var msg = {
				to: clientId,
				type: 'ice',
				videoIn: true,
				candidate: candidate
			};
			self.transport.send('rtcMessage', msg);
		});

		// Remote stream added
		pc.on('addStream', function(e) {
			console.log('stream added');
			cb(null);
			console.log('Attaching stream');

			var videoEl = attachMediaStream(e.stream, document.getElementById(self.remoteVideo));
		});

		// Remote stream removed
		pc.on('removeStream', function(stream) {
			console.log('stream removed');
			self.pcIn.close();
			self.pcIn = null;
		});

		pc.on('error', function(err) {
			cb(err);
		});
	},

	unsubscribe: function(clientId, cb) {
		if (self.pcIn) {
			self.pcIn.close();
			self.pcIn = null;
		}
		var msg = {
			to: clientId,
			type: 'unsubscribe'
		};
		this.transport.send('rtcMessage', msg);
		cb(null);
	},

	serve: function(clientId) {
		var self = this;

		var pc = new PeerConnection(this.peerConfig);
		self.pcOut[clientId] = pc;
		pc.addStream(self.stream);
		pc.offer(function(err, offer) {
			var msg = {
				to: clientId,
				type: 'offer',
				offer: offer
			};
			self.transport.send('rtcMessage', msg);
		});

		pc.on('ice', function(candidate) {
			console.log('ice candidate');
			var msg = {
				to: clientId,
				type: 'ice',
				videoIn: false,
				candidate: candidate
			};
			self.transport.send('rtcMessage', msg);
		});
	},

	unserve: function(clientId) {
		if (this.pcOut[clientId]) {
			this.pcOut[clientId].close();
			delete this.pcOut[clientId];
		}
	}
};

module.exports = AV;
