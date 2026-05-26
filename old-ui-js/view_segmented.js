/**
 * @file 分段控制器组件
 * @description 用于在多个选项中进行选择，支持单选、禁用状态和自定义样式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * SegmentedView 分段控制器组件
     * 用于在多个选项中进行选择，支持单选、禁用状态和自定义样式
     * @class
     * @param {Object} options - 配置选项
     * @param {Array} [options.options=[]] - 选项配置数组
     * @param {*} [options.value] - 当前选中值
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {Function} [options.onChange] - 值变化回调
     */
    function SegmentedView(options) {
        this.props = options || {};
        this._options = this.props['options'] || [];
        this._value = this.props['value'] !== undefined ? this.props['value'] : null;
        this._disabled = $e.fn.getBoolean(this.props['disabled'], false);
        this._onChange = this.props['onChange'] || null;
        this._handle = null;
    }

    SegmentedView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_segmented',
        shell: null,
        body: null,
        _options: [],
        _value: null,
        _disabled: false,
        _onChange: null,
        _handle: null,
        _optionEls: [],

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector('[view-band="body"]') || this.shell;
            $e.fn.addClass(this.shell, 'yc-segmented');
            this.render();
            this.inited();
        },

        /**
         * 渲染Segmented组件DOM结构
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            this._optionEls = [];

            $e.fn.addClass(shell, 'yc-segmented-group');
            shell.style.display = 'inline-flex';
            shell.style.backgroundColor = 'var(--yc-bg-color-base)';
            shell.style.padding = '2px';

            var _this = this;
            this._options.forEach(function (option, index) {
                var optionEl = document.createElement('button');
                optionEl.className = 'yc-segmented-item';
                optionEl.innerHTML = option.label || option.value;
                optionEl.dataset.value = option.value;

                if (_this._value === option.value) {
                    $e.fn.addClass(optionEl, 'yc-segmented-item-active');
                }
                if (_this._disabled || option.disabled) {
                    $e.fn.addClass(optionEl, 'yc-segmented-item-disabled');
                    optionEl.disabled = true;
                }

                optionEl.addEventListener('click', _this.handleOptionClick.bind(_this, option.value));
                shell.appendChild(optionEl);
                _this._optionEls.push(optionEl);
            });
        },

        /**
         * 处理选项点击事件
         * @private
         * @param {*} value - 选项值
         * @param {Event} e - 事件对象
         * @returns {void}
         */
        handleOptionClick: function (value, e) {
            e.stopPropagation();
            if (this._disabled) {
                return;
            }
            this.setValue(value);
        },

        /**
         * 设置选中值
         * @public
         * @param {*} value - 选项值
         * @returns {void}
         */
        setValue: function (value) {
            if (this._value === value) {
                return;
            }

            this._value = value;

            this._optionEls.forEach(function (optionEl) {
                if (optionEl.dataset.value === value) {
                    $e.fn.addClass(optionEl, 'yc-segmented-item-active');
                } else {
                    $e.fn.removeClass(optionEl, 'yc-segmented-item-active');
                }
            });

            if (this._onChange) {
                this._onChange(value);
            }
        },

        /**
         * 获取当前选中值
         * @public
         * @returns {*} 当前选中值
         */
        getValue: function () {
            return this._value;
        },

        /**
         * 设置禁用状态
         * @public
         * @param {boolean} disabled - 是否禁用
         * @returns {void}
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._optionEls.forEach(function (optionEl) {
                optionEl.disabled = disabled;
                if (disabled) {
                    $e.fn.addClass(optionEl, 'yc-segmented-item-disabled');
                } else {
                    $e.fn.removeClass(optionEl, 'yc-segmented-item-disabled');
                }
            });
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            var _this = this;
            this._optionEls.forEach(function (optionEl) {
                optionEl.removeEventListener('click', _this.handleOptionClick);
            });
        }
    };

    var plugin = {
        create: function (options) {
            return new SegmentedView(options);
        }
    };

    $e.ui.addViewPlugin('view_segmented', plugin);
}($e);