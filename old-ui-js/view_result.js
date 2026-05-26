/**
 * @file 结果页组件
 * @description 用于展示操作结果反馈，支持成功、警告、错误、信息四种状态及403/404/500错误码
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var result = $e.ui.createView('view_result', {
 *     status: 'success',
 *     title: '操作成功',
 *     subTitle: '数据已保存成功'
 * });
 */
+function ($e) {
    'use strict';

    /**
     * ResultView 结果页组件
     * 用于展示操作结果反馈，支持成功、警告、错误、信息四种状态
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.status='info'] - 状态：success/warning/error/info/403/404/500
     * @param {string} [options.title=''] - 标题文本
     * @param {string} [options.subTitle=''] - 副标题文本
     * @param {string} [options.icon=''] - 自定义图标类名
     */
    function ResultView(options) {
        this.props = options || {};
        this._status = this.props['status'] || 'info';
        this._title = this.props['title'] || '';
        this._subTitle = this.props['subTitle'] || '';
        this._icon = this.props['icon'] || '';
    }

    ResultView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_result',
        shell: null,
        body: null,
        _status: 'info',
        _title: '',
        _subTitle: '',
        _icon: '',
        _iconEl: null,
        _titleEl: null,
        _subTitleEl: null,
        _extraEl: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-result');
            this.render();
            this.inited();
        },

        /**
         * 渲染Result组件DOM结构
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            shell.style.textAlign = 'center';
            shell.style.padding = 'var(--yc-padding-xl) var(--yc-padding-md)';

            var iconMap = {
                'success': { icon: 'fa-check-circle', color: 'var(--yc-success-color)' },
                'warning': { icon: 'fa-exclamation-circle', color: 'var(--yc-warning-color)' },
                'error': { icon: 'fa-close-circle', color: 'var(--yc-error-color)' },
                'info': { icon: 'fa-info-circle', color: 'var(--yc-primary-color)' },
                '403': { icon: 'fa-lock', color: 'var(--yc-error-color)' },
                '404': { icon: 'fa-frown-o', color: 'var(--yc-text-color-secondary)' },
                '500': { icon: 'fa-frown-o', color: 'var(--yc-error-color)' }
            };

            var iconConfig = iconMap[this._status] || iconMap['info'];
            var iconClass = this._icon || iconConfig.icon;

            var iconWrap = document.createElement('div');
            $e.fn.addClass(iconWrap, 'yc-result-icon');
            iconWrap.style.fontSize = '72px';
            iconWrap.style.lineHeight = '1';
            iconWrap.style.marginBottom = 'var(--yc-padding-lg)';
            iconWrap.style.color = iconConfig.color;

            var iconEl = document.createElement('i');
            $e.fn.addClass(iconEl, 'fa');
            $e.fn.addClass(iconEl, iconClass);
            iconWrap.appendChild(iconEl);
            this._iconEl = iconWrap;
            shell.appendChild(iconWrap);

            if (this._title) {
                var titleEl = document.createElement('div');
                $e.fn.addClass(titleEl, 'yc-result-title');
                titleEl.style.fontSize = 'var(--yc-font-size-xl)';
                titleEl.style.color = 'var(--yc-heading-color)';
                titleEl.style.fontWeight = '500';
                titleEl.style.lineHeight = '1.4';
                titleEl.style.marginBottom = 'var(--yc-padding-md)';
                titleEl.innerHTML = this._title;
                this._titleEl = titleEl;
                shell.appendChild(titleEl);
            }

            if (this._subTitle) {
                var subTitleEl = document.createElement('div');
                $e.fn.addClass(subTitleEl, 'yc-result-subtitle');
                subTitleEl.style.fontSize = 'var(--yc-font-size-base)';
                subTitleEl.style.color = 'var(--yc-text-color-secondary)';
                subTitleEl.style.lineHeight = 'var(--yc-line-height-base)';
                subTitleEl.style.marginBottom = 'var(--yc-padding-lg)';
                subTitleEl.innerHTML = this._subTitle;
                this._subTitleEl = subTitleEl;
                shell.appendChild(subTitleEl);
            }

            var extraEl = document.createElement('div');
            $e.fn.addClass(extraEl, 'yc-result-extra');
            extraEl.style.display = 'flex';
            extraEl.style.justifyContent = 'center';
            extraEl.style.gap = '8px';
            this._extraEl = extraEl;
            shell.appendChild(extraEl);
        },

        /**
         * 设置状态
         * @public
         * @param {string} status - 状态：success/warning/error/info/403/404/500
         * @returns {void}
         */
        setStatus: function (status) {
            this._status = status;
            this.render();
        },

        /**
         * 获取状态
         * @public
         * @returns {string} 当前状态
         */
        getStatus: function () {
            return this._status;
        },

        /**
         * 设置标题
         * @public
         * @param {string} title - 标题文本
         * @returns {void}
         */
        setTitle: function (title) {
            this._title = title;
            if (this._titleEl) {
                this._titleEl.innerHTML = title;
            } else {
                this.render();
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
         * 设置副标题
         * @public
         * @param {string} subTitle - 副标题文本
         * @returns {void}
         */
        setSubTitle: function (subTitle) {
            this._subTitle = subTitle;
            if (this._subTitleEl) {
                this._subTitleEl.innerHTML = subTitle;
            } else {
                this.render();
            }
        },

        /**
         * 获取副标题
         * @public
         * @returns {string} 副标题文本
         */
        getSubTitle: function () {
            return this._subTitle;
        },

        /**
         * 设置自定义图标
         * @public
         * @param {string} icon - FontAwesome图标类名
         * @returns {void}
         */
        setIcon: function (icon) {
            this._icon = icon;
            this.render();
        },

        /**
         * 获取自定义图标
         * @public
         * @returns {string} 图标类名
         */
        getIcon: function () {
            return this._icon;
        },

        /**
         * 设置额外内容
         * @public
         * @param {HTMLElement|string} content - 额外内容元素或HTML字符串
         * @returns {void}
         */
        setExtra: function (content) {
            if (this._extraEl) {
                if (typeof content === 'string') {
                    this._extraEl.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    this._extraEl.innerHTML = '';
                    this._extraEl.appendChild(content);
                }
            }
        },

        /**
         * 获取额外内容容器
         * @public
         * @returns {HTMLElement} 额外内容容器元素
         */
        getExtra: function () {
            return this._extraEl;
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this._iconEl = null;
            this._titleEl = null;
            this._subTitleEl = null;
            this._extraEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建结果页组件实例
         * @param {Object} options - 组件配置
         * @returns {ResultView} 结果页组件实例
         */
        create: function (options) {
            return new ResultView(options);
        }
    };
    $e.ui.addViewPlugin("view_result", plugin);
}($e);