/**
 * @file DatePicker日期选择器组件
 * @description 提供日期选择功能，支持单选日期和日期范围选择
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * DatePickerView 日期选择器组件
     * 支持单选日期、日期范围选择、尺寸设置等功能
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.size='default'] 尺寸
     * @param {boolean} [options.range=false] 是否范围选择
     * @param {boolean} [options.disabled=false] 是否禁用
     * @param {string} [options.placeholder='选择日期'] 占位符
     * @param {Array} [options.rangePlaceholder=['开始日期', '结束日期']] 范围选择占位符
     * @param {Function} [options.onChange] 变化回调
     */
    function DatePickerView(options) {
        this.props = options;
        this._listeners = [];
        this._opened = false;
        this._selectedDate = null;
        this._rangeStart = null;
        this._rangeEnd = null;
        this._currentMonth = new Date();
    }

    DatePickerView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_date_picker',
        body: null,
        shell: null,
        _listeners: null,
        _opened: false,
        _selectedDate: null,
        _rangeStart: null,
        _rangeEnd: null,
        _currentMonth: null,
        _trigger: null,
        _panel: null,
        _datesContainer: null,
        _headerLabel: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDatePicker();
            this.inited();
        },

        buildDatePicker: function () {
            var self = this;
            var options = self.props;
            var size = options.size || 'default';
            var range = options.range || false;
            var disabled = options.disabled || false;

            $e.fn.addClass(self.shell, 'yc-date-picker');
            if (size !== 'default') {
                $e.fn.addClass(self.shell, 'yc-date-picker--' + size);
            }
            if (range) {
                $e.fn.addClass(self.shell, 'yc-date-picker--range');
            }
            if (disabled) {
                $e.fn.addClass(self.shell, 'is-disabled');
            }

            self._trigger = $e.fn.create('div');
            $e.fn.addClass(self._trigger, 'yc-date-picker__trigger');

            var placeholder = options.placeholder || '\u9009\u62E9\u65E5\u671F';
            var rangePlaceholder = options.rangePlaceholder || ['\u5F00\u59CB\u65E5\u671F', '\u7ED3\u675F\u65E5\u671F'];

            if (range) {
                self._trigger.innerHTML = '<div class="yc-date-picker__trigger-content"><span>' + rangePlaceholder[0] + '</span><span class="yc-date-picker__trigger-separator">\u81F3</span><span>' + rangePlaceholder[1] + '</span></div><i class="yc-date-picker__icon">\u25BC</i>';
            } else {
                self._trigger.innerHTML = '<div class="yc-date-picker__trigger-content"><span>' + placeholder + '</span></div><i class="yc-date-picker__icon">\u25BC</i>';
            }

            self.getBody().appendChild(self._trigger);

            self._panel = $e.fn.create('div');
            $e.fn.addClass(self._panel, 'yc-date-picker__panel');
            self.buildPanel();
            self.getBody().appendChild(self._panel);
            self.bindEvents();
        },

        buildPanel: function () {
            var self = this;
            var header = $e.fn.create('div');
            $e.fn.addClass(header, 'yc-date-picker__header');

            var nav = $e.fn.create('div');
            $e.fn.addClass(nav, 'yc-date-picker__header-nav');

            var prevYear = $e.fn.create('button');
            $e.fn.addClass(prevYear, 'yc-date-picker__header-prev-year');
            prevYear.textContent = '\u00AB';

            var prevMonth = $e.fn.create('button');
            $e.fn.addClass(prevMonth, 'yc-date-picker__header-prev');
            prevMonth.textContent = '\u2039';

            var nextMonth = $e.fn.create('button');
            $e.fn.addClass(nextMonth, 'yc-date-picker__header-next');
            nextMonth.textContent = '\u203A';

            var nextYear = $e.fn.create('button');
            $e.fn.addClass(nextYear, 'yc-date-picker__header-next-year');
            nextYear.textContent = '\u00BB';

            var label = $e.fn.create('div');
            $e.fn.addClass(label, 'yc-date-picker__header-label');
            label.innerHTML = '<span class="yc-date-picker__header-year"></span><span class="yc-date-picker__header-month"></span>';

            nav.appendChild(prevYear);
            nav.appendChild(prevMonth);
            nav.appendChild(label);
            nav.appendChild(nextMonth);
            nav.appendChild(nextYear);
            header.appendChild(nav);

            self._panel.appendChild(header);

            var content = $e.fn.create('div');
            $e.fn.addClass(content, 'yc-date-picker__content-wrapper');

            var weekdays = $e.fn.create('div');
            $e.fn.addClass(weekdays, 'yc-date-picker__weekdays');

            var weekNames = ['\u65E5', '\u4E00', '\u4E8C', '\u4E09', '\u56DB', '\u4E94', '\u516D'];
            for (var i = 0, len = weekNames.length; i < len; i++) {
                var day = $e.fn.create('div');
                $e.fn.addClass(day, 'yc-date-picker__weekday');
                day.textContent = weekNames[i];
                weekdays.appendChild(day);
            }

            content.appendChild(weekdays);

            var dates = $e.fn.create('div');
            $e.fn.addClass(dates, 'yc-date-picker__dates');
            content.appendChild(dates);

            self._panel.appendChild(content);
            self._datesContainer = dates;
            self._headerLabel = label;

            self.bindListen($e.events.regEvent(prevYear, 'click', self, function () { self.changeMonth(-12); }));
            self.bindListen($e.events.regEvent(prevMonth, 'click', self, function () { self.changeMonth(-1); }));
            self.bindListen($e.events.regEvent(nextMonth, 'click', self, function () { self.changeMonth(1); }));
            self.bindListen($e.events.regEvent(nextYear, 'click', self, function () { self.changeMonth(12); }));

            self.renderCalendar();
        },

        renderCalendar: function () {
            var self = this;
            var year = self._currentMonth.getFullYear();
            var month = self._currentMonth.getMonth();
            var headerLabel = self._headerLabel;

            headerLabel.querySelector('.yc-date-picker__header-year').textContent = year + '\u5E74';
            headerLabel.querySelector('.yc-date-picker__header-month').textContent = (month + 1) + '\u6708';

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var startDay = firstDay.getDay();
            var totalDays = lastDay.getDate();
            var prevMonthLastDay = new Date(year, month, 0).getDate();
            var datesContainer = self._datesContainer;

            datesContainer.textContent = '';

            for (var i = startDay - 1; i >= 0; i--) {
                var dateBtn = $e.fn.create('button');
                $e.fn.addClass(dateBtn, 'yc-date-picker__date');
                $e.fn.addClass(dateBtn, 'is-other-month');
                dateBtn.textContent = prevMonthLastDay - i;
                datesContainer.appendChild(dateBtn);
            }

            for (var i = 1; i <= totalDays; i++) {
                var dateBtn = $e.fn.create('button');
                $e.fn.addClass(dateBtn, 'yc-date-picker__date');
                dateBtn.textContent = i;

                var currentDate = new Date(year, month, i);

                if (self.isToday(currentDate)) {
                    $e.fn.addClass(dateBtn, 'is-today');
                }
                if (self.isSelected(currentDate)) {
                    $e.fn.addClass(dateBtn, 'is-selected');
                }
                if (self.props.range && self.isInRange(currentDate)) {
                    $e.fn.addClass(dateBtn, 'is-in-range');
                }

                self.bindListen($e.events.regEvent(dateBtn, 'click', self, function (e) {
                    var day = parseInt(e.target.textContent, 10);
                    self.onDateSelect(new Date(year, month, day));
                }));

                datesContainer.appendChild(dateBtn);
            }

            var remaining = 42 - (startDay + totalDays);
            for (var i = 1; i <= remaining; i++) {
                var dateBtn = $e.fn.create('button');
                $e.fn.addClass(dateBtn, 'yc-date-picker__date');
                $e.fn.addClass(dateBtn, 'is-other-month');
                dateBtn.textContent = i;
                datesContainer.appendChild(dateBtn);
            }
        },

        isToday: function (date) {
            var today = new Date();
            return date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate();
        },

        isSelected: function (date) {
            if (!this._selectedDate) {
                return false;
            }
            return date.getTime() === this._selectedDate.getTime();
        },

        isInRange: function (date) {
            if (!this._rangeStart || !this._rangeEnd) {
                return false;
            }
            return date.getTime() >= this._rangeStart.getTime() && date.getTime() <= this._rangeEnd.getTime();
        },

        changeMonth: function (delta) {
            var year = this._currentMonth.getFullYear();
            var month = this._currentMonth.getMonth() + delta;
            this._currentMonth = new Date(year, month, 1);
            this.renderCalendar();
        },

        onDateSelect: function (date) {
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
                    this.close();
                }
            } else {
                this._selectedDate = date;
                this.close();
            }

            this.renderCalendar();

            if (options.onChange) {
                if (options.range) {
                    options.onChange([this._rangeStart, this._rangeEnd]);
                } else {
                    options.onChange(date);
                }
            }
        },

        bindEvents: function () {
            var self = this;

            self.bindListen($e.events.regEvent(self._trigger, 'click', self, function (e) {
                if (!self.props.disabled) {
                    self.toggle();
                }
            }));

            self.bindListen($e.events.regEvent(document, 'click', self, function (e) {
                if (!self.shell.contains(e.target)) {
                    self.close();
                }
            }));
        },

        toggle: function () {
            if (this._opened) {
                this.close();
            } else {
                this.open();
            }
        },

        open: function () {
            this._opened = true;
            $e.fn.addClass(this.shell, 'is-open');
            $e.fn.addClass(this._panel, 'is-open');
        },

        close: function () {
            this._opened = false;
            $e.fn.removeClass(this.shell, 'is-open');
            $e.fn.removeClass(this._panel, 'is-open');
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
            this._trigger = null;
            this._panel = null;
            this._datesContainer = null;
            this._headerLabel = null;
            this.body = null;
            this.shell = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new DatePickerView(options);
        }
    };

    $e.ui.addViewPlugin('view_date_picker', plugin);
}($e);