/**
 * @file 通知组件
 * @description 提供全局通知功能，支持四种类型（success/warning/error/info），支持自动关闭
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    var _notificationQueue = [];
    var _notificationContainers = {};

    /**
     * NotificationView 通知组件
     * 用于展示全局通知消息，支持多种类型和自动关闭
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.type='info'] - 通知类型：success/warning/error/info
     * @param {string} [options.title=''] - 标题文本
     * @param {string} [options.message=''] - 消息内容
     * @param {string} [options.position='top-right'] - 显示位置：top-right/top-left/bottom-right/bottom-left
     * @param {number} [options.duration=4500] - 自动关闭时间（毫秒），0表示不自动关闭
     * @param {boolean} [options.showClose=true] - 是否显示关闭按钮
     */
    function NotificationView(options) {
        this.props = options;
        this._type = options['type'] || 'info';
        this._title = options['title'] || '';
        this._message = options['message'] || '';
        this._position = options['position'] || 'top-right';
        this._duration = options['duration'] !== undefined ? options['duration'] : 4500;
        this._showClose = $e.fn.getBoolean(options['showClose'], true);
        this._visible = false;
        this._timer = null;
    }

    NotificationView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_notification',
        body: null,
        _type: 'info',
        _title: '',
        _message: '',
        _position: 'top-right',
        _duration: 4500,
        _showClose: true,
        _visible: false,
        _timer: null,
        _closeBtn: null,
        _iconEl: null,
        _events: null,

        /**
         * 初始化通知组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector('[view-area="body"]') || this.shell.querySelector('.yc-notification-content');
            this.render();
            this.inited();
        },

        /**
         * 渲染通知内容
         * @private
         * @returns {void}
         */
        render: function () {
            if (this.body) {
                var iconClass = this.getIconClass(this._type);
                this.body.innerHTML = '';
                if (iconClass) {
                    this._iconEl = document.createElement('i');
                    this._iconEl.className = 'yc-notification-icon ' + iconClass;
                    this.body.appendChild(this._iconEl);
                }
                var content = document.createElement('div');
                content.className = 'yc-notification-content';
                if (this._title) {
                    var titleEl = document.createElement('div');
                    titleEl.className = 'yc-notification-title';
                    titleEl.innerHTML = this._title;
                    content.appendChild(titleEl);
                }
                if (this._message) {
                    var messageEl = document.createElement('div');
                    messageEl.className = 'yc-notification-message';
                    messageEl.innerHTML = this._message;
                    content.appendChild(messageEl);
                }
                this.body.appendChild(content);
                if (this._showClose) {
                    this._closeBtn = document.createElement('button');
                    this._closeBtn.className = 'yc-notification-close';
                    this._closeBtn.innerHTML = '×';
                    this._closeBtn.addEventListener('click', this.close.bind(this));
                    this.body.appendChild(this._closeBtn);
                }
            }
        },

        /**
         * 获取图标类名
         * @private
         * @param {string} type - 通知类型
         * @returns {string} 图标类名
         */
        getIconClass: function (type) {
            var iconMap = {
                success: 'yc-icon-success',
                warning: 'yc-icon-warning',
                error: 'yc-icon-error',
                info: 'yc-icon-info'
            };
            return iconMap[type] || '';
        },

        /**
         * 显示通知
         * @public
         * @returns {void}
         */
        show: function () {
            this._visible = true;
            this.shell.style.display = 'block';
            $e.fn.addClass(this.shell, 'yc-notification-enter');
            if (this._duration > 0) {
                this._timer = setTimeout(this.close.bind(this), this._duration);
            }
        },

        /**
         * 关闭通知
         * @public
         * @returns {void}
         */
        close: function () {
            if (!this._visible) {
                return;
            }
            this._visible = false;
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            $e.fn.removeClass(this.shell, 'yc-notification-enter');
            $e.fn.addClass(this.shell, 'yc-notification-leave');
            setTimeout(function () {
                this.shell.style.display = 'none';
                $e.fn.removeClass(this.shell, 'yc-notification-leave');
            }.bind(this), 300);
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            if (this._closeBtn) {
                this._closeBtn.removeEventListener('click', this.close);
            }
        }
    };

    var plugin = {
        create: function (options) {
            return new NotificationView(options);
        }
    };

    $e.ui.addViewPlugin('view_notification', plugin);
}($e);