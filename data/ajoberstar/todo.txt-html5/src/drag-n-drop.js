/*
 *  Copyright (C) 2012 Andrew Oberstar
 *
 *  todo.txt-html5 is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  todo.txt-html5 is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with todo.txt-html5.  If not, see <http://www.gnu.org/licenses/>.
 */
function handleDnD(event) {
	event.stopPropagation();
	event.preventDefault();
}

$(document).ready(function() {
	var dropbox = $('#dropbox')
	dropbox.bind('dragover', function(event) {
		handleDnD(event);
		$('#dropbox').addClass('over');
	});
	dropbox.bind('dragleave', function(event) {
		handleDnD(event);
		$('#dropbox').removeClass('over');
	});
	dropbox.bind('drop', function(event) {
		handleDnD(event);
		var reader = new FileReader();
		reader.onload = function(event) {
			controller.createTodos(event.target.result);
		}
		reader.onerror = function(event) {
			console.log('file read error', e);
		}
		
		var files = event.originalEvent.dataTransfer.files;
		for (var i = 0; i < files.length; i++) {
			reader.readAsText(files[i]);
		}
		$('#dropbox').removeClass('over');
	});
});
