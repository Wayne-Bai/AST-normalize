function showHelp() {
	$("#result")
			.html(
					'<div id="helpInnerDiv">'+
					'<h1>Help</h1>' +
					'<h2>Short Cuts:<br>--------------------------------------</h2>'+
					'<p><b>Move(1px) : </b>Arrows</p>'+
					'<p><b>Move(5px) : </b>Shift+Arrows</p>'+
					'<p><b>BringForward : </b>Ctrl+Up Arrow</p>'+
					'<p><b>SendBackwards : </b>Ctrl+Down Arrow</p>'+
					'<p><b>Delete : </b>Alt+Delete</p>'+
					'<p><br>--------------------------------------<br>'+
					'<b>To rotate objects press Shift key</b>'+
					'<br>--------------------------------------<br>'+
					'</p><p><Fig01 - Below diagrams describes about each icon in this app</p><img src="/images/help/help_00.png" /></div>');
	popup('popUpDiv', 'closediv', 800, 600);
}