/**
 * Scalar    
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0 
 * (the "License"); you may not use this file except in compliance 
 * with the License. You may obtain a copy of the License at
 * 
 * http://www.osedu.org/licenses /ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

/**
 * @projectDescription  Propogate a user's breadcrumbs using HTML5 localStorage
 * @author              Craig Dietrich
 * @version             1.1
 * @requires            $.rdfQuery
 */

/**
 * scalarrecent_log_page()
 * Add the current page to an RDF-JSON object stored in HTML5 localStorage, based on meta variables kept in the <head>
 * If the user is logged in, sends the values to the RDF API then deletes the storage
 * @return null
 */

function scalarrecent_log_page() {

	if (!supports_local_storage()) return;
	
	var prev_string = localStorage.getItem('scalar_user_history');
	var parent = $('link#parent').attr('href'); 
	if (!parent.length) return;

	// If logged in, commit history and return
	// Craig (2012 06 06): for now, deprecating stored history for 80/20 reasons
	/*
	var is_logged_in = ($('link#logged_in').attr('href')) ? true : false; 
	if (is_logged_in && prev_string && prev_string.length) {
		var user_id = parseInt($('link#logged_in').attr('href').substring(($('link#logged_in').attr('href').lastIndexOf('/')+1)));
		$.post(parent+'/rdf/save/user_history/'+user_id, {uri:parent+'users/anonymous',json:prev_string}, function(data) {});		
		localStorage.setItem('scalar_user_history', '');
	}
	if (is_logged_in) return;
    */
   
	// Grab current state or create new 
 
	if (prev_string && prev_string.length) {
		var json = JSON.parse(prev_string);
		var rdf = $.rdf.databank().load(json);
	} else {
		var rdf = $.rdf.databank();
	}

	// Add prefixes (which don't seem to get extracted from the source JSON-RDF)
	
	rdf.prefix('dc', 'http://purl.org/dc/elements/1.1/')
	   .prefix('dcterms', 'http://purl.org/dc/terms/')
	   .prefix('scalar', 'http://scalar.usc.edu/2012/01/scalar-ns#')	
	   .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    
	// Current page values
    
	var uri = document.location.href.split('?')[0];  
	uri = scalarrecent_no_ext(uri);
	uri = scalarrecent_no_version(uri);
	var title = document.title;
	var desc = $("meta[name='Description']").attr('content');		
	var role = $('link#primary_role').attr('href'); 
    var color = $('link#color').attr('href'); 

	// Clear existing (so item is at top of list)
	// There seems to be a bug with rdfQuery where if you try to delete a triple that doesn't exist, it arbitrarily deletes another triple
	// So make sure the URI exists before trying to delete it
	
	var r = $.rdf({ databank: rdf });
	r.where('<'+parent+'users/anonymous> scalar:has_viewed <'+uri+'> .').each(function() {
		rdf.remove('<'+parent+'users/anonymous> scalar:has_viewed <'+uri+'> .'); 
	});
	
	// If more than N in the history, trim the list
	// Remember that the list is in reverse order than intuitive
	
	var max_allowable = 20; // Magic number; note, the view cuts the list off at 10 anyways, but having more will help fill out the sub-tabs
	var $query = r.where('<'+parent+'users/anonymous> scalar:has_viewed ?o .');
	var selected = $query.select();
	if (selected.length > max_allowable) {
		var k = (selected.length - max_allowable);
		for (var j = 0; j < k; j++) {
			// Remove resource from has_viewed list
			var resource = selected[j].o.value;
			rdf.remove('<'+parent+'users/anonymous> scalar:has_viewed <'+resource+'> .');
			// Remove all RDF for the resource
			$query = r.where('<'+resource+'> ?p ?o .');
			var triples = $query.select();
			for (var m in triples) {
				var p = triples[m].p.value;
				var o = triples[m].o.value;
				var o_type = triples[m].o.type;
				if (o_type=='uri') {
					rdf.remove('<'+resource+'> <'+p+'> <'+o+'> .');
				} else {
					rdf.remove('<'+resource+'> <'+p+'> <'+htmlspecialchars(o)+'> .');
				}
			}
		}
	}
	
	// Add current page to history

	rdf.add('<'+parent+'users/anonymous> scalar:has_viewed <'+uri+'> .');
	
	// Add current page RDF
	
	rdf.add('<'+uri+'> dc:title "'+htmlspecialchars(title)+'" .');
	rdf.add('<'+uri+'> dcterms:description "'+htmlspecialchars(desc)+'" .');
	rdf.add('<'+uri+'> rdf:type <'+role+'> .');
	if (color) rdf.add('<'+uri+'> scalar:color "'+color+'" .');

	// Save new state

	try {
		var rdf_string = JSON.stringify(rdf.dump());
		localStorage.setItem('scalar_user_history', rdf_string);
	} catch(err) {
		// Most likely, user is in Safari's private browsing mode
	}     
	
}

/**
 * $.scalarrecent()
 * Create a pulldown list of recent pages based either on the HTML5 localStorage or the RDF API (logged in)
 * @return null
 */

(function($) {

	$.fn.scalarrecent = function(options) {

		return this.each(function() {

			// Page info

			$this = $(this);
			if ($this.data('historyHasLoaded')) return;
			$this.data('historyHasLoaded', true);
			$this.html();
			$this.addClass('history_bar');
			var is_logged_in = false;  // Craig (2012 06 06): for now, deprecating stored history for 80/20 reasons
			var parent = $('link#parent').attr('href');
			var max_to_show = 10;
			
			// Tab bar
			
			var $tabs = scalarrecent_options_bar($this, max_to_show);
	    	
			// Validate locaStorage
	    	
			if (!supports_local_storage()) {
				$this.append('<p>Your browser doesn\'t appear to support <a href="http://dev.w3.org/html5/webstorage/#the-localstorage-attribute">HTML5 local storage</a>.  Please upgrade and try again.</p>');
				return;
			}	    	

			// Loading	
	    	
			$this.append('<p id="loading">Loading ...</p>');

			// Via the RDF API
			
			if (is_logged_in) {
				var user_id = parseInt($('link#logged_in').attr('href').substring(($('link#logged_in').attr('href').lastIndexOf('/')+1)));
				var history_url = parent+'/rdf/user_history/'+user_id+'.json';
				var user_url = $('link#logged_in').attr('href');				
				$.ajax({
					type:"GET",
					url:history_url,
					dataType:"json",
					success:function(json) {
						scalarrecent_rdf_to_html($this, json, user_url, max_to_show);
						scalarrecent_iconify($this, json);	
						scalarrecent_options_bar($this, max_to_show);
						// Lazy load tags and paths
						$.ajax({
							type:"GET",
							url:parent+'/rdf/instancesof/tag.json',
							dataType:"json",
							success:function(json) {	
								scalarrecent_set_typeof($this, json, 'http://scalar.usc.edu/2012/01/scalar-ns#Tag');	
								scalarrecent_iconify($this, json);
								scalarrecent_options_bar($this, max_to_show);								
								$.ajax({
									type:"GET",
									url:parent+'/rdf/instancesof/path.json',
									dataType:"json",
									success:function(json) {	
										scalarrecent_set_typeof($this, json, 'http://scalar.usc.edu/2012/01/scalar-ns#Path');
										scalarrecent_iconify($this, json);
										scalarrecent_options_bar($this, max_to_show);
									}	
								});						
							}	
						});	
						$this.find('#loading').remove();						
					}
				});
				
			// Via HTML5 local storage				
				
			} else {
			    try {
					var prev_string = localStorage.getItem('scalar_user_history');
				} catch(err) {
					// Most likely user is in Safari private browsing mode
				}
				if ('undefined'==typeof(prev_string) || !prev_string || !prev_string.length) {
					$this.append('<br clear="both"><p><small>No history has been logged</small></p>');
				} else {
					var json = JSON.parse(prev_string);
					scalarrecent_rdf_to_html($this, json, parent+'users/anonymous');
					scalarrecent_set_typeof($this, json, 'http://scalar.usc.edu/2012/01/scalar-ns#Tag');
					scalarrecent_set_typeof($this, json, 'http://scalar.usc.edu/2012/01/scalar-ns#Path');
					scalarrecent_iconify($this, json);
					scalarrecent_options_bar($this, max_to_show);
					// $this.append('<p><small>Log in for persistent history</small></p>');
				}
				$this.find('#loading').remove();
			}									

		});	// this.each

	};

})(jQuery);

/**
 * $.scalarrecent_rdf_to_html()
 * Convert RDF-JSON to HTML <li>'s
 * @return null
 */

function scalarrecent_rdf_to_html($this, json, user_url, max_to_show) {

	if (!$this) return;
	if (!json) json = {};
	if (!user_url) user_url = '';			

	if (!json) return $this.append('<p>No history yet</p>');		

	var nodes = json[user_url]['http://scalar.usc.edu/2012/01/scalar-ns#has_viewed'];
	if (nodes.length < 1) return $this.append('<p>No history yet</p>');					

	var $history = $('<ul class="history_content"></ul>');
	$this.append($history);		
					
	var uris = [];
	var count = 1;
	for (var j = (nodes.length-1); j >= 0; j--) {  // reverse order; assume most recent is the current page
		var uri = nodes[j].value;
		if (uris.indexOf(uri)!=-1) continue;
		uris.push(uri);
		if (uri.length==0) continue;
		// Values
		if (!json[uri]) continue;
		var node = json[uri];
		var title = node['http://purl.org/dc/elements/1.1/title'][0]['value'];
		var desc = node['http://purl.org/dc/terms/description'][0]['value'];
		// Classes
		var classes = new Array;
		for (var k in node['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']) {
			classes.push(node['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][k]['value']);
		}
		// Append
		var $li = $('<li id="'+uri+'" title="'+htmlspecialchars(desc)+'"><a href="javascript:;">'+title+'</a></li>');
		if (count > max_to_show) $li.hide();
		$history.append($li);
		for (var k in classes) {
			$li.attr('typeof', ((($li.attr('typeof'))?$li.attr('typeof')+' ':'')+classes[k]) );
		}
		
		// added by Erik Loyer on 7/13/11 for iOS support
		$li.data('uri', uri);
		var clickFunc = function() {
			document.location.href = $(this).data('uri');
		}
		$li.click(clickFunc);
		$li.bind('touchend', clickFunc);

		count++;
	}								

}

/**
 * $.scalarrecent_set_typeof()
 * Set the 'typeof' RDFa attribute on a <li> based on RDF-JSON (ie, a refined set of JSON from a follow-up ajax request)
 * @param rdftype e.g., scalar:Path (expanded to full URI)
 * @return null
 */

function scalarrecent_set_typeof($this, json, rdftype) {

	for (var uri in json) {
		// Find node
		var $node = $this.find("[id='"+uri+"']");
		if ($node.length==0) continue;		
		// Filter by rdf:type
		var match = false;
		for (var row in json[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']) {
			if (rdftype==json[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][row].value) {
				match = true;		
			}
		}
		if (!match) continue;
		// Add typeof attribute
		$node.attr('typeof', rdftype);
	}

}

/**
 * $.scalarrecent_iconify()
 * Add icons to each <li> based on typeof RDFa
 * @return null
 */

function scalarrecent_iconify($this, json) {

	// Add type-specific icons to each LI

	$this.find('.history_content').find('li').each(function() {

		var $li = $(this);
		var anchor = $li.find('a');
		var uri = $li.attr('id');

		$li.find('a').attr('class', '').addClass('inline_icon_link page');
		if (!$li.attr('typeof') || $li.attr('typeof').length==0) return;
		
		// Media
		if ($li.attr('typeof').indexOf('http://scalar.usc.edu/2012/01/scalar-ns#Media') != -1) {
			$li.find('a').attr('class', '').addClass('inline_icon_link media');
		}		
		
		// Tag
		if ($li.attr('typeof').indexOf('http://scalar.usc.edu/2012/01/scalar-ns#Tag') != -1) {
			$li.find('a').attr('class', '').addClass('inline_icon_link tag');
		}
		
		// Path
		if ($li.attr('typeof').indexOf('http://scalar.usc.edu/2012/01/scalar-ns#Path') != -1) {
			var color = null;
			if ('undefined'!=typeof(json[uri])&&'undefined'!=typeof(json[uri]['http://scalar.usc.edu/2012/01/scalar-ns#color'])) {
				color = json[uri]['http://scalar.usc.edu/2012/01/scalar-ns#color'][0].value;
			}
			if (color) {
				$li.find('.path_nav_color').remove();
				$li.find('a').attr('class', '');
				$li.find('a:first').attr('class', null);
				$li.find('a:first').before('<div class="path_nav_color" style="background:'+color+'"></div>');	
			} else {
				$li.find('a').attr('class', '').addClass('inline_icon_link path');
			}		
		}		
		
	});

}

/**
 * $.scalarrecent_options_bar()
 * Creat options bar while checking for existance of certain rdf:types 
 * @return $tabs
 */

function scalarrecent_options_bar($this, max_to_show) {

	var $tabs = $this.find('#history_tabs');

	// Create options
	
	if (!$tabs.length) {
	
		$tabs = $('<ul id="history_tabs"></ul>');
		$this.html($tabs);	
		var tabs = '<span class="downArrow"><li resource="" class="sel all" title="View all recent content">All</li></span>';
		tabs += '<span class="noArrow"><li resource="http://scalar.usc.edu/2012/01/scalar-ns#Composite" title="View recent pages">Pages</li></span>';
		tabs += '<span class="noArrow"><li resource="http://scalar.usc.edu/2012/01/scalar-ns#Media" title="View recent media">Media</li></span>';
		tabs += '<span class="noArrow"><li resource="http://scalar.usc.edu/2012/01/scalar-ns#Path" title="View recent paths">Paths</li></span>';
		tabs += '<span class="noArrow"><li resource="http://scalar.usc.edu/2012/01/scalar-ns#Tag" title="View recent tags">Tags</li></span>';	
		$tabs.html(tabs);	
		
		$tabs.find('li:not(.all)').addClass('disabled');  // Default
	
	} 

	// Active / deactive	
	
	var nodes = $this.find('.history_content').find('li');
	$tabs.find('li').each(function() {
		var $tab = $(this);
		var tab_typeof = $tab.attr('resource');
		if (!tab_typeof.length) return;
		for (var j = 0; j < nodes.length; j++) {
			var $node = $(nodes[j]);
			if ($node.attr('typeof') && $node.attr('typeof').indexOf(tab_typeof)!=-1) {
				$tab.removeClass('disabled');
				return;
			}
		}
		$tab.addClass('disabled');
	});
	
	// Tab click
	
	var tabClickFunc = function() {
		var $option = $(this);
		if ($option.hasClass('disabled')) return;
		var resource = $option.attr('resource');
		var nodes = $this.find('.history_content').find('li');
		if (nodes.length==0) return;
		$tabs.find('li').removeClass('sel');
		$tabs.find('li').parent().removeClass('downArrow');
		$tabs.find('li').parent().addClass('noArrow');
		$option.addClass('sel');
		$option.parent().removeClass('noArrow');
		$option.parent().addClass('downArrow');
		// Filter results by resource URI
		nodes.each(function() {
			var $node = $(this);
			if (resource.length==0) {
				$node.show();
			} else if ($node.attr('typeof') && $node.attr('typeof').indexOf(resource)!=-1) {
				$node.show();
			} else {
				$node.hide();
			}
		});
		// Hide past a certain number in the view
		var count = 1;
		for (var j = 0; j < nodes.length; j++) {
			var $node = $(nodes[j]);
			if ($node.css('display') == 'none') continue;
			if (count > max_to_show) $node.hide();
			count++;
		}
	};
	    	
	// added by Erik Loyer on 7/13/11 for iOS support
	$tabs.find('li').click(tabClickFunc);	
	$tabs.find('li').bind('touchend', tabClickFunc);

	return $tabs;

}

// http://diveintohtml5.org/detect.html
function supports_local_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch(e){
    return false;
  }
}

function scalarrecent_no_ext(uri) {

	if (!uri || uri.length==0) return uri;

	// Always look at the last URI segment
	var array1;
	array1 = uri.split('/');
	var segment = array1[array1.length-1];
	var base = array1.slice(0,(array1.length-1)).join('/');

    array1 = segment.split('.');
    if (1==array1.length) return uri;

    if (!isNaN(array1[array1.length-1])) return uri;  // version number

	var slug = '';
	array1 = array1.slice(0, (array1.length-1));
	slug = array1.join('.');
	
	var uri = base+'/'+slug;
	return uri;

}

function scalarrecent_no_version(uri) {

	if (!uri || uri.length==0) return uri;

	// Always look at the last URI segment
	var array1;
	array1 = uri.split('/');
	var segment = array1[array1.length-1];
	var base = array1.slice(0,(array1.length-1)).join('/');

    array1 = segment.split('.');
    if (1==array1.length) return uri;

    if (isNaN(array1[array1.length-1])) return uri;  // a version number is an integer

	var slug = '';
	array1 = array1.slice(0, (array1.length-1));
	slug = array1.join('.');
	
	var uri = base+'/'+slug;
	return uri;

}
