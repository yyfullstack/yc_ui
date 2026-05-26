/**
 * @file 树形视图组件
 * @description 支持层级数据展示、展开/折叠、复选框、节点选择、图标自定义等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var tree = $e.ui.createView('view_tree', {
 *     adoName: 'treeData',
 *     showLine: true,
 *     showCollapse: false,
 *     checkField: 'checked'
 * });
 */
+function ($e) {
    'use strict';

    var ICONS = {
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

    var CONST_KEY = {
        levelCode: 'levelCode',
        label: 'label',
        splitChar: '.',
        leaf: 'leaf'
    };

    /**
     * 树形视图组件构造函数
     * @class TreeView
     * @param {Object} options - 配置选项
     * @param {string} options.adoName - 绑定的数据对象名称
     * @param {boolean} [options.showLine=true] - 是否显示连接线
     * @param {boolean} [options.showCollapse=false] - 是否显示折叠按钮
     * @param {string} [options.checkField] - 复选框字段名
     */
    function TreeView(options) {
        this.props = options || {};
        this.adoName = this.props.adoName;
        this.showLine = $e.fn.getBoolean(this.props.showLine, true);
        this.showCollapse = $e.fn.getBoolean(this.props.showCollapse, false);
        this.checkField = this.props.checkField;
    }

    TreeView.prototype = {
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
        isExpandAll: false,
        handle: 0,
        locked: false,

        icons: null,
        itemConst: null,

        init: function () {
            this.items = {};
            this.keyItems = {};
            this.icons = $e.fn.extend(ICONS, {});
            this.initKeys();
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({
                    context: this,
                    method: this.doDataListen
                });
            }
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.handle = this.bindListen($e.events.regEvent(
                this.body,
                this.body.getAttribute('data-event') || 'click',
                this,
                this.doAction
            ));
            var options = {
                shell: $e.fn.create('div', 'tree-item'),
                body: $e.fn.create('div', 'tree-item-body'),
                header: $e.fn.create('div', 'tree-item-header hide'),
                parentCode: '',
                level: -1
            };
            options.shell.appendChild(options.header);
            options.shell.appendChild(options.body);
            this.root = new TreeItem(this, options);
            this.body.appendChild(options.shell);
            this.createFastButton();

            if (ado && ado.isInited) {
                this.repaint();
            }
        },

        doDataListen: function (options) {
            var type = options.eventType;
            if (type === ado_status.REFRESH) {
                return this.repaint(options);
            } else if (type === ado_status.ROW_ADD) {
                this.addItem(this.buildItem(options.row), true);
            } else if (type === ado_status.ROW_EDIT) {
                this.editItem(options);
            } else if (type === ado_status.ROW_DELETE) {
                this.removeItem(options);
            }
        },

        repaint: function (options) {
            if (!this.locked) {
                try {
                    this.locked = true;
                    var ado = this.getADO();
                    ado.sort(this.itemConst.levelCode, 1);
                } catch (e) {
                    alert(e);
                } finally {
                    this.locked = false;
                }
            } else {
                this.resetItem();
                var ado = this.getADO();
                if (ado) {
                    var count = ado.getRowsCount();
                    for (var i = 0; i < count; i++) {
                        this.addItem(this.buildItem(i));
                    }
                    this.root.repaint(null, true);
                }
                this.root.expand(true, 'down', 0);
                this.root.paintImage([], true);
            }
            this.repainted(options);
            return true;
        },

        repainted: function (options) {
        },

        initKeys: function () {
            if (!this.itemConst) {
                this.itemConst = $e.fn.extend(CONST_KEY, {});
            }
        },

        buildItem: function (row, ado) {
            ado = ado || this.getADO();
            var item = {
                shell: $e.fn.create('div', 'tree-item'),
                header: $e.fn.create('div', 'tree-item-header'),
                rowid: ado.getRowID(row),
                method: null
            };
            item.shell.appendChild(item.header);
            $e.fn.extend(this.buildItemProperties(ado, row, item), item, true);
            return this.createItem(item);
        },

        defaultItemProperties: function (ado, row) {
            var ic = this.itemConst;
            var item = {
                leaf: $e.fn.getBoolean(ado.getValueAt(row, ic.leaf)),
                label: ado.getValueAt(row, ic.label)
            };
            this.parseLevelCode(ado.getValueAt(row, ic.levelCode), item);
            if (this.checkField) {
                item.checked = $e.fn.getBoolean(ado.getValueAt(row, this.checkField)) ? 1 : 0;
            }
            return item;
        },

        buildItemProperties: function (ado, row, item) {
            var ps = this.defaultItemProperties(ado, row, item);
            return ps;
        },

        createItem: function (props) {
            return new TreeItem(this, props);
        },

        parseLevelCode: function (levelCode, props) {
            levelCode = levelCode || '';
            var i = levelCode.lastIndexOf(this.itemConst.splitChar);
            props.levelCode = levelCode;
            props.parentCode = (i >= 0) ? levelCode.substring(0, i) : '';
        },

        addItem: function (item, paint) {
            var item1 = item.getParentItem();
            item1.addChild(item, true);
            this.items['' + item.rowid] = item;
            this.keyItems[item.levelCode] = item;
            if (paint) {
                item1.getTopItem().paintImage([], true);
            }
            return true;
        },

        editItem: function (options) {
            var item = this.getItem(options.rowid);
            if (item) {
                var props = this.buildItemProperties(options.ado, options.row, item);
                this.parseLevelCode(options.ado.getValueAt(options.row, this.itemConst.levelCode), props);
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

        removeItem: function (options, release) {
            var rowid = (options instanceof TreeItem) ? options.rowid : options.rowData.__rowid;
            var item = this.items['' + rowid];
            if (item) {
                var p = item.getParentItem();
                if (p) {
                    delete this.keyItems[item.levelCode];
                    delete this.items['' + rowid];
                    p.removeChild(item);
                    if (p !== this.root) {
                        p.getTopItem().paintImage([], true);
                    }
                    return true;
                }
            }
            return false;
        },

        getItem: function (rowid) {
            return this.items[rowid + ''];
        },

        findItem: function (key, value) {
            if (arguments.length === 1) {
                if (typeof key === 'function') {
                    for (var i in this.items) {
                        if (key(this.items[i])) {
                            return this.items[i];
                        }
                    }
                } else {
                    return key ? this.keyItems[key] : null;
                }
            }
            for (var j in this.items) {
                if (this.items[j][key] === value) {
                    return this.items[j];
                }
            }
            return null;
        },

        queryItem: function (event) {
            return $e.fn.queryOwner(event, true);
        },

        resetItem: function () {
            this.root.clearChildren();
            this.items = {};
            this.keyItems = {};
        },

        getSelectedItem: function () {
            return this.currentItem;
        },

        getCheckedItems: function (keyOrKeys) {
            return this.root.getCheckedItems(null, keyOrKeys);
        },

        expand: function (item, isOpen, level) {
            if (item) {
                item.expand(isOpen, 'down', level);
            }
        },

        expandAll: function () {
            this.isExpandAll = true;
            this.expand(this.root, true, -1);
        },

        collapseAll: function () {
            this.isExpandAll = false;
            this.expand(this.root, false, -1);
        },

        fastExpand: function (event, button) {
            var icon = button.querySelector('I');
            icon.removeAttribute('class');
            if (this.isExpandAll) {
                this.collapseAll();
                $e.fn.addClass(icon, 'fa fa-expand');
            } else {
                this.expandAll();
                $e.fn.addClass(icon, 'fa fa-compress');
            }
        },

        createFastButton: function () {
            if (this.showCollapse === false) {
                return;
            }
            var shell = $e.fn.create('div', '', {
                style: 'position: absolute;right: 1px;top: 1px;z-index: 10'
            });
            var button = $e.fn.create(
                'button',
                'develop-btn',
                {
                    style: 'padding: 0 5px;display: block;margin-bottom: 4px;height: 20px;'
                }
            );
            button.innerHTML = "<i style='' class='fa fa-expand'></i>";
            this.bindListen($e.events.regEvent(button, 'click', this, this.fastExpand, button));
            shell.appendChild(button);
            this.shell.appendChild(shell);
        },

        autoExpand: function (item) {
            if (item) {
                this.expand(item, !item.isExpand());
            }
        },

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
                }
                if (!$e.fn.hasClass(node, 'tree-item-link')) {
                    this.setSelectedItem(event, item);
                }
            }
            return true;
        },

        acceptCheckedData: function (values, nostope) {
            values = values || {
                checked: '1',
                unchecked: '0'
            };
            var stope = !nostope;
            var ado = this.getADO();
            var item;
            var row;
            var ids = {};
            var rowCount = ado.getRowsCount();
            for (var i = 0; i < rowCount; i++) {
                ids['' + ado.getRowID(i)] = i;
            }
            for (var j in this.items) {
                item = this.items[j];
                row = ids[item.rowid];
                ado.setValueAt(row, this.checkField,
                    (item.isChecked() ? values.checked : values.unchecked),
                    stope);
            }
        },

        isEnable: function (options) {
            return true;
        },

        setSelectedItem: function (event, item, stope) {
            if (item === undefined) {
                item = event;
                event = null;
            }
            if (this.currentItem && this.currentItem !== item) {
                this.currentItem.setSelected(event, false, stope);
            }
            this.currentItem = item;
            var r = true;
            if ((item.setSelected(event, true, stope) !== false) && !stope) {
                r = !(this.done(event, item) === false);
            }
            this.oldItem = item;
            return r;
        },

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

        isItemLabel: function (node) {
            return node && $e.fn.hasClass(node, 'tree-item-label');
        },

        done: function (event, item) {
            return true;
        }
    };

    /**
     * 树节点构造函数
     * @class TreeItem
     * @param {TreeView} view - 所属树视图
     * @param {Object} options - 节点配置
     */
    function TreeItem(view, options) {
        $e.fn.extend(options, this, true);
        $e.ui.initViewCell(this, view);
        this.shell.$owner = this;
        this.ownerView = view;
    }

    TreeItem.prototype = {
        ownerType: 'tree-item',
        ownerView: null,
        shell: null,
        header: null,
        body: null,

        rowid: null,
        leaf: true,
        label: null,
        levelCode: '',
        parentCode: '',

        children: null,
        checked: false,
        selected: false,
        expanded: false,

        isLeaf: function () {
            return this.leaf;
        },

        getFirstChild: function () {
            var c = this.children;
            if (c && c.length > 0) {
                return c[0];
            }
            return this.getChild(0);
        },

        getLastChild: function () {
            var c = this.children;
            if (c && c.length > 0) {
                return c[c.length - 1];
            }
            return null;
        },

        changeParent: function (parentCode) {
            var splitChar = this.ownerView.itemConst.splitChar;
            this.parentCode = parentCode;
            var i = this.levelCode.lastIndexOf(splitChar);
            delete this.ownerView.keyItems[this.levelCode];
            if (i >= 0) {
                this.levelCode = (parentCode.length > 0)
                    ? parentCode + this.levelCode.substring(i)
                    : this.levelCode.substring(i + 1);
            } else {
                this.levelCode = (parentCode.length > 0)
                    ? parentCode + splitChar + this.levelCode
                    : this.levelCode;
            }
            this.ownerView.keyItems[this.levelCode] = this;
            if (this.children) {
                var childrenLen = this.children.length;
                for (var j = 0; j < childrenLen; j++) {
                    this.children[j].changeParent(this.levelCode);
                }
            }
            this.repaint(null, false);
        },

        repaint: function (options, isDown) {
            if (options) {
                $e.fn.extend(options, this, true);
            }
            $e.fn.setChild(this.header, null);
            this.paintImage(null, isDown);
            var label = this.createLabel();
            if (label) {
                this.header.appendChild(label);
            }
            if (isDown) {
                if (this.children) {
                    var childrenLen = this.children.length;
                    for (var i = 0; i < childrenLen; i++) {
                        this.children[i].repaint(null, isDown);
                    }
                }
            }
        },

        createLabel: function () {
            var label = $e.fn.create('span', 'tree-item-label');
            label.textContent = this.label;
            return label;
        },

        addChild: function (child, paint) {
            if (!this.children) {
                this.children = [];
            }
            if (this.children.indexOf(child) < 0) {
                this.children.push(child);
                if (!this.body) {
                    this.body = $e.fn.create('div', 'tree-item-body hide');
                    this.shell.appendChild(this.body);
                }
                this.body.appendChild(child.shell);
                if (paint) {
                    child.repaint();
                }
            }
        },

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

        clearChildren: function () {
            this.children = [];
            $e.fn.setChild(this.body, null);
        },

        getChild: function (n) {
            return this.children ? this.children[n] : null;
        },

        getLevel: function () {
            return this.levelCode
                ? ($e.fn.countChar(this.levelCode, this.ownerView.itemConst.splitChar) + 1)
                : 0;
        },

        getTopItem: function () {
            var i = this.levelCode.indexOf(this.ownerView.itemConst.splitChar);
            var s = (i >= 0) ? this.levelCode.substring(0, i) : null;
            return s ? this.ownerView.findItem(s) : this;
        },

        getParentItem: function () {
            return this.ownerView.findItem(this.parentCode) || this.ownerView.root;
        },

        expand: function (isExpand, forward, level) {
            this.expanded = isExpand;
            if (this.body && this.children) {
                if (this === this.ownerView.root && !isExpand) {
                    var childrenLen = this.children.length;
                    for (var i = 0; i < childrenLen; i++) {
                        this.children[i].expand(isExpand, 'down', level);
                    }
                    return;
                } else {
                    $e.fn.showElement(this.body, isExpand && this.children.length > 0);
                }
            }
            if (arguments.length > 1) {
                if (forward === 'up' || forward === 'all') {
                    if (this.parentCode) {
                        this.getParentItem().expand(isExpand, 'up');
                    }
                }
                level = level || 0;
                if ((forward === 'down' || forward === 'all') && this.children && level !== 0) {
                    level--;
                    var childrenLen2 = this.children.length;
                    for (var j = 0; j < childrenLen2; j++) {
                        this.children[j].expand(isExpand, 'down', level);
                    }
                }
            }
            var img = this.header.querySelector('.tree-item-link');
            if (img) {
                img.src = this.parseImage('line');
            }
            img = this.header.querySelector('.tree-item-icon');
            if (img) {
                img.src = this.parseImage('icon');
            }
        },

        isExpand: function () {
            return this.expanded;
        },

        isRoot: function () {
            return this.ownerView.root === this;
        },

        setChecked: function (checked, forward) {
            this.checked = (typeof checked === 'boolean') ? (checked ? 1 : 0) : checked;
            if (forward === 'down' || forward === 'all') {
                if (this.children) {
                    var childrenLen = this.children.length;
                    for (var i = 0; i < childrenLen; i++) {
                        this.children[i].setChecked(checked ? 1 : 0, 'down');
                    }
                }
            }
            if (forward === 'up') {
                this.checked = this.getCheckStatus(true);
            }
            if (this.parentCode && (forward === 'up' || forward === 'all')) {
                this.getParentItem().setChecked(this.checked, 'up');
            }
            var node = this.header.querySelector('.tree-item-check');
            if (node) {
                node.src = this.parseImage('check');
            }
            this.onChecked();
        },

        isChecked: function () {
            return !!this.checked;
        },

        getCheckStatus: function (child) {
            if (this.isChecked() || child) {
                var chd = this.children;
                var c = 0;
                if (chd && chd.length > 0) {
                    var chdLen = chd.length;
                    for (var i = 0; i < chdLen; i++) {
                        if (chd[i].isChecked()) {
                            c++;
                        }
                    }
                    return c === 0
                        ? (this.isChecked() ? 2 : 0)
                        : (c === chdLen ? 1 : 2);
                }
                return this.checked;
            }
            return 0;
        },

        getCheckedItems: function (as, keyOrKeys) {
            as = as || [];
            if (this.checked || this.isRoot()) {
                if (!this.isRoot()) {
                    if (keyOrKeys) {
                        var k;
                        if (keyOrKeys instanceof Array) {
                            k = {};
                            for (var i = 0, keysLen = keyOrKeys.length; i < keysLen; i++) {
                                k[keyOrKeys[i]] = this[keyOrKeys[i]];
                            }
                        } else {
                            k = this[keyOrKeys];
                        }
                        as.push(k);
                    } else {
                        as.push(this);
                    }
                }
                var c = this.children;
                for (var j = 0; j < c.length; j++) {
                    c[j].getCheckedItems(as);
                }
            }
            return as;
        },

        setSelected: function (event, selected, stope) {
            if (selected === undefined) {
                selected = event;
                event = null;
            }
            var label = this.shell.querySelector('.tree-item-label');
            if (label) {
                if (selected) {
                    $e.fn.addClass(label, 'tree-item-checked');
                } else {
                    $e.fn.removeClass(label, 'tree-item-checked');
                }
            }
            this.selected = selected;
            if (!stope) {
                return this.onSelected(event, selected);
            }
            return true;
        },

        onSelected: function (event, selected) {
            return selected ? this.done(event) : true;
        },

        isSelected: function () {
            return this.selected;
        },

        scrollVisible: function (show) {
            this.expand(true, 'up');
            this.getShell().offsetParent.scrollTop = this.getShell().offsetTop;
        },

        done: function (event) {
            return true;
        },

        paintImage: function (levelType, deep) {
            var path;
            var n = this.getLevel() - 1;
            var node;
            var icons = this.ownerView.icons;
            if (!levelType) {
                path = icons.empty;
                for (var j = 0; j < n; j++) {
                    node = $e.fn.create('img');
                    node.src = path;
                    this.header.appendChild(node);
                }
                if (this.ownerView.showLine) {
                    node = $e.fn.create('img', 'tree-item-link');
                    node.src = path;
                    this.header.appendChild(node);
                }
                if (this.ownerView.checkField) {
                    node = $e.fn.create('img', 'tree-item-check');
                    node.src = icons['check_' + this.getCheckStatus()];
                    this.header.appendChild(node);
                }
                node = $e.fn.create('img', 'tree-item-icon');
                node.src = this.parseImage('icon');
                this.header.appendChild(node);
            } else {
                if (!this.isRoot()) {
                    var nodes = this.header.children;
                    var last = false;
                    var show = this.ownerView.showLine;
                    for (var k = 0; k < n; k++) {
                        last = (last || levelType[k]) && show;
                        nodes[k].src = last ? icons.empty : icons.line;
                    }
                    if (n >= 0) {
                        if (show) {
                            nodes[n].src = this.parseImage('line');
                        }
                        levelType[n] = this.isLast();
                    }
                }
                if (deep && this.children) {
                    var childrenLen = this.children.length;
                    for (var m = 0; m < childrenLen; m++) {
                        this.children[m].paintImage(levelType, deep);
                    }
                }
            }
        },

        parseImage: function (type) {
            var img = this.getImage(type);
            if (!img) {
                var icons1 = this.ownerView.icons;
                if (type === 'line') {
                    if (this.isLeaf()) {
                        img = this.isLast() ? icons1.lineLast : icons1.lineLink;
                    } else if (this.isLast()) {
                        img = this.isExpand() ? icons1.pathMinusLast : icons1.pathPlusLast;
                    } else {
                        img = this.isExpand() ? icons1.pathMinus : icons1.pathPlus;
                    }
                } else if (type === 'icon') {
                    if (this.isLeaf()) {
                        img = icons1.node;
                    } else {
                        img = this.isExpand() ? icons1.pathOpen : icons1.pathClose;
                    }
                } else if (type === 'fill') {
                    if (this.ownerView.showLine) {
                        img = (this.parentCode && this.getParentItem().isLast())
                            ? icons1.empty
                            : icons1.line;
                    } else {
                        img = icons1.empty;
                    }
                } else if (type === 'check') {
                    var status = this.getCheckStatus();
                    img = icons1['check_' + status];
                }
            }
            return img;
        },

        getImage: function (type) {
            return null;
        },

        isLast: function () {
            if (!this.isRoot()) {
                return this.getParentItem().getLastChild() === this;
            }
            return true;
        },

        getOwnerView: function () {
            return this.ownerView;
        },

        release: function () {
            if (this.shell.parentNode) {
                this.shell.parentNode.removeChild(this.shell);
            }
            if (this.children) {
                var childrenLen = this.children.length;
                for (var i = 0; i < childrenLen; i++) {
                    this.children[i].release();
                }
                this.children = null;
            }
            this.ownerView = null;
            this.shell = this.shell.$owner = this.body = this.header = null;
        },

        onChecked: function (checked) {
        },

        getRowID: function () {
            return this.rowid;
        }
    };

    var plugin = {
        create: function (options) {
            return new TreeView(options);
        }
    };

    $e.ui.addViewPlugin('view_tree', plugin);
}($e);