document.addEventListener("plusready", function() {
	A.launch({
        showPageLoading : false,
        isAutoRender : true,
        crossDomainHandler : $util.ajax
    });
},false);