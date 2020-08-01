count = 0; //Versuchscounter
	
/*Startzustand setzen*/
function set(){
    responsive();
	f = [];
	newLine();
	g = ga.slice();
	m = ma.slice();
	k = ka.slice(); 
	setFixed();
}

    /*Neue Zeile in Raster einfuegen*/
    function newLine(){
        var newline = [];
        for(i = 0; i < breite; i++){
            newline.push(1);
        }
        f.push(newline);
    }


    /* Feststehende Elemente setzen */
    function setFixed(){
        for(i = 0; i < fixed.length; i++){
            next = findNextFreeBlock(f);  //naechste frei Stelle im Raster finden
            posx = next[0];	
            posy = next[1];
            setBlock(fixed[i]);
        }
    }

    /* Breite überprüfen und ggf. anpassen; */
    function responsive(){
        breite = maxBreite;
        if(responsive){
            maxWidth = $('body').width();
            while ((breite * width) > maxWidth && breite > 2){
                breite -= 2;
            }
        }
    }



/* Elemente anordnen */
function sort(){
	while(g.length > 0 || m.length > 0 || k.length > 0){
		next = findNextFreeBlock(f);  //naechste frei Stelle im Raster finden
		posx = next[0];	
		posy = next[1];
		setRandomBlock(); //zufaelligen Block setzen
    }		
}

/*Suche naechsten freien Block*/
function findNextFreeBlock(f){
	x = 0;
	y = 0;
	while(f[x][y] != 1){
		y++;
		if(y > breite-1){
			y = 0;
			x++;
			if(x >= f.length){
				newLine();
				
			}
		}
	}
	return [x,y];
}

/* naechsten Block zufaellig auswaehlen, wenn die groesse nicht passt naechst kleineren probieren */ 
function setRandomBlock(){
	zufall =  Math.round(Math.random()*2);
	count = count +1;
	if(setBlock(zufall)){
		count = 0;
	}else{
		count++;
	}
	if(count == 30){
		set()
	}
	return zufall;
}


function setBlock(size){
	switch(size){
		case 2:
			if(addBlockSize3(g[0])){
				return true;				
				break; //Wenn Element gesetzt wurde
			}
		case 1:
			if(addBlockSize2(m[0])){
				return true;
				break; //Wenn Element gesetzt wurde
			}
		case 0:
			if(addBlockSize1(k[0])){
				return true;
				break; //Wenn Element gesetzt wurde
			}
		default: 
			return false;
	}
}

	
function addBlockSize1(content){
	if(k.length > 0){
		if(f[posx][posy] ==1){
			f[posx][posy] = $('<div></div>').attr("class", "small").html(content);; //Element in einem div in Ausgabe array einfuegen
			k.splice(0,1); //Element aus Element-Liste entfernen
			return true;
		}
	}
	return false;	
}

function addBlockSize2(content){
	if(m.length > 0){
		if(f[posx][posy] ==1){
			if(f[posx][posy + 1] ==1 ){
				f[posx][posy] = $('<div></div>').attr("class", "mid").html(content);
				f[posx][posy+ 1] = 2;
				m.splice(0,1);
				return true;
			}
		}
	}
	return false;
}

function addBlockSize3(content){
	if(g.length > 0){
		if(f[posx][posy] ==1){
			if(f[posx][posy  + 1] ==1){
				if(posx + 1 >= f.length){
					newLine();
					f[posx][posy] = $('<div></div>').attr("class", "big").html(content);
					f[posx + 1][posy] = 4;
					f[posx][posy +1 ] = 4;
					f[posx +1][posy+1] = 4;
					g.splice(0,1);
					return true;
				}else if (f[posx + 1][posy] ==1 && f[posx+1][posy+1] ==1){
					f[posx][posy] = $('<div></div>').attr("class", "big").html(content);
					f[posx + 1][posy] = 4;
					f[posx][posy +1 ] = 4;
					f[posx +1][posy+1] = 4;
					g.splice(0,1);
					return true;
				}
			}
		}
	}
	return false;
}


/* Ausgabe des Array in Konsole console
   Debug Funktion aus der Entwicklung */
function ausgabe(){
    for(x = 0; x < f.length; x++){
        output = ""
        for(y = 0; y < breite; y++){
                output = output + f[x][y] + " ";
        }
        console.log(output);
    }
}

/*Ausgabe in HTML-Code*/
function ausgeben(){
    galleryBody =  $('<div></div>') .attr('class', 'gallery-body')
                                    .css('width', breite*width);
	$(parentBlock).append(galleryBody); //Gallery Body in DOM einfuegen
	for(x = 0; x < f.length; x++){
		for(y = 0; y < breite; y++){
			element = f[x][y];
			if (element != 1 && element != 2 && element != 4){
				tmp = $('<div></div>')	.attr("class", "box")
										.css('left', y*width + "px")
										.css('top', x*height + "px")
										.html(element); //neues Element erstellen
				box = $('.gallery-body').append(tmp);//Element einfuegen	
				
			}	
		}
	
	}
}


/* Galerie neu anordnen */
function shuffle(){
	$('.gallery-body').css('display', 'none').attr('class', 'gallery-body-old');
	set();
	sort();
	ausgeben();
	$('.gallery-body-old').remove();
}







/*EventHandler*/	
$(window).resize(function checkWindowSize(){
    maxWidth = $(parentBlock).width();
    if((breite * width) > maxWidth || ((breite + 2) * width) < maxWidth ){
        shuffle();
    }
});

/* Laden der Galerie wenn Dokument fertig geladen */
$(document).ready(function() {
    set(); 
    sort();
    ausgeben();
});