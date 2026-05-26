/**
 * @file ColorPicker颜色选择器组件
 * @description 提供颜色选择功能，支持颜色面板、预设颜色和透明度调整
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * ColorPickerView 颜色选择器组件
     * 支持颜色面板、预设颜色、尺寸设置等功能
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.value] 颜色值
     * @param {string} [options.size] 尺寸
     * @param {boolean} [options.disabled=false] 是否禁用
     * @param {boolean} [options.showAlpha=false] 是否显示透明度
     * @param {Array} [options.predefine=[]] 预设颜色数组
     */
    function ColorPickerView(options) {
        this.props = options;
        this._value = options.value || '';
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._showAlpha = $e.fn.getBoolean(options.showAlpha, false);
        this._predefine = options.predefine || [];
        this._isOpen = false;
        this._hsv = { h: 0, s: 100, v: 100 };
        this._alpha = 1;
        this._format = 'hex';
    }

    ColorPickerView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_color_picker',
        body: null,
        shell: null,
        _wrapper: null,
        _trigger: null,
        _colorPreview: null,
        _panel: null,
        _saturation: null,
        _hue: null,
        _alphaSlider: null,
        _valueInput: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            if (this._value) {
                this.parseColor(this._value);
            }
            this.updateUI();
            this.inited();
        },

        /**
         * 构建DOM结构
         * @private
         */
        buildDOM: function () {
            var _this = this;
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-color-picker';
            if (this._size) {
                wrapper.classList.add('yc-color-picker--' + this._size);
            }
            if (this._disabled) {
                wrapper.classList.add('is-disabled');
            }

            var trigger = document.createElement('div');
            trigger.className = 'yc-color-picker__trigger';

            var colorPreview = document.createElement('div');
            colorPreview.className = 'yc-color-picker__color';
            trigger.appendChild(colorPreview);
            this._colorPreview = colorPreview;

            var arrow = document.createElement('span');
            arrow.className = 'yc-color-picker__dropdown-icon';
            arrow.innerHTML = '&#9662;';
            trigger.appendChild(arrow);

            wrapper.appendChild(trigger);
            this._trigger = trigger;

            var panel = document.createElement('div');
            panel.className = 'yc-color-picker__panel';

            var panelContent = document.createElement('div');
            panelContent.className = 'yc-color-picker__panel-content';

            var body = document.createElement('div');
            body.className = 'yc-color-picker__body';

            var saturation = document.createElement('div');
            saturation.className = 'yc-color-saturation';
            var satWhite = document.createElement('div');
            satWhite.className = 'yc-color-saturation__white';
            saturation.appendChild(satWhite);
            var satBlack = document.createElement('div');
            satBlack.className = 'yc-color-saturation__black';
            saturation.appendChild(satBlack);
            var satCursor = document.createElement('div');
            satCursor.className = 'yc-color-saturation__cursor';
            saturation.appendChild(satCursor);
            body.appendChild(saturation);
            this._saturation = saturation;

            var hue = document.createElement('div');
            hue.className = 'yc-color-hue';
            var hueCursor = document.createElement('div');
            hueCursor.className = 'yc-color-hue__cursor';
            hue.appendChild(hueCursor);
            body.appendChild(hue);
            this._hue = hue;

            if (this._showAlpha) {
                var alpha = document.createElement('div');
                alpha.className = 'yc-color-alpha';
                var alphaGradient = document.createElement('div');
                alphaGradient.className = 'yc-color-alpha__gradient';
                alpha.appendChild(alphaGradient);
                var alphaCursor = document.createElement('div');
                alphaCursor.className = 'yc-color-alpha__cursor';
                alpha.appendChild(alphaCursor);
                body.appendChild(alpha);
                this._alphaSlider = alpha;
            }

            var valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'yc-color-value__input';
            body.appendChild(valueInput);
            this._valueInput = valueInput;

            if (this._predefine.length > 0) {
                var presets = document.createElement('div');
                presets.className = 'yc-color-presets';
                this._predefine.forEach(function (color) {
                    var preset = document.createElement('div');
                    preset.className = 'yc-color-preset';
                    preset.style.backgroundColor = color;
                    preset.addEventListener('click', function () {
                        _this.setValue(color);
                    });
                    presets.appendChild(preset);
                });
                body.appendChild(presets);
            }

            panelContent.appendChild(body);
            panel.appendChild(panelContent);
            wrapper.appendChild(panel);
            this._panel = panel;

            this.body.appendChild(wrapper);
            this._wrapper = wrapper;
        },

        /**
         * 绑定事件
         * @private
         */
        bindEvents: function () {
            var _this = this;

            this.bindListen($e.events.regEvent(this._trigger, 'click', this, function () {
                if (!_this._disabled) {
                    _this.togglePanel();
                }
            }));

            this.bindSaturationEvents();
            this.bindHueEvents();

            if (this._alphaSlider) {
                this.bindAlphaEvents();
            }

            this.bindListen($e.events.regEvent(this._valueInput, 'change', this, function (e) {
                _this.setValue(e.target.value);
            }));

            this._docClickHandler = function (e) {
                if (!_this._wrapper.contains(e.target)) {
                    _this.closePanel();
                }
            };
            document.addEventListener('click', this._docClickHandler);
        },

        /**
         * 绑定饱和度事件
         * @private
         */
        bindSaturationEvents: function () {
            var _this = this;
            var isDragging = false;

            var updateSaturation = function (e) {
                var rect = _this._saturation.getBoundingClientRect();
                var x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                var y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                _this._hsv.s = x * 100;
                _this._hsv.v = (1 - y) * 100;
                _this.updateUI();
                _this.updateValue();
            };

            this.bindListen($e.events.regEvent(this._saturation, 'mousedown', this, function (e) {
                isDragging = true;
                updateSaturation(e);
                e.preventDefault();
            }));

            this.bindListen($e.events.regEvent(document, 'mousemove', this, function (e) {
                if (isDragging) {
                    updateSaturation(e);
                }
            }));

            this.bindListen($e.events.regEvent(document, 'mouseup', this, function () {
                isDragging = false;
            }));
        },

        /**
         * 绑定色相事件
         * @private
         */
        bindHueEvents: function () {
            var _this = this;
            var isDragging = false;

            var updateHue = function (e) {
                var rect = _this._hue.getBoundingClientRect();
                var x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                _this._hsv.h = x * 360;
                _this.updateUI();
                _this.updateValue();
            };

            this.bindListen($e.events.regEvent(this._hue, 'mousedown', this, function (e) {
                isDragging = true;
                updateHue(e);
                e.preventDefault();
            }));

            this.bindListen($e.events.regEvent(document, 'mousemove', this, function (e) {
                if (isDragging) {
                    updateHue(e);
                }
            }));

            this.bindListen($e.events.regEvent(document, 'mouseup', this, function () {
                isDragging = false;
            }));
        },

        /**
         * 绑定透明度事件
         * @private
         */
        bindAlphaEvents: function () {
            var _this = this;
            var isDragging = false;

            var updateAlpha = function (e) {
                var rect = _this._alphaSlider.getBoundingClientRect();
                var x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                _this._alpha = x;
                _this.updateUI();
                _this.updateValue();
            };

            this.bindListen($e.events.regEvent(this._alphaSlider, 'mousedown', this, function (e) {
                isDragging = true;
                updateAlpha(e);
                e.preventDefault();
            }));

            this.bindListen($e.events.regEvent(document, 'mousemove', this, function (e) {
                if (isDragging) {
                    updateAlpha(e);
                }
            }));

            this.bindListen($e.events.regEvent(document, 'mouseup', this, function () {
                isDragging = false;
            }));
        },

        /**
         * 解析颜色
         * @private
         * @param {string} color 颜色字符串
         */
        parseColor: function (color) {
            if (color.startsWith('#')) {
                var r = parseInt(color.slice(1, 3), 16) || 0;
                var g = parseInt(color.slice(3, 5), 16) || 0;
                var b = parseInt(color.slice(5, 7), 16) || 0;
                this._hsv = this.rgbToHsv(r, g, b);
                this._alpha = color.length > 7 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
            }
        },

        /**
         * RGB转HSV
         * @private
         * @param {number} r 红色值
         * @param {number} g 绿色值
         * @param {number} b 蓝色值
         * @returns {Object} HSV对象
         */
        rgbToHsv: function (r, g, b) {
            r /= 255; g /= 255; b /= 255;
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h, s, v = max;
            var d = max - min;
            s = max === 0 ? 0 : d / max;
            if (max === min) {
                h = 0;
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s * 100, v: v * 100 };
        },

        /**
         * HSV转RGB
         * @private
         * @param {number} h 色相
         * @param {number} s 饱和度
         * @param {number} v 明度
         * @returns {Object} RGB对象
         */
        hsvToRgb: function (h, s, v) {
            h /= 360; s /= 100; v /= 100;
            var r, g, b;
            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        },

        /**
         * 获取颜色字符串
         * @private
         * @returns {string} 颜色字符串
         */
        getColorString: function () {
            var rgb = this.hsvToRgb(this._hsv.h, this._hsv.s, this._hsv.v);
            if (this._showAlpha) {
                var a = Math.round(this._alpha * 255).toString(16).padStart(2, '0');
                return '#' + rgb.r.toString(16).padStart(2, '0') + rgb.g.toString(16).padStart(2, '0') + rgb.b.toString(16).padStart(2, '0') + a;
            }
            return '#' + rgb.r.toString(16).padStart(2, '0') + rgb.g.toString(16).padStart(2, '0') + rgb.b.toString(16).padStart(2, '0');
        },

        /**
         * 更新UI
         * @private
         */
        updateUI: function () {
            var rgb = this.hsvToRgb(this._hsv.h, this._hsv.s, this._hsv.v);
            var color = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';

            if (this._colorPreview) {
                this._colorPreview.style.backgroundColor = color;
            }

            var satCursor = this._saturation.querySelector('.yc-color-saturation__cursor');
            if (satCursor) {
                satCursor.style.left = (this._hsv.s) + '%';
                satCursor.style.top = (100 - this._hsv.v) + '%';
            }

            var hueCursor = this._hue.querySelector('.yc-color-hue__cursor');
            if (hueCursor) {
                hueCursor.style.left = (this._hsv.h / 360 * 100) + '%';
            }

            if (this._alphaSlider) {
                var alphaCursor = this._alphaSlider.querySelector('.yc-color-alpha__cursor');
                if (alphaCursor) {
                    alphaCursor.style.left = (this._alpha * 100) + '%';
                }
                var alphaGradient = this._alphaSlider.querySelector('.yc-color-alpha__gradient');
                if (alphaGradient) {
                    alphaGradient.style.background = 'linear-gradient(to right, transparent, ' + color + ')';
                }
            }

            this._saturation.style.background = 'linear-gradient(to bottom, #fff 0%, transparent 100%), linear-gradient(to right, #fff 0%, hsl(' + this._hsv.h + ', 100%, 50%) 100%)';
        },

        /**
         * 更新值
         * @private
         */
        updateValue: function () {
            this._value = this.getColorString();
            if (this._valueInput) {
                this._valueInput.value = this._value;
            }
            if (this.props.onChange) {
                this.props.onChange(this._value);
            }
        },

        /**
         * 切换面板
         * @public
         */
        togglePanel: function () {
            if (this._isOpen) {
                this.closePanel();
            } else {
                this.openPanel();
            }
        },

        /**
         * 打开面板
         * @public
         */
        openPanel: function () {
            this._isOpen = true;
            this._panel.classList.add('is-open');
            this._wrapper.classList.add('is-open');
        },

        /**
         * 关闭面板
         * @public
         */
        closePanel: function () {
            this._isOpen = false;
            this._panel.classList.remove('is-open');
            this._wrapper.classList.remove('is-open');
        },

        /**
         * 获取值
         * @public
         * @returns {string} 颜色值
         */
        getValue: function () {
            return this._value;
        },

        /**
         * 设置值
         * @public
         * @param {string} value 颜色值
         */
        setValue: function (value) {
            this._value = value;
            this.parseColor(value);
            this.updateUI();
            if (this._valueInput) {
                this._valueInput.value = value;
            }
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        },

        /**
         * 设置禁用状态
         * @public
         * @param {boolean} disabled 是否禁用
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            if (disabled) {
                this._wrapper.classList.add('is-disabled');
            } else {
                this._wrapper.classList.remove('is-disabled');
            }
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            if (this._docClickHandler) {
                document.removeEventListener('click', this._docClickHandler);
            }
            this._wrapper = null;
            this._trigger = null;
            this._colorPreview = null;
            this._panel = null;
            this._saturation = null;
            this._hue = null;
            this._alphaSlider = null;
            this._valueInput = null;
        },

        /**
         * 窗口resize处理
         * @public
         * @param {Object} options 选项
         */
        resize: function (options) {
        }
    };

    var plugin = {
        /**
         * 创建ColorPicker组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {ColorPickerView} ColorPicker实例
         */
        create: function (options) {
            return new ColorPickerView(options);
        }
    };
    $e.ui.addViewPlugin('view_color_picker', plugin);
}($e);
