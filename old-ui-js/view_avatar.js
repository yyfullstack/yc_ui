/**
 * @file 头像组件
 * @description 用于展示用户头像，支持图片、文字、图标三种模式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 头像组件构造函数
     * @class AvatarView
     * @param {Object} options - 配置选项
     * @param {string} [options.src=''] - 图片地址
     * @param {string} [options.text=''] - 显示文本
     * @param {string} [options.icon=''] - 图标类名
     * @param {string} [options.size='md'] - 尺寸: lg/md/sm
     * @param {string} [options.shape='circle'] - 形状: circle/square
     * @param {string} [options.alt=''] - 图片替代文本
     */
    function AvatarView(options) {
        this.props = options || {};
        this._src = this.props['src'] || '';
        this._text = this.props['text'] || '';
        this._icon = this.props['icon'] || '';
        this._size = this.props['size'] || 'md';
        this._shape = this.props['shape'] || 'circle';
        this._alt = this.props['alt'] || '';
        this._handle = null;
    }

    AvatarView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_avatar',
        shell: null,
        body: null,
        _src: '',
        _text: '',
        _icon: '',
        _size: 'md',
        _shape: 'circle',
        _alt: '',
        _handle: null,

        /**
         * 初始化组件
         * 设置body区域并渲染头像内容
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-avatar');
            this.render();
            this.inited();
        },

        /**
         * 渲染Avatar组件DOM结构
         * 根据模式(图片/文字/图标)构建对应的内容
         */
        render: function () {
            var shell = this.shell;

            var sizeMap = {
                'lg': 'yc-avatar-lg',
                'md': 'yc-avatar-md',
                'sm': 'yc-avatar-sm'
            };

            $e.fn.addClass(shell, sizeMap[this._size] || sizeMap['md']);

            if (this._shape === 'square') {
                shell.style.borderRadius = 'var(--yc-border-radius-base)';
            } else {
                $e.fn.addClass(shell, 'yc-avatar-circle');
            }

            shell.innerHTML = '';

            if (this._src) {
                var img = document.createElement('img');
                img.src = this._src;
                img.alt = this._alt;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.display = 'block';
                shell.appendChild(img);

                var _this = this;
                this._handle = this.bindListen($e.events.regEvent(img, 'error', this, this.onImageError));
            } else if (this._icon) {
                var iconEl = document.createElement('i');
                $e.fn.addClass(iconEl, 'fa');
                $e.fn.addClass(iconEl, this._icon);
                shell.appendChild(iconEl);
            } else if (this._text) {
                var displayText = this._text;
                if (displayText.length > 2) {
                    displayText = displayText.substring(0, 2);
                }
                shell.innerText = displayText;
            } else {
                var defaultIcon = document.createElement('i');
                $e.fn.addClass(defaultIcon, 'fa');
                $e.fn.addClass(defaultIcon, 'fa-user');
                shell.appendChild(defaultIcon);
            }
        },

        /**
         * 图片加载失败回调
         * 切换到文字或图标模式显示
         */
        onImageError: function () {
            this._src = '';
            if (this._text) {
                this.render();
            } else {
                this._icon = 'fa-user';
                this.render();
            }
        },

        /**
         * 设置图片地址
         * @param {string} src 图片URL
         */
        setSrc: function (src) {
            this._src = src;
            this.render();
        },

        /**
         * 获取图片地址
         * @returns {string} 图片URL
         */
        getSrc: function () {
            return this._src;
        },

        /**
         * 设置显示文本
         * @param {string} text 文本内容
         */
        setText: function (text) {
            this._text = text;
            this._src = '';
            this._icon = '';
            this.render();
        },

        /**
         * 获取显示文本
         * @returns {string} 文本内容
         */
        getText: function () {
            return this._text;
        },

        /**
         * 设置图标类名
         * @param {string} icon FontAwesome图标类名
         */
        setIcon: function (icon) {
            this._icon = icon;
            this._src = '';
            this._text = '';
            this.render();
        },

        /**
         * 获取图标类名
         * @returns {string} 图标类名
         */
        getIcon: function () {
            return this._icon;
        },

        /**
         * 设置尺寸
         * @param {string} size 尺寸: lg/md/sm
         */
        setSize: function (size) {
            var sizeMap = {
                'lg': 'yc-avatar-lg',
                'md': 'yc-avatar-md',
                'sm': 'yc-avatar-sm'
            };
            for (var key in sizeMap) {
                $e.fn.removeClass(this.shell, sizeMap[key]);
            }
            this._size = size;
            $e.fn.addClass(this.shell, sizeMap[size] || sizeMap['md']);
        },

        /**
         * 获取尺寸
         * @returns {string} 当前尺寸
         */
        getSize: function () {
            return this._size;
        },

        /**
         * 设置形状
         * @param {string} shape 形状: circle/square
         */
        setShape: function (shape) {
            this._shape = shape;
            if (shape === 'square') {
                this.shell.style.borderRadius = 'var(--yc-border-radius-base)';
            } else {
                this.shell.style.borderRadius = 'var(--yc-border-radius-circle)';
            }
        },

        /**
         * 获取形状
         * @returns {string} 当前形状
         */
        getShape: function () {
            return this._shape;
        },

        /**
         * 释放组件资源
         */
        selfRelease: function () {
            if (this._handle) {
                this._handle.release();
                this._handle = null;
            }
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new AvatarView(options);
        }
    };
    $e.ui.addViewPlugin("view_avatar", plugin);
}($e);
