+function ($e) {
    /**
     * RatingView 评分视图组件
     * 支持星级评分、半星支持、尺寸设置等功能
     */
    function RatingView(options) {
        this.props = options;
        this._value = parseFloat(options.value) || 0;
        this._max = parseInt(options.max) || 5;
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._allowHalf = $e.fn.getBoolean(options.allowHalf, false);
        this._showText = $e.fn.getBoolean(options.showText, false);
        this._texts = options.texts || ['极差', '失望', '一般', '满意', '惊喜'];
        this._colors = options.colors || ['#F7BA2A', '#F7BA2A', '#F7BA2A'];
        this._voidColor = options.voidColor || '#C6D1DE';
        this._stars = [];
    }

    RatingView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_rating',
        body: null,
        shell: null,
        _wrapper: null,
        _textEl: null,
        _hoverValue: 0,

        /**
         * 初始化组件
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.bindEvents();
            this.updateStars();
            this.inited();
        },

        /**
         * 构建DOM结构
         */
        buildDOM: function () {
            var wrapper = document.createElement('div');
            wrapper.className = 'yc-rating';
            if (this._size) {
                wrapper.classList.add('yc-rating--' + this._size);
            }
            if (this._showText) {
                wrapper.classList.add('yc-rating--with-text');
            }

            // 创建星星
            for (var i = 1; i <= this._max; i++) {
                this.createStar(wrapper, i);
            }

            // 文本显示
            if (this._showText) {
                var textEl = document.createElement('span');
                textEl.className = 'yc-rating__text';
                textEl.innerText = this.getText(this._value);
                wrapper.appendChild(textEl);
                this._textEl = textEl;
            }

            this.body.appendChild(wrapper);
            this._wrapper = wrapper;
        },

        /**
         * 创建星星元素
         */
        createStar: function (wrapper, index) {
            var _this = this;
            var star = document.createElement('button');
            star.type = 'button';
            star.className = 'yc-rating__star';
            if (this._disabled) {
                star.classList.add('is-disabled');
            }
            star.innerHTML = '&#9733;';
            star.dataset.index = index;

            // 半星支持
            if (this._allowHalf) {
                star.addEventListener('mousemove', function (e) {
                    if (_this._disabled) return;
                    var rect = star.getBoundingClientRect();
                    var isHalf = e.clientX - rect.left < rect.width / 2;
                    _this._hoverValue = isHalf ? index - 0.5 : index;
                    _this.updateHoverStars();
                });
            } else {
                star.addEventListener('mouseenter', function () {
                    if (_this._disabled) return;
                    _this._hoverValue = index;
                    _this.updateHoverStars();
                });
            }

            star.addEventListener('mouseleave', function () {
                if (_this._disabled) return;
                _this._hoverValue = 0;
                _this.updateStars();
            });

            star.addEventListener('click', function () {
                if (_this._disabled) return;
                _this.setValue(_this._hoverValue || index);
            });

            wrapper.appendChild(star);
            this._stars.push(star);
        },

        /**
         * 绑定事件
         */
        bindEvents: function () {
            var _this = this;

            // 鼠标离开容器时重置
            this.bindListen($e.events.regEvent(this._wrapper, 'mouseleave', this, function () {
                if (!_this._disabled) {
                    _this._hoverValue = 0;
                    _this.updateStars();
                }
            }));
        },

        /**
         * 更新星星显示
         */
        updateStars: function () {
            var _this = this;
            var value = this._hoverValue || this._value;
            this._stars.forEach(function (star, index) {
                var starValue = index + 1;
                star.classList.remove('is-active', 'is-half');

                if (starValue <= value) {
                    star.classList.add('is-active');
                    star.style.color = _this._colors[0];
                } else if (_this._allowHalf && starValue - 0.5 <= value) {
                    star.classList.add('is-active', 'is-half');
                } else {
                    star.style.color = _this._voidColor;
                }
            });

            if (this._textEl) {
                this._textEl.innerText = this.getText(value);
            }
        },

        /**
         * 更新悬停状态
         */
        updateHoverStars: function () {
            this.updateStars();
        },

        /**
         * 获取对应文本
         */
        getText: function (value) {
            if (value <= 0) return '';
            var index = Math.ceil(value) - 1;
            return this._texts[index] || '';
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
            this._value = value;
            this.updateStars();
            if (this.props.onChange) {
                this.props.onChange(this._value);
            }
        },

        /**
         * 设置禁用状态
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._stars.forEach(function (star) {
                if (disabled) {
                    star.classList.add('is-disabled');
                } else {
                    star.classList.remove('is-disabled');
                }
            });
        },

        /**
         * 释放组件
         */
        selfRelease: function () {
            this._wrapper = null;
            this._stars = [];
            this._textEl = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new RatingView(options);
        }
    };
    $e.ui.addViewPlugin("view_rating", plugin);
}($e);
