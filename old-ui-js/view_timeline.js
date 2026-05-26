+function ($e) {
    /**
     * TimelineView 时间线组件
     * 用于展示按时间顺序排列的事件节点，支持自定义节点样式和时间戳
     * @param {Object} options 配置项
     */
    function TimelineView(options) {
        this.props = options || {};
        this._items = this.props['items'] || [];
        this._pending = $e.fn.getBoolean(this.props['pending'], false);
        this._mode = this.props['mode'] || 'left';
    }

    TimelineView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_timeline',
        shell: null,
        body: null,
        _items: [],
        _pending: false,
        _mode: 'left',
        _itemEls: [],

        /**
         * 初始化组件
         * 设置body区域并渲染时间线内容
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'time-line');
            this.render();
            this.inited();
        },

        /**
         * 渲染Timeline组件DOM结构
         * 构建所有时间线节点和内容
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            this._itemEls = [];

            for (var i = 0; i < this._items.length; i++) {
                var item = this._items[i];
                var itemEl = this.createItem(item, i);
                shell.appendChild(itemEl);
                this._itemEls.push(itemEl);
            }

            if (this._pending) {
                var pendingEl = document.createElement('li');
                $e.fn.addClass(pendingEl, 'time-line-item');
                $e.fn.addClass(pendingEl, 'time-line-item-pending');
                pendingEl.style.borderLeftColor = 'var(--yc-border-color-split)';

                var pendingDot = document.createElement('span');
                $e.fn.addClass(pendingDot, 'time-line-item-dot');
                pendingDot.style.background = 'var(--yc-border-color-base)';
                pendingDot.style.left = '-5px';
                pendingDot.style.top = '4px';
                pendingDot.style.position = 'absolute';
                pendingDot.style.width = '8px';
                pendingDot.style.height = '8px';
                pendingDot.style.borderRadius = '50%';
                pendingDot.style.border = '2px solid var(--yc-bg-color)';
                pendingEl.appendChild(pendingDot);

                var pendingContent = document.createElement('div');
                $e.fn.addClass(pendingContent, 'time-line-item-content');
                pendingContent.innerHTML = this._pending === true ? '待定' : this._pending;
                pendingEl.appendChild(pendingContent);

                shell.appendChild(pendingEl);
            }
        },

        /**
         * 创建单个时间线节点
         * @param {Object} item 时间线项配置
         * @param {number} index 索引
         * @returns {HTMLElement} 时间线节点元素
         */
        createItem: function (item, index) {
            var itemEl = document.createElement('li');
            $e.fn.addClass(itemEl, 'time-line-item');

            var color = item['color'] || 'var(--yc-border-color-base)';
            if (item['status']) {
                var statusColors = {
                    'success': 'var(--yc-success-color)',
                    'warning': 'var(--yc-warning-color)',
                    'error': 'var(--yc-error-color)',
                    'primary': 'var(--yc-primary-color)'
                };
                color = statusColors[item['status']] || color;
            }

            var dot = document.createElement('span');
            $e.fn.addClass(dot, 'time-line-item-dot');
            dot.style.background = color;
            dot.style.left = '-5px';
            dot.style.top = '4px';
            dot.style.position = 'absolute';
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.border = '2px solid var(--yc-bg-color)';
            itemEl.appendChild(dot);

            if (item['status'] === 'primary' || item['status'] === 'success' || item['status'] === 'error' || item['status'] === 'warning') {
                itemEl.classList.add('active');
            }

            var content = document.createElement('div');
            $e.fn.addClass(content, 'time-line-item-content');

            if (item['title']) {
                var titleEl = document.createElement('div');
                titleEl.style.fontWeight = '500';
                titleEl.style.color = 'var(--yc-text-color)';
                titleEl.style.marginBottom = '4px';
                titleEl.innerHTML = item['title'];
                content.appendChild(titleEl);
            }

            if (item['content']) {
                var contentEl = document.createElement('div');
                contentEl.style.color = 'var(--yc-text-color-secondary)';
                contentEl.style.lineHeight = 'var(--yc-line-height-base)';
                contentEl.innerHTML = item['content'];
                content.appendChild(contentEl);
            }

            if (item['time']) {
                var timeEl = document.createElement('div');
                $e.fn.addClass(timeEl, 'time-line-item-time');
                timeEl.innerHTML = item['time'];
                content.appendChild(timeEl);
            }

            if (item['custom']) {
                if (typeof item['custom'] === 'string') {
                    content.innerHTML += item['custom'];
                } else if (item['custom'] instanceof HTMLElement) {
                    content.appendChild(item['custom']);
                }
            }

            itemEl.appendChild(content);
            return itemEl;
        },

        /**
         * 添加时间线项
         * @param {Object} item 时间线项配置
         */
        addItem: function (item) {
            this._items.push(item);
            var itemEl = this.createItem(item, this._items.length - 1);
            this.shell.appendChild(itemEl);
            this._itemEls.push(itemEl);
        },

        /**
         * 插入时间线项
         * @param {number} index 插入位置索引
         * @param {Object} item 时间线项配置
         */
        insertItem: function (index, item) {
            this._items.splice(index, 0, item);
            var itemEl = this.createItem(item, index);
            if (index < this._itemEls.length) {
                this.shell.insertBefore(itemEl, this._itemEls[index]);
            } else {
                this.shell.appendChild(itemEl);
            }
            this._itemEls.splice(index, 0, itemEl);
            this.updateIndices();
        },

        /**
         * 移除时间线项
         * @param {number} index 移除位置索引
         */
        removeItem: function (index) {
            if (index >= 0 && index < this._items.length) {
                this._items.splice(index, 1);
                if (this._itemEls[index]) {
                    this.shell.removeChild(this._itemEls[index]);
                    this._itemEls.splice(index, 1);
                }
                this.updateIndices();
            }
        },

        /**
         * 更新所有节点索引
         */
        updateIndices: function () {
            for (var i = 0; i < this._itemEls.length; i++) {
                if (i === this._itemEls.length - 1) {
                    this._itemEls[i].style.borderLeftColor = 'transparent';
                } else {
                    this._itemEls[i].style.borderLeftColor = '';
                }
            }
        },

        /**
         * 设置时间线项数组
         * @param {Array} items 时间线项数组
         */
        setItems: function (items) {
            this._items = items || [];
            this.render();
        },

        /**
         * 获取时间线项数组
         * @returns {Array} 时间线项数组
         */
        getItems: function () {
            return this._items;
        },

        /**
         * 设置待定状态
         * @param {boolean|string} pending 待定状态（true/false或文字）
         */
        setPending: function (pending) {
            this._pending = pending;
            this.render();
        },

        /**
         * 获取待定状态
         * @returns {boolean|string} 待定状态
         */
        getPending: function () {
            return this._pending;
        },

        /**
         * 释放组件资源
         */
        selfRelease: function () {
            this._itemEls = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new TimelineView(options);
        }
    };
    $e.ui.addViewPlugin("view_timeline", plugin);
}($e);
