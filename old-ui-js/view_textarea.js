/**
 * @file 文本域视图组件
 * @description 支持字符计数、自动调整高度、尺寸设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var textarea = $e.ui.createView('view_textarea', {
 *     value: '初始内容',
 *     placeholder: '请输入内容',
 *     maxlength: 200,
 *     showCount: true,
 *     autosize: true
 * });
 */
+function ($e) {
    'use strict';

    /**
     * TextareaView 文本域视图组件
     * 支持字符计数、自动调整高度、尺寸设置等功能
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.value=''] - 默认值
     * @param {string} [options.size=''] - 尺寸：large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {string} [options.placeholder=''] - 占位提示文本
     * @param {number} [options.maxlength=null] - 最大字符数
     * @param {boolean} [options.showCount=false] - 是否显示字符计数
     * @param {boolean} [options.autosize=false] - 是否自动调整高度
     * @param {number} [options.minRows=2] - 最小行数
     * @param {number} [options.maxRows=10] - 最大行数
     * @param {number} [options.rows=3] - 默认行数
     * @param {Function} [options.onInput] - 输入事件回调
     * @param {Function} [options.onFocus] - 焦点事件回调
     * @param {Function} [options.onBlur] - 失焦事件回调
     */
    function TextareaView(options) {
        this.props = options;
        this._value = options.value || '';
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._placeholder = options.placeholder || '';
        this._maxlength = options.maxlength || null;
        this._showCount = $e.fn.getBoolean(options.showCount, false);
        this._autosize = $e.fn.getBoolean(options.autosize, false);
        this._minRows = options.minRows || 2;
        this._maxRows = options.maxRows || 10;
        this._rows = options.rows || 3;
    }

    TextareaView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_textarea',
        body: null,
        shell: null,
        _textarea: null,
        _counter: null,
        _wrapper: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            if (this._autosize) {
                this.autoSize();
            }
            this.inited();
        },

        /**
         * 构建DOM结构
         * @private
         * @returns {void}
         */
        buildDOM: function () {
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-textarea-group';

            var textarea = document.createElement('textarea');
            textarea.className = 'yc-textarea';
            textarea.value = this._value;
            textarea.placeholder = this._placeholder;
            textarea.disabled = this._disabled;
            textarea.rows = this._rows;

            if (this._size) {
                textarea.classList.add('yc-textarea--' + this._size);
            }
            if (this._maxlength) {
                textarea.setAttribute('maxlength', this._maxlength);
            }

            this._textarea = textarea;
            wrapper.appendChild(textarea);

            if (this._showCount && this._maxlength) {
                var counter = document.createElement('span');
                counter.className = 'yc-textarea-counter';
                counter.innerText = this._value.length + '/' + this._maxlength;
                wrapper.appendChild(counter);
                this._counter = counter;
            }

            this.body.appendChild(wrapper);
            this._wrapper = wrapper;
        },

        /**
         * 绑定事件处理
         * @private
         * @returns {void}
         */
        bindEvents: function () {
            var _this = this;

            this.bindListen($e.events.regEvent(this._textarea, 'input', this, function (e) {
                _this._value = e.target.value;
                _this.updateCounter();
                if (_this._autosize) {
                    _this.autoSize();
                }
                if (_this.props.onInput) {
                    _this.props.onInput(_this._value);
                }
            }));

            this.bindListen($e.events.regEvent(this._textarea, 'focus', this, function () {
                if (_this.props.onFocus) {
                    _this.props.onFocus(_this._value);
                }
            }));

            this.bindListen($e.events.regEvent(this._textarea, 'blur', this, function () {
                if (_this.props.onBlur) {
                    _this.props.onBlur(_this._value);
                }
            }));
        },

        /**
         * 更新字符计数
         * @private
         * @returns {void}
         */
        updateCounter: function () {
            if (this._counter && this._maxlength) {
                this._counter.innerText = this._value.length + '/' + this._maxlength;
                if (this._value.length >= this._maxlength) {
                    this._counter.style.color = 'var(--yc-color-danger)';
                } else {
                    this._counter.style.color = '';
                }
            }
        },

        /**
         * 自动调整高度
         * @private
         * @returns {void}
         */
        autoSize: function () {
            var textarea = this._textarea;
            textarea.style.height = 'auto';

            var lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            var minHeight = lineHeight * this._minRows;
            var maxHeight = lineHeight * this._maxRows;

            var scrollHeight = textarea.scrollHeight;
            var newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));

            textarea.style.height = newHeight + 'px';
            textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        },

        /**
         * 获取当前值
         * @public
         * @returns {string} 当前文本值
         */
        getValue: function () {
            return this._value;
        },

        /**
         * 设置值
         * @public
         * @param {string} value - 要设置的文本值
         * @returns {void}
         */
        setValue: function (value) {
            this._value = value || '';
            this._textarea.value = this._value;
            this.updateCounter();
            if (this._autosize) {
                this.autoSize();
            }
        },

        /**
         * 设置禁用状态
         * @public
         * @param {boolean} disabled - 是否禁用
         * @returns {void}
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._textarea.disabled = disabled;
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this._textarea = null;
            this._counter = null;
            this._wrapper = null;
        },

        /**
         * 调整组件尺寸
         * @public
         * @param {Object} [options] - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建文本域组件实例
         * @param {Object} options - 组件配置
         * @returns {TextareaView} 文本域组件实例
         */
        create: function (options) {
            return new TextareaView(options);
        }
    };
    $e.ui.addViewPlugin("view_textarea", plugin);
}($e);