//#include ../core/link.js
//#include ./remove.js

/**
 * Удалить элемент из начала коллекции,
 * аналог Array.prototype.shift
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} [opt_filterOrParams='active'] -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} [opt_id='active'] - ИД коллекции
 * @param {?number=} [opt_from=0] - количество пропускаемых успешных итераций
 * @param {?number=} [opt_startIndex=0] - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} [opt_inverseFilter=false] - если true,
 *     то успешной итерацией считается отрицательный результат
 *
 * @param {(boolean|number|null)=} [opt_notOwn=false] - если true,
 *     то итерации по объекту идут с учётом свойств прототипа,
 *     a если -1, то только свойства прототипа
 *
 * @param {?boolean=} [opt_live=false] - если true, то начальная длина коллекции не кешируется,
 *     т.е. добавленные во время операции элементы будут участвовать в обходе
 *     (только для массивов, массиво-подобных объектов, Map, Set и opt_reverse = false)
 *
 * @param {?string=} [opt_use] - тип используемого цикла: for или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} [opt_thread=false] - если true, то операция разбивается на части и выполняется отложено,
 *     а сам метод вернёт ссылку на объект-генератор
 *
 * @param {?string=} [opt_priority='normal'] - приоритет отложенной задачи (low, normal, hight, critical)
 * @param {?function(this:Collection, ?)=} [opt_onIterationEnd] - функция обратного вызова на завершение итерации
 * @param {?function(this:Collection, ?)=} [opt_onComplete] - функция обратного вызова на завершение операции
 * @param {?function(this:Collection, ?)=} [opt_onChunk] - функция обратного вызова на
 *     завершение части отложенной операции
 *
 * @param {?boolean=} [opt_generator] - если true, то операция компилируется как генератор
 * @return {(!Generator|{result: boolean, key, value})}
 */
Collection.prototype.shift = function (
	opt_filterOrParams,
	opt_id,
	opt_from,
	opt_startIndex,
	opt_endIndex,
	opt_inverseFilter,
	opt_notOwn,
	opt_live,
	opt_use,
	opt_vars,
	opt_context,
	opt_thread,
	opt_priority,
	opt_onIterationEnd,
	opt_onComplete,
	opt_onChunk,
	opt_generator
) {
	var old = opt_filterOrParams;

	if (isObject(opt_filterOrParams)) {
		/** @type {$$CollectionIteratorInterface} */
		let p = _.any(opt_filterOrParams || {});
		opt_id = _(opt_id, p.id);
		opt_context = _(opt_context, p.context);
		opt_onComplete = _(opt_onComplete, p.onComplete);
		opt_filterOrParams = _.any(p.filter);
	}

	if (opt_filterOrParams == null) {
		let tmp = this._removeOne(this._joinContexts(opt_context, 'eq(0)'), opt_id);

		if (opt_onComplete) {
			opt_onComplete.call(this, tmp);
		}

		return tmp;
	}

	return _.any(this.remove(
		old,
		opt_id,
		false,
		null,
		opt_from,
		opt_startIndex,
		opt_endIndex,
		false,
		opt_inverseFilter,
		opt_notOwn,
		opt_live,
		opt_use,
		opt_vars,
		opt_context,
		false,
		opt_thread,
		opt_priority,
		opt_onIterationEnd,
		opt_onComplete,
		opt_onChunk,
		opt_generator
	));
};
