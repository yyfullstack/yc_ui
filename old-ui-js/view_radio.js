/**
 * @file 单选框组件
 * @description 支持单选组、按钮样式、尺寸设置、垂直/水平布局等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var radio = $e.ui.createView('view_radio', {
 *     options: [
 *         { value: '1', label: '选项1' },
 *         { value: '2', label: '选项2' }
 *     ],
 *     value: '1',
 *     direction: 'horizontal'
 * });
 */
+function ($e) {
    'use strict';

    /**
     * RadioView 单选框组件
     * @class
     * @param {Object} options - 配置选项
     * @param {Array} [options.options=[]] - 选项数据数组
     * @param {string} [options.value=''] - 选中值
     * @param {string} [options.size=''] - 尺寸：large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {string} [options.type=''] - 类型：button（按钮样式）
     * @param {string} [options.direction='horizontal'] - 布局方向：horizontal/vertical
     * @param {string} [options.label=''] - 单个单选框的标签文本
     * @param {boolean} [options.checked=false] - 是否默认选中
     * @param {string} [options.name=''] - 单选框组名称
     * @param {Function} [options.onChange] - 值变更回调
     */
    function RadioView(options) {
        this.props = options;
        this._options = options.options || [];
        this._value = options.value !== undefined ? options.value : '';
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._type = options.type || '';
        this._direction = options.direction || 'horizontal';
        this._label = options.label || '';
        this._checked = $e.fn.getBoolean(options.checked, false);
        this._isGroup = this._options.length > 0;
    }

    RadioView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_radio',
        body: null,
        shell: null,
        _wrapper: null,
        _radios: [],
        _input: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.inited();
        },

        buildDOM: function () {
            if (this._isGroup) {
                this.buildGroup();
            } else {
                this.buildSingle();
            }
        },

        buildSingle: function () {
            var wrapper = document.createElement('label');
            wrapper.className = 'yc-radio';
            if (this._size) {
                wrapper.classList.add('yc-radio--' + this._size);
            }
            if (this._disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (this._checked) {
                wrapper.classList.add('is-checked');
            }

            var input = document.createElement('input');
            input.type = 'radio';
            input.className = 'yc-radio__input';
            input.checked = this._checked;
            input.disabled = this._disabled;
            input.value = this.props.value || '';
            wrapper.appendChild(input);

            var radioWrapper = document.createElement('span');
            radioWrapper.className = 'yc-radio__wrapper';
            wrapper.appendChild(radioWrapper);

            if (this._label) {
                var label = document.createElement('span');
                label.className = 'yc-radio__label';
                label.textContent = this._label;
                wrapper.appendChild(label);
            }

            this._wrapper = wrapper;
            this._input = input;
            this.body.appendChild(wrapper);
        },

        buildGroup: function () {
            var self = this;
            var group = document.createElement('div');
            group.className = 'yc-radio-group';
            if (this._size) {
                group.classList.add('yc-radio-group--' + this._size);
            }
            if (this._direction === 'vertical') {
                group.classList.add('yc-radio-group--vertical');
            }

            this._options.forEach(function (opt) {
                var label = document.createElement('label');
                var isButton = self._type === 'button';
                label.className = isButton ? 'yc-radio-button' : 'yc-radio';
                if (self._size) {
                    label.classList.add((isButton ? 'yc-radio-button' : 'yc-radio') + '--' + self._size);
                }

                var isChecked = self._value === opt.value;
                if (isChecked) {
                    label.classList.add('is-checked');
                }
                if (opt.disabled || self._disabled) {
                    label.classList.add('is-disabled');
                }

                var input = document.createElement('input');
                input.type = 'radio';
                input.className = isButton ? 'yc-radio-button__input' : 'yc-radio__input';
                input.value = opt.value;
                input.checked = isChecked;
                input.disabled = opt.disabled || self._disabled;
                input.name = self.props.name || 'radio-group';
                label.appendChild(input);

                var radioWrapper = document.createElement('span');
                radioWrapper.className = isButton ? 'yc-radio-button__wrapper' : 'yc-radio__wrapper';
                label.appendChild(radioWrapper);

                var textLabel = document.createElement('span');
                textLabel.className = isButton ? 'yc-radio-button__label' : 'yc-radio__label';
                textLabel.textContent = opt.label || opt.value;
                label.appendChild(textLabel);

                group.appendChild(label);
                self._radios.push({
                    input: input,
                    label: label,
                    value: opt.value
                });
            });

            this._wrapper = group;
            this.body.appendChild(group);
        },

        bindEvents: function () {
            var self = this;

            if (this._isGroup) {
                this._radios.forEach(function (item) {
                    self.bindListen($e.events.regEvent(item.input, 'change', self, function (e) {
                        if (e.target.checked) {
                            self._value = item.value;
                            self.updateGroupState();
                            if (self.props.onChange) {
                                self.props.onChange(self._value);
                            }
                        }
                    }));
                });
            } else {
                this.bindListen($e.events.regEvent(this._input, 'change', this, function (e) {
                    self._checked = e.target.checked;
                    if (self._checked) {
                        self._wrapper.classList.add('is-checked');
                    } else {
                        self._wrapper.classList.remove('is-checked');
                    }
                    if (self.props.onChange) {
                        self.props.onChange(self._checked);
                    }
                }));
            }
        },

        updateGroupState: function () {
            var self = this;
            this._radios.forEach(function (item) {
                if (self._value === item.value) {
                    item.label.classList.add('is-checked');
                    item.input.checked = true;
                } else {
                    item.label.classList.remove('is-checked');
                    item.input.checked = false;
                }
            });
        },

        /**
         * 获取当前选中值
         * @returns {string|boolean}
         */
        getValue: function () {
            return this._isGroup ? this._value : (this._input ? this._input.value : this._checked);
        },

        /**
         * 设置选中值
         * @param {string} value - 要设置的选中值
         */
        setValue: function (value) {
            if (this._isGroup) {
                this._value = value;
                this.updateGroupState();
            } else {
                this._checked = !!value;
                this._input.checked = this._checked;
                if (this._checked) {
                    this._wrapper.classList.add('is-checked');
                } else {
                    this._wrapper.classList.remove('is-checked');
                }
            }
        },

        /**
         * 设置禁用状态
         * @param {boolean} disabled - 是否禁用
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            if (this._isGroup) {
                this._radios.forEach(function (item) {
                    item.input.disabled = disabled;
                    if (disabled) {
                        item.label.classList.add('is-disabled');
                    } else {
                        item.label.classList.remove('is-disabled');
                    }
                });
            } else {
                this._input.disabled = disabled;
                if (disabled) {
                    this._wrapper.classList.add('is-disabled');
                } else {
                    this._wrapper.classList.remove('is-disabled');
                }
            }
        },

        selfRelease: function () {
            this._wrapper = null;
            this._input = null;
            this._radios = [];
        },

        resize: function () {
        }
    };

    var plugin = {
        create: function (options) {
            return new RadioView(options);
        }
    };
    $e.ui.addViewPlugin("view_radio", plugin);
}($e);