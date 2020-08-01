/**
 * GlobalQuran application settings 
 * @author Basit (i@basit.me || http://Basit.me)
 * 
 * Online Quran Project
 * http://GlobalQuran.com/
 *
 * Copyright 2011, imegah.com
 * Simple Public License (Simple-2.0)
 * http://www.opensource.org/licenses/Simple-2.0
 * 
 */

var config = {
	
	/**
	 * set to true if you want to use Quran for offline, make sure you download all the Quran data and all.json file.
	 */
	offline: false,
	
	/**
	 * api settings
	 */
	api: {
		key: '',
		version: '4.0'
	},
	
	/**
	 * saving the current location to the bookmark if bookmark is enabled (true). false for disable
	 */
	bookmark: true,
		
	
	/**
	 * control how url should be displayed or turn it off from here
	 */
	url: { 
		enable: true,
		html5: false,	// html5 replaces hash (!#) with backslashes / 
		
		/**
		 * puts backslash in the url, which can be used for sharing on facebook (lint feature). - requries .htaccess and metaTag plugin, to work properly.
		 * [NOTE] html5 must be set to true, for this to work
		 * 
		 * '/'; 		- adds / slash before the page values
		 * '/subfolder/'; -  if application is in the sub folder
		 * '?page=';	- adds ?page= before the page values - useful, if htaccess is not allowed on server
		 */
		startWith: '/',     // if html5 enabled, then starting url starts with / or subfolder name
		
		/**
		 * 'page'; 		- url page by page navigation
		 * 'ayah'; 		- url ayah by ayah navigation
		 */
		by: 'page'
	},
	
	data: {
		
		enable: true, 
		
		/**
		 * data api url
		 */
		url: 'http://api.globalquran.im/',
		
		/**
		 *  'page';     - Get Quran page by page.
		 *  'surah';    - Get Quran surah by surah.
		 *  'juz';      - Get Quran juz by juz.
		 */
		by: 'page', // surah or page
		
		/**
		 *  pre-caching the data so next page / surah / juz loads quickly.
		 *  
		 *   false;      - disable precache functionality
		 *   true;		- preload by above selected method. if it's page, then preload page, if its surah, then surah.
		 *  'page';     - Get Quran page by page.
		 *  'surah';    - Get Quran surah by surah.
		 *  'juz';      - Get Quran juz by juz.
		 *  'complete'; - Get Quran complete data.
		 */
		preload: 'complete'
	},
	
	player: {
		
		/**
		 * off Toggle the player on and off
		 */
		enable: false,						
		
		/**
		 * swfPath flash player path for non html5 support
		 */
		swfPath: 'http://globalquran.com/img',
		
		/**
		 * audioPath audio data api path
		 */
		audioPath: 'http://audio.globalquran.com/',
		
		/**
		 * preload three different settings for this 
		 * = true;  - two players playing continuesly
		 * = false; - play with one and load with other one
		 * = -1;    - just use only one player to play and load. This does not do preload. good for iphone or ipad
		 */
		preload: true,
		
		/**
		 * autoBitrate pass 'high' or 'low' for audio quality user wants
		 */
		autoBitrate: 'high', // high, low
		
		/**
		 * id player div id
		 */
		id: '#audioPlayer',
		
		/**
		 * id2 second player div id
		 */
		id2: '#audioPlayer2',
	},
	
	/**
	 * googleAnalyticsID google analytics id for counting visitors on the site and the event they do
	 */
	googleAnalyticsID: ''
		
	
	
	// keyword, url - change/format, player... other config				
};

layout.setConfig(config);		// set configuration
//layout.start();					// start the application