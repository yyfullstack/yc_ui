/**
 * @file 开关组件
 * @description 支持开/关状态、文本标签、尺寸设置、类型设置、自定义颜色等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 开关组件构造函数
     * @class SwitchView
     * @param {Object} options - 配置选项
     * @param {boolean} [options.value=false] - 默认值
     * @param {string} [options.size=''] - 尺寸：large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {string} [options.activeText=''] - 开启状态文本
     * @param {string} [options.inactiveText=''] - 关闭状态文本
     * @param {string} [options.activeColor=''] - 开启状态颜色
     * @param {string} [options.inactiveColor=''] - 关闭状态颜色
     * @param {string} [options.type=''] - 类型：success/warning/danger/info
     * @param {boolean} [options.textType=false] - 是否为文字模式
     * @param {Function} [options.onChange] - 值变更回调
     */
    function SwitchView(options) {
        this.props = options;
        this._value = $e.fn.getBoolean(options.value, false);
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._activeText = options.activeText || '';
        this._inactiveText = options.inactiveText || '';
        this._activeColor = options.activeColor || '';
        this._inactiveColor = options.inactiveColor || '';
        this._type = options.type || ''; // success, warning, danger, info
        this._textType = $e.fn.getBoolean(options.textType, false);
    }

    SwitchView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_switch',
        body: null,
        shell: null,
        _wrapper: null,
        _input: null,
        _label: null,

        /**
         * 初始化组件
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.updateState();
            this.inited();
        },

        /**
         * 构建DOM结构
         */
        buildDOM: function () {
            var wrapper = document.createElement('label');
            wrapper.className = 'yc-switch';
            if (this._size) {
                wrapper.classList.add('yc-switch--' + this._size);
            }
            if (this._disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (this._type) {
                wrapper.classList.add('yc-switch--' + this._type);
            }
            if (this._textType) {
                wrapper.classList.add('yc-switch--text');
            }

            // 左侧文本（关闭状态）
            if (this._inactiveText) {
                var leftLabel = document.createElement('span');
                leftLabel.className = 'yc-switch__label';
                leftLabel.textContent = this._inactiveText;
                wrapper.appendChild(leftLabel);
            }

            // 输入框
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'yc-switch__input';
            input.checked = this._value;
            input.disabled = this._disabled;
            wrapper.appendChild(input);
            this._input = input;

            // 滑块包装
            var switchWrapper = document.createElement('span');
            switchWrapper.className = 'yc-switch__wrapper';

            // 滑块
            var slider = document.createElement('span');
            slider.className = 'yc-switch__slider';
            switchWrapper.appendChild(slider);

            wrapper.appendChild(switchWrapper);

            // 右侧文本（开启状态）
            if (this._activeText) {
                var rightLabel = document.createElement('span');
                rightLabel.className = 'yc-switch__label';
                rightLabel.textContent = this._activeText;
                wrapper.appendChild(rightLabel);
            }

            this._wrapper = wrapper;
            this.body.appendChild(wrapper);
        },

        /**
         * 绑定事件
         */
        bindEvents: function () {
            var self = this;

            this.bindListen($e.events.regEvent(this._input, 'change', this, function (e) {
                if (self._disabled) {
                    e.preventDefault();
                    self._input.checked = self._value;
                    return;
                }
                self._value = e.target.checked;
                self.updateState();
                if (self.props.onChange) {
                    self.props.onChange(self._value);
                }
            }));
        },

        /**
         * 更新状态
         */
        updateState: function () {
            if (this._value) {
                this._wrapper.classList.add('is-checked');
            } else {
                this._wrapper.classList.remove('is-checked');
            }

            var innerWrapper = this._wrapper.querySelector('.yc-switch__wrapper');
            if (this._activeColor && this._value && innerWrapper) {
                innerWrapper.style.backgroundColor = this._activeColor;
            }
            if (this._inactiveColor && !this._value && innerWrapper) {
                innerWrapper.style.backgroundColor = this._inactiveColor;
            }
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
        setValue: function (value) {
            this._value = !!value;
            this._input.checked = this._value;
            this.updateState();
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
            this._wrapper = null;
            this._input = null;
            this._label = null;
            this.body = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new SwitchView(options);
        }
    };
    $e.ui.addViewPlugin("view_switch", plugin);
}($e);
