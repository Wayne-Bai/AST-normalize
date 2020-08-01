//#include ./map.js

/**
 * Создать новую коллекцию из элементов старой, которые подойдут под заданное условие,
 * аналог Array.prototype.filter
 *
 * @param {($$CollectionFilter|?$$CollectionIteratorInterface)=} [opt_filterOrParams='active'] -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} [opt_id='active'] - ИД коллекции
 * @param {?boolean=} [opt_mult=true] - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество элементов (по умолчанию весь объект)
 * @param {?number=} [opt_from=0] - количество пропускаемых успешных итераций
 * @param {?number=} [opt_startIndex=0] - начальная позиция поиска
 * @param {?number=} [opt_endIndex] - конечная позиция поиска (включается)
 *
 * @param {?boolean=} [opt_reverse=false] - если true, то обход коллекции идёт с хвоста (спуск)
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
 * @param {?string=} [opt_use] - тип используемого цикла внутри итератора: for, for of или for in
 * @param {Object=} [opt_vars] - объект добавляемых переменных в кластер
 *
 * @see Collection.prototype.byLink
 * @param {$$CollectionLink=} [opt_context] - дополнительный контекст
 *
 * @param {?boolean=} [opt_chain=false] - если true, то метод установит полученную коллекцию активной
 *     и вернёт ссылку на экземпляр Collection (только в случае синхронной операции)
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
 * @return {(!Collection|!Generator|!Object)}
 */
Collection.prototype.filter = function (
	opt_filterOrParams,
	opt_id,
	opt_mult,
	opt_count,
	opt_from,
	opt_startIndex,
	opt_endIndex,
	opt_reverse,
	opt_inverseFilter,
	opt_notOwn,
	opt_live,
	opt_use,
	opt_vars,
	opt_context,
	opt_chain,
	opt_thread,
	opt_priority,
	opt_onIterationEnd,
	opt_onComplete,
	opt_onChunk,
	opt_generator
) {
	return this.map(
		(el) => el,
		opt_filterOrParams,
		opt_id,
		opt_mult,
		opt_count,
		opt_from,
		opt_startIndex,
		opt_endIndex,
		opt_reverse,
		opt_inverseFilter,
		opt_notOwn,
		opt_live,
		opt_use,
		opt_vars,
		opt_context,
		null,
		opt_chain,
		opt_thread,
		opt_priority,
		opt_onIterationEnd,
		opt_onComplete,
		opt_onChunk,
		opt_generator
	);
};
