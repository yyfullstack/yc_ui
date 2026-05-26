/**
 * @file Empty空状态组件
 * @description 用于页面无数据时展示的空状态提示，支持自定义图片、描述和额外内容
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * EmptyView 空状态组件
     * 用于页面无数据时展示的空状态提示，支持自定义图片、描述和额外内容
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.image=''] 图片URL或SVG字符串
     * @param {string} [options.description='暂无数据'] 描述文本
     * @param {Object} [options.imageStyle={}] 图片样式对象
     */
    function EmptyView(options) {
        this.props = options || {};
        this._image = this.props['image'] || '';
        this._description = this.props['description'] || '暂无数据';
        this._imageStyle = this.props['imageStyle'] || {};
    }

    EmptyView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_empty',
        shell: null,
        body: null,
        _image: '',
        _description: '暂无数据',
        _imageStyle: null,
        _imageEl: null,
        _descEl: null,
        _extraEl: null,

        /**
         * 初始化组件
         * 设置body区域并渲染空状态内容
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-empty');
            this.render();
            this.inited();
        },

        /**
         * 渲染Empty组件DOM结构
         * 构建图片、描述和额外内容区域
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            shell.style.textAlign = 'center';
            shell.style.padding = 'var(--yc-padding-xl) var(--yc-padding-md)';

            var imageWrap = document.createElement('div');
            $e.fn.addClass(imageWrap, 'yc-empty-image');
            imageWrap.style.marginBottom = 'var(--yc-padding-md)';
            imageWrap.style.fontSize = '48px';
            imageWrap.style.color = 'var(--yc-text-color-disabled)';

            if (this._image) {
                if (this._image.indexOf('<svg') === 0 || this._image.indexOf('<') === 0) {
                    imageWrap.innerHTML = this._image;
                } else {
                    var img = document.createElement('img');
                    img.src = this._image;
                    img.alt = 'empty';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    for (var key in this._imageStyle) {
                        img.style[key] = this._imageStyle[key];
                    }
                    imageWrap.appendChild(img);
                }
            } else {
                var defaultIcon = document.createElement('i');
                $e.fn.addClass(defaultIcon, 'fa');
                $e.fn.addClass(defaultIcon, 'fa-inbox');
                imageWrap.appendChild(defaultIcon);
            }
            this._imageEl = imageWrap;
            shell.appendChild(imageWrap);

            var descEl = document.createElement('p');
            $e.fn.addClass(descEl, 'yc-empty-description');
            descEl.style.color = 'var(--yc-text-color-secondary)';
            descEl.style.fontSize = 'var(--yc-font-size-base)';
            descEl.style.lineHeight = 'var(--yc-line-height-base)';
            descEl.style.margin = '0 0 var(--yc-padding-md) 0';
            descEl.innerHTML = this._description;
            this._descEl = descEl;
            shell.appendChild(descEl);

            var extraEl = document.createElement('div');
            $e.fn.addClass(extraEl, 'yc-empty-extra');
            this._extraEl = extraEl;
            shell.appendChild(extraEl);
        },

        /**
         * 设置图片
         * @public
         * @param {string} image 图片URL或SVG字符串
         * @returns {void}
         */
        setImage: function (image) {
            this._image = image;
            this.render();
        },

        /**
         * 获取图片
         * @public
         * @returns {string} 图片内容
         */
        getImage: function () {
            return this._image;
        },

        /**
         * 设置描述文本
         * @public
         * @param {string} description 描述内容
         * @returns {void}
         */
        setDescription: function (description) {
            this._description = description;
            if (this._descEl) {
                this._descEl.innerHTML = description;
            }
        },

        /**
         * 获取描述文本
         * @public
         * @returns {string} 描述内容
         */
        getDescription: function () {
            return this._description;
        },

        /**
         * 设置图片样式
         * @public
         * @param {Object} style CSS样式对象
         * @returns {void}
         */
        setImageStyle: function (style) {
            this._imageStyle = style;
            this.render();
        },

        /**
         * 获取图片样式
         * @public
         * @returns {Object} 样式对象
         */
        getImageStyle: function () {
            return this._imageStyle;
        },

        /**
         * 设置额外内容
         * @public
         * @param {HTMLElement|string} content 额外内容元素或HTML字符串
         * @returns {void}
         */
        setExtra: function (content) {
            if (this._extraEl) {
                if (typeof content === 'string') {
                    this._extraEl.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    this._extraEl.innerHTML = '';
                    this._extraEl.appendChild(content);
                }
            }
        },

        /**
         * 获取额外内容容器
         * @public
         * @returns {HTMLElement} 额外内容容器元素
         */
        getExtra: function () {
            return this._extraEl;
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this._imageEl = null;
            this._descEl = null;
            this._extraEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        /**
         * 创建Empty组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {EmptyView} Empty实例
         */
        create: function (options) {
            return new EmptyView(options);
        }
    };
    $e.ui.addViewPlugin("view_empty", plugin);
}($e);