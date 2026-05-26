/**
 * @file 标签组件
 * @description 提供标签展示、添加、删除功能，支持自定义样式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * TagsView 标签组件
     * @class
     * @param {Object} options - 配置选项
     * @param {Array} [options.tags=[]] - 标签数据数组
     * @param {boolean} [options.closable=true] - 标签是否可关闭
     * @param {boolean} [options.showAdd=true] - 是否显示添加按钮
     * @param {Function} [options.onAdd] - 添加标签回调
     * @param {Function} [options.onRemove] - 删除标签回调
     */
    function TagsView(options) {
        this.props = options || {};
        this._tags = this.props['tags'] || [];
        this._closable = $e.fn.getBoolean(this.props['closable'], true);
        this._showAdd = $e.fn.getBoolean(this.props['showAdd'], true);
        this._onAdd = this.props['onAdd'] || null;
        this._onRemove = this.props['onRemove'] || null;
        this.data = [];
        this.addBtn = null;
        this._addHandle = null;
    }

    TagsView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_tags',
        shell: null,
        body: null,
        _tags: [],
        _closable: true,
        _showAdd: true,
        _onAdd: null,
        _onRemove: null,
        data: null,
        addBtn: null,
        _addHandle: null,

        init: function () {
            this.body = this.shell.querySelector('[view-band="body"]') || this.shell;
            this.render();
            this.inited();
        },

        /**
         * 渲染标签列表
         * @param {Array} data - 标签数据数组
         * @returns {HTMLElement} 外壳元素
         */
        render: function (data) {
            var shell = this.shell;
            if (!shell) {
                shell = document.createElement('div');
                shell.classList.add('yc-tag-wrap');
                this.shell = shell;
            }
            shell.innerHTML = '';
            this.data = data || this.data || [];
            var tags = this.drawTags(this.data);
            for (var i = 0, len = tags.length; i < len; i++) {
                shell.appendChild(tags[i]);
            }
            if (this._showAdd) {
                this.addBtn = document.createElement('span');
                this.addBtn.classList.add('yc-tag-add');
                this.addBtn.textContent = '添加标签';
                this._addHandle = this.bindListen(
                    $e.events.regEvent(this.addBtn, 'click', this, this.addClickHandle)
                );
                shell.appendChild(this.addBtn);
            }
            return shell;
        },

        drawTags: function (data) {
            var self = this;
            if (data.length <= 0) {
                return [];
            }
            var tags = [];
            data.forEach(function (item) {
                var tagEl = document.createElement('span');
                tagEl.classList.add('yc-tag');
                tagEl.textContent = item.label;
                if (self._closable) {
                    var closeBtn = document.createElement('i');
                    closeBtn.classList.add('fa', 'fa-close', 'yc-tag-close');
                    self.bindListen(
                        $e.events.regEvent(closeBtn, 'click', self, function () {
                            self.removeTag(item);
                        })
                    );
                    tagEl.appendChild(closeBtn);
                }
                tagEl.dataset.value = item.value;
                tags.push(tagEl);
            });
            return tags;
        },

        addClickHandle: function () {
            if (this._onAdd) {
                this._onAdd();
            }
        },

        /**
         * 移除标签
         * @param {Object} item - 标签项
         */
        removeTag: function (item) {
            var index = this.data.findIndex(function (tag) {
                return tag.value === item.value;
            });
            if (index > -1) {
                this.data.splice(index, 1);
                this.render();
                if (this._onRemove) {
                    this._onRemove(item);
                }
            }
        },

        /**
         * 添加标签
         * @param {Object} tag - 标签对象
         */
        addTag: function (tag) {
            this.data.push(tag);
            this.render();
        },

        /**
         * 获取所有标签
         * @returns {Array} 标签数组
         */
        getTags: function () {
            return this.data;
        },

        /**
         * 设置标签
         * @param {Array} tags - 标签数组
         */
        setTags: function (tags) {
            this.data = tags;
            this.render();
        },

        release: function () {
            if (this._addHandle) {
                this.unBindListen(this._addHandle);
                this._addHandle = null;
            }
            this.addBtn = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new TagsView(options);
        }
    };

    $e.ui.addViewPlugin('view_tags', plugin);
}($e);