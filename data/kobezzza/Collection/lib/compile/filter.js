var tmpLinkFilter = Collection.prototype['_tmpLinkFilter'] = {},
	tmpFilter = {},
	tmpStrFilter = {};

{
	/**
	 * Анализировать тело заданного фильтра на возможность оптимизации
	 *
	 * @private
	 * @param {(string|!Function)} fn - исходный фильтр
	 * @param {?boolean=} [opt_update=false] - если true, то сбрасывается кеш фильтров
	 * @return {(string|!Function)}
	 */
	Collection.prototype._prepareFilter = function (fn, opt_update) {
		if (opt_update) {
			tmpStrFilter = {};
			tmpLinkFilter =
				Collection.prototype['_tmpLinkFilter'] = {};
		}

		if (fn.call) {
			let fnString = fn.toString(),
				cache = tmpFilter[fnString];

			if (cache) {
				fn['__COLLECTION_TMP__source'] = cache.source;
				fn['__COLLECTION_TMP__withThis'] = cache.withThis;
				fn['__COLLECTION_TMP__withYield'] = cache.withYield;

			} else {
				let desc = {};
				let fnSource = hideDeepFunctions(
					Escaper.replace(fnString, {'@all': true, '@comments': -1})
						.replace(nRgxp, '\n')
						.replace(stRgxp, ' '),

					desc
				);

				if (fnSource !== false) {
					if (isNativeRgxp.test(fnSource)) {
						fn['__COLLECTION_TMP__withThis'] = false;
						fn['__COLLECTION_TMP__withYield'] = false;

					} else {
						if (!desc.subs && desc.simple) {
							if (fnSource.slice(-1) === ';') {
								fnSource = fnSource.slice(0, -1);
							}

							let str = optimize(desc.args, String(fnSource));

							if (str !== false) {
								fn['__COLLECTION_TMP__source'] = `:${str}`;
							}
						}

						fn['__COLLECTION_TMP__withThis'] = !desc.arrFn &&
							(desc.hasThis || search(thisRgxp, String(fnSource)));

						fn['__COLLECTION_TMP__withYield'] = search(yieldRgxp, String(fnSource));
					}
				}

				tmpFilter[fnString] = {
					source: fn['__COLLECTION_TMP__source'] || null,
					withThis: fn['__COLLECTION_TMP__withThis'],
					withYield: fn['__COLLECTION_TMP__withYield']
				};
			}
		}

		return fn;
	};

	//#if filter.id

	/**
	 * Раскрыть ссылку на фильтр
	 * (метод раскрывает ссылки: a -> b -> function и
	 * если нужно производит компиляцию фильтра с последующим кешированием)
	 *
	 * @private
	 * @param {(string|boolean|Function)} filter - исходный фильтр
	 * @return {{filter: (string|boolean|!Function), key: string}}
	 */
	Collection.prototype._expandFilter = function (filter) {
		var fin = filter;

		if (fin && fin !== true && !fin.call) {
			if (tmpLinkFilter[fin] !== undefined) {
				fin = tmpLinkFilter[fin];

			} else {
				while (fin && fin !== true && !fin.call) {
					if (isStringExpressionRgxp.test(fin)) {
						fin = compileFunc(fin);
						break;

					} else {
						if (isFilterRgxp.test(fin)) {
							break;
						}

						fin = this._get('filter', fin);
					}
				}

				tmpLinkFilter[filter] = fin;
			}
		}

		return {
			filter: fin || true,
			key: String(filter)
		};
	};

	//#endif

	/**
	 * Анализировать развёрнутое дерево фильтров
	 * и произвести инлайнинг
	 *
	 * @private
	 * @param {!Array} tree - дерево исходного фильтра
	 * @return {{filter: string, length: number, withYield: boolean}}
	 */
	Collection.prototype._concatFilter = function (tree) {
		var chainLength = tree.length;
		var res = '',
			maxLength = 0,
			withYield = false;

		for (let i = -1; ++i < chainLength;) {
			let el = tree[i];
			let logic = el.logic ?
				` ${el.logic} ` : '';

			let inverse = el.inverse ?
				'!' : '';

			res += logic;
			if (isArray(el)) {
				let deep = this._concatFilter(el);

				if (deep.length > maxLength) {
					maxLength = deep.length;
				}

				res += `${inverse}(${deep.filter})`;

			} else {
				res += `(${inverse ? '!' : ''}(f = `;
				let filter;

				if (el.str) {
					let fn = el.str;
					filter = compileFunc(fn);

					if (filter.inline) {
						res += filter['__COLLECTION_TMP__source'].substring(1);

					} else {
						res += `this._tmpLinkFilter['${fn}']`;

						if (filter['__COLLECTION_TMP__withThis']) {
							res += '.call(this, ';

						} else {
							res += '(';
						}

						if (filter.length === filterArgs.length) {
							filter['__COLLECTION_TMP__args'][filter['__COLLECTION_TMP__args'].length - 1] =
								`this._tmpLinkFilter['${fn}']`;
						}

						res += `${filter['__COLLECTION_TMP__args']})`;
					}

				} else {
					let key = el.fnKey;
					filter =
						tmpLinkFilter[key] = this._get('filter', key);

					res += `this._tmpLinkFilter['${key}']`;

					if (filter['__COLLECTION_TMP__withThis']) {
						res += '.call(this, ';

					} else {
						res += '(';
					}

					if (filter['__COLLECTION_TMP__args']) {
						if (filter.length === filterArgs.length) {
							filter['__COLLECTION_TMP__args'][filter['__COLLECTION_TMP__args'].length - 1] =
								`this._tmpLinkFilter['${key}']`;
						}

						res += `${filter['__COLLECTION_TMP__args']})`;

					} else {
						let a = filterArgs.slice();
						a[a.length - 1] = `this._tmpLinkFilter['${key}']`;
						res += `${a.slice(0, filter.length)})`;
					}
				}

				if (!withYield) {
					withYield = filter['__COLLECTION_TMP__withYield'];
				}

				if (maxLength < filter.length) {
					maxLength = filter.length;
				}

				res += ') && f !== FALSE || f === TRUE)';
			}
		}

		return {
			filter: res,
			length: maxLength,
			withYield: withYield
		};
	};

	//#if filter.id

	/**
	 * Рассчитать заданный вложенный фильтр
	 * (метод возвращает объект вложенных элементов)
	 *
	 * @param {!Array} array - массив атомов
	 * @param {number} iter - номер итерации
	 * @return {?{result: !Array, iteration: number}}
	 */
	function calculateDeepFilter(array, iter) {
		var length = array.length;
		var pos = 0,
			res = [];

		for (let i = -1; ++i < length;) {
			iter++;

			if (array[i] === '(' || array[i] === '!(') {
				pos++;
			}

			if (array[i] === ')') {
				if (pos === 0) {
					return {
						result: res,
						iteration: iter
					};

				} else {
					pos--;
				}
			}

			res.push(array[i]);
		}

		return null;
	}

	//#endif

	let fPartsRgxp = /\s*(\|\||&&|\(|\))\s*/g,
		reverseRgxp = /!\s*/g;

	let logic = {
		'||': true,
		'&&': true
	};

	let open = {
		'(': true,
		'!(': true
	};

	let ufilter = {
		')': true,
		'||': true,
		'&&': true
	};

	/**
	 * Скомпилировать сложный фильтр
	 * (метод проводит полный анализ фильтра, инлайнинг и функциональную декомпозицию)
	 *
	 * @private
	 * @param {(string|!Function|boolean|!Array)} filter -
	 *     1) функция-фильтр;
	 *     2) строковое выражение (запись эквивалентна: return + строковое выражение);
	 *     3) true (если фильтр отключён)
	 *
	 * @param {Array=} [opt_tree] - дерево исходного фильтра
	 * @param {?boolean=} [opt_subFunc] - если true, то вызов функции считается дочерним
	 * @param {?string=} [opt_fnKey] - ключ функции из кеша
	 * @return {({filter: string, length: number, withYield: boolean}|undefined)}
	 */
	Collection.prototype._compileFilter = function (filter, opt_tree, opt_subFunc, opt_fnKey) {
		var key = filter;

		if (tmpStrFilter[key] && !opt_subFunc) {
			return tmpStrFilter[key];
		}

		/** @type {?} */
		var tree = opt_subFunc ?
			opt_tree : [];

		if (filter.call || isBoolean(filter)) {
			tree.push({
				str: filter['__COLLECTION_TMP__source'],
				fnKey: opt_fnKey
			});

			if (!opt_subFunc) {
				let desc = this._concatFilter(tree);
				desc.filter = Escaper.paste(desc.filter);
				return desc;
			}

			return;
		}

		//#if filter.id

		if (!isArray(filter)) {
			filter = filter.trim();

			if (isStringExpressionRgxp.test(filter)) {
				let fn = compileFunc(filter);

				if (!opt_subFunc && fn.inline) {
					return {
						filter: fn['__COLLECTION_TMP__source'].substring(1),
						withYield: fn['__COLLECTION_TMP__withYield'],
						length: fn.length
					};

				} else {
					tree.push({
						str: fn['__COLLECTION_TMP__source']
					});

					if (!opt_subFunc) {
						return this._concatFilter(tree);
					}
				}

				return;
			}

			// Подготовка строки условия:
			// строка вида (a&&(!b)) станет ( a && ( ! b ) )
			filter = Escaper.replace(filter, true)
				.replace(fPartsRgxp, ' $1 ')
				.replace(reverseRgxp, '!')
				.split(' ');

			for (let i = filter.length; i--;) {
				if (filter[i] === '') {
					filter.splice(i, 1);
				}
			}
		}

		var length = filter.length;
		var rel = '',
			inverse = false;

		for (let i = -1; ++i < length;) {
			if (open[filter[i]]) {
				inverse = filter[i].charAt(0) === '!';

				if (inverse) {
					filter[i] = filter[i].substring(1);
				}

				let stack = [];
				tree.push(stack);

				let deep = calculateDeepFilter(filter.slice(i + 1), i);
				i = deep.iteration;

				this._compileFilter(deep.result.join(' '), stack, true);

				stack.inverse = inverse;
				stack.logic = rel;

			} else if (!ufilter[filter[i]]) {
				inverse = filter[i].charAt(0) === '!';

				if (inverse) {
					filter[i] = filter[i].substring(1);
				}

				let desc = this._expandFilter(filter[i]),
					fnKey = desc.key;

				if (desc.filter !== true) {
					let stack;

					if (isString(desc.filter) || desc.filter['__COLLECTION_TMP__source']) {
						stack = [];
						tree.push(stack);
					}

					this._compileFilter(desc.filter, stack || tree, true, fnKey);
				}

				if (tree.length) {
					let pos = tree.length - 1;
					tree[pos].inverse = inverse;
					tree[pos].logic = rel;
				}

			} else if (logic[filter[i]]) {
				rel = filter[i];
			}
		}

		if (!opt_subFunc) {
			let desc = this._concatFilter(tree);

			// String() враппер, т.к. ругается GCC
			desc.filter = Escaper.paste(String(desc.filter));
			tmpStrFilter[key] = desc;

			return desc;
		}

		//#endif
	};
}
