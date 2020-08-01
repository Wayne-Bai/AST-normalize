Infertek.Animations.FrameBlendingFunctions = {
	GetBlendingByName: function (blendingFunctionName) {
		/// <summary>
		/// Metoda pobierająca funkcję przejścia po nazwie podanej w argumencie.
		/// </summary>
		/// <param name="blendingFunctionName" type="String">Nazwa funkcji przejścia do pobrania.</param>
		/// <returns type="Function">Pobrana funkcja.</returns>

		if (blendingFunctionName == "linear")
			return Infertek.Animations.FrameBlendingFunctions.LinearBlending;
		if (blendingFunctionName == "slideIn")
			return Infertek.Animations.FrameBlendingFunctions.SlideInBlending;

		throw "Invlaid blending function name: " + blendingFunctionName;
	},
	LinearBlending: function (keyframe, deltaTime) {
		/// <summary>
		/// Pobiera wartość wymaganą do animowania właściwości.
		/// <para>Jako, że jest to animacja liniowa to wartość animacji zmienia się liniowo 
		/// od wartości 0 do wartości 1</para>
		/// </summary>
		/// <param name="keyframe" type="Infertek.Animations.AnimationKeyframe">Obiekt klatki kluczowej, na rzecz której obliczyć wartość.</param>
		/// <param name="deltaTime" type="Number">Ilość milisekund jakie upłynęły od początku klatki kluczowej.</param>
		/// <returns type="Number">Wartość o jaką zeskalować właściwość - z zakresu 0-1.</returns>
        
		return (deltaTime - keyframe.getOffset()) / keyframe.getDuration();
	},
	SlideInBlending: function (keyframe, deltaTime) {
		/// <summary>
		/// Pobiera wartość wymaganą do animowania właściwości.
		/// Opiera się ona na funkcji dwojga kwadratów ;)
		/// Oto przykład funkcji: http://www.wolframalpha.com/input/?i=x%28t%29+%3D+%280.99+*+t%5E2%29+%2B+%281+-+%280.99+*+t%5E2%29%29+*+t
		/// </summary>
		/// <param name="keyframe" type="Infertek.Animations.AnimationKeyframe">Obiekt klatki kluczowej, na rzecz której obliczyć wartość.</param>
		/// <param name="deltaTime" type="Number">Ilość milisekund jakie upłynęły od początku klatki kluczowej.</param>
		/// <returns type="Number">Wartość o jaką zeskalować właściwość - z zakresu 0-1.</returns>
		
		var animationCompletion = ((deltaTime - keyframe.getOffset()) / keyframe.getDuration());
		var modificator = 0.99;
		return (modificator * (animationCompletion * animationCompletion)) + (1 - (modificator * (animationCompletion * animationCompletion))) * animationCompletion;
	}
};