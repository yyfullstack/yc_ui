/**
 * @file 对话框视图组件
 * @description 支持模态/非模态、拖拽、缩放、子视图管理、标题设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var dialog = $e.ui.createView('view_dialog', {
 *     title: '提示',
 *     modal: true,
 *     resizable: true
 * });
 * dialog.show({ side: 'center' });
 */
+function ($e) {
    'use strict';

    /**
     * 对话框视图组件构造函数
     * @class DialogView
     * @param {Object} options - 配置选项
     * @param {boolean} [options.modal=true] - 是否为模态窗口
     * @param {Array} [options.children] - 子视图配置
     * @param {string} [options.title] - 对话框标题
     * @param {boolean} [options.resizable=true] - 是否可调整大小
     */
    function DialogView(options) {
        this.props = options || {};
        this.modal = $e.fn.getBoolean(this.props.modal, true);
        this.parseChildren(this.props.children);
        this.minmaxSize = {
            height: 50,
            width: 120
        };
    }

    DialogView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_dialog',
        body: null,
        header: null,

        resizeElement: null,
        dragElement: null,
        history: null,
        shown: false,
        children: null,
        child: null,

        init: function () {
            this.body = this.shell.querySelector("[view-area='body']");
            this.header = this.shell.querySelector('[view-band="header"]');

            var btn = this.shell.querySelector('.yc-view-dialog-close');
            if (btn) {
                this.bindListen($e.events.regEvent(btn, 'click', this, this.close));
            }

            if (!this.shell.parentNode) {
                $e.fn.showElement(this.shell, false);
                document.body.appendChild(this.shell);
            }

            if ($e.fn.getBoolean(this.props.resizable || 'true')) {
                this.resizeElement = $e.ui.forResizeView(
                    this.shell,
                    this.minmaxSize.width,
                    this.minmaxSize.height
                );
            }

            if (this.title || this.props.title) {
                this.setTitle(this.title || this.props.title);
            }

            this.dragElement = $e.ui.forDragView(this.shell);
            this.initArea();
            this.buildChildren();
            this.inited();
        },

        /** @deprecated 请使用 setChildView 替代 */
        setChild: function (view) {
            this.setChildView(view);
        },

        /**
         * 设置子视图
         * @param {Object} view - 子视图对象
         */
        setChildView: function (view) {
            if (view) {
                $e.fn.setChild(this.getBody(), view.getShell ? view.getShell() : view);
            } else {
                $e.fn.setChild(this.getBody(), null);
            }
            this.resize();
        },

        /**
         * 获取子视图名称
         * @returns {string}
         */
        getChildName: function () {
            return this.child;
        },

        /**
         * 获取标题
         * @param {boolean} [all] - 包括所有的标题
         * @returns {string} 当前标题文本
         */
        getTitle: function (all) {
            if (this.header) {
                var titleEl = this.header.querySelector('[view-band="title"]');
                return $e.fn.getLableText(titleEl);
            }
            return '';
        },

        /**
         * 设置标题
         * @param {string} title - 标题文本
         */
        setTitle: function (title) {
            if (this.header) {
                var titleEl = this.header.querySelector('[view-band="title"]');
                if (titleEl) {
                    $e.fn.setLabelText(titleEl, title);
                }
            }
        },

        /**
         * 是否为模态窗口
         * @returns {boolean}
         */
        isModal: function () {
            return this.modal;
        },

        /**
         * 关闭前查询（可覆盖以阻止关闭）
         * @returns {boolean} 是否允许关闭
         */
        closeQuery: function () {
            return true;
        },

        /**
         * 关闭对话框
         * @param {Event} [e] - 事件对象
         * @param {boolean} [force=false] - 是否强制关闭
         * @param {Object} [options] - 关闭选项
         * @returns {boolean} 是否成功关闭
         */
        close: function (e, force, options) {
            if (!force) {
                if (!this.closeQuery()) {
                    return false;
                }
            }
            $e.ui.closeWindow(this);
            this.onClosed();
            return true;
        },

        min: function () {
        },

        max: function () {
        },

        /**
         * 显示对话框
         * @param {Object} [option] - 显示选项
         * @param {string} [option.side='center'] - 显示位置
         */
        show: function (option) {
            option = option || { side: 'center' };
            option.modal = this.isModal();
            var self = this;
            $e.ui.showWindow(self, true, option);
            setTimeout(function () {
                self.resize();
                self.onShow(option);
            }, 0);
        },

        selfRelease: function (hasDb, withChild) {
            if (withChild && this.body) {
                var children = this.body.childNodes;
                for (var i = 0, len = children.length; i < len; i++) {
                    if (children.$owner) {
                        children.$owner.release(hasDb, withChild);
                    }
                }
            }
            if (this.dragElement) {
                this.dragElement.release();
                this.dragElement = null;
            }
            if (this.resizeElement) {
                this.resizeElement.release();
                this.resizeElement = null;
            }
            this.shell = this.body = this.header = null;
        },

        /**
         * 调整组件尺寸
         * @param {number|string} [width] - 宽度
         * @param {number|string} [height] - 高度
         */
        resize: function (width, height) {
            var w1;
            var h1;
            var shell = this.getShell();
            if (arguments.length === 0) {
                var size = $e.fn.realSize(shell);
                w1 = size.width;
                h1 = size.height;
            } else {
                w1 = isNaN(width) ? width : (width + 'px');
                h1 = isNaN(height) ? height : (height + 'px');
            }
            var st = $e.fn.getStyle(shell);
            var style = 'width:' + w1 + ';height:' + h1;
            if ($e.fn.getInt(st.top) < 0) {
                style = style + ';top:0px';
            }
            $e.fn.setStyle(shell, style);
            var self = this;
            setTimeout(function () {
                self.innerResize();
                self.onResize();
            }, 50);
        },

        innerResize: function () {
            var shell = this.getShell();
            var body = this.getBody();
            var shellSize = $e.fn.realSize(shell);
            var options = {
                height: shellSize.height
            };
            var st;
            if (this.header) {
                st = $e.fn.realSize(this.header);
                options.height -= (st.height + st.blankHeight + st.marginHeight);
            }
            st = $e.fn.realSize(body);
            options.height -= (st.blankHeight + st.marginHeight + shellSize.blankHeight);
            $e.fn.setStyle(body, 'height:' + options.height + 'px');
            $e.ui.resizeChildren(body, options);
        },

        onResize: function () {
        },

        onShow: function (options) {
        },

        onClosed: function () {
        }
    };

    var plugin = {
        create: function (options) {
            return new DialogView(options);
        }
    };

    $e.fn.extend(
        $e.ui.getViewPlugin('view_container').viewPrototype(),
        DialogView.prototype
    );
    $e.ui.addViewPlugin('view_dialog', plugin);
}($e);