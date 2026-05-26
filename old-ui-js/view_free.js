/**
 * @file 自由布局视图组件
 * @description 支持坐标定位或命名位置定位的自由布局容器，内部容器必需是table
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var freeView = $e.ui.createView('view_free', {
 *     adoName: 'myData',
 *     fields: [
 *         { name: 'name', type: 'text' },
 *         { name: 'age', type: 'number' }
 *     ]
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 自由布局视图组件构造函数
     * @class FreeView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的ADO数据对象名称
     * @param {Array} [options.fields] - 字段配置数组
     */
    function FreeView(options) {
        this.props = options || {};
        this.adoName = options['adoName'];
        this.fields = {};
        this._handles = {};
        var fds = this.props['fields'];
        if (fds) {
            fds.elementToLowerCase('name');
        }
    }

    FreeView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_free',
        dataRow: -1,
        fields: null,
        enable: true,
        _handles: null,
        locked: false,
        _inited: false,
        _isError: false,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
            }
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            var elements = this.shell.querySelectorAll("[data-name]") || [];
            var es = {};
            for (var i = 0; i < elements.length; i++) {
                es[elements[i].getAttribute('data-name').toLowerCase()] = elements[i];
            }
            var fds = this.props['fields'];
            var name, e1;
            if (fds instanceof Array) {
                for (var i = 0; i < fds.length; i++) {
                    name = fds[i]['name'];
                    e1 = es[name];
                    if (e1) {
                        this.bindField(e1, fds[i]);
                    }
                }
            }
            this.bindListen($e.events.regEvent(this.getBody(), 'scroll', $e.fn, $e.fn.syncMovingMenu));
            if (ado && ado.isInited) {
                this.setSelectedRow(0);
            }
            if (this.getShell().querySelector('.rs-fix') && !this.rsh) {
                this.rsh = '100%';
            }
            this._inited = true;
            this.inited();
        },

        /**
         * 绑定字段
         * @private
         * @param {HTMLElement} shell - 字段DOM元素
         * @param {Object} options - 字段配置
         * @returns {Object|null} 字段实例
         */
        bindField: function (shell, options) {
            options._mn = this._mn;
            options._amn = this._amn;
            var field = $e.ui.createField(shell, options);
            if (field) {
                field.__col = -1;
                field.init();
                var ado = this.getADO();
                if (ado) {
                    field.__col = ado.getColumnIndex(field.getName());
                    if (field.__col >= 0 && field.field) {
                        var column = ado.getColumn(field.__col);
                        if (column.dataType === 'string' && column.precision > 0 && (field.type === 'text' || field.type === 'textarea') && (field.field.getAttribute('maxLength') || '').length === 0) {
                            field.field.setAttribute('maxLength', column.precision || 0);
                        }
                    }
                }
                this.addField(field);
            }
            return field;
        },

        /**
         * 添加字段
         * @public
         * @param {Object} field - 字段实例
         * @returns {void}
         */
        addField: function (field) {
            var name = field.getName().toLowerCase();
            this.fields[name] = field;
            this._handles[name] = field.addChangedListen(this, this.acceptChanged);
            if (typeof field['onLoad'] === 'function') {
                field.onLoad();
            }
        },

        /**
         * 移除字段
         * @public
         * @param {string} name - 字段名称
         * @returns {Object|null} 被移除的字段
         */
        removeField: function (name) {
            name = name.toLowerCase();
            var field = this.fields[name];
            if (field) {
                field.removeChangedListen(this._handles[name]);
                delete this.fields[name];
                delete this._handles[name];
            }
            return field;
        },

        /**
         * 获取字段
         * @public
         * @param {string} name - 字段名称
         * @returns {Object|undefined} 字段实例
         */
        getField: function (name) {
            name = name.toLowerCase();
            return this.fields[name];
        },

        /**
         * 数据监听处理
         * @private
         * @param {Object} options - 事件选项
         * @returns {void}
         */
        doDataListen: function (options) {
            if (!this.locked) {
                var ado = options.ado || this.getADO();
                if (ado) {
                    var row = (this.dataRow < 0 && ado.getRowsCount() > 0) ? 0 : this.dataRow;
                    var type = options.eventType;
                    if (type === ado_status.REFRESH) {
                        this.clearValid();
                    }
                    if (type === ado_status.ROW_EDIT && options.columnIndex >= 0 && row === options.row) {
                        var field = this.getField(options.columnName);
                        if (field) {
                            field.setValue(ado.getValueAt(row, options.columnIndex));
                        }
                        this.setEnable(this.validEnable(options), options);
                    } else {
                        this.setSelectedRow(row, false, options);
                    }
                }
            }
        },

        /**
         * 获取当前选中行
         * @public
         * @returns {number} 当前行索引
         */
        getSelectedRow: function () {
            return this.dataRow;
        },

        /**
         * 设置选中行
         * @public
         * @param {number} row - 行索引
         * @param {boolean} [force=false] - 是否强制设置
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        setSelectedRow: function (row, force, options) {
            if (!this.locked || force) {
                try {
                    this.locked = true;
                    this.dataRow = row;
                    var ado = this.getADO();
                    if (ado) {
                        options = options || ado.buildEventObject(ado_status.REFRESH);
                        var rowData = (row >= 0 && row < ado.getRowsCount()) ? ado.getRowData(row) : ado.createDefaultRowData('0', -1);
                        var field, name, value;
                        for (var i in this.fields) {
                            field = this.fields[i];
                            if (field.__col !== -1) {
                                name = field.getName().toLowerCase();
                                value = rowData[name];
                                if (options.eventType === ado_status.REFRESH || value !== field.getValue()) {
                                    field.setValue(value);
                                }
                            }
                        }
                        this.setEnable(this.validEnable(options), options);
                    }
                } catch (e) {
                    throw e;
                } finally {
                    this.locked = false;
                }
            }
        },

        /**
         * 验证启用状态
         * @private
         * @param {Object} options - 选项
         * @returns {boolean} 是否启用
         */
        validEnable: function (options) {
            var ado = this.getADO();
            return ado ? ado.getRowsCount() > 0 : true;
        },

        /**
         * 设置启用状态
         * @public
         * @param {boolean} enable - 是否启用
         * @param {Object} [data] - 数据对象
         * @returns {void}
         */
        setEnable: function (enable, data) {
            if (!data) {
                var ado = this.getADO();
                if (ado) {
                    data = ado.buildEventObject(ado_status.REFRESH);
                }
            } else {
                data = $e.fn.extend(data, {});
            }
            if (data) {
                data.row = this.dataRow;
            }
            this.enable = enable;
            var field;
            for (var i in this.fields) {
                field = this.fields[i];
                if (field.__col !== -1) {
                    if (enable) {
                        field.setEnable(field.validEnable(data));
                        if (typeof field['setEditable'] === 'function') {
                            field.setEditable(field.validEditable(data));
                        }
                    } else {
                        field.setEnable(false);
                    }
                }
            }
        },

        /**
         * 判断是否启用
         * @public
         * @returns {boolean} 是否启用
         */
        isEnable: function () {
            return this.enable;
        },

        /**
         * 组件值变动事件处理
         * @public
         * @param {Object} field - 字段实例
         * @returns {void}
         */
        acceptChanged: function (field) {
            var ado = this.getADO();
            if (!this.locked && ado && this.dataRow >= 0 && field.__col >= 0) {
                ado.setValueAt(this.dataRow, field.__col, field.getValue());
            }
        },

        /**
         * 接受输入
         * @public
         * @returns {void}
         */
        acceptInput: function () {
            if (document.activeElement) {
                var field = $e.fn.queryOwner(document.activeElement, true);
                if (field && $e.fn.queryOwnerView(document.activeElement) === this) {
                    if (typeof field['acceptInput'] === 'function') {
                        field.acceptInput();
                    }
                }
            }
        },

        /**
         * 清除验证错误
         * @public
         * @param {string} [name] - 字段名称
         * @returns {void}
         */
        clearValid: function (name) {
            this._isError = false;
            for (var i in this.fields) {
                if (typeof this.fields[i]['removeValidError'] === 'function') {
                    this.fields[i].removeValidError();
                }
            }
        },

        /**
         * 验证输入
         * @public
         * @param {boolean} [mult=false] - 是否验证多个字段
         * @param {Array} [ns] - 字段名称数组
         * @returns {boolean} 是否验证通过
         */
        validInput: function (mult, ns) {
            this.clearValid();
            if (!ns) {
                var fs = this.getShell().querySelectorAll('[data-name]');
                ns = [];
                for (var i = 0; i < fs.length; i++) {
                    ns.push(fs[i].getAttribute('data-name'));
                }
            }
            var field, rs, result = true;
            for (var i = 0; i < ns.length; i++) {
                field = this.getField(ns[i]);
                if (field) {
                    rs = field.validValue(this);
                    if (rs !== true) {
                        result = false;
                        this.validError(rs);
                        if (!mult) {
                            break;
                        }
                    }
                }
            }
            return result;
        },

        /**
         * 验证错误处理
         * @public
         * @param {Object} options - 错误选项
         * @param {string} options.name - 字段名称
         * @param {string} [options.type] - 错误类型
         * @param {string} [options.errinfo] - 错误信息
         * @returns {boolean} 始终返回false
         */
        validError: function (options) {
            var field = this.getField(options.name);
            if (field && typeof field['addValidError'] === 'function') {
                field.addValidError(options['errinfo'] || '');
                if (!this._isError) {
                    this._isError = true;
                    field.getShell().scrollIntoView(false);
                }
            }
            return false;
        },

        /**
         * 修改属性
         * @public
         * @param {Object} props - 属性对象
         * @returns {void}
         */
        changeProperty: function (props) {
            if (props) {
                var vs;
                for (var name in props) {
                    vs = props[name];
                    if (name.startsWith('/')) {
                        this.changeFieldProperty(name.substring(1), props[name]);
                    } else {
                        this.changeViewProperty(name, props[name]);
                    }
                    this.onChangedProperty(name, props[name]);
                }
            }
        },

        /**
         * 属性变更回调（子类可覆盖）
         * @public
         * @param {string} name - 属性名称
         * @param {*} value - 属性值
         * @returns {void}
         */
        onChangedProperty: function (name, value) {
            // 子类实现具体逻辑
        },

        /**
         * 修改视图属性
         * @public
         * @param {string} name - 属性名称
         * @param {*} value - 属性值
         * @returns {void}
         */
        changeViewProperty: function (name, value) {
            this.props[name] = value;
        },

        /**
         * 修改字段属性
         * @public
         * @param {string} name - 字段名称
         * @param {*} kv - 属性值或属性对象
         * @returns {void}
         */
        changeFieldProperty: function (name, kv) {
            name = name.toLowerCase();
            var field = this.getField(name);
            if (field) {
                if (field['changeProperty']) {
                    field.changeProperty(kv);
                }
            } else {
                var fds = this.props['fields'];
                if (fds) {
                    var p1 = fds.search('name', name);
                    if (p1 >= 0) {
                        if (typeof kv === 'string') {
                            kv = kv.length > 0 ? JSON.parse(kv) : {};
                        }
                        if ($e.fn.isPlainObject(kv)) {
                            $e.fn.extend(kv, fds[p1], true);
                        }
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
         * 创建自由布局视图组件实例
         * @param {Object} options - 组件配置
         * @returns {FreeView} 自由布局视图组件实例
         */
        create: function (options) {
            return new FreeView(options);
        },

        /**
         * 获取视图原型
         * @returns {Object} 视图原型对象
         */
        viewPrototype: function () {
            return FreeView.prototype;
        }
    };
    $e.ui.addViewPlugin('view_free', plugin);
}($e);