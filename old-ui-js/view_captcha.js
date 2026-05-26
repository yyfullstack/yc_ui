/**
 * @file Captcha验证码组件
 * @description 提供验证码生成和验证功能，支持图片验证码和滑块验证
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * CaptchaView 验证码组件
     * 用于生成和验证验证码，支持图片模式和验证模式
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.size='default'] 尺寸: default/small/large
     * @param {string} [options.type='image'] 类型: image/verify
     * @param {number} [options.length=4] 验证码长度
     * @param {boolean} [options.refreshable=true] 是否可刷新
     * @param {string} [options.placeholder] 输入框占位符
     * @param {Function} [options.onRefresh] 刷新回调
     * @param {Function} [options.onVerify] 验证回调
     */
    function CaptchaView(options) {
        this.props = options;
        /** @type {Array} 事件监听器数组 */
        this._listeners = [];
        /** @type {string} 当前验证码 */
        this._code = '';
    }

    CaptchaView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_captcha',
        body: null,
        shell: null,
        _listeners: null,
        _code: null,
        _imageContainer: null,
        _input: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildCaptcha();
            this.inited();
        },

        /**
         * 构建验证码组件结构
         * @public
         */
        buildCaptcha: function () {
            var options = this.props;
            var size = options.size || 'default';
            var type = options.type || 'image';
            var length = options.length || 4;
            var refreshable = options.refreshable !== false;

            $e.fn.addClass(this.shell, 'yc-captcha');

            if (size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-captcha--' + size);
            }

            if (type !== 'default') {
                $e.fn.addClass(this.shell, 'yc-captcha--' + type);
            }

            var wrapper = $e.fn.create('div');
            $e.fn.addClass(wrapper, 'yc-captcha__wrapper');

            var imageContainer = $e.fn.create('div');
            $e.fn.addClass(imageContainer, 'yc-captcha__image-container');
            this._imageContainer = imageContainer;
            wrapper.appendChild(imageContainer);

            if (refreshable) {
                var refreshBtn = $e.fn.create('span');
                $e.fn.addClass(refreshBtn, 'yc-captcha__refresh');
                refreshBtn.innerHTML = '&#8635;';

                var self = this;
                this.bindListen($e.events.regEvent(refreshBtn, 'click', this, function () {
                    self.refresh();
                }));

                wrapper.appendChild(refreshBtn);
            }

            this.getBody().appendChild(wrapper);

            if (type === 'verify') {
                var inputWrapper = $e.fn.create('div');
                $e.fn.addClass(inputWrapper, 'yc-captcha__input-wrapper');

                var input = $e.fn.create('input');
                $e.fn.addClass(input, 'yc-captcha__input');
                input.type = 'text';
                input.placeholder = options.placeholder || '请输入验证码';
                this._input = input;
                inputWrapper.appendChild(input);

                var verifyBtn = $e.fn.create('button');
                $e.fn.addClass(verifyBtn, 'yc-captcha__verify-btn');
                verifyBtn.innerHTML = '验证';

                this.bindListen($e.events.regEvent(verifyBtn, 'click', this, function () {
                    self.verify();
                }));

                inputWrapper.appendChild(verifyBtn);
                this.getBody().appendChild(inputWrapper);
            }

            this.generate();
        },

        /**
         * 生成验证码
         * @public
         */
        generate: function () {
            var length = this.props.length || 4;
            var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
            this._code = '';

            for (var i = 0; i < length; i++) {
                this._code += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            this.renderImage();
        },

        /**
         * 渲染验证码图片
         * @public
         */
        renderImage: function () {
            var canvas = $e.fn.create('canvas');
            canvas.width = 120;
            canvas.height = 40;

            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';

            var chars = this._code.split('');
            var startX = 15;

            for (var i = 0; i < chars.length; i++) {
                var x = startX + i * 25;
                var y = 20 + Math.random() * 10;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((Math.random() - 0.5) * 0.3);
                ctx.fillStyle = this.getRandomColor();
                ctx.fillText(chars[i], 0, 0);
                ctx.restore();
            }

            for (var i = 0; i < 5; i++) {
                ctx.strokeStyle = this.getRandomColor();
                ctx.beginPath();
                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.stroke();
            }

            for (var i = 0; i < 30; i++) {
                ctx.fillStyle = this.getRandomColor();
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
            }

            this._imageContainer.innerHTML = '';
            this._imageContainer.appendChild(canvas);
        },

        /**
         * 获取随机颜色
         * @private
         * @returns {string} 颜色值
         */
        getRandomColor: function () {
            var colors = ['#1a1a1a', '#333333', '#666666', '#999999', '#cc3333', '#3366cc', '#009933', '#cc6600'];
            return colors[Math.floor(Math.random() * colors.length)];
        },

        /**
         * 刷新验证码
         * @public
         */
        refresh: function () {
            this.generate();
            if (this.props.onRefresh) {
                this.props.onRefresh(this._code);
            }
        },

        /**
         * 验证验证码
         * @public
         */
        verify: function () {
            var input = this._input.value.trim().toLowerCase();
            var code = this._code.toLowerCase();
            var success = input === code;

            if (this.props.onVerify) {
                this.props.onVerify(success, this._code);
            }

            if (success) {
                this._input.value = '';
                this.generate();
            }
        },

        /**
         * 获取验证码
         * @public
         * @returns {string} 当前验证码
         */
        getCode: function () {
            return this._code;
        },

        /**
         * 设置验证码
         * @public
         * @param {string} code 验证码
         */
        setCode: function (code) {
            this._code = code;
            this.renderImage();
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }

            this._listeners = null;
            this._code = null;
            this._imageContainer = null;
            this._input = null;
            this.body = null;
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
         * 创建Captcha组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {CaptchaView} Captcha实例
         */
        create: function (options) {
            return new CaptchaView(options);
        }
    };

    $e.ui.addViewPlugin('view_captcha', plugin);
}($e);
