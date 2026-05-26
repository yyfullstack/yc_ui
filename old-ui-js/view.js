/**
 * @file 视图核心模块
 * @description 提供UI组件基础功能，包括视图管理、字段管理、窗口管理、消息提示、拖动、缩放等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * UI核心对象
     * @namespace
     */
    $e.ui = {
        /** @type {HTMLElement|null} 遮罩层元素 */
        maskElement: null,
        /** @type {Array} 对话框堆栈 */
        dialogStack: [],
        /** @type {HTMLElement|null} 消息对话框元素 */
        messageElement: null,
        /** @type {Object} 视图插件注册表 */
        viewPlugin: {},
        /** @type {Object} 输入插件注册表 */
        inputPlugin: {},

        /**
         * 显示消息对话框
         * @public
         * @param {string} text - 消息文本
         * @param {Object} [options] - 配置选项
         * @param {boolean} [options.isnew] - 是否创建新实例
         * @param {string} [options.title] - 标题
         * @param {string} [options.ico] - 图标类型 info/no/warn/ok/stop
         * @param {Object} [options.context] - 上下文
         * @param {Object} [options.buttons] - 按钮配置
         * @returns {Object} 消息对话框实例
         */
        showMessage: function (text, options) {
            options = options ? options : {};
            options.text = text;
            var msgDialog = this.message(options && options.isnew);
            msgDialog.show(text, options);
            return msgDialog;
        },

        /**
         * 调用所有者方法
         * @public
         * @param {HTMLElement} element - DOM元素
         * @param {string} methodName - 方法名称
         */
        callOwnerMethod: function (element, methodName) {
            var owner = $e.fn.queryOwner(element);
            if (owner && owner[methodName]) {
                var arr = [].slice.apply(arguments, [2]) || [];
                owner[methodName].apply(owner, arr);
            }
        },

        /**
         * 初始化动作绑定
         * @public
         * @param {Object} viewCell - 视图单元
         * @param {string} [eventName] - 事件名称，默认为click
         */
        initAction: function (viewCell, eventName) {
            var viewCells = viewCell.getShell().querySelectorAll('[action]');
            if (viewCells) {
                var name;
                for (var i = 0, len = viewCells.length; i < len; i++) {
                    name = viewCells[i].getAttribute('action');
                    if (viewCell.doAction) {
                        viewCell.bindListen($e.events.regEvent(viewCells[i], eventName || 'click', viewCell, viewCell.doAction, name));
                    } else if (viewCell[name] && (typeof viewCell[name]) === 'function') {
                        viewCell.bindListen($e.events.regEvent(viewCells[i], eventName || 'click', viewCell, viewCell[name]));
                    }
                }
            }
        },

        /**
         * 调整子元素大小（基于 box-sizing: border-box）
         * @public
         * @param {HTMLElement} element - 父元素
         * @param {Object} [options] - 配置选项
         * @param {number} [options.height] - 指定高度
         */
        resizeChildren: function (element, options) {
            if (element) {
                var availableHeight, totalHeight = 0, position, resizableChildren = [], hiddenChildren = [], rshValue, view, marginTop = 0, marginBottom = 0, other = [], style;
                var nodes = element.children;
                if (nodes && nodes.length > 0) {
                    for (var i = 0, nodesLen = nodes.length; i < nodesLen; i++) {
                        style = $e.fn.getStyle(nodes[i]);
                        if (style.display === 'none') {
                            continue;
                        }
                        position = style.position;
                        rshValue = nodes[i].getAttribute('rsh') || nodes[i].rsh;
                        if (!rshValue && nodes[i].$owner) {
                            rshValue = nodes[i].$owner.rsh;
                        }
                        if ((position === 'absolute') || (position === 'fixed') || (rshValue === 'none') || (rshValue === 'auto')) {
                            if (rshValue === 'none') {
                                if (nodes[i].$owner && nodes[i].$owner.resize) {
                                    nodes[i].$owner.resize();
                                } else {
                                    $e.ui.resizeChildren(nodes[i]);
                                }
                            }
                            continue;
                        }
                        view = nodes[i].$owner;
                        availableHeight = $e.fn.realSize(nodes[i]);
                        marginTop = availableHeight.marginTop;
                        if (rshValue) {
                            resizableChildren.push(nodes[i]);
                            hiddenChildren.push(parseFloat(rshValue) / 100);
                        } else if (nodes.length === 1 && view && view.rshAuto) {
                            resizableChildren.push(nodes[i]);
                            hiddenChildren.push(1.0);
                        } else {
                            rshValue = availableHeight.height + availableHeight.marginHeight;
                            other.push(nodes[i]);
                            totalHeight += rshValue;
                        }
                        if (marginTop !== 0 && marginBottom !== 0) {
                            if (marginTop > 0 && marginBottom > 0) {
                                totalHeight -= Math.min(marginTop, marginBottom);
                            } else if (marginTop < 0 && marginBottom > 0) {
                                totalHeight -= Math.abs(marginTop);
                            } else if (marginTop > 0 && marginBottom < 0) {
                                totalHeight -= Math.abs(marginBottom);
                            } else if (marginTop < 0 && marginBottom < 0) {
                                totalHeight += Math.min(marginTop, marginBottom);
                            }
                        }
                        marginBottom = availableHeight.marginBottom;
                    }
                    totalHeight += marginBottom;
                    var display = $e.fn.getStyle(element, 'display');
                    var resizeOptions;
                    availableHeight = $e.fn.realSize(element, display === 'table');

                    resizeOptions = (!!options) ? { height: options.height } : { height: 0 };
                    if (!resizeOptions.height || resizeOptions.height <= 0) {
                        resizeOptions.height = availableHeight.height - availableHeight.blankHeight;
                    }
                    var currentView;
                    if (resizableChildren.length > 0) {
                        var remainingHeight = resizeOptions.height - totalHeight;
                        if (remainingHeight > 0) {
                            for (var j = 0, rsLen = resizableChildren.length; j < rsLen; j++) {
                                rshValue = hiddenChildren[j] * remainingHeight;
                                availableHeight = $e.fn.realSize(resizableChildren[j]);
                                currentView = resizableChildren[j].$owner;
                                if (currentView && currentView.resize) {
                                    currentView.resize({ height: rshValue });
                                } else {
                                    rshValue -= availableHeight.marginHeight;
                                    if (rshValue > 0) {
                                        $e.fn.setStyle(resizableChildren[j], 'height:' + rshValue + 'px');
                                        this.resizeChildren(resizableChildren[j], { height: rshValue - availableHeight.blankHeight });
                                    }
                                }
                            }
                        }
                    } else if (other.length === 1) {
                        currentView = other[0].$owner;
                        if (currentView) {
                            if (currentView.resize) {
                                currentView.resize(resizeOptions);
                            }
                        } else {
                            availableHeight = $e.fn.realSize(other[0]);
                            resizeOptions.height = resizeOptions.height - availableHeight.marginHeight - availableHeight.blankHeight;
                            $e.ui.resizeChildren(other[0], resizeOptions);
                        }
                    } else if (other.length > 1) {
                        for (var k = 0, otherLen = other.length; k < otherLen; k++) {
                            currentView = other[k].$owner;
                            if (currentView !== null) {
                                if (currentView.resize) {
                                    currentView.resize();
                                }
                            }
                            if ($e.fn.hasClass(other[k], 'yc-view-area') || $e.fn.hasClass(other[k], 'calc-area')) {
                                $e.ui.resizeChildren(other[k]);
                            }
                        }
                    }
                }
            }
        },

        /**
         * 视图单元基础方法
         * @namespace
         */
        ViewCell: {
            /**
             * 获取外壳元素
             * @public
             * @returns {HTMLElement} 外壳元素
             */
            getShell: function () {
                return this.shell;
            },

            /**
             * 绑定监听
             * @public
             * @param {Object} listen - 监听对象
             * @returns {Object} 监听句柄
             */
            bindListen: function (listen) {
                if (!this.eventCell) {
                    this.eventCell = $e.events.createEventCell();
                }
                return this.eventCell.add(listen);
            },

            /**
             * 解绑监听
             * @public
             * @param {Object} handle - 监听句柄
             */
            unBindListen: function (handle) {
                if (this.eventCell) {
                    this.eventCell.remove(handle);
                }
            },

            /**
             * 初始化完成回调
             * @public
             */
            inited: function () {
            }
        },

        /**
         * 抽象字段基础方法
         * @namespace
         */
        AbstractField: {
            /** @type {string} 所有者类型 */
            ownerType: 'field',
            /** @type {boolean} 是否锁定 */
            locked: false,
            /** @type {boolean} 是否启用 */
            enable: true,
            /** @type {boolean} 是否可见 */
            nviable: true,
            /** @type {boolean} 是否可编辑 */
            editable: true,

            /**
             * 获取类型
             * @public
             * @returns {string} 类型
             */
            getType: function () {
                return this.type;
            },

            /**
             * 获取所有者视图
             * @public
             * @returns {Object} 视图对象
             */
            getOwnerView: function () {
                return $e.fn.queryOwnerView(this.getShell());
            },

            /**
             * 验证是否启用
             * @public
             * @param {Object} [options] - 选项
             * @returns {boolean} 是否启用
             */
            validEnable: function (options) {
                return true;
            },

            /**
             * 验证是否可编辑
             * @public
             * @param {Object} [options] - 选项
             * @returns {boolean} 是否可编辑
             */
            validEditable: function (options) {
                return true;
            },

            /**
             * 验证值
             * @public
             * @param {Object} [context] - 上下文
             * @returns {boolean|Object} 验证结果
             */
            validValue: function (context) {
                if (this.props && this.props.validEmpty) {
                    var value = this.getValue();
                    if (value == null || value === '') {
                        return {
                            errinfo: this.props.errinfo,
                            type: 'empty',
                            name: this.getName()
                        };
                    }
                }
                return true;
            },

            /**
             * 设置启用状态
             * @public
             * @param {boolean} able - 是否启用
             * @param {boolean} [nviable] - 是否可见
             */
            setEnable: function (able, nviable) {
                this.enable = !!able;
                this.nviable = (nviable === undefined ? this.enable : nviable);
            },

            /**
             * 是否启用
             * @public
             * @param {Object} [options] - 选项
             * @returns {boolean} 是否启用
             */
            isEnable: function (options) {
                return this.enable;
            },

            /**
             * 设置可编辑状态
             * @public
             * @param {boolean} able - 是否可编辑
             */
            setEditable: function (able) {
            },

            /**
             * 是否可编辑
             * @public
             * @param {Object} [options] - 选项
             * @returns {boolean} 是否可编辑
             */
            isEditable: function (options) {
                return false;
            },

            /**
             * 添加变更监听
             * @public
             * @param {Object} context - 上下文
             * @param {Function} method - 方法
             * @returns {Object} 监听句柄
             */
            addChangedListen: function (context, method) {
                if (!this.changeEventCell) {
                    this.changeEventCell = $e.events.createEventCell();
                }
                return this.changeEventCell.add({
                    context: context || this,
                    method: method,
                    args: [].slice.apply(arguments, [2]) || []
                });
            },

            /**
             * 执行变更监听
             * @public
             */
            doChangedListen: function () {
                if (this.changeEventCell) {
                    this.changeEventCell.done(this);
                }
            },

            /**
             * 移除变更监听
             * @public
             * @param {Object} handle - 监听句柄
             */
            removeChangedListen: function (handle) {
                if (this.changeEventCell) {
                    this.changeEventCell.remove(handle);
                }
            },

            /**
             * 执行动作
             * @public
             * @param {Event} event - 事件对象
             * @param {string} name - 动作名称
             */
            doAction: function (event, name) {
                if (this.nviable) {
                    if (name && (typeof this[name] === 'function')) {
                        this[name].apply(this, event);
                    } else {
                        this.done(event);
                    }
                }
            },

            /**
             * 完成回调
             * @public
             * @param {Event} event - 事件对象
             */
            done: function (event) {
            },

            /**
             * 释放资源
             * @public
             */
            release: function () {
                if (typeof this.selfRelease === 'function') {
                    this.selfRelease();
                }
                if (this.eventCell) {
                    this.eventCell.release();
                    this.eventCell = null;
                }
                if (this.changeEventCell) {
                    this.changeEventCell.release();
                    this.changeEventCell = null;
                }
                if (this.shell) {
                    delete this.shell.$owner;
                    $e.fn.setChild(this.shell, null);
                    this.shell.removeAttribute('data-name');
                    this.shell = null;
                }
            }
        },

        /**
         * 基础字段方法
         * @namespace
         */
        BasicField: {
            /**
             * 设置启用状态
             * @public
             * @param {boolean} able - 是否启用
             * @param {boolean} [nviable] - 是否可见
             */
            setEnable: function (able, nviable) {
                able = !!able;
                this.enable = able;
                if (this.field) {
                    $e.fn.enableField(this.field, able);
                }
                if (nviable === undefined) {
                    nviable = able;
                }
                this.nviable = nviable;
                $e.fn.enableFields(this.getShell().querySelectorAll('button'), nviable);
            },

            /**
             * 设置可编辑状态
             * @public
             * @param {boolean} able - 是否可编辑
             */
            setEditable: function (able) {
                this.editable = !!able;
                if (this.field) {
                    $e.fn.editableField(this.field, this.editable);
                }
            },

            /**
             * 是否可编辑
             * @public
             * @returns {boolean} 是否可编辑
             */
            isEditable: function () {
                return this.enable && this.editable;
            },

            /**
             * 选中内容
             * @public
             * @param {boolean} [all] - 是否全选
             */
            select: function (all) {
                if (this.field && this.field.select) {
                    this.field.select();
                    this.field.focus();
                }
            },

            /**
             * 获取值
             * @public
             * @returns {*} 字段值
             */
            getValue: function () {
                return this.formatValue(this.field.value, true);
            },

            /**
             * 设置值
             * @public
             * @param {*} value - 值
             * @param {boolean} [stopEvent] - 是否停止事件
             */
            setValue: function (value, stopEvent) {
                if (!this.locked || stopEvent) {
                    try {
                        this.locked = true;
                        this.field.value = this.formatValue(value, this.field === document.activeElement);
                        if (!stopEvent) {
                            this.doChangedListen();
                        }
                        this.oldValue = value;
                    } catch (e) {
                        throw new Error('input ' + this.name + ', setValue error:' + e);
                    } finally {
                        this.locked = false;
                    }
                }
            },

            /**
             * 格式化值
             * @public
             * @param {*} value - 值
             * @param {boolean} focused - 是否聚焦
             * @returns {*} 格式化后的值
             */
            formatValue: function (value, focused) {
                return value;
            },

            /**
             * 变更回调
             * @public
             */
            onChanged: function () {
            },

            /**
             * 接受输入
             * @public
             * @param {string} [attr] - 属性
             */
            acceptInput: function (attr) {
                if (this.field === document.activeElement) {
                    this.setValue(this.field.value);
                }
            },

            /**
             * 查询字段元素
             * @public
             * @param {string} [attr] - 选择器
             * @returns {HTMLElement|null} 字段元素
             */
            queryField: function (attr) {
                var f = null;
                if (this.shell.tagName === 'INPUT' || this.shell.tagName === 'TEXTAREA') {
                    f = this.shell;
                } else {
                    f = this.shell.querySelector(attr || 'INPUT');
                    if (!f) {
                        f = this.shell.querySelector('TEXTAREA');
                    }
                }
                return f;
            },

            /**
             * 触发变更
             * @public
             * @param {boolean} [force] - 是否强制触发
             */
            changed: function (force) {
                if (!this.locked || force) {
                    this.doChangedListen();
                    this.onChanged();
                }
            }
        },

        /**
         * 抽象视图基础方法
         * @namespace
         */
        AbstractView: {
            /** @type {string} 所有者类型 */
            ownerType: 'view',

            /**
             * 获取内容区域
             * @public
             * @returns {HTMLElement} 内容元素
             */
            getBody: function () {
                return this.body || this.shell;
            },

            /**
             * 加载完成回调
             * @public
             */
            onLoad: function () {
            },

            /**
             * 获取类型
             * @public
             * @returns {string} 类型
             */
            getType: function () {
                return this.type;
            },

            /**
             * 释放资源
             * @public
             * @param {boolean} [withAdo] - 是否释放ADO
             * @param {boolean} [withChild] - 是否释放子元素
             */
            release: function (withAdo, withChild) {
                if (this.eventCell) {
                    this.eventCell.release();
                    this.eventCell = null;
                }
                $e.ui.releaseView(this, withAdo, withChild);
            },

            /**
             * 变更属性
             * @public
             * @param {Object} props - 属性
             */
            changeProperty: function (props) {
            },

            /**
             * 获取ADO名称
             * @public
             * @returns {string} ADO名称
             */
            getADOName: function () {
                return this.adoName;
            },

            /**
             * 调整大小
             * @public
             * @param {Object} [options] - 选项
             * @param {number} [options.height] - 高度
             */
            resize: function (options) {
                var self = this;
                var resizeOptions = null;
                var availableHeight = $e.fn.realSize(self.getShell());
                if (!!options) {
                    resizeOptions = { height: options.height - availableHeight.marginHeight };
                } else {
                    resizeOptions = { height: availableHeight.height };
                }
                if (resizeOptions.height > 0) {
                    var rsh = self.rsh || self.getShell().getAttribute('rsh');
                    if (rsh && rsh !== 'none') {
                        var h = parseFloat(rsh) / 100 * resizeOptions.height;
                        if (h > 0) {
                            $e.fn.setStyle(self.getShell(), 'height:' + resizeOptions.height + 'px;');
                        }
                    }
                    setTimeout(function () {
                        $e.ui.resizeChildren(self.getShell(), { height: resizeOptions.height - availableHeight.blankHeight });
                    }, 50);
                }
            }
        },

        /**
         * 添加视图插件
         * @public
         * @param {string} type - 类型
         * @param {Object} plugin - 插件
         */
        addViewPlugin: function (type, plugin) {
            this.viewPlugin[type] = plugin;
        },

        /**
         * 获取视图插件
         * @public
         * @param {string} type - 类型
         * @returns {Object} 插件
         */
        getViewPlugin: function (type) {
            return this.viewPlugin[type];
        },

        /**
         * 创建视图
         * @public
         * @param {Object} props - 属性
         * @returns {Object|null} 视图对象
         */
        createView: function (props) {
            var plugin = this.viewPlugin[props.type];
            var view = null;
            if (plugin) {
                var overwrite = props.overwrite;
                var overwriteSubClass = null;
                if (overwrite) {
                    if (overwrite.extend) {
                        overwriteSubClass = $e.fn.createObject(overwrite.extend);
                        delete overwrite.extend;
                    }
                    $e.fn.extend(overwrite, props, true);
                }
                view = plugin.create(props);
                $e.fn.extend(this.AbstractView, view);
                var subClass = props.extend;
                if (subClass) {
                    var fieldSubClass = $e.fn.createObject(subClass);
                    $e.fn.extend(fieldSubClass, view, true);
                    delete props.extend;
                }
                if (overwriteSubClass) {
                    $e.fn.extend(overwriteSubClass, view, true);
                }
                if (props.childOrigin) {
                    view.changeProperty(props.childOrigin);
                    delete props.childOrigin;
                }
                var shell = view.shell;
                if (!shell) {
                    var css = props.className ? props.className : ('yc-view yc-' + view.type.replace('_', '-'));
                    shell = view.shell = $e.fn.create('div', css);
                }
                if (props.style) {
                    $e.fn.setStyle(shell, props.style);
                }
                this.initViewCell(view, props);
                shell.$owner = view;
                if (props.html) {
                    shell.innerHTML = props.html;
                }
                if ((typeof view.onInit) === 'function') {
                    view.onInit(props);
                }
            }
            return view;
        },

        /**
         * 初始化视图单元
         * @public
         * @param {Object} cell - 单元
         * @param {Object} props - 属性
         */
        initViewCell: function (cell, props) {
            $e.initActiveCell(cell, props, this.ViewCell);
        },

        /**
         * 释放视图
         * @public
         * @param {Object} view - 视图
         * @param {boolean} [withAdo] - 是否释放ADO
         */
        releaseView: function (view, withAdo) {
            if (view.onRelease) {
                view.onRelease(withAdo);
            }
            $e.removeView(view.getName(), view.getActiveModuleName(), view);
            if (view.eventCell) {
                view.eventCell.release();
                view.eventCell = null;
            }
            if (view.dataListenHandle) {
                var ado = view.getADO();
                if (ado) {
                    ado.removeListen(view.dataListenHandle);
                    if (withAdo) {
                        ado.release();
                    }
                }
            }

            if (view.shell) {
                view.shell.$owner = null;
                if (view.shell.parentNode) {
                    view.shell.parentNode.removeChild(view.shell);
                }
                view.shell = null;
            }
        },

        /**
         * 添加字段插件
         * @public
         * @param {string} type - 类型
         * @param {Object} plugin - 插件
         */
        addFieldPlugin: function (type, plugin) {
            this.inputPlugin[type] = plugin;
        },

        /**
         * 创建字段
         * @public
         * @param {HTMLElement} element - 元素
         * @param {Object} props - 属性
         * @param {Object} aModule - 活动模块
         * @returns {Object} 字段对象
         */
        createField: function (element, props, aModule) {
            var plugin = this.inputPlugin[props.type];
            if (plugin) {
                var field = plugin.create(element, props);
                element.$owner = field;
                $e.initActiveCell(field, props, aModule);
                var subClass = props.extend;
                if (subClass) {
                    var fieldSubClass = $e.fn.createObject(subClass);
                    $e.fn.extend(fieldSubClass, field, true);
                    delete props.extend;
                }
                if (typeof field.initAction === 'function') {
                    field.initAction();
                } else {
                    this.initAction(field);
                }
                return field;
            } else {
                throw new Error('Error to create field <' + props.name + '>, type ' + props.type + ' not exists !');
            }
        },

        /**
         * 显示窗口
         * @public
         * @param {Object|HTMLElement} win - 窗口
         * @param {boolean} isShow - 是否显示
         * @param {Object} [option] - 选项
         * @param {boolean} [option.modal] - 是否模态
         */
        showWindow: function (win, isShow, option) {
            if (!this.maskElement) {
                this.maskElement = $e.fn.create('div', 'yc-view-mask hide');
                document.body.appendChild(this.maskElement);
            }
            option = option || {};
            if (!!$e.fn.getBoolean(option.modal, true)) {
                if (this.dialogStack.length === 0 || this.dialogStack[this.dialogStack.length - 1] !== win) {
                    $e.fn.setStyle(this.maskElement, 'z-index:' + $e.fn.nextIndex(true));
                    $e.fn.showElement(this.maskElement, true);
                    this.dialogStack.push(win);
                }
            }
            $e.fn.setStyle(win.shell || win, 'z-index:' + $e.fn.nextIndex(true));
            $e.fn.showElement(win.shell || win, isShow, option);
        },

        /**
         * 关闭窗口（在dialog确认已经关闭后调用）
         * @public
         * @param {Object|HTMLElement} win - 窗口
         */
        closeWindow: function (win) {
            var j = this.dialogStack.lastIndexOf(win);
            $e.fn.showElement(win.shell || win, false);
            if (j >= 0) {
                var b = false;
                for (var i = j - 1; i >= 0; i--) {
                    if (this.dialogStack[i].isModal()) {
                        b = true;
                        var zi = (this.dialogStack[i].shell || this.dialogStack[i]).style.zIndex - 1;
                        this.maskElement.style.zIndex = zi;
                        break;
                    }
                }
                this.dialogStack.splice(j, 1);
                if (!b || (this.dialogStack.length === 0)) {
                    $e.fn.showElement(this.maskElement, false);
                } else {
                    for (var k = this.dialogStack.length - 1; k >= 0; k--) {
                        if (this.dialogStack[k].getShell().style.zIndex < this.maskElement.style.zIndex) {
                            this.maskElement.style.zIndex = this.dialogStack[k].getShell().style.zIndex - 1;
                        }
                        if (!$e.fn.isElementShow(this.dialogStack[k].getShell())) {
                            $e.fn.showElement(this.dialogStack[k].getShell(), true);
                        }
                        break;
                    }
                }
            }
        },

        /**
         * 使元素可拖动（元素中需要有拖动停留区，class名为view-drag）
         * @public
         * @param {HTMLElement} shell - 外壳元素
         * @returns {Drag} 拖动对象
         */
        forDragView: function (shell) {
            return new Drag(shell);
        },

        /**
         * 使元素可调整大小
         * @public
         * @param {HTMLElement} shell - 外壳元素
         * @param {number} [minWidth] - 最小宽度
         * @param {number} [minHeight] - 最小高度
         * @returns {Resize} 调整大小对象
         */
        forResizeView: function (shell, minWidth, minHeight) {
            return new Resize(shell, minWidth, minHeight);
        }
    };

    $e.fn.extend($e.ModuleCell, $e.ui.ViewCell);
    $e.fn.extend($e.ui.ViewCell, $e.ui.AbstractView);
    $e.fn.extend($e.ui.ViewCell, $e.ui.AbstractField);
    $e.fn.extend($e.ui.AbstractField, $e.ui.BasicField);
    $e.eventCell.add($e.events.regEvent(window, 'beforeunload ', $e, $e.release));

    /**
     * 调整大小类
     * @class
     * @param {HTMLElement} shell - 外壳元素
     * @param {number} [minw] - 最小宽度
     * @param {number} [minh] - 最小高度
     */
    function Resize(shell, minw, minh) {
        this.shellElement = shell;
        this.minWidth = minw ? minw : 0;
        this.minHeight = minh ? minh : 0;
        this.floatElements = [];
        this.resizeId = $e.fn.nextID();
        for (var i = 0, handlesLen = this.handles.length; i < handlesLen; i++) {
            this.floatElements[i] = $e.fn.create('span', this.classPrefix + this.handles[i]);
            this.floatElements[i].reId = this.resizeId;
            shell.appendChild(this.floatElements[i]);
        }
        this.eventCell = $e.events.createEventCell();
        this.eventCell.add($e.events.regEvent(document, 'mousedown', this, this.down));
        this.eventCell.add($e.events.regEvent(document, 'mousemove', this, this.move));
        this.eventCell.add($e.events.regEvent(document, 'mouseup', this, this.up));
        this.point = { x0: 0, y0: 0, x1: 0, y1: 0 };
        if (!this.virtualElement.parentNode) {
            var s0 = '', handles = this.handles;
            for (var j = 0, sLen = handles.length; j < sLen; j++) {
                s0 = s0 + "<span class='dialog-rs rs-" + handles[j] + "'></span>";
            }
            this.virtualElement.innerHTML = s0;
            document.body.appendChild(this.virtualElement);
        }
    }

    Resize.prototype = {
        handles: ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'],
        classPrefix: 'dialog-rs rs-',
        resizeElement: null,
        shellElement: null,
        virtualElement: $e.fn.create('div', 'dialog-mask hide'),
        isResizing: false,
        resizeType: '',
        point: null,

        /**
         * 鼠标按下事件
         * @public
         * @param {Event} e - 事件对象
         * @returns {boolean} 是否阻止默认行为
         */
        down: function (e) {
            var elem = e.target || e.srcElement;
            if (!!elem.reId && (elem.reId === this.resizeId)) {
                var body = $e.fn.getScrollBody();
                this.point.x0 = e.pageX || (e.clientX + body.scrollLeft);
                this.point.y0 = e.pageY || (e.clientY + body.scrollTop);
                this.isResizing = true;
                this.resizeType = elem.className.substring(this.classPrefix.length);
                this.syncWH();
                var virtualElement = this.virtualElement;
                $e.fn.showElement(virtualElement, true);
                this.point.mtop = virtualElement.offsetTop;
                this.point.mleft = virtualElement.offsetLeft;
                return false;
            }
            return true;
        },

        /**
         * 鼠标移动事件
         * @public
         * @param {Event} e - 事件对象
         * @returns {boolean} 是否阻止默认行为
         */
        move: function (e) {
            if (this.isResizing && this.resizeType) {
                var body = $e.fn.getScrollBody();
                this.point.x1 = e.pageX || (e.clientX + body.scrollLeft);
                this.point.y1 = e.pageY || (e.clientY + body.scrollTop);
                var moveX = this.point.x1 - this.point.x0;
                var moveY = this.point.y1 - this.point.y0;
                var virtualElement = this.virtualElement;
                var computedStyle = $e.fn.getStyle(virtualElement);
                var eWidth = $e.fn.getFloat(computedStyle.width);
                var eHeight = $e.fn.getFloat(computedStyle.height);
                var eX = virtualElement.offsetLeft;
                var eY = virtualElement.offsetTop;
                var resizeType = this.resizeType;
                if (resizeType.charAt(0) === 't') {
                    eHeight -= moveY;
                    eY += moveY;
                    if (resizeType.charAt(1) === 'l') {
                        eX += moveX;
                        eWidth -= moveX;
                    } else if (resizeType.charAt(1) === 'r') {
                        eWidth += moveX;
                    }
                } else if (resizeType.charAt(0) === 'b') {
                    eHeight += moveY;
                    if (resizeType.charAt(1) === 'l') {
                        eX += moveX;
                        eWidth -= moveX;
                    } else if (resizeType.charAt(1) === 'r') {
                        eWidth += moveX;
                    }
                } else if (resizeType === 'ml') {
                    eX += moveX;
                    eWidth -= moveX;
                } else if (resizeType === 'mr') {
                    eWidth += moveX;
                } else {
                    return false;
                }
                var shouldApply = false;
                if (eWidth >= this.minWidth) {
                    shouldApply = true;
                    this.point.x0 = this.point.x1;
                } else {
                    eX = virtualElement.offsetLeft + virtualElement.offsetWidth - this.minWidth;
                }
                if (eHeight >= this.minHeight) {
                    shouldApply = true;
                    this.point.y0 = this.point.y1;
                } else {
                    eY = virtualElement.offsetTop + virtualElement.offsetHeight - this.minHeight;
                }
                if (shouldApply) {
                    var styleStr = 'top:' + eY + 'px;left:' + eX + 'px;width:' + (eWidth > this.minWidth ? eWidth : this.minWidth) + 'px;height:' + (eHeight > this.minHeight ? eHeight : this.minHeight) + 'px';
                    $e.fn.setStyle(virtualElement, styleStr);
                }
                return false;
            }
            return true;
        },

        /**
         * 鼠标松开事件
         * @public
         * @param {Event} e - 事件对象
         * @returns {boolean} 是否阻止默认行为
         */
        up: function (e) {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeType = '';
                var virtualElement = this.virtualElement;
                var shellElement = this.shellElement;
                var computedStyle = $e.fn.getStyle(virtualElement);
                var styleStr = 'left:' + (shellElement.offsetLeft + virtualElement.offsetLeft - this.point.mleft) + 'px;top:' + (shellElement.offsetTop + virtualElement.offsetTop - this.point.mtop) + 'px;';
                $e.fn.setStyle(shellElement, styleStr);
                if (shellElement.$owner && shellElement.$owner.resize) {
                    shellElement.$owner.resize(computedStyle.width, computedStyle.height);
                } else {
                    styleStr = 'width:' + computedStyle.width + ';height:' + computedStyle.height + ';';
                    $e.fn.setStyle(shellElement, styleStr);
                }
                $e.fn.showElement(virtualElement, false);
                return false;
            }
            return true;
        },

        /**
         * 同步宽高
         * @public
         */
        syncWH: function () {
            var location = $e.fn.getLocation(this.shellElement);
            var styleStr = 'width:' + location.width + 'px;height:' + location.height + 'px;left:' + location.left + 'px;top:' + location.top + 'px;z-index:' + ($e.fn.getInt(location.zIndex, 100) + 1);
            $e.fn.setStyle(this.virtualElement, styleStr);
        },

        /**
         * 释放资源
         * @public
         */
        release: function () {
            this.eventCell.release();
            for (var i = 0, floatLen = this.floatElements.length; i < floatLen; i++) {
                this.shellElement.removeChild(this.floatElements[i]);
            }
            this.eventCell = this.resizeElement = this.shellElement = this.virtualElement = null;
        }
    };

    /**
     * 拖动类
     * @class
     * @param {HTMLElement} shell - 外壳元素
     */
    function Drag(shell) {
        this.shell = shell;
        this.dragId = $e.fn.nextID();
        var es = shell.querySelectorAll('.view-drag');
        for (var i = 0, esLen = es.length; i < esLen; i++) {
            es[i].dragId = this.dragId;
        }
        this.eventCell = $e.events.createEventCell();
        this.eventCell.add($e.events.regEvent(document, 'mousedown', this, this.down));
        this.eventCell.add($e.events.regEvent(document, 'mousemove', this, this.move));
        this.eventCell.add($e.events.regEvent(document, 'mouseup', this, this.up));
        this.point = { x: 0, y: 0 };
    }

    Drag.prototype = {
        shell: null,
        dragging: false,
        dragId: 0,
        point: null,

        /**
         * 鼠标按下事件
         * @public
         * @param {Event} e - 事件对象
         */
        down: function (e) {
            var src = e.target || e.srcElement;
            if (this.dragId === src.dragId) {
                this.dragging = true;
                var body = $e.fn.getScrollBody();
                this.point.x = e.pageX || (e.clientX + $e.fn.getInt(body.scrollLeft, 0));
                this.point.y = e.pageY || (e.clientY + $e.fn.getInt(body.scrollTop, 0));
            }
        },

        /**
         * 鼠标移动事件
         * @public
         * @param {Event} e - 事件对象
         * @returns {boolean} 是否阻止默认行为
         */
        move: function (e) {
            if (this.dragging) {
                var body = $e.fn.getScrollBody();
                var mouseX = e.pageX || (e.clientX + $e.fn.getInt(body.scrollLeft, 0));
                var mouseY = e.pageY || (e.clientY + $e.fn.getInt(body.scrollTop, 0));
                var moveX = mouseX - this.point.x;
                var moveY = mouseY - this.point.y;

                this.point.x = mouseX;
                this.point.y = mouseY;
                var shell = this.shell;
                var eX = shell.offsetLeft + moveX;
                var eY = shell.offsetTop + moveY;
                $e.fn.setStyle(shell, 'left:' + eX + 'px;top:' + eY + 'px');
                $e.fn.syncMovingMenu();
                return false;
            }
            return true;
        },

        /**
         * 鼠标松开事件
         * @public
         * @param {Event} e - 事件对象
         */
        up: function (e) {
            this.dragging = false;
        },

        /**
         * 释放资源
         * @public
         */
        release: function () {
            this.eventCell.release();
            this.eventCell = this.shell = null;
        }
    };
}($e);

+function ($e) {
    'use strict';

    /**
     * 消息对话框类
     * @class
     * @param {number} version - 版本号
     */
    function Message(version) {
        var shell = $e.fn.create('div', 'yc-view yc-view-dialog yc-view-message hide');
        this.header = $e.fn.create('div', 'yc-view-dialog-header');
        this.header.innerHTML = '<div class="yc-view-dialog-title view-drag"><span class="view-drag" view-band="title"></span><i class="fa fa-close yc-view-dialog-close"></i></div>';
        var body = $e.fn.create('div', 'yc-view-dialog-body');
        body.innerHTML = '<div class="yc-view-message-content"><img class="yc-view-message-icon"><span class="yc-view-message-text"></span></div>';
        this.footer = $e.fn.create('div', 'yc-view-dialog-footer');
        this.footer.innerHTML = '<button class="yc-btn btn-info" data-name="yes"><button class="yc-btn btn-info" data-name="no"><button class="yc-btn btn-info" data-name="cancel">';
        shell.appendChild(this.header);
        shell.appendChild(body);
        shell.appendChild(this.footer);
        this.shell = shell;
        this.eventCell = $e.events.createEventCell();
        this.version = version;
    }

    Message.prototype = {
        shell: null,
        header: null,
        inited: false,
        context: null,
        footer: null,
        label: {
            yes: '是',
            no: '否',
            cancel: '取消',
            ok: '确认'
        },
        icons: {
            question: 'images/msg/question.gif',
            info: 'images/msg/info.gif',
            error: 'images/msg/error.gif',
            warn: 'images/msg/warning.gif'
        },
        version: 0,
        dragInstance: null,
        eventCell: null,
        buttonElements: null,

        /**
         * 显示消息对话框
         * @public
         * @param {string} msg - 消息文本
         * @param {Object} options - 配置选项
         * @param {string} [options.title] - 标题
         * @param {string} [options.ico] - 图标类型
         * @param {Object} [options.context] - 上下文
         * @param {Object|Array} [options.buttons] - 按钮配置
         * @param {boolean} [options.close] - 是否显示关闭按钮
         * @param {Function} [options.init] - 初始化回调
         * @param {boolean} [options.modal] - 是否模态
         * @param {string} [options.side] - 显示位置
         * @param {Object} [options.ref] - 参考元素
         * @param {boolean} [options.move] - 是否可移动
         */
        show: function (msg, options) {
            this.options = options = (options || {});
            var self = this;
            if (!this.inited) {
                document.body.appendChild(this.shell);
            }
            setTimeout(function () {
                var buttonMap, button;
                var msgShell = self.shell;
                var closeBtn = self.header.querySelector('.yc-view-dialog-close');
                if (!self.inited) {
                    self.dragInstance = $e.ui.forDragView(msgShell);
                    var buttonNodes = self.footer.querySelectorAll('[data-name]');
                    buttonMap = {};
                    for (var i = 0, btnLen = buttonNodes.length; i < btnLen; i++) {
                        self.eventCell.add($e.events.regEvent(buttonNodes[i], 'click', self, self.done));
                        buttonMap[buttonNodes[i].getAttribute('data-name')] = buttonNodes[i];
                    }
                    self.buttonElements = buttonMap;
                    self.eventCell.add($e.events.regEvent(closeBtn, 'click', self, self.close));
                    self.inited = true;
                } else {
                    buttonMap = self.buttonElements;
                }
                var showBtns = options.buttons || { yes: '确认' };
                self.hideButton();
                if (showBtns instanceof Array) {
                    for (var j = 0, showLen = showBtns.length; j < showLen; j++) {
                        button = buttonMap[showBtns[j]];
                        if (button) {
                            $e.fn.setLabelText(button, self.label[showBtns[j]]);
                            $e.fn.showElement(button, true);
                        }
                    }
                } else {
                    for (var key in showBtns) {
                        if (showBtns.hasOwnProperty(key)) {
                            button = buttonMap[key];
                            if (button) {
                                $e.fn.setLabelText(button, showBtns[key]);
                                $e.fn.showElement(button, true);
                            }
                        }
                    }
                }
                var ico = options.ico;
                var img = msgShell.querySelector('.yc-view-message-icon');
                if (img) {
                    $e.fn.showElement(img, ico !== 'none');
                    if (ico !== 'none') {
                        img.src = self.icons[ico] || self.icons.info;
                    }
                }
                var title = (options.title) || '信息提示';
                self.header.querySelector('[view-band="title"]').textContent = title;
                if (msg) {
                    var emsg = msgShell.querySelector('.yc-view-message-text');
                    emsg.textContent = msg;
                }
                $e.fn.showElement(closeBtn, options.close !== false);
                if (options.init && (typeof options.init === 'function')) {
                    options.init.apply(self, [options]);
                }
                var setting = {
                    modal: (options.modal === undefined) ? true : options.modal,
                    side: options.side || 'center',
                    ref: options.ref,
                    move: options.move
                };
                $e.ui.showWindow(self, true, setting);
            }, 0);
        },

        /**
         * 隐藏按钮
         * @public
         */
        hideButton: function () {
            for (var key in this.buttonElements) {
                if (this.buttonElements.hasOwnProperty(key)) {
                    $e.fn.showElement(this.buttonElements[key], false);
                }
            }
        },

        /**
         * 是否模态
         * @public
         * @returns {boolean} 是否模态
         */
        isModal: function () {
            return true;
        },

        /**
         * 获取外壳元素
         * @public
         * @returns {HTMLElement} 外壳元素
         */
        getShell: function () {
            return this.shell;
        },

        /**
         * 无操作关闭
         * @public
         */
        nodo: function () {
            this.close();
        },

        /**
         * 关闭对话框
         * @public
         * @param {boolean} [cache] - 是否缓存
         */
        close: function (cache) {
            this.options = null;
            $e.ui.closeWindow(this);
            if (this.version > 0 && !cache) {
                this.release();
            }
        },

        /**
         * 查找按钮
         * @public
         * @param {Event} event - 事件对象
         * @returns {HTMLElement|null} 按钮元素
         */
        findButton: function (event) {
            return $e.fn.closest(event, { key: 'data-name', end: this.footer || this.shell }, true);
        },

        /**
         * 完成回调
         * @public
         * @param {Event} event - 事件对象
         */
        done: function (event) {
            $e.events.cancelEvent(event);
            var e1 = this.findButton(event);
            var options = this.options;
            if (e1 && options.method) {
                var name = e1.getAttribute('data-name');
                this.close();
                options.method.apply(options.context, [event, name, options.params]);
            } else {
                this.close();
            }
        },

        /**
         * 释放资源
         * @public
         */
        release: function () {
            if (this.dragInstance) {
                this.dragInstance.release();
            }
            if (this.eventCell) {
                this.eventCell.release();
            }
            document.body.removeChild(this.shell);
        }
    };

    var msg = new Message(0);
    $e.ui.message = function (isnew) {
        return isnew ? new Message(1) : msg;
    };
}($e);

+function ($e) {
    'use strict';

    /**
     * 气泡提示类
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.side] - 箭头方向
     * @param {string} [options.title] - 标题
     * @param {string} [options.text] - 文本内容
     */
    function Popover(options) {
        this.arrow = $e.fn.extend(this.defaultArrow, { side: options.side || 'down' });
        this.shell = $e.fn.create('div', 'popover popover-' + this.arrow.side + ' hide');
        if (options.title) {
            this.title = $e.fn.create('div', 'popover-title');
            this.shell.appendChild(this.title);
            this.setTitle(options.title);
        }
        this.body = $e.fn.create('span', 'popover-text');
        this.shell.appendChild(this.body);
        this.setMessage(options.text);
        document.body.appendChild(this.shell);
    }

    Popover.prototype = {
        shell: null,
        body: null,
        defaultArrow: { width: 10, height: 8 },
        arrow: null,

        /**
         * 获取外壳元素
         * @public
         * @returns {HTMLElement} 外壳元素
         */
        getShell: function () {
            return this.shell;
        },

        /**
         * 设置标题
         * @public
         * @param {string} title - 标题
         * @returns {Popover} 当前实例
         */
        setTitle: function (title) {
            if (this.title) {
                $e.fn.setLabelText(this.body, title);
            }
            return this;
        },

        /**
         * 设置消息
         * @public
         * @param {string} txt - 文本
         * @returns {Popover} 当前实例
         */
        setMessage: function (txt) {
            $e.fn.setLabelText(this.body, txt);
            return this;
        },

        /**
         * 显示气泡
         * @public
         * @param {Object} options - 配置选项
         * @param {string} [options.text] - 文本
         * @param {number} [options.x] - X坐标
         * @param {number} [options.y] - Y坐标
         */
        show: function (options) {
            if (options.text) {
                this.setMessage(options.text);
            }
            if (!$e.fn.isElementShow(this.shell)) {
                $e.fn.setStyle(this.shell, 'z-index:' + $e.fn.nextIndex());
                $e.fn.showElement(this.shell, true);
            }
            var self = this;
            setTimeout(function () {
                var x = options.x || 0;
                var y = options.y || 0;
                var popoverShell = self.shell;
                var w = popoverShell.offsetWidth;
                var h = popoverShell.offsetHeight;
                var arrow = self.arrow;
                switch (arrow.side) {
                    case 'left':
                        x += arrow.height;
                        y -= (h * 0.2 + arrow.width / 2);
                        break;
                    case 'right':
                        x -= (w + arrow.height);
                        y -= (h * 0.2 + arrow.width / 2);
                        break;
                    case 'top':
                        x -= (w * 0.2 + arrow.width / 2);
                        y += (h + arrow.height);
                        break;
                    default:
                        x -= (w * 0.2 + arrow.width / 2);
                        y -= (h + arrow.height);
                        break;
                }
                $e.fn.setStyle(popoverShell, 'left:' + parseInt(x, 10) + 'px;top:' + parseInt(y, 10) + 'px;');
            }, 10);
        },

        /**
         * 隐藏气泡
         * @public
         */
        hide: function () {
            $e.fn.showElement(this.shell, false);
        }
    };

    $e.ui.createPopover = function (options) {
        return new Popover(options);
    };
}($e);

+function ($e) {
    'use strict';

    /**
     * 弹出菜单类
     * @class
     * @param {Object} options - 配置选项
     * @param {Object} [options.done] - 完成事件配置
     * @param {Object} [options.close] - 关闭事件配置
     */
    function PopMenu(options) {
        this.init(options);
        return this;
    }

    PopMenu.prototype = {
        shell: null,
        props: null,

        /**
         * 初始化
         * @public
         * @param {Object} options - 配置选项
         */
        init: function (options) {
            this.props = options || {};
            this.shell = $e.fn.create('DIV', 'popmenu hide');
            this.eventCell = $e.events.createEventCell();
            var obj = options.done;
            if (obj) {
                this.eventCell.add($e.events.regEvent(this.shell, obj.event, this, this.callBack));
            }
            obj = options.close;
            if (obj) {
                this.eventCell.add($e.events.regEvent(this.shell, obj.event, this, this.hide));
            }
            document.body.appendChild(this.shell);
        },

        /**
         * 启动监听
         * @public
         * @param {HTMLElement} ref - 参考元素
         * @param {string} eventName - 事件名称
         */
        start: function (ref, eventName) {
            this.eventCell.add($e.events.regEvent(ref, eventName, this, this.show));
        },

        /**
         * 回调方法
         * @public
         * @param {Event} event - 事件对象
         */
        callBack: function (event) {
            var obj = this.props.done;
            if (obj && obj.method) {
                obj.method.apply(obj.context || $e, [event, this]);
            }
        },

        /**
         * 获取外壳元素
         * @public
         * @returns {HTMLElement} 外壳元素
         */
        getShell: function () {
            return this.shell;
        },

        /**
         * 显示菜单
         * @public
         * @param {Event} event - 事件对象
         * @param {Object} [options] - 配置选项
         * @param {HTMLElement} [options.ref] - 参考元素
         * @param {string} [options.side] - 显示方向
         */
        show: function (event, options) {
            if (!options) {
                options = { ref: event.srcElement || event.target };
            }
            $e.fn.extend(options, this.props, true);
            this.props.level = this.props.level || 0;
            var self = this;
            setTimeout(function () {
                $e.fn.showMenu({
                    shell: self.shell,
                    level: self.props.level,
                    ref: self.props.ref,
                    side: self.props.side || 'down',
                    deviating: true
                });
            }, 0);
        },

        /**
         * 隐藏菜单（触发 close 回调后关闭）
         * @public
         */
        hide: function () {
            var obj = this.props.close;
            if (obj && obj.method) {
                obj.method.apply(obj.context || $e, [event, this]);
            }
            this.doClose();
        },

        /**
         * 关闭菜单（仅关闭，不触发 close 回调）
         * @public
         */
        close: function () {
            this.doClose();
        },

        /**
         * 执行关闭菜单逻辑
         * @private
         */
        doClose: function () {
            if (!$e.fn.hasClass(this.shell, 'hide')) {
                $e.fn.hideMenu(this.props.level || 0);
            }
        }
    };

    $e.ui.createPopMenu = function (options) {
        return new PopMenu(options);
    };
}($e);

+function ($e) {
    'use strict';

    /**
     * 通知构造类
     * @class
     * @param {Object} options - 配置选项
     */
    function NotificationConstructor(options) {
        this.offset = options.offset;
        this.verticalOffset = options.verticalOffset;
        this.role = options.role;
        this.type = options.type;
        this.position = options.position;
        this.delay = options.delay;
        this.onClose = options.onClose;
        this.message = options.message;
        this.$el = this.createEle();
        document.body.appendChild(this.$el);
        var closedValue = false;
        Object.defineProperty(this, 'closed', {
            get: function () {
                return closedValue;
            },
            set: function (newValue) {
                this.$el.addEventListener('transitionend', this.destroyEle);
                closedValue = newValue;
            }
        });
        this.startTimer();
    }

    NotificationConstructor.prototype = {
        /**
         * 创建元素
         * @public
         * @returns {HTMLElement} 元素
         */
        createEle: function () {
            var shell = null;
            switch (this.role) {
                case 'notification':
                    shell = this.createNotificationEle();
                    break;
                case 'message':
                    shell = this.createMessageEle();
                    break;
                default:
                    shell = this.createNotificationEle();
                    break;
            }
            return shell;
        },

        /**
         * 创建通知元素
         * @public
         * @returns {HTMLElement} 元素
         */
        createNotificationEle: function () {
            var shell = $e.fn.create('div', 'yc-notification');
            var body = $e.fn.create('div', 'yc-notification-body');
            body.innerHTML = '<h2 class="yc-notification-title">提示</h2>';
            var closeBtn = $e.fn.create('I', 'fa fa-close yc-notification-close');
            var self = this;
            closeBtn.addEventListener('click', self.close.bind(self));
            body.appendChild(closeBtn);
            var content = $e.fn.create('div', 'yc-notification-content');
            body.appendChild(content);
            shell.appendChild(body);
            $e.fn.setStyle(shell, 'right:20px;top:16px;');
            content.innerText = this.message;
            return shell;
        },

        /**
         * 创建消息元素
         * @public
         * @returns {HTMLElement} 元素
         */
        createMessageEle: function () {
            var shell = $e.fn.create('div', 'yc-notification-msg');
            var icon = $e.fn.create('I', 'fa fa-info-circle');
            var content = $e.fn.create('div', 'yc-notification-msg-content');
            content.innerText = this.message;
            $e.fn.setStyle(shell, 'top:16px;');
            switch (this.type) {
                case 'worn':
                    icon = $e.fn.create('I', 'fa fa-info-circle');
                    $e.fn.addClass(shell, 'yc-notification--warning');
                    break;
                case 'success':
                    icon = $e.fn.create('I', 'fa fa-check');
                    $e.fn.addClass(shell, 'yc-notification--success');
                    break;
                default:
                    break;
            }
            shell.appendChild(icon);
            shell.appendChild(content);
            return shell;
        },

        /**
         * 销毁元素
         * @public
         */
        destroyEle: function () {
            this.removeEventListener('transitionend', NotificationConstructor.prototype.destroyEle);
            this.parentNode.removeChild(this);
        },

        /**
         * 设置销毁监听
         * @public
         */
        setDestroyListener: function () {
            this.$el.addEventListener('transitionend', this.destroyEle);
        },

        /**
         * 设置高度
         * @public
         * @param {number} height - 高度
         */
        setHeight: function (height) {
            switch (this.position) {
                case 'rightTop':
                    $e.fn.setStyle(this.$el, 'right:20px;top:' + height + 'px;');
                    break;
                case 'center':
                    $e.fn.setStyle(this.$el, 'top:' + height + 'px;left: 50%;transform: translateX(-50%);');
                    break;
                default:
                    $e.fn.setStyle(this.$el, 'right:20px;top:' + height + 'px;');
                    break;
            }
        },

        /**
         * 关闭通知
         * @public
         */
        close: function () {
            this.closed = true;
            if (typeof this.onClose === 'function') {
                this.onClose();
            }
        },

        /**
         * 启动定时器
         * @public
         */
        startTimer: function () {
            var self = this;
            if (this.delay > 0) {
                this.timer = setTimeout(function () {
                    if (!self.closed) {
                        self.close();
                    }
                }, this.delay);
            }
        }
    };

    var instance;
    var instances = [];
    var seed = 1;

    /**
     * 通知方法
     * @private
     * @param {string} message - 消息
     * @param {Object} options - 选项
     */
    var notify = function (message, options) {
        options = options || {};
        var mixIn = {
            role: 'message',
            type: 'info',
            position: 'center',
            offset: 16,
            delay: 3000,
            message: message
        };

        for (var item in mixIn) {
            if (mixIn.hasOwnProperty(item) && !options.hasOwnProperty(item)) {
                var value = mixIn[item];
                Object.defineProperty(options, item, { value: value });
            }
        }

        var position = options.position;
        var id = 'notification' + (seed++);
        options.onClose = function () {
            notify.close(id);
        };
        instance = new NotificationConstructor(options);
        instance.id = id;

        var verticalOffset = options.offset;
        instances.filter(function (item) {
            return item.position === position;
        }).forEach(function (item) {
            verticalOffset += item.$el.offsetHeight + options.offset;
            instance.setHeight(verticalOffset);
        });

        instances.push(instance);
    };

    /**
     * 关闭通知
     * @private
     * @param {string} id - 通知ID
     */
    notify.close = function (id) {
        var index = -1;
        var len = instances.length;
        var targetInstance = instances.filter(function (item, i) {
            if (item.id === id) {
                index = i;
                return true;
            }
            return false;
        })[0];

        if (!targetInstance) {
            return;
        }

        var position = targetInstance.position;
        var removeHeight = targetInstance.$el.offsetHeight;

        for (var i = index; i < len; i++) {
            if (instances[i].position === position) {
                var elTopNow = parseInt(instances[i].$el.style.top, 10) - removeHeight - targetInstance.offset;
                $e.fn.setStyle(instances[i].$el, 'top:' + elTopNow + 'px;');
            }
        }

        instances.splice(index, 1);
    };

    /**
     * 显示通知
     * @public
     * @param {string} message - 消息
     * @param {Object} [options] - 选项
     */
    $e.ui.notification = function (message, options) {
        notify(message, options);
    };

    /**
     * 显示通知（别名）
     * @public
     * @param {string} message - 消息
     * @param {Object} [options] - 选项
     */
    $e.ui.notify = function (message, options) {
        notify(message, options);
    };
}($e);

+function ($e) {
    'use strict';

    /**
     * 数据切换类
     * @class
     */
    function DataSwitch() {
    }

    DataSwitch.prototype = {
        switching: {},

        /**
         * 注册切换
         * @public
         * @param {string} name - 名称
         * @param {Object} options - 选项（包括method, data, context，默认context为$e）
         */
        regist: function (name, options) {
            this.switching[name] = options;
        },

        /**
         * 移除切换
         * @public
         * @param {string} name - 名称
         * @returns {Object} 移除的选项
         */
        remove: function (name) {
            var options = this.switching[name];
            delete this.switching[name];
            return options;
        },

        /**
         * 清空所有切换
         * @public
         */
        clear: function () {
            for (var key in this.switching) {
                if (this.switching.hasOwnProperty(key)) {
                    delete this.switching[key];
                }
            }
        },

        /**
         * 获取切换数据（已废弃，使用getSwitch）
         * @deprecated
         * @public
         * @param {string} name - 名称
         * @returns {*} 数据
         */
        switchCall: function (name) {
            var op = this.getSwitch(name);
            return op ? op.data : null;
        },

        /**
         * 获取注册的对象
         * @public
         * @param {string} name - 名称
         * @returns {Object} 注册的对象
         */
        getSwitch: function (name) {
            return this.switching[name];
        },

        /**
         * 切换回调（已废弃，使用callBack）
         * @deprecated
         * @public
         * @param {string} name - 名称
         * @param {*} data - 数据
         * @param {boolean} [cache] - 是否缓存
         */
        switchBack: function (name, data, cache) {
            this.callBack(name, data);
        },

        /**
         * 回调方法
         * @public
         * @param {string} name - 名称
         * @param {*} data - 数据
         * @param {boolean} [cache] - 是否缓存
         */
        callBack: function (name, data, cache) {
            var op = this.switching[name];
            if (op && op.method) {
                op.method.apply(op.context || $e, [data]);
            }
        }
    };

    $e.ui.dataSwitch = new DataSwitch();
}($e);