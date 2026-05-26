/**
 * @file 菜单组件
 * @description 支持垂直/水平模式、折叠、子菜单、分组、分割线等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 菜单组件构造函数
     * @class MenuView
     * @param {Object} options - 配置选项
     * @param {string} [options.mode='vertical'] - 模式: vertical/horizontal
     * @param {boolean} [options.collapse=false] - 是否折叠
     * @param {boolean} [options.compact=false] - 是否紧凑模式
     * @param {Array} [options.items=[]] - 菜单项数组
     * @param {Function} [options.onSelect] - 选中回调
     * @param {Function} [options.onSubMenuToggle] - 子菜单切换回调
     */
    function MenuView(options) {
        this.props = options || {};
        this.items = [];
        this._listeners = [];
    }

    MenuView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_menu',
        body: null,
        shell: null,
        items: null,
        _listeners: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildMenu();
            this.inited();
        },
        buildMenu: function () {
            var options = this.props;
            var mode = options.mode || 'vertical';
            var collapse = options.collapse || false;
            var compact = options.compact || false;
            $e.fn.addClass(this.shell, 'yc-menu');
            $e.fn.addClass(this.shell, 'yc-menu--' + mode);
            if (collapse) {
                $e.fn.addClass(this.shell, 'yc-menu--collapse');
            }
            if (compact) {
                $e.fn.addClass(this.shell, 'yc-menu--compact');
            }
            if (options.items instanceof Array) {
                for (var i = 0; i < options.items.length; i++) {
                    this.addItem(options.items[i], this.getBody());
                }
            }
        },
        addItem: function (itemOptions, parent) {
            var item;
            if (itemOptions.type === 'submenu') {
                item = this.createSubMenu(itemOptions);
            } else if (itemOptions.type === 'group') {
                item = this.createGroup(itemOptions);
            } else if (itemOptions.type === 'divider') {
                item = this.createDivider();
            } else {
                item = this.createMenuItem(itemOptions);
            }
            parent.appendChild(item);
            this.items.push(item);
            return item;
        },
        createMenuItem: function (options) {
            var item = $e.fn.create('li');
            $e.fn.addClass(item, 'yc-menu-item');
            if (options.disabled) {
                $e.fn.addClass(item, 'is-disabled');
            }
            if (options.danger) {
                $e.fn.addClass(item, 'is-danger');
            }
            if (options.active) {
                $e.fn.addClass(item, 'is-active');
            }
            var icon = options.icon ? '<i class="yc-menu-item__icon">' + options.icon + '</i>' : '';
            item.innerHTML = icon + '<span>' + (options.title || options.label || '') + '</span>';
            if (!options.disabled) {
                var self = this;
                this.bindListen($e.events.regEvent(item, 'click', this, function (e) {
                    self.onItemClick(e, options, item);
                }));
            }
            return item;
        },
        createSubMenu: function (options) {
            var submenu = $e.fn.create('li');
            $e.fn.addClass(submenu, 'yc-sub-menu');
            if (options.disabled) {
                $e.fn.addClass(submenu, 'is-disabled');
            }
            var title = $e.fn.create('div');
            $e.fn.addClass(title, 'yc-sub-menu__title');
            var icon = options.icon ? '<i class="yc-sub-menu__icon">' + options.icon + '</i>' : '';
            title.innerHTML = icon + '<span>' + (options.title || '') + '</span><i class="yc-sub-menu__arrow">&#9654;</i>';
            submenu.appendChild(title);
            var content = $e.fn.create('ul');
            $e.fn.addClass(content, 'yc-sub-menu__content');
            if (options.children instanceof Array) {
                for (var i = 0; i < options.children.length; i++) {
                    this.addItem(options.children[i], content);
                }
            }
            submenu.appendChild(content);
            if (!options.disabled) {
                var self = this;
                this.bindListen($e.events.regEvent(title, 'click', this, function (e) {
                    self.onSubMenuToggle(e, submenu);
                }));
            }
            return submenu;
        },
        createGroup: function (options) {
            var group = $e.fn.create('li');
            $e.fn.addClass(group, 'yc-menu-item-group');
            var title = $e.fn.create('div');
            $e.fn.addClass(title, 'yc-menu-item-group__title');
            var icon = options.icon ? '<i class="yc-menu-item-group__icon">' + options.icon + '</i>' : '';
            title.innerHTML = icon + '<span>' + (options.title || '') + '</span>';
            group.appendChild(title);
            if (options.children instanceof Array) {
                for (var i = 0; i < options.children.length; i++) {
                    this.addItem(options.children[i], group);
                }
            }
            return group;
        },
        createDivider: function () {
            var divider = $e.fn.create('li');
            $e.fn.addClass(divider, 'yc-menu-divider');
            return divider;
        },
        onItemClick: function (e, options, item) {
            var items = this.shell.querySelectorAll('.yc-menu-item');
            for (var i = 0; i < items.length; i++) {
                $e.fn.removeClass(items[i], 'is-active');
            }
            $e.fn.addClass(item, 'is-active');
            if (this.props.onSelect) {
                this.props.onSelect(options, item);
            }
        },
        onSubMenuToggle: function (e, submenu) {
            if ($e.fn.hasClass(submenu, 'is-opened')) {
                $e.fn.removeClass(submenu, 'is-opened');
            } else {
                $e.fn.addClass(submenu, 'is-opened');
            }
            if (this.props.onSubMenuToggle) {
                this.props.onSubMenuToggle(submenu);
            }
        },
        setCollapse: function (collapse) {
            if (collapse) {
                $e.fn.addClass(this.shell, 'yc-menu--collapse');
            } else {
                $e.fn.removeClass(this.shell, 'yc-menu--collapse');
            }
        },
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this.items = null;
            this.body = null;
        },
        resize: function (options) {
        }
    };
    var plugin = {
        create: function (options) {
            return new MenuView(options);
        }
    };
    $e.ui.addViewPlugin("view_menu", plugin);
}($e);
