/**
 * @file 下拉菜单组件
 * @description 支持点击/悬浮触发、多种位置、分割按钮、菜单项管理等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 下拉菜单组件构造函数
     * @class DropdownView
     * @param {Object} options - 配置选项
     * @param {string} [options.trigger='click'] - 触发方式: click/hover
     * @param {string} [options.placement='bottom-left'] - 下拉位置
     * @param {string} [options.type='default'] - 类型
     * @param {string} [options.size='default'] - 尺寸
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {boolean} [options.split=false] - 是否为分割按钮
     * @param {string} [options.title=''] - 标题文本
     * @param {Array} [options.items=[]] - 菜单项数组
     * @param {Function} [options.onOpen] - 打开回调
     * @param {Function} [options.onClose] - 关闭回调
     * @param {Function} [options.onSelect] - 选中回调
     */
    function DropdownView(options) {
        this.props = options || {};
        this.items = [];
        this._listeners = [];
        this._opened = false;
    }

    DropdownView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_dropdown',
        body: null,
        shell: null,
        items: null,
        _listeners: null,
        _opened: false,
        _trigger: null,
        _menu: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDropdown();
            this.inited();
        },
        buildDropdown: function () {
            var options = this.props;
            var triggerMode = options.trigger || 'click';
            var placement = options.placement || 'bottom-left';
            var type = options.type || 'default';
            var size = options.size || 'default';
            var disabled = options.disabled || false;
            var split = options.split || false;
            $e.fn.addClass(this.shell, 'yc-dropdown');
            if (type !== 'default') {
                $e.fn.addClass(this.shell, 'yc-dropdown--' + type);
            }
            if (disabled) {
                $e.fn.addClass(this.shell, 'is-disabled');
            }
            if (split) {
                $e.fn.addClass(this.shell, 'yc-dropdown-btn');
            }
            this._trigger = $e.fn.create('div');
            $e.fn.addClass(this._trigger, 'yc-dropdown__trigger');
            if (split) {
                var defaultBtn = $e.fn.create('button');
                $e.fn.addClass(defaultBtn, 'yc-dropdown-btn__default');
                defaultBtn.innerHTML = options.title || '';
                this._trigger.appendChild(defaultBtn);
                var triggerBtn = $e.fn.create('button');
                $e.fn.addClass(triggerBtn, 'yc-dropdown-btn__trigger-btn');
                triggerBtn.innerHTML = '<i class="yc-dropdown-btn__caret">&#9660;</i>';
                this._trigger.appendChild(triggerBtn);
            } else {
                this._trigger.innerHTML = '<span>' + (options.title || '') + '</span><i class="yc-dropdown__caret">&#9660;</i>';
            }
            this.getBody().appendChild(this._trigger);
            this._menu = $e.fn.create('ul');
            $e.fn.addClass(this._menu, 'yc-dropdown__menu');
            if (placement === 'bottom-right') {
                $e.fn.addClass(this._menu, 'yc-dropdown__menu--right');
            } else if (placement === 'top-left') {
                $e.fn.addClass(this._menu, 'yc-dropdown__menu--dropup');
            } else if (placement === 'top-right') {
                $e.fn.addClass(this._menu, 'yc-dropdown__menu--dropup');
                $e.fn.addClass(this._menu, 'yc-dropdown__menu--right');
            }
            if (size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-dropdown--' + size);
            }
            if (options.items instanceof Array) {
                for (var i = 0; i < options.items.length; i++) {
                    this.addItem(options.items[i]);
                }
            }
            this.getBody().appendChild(this._menu);
            this.bindEvents(triggerMode);
        },
        addItem: function (itemOptions) {
            var item;
            if (itemOptions.type === 'divider') {
                item = $e.fn.create('li');
                $e.fn.addClass(item, 'yc-dropdown__divider');
            } else if (itemOptions.type === 'title') {
                item = $e.fn.create('li');
                $e.fn.addClass(item, 'yc-dropdown__title');
                item.innerHTML = itemOptions.title || '';
            } else {
                item = $e.fn.create('li');
                $e.fn.addClass(item, 'yc-dropdown__item');
                if (itemOptions.disabled) {
                    $e.fn.addClass(item, 'yc-dropdown__item--disabled');
                }
                if (itemOptions.danger) {
                    $e.fn.addClass(item, 'yc-dropdown__item--danger');
                }
                if (itemOptions.divided) {
                    $e.fn.addClass(item, 'yc-dropdown__item--divided');
                }
                if (itemOptions.active) {
                    $e.fn.addClass(item, 'yc-dropdown__item--active');
                }
                var icon = itemOptions.icon ? '<i>' + itemOptions.icon + '</i>' : '';
                item.innerHTML = icon + '<span>' + (itemOptions.title || itemOptions.label || '') + '</span>';
                if (!itemOptions.disabled) {
                    var self = this;
                    this.bindListen($e.events.regEvent(item, 'click', this, function (e) {
                        self.onItemClick(e, itemOptions, item);
                    }));
                }
            }
            this._menu.appendChild(item);
            this.items.push(item);
            return item;
        },
        bindEvents: function (triggerMode) {
            var self = this;
            if (triggerMode === 'click') {
                this.bindListen($e.events.regEvent(this._trigger, 'click', this, function (e) {
                    self.toggle(e);
                }));
                this.bindListen($e.events.regEvent(document, 'click', this, function (e) {
                    if (!self.shell.contains(e.target)) {
                        self.close();
                    }
                }));
            } else if (triggerMode === 'hover') {
                this.bindListen($e.events.regEvent(this.shell, 'mouseenter', this, function (e) {
                    self.open();
                }));
                this.bindListen($e.events.regEvent(this.shell, 'mouseleave', this, function (e) {
                    self.close();
                }));
            }
        },
        toggle: function (e) {
            if (this._opened) {
                this.close();
            } else {
                this.open();
            }
        },
        open: function () {
            if (this.props.disabled) return;
            this._opened = true;
            $e.fn.addClass(this.shell, 'yc-dropdown--opened');
            $e.fn.addClass(this._menu, 'yc-dropdown__menu--show');
            if (this.props.onOpen) {
                this.props.onOpen();
            }
        },
        close: function () {
            this._opened = false;
            $e.fn.removeClass(this.shell, 'yc-dropdown--opened');
            $e.fn.removeClass(this._menu, 'yc-dropdown__menu--show');
            if (this.props.onClose) {
                this.props.onClose();
            }
        },
        onItemClick: function (e, options, item) {
            this.close();
            if (this.props.onSelect) {
                this.props.onSelect(options, item);
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
            this._trigger = null;
            this._menu = null;
            this.body = null;
        },
        resize: function (options) {
        }
    };
    var plugin = {
        create: function (options) {
            return new DropdownView(options);
        }
    };
    $e.ui.addViewPlugin("view_dropdown", plugin);
}($e);
