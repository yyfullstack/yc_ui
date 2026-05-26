+function ($e) {
    /**
     * MaskedInputView 掩码输入框视图组件
     * 支持格式掩码、前缀/后缀、清空按钮、尺寸设置等功能
     */
    function MaskedInputView(options) {
        this.props = options;
        this._value = options.value || '';
        this._mask = options.mask || '';
        this._maskChar = options.maskChar || '_';
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._clearable = $e.fn.getBoolean(options.clearable, false);
        this._prefix = options.prefix || '';
        this._suffix = options.suffix || '';
        this._placeholder = options.placeholder || '';
        this._status = options.status || '';
        this._formatLabel = options.formatLabel || '';
    }

    MaskedInputView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_masked_input',
        body: null,
        shell: null,
        _wrapper: null,
        _input: null,
        _clearBtn: null,
        _prefixEl: null,
        _suffixEl: null,
        _formatLabelEl: null,

        /**
         * 初始化组件
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.applyMask();
            this.inited();
        },

        /**
         * 构建DOM结构
         */
        buildDOM: function () {
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-masked-input-wrapper';
            if (this._status) {
                wrapper.classList.add('yc-masked-input-wrapper--' + this._status);
            }
            if (this._prefix) {
                wrapper.classList.add('yc-masked-input--prefix');
            }
            if (this._suffix || this._clearable) {
                wrapper.classList.add('yc-masked-input--suffix');
            }

            // 前缀
            if (this._prefix) {
                var prefixEl = document.createElement('span');
                prefixEl.className = 'yc-masked-input__prefix';
                prefixEl.innerHTML = this._prefix;
                wrapper.appendChild(prefixEl);
                this._prefixEl = prefixEl;
            }

            // 输入框
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'yc-masked-input';
            if (this._size) {
                input.classList.add('yc-masked-input--' + this._size);
            }
            if (this._clearable) {
                input.classList.add('yc-masked-input--clearable');
            }
            input.value = this._value;
            input.disabled = this._disabled;
            input.placeholder = this._placeholder;
            wrapper.appendChild(input);
            this._input = input;

            // 后缀
            if (this._suffix) {
                var suffixEl = document.createElement('span');
                suffixEl.className = 'yc-masked-input__suffix';
                suffixEl.innerHTML = this._suffix;
                wrapper.appendChild(suffixEl);
                this._suffixEl = suffixEl;
            }

            // 清空按钮
            if (this._clearable) {
                var clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.className = 'yc-masked-input__clear';
                clearBtn.innerHTML = '&times;';
                wrapper.appendChild(clearBtn);
                this._clearBtn = clearBtn;
            }

            // 格式标签
            if (this._formatLabel) {
                var formatLabel = document.createElement('span');
                formatLabel.className = 'yc-masked-input__format-label';
                formatLabel.innerText = this._formatLabel;
                wrapper.appendChild(formatLabel);
                this._formatLabelEl = formatLabel;
            }

            this.body.appendChild(wrapper);
            this._wrapper = wrapper;
        },

        /**
         * 绑定事件
         */
        bindEvents: function () {
            var _this = this;

            // 键盘输入
            this.bindListen($e.events.regEvent(this._input, 'keydown', this, function (e) {
                if (_this._disabled) return;
                // 处理特殊键
                if (e.key === 'Backspace') {
                    _this.handleBackspace();
                    e.preventDefault();
                } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    _this.handleInput(e.key);
                    e.preventDefault();
                }
            }));

            // 粘贴
            this.bindListen($e.events.regEvent(this._input, 'paste', this, function (e) {
                e.preventDefault();
                var text = e.clipboardData.getData('text');
                _this.handlePaste(text);
            }));

            // 焦点事件
            this.bindListen($e.events.regEvent(this._input, 'focus', this, function () {
                _this.toggleClearBtn();
                if (_this.props.onFocus) {
                    _this.props.onFocus(_this._value);
                }
            }));

            // 失焦事件
            this.bindListen($e.events.regEvent(this._input, 'blur', this, function () {
                setTimeout(function () {
                    _this.toggleClearBtn();
                }, 200);
                if (_this.props.onBlur) {
                    _this.props.onBlur(_this._value);
                }
            }));

            // 清空按钮
            if (this._clearBtn) {
                this.bindListen($e.events.regEvent(this._clearBtn, 'click', this, function () {
                    _this.setValue('');
                    _this._input.focus();
                    if (_this.props.onClear) {
                        _this.props.onClear();
                    }
                }));
            }
        },

        /**
         * 应用掩码格式
         */
        applyMask: function () {
            if (!this._mask) return;
            var masked = this.formatValue(this._value);
            this._input.value = masked;
            this.updateCompleteState();
        },

        /**
         * 格式化值
         */
        formatValue: function (value) {
            if (!this._mask) return value;
            var result = '';
            var valueIndex = 0;
            for (var i = 0; i < this._mask.length; i++) {
                var maskChar = this._mask[i];
                if (maskChar === '9' || maskChar === 'A' || maskChar === '*') {
                    if (valueIndex < value.length) {
                        result += value[valueIndex];
                        valueIndex++;
                    } else {
                        result += this._maskChar;
                    }
                } else {
                    result += maskChar;
                }
            }
            return result;
        },

        /**
         * 从掩码中提取原始值
         */
        extractValue: function (maskedValue) {
            if (!this._mask) return maskedValue;
            var result = '';
            for (var i = 0; i < maskedValue.length && i < this._mask.length; i++) {
                var maskChar = this._mask[i];
                if ((maskChar === '9' || maskChar === 'A' || maskChar === '*') && maskedValue[i] !== this._maskChar) {
                    result += maskedValue[i];
                }
            }
            return result;
        },

        /**
         * 处理输入
         */
        handleInput: function (char) {
            var currentValue = this.extractValue(this._input.value);
            var newValue = currentValue + char;
            this._value = newValue;
            this.applyMask();
            this.setCursorPosition();
            if (this.props.onInput) {
                this.props.onInput(this._value);
            }
        },

        /**
         * 处理退格
         */
        handleBackspace: function () {
            var currentValue = this.extractValue(this._input.value);
            if (currentValue.length > 0) {
                this._value = currentValue.slice(0, -1);
                this.applyMask();
                this.setCursorPosition();
                if (this.props.onInput) {
                    this.props.onInput(this._value);
                }
            }
        },

        /**
         * 处理粘贴
         */
        handlePaste: function (text) {
            var currentValue = this.extractValue(this._input.value);
            var newValue = currentValue + text;
            this._value = newValue;
            this.applyMask();
            if (this.props.onInput) {
                this.props.onInput(this._value);
            }
        },

        /**
         * 设置光标位置
         */
        setCursorPosition: function () {
            var pos = this._input.value.indexOf(this._maskChar);
            if (pos < 0) pos = this._input.value.length;
            this._input.setSelectionRange(pos, pos);
        },

        /**
         * 更新完成状态
         */
        updateCompleteState: function () {
            var isComplete = this._input.value.indexOf(this._maskChar) < 0;
            if (isComplete) {
                this._input.classList.add('yc-masked-input--complete');
                this._input.classList.remove('yc-masked-input--incomplete');
            } else {
                this._input.classList.remove('yc-masked-input--complete');
                this._input.classList.add('yc-masked-input--incomplete');
            }
        },

        /**
         * 切换清空按钮显示
         */
        toggleClearBtn: function () {
            if (this._clearBtn) {
                if (this._value && this._value.length > 0) {
                    this._clearBtn.style.display = 'block';
                } else {
                    this._clearBtn.style.display = 'none';
                }
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
            this._value = value || '';
            this.applyMask();
            this.toggleClearBtn();
        },

        /**
         * 设置禁用状态
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._input.disabled = disabled;
        },

        /**
         * 释放组件
         */
        selfRelease: function () {
            this._wrapper = null;
            this._input = null;
            this._clearBtn = null;
            this._prefixEl = null;
            this._suffixEl = null;
            this._formatLabelEl = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new MaskedInputView(options);
        }
    };
    $e.ui.addViewPlugin("view_masked_input", plugin);
}($e);
