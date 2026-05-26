/**
 * @file 页面头部组件
 * @description 用于展示页面头部信息，支持标题、副标题、面包屑导航和操作按钮
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var pageHeader = $e.ui.createView('view_page_header', {
 *     title: '页面标题',
 *     subtitle: '副标题说明',
 *     showBack: true,
 *     breadcrumb: '<span>首页</span><span>当前页面</span>',
 *     extra: '<button>操作按钮</button>'
 * });
 */
+function ($e) {
    'use strict';

    /**
     * PageHeaderView 页面头部组件
     * 用于展示页面头部信息，支持标题、副标题、面包屑导航和操作按钮
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.title=''] - 页面标题
     * @param {string} [options.subtitle=''] - 页面副标题
     * @param {boolean} [options.showBack=true] - 是否显示返回按钮
     * @param {string} [options.backText=''] - 返回按钮文本
     * @param {string|Object} [options.breadcrumb=null] - 面包屑导航内容
     * @param {string|HTMLElement|Array} [options.extra=null] - 额外操作内容
     * @param {Function} [options.onBack] - 返回按钮点击回调
     */
    function PageHeaderView(options) {
        this.props = options;
        this._listeners = [];
    }

    PageHeaderView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_page_header',
        body: null,
        shell: null,
        _listeners: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildPageHeader();
            this.inited();
        },

        /**
         * 构建页面头部DOM结构
         * @private
         * @returns {void}
         */
        buildPageHeader: function () {
            var options = this.props;
            var title = options.title || '';
            var subtitle = options.subtitle || '';
            var showBack = options.showBack !== false;
            var backText = options.backText || '';
            var breadcrumb = options.breadcrumb || null;
            var extra = options.extra || null;

            $e.fn.addClass(this.shell, 'yc-page-header');

            if (showBack) {
                var back = $e.fn.create('div');
                $e.fn.addClass(back, 'yc-page-header__back');
                back.innerHTML = '<i class="yc-page-header__back-icon">&#8592;</i><span>' + (backText || '') + '</span>';

                var self = this;
                this.bindListen($e.events.regEvent(back, 'click', this, function (e) {
                    if (self.props.onBack) {
                        self.props.onBack(e);
                    }
                }));

                this.getBody().appendChild(back);
            }

            var content = $e.fn.create('div');
            $e.fn.addClass(content, 'yc-page-header__content');

            var main = $e.fn.create('div');
            $e.fn.addClass(main, 'yc-page-header__main');

            if (title) {
                var titleEl = $e.fn.create('h1');
                $e.fn.addClass(titleEl, 'yc-page-header__title');
                titleEl.innerHTML = title;
                main.appendChild(titleEl);
            }

            if (subtitle) {
                var subtitleEl = $e.fn.create('div');
                $e.fn.addClass(subtitleEl, 'yc-page-header__sub-title');
                subtitleEl.innerHTML = subtitle;
                main.appendChild(subtitleEl);
            }

            if (breadcrumb) {
                var breadcrumbEl = $e.fn.create('div');
                $e.fn.addClass(breadcrumbEl, 'yc-page-header__breadcrumb');
                if (typeof breadcrumb === 'string') {
                    breadcrumbEl.innerHTML = breadcrumb;
                } else if (breadcrumb.getShell) {
                    breadcrumbEl.appendChild(breadcrumb.getShell());
                }
                main.insertBefore(breadcrumbEl, main.firstChild);
            }

            content.appendChild(main);

            if (extra) {
                var actions = $e.fn.create('div');
                $e.fn.addClass(actions, 'yc-page-header__actions');

                if (extra instanceof Array) {
                    for (var i = 0; i < extra.length; i++) {
                        actions.appendChild(extra[i]);
                    }
                } else if (typeof extra === 'string') {
                    actions.innerHTML = extra;
                } else if (extra.getShell) {
                    actions.appendChild(extra.getShell());
                }

                content.appendChild(actions);
            }

            this.getBody().appendChild(content);
        },

        /**
         * 设置标题
         * @public
         * @param {string} title - 标题文本
         * @returns {void}
         */
        setTitle: function (title) {
            var titleEl = this.shell.querySelector('.yc-page-header__title');
            if (titleEl) {
                titleEl.innerHTML = title;
            }
        },

        /**
         * 设置副标题
         * @public
         * @param {string} subtitle - 副标题文本
         * @returns {void}
         */
        setSubtitle: function (subtitle) {
            var subtitleEl = this.shell.querySelector('.yc-page-header__sub-title');
            if (subtitleEl) {
                subtitleEl.innerHTML = subtitle;
            }
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this.body = null;
        },

        /**
         * 调整组件尺寸
         * @public
         * @param {Object} [options] - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建页面头部组件实例
         * @param {Object} options - 组件配置
         * @returns {PageHeaderView} 页面头部组件实例
         */
        create: function (options) {
            return new PageHeaderView(options);
        }
    };
    $e.ui.addViewPlugin("view_page_header", plugin);
}($e);