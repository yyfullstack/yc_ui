/**
 * @file Affix固定定位组件
 * @description 提供固定定位功能，支持顶部和底部固定，支持自定义偏移量
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * AffixView 固定定位组件
     * 用于将元素固定在页面顶部或底部，支持滚动监听和位置检测
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.position='top'] 固定位置: top/bottom
     * @param {number} [options.offset=0] 偏移量(像素)
     * @param {boolean} [options.bordered=false] 是否显示边框
     * @param {string} [options.theme='default'] 主题样式
     * @param {string} [options.container] 滚动容器选择器
     * @param {Function} [options.onChange] 固定状态变化回调
     */
    function AffixView(options) {
        this.props = options;
        /** @type {Array} 事件监听器数组 */
        this._listeners = [];
        /** @type {boolean} 是否已固定 */
        this._fixed = false;
    }

    AffixView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_affix',
        body: null,
        shell: null,
        _listeners: null,
        _fixed: false,
        _placeholder: null,
        _content: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildAffix();
            this.inited();
        },

        /**
         * 构建Affix组件结构
         * @public
         */
        buildAffix: function () {
            var options = this.props;
            var position = options.position || 'top';
            var offset = options.offset || 0;
            var bordered = options.bordered || false;
            var theme = options.theme || 'default';

            $e.fn.addClass(this.shell, 'yc-affix');
            $e.fn.addClass(this.shell, 'yc-affix--' + position);

            if (bordered) {
                $e.fn.addClass(this.shell, 'yc-affix--bordered');
            }

            if (theme !== 'default') {
                $e.fn.addClass(this.shell, 'yc-affix--' + theme);
            }

            this._placeholder = $e.fn.create('div');
            $e.fn.addClass(this._placeholder, 'yc-affix__placeholder');

            this._content = $e.fn.create('div');
            $e.fn.addClass(this._content, 'yc-affix__content');

            while (this.body.firstChild) {
                this._content.appendChild(this.body.firstChild);
            }

            this.body.appendChild(this._placeholder);
            this.body.appendChild(this._content);

            this.bindScroll();
        },

        /**
         * 绑定滚动事件监听
         * @public
         */
        bindScroll: function () {
            var self = this;
            var container = this.props.container ? document.querySelector(this.props.container) : window;

            /**
             * 滚动处理函数
             */
            var onScroll = function () {
                self.checkPosition();
            };

            if (container === window) {
                window.addEventListener('scroll', onScroll);
            } else {
                container.addEventListener('scroll', onScroll);
            }

            this._listeners.push({ container: container, handler: onScroll });
            this.checkPosition();
        },

        /**
         * 检查位置并决定是否固定
         * @public
         */
        checkPosition: function () {
            var container = this._listeners[0].container;
            var scrollTop = container === window ? window.pageYOffset : container.scrollTop;
            var offset = this.props.offset || 0;
            var rect = this.shell.getBoundingClientRect();
            var containerRect = container === window ? { top: 0 } : container.getBoundingClientRect();
            var shouldFix = false;

            if (this.props.position === 'bottom') {
                var containerHeight = container === window ? window.innerHeight : container.clientHeight;
                shouldFix = rect.bottom >= containerHeight - offset;
            } else {
                shouldFix = rect.top <= offset + containerRect.top;
            }

            if (shouldFix && !this._fixed) {
                this.fix();
            } else if (!shouldFix && this._fixed) {
                this.unfix();
            }
        },

        /**
         * 固定元素
         * @public
         */
        fix: function () {
            this._fixed = true;
            $e.fn.addClass(this.shell, 'is-fixed');
            $e.fn.addClass(this._placeholder, 'is-active');

            var rect = this.shell.getBoundingClientRect();
            this._placeholder.style.height = rect.height + 'px';

            if (this.props.onChange) {
                this.props.onChange(true);
            }
        },

        /**
         * 取消固定
         * @public
         */
        unfix: function () {
            this._fixed = false;
            $e.fn.removeClass(this.shell, 'is-fixed');
            $e.fn.removeClass(this._placeholder, 'is-active');
            this._placeholder.style.height = '0px';

            if (this.props.onChange) {
                this.props.onChange(false);
            }
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                var listener = this._listeners[i];
                if (listener.container === window) {
                    window.removeEventListener('scroll', listener.handler);
                } else {
                    listener.container.removeEventListener('scroll', listener.handler);
                }
            }

            this._listeners = null;
            this._placeholder = null;
            this._content = null;
            this.body = null;
        },

        /**
         * 窗口resize时重新检查位置
         * @public
         * @param {Object} options 选项
         */
        resize: function (options) {
            this.checkPosition();
        }
    };

    var plugin = {
        /**
         * 创建Affix组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {AffixView} Affix实例
         */
        create: function (options) {
            return new AffixView(options);
        }
    };

    $e.ui.addViewPlugin('view_affix', plugin);
}($e);
