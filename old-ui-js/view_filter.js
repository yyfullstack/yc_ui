/**
 * @file 筛选器组件
 * @description 用于展示筛选条件和操作按钮，支持多种筛选类型和可折叠功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var filter = $e.ui.createView('view_filter', {
 *     collapsible: true,
 *     expanded: true,
 *     items: [
 *         { label: '用户名', name: 'username', type: 'text' },
 *         { label: '状态', name: 'status', type: 'select', options: [
 *             { value: '1', label: '启用' },
 *             { value: '0', label: '禁用' }
 *         ]}
 *     ],
 *     tags: [{ label: '已选条件' }]
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 筛选器组件构造函数
     * @class FilterView
     * @param {Object} options - 配置选项
     * @param {Array} [options.items=[]] - 筛选条件数组
     * @param {boolean} [options.collapsible=false] - 是否可折叠
     * @param {boolean} [options.expanded=true] - 是否展开
     * @param {Array} [options.tags=[]] - 标签数组
     */
    function FilterView(options) {
        this.props = options || {};
        this._items = this.props['items'] || [];
        this._collapsible = $e.fn.getBoolean(this.props['collapsible'], false);
        this._expanded = $e.fn.getBoolean(this.props['expanded'], true);
        this._tags = this.props['tags'] || [];
        this._itemHandles = [];
        this._actionHandles = [];
    }

    FilterView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_filter',
        shell: null,
        body: null,
        _items: null,
        _collapsible: false,
        _expanded: true,
        _tags: null,
        _itemHandles: null,
        _actionHandles: null,
        _bodyEl: null,
        _tagsEl: null,
        _toggleHandle: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-filter');
            if (this._collapsible) {
                $e.fn.addClass(this.shell, 'yc-filter--collapsible');
            }
            if (this._expanded) {
                $e.fn.addClass(this.shell, 'is-expanded');
            }
            this.render();
            this.inited();
        },

        /**
         * 渲染筛选器DOM结构
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            this._itemHandles = [];
            this._actionHandles = [];

            if (this._tags && this._tags.length > 0) {
                var tagsEl = document.createElement('div');
                $e.fn.addClass(tagsEl, 'yc-filter__tags');
                for (var t = 0; t < this._tags.length; t++) {
                    var tag = this.createTag(this._tags[t]);
                    tagsEl.appendChild(tag);
                }
                shell.appendChild(tagsEl);
                this._tagsEl = tagsEl;
            }

            var bodyEl = document.createElement('div');
            $e.fn.addClass(bodyEl, 'yc-filter__body');
            this._bodyEl = bodyEl;

            var items = this._items;
            for (var i = 0; i < items.length; i++) {
                var itemEl = this.createFilterItem(items[i]);
                bodyEl.appendChild(itemEl);
            }

            var actions = document.createElement('div');
            $e.fn.addClass(actions, 'yc-filter__actions');
            var _this = this;

            var searchBtn = document.createElement('button');
            searchBtn.innerText = '查询';
            searchBtn.type = 'button';
            actions.appendChild(searchBtn);

            var resetBtn = document.createElement('span');
            $e.fn.addClass(resetBtn, 'yc-filter__reset');
            resetBtn.innerText = '重置';
            actions.appendChild(resetBtn);

            bodyEl.appendChild(actions);

            var searchHandle = this.bindListen($e.events.regEvent(searchBtn, 'click', this, function () {
                _this.onSearch(_this.getValues());
            }));
            this._actionHandles.push(searchHandle);

            var resetHandle = this.bindListen($e.events.regEvent(resetBtn, 'click', this, function () {
                _this.reset();
            }));
            this._actionHandles.push(resetHandle);

            shell.appendChild(bodyEl);

            if (this._collapsible) {
                var toggle = document.createElement('button');
                $e.fn.addClass(toggle, 'yc-filter__toggle');
                toggle.innerHTML = '<i class="fa fa-chevron-down"></i> 展开筛选';
                shell.appendChild(toggle);

                this._toggleHandle = this.bindListen($e.events.regEvent(toggle, 'click', this, function () {
                    _this.toggleExpand();
                }));
            }
        },

        /**
         * 创建筛选标签
         * @private
         * @param {Object} tag - 标签配置
         * @returns {HTMLElement} 标签元素
         */
        createTag: function (tag) {
            var _this = this;
            var tagEl = document.createElement('span');
            $e.fn.addClass(tagEl, 'yc-filter__tag');
            tagEl.innerText = tag.label || '';

            var remove = document.createElement('i');
            $e.fn.addClass(remove, 'fa');
            $e.fn.addClass(remove, 'fa-close');
            $e.fn.addClass(remove, 'yc-filter__tag-remove');
            tagEl.appendChild(remove);

            var handle = this.bindListen($e.events.regEvent(remove, 'click', this, function () {
                _this.removeTag(tag);
            }));
            this._itemHandles.push(handle);

            return tagEl;
        },

        /**
         * 创建筛选条件项
         * @private
         * @param {Object} item - 条件配置
         * @returns {HTMLElement} 条件元素
         */
        createFilterItem: function (item) {
            var label = item.label || '';
            var type = item.type || 'text';
            var name = item.name || '';
            var value = item.value || '';

            var itemEl = document.createElement('div');
            $e.fn.addClass(itemEl, 'yc-filter__item');
            itemEl.setAttribute('data-name', name);

            var labelEl = document.createElement('label');
            $e.fn.addClass(labelEl, 'yc-filter__label');
            labelEl.innerText = label;
            itemEl.appendChild(labelEl);

            var inputEl;
            if (type === 'select') {
                inputEl = document.createElement('select');
                $e.fn.addClass(inputEl, 'yc-filter__select');
                var options = item.options || [];
                for (var i = 0; i < options.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = options[i].value;
                    opt.innerText = options[i].label;
                    if (options[i].value === value) {
                        opt.selected = true;
                    }
                    inputEl.appendChild(opt);
                }
            } else if (type === 'dateRange') {
                var rangeWrap = document.createElement('div');
                $e.fn.addClass(rangeWrap, 'yc-filter__date-range');
                var start = document.createElement('input');
                start.type = 'date';
                $e.fn.addClass(start, 'yc-filter__input');
                rangeWrap.appendChild(start);
                var sep = document.createElement('span');
                $e.fn.addClass(sep, 'yc-filter__date-separator');
                sep.innerText = '至';
                rangeWrap.appendChild(sep);
                var end = document.createElement('input');
                end.type = 'date';
                $e.fn.addClass(end, 'yc-filter__input');
                rangeWrap.appendChild(end);
                inputEl = rangeWrap;
            } else {
                inputEl = document.createElement('input');
                inputEl.type = type === 'number' ? 'number' : 'text';
                $e.fn.addClass(inputEl, 'yc-filter__input');
                inputEl.value = value;
            }

            if (inputEl) {
                inputEl.setAttribute('data-field', name);
                itemEl.appendChild(inputEl);
            }

            return itemEl;
        },

        /**
         * 切换展开/折叠状态
         * @public
         * @returns {void}
         */
        toggleExpand: function () {
            this._expanded = !this._expanded;
            if (this._expanded) {
                $e.fn.addClass(this.shell, 'is-expanded');
            } else {
                $e.fn.removeClass(this.shell, 'is-expanded');
            }
        },

        /**
         * 获取所有筛选值
         * @public
         * @returns {Object} 筛选值对象
         */
        getValues: function () {
            var values = {};
            var items = this._bodyEl.querySelectorAll('.yc-filter__item');
            for (var i = 0; i < items.length; i++) {
                var name = items[i].getAttribute('data-name');
                var input = items[i].querySelector('[data-field]');
                if (input) {
                    values[name] = input.value;
                }
            }
            return values;
        },

        /**
         * 重置筛选条件
         * @public
         * @returns {void}
         */
        reset: function () {
            var items = this._bodyEl.querySelectorAll('.yc-filter__item');
            for (var i = 0; i < items.length; i++) {
                var input = items[i].querySelector('input, select');
                if (input) {
                    input.value = '';
                }
            }
            this.onReset();
        },

        /**
         * 移除标签
         * @public
         * @param {Object} tag - 标签配置
         * @returns {void}
         */
        removeTag: function (tag) {
            var idx = -1;
            for (var i = 0; i < this._tags.length; i++) {
                if (this._tags[i].label === tag.label) {
                    idx = i;
                    break;
                }
            }
            if (idx >= 0) {
                this._tags.splice(idx, 1);
                this.render();
                this.onTagRemove(tag);
            }
        },

        /**
         * 设置筛选条件
         * @public
         * @param {Array} items - 条件数组
         * @returns {void}
         */
        setItems: function (items) {
            this._items = items || [];
            this.render();
        },

        /**
         * 获取筛选条件
         * @public
         * @returns {Array} 条件数组
         */
        getItems: function () {
            return this._items;
        },

        /**
         * 设置标签
         * @public
         * @param {Array} tags - 标签数组
         * @returns {void}
         */
        setTags: function (tags) {
            this._tags = tags || [];
            this.render();
        },

        /**
         * 获取标签
         * @public
         * @returns {Array} 标签数组
         */
        getTags: function () {
            return this._tags;
        },

        /**
         * 查询回调（子类可覆盖）
         * @public
         * @param {Object} values - 筛选值
         * @returns {void}
         */
        onSearch: function (values) {
            // 子类实现具体逻辑
        },

        /**
         * 重置回调（子类可覆盖）
         * @public
         * @returns {void}
         */
        onReset: function () {
            // 子类实现具体逻辑
        },

        /**
         * 标签移除回调（子类可覆盖）
         * @public
         * @param {Object} tag - 标签配置
         * @returns {void}
         */
        onTagRemove: function (tag) {
            // 子类实现具体逻辑
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
            if (this._actionHandles) {
                for (var j = 0; j < this._actionHandles.length; j++) {
                    if (this._actionHandles[j]) {
                        this._actionHandles[j].release();
                    }
                }
                this._actionHandles = null;
            }
            if (this._toggleHandle) {
                this._toggleHandle.release();
                this._toggleHandle = null;
            }
            this._bodyEl = null;
            this._tagsEl = null;
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
         * 创建筛选器组件实例
         * @param {Object} options - 组件配置
         * @returns {FilterView} 筛选器组件实例
         */
        create: function (options) {
            return new FilterView(options);
        }
    };
    $e.ui.addViewPlugin('view_filter', plugin);
}($e);