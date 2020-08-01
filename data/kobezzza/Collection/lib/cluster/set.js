//#include ./add.js

/**
 * Установить новый активный кластерный параметр
 *
 * @private
 * @param {string} clusterName - название кластерного параметра
 *     (например: 'collection', 'parser', 'filter', и т.д.)
 *
 * @param {?string=} [opt_id] - ИД параметра в кластере
 * @return {!Collection}
 */
Collection.prototype._set = function (clusterName, opt_id) {
	if (opt_id == null || opt_id === 'active') {
		return this;
	}

	var key = toUpperCase(clusterName, 1);

	if (!this._isExistsInCluster(clusterName, opt_id)) {
		throw new ReferenceError(`The object "${opt_id}" (${clusterName}) doesn\'t exist in the cluster!`);
	}

	this.__sys[`active${key}Id`] = opt_id;
	this.__active[clusterName] = this.__sys[`tmp${key}`][opt_id];

	return this;
};

/**
 * Установить новую активную коллекцию
 *
 * @param {string} id - ИД коллекции
 * @return {!Collection}
 */
Collection.prototype.setCollection = function (id) {
	return this._set('collection', id);
};

/**
 * Добавить новую коллекцию в кластер и установить её активной
 *
 * @param {string} id - ИД коллекции
 * @param {$$CollectionType} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetCollection = function (id, val) {
	return this._add('collection', id, val)._set('collection', id);
};

/**
 * Установить новый активный фильтр
 *
 * @param {string} id - ИД фильтра
 * @return {!Collection}
 */
Collection.prototype.setFilter = function (id) {
	return this._set('filter', id);
};

/**
 * Добавить новый фильтр в кластер и установить его активным
 *
 * @param {string} id - ИД фильтра
 * @param {!$$CollectionFilter} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetFilter = function (id, val) {
	return this._add('filter', id, val)._set('filter', id);
};

/**
 * Установить новый активный контекст
 *
 * @param {string} id - ИД контекста
 * @return {!Collection}
 */
Collection.prototype.setContext = function (id) {
	return this._set('context', id);
};

/**
 * Добавить новый контекст в кластер и установить его активным
 *
 * @param {string} id - ИД контекста
 * @param {$$CollectionLink} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetContext = function (id, val) {
	return this._add('context', id, val)._set('context', id);
};

/**
 * Установить новую активную переменную
 *
 * @param {string} id - ИД переменной
 * @return {!Collection}
 */
Collection.prototype.setVar = function (id) {
	return this._set('var', id);
};

/**
 * Добавить новую переменную в кластер и установить её активной
 *
 * @param {string} id - ИД переменной
 * @param {?} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetVar = function (id, val) {
	return this._add('var', id, val)._set('var', id);
};

/**
 * Установить новое активное пространство имён
 *
 * @param {string} id - ИД пространства имён
 * @return {!Collection}
 */
Collection.prototype.setNamespace = function (id) {
	return this._set('namespace', id);
};

/**
 * Добавить новое пространство имён в кластер и установить его активным
 *
 * @param {string} id - ИД пространства имён
 * @param {string} val - значение
 * @return {!Collection}
 */
Collection.prototype.addAndSetNamespace = function (id, val) {
	return this._add('namespace', id, val)._set('namespace', id);
};
