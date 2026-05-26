/**
 * @file 加载状态组件
 * @description 用于展示加载状态，支持全屏模式、自定义文本和尺寸设置
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var loading = $e.ui.createView('view_loading', {
 *     fullscreen: true,
 *     text: '加载中...',
 *     size: 'large'
 * });
 * loading.show();
 */
+function ($e) {
    'use strict';

    /**
     * LoadingView 加载状态组件
     * 用于展示加载状态，支持全屏模式、自定义文本和尺寸设置
     * @class
     * @param {Object} options - 配置选项
     * @param {boolean} [options.fullscreen=false] - 是否全屏显示
     * @param {string} [options.text=''] - 加载文本
     * @param {string} [options.size=''] - 尺寸：small/default/large
     * @param {HTMLElement|string} [options.target=null] - 目标容器
     * @param {boolean} [options.lock=true] - 是否锁屏
     */
    function LoadingView(options) {
        this.props = options;
        this._fullscreen = $e.fn.getBoolean(options["fullscreen"], false);
        this._text = options["text"] || "";
        this._size = options["size"] || "";
        this._visible = false;
        this._target = options["target"] || null;
        this._lock = $e.fn.getBoolean(options["lock"], true);
    }

    LoadingView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_loading',
        body: null,
        _mask: null,
        _spinner: null,
        _textEl: null,
        _fullscreen: false,
        _text: '',
        _size: '',
        _visible: false,
        _target: null,
        _lock: true,
        _events: null,

        /**
         * 初始化加载组件
         * @public
         * @returns {void}
         */
        init: function() {
            this.body = this.shell.querySelector("[view-area='body']") || this.shell;

            this._createMask();
            this._createSpinner();

            if (this._size) {
                $e.fn.addClass(this.shell, "yc-loading-" + this._size);
            }

            if (this._fullscreen) {
                $e.fn.addClass(this._mask, "is-fullscreen");
            }

            if (!this.shell.parentNode) {
                $e.fn.showElement(this.shell, false);
            }

            this._events = [];
            this.inited();
        },

        /**
         * 创建遮罩层
         * @private
         * @returns {void}
         */
        _createMask: function() {
            var mask = document.createElement("div");
            mask.className = "yc-loading-mask";
            this._mask = mask;

            var wrapper = document.createElement("div");
            wrapper.className = "yc-loading-spinner-wrapper";

            this._spinner = document.createElement("div");
            this._spinner.className = "yc-loading-spinner";
            wrapper.appendChild(this._spinner);

            if (this._text) {
                this._textEl = document.createElement("div");
                this._textEl.className = "yc-loading-text";
                this._textEl.innerText = this._text;
                wrapper.appendChild(this._textEl);
            }

            mask.appendChild(wrapper);
            this.shell.appendChild(mask);
        },

        /**
         * 创建加载动画元素
         * @private
         * @returns {void}
         */
        _createSpinner: function() {
        },

        /**
         * 显示加载
         * @public
         * @returns {void}
         */
        show: function() {
            if (this._visible) return;
            this._visible = true;

            var target = this._getTarget();
            if (target) {
                $e.fn.addClass(target, "yc-loading-parent");
                target.appendChild(this.shell);
            } else {
                document.body.appendChild(this.shell);
            }

            $e.fn.showElement(this.shell, true);

            setTimeout(function() {
                $e.fn.addClass(this._mask, "is-loading");
            }.bind(this), 10);

            this.onShow();
        },

        /**
         * 隐藏加载
         * @public
         * @returns {void}
         */
        hide: function() {
            if (!this._visible) return;
            this._visible = false;

            $e.fn.removeClass(this._mask, "is-loading");

            setTimeout(function() {
                if (!this._visible) {
                    $e.fn.showElement(this.shell, false);
                    var target = this._getTarget();
                    if (target) {
                        $e.fn.removeClass(target, "yc-loading-parent");
                    }
                }
            }.bind(this), 300);

            this.onHide();
        },

        /**
         * 获取目标容器
         * @private
         * @returns {HTMLElement|null} 目标容器元素
         */
        _getTarget: function() {
            if (this._target) {
                if (typeof this._target === 'string') {
                    return document.querySelector(this._target);
                }
                return this._target;
            }
            return null;
        },

        /**
         * 设置加载文本
         * @public
         * @param {string} text - 文本内容
         * @returns {void}
         */
        setText: function(text) {
            this._text = text;
            if (this._textEl) {
                this._textEl.innerText = text;
            }
        },

        /**
         * 获取加载文本
         * @public
         * @returns {string} 文本内容
         */
        getText: function() {
            return this._text;
        },

        /**
         * 设置全屏模式
         * @public
         * @param {boolean} fullscreen - 是否全屏
         * @returns {void}
         */
        setFullscreen: function(fullscreen) {
            this._fullscreen = fullscreen;
            if (fullscreen) {
                $e.fn.addClass(this._mask, "is-fullscreen");
            } else {
                $e.fn.removeClass(this._mask, "is-fullscreen");
            }
        },

        /**
         * 判断是否可见
         * @public
         * @returns {boolean} 是否可见
         */
        isVisible: function() {
            return this._visible;
        },

        /**
         * 显示回调
         * @protected
         * @returns {void}
         */
        onShow: function() {
        },

        /**
         * 隐藏回调
         * @protected
         * @returns {void}
         */
        onHide: function() {
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function() {
            this.hide();
            if (this._mask && this._mask.parentNode) {
                this._mask.parentNode.removeChild(this._mask);
            }
            this._mask = null;
            this._spinner = null;
            this._textEl = null;
            this.body = null;
            this._events = null;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建加载组件实例
         * @param {Object} options - 组件配置
         * @returns {LoadingView} 加载组件实例
         */
        create: function(options) {
            return new LoadingView(options);
        }
    };

    $e.ui.addViewPlugin("view_loading", plugin);

}($e);