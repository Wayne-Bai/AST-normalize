Infertek.Animations.AnimationKeframe = function (valueAnimatorFunction, options) {
	/// <summary>
	/// Inicjuje instancję klatki animacji podanymi w argumencie opcjami.
	/// </summary>
	/// <param name="valueAnimatorFunction">Funkcja wykorzystywana do animowania wartości klatki kluczowej.</param>
	/// <param name="options" type="Object">
	/// Kolekcja opcji klatki animacji do ustawienia.
	/// <para>Dostępne do ustawienia opcje:</para>
	/// <para>targetValue - wartość, do jakiej dąży animacja w trakcie trwania tej kluczowej klatki.</para>
	/// <para>duration - czas trwania tej klatki w milisekundach.</para>
	/// <para>offset - odstęp pomiędzy poprzednią klatką a obecnąklatką - w milisekundach.</para>
	/// <para>blending - funkcja służąca do obliczania wartości animowanej właściwości na podstawie danych o przebiegu czasu.</para>
	/// </param>

	this.duration = 0;
	this.blendingFunction = window.Infertek.Animations.FrameBlendingFunctions.LinearBlending;
	this.offset = 0;
	this.targetValue = null;
	this.valueAnimatorFunction = valueAnimatorFunction;

	if (options !== undefined) {
		if (options.duration !== undefined)
			this.duration = options.duration;
		if (options.blending !== undefined) {
			this.blendingFunction = window.Infertek.Animations.FrameBlendingFunctions.GetBlendingByName(options.blending);
		}
		if (options.offset !== undefined)
			this.offset = options.offset;
		if (options.targetValue !== undefined)
			this.targetValue = options.targetValue;
	}
};

Infertek.Animations.AnimationKeframe.prototype = {
	animateValue: function (sourceValue, deltaTime) {
		/// <summary>
		/// Metoda animująca wartość źródłową właściwości wykorzystując informację o upływie czasu od początku
		/// tej klatki animacji.
		/// </summary>
		/// <param name="sourceValue">Wartość animowanej właściwości na początku tej klatki animacji.</param>
		/// <param name="deltaTime">Ilość milisekund, jaka upłynęła od początku tej klatki.</param>
		/// <returns type="Object">Wartość właściwości w tej milisekundzie animacji.</returns>

		return this.valueAnimatorFunction(sourceValue, this.getTargetValue(), this.blendingFunction(this, deltaTime));
	},
	getDuration: function () {
		/// <summary>
		/// Pobiera czas trwania tej klatki animacji.
		/// <para>Czas trwania jest wyrażony w milisekundach.</para>
		/// </summary>
		/// <returns type="Number">Czas trwania klatki animacji (w milisekundach).</returns>
        
		return this.duration;
	},
	getOffset: function () {
		/// <summary>
		/// Pobiera odstęp pomiędzy poprzednią klatką a obecną klatką.
		/// <para>Chodzi o odstęp czasowy wyrażony w milisekundach.</para>
		/// </summary>
		/// <returns type="Number">Odstep pomiędzy poprzednią klatką a rozpoczęciem tej klatki.</returns>
        
		return this.offset;
	},
	getTargetValue: function () {
		/// <summary>
		/// Pobiera wartość animowanej właściwości, do której dąży animacja w tej klatce.
		/// Wartość ta może się odnosić do dowolnej właściwości obiektu.
		/// </summary>
		/// <returns type="Object">Wartość, do której zmierza ta klatka kluczowa.</returns>
        
		return this.targetValue;
	}
};
