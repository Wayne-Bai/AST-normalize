/* ->
Vastr - the open source faster reading experience
Copyright (C) 2014  J.Schuetz / T.Belkowski

Homepage	:	vastr.de
Version		:	0.4350
Requirement	:	jQuery-1.9.1.js
Request		:	Please don't remove the Vastr-Logo and the link to vastr.de, we want people to know they're using Vastr so they can use it in their own projects.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/agpl-3.0.de.html
<- */

vastr = {
	init : function(a, b){
		this.builder.init();
		this.player.init(a, b);
	},

	trigger : {
		getPosX: function(el){
			return this._findPos(el)[0];
		},

		getPosY: function(el){
			return this._findPos(el)[1];			
		},
		
		_findPos: function(el) {
			var curleft = curtop = 0;
			var obj = document.getElementById(el);
	
			if (obj.offsetParent) {	
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;	
				} while (obj = obj.offsetParent);
			}
			return [curleft,curtop];
		},
		
		controls : function(e){
			if (e.pageX || e.pageY) {
				x = e.pageX - this.getPosX('controls');
				// y = e.pageY;
			}else{
				x = e.clientX - this.getPosX('controls');
				// y = e.clientY;
			}

			if(x >= 0 && x <= 24){
				vastr.player.repeat();
			}else if(x >= 35 && x <= 60){
				vastr.player.play();
			}else if(x >= 74 && x <= 98){
				vastr.player.stop();
			}
		}
	},
	
	builder : {
		init : function(){
			this._build();
			this.canvas.reader.init();
			this.canvas.controls.init();
		},

		canvas : {
			reader : {
				_canvas : 0,
				_context : false,

				init : function(){
					this._canvas();
				},
		
				_canvas : function(){
					this._canvas = document.getElementById('output');		
					this._canvas.setAttribute('width', 720);
					this._canvas.setAttribute('height', 100);

					if(this._canvas.getContext){
						this._context = this._canvas.getContext('2d');
					    
					    this._context.fillStyle = "#3F3F41";
						this._context.fillRect(0, 0, 720, 5);
						this._context.fillRect(0, 95, 720, 5);
		
						this._context.beginPath();
		    			this._context.moveTo(234, 5);
		    			this._context.lineTo(243, 20);
		    			this._context.lineTo(252, 5);
		    			this._context.closePath();
						this._context.fill();
		
						this._context.beginPath();
		    			this._context.moveTo(234, 95);
		    			this._context.lineTo(243, 80);
		    			this._context.lineTo(252, 95);
		    			this._context.closePath();
						this._context.fill();
		
						this._context.font = 'Normal 42px Lucida Console, Monaco, monospace';
						this._context.translate(0.9, 1);
					}
				},

				_update : function(word){
					this._context.clearRect(0, 21, 720, 53);
		
					var x = 0;
		
					marked = vastr.recognizer.getSpaces(5-vastr.recognizer.findChar(word));
					this._context.fillText(marked, 129, 62);
					x += this._context.measureText(marked).width;
		
					marked = word.substring(0, (vastr.recognizer.findChar(word)-1));
					this._context.fillText(marked, 129+x, 62);
					x += this._context.measureText(marked).width;
		
					this._context.fillStyle = "#22ABA6";
					marked = word.substring((vastr.recognizer.findChar(word)-1), vastr.recognizer.findChar(word));
					this._context.fillText(marked, 129+x, 62);
					x += this._context.measureText(marked).width;
		
					this._context.fillStyle = "#3F3F41";
					marked = word.substring(vastr.recognizer.findChar(word), word.length);
					this._context.fillText(marked, 129+x, 62);
				},
			},
			
			controls : {
				_canvas : 0,
				_context : false,
				_data : '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',
		
				init : function(){
					this._canvas();
				},
		
				_canvas : function(){		
					this._canvas = document.getElementById('controls');	
					this._canvas.setAttribute('width', 94);
					this._canvas.setAttribute('height', 27);

					if(this._canvas.getContext){
						this._context = this._canvas.getContext('2d');
		
						this._update(0, 0, 1);
		
						jQuery('#logo').prop('src', 'data:image/png;base64, '+this._data+'');
					}
				},
				
				_update : function(a, b, c){
					this._context.clearRect(0, 0, 94, 27);

					// Repeat Button
				    this._context.fillStyle = (a == 0 ? '#3F3F41' : '#22ABA6');
					this._context.beginPath();
	    			this._context.moveTo(26, 2);
	    			this._context.lineTo(2, 13);
	    			this._context.lineTo(26, 27);
	    			this._context.closePath();
					this._context.fill();
	
					// Play Button
				    this._context.fillStyle = (b == 0 ? '#3F3F41' : '#22ABA6');
					this._context.beginPath();
	    			this._context.moveTo(37, 2);
	    			this._context.lineTo(61, 13);
	    			this._context.lineTo(37, 27);
	    			this._context.closePath();
					this._context.fill();
	
					// Stop Button
				    this._context.fillStyle = (c == 0 ? '#3F3F41' : '#22ABA6');
					this._context.fillRect(75, 2, 5, 25);
					this._context.fillRect(85, 2, 5, 25);
				}
			}
		},
		
		css :  function(){
			jQuery('#vastr .wrapper').css({
				"margin": 		"0 auto",
				"maxWidth": 	"720px",
				"overflow":		"hidden"
			});

			jQuery('#vastr .wrapper .controls').css({
				"textAlign": 	"center",
				"marginTop":	"8px"
			});

			jQuery('#vastr .wrapper .controls img').css({
				"float": 		"right",
				"margin": 		"2px 0",
				"width": 		"80px"
			});
			
			jQuery('#vastr .wrapper .controls canvas').css({
				"marginLeft": 	"-46px"
			});
			
			jQuery('#a944').css({
			    "border": 		"1px solid #CCCCCC",
			    "borderRadius": "4px",
			    "color": 		"#555555",
			    "fontSize": 	"14px",
			    "height": 		"33px",
			    "padding": 		"6px 12px",
			    "width": 		"180px",
			    "float":		"left",
			    "position":		"relative",
			    "zIndex":		"944"
			});

			jQuery('#output').css({
				"width":		"100%"
			});
		},
		
		_build : function(){
			jQuery('#vastr').html(''
				+'<div class="wrapper">'
					+'<canvas id="output"></canvas>'
					+'<div class="controls">'
						+'<select id="a944" onchange="javascript:vastr.player.updateWpm();">'
							+'<option value="250" selected="selected">250 WPM</option>'
							+'<option value="300">300 WPM</option>'
							+'<option value="350">350 WPM</option>'
							+'<option value="400">400 WPM</option>'
							+'<option value="450">450 WPM</option>'
							+'<option value="500">500 WPM</option>'
							+'<option value="550">550 WPM</option>'
							+'<option value="600">600 WPM</option>'
						+'</select>'
						+'<canvas id="controls" onClick="vastr.trigger.controls(event);"></canvas>'
						+'<a href="http://www.vastr.de"><img id="logo" alt="Vastr.de" /></a>'
					+'</div>'
				+'</div>'
			+'');

			this.css();
		}

	},

	recognizer : {
		keyChain : new Array(1,1,2,2,2,2,3,3,3,3,4,4,4),

		findChar : function(word){
			if(word.length <= 12){
				return this.keyChain[word.length];
			}else{
				return 5;				
			}
		},

		markIt : function(word){
			return this.getSpaces(5-this.findChar(word))+''+word;
		},

		getChar : function(word){			
			return word.substring((this.findChar(word)-1), this.findChar(word));
		},
		
		getSpaces : function(count){
			spaces = '';
			
			for(i = 0 ; i != count ; i++){
				spaces = spaces+' ';
			}
			
			return spaces;
		}
	},

	player : {
		_status : 0, _wpm : 250,
		_callback : false,
		_content : '', _element : '',

		init : function(element, callback){
			this._callback = callback;
			this._element = element;

			switch(jQuery(element).prop('tagName')){
				case 'INPUT':
				case 'TEXTAREA':
					this._content = jQuery(element).val();
				break;
				default:
					this._content = jQuery(element).text();
				break;
			}
			this._content = this._content.replace(/[\n\r\t]/g, " ")+" \n";
			
			this._display("Vastr.de");
		},
		
		play : function(){
			if(this._getStatus() == 0){
				this._setStatus(1);
				this._playIt();
			}
		},
		
		stop : function(){
			if(this._getStatus() == 1){
				this._setStatus(2);
			}
		},
		
		repeat : function(){
			this.init(this._element, this._callback);
		},

		updateWpm : function(){
			this._setWpm(parseInt(1000 * 60 / parseInt(jQuery('#a944').val())));
		},

		_getStatus : function(){
			return this._status;
		},
		
		_setStatus : function(status){
			switch(status){
				case 1:
					vastr.builder.canvas.controls._update(0, 1, 0);
				break;
				default:
					vastr.builder.canvas.controls._update(0, 0, 1);
				break;
			}
			
			this._status = status;
		},
		
		_setWpm : function(wpm){
			this._wpm = wpm;
		},

		_getWpm : function(){
			return this._wpm;
		},

		_whiteSpace : function(){
			this._display(" ");
			setTimeout('vastr.player._playIt();', (this._getWpm()*2));
		},
		
		_playIt : function(){
			do{
				var temp = this._content.split(" ");
				this._content = this._content.substring((temp[0].length+1), this._content.length);
			}while((temp[0] == "") && (this._content.length != 0));

			this._display(temp[0]);
				
			if(this._getStatus() == 2){
				this._setStatus(0);
			}else if(this._content.length != 0){
				if(temp[0].indexOf(".") == -1){
					setTimeout('vastr.player._playIt();', this._getWpm());
				}else{
					setTimeout('vastr.player._whiteSpace();', this._getWpm());					
				}
			}else{
				this._setStatus(0);
				this.init(this._element, this._callback);

				if(typeof(this._callback) == 'function'){
					this._callback();
				}
			}
		},
		
		_display : function(word){
			vastr.builder.canvas.reader._update(word);
		}
	}	
};

jQuery(document).ready(function() {
	vastr.init('#vastr-input');
});
