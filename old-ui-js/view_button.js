/**
 * @file 按钮视图组件
 * @description 支持按钮组管理、分组显示、焦点状态、启用/禁用等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var buttonView = $e.ui.createView('view_button', {
 *     buttons: [
 *         { name: 'save', label: '保存', group: 'edit' },
 *         { name: 'cancel', label: '取消', group: 'edit' }
 *     ]
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 按钮视图组件构造函数
     * @class ButtonView
     * @param {Object} options - 配置选项
     * @param {Array} [options.buttons=[]] - 按钮配置数组
     * @param {string} [options.group=''] - 默认分组名称
     */
    function ButtonView(options) {
        this.props = options || {};
        this.buttons = [];
        this.tempButtons = [];

        var buttonList = this.props.buttons;
        if (buttonList instanceof Array) {
            for (var i = 0, len = buttonList.length; i < len; i++) {
                $e.forActiveCell(options, buttonList[i]);
                this.tempButtons.push(this.createButton(buttonList[i]));
            }
        }
    }

    ButtonView.prototype = {
        VERSION: '3.0.1',
        props: null,
        buttons: null,
        type: 'view_button',
        body: null,
        group: '',

        // 内部状态
        tempButtons: null,
        focusedButton: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            for (var i = 0, len = this.tempButtons.length; i < len; i++) {
                this.tempButtons[i].init();
                this.addButton(this.tempButtons[i], -1);
            }
            delete this.tempButtons;
            this.inited();
        },

        /**
         * 添加按钮到视图
         * @public
         * @param {Button} button - 按钮实例
         * @param {number} [index=-1] - 插入位置，-1表示末尾
         * @returns {void}
         */
        addButton: function (button, index) {
            if (arguments.length > 1 && index >= 0 && index < this.buttons.length) {
                var shell = this.buttons[index].getShell();
                var body = this.getBody();
                if (shell.parentNode === body && button.getShell() !== shell) {
                    body.insertBefore(button.getShell(), shell);
                    this.buttons.splice(index, 0, button);
                    return;
                }
            }
            this.buttons.push(button);
            this.getBody().appendChild(button.getShell());
        },

        /**
         * 根据名称获取按钮
         * @public
         * @param {string} name - 按钮名称
         * @returns {Button|undefined} 按钮实例
         */
        getButton: function (name) {
            var index = this.buttons.search('name', name);
            if (index >= 0) {
                return this.buttons[index];
            }
        },

        /**
         * 移除指定名称的按钮
         * @public
         * @param {string} name - 按钮名称
         * @param {boolean} [release=false] - 是否释放按钮资源
         * @returns {Button|null} 被移除的按钮实例
         */
        removeButton: function (name, release) {
            var index = this.buttons.search('name', name);
            if (index >= 0) {
                var button = this.buttons[index];
                if (button) {
                    this.getShell().removeChild(button.getShell());
                    this.buttons.splice(index, 1);
                    if (release) {
                        button.release();
                    }
                    return button;
                }
            }
            return null;
        },

        /**
         * 创建按钮实例
         * @public
         * @param {Object} options - 按钮配置
         * @returns {Button} 按钮实例
         */
        createButton: function (options) {
            return new Button(this, options);
        },

        /**
         * 设置焦点按钮
         * @public
         * @param {Button} button - 目标按钮
         * @param {string} [focusClass='button-selected'] - 焦点样式类名
         * @returns {void}
         */
        focusButton: function (button, focusClass) {
            var className = focusClass || 'button-selected';
            $e.fn.addClass(button.getShell(), className);
            if (this.focusedButton && this.focusedButton !== button) {
                $e.fn.removeClass(this.focusedButton.getShell(), className);
            }
            this.focusedButton = button;
        },

        /**
         * 获取当前分组
         * @public
         * @returns {string} 当前分组名称
         */
        getGroup: function () {
            return this.group;
        },

        /**
         * 设置分组，控制按钮显示
         * @public
         * @param {string} group - 分组名称
         * @returns {void}
         */
        setGroup: function (group) {
            group = group + '';
            if (this.group !== group) {
                var buttons = this.buttons;
                for (var i = 0, len = buttons.length; i < len; i++) {
                    buttons[i].show(buttons[i].hasGroup(group));
                }
            }
            this.group = group;
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            for (var i = 0, len = this.buttons.length; i < len; i++) {
                this.buttons[i].release();
            }
            this.buttons = null;
            this.focusedButton = null;
            this.body = null;
        },

        /**
         * 调整组件尺寸
         * @public
         * @param {Object} [options] - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {
        }
    };

    /**
     * 按钮构造函数
     * @class Button
     * @param {ButtonView} ownerView - 所属按钮视图
     * @param {Object} options - 按钮配置
     * @param {HTMLElement} [options.shell] - 按钮DOM元素
     * @param {string} [options.html] - 按钮HTML内容
     * @param {string} [options.group] - 按钮分组，多个分组用逗号分隔
     */
    function Button(ownerView, options) {
        this.ownerView = ownerView;
        this.props = options || {};

        if (this.props.shell) {
            this.shell = this.props.shell;
        } else if (this.props.html) {
            this.tempElement = $e.fn.create('div');
            this.tempElement.innerHTML = this.props.html;
        }
        if (this.props.group) {
            this.group = this.props.group.split(',');
        }
        $e.ui.initViewCell(this, options);
    }

    Button.prototype = {
        VERSION: '3.0.1',
        props: null,
        group: null,
        ownerView: null,
        type: 'button',

        // 内部状态
        enabled: true,
        tempElement: null,
        bindEventCells: null,

        /**
         * 初始化按钮
         * @public
         * @returns {void}
         */
        init: function () {
            if (this.tempElement) {
                this.shell = this.tempElement.querySelector("[data-name='" + this.getName() + "']");
                delete this.tempElement;
            }
            this.shell.$owner = this;

            // 扩展脚本覆盖
            if (this.props.extend) {
                var obj = $e.fn.createObject(this.props.extend);
                $e.fn.extend(obj, this, true);
            }
            if (this.shell) {
                this.bindListen($e.events.regEvent(this.shell, 'click', this, this.doAction));
            }
            this.inited();
        },

        /**
         * 判断是否属于指定分组
         * @public
         * @param {string} name - 分组名称
         * @returns {boolean} 是否属于该分组
         */
        hasGroup: function (name) {
            return this.group ? (this.group.indexOf(name) >= 0) : true;
        },

        /**
         * 获取按钮文本
         * @public
         * @returns {string} 按钮文本
         */
        getText: function () {
            return $e.fn.getLabelText(this.shell);
        },

        /**
         * 设置按钮文本
         * @public
         * @param {string} text - 按钮文本
         * @returns {void}
         */
        setText: function (text) {
            $e.fn.setLabelText(this.shell, text);
        },

        /**
         * 获取按钮类型
         * @public
         * @returns {string} 按钮类型
         */
        getType: function () {
            return 'button';
        },

        /**
         * 获取所属视图
         * @public
         * @returns {ButtonView} 所属按钮视图
         */
        getOwnerView: function () {
            return this.ownerView;
        },

        /**
         * 显示或隐藏按钮
         * @public
         * @param {boolean} isShow - 是否显示
         * @returns {void}
         */
        show: function (isShow) {
            if (isShow) {
                $e.fn.removeClass(this.getShell(), 'hide');
            } else {
                $e.fn.addClass(this.getShell(), 'hide');
            }
        },

        /**
         * 判断是否启用
         * @public
         * @returns {boolean} 是否启用
         */
        isEnable: function () {
            return this.enabled;
        },

        /**
         * 设置启用状态
         * @public
         * @param {boolean} enable - 是否启用
         * @returns {void}
         */
        setEnable: function (enable) {
            this.enabled = enable;
        },

        /**
         * 执行按钮动作
         * @public
         * @param {Event} event - 点击事件对象
         * @returns {void}
         */
        doAction: function (event) {
            if (this.isEnable()) {
                this.done(event);
            }
        },

        /**
         * 按钮点击处理（子类可覆盖）
         * @public
         * @param {Event} event - 点击事件对象
         * @returns {void}
         */
        done: function (event) {
            // 子类实现具体逻辑
        },

        /**
         * 释放按钮资源
         * @public
         * @returns {void}
         */
        release: function () {
            if (this.bindEventCells) {
                this.bindEventCells.release();
                this.bindEventCells = null;
            }
            this.shell = this.shell.$owner = null;
            this.ownerView = null;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建按钮视图组件实例
         * @param {Object} options - 组件配置
         * @returns {ButtonView} 按钮视图组件实例
         */
        create: function (options) {
            return new ButtonView(options);
        }
    };

    $e.ui.addViewPlugin('view_button', plugin);
}($e);
