/**
 * @file Collapse折叠面板组件
 * @description 提供可折叠的内容面板，支持手风琴模式和普通模式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * CollapseView 折叠面板组件
     * 用于展示可折叠的内容面板，支持手风琴模式
     * @class
     * @param {Object} options 配置项
     * @param {boolean} [options.accordion=false] 是否手风琴模式
     * @param {boolean} [options.plain=false] 是否简洁模式
     * @param {Array} [options.panels=[]] 面板数组
     * @param {Array} [options.activeKeys=[]] 激活的面板key数组
     */
    function CollapseView(options) {
        this.props = options || {};
        this._accordion = $e.fn.getBoolean(this.props['accordion'], false);
        this._plain = $e.fn.getBoolean(this.props['plain'], false);
        this._panels = this.props['panels'] || [];
        this._activeKeys = this.props['activeKeys'] || [];
        this._panelHandles = [];
        this._panelEls = [];
    }

    CollapseView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_collapse',
        shell: null,
        body: null,
        _accordion: false,
        _plain: false,
        _panels: null,
        _activeKeys: null,
        _panelHandles: null,
        _panelEls: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-collapse');
            if (this._accordion) {
                $e.fn.addClass(this.shell, 'yc-collapse--accordion');
            }
            if (this._plain) {
                $e.fn.addClass(this.shell, 'yc-collapse--plain');
            }
            this.render();
            this.inited();
        },

        /**
         * 渲染折叠面板
         * @public
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            this._panelEls = [];
            this._panelHandles = [];

            var panels = this._panels;
            for (var i = 0; i < panels.length; i++) {
                var panel = panels[i];
                var panelEl = this.createPanel(panel);
                shell.appendChild(panelEl);
                this._panelEls.push(panelEl);
            }
        },

        /**
         * 创建单个面板
         * @public
         * @param {Object} panel 面板配置
         * @returns {HTMLElement} 面板元素
         */
        createPanel: function (panel) {
            var _this = this;
            var key = panel.key || '';
            var title = panel.title || '';
            var content = panel.content || '';
            var disabled = $e.fn.getBoolean(panel.disabled, false);
            var isActive = this._activeKeys.indexOf(key) >= 0;

            var itemEl = document.createElement('div');
            $e.fn.addClass(itemEl, 'yc-collapse-item');
            if (isActive) {
                $e.fn.addClass(itemEl, 'is-active');
            }
            if (disabled) {
                $e.fn.addClass(itemEl, 'is-disabled');
            }
            itemEl.setAttribute('data-key', key);

            var header = document.createElement('div');
            $e.fn.addClass(header, 'yc-collapse-item__header');

            var titleEl = document.createElement('span');
            $e.fn.addClass(titleEl, 'yc-collapse-item__title');
            titleEl.innerHTML = title;
            header.appendChild(titleEl);

            var arrow = document.createElement('i');
            $e.fn.addClass(arrow, 'fa');
            $e.fn.addClass(arrow, 'fa-chevron-right');
            $e.fn.addClass(arrow, 'yc-collapse-item__arrow');
            header.appendChild(arrow);

            itemEl.appendChild(header);

            var contentEl = document.createElement('div');
            $e.fn.addClass(contentEl, 'yc-collapse-item__content');
            contentEl.innerHTML = content;
            itemEl.appendChild(contentEl);

            if (!disabled) {
                var handle = this.bindListen($e.events.regEvent(header, 'click', this, function (event) {
                    _this.togglePanel(key);
                }));
                this._panelHandles.push(handle);
            }

            return itemEl;
        },

        /**
         * 切换面板展开/折叠状态
         * @public
         * @param {string} key 面板标识
         */
        togglePanel: function (key) {
            var idx = this._activeKeys.indexOf(key);
            if (this._accordion) {
                if (idx >= 0) {
                    this._activeKeys = [];
                } else {
                    this._activeKeys = [key];
                }
            } else {
                if (idx >= 0) {
                    this._activeKeys.splice(idx, 1);
                } else {
                    this._activeKeys.push(key);
                }
            }
            this.updatePanelStates();
            this.onChange(this._activeKeys);
        },

        /**
         * 更新所有面板状态
         * @public
         */
        updatePanelStates: function () {
            for (var i = 0; i < this._panelEls.length; i++) {
                var el = this._panelEls[i];
                var key = el.getAttribute('data-key');
                if (this._activeKeys.indexOf(key) >= 0) {
                    $e.fn.addClass(el, 'is-active');
                } else {
                    $e.fn.removeClass(el, 'is-active');
                }
            }
        },

        /**
         * 展开指定面板
         * @public
         * @param {string} key 面板标识
         */
        expandPanel: function (key) {
            if (this._accordion) {
                this._activeKeys = [key];
            } else {
                if (this._activeKeys.indexOf(key) < 0) {
                    this._activeKeys.push(key);
                }
            }
            this.updatePanelStates();
        },

        /**
         * 折叠指定面板
         * @public
         * @param {string} key 面板标识
         */
        collapsePanel: function (key) {
            var idx = this._activeKeys.indexOf(key);
            if (idx >= 0) {
                this._activeKeys.splice(idx, 1);
                this.updatePanelStates();
            }
        },

        /**
         * 设置面板数据
         * @public
         * @param {Array} panels 面板数组
         */
        setPanels: function (panels) {
            this._panels = panels || [];
            this.render();
        },

        /**
         * 获取面板数据
         * @public
         * @returns {Array} 面板数组
         */
        getPanels: function () {
            return this._panels;
        },

        /**
         * 获取当前激活的面板key
         * @public
         * @returns {Array} 激活的面板key数组
         */
        getActiveKeys: function () {
            return this._activeKeys;
        },

        /**
         * 设置激活的面板
         * @public
         * @param {Array} keys 面板key数组
         */
        setActiveKeys: function (keys) {
            this._activeKeys = keys || [];
            this.updatePanelStates();
        },

        /**
         * 设置手风琴模式
         * @public
         * @param {boolean} accordion 是否手风琴模式
         */
        setAccordion: function (accordion) {
            this._accordion = accordion;
            if (accordion) {
                $e.fn.addClass(this.shell, 'yc-collapse--accordion');
                if (this._activeKeys.length > 1) {
                    this._activeKeys = [this._activeKeys[0]];
                    this.updatePanelStates();
                }
            } else {
                $e.fn.removeClass(this.shell, 'yc-collapse--accordion');
            }
        },

        /**
         * 获取手风琴模式
         * @public
         * @returns {boolean} 是否手风琴模式
         */
        getAccordion: function () {
            return this._accordion;
        },

        /**
         * 状态变化回调
         * @public
         * @param {Array} activeKeys 当前激活的key
         */
        onChange: function (activeKeys) {
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            if (this._panelHandles) {
                for (var i = 0; i < this._panelHandles.length; i++) {
                    if (this._panelHandles[i]) {
                        this._panelHandles[i].release();
                    }
                }
                this._panelHandles = null;
            }
            this._panelEls = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        /**
         * 创建Collapse组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {CollapseView} Collapse实例
         */
        create: function (options) {
            return new CollapseView(options);
        }
    };
    $e.ui.addViewPlugin('view_collapse', plugin);
}($e);
