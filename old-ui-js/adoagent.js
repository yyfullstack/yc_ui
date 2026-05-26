/**
 * @file 数据代理模块
 * @description ADOAgent数据代理，负责数据的增删改查、排序、过滤、分页等操作
 * @module yc-ui
 * @version 3.0.3
 * @author YC-UI Team
 */
var ado_status = {
    REFRESH: '0',
    ROW_NOEDIT: '0',
    ROW_ADD: '2',
    ROW_EDIT: '1',
    ROW_DELETE: '3',
    EVENT_ALL: '#all'
};
+function ($e) {
    function ADOAgent(name) {
        this.rows = [];
        this.frows = [];
        this.vars = {};
        this.varListen = {};
        this.columns = [];
        this.colsIndex = {};
        this.name = name;
        this.listen = $e.events.createEventCell();
        this.eventObject = this.buildEventObject(ado_status.REFRESH);
    }

    ADOAgent.prototype = {
        dataPage: null,
        isEdit: false,
        eventObject: null,
        editCols: null,
        locked: false,
        preRowNum: -1,
        vars: null,

        delayVar: null,
        delayEvents: null,
        onLoad: null,
        isInited: false,
        maxRowID: 0,
        maxEvents: 10,

        /**
         * 获取数据分页对象
         * @returns {DataPage}
         */
        getDataPage: function () {
            return this.dataPage;
        },

        /**
         * 初始化ADOAgent，创建列结构、编辑列配置及数据分页对象
         * @param {Object} params 初始化参数，包含columns、updateColumns、pageRows等
         */
        init: function (params) {
            if (params['extend']) {
                var obj = $e.fn.createObject(params['extend']);
                $e.fn.extend(obj, this, true);
            }
            var columnList = params.columns;
            if (columnList) {
                var column;
                for (var colIndex = 0, colLen = columnList.length; colIndex < colLen; colIndex++) {
                    column = new Column(columnList[colIndex].name, columnList[colIndex].dataType,
                        columnList[colIndex].precision, columnList[colIndex].defaultValue);
                    this.columns.push(column);
                    this.colsIndex[column.name] = colIndex;
                    this.colsIndex[columnList[colIndex].name] = colIndex;
                }
            }
            this.editCols = params.updateColumns ? params.updateColumns.split(",") : [];
            this.pageLoadReset = $e.fn.getBoolean(params['pageLoadReset'], true);
            $e.forActiveCell(params, this);
            this.dataPage = new DataPage(this, params.pageRows, params.page, params.pages);
        },

        /**
         * 加载数据，支持refresh（刷新）、sync（同步）、edit/delete等操作类型
         * @param {Object} rowDataSet 数据集对象，包含type、rowsData、vars等属性
         */
        loadData: function (rowDataSet) {
            var addType = rowDataSet.type;
            var changedRow = -1;
            var rowDataItem = null;
            var rowsData = rowDataSet.rowsData;
            var status;
            var deletedCount = 0;
            var editedCount = 0;
            var addedCount = 0;

            try {
                this.locked = true;
                this.delayVar = null;
                var delayEvents = { 'size': 0 };
                if (addType === "refresh") {
                    if (rowDataSet.page <= 0 || this.pageLoadReset) {
                        this.reset(true);
                    }
                    this.dataPage.changePage(rowDataSet.page, rowDataSet.pages);
                    this.addDelayEvent(delayEvents, this.buildEventObject(ado_status.REFRESH));
                    this.dataPage.refreshRows = 0;
                } else if (addType === "sync") {
                    this.clearEdit(rowDataSet.status);
                } else {
                    this.isEdit = (rowDataSet.status !== ado_status.ROW_NOEDIT);
                }
                var isEdit = this.isEdit;
                var editData = null;
                if (rowsData && rowsData.length > 0) {
                    var rowid;
                    for (var rowIndex = 0, rsLen = rowsData.length; rowIndex < rsLen; rowIndex++) {
                        rowid = rowsData[rowIndex].__rowid;
                        if (addType === "refresh") {
                            if (!this.pageLoadReset && rowid <= this.maxRowID) {
                                if (this.findRowByRowID(rowid) >= 0) {
                                    continue;
                                }
                            }
                            rowDataItem = this.createDefaultRowData("0", rowid);
                            rowDataItem.__status2 = rowsData[rowIndex].__status;
                            this.setRowProperties(rowDataItem, rowsData[rowIndex]);
                            this.maxRowID = Math.max(this.maxRowID, rowid);
                            this.rows.push(rowDataItem);
                            this.dataPage.refreshRows++;
                        } else {
                            var dataEvent;
                            var row = this.findRowByRowID(rowid, true);
                            if (row >= 0) {
                                changedRow = row;
                                rowDataItem = this.getRowData(row, true);
                                status = rowsData[rowIndex].__status;
                                dataEvent = this.buildEventObject(status, row, rowDataItem.__rowid, -1);
                                if (status === ado_status.ROW_DELETE) {
                                    dataEvent.rowData = rowDataItem;
                                    this.delRow(row, true, true);
                                    deletedCount++;
                                } else {
                                    editData = this.setRowProperties(rowDataItem, rowsData[rowIndex]);
                                    if (editData.cols === 1) {
                                        dataEvent.newValue = editData.newValue;
                                        dataEvent.oldValue = editData.oldValue;
                                        dataEvent.columnIndex = editData.columnIndex;
                                        dataEvent.columnName = this.getColumnName(editData.columnIndex);
                                    }
                                    editedCount++;
                                }
                                this.addDelayEvent(delayEvents, dataEvent);
                            } else {
                                rowDataItem = this.createDefaultRowData(ado_status.ROW_ADD, rowid);
                                this.maxRowID = Math.max(this.maxRowID, rowid);
                                row = this.preRowNum;
                                if (row >= 0) {
                                    changedRow = this.insertRow(row, rowDataItem);
                                    this.preRowNum = changedRow + 1;
                                } else {
                                    row = this.getDataPage().getRealRow(rowsData[rowIndex].__rownum);
                                    changedRow = this.insertRow(row, rowDataItem);
                                }
                                this.setRowProperties(rowDataItem, rowsData[rowIndex]);
                                this.addDelayEvent(delayEvents, this.buildEventObject(ado_status.ROW_ADD, changedRow, rowDataItem.__rowid, -1));
                                addedCount++;
                            }
                        }
                    }
                }
                this.isEdit = isEdit;
                if (rowDataSet.page === 0 && addType === "refresh") {
                    this.dataPage.refreshRows = this.getRowsCount();
                }
                rowsData = rowDataSet.vars;
                if (rowsData && !$e.fn.isEmptyObject(rowsData)) {
                    var varChanges = [];
                    for (var key in rowsData) {
                        varChanges.push({ name: key, oldValue: this.vars[key] || null, value: rowsData[key] });
                        this.setVar(key, rowsData[key], true);
                    }
                    this.delayVar = varChanges;
                }
                this.delayEvents = $e.fn.isEmptyObject(delayEvents) ? null : delayEvents;
                if (this.delayEvents && this.delayEvents['size'] > this.maxEvents) {
                    this.delayEvents = { 'size': 0 };
                    this.addDelayEvent(this.delayEvents, this.buildEventObject(ado_status.REFRESH));
                }

            } catch (error) {
                throw error;
            } finally {
                this.locked = false;
            }
            this.buildRowNum();
        },

        /**
         * 添加延时事件到延时事件对象中
         * @param {Object} delayObject 延时事件容器
         * @param {Object} event 事件对象
         */
        addDelayEvent: function (delayObject, event) {
            var eventsList = delayObject[event.eventType];
            if (!eventsList) {
                eventsList = delayObject[event.eventType] = [];
            }
            eventsList.push(event);
            delayObject['size'] = (delayObject['size'] || 0) + 1;
        },

        /**
         * 在指定位置插入一行数据（内部调用，不触发事件和状态变更）
         * @param {Number} rownum 目标行号
         * @param {Object} rowdata 行数据对象
         * @returns {Number} 实际插入的下标位置
         */
        insertRow: function (rownum, rowdata) {
            if (rownum >= 0) {
                for (var rowIndex = 0, rowsLen = this.rows.length; rowIndex < rowsLen; rowIndex++) {
                    if (this.rows[rowIndex].__rownum >= rownum) {
                        this.rows[rowIndex].__rownum += 1;
                        this.rows.splice(rowIndex, 0, rowdata);
                        return rowIndex;
                    }
                }
            }
            this.rows.push(rowdata);
            return this.rows.length - 1;
        },

        /**
         * 预设下一行插入的位置
         * @param {Number} rownum 目标行号
         */
        prepareInsertRow: function (rownum) {
            this.preRowNum = rownum;
        },

        /**
         * 预设插入行位置（已废弃，请使用 prepareInsertRow）
         * @deprecated 请使用 prepareInsertRow
         * @param {Number} rownum 目标行号
         */
        prepareInsert: function (rownum) {
            this.preRowNum = rownum;
        },

        /**
         * 获取预设的插入行位置
         * @returns {Number} 预设的行号
         */
        getPrepareInsertRow: function () {
            return this.preRowNum;
        },

        /**
         * 移动行数据从from位置到to位置
         * @param {Number} from 源行号
         * @param {Number} to 目标行号
         * @returns {Number} 移动成功返回目标行号，失败返回-1
         */
        moveRow: function (from, to) {
            var insertPos = this.rows.move(from, to);
            if (insertPos >= 0) {
                this.buildRowNum();
                var eventObj = this.buildEventObject(ado_status.REFRESH);
                this.doDataListen(eventObj);
                return to;
            }
            return -1;
        },

        /**
         * 删除指定行的数据
         * @param {Number} row 行号
         * @param {Boolean} stop 是否阻止事件触发
         * @param {Boolean} all 是否包含过滤缓存区
         * @returns {Boolean} 删除成功返回true
         */
        delRow: function (row, stop, all) {
            var rowItem = null;
            if (row >= this.rows.length) {
                row = row - this.rows.length;
                if (all && this.frows.rangeCheck(row)) {
                    rowItem = this.frows.splice(row, 1)[0];
                }
            } else if (row >= 0) {
                rowItem = this.rows.splice(row, 1)[0];
            }
            if (rowItem) {
                if (!stop) {
                    var eventObj = this.buildEventObject(ado_status.ROW_DELETE, row, rowItem.__rowid, -1);
                    eventObj.rowData = rowItem;
                    if (this.editCols.length > 0) {
                        this.isEdit = true;
                    }
                    this.doDataListen(eventObj);
                }
                return true;
            }
            return false;
        },

        /**
         * 在主数据区中查找满足条件的行
         * @param {String|Function} exp_func 查找条件，可以是字符串表达式或函数
         * @param {Number} startFrom 起始行号
         * @param {Number} endTo 结束行号
         * @returns {Number} 找到的行号，未找到返回-1
         */
        findRow: function (exp_func, startFrom, endTo) {
            startFrom = startFrom || 0;
            if (!endTo || endTo > this.rows.length) {
                endTo = this.rows.length;
            }
            if (typeof exp_func === "string") {
                exp_func = createDirectFunc(exp_func);
            }
            var rowIndex = -1;
            var found = false;
            var contextArray = [this];
            for (rowIndex = startFrom; (rowIndex < endTo) && (!found); rowIndex++) {
                found = exp_func.apply(this.rows[rowIndex], contextArray);
                if (found) {
                    break;
                }
            }
            return found ? rowIndex : -1;
        },

        /**
         * 重建所有行的行号（__rownum从0开始，__row从0开始）
         */
        buildRowNum: function () {
            if (this.rows.length > 0) {
                var row = this.dataPage.getRowNum(0);
                for (var rowIndex = 0, rowsLen = this.rows.length; rowIndex < rowsLen; rowIndex++) {
                    this.rows[rowIndex].__rownum = row++;
                    this.rows[rowIndex].__row = rowIndex;
                }
            }
        },

        /**
         * 设置行数据的属性值（内部调用，仅在后端返回数据时使用）
         * @param {Object} rowdata 行数据对象
         * @param {Object} params 属性键值对
         * @returns {Object} 变更信息，包含变更列数、列号、新旧值
         */
        setRowProperties: function (rowdata, params) {
            var changeInfo = { cols: 0, col: -1, oldValue: null, newValue: null };
            for (var key in params) {
                if (key.charAt(0) === 'c') {
                    var colIndex = key.substring(1) - 0;
                    if (rowdata.__data.rangeCheck(colIndex)) {
                        params[key] = $e.fn.parseValue(params[key], this.columns[colIndex].dataType);
                        if (rowdata.__data[colIndex] !== params[key]) {
                            changeInfo.oldValue = rowdata.__data[colIndex];
                            changeInfo.newValue = params[key];
                            changeInfo.columnIndex = colIndex;
                            rowdata.__data[colIndex] = params[key];
                            changeInfo.cols++;
                        }
                    }
                }
            }
            return changeInfo;
        },

        /**
         * 获取指定行的属性（已废弃，请使用 getValuesAt）
         * @deprecated 请使用 getValuesAt
         * @param {Number} row 行号
         * @param {String|Array} colsname 列名
         * @returns {Object}
         */
        getRowProperties: function (row, colsname) {
            return this.getValuesAt(row, colsname);
        },

        /**
         * 获取指定行的状态
         * @param {Number} row 行号
         * @returns {String} 行状态
         */
        getRowStatus: function (row) {
            return this.rows[row].__status;
        },

        /**
         * 获取指定行在服务器端的真实状态
         * @param {Number} row 行号
         * @returns {String} 服务器端行状态
         */
        getRowRealStatus: function (row) {
            return this.rows[row].__status2;
        },

        /**
         * 获取指定行的数据对象（一般仅内部调用）
         * @param {Number} rownum 行号
         * @param {Boolean} all 是否包含过滤缓存区
         * @returns {Object} 行数据对象
         */
        getRowData: function (rownum, all) {
            var dataSource;
            var row = rownum;
            if (rownum >= this.rows.length && all) {
                row -= this.rows.length;
                dataSource = this.frows;
            } else {
                dataSource = this.rows;
            }
            if (dataSource.rangeCheck(row)) {
                return dataSource[row];
            } else {
                throw 'In ado ' + this.name + ",getRowData rownum:" + rownum
                + " not exists !!!";
            }
        },

        /**
         * 获取指定范围内的行数据数组
         * @param {Number} fromrow 起始行号
         * @param {Number} torow 结束行号
         * @returns {Array} 行数据数组
         */
        getRowsData: function (fromrow, torow) {
            var resultIndex = 0;
            var resultRows = new Array(torow - fromrow);
            for (var rowIndex = fromrow; rowIndex < torow; rowIndex++) {
                resultRows[resultIndex++] = this.rows[rowIndex];
            }
            return resultIndex;
        },

        /**
         * 获取指定行的rowid
         * @param {Number} row 行号
         * @returns {String|Number} 行的唯一标识
         */
        getRowID: function (row) {
            return this.rows[row].__rowid;
        },

        /**
         * 获取指定行指定列的值
         * @param {Number} row 行号
         * @param {String|Number} col 列名或列号
         * @param {*} ifnullvalue 值为空时的默认值
         * @returns {*} 单元格的值
         */
        getValueAt: function (row, col, ifnullvalue) {
            if (this.rows.rangeCheck(row)) {
                var colIndex = col;
                if (isNaN(col)) {
                    colIndex = this.getColumnIndex(col);
                }
                if (colIndex === -100) {
                    return this.rows[row]['$row'];
                } else if (colIndex === -101) {
                    return this.rows[row].__rowid;
                }
                if (!this.rows[row].__data.rangeCheck(colIndex)) {
                    throw ("In getValueAt,column '" + col + "' not exists !");
                }
                var value = this.rows[row].__data[colIndex];
                return ((value == null || value === '') && ifnullvalue != undefined) ? ifnullvalue : value;
            } else {
                throw 'In ado ' + this.name + ",getRowData row:" + row + " not exists !!!";
            }
        },

        /**
         * 构建数据源请求参数
         * @param {*} rowid 行ID
         * @param {Object} params 额外参数
         * @returns {Object} 完整的请求参数对象
         */
        buildSourceParameters: function (rowid, params) {
            params = params || {};
            params._src_am = this.getActiveModuleName();
            params._src_ado = this.getName();
            params.rowid = rowid;
            return params;
        },

        /**
         * 修改主缓存区指定行指定列的值
         * @param {Number} row 行号
         * @param {String|Number} col_name_index 列名或列号
         * @param {*} value 新值
         * @param {Boolean} stope 是否禁止触发事件
         * @returns {Boolean} 有数据变更为true，否则为false
         */
        setValueAt: function (row, col_name_index, value, stope) {
            var colIdx;
            if (isNaN(col_name_index)) {
                colIdx = this.getColumnIndex(col_name_index);
            } else {
                colIdx = col_name_index - 0;
            }
            if (!this.rows.rangeCheck(row)) {
                throw new Error("In AdoAgent:" + this.name
                    + ",setValueAt:row " + row + " not exists !!!");
            } else if (!this.columns.rangeCheck(colIdx)) {
                throw new Error("In AdoAgent:" + this.name
                    + ",setValueAt:column " + col_name_index
                    + " not exists !!!");
            } else {
                var rowDataItem = this.rows[row];
                var columnDef = this.columns[colIdx];
                var currentValue = rowDataItem.__data[colIdx];
                if (value) {
                    value = $e.fn.parseValue(value, columnDef.dataType, columnDef.precision);
                }
                if (currentValue !== value) {
                    var eventObj = this.buildEventObject(ado_status.ROW_EDIT, row, rowDataItem.__rowid, colIdx);
                    eventObj.rowData = rowDataItem;
                    eventObj.oldValue = currentValue;
                    eventObj.newValue = value;
                    rowDataItem.__data[colIdx] = value;

                    rowDataItem.__status = ((rowDataItem.__status === ado_status.ROW_NOEDIT) ? ado_status.ROW_EDIT
                        : rowDataItem.__status);
                    if (rowDataItem.__cellStatus.indexOf(colIdx) < 0) {
                        rowDataItem.__cellStatus.push(colIdx);
                    }
                    this.isEdit = true;
                    this.eventObject = eventObj;
                    if (!stope) {
                        this.doDataListen(eventObj);
                    }
                    return true;
                }
                return false;
            }
        },

        /**
         * 获取指定行的属性集
         * @param {Number|Object} row_rowdata 行号或行数据对象
         * @param {String|Array} colnames 列名（逗号分隔的字符串或数组）
         * @param {Boolean} hasvar 是否合并vars变量
         * @returns {Object} 属性键值对
         */
        getValuesAt: function (row_rowdata, colnames, hasvar) {
            var result = {};
            var rowDataItem;
            if (!isNaN(row_rowdata)) {
                if (this.rows.rangeCheck(row_rowdata)) {
                    rowDataItem = this.rows[row_rowdata];
                } else {
                    throw "In ado:" + this.name + ",getValuesAt(row),row "
                    + row_rowdata + " over range !!!";
                }
            } else {
                rowDataItem = row_rowdata;
            }
            if (rowDataItem) {
                if (colnames) {
                    var nameList = Array.isArray(colnames) ? colnames : colnames.toLowerCase().split(",");
                    for (var nameIdx = 0, nlLen = nameList.length; nameIdx < nlLen; nameIdx++) {
                        result[nameList[nameIdx]] = rowDataItem[nameList[nameIdx]];
                    }
                } else {
                    result.__rowid = rowDataItem.__rowid;
                    result.__rownum = rowDataItem.__rownum;
                    result.__status = rowDataItem.__status;
                    result.__status2 = rowDataItem.__status2;
                    for (var colIdx = 0, colLen = this.columns.length; colIdx < colLen; colIdx++) {
                        result[this.columns[colIdx].name] = rowDataItem.__data[colIdx];
                    }
                }
            }
            if (hasvar) {
                $e.fn.extend(this.vars, result);
            }
            return result;
        },

        /**
         * 批量修改指定行的值
         * @param {Number} row 行号
         * @param {Object} params 要修改的列名和值的键值对
         */
        setValuesAt: function (row, params) {
            if (params) {
                var colIdx;
                var changedCount = 0;
                var hasChanged = false;
                var changedColIndex = -1;
                for (var propKey in params) {
                    colIdx = this.getColumnIndex(propKey);
                    if (colIdx >= 0) {
                        hasChanged = this.setValueAt(row, colIdx, params[propKey], true);
                        changedCount += (hasChanged ? 1 : 0);
                        changedColIndex = colIdx;
                    }
                }
                if (changedCount > 0) {
                    changedCount += (hasChanged ? 1 : 0);
                    var eventObj = this.buildEventObject(ado_status.ROW_EDIT, row, this.getRowID(row), changedCount > 1 ? -2 : changedColIndex);
                    this.doDataListen(eventObj);
                }
            }
        },

        /**
         * 设置是否已编辑的标记
         * @param {Boolean} edit 编辑状态
         */
        setEdit: function (edit) {
            this.isEdit = edit;
        },

        /**
         * 设置数据加载锁定状态
         * @param {Boolean} b 是否锁定
         */
        setLocked: function (b) {
            this.locked = !!b;
        },

        /**
         * 构建数据变动事件对象
         * @param {String} status 事件类型（REFRESH/ROW_EDIT/ROW_ADD/ROW_DELETE等）
         * @param {Number} row 行号
         * @param {*} rowid 行唯一标识
         * @param {Number} col 列号（-1表示无列变更，-2表示多列变更）
         * @returns {Object} 事件对象
         */
        buildEventObject: function (status, row, rowid, col) {
            var eventObj = {
                eventType: status,
                rowid: rowid,
                row: row,
                columnIndex: col,
                columnName: '',
                newValue: null,
                oldValue: null,
                rowData: null,
                ado: this
            };
            if ((status === ado_status.REFRESH) || (row < 0)) {
                eventObj.row = eventObj.rowid = eventObj.columnIndex = -1;
            } else if (status !== ado_status.REFRESH && row >= 0 && row < this.getRowsCount()) {
                eventObj.rowData = this.getRowData(row);
                if (eventObj.rowData !== null && eventObj.rowData.__rowid !== rowid) {
                    eventObj.rowData = null;
                }
            }
            if ((arguments.length >= 4) && (col >= 0)) {
                eventObj.columnName = this.columns[col].name.toLowerCase();
            }
            return eventObj;
        },

        /**
         * 对主缓存区指定列进行求和
         * @param {String|Number|Function} col_method 列名、列号或求和函数
         * @param {Number} prec 小数精度
         * @returns {Number} 求和结果
         */
        sum: function (col_method, prec) {
            var total = 0.0;
            var cellValue;
            if ((typeof col_method) === 'function') {
                var contextArray = [this];
                for (var rowIndex = 0, rowsLen = this.rows.length; rowIndex < rowsLen; rowIndex++) {
                    cellValue = col_method.apply(this.rows[rowIndex], contextArray);
                    total += ((cellValue || 0) - 0);
                }
            } else {
                var colIdx = isNaN(col_method) ? this.getColumnIndex(col_method) : col_method - 0;
                if (colIdx >= 0) {
                    for (var rowIndex = 0, rowsLen = this.rows.length; rowIndex < rowsLen; rowIndex++) {
                        cellValue = this.rows[rowIndex].__data[colIdx];
                        total += ((cellValue || 0) - 0);
                    }
                }
            }
            return (prec || prec === 0) ? total.toFixed(prec) - 0 : total;
        },

        /**
         * 根据列名获取列号（列的位置）
         * @param {String} colname 列名
         * @returns {Number} 列号，-1表示未找到
         */
        getColumnIndex: function (colname) {
            if (colname) {
                if (colname === "$row") {
                    return -100;
                } else if (colname === "__rowid") {
                    return -101;
                } else {
                    var colIdx = this.colsIndex[colname.toLowerCase()];
                    return (colIdx === undefined || colIdx === null) ? -1 : colIdx;
                }
            }
            return -1;
        },

        /**
         * 根据列号获取列名
         * @param {Number} index 列号
         * @returns {String|null} 列名
         */
        getColumnName: function (index) {
            return this.columns.rangeCheck(index) ? this.columns[index].name : null;
        },

        /**
         * 获取指定的列定义对象
         * @param {String|Number} col_name 列名或列号
         * @returns {Column|null} 列定义对象
         */
        getColumn: function (col_name) {
            var idx = isNaN(col_name) ? this.getColumnIndex(col_name) : col_name;
            return this.columns.rangeCheck(idx) ? this.columns[idx] : null;
        },

        /**
         * 获取总列数
         * @returns {Number} 列的数量
         */
        getColumnCount: function () {
            return this.columns.length;
        },

        /**
         * 批量获取多个列名对应的列号数组
         * @param {String|Array} colsname 列名字符串（逗号分隔）或数组
         * @returns {Array} 列号数组
         */
        getColumnsIndex: function (colsname) {
            var columnIndexes = [];
            if (colsname) {
                if (colsname === '#all') {
                    for (var colIdx = 0; colIdx < this.colsIndex.length; colIdx++) {
                        columnIndexes[colIdx] = colIdx;
                    }
                } else {
                    var columnList = colsname;
                    if (typeof (colsname) === 'string') {
                        columnList = colsname.split(",");
                    }
                    for (var colIdx = 0; colIdx < columnList.length; colIdx++) {
                        columnIndexes[colIdx] = this.getColumnIndex(columnList[colIdx]);
                    }
                }
            }
            return columnIndexes;
        },

        /**
         * 根据状态创建默认行数据对象（内部调用）
         * @param {String} status 行状态
         * @param {*} rowid 行唯一标识
         * @returns {RowData} 行数据对象
         */
        createDefaultRowData: function (status, rowid) {
            var colLen = this.columns.length;
            var rowItem = new RowData(colLen, status, rowid, this.colsIndex);
            for (var colIdx = 0; colIdx < colLen; colIdx++) {
                rowItem.__data[colIdx] = this.columns[colIdx].defa;
            }
            return rowItem;
        },

        /**
         * 根据rowid查找所在行号
         * @param {*} rowid 行唯一标识
         * @param {Boolean} all 是否包含过滤缓存区
         * @returns {Number} 行号，未找到返回-1
         */
        findRowByRowID: function (rowid, all) {
            var rowsCount = this.rows.length;
            for (var rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
                if (this.rows[rowIndex].__rowid === rowid) {
                    return rowIndex;
                }
            }
            if (all) {
                for (var rowIndex = 0, flen = this.frows.length; rowIndex < flen; rowIndex++) {
                    if (this.frows[rowIndex].__rowid === rowid) {
                        return rowIndex + rowsCount;
                    }
                }
            }
            return -1;
        },

        /**
         * 清空所有数据和行状态
         * @param {Boolean} stope 是否阻止触发事件
         */
        reset: function (stope) {
            this.rows.length = 0;
            this.frows.length = 0;
            this.isEdit = false;
            if (!stope) {
                this.eventObject = this.buildEventObject(ado_status.REFRESH);
                this.doDataListen(this.eventObject);
            }
        },

        /**
         * 清空所有行的编辑状态
         * @param {String} status 要设置的目标状态
         */
        clearEdit: function (status) {
            var rowItem;
            var statusNoEdit = ado_status.ROW_NOEDIT;
            var allRows = this.rows.concat(this.frows);
            for (var rowIndex = 0, rowsLen = allRows.length; rowIndex < rowsLen; rowIndex++) {
                rowItem = allRows[rowIndex];
                if (status === statusNoEdit) {
                    rowItem.__status = rowItem.__status2 = statusNoEdit;
                }
                rowItem.__cellStatus.length = 0;
            }
            this.isEdit = (status !== statusNoEdit);
        },

        /**
         * 判断是否存在未同步的已修改数据
         * @returns {Boolean} 存在未同步数据返回true
         */
        hasEditData: function () {
            if (this.editCols.length > 0) {
                var dataArray = this.rows;
                for (var passIndex = 0; passIndex < 2; passIndex++) {
                    for (var rowIndex = 0, rowsLen = dataArray.length; rowIndex < rowsLen; rowIndex++) {
                        if (dataArray[rowIndex].__status !== ado_status.ROW_NOEDIT) {
                            return true;
                        }
                    }
                    dataArray = this.frows;
                }
            }
            return false;
        },

        /**
         * 判断数据是否被修改或未保存
         * @returns {Boolean}
         */
        isDataEdit: function () {
            return this.isEdit || this.hasEditData();
        },

        /**
         * 获取所有已修改但未同步的数据
         * @returns {Object|null} 包含data数组的更新参数对象，无数据返回null
         */
        getUpdateData: function () {
            var updateParams = null;
            if (this.editCols.length > 0) {
                updateParams = {
                    convert: "1"
                };
                $e.forActiveCell(this, updateParams);

                var editDataArray = [];
                var rowItem;
                var colIdx;
                var cellStatuses;
                var updateItem = null;
                var value;
                var allRows = this.rows.concat(this.frows);
                for (var rowIndex = 0, rowsLen = allRows.length; rowIndex < rowsLen; rowIndex++) {
                    rowItem = allRows[rowIndex];
                    if ((rowItem.__status !== ado_status.ROW_NOEDIT)
                        && (rowItem.__cellStatus.length > 0)) {
                        updateItem = {
                            __rowid: rowItem.__rowid,
                            __status: rowItem.__status
                        };
                        cellStatuses = rowItem.__cellStatus;
                        for (var cellIdx = 0, csLen = cellStatuses.length; cellIdx < csLen; cellIdx++) {
                            colIdx = cellStatuses[cellIdx];
                            value = rowItem.__data[colIdx];
                            if (value && value instanceof Date) {
                                value = value.getTime();
                            }
                            updateItem["c" + colIdx] = value;
                        }
                        editDataArray.push(updateItem);
                    }
                }
                if (editDataArray.length > 0) {
                    updateParams.data = editDataArray;
                } else {
                    updateParams = null;
                }
            }
            return updateParams;
        },

        /**
         * 注册事件监听
         * @param {Object} listen 监听配置 {name, eventType, method, context}
         * @returns {*} 监听句柄
         */
        addListen: function (listen) {
            return this.listen.add(listen);
        },

        /**
         * 移除事件监听
         * @param {*} handle 监听句柄
         */
        removeListen: function (handle) {
            this.listen.remove(handle);
        },

        /**
         * 延时触发数据变动事件（服务器数据同步后调用）
         */
        doDelayListen: function () {
            var eventsList;
            var delayEventMap = this.delayEvents;
            if (delayEventMap && (delayEventMap.size > 0)) {
                eventsList = delayEventMap[ado_status.REFRESH];
                if (eventsList) {
                    for (var eventIdx = 0, esLen = eventsList.length; eventIdx < esLen; eventIdx++) {
                        this.doDataListen(eventsList[eventIdx]);
                    }
                    this.delayVar = null;
                } else {
                    eventsList = (delayEventMap[ado_status.ROW_DELETE] || []);
                    if (eventsList) {
                        for (var delIdx = 0, delLen = eventsList.length; delIdx < delLen; delIdx++) {
                            this.doDataListen(eventsList[delIdx]);
                        }
                    }
                    eventsList = (delayEventMap[ado_status.ROW_EDIT] || [])
                        .concat((delayEventMap[ado_status.ROW_ADD] || []));
                    for (var editIdx = 0, editLen = eventsList.length; editIdx < editLen; editIdx++) {
                        eventsList[editIdx].row = this.findRowByRowID(eventsList[editIdx].rowid);
                        this.doDataListen(eventsList[editIdx]);
                    }
                }
            } else if (this.delayVar) {
                this.doDataListen(this.buildEventObject(ado_status.EVENT_ALL, -1));
            }
            this.delayEvents = null;
            if (this.delayVar) {
                var varChange;
                for (var varIdx = 0, dvLen = this.delayVar.length; varIdx < dvLen; varIdx++) {
                    varChange = this.delayVar[varIdx];
                    this.doVarChangedListen(varChange.name, varChange.value, varChange.oldValue, true);
                }
                this.delayVar = null;
            }
            this.isInited = true;
        },

        /**
         * 触发数据变动事件监听
         * @param {Object} event_object 事件对象
         */
        doDataListen: function (event_object) {
            event_object = event_object || this.eventObject;
            this.eventObject = event_object;
            if (!this.locked) {
                if ((event_object.row || 0) >= 0) {
                    this.isEdit = (this.editCols.length > 0);
                }
                var eventCopy = $e.fn.extend(event_object, {});
                this.listen.done(eventCopy);
            }
        },

        /**
         * 获取主缓存区数据行数
         * @returns {Number} 行数
         */
        getRowsCount: function () {
            return this.rows.length;
        },

        /**
         * 按指定列排序，支持多列排序
         * @param {Array|String} cols_and_type 排序列及排序方式，可传入二维数组或分号分隔的字符串
         * @param {Boolean} force 是否强制执行排序
         */
        sortBy: function (cols_and_type, force) {
            if (force || this.onSort(cols_and_type)) {
                var sortColumns = cols_and_type;
                if (typeof sortColumns === 'string') {
                    sortColumns = sortColumns.split(";");
                    var commaPos;
                    for (var colIdx = 0, scLen = sortColumns.length; colIdx < scLen; colIdx++) {
                        commaPos = sortColumns[colIdx].indexOf(",");
                        if (commaPos >= 0) {
                            sortColumns[colIdx] = [sortColumns[colIdx].substring(0, commaPos),
                            parseInt(sortColumns[colIdx].substring(commaPos + 1))];
                        } else {
                            sortColumns[colIdx] = [sortColumns[colIdx], 1];
                        }
                    }
                }
                if (sortColumns && sortColumns.length > 0) {
                    for (var colIdx = 0, scLen = sortColumns.length; colIdx < scLen; colIdx++) {
                        sortColumns[colIdx][0] = isNaN(sortColumns[colIdx][0]) ? this.getColumnIndex(sortColumns[colIdx][0]) : (sortColumns[colIdx][0] - 0);
                    }
                    this.rows.sort(function (x, y) {
                        var valueX;
                        var valueY;
                        for (var sortIdx = 0, scLen2 = sortColumns.length; sortIdx < scLen2; sortIdx++) {
                            valueX = x.__data[sortColumns[sortIdx][0]] || '';
                            valueY = y.__data[sortColumns[sortIdx][0]] || '';
                            if (valueX !== valueY) {
                                return (valueX > valueY) ? sortColumns[sortIdx][1] : -sortColumns[sortIdx][1];
                            }
                        }
                        return 0;
                    });
                    this.buildRowNum();
                    var eventObj = this.buildEventObject(ado_status.REFRESH);
                    this.doDataListen(eventObj);
                }
            }
        },

        /**
         * 排序前的回调钩子，返回true允许排序
         * @param {Array} cols_and_type 排序配置
         * @returns {Boolean}
         */
        onSort: function (cols_and_type) {
            return true;
        },

        /**
         * 对指定列进行单列排序
         * @param {String} cname 列名
         * @param {Number} type 排序方式：1为顺序，-1为倒序
         */
        sort: function (cname, type) {
            this.sortBy([[cname, type || 1]]);
        },

        /**
         * 过滤行数据
         * @param {String|Function|Boolean} exp_func 过滤条件，可以是字符串表达式、函数或布尔值
         */
        filter: function (exp_func) {
            if ((arguments.length === 0) || (exp_func === null)
                || (exp_func === '') || (exp_func === true)) {
                exp_func = true;
            } else if (typeof exp_func === 'string') {
                exp_func = createDirectFunc(exp_func);
            }
            if ((typeof exp_func) === 'function') {
                var allRows = this.rows.concat(this.frows);
                var filtered = [];
                var filteredOut = [];
                var contextArray = [this];
                for (var rowIndex = 0, allLen = allRows.length; rowIndex < allLen; rowIndex++) {
                    if (exp_func.apply(allRows[rowIndex], contextArray)) {
                        filtered.push(allRows[rowIndex]);
                    } else {
                        filteredOut.push(allRows[rowIndex]);
                    }
                }
                this.rows = filtered;
                this.frows = filteredOut;
            } else if (exp_func === true) {
                this.rows = this.rows.concat(this.frows);
                this.frows = [];
            } else {
                this.frows = this.rows.concat(this.frows);
                this.rows = [];
            }
            this.buildRowNum();
            this.doDataListen(this.buildEventObject(ado_status.REFRESH));
        },

        /**
         * 跳转到指定分页
         * @param {Number} page 目标页码
         * @param {Object} options 请求选项
         * @returns {Boolean} 成功跳转返回true，已在目标页返回false
         */
        toPage: function (page, options) {
            options = options ? options : {};
            if (page < 0) {
                page = 0;
            } else if (page >= this.dataPage.pages) {
                page = this.dataPage.pages - 1;
            }
            if (page !== this.dataPage.currentPage) {
                options.params = options.params || {};
                options.params._name = this.getName();
                options.params.page = page;
                this.request('pagedata', '', null, null, options);
                return true;
            }
            return false;
        },

        /**
         * 跳转到下一页
         * @param {Object} options 请求选项
         * @returns {Boolean} 成功返回true，已是最后一页返回false
         */
        nextPage: function (options) {
            var pageInfo = this.getDataPage();
            if (pageInfo.getCurrentPage() < pageInfo.getPageCount() - 1) {
                return this.toPage(pageInfo.getCurrentPage() + 1, options);
            }
            return false;
        },

        /**
         * 释放ADOAgent资源，清除所有监听和缓存数据
         */
        release: function () {
            if (this.listen) {
                this.listen.release();
                this.listen = null;
            }
            if (this.varListen) {
                for (var listenerKey in this.varListen) {
                    this.varListen[listenerKey].release();
                }
                this.varListen = null;
            }
            this.reset(true);
            $e.removeADO(this.getName(), this.getActiveModuleName());
            this.dataPage.release();
            this.dataPage = null;
        },

        /**
         * 返回名称字符串
         * @returns {String}
         */
        toString: function () {
            return this.name;
        }
    };

    /**
     * 行数据构造函数，定义一行的属性（包括状态、行ID、列数据等）
     * @param {Number} len 列数
     * @param {String} status 行状态
     * @param {*} rowid 行唯一标识
     * @param {Object} columnsindex 列名到列号的映射
     */
    function RowData(len, status, rowid, columnsindex) {
        this.__status = this.__status2 = status;
        this.__cellStatus = [];
        this.__rowid = rowid;
        this.__data = new Array(len);
        this.__cols = columnsindex;
        for (var colName in columnsindex) {
            watchData(this, colName);
        }
        watchData(this, "$row");
    }

    RowData.prototype = {
        __rownum: -1,
        __row: -1
    };

    /**
     * 列定义构造函数
     * @param {String} name 列名
     * @param {String} type 数据类型（string/date/datetime/int/number）
     * @param {Number} precision 精度
     * @param {*} defa 默认值
     */
    function Column(name, type, precision, defa) {
        this.name = name.toLowerCase();
        this.dataType = type.toLowerCase();
        this.precision = precision;
        this.defa = defa;
    }

    /**
     * 数据分页对象构造函数
     * @param {ADOAgent} ado 所属的ADOAgent实例
     * @param {Number} _pagerows 每页行数
     * @param {Number} _page 当前页码
     * @param {Number} _pages 总页数
     */
    function DataPage(ado, _pagerows, _page, _pages) {
        this.ado = ado;
        this.pageRows = _pagerows;
        this.changePage(_page, _pages);
    }

    DataPage.prototype = {
        ado: null,
        pages: 1,
        pageRows: 0,
        currentPage: 0,
        refreshRows: 0,

        /**
         * 修改当前分页信息
         * @param {Number} page 当前页码
         * @param {Number} pages 总页数
         */
        changePage: function (page, pages) {
            page = page <= 0 ? 0 : page;
            this.currentPage = page;
            this.pages = pages;
        },

        /**
         * 获取每页行数
         * @returns {Number}
         */
        getPageRows: function () {
            return this.pageRows;
        },

        /**
         * 根据相对行号计算全局行号
         * @param {Number} row 当前页内的行号
         * @returns {Number} 全局行号
         */
        getRowNum: function (row) {
            var num;
            if (this.ado.pageLoadReset || this.currentPage <= 0) {
                num = this.currentPage * this.pageRows + row;
            } else {
                num = row;
            }
            return num;
        },

        /**
         * 将全局行号转换为当前页内的实际行号
         * @param {Number} row 全局行号
         * @returns {Number} 页面内行号
         */
        getRealRow: function (row) {
            var num;
            if (this.ado.pageLoadReset || this.currentPage <= 0 || row < this.pageRows || this.pageRows <= 0) {
                num = row;
            } else {
                num = row % this.pageRows;
            }
            return num;
        },

        /**
         * 获取总页数
         * @returns {Number}
         */
        getPageCount: function () {
            return this.pages;
        },

        /**
         * 获取当前页码
         * @returns {Number}
         */
        getCurrentPage: function () {
            return this.currentPage;
        },

        /**
         * 获取当前页刷新行数
         * @returns {Number}
         */
        getRefreshRows: function () {
            return this.refreshRows;
        },

        /**
         * 判断是否存在下一页
         * @returns {Boolean}
         */
        hasNextPage: function () {
            return this.pages > 1 && (this.currentPage < this.pages - 1);
        },

        /**
         * 释放分页对象资源
         */
        release: function () {
            this.ado = null;
        }
    };

    /**
     * 为行数据对象注册列属性的getter/setter
     * @param {RowData} rowdata 行数据对象
     * @param {String} name 列名
     */
    function watchData(rowdata, name) {
        if (!(name in rowdata) && (name in rowdata.__cols) || name === '$row') {
            Object.defineProperty(rowdata, name, {
                configurable: true,
                get: function () {
                    return (name === "$row") ? (this.__rownum + 1) : this.__data[this.__cols[name]];
                },
                set: function (val) {
                }
            });
        }
    }

    /**
     * 将字符串表达式创建为可执行的函数
     * @param {String|Function} exp 字符串表达式或函数
     * @returns {Function}
     */
    function createDirectFunc(exp) {
        if (typeof exp !== 'function') {
            if (exp.indexOf('return') < 0) {
                exp = "return (" + exp + ")";
            }
            return new Function("with(this){" + exp + "}");
        }
        return exp;
    }

    $e.fn.extend($e.ModuleCell, ADOAgent.prototype);
    $e.fn.extend($e.varEventsManager, ADOAgent.prototype);
    $e.ADOAgent = ADOAgent;
}($e);