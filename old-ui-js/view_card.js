/**
 * @file 卡片组件
 * @description 用于展示带有标题、内容和操作的面板，支持阴影效果和多种样式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 卡片组件构造函数
     * @class CardView
     * @param {Object} options - 配置选项
     * @param {string} [options.title=''] - 标题文本
     * @param {string} [options.extra=''] - 额外内容
     * @param {string} [options.shadow='never'] - 阴影效果: always/hover/never
     * @param {boolean} [options.hoverable=false] - 是否可悬浮
     * @param {boolean} [options.bordered=true] - 是否显示边框
     * @param {boolean} [options.plain=false] - 是否简约样式
     * @param {string} [options.type=''] - 类型: success/warning/danger/primary
     * @param {string} [options.image=''] - 图片地址
     * @param {string} [options.imagePosition='top'] - 图片位置: top/bottom
     */
    function CardView(options) {
        this.props = options || {};
        this._title = this.props['title'] || '';
        this._extra = this.props['extra'] || '';
        this._shadow = this.props['shadow'] || 'never';
        this._hoverable = $e.fn.getBoolean(this.props['hoverable'], false);
        this._bordered = $e.fn.getBoolean(this.props['bordered'], true);
        this._plain = $e.fn.getBoolean(this.props['plain'], false);
        this._type = this.props['type'] || '';
        this._image = this.props['image'] || '';
        this._imagePosition = this.props['imagePosition'] || 'top';
        this._headerHandle = null;
        this._actionHandles = [];
    }

    CardView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_card',
        shell: null,
        body: null,
        _title: '',
        _extra: '',
        _shadow: 'never',
        _hoverable: false,
        _bordered: true,
        _plain: false,
        _type: '',
        _image: '',
        _imagePosition: 'top',
        _headerHandle: null,
        _actionHandles: null,
        _headerEl: null,
        _bodyEl: null,
        _footerEl: null,
        _titleEl: null,
        _extraEl: null,

        /**
         * 初始化组件
         * 设置body区域，渲染卡片结构，调用inited完成初始化
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-card');
            this.applyClasses();
            this.render();
            this.inited();
        },

        /**
         * 应用CSS类
         */
        applyClasses: function () {
            var shell = this.shell;
            if (this._hoverable) {
                $e.fn.addClass(shell, 'yc-card--hoverable');
            }
            if (this._shadow === 'always') {
                $e.fn.addClass(shell, 'yc-card--shadow');
            }
            if (!this._bordered) {
                $e.fn.removeClass(shell, 'yc-card--bordered');
            }
            if (this._plain) {
                $e.fn.addClass(shell, 'yc-card--plain');
            }
            if (this._type) {
                $e.fn.addClass(shell, 'yc-card--' + this._type);
            }
            if (this._image) {
                $e.fn.addClass(shell, 'yc-card--image-' + this._imagePosition);
            }
        },

        /**
         * 渲染Card组件DOM结构
         * 构建头部、内容和底部区域
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';

            if (this._image && this._imagePosition === 'top') {
                var img = document.createElement('img');
                $e.fn.addClass(img, 'yc-card__image');
                img.src = this._image;
                img.alt = this._title || 'card image';
                shell.appendChild(img);
            }

            if (this._title || this._extra) {
                var header = document.createElement('div');
                $e.fn.addClass(header, 'yc-card__header');

                if (this._title) {
                    var titleEl = document.createElement('div');
                    $e.fn.addClass(titleEl, 'yc-card__title');
                    titleEl.innerHTML = this._title;
                    this._titleEl = titleEl;
                    header.appendChild(titleEl);
                }

                if (this._extra) {
                    var extraEl = document.createElement('div');
                    $e.fn.addClass(extraEl, 'yc-card__extra');
                    extraEl.innerHTML = this._extra;
                    this._extraEl = extraEl;
                    header.appendChild(extraEl);
                }

                this._headerEl = header;
                shell.appendChild(header);
            }

            var bodyEl = document.createElement('div');
            $e.fn.addClass(bodyEl, 'yc-card__body');
            this._bodyEl = bodyEl;
            shell.appendChild(bodyEl);

            if (this._image && this._imagePosition === 'bottom') {
                var img2 = document.createElement('img');
                $e.fn.addClass(img2, 'yc-card__image');
                img2.src = this._image;
                img2.alt = this._title || 'card image';
                shell.appendChild(img2);
            }
        },

        /**
         * 获取卡片内容区域
         * @returns {HTMLElement} 内容区域元素
         */
        getBody: function () {
            return this._bodyEl;
        },

        /**
         * 设置标题
         * @param {string} title 标题文本
         */
        setTitle: function (title) {
            this._title = title;
            if (this._titleEl) {
                this._titleEl.innerHTML = title;
            } else {
                this.render();
            }
        },

        /**
         * 获取标题
         * @returns {string} 标题文本
         */
        getTitle: function () {
            return this._title;
        },

        /**
         * 设置额外内容
         * @param {string} extra 额外内容HTML
         */
        setExtra: function (extra) {
            this._extra = extra;
            if (this._extraEl) {
                this._extraEl.innerHTML = extra;
            } else {
                this.render();
            }
        },

        /**
         * 获取额外内容
         * @returns {string} 额外内容
         */
        getExtra: function () {
            return this._extra;
        },

        /**
         * 设置阴影效果
         * @param {string} shadow always/hover/never
         */
        setShadow: function (shadow) {
            this._shadow = shadow;
            if (shadow === 'always') {
                $e.fn.addClass(this.shell, 'yc-card--shadow');
            } else {
                $e.fn.removeClass(this.shell, 'yc-card--shadow');
            }
        },

        /**
         * 获取阴影效果
         * @returns {string} 阴影配置
         */
        getShadow: function () {
            return this._shadow;
        },

        /**
         * 设置是否可悬浮
         * @param {boolean} hoverable 是否可悬浮
         */
        setHoverable: function (hoverable) {
            this._hoverable = hoverable;
            if (hoverable) {
                $e.fn.addClass(this.shell, 'yc-card--hoverable');
            } else {
                $e.fn.removeClass(this.shell, 'yc-card--hoverable');
            }
        },

        /**
         * 设置卡片类型
         * @param {string} type 类型: success/warning/danger/primary
         */
        setType: function (type) {
            if (this._type) {
                $e.fn.removeClass(this.shell, 'yc-card--' + this._type);
            }
            this._type = type;
            if (type) {
                $e.fn.addClass(this.shell, 'yc-card--' + type);
            }
        },

        /**
         * 获取卡片类型
         * @returns {string} 卡片类型
         */
        getType: function () {
            return this._type;
        },

        /**
         * 设置底部内容
         * @param {HTMLElement|string} content 底部内容
         */
        setFooter: function (content) {
            if (!this._footerEl) {
                this._footerEl = document.createElement('div');
                $e.fn.addClass(this._footerEl, 'yc-card__footer');
                this.shell.appendChild(this._footerEl);
            }
            if (typeof content === 'string') {
                this._footerEl.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this._footerEl.innerHTML = '';
                this._footerEl.appendChild(content);
            }
        },

        /**
         * 获取底部元素
         * @returns {HTMLElement} 底部元素
         */
        getFooter: function () {
            return this._footerEl;
        },

        /**
         * 设置图片
         * @param {string} image 图片URL
         */
        setImage: function (image) {
            this._image = image;
            this.render();
        },

        /**
         * 获取图片
         * @returns {string} 图片URL
         */
        getImage: function () {
            return this._image;
        },

        /**
         * 释放组件资源
         * 清理事件监听器和引用
         */
        selfRelease: function () {
            if (this._headerHandle) {
                this._headerHandle.release();
                this._headerHandle = null;
            }
            if (this._actionHandles) {
                for (var i = 0; i < this._actionHandles.length; i++) {
                    if (this._actionHandles[i]) {
                        this._actionHandles[i].release();
                    }
                }
                this._actionHandles = null;
            }
            this._headerEl = null;
            this._bodyEl = null;
            this._footerEl = null;
            this._titleEl = null;
            this._extraEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new CardView(options);
        }
    };
    $e.ui.addViewPlugin("view_card", plugin);
}($e);
