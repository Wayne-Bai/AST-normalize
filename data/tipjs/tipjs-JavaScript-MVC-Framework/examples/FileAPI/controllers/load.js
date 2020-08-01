tipJS.controller({
	name : "FileAPI.load",
	invoke:function(params) {
		tipJS.debug(this.name + " Start");
		
		var imageFiles = document.getElementById("imageFile").files;
		if (imageFiles.length < 1) {
			alert("이미지를 선택해 주세요.");
			return;
		}
		var imageFile = imageFiles[0];
		if (imageFile.type.indexOf("image/") != 0){
			alert("이미지 형식만 지원합니다.");
			return;
		}
		
		// FileReader 객체에 이벤트 정의
		this.loadModel("readerEventMgr").setEvent();
		// FileReader 객체로 DataURL형식으로 파일을 읽어들임
		this.loadModel("globalModelVO", true).imageReader.readAsDataURL(imageFile);
		
		var imageInfo = this.loadView("imageInfo");
		// 이미지정보 출력
		imageInfo.imageInfoLog(imageFile);
		
		tipJS.debug(this.name + " Done");
	}
});
