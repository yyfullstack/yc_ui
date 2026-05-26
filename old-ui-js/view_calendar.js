/**
 * @file 日历组件
 * @description 提供日历展示、日期选择、日期范围选择等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 日历组件构造函数
     * @class CalendarView
     * @param {Object} options - 配置选项
     * @param {string} [options.size='default'] - 尺寸
     * @param {string} [options.variant='default'] - 变体类型
     * @param {boolean} [options.range=false] - 是否范围选择
     * @param {Array} [options.events=[]] - 事件标记数组
     * @param {Function} [options.onSelect] - 选择回调
     */
    function CalendarView(options) {
        this.props = options || {};
        this._listeners = [];
        this._selectedDate = null;
        this._currentMonth = new Date();
        this._rangeStart = null;
        this._rangeEnd = null;
    }

    CalendarView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_calendar',
        body: null,
        shell: null,
        _listeners: null,
        _selectedDate: null,
        _currentMonth: null,
        _rangeStart: null,
        _rangeEnd: null,
        _header: null,
        _datesContainer: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildCalendar();
            this.inited();
        },

        buildCalendar: function () {
            var self = this;
            var options = self.props;
            var size = options.size || 'default';
            var variant = options.variant || 'default';

            $e.fn.addClass(self.shell, 'yc-calendar');
            if (size !== 'default') {
                $e.fn.addClass(self.shell, 'yc-calendar--' + size);
            }
            if (variant !== 'default') {
                $e.fn.addClass(self.shell, 'yc-calendar--' + variant);
            }

            self._header = $e.fn.create('div');
            $e.fn.addClass(self._header, 'yc-calendar__header');

            var left = $e.fn.create('div');
            $e.fn.addClass(left, 'yc-calendar__header-left');

            var prevBtn = $e.fn.create('button');
            $e.fn.addClass(prevBtn, 'yc-calendar__header-btn');
            prevBtn.textContent = '\u2039';

            var nextBtn = $e.fn.create('button');
            $e.fn.addClass(nextBtn, 'yc-calendar__header-btn');
            nextBtn.textContent = '\u203a';

            var title = $e.fn.create('span');
            $e.fn.addClass(title, 'yc-calendar__title');

            var todayBtn = $e.fn.create('button');
            $e.fn.addClass(todayBtn, 'yc-calendar__today-btn');
            todayBtn.textContent = '\u4ECA\u5929';

            left.appendChild(prevBtn);
            left.appendChild(title);
            left.appendChild(nextBtn);
            self._header.appendChild(left);

            var nav = $e.fn.create('div');
            $e.fn.addClass(nav, 'yc-calendar__header-nav');
            nav.appendChild(todayBtn);
            self._header.appendChild(nav);
            self.getBody().appendChild(self._header);

            var weekdays = $e.fn.create('div');
            $e.fn.addClass(weekdays, 'yc-calendar__weekdays');
            var weekNames = ['\u65E5', '\u4E00', '\u4E8C', '\u4E09', '\u56DB', '\u4E94', '\u516D'];
            for (var i = 0, len = weekNames.length; i < len; i++) {
                var day = $e.fn.create('div');
                $e.fn.addClass(day, 'yc-calendar__weekday');
                day.textContent = weekNames[i];
                weekdays.appendChild(day);
            }
            self.getBody().appendChild(weekdays);

            var body = $e.fn.create('div');
            $e.fn.addClass(body, 'yc-calendar__body');
            self._datesContainer = $e.fn.create('div');
            $e.fn.addClass(self._datesContainer, 'yc-calendar__dates');
            body.appendChild(self._datesContainer);
            self.getBody().appendChild(body);

            self.bindListen($e.events.regEvent(prevBtn, 'click', self, function () { self.changeMonth(-1); }));
            self.bindListen($e.events.regEvent(nextBtn, 'click', self, function () { self.changeMonth(1); }));
            self.bindListen($e.events.regEvent(title, 'click', self, function () { self.goToToday(); }));
            self.bindListen($e.events.regEvent(todayBtn, 'click', self, function () { self.goToToday(); }));

            self.renderCalendar();
        },

        renderCalendar: function () {
            var self = this;
            var year = self._currentMonth.getFullYear();
            var month = self._currentMonth.getMonth();
            self._header.querySelector('.yc-calendar__title').textContent = year + '\u5E74 ' + (month + 1) + '\u6708';

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var startDay = firstDay.getDay();
            var totalDays = lastDay.getDate();
            var prevMonthLastDay = new Date(year, month, 0).getDate();
            var datesContainer = self._datesContainer;

            datesContainer.textContent = '';
            for (var i = startDay - 1; i >= 0; i--) {
                datesContainer.appendChild(self.createDateCell(prevMonthLastDay - i, true, year, month - 1));
            }
            for (var i = 1; i <= totalDays; i++) {
                datesContainer.appendChild(self.createDateCell(i, false, year, month));
            }
            var remaining = 42 - (startDay + totalDays);
            for (var i = 1; i <= remaining; i++) {
                datesContainer.appendChild(self.createDateCell(i, true, year, month + 1));
            }
        },

        createDateCell: function (day, isOtherMonth, year, month) {
            var self = this;
            var cell = $e.fn.create('div');
            $e.fn.addClass(cell, 'yc-calendar__date');
            if (isOtherMonth) {
                $e.fn.addClass(cell, 'is-other-month');
            }

            var inner = $e.fn.create('div');
            $e.fn.addClass(inner, 'yc-calendar__date-inner');

            var number = $e.fn.create('span');
            $e.fn.addClass(number, 'yc-calendar__date-number');
            number.textContent = day;
            inner.appendChild(number);
            cell.appendChild(inner);

            var currentDate = new Date(year, month, day);
            if (self.isToday(currentDate)) {
                $e.fn.addClass(cell, 'is-today');
            }
            if (self.isSelected(currentDate)) {
                $e.fn.addClass(cell, 'is-selected');
            }
            if (self.props.range && self.isInRange(currentDate)) {
                $e.fn.addClass(cell, 'is-in-range');
            }

            if (self.props.events) {
                var event = self.props.events.find(function (e) {
                    return e.date && new Date(e.date).getTime() === currentDate.getTime();
                });
                if (event) {
                    var content = $e.fn.create('div');
                    $e.fn.addClass(content, 'yc-calendar__date-content');
                    content.textContent = event.title || '';
                    inner.appendChild(content);
                    if (event.dot) {
                        var dot = $e.fn.create('div');
                        $e.fn.addClass(dot, 'yc-calendar__dot');
                        inner.appendChild(dot);
                    }
                }
            }

            self.bindListen($e.events.regEvent(cell, 'click', self, function (e) {
                self.onDateSelect(currentDate, cell);
            }));
            return cell;
        },

        isToday: function (date) {
            var today = new Date();
            return date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate();
        },

        isSelected: function (date) {
            if (!this._selectedDate) return false;
            return date.getTime() === this._selectedDate.getTime();
        },

        isInRange: function (date) {
            if (!this._rangeStart || !this._rangeEnd) return false;
            return date.getTime() >= this._rangeStart.getTime() && date.getTime() <= this._rangeEnd.getTime();
        },

        changeMonth: function (delta) {
            var year = this._currentMonth.getFullYear();
            var month = this._currentMonth.getMonth() + delta;
            this._currentMonth = new Date(year, month, 1);
            this.renderCalendar();
        },

        goToToday: function () {
            this._currentMonth = new Date();
            this.renderCalendar();
        },

        onDateSelect: function (date, cell) {
            var options = this.props;
            if (options.range) {
                if (!this._rangeStart || (this._rangeStart && this._rangeEnd)) {
                    this._rangeStart = date;
                    this._rangeEnd = null;
                } else {
                    if (date.getTime() < this._rangeStart.getTime()) {
                        this._rangeEnd = this._rangeStart;
                        this._rangeStart = date;
                    } else {
                        this._rangeEnd = date;
                    }
                }
            } else {
                this._selectedDate = date;
            }
            this.renderCalendar();
            if (options.onSelect) {
                if (options.range) {
                    options.onSelect([this._rangeStart, this._rangeEnd], date);
                } else {
                    options.onSelect(date);
                }
            }
        },

        getValue: function () {
            if (this.props.range) {
                return [this._rangeStart, this._rangeEnd];
            }
            return this._selectedDate;
        },

        setValue: function (value) {
            if (this.props.range && value instanceof Array) {
                this._rangeStart = value[0];
                this._rangeEnd = value[1];
            } else {
                this._selectedDate = value;
                if (value) {
                    this._currentMonth = new Date(value.getFullYear(), value.getMonth(), 1);
                }
            }
            this.renderCalendar();
        },

        selfRelease: function () {
            var listenersLen = this._listeners.length;
            for (var i = 0; i < listenersLen; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this._header = null;
            this._datesContainer = null;
            this.body = null;
            this.shell = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new CalendarView(options);
        }
    };
    $e.ui.addViewPlugin("view_calendar", plugin);
}($e);