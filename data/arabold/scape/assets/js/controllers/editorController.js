angular.module('scape').controller('EditorController', 
		[ '$scope', '$http', function($scope, $http) {

	var _codeMirror;

	// Holds the content of the email in both HTML and plain text format
	$scope.content = {
		html: '',
		css: '',
		text: ''
	}
	
	// Initialize list of available templates
	$scope.templates = [];
	$scope.template = undefined;
	$http.get('/templates/html').then(function(response) {
		$scope.templates = response.data;
		if (!$scope.template)
			$scope.template = $scope.templates[0];
	});
	$scope.$watch('template', function(template) {
		// Load the template
		if (template) {
			$http.get('/templates/html' + template).then(function(response) {
				$scope.template = template;
				$scope.content.html = response.data;
			});
		}
	});
	
	// Initialize list of available stylesheets
	$scope.styles = [];
	$scope.style = undefined;
	$http.get('/templates/css').then(function(response) {
		$scope.styles = response.data;
		if (!$scope.style)
			$scope.style = $scope.styles[0];
	});
	$scope.$watch('style', function(style) {
		// Load the style sheet
		if (style) {
			$http.get('/templates/css' + style).then(function(response) {
				$scope.style = style;
				$scope.content.css = response.data;
			});
		}
	});
	
	// Setup editor
	$scope.editor = 'html';
	$scope.editorOptions = {
//			styleActiveLine: true,
//			showTrailingSpace: true,
			viewportMargin: Infinity,
//			readOnly: 'nocursor',
			lineWrapping : true,
			lineNumbers: true,
//			mode: 'text/html',
//			autofocus: true,
	};
	$scope.setEditor = function(editor) {
		$scope.editor = editor;
	};
	$scope.$watch('editor', function(editor) {
		if (editor === 'html') {
			$scope.editorOptions.mode = 'text/html';
		}
		else if (editor === 'css') {
			$scope.editorOptions.mode = 'text/css';
		}
		else {
			$scope.editorOptions.mode = 'text/plain';
		}
	});
	
	// Setup preview
	$scope.preview = "desktop";
	$scope.setPreview = function(preview) {
		$scope.preview = preview;
	}
}]);
