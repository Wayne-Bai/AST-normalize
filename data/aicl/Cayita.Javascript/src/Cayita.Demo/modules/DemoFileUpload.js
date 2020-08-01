(function() {
	////////////////////////////////////////////////////////////////////////////////
	// Cayita.Demo.DemoFileUpload
	var $DemoFileUpload = function() {
	};
	$DemoFileUpload.execute = function(parent) {
		var fp = Cayita.UI.Atom('div', null, 'bs-docs-example');
		var ff = Cayita.UI.FileField(null, null, null, fp);
		var ufb = $DemoFileUpload.$createUploadButton(fp);
		var logf = Cayita.UI.Atom('div', null, null, null, null, fp);
		var imp = Cayita.UI.Atom('div', null, 'bs-docs-example');
		var imf = Cayita.UI.ImgField(null, null, null, imp);
		var imb = $DemoFileUpload.$createUploadButton(imp);
		var logim = Cayita.UI.Atom('div', null, null, null, null, imp);
		$(parent).append(Cayita.Fn.header('File Upload', 3)).append(fp).append(Cayita.Fn.header('Image Upload', 3)).append(imp);
		var rq = $.get('code/demofileupload.html');
		rq.done(function(s) {
			var code = Cayita.UI.Atom('div');
			code.innerHTML = s;
			$(parent).append(Cayita.Fn.header('C# code', 3)).append(code);
		});
		ff.add_changed(function(e) {
			$DemoFileUpload.$showFileInfo(ufb, logf, ff.input);
		});
		imf.add_changed(function(e1) {
			$DemoFileUpload.$showFileInfo(imb, logim, imf.input);
		});
		ufb.add_clicked(function(e2) {
			$DemoFileUpload.$sendFile(ufb, ff.input);
		});
		imb.add_clicked(function(e3) {
			$DemoFileUpload.$sendFile(imb, imf.input);
		});
	};
	$DemoFileUpload.$createUploadButton = function(parent) {
		return Cayita.UI.ButtonIcon(null, function(imb) {
			imb.set_iconClass('icon-upload');
			imb.set_text('Upload');
			$(imb).addClass('btn-info');
			imb.disabled = true;
		}, parent);
	};
	$DemoFileUpload.$showFileInfo = function(bt, log, input) {
		$(log).empty();
		bt.disabled = input.files.length === 0;
		for (var $t1 = 0; $t1 < input.files.length; $t1++) {
			var f = input.files[$t1];
			$(log).append(Cayita.Fn.fmt('Name:{0}<br>Size:{1}<br>Type:{2}<br>LastModifiedDate:{3}<br>', [f.name, f.size, f.type, ss.formatDate(f.lastModifiedDate, 'dd-MM-yyyy HH:mm:ss')]));
		}
	};
	$DemoFileUpload.$sendFile = function(bt, input) {
		bt.disabled = true;
		var fd = new FormData();
		fd.append('userfile', input.files[0]);
		var rq = Cayita.Fn.send(fd, 'SaveFileUrl');
		rq.done(function() {
			Alertify.log.success('File Uploaded', 5000);
		});
		rq.fail(function() {
			Alertify.log.error(Cayita.Fn.fmt('{0}:{1}', [rq.status, rq.statusText]), 0);
		});
		rq.always(function() {
			bt.disabled = false;
		});
	};
	ss.registerClass(global, 'DemoFileUpload', $DemoFileUpload);
})();
