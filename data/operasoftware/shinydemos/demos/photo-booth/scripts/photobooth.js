// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

(function(f,a){var h=document.createElement("div"),g=("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex").split(" ");function e(j,k,l){return(j+(k-j)*l).toFixed(3)}function i(k,j,l){return k.substr(j,l||1)}function c(l,p,s){var n=2,m,q,o,t=[],k=[];while(m=3,q=arguments[n-1],n--){if(i(q,0)=="r"){q=q.match(/\d+/g);while(m--){t.push(~~q[m])}}else{if(q.length==4){q="#"+i(q,1)+i(q,1)+i(q,2)+i(q,2)+i(q,3)+i(q,3)}while(m--){t.push(parseInt(i(q,1+m*2,2),16))}}}while(m--){o=~~(t[m+3]+(t[m]-t[m+3])*s);k.push(o<0?0:o>255?255:o)}return"rgb("+k.join(",")+")"}function b(l){var k=parseFloat(l),j=l.replace(/^[\-\d\.]+/,"");return isNaN(k)?{v:j,f:c,u:""}:{v:k,f:e,u:j}}function d(m){var l,n={},k=g.length,j;h.innerHTML='<div style="'+m+'"></div>';l=h.childNodes[0].style;while(k--){if(j=l[g[k]]){n[g[k]]=b(j)}}return n}a[f]=function(p,m,j){p=typeof p=="string"?document.getElementById(p):p;j=j||{};var r=d(m),q=p.currentStyle?p.currentStyle:getComputedStyle(p,null),l,s={},n=+new Date,k=j.duration||200,u=n+k,o,t=j.easing||function(v){return(-Math.cos(v*Math.PI)/2)+0.5};for(l in r){s[l]=b(q[l])}o=setInterval(function(){var v=+new Date,w=v>u?1:(v-n)/k;for(l in r){p.style[l]=r[l].f(s[l].v,r[l].v,t(w))+r[l].u}if(v>u){clearInterval(o);j.after&&j.after()}},10)}})("emile",this);

(function(win, doc){
  var video = doc.querySelector('video'),
      snapshots = doc.getElementById('pics'),
      photos = snapshots.getContext('2d'),
      snap = new Image(),
      img = new Image(),
      countdown = new Image(),
      shareimg = new Image(),
      corner = new Image(),
      canvasBg = new Image(),
      audio = new Audio('http://media.shinydemos.com/photo-booth/click.ogg'),
      button = doc.querySelector('canvas + button'),
      container = doc.getElementById('container'),
      spinner = doc.getElementById('spinner'),
      VIDEO_WIDTH, VIDEO_HEIGHT, flash, xhr,
      form = doc.querySelector('form'),
      emailSubmit = form.querySelector('button'),
      snaps = [
        function(){photos.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, 31, 46, 120, 75);},
        function(){photos.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, 196, 46, 120, 75);},
        function(){photos.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, 362, 46, 120, 75);},
        function(){photos.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, 527, 46, 120, 75);}
      ];
  
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
      
  var canvasPrep = (function(){
    canvasBg.src = 'images/bg_output.png';
    canvasBg.onload = function(){
     photos.drawImage(canvasBg, 0, 0); 
    }
    corner.src = 'images/corner.png';
    snap.src = 'images/img_border.png';
    snap.onload = function(){
      photos.drawImage(snap, 16, 23);
      photos.drawImage(snap, 181, 23);
      photos.drawImage(snap, 347, 23);
      photos.drawImage(snap, 512, 23);
    };
  }());

  var computeSize = function(supportsObjectFit){
    // user agents that don't support object-fit 
    // will display the video with a different 
    // aspect ratio. 
    if (supportsObjectFit == true){
      VIDEO_WIDTH = 640;
      VIDEO_HEIGHT = 400;
    } else {
      VIDEO_WIDTH = video.videoWidth;
      VIDEO_HEIGHT = video.videoHeight;
    }
  };

  var takeSnaps = function(interval){
    emile(countdown, 'opacity:0', {duration:500, after: function(){
      countdown.parentNode.removeChild(countdown);
      video.muted = true;
      video.play();
    }});
    var i = 0,
    id = setInterval(function(){
      if (snaps.length){
        snaps.shift()();
        showFlash();
        audio.play();
      }
    
      if (++i == 4){
        button.disabled = false;
        clearInterval(id);
        i = 0;
        setTimeout(function(){
          share();
        }, 500);
      }
    }, interval);
  };
  
  var prepFlash = (function(){
    flash = doc.createElement('div');
    flash.id = 'flash';
    flash.className = 'hidden';
    container.appendChild(flash);
  }());
  
  var showFlash = function(){
    flash.className = '';
    emile(flash, 'opacity:0', {duration:250, after: function(){
      flash.style.opacity = .6;
      flash.className = 'hidden';
    }});
  };

  var fallback = function(){
    video.addEventListener('loadedmetadata', function(){
      computeSize();
    }, false);
  };
  
  var startButton = function(){
    countdown.src = 'images/countdown.svg';
    countdown.id = 'countdown';
    container.appendChild(countdown);
    setTimeout(takeSnaps, 4000, 1200);
  };
  
  var share = function(){
    shareimg.src = '../images/img_border_hover.png';
    shareimg.onload = function(){
      photos.drawImage(this, 512, 23);
      photos.drawImage(corner, 635, 23);
    };
    
    snapshots.className = 'clickable';
    
    snapshots.onclick = function(){
      emile(video, 'opacity: 0', {duration:250, after: function(){
        video.parentNode.removeChild(video);
        snapshots.className = 'share';
        form.parentNode.className = '';
      }});
      
      repaint();
    };
  };
  
  var repaint = function(){
    shareimg.src = '../images/img_repaint.png';
    shareimg.onload = function(){
      photos.drawImage(this, 512, 23);
    };
  };
  
  var init = (function(){
    navigator.getUserMedia ? 
      navigator.getUserMedia({video: true}, function(stream){
        if (video.mozCaptureStream){ // Needed to check for Firefox
            video.mozSrcObject = stream;
        } else {
            video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        video.addEventListener('loadedmetadata', function(){
          video.play();
          computeSize(true);
        }, false);
      }, fallback) : fallback();
  }());
  
  form.onsubmit = function(e){
    spinner.className = '';
    email = form.querySelector('[type=email]').value;
    xhr = new XMLHttpRequest();
    xhr.open('POST', 'email.php');
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
      if (this.status == 200 && this.readyState == 4){
        spinner.className = 'hidden';
        form.querySelector('[type=email]').disabled = true;
        emailSubmit.textContent = 'Again?';
        emailSubmit.onclick = function(){location.reload();};
      };
    };
    xhr.send('email=' + email + '&photo=' + encodeURIComponent(snapshots.toDataURL()));
    e.preventDefault();
  };
  
  button.addEventListener('click', function(){
    startButton();
    this.disabled = true;
  }, false);
}(window, document));