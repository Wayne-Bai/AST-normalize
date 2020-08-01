/**
 * Удалить элемент/ы из коллекции по заданному условию или указателю
 *
 * @param {($$CollectionFilter|$$CollectionLink|?$$CollectionIteratorInterface)=} [opt_filterOrParams='active'] -
 *     1) функция-фильтр;
 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
 *     3) true (если фильтр отключён);
 *     4) указатель (перегрузка).
 *     ИЛИ объект, свойствами которого указаны параметры функции (приставки opt_ отбрасываются)
 *
 * @param {?string=} [opt_id='active'] - ИД коллекции
 * @param {?boolean=} [opt_mult=true] - если false, то после первой успешной итерации цикл прерывается
 *
 * @param {?number=} [opt_count] - максимальное количество удалений (по умолчанию весь объект)
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
 * @param {?string=} [opt_use] - тип используемого цикла: for или for in
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
 * @return {(!Collection|!Generator|!Array|{result: boolean, key, value})}
 */
Collection.prototype.remove = function (
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
	var old = opt_filterOrParams;

	if (isObject(opt_filterOrParams)) {
		/** @type {$$CollectionIteratorInterface} */
		let p = _.any(opt_filterOrParams || {});
		opt_id = _(opt_id, p.id);
		opt_mult = _(opt_mult, p.mult);
		opt_reverse = _(opt_reverse, p.reverse);
		opt_live = _(opt_live, p.live);
		opt_context = _(opt_context, p.context);
		opt_chain = _(opt_chain, p.chain);
		opt_onComplete = _(opt_onComplete, p.onComplete);
		opt_filterOrParams = _.any(p.filter);
	}

	if (opt_filterOrParams != null && !isFunction(opt_filterOrParams) && (
		isString(opt_filterOrParams) && !this._isFilter(opt_filterOrParams) ||
		isArray(opt_filterOrParams) ||
		isNumber(opt_filterOrParams) ||
		isLink(opt_filterOrParams)
	)) {

		let tmp = this._chain(this._removeOne(this._joinContexts(opt_context, opt_filterOrParams), opt_id), opt_chain);

		if (opt_onComplete) {
			opt_onComplete.call(this, tmp);
		}

		return tmp;
	}

	var data = this._getOne(opt_context, opt_id),
		type = getType(data, opt_use);

	if (type === 'iterator' || type === 'generator') {
		throw new TypeError('Incorrect data type');
	}

	var action,
		res = [];

	switch (type) {
		case 'map':
			action = function (el, key, data) {
				data.delete(key);

				res.push({
					result: !data.has(key),
					key: key,
					value: el
				});
			};

			break;

		case 'set':
			action = function (el, key, data) {
				data.delete(el);

				res.push({
					result: !data.has(el),
					key: null,
					value: el
				});
			};

			break;

		case 'array':
			if (opt_reverse) {
				action = function (el, key, data) {
					splice.call(data, key, 1);

					res.push({
						result: data[key] !== el,
						key: key,
						value: el
					});
				};

			} else {
				let rm = 0;

				if (opt_live) {
					action = function (el, key, data) {
						splice.call(data, key, 1);
						this.modi(-1);

						res.push({
							result: data[key] !== el,
							key: key + rm,
							value: el
						});

						rm++;
					};

				} else {
					action = function (el, key, data, i, length) {
						var ln = length();
						var fn = (length) => {
							if (rm === length) {
								return false;
							}

							splice.call(data, key, 1);
							this.i(-1);

							res.push({
								result: data[key] !== el,
								key: key + rm,
								value: el
							});

							rm++;
						};

						if (isNumber(ln)) {
							fn(ln);

						} else {
							this.wait(ln, fn);
						}
					};
				}
			}

			break;

		default:
			action = function (el, key, data) {
				delete data[key];

				res.push({
					result: key in data === false,
					key: key,
					value: el
				});
			};
		}

	var returnVal = this.forEach(
		action,
		old,
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
		res,
		opt_thread,
		opt_priority,
		opt_onIterationEnd,

		function () {
			if (opt_mult === false) {
				if (0 in res) {
					res = res[0];

				} else {
					res = {
						result: false,
						key: type === 'set' ?
							null : undefined,

						value: undefined
					};
				}
			}

			this._chain(res, opt_chain);

			if (opt_onComplete) {
				opt_onComplete.call(this, res);
			}
		},

		opt_onChunk,
		opt_generator
	);

	if (returnVal !== this) {
		return returnVal;
	}

	return opt_chain ? this : res;
};
