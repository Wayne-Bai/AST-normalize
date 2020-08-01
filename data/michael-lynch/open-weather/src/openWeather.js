/*!

Name: Open Weather
Dependencies: jQuery, OpenWeatherMap API
Author: Michael Lynch
Author URL: http://michaelynch.com
Date Created: August 28, 2013
Licensed under the MIT license

*/

;(function($) {

    $.fn.openWeather  = function(options) {
    
    	//return if no element was bound
		//so chained events can continue
		if(!this.length) { 
			return this; 
		}

		//define default parameters
        var defaults = {
        	descriptionTarget: null,
        	maxTemperatureTarget: null,
        	minTemperatureTarget: null,
        	windSpeedTarget: null,
        	humidityTarget: null,
        	sunriseTarget: null,
        	sunsetTarget: null,
        	placeTarget: null,
        	iconTarget: null,
        	customIcons: null,
        	units: 'c',
            city: null,
            lat: null,
            lng: null,
            key: null,
            lang: 'en',
            success: function() {},
            error: function(message) {} 
        }

        //define plugin
        var plugin = this;

        //define element
        var el = $(this);
        
        //api URL
        var apiURL;

        //define settings
        plugin.settings = {}
 
        //merge defaults and options
        plugin.settings = $.extend({}, defaults, options);
        
        //define settings namespace
        var s = plugin.settings;
        
        //define basic api endpoint
        apiURL = 'http://api.openweathermap.org/data/2.5/weather?lang='+s.lang;
        
        //if city isn't null
        if(s.city != null) {
	       
	       //define API url using city (and remove any spaces in city)
	       apiURL += '&q='+s.city.replace(' ', '');
	       
        } else if(s.lat != null && s.lng != null) {
	        
	       //define API url using lat and lng
	       apiURL += '&lat='+s.lat+'&lon='+s.lng;
        }
        
        //if api key was supplied
        if(s.key != null) {
	        
	        //append api key paramater
	        apiURL += '&APPID=' + s.key;
	        
        }
        
        //format time function
    	var formatTime = function(unixTimestamp) {
    		
    		//define milliseconds using unix time stamp
    		var milliseconds = unixTimestamp * 1000;
            
            //create a new date using milliseconds
            var date = new Date(milliseconds);
    		
    		//define hours
    		var hours = date.getHours();
    		
    		//if hours are greater than 12
    		if(hours > 12) {
    		
    			//calculate remaining hours in the day
        		hoursRemaining = 24 - hours;
        		
        		//define hours as the reamining hours subtracted from a 12 hour day
        		hours = 12 - hoursRemaining;
    		}
    		
    		//define minutes
    		var minutes = date.getMinutes();
    		
    		//convert minutes to a string
    		minutes = minutes.toString();
    		
    		//if minutes has less than 2 characters
    		if(minutes.length < 2) {
        		
        		//add a 0 to minutes
        		minutes = 0 + minutes;
    		}
    		
    		//construct time using hours and minutes
    		var time = hours + ':' + minutes;
    		
    		return time;
        }

        $.ajax({
	        type: 'GET',
	        url: apiURL,
	        dataType: 'jsonp',
	        success: function(data) {
	        	
	        	//if units are 'f'
	        	if(s.units == 'f') {
	        	
		        	//define temperature as fahrenheit
		        	var temperature = Math.round(((data.main.temp - 273.15) * 1.8) + 32) + '°F';
		        	
		        	//define min temperature as fahrenheit
		        	var minTemperature = Math.round(((data.main.temp_min - 273.15) * 1.8) + 32) + '°F';
		        	
		        	//define max temperature as fahrenheit
		        	var maxTemperature = Math.round(((data.main.temp_max - 273.15) * 1.8) + 32) + '°F';
	        	
	        	} else {
		        	
		        	//define temperature as celsius
		        	var temperature = Math.round(data.main.temp - 273.15) + '°C';
		        	
		        	//define min temperature as celsius
		        	var minTemperature = Math.round(data.main.temp_min - 273.15) + '°C';
		        	
		        	//define max temperature as celsius
		        	var maxTemperature = Math.round(data.main.temp_max - 273.15) + '°C';
	        	
	        	}
	        	
	        	//set temperature
	        	el.html(temperature);
	        	
	        	//if minTemperatureTarget isn't null
	        	if(s.minTemperatureTarget != null) {
		        	
		        	//set minimum temperature
		        	$(s.minTemperatureTarget).text(minTemperature);
	        	}
	        	
	        	//if maxTemperatureTarget isn't null
	        	if(s.maxTemperatureTarget != null) {
		        	
		        	//set maximum temperature
		        	$(s.maxTemperatureTarget).text(maxTemperature);
	        	}
	        		        	
	        	//set weather description
	        	$(s.descriptionTarget).text(data.weather[0].description);
	        	
	        	//if iconTarget and default weather icon aren't null
			    if(s.iconTarget != null && data.weather[0].icon != null) {
	        	
		        	//if customIcons isn't null
		        	if(s.customIcons != null) {
		        	
		        		//define the default icon name
		        		var defaultIconFileName = data.weather[0].icon;
		        		
		        		var iconName;
		        		
		        		var timeOfDay;
		        		
		        		//if default icon name contains the letter 'd'
		        		if(defaultIconFileName.indexOf('d') != -1) {
			        		
			        		//define time of day as day
			        		timeOfDay = 'day';
			        		
		        		} else {
			        		
			        		//define time of day as night
			        		timeOfDay = 'night';
		        		}
		        		
		        		//if icon is clear sky
		        		if(defaultIconFileName == '01d' || defaultIconFileName == '01n') {
		        		
		        			iconName = 'clear';
			        		
		        		}
		        		
		        		//if icon is clouds
		        		if(defaultIconFileName == '02d' || defaultIconFileName == '02n' || defaultIconFileName == '03d' || defaultIconFileName == '03n' || defaultIconFileName == '04d' || defaultIconFileName == '04n') {
		        		
		        			iconName = 'clouds';
			        		
		        		}
		        		
		        		//if icon is rain
		        		if(defaultIconFileName == '09d' || defaultIconFileName == '09n' || defaultIconFileName == '10d' || defaultIconFileName == '10n') {
		        		
		        			iconName = 'rain';
			        		
		        		}
		        		
		        		//if icon is thunderstorm
		        		if(defaultIconFileName == '11d' || defaultIconFileName == '11n') {
		        		
		        			iconName = 'storm';
			        		
		        		}
		        		
		        		//if icon is snow
		        		if(defaultIconFileName == '13d' || defaultIconFileName == '13n') {
		        		
		        			iconName = 'snow';
			        		
		        		}
		        		
		        		//if icon is mist
		        		if(defaultIconFileName == '50d' || defaultIconFileName == '50n') {
		        		
		        			iconName = 'mist';
			        		
		        		}
		        		
		        		//define custom icon URL
		        		var iconURL = s.customIcons+timeOfDay+'/'+iconName+'.png';
			        	
		        	} else {

		        		//define icon URL using default icon
		        		var iconURL = 'http://openweathermap.org/img/w/'+data.weather[0].icon+'.png';

		        	}
		        	
		        	//set iconTarget src attribute as iconURL
			        $(s.iconTarget).attr('src', iconURL);
		        		
		        }
	        	
	        	//if placeTarget isn't null
	        	if(s.placeTarget != null) {
		        	
		        	//set humidity
		        	$(s.placeTarget).text(data.name + ', ' + data.sys.country);
	        	}
	        	
	        	//if windSpeedTarget isn't null
	        	if(s.windSpeedTarget != null) {
		        	
		        	//set wind speed
		        	$(s.windSpeedTarget).text(Math.round(data.wind.speed) + ' Mps');
	        	}
	        	
	        	//if humidityTarget isn't null
	        	if(s.humidityTarget != null) {
		        	
		        	//set humidity
		        	$(s.humidityTarget).text(data.main.humidity + '%');
	        	}
	        	
	        	//if sunriseTarget isn't null
	        	if(s.sunriseTarget != null) {
	        	
	        		var sunrise = formatTime(data.sys.sunrise);
		        	
		        	//set humidity
		        	$(s.sunriseTarget).text(sunrise + ' AM');
	        	}
	        	
	        	//if sunriseTarget isn't null
	        	if(s.sunsetTarget != null) {
	        	
	        		var sunset = formatTime(data.sys.sunset);
		        	
		        	//set humidity
		        	$(s.sunsetTarget).text(sunset + ' PM');
	        	}
	        	
	        	//run success callback
	        	s.success.call(this);
		        
	        },
	        
	        error: function(jqXHR, textStatus, errorThrown) {
		        
		        //run error callback
		        s.error.call(this, textStatus);
	        }
	        
        });//ajax
        
    }//fn

})(jQuery);