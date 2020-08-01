define(function(require, exports, module) {
	"use strict";

	// Load Modules
	var EventEmitter = require('core/EventEmitter');

	// API
	function TimelineEvent(timeline, time, data) {
		var self = this;
		var elem = document.createElement('div');
		elem.className = 'event';

		this.timeline = timeline;
		this.time = time;
		this.triggered = false;
		this.elem = elem;
		this.data = data;
		this.computePosition();

		var deleteElem = document.createElement('div');
		deleteElem.className = 'glyphicon delete';
		elem.appendChild(deleteElem);

		function handleClick(event) {
			event.stopPropagation();
			if (timeline.playing)
				timeline.pause();
			timeline.setPointerPosition((self.pos * timeline.size / 100).toFixed(2));
			timeline.emitEvent('event', self.data);
		}
		
		function handleContextMenu(event) {
			event.stopPropagation();
			event.preventDefault();
			self.highlight();
		}
		
		elem.addEventListener('click', handleClick);
		// elem.addEventListener ('contextmenu', handleContextMenu);	
		elem.addEventListener ('mouseover', handleContextMenu);
		deleteElem.addEventListener('click', function(event) {
			event.stopPropagation();
			timeline.removeEvent(self);
		});

		timeline.timeline.appendChild(elem);
	}
	
	TimelineEvent.prototype.highlight = function highlight() {
		var selected = this.timeline.selectedEvent;
		if (selected) selected.blur();
		this.timeline.selectedEvent = this;
		this.elem.setAttribute('data-selected', '');
	};

	TimelineEvent.prototype.blur = function blur() {
		this.timeline.selectedEvent = null;
		this.elem.removeAttribute('data-selected');
	};
	
	TimelineEvent.prototype.computePosition = function computePosition() {
		if (this.time < 0) this.time = 0;
		if (this.time > this.timeline.duration) this.time = this.timeline.duration;

		this.pos = (this.time / this.timeline.duration) * 100;
		this.elem.style.left = this.pos.toFixed(2) + '%';
	};

	TimelineEvent.prototype.clear = function clear() {
		this.blur();
		this.data = null;
		this.timeline = null;
	};

	TimelineEvent.prototype.setInFuture = function setInFuture() {
		this.triggered = false;
		this.timeline.emitEvent('futureEvent', this.data);
		this.elem.removeAttribute('past');
	};

	TimelineEvent.prototype.setInPast = function setInPast() {
		this.triggered = true;
		this.timeline.emitEvent('pastEvent', this.data);
		this.elem.setAttribute('past', '');
	};

	/**
	 * Timeline 
	 */
	function Timeline(ParentNode) {
		var container = document.createElement('div');
		var fill = document.createElement('div');
		var time_pointer = document.createElement('div');
		var time_info =  document.createElement('div');
		var play_btn = document.createElement('div');

		container.className = 'timeline';
		fill.className = 'fill';
		time_pointer.className = 'time-pointer';
		time_info.className = 'time-info';
		time_info.textContent = '0:00';
		play_btn.className = 'play-btn glyphicon';

		time_pointer.appendChild(time_info);
		container.appendChild(play_btn);
		container.appendChild(fill);
		container.appendChild(time_pointer);
		ParentNode.appendChild(container);

		this.timeline = container;
		this.fill = fill;
		this.time_pointer = time_pointer;
		this.play_btn = play_btn;
		this.time_info = time_info;

		this.tpos = 0;
		this.startDate = new Date();
		this.currentTime = 0;
		this.prevTime = 0;
		this.size = 0;
		this.layout = null;
		this.duration = 60;
		this.playing = false;
		this.interrupted = false;

		this.events = [];
		this.prevEventID = -1;
		this.triggerEvents = true;
		this.selectedEvent = null;

		this.advance = this.advance.bind(this);
		this.pause = this.pause.bind(this);
		this.play = this.play.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);

		this.computeLayout();
		this.setEvents();
	}
	
	Timeline.prototype = Object.create(EventEmitter.prototype);

	Timeline.prototype.setTimeFrame = function setTimeFrame(duration) {
		this.duration = duration;
		for (var i=0; i<this.events.length; i++) {
			this.events[i].computePosition();
		}
	};
	
	Timeline.prototype.setCurrentTime = function setCurrentTime(time) {
		this.prevTime = this.currentTime;   
		if (time < 0) time = 0;
		if (time >= this.duration) {
			this.pause();
			time = this.duration;
		}
		this.currentTime = time;
		this.updatePointerPosition();
		this.updateTimeInfo();
		this.emitEvent('timeUpdate', this.currentTime);
		this.updateEvents();
	};

	Timeline.prototype.computeLayout = function computeLayout() {
		this.box = this.timeline.getBoundingClientRect();
		this.size = this.box.right - this.box.left;
		this.layout = true;
		this.setCurrentTime(this.currentTime);
	};

	Timeline.prototype.updateTimeInfo = function updateTimeInfo() {
		var seconds = ((this.currentTime % 60) | 0);
		var minutes = ((this.currentTime / 60) | 0);
		if (seconds < 10)
			seconds = '0' + seconds;
		this.time_info.textContent = minutes + ':' + seconds;
	};
	
	Timeline.prototype.updatePointerPosition = function updatePointerPosition() {
		var pos = (this.currentTime / this.duration) * this.size;
		var apos = this.currentTime / this.duration * 100;
		this.tpos = pos;
		this.time_pointer.style.left = apos + '%';
		this.fill.style.width = apos + '%';
	};

	Timeline.prototype.setPointerPosition = function setPointerPosition(pos) {
		this.tpos = pos;
		var time = (pos/this.size * this.duration);
		this.setCurrentTime(time);
	};
	

	/*
	 * Timeline Events
	 */

	Timeline.prototype.addEvent = function addEvent(startTime, Data) {
		var event = new TimelineEvent(this, startTime, Data);
		this.events.push(event);
		this.sortEvents();
	};
	
	Timeline.prototype.removeEvent = function removeEvent(event) {
		event.clear();
		var index = this.events.indexOf(event);
		this.events.splice(index, 1);
		this.timeline.removeChild(event.elem);
		if (this.prevEventID === index)
			this.prevEventID = -1;
		if (this.prevEventID > index)
			this.prevEventID--;
	};

	Timeline.prototype.clearEvents = function clearEvents() {
		for (var i=0; i<this.events.length; i++)
			this.timeline.removeChild(this.events[i].elem);
		this.events = [];
		this.prevEventID = -1;		
	};

	Timeline.prototype.logEvents = function logEvents() {
		var s = '';
		this.events.forEach(function(event) {
			s += (event.triggered ? '1' : '0') + ' ';
		});
		console.log('EVENTS', s);
	};

	Timeline.prototype.sortEvents = function sortEvents() {
		this.events.sort(function(a, b) {
			return a.time - b.time;
		});
	};

	Timeline.prototype.updateEvents = function updateEvents() {
		if (this.prevTime === this.currentTime)
			return;

		var len = this.events.length;
		if (len === 0)
			return;
		
		// Instant return if between events
		var nextEventID = this.prevEventID + 1;
		if (nextEventID < len) {
			if (this.events[nextEventID].time > this.currentTime) {
				if (this.prevEventID === -1 || this.events[this.prevEventID].time < this.currentTime)
					return;
			}
		}
		else {
			if (this.prevEventID >=0 && this.currentTime > this.events[this.prevEventID].time)
				return;			
		}
		
		var lastEvent = null;
		this.setEmitEvent(false);

		if (this.prevTime < this.currentTime) {
			for (var i = this.prevEventID + 1; i < len; i++) {
				if (this.events[i].time > this.currentTime)
					break;
					
				this.events[i].setInPast();
				this.prevEventID = i;
				lastEvent = this.events[i]; 
			}
		}
		else {
			for (var i = this.prevEventID; i >= 0; i--) {
				if (this.events[i].time <= this.currentTime)
					break;

				this.events[i].setInFuture();
				this.prevEventID = i - 1;
				lastEvent = this.events[i]; 
			}
		}

		this.setEmitEvent(true);
		if (lastEvent)
			this.prevTime < this.currentTime ? lastEvent.setInPast() : lastEvent.setInFuture();
	};

	Timeline.prototype.setEmitEvent = function setEmitEvent(value) {
		this.triggerEvents = value;
	};
	
	Timeline.prototype.emitEvent = function emitEvent(name, data) {
		if (this.triggerEvents)
			this.emit(name, data);
	};

	Timeline.prototype.setEvents = function setEvents() {
		this.timeline.addEventListener('click', this.handleClick.bind(this));
		this.timeline.addEventListener ('contextmenu', function(event) {
			event.preventDefault();
		});		
		this.play_btn.addEventListener('click', function(e) {
			this.playing ? this.pause(e) : this.play(e);
		}.bind(this));
		this.time_pointer.addEventListener('mousedown', this.handleMouseDown);
		window.addEventListener('resize', this.computeLayout.bind(this));
	};

	// Hold last event index and track when the next one is met
	Timeline.prototype.advance = function advance() {
		var diff = new Date() - this.startDate;
		this.setCurrentTime(this.startTime + diff / 1000);
	};

	Timeline.prototype.play = function play(e) {
		if (e) e.stopPropagation();
		if (this.playing) return;
		if (this.currentTime === this.duration) return;

		this.interrupted = false;
		this.startDate = new Date();
		this.startTime = this.currentTime;
		this.playing = setInterval(this.advance, 100);
		
		this.play_btn.setAttribute('playing', '');
		this.emit('play');
	};
	
	Timeline.prototype.interrupt = function interrupt() {
		if (!this.playing) return;
		this.interrupted = true;
		this.pause();
	};

	Timeline.prototype.resume = function resume() {
		if (!this.interrupted) return;
		setTimeout(this.play, 200);
	};

	Timeline.prototype.pause = function pause(e) {
		if (e) e.stopPropagation();
		if (!this.playing) return;
		
		clearInterval(this.playing);
		this.playing = false;
		this.play_btn.removeAttribute('playing');
		this.emit('pause');
	};

	Timeline.prototype.handleClick = function handleClick(e) {
		this.interrupt();
		var delta = e.clientX - this.box.left;
		this.setPointerPosition(delta);
		this.resume();
	};

	Timeline.prototype.handleMouseMove = function handleMouseMove(e) {
		var posX = e.clientX - this.startX;
		this.setPointerPosition(posX);
	};

	Timeline.prototype.handleMouseDown = function handleMouseDown(e) {
		this.interrupt();
		this.startX = e.clientX - this.tpos;
		document.addEventListener('mousemove', this.handleMouseMove);
		document.addEventListener('mouseup', this.handleMouseUp);
		this.removeTransitions();
	};

	Timeline.prototype.handleMouseUp = function handleMouseUp() {
		document.removeEventListener('mousemove', this.handleMouseMove);
		document.removeEventListener('mouseup', this.handleMouseUp);
		this.resume(); 
		this.addTransitions();
	};

	Timeline.prototype.addTransitions = function addTransitions() {
		this.fill.style.transition = 'all 0.2s linear';
		this.time_pointer.style.transition = 'all 0.2s linear';
	};

	Timeline.prototype.removeTransitions = function removeTransitions() {
		this.fill.style.transition = 'none';
		this.time_pointer.style.transition = 'none';
	};

	// Public API
	return Timeline;
});
