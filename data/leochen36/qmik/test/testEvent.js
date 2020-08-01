;
(function() {
	//定义测试模块
	module( "测试示例" );
	//定义一个简单的函数，判断参数是不是数字
	function simpleTest(para) {
	  if(typeof para == "number") {
	    return true;
	  }
	  else{
	    return false;
	  }
	}
	//开始单元测试
	test('simpleTest()', function() {
	  //列举各种可能的情况，注意使用 ! 保证表达式符合应该的逻辑
	  ok(simpleTest(2), '2是一个数字');
	  ok(!simpleTest("2"), '"2"不是一个数字');
	});
	$(document).ready(function(Q){
		function deal(e){
			console.log("deal ",e.target);
		}
	    var click1 = $("#click1").on({
	    	click:deal
	    });
	    var click2 = $("#click2").on({
	    	click:function(e){
	    		console.log("click2", e.target);
	    	}
	    });
	    var live1 = $("#live1").live({
	    	click:deal
	    });
	    var live2 = $("#live2").live({
	    	click:function(e){
	    		console.log("live2", e.target);
	    	}
	    });
	    $("#once1").once({
	    	click:function(e){
	    		console.log("once1", e.target);
	    	}
	    });
	    
	    var die1 = $("#die1").on({
	    	click:function(e){
	    		console.log("die1 ", e.target);
	    		live1.die("click", deal);
	    		live2.die("click");
	    	}
	    });
	    var un1 = $("#un1").on({
	    	click:function(e){
	    		console.log("un1", e.target);
	    		click1.un("click", deal);
	    	}
	    });
	});


})();