/**
 * @file 抽屉组件
 * @description 支持从不同方向滑出的抽屉面板，支持遮罩层和自定义尺寸
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var drawer = $e.ui.createView('view_drawer', {
 *     direction: 'rtl',
 *     modal: true,
 *     title: '侧边栏',
 *     size: '300px'
 * });
 * drawer.open();
 */
+function ($e) {
    'use strict';

    /**
     * 抽屉视图组件构造函数
     * @class DrawerView
     * @param {Object} options - 配置选项
     * @param {string} [options.direction='rtl'] - 抽屉方向：rtl(右到左)/ltr(左到右)/ttb(上到下)/btt(下到上)
     * @param {boolean} [options.modal=true] - 是否显示遮罩层
     * @param {string} [options.title=''] - 标题文本
     * @param {string} [options.size='300px'] - 抽屉尺寸（宽度或高度）
     */
    function DrawerView(options) {
        this.props = options || {};
        this._direction = options['direction'] || 'rtl';
        this._modal = $e.fn.getBoolean(options['modal'], true);
        this._visible = false;
        this._title = options['title'] || '';
        this._size = options['size'] || '300px';
    }

    DrawerView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_drawer',
        body: null,
        header: null,
        footer: null,
        _mask: null,
        _closeBtn: null,
        _direction: 'rtl',
        _modal: true,
        _visible: false,
        _title: '',
        _size: '300px',
        _events: null,

        /**
         * 初始化抽屉组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-area='body']") || this.shell.querySelector('.yc-drawer-body');
            this.header = this.shell.querySelector('.yc-drawer-header');
            this.footer = this.shell.querySelector('.yc-drawer-footer');

            if (this._modal) {
                this._createMask();
            }

            this._closeBtn = this.shell.querySelector('.yc-drawer-close');
            if (this._closeBtn) {
                this.bindListen($e.events.regEvent(this._closeBtn, 'click', this, this.close));
            }

            this._updateDirection();

            if (this._title) {
                this.setTitle(this._title);
            }

            if (this._size) {
                this._updateSize();
            }

            if (!this.shell.parentNode) {
                $e.fn.showElement(this.shell, false);
            }

            this._events = [];
            this.inited();
        },

        /**
         * 创建遮罩层
         * @private
         * @returns {void}
         */
        _createMask: function () {
            var mask = document.createElement('div');
            mask.className = 'yc-drawer-mask';
            this._mask = mask;
            document.body.appendChild(mask);
            this.bindListen($e.events.regEvent(mask, 'click', this, this.close));
        },

        /**
         * 更新方向样式
         * @private
         * @returns {void}
         */
        _updateDirection: function () {
            $e.fn.removeClass(this.shell, 'yc-drawer-ltr');
            $e.fn.removeClass(this.shell, 'yc-drawer-rtl');
            $e.fn.removeClass(this.shell, 'yc-drawer-ttb');
            $e.fn.removeClass(this.shell, 'yc-drawer-btt');
            $e.fn.addClass(this.shell, 'yc-drawer-' + this._direction);
        },

        /**
         * 更新尺寸
         * @private
         * @returns {void}
         */
        _updateSize: function () {
            if (this._direction === 'ttb' || this._direction === 'btt') {
                this.shell.style.height = this._size;
            } else {
                this.shell.style.width = this._size;
            }
        },

        /**
         * 获取标题
         * @public
         * @returns {string} 标题文本
         */
        getTitle: function () {
            return this._title;
        },

        /**
         * 设置标题
         * @public
         * @param {string} title - 标题文本
         * @returns {void}
         */
        setTitle: function (title) {
            this._title = title;
            if (this.header) {
                var titleEl = this.header.querySelector('.yc-drawer-title');
                if (titleEl) {
                    titleEl.innerText = title;
                }
            }
        },

        /**
         * 打开抽屉
         * @public
         * @returns {void}
         */
        open: function () {
            if (this._visible) return;
            this._visible = true;

            if (!this.shell.parentNode) {
                document.body.appendChild(this.shell);
            }
            $e.fn.showElement(this.shell, true);

            if (this._mask) {
                document.body.appendChild(this._mask);
                setTimeout(function () {
                    $e.fn.addClass(this._mask, 'yc-drawer-mask-visible');
                }.bind(this), 10);
            }

            setTimeout(function () {
                $e.fn.addClass(this.shell, 'yc-drawer-visible');
            }.bind(this), 10);

            this.onOpen();
        },

        /**
         * 关闭抽屉
         * @public
         * @returns {void}
         */
        close: function () {
            if (!this._visible) return;
            this._visible = false;

            $e.fn.removeClass(this.shell, 'yc-drawer-visible');

            if (this._mask) {
                $e.fn.removeClass(this._mask, 'yc-drawer-mask-visible');
            }

            setTimeout(function () {
                if (!this._visible) {
                    $e.fn.showElement(this.shell, false);
                    if (this._mask && this._mask.parentNode) {
                        this._mask.parentNode.removeChild(this._mask);
                    }
                }
            }.bind(this), 300);

            this.onClose();
        },

        /**
         * 切换抽屉显示状态
         * @public
         * @returns {void}
         */
        toggle: function () {
            if (this._visible) {
                this.close();
            } else {
                this.open();
            }
        },

        /**
         * 判断是否可见
         * @public
         * @returns {boolean} 是否可见
         */
        isVisible: function () {
            return this._visible;
        },

        /**
         * 设置方向
         * @public
         * @param {string} direction - 方向：rtl/ltr/ttb/btt
         * @returns {void}
         */
        setDirection: function (direction) {
            this._direction = direction;
            this._updateDirection();
        },

        /**
         * 打开回调（子类可覆盖）
         * @public
         * @returns {void}
         */
        onOpen: function () {
            // 子类实现具体逻辑
        },

        /**
         * 关闭回调（子类可覆盖）
         * @public
         * @returns {void}
         */
        onClose: function () {
            // 子类实现具体逻辑
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            if (this._mask && this._mask.parentNode) {
                this._mask.parentNode.removeChild(this._mask);
            }
            this._mask = null;
            this._closeBtn = null;
            this.body = null;
            this.header = null;
            this.footer = null;
            this._events = null;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建抽屉组件实例
         * @param {Object} options - 组件配置
         * @returns {DrawerView} 抽屉组件实例
         */
        create: function (options) {
            return new DrawerView(options);
        }
    };

    $e.ui.addViewPlugin('view_drawer', plugin);
}($e);