/**
 * @file 复选框视图组件
 * @description 支持单选/组选、半选状态、尺寸设置、按钮样式、垂直/水平布局等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * // 单个复选框
 * var checkbox = $e.ui.createView('view_checkbox', {
 *     label: '同意协议',
 *     checked: true
 * });
 *
 * // 复选框组
 * var checkboxGroup = $e.ui.createView('view_checkbox', {
 *     options: [
 *         { value: '1', label: '选项1' },
 *         { value: '2', label: '选项2' }
 *     ],
 *     value: ['1']
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 复选框视图组件构造函数
     * @class CheckboxView
     * @param {Object} options - 配置选项
     * @param {Array} [options.options=[]] - 选项数据数组（有值时为组模式）
     * @param {boolean|Array} [options.value] - 选中值（组模式时为数组）
     * @param {string} [options.size=''] - 尺寸：large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {boolean} [options.indeterminate=false] - 是否半选状态
     * @param {string} [options.type=''] - 类型：button（按钮样式）
     * @param {string} [options.direction='horizontal'] - 布局方向：horizontal/vertical
     * @param {string} [options.label=''] - 单个复选框的标签文本
     * @param {boolean} [options.checked=false] - 是否默认选中
     * @param {Function} [options.onChange] - 值变更事件回调
     */
    function CheckboxView(options) {
        this.props = options || {};
        this.optionList = this.props.options || [];
        this.value = this.props.value !== undefined
            ? this.props.value
            : (this.props.indeterminate ? false : []);
        this.size = this.props.size || '';
        this.disabled = $e.fn.getBoolean(this.props.disabled, false);
        this.indeterminate = $e.fn.getBoolean(this.props.indeterminate, false);
        this.type = this.props.type || '';
        this.direction = this.props.direction || 'horizontal';
        this.label = this.props.label || '';
        this.checked = $e.fn.getBoolean(this.props.checked, false);
        this.isGroup = this.optionList.length > 0;
    }

    CheckboxView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_checkbox',
        body: null,
        shell: null,

        wrapper: null,
        input: null,
        checkboxes: [],

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.inited();
        },

        buildDOM: function () {
            if (this.isGroup) {
                this.buildGroup();
            } else {
                this.buildSingle();
            }
        },

        buildSingle: function () {
            var wrapper = document.createElement('label');
            wrapper.className = 'yc-checkbox';
            if (this.size) {
                wrapper.classList.add('yc-checkbox--' + this.size);
            }
            if (this.disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (this.indeterminate) {
                wrapper.classList.add('is-indeterminate');
            }
            if (this.checked) {
                wrapper.classList.add('is-checked');
            }

            var input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'yc-checkbox__input';
            input.checked = this.checked;
            input.disabled = this.disabled;
            input.indeterminate = this.indeterminate;
            wrapper.appendChild(input);

            var checkboxWrapper = document.createElement('span');
            checkboxWrapper.className = 'yc-checkbox__wrapper';
            wrapper.appendChild(checkboxWrapper);

            if (this.label) {
                var label = document.createElement('span');
                label.className = 'yc-checkbox__label';
                label.textContent = this.label;
                wrapper.appendChild(label);
            }

            this.wrapper = wrapper;
            this.input = input;
            this.body.appendChild(wrapper);
        },

        buildGroup: function () {
            var self = this;
            var group = document.createElement('div');
            group.className = 'yc-checkbox-group';
            if (this.size) {
                group.classList.add('yc-checkbox-group--' + this.size);
            }
            if (this.direction === 'vertical') {
                group.classList.add('yc-checkbox-group--vertical');
            }

            this.optionList.forEach(function (opt) {
                var label = document.createElement('label');
                var isButton = self.type === 'button';
                var baseClass = isButton ? 'yc-checkbox-button' : 'yc-checkbox';
                label.className = baseClass;
                if (self.size) {
                    label.classList.add(baseClass + '--' + self.size);
                }

                var isChecked = self.value.indexOf(opt.value) >= 0;
                if (isChecked) {
                    label.classList.add('is-checked');
                }
                if (opt.disabled || self.disabled) {
                    label.classList.add('is-disabled');
                }

                var input = document.createElement('input');
                input.type = 'checkbox';
                input.className = isButton ? 'yc-checkbox-button__input' : 'yc-checkbox__input';
                input.value = opt.value;
                input.checked = isChecked;
                input.disabled = opt.disabled || self.disabled;
                label.appendChild(input);

                var checkboxWrapper = document.createElement('span');
                checkboxWrapper.className = isButton ? 'yc-checkbox-button__wrapper' : 'yc-checkbox__wrapper';
                label.appendChild(checkboxWrapper);

                var textLabel = document.createElement('span');
                textLabel.className = isButton ? 'yc-checkbox-button__label' : 'yc-checkbox__label';
                textLabel.textContent = opt.label || opt.value;
                label.appendChild(textLabel);

                group.appendChild(label);
                self.checkboxes.push({
                    input: input,
                    label: label,
                    value: opt.value
                });
            });

            this.wrapper = group;
            this.body.appendChild(group);
        },

        bindEvents: function () {
            var self = this;

            if (this.isGroup) {
                this.checkboxes.forEach(function (item) {
                    self.bindListen($e.events.regEvent(item.input, 'change', self, function (e) {
                        if (e.target.checked) {
                            if (self.value.indexOf(item.value) < 0) {
                                self.value.push(item.value);
                            }
                        } else {
                            var index = self.value.indexOf(item.value);
                            if (index >= 0) {
                                self.value.splice(index, 1);
                            }
                        }
                        self.updateGroupState();
                        if (self.props.onChange) {
                            self.props.onChange(self.value);
                        }
                    }));
                });
            } else {
                this.bindListen($e.events.regEvent(this.input, 'change', this, function (e) {
                    self.checked = e.target.checked;
                    self.indeterminate = false;
                    self.input.indeterminate = false;
                    if (self.checked) {
                        self.wrapper.classList.add('is-checked');
                    } else {
                        self.wrapper.classList.remove('is-checked');
                    }
                    self.wrapper.classList.remove('is-indeterminate');
                    if (self.props.onChange) {
                        self.props.onChange(self.checked);
                    }
                }));
            }
        },

        updateGroupState: function () {
            var self = this;
            this.checkboxes.forEach(function (item) {
                if (self.value.indexOf(item.value) >= 0) {
                    item.label.classList.add('is-checked');
                    item.input.checked = true;
                } else {
                    item.label.classList.remove('is-checked');
                    item.input.checked = false;
                }
            });
        },

        /**
         * 获取当前值
         * @returns {boolean|Array} 单个复选框返回boolean，组模式返回数组
         */
        getValue: function () {
            return this.isGroup ? this.value : this.checked;
        },

        /**
         * 设置值
         * @param {boolean|Array} value - 要设置的值
         */
        setValue: function (value) {
            if (this.isGroup) {
                this.value = value || [];
                this.updateGroupState();
            } else {
                this.checked = !!value;
                this.input.checked = this.checked;
                if (this.checked) {
                    this.wrapper.classList.add('is-checked');
                } else {
                    this.wrapper.classList.remove('is-checked');
                }
            }
        },

        /**
         * 设置半选状态
         * @param {boolean} indeterminate - 是否半选
         */
        setIndeterminate: function (indeterminate) {
            if (this.isGroup) {
                return;
            }
            this.indeterminate = indeterminate;
            this.input.indeterminate = indeterminate;
            if (indeterminate) {
                this.wrapper.classList.add('is-indeterminate');
            } else {
                this.wrapper.classList.remove('is-indeterminate');
            }
        },

        /**
         * 设置禁用状态
         * @param {boolean} disabled - 是否禁用
         */
        setDisabled: function (disabled) {
            this.disabled = disabled;
            if (this.isGroup) {
                this.checkboxes.forEach(function (item) {
                    item.input.disabled = disabled;
                    if (disabled) {
                        item.label.classList.add('is-disabled');
                    } else {
                        item.label.classList.remove('is-disabled');
                    }
                });
            } else {
                this.input.disabled = disabled;
                if (disabled) {
                    this.wrapper.classList.add('is-disabled');
                } else {
                    this.wrapper.classList.remove('is-disabled');
                }
            }
        },

        selfRelease: function () {
            this.wrapper = null;
            this.input = null;
            this.checkboxes = [];
        },

        resize: function () {
        }
    };

    var plugin = {
        create: function (options) {
            return new CheckboxView(options);
        }
    };

    $e.ui.addViewPlugin('view_checkbox', plugin);
}($e);