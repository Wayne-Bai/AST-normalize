/*
   Copyright 2013 Callan Bryant <callan.bryant@gmail.com>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// uses node-feedparser to give 'real time' updates for RSS
// watches the feed, firing *after* each interval in a loop
// This stops hammering the feed when the app is restarted
// for updates or whatever
// TODO: conditional GET (if-modified-since and etag)
// Will have to remember old intervals
// using request object
// https://github.com/danmactough/node-feedparser
var fp = require('feedparser')
//var request = require('request')

// update interval is in seconds
// offset allows multiple queries on the same server without hammering
var watch = function (params) {
	if (!params.url) console.error('No URL given')
	if (!params.callback) params.callback = function() {console.error('Callback needed')}

	// silent: yes, I know parseURL is depreciated. See #15
	var parser = new fp ({silent:true})

	// array of known GUIDs
	var known = []

	var interval = {
		// 2 minute
		min: 120,
		// 1/4 day
		max: 21600,
		// initially set to default value, 1 hour
		current: 3600,
	}

	if (params.interval) interval.current = params.interval

	// offset, to reduce hammering on server restart (updates)
	// and also when checking multiple feeds from the same server
	// spread all initial checks over the first 4 mins
	interval.offset = 240*Math.random()

	// array of pubdates to unix time, used for calculating update interval
	var timestamps = []

	// BACKFILL
	if (params.since)
		var since = new Date(params.since)
	else
		var since = new Date()

	// given articles (etc) see if it's new
	// if so, and it to the public callback
	// also ignore the first batch. Real time only.
	var inspect = function(error,meta,articles) {
		if (error) {
			console.error(params.url,error)
			// try again way later
			setTimeout(function() { parser.parseUrl(params.url,inspect) },interval.max)
			return
		}

		// oldest first is required to publish in correct order
		articles.reverse()

		articles.forEach( function (article,i) {
			var timestamp = (new Date(article.pubdate) ).valueOf()
			// convert to seconds
			timestamp /= 1000
			timestamps.push(timestamp)

			// only keep last 20
			if (timestamps.length > 20)
				timestamps.shift()


			// is this article new? If so, guid is not in known
			// also do not publish articles on first run
			// OR BACKFILL
			if ((timestamp*1000 > since.valueOf() && ! known.length) || known.length && known.indexOf(article.guid) == -1) {
				// better quality non-proxied link
				if (article.origlink) {
					article.link = article.origlink
					delete article.origlink
				}

				if (article.link) {
					if (!article.source.title) {
						var matches = article.link.match(/https?:\/\/(www\.)?(.+?)\./)
						if (matches) article.source.title = matches[2]
					}
					if (!article.source.link) {
						var matches = article.link.match(/.+?\/\/.+?\//)
						if (matches) article.source.link = matches[0]
					}
				}

				params.callback(article)
			}
		})

		// recalculate interval (if interval was not explicitly set)
		if (!params.interval)
			calcInterval(timestamps)

		// GUID GARBAGE COLLECTION, EFFECTIVELY
		// articles which have fallen off the end of the feed stack won't appear again
		// so the old GUIDs may be removed. A simple way is to re-create the known array.
		known = []
		articles.forEach( function (article) {
			known.push(article.guid)
		})

		// FIXME it's a bug with feedparser
		// when upgraded to new API this will be fixed anyway, I hope
		parser = new fp({silent:true})

		// fire at next interval (time may change, so timeout is used rather than interval)
		setTimeout(function() { parser.parseUrl(params.url,inspect) },interval.current*1000)
	}

	// work out the average interval between the given timestamps
	var calcInterval = function(timestamps) {
		var periods = []

		timestamps.forEach(function (d,i) {
			if (timestamps[i+1])
				periods.push(timestamps[i+1] - d)
		})

		// remove potential outliers (just the max)
		periods.sort(function(a,b){return a-b})
		periods.pop()

		// no meaningful information, leave interval as-is
		if (periods.length < 4) return

		// calculate average
		var avg = 0
		periods.forEach(function(i){
			avg +=i
		})
		avg /= periods.length

		if (avg < interval.min) interval.current = interval.min
		if (avg > interval.max) interval.current = interval.max

		if (avg > interval.min && avg < interval.max )
			interval.current = avg
	}

	// initial run at offset
	setTimeout(function() { parser.parseUrl(params.url,inspect) },interval.offset*1000)
}

exports.watch = function(params) {return new watch(params)}

