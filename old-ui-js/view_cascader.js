/**
 * @file 级联选择组件
 * @description 支持多级级联选择、搜索、多选、尺寸设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 级联选择组件构造函数
     * @class CascaderView
     * @param {Object} options - 配置选项
     * @param {Array} [options.options=[]] - 选项数据数组
     * @param {Array} [options.value=[]] - 当前选中值
     * @param {string} [options.size=''] - 尺寸: large/small/mini
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {boolean} [options.multiple=false] - 是否多选
     * @param {boolean} [options.filterable=false] - 是否可搜索
     * @param {boolean} [options.clearable=false] - 是否可清空
     * @param {string} [options.placeholder='请选择'] - 占位文本
     * @param {string} [options.separator=' / '] - 分隔符
     * @param {Function} [options.onChange] - 值变更回调
     * @param {Function} [options.onClear] - 清空回调
     */
    function CascaderView(options) {
        this.props = options;
        this._options = options.options || [];
        this._value = options.value !== undefined ? options.value : [];
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._multiple = $e.fn.getBoolean(options.multiple, false);
        this._filterable = $e.fn.getBoolean(options.filterable, false);
        this._clearable = $e.fn.getBoolean(options.clearable, false);
        this._placeholder = options.placeholder || '\u8BF7\u9009\u62E9';
        this._separator = options.separator || ' / ';
        this._isOpen = false;
        this._activePath = [];
        this._panels = [];
    }

    CascaderView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_cascader',
        body: null,
        shell: null,
        _wrapper: null,
        _input: null,
        _dropdown: null,
        _panelsContainer: null,
        _clearBtn: null,
        _arrow: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.updateDisplay();
            this.inited();
        },

        buildDOM: function () {
            var self = this;
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-cascader';
            if (self._size) {
                wrapper.classList.add('yc-cascader--' + self._size);
            }
            if (self._disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (self._multiple) {
                wrapper.classList.add('yc-cascader--multiple');
            }

            var inputWrapper = document.createElement('div');
            inputWrapper.className = 'yc-cascader__input-wrapper';

            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'yc-cascader__input';
            input.readOnly = true;
            input.disabled = self._disabled;
            input.placeholder = self._placeholder;
            inputWrapper.appendChild(input);
            self._input = input;

            if (self._clearable) {
                var clearBtn = document.createElement('span');
                clearBtn.className = 'yc-cascader__clear';
                clearBtn.textContent = '\u00D7';
                inputWrapper.appendChild(clearBtn);
                self._clearBtn = clearBtn;
            }

            var arrow = document.createElement('span');
            arrow.className = 'yc-cascader__dropdown-icon';
            arrow.textContent = '\u25BC';
            inputWrapper.appendChild(arrow);
            self._arrow = arrow;

            wrapper.appendChild(inputWrapper);

            var dropdown = document.createElement('div');
            dropdown.className = 'yc-cascader__dropdown';

            if (self._filterable) {
                var searchWrapper = document.createElement('div');
                searchWrapper.className = 'yc-cascader__search-wrapper';

                var searchIcon = document.createElement('span');
                searchIcon.className = 'yc-cascader__search-icon';
                searchIcon.textContent = '\uD83D\uDD0D';
                searchWrapper.appendChild(searchIcon);

                var searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.className = 'yc-cascader__search-input';
                searchInput.placeholder = '\u641C\u7D22';
                searchWrapper.appendChild(searchInput);

                var searchBtn = document.createElement('button');
                searchBtn.className = 'yc-cascader__search-btn';
                searchBtn.textContent = '\u641C\u7D22';
                searchWrapper.appendChild(searchBtn);

                dropdown.appendChild(searchWrapper);

                searchInput.addEventListener('input', function (e) {
                    self.filterOptions(e.target.value);
                });
            }

            var panelsContainer = document.createElement('div');
            panelsContainer.className = 'yc-cascader__panels';
            dropdown.appendChild(panelsContainer);
            self._panelsContainer = panelsContainer;

            wrapper.appendChild(dropdown);
            self._dropdown = dropdown;

            self.body.appendChild(wrapper);
            self._wrapper = wrapper;

            self.renderPanels();
        },

        renderPanels: function (options, level) {
            var self = this;
            level = level || 0;
            options = options || self._options;

            var panelsLen = self._panels.length;
            while (panelsLen > level) {
                self._panels[panelsLen - 1].remove();
                self._panels.pop();
                panelsLen--;
            }

            if (!options || options.length === 0) return;

            var panel = document.createElement('div');
            panel.className = 'yc-cascader__panel';

            options.forEach(function (opt) {
                var option = document.createElement('div');
                option.className = 'yc-cascader__option';
                if (opt.disabled) {
                    option.classList.add('is-disabled');
                }

                var label = document.createElement('span');
                label.className = 'yc-cascader__option__label';
                label.textContent = opt.label;
                option.appendChild(label);

                if (opt.children && opt.children.length > 0) {
                    var arrow = document.createElement('span');
                    arrow.className = 'yc-cascader__option__arrow';
                    arrow.textContent = '\u25B6';
                    option.appendChild(arrow);
                }

                option.addEventListener('click', function () {
                    if (opt.disabled) return;
                    self.selectOption(opt, level);
                });

                panel.appendChild(option);
            });

            self._panelsContainer.appendChild(panel);
            self._panels.push(panel);
        },

        selectOption: function (opt, level) {
            this._activePath[level] = opt;
            this._activePath = this._activePath.slice(0, level + 1);

            if (opt.children && opt.children.length > 0) {
                this.renderPanels(opt.children, level + 1);
            } else {
                var value = this._activePath.map(function (o) { return o.value; });
                this._value = value;
                this.updateDisplay();
                this.closeDropdown();
                if (this.props.onChange) {
                    this.props.onChange(this._value, this._activePath);
                }
            }
        },

        filterOptions: function (text) {
            var self = this;
            if (!text) {
                self._panelsContainer.textContent = '';
                self._panels = [];
                self.renderPanels();
                return;
            }

            var results = self.searchOptions(self._options, text);
            self._panelsContainer.textContent = '';
            self._panels = [];

            if (results.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'yc-cascader__empty';
                empty.textContent = '\u65E0\u5339\u914D\u6570\u636E';
                self._panelsContainer.appendChild(empty);
                return;
            }

            results.forEach(function (path) {
                var option = document.createElement('div');
                option.className = 'yc-cascader__option';
                option.textContent = path.map(function (o) { return o.label; }).join(self._separator);
                option.addEventListener('click', function () {
                    self._value = path.map(function (o) { return o.value; });
                    self._activePath = path;
                    self.updateDisplay();
                    self.closeDropdown();
                    if (self.props.onChange) {
                        self.props.onChange(self._value, path);
                    }
                });
                self._panelsContainer.appendChild(option);
            });
        },

        searchOptions: function (options, text, path) {
            var self = this;
            path = path || [];
            var results = [];

            options.forEach(function (opt) {
                var currentPath = path.concat([opt]);
                if (opt.label.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
                    results.push(currentPath);
                }
                if (opt.children && opt.children.length > 0) {
                    results = results.concat(self.searchOptions(opt.children, text, currentPath));
                }
            });

            return results;
        },

        updateDisplay: function () {
            var self = this;
            var labels = [];
            var options = self._options;
            self._value.forEach(function (val) {
                var opt = options.find(function (o) { return o.value === val; });
                if (opt) {
                    labels.push(opt.label);
                    options = opt.children || [];
                }
            });
            self._input.value = labels.join(self._separator);
        },

        bindEvents: function () {
            var self = this;

            self.bindListen($e.events.regEvent(self._input, 'click', self, function () {
                if (!self._disabled) {
                    self.toggleDropdown();
                }
            }));

            if (self._clearBtn) {
                self.bindListen($e.events.regEvent(self._clearBtn, 'click', self, function (e) {
                    e.stopPropagation();
                    self.clear();
                }));
            }

            self._docClickHandler = function (e) {
                if (!self._wrapper.contains(e.target)) {
                    self.closeDropdown();
                }
            };
            document.addEventListener('click', self._docClickHandler);
        },

        toggleDropdown: function () {
            if (this._isOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        },

        openDropdown: function () {
            this._isOpen = true;
            this._dropdown.style.display = 'flex';
            this._arrow.classList.add('is-reverse');
        },

        closeDropdown: function () {
            this._isOpen = false;
            this._dropdown.style.display = 'none';
            this._arrow.classList.remove('is-reverse');
        },

        clear: function () {
            this._value = [];
            this._activePath = [];
            this.updateDisplay();
            if (this.props.onChange) {
                this.props.onChange(this._value, []);
            }
            if (this.props.onClear) {
                this.props.onClear();
            }
        },

        getValue: function () {
            return this._value;
        },

        setValue: function (value) {
            this._value = value || [];
            this.updateDisplay();
        },

        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._input.disabled = disabled;
            if (disabled) {
                this._wrapper.classList.add('is-disabled');
            } else {
                this._wrapper.classList.remove('is-disabled');
            }
        },

        selfRelease: function () {
            if (this._docClickHandler) {
                document.removeEventListener('click', this._docClickHandler);
            }
            this._wrapper = null;
            this._input = null;
            this._dropdown = null;
            this._panelsContainer = null;
            this._clearBtn = null;
            this._arrow = null;
            this._panels = [];
            this.shell = null;
            this.body = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new CascaderView(options);
        }
    };
    $e.ui.addViewPlugin("view_cascader", plugin);
}($e);