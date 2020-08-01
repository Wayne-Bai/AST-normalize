/*#####################################################################################################################
                                                                                                              
                    PPPPPPPPPPPPPPPPP                                                                              
                    P::::::::::::::::P                                                                             
                    P::::::PPPPPP:::::P                                                                            
                    PP:::::P     P:::::P                                                                           
xxxxxxx      xxxxxxx  P::::P     P:::::Paaaaaaaaaaaaa     ggggggggg   ggggg    eeeeeeeeeeee    rrrrr   rrrrrrrrr   
 x:::::x    x:::::x   P::::P     P:::::Pa::::::::::::a   g:::::::::ggg::::g  ee::::::::::::ee  r::::rrr:::::::::r  
  x:::::x  x:::::x    P::::PPPPPP:::::P aaaaaaaaa:::::a g:::::::::::::::::g e::::::eeeee:::::eer:::::::::::::::::r 
   x:::::xx:::::x     P:::::::::::::PP           a::::ag::::::ggggg::::::gge::::::e     e:::::err::::::rrrrr::::::r
    x::::::::::x      P::::PPPPPPPPP      aaaaaaa:::::ag:::::g     g:::::g e:::::::eeeee::::::e r:::::r     r:::::r
     x::::::::x       P::::P            aa::::::::::::ag:::::g     g:::::g e:::::::::::::::::e  r:::::r     rrrrrrr
     x::::::::x       P::::P           a::::aaaa::::::ag:::::g     g:::::g e::::::eeeeeeeeeee   r:::::r            
    x::::::::::x      P::::P          a::::a    a:::::ag::::::g    g:::::g e:::::::e            r:::::r            
   x:::::xx:::::x   PP::::::PP        a::::a    a:::::ag:::::::ggggg:::::g e::::::::e           r:::::r            
  x:::::x  x:::::x  P::::::::P        a:::::aaaa::::::a g::::::::::::::::g  e::::::::eeeeeeee   r:::::r            
 x:::::x    x:::::x P::::::::P         a::::::::::aa:::a gg::::::::::::::g   ee:::::::::::::e   r:::::r            
xxxxxxx      xxxxxxxPPPPPPPPPP          aaaaaaaaaa  aaaa   gggggggg::::::g     eeeeeeeeeeeeee   rrrrrrr            
                                                                   g:::::g                                         
                                                       gggggg      g:::::g                                         
                                                       g:::::gg   gg:::::g                                         
                                                        g::::::ggg:::::::g                                         
                                                         gg:::::::::::::g                                          
                                                           ggg::::::ggg                                            
                                                              gggggg
															  
© xPager - xGallery - Manuel Kleinert - www.xpager.ch - info(at)xpager.ch - v 1.1.3 - 09.02.2015
#####################################################################################################################*/

(function($){
	$.fn.xGallery = function(options){
		if(!options){var options = {};}
		return this.each(function() {
			options.obj = this;
			new xGallery(options);
		});
	}
}(jQuery));

var xGallery = function(options,fx){
	this.options = $.extend({
        id:false,
        obj:false,
        animationType:"fade",
        animationSpeed:300,
        touchControl:true,
        keyControl:true,
        showPageNum:true,           // Page Nummbers
        showPagePoints:true,        // Show Points Nav
		showPageImages:"all",       // all or Num images of Page
        showImages:"all",           // all or Num images show
		showComments:false,         // Show Imagecomments
        showImageNum:true,          // Show Imagenummber
        buttonObj:false,            // Show Buttom to Open Gallery
        border:110,
        beta:true
    },options);

	// Options to Attributs
	for(var name in this.options){eval("this."+name+"=this.options."+name);}

    // Attreibute
    this.count = 0;
    this.activImage = 0;
    this.imagesThumb = false;
    this.imgArray = new Array();
    this.imageNum = 0;
    this.imagepage = 1;
    this.imagePageCount = 0;
    this.width = $(window).width();
    this.height = $(window).height();
    this.imgContainer = false;
    this.pageStatus = true;
    this.openStatus = false;
    this.openAnimationStatus = true;
    this.animationStatus = true;
    this.points = false;
    this.loader = false;
    this.init();
}

xGallery.prototype = {
    init:function(){
        var self = this;
        
        // Set Obj
        if(this.options.obj){
            this.obj =  this.options.obj;	
        }else{
            this.obj =  $(this.options.id);	
        }
        
        this.imagesThumb = $(this.obj).find("img");
        this.imageNum = $(this.imagesThumb).length;
        this.imagePageCount = Math.ceil(this.imageNum/this.showPageImages);
                
        // Set Images (a Tag Href load)
        $(this.imagesThumb).each(function(i,obj) {
            self.imgArray[i] = new Array();
            self.imgArray[i]["img"] = new Image();
            self.imgArray[i]["height"] = 0;
            self.imgArray[i]["width"] = 0;
            self.imgArray[i]["src"] = $(obj).attr("data-img");
            self.imgArray[i]["thumb"] = obj;
			self.imgArray[i]["comment"] = $(obj).attr("data-comment")!=undefined?$(obj).attr("data-comment"):"";
            
            if(self.showImages != "all" && i >= self.showImages || self.buttonObj){
                $(obj).parent("div").remove();
                $(obj).remove();
            }
            
        });
        this.loadGallery();
    },
    
    loadGallery:function(){
        var self = this;
        var num = 0;
        $(this.imagesThumb).each(function(i,obj){
            self.imageLoader(obj,function(){
				num++;
				if(num==self.imageNum){self.build();}
			},function(){
				self.message("Error load image "+(i+1));
				$(obj).remove();
                self.imageNum--;
				if(num==self.imageNum){self.build();}
			});
        });
    }, 
    
    build:function(){
        var self = this;
               
        // Thumbnails
        
        var html = "<div class='prev_btn'></div>";
        html += "<div class='next_btn'></div>";
        if(this.showPageImages != "all"){
            $(this.obj).append("<div class='page-navigation'>"+html+"</div>");  
            
            var pageNum = "";
            if(this.showPageNum){
                pageNum += "<div class='page-num'>";
                pageNum += "<span class='num'>"+this.imagepage+"</span>";
                pageNum += "<span class='center'>/</span>";
                pageNum += "<span class='pages'>"+this.imagePageCount+"</span>";
                pageNum += "</div>";
                $(this.obj).append(pageNum);
            }
            
            var pagePoint = "";
            if(this.showPagePoints){
                pagePoint += "<div class='page-points'><div class='points-content'>";
                    for(i = 1;i<=this.imagePageCount; i++){
                        pagePoint += "<div class='point'><span>"+(i)+"</span></div>";
                    };
                pagePoint += "</div></div>";
                $(this.obj).append(pagePoint);	
            }
        }
        
        // Full
        if(this.showImageNum){
           html += "<div class='nummber'>"+(this.activImage+1)+"/"+this.imageNum+"</div>";
        }
        
        html += "<div class='close_btn'></div>";
        
        $(this.obj).append("<div class='surface'>"+html+"</div>");
        $(this.obj).find(".surface").append("<div class='border'></div>");
        $(this.obj).find(".surface").append("<div class='loader'></div>");
        
        this.imagesThumb = $(this.obj).find("img");
        this.imgContainer = $(this.obj).find(".surface .border");
        this.loader = $(this.obj).find(".surface .loader");
        this.points = $(this.obj).find(".page-points .point");
        
        $(this.obj).find(".page-points .point").eq(this.imagepage-1).addClass("activ");  
        
        this.startGallery();
    },
    
    startGallery:function(){
        var self = this;
        
        $(window).resize(function(){
            self.setSize();
            self.setImageSize();  
        });
		
        $(this.buttonObj).click(function(){
            self.openGallery(0);
        });
	
        $(this.imagesThumb).click(function(){
            self.openGallery($(this).parent().index());
        });
        
        $(this.obj).find(".surface").click(function(e){
            var c = $(e.target).attr("class");
            if(c != "prev_btn" && c != "next_btn" && c != "image"){ 
                self.closeGallery(); 
            }
        });
        
        $(this.obj).find(".next_btn").click(function(){
            if(self.openStatus){
                self.nextImage();
            }else{
                self.nextPage();
            }
        });
        
        $(this.obj).find(".prev_btn").click(function(){
            if(self.openStatus){
                self.prevImage();
            }else{
                self.prevPage();
            }
        });
        
        $(this.obj).find(".page-points .point").click(function(i){
            var p = this;
            self.gotoPage($(this).index()+1);
        });
        
        if(this.touchControl){
			this.touchStart = false;
			this.touchEnd= false;
			$(this.obj).bind('touchstart',function(e){
				self.touchStart = false;
				self.touchEnd = 0;
			});
			$(this.obj).bind('touchmove',function(e){
				if(self.touchStart == false){
					self.touchStart = e.originalEvent.touches[0].pageX;
				}
				self.touchEnd = e.originalEvent.touches[0].pageX;
			});
			$(this.obj).bind('touchend',function(e){
				var res = self.touchEnd-self.touchStart;
                if(self.openStatus){
				    if(res < 0 && res < -50){self.nextImage();}
				    if(res > 0 && res > 50){self.prevImage();}
                }else{
                    if(res < 0 && res < -50){self.nextPage();}
				    if(res > 0 && res > 50){self.prevPage();}
                }
				self.touchStart = false;
				self.touchEnd = 0;
			});
		}
        
		if(this.keyControl){
			$(document).keydown(function(e){
                if(self.openStatus){
				    if (e.keyCode == 37){e.preventDefault(); self.prevImage();}
				    if (e.keyCode == 39){e.preventDefault(); self.nextImage();}
                }else{
                    if (e.keyCode == 37){e.preventDefault(); self.prevPage();}
				    if (e.keyCode == 39){e.preventDefault(); self.nextPage();}
                }
			});	
		}
        
        if(this.showPageImages == "all"){
            $(this.imagesThumb).fadeIn(500);
        }else{
            $(this.imagesThumb).hide();
            $(this.imagesThumb).slice(0,this.showPageImages).show();
        }
    },
    
    openGallery:function(i){
        var self = this;
        if(i>=0 && i<this.imageNum){
            this.activImage = i;
            this.setStatus();
        }
        if(this.openAnimationStatus){
            this.openAnimationStatus = false;
            this.setSize();
            $(this.imgContainer).css("opacity",0);
            $("body").css("overflow","hidden");
            $(this.obj).find(".surface").fadeIn(500,function(){
                self.addImage(function(){
					self.addComment();
                    $(self.imgContainer).animate({opacity:1},500,function(){
                        self.openStatus = true;
                        self.openAnimationStatus = true; 
                    }); 
                 });
            });
        }
    },
    
    closeGallery:function(){
        var self = this;
        if(this.openAnimationStatus){
            this.openStatus = false;
            this.openAnimationStatus = false;
            $(self.imgContainer).animate({opacity:1},200,function(){
                $(self.obj).find(".surface").fadeOut(500,function(){
                    $("body").css("overflow","auto");
                    self.openAnimationStatus = true;  
                }); 
            });
        }
    },
    
    animation:function(fx){
       var self = this;
       switch(this.animationType){
            case "fade":
                $(this.imgContainer).animate({opacity:0},self.animationSpeed,function(){
                    self.addImage(function(){
						self.addComment();
                        $(self.imgContainer).animate({opacity:1},self.animationSpeed,function(){
                            if(fx){fx()};   
                        });  
                    });
                });
            break;
            default:
               this.message("no Animation Type");
       }
    },
    
    nextImage:function(){
        var self = this;
        if(this.animationStatus){
            this.animationStatus = false;
            if(this.activImage < this.imageNum-1){
               this.activImage++;    
            }else{
               this.activImage=0;
            }
            this.animation(function(){
                self.setStatus();
                self.animationStatus = true;   
            });
        }
    },
    
    prevImage:function(){
        var self = this;
        if(this.animationStatus){
            this.animationStatus = false;
            if(this.activImage > 0){
               this.activImage--;
            }else{
               this.activImage=this.imageNum-1;
            }
            this.animation(function(){
                self.setStatus();
                self.animationStatus = true;   
            });
        }
    },
    
    gotoImage:function(i,fx){
        var self = this;
        if(this.animationStatus){
            if(i >= 0 && i<this.imageNum){
               this.activImage=i;
            }
            this.animation(function(){
                self.animationStatus = true;
                self.setStatus();
                if(fx){fx();}  
            });
        }
    },
    
    addImage:function(fx){
        var self = this;
        $(this.loader).fadeIn(200);
        this.imgArray[this.activImage]["img"].src = this.imgArray[this.activImage]["src"];
        this.imageLoader(this.imgArray[this.activImage]["img"],function(){
            $(self.loader).fadeOut(200);
            $(self.obj).find(".surface .border img").remove();
            $(self.obj).find(".surface .border").append("<img class='image' src='"+self.imgArray[self.activImage]["img"].src+"' alt='' />");
            self.setImageSize();
            if(fx){fx();}
        },function(){
            //console.log("img not load");
        });
    },
	
	addComment:function(){
		var self = this;
		if(this.showComments){
			$(self.obj).find(".surface .border div.comment").remove();
			$(self.obj).find(".surface .border").append("<div class='comment'>"+self.imgArray[self.activImage]["comment"]+"</div>");
		}	
	},
    
    nextPage:function(){
        var self=this;
        if(this.pageStatus){
            this.pageStatus= false;
            if(this.showPageImages*self.imagepage < this.imageNum){
                this.imagepage ++;
            }else{
                this.imagepage = 1;  
            }
            this.gotoPage(this.imagepage,function(){
                self.setStatus();
                self.pageStatus=true; 
            })
        }
    },
    
    prevPage:function(){
        var self=this;
        if(this.pageStatus){
            this.pageStatus= false;
            if(this.imagepage > 1){
                this.imagepage --;
            }else{
                this.imagepage = Math.ceil(this.imageNum / this.showPageImages);  
            }
            this.gotoPage(this.imagepage,function(){
                self.setStatus();
                self.pageStatus=true;      
            })
        }
    },
    
    gotoPage:function(i,fx){
        var self=this;
            if(i > 0 && i<this.imageNum){
            this.imagepage = i;
            $(".page-num .num").html(this.imagepage);
            $(this.imagesThumb).hide();
            $(self.imagesThumb).slice((self.showPageImages*self.imagepage)-self.showPageImages,self.showPageImages*self.imagepage).show();
            $(self.points).removeClass("activ").eq(this.imagepage-1).addClass("activ"); 
            if(fx){fx();}
            self.setStatus();
        }
    },
    
    imageLoader:function(img,fx,fxErr){
		if(img.complete||img.readyState===4){
			img.src+="?d="+new Date().getTime();
			$(img).load(function(response,status,xhr){
                if(fx){fx();}}).error(function(){if(fxErr){fxErr();}
            });
		}else{
			if(fx){fx();}
		}
	},
    
    setSize:function(){
		var self = this;
		this.width = $(window).width();
        this.height = $(window).height();
        $(this.obj).find(".surface .border").css({"width":this.width-this.border,"height":this.height-this.border});
	},
    
    setImageSize:function(){
        var img = $(this.obj).find(".surface .border img");
        $(img).height("");
        $(img).width(this.width-this.border);
        if((this.height-this.border) < $(img).height()){
            $(img).width("");
            $(img).height(this.height-this.border);
        }
    },
    
    setStatus:function(){
        if(this.showImageNum){
           $(this.obj).find(".surface .nummber").html((this.activImage+1)+"/"+this.imageNum);
        }   
    },
    
    // Console
	message:function(txt){
		if(this.beta){
			if($("#cis_error_message").length){
				var html = "<div class='cis_error_message' style='font-size:10px; text-align:left; line-height: 25px; border-bottom:solid 1px #ddd; padding-left:5px;'><div>";
				$("#cis_error_message_titel").after(html);
				$(".cis_error_message").first().text("- "+txt);
			}else{
				var html = "<div id='cis_error_message' style='position:absolute; top:10px; left:10px; z-index:100000; height:100px; width:250px; border:solid 2px #000; display:none;background-color:#fff; overflow: auto;'>";
				html += "<h3 id='cis_error_message_titel' style='display:block; text-align:center; background-color:#666; color:#fff; font-size:12px; line-height: 25px!important; margin:0px;'>Console</h3>";
				html += "<div class='cis_error_message' style='font-size:10px; text-align:left; line-height: 25px; border-bottom:solid 1px #ddd; padding-left:5px;'><div>";
				html += "</div>";			
				$(this.obj).append(html);
				$(".cis_error_message").text("- "+txt);
				$("#cis_error_message").fadeIn(500);
			}
		}
	}
}