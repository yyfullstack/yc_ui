/**
 * @file Window窗口组件
 * @description 提供窗口拖拽、调整大小、最小化、最大化等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * WindowView 窗口组件
     * 提供窗口拖拽、调整大小、最小化、最大化等功能
     * @class
     * @param {Object} options 配置项
     * @param {string} [options.title=''] 窗口标题
     * @param {number} [options.width=600] 窗口宽度
     * @param {number} [options.height=400] 窗口高度
     * @param {boolean} [options.draggable=true] 是否可拖拽
     * @param {boolean} [options.resizable=true] 是否可调整大小
     * @param {boolean} [options.showMinimize=true] 是否显示最小化按钮
     * @param {boolean} [options.showMaximize=true] 是否显示最大化按钮
     * @param {boolean} [options.showClose=true] 是否显示关闭按钮
     * @param {boolean} [options.modal=false] 是否模态窗口
     */
    function WindowView(options) {
        this.props = options;
        this._title = options['title'] || '';
        this._width = options['width'] || 600;
        this._height = options['height'] || 400;
        this._draggable = $e.fn.getBoolean(options['draggable'], true);
        this._resizable = $e.fn.getBoolean(options['resizable'], true);
        this._showMinimize = $e.fn.getBoolean(options['showMinimize'], true);
        this._showMaximize = $e.fn.getBoolean(options['showMaximize'], true);
        this._showClose = $e.fn.getBoolean(options['showClose'], true);
        this._modal = $e.fn.getBoolean(options['modal'], false);
        this._state = 'normal';
        this._visible = false;
        this._mask = null;
        this._drag = null;
        this._resize = null;
        this._normalState = null;
    }

    WindowView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_window',
        body: null,
        header: null,
        footer: null,
        _title: '',
        _width: 600,
        _height: 400,
        _draggable: true,
        _resizable: true,
        _showMinimize: true,
        _showMaximize: true,
        _showClose: true,
        _modal: false,
        _state: 'normal',
        _visible: false,
        _mask: null,
        _drag: null,
        _resize: null,
        _normalState: null,
        _minBtn: null,
        _maxBtn: null,
        _closeBtn: null,
        _events: null,

        /**
         * 初始化窗口组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector('[view-area="body"]') || this.shell.querySelector('.yc-window-body');
            this.header = this.shell.querySelector('.yc-window-header');
            this.footer = this.shell.querySelector('.yc-window-footer');

            if (this._modal) {
                this._createMask();
            }

            if (this._title) {
                this.setTitle(this._title);
            }

            this._updateSize();
            this._createWindowButtons();

            if (this._draggable && this.header) {
                this._initDrag();
            }

            if (this._resizable) {
                this._initResize();
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
            mask.className = 'yc-window-overlay';
            this._mask = mask;
            document.body.appendChild(mask);
        },

        /**
         * 创建窗口控制按钮
         * @private
         * @returns {void}
         */
        _createWindowButtons: function () {
            if (!this.header) return;

            var btnContainer = this.header.querySelector('.yc-window-header-buttons');
            if (!btnContainer) {
                btnContainer = document.createElement('div');
                btnContainer.className = 'yc-window-header-buttons';
                this.header.appendChild(btnContainer);
            }

            if (this._showMinimize) {
                this._minBtn = document.createElement('button');
                this._minBtn.className = 'yc-window-minimize';
                this._minBtn.innerHTML = '&#8211;';
                this._minBtn.title = '最小化';
                this.bindListen($e.events.regEvent(this._minBtn, 'click', this, this.minimize));
                btnContainer.appendChild(this._minBtn);
            }

            if (this._showMaximize) {
                this._maxBtn = document.createElement('button');
                this._maxBtn.className = 'yc-window-maximize';
                this._maxBtn.innerHTML = '&#9633;';
                this._maxBtn.title = '最大化';
                this.bindListen($e.events.regEvent(this._maxBtn, 'click', this, this.maximize));
                btnContainer.appendChild(this._maxBtn);
            }

            if (this._showClose) {
                this._closeBtn = document.createElement('button');
                this._closeBtn.className = 'yc-window-close';
                this._closeBtn.innerHTML = '&#10005;';
                this._closeBtn.title = '关闭';
                this.bindListen($e.events.regEvent(this._closeBtn, 'click', this, this.close));
                btnContainer.appendChild(this._closeBtn);
            }
        },

        /**
         * 初始化拖拽功能
         * @private
         * @returns {void}
         */
        _initDrag: function () {
            var _this = this;
            var header = this.header;
            var shell = this.shell;
            var isDragging = false;
            var startX, startY, startLeft, startTop;

            var onMouseDown = function (e) {
                if (_this._state === 'maximized') return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                var rect = shell.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                $e.fn.addClass(shell, 'dragging');
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            var onMouseMove = function (e) {
                if (!isDragging) return;
                var dx = e.clientX - startX;
                var dy = e.clientY - startY;
                shell.style.left = (startLeft + dx) + 'px';
                shell.style.top = (startTop + dy) + 'px';
                shell.style.transform = 'none';
            };

            var onMouseUp = function () {
                isDragging = false;
                $e.fn.removeClass(shell, 'dragging');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            header.addEventListener('mousedown', onMouseDown);
            this._drag = {
                release: function () {
                    header.removeEventListener('mousedown', onMouseDown);
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
            };
        },

        /**
         * 初始化调整大小功能
         * @private
         * @returns {void}
         */
        _initResize: function () {
            var _this = this;
            var shell = this.shell;
            var directions = ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'];

            this._resize = {
                handles: [],
                release: function () {
                    for (var i = 0; i < this.handles.length; i++) {
                        var h = this.handles[i];
                        if (h.el && h.el.parentNode) {
                            h.el.parentNode.removeChild(h.el);
                        }
                    }
                    this.handles = [];
                }
            };

            for (var i = 0; i < directions.length; i++) {
                var dir = directions[i];
                var handle = document.createElement('div');
                handle.className = 'yc-window-resize-handle yc-window-resize-' + dir;
                shell.appendChild(handle);

                var startX, startY, startWidth, startHeight, startLeft, startTop;
                var isResizing = false;

                var onMouseDown = (function (direction) {
                    return function (e) {
                        if (_this._state === 'maximized') return;
                        isResizing = true;
                        startX = e.clientX;
                        startY = e.clientY;
                        var rect = shell.getBoundingClientRect();
                        startWidth = rect.width;
                        startHeight = rect.height;
                        startLeft = rect.left;
                        startTop = rect.top;
                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                        e.preventDefault();
                    };
                })(dir);

                var onMouseMove = function (e) {
                    if (!isResizing) return;
                    var dx = e.clientX - startX;
                    var dy = e.clientY - startY;

                    if (dir.indexOf('e') >= 0) {
                        shell.style.width = Math.max(300, startWidth + dx) + 'px';
                    }
                    if (dir.indexOf('s') >= 0) {
                        shell.style.height = Math.max(200, startHeight + dy) + 'px';
                    }
                    if (dir.indexOf('w') >= 0) {
                        var newWidth = Math.max(300, startWidth - dx);
                        shell.style.width = newWidth + 'px';
                        shell.style.left = (startLeft + startWidth - newWidth) + 'px';
                    }
                    if (dir.indexOf('n') >= 0) {
                        var newHeight = Math.max(200, startHeight - dy);
                        shell.style.height = newHeight + 'px';
                        shell.style.top = (startTop + startHeight - newHeight) + 'px';
                    }

                    _this.innerResize();
                };

                var onMouseUp = function () {
                    isResizing = false;
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                handle.addEventListener('mousedown', onMouseDown);
                this._resize.handles.push({ el: handle, dir: dir });
            }
        },

        /**
         * 更新窗口尺寸
         * @private
         * @returns {void}
         */
        _updateSize: function () {
            this.shell.style.width = (typeof this._width === 'number' ? this._width + 'px' : this._width);
            this.shell.style.height = (typeof this._height === 'number' ? this._height + 'px' : this._height);
        },

        /**
         * 显示窗口
         * @public
         * @returns {void}
         */
        show: function () {
            if (this._visible) return;
            this._visible = true;

            if (!this.shell.parentNode) {
                document.body.appendChild(this.shell);
            }

            if (this._mask) {
                document.body.appendChild(this._mask);
                setTimeout(function () {
                    $e.fn.addClass(this._mask, 'yc-window-overlay-visible');
                }.bind(this), 10);
            }

            $e.fn.showElement(this.shell, true);
            this.onShow();
        },

        /**
         * 关闭窗口
         * @public
         * @returns {void}
         */
        close: function () {
            if (!this._visible) return;
            this._visible = false;

            $e.fn.showElement(this.shell, false);

            if (this._mask) {
                $e.fn.removeClass(this._mask, 'yc-window-overlay-visible');
                setTimeout(function () {
                    if (this._mask && this._mask.parentNode) {
                        this._mask.parentNode.removeChild(this._mask);
                    }
                }.bind(this), 300);
            }

            this.onClose();
        },

        /**
         * 最小化窗口
         * @public
         * @returns {void}
         */
        minimize: function () {
            if (this._state === 'minimized') {
                this.restore();
                return;
            }
            this._saveNormalState();
            this._state = 'minimized';
            $e.fn.addClass(this.shell, 'minimized');
            $e.fn.removeClass(this.shell, 'maximized');
            this.onMinimize();
        },

        /**
         * 最大化窗口
         * @public
         * @returns {void}
         */
        maximize: function () {
            if (this._state === 'maximized') {
                this.restore();
                return;
            }
            this._saveNormalState();
            this._state = 'maximized';
            $e.fn.addClass(this.shell, 'maximized');
            $e.fn.removeClass(this.shell, 'minimized');
            this.onMaximize();
        },

        /**
         * 还原窗口
         * @public
         * @returns {void}
         */
        restore: function () {
            if (this._state === 'normal') return;
            this._state = 'normal';
            $e.fn.removeClass(this.shell, 'minimized');
            $e.fn.removeClass(this.shell, 'maximized');

            if (this._normalState) {
                this.shell.style.width = this._normalState.width;
                this.shell.style.height = this._normalState.height;
                this.shell.style.top = this._normalState.top;
                this.shell.style.left = this._normalState.left;
                this.shell.style.transform = this._normalState.transform;
            }

            this.onRestore();
        },

        /**
         * 保存正常状态
         * @private
         * @returns {void}
         */
        _saveNormalState: function () {
            if (this._state !== 'normal') return;
            var style = window.getComputedStyle(this.shell);
            this._normalState = {
                width: style.width,
                height: style.height,
                top: style.top,
                left: style.left,
                transform: style.transform
            };
        },

        /**
         * 设置标题
         * @public
         * @param {string} title 标题文本
         * @returns {void}
         */
        setTitle: function (title) {
            this._title = title;
            if (this.header) {
                var titleEl = this.header.querySelector('.yc-window-title');
                if (titleEl) {
                    titleEl.innerText = title;
                }
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
         * 内部调整大小
         * @public
         * @returns {void}
         */
        innerResize: function () {
            if (this.body) {
                var headerHeight = this.header ? this.header.offsetHeight : 0;
                var footerHeight = this.footer ? this.footer.offsetHeight : 0;
                var shellHeight = this.shell.offsetHeight;
                this.body.style.height = (shellHeight - headerHeight - footerHeight) + 'px';
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
         * 显示回调
         * @protected
         * @returns {void}
         */
        onShow: function () {
        },

        /**
         * 关闭回调
         * @protected
         * @returns {void}
         */
        onClose: function () {
        },

        /**
         * 最小化回调
         * @protected
         * @returns {void}
         */
        onMinimize: function () {
        },

        /**
         * 最大化回调
         * @protected
         * @returns {void}
         */
        onMaximize: function () {
        },

        /**
         * 还原回调
         * @protected
         * @returns {void}
         */
        onRestore: function () {
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this.close();
            if (this._drag) {
                this._drag.release();
                this._drag = null;
            }
            if (this._resize) {
                this._resize.release();
                this._resize = null;
            }
            if (this._mask && this._mask.parentNode) {
                this._mask.parentNode.removeChild(this._mask);
            }
            this._mask = null;
            this._minBtn = null;
            this._maxBtn = null;
            this._closeBtn = null;
            this.body = null;
            this.header = null;
            this.footer = null;
            this._events = null;
        }
    };

    var plugin = {
        /**
         * 创建WindowView实例
         * @public
         * @param {Object} options 配置项
         * @returns {WindowView} WindowView实例
         */
        create: function (options) {
            return new WindowView(options);
        }
    };

    $e.ui.addViewPlugin('view_window', plugin);
}($e);