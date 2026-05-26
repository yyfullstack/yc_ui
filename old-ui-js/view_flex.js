/**
 * @file Flex视图组件
 * @description 支持层级数据展示、自动展开、单选/多选模式的弹性容器组件
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var flex = $e.ui.createView('view_flex', {
 *     adoName: 'myData',
 *     isAutoExpand: true,
 *     expandType: 'single'
 * });
 */
+function ($e) {
    'use strict';

    /**
     * Flex视图组件构造函数
     * @class FlexView
     * @param {Object} options - 配置选项
     * @param {boolean} [options.isAutoExpand=true] - 是否自动展开
     * @param {string} [options.expandType='single'] - 展开类型：single/mult
     * @param {string} [options.adoName] - 绑定的ADO数据对象名称
     */
    function FlexView(options) {
        this.props = options || {};
        this.isAutoExpand = $e.fn.getBoolean(options['isAutoExpand'] || 'true');
        this.expandType = options['expandType'] || 'single';
        this.adoName = options['adoName'];
    }

    FlexView.prototype = {
        VERSION: '3.0.1',
        props: null,
        shell: null,
        body: null,
        type: 'view_flex',
        expandType: null,
        isAutoExpand: true,
        oldItem: null,
        currentItem: null,
        items: null,
        dataListenHandle: 0,
        _handle: 0,
        itemConst: {
            levelCode: 'levelCode',
            label: 'label',
            splitChar: '.',
            leaf: 'leaf'
        },

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.items = {};
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
            }
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this._handle = this.bindListen($e.events.regEvent(this.body, this.body.getAttribute('data-event') || 'click', this, this.doAction));
            if (ado && ado.isInited) {
                this.repaint();
            }
        },

        /**
         * 数据监听处理
         * @private
         * @param {Object} options - 事件选项
         * @returns {void}
         */
        doDataListen: function (options) {
            var type = options.eventType;
            if (type === ado_status.REFRESH) {
                this.repaint(options);
            } else if (type === ado_status.ROW_ADD) {
                this.addItem(options);
            } else if (type === ado_status.ROW_EDIT) {
                this.editItem(options);
            } else if (type === ado_status.ROW_DELETE) {
                this.removeItem(options);
            }
        },

        /**
         * 重新渲染组件
         * @public
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        repaint: function (options) {
            this.resetItem();
            var ado = this.getADO();
            if (ado) {
                var count = ado.getRowsCount();
                for (var i = 0; i < count; i++) {
                    this.addItem(i);
                }
            }
        },

        /**
         * 构建项（需子类覆盖）
         * @public
         * @param {number} row - 行索引
         * @returns {FlexItem|null} FlexItem实例
         */
        buildItem: function (row) {
            var ado = this.getADO();
            var item = {
                shell: $e.fn.create('div', 'flex-item'),
                header: $e.fn.create('div', 'flex-item-header'),
                method: null,
                rowid: ado.getRowID(row)
            };
            $e.fn.extend(this.buildItemProperties(ado, row, item), item, true);
            item.shell.appendChild(item.header);
            return this.createItem(item);
        },

        /**
         * 获取默认项属性
         * @private
         * @param {Object} ado - ADO数据对象
         * @param {number} row - 行索引
         * @returns {Object} 属性对象
         */
        defaultItemProperties: function (ado, row) {
            var ic = this.itemConst;
            var item = {
                levelCode: ado.getValueAt(row, ic.levelCode),
                label: ado.getValueAt(row, ic.label),
                leaf: $e.fn.getBoolean(ado.getValueAt(row, ic.leaf))
            };
            return item;
        },

        /**
         * 构建项属性
         * @private
         * @param {Object} ado - ADO数据对象
         * @param {number} row - 行索引
         * @param {Object} item - 项对象
         * @returns {Object} 属性对象
         */
        buildItemProperties: function (ado, row, item) {
            var props = this.defaultItemProperties(ado, row);
            item.header.innerHTML = props.label;
            return props;
        },

        /**
         * 创建FlexItem实例
         * @private
         * @param {Object} props - 属性对象
         * @returns {FlexItem} FlexItem实例
         */
        createItem: function (props) {
            return new FlexItem(this, props);
        },

        /**
         * 添加项
         * @public
         * @param {Object|number} options - 选项或行索引
         * @returns {boolean} 是否添加成功
         */
        addItem: function (options) {
            var item = this.buildItem(isNaN(options) ? options.row : options);
            if (item) {
                var parentItem = this.findParentItem(item);
                if (parentItem) {
                    parentItem.appendChild(item);
                } else {
                    this.body.appendChild(item.shell);
                }
                this.items['' + item.rowid] = item;
                return true;
            }
            return false;
        },

        /**
         * 编辑项（需子类覆盖）
         * @public
         * @param {Object} options - 选项
         * @returns {void}
         */
        editItem: function (options) {
            // 子类实现具体逻辑
        },

        /**
         * 移除项
         * @public
         * @param {Object} options - 选项
         * @returns {FlexItem|null} 被移除的项
         */
        removeItem: function (options) {
            var rowid = (options instanceof FlexItem) ? options['rowid'] : options.rowData['__rowid'];
            var item = this.items['' + rowid];
            if (item) {
                item.parentNode.removeChild(item.shell);
                delete this.items['' + rowid];
                var parent = item.getParentItem();
                if (parent) {
                    return parent.removeChild(item);
                }
            }
            return item;
        },

        /**
         * 查找父项
         * @private
         * @param {FlexItem} item - 当前项
         * @returns {FlexItem|null} 父项
         */
        findParentItem: function (item) {
            var levelKey = item.levelCode;
            if (levelKey) {
                var key = this.getParentKey(levelKey);
                return this.findItem('levelCode', key);
            }
            return null;
        },

        /**
         * 获取父级key
         * @private
         * @param {string} key - 当前key
         * @returns {string} 父级key
         */
        getParentKey: function (key) {
            var i = key.lastIndexOf(this.itemConst.splitChar);
            return (i > 0) ? key.substring(0, i) : '';
        },

        /**
         * 根据rowid获取项
         * @public
         * @param {number} rowid - 行ID
         * @returns {FlexItem|undefined} FlexItem实例
         */
        getItem: function (rowid) {
            return this.items[rowid + ''];
        },

        /**
         * 根据指定属性查找FlexItem
         * @public
         * @param {string|Function} key - 属性名或查找函数
         * @param {*} [value] - 属性值
         * @returns {FlexItem|null} 找到的项
         */
        findItem: function (key, value) {
            if (arguments.length === 1) {
                if (typeof key === 'function') {
                    for (var i in this.items) {
                        if (key(this.items[i])) {
                            return this.items[i];
                        }
                    }
                } else {
                    return this.getItem(key);
                }
            } else {
                for (var i in this.items) {
                    if (this.items[i][key] === value) {
                        return this.items[i];
                    }
                }
            }
            return null;
        },

        /**
         * 根据事件或元素查找节点
         * @public
         * @param {Event} e - 事件对象
         * @returns {FlexItem|null} 找到的项
         */
        queryItem: function (e) {
            return $e.fn.queryOwner(e, true);
        },

        /**
         * 重置所有项
         * @public
         * @returns {void}
         */
        resetItem: function () {
            $e.fn.setChild(this.body, null);
            this.items = {};
        },

        /**
         * 获取当前选中项
         * @public
         * @returns {FlexItem|null} 当前选中项
         */
        getSelectedItem: function () {
            return this.currentItem;
        },

        /**
         * 展开或收缩flex节点
         * @public
         * @param {FlexItem} item - 目标项
         * @param {boolean} isOpen - 是否展开
         * @returns {void}
         */
        expand: function (item, isOpen) {
            if (item) {
                if (this.currentItem && this.isAutoExpand && this.expandType === 'single' && item !== this.currentItem) {
                    if (!this.isParent(this.currentItem, item) && !this.isParent(item, this.currentItem)) {
                        var p0 = this.currentItem;
                        var p1 = p0.getParentItem();
                        while (p1) {
                            p0 = p1;
                            p1 = p1.getParentItem();
                        }
                        if (p0) {
                            if (!this.isParent(p0, item)) {
                                p0.expand(false, true);
                            } else {
                                this.currentItem.expand(false, true);
                            }
                        }
                    }
                }
                item.expand(isOpen, true);
            }
        },

        /**
         * 判断是否为父子关系
         * @private
         * @param {FlexItem} parent - 父项
         * @param {FlexItem} child - 子项
         * @returns {boolean} 是否为父子关系
         */
        isParent: function (parent, child) {
            var p1 = child.getParentItem();
            while (p1 && parent) {
                if (p1.levelCode === parent.levelCode) {
                    return true;
                }
                p1 = p1.getParentItem();
            }
            return false;
        },

        /**
         * 展开所有节点
         * @public
         * @returns {void}
         */
        expandAll: function () {
            for (var i in this.items) {
                this.items[i].expand(true);
            }
        },

        /**
         * 自动展开节点
         * @public
         * @param {FlexItem} item - 目标项
         * @returns {void}
         */
        autoExpand: function (item) {
            if (item) {
                this.expand(item, !item.isExpand());
            }
        },

        /**
         * 处理点击事件
         * @private
         * @param {Event} event - 事件对象
         * @returns {boolean} 是否处理成功
         */
        doAction: function (event) {
            var item = this.queryItem(event);
            if (item) {
                if (!item.leaf && this.isAutoExpand) {
                    this.autoExpand(item);
                }
                return this.setSelectedItem(event, item);
            }
            return true;
        },

        /**
         * 设置选中项
         * @public
         * @param {Event} [event] - 事件对象
         * @param {FlexItem} item - 目标项
         * @returns {boolean} 是否设置成功
         */
        setSelectedItem: function (event, item) {
            if (item === undefined) {
                item = event;
                event = null;
            }
            if (this.currentItem && this.currentItem !== item) {
                this.currentItem.setSelected(event, false);
            }
            this.currentItem = item;
            var result = true;
            if (item.setSelected(event, true) !== false) {
                result = !(this.done(event, item) === false);
            }
            this.oldItem = item;
            return result;
        },

        /**
         * 完成处理（子类可覆盖）
         * @public
         * @param {Event} event - 事件对象
         * @param {FlexItem} item - 当前项
         * @returns {boolean} 是否成功
         */
        done: function (event, item) {
            return true;
        }
    };

    /**
     * FlexItem构造函数
     * @class FlexItem
     * @param {FlexView} view - 所属视图
     * @param {Object} options - 配置选项
     */
    function FlexItem(view, options) {
        $e.fn.extend(options, this, true);
        $e.ui.initViewCell(this, view);
        this.shell.$owner = this;
    }

    FlexItem.prototype = {
        VERSION: '3.0.1',
        _ownerType: 'flex-item',
        shell: null,
        itemBody: null,
        parentItem: null,
        children: null,
        leaf: true,
        selected: false,

        /**
         * 展开或收缩
         * @public
         * @param {boolean} isExpand - 是否展开
         * @param {boolean} toRoot - 是否递归展开到根节点
         * @returns {void}
         */
        expand: function (isExpand, toRoot) {
            if (this.itemBody) {
                if (isExpand) {
                    $e.fn.showElement(this.itemBody, true);
                } else {
                    $e.fn.showElement(this.itemBody, false);
                }
            }
            if (isExpand && toRoot && this.parentItem) {
                this.parentItem.expand(isExpand, toRoot);
            }
        },

        /**
         * 判断是否展开
         * @public
         * @returns {boolean} 是否展开
         */
        isExpand: function () {
            return this.itemBody && $e.fn.isElementShow(this.itemBody);
        },

        /**
         * 设置选中状态
         * @public
         * @param {Event} [event] - 事件对象
         * @param {boolean} selected - 是否选中
         * @returns {void}
         */
        setSelected: function (event, selected) {
            if (selected === undefined) {
                selected = event;
                event = null;
            }
            if (this.leaf) {
                if (selected) {
                    $e.fn.addClass(this.shell, 'flex-item-selected');
                } else {
                    $e.fn.removeClass(this.shell, 'flex-item-selected');
                }
            }
            this.selected = selected;
            this.onSelected(event, selected);
        },

        /**
         * 选中回调
         * @public
         * @param {Event} event - 事件对象
         * @param {boolean} selected - 是否选中
         * @returns {boolean} 是否成功
         */
        onSelected: function (event, selected) {
            return selected ? this.done(event) : true;
        },

        /**
         * 判断是否选中
         * @public
         * @returns {boolean} 是否选中
         */
        isSelected: function () {
            return this.selected;
        },

        /**
         * 添加子项
         * @public
         * @param {FlexItem} item - 子项
         * @returns {void}
         */
        appendChild: function (item) {
            if (!this.itemBody) {
                this.itemBody = $e.fn.create('div', 'flex-item-body');
                $e.fn.showElement(this.itemBody, false);
                this.shell.appendChild(this.itemBody);
                this.leaf = false;
                this.children = [];
            }
            this.itemBody.appendChild(item.shell);
            item.parentItem = this;
            this.children.push(item);
        },

        /**
         * 移除子项
         * @public
         * @param {FlexItem} item - 子项
         * @returns {FlexItem|null} 被移除的子项
         */
        removeChild: function (item) {
            if (this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    if (item === this.children[i]) {
                        this.children.splice(i, 1);
                        item.parentItem = null;
                        this.getOwnerView().removeItem(item);
                        return item;
                    }
                }
            }
            return null;
        },

        /**
         * 获取子项列表
         * @public
         * @returns {Array} 子项数组
         */
        getChildren: function () {
            return this.children;
        },

        /**
         * 获取父项
         * @public
         * @returns {FlexItem|null} 父项
         */
        getParentItem: function () {
            return this.parentItem;
        },

        /**
         * 获取所属视图
         * @public
         * @returns {FlexView} 所属视图
         */
        getOwnerView: function () {
            return $e.fn.queryOwnerView(this.shell);
        },

        /**
         * 完成处理（子类可覆盖）
         * @public
         * @param {Event} event - 事件对象
         * @returns {boolean} 是否成功
         */
        done: function (event) {
            return true;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建Flex视图组件实例
         * @param {Object} options - 组件配置
         * @returns {FlexView} Flex视图组件实例
         */
        create: function (options) {
            return new FlexView(options);
        }
    };
    $e.ui.addViewPlugin('view_flex', plugin);
}($e);