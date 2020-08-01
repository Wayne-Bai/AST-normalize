var mongoose = require('mongoose');

var nodeio = require('node.io');
	
/* database modeling */

function validatePresence(value) {
	return value && value.length;
}

function isValidURL(url){
	if (url && url.length) {
	    var RegExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	
	    if(RegExp.test(url)){
	        return true;
	    } else {
	        return false;
	    }
    } else {
    	return false;
    }
}


var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
  
var Link = new Schema({
	owner 	: { type: ObjectId, validate: [validatePresence, 'an owner is required'] }
  , link 	: { type: String, validate: [isValidURL, 'a link is required'] }
  , title	: { type: String, default: '' }
  , read 	: { type: Boolean, default: false }
  , priority: { type: Number, default: 0 }
  , visibility 	: { type: String, default: 'private' }
  , time 	: { type: Date, default: Date.now }
  , readTime: { type: Date, default: Date.now }
  

});

Link.virtual('id')
	.get(function() {
		return this._id.toHexString();
	});
	
Link.virtual('niceTime').get(function(){
	var day = this.time.getDate(),
		month = this.time.getMonth()+1,
		year = this.time.getFullYear(),
		hour = this.time.getHours(),
		min = this.time.getMinutes(),
		meridian = (hour < 12) ? 'am' : 'pm';
	
	hour = hour % 12;
	
	if (hour == 0) {
		hour = 12;
	}
	
	if (hour < 10) {
		hour = '0'+hour;
	}
	if (min < 10) {
		min = '0'+min;
	}
	if (month < 10) {
		month = '0'+month;
	}
	if (day < 10) {
		day = '0'+day;
	}
	
	return month+'/'+day+'/'+year+' '+hour+':'+min+' '+meridian;
});

Link.method('serialize', function() {
    var response = {};
	
	response.id = this.id;
	response.owner = '/api/user/'+this.owner;
	response.url = this.link;
	response.title = this.title;
	response.read = this.read;
	response.priority = this.priority;
	response.created = Math.floor(this.time.getTime()/1000);
	response.readTime = Math.floor(this.readTime.getTime()/1000);
	response.uri = '/api/link/'+this.id;
	response.readLink = '/link/'+this.id;
	
	return response;
});


// Get the title from Node.io
Link.pre('save', true, function(next, done) {
	
	if (this.isNew) {
		var self = this;
		
		var job = new nodeio.Job({
			input: false,
			output: false,
			jsdom: true,
			retries: 1,
			auto_retry: true,
			run: function () {
				this.getHtml(self.link, function(err, $) {
					if (!err) {
						if ($('title')) {
							var title = $('title').fulltext;
							
							self.title = title;
							done();
						} else {
						    done();
						}
					} else {
					    done();
					}
				});
			}
		});
		
		
		// run the job
		job.run();
		next();
		
	} else {
		next();
		done();
	}
});

mongoose.model('Link', Link);


exports.Links = function(db) {
	return db.model('Link');
}