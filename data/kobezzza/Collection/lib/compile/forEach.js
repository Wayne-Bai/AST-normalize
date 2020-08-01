var tmpCycleStr = {};

{
	let callbackArgs = [
		'el',
		'key',
		'data',
		'i',
		'length',
		'filter'
	];

	let qRgxp = /"/g,
		timeout;

	/**
	 * Компилировать цикл по заданным параметрам
	 *
	 * @private
	 * @param {string} key - ключ, под которым цикл будет хранится в кеше
	 *
	 * @param {number} callbackArgsLength - количество аргументов в функции callback
	 * @param {?string} callbackStr - строка для инлайнинга функции
	 * @param {boolean} callbackWithThis - если true, то используется this внутри callback
	 * @param {boolean} callbackWithYield - если true, то используется yield внутри callback
	 * @param {boolean} thread - если true, то операция разбивается на части и выполняется отложено
	 * @param {boolean} callbackWithReturn - если true, то используется return внутри callback
	 *
	 * @param {(!Array|boolean)} filters - массив фильтров:
	 *     [0] - заданный фильтр,
	 *     [1] - активный фильтр
	 *
	 * @param {!Array} filterArgsLength - количество аргументов в заданных фильтрах (см. filters)
	 * @param {!Array} filterWithThis - использование this в фильтрах (см. filters)
	 *
	 * @param {(boolean|number)} notOwn - если true,
	 *     то итерации по объекту идут с учётом свойств прототипа,
	 *     a если -1, то только свойства прототипа
	 *
	 * @param {boolean} live - если true, то длина коллекции не кешируется
	 *     (только для массивов и массиво-подобных объектов)
	 *
	 * @param {boolean} inverseFilter - если true,
	 *     то успешной итерацией считается отрицательный результат
	 *
	 * @param {string} type - тип данных коллекции:
	 *     array - массивы и массиво-подобные объекты,
	 *     map - экземпляры Map,
	 *     set - экземпляры Set,
	 *     iterator - объекты-итераторы или объекты с методом @@iterator,
	 *     generator - функции-генераторы
	 *
	 * @param {boolean} reverse - если true, то обход коллекции идёт с хвоста (спуск)
	 * @param {boolean} mult - если false, то после первой успешной итерации цикл прерывается
	 *
	 * @param {(number|boolean)} count - максимальное количество элементов в ответе (по умолчанию весь объект)
	 * @param {(number|boolean)} from - количество пропускаемых успешных итераций
	 * @param {(number|boolean)} startIndex - начальная позиция поиска
	 * @param {(number|boolean)} endIndex - конечная позиция поиска
	 *
	 * @return {Function}
	 */
	Collection.prototype._compileCycle = function (
		key,
		callbackArgsLength,
		callbackStr,
		callbackWithThis,
		callbackWithYield,
		thread,
		callbackWithReturn,
		filters,
		filterArgsLength,
		filterWithThis,
		notOwn,
		live,
		inverseFilter,
		type,
		reverse,
		mult,
		count,
		from,
		startIndex,
		endIndex
	) {

		var isGenerator = callbackWithYield || thread,
			isMapSet = type === 'map' || type === 'set';

		var cantModi = (isMapSet && STRUCT_OPT) || (
			type !== 'array' &&

			(
				(type === 'object' && (notOwn || !keys)) ||
				(!reverse && (type !== 'object' || !keys || notOwn))
			)
		);

		var iFn = /* cbws */`
			var that = this;

			function decl() {
				var last = that._iStack[that._iStack.length - 1];

				function empty() {
					return false;
				}

				that.yield =
					that._global.\$cYield = last ?
						last.yield : empty;

				that.sleep =
					that._global.\$cSleep = last ?
						last.sleep : empty;

				that.next =
					that._global.\$cNext = last ?
						last.next : empty;

				that.wait =
					that._global.\$cWait = last ?
						last.wait : empty;

				that.onComplete =
					that._global.\$cOnComplete = last ?
						last.onComplete : empty;

				that['break'] =
					that.brk =
					that._global.\$cBreak =
					that._global.\$cBrk = last ?
						last.breaker : empty;

				that.modi =
					that.i =
					that._global.\$cModi =
					that._global.\$cI = last ?
						last.modi : empty;

				that.jump =
					that._global.\$cJump = last ?
						last.jump : empty;

				that.reset =
					that._global.\$cReset = last ?
						last.reset : empty;

				that.$ = last ?
					last.cache : null;

				that._ = last ?
					last.info : null;

				that.result = last && last.inject;
			}
		`;

		var pop = /* cbws */`
			if (${thread}) {
				link.self.result = that.result;
			}

			that._iStack.pop();
			decl();
		`;

		var push = /* cbws */`
			that._iStack.push(stackObj);
			decl();
		`;

		iFn += /* cbws */`
			var wait = 0,
				onGlobalComplete;

			var i = -1,
				j = 0;

			var n = null,
				breaker = false;

			var results = [];
			var yielder = false,
				yieldVal;

			var timeStart,
				timeEnd,
				time = 0;

			var limit = 1,
				looper = 0;

			var aLength,
				f;

			var TRUE = this.TRUE,
				FALSE = this.FALSE;

			var NULL = this.NULL;
			var el,
				key;

			var arr = [],
				tmp = {};

			var info = {
				startIndex: ${startIndex},
				endIndex: ${endIndex},
				from: ${from},
				count: ${count},
				live: ${live},
				reverse: ${reverse},
				notOwn: ${notOwn},
				inverseFilter: ${inverseFilter},
				type: '${type}',
				thread: ${thread} && link.self,
				id: id
			};

			var stackObj = {
				cache: tmp,
				info: info,
				inject: inject,

				yield: function (opt_val) {
					if (${!isGenerator}) {
						return false;
					}

					yielder = true;
					yieldVal = opt_val;

					return true;
				},

				next: function () {
					if (${!isGenerator}) {
						return false;
					}

					link.self.next();
					return true;
				},

				sleep: function (time, opt_test, opt_interval) {
					if (${!isGenerator}) {
						return false;
					}

					stackObj.yield();
					link.self.sleep = setTimeout(function () {
						if (opt_test) {
							${push}
							var test = opt_test.call(that);
							${pop}

							if (test) {
								link.self.next();

							} else if (opt_interval) {
								stackObj.sleep(time, opt_test, opt_interval);
							}

						} else {
							link.self.next();
						}
					}, time);

					return link.self.sleep;
				},

				wait: function (thread, opt_onComplete) {
					if (!thread || !thread.thread) {
						if (opt_onComplete) {
							opt_onComplete.call(that, thread);
						}

						results.push(thread);

						if (!wait) {
							if (onGlobalComplete) {
								onGlobalComplete.call(that, results);
								onGlobalComplete = null;
							}

							results = [];
						}

						return false;
					}

					stackObj.yield();
					wait++;

					var onComplete = thread.onComplete;
					thread.onComplete = function (val) {
						if (wait) {
							wait--;
						}

						results.push(val);
						${push}

						if (opt_onComplete) {
							opt_onComplete.call(that, val);
						}

						if (onComplete) {
							onComplete.call(that, val);
						}

						if (!wait) {
							yielder = false;

							if (onGlobalComplete) {
								onGlobalComplete.call(that, results);
								onGlobalComplete = null;
							}

							results = [];
							${pop}

							if (!yielder) {
								stackObj.next();
							}

						} else {
							${pop}
						}
					};

					return true;
				},

				onComplete: function (callback) {
					if (!wait) {
						callback.call(that, results);
						results = [];
						return false;
					}

					onGlobalComplete = callback;
					return true;
				},

				breaker: function () {
					breaker = true;
					return true;
				},

				jump: function (val) {
					if (${cantModi}) {
						return false;
					}

					n = val - 1;
					return n;
				},

				modi: function (val) {
					if (${cantModi}) {
						return false;
					}

					n += val;
					return n;
				},

				reset: function () {
					breaker = true;
					limit++;
					return true;
				}
			};
		`;

		if (thread) {
			iFn += 'stackObj.thread = link.self;';
		}

		startIndex = startIndex || 0;
		var enabledActiveFilter = filters[1] &&
			!isBoolean(filters[1]);

		var enabledFilter = filters[0] &&
			!isBoolean(filters[0]);

		/** @type {!Array} */
		var cbArgs = _.any(callbackArgs.slice());
		var maxArgsLength = Math.max(callbackArgsLength, filterArgsLength[0] || 0, filterArgsLength[1] || 0);

		// Замена вызов callee
		// и оптимизация arguments
		cbArgs[cbArgs.length - 1] = 'callback';
		cbArgs = cbArgs.slice(0, callbackArgsLength);

		if (from) {
			iFn += `var from = ${from};`;
		}

		var threadStart = '',
			threadEnd = '';

		if (thread) {
			threadStart = /* cbws */`
				if (timeStart == null) {
					${push}
					timeStart = new Date().valueOf();
				}
			`;

			threadEnd = /* cbws */`
				timeEnd = new Date().valueOf();
				time += timeEnd - timeStart;
				timeStart = timeEnd;

				if (time > this._priority[link.self.priority]) {
					${pop}
					yield n;
					time = 0;
					timeStart = null;
				}
			`;

		} else {
			iFn += push;
		}

		iFn += 'while (limit !== looper) {';

		switch (type) {
			case 'array':
				iFn += /* cbws */`
					var cloneObj,
						dLength = data.length - 1;

					cloneObj = data;
				`;

				if (reverse) {
					iFn += 'cloneObj = arr.slice.call(cloneObj).reverse();';
				}

				if ((reverse || !live) && (startIndex || endIndex !== false)) {
					iFn += /* cbws */`
						cloneObj = arr.slice
							.call(cloneObj, ${startIndex}, ${endIndex !== false ? endIndex + 1 : 'data.length'});
					`;
				}

				if (!reverse && live) {
					iFn += `for (n = ${startIndex - 1}; ++n < cloneObj.length;) {`;

					if (startIndex) {
						iFn += /* cbws */`
							if (n < ${startIndex}) {
								continue;
							}
						`;
					}

					if (endIndex !== false) {
						iFn += /* cbws */`
							if (n > ${endIndex}) {
								break;
							};
						`;
					}

				} else {
					iFn += /* cbws */`
						aLength = cloneObj.length;
						for (n = -1; ++n < aLength;) {
					`;
				}

				if (maxArgsLength) {
					if (maxArgsLength > 1) {
						if (startIndex) {
							// Индекс элемента,
							// т.к. значение i может не совпадать (если указан startIndex)
							iFn += `key = ${reverse ? 'dLength - (' : ''} n + ${startIndex + (reverse ? ')' : '')};`;

						} else {
							iFn += `key = ${reverse ? 'dLength - ' : ''} n;`
						}
					}

					iFn += 'el = cloneObj[n];';

					if (maxArgsLength > 3) {
						iFn += `i = n + ${startIndex};`;
					}
				}

				break;

			case 'object':
				if (reverse || (keys && !notOwn)) {
					iFn += 'var tmpArray;';

					if (!notOwn && keys && !thread) {
						iFn += 'tmpArray = this._keys(data);';

					} else {
						iFn += 'tmpArray = [];';

						if (notOwn) {
							if (notOwn === -1) {
								iFn += /* cbws */`
									for (var key in data) {
										${threadStart}
										if (data.hasOwnProperty(key)) {
											continue;
										}

										tmpArray.push(key);
										${threadEnd}
									}
								`;

							} else {
								iFn += /* cbws */`
									for (var key in data) {
										${threadStart}
										tmpArray.push(key);
										${threadEnd}
									}
								`;
							}

						} else {
							iFn += /* cbws */`
								for (var key in data) {
									${threadStart}
									if (!data.hasOwnProperty(key)) {
										continue;
									}

									tmpArray.push(key);
									${threadEnd}
								}
							`;
						}
					}

					if (reverse) {
						iFn += 'tmpArray.reverse();';
					}

					if (startIndex || endIndex !== false) {
						iFn += /* cbws */`tmpArray = tmpArray.slice(${startIndex},
							${endIndex !== false ? endIndex + 1 : 'tmpArray.length'});
						`;
					}

					iFn += /* cbws */`
						aLength = tmpArray.length;
						for (n = -1; ++n < aLength;) {
							key = tmpArray[n];

							if (key in data === false) {
								continue;
							}

							${maxArgsLength > 3 ? `i = n + ${startIndex};` : ''}
					`;

				} else {
					iFn += /* cbws */`
						for (key in data) {
							${notOwn === false ?
								`if (!data.hasOwnProperty(key)) {
									continue;
								}` : notOwn === -1 ?

								`if (data.hasOwnProperty(key)) {
									continue;
								}` : ''
							}

							${maxArgsLength > 3 || startIndex || endIndex !== false ? 'i++' : ''};
					`;

					if (startIndex) {
						iFn += /* cbws */`
							if (i < ${startIndex}) {
								continue;
							}
						`;
					}

					if (endIndex !== false) {
						iFn += /* cbws */`
							if (i > ${endIndex}) {
								break;
							};
						`;
					}
				}

				if (maxArgsLength) {
					iFn += 'el = data[key];';
				}

				break;

			case 'map':
			case 'set':
			case 'generator':
			case 'iterator':
				if (isMapSet && STRUCT_OPT) {
					iFn += /* cbws */`
						var tmpArray = data._keys,
							skip = 0;
					`;

					if (!live && !reverse) {
						iFn += 'var size = data.size;';
					}

					if (!live) {
						iFn += 'tmpArray = tmpArray.slice();';
					}

					if (reverse) {
						if (live) {
							iFn += 'tmpArray = tmpArray.slice().reverse();';

						} else {
							iFn += 'tmpArray.reverse();';
						}
					}

					iFn += /* cbws */`
						aLength = tmpArray.length;
						for (n = ${startIndex - 1}; ++n < ${!reverse && live ? 'tmpArray.length' : 'aLength'};) {
							key = tmpArray[n];

							if (key === NULL) {
								skip++;
								continue;
							}

							i = n - skip;
					`;

					if (startIndex) {
						iFn += /* cbws */`
							if (i < ${startIndex}) {
								continue;
							}
						`;
					}

					if (endIndex !== false) {
						iFn += /* cbws */`
							if (i > ${endIndex}) {
								break;
							};
						`;
					}

				} else {
					let gen = () => {
						if (isMapSet) {
							iFn += 'var cursor = data.keys();';

							if (!live && !reverse) {
								iFn += 'var size = data.size;';
							}

						} else if (type === 'generator') {
							iFn += 'var cursor = data();';

						} else {
							iFn += /* cbws */`
								var iteratorKey = typeof Symbol !== 'undefined' && Symbol['iterator'],
									cursor;

								if ('next' in data) {
									cursor = data;

								} else {
									cursor = data["@@iterator"] ?
										data["@@iterator"]() : iteratorKey ? data[iteratorKey]() || data : data;
								}
							`;
						}
					};

					if (reverse) {
						gen();
						iFn += /* cbws */`
							var tmpArray = [];

							for (var step = cursor.next(); !step.done; step = cursor.next()) {
								${threadStart}
								tmpArray.push(step.value);
								${threadEnd}
							}

							tmpArray.reverse();
							var size = tmpArray.length;
						`;

						if (startIndex || endIndex !== false) {
							iFn += /* cbws */`tmpArray = tmpArray.slice(${startIndex},
								${endIndex !== false ? endIndex + 1 : 'tmpArray.length'});
							`;
						}

						iFn += /* cbws */`
							aLength = tmpArray.length;
							for (n = -1; ++n < aLength;) {
								${maxArgsLength ? 'key = tmpArray[n];' : ''}
								i = n + ${startIndex};
						`;

					} else {
						gen();

						iFn += /* cbws */`
							for (key = cursor.next(); !key.done; key = cursor.next()) {
								${maxArgsLength ? 'key = key.value;' : ''}
								i++;
						`;

						if (startIndex) {
							iFn += /* cbws */`
								if (i < ${startIndex}) {
									continue;
								}
							`;
						}

						if (endIndex !== false) {
							iFn += /* cbws */`
								if (i > ${endIndex}) {
									break;
								};
							`;
						}
					}
				}

				if (maxArgsLength) {
					if (type === 'map') {
						iFn += 'el = data.get(key);';

					} else {
						iFn += 'el = key;';

						if (maxArgsLength > 1) {
							if (type === 'set') {
								iFn += 'key = null;';

							} else if (reverse) {
								iFn += 'key = size - i - 1;';

							} else {
								iFn += 'key = i;';
							}
						}
					}
				}

				break;
		}

		iFn += threadStart;

		if (count) {
			iFn += /* cbws */`
				if (j === ${count}) {
					break;
				}
			`;
		}

		if (enabledActiveFilter || enabledFilter) {
			iFn += 'if (';

			// Активный фильтр
			if (filters[1].call) {
				let args = filterArgs.slice(0, filterArgsLength[1]);
				filterArgs[filterArgs.length - 1] = 'aFilter';

				if (enabledFilter) {
					iFn += '(';
				}

				if (inverseFilter) {
					iFn += '!';
				}

				iFn += 'aFilter' + (filterWithThis[1] ?
					'.call(this' : '(');

				if (filterWithThis[1] && args.length) {
					iFn += ',';
				}

				iFn += args + ')';

				if (enabledFilter) {
					iFn += ') && ';
				}

			} else if (enabledActiveFilter) {
				if (enabledFilter) {
					iFn += inverseFilter ?
						'!(' : '(';

				} else if (inverseFilter) {
					iFn += '!(';
				}

				iFn += filters[1];

				if (enabledFilter) {
					iFn += ') && ';

				} else if (inverseFilter) {
					iFn += ')';
				}
			}

			// Заданный фильтр
			if (filters[0].call) {
				let args = filterArgs.slice(0, filterArgsLength[0]);
				filterArgs[filterArgs.length - 1] = 'filter';

				if (enabledActiveFilter) {
					iFn += '(';
				}

				if (inverseFilter) {
					iFn += '!';
				}

				iFn += 'filter' + (filterWithThis[0] ?
					'.call(this' : '(');

				if (filterWithThis[0] && args.length) {
					iFn += ',';
				}

				iFn += args + ')';

				if (enabledActiveFilter) {
					iFn += ')';
				}

			} else if (enabledFilter) {
				if (enabledActiveFilter) {
					iFn += inverseFilter ?
						'!(' : '(';

				} else if (inverseFilter) {
					iFn += '!(';
				}

				iFn += filters[0];

				if (enabledActiveFilter || inverseFilter) {
					iFn += ')';
				}
			}

			iFn += ') {';
		}

		var tmp = '';

		if (!mult) {
			tmp += 'callback';

			tmp += callbackWithThis ?
				'.call(this' : '(';

			tmp += callbackWithThis && cbArgs.length ?
				',' : '';

			tmp += cbArgs;
			tmp += '); breaker = true;';

		} else {
			if (callbackWithReturn) {
				tmp += 'if (callback';

				tmp += callbackWithThis ?
					'.call(this' : '(';

				if (callbackWithThis && cbArgs.length) {
					tmp += ',';
				}

				tmp += cbArgs;
				tmp += ') === false) { breaker = true; }';

			} else {
				if (callbackStr) {
					tmp += callbackStr;

				} else {
					tmp += 'callback';

					tmp += callbackWithThis ?
						'.call(this' : '(';

					if (callbackWithThis && cbArgs.length) {
						tmp += ',';
					}

					tmp += cbArgs;
					tmp += ');';
				}
			}
		}

		if (count) {
			tmp += 'j++;';
		}

		if (from) {
			iFn += /* cbws */`
				if (from !== 0) {
					from--;

				} else {
					${tmp}
				}
			`;

		} else {
			iFn += tmp;
		}

		if (enabledActiveFilter || enabledFilter) {
			iFn += '}';
		}

		var yielder = /* cbws */`
			if (yielder) {
				${pop}
				yielder = false;

				if (link.self) {
					link.self.pause = true;

				} else {
					link.pause = true;
				}

				yield yieldVal;

				link.self.pause = false;
				delete link.pause;

				yieldVal = void 0;
				${push}
			}
		`;

		if (isGenerator) {
			iFn += yielder;
		}

		if (!live && !reverse && isMapSet) {
			iFn += /* cbws */`
				size--;

				if (!size) {
					break;
				}
			`;
		}

		iFn += /* cbws */`
				if (breaker) {
					break;
				}

				${threadEnd}
			}

			breaker = false;
			looper++;

			if (onIterationEnd) {
				onIterationEnd.call(this, this.result);
			}
		`;

		if (isGenerator) {
			iFn += yielder;
		}

		iFn += /* cbws */`
			}

			var final = this.result;
			${pop}

			if (onComplete) {
				onComplete.call(this, final);
			}

			return final;
		`;

		if (isGenerator) {
			tmpCycle[key] = eval(/* cbws */`(function *(
				data,

				length,
				fLength,

				callback,
				afilter,
				filter,

				id,
				inject,
				link,

				onIterationEnd,
				onComplete

			) { ${iFn} })`);

		} else {
			tmpCycle[key] = new Function(
				'data',

				'length',
				'fLength',

				'callback',
				'aFilter',
				'filter',

				'id',
				'inject',
				'link',

				'onIterationEnd',
				'onComplete',

				iFn
			);
		}

		if (Collection['_ready']) {
			let text = /* cbws */`
				${namespace}._tmpCycle["${
					key.replace(qRgxp, '\\"')

				}"] = ${tmpCycle[key].toString()};
			`;

			tmpCycleStr[key] = text;
			if (IS_BROWSER && LOCAL_STORAGE_SUPPORT) {
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					try {
						localStorage.setItem('__COLLECTION_CACHE__', JSON.stringify(tmpCycleStr));
						localStorage.setItem('__COLLECTION_CACHE_VERSION__', CACHE_VERSION);

						if (BLOB_SUPPORT) {
							let code = new Blob([text], {
								type: 'application/javascript'
							});

							let script = document.createElement('script');
							script.src = URL.createObjectURL(code);
							document.head
								.appendChild(script);
						}

					} catch (ignore) {}
				}, 15);

			} else if (IS_NODE) {
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					require('fs').writeFile(
						require('path').join(__dirname, 'collection.tmp.js'),

						`
							exports.version = ${CACHE_VERSION};
							exports.cache = ${JSON.stringify(tmpCycleStr)};
							exports.exec = function () {
								${returnCache(tmpCycleStr)}
							};
						`,

						() => {}
					);
				}, 15);
			}
		}

		return tmpCycle[key];
	};
}
