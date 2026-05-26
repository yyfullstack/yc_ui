/**
 * @file List列表组件
 * @description 用于展示列表数据，支持单选、事件绑定等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * ListView 列表组件
     * 用于展示列表数据，支持单选、事件绑定等功能
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.adoName] 绑定的ADO数据对象名称
     * @param {string} [options.label='label'] 标签字段名
     */
    function ListView(options) {
        this.props = options;
        this.adoName = options['adoName'];
    }

    ListView.prototype = {
        VERSION: '3.0.1',
        props: null,
        shell: null,
        body: null,
        type: 'view_list',
        labelKey: 'label',
        oldItem: null,
        currentItem: null,
        items: null,
        dataListenHandle: 0,
        _handle: 0,

        /**
         * 初始化列表组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.items = {};
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
            }
            this.labelKey = this.props['label'] || this.labelKey;
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this._handle = this.bindListen($e.events.regEvent(this.body, this.body.getAttribute("data-event") || 'click', this, this.doAction));
            if (ado && ado.isInited) {
                this.repaint();
            }
        },

        /**
         * 数据监听处理
         * @private
         * @param {Object} options 事件选项
         * @param {string} options.eventType 事件类型
         * @returns {void}
         */
        doDataListen: function (options) {
            var eventType = options.eventType;
            if (eventType === ado_status.REFRESH) {
                this.repaint(options);
            } else if (eventType === ado_status.ROW_ADD) {
                this.addItem(options);
            } else if (eventType === ado_status.ROW_EDIT) {
                this.editItem(options);
            } else if (eventType === ado_status.ROW_DELETE) {
                this.removeItem(options);
            }
        },

        /**
         * 重新渲染列表
         * @public
         * @param {Object} [options] 渲染选项
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
            this.repainted(options);
        },

        /**
         * 渲染完成回调
         * @protected
         * @param {Object} [options] 选项
         * @returns {void}
         */
        repainted: function (options) {
        },

        /**
         * 构建列表项属性
         * @protected
         * @param {Object} ado ADO数据对象
         * @param {number} row 行索引
         * @param {Object} item 列表项对象
         * @returns {null}
         */
        buildItemProperties: function (ado, row, item) {
            item.shell.innerHTML = ado.getValueAt(row, this.labelKey);
            return null;
        },

        /**
         * 构建列表项
         * 需要在实际生成时进行覆盖
         * @protected
         * @param {number} row 行索引
         * @returns {ListItem|null} 列表项实例
         */
        buildItem: function (row) {
            var ado = this.getADO();
            var props = {
                shell: $e.fn.create("div", "list-item"),
                rowid: ado.getRowID(row)
            };
            $e.fn.extend(this.buildItemProperties(ado, row, props), props, true);
            return this.createItem(props);
        },

        /**
         * 创建列表项实例
         * @protected
         * @param {Object} props 列表项配置
         * @returns {ListItem} 列表项实例
         */
        createItem: function (props) {
            return new ListItem(this, props);
        },

        /**
         * 添加列表项
         * @public
         * @param {Object|number} options 行数据或行索引
         * @returns {boolean} 是否添加成功
         */
        addItem: function (options) {
            var item = this.buildItem(isNaN(options) ? options.row : options);
            if (item) {
                this.items[item.rowid + ''] = item;
                this.body.appendChild(item.shell);
                return true;
            }
            return false;
        },

        /**
         * 编辑列表项
         * 根据具体情况覆盖本方法
         * @public
         * @param {Object} options 编辑选项
         * @returns {boolean} 是否编辑成功
         */
        editItem: function (options) {
            var rowid = options.rowid;
            var item = this.getItem(options.rowid);
            if (item) {
                var ado = options.ado || this.getADO();
                var row = options.row || ado.findRowByRowID(rowid);
                this.buildItemProperties(ado, row, item);
                return true;
            } else {
                return this.addItem(options);
            }
        },

        /**
         * 删除列表项
         * @public
         * @param {Object} options 删除选项
         * @returns {ListItem|null} 被删除的列表项
         */
        removeItem: function (options) {
            var rowid = options.rowid;
            var item = this.getItem(rowid);
            if (item) {
                item.release();
                delete this.items['' + rowid];
            }
            return item;
        },

        /**
         * 根据行ID获取列表项
         * @public
         * @param {number} rowid 行ID
         * @returns {ListItem|null} 列表项实例
         */
        getItem: function (rowid) {
            return this.items[rowid + ''];
        },

        /**
         * 根据指定的属性查找列表项
         * @public
         * @param {string} key 属性名
         * @param {*} value 属性值
         * @returns {ListItem|null} 列表项实例
         */
        findItem: function (key, value) {
            var ado = this.getADO();
            if (ado) {
                var col = ado.getColumnIndex(key);
                for (var i = 0; i < ado.getRowsCount(); i++) {
                    if (ado.getValueAt(i, col) === value) {
                        return this.getItem(ado.getRowID(i));
                    }
                }
            }
            return null;
        },

        /**
         * 根据事件查找列表项
         * @public
         * @param {Event} event 事件对象
         * @returns {ListItem|null} 列表项实例
         */
        queryItem: function (event) {
            return $e.fn.queryOwner(event, true);
        },

        /**
         * 重置列表项
         * @public
         * @returns {void}
         */
        resetItem: function () {
            $e.fn.setChild(this.body, null);
            this.items = {};
        },

        /**
         * 获取当前选中的列表项
         * @public
         * @returns {ListItem|null} 当前选中项
         */
        getSelectedItem: function () {
            return this.currentItem;
        },

        /**
         * 处理点击事件
         * @private
         * @param {Event} event 事件对象
         * @returns {boolean} 是否处理成功
         */
        doAction: function (event) {
            var item = this.queryItem(event);
            if (item) {
                this.oldItem = this.currentItem;
                this.signSelectedItem(this.oldItem, false);
                this.currentItem = item;
                this.signSelectedItem(item, true);
                return this.done(event);
            }
            return true;
        },

        /**
         * 标记选中状态
         * @private
         * @param {ListItem} item 列表项
         * @param {boolean} selected 是否选中
         * @returns {void}
         */
        signSelectedItem: function (item, selected) {
            if (item) {
                if (selected) {
                    $e.fn.addClass(item, "list-item-selected");
                } else {
                    $e.fn.removeClass(item, "list-item-selected");
                }
            }
        },

        /**
         * 完成操作回调
         * @protected
         * @param {Event} event 事件对象
         * @returns {void}
         */
        done: function (event) {
        }
    };

    /**
     * ListItem 列表项类
     * @class
     * @param {ListView} view 所属视图
     * @param {Object} options 配置项
     */
    function ListItem(view, options) {
        $e.fn.extend(options, this, true);
        $e.ui.initViewCell(this, view);
        this.shell.$owner = this;
    }

    ListItem.prototype = {
        VERSION: '3.0.1',
        ownerType: 'list-item',
        shell: null,
        selected: false,

        /**
         * 设置选中状态
         * @public
         * @param {Event|boolean} event 事件对象或选中状态
         * @param {boolean} [selected] 是否选中
         * @returns {void}
         */
        setSelected: function (event, selected) {
            if (selected === undefined) {
                selected = event;
                event = null;
            }
            if (this.leaf) {
                if (selected) {
                    $e.fn.addClass(this.shell, "list-item-selected");
                } else {
                    $e.fn.removeClass(this.shell, "list-item-selected");
                }
            }
            this.selected = selected;
            this.onSelected(event, selected);
        },

        /**
         * 选中状态变更回调
         * @protected
         * @param {Event} event 事件对象
         * @param {boolean} selected 是否选中
         * @returns {boolean} 操作结果
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
         * 获取所属视图
         * @public
         * @returns {ListView} 所属视图
         */
        getOwnerView: function () {
            return $e.fn.queryOwnerView(this.shell);
        },

        /**
         * 完成操作回调
         * @protected
         * @param {Event} event 事件对象
         * @returns {boolean} 操作结果
         */
        done: function (event) {
            return true;
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            this.shell.parentNode.removeChild(this.shell);
            this.shell = null;
        }
    };

    var plugin = {
        /**
         * 创建ListView实例
         * @public
         * @param {Object} options 配置项
         * @returns {ListView} ListView实例
         */
        create: function (options) {
            return new ListView(options);
        }
    };
    $e.ui.addViewPlugin("view_list", plugin);
}($e);