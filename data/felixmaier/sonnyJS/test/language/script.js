(function() {

    SONNY.PAGEPATH = "../../templates/";

	SONNY.CONFIGPATH = "./config.json";

    var instance = new SONNY.Instance(function() {

        var renderer = new SONNY.Renderer(instance);
            renderer.render("public/login.html");
			
			renderer.render("public/language.html");

		document.querySelector("#ger").onclick = function(){

			instance.LANGUAGE = "de";

			instance.rebuild();

			renderer.render(instance.CURRENTPAGE);

		};
		
		document.querySelector("#en").onclick = function(){

			instance.LANGUAGE = "en";

			instance.rebuild();

			renderer.render(instance.CURRENTPAGE);

		};

    });

})();