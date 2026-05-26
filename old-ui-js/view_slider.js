/**
 * @file 滑块组件
 * @description SliderView 支持单/双滑块、刻度标记、工具提示、尺寸设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * SliderView 滑块视图组件
     * @class
     * @param {Object} options 配置项
     * @param {number} [options.min=0] 最小值
     * @param {number} [options.max=100] 最大值
     * @param {number} [options.step=1] 步长
     * @param {number|Array} [options.value] 当前值
     * @param {boolean} [options.range=false] 是否范围选择
     * @param {string} [options.size=''] 尺寸
     * @param {boolean} [options.disabled=false] 是否禁用
     * @param {boolean} [options.showTooltip=true] 是否显示工具提示
     * @param {boolean} [options.showStops=false] 是否显示停止标记
     * @param {Object} [options.marks={}] 刻度标记
     * @param {boolean} [options.vertical=false] 是否垂直
     * @param {boolean} [options.showInput=false] 是否显示输入框
     * @param {Function} [options.onChange] 变化回调
     */
    function SliderView(options) {
        this.props = options;
        this._min = parseFloat(options.min) || 0;
        this._max = parseFloat(options.max) || 100;
        this._step = parseFloat(options.step) || 1;
        this._value = options.value !== undefined ? options.value : this._min;
        this._range = $e.fn.getBoolean(options.range, false);
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._showTooltip = $e.fn.getBoolean(options.showTooltip, true);
        this._showStops = $e.fn.getBoolean(options.showStops, false);
        this._marks = options.marks || {};
        this._vertical = $e.fn.getBoolean(options.vertical, false);
        this._showInput = $e.fn.getBoolean(options.showInput, false);
        this._isDragging = false;
        this._dragIndex = 0;
    }

    SliderView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_slider',
        body: null,
        shell: null,
        _wrapper: null,
        _track: null,
        _trackFill: null,
        _buttons: [],
        _tooltips: [],

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.updateUI();
            this.inited();
        },

        buildDOM: function () {
            var self = this;
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-slider';
            if (self._size) {
                wrapper.classList.add('yc-slider--' + self._size);
            }
            if (self._disabled) {
                wrapper.classList.add('is-disabled');
            }
            if (self._vertical) {
                wrapper.classList.add('yc-slider--vertical');
            }
            if (self._range) {
                wrapper.classList.add('yc-slider--range');
            }
            if (self._showInput) {
                wrapper.classList.add('yc-slider--show-inputs');
            }

            var track = document.createElement('div');
            track.className = 'yc-slider__track';

            var trackFill = document.createElement('div');
            trackFill.className = 'yc-slider__track-fill';
            track.appendChild(trackFill);
            self._trackFill = trackFill;

            wrapper.appendChild(track);
            self._track = track;

            var values = self._range ? (Array.isArray(self._value) ? self._value : [self._min, self._value]) : [self._value];
            values.forEach(function (val, index) {
                var btnWrapper = document.createElement('div');
                btnWrapper.className = 'yc-slider__button-wrapper';

                var btn = document.createElement('div');
                btn.className = 'yc-slider__button';
                btnWrapper.appendChild(btn);

                if (self._showTooltip) {
                    var tooltip = document.createElement('div');
                    tooltip.className = 'yc-slider__tooltip';
                    tooltip.textContent = val;
                    btnWrapper.appendChild(tooltip);
                    self._tooltips.push(tooltip);
                }

                track.appendChild(btnWrapper);
                self._buttons.push({
                    wrapper: btnWrapper,
                    button: btn,
                    index: index
                });
            });

            if (self._showStops || Object.keys(self._marks).length > 0) {
                self.buildMarks(wrapper);
            }

            if (self._showInput) {
                self.buildInputs(wrapper);
            }

            self.body.appendChild(wrapper);
            self._wrapper = wrapper;
        },

        buildMarks: function (wrapper) {
            var self = this;
            var marksContainer = document.createElement('div');
            marksContainer.className = 'yc-slider__marks';

            var marks = self._marks;
            if (self._showStops) {
                var count = (self._max - self._min) / self._step;
                for (var i = 0; i <= count; i++) {
                    var val = self._min + i * self._step;
                    if (!marks[val]) {
                        marks[val] = '';
                    }
                }
            }

            Object.keys(marks).forEach(function (key) {
                var val = parseFloat(key);
                var mark = document.createElement('div');
                mark.className = 'yc-slider__mark';

                var label = document.createElement('span');
                label.className = 'yc-slider__mark-label';
                label.textContent = marks[key] || val;
                mark.appendChild(label);

                mark.addEventListener('click', function () {
                    if (!self._disabled) {
                        self.setValue(val);
                    }
                });

                marksContainer.appendChild(mark);
            });

            wrapper.appendChild(marksContainer);
        },

        buildInputs: function (wrapper) {
            var self = this;
            var inputsContainer = document.createElement('div');
            inputsContainer.className = 'yc-slider__range-inputs';

            var values = self._range ? (Array.isArray(self._value) ? self._value : [self._min, self._value]) : [self._value];
            values.forEach(function (val, index) {
                var input = document.createElement('input');
                input.type = 'number';
                input.className = 'yc-slider__range-input';
                input.value = val;
                input.min = self._min;
                input.max = self._max;
                input.step = self._step;

                input.addEventListener('change', function (e) {
                    var newVal = parseFloat(e.target.value);
                    if (self._range) {
                        var newValues = Array.isArray(self._value) ? self._value.slice() : [self._min, self._value];
                        newValues[index] = newVal;
                        self.setValue(newValues);
                    } else {
                        self.setValue(newVal);
                    }
                });

                inputsContainer.appendChild(input);
            });

            wrapper.appendChild(inputsContainer);
        },

        bindEvents: function () {
            var self = this;

            self._buttons.forEach(function (item) {
                var btn = item.wrapper;

                self.bindListen($e.events.regEvent(btn, 'mousedown', self, function (e) {
                    if (self._disabled) return;
                    self._isDragging = true;
                    self._dragIndex = item.index;
                    btn.classList.add('is-active');
                    e.preventDefault();
                }));
            });

            self.bindListen($e.events.regEvent(document, 'mousemove', self, function (e) {
                if (!self._isDragging) return;
                var newVal = self.calculateValueFromPosition(e);
                if (self._range) {
                    var values = Array.isArray(self._value) ? self._value.slice() : [self._min, self._value];
                    values[self._dragIndex] = newVal;
                    self.setValue(values, true);
                } else {
                    self.setValue(newVal, true);
                }
            }));

            self.bindListen($e.events.regEvent(document, 'mouseup', self, function () {
                if (self._isDragging) {
                    self._isDragging = false;
                    self._buttons.forEach(function (item) {
                        item.wrapper.classList.remove('is-active');
                    });
                    if (self.props.onChange) {
                        self.props.onChange(self._value);
                    }
                }
            }));

            self.bindListen($e.events.regEvent(self._track, 'click', self, function (e) {
                if (self._disabled || self._isDragging) return;
                if (e.target.classList.contains('yc-slider__button') || e.target.classList.contains('yc-slider__button-wrapper')) return;
                var newVal = self.calculateValueFromPosition(e);
                self.setValue(newVal);
            }));
        },

        calculateValueFromPosition: function (e) {
            var rect = this._track.getBoundingClientRect();
            var ratio;
            if (this._vertical) {
                ratio = 1 - (e.clientY - rect.top) / rect.height;
            } else {
                ratio = (e.clientX - rect.left) / rect.width;
            }
            ratio = Math.max(0, Math.min(1, ratio));
            var rawValue = this._min + ratio * (this._max - this._min);
            var steps = Math.round((rawValue - this._min) / this._step);
            var value = this._min + steps * this._step;
            return Math.max(this._min, Math.min(this._max, value));
        },

        updateUI: function () {
            var self = this;
            var values = self._range ? (Array.isArray(self._value) ? self._value : [self._min, self._value]) : [self._value];

            values.forEach(function (val, index) {
                var ratio = (val - self._min) / (self._max - self._min);
                var btn = self._buttons[index];
                if (btn) {
                    if (self._vertical) {
                        btn.wrapper.style.bottom = (ratio * 100) + '%';
                        btn.wrapper.style.left = '50%';
                    } else {
                        btn.wrapper.style.left = (ratio * 100) + '%';
                        btn.wrapper.style.top = '50%';
                    }
                }
                if (self._tooltips[index]) {
                    self._tooltips[index].textContent = val;
                }
            });

            if (self._range && values.length >= 2) {
                var startRatio = (values[0] - self._min) / (self._max - self._min);
                var endRatio = (values[1] - self._min) / (self._max - self._min);
                if (self._vertical) {
                    self._trackFill.style.bottom = (startRatio * 100) + '%';
                    self._trackFill.style.height = ((endRatio - startRatio) * 100) + '%';
                } else {
                    self._trackFill.style.left = (startRatio * 100) + '%';
                    self._trackFill.style.width = ((endRatio - startRatio) * 100) + '%';
                }
            } else {
                var ratio = (values[0] - self._min) / (self._max - self._min);
                if (self._vertical) {
                    self._trackFill.style.bottom = '0';
                    self._trackFill.style.height = (ratio * 100) + '%';
                } else {
                    self._trackFill.style.left = '0';
                    self._trackFill.style.width = (ratio * 100) + '%';
                }
            }
        },

        getValue: function () {
            return this._value;
        },

        setValue: function (value, silent) {
            this._value = value;
            this.updateUI();
            if (!silent && this.props.onChange) {
                this.props.onChange(this._value);
            }
        },

        setDisabled: function (disabled) {
            this._disabled = disabled;
            if (disabled) {
                this._wrapper.classList.add('is-disabled');
            } else {
                this._wrapper.classList.remove('is-disabled');
            }
        },

        selfRelease: function () {
            this._wrapper = null;
            this._track = null;
            this._trackFill = null;
            this._buttons = [];
            this._tooltips = [];
            this.shell = null;
            this.body = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new SliderView(options);
        }
    };
    $e.ui.addViewPlugin("view_slider", plugin);
}($e);