/**
 * @file 徽标数组件
 * @description 用于显示需要关注的消息数量或状态标记，支持数字、点状模式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 徽标数组件构造函数
     * @class BadgeView
     * @param {Object} options - 配置选项
     * @param {number} [options.count=0] - 徽标数值
     * @param {boolean} [options.dot=false] - 是否为点状模式
     * @param {string} [options.status=''] - 状态: success/warning/error/processing/default
     * @param {string} [options.text=''] - 文本内容
     * @param {number} [options.overflowCount=99] - 溢出显示数值
     * @param {Array} [options.offset=null] - 偏移量 [x, y]
     */
    function BadgeView(options) {
        this.props = options || {};
        this._count = this.props['count'] || 0;
        this._dot = $e.fn.getBoolean(this.props['dot'], false);
        this._status = this.props['status'] || '';
        this._text = this.props['text'] || '';
        this._overflowCount = this.props['overflowCount'] || 99;
        this._offset = this.props['offset'] || null;
    }

    BadgeView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_badge',
        shell: null,
        body: null,
        _count: 0,
        _dot: false,
        _status: '',
        _text: '',
        _overflowCount: 99,
        _offset: null,
        _badgeEl: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'badge');
            this.render();
            this.inited();
        },

        render: function () {
            var self = this;
            var shell = self.shell;

            var badgeEl = shell.querySelector('.badge-icon');
            if (!badgeEl) {
                badgeEl = document.createElement('span');
                $e.fn.addClass(badgeEl, 'badge-icon');
                shell.appendChild(badgeEl);
            }
            self._badgeEl = badgeEl;

            if (self._dot) {
                $e.fn.addClass(badgeEl, 'badge-dot');
                badgeEl.textContent = '';
            } else {
                $e.fn.removeClass(badgeEl, 'badge-dot');
                var displayCount = self._count;
                if (self._count > self._overflowCount) {
                    displayCount = self._overflowCount + '+';
                }
                badgeEl.textContent = displayCount;
            }

            if (self._status) {
                var statusColors = {
                    'success': 'var(--yc-success-color)',
                    'warning': 'var(--yc-warning-color)',
                    'error': 'var(--yc-error-color)',
                    'processing': 'var(--yc-primary-color)',
                    'default': 'var(--yc-border-color-base)'
                };
                var color = statusColors[self._status] || statusColors['default'];
                badgeEl.style.backgroundColor = color;
            }

            if (self._offset && self._offset instanceof Array && self._offset.length === 2) {
                badgeEl.style.transform = 'translate(' + self._offset[0] + 'px, ' + self._offset[1] + 'px)';
            }
        },

        setCount: function (count) {
            this._count = count;
            this.render();
        },

        getCount: function () {
            return this._count;
        },

        setDot: function (dot) {
            this._dot = dot;
            this.render();
        },

        isDot: function () {
            return this._dot;
        },

        setStatus: function (status) {
            this._status = status;
            this.render();
        },

        getStatus: function () {
            return this._status;
        },

        setText: function (text) {
            this._text = text;
            if (this._badgeEl) {
                this._badgeEl.textContent = text;
            }
        },

        getText: function () {
            return this._text;
        },

        setOffset: function (offset) {
            this._offset = offset;
            this.render();
        },

        show: function () {
            if (this._badgeEl) {
                $e.fn.removeClass(this._badgeEl, 'hide');
            }
        },

        hide: function () {
            if (this._badgeEl) {
                $e.fn.addClass(this._badgeEl, 'hide');
            }
        },

        selfRelease: function () {
            this._badgeEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new BadgeView(options);
        }
    };
    $e.ui.addViewPlugin("view_badge", plugin);
}($e);