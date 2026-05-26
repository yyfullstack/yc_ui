/**
 * @file 时间选择器组件
 * @description 提供时间选择功能，支持时、分、秒选择
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * TimePickerView 时间选择器组件
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.size='default'] 尺寸
     * @param {boolean} [options.disabled=false] 是否禁用
     * @param {boolean} [options.clearable=true] 是否可清空
     * @param {string} [options.format='HH:mm:ss'] 时间格式
     * @param {boolean} [options.range=false] 是否范围选择
     * @param {boolean} [options.confirmOnSelect] 是否选择后确认
     * @param {string} [options.placeholder='选择时间'] 占位符
     * @param {Function} [options.onChange] 变化回调
     */
    function TimePickerView(options) {
        this.props = options;
        this._listeners = [];
        this._opened = false;
        this._selectedTime = { hour: 0, minute: 0, second: 0 };
    }

    TimePickerView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_time_picker',
        body: null,
        shell: null,
        _listeners: null,
        _opened: false,
        _selectedTime: null,
        _trigger: null,
        _popper: null,
        _panel: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildTimePicker();
            this.inited();
        },

        buildTimePicker: function () {
            var self = this;
            var options = self.props;
            var size = options.size || 'default';
            var disabled = options.disabled || false;
            var clearable = options.clearable !== false;
            var format = options.format || 'HH:mm:ss';
            var range = options.range || false;

            $e.fn.addClass(self.shell, 'yc-time-picker');
            if (size !== 'default') {
                $e.fn.addClass(self.shell, 'yc-time-picker--' + size);
            }
            if (disabled) {
                $e.fn.addClass(self.shell, 'is-disabled');
            }
            if (clearable) {
                $e.fn.addClass(self.shell, 'yc-time-picker--clearable');
            }
            if (range) {
                $e.fn.addClass(self.shell, 'yc-time-picker--range');
            }

            self._trigger = $e.fn.create('div');
            $e.fn.addClass(self._trigger, 'yc-time-picker__input-wrapper');

            var placeholder = options.placeholder || '\u9009\u62E9\u65F6\u95F4';
            var input = $e.fn.create('input');
            $e.fn.addClass(input, 'yc-time-picker__input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.readOnly = true;
            self._trigger.appendChild(input);

            var icon = $e.fn.create('span');
            $e.fn.addClass(icon, 'yc-time-picker__icon');
            icon.textContent = '\uD83D\uDD50';
            self._trigger.appendChild(icon);

            if (clearable) {
                var clear = $e.fn.create('span');
                $e.fn.addClass(clear, 'yc-time-picker__clear');
                clear.textContent = '\u00D7';
                self.bindListen($e.events.regEvent(clear, 'click', self, function (e) {
                    e.stopPropagation();
                    self.clearValue();
                }));
                self._trigger.appendChild(clear);
            }

            self.getBody().appendChild(self._trigger);

            self._popper = $e.fn.create('div');
            $e.fn.addClass(self._popper, 'yc-time-picker__popper');

            self._panel = $e.fn.create('div');
            $e.fn.addClass(self._panel, 'yc-time-panel');
            if (format.indexOf('s') >= 0) {
                $e.fn.addClass(self._panel, 'yc-time-panel--with-seconds');
            }
            self.buildPanel();
            self._popper.appendChild(self._panel);
            self.getBody().appendChild(self._popper);
            self.bindEvents();
        },

        buildPanel: function () {
            var self = this;
            var content = $e.fn.create('div');
            $e.fn.addClass(content, 'yc-time-panel__content');

            var format = self.props.format || 'HH:mm:ss';
            var columns = [];
            if (format.indexOf('H') >= 0 || format.indexOf('h') >= 0) {
                columns.push('hour');
            }
            if (format.indexOf('m') >= 0) {
                columns.push('minute');
            }
            if (format.indexOf('s') >= 0) {
                columns.push('second');
            }

            for (var i = 0, colLen = columns.length; i < colLen; i++) {
                content.appendChild(self.createColumn(columns[i]));
            }
            self._panel.appendChild(content);

            var footer = $e.fn.create('div');
            $e.fn.addClass(footer, 'yc-time-panel__footer');

            var cancelBtn = $e.fn.create('button');
            $e.fn.addClass(cancelBtn, 'yc-time-panel__btn');
            $e.fn.addClass(cancelBtn, 'yc-time-panel__btn--text');
            cancelBtn.textContent = '\u53D6\u6D88';
            self.bindListen($e.events.regEvent(cancelBtn, 'click', self, function () {
                self.close();
            }));

            var confirmBtn = $e.fn.create('button');
            $e.fn.addClass(confirmBtn, 'yc-time-panel__btn');
            $e.fn.addClass(confirmBtn, 'yc-time-panel__btn--primary');
            confirmBtn.textContent = '\u786E\u5B9A';
            self.bindListen($e.events.regEvent(confirmBtn, 'click', self, function () {
                self.confirmValue();
            }));

            footer.appendChild(cancelBtn);
            footer.appendChild(confirmBtn);
            self._panel.appendChild(footer);
        },

        createColumn: function (type) {
            var self = this;
            var column = $e.fn.create('div');
            $e.fn.addClass(column, 'yc-time-panel__column');

            var list = $e.fn.create('ul');
            $e.fn.addClass(list, 'yc-time-panel__list');

            var max = type === 'hour' ? 24 : 60;
            for (var i = 0; i < max; i++) {
                var item = $e.fn.create('li');
                $e.fn.addClass(item, 'yc-time-panel__item');
                var value = i < 10 ? '0' + i : '' + i;
                item.textContent = value;
                item.setAttribute('data-value', i);
                if (self._selectedTime[type] === i) {
                    $e.fn.addClass(item, 'is-selected');
                }
                self.bindListen($e.events.regEvent(item, 'click', self, function (e) {
                    var val = parseInt(e.target.getAttribute('data-value'));
                    self.onTimeSelect(type, val);
                }));
                list.appendChild(item);
            }

            column.appendChild(list);
            return column;
        },

        onTimeSelect: function (type, value) {
            this._selectedTime[type] = value;
            this.updateSelection();
            if (!this.props.confirmOnSelect) {
                this.confirmValue();
            }
        },

        updateSelection: function () {
            var self = this;
            var columns = self._panel.querySelectorAll('.yc-time-panel__column');
            for (var c = 0, colLen = columns.length; c < colLen; c++) {
                var items = columns[c].querySelectorAll('.yc-time-panel__item');
                var type = c === 0 ? 'hour' : (c === 1 ? 'minute' : 'second');
                for (var i = 0, itemsLen = items.length; i < itemsLen; i++) {
                    $e.fn.removeClass(items[i], 'is-selected');
                    if (parseInt(items[i].getAttribute('data-value')) === self._selectedTime[type]) {
                        $e.fn.addClass(items[i], 'is-selected');
                    }
                }
            }
        },

        confirmValue: function () {
            var format = this.props.format || 'HH:mm:ss';
            var hour = this._selectedTime.hour;
            var minute = this._selectedTime.minute;
            var second = this._selectedTime.second;
            var value = format.replace('HH', hour < 10 ? '0' + hour : hour)
                .replace('mm', minute < 10 ? '0' + minute : minute)
                .replace('ss', second < 10 ? '0' + second : second)
                .replace('H', hour)
                .replace('m', minute)
                .replace('s', second);
            var input = this._trigger.querySelector('.yc-time-picker__input');
            if (input) {
                input.value = value;
            }
            this.close();
            if (this.props.onChange) {
                this.props.onChange(value, this._selectedTime);
            }
        },

        clearValue: function () {
            var input = this._trigger.querySelector('.yc-time-picker__input');
            if (input) {
                input.value = '';
            }
            this._selectedTime = { hour: 0, minute: 0, second: 0 };
            this.updateSelection();
            if (this.props.onChange) {
                this.props.onChange(null, null);
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
            $e.fn.addClass(this.shell, 'is-active');
            this._popper.style.display = 'block';
        },

        close: function () {
            this._opened = false;
            $e.fn.removeClass(this.shell, 'is-active');
            this._popper.style.display = 'none';
        },

        getValue: function () {
            var input = this._trigger.querySelector('.yc-time-picker__input');
            return input ? input.value : '';
        },

        setValue: function (value) {
            var input = this._trigger.querySelector('.yc-time-picker__input');
            if (input) {
                input.value = value;
            }
            if (value && typeof value === 'string') {
                var parts = value.split(':');
                this._selectedTime.hour = parseInt(parts[0]) || 0;
                this._selectedTime.minute = parseInt(parts[1]) || 0;
                this._selectedTime.second = parseInt(parts[2]) || 0;
                this.updateSelection();
            }
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
            this._popper = null;
            this._panel = null;
            this.body = null;
            this.shell = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new TimePickerView(options);
        }
    };
    $e.ui.addViewPlugin("view_time_picker", plugin);
}($e);