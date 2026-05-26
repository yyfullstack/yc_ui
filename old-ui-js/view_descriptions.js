/**
 * @file 描述列表组件
 * @description 用于展示键值对数据，支持响应式列布局和边框样式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var descriptions = $e.ui.createView('view_descriptions', {
 *     title: '用户信息',
 *     column: 3,
 *     border: true,
 *     size: 'small',
 *     items: [
 *         { label: '姓名', content: '张三' },
 *         { label: '年龄', content: '28' },
 *         { label: '性别', content: '男' }
 *     ]
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 描述列表组件构造函数
     * @class DescriptionsView
     * @param {Object} options - 配置选项
     * @param {string} [options.title=''] - 标题文本
     * @param {number} [options.column=3] - 列数
     * @param {boolean} [options.border=false] - 是否显示边框
     * @param {string} [options.size='default'] - 尺寸：default/small/large
     * @param {Array} [options.items=[]] - 描述项数组
     */
    function DescriptionsView(options) {
        this.props = options || {};
        this._title = this.props['title'] || '';
        this._column = this.props['column'] || 3;
        this._border = $e.fn.getBoolean(this.props['border'], false);
        this._size = this.props['size'] || 'default';
        this._items = this.props['items'] || [];
        this._itemHandles = [];
    }

    DescriptionsView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_descriptions',
        shell: null,
        body: null,
        _title: '',
        _column: 3,
        _border: false,
        _size: 'default',
        _items: null,
        _itemHandles: null,
        _tableEl: null,
        _titleEl: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-descriptions');
            if (this._border) {
                $e.fn.addClass(this.shell, 'yc-descriptions--border');
            }
            if (this._size && this._size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-descriptions--' + this._size);
            }
            this.render();
            this.inited();
        },

        /**
         * 渲染描述列表DOM结构
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';

            if (this._title) {
                var titleEl = document.createElement('div');
                $e.fn.addClass(titleEl, 'yc-descriptions__title');
                titleEl.innerHTML = this._title;
                this._titleEl = titleEl;
                shell.appendChild(titleEl);
            }

            var table = document.createElement('table');
            $e.fn.addClass(table, 'yc-descriptions__table');
            this._tableEl = table;

            var items = this._items;
            var column = this._column;
            var rowCount = Math.ceil(items.length / column);

            for (var r = 0; r < rowCount; r++) {
                var tr = document.createElement('tr');
                for (var c = 0; c < column; c++) {
                    var idx = r * column + c;
                    if (idx < items.length) {
                        var item = items[idx];
                        var labelTd = document.createElement('th');
                        $e.fn.addClass(labelTd, 'yc-descriptions__label');
                        labelTd.innerHTML = item.label || '';
                        tr.appendChild(labelTd);

                        var contentTd = document.createElement('td');
                        $e.fn.addClass(contentTd, 'yc-descriptions__content');
                        contentTd.innerHTML = item.content || '';
                        tr.appendChild(contentTd);
                    }
                }
                table.appendChild(tr);
            }

            shell.appendChild(table);
        },

        /**
         * 设置标题
         * @public
         * @param {string} title - 标题文本
         * @returns {void}
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
         * @public
         * @returns {string} 标题文本
         */
        getTitle: function () {
            return this._title;
        },

        /**
         * 设置列数
         * @public
         * @param {number} column - 列数
         * @returns {void}
         */
        setColumn: function (column) {
            if (this._column !== column) {
                this._column = column;
                this.render();
            }
        },

        /**
         * 获取列数
         * @public
         * @returns {number} 列数
         */
        getColumn: function () {
            return this._column;
        },

        /**
         * 设置是否显示边框
         * @public
         * @param {boolean} border - 是否显示边框
         * @returns {void}
         */
        setBorder: function (border) {
            this._border = border;
            if (border) {
                $e.fn.addClass(this.shell, 'yc-descriptions--border');
            } else {
                $e.fn.removeClass(this.shell, 'yc-descriptions--border');
            }
        },

        /**
         * 获取是否显示边框
         * @public
         * @returns {boolean} 是否显示边框
         */
        getBorder: function () {
            return this._border;
        },

        /**
         * 设置数据项
         * @public
         * @param {Array} items - 描述项数组 {label, content}
         * @returns {void}
         */
        setItems: function (items) {
            this._items = items || [];
            this.render();
        },

        /**
         * 获取数据项
         * @public
         * @returns {Array} 描述项数组
         */
        getItems: function () {
            return this._items;
        },

        /**
         * 添加描述项
         * @public
         * @param {Object} item - 描述项 {label, content}
         * @returns {void}
         */
        addItem: function (item) {
            this._items.push(item);
            this.render();
        },

        /**
         * 移除描述项
         * @public
         * @param {number} index - 索引
         * @returns {void}
         */
        removeItem: function (index) {
            if (index >= 0 && index < this._items.length) {
                this._items.splice(index, 1);
                this.render();
            }
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            if (this._itemHandles) {
                for (var i = 0; i < this._itemHandles.length; i++) {
                    if (this._itemHandles[i]) {
                        this._itemHandles[i].release();
                    }
                }
                this._itemHandles = null;
            }
            this._tableEl = null;
            this._titleEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建描述列表组件实例
         * @param {Object} options - 组件配置
         * @returns {DescriptionsView} 描述列表组件实例
         */
        create: function (options) {
            return new DescriptionsView(options);
        }
    };
    $e.ui.addViewPlugin('view_descriptions', plugin);
}($e);