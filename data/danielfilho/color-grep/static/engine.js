var win = window,
    doc = win.document,
    img = document.createElement('img'),
     eh = document.querySelector('.elementsHolder');      // container of canvas and elements
    cnv = doc.querySelector('.theCanvas');                // canvas element
      c = cnv.getContext('2d'),                           // making it 2d
   info = doc.querySelector('.info'),                     // all infos comes here
  arrow = doc.querySelector('.move'),                     // all infos comes here
   ihex = doc.querySelector('.hex'),                      // hex paragraph info
   irgb = doc.querySelector('.rgb'),                      // rgb paragraph info
   ihsl = doc.querySelector('.hsl'),                      // hsl paragraph info
   iinv = doc.querySelector('.inv'),                      // inverted color of seleted one
  helpr = doc.querySelector('div.drop');                  // the guiding text with arrow
   logo = doc.querySelector('.logo'),                     // app's logo
 mGlass = doc.createElement('div'),                       // magnifying glass (soon)
    dbg = false;                                          // debug mode true|false

// listeners
doc.addEventListener('DOMContentLoaded', init, false);

// loads as soon as the DOM is loaded
function init(){
  doc.addEventListener('dragenter', dragEnter, false);    // entering the drop area, with a file
  doc.addEventListener('dragover', dragOver, false);      // over the drop area, with a file
  doc.addEventListener('drop', drop, false);              // dropping the file
  eh.addEventListener('click', ehClick, false);           // clicking to select the color
  arrow.addEventListener('click', arrowClick, false);     // clicking the information box

  mGlass.className = 'mGlass';
  //eh.appendChild(mGlass); // adds the magnifying glass lens

  if(dbg) console.log('initialized.');
}

// execute as soon as the image is loaded
img.addEventListener('load', function(){
  cnv.width            = img.width;
  cnv.height           = img.height;
  eh.style.width       = img.width  + 'px';
  eh.style.height      = img.height + 'px';
  if(img.width <= window.innerWidth){
    eh.style.top         = '50%';
    eh.style.left        = '50%';
    eh.style.marginTop   = -(img.height/2)+'px';
    eh.style.marginLeft  = -(img.width /2)+'px';
    eh.style.boxShadow   = '0 0 20px 10px #666';
  } else {
    eh.style.marginTop   = 0;
    eh.style.marginLeft  = 0;
    eh.style.top         = 0;
    eh.style.left        = 0;
  }
  eh.style.opacity       = 1;
  c.drawImage(img, 0, 0);
  window.scrollTo(0,0);

  if(dbg) console.log('image loaded');
  if(dbg) console.log('img w: '+ img.width);
  if(dbg) console.log('img h: '+ img.height);
});

function dragEnter(e){
  e.stopPropagation();
  e.preventDefault();
  if(dbg) console.log('drag enter!');
}

function dragOver(e){
  eh.style.opacity = 0.3;

  e.stopPropagation();
  e.preventDefault();
  if(dbg) console.log('drag over!');
}

function drop(e){
  var images = e.dataTransfer.files;
  if(images.length > 0){
    var theImage = images[0];
    if(typeof FileReader !== 'undefined'){
      var reader = new FileReader();
      reader.onload = function(e){
        img.src = e.target.result;
      };
      reader.readAsDataURL(theImage);
    }
  }

  eh.style.border       = '1px solid #333';
  eh.style.borderRadius = '0';
  eh.style.boxShadow    = 'none';
  helpr.style.display   = 'none';

  e.stopPropagation();
  e.preventDefault();
  if(dbg) console.log('dropped!');
}

function ehClick(e){
  var pos = findPos(this),
      x = e.pageX - pos.x,
      y = e.pageY - pos.y,
      coord = 'x=' + x + ', y=' + y,
      p = c.getImageData(x, y, 1, 1).data,
      hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6),
      hsl = Colour(hex).toHSLString(),
      inv = Colour(hex).invert().toString();
  irgb.style.color = inv;
  ihex.style.color = inv;
  ihsl.style.color = inv;
  iinv.style.color = inv;
  irgb.innerHTML = 'rgb: '+'<input type="text" id="rgb" class="rgb" style=color:'+ inv +';" onclick="this.select();" value="'+ p[0] +','+ p[1] +','+ p[2]+'">';
  ihex.innerHTML = 'hex: '+'<input type="text" id="hex" class="hex" style=color:'+ inv +';" onclick="this.select();" value="'+ hex+'">';
  ihsl.innerHTML = 'hsl: '+'<input type="text" id="hsl" class="hsl" style=color:'+ inv +';" onclick="this.select();" value="'+ hsl+'">';
  iinv.innerHTML = 'inv: '+'<input type="text" id="inv" class="inv" style=color:'+ inv +';" onclick="this.select();" value="'+ inv+'">';

  logo.style.backgroundColor = hex;
  info.style.backgroundColor = hex;
  info.style.boxShadow = 'inset 0 0 0 1px '+ inv;

  if(info.style.top !== '-12px'){
    info.style.top = '-12px';
  }

  if(dbg) console.log('clicked!');
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
  throw 'Componente de cor inválido';
  if(dbg) console.log('converted rgb to hex');

  return ((r << 16) | (g << 8) | b).toString(16);
}

function findPos(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj == obj.offsetParent);
      return { x: curleft, y: curtop };
    }
  return undefined;
}

function arrowClick(e){
  e.preventDefault();
  if(info.offsetLeft > 20){
    info.style.left = 20 + 'px';
  } else {
    info.style.left = (win.innerWidth - (info.offsetWidth + 20)) + 'px';
  }

  if(dbg) console.log('info left: '+ info.offsetLeft);
}

function getOffset( el ) {
  var _x = 0;
  var _y = 0;
  while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.parentNode;
  }
  return { top: _y, left: _x };
}
