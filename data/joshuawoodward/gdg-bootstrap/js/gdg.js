var Config = (function(){
    var config = {
		//modify these
		        'name'          : _CHAPTER_NAME_,
		        'id'            : _CHAPTER_ID_,
		        'google_api'    : _API_KEY_,
		        'pwa_id'        : _PICASA_ALBUM_ID, //picasa web album id
        //custom stuff
        'cover_photo'   : true, //best results make sure you have 940x180 image
        'cover_color'   : '#ffffff',
		'theme'			: 'gdg.css', // also available: devgoogle.css
        'custom_albums' : {
                            events : {
                                //'ahNzfmdvb2dsZS1kZXZlbG9wZXJzcg4LEgVFdmVudBib8PsDDA':'5738801490307387457'
                            }
                          }
    }
    return {get : function(a) { return config[a]}}
})();

/**************/
//INIT
$(document).ready(function() {
	$('head').append('<link href="css/'+Config.get('theme')+'" rel="stylesheet"/>');
    changePanel();
    $('#about_sec').show();
    $('#about_nav').addClass('active');
});
$('title').prepend(Config.get('name')+' | ');
$('.brand').html('<strong>'+Config.get('name')+'</strong>');

/*************/


$(window).on('hashchange', function() {
    changePanel();
});

var changePanel = function(){
    var panel = location.hash.substr(1);
    if(panel != ''){
        $('.panel').hide();
        $('.nav li').removeClass('active');
        $('#'+panel+'_sec').show();
        $('#'+panel+'_nav').addClass('active');
    }
}

//join - "I'm a member button"
$('#join_chapter').click(function(){
    var win=window.open('https://developers.google.com/groups/chapter/join/'+Config.get('id'));
    setTimeout(function(){
        win.location.href = 'https://developers.google.com/groups/chapter/'+Config.get('id')+'/';
    },500);
    
});
$('li#googleplus').click(function(){window.open('https://plus.google.com/'+Config.get('id'))});

//google+ page info
$.getJSON('https://www.googleapis.com/plus/v1/people/'+Config.get('id')+'?fields=aboutMe%2Ccover%2CdisplayName%2Cimage%2CplusOneCount&key='+Config.get('google_api'), function(data){
    //about
    $('#about').next().html(data.aboutMe);
    
    //cover photo
    if(data.cover.coverPhoto.url && Config.get('cover_photo')){
        $('#home').css({
            'background':'url('+data.cover.coverPhoto.url+') '+data.cover.coverInfo.leftImageOffset+'px '+(data.cover.coverInfo.topImageOffset)+'px',
            'color' : Config.get('cover_color')
        });
        
    }
    
})

//tie photo album to event
var handleEventPhotos = function(event_id, album_id){
    $.getJSON('https://picasaweb.google.com/data/feed/api/user/'+Config.get('id')+'/albumid/'+album_id+'?alt=json-in-script&callback=?&max-results=12&kind=photo',function(d){
        var tn, p = d.feed.entry;
        for(var x in p){
            tn = '<li class="span2"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=260" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
            $('#'+event_id).append(tn);
        }
    });
}

//gdg dev site events feed
$.getJSON("http://gdgfresno.com/gdgfeed.php?id="+Config.get('id'),function(data){
    var now = new Date();
    for(var i=data.length-1;i>=0;i--){
        var start = new Date(data[i].start);
        
        var format = start.format("longDate")
        format += ' '+start.format("shortTime")
        
        var html = '<div class="media">';
        html+= data[i].iconUrl != undefined ? '<a class="pull-left" href="https://developers.google.com'+data[i].link+'" target="_blank"><img class="media-object" src="https://developers.google.com'+data[i].iconUrl+'"></a>' : '';
        html+='<div class="media-body">' +
                            '<h4 class="media-heading"><a href="https://developers.google.com'+data[i].link+'" target="_blank">'+data[i].title+'</a></h4>' +
                            '<h5>'+data[i].location+'<br/>'+format+'</h5>' +
                            data[i].description +
                        '</div>';   
        
        if(Config.get('custom_albums')){
            var album_id = Config.get('custom_albums').events[data[i].id];
            if( album_id ){
                html+='<div><ul class="thumbnails" id="'+data[i].id+'"></ul></div>';
                handleEventPhotos(data[i].id, album_id);
            }
        }
        
        html +='</div>';
	
        if (start < now){
            $('#past_events').next().next().append(html);
	} else {
            $('#upcoming_events').next().next().prepend(html);
	}
    }
    var past = $('#past_events').next().next().children();
    if(past.length > 5 ){
        $('#past_events').next().next().append('<div id="view_more_events"><a href="#">View More...</a></div>');
    }
    for( var i = past.length-1; i>=5; i--){
        past[i].style.display='none';
    }
    $('#view_more_events').click(function(){
        $('#past_events').next().next().children().slideDown();
        setTimeout(function(){$('#view_more_events').hide();},1)
    });
});

//google+ photos
var pwa = 'https://picasaweb.google.com/data/feed/api/user/'+Config.get('id')+'/albumid/'+Config.get('pwa_id')+'?access=public&alt=json-in-script&kind=photo&max-results=18&fields=entry(title,link/@href,summary,content/@src)&v=2.0&callback=?';
$.getJSON(pwa, function(d){
    var html, p = d.feed.entry, count=0;
    for(var x in p){
        count++;
        if(count == 1){
            html = '<li class="span4"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=460" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
        }else if(count == 14){
            html = '<li class="span4 pull-right"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=460" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
        }else{
            html = '<li class="span2"><a href="'+p[x].link[1].href+'" class="thumbnail" target="_blank"><img src="'+ p[x].content.src + '?sz=260" alt="'+p[x].title.$t+'" title="'+p[x].summary.$t+'"></a></li>'
        }
        $('#photo_container').append(html);
    }
});

//gdg g+ stream for news (reusing code from Roman Nurik for aggregating g+, twitter and friend feed stream into a webpage)
$.getJSON('https://www.googleapis.com/plus/v1/people/' + Config.get('id') + '/activities/public?maxResults=10&key=' +Config.get('google_api'), function(response) {
      if (response.error) {
        rebuildStreamUI([]);
        if (console && console.error) {
          console.error('Error loading Google+ stream.', response.error);
        }
        return;
      }
      
      var entries = [];
      for (var i = 0; i < response.items.length; i++) {
        var item = response.items[i];
        var actor = item.actor || {};
        var object = item.object || {};
        // Normalize tweet to a FriendFeed-like entry.
        var item_title = '<b><a href="' + item.url + '">' + item.title + '</a></b>';
        
        var html = [item_title.replace(new RegExp('\n','g'), '<br />')];
        //html.push(' <b>Read More &raquo;</a>');

        var thumbnails = [];

        var attachments = object.attachments || [];
        for (var j = 0; j < attachments.length; j++) {
          var attachment = attachments[j];
          switch (attachment.objectType) {
            case 'album':
              break;//needs more work
		var upper = attachment.thumbnails.length > 7 ? 7 : attachment.thumbnails.length;
		html.push('<ul class="thumbnails">');
		for(var k=1; k<upper; k++){
		    html.push('<li class="span2"><img src="' + attachment.thumbnails[k].image.url + '" /></li>');
		}
		html.push('</ul>');
	    
            case 'photo':
              thumbnails.push({
                url: attachment.image.url,
                link: attachment.fullImage.url
              });
              break;

            case 'video':
              thumbnails.push({
                url: attachment.image.url,
                link: attachment.url
              });
              break;

            case 'article':
              html.push('<div class="link-attachment"><a href="' +
                  attachment.url + '">' + attachment.displayName + '</a>');
              if (attachment.content) {
                html.push('<br>' + attachment.content + '');
              }
              html.push('</div>');
              break;
          }
        }

        html = html.join('');
        
        var actor_image = actor.image.url;
        actor_image = actor_image.substr(0,actor_image.length-2)+'16';
        
        var entry = {
          via: {
            name: 'Google+',
            url: item.url
          },
          body: html,
          date: item.updated,
          reshares: (object.resharers || {}).totalItems,
          plusones: (object.plusoners || {}).totalItems,
          comments: (object.replies || {}).totalItems,
          thumbnails: thumbnails,
          icon: actor_image
        };

        entries.push(entry);
      }

      rebuildStreamUI(entries);
  });

// To be called once we have stream data
function rebuildStreamUI(entries) {
  entries = entries || [];
  entries.sort(function(x,y){ return y.date - x.date; });
  
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var $entry = $('<li>')
        .addClass(entry.via.name)
        .html(entry.body)
    
    // Entry icon
    $('<img class="icon">')
        .attr('src', entry.icon)
        .appendTo($entry);
    
    // Thumbnails
    if (entry.thumbnails && entry.thumbnails.length) {
      var $thumbs = $('<ul class="thumbnails">').appendTo($entry);
      for (var j = 0; j < entry.thumbnails.length; j++) {
        var thumb = entry.thumbnails[j];
        var $thumb = $('<li>').appendTo($thumbs);
        if (thumb.link)
          $thumb = $('<a>')
              .attr('href', thumb.link)
              .appendTo($thumb);
        $('<img>')
            .attr({
              src: thumb.url/*,
              width: thumb.width,
              height: thumb.height*/
            })
            .appendTo($thumb);
      }
    }

    // Meta (date/time, via link)
    var $meta = $('<div class="meta">').appendTo($entry);
    $('<span class="from">')
        .html('Posted on ' + dateFormat(entry.date, 'fullDate'))
        .appendTo($meta);
	
    
        
    if (entry.comments) {
      $('<span class="label">')
          .text(entry.comments + ' comment' +
              ((entry.comments == 1) ? '' : 's'))
          .appendTo($entry);
    }
    if (entry.reshares) {
      $('<span class="label">')
          .text(entry.reshares + ' reshare' +
              ((entry.reshares == 1) ? '' : 's'))
          .appendTo($entry);
    }
    //+1 button
    $('<span class="g-plusone label" data-size="medium" data-annotation="bubble" data-href="'+entry.via.url+'">')
        .appendTo($entry);

    $entry.appendTo('#news-feed');
  }
  
  //render +1 buttons
  gapi.plusone.go();
}
