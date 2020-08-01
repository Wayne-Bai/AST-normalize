$(function() {
	"use strict";
	var allImagesLoaded = false, imagesLength = 0, counter = 0, imageArray = [], loadedImages = [], loadedImagesCounter = 0;
	/*--------------------------------
	Add your image paths to the array
	and your good to go
	--------------------------------*/
	imageArray = ["img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg"];
	imagesLength = imageArray.length;
	function stepForward() {
		if (counter === imagesLength-1) {
			counter = 0;
		} else {
			counter++;
		}
		$("#pageImage").attr("src", $(loadedImages[counter]).attr('src'));
		$("#pageImage").attr("alt", "demobild " + counter);
	}
	function stepBackward() {
		if (counter === 0) {
			counter = imagesLength-1;
		} else {
			counter--;
		}
		var sourcePath = $(imageArray[counter]).attr('src');
		$("#pageImage").attr("src", sourcePath);
		$("#pageImage").attr("alt", "demobild " + counter);
	}
	function initEverything() {
		allImagesLoaded = true;
		$('#preloadingImages').hide();
		// Deactivate the context menu that appears on right click
		$(document).bind("contextmenu", function(e) {
			return false;
		});
		var theSource = $(imageArray[0]).attr('src'), theImage = $('<img />');
		$(theImage)
			.attr('src', theSource)
			.attr('width', imageArray[0].width)
			.attr('height', imageArray[0].height)
			.attr('alt', 'demobild 1')
			.attr('id', 'pageImage');
		$('#container').append(theImage);
		$("#pageImage").mousedown(function(e) {
			if (allImagesLoaded) {
				switch (e.which) {
					case 1:
						stepForward();
						break;
					case 2:
						// center button on the mouse
						break;
					case 3:
						stepBackward();
						break;
					default:
						// Nada
				}
			}
		});
		$(document).keydown(function(e) {
			e.preventDefault();
			if (allImagesLoaded) {
				switch (e.keyCode) {
					case 37: // Left
						stepBackward();
						break;
					case 38: // Up
						stepBackward();
						break;
					case 39: // Right
						stepForward();
						break;
					case 40: // Down
						stepForward();
						break;
					default:
						// Nada
				}
			}
		});
	}
	function preloadImages() {
		var tempImage = $("<img />").attr("src", imageArray[loadedImagesCounter]);
		tempImage.load(function(){
			loadedImages.push(this);
			loadedImagesCounter++;
			if(loadedImagesCounter === imagesLength) {
				imageArray = loadedImages;
				initEverything();
			}
			else {
				if(!allImagesLoaded)
				{
					preloadImages();
				}
			}
		});
	}
	// INIT CODE
	if(imagesLength === 0) {
		$('#container').html('<p><strong>You need to put some images in your array</strong></p>');
	}
	else {
		preloadImages();
	}
});