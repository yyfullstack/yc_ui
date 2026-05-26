/**
 * @file 警告提示组件
 * @description 用于页面中展示重要的提示信息，支持成功、警告、错误、信息四种类型
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 警告提示组件构造函数
     * @class AlertView
     * @param {Object} options - 配置选项
     * @param {string} [options.type='info'] - 类型: success/warning/error/info
     * @param {string} [options.message=''] - 提示消息
     * @param {string} [options.description=''] - 描述信息
     * @param {boolean} [options.closable=false] - 是否可关闭
     * @param {boolean} [options.showIcon=true] - 是否显示图标
     */
    function AlertView(options) {
        this.props = options || {};
        this._type = this.props['type'] || 'info';
        this._message = this.props['message'] || '';
        this._description = this.props['description'] || '';
        this._closable = $e.fn.getBoolean(this.props['closable'], false);
        this._showIcon = $e.fn.getBoolean(this.props['showIcon'], true);
        this._handle = null;
    }

    AlertView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_alert',
        shell: null,
        body: null,
        _type: 'info',
        _message: '',
        _description: '',
        _closable: false,
        _showIcon: true,
        _handle: null,

        /**
         * 初始化组件
         * 设置body区域，绑定关闭按钮事件，调用inited完成初始化
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.render();
            this.inited();
        },

        /**
         * 渲染Alert组件DOM结构
         * 根据类型构建对应的图标、消息和描述内容
         */
        render: function () {
            var shell = this.shell;
            $e.fn.addClass(shell, 'yc-alert');
            $e.fn.addClass(shell, 'yc-alert--' + this._type);

            var iconMap = {
                'success': 'fa-check-circle',
                'warning': 'fa-exclamation-circle',
                'error': 'fa-times-circle',
                'info': 'fa-info-circle'
            };

            var html = '';
            if (this._showIcon) {
                html += '<i class="fa ' + (iconMap[this._type] || iconMap['info']) + ' yc-alert-icon"></i>';
            }

            html += '<div class="yc-alert-content">';
            if (this._message) {
                html += '<div class="yc-alert-message">' + this._message + '</div>';
            }
            if (this._description) {
                html += '<div class="yc-alert-description">' + this._description + '</div>';
            }
            html += '</div>';

            if (this._closable) {
                html += '<i class="fa fa-close yc-alert-close"></i>';
            }

            shell.innerHTML = html;

            if (this._closable) {
                var closeBtn = shell.querySelector('.yc-alert-close');
                if (closeBtn) {
                    this._handle = this.bindListen($e.events.regEvent(closeBtn, 'click', this, this.close));
                }
            }
        },

        /**
         * 设置Alert类型
         * @param {string} type 类型: success/warning/error/info
         */
        setType: function (type) {
            if (this._type !== type) {
                $e.fn.removeClass(this.shell, 'yc-alert--' + this._type);
                this._type = type;
                $e.fn.addClass(this.shell, 'yc-alert--' + this._type);
                this.render();
            }
        },

        /**
         * 获取当前Alert类型
         * @returns {string} 当前类型
         */
        getType: function () {
            return this._type;
        },

        /**
         * 设置消息内容
         * @param {string} message 消息文本
         */
        setMessage: function (message) {
            this._message = message;
            var msgEl = this.shell.querySelector('.yc-alert-message');
            if (msgEl) {
                msgEl.innerHTML = message;
            }
        },

        /**
         * 获取消息内容
         * @returns {string} 消息文本
         */
        getMessage: function () {
            return this._message;
        },

        /**
         * 设置描述内容
         * @param {string} description 描述文本
         */
        setDescription: function (description) {
            this._description = description;
            var descEl = this.shell.querySelector('.yc-alert-description');
            if (descEl) {
                descEl.innerHTML = description;
            }
        },

        /**
         * 获取描述内容
         * @returns {string} 描述文本
         */
        getDescription: function () {
            return this._description;
        },

        /**
         * 关闭Alert组件
         * 触发关闭动画并从DOM中移除
         */
        close: function () {
            var shell = this.shell;
            if (shell && shell.parentNode) {
                $e.fn.addClass(shell, 'anima-close');
                var _this = this;
                setTimeout(function () {
                    shell.parentNode.removeChild(shell);
                    _this.onClose();
                }, 350);
            }
        },

        /**
         * 关闭后的回调方法
         */
        onClose: function () {
        },

        /**
         * 释放组件资源
         * 清理事件监听器和引用
         */
        selfRelease: function () {
            if (this._handle) {
                this._handle.release();
                this._handle = null;
            }
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new AlertView(options);
        }
    };
    $e.ui.addViewPlugin("view_alert", plugin);
}($e);
