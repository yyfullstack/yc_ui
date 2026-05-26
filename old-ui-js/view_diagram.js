/**
 * @file 流程图组件
 * @description 提供流程图编辑功能，支持节点添加、删除、拖拽、缩放等操作
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * DiagramView 流程图组件
     * 提供流程图编辑功能，支持节点添加、删除、拖拽、缩放等操作
     * @class
     * @param {Object} options - 配置选项
     * @param {Array} [options.nodes=[]] - 节点数组
     * @param {Array} [options.edges=[]] - 连接线数组
     * @param {Function} [options.onNodeSelect] - 节点选中回调
     */
    function DiagramView(options) {
        this.props = options;
        this.nodes = [];
        this.edges = [];
        this._listeners = [];
        this._selectedNode = null;
        this._zoom = 1;
    }

    DiagramView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_diagram',
        body: null,
        shell: null,
        nodes: null,
        edges: null,
        _listeners: null,
        _selectedNode: null,
        _zoom: 1,
        _canvas: null,
        _svg: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDiagram();
            this.inited();
        },

        /**
         * 构建流程图
         * @private
         * @returns {void}
         */
        buildDiagram: function () {
            var options = this.props;
            $e.fn.addClass(this.shell, 'yc-diagram');
            var wrapper = $e.fn.create('div');
            $e.fn.addClass(wrapper, 'yc-diagram__wrapper');
            var toolbar = $e.fn.create('div');
            $e.fn.addClass(toolbar, 'yc-diagram__toolbar');
            var groups = [
                { title: '基本', items: ['start', 'process', 'decision', 'end'] },
                { title: '操作', items: ['zoom-in', 'zoom-out', 'fit'] }
            ];
            for (var g = 0; g < groups.length; g++) {
                var group = $e.fn.create('div');
                $e.fn.addClass(group, 'yc-diagram__toolbar-group');
                for (var i = 0; i < groups[g].items.length; i++) {
                    var btn = $e.fn.create('button');
                    $e.fn.addClass(btn, 'yc-diagram__toolbar-btn');
                    btn.innerHTML = groups[g].items[i];
                    btn.setAttribute('data-action', groups[g].items[i]);
                    var self = this;
                    this.bindListen($e.events.regEvent(btn, 'click', this, function (e) {
                        self.onToolbarClick(e.target.getAttribute('data-action'));
                    }));
                    group.appendChild(btn);
                }
                toolbar.appendChild(group);
            }
            wrapper.appendChild(toolbar);
            var sidebar = $e.fn.create('div');
            $e.fn.addClass(sidebar, 'yc-diagram__sidebar');
            var sidebarHeader = $e.fn.create('div');
            $e.fn.addClass(sidebarHeader, 'yc-diagram__sidebar-header');
            sidebarHeader.innerHTML = '<span class="yc-diagram__sidebar-title">组件库</span>';
            sidebar.appendChild(sidebarHeader);
            var palette = $e.fn.create('div');
            $e.fn.addClass(palette, 'yc-diagram__palette');
            var paletteItems = [
                { type: 'start', label: '开始', icon: '&#9679;' },
                { type: 'process', label: '流程', icon: '&#9634;' },
                { type: 'decision', label: '判断', icon: '&#9670;' },
                { type: 'end', label: '结束', icon: '&#9632;' }
            ];
            for (var i = 0; i < paletteItems.length; i++) {
                var item = $e.fn.create('div');
                $e.fn.addClass(item, 'yc-diagram__palette-item');
                $e.fn.addClass(item, 'yc-diagram__palette-item--' + paletteItems[i].type);
                item.innerHTML = '<i>' + paletteItems[i].icon + '</i><span>' + paletteItems[i].label + '</span>';
                item.setAttribute('data-type', paletteItems[i].type);
                var self = this;
                this.bindListen($e.events.regEvent(item, 'mousedown', this, function (e) {
                    self.onPaletteDragStart(e, e.currentTarget.getAttribute('data-type'));
                }));
                palette.appendChild(item);
            }
            sidebar.appendChild(palette);
            wrapper.appendChild(sidebar);
            var canvasContainer = $e.fn.create('div');
            $e.fn.addClass(canvasContainer, 'yc-diagram__canvas-container');
            this._canvas = $e.fn.create('div');
            $e.fn.addClass(this._canvas, 'yc-diagram__canvas');
            this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._svg.setAttribute('width', '2000');
            this._svg.setAttribute('height', '2000');
            this._canvas.appendChild(this._svg);
            canvasContainer.appendChild(this._canvas);
            wrapper.appendChild(canvasContainer);
            this.getBody().appendChild(wrapper);
            if (options.nodes instanceof Array) {
                for (var i = 0; i < options.nodes.length; i++) {
                    this.addNode(options.nodes[i]);
                }
            }
            if (options.edges instanceof Array) {
                for (var i = 0; i < options.edges.length; i++) {
                    this.addEdge(options.edges[i]);
                }
            }
        },

        /**
         * 添加节点
         * @public
         * @param {Object} nodeOptions - 节点配置
         * @returns {HTMLElement} 节点元素
         */
        addNode: function (nodeOptions) {
            var node = $e.fn.create('div');
            $e.fn.addClass(node, 'yc-diagram__node');
            $e.fn.addClass(node, 'yc-diagram__node--' + (nodeOptions.type || 'process'));
            node.style.left = (nodeOptions.x || 100) + 'px';
            node.style.top = (nodeOptions.y || 100) + 'px';
            var title = $e.fn.create('div');
            $e.fn.addClass(title, 'yc-diagram__node-title');
            title.innerHTML = nodeOptions.title || '';
            node.appendChild(title);
            var content = $e.fn.create('div');
            $e.fn.addClass(content, 'yc-diagram__node-content');
            content.innerHTML = nodeOptions.content || '';
            node.appendChild(content);
            var ports = $e.fn.create('div');
            $e.fn.addClass(ports, 'yc-diagram__node-ports');
            var positions = ['top', 'right', 'bottom', 'left'];
            for (var i = 0; i < positions.length; i++) {
                var port = $e.fn.create('div');
                $e.fn.addClass(port, 'yc-diagram__node-port');
                $e.fn.addClass(port, 'yc-diagram__node-port--' + positions[i]);
                ports.appendChild(port);
            }
            node.appendChild(ports);
            this._canvas.appendChild(node);
            this.nodes.push({ el: node, data: nodeOptions });
            var self = this;
            this.bindListen($e.events.regEvent(node, 'mousedown', this, function (e) {
                self.onNodeMouseDown(e, node);
            }));
            this.bindListen($e.events.regEvent(node, 'click', this, function (e) {
                self.onNodeClick(e, node);
            }));
            return node;
        },

        /**
         * 添加连接线
         * @public
         * @param {Object} edgeOptions - 连接线配置
         * @returns {SVGElement} 连接线元素
         */
        addEdge: function (edgeOptions) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            $e.fn.addClass(line, 'yc-diagram__connection');
            if (edgeOptions.type) {
                $e.fn.addClass(line, 'yc-diagram__connection--' + edgeOptions.type);
            }
            if (edgeOptions.dashed) {
                $e.fn.addClass(line, 'yc-diagram__connection--dashed');
            }
            line.setAttribute('x1', edgeOptions.x1 || 0);
            line.setAttribute('y1', edgeOptions.y1 || 0);
            line.setAttribute('x2', edgeOptions.x2 || 0);
            line.setAttribute('y2', edgeOptions.y2 || 0);
            this._svg.appendChild(line);
            this.edges.push({ el: line, data: edgeOptions });
            return line;
        },

        /**
         * 节点鼠标按下事件处理
         * @private
         * @param {Event} e - 事件对象
         * @param {HTMLElement} node - 节点元素
         * @returns {void}
         */
        onNodeMouseDown: function (e, node) {
            e.stopPropagation();
            var self = this;
            var startX = e.clientX;
            var startY = e.clientY;
            var startLeft = parseInt(node.style.left || 0);
            var startTop = parseInt(node.style.top || 0);
            $e.fn.addClass(node, 'is-dragging');
            var onMouseMove = function (ev) {
                var deltaX = ev.clientX - startX;
                var deltaY = ev.clientY - startY;
                node.style.left = (startLeft + deltaX / self._zoom) + 'px';
                node.style.top = (startTop + deltaY / self._zoom) + 'px';
                self.updateEdges();
            };
            var onMouseUp = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                $e.fn.removeClass(node, 'is-dragging');
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },

        /**
         * 节点点击事件处理
         * @private
         * @param {Event} e - 事件对象
         * @param {HTMLElement} node - 节点元素
         * @returns {void}
         */
        onNodeClick: function (e, node) {
            if (this._selectedNode) {
                $e.fn.removeClass(this._selectedNode, 'is-selected');
            }
            this._selectedNode = node;
            $e.fn.addClass(node, 'is-selected');
            if (this.props.onNodeSelect) {
                var nodeData = this.nodes.find(function (n) { return n.el === node; });
                this.props.onNodeSelect(nodeData ? nodeData.data : null, node);
            }
        },

        /**
         * 调色板拖拽开始事件处理
         * @private
         * @param {Event} e - 事件对象
         * @param {string} type - 节点类型
         * @returns {void}
         */
        onPaletteDragStart: function (e, type) {
            var self = this;
            var onMouseUp = function (ev) {
                document.removeEventListener('mouseup', onMouseUp);
                var rect = self._canvas.getBoundingClientRect();
                if (ev.clientX >= rect.left && ev.clientX <= rect.right &&
                    ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
                    var x = (ev.clientX - rect.left) / self._zoom;
                    var y = (ev.clientY - rect.top) / self._zoom;
                    self.addNode({ type: type, x: x, y: y, title: type });
                }
            };
            document.addEventListener('mouseup', onMouseUp);
        },

        /**
         * 工具栏点击事件处理
         * @private
         * @param {string} action - 操作类型
         * @returns {void}
         */
        onToolbarClick: function (action) {
            if (action === 'zoom-in') {
                this.setZoom(this._zoom + 0.1);
            } else if (action === 'zoom-out') {
                this.setZoom(this._zoom - 0.1);
            } else if (action === 'fit') {
                this.setZoom(1);
            }
        },

        /**
         * 设置缩放级别
         * @public
         * @param {number} zoom - 缩放级别
         * @returns {void}
         */
        setZoom: function (zoom) {
            this._zoom = Math.max(0.2, Math.min(zoom, 3));
            this._canvas.style.transform = 'scale(' + this._zoom + ')';
            this._canvas.style.transformOrigin = '0 0';
        },

        /**
         * 更新连接线
         * @private
         * @returns {void}
         */
        updateEdges: function () {
            for (var i = 0; i < this.edges.length; i++) {
                var edge = this.edges[i];
                var fromNode = this.nodes.find(function (n) { return n.data.id === edge.data.from; });
                var toNode = this.nodes.find(function (n) { return n.data.id === edge.data.to; });
                if (fromNode && toNode) {
                    var fromRect = fromNode.el.getBoundingClientRect();
                    var toRect = toNode.el.getBoundingClientRect();
                    var canvasRect = this._canvas.getBoundingClientRect();
                    edge.el.setAttribute('x1', fromRect.left - canvasRect.left + fromRect.width / 2);
                    edge.el.setAttribute('y1', fromRect.top - canvasRect.top + fromRect.height / 2);
                    edge.el.setAttribute('x2', toRect.left - canvasRect.left + toRect.width / 2);
                    edge.el.setAttribute('y2', toRect.top - canvasRect.top + toRect.height / 2);
                }
            }
        },

        /**
         * 移除节点
         * @public
         * @param {HTMLElement} node - 节点元素
         * @returns {void}
         */
        removeNode: function (node) {
            var index = this.nodes.findIndex(function (n) { return n.el === node; });
            if (index >= 0) {
                this._canvas.removeChild(node);
                this.nodes.splice(index, 1);
            }
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
            this.edges = null;
            this._canvas = null;
            this._svg = null;
            this._selectedNode = null;
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
            return new DiagramView(options);
        }
    };

    $e.ui.addViewPlugin('view_diagram', plugin);
}($e);