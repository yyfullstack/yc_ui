/**
 * @file TreeGrid树形表格组件
 * @description 结合树形结构和表格展示层级数据，支持展开/折叠、复选框选择等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    var icons = {
        root: 'images/tree/root.gif',
        pathClose: 'images/tree/path_close.gif',
        pathOpen: 'images/tree/path_open.gif',
        node: 'images/tree/node.gif',
        empty: 'images/tree/empty.gif',
        line: 'images/tree/line.gif',
        lineLink: 'images/tree/line_link.gif',
        lineLast: 'images/tree/line_last.gif',
        pathPlus: 'images/tree/path_plus.gif',
        pathPlusLast: 'images/tree/path_plus_last.gif',
        pathMinus: 'images/tree/path_minus.gif',
        pathMinusLast: 'images/tree/path_minus_last.gif',
        check0: 'images/tree/box_0.gif',
        check1: 'images/tree/box_1.gif',
        check2: 'images/tree/box_2.gif'
    };

    var constKey = {
        levelCode: 'levelCode',
        label: 'label',
        splitChar: '.',
        leaf: 'leaf'
    };

    /**
     * TreeGridView 树形表格组件
     * 结合树形结构和表格展示层级数据
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.adoName] 绑定的ADO数据对象名称
     * @param {boolean} [options.showLine=false] 是否显示连接线
     * @param {boolean} [options.isCheckItem=false] 是否显示复选框
     */
    function TreeGridView(options) {
        this.props = options;
        this.adoName = options['adoName'];
        this.showLine = false;
        this.isCheckItem = $e.fn.getBoolean(options['isCheckItem'], false);
    }

    TreeGridView.prototype = {
        VERSION: '3.0.1',
        type: 'view_tree',
        shell: null,
        body: null,
        root: null,
        props: null,
        oldItem: null,
        currentItem: null,
        items: null,
        keyItems: null,
        dataListenHandle: 0,
        showLine: false,
        _handle: 0,
        _repainting: false,
        icons: null,
        itemConst: null,

        /**
         * 初始化树形表格组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.items = {};
            this.keyItems = {};
            this.icons = $e.fn.extend(icons, {});
            this.initKeys();

            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
            }

            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.dataShell = this.body.querySelector("[view-band='data_shell']");

            this.bindListen($e.events.regEvent(this.body, this.body.getAttribute('data-event') || 'click', this, this.doAction));
            this.bindListen($e.events.regEvent(this.dataShell, 'scroll', this, this.syncScroll));

            this.buildHeader(this.props['header'], false);

            if (ado && ado.isInited) {
                this.repaint();
            }
        },

        /**
         * 构建表头
         * @public
         * @param {string} headerJson 表头配置JSON字符串
         * @returns {void}
         */
        buildHeader: function (headerJson) {
            var header = JSON.parse(headerJson);
            var that = this,
                group = that.group = $e.fn.create('colgroup'),
                tr = $e.fn.create('tr'),
                tbody = $e.fn.create('tbody'),
                cols = that.cols = [],
                colEl,
                th;

            if (header && header.length > 0) {
                for (var i = 0; i < header.length; i++) {
                    colEl = $e.fn.create('COL');
                    $e.fn.setStyle(colEl, 'width:' + header[i][2] + 'px');
                    group.appendChild(colEl);
                    th = $e.fn.create('th');
                    th.innerText = header[i][1];
                    th.setAttribute('data-name', header[i][0]);
                    cols.push(header[i][0]);
                    tr.appendChild(th);
                }

                var htable = this.body.querySelector('[view-band="header_table"]');
                htable.appendChild(group.cloneNode(true));
                htable.appendChild(tr);

                var dtable = this.body.querySelector('[view-band="data_table"]');
                dtable.appendChild(group.cloneNode(true));
                dtable.appendChild(tbody);

                var options = {
                    body: tbody,
                    parentCode: '',
                    level: -1,
                    leaf: false
                };

                this.root = new TreeGridItem(this, options);
            }
        },

        /**
         * 同步滚动
         * @private
         * @param {Event} e 滚动事件
         * @param {boolean} flag 是否反向同步
         * @returns {void}
         */
        syncScroll: function (e, flag) {
            var ds = this.dataShell;
            var hs = this.headerShell = this.body.querySelector('[view-band="header_shell"]');
            if (ds && hs) {
                if (!flag) {
                    hs.scrollLeft = ds.scrollLeft;
                } else {
                    ds.scrollLeft = hs.scrollLeft;
                }
            }
        },

        /**
         * 数据监听处理
         * @private
         * @param {Object} options 事件选项
         * @returns {boolean} 处理结果
         */
        doDataListen: function (options) {
            var eventType = options.eventType;
            if (eventType === ado_status.REFRESH) {
                return this.repaint(options);
            } else if (eventType === ado_status.ROW_ADD) {
                this.addItem(this.buildItem(options.row), true);
            } else if (eventType === ado_status.ROW_EDIT) {
                this.editItem(options);
            } else if (eventType === ado_status.ROW_DELETE) {
                this.removeItem(options);
            }
        },

        /**
         * 重新渲染
         * @public
         * @param {Object} [options] 渲染选项
         * @returns {boolean} 是否渲染成功
         */
        repaint: function (options) {
            if (!this._repainting) {
                try {
                    this._repainting = true;
                    var ado = this.getADO();
                    ado.sort(this.itemConst.levelCode, 1);
                    this._repainting = false;
                    return false;
                } catch (e) {
                    alert(e);
                } finally {
                    this._repainting = false;
                }
            } else {
                this.resetItem();
                var ado = this.getADO();
                if (ado) {
                    var count = ado.getRowsCount();
                    for (var i = 0; i < count; i++) {
                        this.addItem(this.buildItem(i));
                    }
                }
                this.root.expand(true, 'down', 0);
                this.root.paintImage([], true);
            }
            return true;
        },

        /**
         * 初始化常量键
         * @private
         * @returns {void}
         */
        initKeys: function () {
            this.itemConst = $e.fn.extend(constKey, {});
        },

        /**
         * 构建树节点
         * @protected
         * @param {number} row 行索引
         * @returns {TreeGridItem} 树节点实例
         */
        buildItem: function (row) {
            var ado = this.getADO();
            var levelCode = ado.getValueAt(row, 'levelCode') || '';
            var i = levelCode.lastIndexOf(this.itemConst.splitChar);
            var item = {
                shell: $e.fn.create('tr'),
                rowid: ado.getRowID(row),
                levelCode: levelCode,
                parentCode: (i >= 0) ? levelCode.substring(0, i) : '',
                rowdata: ado.getRowData(row),
                leaf: $e.fn.getBoolean(ado.getValueAt(row, 'isLeaf'))
            };
            item.shell.rowid = item.rowid;

            return new TreeGridItem(this, item);
        },

        /**
         * 添加树节点
         * @public
         * @param {TreeGridItem} item 树节点
         * @param {boolean} paint 是否立即渲染
         * @returns {boolean} 是否添加成功
         */
        addItem: function (item, paint) {
            var parentItem = item.getParentItem();
            parentItem.addChild(item, true);

            this.items['' + item.rowid] = item;
            this.keyItems[item.levelCode] = item;

            if (paint) {
                parentItem.getTopItem().paintImage([], true);
            }

            return true;
        },

        /**
         * 编辑树节点
         * @public
         * @param {Object} options 编辑选项
         * @returns {void}
         */
        editItem: function (options) {
            var item = this.getItem(options.rowid);
            if (item) {
                var levelCode = item.levelCode;
                var props = this.buildItemProperties(options.ado, options.row);
                this.parseLevelCode(options.ado, options.row, props);
                if (props.levelCode !== item.levelCode) {
                    this.removeItem(item);
                    $e.fn.extend(props, item, true);
                    this.addItem(item);
                    item.changeParent(item.parentCode);
                    item.repaint(null, true);
                } else {
                    item.repaint(props, true);
                }
                item.getTopItem().paintImage([], true);
            }
        },

        /**
         * 删除树节点
         * @public
         * @param {Object|TreeGridItem} options 删除选项或树节点
         * @param {boolean} [release] 是否释放资源
         * @returns {boolean} 是否删除成功
         */
        removeItem: function (options, release) {
            var rowid = (options instanceof TreeGridItem) ? options['rowid'] : options.rowData['__rowid'];
            var item = this.items['' + rowid];
            if (item) {
                var parentItem = item.getParentItem();
                if (parentItem) {
                    delete this.keyItems[item.levelCode];
                    delete this.items['' + rowid];
                    parentItem.removeChild(item);
                    if (parentItem !== this.root) {
                        parentItem.getTopItem().paintImage([], true);
                    }
                    return true;
                }
            }
            return false;
        },

        /**
         * 根据行ID获取树节点
         * @public
         * @param {number} rowid 行ID
         * @returns {TreeGridItem|null} 树节点
         */
        getItem: function (rowid) {
            return this.items[rowid + ''];
        },

        /**
         * 根据指定属性查找树节点
         * @public
         * @param {string} key 属性名
         * @param {*} [value] 属性值
         * @returns {TreeGridItem|null} 树节点
         */
        findItemByKey: function (key, value) {
            if (arguments.length === 1) {
                return key ? this.keyItems[key] : null;
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
         * 根据事件查找树节点
         * @public
         * @param {Event} e 事件对象
         * @returns {TreeGridItem|null} 树节点
         */
        queryItem: function (e) {
            var node = $e.fn.closest(e, {key: 'rowid', end: '$owner'});
            if (node) {
                return this.items[node['rowid']];
            }
            return null;
        },

        /**
         * 重置所有节点
         * @public
         * @returns {void}
         */
        resetItem: function () {
            $e.fn.setChild(this.root.body, null);
            this.items = {};
            this.keyItems = {};
        },

        /**
         * 获取当前选中的节点
         * @public
         * @returns {TreeGridItem|null} 当前选中节点
         */
        getSelectedItem: function () {
            return this.currentItem;
        },

        /**
         * 展开或收缩节点
         * @public
         * @param {TreeGridItem} item 树节点
         * @param {boolean} isOpen 是否展开
         * @param {number} level 展开层级
         * @returns {void}
         */
        expand: function (item, isOpen, level) {
            if (item) {
                item.expand(isOpen, 'down', level);
            }
        },

        /**
         * 展开所有节点
         * @public
         * @returns {void}
         */
        expandAll: function () {
            this.expand(this.root, true, -1);
        },

        /**
         * 自动展开节点
         * @public
         * @param {TreeGridItem} item 树节点
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
         * @param {Event} event 事件对象
         * @returns {void}
         */
        doAction: function (event) {
            var node = event.srcElement || event.target;
            var item = this.queryItem(event);
            if (item) {
                if (node.tagName === 'IMG') {
                    if ($e.fn.hasClass(node, 'tree-item-link') || $e.fn.hasClass(node, 'tree-item-icon')) {
                        this.autoExpand(item);
                    } else if ($e.fn.hasClass(node, 'tree-item-check')) {
                        if (this.isEnable()) {
                            item.setChecked(!item.isChecked(), 'all');
                        }
                    }
                } else if (this.isItemLabel(node)) {
                    this.setSelectedItem(item, false);
                }
            }
        },

        /**
         * 设置选中节点
         * @public
         * @param {TreeGridItem} item 树节点
         * @param {boolean} noDoEvent 是否触发事件
         * @returns {void}
         */
        setSelectedItem: function (item, noDoEvent) {
            if (this.currentItem) {
                this.currentItem.setSelected(false);
                this.oldItem = this.currentItem;
            }
            this.currentItem = item;
            item.setSelected(true);
            if (!noDoEvent) {
                this.done(null, item);
            }
        },

        /**
         * 判断是否为标签节点
         * @private
         * @param {HTMLElement} node DOM节点
         * @returns {boolean} 是否为标签
         */
        isItemLabel: function (node) {
            return node && $e.fn.hasClass(node, 'tree-item-label');
        },

        /**
         * 释放资源
         * @public
         * @param {boolean} hasDb 是否释放数据库连接
         * @returns {void}
         */
        selfRelease: function (hasDb) {
            var ado = this.getADO();
            if (ado) {
                if (hasDb) {
                    ado.release();
                } else {
                    ado.removeListen(this.dataListenHandle);
                }
            }
            this.items = null;
            this.keyItems = null;
            this.root.release();
            this.shell = this.body = this.header = null;
        },

        /**
         * 完成操作回调
         * @protected
         * @param {Event} event 事件对象
         * @param {TreeGridItem} item 树节点
         * @returns {void}
         */
        done: function (event, item) {
            if (item.method) {
                item.method.apply(item['context'] || this, [].slice.apply(arguments) || []);
            }
        }
    };

    /**
     * TreeGridItem 树形表格节点类
     * @class
     * @param {TreeGridView} view 所属视图
     * @param {Object} options 配置项
     */
    function TreeGridItem(view, options) {
        $e.fn.extend(options, this, true);
        this.ownerView = view;
    }

    TreeGridItem.prototype = {
        ownerView: null,
        shell: null,
        body: null,
        rowid: null,
        leaf: true,
        levelCode: '',
        parentCode: '',
        children: null,
        checked: false,
        selected: false,
        expanded: false,
        iconPath: null,
        rowdata: null,

        /**
         * 判断是否为叶子节点
         * @public
         * @returns {boolean} 是否为叶子节点
         */
        isLeaf: function () {
            return this.leaf;
        },

        /**
         * 获取第一个子节点
         * @public
         * @returns {TreeGridItem|null} 第一个子节点
         */
        getFirstChild: function () {
            var children = this.children;
            if (children && children.length > 0) {
                return children[0];
            }
            return this.getChild(0);
        },

        /**
         * 获取最后一个子节点
         * @public
         * @returns {TreeGridItem|null} 最后一个子节点
         */
        getLastChild: function () {
            var children = this.children;
            if (children && children.length > 0) {
                return children[children.length - 1];
            }
            return null;
        },

        /**
         * 改变父节点
         * @public
         * @param {string} parentCode 父节点编码
         * @returns {void}
         */
        changeParent: function (parentCode) {
            var splitChar = this.ownerView.itemConst.splitChar;
            this.parentCode = parentCode;
            var i = this.levelCode.lastIndexOf(splitChar);
            delete this.ownerView.keyItems[this.levelCode];
            if (i >= 0) {
                this.levelCode = (parentCode.length > 0) ? parentCode + this.levelCode.substring(i) : this.levelCode.substring(i + 1);
            } else {
                this.levelCode = (parentCode.length > 0) ? parentCode + splitChar + this.levelCode : this.levelCode;
            }
            this.ownerView.keyItems[this.levelCode] = this;
            if (this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    this.children.changeParent(this.levelCode);
                }
            }
            this.repaint(null, false);
        },

        /**
         * 重新渲染节点
         * @public
         * @param {Object} [options] 更新属性
         * @param {boolean} isDown 是否向下递归
         * @returns {void}
         */
        repaint: function (options, isDown) {
            if (options) {
                $e.fn.extend(options, this, true);
            }

            this.paintImage(null, isDown);
            this.createRowData();

            if (isDown && this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].repaint(null, isDown);
                }
            }
        },

        /**
         * 创建行数据
         * @private
         * @returns {void}
         */
        createRowData: function () {
            var cols = this.ownerView.cols;
            if (cols && cols.length > 0) {
                for (var i = 0; i < cols.length; i++) {
                    var col = cols[i];
                    var index = this.rowdata['__cols'][col];
                    if (index >= 0) {
                        var td = this.shell.insertCell(-1);
                        td.innerText = this.rowdata['__data'][index];
                    }
                }
            }
        },

        /**
         * 添加子节点
         * @public
         * @param {TreeGridItem} child 子节点
         * @param {boolean} paint 是否渲染
         * @returns {void}
         */
        addChild: function (child, paint) {
            if (!this.children) {
                this.children = [];
            }
            if (this.children.indexOf(child) < 0) {
                this.children.push(child);
                if (!this.body) {
                    var tr = $e.fn.create('tr');
                    var td = $e.fn.create('td');
                    var len = this.ownerView.cols.length;

                    td.setAttribute('colspan', len + '');
                    var gbody = $e.fn.create('div', 'tree-item-body hide');
                    td.appendChild(gbody);
                    tr.appendChild(td);
                    var table = $e.fn.create('table', 'yc-view-grid-table');
                    this.body = $e.fn.create('tbody');
                    table.appendChild(this.ownerView.group.cloneNode(true));
                    table.appendChild(this.body);
                    gbody.appendChild(table);
                    this.shell.parentNode.appendChild(tr);
                }
                this.body.appendChild(child.shell);
                if (paint) {
                    child.repaint();
                }
            }
        },

        /**
         * 删除子节点
         * @public
         * @param {TreeGridItem|number} child 子节点或索引
         * @param {boolean} [release] 是否释放资源
         * @returns {boolean} 是否删除成功
         */
        removeChild: function (child, release) {
            if (this.children) {
                var i = this.children.indexOf(child);
                if (i >= 0) {
                    this.children.splice(i, 1);
                    this.body.removeChild(child.shell);
                }
                if (child && release) {
                    child.release();
                }
                return true;
            }
            return false;
        },

        /**
         * 获取指定索引的子节点
         * @public
         * @param {number} n 索引
         * @returns {TreeGridItem|null} 子节点
         */
        getChild: function (n) {
            return this.children ? this.children[n] : null;
        },

        /**
         * 获取层级
         * @public
         * @returns {number} 层级数
         */
        getLevel: function () {
            return this.levelCode ? ($e.fn.countChar(this.levelCode, this.ownerView.itemConst.splitChar) + 1) : 0;
        },

        /**
         * 获取顶层节点
         * @public
         * @returns {TreeGridItem} 顶层节点
         */
        getTopItem: function () {
            var i = this.levelCode.indexOf(this.ownerView.itemConst.splitChar);
            var s = (i >= 0) ? this.levelCode.substring(0, i) : null;
            return s ? this.ownerView.findItemByKey(s) : this;
        },

        /**
         * 获取父节点
         * @public
         * @returns {TreeGridItem} 父节点
         */
        getParentItem: function () {
            return this.ownerView.findItemByKey(this.parentCode) || this.ownerView.root;
        },

        /**
         * 展开或收缩
         * @public
         * @param {boolean} isExpand 是否展开
         * @param {string} [forward] 方向: up/down/all
         * @param {number} [level] 展开层级
         * @returns {void}
         */
        expand: function (isExpand, forward, level) {
            if (this.body && this.children) {
                var node = this.body.parentNode.parentNode;
                $e.fn.showElement(node, isExpand && this.children.length > 0);
            }
            this.expanded = isExpand;
            if (arguments.length > 1) {
                if (forward === 'up' || forward === 'all') {
                    if (this.parentCode) {
                        this.getParentItem().expand(isExpand, 'up');
                    }
                }
                level = level || 0;
                if ((forward === 'down' || forward === 'all') && this.children && isExpand && level !== 0) {
                    level--;
                    for (var i = 0; i < this.children.length; i++) {
                        this.children[i].expand(true, 'down', level);
                    }
                }
            }
            if (this.shell) {
                var img = this.shell.querySelector('.tree-item-link');
                if (img) {
                    img.src = this.parseImage('line');
                }
                img = this.shell.querySelector('.tree-item-icon');
                if (img) {
                    img.src = this.parseImage('icon');
                }
            }
        },

        /**
         * 判断是否展开
         * @public
         * @returns {boolean} 是否展开
         */
        isExpand: function () {
            return this.expanded;
        },

        /**
         * 判断是否为根节点
         * @public
         * @returns {boolean} 是否为根节点
         */
        isRoot: function () {
            return this.ownerView.root === this;
        },

        /**
         * 设置复选框状态
         * @public
         * @param {boolean} checked 是否选中
         * @param {string} [forward] 方向: up/down/all
         * @returns {void}
         */
        setChecked: function (checked, forward) {
            this.checked = checked;
            if (forward) {
                if (forward === 'down' || forward === 'all') {
                    if (this.children) {
                        for (var i = 0; i < this.children.length; i++) {
                            this.children[i].setChecked(checked, 'down');
                        }
                    }
                }
                if (this.parentCode && (forward === 'up' || forward === 'all')) {
                    this.getParentItem().setChecked(checked, 'up');
                }
            }
            var node = this.shell.querySelector('.tree-item-check');
            if (node) {
                node.src = this.parseImage('check');
            }
            this.onChecked();
        },

        /**
         * 判断是否选中
         * @public
         * @returns {boolean} 是否选中
         */
        isChecked: function () {
            return this.checked;
        },

        /**
         * 获取复选框状态
         * @public
         * @returns {string} 状态: 0/未选择 1/已选择 2/部分选择
         */
        getCheckStatus: function () {
            if (this.isChecked()) {
                var children = this.children;
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        if (!children[i].isChecked()) {
                            return '2';
                        }
                    }
                }
                return '1';
            }
            return '0';
        },

        /**
         * 获取选中的节点
         * @public
         * @param {TreeGridItem[]} [as] 结果数组
         * @returns {TreeGridItem[]} 选中节点数组
         */
        getCheckedItem: function (as) {
            as = as || [];
            if (this.checked) {
                as.push(this);
                var children = this.children;
                for (var i = 0; i < children.length; i++) {
                    children[i].getCheckedItem(as);
                }
            }
            return as;
        },

        /**
         * 设置选中状态
         * @public
         * @param {boolean} selected 是否选中
         * @returns {void}
         */
        setSelected: function (selected) {
            var label = this.shell.querySelector('.tree-item-label');
            if (label) {
                if (selected) {
                    $e.fn.addClass(label, 'tree-item-checked');
                } else {
                    $e.fn.removeClass(label, 'tree-item-checked');
                }
            }
            this.selected = selected;
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
         * 绘制图标和连接线
         * @public
         * @param {number[]} [levelType] 层级类型数组
         * @param {boolean} [deep] 是否深度渲染
         * @returns {void}
         */
        paintImage: function (levelType, deep) {
            var path, n = this.getLevel() - 1;
            var node, count = n, icons = this.ownerView.icons;
            if (!levelType) {
                var td = this.shell.insertCell(-1);
                path = icons.empty;
                for (var j = 0; j < n; j++) {
                    node = $e.fn.create('img');
                    node.src = path;
                    td.appendChild(node);
                }
                if (this.ownerView.showLine) {
                    node = $e.fn.create('img', 'tree-item-link');
                    node.src = path;
                    td.appendChild(node);
                }
                if (this.ownerView.isCheckItem) {
                    node = $e.fn.create('img', 'tree-item-check');
                    node.src = icons.check0;
                    td.appendChild(node);
                }
                node = $e.fn.create('img', 'tree-item-icon');
                node.src = this.parseImage('icon');
                td.appendChild(node);
            } else {
                if (!this.isRoot()) {
                    var nodes = this.shell.children;
                    var last = false;
                    var show = this.ownerView.showLine;
                    for (var j = 0; j < n; j++) {
                        last = (last || levelType[j]) && show;
                        nodes[j].src = last ? icons.empty : icons.line;
                    }
                    if (n >= 0) {
                        if (show) {
                            nodes[n].src = this.parseImage('line');
                        }
                        levelType[n] = this.isLast();
                    }
                }
                if (deep && this.children) {
                    for (var i = 0; i < this.children.length; i++) {
                        this.children[i].paintImage(levelType, deep);
                    }
                }
            }
        },

        /**
         * 解析图标路径
         * @private
         * @param {string} type 图标类型: line/icon/fill/check
         * @returns {string} 图标路径
         */
        parseImage: function (type) {
            var icons = this.ownerView.icons;
            if (type === 'line') {
                if (this.isLeaf()) {
                    return this.isLast() ? icons.lineLast : icons.lineLink;
                } else if (this.isLast()) {
                    return this.isExpand() ? icons.pathMinusLast : icons.pathPlusLast;
                } else {
                    return this.isExpand() ? icons.pathMinus : icons.pathPlus;
                }
            } else if (type === 'icon') {
                if (this.isLeaf()) {
                    return this.iconPath || icons.node;
                } else {
                    return this.isExpand() ? icons.pathOpen : icons.pathClose;
                }
            } else if (type === 'fill') {
                if (this.ownerView.showLine) {
                    return (this.parentCode && this.getParentItem().isLast()) ? icons.empty : icons.line;
                } else {
                    return icons.empty;
                }
            } else if (type === 'check') {
                var status = this.getCheckStatus();
                return icons['check' + status];
            }
        },

        /**
         * 判断是否为同级最后一个节点
         * @public
         * @returns {boolean} 是否为最后一个
         */
        isLast: function () {
            if (!this.isRoot()) {
                return this.getParentItem().getLastChild() === this;
            }
            return true;
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            this.ownerView = null;
            if (this.shell.parentNode) {
                this.shell.parentNode.removeChild(this.shell);
            }
            this.shell = this.body = this.header = null;
            if (this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].release();
                }
                this.children = null;
            }
        },

        /**
         * 复选框状态变更回调
         * @protected
         * @returns {void}
         */
        onChecked: function () {
        }
    };

    var plugin = {
        /**
         * 创建TreeGridView实例
         * @public
         * @param {Object} options 配置项
         * @returns {TreeGridView} TreeGridView实例
         */
        create: function (options) {
            return new TreeGridView(options);
        }
    };
    $e.ui.addViewPlugin('view_tree_grid', plugin);
}($e);