/**
 * @file 数字输入框组件
 * @description 提供数字输入框功能，支持增加/减少按钮、最小值/最大值/步长设置、尺寸设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * InputNumberView 数字输入框视图组件
     * @class InputNumberView
     * @param {Object} options - 配置选项
     * @param {number} [options.value=0] - 初始值
     * @param {number} [options.min=-Infinity] - 最小值
     * @param {number} [options.max=Infinity] - 最大值
     * @param {number} [options.step=1] - 步长
     * @param {string} [options.size] - 尺寸
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {number} [options.precision] - 精度
     * @param {string} [options.prefix] - 前缀
     * @param {string} [options.suffix] - 后缀
     * @param {boolean} [options.controls=true] - 是否显示控制按钮
     * @param {Function} [options.onChange] - 值变化回调
     */
    function InputNumberView(options) {
        this.props = options;
        this._value = parseFloat(options.value) || 0;
        this._min = options.min !== undefined ? parseFloat(options.min) : -Infinity;
        this._max = options.max !== undefined ? parseFloat(options.max) : Infinity;
        this._step = parseFloat(options.step) || 1;
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._precision = options.precision !== undefined ? parseInt(options.precision) : null;
        this._prefix = options.prefix || '';
        this._suffix = options.suffix || '';
        this._controls = $e.fn.getBoolean(options.controls, true);
    }

    InputNumberView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_input_number',
        body: null,
        shell: null,
        _input: null,
        _decreaseBtn: null,
        _increaseBtn: null,
        _wrapper: null,

        /**
         * 初始化组件
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.updateControls();
            this.inited();
        },

        /**
         * 构建DOM结构
         */
        buildDOM: function () {
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-input-number';
            if (this._size) {
                wrapper.classList.add('yc-input-number--' + this._size);
            }
            if (this._disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (this._prefix) {
                wrapper.classList.add('yc-input-number--with-prefix');
            }
            if (this._suffix) {
                wrapper.classList.add('yc-input-number--with-suffix');
            }

            // 前缀
            if (this._prefix) {
                var prefixEl = document.createElement('span');
                prefixEl.className = 'yc-input-number__prefix';
                prefixEl.innerHTML = '<i>' + this._prefix + '</i>';
                wrapper.appendChild(prefixEl);
            }

            // 输入框
            var input = document.createElement('input');
            input.type = 'number';
            input.className = 'yc-input-number__input';
            input.value = this.formatValue(this._value);
            input.disabled = this._disabled;
            wrapper.appendChild(input);
            this._input = input;

            // 后缀
            if (this._suffix) {
                var suffixEl = document.createElement('span');
                suffixEl.className = 'yc-input-number__suffix';
                suffixEl.innerHTML = '<i>' + this._suffix + '</i>';
                wrapper.appendChild(suffixEl);
            }

            // 控制按钮
            if (this._controls) {
                var controls = document.createElement('div');
                controls.className = 'yc-input-number__controls';

                var decreaseBtn = document.createElement('span');
                decreaseBtn.className = 'yc-input-number__decrease';
                controls.appendChild(decreaseBtn);
                this._decreaseBtn = decreaseBtn;

                var increaseBtn = document.createElement('span');
                increaseBtn.className = 'yc-input-number__increase';
                controls.appendChild(increaseBtn);
                this._increaseBtn = increaseBtn;

                wrapper.appendChild(controls);
            }

            this.body.appendChild(wrapper);
            this._wrapper = wrapper;
        },

        /**
         * 绑定事件
         */
        bindEvents: function () {
            var _this = this;

            // 输入事件
            this.bindListen($e.events.regEvent(this._input, 'input', this, function (e) {
                var val = parseFloat(e.target.value);
                if (isNaN(val)) {
                    val = _this._min > 0 ? _this._min : 0;
                }
                _this.setValue(val, true);
            }));

            // 失焦事件
            this.bindListen($e.events.regEvent(this._input, 'blur', this, function () {
                _this.setValue(_this._value);
            }));

            // 减少按钮
            if (this._decreaseBtn) {
                this.bindListen($e.events.regEvent(this._decreaseBtn, 'click', this, function () {
                    if (!_this._disabled) {
                        _this.decrease();
                    }
                }));
            }

            // 增加按钮
            if (this._increaseBtn) {
                this.bindListen($e.events.regEvent(this._increaseBtn, 'click', this, function () {
                    if (!_this._disabled) {
                        _this.increase();
                    }
                }));
            }
        },

        /**
         * 格式化数值
         */
        formatValue: function (value) {
            if (this._precision !== null) {
                return value.toFixed(this._precision);
            }
            return value;
        },

        /**
         * 更新控制按钮状态
         */
        updateControls: function () {
            if (this._decreaseBtn) {
                if (this._value <= this._min) {
                    this._decreaseBtn.setAttribute('disabled', 'disabled');
                } else {
                    this._decreaseBtn.removeAttribute('disabled');
                }
            }
            if (this._increaseBtn) {
                if (this._value >= this._max) {
                    this._increaseBtn.setAttribute('disabled', 'disabled');
                } else {
                    this._increaseBtn.removeAttribute('disabled');
                }
            }
        },

        /**
         * 减少数值
         */
        decrease: function () {
            var newVal = this._value - this._step;
            this.setValue(newVal);
        },

        /**
         * 增加数值
         */
        increase: function () {
            var newVal = this._value + this._step;
            this.setValue(newVal);
        },

        /**
         * 获取值
         */
        getValue: function () {
            return this._value;
        },

        /**
         * 设置值
         */
        setValue: function (value, silent) {
            if (value < this._min) value = this._min;
            if (value > this._max) value = this._max;
            this._value = value;
            this._input.value = this.formatValue(this._value);
            this.updateControls();
            if (!silent && this.props.onChange) {
                this.props.onChange(this._value);
            }
        },

        /**
         * 设置禁用状态
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._input.disabled = disabled;
            if (disabled) {
                this._wrapper.classList.add('is-disabled');
            } else {
                this._wrapper.classList.remove('is-disabled');
            }
        },

        /**
         * 释放组件
         */
        selfRelease: function () {
            this._input = null;
            this._decreaseBtn = null;
            this._increaseBtn = null;
            this._wrapper = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new InputNumberView(options);
        }
    };
    $e.ui.addViewPlugin("view_input_number", plugin);
}($e);
