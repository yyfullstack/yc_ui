/**
 * @file 数据表格视图组件
 * @description GridView内的容器必需是table，可以使用坐标或命名位置定位。
 *              支持数据绑定、行选择、单元格编辑、表头排序、列宽调整、合计行等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var grid = $e.ui.createView('view_grid', {
 *     adoName: 'data1',
 *     header: [['id', '编号', '100px'], ['name', '姓名', '150px']],
 *     fields: [{ name: 'name', type: 'input' }],
 *     rowSelectType: 'single'
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 数据表格视图组件构造函数
     * @class GridView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的数据对象名称
     * @param {Array} [options.fields=[]] - 字段配置数组
     * @param {Array} [options.header] - 表头配置
     * @param {boolean} [options.headerSort=true] - 是否启用表头排序
     * @param {string} [options.rowSelectType='single'] - 行选择类型：single/multi
     * @param {boolean} [options.autoSelectAddRow=true] - 新增行是否自动选中
     * @param {Object} [options.sumBand] - 合计行配置
     */
    function GridView(options) {
        this.props = options || {};
        this.fields = {};
        this.handles = {};
        this.adoName = this.props.adoName;

        // 创建编辑组件
        var fieldList = this.props.fields || [];
        if (fieldList instanceof Array) {
            for (var i = 0; i < fieldList.length; i++) {
                fieldList[i].name = fieldList[i].name.toLowerCase();
                fieldList[i].fieldShell = this.createFieldShell(fieldList[i]);
            }
        }
        this.isSortHeader = $e.fn.getBoolean(this.props.headerSort, true);
    }

    /**
     * GridView中，提供的所有函数的参数以及返回值，涉及到的行，不包括起始行（即用来定义行宽度的行）
     */
    GridView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_grid',
        adoName: null,
        fields: null,
        enable: false,
        locked: false,
        rowSelectType: '1', // 单选
        editField: null,
        autoSelectAddRow: true,
        fillZeroBlank: false, // 为数字0，填充空白内容

        // 区域名称定义
        bandNames: [
            'header_shell',
            'header_table',
            'data_shell',
            'data_table',
            'sum_shell',
            'sum_table'
        ],
        band: null,
        keyTypes: {
            text: 1,
            number: 1,
            int: 1,
            date: 1
        },
        rowListen: null,
        rowListening: null,
        editListening: null,

        // 数据索引
        dataIndex: null, // [],列对应的数据对象的列号
        columnIndex: null, // [],列名对应的数据table的列号
        columnName: null,
        sortTh: null, // desc
        oldSelectedRow: -1,
        selectedRow: -1,
        willSelectRow: -1,
        willEditCol: -1,
        inited: false,
        sumCells: null,
        defaultDataClass: {
            string: 'data-text',
            text: 'data-text',
            number: 'data-number',
            decimal: 'data-number',
            float: 'data-number',
            double: 'data-number',
            int: 'data-int',
            long: 'data-int',
            date: 'data-date',
            datetime: 'data-date',
            cbx: 'data-cbx'
        },

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.shell.id = $e.fn.nextID();
            this.rsth = {
                id: this.shell.id,
                start: false,
                ready: false
            };
            var ado = this.getADO();
            if (ado) {
                // 必须绑定一个数据对象
                this.dataListenHandle = ado.addListen({
                    context: this,
                    method: this.doDataListen
                });
            }
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.initStruc(ado);
            if (this.body !== this.shell) {
                this.body.rsh = '100%';
            }
            this.band.data_shell.rsh = '100%';
            this.setRowSelectType(this.props.rowSelectType);
            this.bindListen(
                $e.events.regEvent(this.getTable(), 'click', this, this.buildEdit)
            );
            if (this.band.sum_shell) {
                this.bindListen(
                    $e.events.regEvent(
                        this.band.sum_shell,
                        'scroll',
                        this,
                        this.syncScroll
                    )
                );
            } else {
                this.bindListen(
                    $e.events.regEvent(
                        this.band.data_shell,
                        'scroll',
                        this,
                        this.syncScroll
                    )
                );
            }
            if (ado && ado.isInited) {
                this.repaint();
            }
            this.initFlex();
            this.inited = true;
        },

        /**
         * 创建字段外壳
         * @private
         * @param {Object} options - 字段配置
         * @returns {HTMLElement} 字段外壳元素
         */
        createFieldShell: function (options) {
            var shell = $e.fn.create('div', 'field');
            if (options.html) {
                shell.innerHTML = options.html;
            }
            return shell;
        },

        /**
         * 组件值变动事件
         * @public
         * @param {Event} event - 事件对象
         * @param {Object} field - 字段对象
         * @returns {boolean} 是否成功
         */
        acceptChanged: function (event, field) {
            field = field || event;
            if (this.editField && field === this.editField) {
                var place = this.queryPlace(field.getShell());
                if (!this.locked && field.col >= 0 && place) {
                    var ado = this.getADO();
                    var row = ado.findRowByRowID(field.rowid);
                    if (row >= 0) {
                        return ado.setValueAt(row, field.col, field.getValue());
                    }
                }
            }
            return false;
        },

        /**
         * 初始化表格结构
         * @private
         * @param {Object} ado - 数据对象
         * @returns {void}
         */
        initStruc: function (ado) {
            // 获取表头table和数据table，每个table必须都包含colgroup，colgroup不能有元素
            var bandNames = this.bandNames;
            var band = {};
            for (var i = 0; i < bandNames.length; i++) {
                band[bandNames[i]] = this.shell.querySelector('[view-band="' + bandNames[i] + '"]');
            }
            band.headerGroup = band.header_table.querySelector('[colgroup]');
            band.dataGroup = band.data_table.querySelector('[colgroup]');
            if (!band.headerGroup) {
                band.headerGroup = $e.fn.create('colgroup');
                band.header_table.appendChild(band.headerGroup);
            }
            if (!band.dataGroup) {
                band.dataGroup = $e.fn.create('colgroup');
                band.data_table.appendChild(band.dataGroup);
            }
            this.band = band;
            if (band.sum_table) {
                // data_shell加上overflow:hidden;
                $e.fn.setStyle(this.band.data_shell, 'overflow:auto;');
                $e.fn.setStyle(this.band.data_shell, 'overflow-x:hidden;');
                // 合计区
                band.sumGroup = band.sum_table.querySelector('[colgroup]');
                if (!band.sumGroup) {
                    band.sumGroup = $e.fn.create('colgroup');
                    band.sum_table.appendChild(band.sumGroup);
                }
            }
            this.buildHeader(this.props.header, false);
            this.initSumBand(this.props.sumBand);
            var fd;
            var fieldList = this.props.fields || [];
            for (var j = 0; j < fieldList.length; j++) {
                fd = this.bindField(fieldList[j].fieldShell, fieldList[j]);
                if (fd.getType() in this.keyTypes && fd.field) {
                    fd.bindListen(
                        $e.events.regEvent(fd.field, 'keydown', this, this.nextCell)
                    );
                }
                delete fieldList[j].fieldShell;
            }
            if (this.isSortHeader) {
                this.bindListen(
                    $e.events.regEvent(
                        band.header_table,
                        'dblclick',
                        this,
                        this.sortHeader
                    )
                );
            }
            var self = this;
            setTimeout(function () {
                self.initStrucEnd();
            }, 10);
        },

        /**
         * 结构初始化结束回调
         * @public
         * @returns {void}
         */
        initStrucEnd: function () {
            // 子类可覆盖
        },

        /**
         * 构建表头
         * @public
         * @param {Array|string} header - 表头配置 [[name,label,width],...]
         * @param {boolean} force - 是否强制重建
         * @returns {void}
         */
        buildHeader: function (header, force) {
            var tableHeader = this.band.header_table;
            if (tableHeader) {
                loop: {
                    var trLast = null;
                    if (tableHeader.rows.length > 0) {
                        trLast = tableHeader.rows[tableHeader.rows.length - 1];
                        if (trLast.cells.length > 0 && !force) {
                            break loop;
                        }
                        while (trLast.cells.length > 0) {
                            trLast.deleteCell(0);
                        }
                    }
                    if (!trLast) {
                        trLast = tableHeader.insertRow(-1);
                    }
                    if (typeof header === 'string') {
                        header = JSON.parse(header);
                    }
                    var headerGroup = this.band.headerGroup;
                    var dataGroup = this.band.dataGroup;
                    var sumGroup = this.band.sumGroup;
                    $e.fn.setChild(headerGroup, null);
                    $e.fn.setChild(dataGroup, null);
                    if (sumGroup) {
                        $e.fn.setChild(sumGroup, null);
                    }
                    var name;
                    var col;
                    for (var i = 0; i < header.length; i++) {
                        name = header[i][0];
                        col = this.createHeaderCell(i);
                        col.setAttribute('data-name', name);
                        col.rsth = this.rsth;
                        col.innerHTML = header[i][1] || ' ';
                        trLast.appendChild(col);

                        col = $e.fn.create('col');
                        header[i][2] = isNaN(header[i][2])
                            ? header[i][2]
                            : header[i][2] + 'px';
                        $e.fn.setStyle(col, 'width:' + header[i][2]);
                        headerGroup.appendChild(col);

                        col = $e.fn.create('col');
                        $e.fn.setStyle(col, 'width:' + header[i][2]);
                        dataGroup.appendChild(col);

                        if (sumGroup) {
                            col = $e.fn.create('col');
                            $e.fn.setStyle(col, 'width:' + header[i][2]);
                            sumGroup.appendChild(col);
                        }
                    }
                }
                this.mappingColumn(this.getADO());
            }
        },

        /**
         * 添加合并表头
         * @public
         * @param {number} height - 表头高度
         * @returns {void}
         */
        addHeader: function (height) {
            var heightValue = Number(height) || 30;
            var tableHeader = this.band.header_table;
            var cells = tableHeader.rows[0].cells;
            var tbody = tableHeader.querySelector('tbody');

            var tr = $e.fn.create('tr');
            $e.fn.setStyle(tr, 'height:' + heightValue + 'px');
            for (var i = 0; i < cells.length; i++) {
                var th = this.createHeaderCell(i);
                tr.appendChild(th);
                th.rsth = this.rsth;
            }
            tbody.insertBefore(tr, tbody.childNodes[0]);
            this.headerNum = this.headerNum || 1;
            this.headerNum += 1;

            // hack for flex-container
            var self = this;
            setTimeout(function () {
                var position = $e.fn.getStyle(self.band.data_shell, 'position');
                if (position === 'absolute') {
                    var hackTop = self.headerNum * heightValue;
                    $e.fn.setStyle(self.band.data_shell, 'top:' + hackTop + 'px;');
                }
            }, 0);
        },

        /**
         * 创建表头单元格
         * @private
         * @param {number} col - 列索引
         * @returns {HTMLElement} 表头单元格
         */
        createHeaderCell: function (col) {
            return $e.fn.create('th', 'grid-hd-cell');
        },

        /**
         * 合并表头单元格
         * @public
         * @param {number} row - 起始行
         * @param {number} col - 起始列
         * @param {number} rows - 合并行数
         * @param {number} cols - 合并列数
         * @param {string} txt - 文本内容
         * @returns {void}
         */
        spanHeader: function (row, col, rows, cols, txt) {
            if (row >= 0) {
                var tableHeader = this.band.header_table;
                var tr = tableHeader.rows[row];
                var cell = tr.cells[col];
                if (rows > 0) {
                    cell.rowSpan = rows;
                }
                if (cols > 0) {
                    cell.colSpan = cols;
                }
                var rowsCount = rows--;
                var colsCount = cols--;
                if (!txt) {
                    txt = $e.fn.getLabelText(cell);
                }
                for (var i = 0; i < rowsCount; i++) {
                    var delRow = tableHeader.rows[row + i];
                    for (var j = 0; j < colsCount; j++) {
                        var delCell = delRow.cells[col + j];
                        if (delCell !== tableHeader.rows[row].cells[col]) {
                            if (!txt) {
                                txt = delCell.innerHTML;
                            }
                            $e.fn.addClass(delCell, 'hide');
                        }
                    }
                }
                this.setHeaderText(row, col, txt);
            }
        },

        /**
         * 设置表头文本
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {string} text - 文本内容
         * @returns {void}
         */
        setHeaderText: function (row, col, text) {
            text = text || ' ';
            var tableHeader = this.band.header_table;
            tableHeader.rows[row].cells[col].innerHTML = text;
        },

        /**
         * 设置表头列宽
         * @public
         * @param {Array} array - 列宽数组
         * @returns {void}
         */
        setHeaderWidths: function (array) {
            var header = [
                this.band.headerGroup,
                this.band.dataGroup,
                this.band.sumGroup
            ];
            var colgroup;
            for (var i = 0; i < header.length; i++) {
                if (header[i]) {
                    colgroup = header[i].querySelectorAll('col');
                    for (var j = 0; j < colgroup.length; j++) {
                        $e.fn.setStyle(
                            colgroup[j],
                            'width:' +
                            array[j] +
                            ((array[j] + '').endsWith('px') || array[j] === 'auto'
                                ? ''
                                : 'px')
                        );
                    }
                }
            }
        },

        /**
         * 初始化列宽调整
         * @private
         * @returns {void}
         */
        initFlex: function () {
            this.bindListen(
                $e.events.regEvent(document, 'mousemove', this, this.move)
            );
            this.bindListen($e.events.regEvent(document, 'mouseup', this, this.end));
            this.bindListen(
                $e.events.regEvent(
                    this.band.header_shell,
                    'mousedown',
                    this,
                    this.start
                )
            );
            var fixer = this.band.header_shell.querySelector(
                '.yc-view-grid-header-fixer'
            );
            if (fixer) {
                fixer.rsth = this.rsth;
            }
        },

        /**
         * 映射列索引
         * @private
         * @param {Object} ado - 数据对象
         * @returns {void}
         */
        mappingColumn: function (ado) {
            var tableHeader = this.band.header_table;
            var dataIndex = [];
            var columnName = [];
            var columnIndex = {};
            if (tableHeader && tableHeader.rows.length > 0) {
                var tr = tableHeader.rows[tableHeader.rows.length - 1];
                var name;
                var cells = tr.cells;
                for (var i = 0; i < cells.length; i++) {
                    name = cells[i].getAttribute('data-name');
                    name = name.toLowerCase();
                    dataIndex.push(ado.getColumnIndex(name));
                    columnIndex[name] = i;
                    columnName[i] = name;
                }
            }
            this.dataIndex = dataIndex;
            this.columnIndex = columnIndex;
            this.columnName = columnName;
        },

        /**
         * 修改视图属性
         * @public
         * @param {string} name - 属性名
         * @param {*} value - 属性值
         * @returns {void}
         */
        changeViewPropery: function (name, value) {
            if (!this.inited) {
                this.props[name] = value;
            } else {
                if (name === 'header') {
                    this.buildHeader(value, true);
                }
            }
        },

        /**
         * 获取数据表格
         * @public
         * @returns {HTMLTableElement} 数据表格
         */
        getTable: function () {
            return this.band.data_table;
        },

        /**
         * 设置选择方式
         * @public
         * @param {string} type - 选择类型：single/multi/0/1
         * @returns {void}
         */
        setRowSelectType: function (type) {
            type = type || 'single';
            type = (type === 'single' || type === '1' || type === 1) ? '1' : '0';
            this.rowSelectType = type;
            if (type === '1') {
                this.willEditCol = -1;
                this.setSelectedRow(0);
            }
        },

        /**
         * 填充单元格样式
         * @public
         * @param {HTMLElement} cell - 单元格元素
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {*} value - 单元格值
         * @param {string} datatype - 数据类型
         * @returns {void}
         */
        fillCellStyle: function (cell, row, col, value, datatype) {
            var cls = this.defaultDataClass[datatype];
            if (cls) {
                $e.fn.addClass(cell, cls);
            }
            var st = this.getCellStyle(row, col, value, datatype);
            if (st) {
                $e.fn.setStyle(cell, st);
            }
        },

        /**
         * 获取单元格样式
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {*} value - 单元格值
         * @param {string} datatype - 数据类型
         * @returns {string} CSS样式文本
         */
        getCellStyle: function (row, col, value, datatype) {
            return this.defaultStyle(row, col);
        },

        /**
         * 默认样式
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @returns {string} CSS样式文本
         */
        defaultStyle: function (row, col) {
            return '';
        },

        /**
         * 填充行样式
         * @public
         * @param {number} row - 行索引
         * @param {number} datarow - 数据行索引
         * @returns {void}
         */
        fillRowStyle: function (row, datarow) {
            var st = this.getRowStyle(row, datarow);
            if (st) {
                $e.fn.setStyle(this.getTable().rows[row], st);
            }
        },

        /**
         * 获取行样式
         * @public
         * @param {number} row - 行索引
         * @param {number} datarow - 数据行索引
         * @returns {string} CSS样式文本
         */
        getRowStyle: function (row, datarow) {
            return '';
        },

        /**
         * 返回列名对应的table_data的列号
         * @public
         * @param {string} name - 列名
         * @returns {number} 列索引
         */
        getColumnIndex: function (name) {
            name = name ? name.toLowerCase() : '';
            var col = this.columnIndex[name];
            return col === undefined ? -1 : col;
        },

        /**
         * 获取单元格文本
         * @public
         * @param {number} row - 行索引
         * @param {number|string} col - 列索引或列名
         * @returns {string} 单元格文本
         */
        getCellText: function (row, col) {
            if (isNaN(col)) {
                col = this.getColumnIndex(col);
            }
            return $e.fn.getLabelText(this.getTable().rows[row].cells[col]);
        },

        /**
         * 表头排序
         * @public
         * @param {Event} e - 点击事件
         * @returns {void}
         */
        sortHeader: function (e) {
            var th = $e.fn.closest(
                e,
                {
                    key: 'tagName',
                    value: 'TH',
                    end: this.band.header_table
                },
                true
            );
            if (th) {
                var col = th.cellIndex;
                if (this.dataIndex[col] >= 0) {
                    var asc = 1; // 顺序
                    var st = this.sortTh;
                    if (!st) {
                        st = $e.fn.create('i', 'fa fa-caret-up');
                        this.sortTh = st;
                    } else if (st.parentNode === th) {
                        asc = st.sortType * -1;
                    }
                    st.sortType = asc;
                    if (asc > 0) {
                        $e.fn.removeClass(st, 'sort-desc');
                    } else {
                        $e.fn.addClass(st, 'sort-desc');
                    }
                    var ado = this.getADO();
                    this.sortData(ado, col, asc);
                    th.appendChild(st);
                }
            }
        },

        /**
         * 排序数据
         * @public
         * @param {Object} ado - 数据对象
         * @param {number} col - 列索引
         * @param {number} asc - 排序方向：1升序/-1降序
         * @returns {void}
         */
        sortData: function (ado, col, asc) {
            var name = this.getSortColumnName(ado, col);
            ado.sort(name, asc);
        },

        /**
         * 获取排序列名
         * @public
         * @param {Object} ado - 数据对象
         * @param {number} col - 列索引
         * @returns {string} 列名
         */
        getSortColumnName: function (ado, col) {
            return ado.getColumnName(this.dataIndex[col]);
        },

        /**
         * 获取选中行
         * @public
         * @param {string} [type] - 类型：old/will
         * @returns {number} 行索引
         */
        getSelectedRow: function (type) {
            if (type === 'old') {
                return this.oldSelectedRow;
            } else if (type === 'will') {
                return this.willSelectRow;
            } else {
                var rows = this.getTable().rows;
                for (var i = 0; i < rows.length; i++) {
                    if (this.isRowSelected(rows[i])) {
                        return i;
                    }
                }
            }
            return -1;
        },

        /**
         * 判断行是否选中
         * @public
         * @param {HTMLTableRowElement} tr - 行元素
         * @returns {boolean} 是否选中
         */
        isRowSelected: function (tr) {
            return $e.fn.hasClass(tr, this.getSelectedRowClass(true));
        },

        /**
         * 获取行ID
         * @public
         * @param {number} row - 行索引
         * @returns {number} 行ID
         */
        getRowID: function (row) {
            if (row >= 0) {
                var tr = this.getTable().rows[row];
                return tr.rowid;
            }
            return -1;
        },

        /**
         * 获取选中的行数组（多行选择）
         * @public
         * @returns {Array} 选中行索引数组
         */
        getSelectedRows: function () {
            var rows = this.getTable().rows;
            var rs = [];
            for (var i = 0; i < rows.length; i++) {
                if (this.isRowSelected(rows[i])) {
                    rs.push(i);
                }
            }
            return rs;
        },

        /**
         * 获取选中行的ID数组
         * @public
         * @returns {Array} 选中行ID数组
         */
        getSelectedRowIDs: function () {
            var rows = this.getTable().rows;
            var rs = [];
            for (var i = 0; i < rows.length; i++) {
                if (this.isRowSelected(rows[i])) {
                    rs.push(this.getRowID(i));
                }
            }
            return rs;
        },

        /**
         * 获取选中行数据
         * @public
         * @param {string|Array} colsname - 列名或列名数组
         * @returns {Array} 选中行数据数组
         */
        getSelectedData: function (colsname) {
            var rs = [];
            var rds = this.band.data_table.rows;
            var rowid;
            var row;
            var ado = this.getADO();
            for (var i = 0; i < rds.length; i++) {
                if (this.isRowSelected(rds[i])) {
                    rowid = rds[i].rowid;
                    row = ado.findRowByRowID(rowid);
                    if (row >= 0) {
                        rs.push(ado.getRowProperties(row, colsname));
                    }
                }
            }
            return rs;
        },

        /**
         * 设置选中行
         * @public
         * @param {number|Event} e - 行索引或事件对象
         * @param {boolean} [force] - 是否强制
         * @param {boolean} [stopcheck] - 是否停止检查
         * @returns {boolean} 是否成功
         */
        setSelectedRow: function (e, force, stopcheck) {
            try {
                this.selecting = true;
                var trow = null;
                var changed = false;
                var row;
                var table = this.getTable();
                if (!isNaN(e)) {
                    row = e - 0;
                    if (row >= 0 && row < table.rows.length) {
                        trow = table.rows[row];
                    }
                } else {
                    trow = $e.fn.closest(
                        e,
                        {
                            key: 'tagName',
                            value: 'TR',
                            end: table
                        },
                        true
                    );
                }
                var chg = true;
                this.oldSelectedRow = this.selectedRow;
                if (this.rowSelectType === '1') {
                    // 单选
                    this.willSelectRow = trow ? trow.rowIndex : -1;
                    chg = this.willSelectRow !== this.selectedRow;
                    if (chg || force) {
                        // 取消原选中的行
                        if (!stopcheck && this.rowListening) {
                            if (!this.doRowChangingListen()) {
                                return false;
                            }
                        }
                        row = this.selectedRow;
                        if (row >= 0 && row < table.rows.length) {
                            this.signSelectedRow(table.rows[row], false);
                        }
                        changed = true;
                        this.selectedRow = this.willSelectRow;
                    }
                    this.signSelectedRow(trow, true);
                    if (changed) {
                        this.doRowChangedListen();
                    }
                } else {
                    this.signSelectedRow(trow, !this.isRowSelected(trow));
                    this.willSelectRow = this.selectedRow = trow.rowIndex;
                    this.doRowChangedListen();
                }
                return changed;
            } catch (e1) {
                throw e1;
            } finally {
                this.selecting = false;
            }
        },

        /**
         * 在多选情况下，选中或取消选中所有的行
         * @public
         * @param {boolean} flag - 是否选中
         * @returns {void}
         */
        setAllRowSelected: function (flag) {
            if (this.rowSelectType === '0') {
                var rows = this.getTable().rows;
                for (var i = 0; i < rows.length; i++) {
                    this.signSelectedRow(rows[i], flag);
                }
            }
        },

        /**
         * 标记行选中状态
         * @public
         * @param {HTMLTableRowElement} trow - 行元素
         * @param {boolean} isSelected - 是否选中
         * @returns {void}
         */
        signSelectedRow: function (trow, isSelected) {
            if (trow) {
                if (isSelected) {
                    $e.fn.addClass(trow, this.getSelectedRowClass(true));
                } else {
                    $e.fn.removeClass(trow, this.getSelectedRowClass(false));
                }
                trow.selected = isSelected;
            }
        },

        /**
         * 获取选中行样式类
         * @public
         * @param {boolean} isSelected - 是否选中
         * @returns {string} 样式类名
         */
        getSelectedRowClass: function (isSelected) {
            return 'grid-rowon';
        },

        /**
         * 同步列的宽度
         * @public
         * @param {string|number} [columnName] - 指定的列名/列序号，不指定表示所有的列
         * @returns {void}
         */
        syncHeaderWidth: function (columnName) {
            var col = isNaN(columnName)
                ? this.getColumnIndex(columnName)
                : parseInt(columnName);
            if (col >= 0) {
                var headerGroup = this.band.headerGroup.children;
                var dataGroup = this.band.dataGroup.children;
                var st = $e.fn.getStyle(headerGroup[col], 'width') + '';
                if (!isNaN(st)) {
                    st = st + 'px';
                }
                $e.fn.setStyle(dataGroup[col], 'width:' + st + 'px');
            }
        },

        /**
         * 组件值变动事件
         * @public
         * @param {boolean} clear - 是否清空
         * @param {boolean} [refuse] - 是否拒绝
         * @returns {void}
         */
        acceptInput: function (clear, refuse) {
            var field = this.editField;
            if (field) {
                var place = null;
                if (!refuse && this.editField.isEnable()) {
                    this.acceptChanged(field);
                }
                if (clear) {
                    place = this.queryPlace(field.getShell());
                    this.removeEditField();
                }
                if (clear && place) {
                    if (place.row >= 0 && place.col >= 0) {
                        var ado = this.getADO();
                        var row = ado.findRowByRowID(place.rowid);
                        var value = ado.getValueAt(row, field.col);
                        var type = ado.getColumn(field.col).dataType;
                        this.fillCell(place.row, place.col, value, type, {
                            ado: ado,
                            rowid: place.rowid
                        });
                    }
                }
            }
        },

        /**
         * 验证输入
         * @public
         * @returns {void}
         */
        validInput: function () {
            // 子类实现
        },

        /**
         * 清除验证状态
         * @public
         * @returns {void}
         */
        clearValid: function () {
            // 子类实现
        },

        /**
         * 验证错误处理
         * @public
         * @returns {void}
         */
        validError: function () {
            // 子类实现
        },

        /**
         * 验证启用状态
         * @public
         * @param {Object} options - 选项
         * @returns {boolean} 是否启用
         */
        validEnable: function (options) {
            return false;
        },

        /**
         * 重绘表格
         * @public
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        repaint: function (options) {
            if (!this.locked) {
                var pn = null;
                var child = null;
                try {
                    this.locked = true;
                    options = options || {};
                    var ado = (options.ado = options.ado || this.getADO());
                    var type = (options.eventType =
                        options.eventType || ado_status.REFRESH);
                    if (type === ado_status.REFRESH) {
                        this.removeEditField();
                    }
                    this.setEnable(this.validEnable(options));
                    var tr;
                    var count = ado.getRowsCount();
                    var row = -1;
                    var table = this.getTable();
                    loop: {
                        if (type === ado_status.REFRESH) {
                            pn = table.parentNode;
                            if (pn) {
                                var children = table.parentNode.children;
                                for (var i = 0; i < children.length; i++) {
                                    if (children[i] === table) {
                                        if (i < children.length - 1) {
                                            child = children[i + 1];
                                        }
                                        break;
                                    }
                                }
                                pn.removeChild(table);
                            }
                            this.selectedRow =
                                this.oldSelectedRow =
                                this.willSelectRow =
                                -1;
                            var r1 = table.rows.length;
                            while (r1 > 0) {
                                table.deleteRow(--r1);
                            }
                            // 添加行
                            for (var j = 0; j < count; j++) {
                                tr = table.insertRow(-1);
                                this.fillEmptyRow(tr);
                                tr.rowid = ado.getRowID(j);
                                this.fillRow(j, j);
                            }
                            row = count > 0 ? 0 : -1;
                        } else {
                            if (type === ado_status.ROW_EDIT) {
                                // 填充整行数据
                                row = this.findRowByRowID(options.rowid);
                                if (row >= 0) {
                                    this.fillRow(row, options.row);
                                }
                                break loop;
                            } else if (
                                type === ado_status.ROW_ADD ||
                                type === ado_status.ROW_DELETE
                            ) {
                                row = this.selectedRow;
                                if (type === ado_status.ROW_ADD) {
                                    tr = table.insertRow(options.row < 0 ? -1 : options.row);
                                    this.fillEmptyRow(tr);
                                    tr.rowid = options.rowid;
                                    if (row >= 0 && tr.rowIndex <= row) {
                                        this.selectedRow += 1;
                                    }
                                    if (this.autoSelectAddRow) {
                                        row = tr.rowIndex;
                                    }
                                } else {
                                    row = this.findRowByRowID(options.rowid);
                                    if (row >= 0) {
                                        if (
                                            this.editField &&
                                            this.editField.rowid === options.rowid
                                        ) {
                                            this.removeEditField();
                                        }
                                        table.deleteRow(row);
                                        if (this.selectedRow > row) {
                                            this.selectedRow -= 1;
                                        } else if (this.selectedRow === row) {
                                            this.selectedRow = -1;
                                        }
                                    }
                                }
                                var ids = {};
                                for (var k = 0; k < ado.getRowsCount(); k++) {
                                    ids['r' + ado.getRowID(k)] = k;
                                }
                                for (var m = 0; m < table.rows.length; m++) {
                                    this.fillRow(m, ids['r' + table.rows[m].rowid]);
                                }
                            }
                        }
                        if (this.rowSelectType === '1' && !this.selecting) {
                            if (type === ado_status.REFRESH) {
                                if (row >= 0) {
                                    this.setSelectedRow(row, true);
                                }
                            } else if (row >= 0 && table.rows.length > 0) {
                                if (row >= table.rows.length) {
                                    row = table.rows.length - 1;
                                }
                                this.willEditCol = -1;
                                this.setSelectedRow(row, row === this.selectedRow);
                                if (type === ado_status.ROW_ADD && this.autoSelectAddRow) {
                                    this.scrollRowTop(row);
                                }
                            }
                        }
                    }
                    if (this.sumCells) {
                        this.fillSumCells(options);
                    }
                    // 绘制后的方法
                    this.repainted(options);
                } catch (e1) {
                    // 忽略错误
                } finally {
                    if (pn) {
                        if (child) {
                            pn.insertBefore(this.getTable(), child);
                        } else {
                            pn.appendChild(this.getTable());
                        }
                    }
                    this.locked = false;
                }
            }
        },

        /**
         * 重绘完成回调
         * @public
         * @param {Object} options - 选项
         * @returns {void}
         */
        repainted: function (options) {
            // 子类实现
        },

        /**
         * 移除编辑字段
         * @public
         * @returns {void}
         */
        removeEditField: function () {
            var field = this.editField;
            if (field) {
                this.editField = null;
                field.getShell().parentNode.removeChild(field.getShell());
            }
        },

        /**
         * 移除排序表头
         * @public
         * @returns {void}
         */
        removeSortHeader: function () {
            var st = this.sortTh;
            if (st && st.parentNode) {
                st.parentNode.removeChild(st);
            }
        },

        /**
         * 填充行数据
         * @public
         * @param {number} row - 表格行索引
         * @param {number} datarow - 数据行索引
         * @returns {void}
         */
        fillRow: function (row, datarow) {
            var value;
            var ado = this.getADO();
            var fd = this.editField;
            var col = -1;
            if (fd && fd.rowid !== ado.getRowID(datarow)) {
                fd = null;
            } else if (fd) {
                var place = this.queryPlace(fd.getShell());
                if (place) {
                    col = place.col;
                }
            }
            var cols = this.dataIndex;
            var options = {
                ado: ado,
                rowid: ado.getRowID(datarow)
            };
            for (var j = 0; j < cols.length; j++) {
                value = ado.getValueAt(datarow, cols[j]);
                if (fd && col === j) {
                    // 存在编辑单元
                    if (this.isEditable(row, j)) {
                        fd.setValue(value, true);
                        continue;
                    } else {
                        this.removeEditField();
                    }
                } else if (cols[j] === -100) {
                    this.fillCell(row, j, value, 'int', options);
                    continue;
                }
                this.fillCell(row, j, value, ado.getColumn(cols[j]).dataType, options);
            }
            this.fillRowStyle(row, datarow);
        },

        /**
         * 填充一行空行
         * @public
         * @param {HTMLTableRowElement} tr - 表格行
         * @returns {void}
         */
        fillEmptyRow: function (tr) {
            var cell;
            var cols = this.dataIndex;
            for (var j = 0; j < cols.length; j++) {
                cell = tr.insertCell(-1);
                $e.fn.setLabelText(cell, ' ');
            }
        },

        /**
         * 填充单元格
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {*} value - 值
         * @param {string} datatype - 数据类型
         * @param {Object} options - 选项
         * @returns {void}
         */
        fillCell: function (row, col, value, datatype, options) {
            if (!this.dynamicFillCell(row, col, value, datatype, options)) {
                var name = this.columnName[col];
                var field = this.getField(name);
                var table = this.getTable();
                var cell = table.rows[row].cells[col];
                var f1;
                var f2;
                value = value == null ? '' : value;
                if (field) {
                    if (typeof field.paint === 'function') {
                        if (field.paint(cell, row, col, value, options) !== false) {
                            this.fillCellStyle(cell, row, col, value, datatype);
                            return;
                        }
                    }
                    var ftype = field.getType();
                    if (ftype === 'checkbox') {
                        var path;
                        if (field.isCheckedValue(value)) {
                            path = 'images/tree/box_1.gif';
                        } else {
                            path = 'images/tree/box_0.gif';
                        }
                        cell.innerHTML = "<img class='data-grid box' src='" + path + "'>";
                    } else if (ftype === 'label') {
                        f1 = field.getItemText(value);
                        $e.fn.setLabelText(cell, field.formatValue(f1, false));
                    } else if (ftype === 'combobox' || ftype === 'list') {
                        f1 = field.findItem(value);
                        f2 = f1 ? f1.text : value + '';
                        $e.fn.setLabelText(cell, f2 || ' ');
                    } else if (ftype === 'self') {
                        field.setValue(value);
                        cell.innerHTML = field.getShell().innerHTML || ' ';
                    } else {
                        f1 = field.formatText;
                        if (f1) {
                            if (
                                datatype === 'number' ||
                                datatype === 'int' ||
                                datatype === 'long'
                            ) {
                                if (this.fillZeroBlank && value === 0.0) {
                                    f2 = '';
                                } else {
                                    f2 = field.formatValue(value, false);
                                    if (ftype === 'percent' && f2) {
                                        f2 += field.postChar;
                                    }
                                }
                                $e.fn.setLabelText(cell, f2 || ' ');
                            } else if (
                                datatype === 'date' ||
                                datatype === 'time' ||
                                datatype === 'datetime'
                            ) {
                                f2 = $e.fn.formatDate(value, f1);
                                $e.fn.setLabelText(cell, f2 || f2 + ' ');
                            } else {
                                $e.fn.setLabelText(cell, value || value + ' ');
                            }
                        } else {
                            $e.fn.setLabelText(cell, value || value + ' ');
                        }
                    }
                } else if (!isNaN(value)) {
                    if (datatype === 'date' || datatype === 'datetime') {
                        f2 = $e.fn.formatDate(value, 'yyyy-MM-dd');
                    } else if (datatype === 'time') {
                        f2 = $e.fn.formatDate(value, 'HH:mm:ss');
                    } else {
                        f2 = value;
                    }
                    $e.fn.setLabelText(cell, f2 || f2 + ' ');
                } else {
                    $e.fn.setLabelText(cell, value || value + ' ');
                }
                this.fillCellStyle(cell, row, col, value, datatype);
            }
        },

        /**
         * 自定义的单元格填充
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {*} value - 值
         * @param {string} datatype - 数据类型
         * @param {Object} options - 选项
         * @returns {boolean} 是否已处理
         */
        dynamicFillCell: function (row, col, value, datatype, options) {
            return false;
        },

        /**
         * 根据行ID查找行
         * @public
         * @param {number} rowid - 行ID
         * @returns {number} 行索引
         */
        findRowByRowID: function (rowid) {
            var table = this.getTable();
            var row = -1;
            for (var i = 0; i < table.rows.length; i++) {
                if (table.rows[i].rowid === rowid) {
                    row = i;
                    break;
                }
            }
            return row;
        },

        /**
         * 数据监听处理
         * @public
         * @param {Object} options - 选项
         * @returns {void}
         */
        doDataListen: function (options) {
            this.repaint(options);
        },

        /**
         * 设置启用状态
         * @public
         * @param {boolean} enable - 是否启用
         * @returns {void}
         */
        setEnable: function (enable) {
            this.enable = !!enable;
            if (!enable && this.editField) {
                this.acceptInput(true, true);
            }
        },

        /**
         * 判断是否启用
         * @public
         * @param {Object} [options] - 选项
         * @returns {boolean} 是否启用
         */
        isEnable: function (options) {
            return this.enable;
        },

        /**
         * 判断是否可编辑
         * @public
         * @param {number} row - 行索引
         * @param {number|string} col - 列索引或列名
         * @returns {boolean} 是否可编辑
         */
        isEditable: function (row, col) {
            if (!!isNaN(col)) {
                col = this.getColumnIndex(col);
            }
            if (this.enable && col >= 0 && row >= 0) {
                var name = this.columnName[col];
                if (name !== '$row' && name !== 'rowid') {
                    var field = this.getField(name);
                    if (field) {
                        return field.validEnable({
                            ado: this.getADO(),
                            eventType: ado_status.ROW_EDIT,
                            row: row,
                            columnIndex: col,
                            rowid: this.getRowID(row)
                        });
                    }
                }
            }
            return false;
        },

        /**
         * 获取区域
         * @public
         * @param {string} name - 区域名称
         * @returns {HTMLElement} 区域元素
         */
        getBand: function (name) {
            return this.band[name];
        },

        /**
         * 获取列名
         * @public
         * @param {number} col - 列索引
         * @returns {string} 列名
         */
        getColumnName: function (col) {
            return this.columnName[col];
        },

        /**
         * 添加行变更监听
         * @public
         * @param {Object} listen - 监听器
         * @returns {number} 监听句柄
         */
        addRowChangedListen: function (listen) {
            if (!this.rowListen) {
                this.rowListen = $e.events.createEventCell();
            }
            return this.rowListen.add(listen);
        },

        /**
         * 移除行变更监听
         * @public
         * @param {number} handle - 监听句柄
         * @returns {Object} 监听器
         */
        removeRowChangedListen: function (handle) {
            return this.rowListen ? this.rowListen.remove(handle) : null;
        },

        /**
         * 执行行变更监听
         * @public
         * @returns {boolean} 是否成功
         */
        doRowChangedListen: function () {
            var e1 = {
                row: this.selectedRow,
                oldRow: this.oldSelectedRow
            };
            return this.rowListen ? this.rowListen.done(e1) : true;
        },

        /**
         * 添加行变更中监听
         * @public
         * @param {Object} listen - 监听器
         * @returns {number} 监听句柄
         */
        addRowChangingListen: function (listen) {
            if (!this.rowListening) {
                this.rowListening = $e.events.createEventCell();
            }
            return this.rowListening.add(listen);
        },

        /**
         * 移除行变更中监听
         * @public
         * @param {number} handle - 监听句柄
         * @returns {Object} 监听器
         */
        removeRowChangingListen: function (handle) {
            return this.rowListening ? this.rowListening.remove(handle) : null;
        },

        /**
         * 执行行变更中监听
         * @public
         * @returns {boolean} 是否成功
         */
        doRowChangingListen: function () {
            return this.rowListening ? this.rowListening.done() : true;
        },

        /**
         * 添加编辑监听
         * @public
         * @param {Object} listen - 监听器
         * @returns {number} 监听句柄
         */
        addEditListen: function (listen) {
            if (!this.editListening) {
                this.editListening = $e.events.createEventCell();
            }
            return this.editListening.add(listen);
        },

        /**
         * 移除编辑监听
         * @public
         * @param {number} handle - 监听句柄
         * @returns {Object} 监听器
         */
        removeEditListen: function (handle) {
            return this.editListening ? this.editListening.remove(handle) : null;
        },

        /**
         * 执行编辑监听
         * @public
         * @returns {boolean} 是否成功
         */
        doEditListen: function () {
            return this.editListening ? this.editListening.done() : true;
        },

        /**
         * 滚动行到顶部
         * @public
         * @param {number} row - 行索引
         * @returns {void}
         */
        scrollRowTop: function (row) {
            var dataShell = this.band.data_shell;
            if (dataShell) {
                var top = this.getTable().rows[row].offsetTop;
                dataShell.scrollTop = top;
            }
        },

        /**
         * 同步滚动
         * @public
         * @param {Event} e - 滚动事件
         * @returns {void}
         */
        syncScroll: function (e) {
            var ds = this.band.data_shell;
            var hs = this.band.header_shell;
            var ss = this.band.sum_shell;
            if (ds && hs) {
                if (ss) {
                    hs.scrollLeft = ds.scrollLeft = ss.scrollLeft;
                } else {
                    hs.scrollLeft = ds.scrollLeft;
                }
            }
        },

        /**
         * 切换到下一个单元格
         * @public
         * @param {Event} e - 键盘事件
         * @returns {boolean} 是否成功
         */
        nextCell: function (e) {
            this.willEditCol = -1;
            var code = e.keyCode || e.which;
            if (code === 9 || code === 13 || code === 38 || code === 40) {
                var cell = e.target || e.srcElement;
                var place = this.queryPlace(cell);
                if (!place) {
                    return false;
                }
                if (this.editField) {
                    this.acceptInput(false);
                }
                var row = place.row;
                var dcol;
                var col = place.col;
                var has = false;
                var table = this.getTable();
                // 左37，上38，右39，下40； enter:13
                switch (code) {
                    case 9:
                    case 13:
                        if (this.editField.getType() === 'textarea' && code === 13) {
                            return true;
                        }
                        while (row >= 0 && row < table.rows.length) {
                            dcol = this.nextDynamicEditCol(row, col);
                            if (dcol >= 0 && this.isEditable(row, col)) {
                                has = true;
                                col = dcol;
                                break;
                            }
                            col++;
                            if (col >= table.rows[row].cells.length) {
                                col = 0;
                                row++;
                            } else {
                                if (this.isEditable(row, col)) {
                                    has = true;
                                    break;
                                }
                            }
                        }
                        break;
                    case 38:
                        row--;
                        while (row >= 0) {
                            if (this.isEditable(row, col)) {
                                has = true;
                                break;
                            }
                            row--;
                        }
                        break;
                    case 40:
                        row++;
                        while (row < table.rows.length) {
                            if (this.isEditable(row, col)) {
                                has = true;
                                break;
                            }
                            row++;
                        }
                        break;
                    default:
                        return true;
                }
                if (has) {
                    if (this.rowSelectType === '1' && this.getSelectedRow() !== row) {
                        this.willEditCol = col;
                        this.setSelectedRow(row);
                    }
                    if (
                        this.rowSelectType !== '1' ||
                        $e.fn.hasClass(table.rows[row], this.getSelectedRowClass(true))
                    ) {
                        return this.editCellAt(row, col);
                    }
                }
            }
            return true;
        },

        /**
         * 获取下一个动态编辑列
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @returns {number} 列索引
         */
        nextDynamicEditCol: function (row, col) {
            return -1;
        },

        /**
         * 构建编辑
         * @public
         * @param {Event} e - 点击事件
         * @returns {boolean} 是否成功
         */
        buildEdit: function (e) {
            // 选中行
            this.willEditCol = -1;
            var cell = e.target || e.srcElement;
            var place = this.queryPlace(cell);
            if (place) {
                if (this.getSelectedRow() !== place.row || this.rowSelectType !== '1') {
                    this.willEditCol = place.col;
                    if (!this.setSelectedRow(place.row)) {
                        return false;
                    }
                }
                this.editCellAt(place.row, place.col, true);
                return true;
            }
            return false;
        },

        /**
         * 查询位置
         * @public
         * @param {HTMLElement} element - 元素
         * @returns {Object|null} 位置信息 {row, col, rowid}
         */
        queryPlace: function (element) {
            var td = $e.fn.closest(
                element,
                {
                    key: 'tagName',
                    value: 'TD',
                    end: 'TR'
                },
                true
            );
            if (td) {
                var tr = td.parentNode;
                return {
                    row: tr.rowIndex,
                    col: td.cellIndex,
                    rowid: tr.rowid
                };
            }
            return null;
        },

        /**
         * 编辑指定单元格
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {boolean} [change] - 是否变更
         * @returns {boolean} 是否成功
         */
        editCellAt: function (row, col, change) {
            var table = this.getTable();
            if (this.isEnable()) {
                if (
                    row >= 0 &&
                    col >= 0 &&
                    row < table.rows.length &&
                    col < this.dataIndex.length
                ) {
                    var field = this.editField;
                    var ado = this.getADO();
                    var rowid = table.rows[row].rowid;
                    var col1 = this.getEditColumnIndex();
                    if (field && col === col1 && field.rowid === rowid) {
                        return true;
                    }
                    var dataCol = this.dataIndex[col];
                    if (dataCol < 0) {
                        return false;
                    }
                    var name = this.columnName[col];
                    var field1 = this.getField(name, row, col);
                    if (field1 && this.isEditable(row, col)) {
                        this.acceptInput(true);
                        if (this.rowSelectType === '1' && row !== this.selectedRow) {
                            return false;
                        }
                        var dataRow = ado.findRowByRowID(rowid);
                        field1.rowid = ado.getRowID(dataRow);
                        field1.col = dataCol;
                        field1.setValue(ado.getValueAt(dataRow, dataCol));
                        var cell = table.rows[row].cells[col];
                        var eo = ado.buildEventObject(
                            ado_status.ROW_EDIT,
                            dataRow,
                            rowid,
                            dataCol
                        );

                        field1.setEnable(field1.validEnable(eo));
                        if (field1.isEnable()) {
                            $e.fn.setChild(cell, field1.getShell());
                            if (field1.setEditable) {
                                field1.setEditable(field1.validEditable(eo));
                            }
                            if (field1.select) {
                                field1.select(true);
                            }
                            this.editField = field1;
                            if (
                                change &&
                                field1.getType() === 'checkbox' &&
                                field1.isEnable()
                            ) {
                                if (field1.getValue() === field1.getRealValue(true)) {
                                    field1.setValue(field1.getRealValue(false));
                                } else {
                                    field1.setValue(field1.getRealValue(true));
                                }
                            }
                            if (
                                field1.field &&
                                typeof field1.field.focus === 'function'
                            ) {
                                field1.field.focus();
                            }
                            return true;
                        }
                    }
                } else if (this.editField) {
                    this.acceptInput(true, true);
                }
            }
            return false;
        },

        /**
         * 获取编辑列索引
         * @public
         * @returns {number} 列索引
         */
        getEditColumnIndex: function () {
            if (this.editField) {
                var cell = this.editField.getShell().parentNode;
                if (cell) {
                    return cell.cellIndex;
                }
            }
            return -1;
        },

        /**
         * 获取字段
         * @public
         * @param {string} name - 字段名
         * @param {number} [row] - 行索引
         * @param {number} [col] - 列索引
         * @returns {Object} 字段对象
         */
        getField: function (name, row, col) {
            name = name.toLowerCase();
            var f = this.dynamicField(name, row, col);
            return f || this.fields[name] || this.fields['*'];
        },

        /**
         * 获取编辑字段
         * @public
         * @returns {Object} 编辑字段
         */
        getEditField: function () {
            return this.editField;
        },

        /**
         * 获取动态的编辑组件
         * @public
         * @param {string} name - 字段名
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @returns {Object|null} 动态字段
         */
        dynamicField: function (name, row, col) {
            return null;
        },

        /**
         * 开始调整列宽
         * @public
         * @param {Event} e - 鼠标事件
         * @returns {void}
         */
        start: function (e) {
            var nodes = this.band.headerGroup.children;
            if (nodes.length > 0 && this.rsth.ready) {
                var rsth = this.rsth;
                rsth.X = e.clientX;
                rsth.start = true;
            }
        },

        /**
         * 调整列宽移动
         * @public
         * @param {Event} e - 鼠标事件
         * @returns {boolean} 是否成功
         */
        move: function (e) {
            var src = e.target || e.srcElement;
            if (this.rsth === src.rsth) {
                var rsth = this.rsth;
                var children = this.band.headerGroup.children;
                if (rsth.start) {
                    var x = e.clientX;
                    if (!rsth.resizeE) {
                        if (x <= rsth.X) {
                            var w1;
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
                            rsth.width0 = rsth.width1 =
                                parseInt($e.fn.getStyle(rsth.resizeE, 'width')) ||
                                parseInt(rsth.resizeE.style.width);
                        }
                    }
                    if (rsth.resizeE) {
                        var w = x - rsth.X + rsth.width0;
                        w = w < 0 ? 0 : w;
                        if (rsth.width1 !== w) {
                            rsth.width1 = w;
                            $e.fn.setStyle(rsth.resizeE, 'width:' + w + 'px');
                            $e.fn.setStyle(
                                this.band.dataGroup.children[rsth.col],
                                'width:' + w + 'px'
                            );
                            if (this.band.sumGroup) {
                                $e.fn.setStyle(
                                    this.band.sumGroup.children[rsth.col],
                                    'width:' + w + 'px'
                                );
                            }
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
                        var th = $e.fn.closest(
                            src,
                            {
                                key: 'tagName',
                                value: 'TH',
                                end: 'TABLE'
                            },
                            true
                        );
                        if (th) {
                            ofs = $e.fn.getRelativeOffset(e, th);
                            var col =
                                th.cellIndex + $e.fn.getInt(th.getAttribute('colspan'), 1) - 1;
                            if (Math.abs(th.offsetWidth - ofs.offsetX) <= 3) {
                                rsth.type = 1; // 准确，当前这个
                                rsth.resizeE = children[col];
                                rsth.width0 = rsth.width1 =
                                    parseInt($e.fn.getStyle(rsth.resizeE, 'width')) ||
                                    parseInt(rsth.resizeE.style.width);
                                rsth.col = col;
                                rsth.ready = true;
                            } else if (ofs.offsetX <= 3 && th.cellIndex > 0) {
                                rsth.type = 2; // 不准确，右移为左边那个
                                rsth.col = col;
                                rsth.ready = true;
                            }
                        }
                    }
                    $e.fn.setStyle(
                        this.band.header_shell,
                        'cursor:' + (rsth.ready ? 'col-resize' : 'default')
                    );
                }
                return false;
            }
            return true;
        },

        /**
         * 结束调整列宽
         * @public
         * @param {Event} e - 鼠标事件
         * @returns {boolean} 是否成功
         */
        end: function (e) {
            var rsth = this.rsth;
            if (rsth.start) {
                $e.fn.setStyle(rsth.th, 'cursor:default');
                rsth.start = false;
                rsth.X = 0;
                rsth.col = -1;
                rsth.ready = false;
                rsth.resizeE = null;
            }
            return true;
        },

        /**
         * 初始化合计行
         * @public
         * @param {Object} parms - 合计行配置
         * @returns {void}
         */
        initSumBand: function (parms) {
            var rows = parms;
            if (parms && typeof parms === 'string') {
                rows = $e.fn.createObject(rows);
            }
            if (rows && this.band.sum_table) {
                if ($e.fn.isPlainObject(rows)) {
                    rows = [rows];
                }
                if (rows instanceof Array) {
                    var tr;
                    var cell;
                    var table = this.band.sum_table;
                    while (table.rows.length > 0) {
                        table.deleteRow(table.rows.length - 1);
                    }
                    for (var i = 0; i < rows.length; i++) {
                        tr = table.insertRow(-1);
                        this.fillEmptyRow(tr);
                    }
                    var col;
                    var rs;
                    var cs;
                    var type;
                    this.sumCells = new Array(rows.length);
                    for (var j = 0; j < rows.length; j++) {
                        this.sumCells[j] = {};
                        for (var a in rows[j]) {
                            cell = rows[j][a];
                            col = this.getColumnIndex(a);
                            if (col >= 0) {
                                rs = cell.rows || 1;
                                cs = cell.cols || 1;
                                if (rs > 1 || cs > 1) {
                                    this.spanCells(table, j, col, rs, cs);
                                }
                                type = typeof cell.html;
                                if (type === 'string') {
                                    table.rows[j].cells[col].innerHTML = cell.html;
                                } else if (type === 'function') {
                                    this.addSumCell(j, col, a.toLowerCase(), cell.html);
                                }
                                if (typeof cell.init === 'function') {
                                    cell.init.apply(this, [table.rows[j].cells[col]]);
                                }
                                delete cell.html;
                            }
                        }
                    }
                }
            }
        },

        /**
         * 添加合计单元格
         * @public
         * @param {number} row - 行索引
         * @param {number} col - 列索引
         * @param {string} name - 列名
         * @param {Function} method - 计算方法
         * @returns {void}
         */
        addSumCell: function (row, col, name, method) {
            this.sumCells[row][name] = {
                method: method,
                column: col
            };
        },

        /**
         * 移除合计单元格
         * @public
         * @param {number} row - 行索引
         * @param {string} name - 列名
         * @returns {void}
         */
        removeSumCell: function (row, name) {
            delete this.sumCells[row][name];
        },

        /**
         * 填充合计单元格
         * @public
         * @param {Object} event - 事件对象
         * @returns {void}
         */
        fillSumCells: function (event) {
            if (this.sumCells && this.band.sum_table) {
                var cs;
                var c1;
                var name;
                var table = this.band.sum_table;
                for (var i = 0; i < this.sumCells.length; i++) {
                    cs = this.sumCells[i];
                    if (cs) {
                        for (var a in cs) {
                            name = event.columnName ? event.columnName.toLowerCase() : '';
                            if (
                                event.eventType !== ado_status.ROW_EDIT ||
                                (event.eventType === ado_status.ROW_EDIT && name === a)
                            ) {
                                c1 = table.rows[i].cells[cs[a].column];
                                c1.innerHTML = cs[a].method.apply(this, [event]) || '';
                            }
                        }
                    }
                }
            }
        },

        /**
         * 合并单元格
         * @public
         * @param {HTMLTableElement} table - 表格
         * @param {number} row - 起始行
         * @param {number} col - 起始列
         * @param {number} rows - 合并行数
         * @param {number} cols - 合并列数
         * @returns {void}
         */
        spanCells: function (table, row, col, rows, cols) {
            var rc;
            var j;
            for (var i = 0; i < rows; i++) {
                rc = table.rows[row + i];
                j = i === 0 ? 1 : 0;
                for (; j < cols; j++) {
                    $e.fn.showElement(rc.cells[col + j], false);
                }
            }
            var c1 = table.rows[row].cells[col];
            c1.rowSpan = rows;
            c1.colSpan = cols;
        },

        /**
         * 合并重复行
         * @public
         * @param {string|Array} columns - 列名或列名数组
         * @returns {void}
         */
        mergeRepeatRows: function (columns) {
            var ado = this.getADO();
            if (typeof columns === 'string') {
                columns = columns.split(',');
            }
            var colsD = ado.getColumnsIndex(columns);
            var colsT = [];
            for (var i = 0; i < columns.length; i++) {
                colsT[i] = this.getColumnIndex(columns[i]);
            }
            var count = ado.getRowsCount();
            for (var j = 0; j < count; j++) {
                this.mergeCells(colsD, colsT, 0, count);
            }
        },

        /**
         * 合并单元格
         * @public
         * @param {Array} colsD - 数据列索引
         * @param {Array} colsT - 表格列索引
         * @param {number} from - 起始行
         * @param {number} to - 结束行
         * @returns {void}
         */
        mergeCells: function (colsD, colsT, from, to) {
            if (to > from + 1 && from >= 0) {
                var ado = this.getADO();
                var v1;
                var v0 = ado.getValueAt(from, colsD[0]);
                for (var i = from + 1; i < to; i++) {
                    v1 = ado.getValueAt(i, colsD[0]);
                    if (v0 !== v1 || i === to - 1) {
                        if (to > from + 1) {
                            this.spanCells(
                                this.getTable(),
                                from,
                                colsT[0],
                                (v0 === v1 ? i + 1 : i) - from,
                                1
                            );
                        }
                        if (colsD.length > 1) {
                            this.mergeCells(
                                colsD.slice(1),
                                colsT.slice(1),
                                from,
                                v0 === v1 ? i + 1 : i
                            );
                        }
                        v0 = v1;
                        from = i;
                    }
                }
            }
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建数据表格组件实例
         * @param {Object} options - 组件配置
         * @returns {GridView} 数据表格组件实例
         */
        create: function (options) {
            return new GridView(options);
        },
        /**
         * 获取视图原型
         * @returns {Object} 视图原型
         */
        viewPrototype: function () {
            return GridView.prototype;
        }
    };

    $e.fn.extend(
        $e.ui.getViewPlugin('view_free').viewPrototype(),
        GridView.prototype
    );
    $e.ui.addViewPlugin('view_grid', plugin);
}($e);
