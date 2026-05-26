+function($e) {

    function PopoverView(options) {
        this.props = options;
        // 触发方式: click/hover/focus
        this._trigger = options["trigger"] || "click";
        // 弹出位置: top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end
        this._placement = options["placement"] || "bottom";
        // 标题
        this._title = options["title"] || "";
        // 内容
        this._content = options["content"] || "";
        // 是否可见
        this._visible = false;
        // 目标元素
        this._reference = options["reference"] || null;
        // 主题: dark/light 或 primary/success/warning/danger
        this._effect = options["effect"] || "light";
    }

    PopoverView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_popover',
        body: null,
        _reference: null,
        _trigger: 'click',
        _placement: 'bottom',
        _title: '',
        _content: '',
        _visible: false,
        _effect: 'light',
        _arrow: null,
        _events: null,
        _timer: null,

        /**
         * 初始化气泡卡片组件
         */
        init: function() {
            this.body = this.shell.querySelector("[view-area='body']") || this.shell.querySelector(".yc-popover-content");

            // 设置主题效果
            this._updateEffect();

            // 设置标题
            if (this._title) {
                this.setTitle(this._title);
            }

            // 设置内容
            if (this._content) {
                this.setContent(this._content);
            }

            // 创建箭头
            this._createArrow();

            // 绑定触发事件
            this._bindTriggerEvents();

            // 默认隐藏
            if (!this.shell.parentNode) {
                $e.fn.showElement(this.shell, false);
            }

            this._events = [];
            this.inited();
        },

        /**
         * 更新主题效果
         */
        _updateEffect: function() {
            var effects = ["dark", "primary", "success", "warning", "danger"];
            for (var i = 0; i < effects.length; i++) {
                $e.fn.removeClass(this.shell, "yc-popover-" + effects[i]);
            }
            if (this._effect && this._effect !== "light") {
                $e.fn.addClass(this.shell, "yc-popover-" + this._effect);
            }
        },

        /**
         * 创建箭头元素
         */
        _createArrow: function() {
            this._arrow = document.createElement("div");
            this._arrow.className = "yc-popover-arrow yc-popover-arrow-" + this._placement;
            this.shell.appendChild(this._arrow);
        },

        /**
         * 绑定触发事件
         */
        _bindTriggerEvents: function() {
            var ref = this._getReference();
            if (!ref) return;

            if (this._trigger === "click") {
                this.bindListen($e.events.regEvent(ref, 'click', this, this.toggle));
                // 点击外部关闭
                this.bindListen($e.events.regEvent(document, 'click', this, this._onDocumentClick));
            } else if (this._trigger === "hover") {
                this.bindListen($e.events.regEvent(ref, 'mouseenter', this, this.show));
                this.bindListen($e.events.regEvent(ref, 'mouseleave', this, this._onMouseLeave));
                this.bindListen($e.events.regEvent(this.shell, 'mouseenter', this, this._onPopoverEnter));
                this.bindListen($e.events.regEvent(this.shell, 'mouseleave', this, this._onPopoverLeave));
            } else if (this._trigger === "focus") {
                this.bindListen($e.events.regEvent(ref, 'focus', this, this.show));
                this.bindListen($e.events.regEvent(ref, 'blur', this, this.hide));
            }
        },

        /**
         * 获取目标元素
         * @returns {HTMLElement} 目标元素
         */
        _getReference: function() {
            if (this._reference) {
                if (typeof this._reference === 'string') {
                    return document.querySelector(this._reference);
                }
                return this._reference;
            }
            return null;
        },

        /**
         * 文档点击事件处理
         * @param {Event} e 事件对象
         */
        _onDocumentClick: function(e) {
            var ref = this._getReference();
            if (!ref) return;
            if (this._visible && !this.shell.contains(e.target) && !ref.contains(e.target)) {
                this.hide();
            }
        },

        /**
         * 鼠标离开参考元素
         */
        _onMouseLeave: function() {
            this._timer = setTimeout(function() {
                this.hide();
            }.bind(this), 200);
        },

        /**
         * 鼠标进入弹出层
         */
        _onPopoverEnter: function() {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
        },

        /**
         * 鼠标离开弹出层
         */
        _onPopoverLeave: function() {
            this.hide();
        },

        /**
         * 显示弹出层
         */
        show: function() {
            if (this._visible) return;
            this._visible = true;

            var ref = this._getReference();
            if (!ref) return;

            if (!this.shell.parentNode) {
                document.body.appendChild(this.shell);
            }

            // 定位
            this._updatePosition(ref);

            $e.fn.showElement(this.shell, true);
            setTimeout(function() {
                $e.fn.addClass(this.shell, "yc-popover--visible");
            }.bind(this), 10);

            this.onShow();
        },

        /**
         * 隐藏弹出层
         */
        hide: function() {
            if (!this._visible) return;
            this._visible = false;

            $e.fn.removeClass(this.shell, "yc-popover--visible");

            setTimeout(function() {
                if (!this._visible) {
                    $e.fn.showElement(this.shell, false);
                }
            }.bind(this), 200);

            this.onHide();
        },

        /**
         * 切换显示状态
         */
        toggle: function() {
            if (this._visible) {
                this.hide();
            } else {
                this.show();
            }
        },

        /**
         * 更新弹出层位置
         * @param {HTMLElement} ref 参考元素
         */
        _updatePosition: function(ref) {
            var rect = ref.getBoundingClientRect();
            var popoverRect = this.shell.getBoundingClientRect();
            var placement = this._placement;
            var top, left;

            switch (placement) {
                case 'top':
                    top = rect.top - popoverRect.height - 8;
                    left = rect.left + (rect.width - popoverRect.width) / 2;
                    break;
                case 'top-start':
                    top = rect.top - popoverRect.height - 8;
                    left = rect.left;
                    break;
                case 'top-end':
                    top = rect.top - popoverRect.height - 8;
                    left = rect.right - popoverRect.width;
                    break;
                case 'bottom':
                    top = rect.bottom + 8;
                    left = rect.left + (rect.width - popoverRect.width) / 2;
                    break;
                case 'bottom-start':
                    top = rect.bottom + 8;
                    left = rect.left;
                    break;
                case 'bottom-end':
                    top = rect.bottom + 8;
                    left = rect.right - popoverRect.width;
                    break;
                case 'left':
                    top = rect.top + (rect.height - popoverRect.height) / 2;
                    left = rect.left - popoverRect.width - 8;
                    break;
                case 'left-start':
                    top = rect.top;
                    left = rect.left - popoverRect.width - 8;
                    break;
                case 'left-end':
                    top = rect.bottom - popoverRect.height;
                    left = rect.left - popoverRect.width - 8;
                    break;
                case 'right':
                    top = rect.top + (rect.height - popoverRect.height) / 2;
                    left = rect.right + 8;
                    break;
                case 'right-start':
                    top = rect.top;
                    left = rect.right + 8;
                    break;
                case 'right-end':
                    top = rect.bottom - popoverRect.height;
                    left = rect.right + 8;
                    break;
                default:
                    top = rect.bottom + 8;
                    left = rect.left;
            }

            // 边界检查
            var winWidth = window.innerWidth;
            var winHeight = window.innerHeight;
            if (left < 10) left = 10;
            if (left + popoverRect.width > winWidth - 10) left = winWidth - popoverRect.width - 10;
            if (top < 10) top = 10;
            if (top + popoverRect.height > winHeight - 10) top = winHeight - popoverRect.height - 10;

            this.shell.style.top = top + "px";
            this.shell.style.left = left + "px";

            // 更新箭头位置
            if (this._arrow) {
                this._arrow.className = "yc-popover-arrow yc-popover-arrow-" + placement;
            }
        },

        /**
         * 设置标题
         * @param {string} title 标题文本
         */
        setTitle: function(title) {
            this._title = title;
            var titleEl = this.shell.querySelector(".yc-popover-title");
            if (titleEl) {
                titleEl.innerText = title;
            }
        },

        /**
         * 设置内容
         * @param {string} content 内容文本
         */
        setContent: function(content) {
            this._content = content;
            if (this.body) {
                this.body.innerHTML = content;
            }
        },

        /**
         * 设置弹出位置
         * @param {string} placement 位置
         */
        setPlacement: function(placement) {
            this._placement = placement;
            if (this._visible) {
                var ref = this._getReference();
                if (ref) {
                    this._updatePosition(ref);
                }
            }
        },

        /**
         * 判断是否可见
         * @returns {boolean} 是否可见
         */
        isVisible: function() {
            return this._visible;
        },

        /**
         * 显示回调
         */
        onShow: function() {
        },

        /**
         * 隐藏回调
         */
        onHide: function() {
        },

        /**
         * 释放对象
         */
        selfRelease: function() {
            this.hide();
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            if (this._arrow && this._arrow.parentNode) {
                this._arrow.parentNode.removeChild(this._arrow);
            }
            this._arrow = null;
            this.body = null;
            this._events = null;
        }
    };

    var plugin = {
        create: function(options) {
            return new PopoverView(options);
        }
    };

    $e.ui.addViewPlugin("view_popover", plugin);

}($e);
