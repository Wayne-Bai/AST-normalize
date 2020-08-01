
exports.loadData = function(data, callback){
    callback({
			heading: "Create a New Todo List"
		});
};

exports.onReady = function(){
	$('#new_todo').when('submit', function(e) { //create event to make new todo list
		e.preventDefault();
		var todo_name = $('.todo_name').val()
		Services.addTodo(todo_name, function(result) { //call services layer to add new todo list
			console.log(result);
			$.goReplace('todo', {name:todo_name}); // go to new todo list and replace current hash (back button will go back to page before this one)
		});
	});
};

exports.onFinished = function(){
    console.log("view exiting:todo-new");
};

