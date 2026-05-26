/**
 * @file 下拉选择视图组件
 * @description 支持下拉选项、多选、搜索过滤、尺寸设置、状态设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var select = $e.ui.createView('view_select', {
 *     options: [
 *         { value: '1', label: '选项1' },
 *         { value: '2', label: '选项2' }
 *     ],
 *     placeholder: '请选择',
 *     clearable: true,
 *     filterable: true
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 下拉选择视图组件构造函数
     * @class SelectView
     * @param {Object} options - 配置选项
     * @param {Array} [options.options=[]] - 选项数据数组
     * @param {string|Array} [options.value] - 选中值（多选时为数组）
     * @param {string} [options.size=''] - 尺寸：large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {boolean} [options.multiple=false] - 是否多选
     * @param {boolean} [options.filterable=false] - 是否可搜索过滤
     * @param {boolean} [options.clearable=false] - 是否显示清空按钮
     * @param {string} [options.placeholder='请选择'] - 占位提示文本
     * @param {string} [options.status=''] - 状态：success/error/warning
     * @param {Function} [options.onChange] - 值变更事件回调
     * @param {Function} [options.onClear] - 清空事件回调
     */
    function SelectView(options) {
        this.props = options || {};
        this.optionList = this.props.options || [];
        this.value = this.props.value !== undefined
            ? this.props.value
            : (this.props.multiple ? [] : '');
        this.size = this.props.size || '';
        this.disabled = $e.fn.getBoolean(this.props.disabled, false);
        this.multiple = $e.fn.getBoolean(this.props.multiple, false);
        this.filterable = $e.fn.getBoolean(this.props.filterable, false);
        this.clearable = $e.fn.getBoolean(this.props.clearable, false);
        this.placeholder = this.props.placeholder || '请选择';
        this.status = this.props.status || '';
        this.isOpen = false;
        this.filterText = '';
    }

    SelectView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_select',
        body: null,
        shell: null,

        // DOM元素引用
        wrapper: null,
        input: null,
        arrow: null,
        clearBtn: null,
        dropdown: null,
        dropdownList: null,
        searchInput: null,

        // 事件处理
        docClickHandler: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.updateDisplay();
            this.inited();
        },

        /**
         * 构建DOM结构
         * @private
         * @returns {void}
         */
        buildDOM: function () {
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-select';
            if (this.size) {
                wrapper.classList.add('yc-select--' + this.size);
            }
            if (this.disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (this.status) {
                wrapper.classList.add('yc-select--' + this.status);
            }

            // 输入框包装
            var inputWrapper = document.createElement('div');
            inputWrapper.className = 'yc-select__input-wrapper';

            // 输入框
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'yc-select__input';
            input.readOnly = !this.filterable;
            input.disabled = this.disabled;
            input.placeholder = this.placeholder;
            inputWrapper.appendChild(input);
            this.input = input;

            // 箭头图标
            var arrow = document.createElement('span');
            arrow.className = 'yc-select__arrow';
            arrow.innerHTML = '&#9662;';
            inputWrapper.appendChild(arrow);
            this.arrow = arrow;

            // 清空按钮
            if (this.clearable) {
                var clearBtn = document.createElement('span');
                clearBtn.className = 'yc-select__clear';
                clearBtn.innerHTML = '&times;';
                inputWrapper.appendChild(clearBtn);
                this.clearBtn = clearBtn;
            }

            wrapper.appendChild(inputWrapper);

            // 下拉面板
            var dropdown = document.createElement('div');
            dropdown.className = 'yc-select__popper';

            var dropdownContent = document.createElement('div');
            dropdownContent.className = 'yc-select-dropdown';

            // 搜索框
            if (this.filterable) {
                var searchWrapper = document.createElement('div');
                searchWrapper.className = 'yc-select-dropdown__search-wrapper';

                var searchIcon = document.createElement('span');
                searchIcon.className = 'yc-select-dropdown__search-icon';
                searchIcon.innerHTML = '&#128269;';
                searchWrapper.appendChild(searchIcon);

                var searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.className = 'yc-select-dropdown__search';
                searchInput.placeholder = '搜索';
                searchWrapper.appendChild(searchInput);
                this.searchInput = searchInput;

                dropdownContent.appendChild(searchWrapper);
            }

            // 选项列表
            var list = document.createElement('div');
            list.className = 'yc-select-dropdown__list';
            dropdownContent.appendChild(list);
            this.dropdownList = list;

            dropdown.appendChild(dropdownContent);
            wrapper.appendChild(dropdown);
            this.dropdown = dropdown;

            this.body.appendChild(wrapper);
            this.wrapper = wrapper;

            this.renderOptions();
        },

        /**
         * 渲染选项列表
         * @private
         * @returns {void}
         */
        renderOptions: function () {
            var self = this;
            this.dropdownList.innerHTML = '';

            var filteredOptions = this.optionList;
            if (this.filterText) {
                filteredOptions = this.optionList.filter(function (opt) {
                    var text = (opt.label || opt.value).toString().toLowerCase();
                    return text.indexOf(self.filterText.toLowerCase()) >= 0;
                });
            }

            if (filteredOptions.length === 0) {
                var noData = document.createElement('div');
                noData.className = 'yc-select-dropdown__no-data';
                noData.textContent = '无数据';
                this.dropdownList.appendChild(noData);
                return;
            }

            filteredOptions.forEach(function (opt) {
                var item = document.createElement('div');
                item.className = 'yc-select-dropdown__item';
                item.textContent = opt.label || opt.value;

                var isSelected = self.isSelected(opt.value);
                if (isSelected) {
                    item.classList.add('is-selected');
                }
                if (opt.disabled) {
                    item.classList.add('is-disabled');
                }

                item.addEventListener('click', function () {
                    if (!opt.disabled) {
                        self.selectOption(opt);
                    }
                });

                self.dropdownList.appendChild(item);
            });
        },

        /**
         * 判断值是否已选中
         * @private
         * @param {string} value - 选项值
         * @returns {boolean} 是否已选中
         */
        isSelected: function (value) {
            if (this.multiple) {
                return this.value.indexOf(value) >= 0;
            }
            return this.value === value;
        },

        /**
         * 选择选项
         * @public
         * @param {Object} opt - 选项对象
         * @returns {void}
         */
        selectOption: function (opt) {
            if (this.multiple) {
                var index = this.value.indexOf(opt.value);
                if (index >= 0) {
                    this.value.splice(index, 1);
                } else {
                    this.value.push(opt.value);
                }
            } else {
                this.value = opt.value;
                this.closeDropdown();
            }
            this.updateDisplay();
            this.renderOptions();
            if (this.props.onChange) {
                this.props.onChange(this.value);
            }
        },

        /**
         * 更新显示内容
         * @private
         * @returns {void}
         */
        updateDisplay: function () {
            var self = this;
            if (this.multiple) {
                var labels = [];
                this.value.forEach(function (val) {
                    var opt = self.optionList.find(function (o) { return o.value === val; });
                    if (opt) {
                        labels.push(opt.label || opt.value);
                    }
                });
                this.input.value = labels.join(', ');
            } else {
                var selected = this.optionList.find(function (o) { return o.value === self.value; });
                this.input.value = selected ? (selected.label || selected.value) : '';
            }

            // 更新清空按钮和值状态
            if (this.clearable) {
                var hasValue = this.multiple ? this.value.length > 0 : this.value !== '';
                if (hasValue) {
                    this.wrapper.classList.add('has-value');
                } else {
                    this.wrapper.classList.remove('has-value');
                }
            }
        },

        /**
         * 绑定事件处理
         * @private
         * @returns {void}
         */
        bindEvents: function () {
            var self = this;

            // 点击展开下拉
            this.bindListen($e.events.regEvent(this.input, 'click', this, function () {
                if (!self.disabled) {
                    self.toggleDropdown();
                }
            }));

            // 搜索输入
            if (this.searchInput) {
                this.bindListen($e.events.regEvent(this.searchInput, 'input', this, function (e) {
                    self.filterText = e.target.value;
                    self.renderOptions();
                }));
            }

            // 过滤输入
            if (this.filterable && !this.searchInput) {
                this.bindListen($e.events.regEvent(this.input, 'input', this, function (e) {
                    self.filterText = e.target.value;
                    self.openDropdown();
                    self.renderOptions();
                }));
            }

            // 清空按钮
            if (this.clearBtn) {
                this.bindListen($e.events.regEvent(this.clearBtn, 'click', this, function (e) {
                    e.stopPropagation();
                    self.clear();
                }));
            }

            // 点击外部关闭
            this.docClickHandler = function (e) {
                if (!self.wrapper.contains(e.target)) {
                    self.closeDropdown();
                }
            };
            document.addEventListener('click', this.docClickHandler);
        },

        /**
         * 切换下拉面板显示状态
         * @public
         * @returns {void}
         */
        toggleDropdown: function () {
            if (this.isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        },

        /**
         * 打开下拉面板
         * @public
         * @returns {void}
         */
        openDropdown: function () {
            this.isOpen = true;
            this.wrapper.classList.add('is-active');
            this.dropdown.classList.add('is-visible');
            this.arrow.style.transform = 'translateY(-50%) rotate(180deg)';
            this.renderOptions();
        },

        /**
         * 关闭下拉面板
         * @public
         * @returns {void}
         */
        closeDropdown: function () {
            this.isOpen = false;
            this.wrapper.classList.remove('is-active');
            this.dropdown.classList.remove('is-visible');
            this.arrow.style.transform = 'translateY(-50%) rotate(0deg)';
            this.filterText = '';
            if (this.searchInput) {
                this.searchInput.value = '';
            }
        },

        /**
         * 清空选择
         * @public
         * @returns {void}
         */
        clear: function () {
            this.value = this.multiple ? [] : '';
            this.updateDisplay();
            this.renderOptions();
            if (this.props.onChange) {
                this.props.onChange(this.value);
            }
            if (this.props.onClear) {
                this.props.onClear();
            }
        },

        /**
         * 获取当前选中值
         * @public
         * @returns {string|Array} 当前选中值
         */
        getValue: function () {
            return this.value;
        },

        /**
         * 设置选中值
         * @public
         * @param {string|Array} value - 要设置的值
         * @returns {void}
         */
        setValue: function (value) {
            this.value = value;
            this.updateDisplay();
            this.renderOptions();
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
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            if (this.docClickHandler) {
                document.removeEventListener('click', this.docClickHandler);
                this.docClickHandler = null;
            }
            this.wrapper = null;
            this.input = null;
            this.arrow = null;
            this.clearBtn = null;
            this.dropdown = null;
            this.dropdownList = null;
            this.searchInput = null;
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
         * 创建下拉选择组件实例
         * @param {Object} options - 组件配置
         * @returns {SelectView} 下拉选择组件实例
         */
        create: function (options) {
            return new SelectView(options);
        }
    };

    $e.ui.addViewPlugin('view_select', plugin);
}($e);
