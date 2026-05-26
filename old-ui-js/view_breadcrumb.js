/**
 * @file Breadcrumb面包屑组件
 * @description 提供面包屑导航功能，支持自定义分隔符和对齐方式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * BreadcrumbView 面包屑导航组件
     * 用于展示当前页面在系统层级结构中的位置
     * @class
     * @param {Object} options 配置项
     * @param {Array} [options.items] 导航项数组
     * @param {string} [options.separator='slash'] 分隔符类型: slash/arrow/dot
     * @param {string} [options.align='start'] 对齐方式: start/center/end
     * @param {string} [options.size='default'] 尺寸: default/small/large
     * @param {Function} [options.onClick] 点击回调
     */
    function BreadcrumbView(options) {
        this.props = options;
        /** @type {Array} 导航项元素数组 */
        this.items = [];
        /** @type {Array} 事件监听器数组 */
        this._listeners = [];
    }

    BreadcrumbView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_breadcrumb',
        body: null,
        shell: null,
        items: null,
        _listeners: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildBreadcrumb();
            this.inited();
        },

        /**
         * 构建面包屑组件结构
         * @public
         */
        buildBreadcrumb: function () {
            var options = this.props;
            var separator = options.separator || 'slash';
            var align = options.align || 'start';
            var size = options.size || 'default';

            $e.fn.addClass(this.shell, 'yc-breadcrumb');
            $e.fn.addClass(this.shell, 'yc-breadcrumb--' + separator);

            if (align !== 'start') {
                $e.fn.addClass(this.shell, 'yc-breadcrumb--' + align);
            }

            if (size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-breadcrumb--' + size);
            }

            if (options.items instanceof Array) {
                for (var i = 0; i < options.items.length; i++) {
                    this.addItem(options.items[i]);
                }
            }
        },

        /**
         * 添加导航项
         * @public
         * @param {Object} itemOptions 导航项配置
         * @returns {HTMLElement} 导航项元素
         */
        addItem: function (itemOptions) {
            var item = $e.fn.create('span');
            $e.fn.addClass(item, 'yc-breadcrumb__item');

            var isLast = this.items.length === this.props.items.length - 1;

            if (itemOptions.href && !isLast) {
                var link = $e.fn.create('a');
                $e.fn.addClass(link, 'yc-breadcrumb__link');
                link.href = itemOptions.href;
                link.innerHTML = itemOptions.title || '';
                item.appendChild(link);

                var self = this;
                this.bindListen($e.events.regEvent(link, 'click', this, function (e) {
                    if (self.props.onClick) {
                        self.props.onClick(itemOptions, e);
                    }
                }));
            } else {
                var current = $e.fn.create('span');
                $e.fn.addClass(current, 'yc-breadcrumb__current');
                current.innerHTML = itemOptions.title || '';
                item.appendChild(current);
            }

            if (this.items.length > 0) {
                var separator = $e.fn.create('span');
                $e.fn.addClass(separator, 'yc-breadcrumb__separator');
                item.insertBefore(separator, item.firstChild);
            }

            this.getBody().appendChild(item);
            this.items.push(item);

            return item;
        },

        /**
         * 移除导航项
         * @public
         * @param {number} index 索引
         */
        removeItem: function (index) {
            if (index >= 0 && index < this.items.length) {
                this.getBody().removeChild(this.items[index]);
                this.items.splice(index, 1);
            }
        },

        /**
         * 获取导航项
         * @public
         * @param {number} index 索引
         * @returns {HTMLElement} 导航项元素
         */
        getItem: function (index) {
            return this.items[index];
        },

        /**
         * 设置导航项数组
         * @public
         * @param {Array} items 导航项数组
         */
        setItems: function (items) {
            this.clearItems();
            for (var i = 0; i < items.length; i++) {
                this.addItem(items[i]);
            }
        },

        /**
         * 清空所有导航项
         * @public
         */
        clearItems: function () {
            for (var i = this.items.length - 1; i >= 0; i--) {
                this.getBody().removeChild(this.items[i]);
            }
            this.items = [];
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
            this.items = null;
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
         * 创建Breadcrumb组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {BreadcrumbView} Breadcrumb实例
         */
        create: function (options) {
            return new BreadcrumbView(options);
        }
    };

    $e.ui.addViewPlugin('view_breadcrumb', plugin);
}($e);
