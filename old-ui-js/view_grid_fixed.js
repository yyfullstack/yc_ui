/**
 * @file 固定列数据表格视图组件
 * @description GridView的扩展，支持底部固定汇总行，保持列宽同步
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 固定列数据表格视图组件构造函数
     * @class FixedGridView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的数据对象名称
     * @param {Array} [options.fields=[]] - 字段配置数组
     * @param {Array} [options.header] - 表头配置
     * @param {boolean} [options.headerSort=true] - 是否启用表头排序
     * @param {Array} [options.fixHeader] - 固定表头配置
     * @param {string} [options.rowSelectType='single'] - 行选择类型：single/multi
     */
    function FixedGridView(options) {
        this.props = options || {};
        this.fields = {};
        this._handles = {};
        this.adoName = this.props['adoName'];
        this.leftFixHeader = this.props['fixHeader'];
        var fds = this.props['fields'] || [];
        for (var i = 0; i < fds.length; i++) {
            fds[i]['name'] = fds[i]['name'].toLowerCase();
            fds[i]._shell = this.createFieldShell(fds[i]);
        }
        this._is_sort_hd = $e.fn.getBoolean(this.props['headerSort'], true);
    }

    FixedGridView.prototype = {
        type: 'view_grid_fixed',
        _band_name: ['header_shell', 'header_table', 'data_shell', 'data_table', 'footer_shell', 'footer_table', 'sum_shell', 'sum_table'],

        /**
         * 判断左侧固定表头构建状态
         * @public
         * @returns {boolean} 是否为数组类型的固定表头
         */
        leftFixBuildStatus: function () {
            return Array.isArray(this.leftFixHeader);
        },

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.shell.id = $e.fn.nextID();
            this.rsth = {id: this.shell.id, start: false, ready: false};
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
            }
            this.body = this.shell.querySelector("[view-band=body]") || this.shell;
            this.initStruc(ado, true);
            if (this.body !== this.shell) {
                this.body.rsh = '100%';
            }
            this._band['data_shell'].rsh = '100%';
            this.setRowSelectType(this.props['rowSelectType']);
            this.bindListen($e.events.regEvent(this.getTable(), 'click', this, this.buildEdit));
            $e.fn.setStyle(this._band.data_shell, 'overflow:hidden;');
            this.bindListen($e.events.regEvent(this._band.sum_shell, 'scroll', this, this.syncScroll));

            if (ado && ado.isInited) {
                this.repaint();
                this.repaintFix();
            }
            this.initFlex();
            this._inited = true;
        },

        /**
         * 数据监听处理
         * @public
         * @param {Object} options - 事件选项
         * @returns {void}
         */
        doDataListen: function (options) {
            this.repaint(options);
            this.repaintFix(options);
        },

        /**
         * 同步滚动
         * @public
         * @param {Event} e - 滚动事件
         * @param {boolean} flag - 标志位
         * @returns {void}
         */
        syncScroll: function (e, flag) {
            var ds = this._band.data_shell;
            var hs = this._band.header_shell;
            var bs = this._band.sum_shell;
            if (ds && hs && bs) {
                hs.scrollLeft = ds.scrollLeft = bs.scrollLeft;
            }
        },

        /**
         * 初始化表格结构
         * @private
         * @param {Object} ado - 数据对象
         * @returns {void}
         */
        initStruc: function (ado) {
            var a = this._band_name;
            var band = {};
            for (var i = 0; i < a.length; i++) {
                band[a[i]] = this.shell.querySelector('[view-band=' + a[i] + ']');
            }
            band.header_group = band.header_table.querySelector('[colgroup]');
            band.data_group = band.data_table.querySelector('[colgroup]');
            band.fix_bottom_data_group = band.sum_table.querySelector('[colgroup]');

            if (!band['header_group']) {
                band.header_group = $e.fn.create('colgroup');
                band.header_table.appendChild(band.header_group);
            }
            if (!band.data_group) {
                band.data_group = $e.fn.create('colgroup');
                band.data_table.appendChild(band.data_group);
            }

            if (!band.fix_bottom_data_group) {
                band.fix_bottom_data_group = $e.fn.create('colgroup');
                band.sum_table.appendChild(band.fix_bottom_data_group);
            }

            this._band = band;
            this.buildHeader(this.props['header'], false);
            this.buildfixHeader(this.props['header'], false);

            this.initStrucEnd();
        },

        /**
         * 构建底部固定表头
         * @public
         * @param {Array|string} header - 表头配置 [[name,label,width],...]
         * @param {boolean} force - 是否强制重建
         * @returns {void}
         */
        buildfixHeader: function (header, force) {
            var tb_hd = this._band.sum_table;
            if (tb_hd) {
                var tr_last;
                if (tb_hd.rows.length > 0) {
                    tr_last = tb_hd.rows[tb_hd.rows.length - 1];
                    if (tr_last.cells.length > 0 && !force) {
                        return;
                    }
                    while (tr_last.cells.length > 0) {
                        tr_last.deleteCell(0);
                    }
                }
                if (!tr_last) {
                    tr_last = tb_hd.insertRow(-1);
                }
                if (typeof header === 'string') {
                    header = JSON.parse(header);
                }
                var fix_bottom_data_group = this._band.fix_bottom_data_group;
                $e.fn.setChild(fix_bottom_data_group, null);
                var name, c1;
                for (var i = 0; i < header.length; i++) {
                    header[i][2] = isNaN(header[i][2]) ? header[i][2] : (header[i][2] + 'px');
                    c1 = $e.fn.create('col');
                    $e.fn.setStyle(c1, 'width:' + header[i][2]);
                    fix_bottom_data_group.appendChild(c1);
                }
                this.mappingFixColumn(this.getADO());
            }
        },

        /**
         * 填充底部固定空行
         * @public
         * @param {HTMLTableRowElement} tr - 表格行
         * @returns {void}
         */
        fillFixEmptyRow: function (tr) {
            var cell;
            var cols = this._fix_data_index;
            for (var j = 0; j < cols.length; j++) {
                cell = tr.insertCell(-1);
                $e.fn.setLabelText(cell, ' ');
            }
        },

        /**
         * 映射固定列索引
         * @private
         * @param {Object} ado - 数据对象
         * @returns {void}
         */
        mappingFixColumn: function (ado) {
            var tb_hd = this._band.header_table;
            var data_index = [], column_name = [];
            var column_index = {};
            if (tb_hd && tb_hd.rows.length > 0) {
                var tr = tb_hd.rows[tb_hd.rows.length - 1];
                var name, cells = tr.cells;
                for (var i = 0; i < cells.length; i++) {
                    name = cells[i].getAttribute('data-name');
                    data_index.push(ado.getColumnIndex(name));
                    column_index[name] = i;
                    column_name[i] = name;
                }
            }
            this._fix_data_index = data_index;
            this._fix_column_index = column_index;
            this._fix_column_name = column_name;
        },

        /**
         * 获取底部表格
         * @public
         * @returns {HTMLTableElement} 底部表格
         */
        getBottomTable: function () {
            return this._band.sum_table;
        },

        /**
         * 重绘底部固定表格
         * @public
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        repaintFix: function (options) {
            options = options || {};
            var ado = options.ado = (options.ado || this.getADO());
            this.setEnable(this.validEnable(options));
            var fd = this.editField;
            var tr;
            var count = 1;
            var row = -1;
            var table = this.getBottomTable();

            this._selected_row = this._old_selected_row = this._will_select_row = -1;
            while (table.rows.length > 0) {
                table.deleteRow(table.rows.length - 1);
            }
            for (var i = 0; i < count; i++) {
                tr = table.insertRow(-1);
                this.fillFixEmptyRow(tr);
                tr.__rowid = ado.getRowID(i);
            }
            row = count > 0 ? 0 : -1;
            this.repainted(options);
        },

        /**
         * 同步表头宽度到固定列
         * @public
         * @param {string|number} columnname - 列名或列索引
         * @returns {void}
         */
        syncHeaderWidth: function (columnname) {
            var col = isNaN(columnname) ? this.getColumnIndex(columnname) : parseInt(columnname);
            if (col >= 0) {
                var header_group = this._band.header_group.children;
                var data_group = this._band.data_group.children;
                var fix_bottom_data_group = this._band.fix_bottom_data_group.children;
                var st = $e.fn.getStyle(header_group[col], 'width') + '';
                if (!isNaN(st)) {
                    st = st + 'px';
                }
                $e.fn.setStyle(data_group[col], 'width:' + st + 'px');
                $e.fn.setStyle(fix_bottom_data_group[col], 'width:' + st + 'px');
            }
        },

        /**
         * 鼠标移动处理（列宽调整）
         * @public
         * @param {Event} e - 鼠标事件
         * @param {Object} grid - 表格对象
         * @returns {boolean} 是否处理成功
         */
        move: function (e, grid) {
            var src = e.target || e.srcElement;
            if (this.rsth === src['rsth']) {
                var rsth = this.rsth;
                var children = this._band.header_group.children;
                if (rsth.start) {
                    var x = e.clientX;
                    if (!rsth.resizeE) {
                        if (x <= rsth.X) {
                            var e1, w1;
                            for (var i = rsth.col - 1; i >= 0; i--) {
                                w1 = $e.fn.realSize(children[i]).width;
                                if (w1 > 0) {
                                    rsth.resizeE = children[i];
                                    rsth.col = i;
                                    break;
                                }
                            }
                        } else {
                            rsth.col = rsth.col - 1;
                            rsth.resizeE = children[rsth.col];
                        }
                        if (!rsth.resizeE) {
                            if (rsth.col >= children.length) {
                                rsth.col = children.length - 1;
                            }
                            if (children.length > 0 && rsth.col >= 0) {
                                rsth.resizeE = children[rsth.col];
                            }
                        }
                        if (rsth.resizeE) {
                            rsth.width0 = rsth.width1 = parseInt($e.fn.getStyle(rsth.resizeE, 'width')) || parseInt(rsth.resizeE.style.width);
                        }
                    }
                    if (rsth.resizeE) {
                        var w = x - rsth.X + rsth.width0;
                        w = w < 0 ? 0 : w;
                        if (rsth.width1 !== w) {
                            rsth.width1 = w;
                            $e.fn.setStyle(rsth.resizeE, 'width:' + w + 'px');
                            $e.fn.setStyle(this._band.data_group.children[rsth.col], 'width:' + w + 'px');
                            $e.fn.setStyle(this._band.fix_bottom_data_group.children[rsth.col], 'width:' + w + 'px');
                        }
                    }
                } else {
                    var ofs;
                    rsth.ready = false;
                    rsth.resizeE = null;
                    if ($e.fn.hasClass(src, 'yc-view-grid-header-fixer')) {
                        ofs = $e.fn.getRelativeOffset(e, src);
                        if (ofs.offsetX <= 3) {
                            rsth.type = 2;
                            rsth.col = children.length;
                            rsth.ready = true;
                        }
                    } else {
                        var th = $e.fn.closest(src, {key: 'tagName', value: 'TH', end: 'TABLE'}, true);
                        if (th) {
                            ofs = $e.fn.getRelativeOffset(e, th);
                            var col = th.cellIndex + $e.fn.getInt(th.getAttribute('colspan'), 1) - 1;
                            if (Math.abs(th.offsetWidth - ofs.offsetX) <= 3) {
                                rsth.type = 1;
                                rsth.resizeE = children[col];
                                rsth.width0 = rsth.width1 = parseInt($e.fn.getStyle(rsth.resizeE, 'width')) || parseInt(rsth.resizeE.style.width);
                                rsth.col = col;
                                rsth.ready = true;
                            } else if (ofs.offsetX <= 3 && th.cellIndex > 0) {
                                rsth.type = 2;
                                rsth.col = col;
                                rsth.ready = true;
                            }
                        }
                    }
                    $e.fn.setStyle(this._band['header_shell'], 'cursor:' + (rsth.ready ? 'col-resize' : 'default'));
                }
                return false;
            }
            return true;
        }
    };

    var plugin = {
        /**
         * 创建固定列数据表格组件实例
         * @param {Object} options - 配置选项
         * @returns {FixedGridView} 固定列数据表格组件实例
         */
        create: function (options) {
            return new FixedGridView(options);
        }
    };

    $e.fn.extend($e.ui.getViewPlugin('view_grid').viewPrototype(), FixedGridView.prototype);
    $e.ui.addViewPlugin('view_grid_fixed', plugin);
}($e);