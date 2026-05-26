/**
 * @file BackTop回到顶部组件
 * @description 提供页面回到顶部功能，支持自定义位置、尺寸和动画效果
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * BackTopView 回到顶部组件
     * 用于页面滚动后快速返回顶部，支持平滑滚动动画
     * @class
     * @param {Object} options 配置项
     * @param {number} [options.visibilityHeight=300] 显示阈值(像素)
     * @param {string} [options.target] 滚动容器选择器
     * @param {number} [options.bottom=40] 底部距离(像素)
     * @param {number} [options.right=40] 右侧距离(像素)
     * @param {string} [options.size='default'] 尺寸: default/small/large
     * @param {string} [options.shape='circle'] 形状: circle/square
     * @param {number} [options.duration=400] 动画时长(毫秒)
     * @param {Function} [options.onClick] 点击回调
     */
    function BackTopView(options) {
        this.props = options;
        /** @type {Array} 事件监听器数组 */
        this._listeners = [];
    }

    BackTopView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_backtop',
        body: null,
        shell: null,
        _listeners: null,
        _container: null,
        _visibilityHeight: 300,
        _duration: 400,
        _scrollListener: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildBackTop();
            this.inited();
        },

        /**
         * 构建BackTop组件结构
         * @public
         */
        buildBackTop: function () {
            var options = this.props;
            var visibilityHeight = options.visibilityHeight || 300;
            var target = options.target || null;
            var bottom = options.bottom || 40;
            var right = options.right || 40;
            var size = options.size || 'default';
            var shape = options.shape || 'circle';
            var duration = options.duration || 400;

            var container = target ? document.querySelector(target) : window;
            this._container = container;
            this._visibilityHeight = visibilityHeight;
            this._duration = duration;

            $e.fn.addClass(this.shell, 'yc-backtop');

            if (size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-backtop--' + size);
            }

            if (shape === 'square') {
                $e.fn.addClass(this.shell, 'yc-backtop--square');
            }

            this.shell.style.bottom = bottom + 'px';
            this.shell.style.right = right + 'px';
            this.shell.innerHTML = '<i>&#8679;</i>';

            var self = this;
            this.bindListen($e.events.regEvent(this.shell, 'click', this, function (e) {
                self.scrollToTop();
            }));

            this.bindScrollListener();
            this.checkVisibility();
        },

        /**
         * 绑定滚动事件监听
         * @public
         */
        bindScrollListener: function () {
            var self = this;

            var onScroll = function () {
                self.checkVisibility();
            };

            if (this._container === window) {
                window.addEventListener('scroll', onScroll);
            } else {
                this._container.addEventListener('scroll', onScroll);
            }

            this._scrollListener = onScroll;
        },

        /**
         * 检查可见性
         * @public
         */
        checkVisibility: function () {
            var scrollTop = 0;

            if (this._container === window) {
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            } else {
                scrollTop = this._container.scrollTop;
            }

            if (scrollTop >= this._visibilityHeight) {
                $e.fn.removeClass(this.shell, 'yc-backtop--hidden');
            } else {
                $e.fn.addClass(this.shell, 'yc-backtop--hidden');
            }
        },

        /**
         * 滚动到顶部
         * @public
         */
        scrollToTop: function () {
            var self = this;
            var start = 0;

            if (this._container === window) {
                start = window.pageYOffset || document.documentElement.scrollTop;
            } else {
                start = this._container.scrollTop;
            }

            var startTime = Date.now();
            var duration = this._duration;

            var animate = function () {
                var now = Date.now();
                var elapsed = now - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var easeProgress = 1 - Math.pow(1 - progress, 3);
                var scrollTop = start * (1 - easeProgress);

                if (self._container === window) {
                    window.scrollTo(0, scrollTop);
                } else {
                    self._container.scrollTop = scrollTop;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);

            if (this.props.onClick) {
                this.props.onClick();
            }
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            if (this._scrollListener) {
                if (this._container === window) {
                    window.removeEventListener('scroll', this._scrollListener);
                } else {
                    this._container.removeEventListener('scroll', this._scrollListener);
                }
            }

            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }

            this._listeners = null;
            this._container = null;
            this._scrollListener = null;
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
         * 创建BackTop组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {BackTopView} BackTop实例
         */
        create: function (options) {
            return new BackTopView(options);
        }
    };

    $e.ui.addViewPlugin('view_backtop', plugin);
}($e);
