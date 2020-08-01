/**
 * TODO class is too big! refactor it
 *
 * Editor core class
 *
 * @param $element
 * @param options
 * @param i18n
 * @returns {*}
 * @constructor
 */

var EditorCore = function ($element, options, i18n) {
    this.$element = $element;
    this.options = $.extend(this.options, options);
    this.cn = this.options.classname;

    this._i18n = i18n;
    this._language = options['language'] || i18n.getLanguage();

    return this.init();
};

EditorCore.prototype = {
    /**
     * Default settings
     * Настройки по умолчанию
     */
    options: {
        plugins: {},
        language: 'en',
        option: 'value',
        classname: 'meditor',
        columns: 12,
        colsize: 54,
        colmargin: 30,
        minHeightBlock: 95
    },

    $element: undefined,
    $controls: undefined,

    editor: undefined,
    area: undefined,
    cn: undefined,

    _language: undefined,
    _i18n: undefined,

    plugins: [],

    // TODO refactoring
    _plugins: {},

    blocks: {},
    blocks_menu: {},

    movable: undefined,
    resizable: undefined,
    resizable_prev: undefined,
    helperable: undefined,
    i18n: undefined,

    counter: 0,

    /**
     * Editor initialization
     * Инициализация редактора
     *
     * @returns {EditorCore}
     */
    init: function () {
        // @TODO move to external i18n language file
        this._i18n.addToDictionary({
            ru: {
                'Add block': 'Добавить блок',
                'You really want to remove this block?': 'Вы действительно хотите удалить данный блок?',
                'Main settings': 'Основные настройки',
                'Small screen': 'Маленький экран',
                'Medium screen': 'Средний экран',
                'Default action': 'Действие по-умолчанию',
                'Columns: ': 'Колонок: ',
                'Save': 'Сохранить'
            }
        }, 'core');

        this.bindEvents();

        this.$element.hide(0);

        var editor = $('<div/>', {class: this.cn}),
            area = $('<div/>', {class: this.areaClass(false)});

        this.editor = editor;
        this.area = area;

        // TODO refactoring
        this.pluginsInit();

        this.setContent();
        $(editor).append(area, this.createControls());
        this.$element.after(this.editor);
        this.initGrid();
        this.pluginsAfterRender();
        return this;
    },

    /**
     * Plugins initialization
     * Инициализация плагинов
     */
    pluginsInit: function () {
        // TODO refactoring
        var name;

        for (name in this.options.plugins) {
            var plugin = this.options.plugins[name],
                pluginOptions = this.options[name] || {};
            this._plugins[name] = new plugin(name, this, pluginOptions);
        }
    },

    t: function (source, category, params) {
        return this._i18n.t(source, category || 'core', params || {}, this._language);
    },

    /**
     * Classes
     * Используемые классы
     */

    blockClass: function (dotted) {
        var cn = this.cn + '-block';
        return dotted ? '.' + cn : cn;
    },
    rowClass: function (dotted) {
        var cn = 'row';
        return dotted ? '.' + cn : cn;
    },
    columnClass: function (dotted) {
        var cn = 'column';
        return dotted ? '.' + cn : cn;
    },
    colClass: function (dotted, value) {
        var append = '';
        if (value)
            append = value.toString();
        var cn = 'large-' + append;
        return dotted ? '.' + cn : cn;
    },
    highlighterClass: function (dotted) {
        var cn = this.cn + '-highlighter';
        return dotted ? '.' + cn : cn;
    },
    plugClass: function (dotted) {
        var cn = 'plug';
        return dotted ? '.' + cn : cn;
    },
    pluggedClass: function (dotted) {
        var cn = 'plugged';
        return dotted ? '.' + cn : cn;
    },
    movingClasses: function () {
        return this.rowClass(true) + ', ' + this.columnClass(true) + ', ' + this.blockClass(true);
    },
    areaClass: function (dotted) {
        var cn = this.cn + '-area';
        return dotted ? '.' + cn : cn;
    },
    controlsClass: function (dotted) {
        var cn = this.cn + '-controls';
        return dotted ? '.' + cn : cn;
    },
    moveClass: function (dotted) {
        var cn = this.cn + '-move';
        return dotted ? '.' + cn : cn;
    },
    deleteClass: function (dotted) {
        var cn = this.cn + '-delete';
        return dotted ? '.' + cn : cn;
    },
    settingsClass: function (dotted, part) {
        var cn = this.cn + '-settings';
        part = part || false;
        if (part) {
            cn += '-' + part;
        }
        return dotted ? '.' + cn : cn;
    },
    movingClass: function (dotted) {
        var cn = this.cn + '-moving';
        return dotted ? '.' + cn : cn;
    },
    helpersClass: function (dotted) {
        var cn = this.cn + '-helpers';
        return dotted ? '.' + cn : cn;
    },
    resizerClass: function (dotted) {
        var cn = this.cn + '-resizer';
        return dotted ? '.' + cn : cn;
    },
    resizingClass: function (dotted) {
        var cn = 'resizing';
        return dotted ? '.' + cn : cn;
    },
    resizingSiblingClass: function (dotted) {
        var cn = 'resizing-sibling';
        return dotted ? '.' + cn : cn;
    },
    heightResizerClass: function (dotted) {
        var cn = this.cn + '-height-resizer';
        return dotted ? '.' + cn : cn;
    },
    heightResizingClass: function (dotted) {
        var cn = 'height-resizing';
        return dotted ? '.' + cn : cn;
    },
    heightBlockResizingClass: function (dotted) {
        var cn = 'height-block-resizing';
        return dotted ? '.' + cn : cn;
    },
    helperableClass: function(dotted)
    {
        var cn = 'helperable';
        return dotted ? '.' + cn : cn;
    },
    settingsId: function (name) {
        return 'settings-' + name;
    },
    /**
     * Binding events
     * "Навешиваем" события
     */
    bindEvents: function () {
        var me = this;

        $(document).on('click', me.deleteClass(true), function () {
            var confirmMessage = me.t('You really want to remove this block?');

            if (confirm(confirmMessage)) {
                me.helperable.remove();
                me.hideHelper();
                me.clearStrings();
            }
        });

        $(document).on('click', me.settingsClass(true), function () {
            var plugin = me.getBlockPlugin(me.helperable);
            plugin.showSettings();
            return false;
        });

        $(document).on('mouseover', 'body:not(.moving, .resizing, .height-resizing) ' + me.blockClass(true), function (e) {
            var element = $(e.target).closest(me.blockClass(true));

            if (element.length >= 0) {
                me.showHelper(element);
            }
        });

        $(document).on('mouseout', 'body:not(.height-resizing) ' + me.blockClass(true), function (e) {
            if ($(e.relatedTarget).closest(me.helpersClass(true)).length <= 0) {
                me.hideHelper();
            }
        });

        $(document).on('mouseout', 'body:not(.height-resizing) ' + me.helpersClass(true), function (e) {
            if ($(e.relatedTarget).closest(me.helpersClass(true)).length <= 0) {
                me.hideHelper();
            }
        });

        $(document).on('selectstart', me.blockClass(true), function (e) {
            if ($('body').hasClass('unselectable')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    },
    /**
     * Show block settings panel
     * Отобразить панель настроек блока
     *
     * @param element
     */
    showHelper: function (element) {
        var helpers = $(this.editor).find(this.helpersClass(true));
        helpers.css({'display': 'block'});

        var $me = $(this.editor);
        $(element).addClass(this.helperableClass(false));
        helpers.css({
            'top': element.offset().top - $me.offset().top,
            'left': (element.offset().left - $me.offset().left) + element.width()
        });
        this.helperable = element;
    },
    /**
     * Hide settings panel
     * Скрыть панель настроек
     */
    hideHelper: function () {
        var helpers = $(this.editor).find(this.helpersClass(true));
        helpers.css({
            'display': 'none'
        });
        $(this.helperable).removeClass(this.helperableClass(false));
        this.helperable = undefined;
    },
    /**
     * Grid initialization
     * Инициализация грида (расположения блоков)
     */
    initGrid: function () {
        var $me = this;
        var moving_selector = this.moveClass(true);
        $(document).on('mousedown', moving_selector, function () {
            $me.movable = $me.helperable;
            $me.startMove();
        });
        $(document).on('mousedown', this.columnClass(true) + ' ' + $me.resizerClass(true), function () {
            $me.resizable = $me.findColumn($(this));
            $me.resizable_prev = $($me.resizable).prev();
            if ($me.resizable_prev.length) {
                $me.startResize();
            } else {
                $me.resizable = undefined;
                $me.resizable_prev = undefined;
            }
        });
        $(document).on('mousedown', this.blockClass(true) + ' ' + $me.heightResizerClass(true), function () {
            $me.resizable = $(this).closest($me.blockClass(true));
            $me.startHeightResize();
        });
    },
    /**
     * Get plugin by name
     * Получить плагин по имени
     *
     * @param name
     * @returns {plugin}
     */
    getPlugin: function (name) {
        var plugin = this.options.plugins[name];
        if (!plugin) {
            /**
             * If requested block not found show special "Lost block"
             * Если запрашиваемый блок не найден - отображаем специальный "Утерянный блок"
             */
            plugin = this.options.plugins['lost'];
        }
        return new plugin(name, this);
    },
    /**
     * Get block plugin
     * Получить плагин по блоку
     *
     * @param block
     * @returns {*}
     */
    getBlockPlugin: function (block) {
        return this.plugins[parseInt($(block).attr('rel'))];
    },
    /**
     * Set body as unselectable
     * Отключаем выделение текста на странице
     */
    setUnselectable: function () {
        $('body').addClass('unselectable');
    },
    /**
     * Unset body as unselectable
     * Влючаем выделение текста на странице
     */
    setSelectable: function () {
        $('body').removeClass('unselectable');
    },

    /**
     * Service functions to simplify the calculations
     * Сервисные функции для упрощения расчетов
     */

    /**
     * Calculating offset of mouse cursor inset element
     * Расчет смещения курсора мыши внутри элемента
     *
     * @param elem
     * @param e
     * @returns {{left: Number, top: Number}}
     */
    calculateOffset: function (elem, e) {
        var event = e.originalEvent;

        var top = event.offsetY ? event.offsetY : event.layerY;
        var left = event.offsetX ? event.offsetX : event.layerX;

        var element = this.findColumn(elem);
        if (!element.length && this.isRow(elem)) {
            element = elem;
        }
        if (element.length) {
            top = e.pageY - element.offset()['top'];
            left = e.pageX - element.offset()['left'];
        }
        return {'left': left, 'top': top};
    },

    /**
     * Get direction
     * Получить направление движения
     */
    getDirection: function (elem, offset, only) {
        var direction = 'top';

        if (only == 'y') {
            direction = (offset.top / elem.height() > 0.5) ? 'bottom' : 'top';
            return direction;
        } else if (only == 'x') {
            direction = (offset.left / elem.width() > 0.5) ? 'right' : 'left';
            return direction;
        }

        var nw = {'x': 0, 'y': 0};
        var ne = {'x': elem.width(), 'y': 0};
        var sw = {'x': 0, 'y': elem.height()};
        var se = {'x': elem.width(), 'y': elem.height()};

        var x = offset.left;
        var y = offset.top;

        var nw_se = ((x - nw.x) / (se.x - nw.x)) - ((y - nw.y) / (se.y - nw.y));
        var ne_sw = ((x - ne.x) / (sw.x - ne.x)) - ((y - ne.y) / (sw.y - ne.y));

        if (nw_se > 0) {
            if (ne_sw > 0)
                direction = 'top';
            else
                direction = 'right';
        } else {
            if (ne_sw > 0)
                direction = 'left';
            else
                direction = 'bottom';
        }

        return direction;
    },

    /**
     * Service functions for the Grid
     * Сервисные функции для работы с гридом
     */

    /**
     * Getting the width of a column
     * Получение ширины колонки
     */
    getColumnValue: function (block) {
        var classes = block[0].classList;

        var cn = '';
        var colClass = this.colClass(false);

        var i = 0;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return parseInt(cn.substr(colClass.length))
            }
        }
        return 0;
    },

    /**
     * Setting the width of a column
     * Установка ширины колонки
     *
     * @param block
     * @param value
     */
    setColumnValue: function (block, value) {
        var $block = $(block);
        var current = this.getColumnValue(block);
        var $me = this;
        $block.removeClass(this.colClass(false, current));
        $block.addClass(this.colClass(false, value));
        $block.find(this.blockClass(true)).each(function () {
            $me.blockColumnChangeSize($(this));
        });
        return $block;
    },

    /**
     * Increasing the block size
     * Увеличение размера блока
     *
     * @param block
     * @param value
     */
    incColumnValue: function (block, value) {
        var curr = this.getColumnValue(block);
        this.setColumnValue(block, curr + value);
    },

    /**
     * Decreasing the block size
     * Уменьшение размера блока
     *
     * @param block
     * @param value
     */
    decColumnValue: function (block, value) {
        var curr = this.getColumnValue(block);
        if (curr - value > 1) {
            this.setColumnValue(block, curr - value);
            return true;
        } else {
            return false;
        }
    },

    /**
     * Column searching
     * Поиск колонки
     *
     * @returns HTMLElement
     */
    findColumn: function (element) {
        var $element = $(element);
        if ($element && $element.length > 0) {
            return $element.closest(this.columnClass(true));
        }
        return $();
    },

    /**
     * Check is line
     * Проверка на строку
     *
     * @returns bool
     */
    isRow: function (element) {
        return $(element).hasClass(this.rowClass(false));
    },

    /**
     * Check is column
     * Проверка на столбец
     *
     * @returns bool
     */
    isColumn: function (element) {
        return $(element).hasClass(this.columnClass(false));
    },

    /**
     * Clean up the lines
     * Прибираемся в строчках
     */
    clearStrings: function () {
        var $me = this;
        var counted = 0;

        $($me.area).find($me.rowClass(true)).each(function () {
            counted = 0;
            $(this).find($me.columnClass(true)).each(function () {
                if ($(this).find($me.blockClass(true)).length > 0) {
                    counted += $me.getColumnValue($(this));
                } else {
                    $(this).remove();
                }
            });

            if (counted > 0 && counted < $me.options.columns) {
                var need_append = $me.options.columns - counted;
                var count_blocks = $(this).find($me.columnClass(true)).length;

                var append_per_block = Math.round(need_append / count_blocks);
                var append_last_block = need_append - append_per_block * (count_blocks - 1);

                $(this).find($me.columnClass(true)).each(function (index) {
                    var column = $(this);
                    var current = $me.getColumnValue(column);

                    if (index == count_blocks - 1) {
                        $me.setColumnValue(column, current + append_last_block);
                    } else {
                        $me.setColumnValue(column, current + append_per_block);
                    }
                });
            }

            if ($(this).find($me.columnClass(true)).length == 0) {
                $(this).remove();
            }
        });

        this.saveState();
    },

    /**
     * Drag and drop blocks
     * Перетаскивания блоков
     */

    /**
     * Started drag
     * Начали перетаскивать
     */
    startMove: function () {
        var $me = this;
        $($me.movable).addClass($me.movingClass(false));
        $me.setUnselectable();
        $('body').addClass('moving');
        $(document).on('mouseup', function (e) {
            var offset = $me.calculateOffset(e.target, e);
            $me.stopMove($(e.target), offset);
        });
        $(this.movingClasses()).on('mouseout', function () {
            $me.clearHighlight();
        });
        $(this.movingClasses()).on('mousemove', function (e) {
            var offset = $me.calculateOffset(e.target, e);
            $me.highlightBlock($(e.target), offset);
        });
    },
    /**
     * Finished drag
     * Закончили перетаскивать
     *
     * @param drop_to
     * @param offset
     */
    stopMove: function (drop_to, offset) {
        drop_to = $(drop_to);
        $(this.movable).removeClass(this.movingClass(false));
        this.setSelectable();
        $('body').removeClass('moving');
        this.clearHighlight();
        $(this.movingClasses()).off('mousemove');
        $(this.movingClasses()).off('mouseout');
        $(document).off('mouseup');

        var dropped_to = this.findColumn(drop_to);
        var direction = drop_to.is($(this.movable)) ? 'y' : 'xy';
        if (!dropped_to.length && this.isRow(drop_to)) {
            dropped_to = drop_to;
            direction = 'y';
        }
        if (dropped_to.length) {
            var drop_from = this.findColumn(this.movable);
            this.dropped($(this.movable), drop_from, dropped_to, this.getDirection(dropped_to, offset, direction));
            this.blockAfterMove($(this.movable));
        }

        this.movable = false;
        this.saveState();
    },
    /**
     * Calculating changes after drop
     * Расчет изменений после перетаскивания
     *
     * @param element
     * @param drop_from
     * @param drop_to (element column or row only)
     * @param direction
     */
    dropped: function (element, drop_from, drop_to, direction) {
        var $me = this;

        var col_to = this.isRow(drop_to) ? 12 : this.getColumnValue(drop_to);

        if (direction == 'top' || direction == 'bottom') {

            /**
             * Append new row
             * Добавляем новую строку
             */
            if (col_to == this.options.columns) {
                var to_row = this.isRow(drop_to) ? drop_to : drop_to.closest(this.rowClass(true));
                var row = this.wrapToRowColumn(element);

                if (direction == 'top') {
                    to_row.before(row);
                } else if (direction == 'bottom') {
                    to_row.after(row);
                }
            } else {
                /**
                 * Add to the tail or the head of the column
                 * Добавляем в хвост или голову столбца
                 */
                if (direction == 'top') {
                    drop_to.prepend(element);
                } else if (direction == 'bottom') {
                    drop_to.append(element);
                }
            }

        } else if (direction == 'left' || direction == 'right') {
            if (col_to > 3) {
                var new_col_element = Math.round(col_to / 2);
                var new_col_to = col_to - new_col_element;

                this.setColumnValue(drop_to, new_col_to);

                var $newColumn = this.wrapToColumn(element);
                $newColumn = $me.setColumnValue($newColumn, new_col_element);

                if (direction == 'left') {
                    $(drop_to).before($newColumn);
                } else if (direction == 'right') {
                    $(drop_to).after($newColumn)
                }
            }
        }

        this.clearStrings();
    },

    /**
     * Highlighting blocks
     * Подсвечивание блоков
     */

    /**
     * Highlight the block
     * Подсветить блок
     *
     * @param element // HTMLElement
     * @param offset // {'left': int,'top': int}
     */
    highlightBlock: function (element, offset) {
        this.clearHighlight();
        var $column = this.findColumn(element);
        if ($column.length) {
            var direction = 'top';
            if (!$column.is($(this.movable))) {
                direction = this.getDirection($column, offset);
            } else if ($column.hasClass(this.colClass(false, this.options.columns))) {
                direction = this.getDirection($column, offset, 'y');
            } else {
                return false;
            }

            var col_to = this.getColumnValue($column);

            if (direction == 'top' || direction == 'bottom') {
                if (col_to == this.options.columns) {
                    var $element = $column.closest(this.rowClass(true));
                    this.highlightElement($element, direction);
                } else {
                    this.highlightElement($column, direction);
                }
            } else {
                if (col_to > 3) {
                    this.highlightElement($column, direction);
                }
            }
        } else if (this.isRow(element)) {
            direction = this.getDirection(element, offset, 'y');
            this.highlightElement(element, direction);
        }
        return false;
    },
    /**
     * Highlight a specific element
     * Подсветить конкретный элемент
     *
     * @param element // HTMLElement
     * @param direction // string left|top|right|bottom
     */
    highlightElement: function (element, direction) {
        // Меняем подсветку текущего блока на следующий (дабы выделение не скакало как бешеное)
        if (this.isRow(element) && direction == 'bottom') {
            var next = element.next(this.rowClass(true));
            if (next.length > 0) {
                element = $(next[0]);
                direction = 'top';
            }
        }

        if (this.isColumn(element) && direction == 'right') {
            var next = element.next(this.columnClass(true));
            if (next.length > 0) {
                element = $(next[0]);
                direction = 'left';
            }
        }

        var highlighter = $('<div/>').addClass(this.highlighterClass(false)).addClass(direction);
        element.append(highlighter);
    },
    /**
     * Remove the highlight blocks
     * Убрать подсветку блоков
     */
    clearHighlight: function () {
        $(this.highlighterClass(true)).remove();
    },

    /**
     * Change the size of columns
     * Изменение ширины столбцов
     */

    /**
     * Started resizing
     * Начали изменение размера
     */
    startResize: function () {
        var $me = this;
        $('body').addClass('unselectable').addClass(this.resizingClass(false));

        $(document).on('mouseup', function (e) {
            var event = e.originalEvent;
            var offset = {
                'left': event.offsetX ? event.offsetX : event.layerX,
                'top': event.offsetY ? event.offsetY : event.layerY
            };
            $me.stopResize(e.target, offset);
        });
        var move_function = function (e) {
            var event = e.originalEvent;
            var offset = {
                'left': event.offsetX ? event.offsetX : event.layerX,
                'top': event.offsetY ? event.offsetY : event.layerY
            };
            $me.resizing(e.currentTarget, offset);
        };

        $(this.resizable).addClass(this.resizingClass(false));
        $(this.resizable).on('mousemove', move_function);

        var $prev = $(this.resizable).prev();
        if ($prev.length) {
            $prev.addClass(this.resizingSiblingClass(false)).on('mousemove', move_function);
        }
    },

    /**
     * Finished resizing
     * Закончили изменение размера
     *
     * @param target
     * @param offset
     */
    stopResize: function (target, offset) {
        $('body').removeClass('unselectable').removeClass(this.resizingClass(false));

        $(document).off('mouseup');

        $(this.resizable).removeClass(this.resizingClass(false));
        $(this.resizable).off('mousemove');
        var $prev = $(this.resizable).prev();
        if ($prev.length) {
            $prev.removeClass(this.resizingSiblingClass(false)).off('mousemove');
        }
        this.saveState();
    },

    /**
     * Resizing
     * Изменение размера
     *
     * @param target
     * @param offset
     */
    resizing: function (target, offset) {
        var displacement = 0;
        var $target = $(target);

        if ($target.is($(this.resizable))) {
            displacement = offset.left;
            if (displacement > this.options.colmargin) {
                if (this.decColumnValue($target, 1)) {
                    this.incColumnValue($(this.resizable_prev), 1);
                }
            }
        } else if ($target.is($(this.resizable_prev))) {
            displacement = $target.width() - offset.left;
            if (displacement > this.options.colmargin) {
                if (this.decColumnValue($target, 1)) {
                    this.incColumnValue($(this.resizable), 1);
                }
            }
        }
    },

    /**
     * Change the height of blocks
     * Изменение высоты блоков
     */

    /**
     * Start change the height of block
     * Начали изменение высоты блока
     */
    startHeightResize: function () {
        var $me = this;
        $('body').addClass('unselectable').addClass(this.heightResizingClass(false));

        $($me.resizable).addClass($me.heightBlockResizingClass(false));

        $(document).on('mousemove', function (e) {
            var resizable_offset = $($me.resizable).offset();
            var offset = {
                'left': e.pageX - resizable_offset.left,
                'top': e.pageY - resizable_offset.top
            };
            $me.heightResize(offset);
        });

        $(document).on('mouseup', function (e) {
            $me.stopHeightResize();
        });
    },
    /**
     * Change the height of block
     * Изменение высоты блока
     *
     * @param offset
     */
    heightResize: function (offset) {
        var height = this.options.minHeightBlock;
        var resizer = this.resizable.find(this.heightResizerClass(true));
        var type = resizer.data('type');
        if (!type) {
            type = 'min-height';
        }
        if (offset.top >= this.options.minHeightBlock) {
            height = offset.top;
        }
        $(this.resizable).css(type, height);
        this.blockHeightResize(this.resizable);
    },
    /**
     * Finish change the height of block
     * Закончили изменение высоты блока
     */
    stopHeightResize: function () {
        $('body').removeClass('unselectable').removeClass(this.heightResizingClass(false));
        $(document).off('mouseup');
        $(document).off('mousemove');
        $(this.resizable).removeClass(this.heightBlockResizingClass(false));
        this.resizable = undefined;
        this.saveState();
    },


    /**
     * Creation functions
     * Функции создания элементов
     */

    /**
     * Create an element that changes the column width
     * Создать элемент изменения ширины колонки
     *
     * @returns {*|jQuery}
     */
    createResizeHandler: function () {
        return $('<span/>').addClass(this.resizerClass(false));
    },

    /**
     * Create clean (empty) row
     * Создать чистую (пустую) строку
     *
     * @returns HTMLElement
     */
    createPureRow: function () {
        return $('<div/>', {
            class: 'row'
        });
    },

    /**
     * Create clean (empty) column
     * Создать чистый (пустой) столбец
     *
     * @returns HTMLElement
     */
    createPureColumn: function () {
        return $('<div/>', {
            class: this.columnClass(false) + ' large-12'
        }).append(this.createResizeHandler());
    },

    /**
     * Wrap the element in the row and column
     * Обернуть элемент в строку и столбец
     *
     * @returns HTMLElement
     */
    wrapToRowColumn: function ($element) {
        var row = this.createPureRow();
        return row.append(this.createPureColumn().append($element));
    },

    /**
     * Wrap the element in column
     * Обернуть элемент в столбец
     *
     * @returns HTMLElement
     */
    wrapToColumn: function ($element) {
        return this.createPureColumn().append($element);
    },

    /**
     * Adding controls to the editor
     * Добавляем элементы управления к редактору
     */
    createControls: function () {
        // TODO to the current step has to be initialized plugins
        // TODO к текущему шагу уже должны быть инициализированы плагины

        var $controls = $('<div/>', {class: this.controlsClass(false)}),
            $me = this,
            controlsHtml = this.renderTemplate('/templates/editor.jst', {
                plugins: this._plugins
            });

        $controls
            .html(controlsHtml)
            .find('.add-block')
            .on('click', function (e) {
                e.preventDefault();

                var $data = $(this).data();
                $me.createBlock($data);
                return false;
            });

        return this.$controls = $controls;
    },

    /**
     * Functions for working with blocks
     * Функции для работы с блоками
     */

    /**
     * Creating a new block
     * Создание нового блока
     */
    createBlock: function (data) {
        var $block = $('<div/>', {
            'data-plugin': data['plugin']
        });
        $block.addClass(this.blockClass(false));
        this.addBlock($block);
    },
    /**
     * Добавление блока на страницу
     * Adding the block to the page
     *
     * @param block
     */
    addBlock: function (block) {
        var row = this.createPureRow();
        var column = this.createPureColumn();
        var maked = this.makeBlock(block);
        column.append(maked);
        row.append(column);
        $(this.areaClass(true)).append(row);
        this.blockAfterRender(block);
        this.saveState();
    },

    /**
     * Initialization of the grid elements
     * Инициализация элементов грида
     */

    /**
     * Setting old content
     * Установка прошлого контента
     */
    setContent: function () {
        var content = this.$element.val();
        if (!content) {
            var block = $('<div/>', {
                'data-plugin': 'text'
            });
            block.addClass(this.blockClass(false)).addClass('text-block');

            var row = this.createPureRow();
            var column = this.createPureColumn();
            column.append(block);
            row.append(column);

            content = $('<div/>').append(row);
        } else {
            content = $('<div/>').html(content);
        }
        this.setContentByRows(content);
    },
    /**
     * Splitting a clean block content in rows
     * Разбиваем чистый блочный контент по строкам
     *
     * @param content
     * @returns html
     */
    setContentByRows: function (content) {
        var $me = this;
        var row = this.createPureRow();
        $(content).find($me.rowClass(true)).each(function (index) {
            row = $me.createPureRow();
            $(this).find($me.columnClass(true)).each(function (index) {
                $(this).find($me.resizerClass(true)).remove();
                var column = $(this).append($me.createResizeHandler());
                $(this).find($me.blockClass(true)).each(function (index) {
                    column.append($me.makeBlock(this));
                });
                row.append(column);
            });
            $($me.area).append(row);
        });
    },
    /**
     * Preparing block to add to the page
     * Подготовка блока к добавлению на страницу
     *
     * @param element
     */
    makeBlock: function (element) {
        var name = $(element).data('plugin'),
            plugin = this.getPlugin(name);

        return this.initPlugin(plugin, element, name);
    },
    /**
     * Initialize the plugin when adding block
     * Инициализация плагина при добавлении блока
     *
     * @param plugin
     * @param element
     * @param name
     * @returns {*|string}
     */
    initPlugin: function (plugin, element, name) {
        this.plugins.push(plugin);

        var $element = $(element);
        $element.attr('rel', plugin.getNumber());
        if (!$element.hasClass(name + '-block')) {
            $element.addClass(name + '-block');
        }
        $element.attr('data-plugin', name).data('plugin', name);
        return plugin.setHtmlBlock(element).render();
    },

    /**
     * Saving
     * Сохранение
     */

    /**
     * Getting clean content
     * Получение очищенного контента
     *
     * @returns {*}
     */
    getContent: function () {
        var $me = this,
            out = $('<div/>');

        $(this.area).find(this.rowClass(true)).each(function () {
            var cleared = $me.getRowContent($(this));
            out.append(cleared);
        });
        return out.html();
    },
    /**
     * Getting clean content from row
     * Получение очищенного контента из строки
     *
     * @param row
     * @returns {*|jQuery}
     */
    getRowContent: function (row) {
        var $me = this;
        var out = $('<div/>').addClass($me.rowClass(false));
        row.find($me.columnClass(true)).each(function () {
            var out_column = $(this).clone().html('');
            $(this).find($me.blockClass(true)).each(function () {
                var cleared = $me.cleanBlock($(this));
                out_column.append(cleared);
            });
            out.append(out_column);
        });
        return out;
    },
    /**
     * Cleaning the block. Used before saving.
     * Очистка блока от данных редактора. Используется перед сохранением.
     *
     * @param block
     * @returns {*|string}
     */
    cleanBlock: function (block) {
        var plugin = this.getBlockPlugin(block);

        block = plugin.getContent();

        var $block = $(block);

        $block.find(this.helpersClass(true)).remove();
        $block.find(this.resizerClass(true)).remove();
        $block.find(this.plugClass(true)).remove();
        $block.find(this.heightResizerClass(true)).remove();

        $block.removeAttr('rel');

        return block;
    },

    /**
     * Events
     * События
     */
    blockAfterRender: function (block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginAfterRender(plugin);
    },
    pluginsAfterRender: function () {
        var key = 0;
        for (key in this.plugins) {
            this.pluginAfterRender(this.plugins[key]);
        }
    },
    pluginAfterRender: function (plugin) {
        plugin.fireEvent('onAfterRender');
    },
    blockHeightResize: function (block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginHeightResize(plugin);
    },
    pluginHeightResize: function (plugin) {
        plugin.fireEvent('onHeightResize');
    },
    blockAfterMove: function (block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginAfterMove(plugin);
    },
    pluginAfterMove: function (plugin) {
        plugin.fireEvent('onAfterMove');
    },
    blockColumnChangeSize: function (block) {
        var plugin = this.getBlockPlugin(block);
        this.pluginColumnChangeSize(plugin);
    },
    pluginColumnChangeSize: function (plugin) {
        plugin.fireEvent('onColumnChangeSize');
    },
    /**
     * Some changes! Update content in element!
     */
    saveState: function () {
        console.log(this.getContent());
        this.$element.val(this.getContent());
    },
    /**
     * Прочие сервисные функции
     */
    renderTemplate: function (src, data) {
        var appendBlock = this.t('Add block');
        var compiled = _.template('' +
            '<div class="row">' +
            '<div class="column large-12">' +
            '<nav class="meditor-controls">' +
            '<ul class="no-bullet">' +
            '<li class="append">' +
            '<span>' + appendBlock + '</span>' +
            '</li>' +
            '<% _.each(plugins, function(plugin) { %>' +
            '<li>' +
            '<a class="add-block" data-popup="<%= plugin.options.hasPopup %>" href="#" data-plugin="<%= plugin.getName() %>" rel="<%= plugin.getNumber() %>">' +
            '<%= plugin.getI18nName() %>' +
            '</a>' +
            '</li>' +
            '<% }); %>' +
            '</ul>' +
            '</nav>' +
            '</div>' +
            '</div>' +
            '<div class="meditor-helpers">' +
            '<span class="meditor-move">' +
            '<i class="move-icon"></i>' +
            '</span>' +
            '<span class="meditor-settings">' +
            '<i class="gear-icon"></i>' +
            '</span>' +
            '<span class="meditor-delete">' +
            '<i class="delete-icon"></i>' +
            '</span>' +
            '</div>');
        data = data || {};
        data['i18n'] = this._i18n.getDictionary(this._language);
        return compiled(data);
    }
};