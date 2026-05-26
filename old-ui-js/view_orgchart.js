/**
 * @file 组织结构图组件
 * @description 提供组织结构图展示功能，支持展开/折叠、点击事件等操作
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * OrgChartView 组织结构图组件
     * 提供组织结构图展示功能，支持展开/折叠、点击事件等操作
     * @class
     * @param {Object} options - 配置选项
     * @param {Object} [options.data] - 组织结构数据
     * @param {string} [options.direction='vertical'] - 布局方向：vertical/horizontal
     * @param {Function} [options.onNodeClick] - 节点点击回调
     */
    function OrgChartView(options) {
        this.props = options;
        this.nodes = [];
        this._listeners = [];
        this._collapsed = {};
    }

    OrgChartView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_orgchart',
        body: null,
        shell: null,
        nodes: null,
        _listeners: null,
        _collapsed: null,
        _container: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildOrgChart();
            this.inited();
        },

        /**
         * 构建组织结构图
         * @private
         * @returns {void}
         */
        buildOrgChart: function () {
            var options = this.props;
            var direction = options.direction || 'vertical';
            $e.fn.addClass(this.shell, 'yc-orgchart');
            $e.fn.addClass(this.shell, 'yc-orgchart--' + direction);
            this._container = $e.fn.create('div');
            $e.fn.addClass(this._container, 'yc-orgchart__container');
            this.getBody().appendChild(this._container);
            if (options.data) {
                this.renderNode(options.data, this._container, 0);
            }
            this.updateLines();
        },

        /**
         * 渲染节点
         * @private
         * @param {Object} nodeData - 节点数据
         * @param {HTMLElement} parent - 父元素
         * @param {number} level - 层级
         * @returns {HTMLElement} 节点包装元素
         */
        renderNode: function (nodeData, parent, level) {
            var nodeWrapper = $e.fn.create('div');
            $e.fn.addClass(nodeWrapper, 'yc-orgchart__node-wrapper');
            var node = $e.fn.create('div');
            $e.fn.addClass(node, 'yc-orgchart__node');
            if (nodeData.type) {
                $e.fn.addClass(node, 'yc-orgchart__node--' + nodeData.type);
            }
            if (nodeData.active) {
                $e.fn.addClass(node, 'is-active');
            }
            var content = $e.fn.create('div');
            $e.fn.addClass(content, 'yc-orgchart__node-content');
            if (nodeData.avatar) {
                var avatar = $e.fn.create('img');
                $e.fn.addClass(avatar, 'yc-orgchart__node-avatar');
                avatar.src = nodeData.avatar;
                content.appendChild(avatar);
            }
            var info = $e.fn.create('div');
            $e.fn.addClass(info, 'yc-orgchart__node-info');
            var title = $e.fn.create('div');
            $e.fn.addClass(title, 'yc-orgchart__node-title');
            title.innerHTML = nodeData.title || '';
            info.appendChild(title);
            if (nodeData.subtitle) {
                var subtitle = $e.fn.create('div');
                $e.fn.addClass(subtitle, 'yc-orgchart__node-subtitle');
                subtitle.innerHTML = nodeData.subtitle;
                info.appendChild(subtitle);
            }
            content.appendChild(info);
            node.appendChild(content);
            if (nodeData.children && nodeData.children.length > 0) {
                var expandBtn = $e.fn.create('span');
                $e.fn.addClass(expandBtn, 'yc-orgchart__expand-btn');
                expandBtn.innerHTML = this._collapsed[nodeData.id] ? '+' : '-';
                var self = this;
                this.bindListen($e.events.regEvent(expandBtn, 'click', this, function (e) {
                    e.stopPropagation();
                    self.toggleNode(nodeData.id);
                }));
                node.appendChild(expandBtn);
            }
            var self = this;
            this.bindListen($e.events.regEvent(node, 'click', this, function (e) {
                if (self.props.onNodeClick) {
                    self.props.onNodeClick(nodeData, node);
                }
            }));
            nodeWrapper.appendChild(node);
            if (nodeData.children && nodeData.children.length > 0 && !this._collapsed[nodeData.id]) {
                var childrenContainer = $e.fn.create('div');
                $e.fn.addClass(childrenContainer, 'yc-orgchart__children');
                for (var i = 0; i < nodeData.children.length; i++) {
                    this.renderNode(nodeData.children[i], childrenContainer, level + 1);
                }
                nodeWrapper.appendChild(childrenContainer);
            }
            parent.appendChild(nodeWrapper);
            this.nodes.push({ el: node, data: nodeData, level: level });
            return nodeWrapper;
        },

        /**
         * 切换节点展开/折叠状态
         * @public
         * @param {string} nodeId - 节点ID
         * @returns {void}
         */
        toggleNode: function (nodeId) {
            if (this._collapsed[nodeId]) {
                delete this._collapsed[nodeId];
            } else {
                this._collapsed[nodeId] = true;
            }
            this.refresh();
        },

        /**
         * 展开所有节点
         * @public
         * @returns {void}
         */
        expandAll: function () {
            this._collapsed = {};
            this.refresh();
        },

        /**
         * 折叠所有节点
         * @public
         * @returns {void}
         */
        collapseAll: function () {
            for (var i = 0; i < this.nodes.length; i++) {
                var nodeData = this.nodes[i].data;
                if (nodeData.children && nodeData.children.length > 0) {
                    this._collapsed[nodeData.id] = true;
                }
            }
            this.refresh();
        },

        /**
         * 展开到指定层级
         * @public
         * @param {number} level - 层级
         * @returns {void}
         */
        expandToLevel: function (level) {
            for (var i = 0; i < this.nodes.length; i++) {
                var nodeData = this.nodes[i].data;
                if (nodeData.children && nodeData.children.length > 0) {
                    if (this.nodes[i].level >= level) {
                        this._collapsed[nodeData.id] = true;
                    } else {
                        delete this._collapsed[nodeData.id];
                    }
                }
            }
            this.refresh();
        },

        /**
         * 刷新图表
         * @private
         * @returns {void}
         */
        refresh: function () {
            this._container.innerHTML = '';
            this.nodes = [];
            if (this.props.data) {
                this.renderNode(this.props.data, this._container, 0);
            }
            this.updateLines();
        },

        /**
         * 更新连接线
         * @private
         * @returns {void}
         */
        updateLines: function () {
            var lines = this.shell.querySelectorAll('.yc-orgchart__line');
            for (var i = 0; i < lines.length; i++) {
                lines[i].parentNode.removeChild(lines[i]);
            }
        },

        /**
         * 设置数据
         * @public
         * @param {Object} data - 组织结构数据
         * @returns {void}
         */
        setData: function (data) {
            this.props.data = data;
            this.refresh();
        },

        /**
         * 获取body元素
         * @protected
         * @returns {HTMLElement} body元素
         */
        getBody: function () {
            return this.body;
        },

        /**
         * 释放资源
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
            this.nodes = null;
            this._collapsed = null;
            this._container = null;
            this.body = null;
        },

        /**
         * 调整大小
         * @public
         * @param {Object} options - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {}
    };

    var plugin = {
        create: function (options) {
            return new OrgChartView(options);
        }
    };

    $e.ui.addViewPlugin('view_orgchart', plugin);
}($e);