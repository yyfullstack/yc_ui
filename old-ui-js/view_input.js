/**
 * @file 输入框视图组件
 * @description 支持前缀/后缀、清空按钮、密码切换、尺寸设置、状态设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var input = $e.ui.createView('view_input', {
 *     value: '初始值',
 *     placeholder: '请输入内容',
 *     clearable: true,
 *     prefix: '<i class="icon-user"></i>',
 *     size: 'large'
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 输入框视图组件构造函数
     * @class InputView
     * @param {Object} options - 配置选项
     * @param {string} [options.value=''] - 初始值
     * @param {string} [options.inputType='text'] - 输入框类型：text/password/number等
     * @param {string} [options.size=''] - 尺寸：large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {boolean} [options.clearable=false] - 是否显示清空按钮
     * @param {boolean} [options.showPassword=false] - 是否显示密码切换按钮
     * @param {string} [options.prefix=''] - 前缀内容（HTML字符串）
     * @param {string} [options.suffix=''] - 后缀内容（HTML字符串）
     * @param {string} [options.placeholder=''] - 占位提示文本
     * @param {string} [options.status=''] - 状态：success/error/warning
     * @param {Function} [options.onInput] - 输入事件回调
     * @param {Function} [options.onFocus] - 聚焦事件回调
     * @param {Function} [options.onBlur] - 失焦事件回调
     * @param {Function} [options.onClear] - 清空事件回调
     */
    function InputView(options) {
        this.props = options || {};
        this.value = this.props.value || '';
        this.type = this.props.inputType || 'text';
        this.size = this.props.size || '';
        this.disabled = $e.fn.getBoolean(this.props.disabled, false);
        this.clearable = $e.fn.getBoolean(this.props.clearable, false);
        this.showPassword = $e.fn.getBoolean(this.props.showPassword, false);
        this.prefix = this.props.prefix || '';
        this.suffix = this.props.suffix || '';
        this.placeholder = this.props.placeholder || '';
        this.status = this.props.status || '';
    }

    InputView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_input',
        body: null,
        shell: null,

        // DOM元素引用
        input: null,
        clearBtn: null,
        passwordBtn: null,
        prefixEl: null,
        suffixEl: null,
        wrapper: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.inited();
        },

        /**
         * 构建DOM结构
         * @private
         * @returns {void}
         */
        buildDOM: function () {
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-input-wrapper';
            if (this.status) {
                wrapper.classList.add('yc-input-wrapper--' + this.status);
            }

            // 创建输入框
            var input = document.createElement('input');
            input.type = this.type;
            input.className = 'yc-input';
            input.value = this.value;
            input.placeholder = this.placeholder;
            input.disabled = this.disabled;

            if (this.size) {
                input.classList.add('yc-input--' + this.size);
            }
            if (this.prefix) {
                input.classList.add('yc-input--prefix');
            }
            if (this.clearable || this.suffix) {
                input.classList.add('yc-input--suffix');
            }
            if (this.clearable) {
                input.classList.add('yc-input--clearable');
            }

            this.input = input;
            wrapper.appendChild(input);

            // 前缀元素
            if (this.prefix) {
                var prefixEl = document.createElement('span');
                prefixEl.className = 'yc-input-prefix';
                prefixEl.innerHTML = this.prefix;
                wrapper.appendChild(prefixEl);
                this.prefixEl = prefixEl;
            }

            // 后缀元素
            if (this.suffix) {
                var suffixEl = document.createElement('span');
                suffixEl.className = 'yc-input-suffix';
                suffixEl.innerHTML = this.suffix;
                wrapper.appendChild(suffixEl);
                this.suffixEl = suffixEl;
            }

            // 清空按钮
            if (this.clearable) {
                var clearBtn = document.createElement('span');
                clearBtn.className = 'yc-input__clear';
                clearBtn.innerHTML = '&#10005;';
                wrapper.appendChild(clearBtn);
                this.clearBtn = clearBtn;
            }

            // 密码显示切换按钮
            if (this.showPassword && this.type === 'password') {
                var pwdBtn = document.createElement('span');
                pwdBtn.className = 'yc-input-suffix-icon';
                pwdBtn.innerHTML = '&#128065;';
                wrapper.appendChild(pwdBtn);
                this.passwordBtn = pwdBtn;
            }

            this.body.appendChild(wrapper);
            this.wrapper = wrapper;
        },

        /**
         * 绑定事件处理
         * @private
         * @returns {void}
         */
        bindEvents: function () {
            var self = this;

            // 输入事件
            this.bindListen($e.events.regEvent(this.input, 'input', this, function (e) {
                self.value = e.target.value;
                self.toggleClearBtn();
                if (self.props.onInput) {
                    self.props.onInput(self.value);
                }
            }));

            // 焦点事件
            this.bindListen($e.events.regEvent(this.input, 'focus', this, function () {
                self.toggleClearBtn();
                if (self.props.onFocus) {
                    self.props.onFocus(self.value);
                }
            }));

            // 失焦事件
            this.bindListen($e.events.regEvent(this.input, 'blur', this, function () {
                setTimeout(function () {
                    self.toggleClearBtn();
                }, 200);
                if (self.props.onBlur) {
                    self.props.onBlur(self.value);
                }
            }));

            // 清空按钮点击
            if (this.clearBtn) {
                this.bindListen($e.events.regEvent(this.clearBtn, 'click', this, function () {
                    self.setValue('');
                    self.input.focus();
                    if (self.props.onClear) {
                        self.props.onClear();
                    }
                }));
            }

            // 密码切换按钮点击
            if (this.passwordBtn) {
                this.bindListen($e.events.regEvent(this.passwordBtn, 'click', this, function () {
                    var isPassword = self.input.type === 'password';
                    self.input.type = isPassword ? 'text' : 'password';
                    self.passwordBtn.innerHTML = isPassword ? '&#128065;&#8205;&#128488;' : '&#128065;';
                }));
            }
        },

        /**
         * 切换清空按钮显示状态
         * @private
         * @returns {void}
         */
        toggleClearBtn: function () {
            if (!this.clearBtn) {
                return;
            }
            this.clearBtn.style.display = (this.value && this.value.length > 0) ? 'block' : 'none';
        },

        /**
         * 获取当前输入值
         * @public
         * @returns {string} 当前输入值
         */
        getValue: function () {
            return this.value;
        },

        /**
         * 设置输入值
         * @public
         * @param {string} value - 要设置的值
         * @returns {void}
         */
        setValue: function (value) {
            this.value = value || '';
            this.input.value = this.value;
            this.toggleClearBtn();
        },

        /**
         * 设置禁用状态
         * @public
         * @param {boolean} disabled - 是否禁用
         * @returns {void}
         */
        setDisabled: function (disabled) {
            this.disabled = disabled;
            this.input.disabled = disabled;
            if (disabled) {
                this.wrapper.classList.add('is-disabled');
            } else {
                this.wrapper.classList.remove('is-disabled');
            }
        },

        /**
         * 设置状态样式
         * @public
         * @param {string} status - 状态：success/error/warning
         * @returns {void}
         */
        setStatus: function (status) {
            if (this.status) {
                this.wrapper.classList.remove('yc-input-wrapper--' + this.status);
            }
            this.status = status;
            if (status) {
                this.wrapper.classList.add('yc-input-wrapper--' + status);
            }
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this.input = null;
            this.clearBtn = null;
            this.passwordBtn = null;
            this.prefixEl = null;
            this.suffixEl = null;
            this.wrapper = null;
            this.body = null;
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
         * 创建输入框组件实例
         * @param {Object} options - 组件配置
         * @returns {InputView} 输入框组件实例
         */
        create: function (options) {
            return new InputView(options);
        }
    };

    $e.ui.addViewPlugin('view_input', plugin);
}($e);
