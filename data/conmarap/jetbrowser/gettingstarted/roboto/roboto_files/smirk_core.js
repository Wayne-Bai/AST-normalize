
Smirk = {

	popIndex: 0,	
	smirks: 0,

	// callback from every smirk swf when it is loaded
	smirkIsLoaded: function(domId) {
		
	},

	processingSmirk: function(smirkId) {
		var sid = "smirk-"+smirkId;	
		document.getElementById(sid).processingIcon();	
	},

	finishedSmirk: function(smirkId) {
		document.getElementById("smirk-"+smirkId).getIcon(smirkId);		
		Smirk.updateCurrent(smirkId) 
	},
	
	processingNewSmirk: function(smirkId) {
		
		document.getElementById("smirk-000").processingIcon(); // this fails on a new page
	},

	finishedNewSmirk: function(smirkId) {

	},

	smirkClicked: function(smirkId) {

		$("#iid-display").empty().append("iid is: " + smirkId);

		// show green border on selected icon
		$(".icon").each(function() {	

			var t = $(this).attr("id");
	
			if (t && t != "smirk-"+smirkId) {
				document.getElementById(t).unselect();
			}

		});

		
		document.getElementById("maker-swf").switchMode('edit');
		document.getElementById("maker-swf").getIcon(smirkId);
		$("#btn-new").css({zIndex: "5"}).addClass("inactive").removeClass('cancel');
		$("#smirk-000").remove();
		
		// populate SHARE info
		var embd = '<object width="160" height="160" type="application/x-shockwave-flash" data="/swf/smirk.swf"><param name="allowScriptAccess" value="always"/><param name="flashvars" value="uuid='+smirkUuid+'&loop=1"/><embed src="/swf/smirk.swf" type="application/x-shockwave-flash" width="160" height="160" allowscriptaccess="always" flashvars="uuid='+smirkUuid+'&loop=1"></embed></object>';
		
		$("#icon-embed-code").attr("value", embd);
			
		$.getJSON("/iid_version.php?u="+smirkUuid+"&i="+smirkId, function(j) {
				$("#icon-gif").replaceWith('<img id="icon-gif" src="/images/no-smirk.jpg" width="80" height="80" alt="my icon"/>');
				$("#icon-gif").addClass("uuid-is-"+j.iid);
				
				Smirk.smirkAnimatorStart();
		});
		
		
	},

	updateCurrent: function(newCurrent) {
		
		var oldCurrent = smirkIid;
		var uid = smirkUuid;
		if (newCurrent) {
			
			try { // this will fail on NEW
				$(".current-sm").remove();
				var l = $("#smirk-"+newCurrent).position().left - 19;
				var t = $("#smirk-"+newCurrent).position().top - 21;
				var flag = $("<img src='/images/current-sm.png'>")
					.css({
						position: "absolute",
						top: t,
						left: l,
						width: 110,
						height: 79,
						zIndex: 100
					})
					.addClass("current-sm")
				$("#smirk-"+newCurrent).parent().append(flag);				
			}
			catch(er){
				
			}
			var nc = newCurrent;
			
			$.getJSON("/smirks/update_smirk_jax?iid="+newCurrent, function(d) {
				document.getElementById("maker-swf").getIcon(newCurrent);
				
				$(Smirk.smirks).each(function(i) {
	
					if (this.smirk_mode == newCurrent) {
						smirkIid = newCurrent;
						$("#iid-display").empty().append("iid is: " + newCurrent);
						$("#twit-link").attr('href', 'http://twitter.com/home?status=I\'m feeling ' + this.blerb + ' /' + smirkLogin);
						//$("#icon-gif").attr('src', this.thumb);
					
						//$("#download-frame a:first").attr('href', this.thumb);
						//$("#icon-buddy a:first").attr('href', "aim:BuddyIcon?src=" + this.thumb);
					
						$.getJSON("/iid_version.php?u="+uid+"&i="+newCurrent, function(j) {
							$("#icon-gif").addClass("uuid-is-"+j.iid);
							Smirk.smirkAnimatorStart();
						});
					
					}
						
				});
				
				
				setTimeout(function() {
					try {
						document.getElementById("smirk-" + oldCurrent ).showAsCurrent(false);
					} catch(er){}
					try {
						document.getElementById("smirk-"+nc).showAsCurrent(true);
					} catch(er){}
				}, 500);
				
	
			});
		}
		
	},


	
 	loadEmUp: function() {

		
		
    // render default links, etc to the current selected icon
		var uid = smirkUuid;
		var smirkId = smirkIid;
		// populate SHARE info
		var embd = '<object width="160" height="160" type="application/x-shockwave-flash" data="/swf/smirk.swf"><param name="allowScriptAccess" value="always"/><param name="flashvars" value="uuid='+uid+'&loop=1"/><embed src="/swf/smirk.swf" type="application/x-shockwave-flash" width="160" height="160" allowscriptaccess="always" flashvars="uuid='+uid+'&loop=1"></embed></object>';
		
		$("#icon-embed-code").attr("value", embd);
  
			
	},
	

	nameHunt: function(formElementId) {

		var u = $("#"+formElementId).attr('value');
		$.getJSON("/name_hunter.php?u="+u, function(j) {
			if (j.stat == 'taken') {
			
				alert('Some loser is already using that user name, try another?');
				$("#"+formElementId).focus();
			}	
		});
	
	},
	
	parseNvClasses: function(classValue) {
		var nvPairs = "{";
		var cls = classValue.split(/\s+/);
		$(cls).each(function() {
			if (this.indexOf("-is-") > 0) { // regex?
				var a = this.split("-is-");
				if (nvPairs.length > 1) nvPairs += ",'"+a[0]+"' : '"+a[1]+"'";
				else nvPairs += "'"+a[0]+"' : '"+a[1]+"'";
			}
		});
		nvPairs += "}";
		//alert(nvPairs)
		return eval('('+nvPairs+')');
	},
	
	animating: false,
	
	smirkAnimatorStart: function() {
		
		if (Smirk.animating) {
			clearInterval(Smirk.animating);
			Smirk.animating = false;
		}
		
		// #icon-gif
		//var anim = false;
		var currentFrame = 1;
		var nv = Smirk.parseNvClasses($("#icon-gif").attr("class"));
		
		$("#icon-gif").attr("src", "/vids/"+smirkUuid[0]+smirkUuid[1]+"/"+smirkUuid+"/"+nv.uuid+"1.jpg");
		$("#download-frame").attr('href', "/vids/"+smirkUuid[0]+smirkUuid[1]+"/"+smirkUuid+"/"+nv.uuid+"1.jpg");
		$("#icon-buddy a:first").attr('href', "aim:BuddyIcon?src=/vids/"+smirkUuid[0]+smirkUuid[1]+"/"+smirkUuid+"/"+nv.uuid+"1.jpg");
		
		$("#icon-gif").unbind("mouseover").unbind("mouseout");
		
		$("#icon-gif")
			.bind("mouseover", function() {
				if (Smirk.animating) {
					clearInterval(Smirk.animating);
					Smirk.animating = false;
				}
				var smirkFrames = 21;
				var imageObjects = new Array(); // total frames is 21 for now
				
				//alert(imageObjects.length);
				
				for (var i=0; i<smirkFrames; i++) {
					var imgStub = new Image();
					imgStub.src = "/vids/"+smirkUuid[0]+smirkUuid[1]+"/"+smirkUuid+"/"+nv.uuid+""+(i+1)+".jpg";
					
					imageObjects.push(imgStub);
				}
				
				
				var forwards = true;
				var targetElement = this;
				
				Smirk.animating = setInterval(function() {
					if (currentFrame > smirkFrames) {
					
						currentFrame = smirkFrames - 1;
						forwards = false;
						
					}
					
					else if (currentFrame < 1) {
					
						currentFrame = 2;
						forwards = true;
						
					}
					
					
					$(targetElement).attr("src", imageObjects[currentFrame-1].src);
					$("#download-frame").attr('href', imageObjects[currentFrame-1].src);
					$("#icon-buddy a:first").attr('href', "aim:BuddyIcon?src=" + imageObjects[currentFrame-1].src);
					
					if (forwards)	currentFrame ++;
					else currentFrame --;
				
				}, 130);
			
			})
			.bind("mouseout", function() {
				
				if (Smirk.animating) {
					clearInterval(Smirk.animating);
					Smirk.animating = false;
				}
				
			})
	
	}
	

} // end Smirk



// hook in listeners on password field and other globals

$(function() {
	
	function pwListen() {
		$("#smirk-password")
			.focus(function() {
				$(this).addClass("field-focused");
				if(this.value=='Password') {
					$(this).replaceWith('<input type="password" id="smirk-password" class="field-focused" name="p" value="">');
					$("#smirk-password").focus();
					pwListen();
				}
			})
			.blur(function() {
				
				if(this.value.length < 1) {
					$(this).replaceWith('<input type="text" id="smirk-password" name="p" value="Password">');
					pwListen();
				}
				else {
					$(this).removeClass("field-focused");
				}
				
			});
	}
	
	
	$("#smirk-user")
		.focus(function() {
			$(this).addClass("field-focused");
			if(this.value=='Username') this.value='';
		})
		.blur(function() {
			$(this).removeClass("field-focused");
			if(this.value.length < 1) this.value='Username';
			
		});
	
	pwListen();	
	
	$("#smirk-submit")
		.click(function() {
			$('#smirk-password').attr('value', hex_sha1($('#smirk-password').attr('value')))
		});

});

