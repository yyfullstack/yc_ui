/**
 * @file 消息对话框组件
 * @description 提供alert、confirm、prompt、loading四种消息对话框功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * MessageBoxView 消息对话框组件
     * 支持alert、confirm、prompt、loading四种类型的消息框
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.type='alert'] - 消息框类型：alert/confirm/prompt/loading
     * @param {string} [options.title=''] - 标题文本
     * @param {string} [options.message=''] - 消息内容
     * @param {string} [options.confirmButtonText='确定'] - 确认按钮文本
     * @param {string} [options.cancelButtonText='取消'] - 取消按钮文本
     * @param {boolean} [options.showCancelButton=false] - 是否显示取消按钮
     * @param {boolean} [options.showClose=true] - 是否显示关闭按钮
     * @param {string} [options.inputPlaceholder=''] - 输入框占位符（用于prompt）
     * @param {string} [options.inputValue=''] - 输入框默认值（用于prompt）
     * @param {Function} [options.callback] - 回调函数
     */
    function MessageBoxView(options) {
        this.props = options;
        this._type = options['type'] || 'alert';
        this._title = options['title'] || '';
        this._message = options['message'] || '';
        this._confirmButtonText = options['confirmButtonText'] || '确定';
        this._cancelButtonText = options['cancelButtonText'] || '取消';
        this._showCancelButton = $e.fn.getBoolean(options['showCancelButton'], this._type === 'confirm' || this._type === 'prompt');
        this._showClose = $e.fn.getBoolean(options['showClose'], true);
        this._inputPlaceholder = options['inputPlaceholder'] || '';
        this._inputValue = options['inputValue'] || '';
        this._callback = options['callback'] || null;
        this._visible = false;
        this._mask = null;
    }

    MessageBoxView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_messagebox',
        body: null,
        header: null,
        footer: null,
        _type: 'alert',
        _title: '',
        _message: '',
        _confirmButtonText: '确定',
        _cancelButtonText: '取消',
        _showCancelButton: false,
        _showClose: true,
        _inputPlaceholder: '',
        _inputValue: '',
        _callback: null,
        _visible: false,
        _mask: null,
        _confirmBtn: null,
        _cancelBtn: null,
        _closeBtn: null,
        _inputEl: null,

        /**
         * 初始化消息对话框组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector('[view-band="body"]') || this.shell;
            this.header = this.shell.querySelector('[view-band="header"]');
            this.footer = this.shell.querySelector('[view-band="footer"]');
            this.render();
            this.inited();
        },

        /**
         * 渲染消息对话框
         * @private
         * @returns {void}
         */
        render: function () {
            if (this.header) {
                this.header.innerHTML = this._title || '';
            }
            if (this.body) {
                this.body.innerHTML = this._message || '';
            }
            this.renderButtons();
            if (this._type === 'prompt') {
                this.renderInput();
            }
        },

        /**
         * 渲染按钮
         * @private
         * @returns {void}
         */
        renderButtons: function () {
            if (!this.footer) {
                return;
            }
            this.footer.innerHTML = '';
            this._confirmBtn = this.createButton(this._confirmButtonText, 'confirm');
            this.footer.appendChild(this._confirmBtn);
            if (this._showCancelButton) {
                this._cancelBtn = this.createButton(this._cancelButtonText, 'cancel');
                this.footer.appendChild(this._cancelBtn);
            }
            if (this._showClose) {
                this._closeBtn = document.createElement('button');
                this._closeBtn.className = 'yc-btn yc-btn-close';
                this._closeBtn.innerHTML = '×';
                this._closeBtn.addEventListener('click', this.handleClose.bind(this));
                this.footer.appendChild(this._closeBtn);
            }
        },

        /**
         * 创建按钮元素
         * @private
         * @param {string} text - 按钮文本
         * @param {string} type - 按钮类型：confirm/cancel
         * @returns {HTMLElement} 按钮元素
         */
        createButton: function (text, type) {
            var btn = document.createElement('button');
            btn.className = 'yc-btn yc-btn-' + type;
            btn.innerHTML = text;
            btn.addEventListener('click', this.handleButtonClick.bind(this, type));
            return btn;
        },

        /**
         * 渲染输入框（用于prompt类型）
         * @private
         * @returns {void}
         */
        renderInput: function () {
            var inputContainer = document.createElement('div');
            inputContainer.className = 'yc-input-container';
            this._inputEl = document.createElement('input');
            this._inputEl.type = 'text';
            this._inputEl.placeholder = this._inputPlaceholder;
            this._inputEl.value = this._inputValue;
            inputContainer.appendChild(this._inputEl);
            this.body.appendChild(inputContainer);
        },

        /**
         * 处理按钮点击事件
         * @private
         * @param {string} type - 按钮类型
         * @param {Event} e - 事件对象
         * @returns {void}
         */
        handleButtonClick: function (type, e) {
            e.stopPropagation();
            if (type === 'confirm') {
                this.handleConfirm();
            } else {
                this.handleCancel();
            }
        },

        /**
         * 处理确认操作
         * @private
         * @returns {void}
         */
        handleConfirm: function () {
            var result = this._type === 'prompt' ? this._inputEl.value : true;
            this.hide();
            if (this._callback) {
                this._callback(result);
            }
        },

        /**
         * 处理取消操作
         * @private
         * @returns {void}
         */
        handleCancel: function () {
            this.hide();
            if (this._callback) {
                this._callback(false);
            }
        },

        /**
         * 处理关闭操作
         * @private
         * @returns {void}
         */
        handleClose: function () {
            this.hide();
            if (this._callback) {
                this._callback(false);
            }
        },

        /**
         * 显示消息对话框
         * @public
         * @returns {void}
         */
        show: function () {
            this._visible = true;
            this.shell.style.display = 'block';
            if (this._mask) {
                this._mask.style.display = 'block';
            }
            if (this._inputEl) {
                this._inputEl.focus();
            }
        },

        /**
         * 隐藏消息对话框
         * @public
         * @returns {void}
         */
        hide: function () {
            this._visible = false;
            this.shell.style.display = 'none';
            if (this._mask) {
                this._mask.style.display = 'none';
            }
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            if (this._confirmBtn) {
                this._confirmBtn.removeEventListener('click', this.handleButtonClick);
            }
            if (this._cancelBtn) {
                this._cancelBtn.removeEventListener('click', this.handleButtonClick);
            }
            if (this._closeBtn) {
                this._closeBtn.removeEventListener('click', this.handleClose);
            }
        }
    };

    var plugin = {
        create: function (options) {
            return new MessageBoxView(options);
        }
    };

    $e.ui.addViewPlugin('view_messagebox', plugin);
}($e);