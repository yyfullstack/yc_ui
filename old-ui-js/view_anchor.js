/**
 * @file Anchor锚点组件
 * @description 提供锚点导航功能，支持平滑滚动和自动高亮当前锚点
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * AnchorView 锚点导航组件
     * 用于页面内锚点导航，支持滚动监听和自动高亮当前激活的锚点
     * @class
     * @param {Object} options 配置项
     * @param {Array} [options.links] 锚点链接配置数组
     * @param {string} [options.container] 滚动容器选择器
     * @param {Function} [options.onClick] 点击回调
     */
    function AnchorView(options) {
        this.props = options;
        /** @type {Array} 链接元素数组 */
        this.links = [];
        /** @type {Array} 事件监听器数组 */
        this._listeners = [];
        /** @type {Object} 滚动监听器 */
        this._scrollListener = null;
    }

    AnchorView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_anchor',
        body: null,
        shell: null,
        links: null,
        _listeners: null,
        _scrollListener: null,
        _line: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildAnchor();
            this.inited();
        },

        /**
         * 构建锚点组件结构
         * @public
         */
        buildAnchor: function () {
            var options = this.props;

            $e.fn.addClass(this.shell, 'yc-anchor');

            var list = $e.fn.create('ul');
            $e.fn.addClass(list, 'yc-anchor__list');

            if (options.links instanceof Array) {
                for (var i = 0; i < options.links.length; i++) {
                    this.addLink(options.links[i], list, 0);
                }
            }

            this.getBody().appendChild(list);

            var line = $e.fn.create('div');
            $e.fn.addClass(line, 'yc-anchor__line');
            this.getBody().appendChild(line);
            this._line = line;

            this.bindScrollSpy();
        },

        /**
         * 添加锚点链接
         * @public
         * @param {Object} linkOptions 链接配置
         * @param {HTMLElement} parent 父元素
         * @param {number} level 层级
         * @returns {HTMLElement} 链接元素
         */
        addLink: function (linkOptions, parent, level) {
            var item = $e.fn.create('li');
            $e.fn.addClass(item, 'yc-anchor__item');

            var link = $e.fn.create('a');
            $e.fn.addClass(link, 'yc-anchor__link');
            $e.fn.addClass(link, 'yc-anchor__link--level-' + level);
            link.href = linkOptions.href || '#';
            link.innerHTML = linkOptions.title || '';

            item.appendChild(link);
            parent.appendChild(item);
            this.links.push(link);

            var self = this;
            this.bindListen($e.events.regEvent(link, 'click', this, function (e) {
                e.preventDefault();
                self.onLinkClick(e, linkOptions, link);
            }));

            if (linkOptions.children instanceof Array) {
                var subList = $e.fn.create('ul');
                $e.fn.addClass(subList, 'yc-anchor__list');
                item.appendChild(subList);

                for (var i = 0; i < linkOptions.children.length; i++) {
                    this.addLink(linkOptions.children[i], subList, level + 1);
                }
            }

            return link;
        },

        /**
         * 处理链接点击
         * @public
         * @param {Event} e 事件对象
         * @param {Object} options 链接配置
         * @param {HTMLElement} link 链接元素
         */
        onLinkClick: function (e, options, link) {
            var targetId = options.href ? options.href.replace('#', '') : '';

            if (targetId) {
                var target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }

            this.setActiveLink(link);

            if (this.props.onClick) {
                this.props.onClick(options, link);
            }
        },

        /**
         * 设置激活的链接
         * @public
         * @param {HTMLElement} activeLink 激活的链接元素
         */
        setActiveLink: function (activeLink) {
            for (var i = 0; i < this.links.length; i++) {
                $e.fn.removeClass(this.links[i], 'yc-anchor__link--active');
            }
            $e.fn.addClass(activeLink, 'yc-anchor__link--active');
        },

        /**
         * 绑定滚动监听
         * @public
         */
        bindScrollSpy: function () {
            var self = this;
            var container = this.props.container ? document.querySelector(this.props.container) : window;

            var onScroll = function () {
                self.onScroll();
            };

            if (container === window) {
                window.addEventListener('scroll', onScroll);
            } else {
                container.addEventListener('scroll', onScroll);
            }

            this._scrollListener = { container: container, handler: onScroll };
        },

        /**
         * 滚动处理
         * @public
         */
        onScroll: function () {
            var container = this._scrollListener.container;
            var scrollTop = container === window ? window.pageYOffset : container.scrollTop;
            var activeLink = null;

            for (var i = 0; i < this.links.length; i++) {
                var href = this.links[i].getAttribute('href');
                if (href && href.charAt(0) === '#') {
                    var targetId = href.substring(1);
                    var target = document.getElementById(targetId);

                    if (target) {
                        var offsetTop = target.offsetTop;
                        if (offsetTop <= scrollTop + 100) {
                            activeLink = this.links[i];
                        }
                    }
                }
            }

            if (activeLink) {
                this.setActiveLink(activeLink);
            }
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            if (this._scrollListener) {
                var container = this._scrollListener.container;
                var handler = this._scrollListener.handler;

                if (container === window) {
                    window.removeEventListener('scroll', handler);
                } else {
                    container.removeEventListener('scroll', handler);
                }

                this._scrollListener = null;
            }

            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }

            this._listeners = null;
            this.links = null;
            this._line = null;
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
         * 创建Anchor组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {AnchorView} Anchor实例
         */
        create: function (options) {
            return new AnchorView(options);
        }
    };

    $e.ui.addViewPlugin('view_anchor', plugin);
}($e);
