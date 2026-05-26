/**
 * @file Image图片组件
 * @description 用于展示图片，支持预览、加载状态、错误处理和懒加载
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * ImageView 图片组件
     * 用于展示图片，支持预览、加载状态、错误处理和懒加载
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.src=''] 图片URL
     * @param {string} [options.alt=''] 图片替代文本
     * @param {string} [options.fit='cover'] 填充模式：fill/contain/cover/none/scale-down
     * @param {boolean} [options.preview=false] 是否可预览
     * @param {boolean} [options.lazy=false] 是否懒加载
     * @param {string} [options.size='default'] 尺寸
     */
    function ImageView(options) {
        this.props = options || {};
        this._src = this.props['src'] || '';
        this._alt = this.props['alt'] || '';
        this._fit = this.props['fit'] || 'cover';
        this._preview = $e.fn.getBoolean(this.props['preview'], false);
        this._lazy = $e.fn.getBoolean(this.props['lazy'], false);
        this._size = this.props['size'] || 'default';
        this._loading = false;
        this._error = false;
        this._loaded = false;
        this._imgEl = null;
        this._previewHandle = null;
        this._viewerEl = null;
        this._observer = null;
    }

    ImageView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_image',
        shell: null,
        body: null,
        _src: '',
        _alt: '',
        _fit: 'cover',
        _preview: false,
        _lazy: false,
        _size: 'default',
        _loading: false,
        _error: false,
        _loaded: false,
        _imgEl: null,
        _previewHandle: null,
        _viewerEl: null,
        _observer: null,

        /**
         * 初始化组件
         * 设置body区域，渲染图片结构，调用inited完成初始化
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-image');
            if (this._preview) {
                $e.fn.addClass(this.shell, 'yc-image--preview');
            }
            if (this._size && this._size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-image--' + this._size);
            }
            this.render();
            this.inited();
        },

        /**
         * 渲染Image组件DOM结构
         * 根据配置构建图片、占位符和遮罩
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';

            var img = document.createElement('img');
            $e.fn.addClass(img, 'yc-image__inner');
            if (this._fit) {
                $e.fn.addClass(img, 'yc-image__inner--' + this._fit);
            }
            img.alt = this._alt;
            this._imgEl = img;

            if (this._lazy) {
                this.setupLazyLoad();
            } else {
                this.loadImage();
            }

            shell.appendChild(img);

            if (this._preview) {
                var mask = document.createElement('div');
                $e.fn.addClass(mask, 'yc-image__preview-mask');
                var icon = document.createElement('i');
                $e.fn.addClass(icon, 'fa');
                $e.fn.addClass(icon, 'fa-eye');
                mask.appendChild(icon);
                shell.appendChild(mask);

                this._previewHandle = this.bindListen($e.events.regEvent(shell, 'click', this, this.openPreview));
            }
        },

        /**
         * 加载图片
         * @private
         * @returns {void}
         */
        loadImage: function () {
            var _this = this;
            if (!this._src) {
                this.showError();
                return;
            }
            this._loading = true;
            this._error = false;
            this.showLoading();

            var img = new Image();
            img.onload = function () {
                _this._loading = false;
                _this._loaded = true;
                _this._imgEl.src = _this._src;
                _this.hidePlaceholder();
            };
            img.onerror = function () {
                _this._loading = false;
                _this._error = true;
                _this.showError();
            };
            img.src = this._src;
        },

        /**
         * 设置懒加载
         * @private
         * @returns {void}
         */
        setupLazyLoad: function () {
            var _this = this;
            if ('IntersectionObserver' in window) {
                this._observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            _this.loadImage();
                            _this._observer.disconnect();
                            _this._observer = null;
                        }
                    });
                });
                this._observer.observe(this.shell);
            } else {
                this.loadImage();
            }
        },

        /**
         * 显示加载状态
         * @private
         * @returns {void}
         */
        showLoading: function () {
            var shell = this.shell;
            var existing = shell.querySelector('.yc-image__loading');
            if (existing) return;

            var loading = document.createElement('div');
            $e.fn.addClass(loading, 'yc-image__loading');
            var icon = document.createElement('i');
            $e.fn.addClass(icon, 'fa');
            $e.fn.addClass(icon, 'fa-spinner');
            $e.fn.addClass(icon, 'fa-spin');
            loading.appendChild(icon);
            shell.appendChild(loading);
        },

        /**
         * 显示错误状态
         * @private
         * @returns {void}
         */
        showError: function () {
            this.hidePlaceholder();
            var shell = this.shell;
            var existing = shell.querySelector('.yc-image__error');
            if (existing) return;

            var error = document.createElement('div');
            $e.fn.addClass(error, 'yc-image__error');
            var icon = document.createElement('i');
            $e.fn.addClass(icon, 'fa');
            $e.fn.addClass(icon, 'fa-picture-o');
            error.appendChild(icon);

            var text = document.createElement('span');
            text.innerText = '加载失败';
            error.appendChild(text);
            shell.appendChild(error);
        },

        /**
         * 隐藏占位符
         * @private
         * @returns {void}
         */
        hidePlaceholder: function () {
            var shell = this.shell;
            var loading = shell.querySelector('.yc-image__loading');
            if (loading) {
                shell.removeChild(loading);
            }
            var error = shell.querySelector('.yc-image__error');
            if (error) {
                shell.removeChild(error);
            }
        },

        /**
         * 打开图片预览
         * @public
         * @returns {void}
         */
        openPreview: function () {
            if (!this._src || this._error) return;

            var viewer = document.createElement('div');
            $e.fn.addClass(viewer, 'yc-image-viewer');

            var closeBtn = document.createElement('button');
            $e.fn.addClass(closeBtn, 'yc-image-viewer__close');
            closeBtn.innerHTML = '<i class="fa fa-close"></i>';
            viewer.appendChild(closeBtn);

            var img = document.createElement('img');
            img.src = this._src;
            img.style.maxWidth = '90%';
            img.style.maxHeight = '90%';
            img.style.objectFit = 'contain';
            viewer.appendChild(img);

            var toolbar = document.createElement('div');
            $e.fn.addClass(toolbar, 'yc-image-viewer__toolbar');

            var zoomIn = document.createElement('button');
            $e.fn.addClass(zoomIn, 'yc-image-viewer__btn');
            zoomIn.innerHTML = '<i class="fa fa-search-plus"></i>';
            toolbar.appendChild(zoomIn);

            var zoomOut = document.createElement('button');
            $e.fn.addClass(zoomOut, 'yc-image-viewer__btn');
            zoomOut.innerHTML = '<i class="fa fa-search-minus"></i>';
            toolbar.appendChild(zoomOut);

            var rotate = document.createElement('button');
            $e.fn.addClass(rotate, 'yc-image-viewer__btn');
            rotate.innerHTML = '<i class="fa fa-rotate-right"></i>';
            toolbar.appendChild(rotate);

            viewer.appendChild(toolbar);
            document.body.appendChild(viewer);
            this._viewerEl = viewer;

            var _this = this;
            var scale = 1;
            var rotation = 0;

            this.bindListen($e.events.regEvent(closeBtn, 'click', this, function () {
                _this.closePreview();
            }));
            this.bindListen($e.events.regEvent(zoomIn, 'click', this, function () {
                scale += 0.2;
                img.style.transform = 'scale(' + scale + ') rotate(' + rotation + 'deg)';
            }));
            this.bindListen($e.events.regEvent(zoomOut, 'click', this, function () {
                scale = Math.max(0.2, scale - 0.2);
                img.style.transform = 'scale(' + scale + ') rotate(' + rotation + 'deg)';
            }));
            this.bindListen($e.events.regEvent(rotate, 'click', this, function () {
                rotation += 90;
                img.style.transform = 'scale(' + scale + ') rotate(' + rotation + 'deg)';
            }));
            this.bindListen($e.events.regEvent(viewer, 'click', this, function (e) {
                if (e.target === viewer) {
                    _this.closePreview();
                }
            }));
        },

        /**
         * 关闭图片预览
         * @public
         * @returns {void}
         */
        closePreview: function () {
            if (this._viewerEl && this._viewerEl.parentNode) {
                this._viewerEl.parentNode.removeChild(this._viewerEl);
                this._viewerEl = null;
            }
        },

        /**
         * 设置图片地址
         * @public
         * @param {string} src 图片URL
         * @returns {void}
         */
        setSrc: function (src) {
            this._src = src;
            this._loaded = false;
            this._error = false;
            this.hidePlaceholder();
            if (this._imgEl) {
                this._imgEl.src = '';
            }
            if (this._lazy) {
                this.setupLazyLoad();
            } else {
                this.loadImage();
            }
        },

        /**
         * 获取图片地址
         * @public
         * @returns {string} 图片URL
         */
        getSrc: function () {
            return this._src;
        },

        /**
         * 设置图片描述
         * @public
         * @param {string} alt 描述文本
         * @returns {void}
         */
        setAlt: function (alt) {
            this._alt = alt;
            if (this._imgEl) {
                this._imgEl.alt = alt;
            }
        },

        /**
         * 获取图片描述
         * @public
         * @returns {string} 描述文本
         */
        getAlt: function () {
            return this._alt;
        },

        /**
         * 设置图片填充模式
         * @public
         * @param {string} fit fill/contain/cover/none/scale-down
         * @returns {void}
         */
        setFit: function (fit) {
            if (this._imgEl && this._fit) {
                $e.fn.removeClass(this._imgEl, 'yc-image__inner--' + this._fit);
            }
            this._fit = fit;
            if (this._imgEl && fit) {
                $e.fn.addClass(this._imgEl, 'yc-image__inner--' + fit);
            }
        },

        /**
         * 获取图片填充模式
         * @public
         * @returns {string} 填充模式
         */
        getFit: function () {
            return this._fit;
        },

        /**
         * 设置是否可预览
         * @public
         * @param {boolean} preview 是否可预览
         * @returns {void}
         */
        setPreview: function (preview) {
            this._preview = preview;
            if (preview) {
                $e.fn.addClass(this.shell, 'yc-image--preview');
            } else {
                $e.fn.removeClass(this.shell, 'yc-image--preview');
            }
        },

        /**
         * 获取是否可预览
         * @public
         * @returns {boolean} 是否可预览
         */
        getPreview: function () {
            return this._preview;
        },

        /**
         * 释放组件资源
         * 清理事件监听器和引用
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this.closePreview();
            if (this._previewHandle) {
                this._previewHandle.release();
                this._previewHandle = null;
            }
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            this._imgEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        /**
         * 创建Image组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {ImageView} Image实例
         */
        create: function (options) {
            return new ImageView(options);
        }
    };
    $e.ui.addViewPlugin("view_image", plugin);
}($e);