/**
 * @file 标签页组件
 * @description 支持标签切换、子视图管理、动态添加/删除标签等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 标签页组件构造函数
     * @class TabbedView
     * @param {Object} options - 配置选项
     * @param {Array} [options.buttons=[]] - 标签按钮配置数组
     */
    function TabbedView(options) {
        this.props = options || {};
        this.buttons = [];
    }

    TabbedView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_tabbed',
        header: null,
        body: null,
        buttons: null,

        init: function () {
            this.header = this.shell.querySelector("[view-band='header']");
            this.body = this.shell.querySelector("[view-band='body']");
            if (this.body) {
                this.body.rsh = "100%";
            }
            var buttons = this.props.buttons;
            if (buttons instanceof Array) {
                for (var i = 0, len = buttons.length; i < len; i++) {
                    this.addTab(buttons[i]);
                }
            }

            this.inited();
        },

        onChildChanged: function (view) {
            $e.ui.resizeChildren(this.getShell());
        },

        bindAction: function (name, eventname, element) {
            return this.bindListen($e.events.regEvent(element, eventname || 'click', this, this.doAction, name));
        },

        doAction: function (event, name) {
            this.setSelectedTab(name, event);
        },

        /**
         * 添加标签页
         * @param {Object} options - 标签配置 {name, element, index, event, method}
         * @param {boolean} [selected] - 是否选中
         */
        addTab: function (options, selected) {
            var tab = this.getTab(options.name);
            if (tab == null) {
                var button = new TabButton(this, options);
                this.buttons.push(button);
                this.header.appendChild(button.getShell());
            }
            if (selected) {
                this.setSelectedTab(options.name);
            }
        },

        getTab: function (name) {
            var i = this.buttons.search("name", name);
            return i >= 0 ? this.buttons[i] : null;
        },

        removeTab: function (name) {
            var n = name;
            if (isNaN(n)) {
                n = this.buttons.search("name", name);
            }
            if (n >= 0) {
                var btn = this.buttons[n];
                this.header.removeChild(btn.getShell());
                this.buttons.splice(n, 1);
                if (btn.isSelected()) {
                    btn.onUnselected();
                    this.setChildView(null);
                    if (n >= this.buttons.length) {
                        n = this.buttons.length - 1;
                    }
                    this.setSelectedTab(n);
                }
                btn.onRemoved();
                return true;
            }
            return false;
        },

        /**
         * 设置选中标签页
         * @param {string|number} name - 标签名称或序号
         * @param {Event} [event] - 事件对象
         */
        setSelectedTab: function (name, event) {
            var n = this.getSelectedTabIndex();
            var i = isNaN(name) ? this.buttons.search("name", name) : name;
            var len = this.buttons.length;
            if (i >= 0 && i < len) {
                if (n >= 0 && n !== i) {
                    this.buttons[n].setSelected(event, false);
                }
                this.buttons[i].setSelected(event, true);
            }
        },

        getSelectedTabIndex: function () {
            for (var i = 0, len = this.buttons.length; i < len; i++) {
                if (this.buttons[i].isSelected()) {
                    return i;
                }
            }
            return -1;
        },

        getSelectedTabName: function () {
            var i = this.getSelectedTabIndex();
            return (i >= 0) ? this.buttons[i].getName() : null;
        },

        setChildView: function (view) {
            $e.fn.setChild(this.body, view ? (view['getShell'] ? view.getShell() : view) : null);
            if (view !== null) {
                this.onChildChanged(view['$owner'] ? view['$owner'] : view);
                var self = this;
                setTimeout(function () {
                    self.resize();
                }, 0);
            }
        },

        createButtonShell: function (options) {
            var shell = $e.fn.create("span", options["className"] || "yc-view-tabs-item");
            shell.setAttribute("data-name", options.name);
            options._mn = this._mn;
            options._amn = this._amn;
            return shell;
        }
    };

    function TabButton(ownerview, options) {
        this.ownerView = ownerview;
        this.name = options.name;
        if (options['shell']) {
            this.shell = options['shell'];
        } else {
            this.shell = this.ownerView.createButtonShell(options);
        }
        if (options['html']) {
            this.shell.innerHTML = options.html;
        }
        this.props = options;
        $e.ui.initViewCell(this, options);
        var obj = $e.fn.createObject(this.props['extend']);
        $e.fn.extend(obj, this, true);
        this.shell.$owner = this;
        var self = this;
        setTimeout(function () {
            self.init();
        }, 0);
    }

    TabButton.prototype = {
        VERSION: '3.0.1',
        props: null,
        ownerView: null,
        _owner_type: 'tab-button',
        _class_on: "tabs-item-selected",
        _handle: null,
        _tmp: null,

        init: function () {
            var shell = this.shell.querySelector("[data-event]") || this.shell;
            var name = shell ? shell.getAttribute("data-event") : "";
            this._handle = this.ownerView.bindAction(this.getName(), name, this.getShell());
            this.inited();
        },

        getType: function () {
            return this._owner_type;
        },

        setSelected: function (event, isselected) {
            isselected = (isselected === undefined) ? !!event : isselected;
            if (isselected) {
                this.onSelected(event);
            } else {
                this.onUnselected(event);
            }
        },

        onSelected: function (event) {
            $e.fn.addClass(this.getShell(), this._class_on);
            this.done(event);
        },

        onUnselected: function (event) {
            $e.fn.removeClass(this.getShell(), this._class_on);
        },

        onRemoved: function () {
            this.ownerView.unBindListen(this._handle);
        },

        isSelected: function () {
            return $e.fn.hasClass(this.getShell(), this._class_on);
        },

        done: function (event) {
        },

        getOwnerView: function () {
            return this.ownerView;
        },

        release: function () {
            this.ownerView = this.props = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new TabbedView(options);
        }
    };
    $e.ui.addViewPlugin("view_tabbed", plugin);
}($e);