function autoLikeFacebook(){
	var btnLike = document.getElementsByClassName('PageLikeButton');
	
	if(btnLike.length){
		btnLike = btnLike[0];
		btnLike.dispatchEvent(new Event('click'));
	}
	
	setTimeout(function(){
		window.close();
	}, 1000);
}

var addMeFastCheck = document.referrer && document.referrer.indexOf('?u=') > -1;
console.log(addMeFastCheck ? 'check addmefast: true' : 'check addmefast: false');

if(addMeFastCheck){
	setTimeout(autoLikeFacebook, 1500);
}