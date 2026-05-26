/**
 * @file 进度条组件
 * @description 用于展示操作进度，支持线性进度条和环形进度条两种模式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 进度条组件构造函数
     * @class ProgressView
     * @param {Object} options - 配置选项
     * @param {number} [options.percent=0] - 进度百分比(0-100)
     * @param {string} [options.status='normal'] - 状态：normal/success/exception
     * @param {string} [options.type='line'] - 类型：line/circle
     * @param {boolean} [options.showInfo=true] - 是否显示进度信息
     * @param {number} [options.strokeWidth=8] - 描边宽度（环形模式）
     * @param {number} [options.width=120] - 环形尺寸（环形模式）
     */
    function ProgressView(options) {
        this.props = options || {};
        this._percent = this.props['percent'] || 0;
        this._status = this.props['status'] || 'normal';
        this._type = this.props['type'] || 'line';
        this._showInfo = $e.fn.getBoolean(this.props['showInfo'], true);
        this._strokeWidth = this.props['strokeWidth'] || 8;
        this._width = this.props['width'] || 120;
    }

    ProgressView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_progress',
        shell: null,
        body: null,
        _percent: 0,
        _status: 'normal',
        _type: 'line',
        _showInfo: true,
        _strokeWidth: 8,
        _width: 120,
        _textEl: null,
        _bgEl: null,

        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-progress');
            this.render();
            this.inited();
        },

        render: function () {
            var self = this;
            var shell = self.shell;
            shell.textContent = '';

            $e.fn.removeClass(shell, 'yc-progress-success');
            $e.fn.removeClass(shell, 'yc-progress-exception');

            if (self._status === 'success') {
                $e.fn.addClass(shell, 'yc-progress-success');
            } else if (self._status === 'exception') {
                $e.fn.addClass(shell, 'yc-progress-exception');
            }

            if (self._type === 'circle') {
                self.renderCircle();
            } else {
                self.renderLine();
            }
        },

        renderLine: function () {
            var self = this;
            var shell = self.shell;
            $e.fn.addClass(shell, 'yc-progress-line');

            var outer = document.createElement('div');
            $e.fn.addClass(outer, 'yc-progress-outer');

            var inner = document.createElement('div');
            $e.fn.addClass(inner, 'yc-progress-inner');
            inner.style.height = self._strokeWidth + 'px';

            var bg = document.createElement('div');
            $e.fn.addClass(bg, 'yc-progress-bg');
            bg.style.width = self._percent + '%';
            bg.style.height = self._strokeWidth + 'px';
            self._bgEl = bg;

            inner.appendChild(bg);
            outer.appendChild(inner);
            shell.appendChild(outer);

            if (self._showInfo) {
                var textEl = document.createElement('span');
                $e.fn.addClass(textEl, 'yc-progress-text');
                textEl.innerHTML = self.getStatusText();
                self._textEl = textEl;
                shell.appendChild(textEl);
            }
        },

        renderCircle: function () {
            var self = this;
            var shell = self.shell;
            var width = self._width;
            var strokeWidth = self._strokeWidth;
            var radius = (width - strokeWidth) / 2;
            var circumference = 2 * Math.PI * radius;
            var offset = circumference - (self._percent / 100) * circumference;

            var svgNS = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', width);
            svg.setAttribute('height', width);
            svg.style.transform = 'rotate(-90deg)';

            var track = document.createElementNS(svgNS, 'circle');
            track.setAttribute('cx', width / 2);
            track.setAttribute('cy', width / 2);
            track.setAttribute('r', radius);
            track.setAttribute('fill', 'none');
            track.setAttribute('stroke', 'var(--yc-border-color-split)');
            track.setAttribute('stroke-width', strokeWidth);

            var circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', width / 2);
            circle.setAttribute('cy', width / 2);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'var(--yc-primary-color)');
            circle.setAttribute('stroke-width', strokeWidth);
            circle.setAttribute('stroke-linecap', 'round');
            circle.setAttribute('stroke-dasharray', circumference);
            circle.setAttribute('stroke-dashoffset', offset);
            circle.style.transition = 'stroke-dashoffset var(--yc-transition-duration) var(--yc-transition-timing)';
            self._bgEl = circle;

            svg.appendChild(track);
            svg.appendChild(circle);
            shell.appendChild(svg);

            if (self._showInfo) {
                var textEl = document.createElement('span');
                $e.fn.addClass(textEl, 'yc-progress-text');
                textEl.style.position = 'absolute';
                textEl.style.top = '50%';
                textEl.style.left = '50%';
                textEl.style.transform = 'translate(-50%, -50%)';
                textEl.innerHTML = self.getStatusText();
                self._textEl = textEl;
                shell.appendChild(textEl);
            }
        },

        getStatusText: function () {
            if (this._status === 'success') {
                return '<i class="fa fa-check-circle"></i>';
            } else if (this._status === 'exception') {
                return '<i class="fa fa-close-circle"></i>';
            }
            return this._percent + '%';
        },

        setPercent: function (percent) {
            this._percent = Math.max(0, Math.min(100, percent));
            if (this._type === 'circle' && this._bgEl) {
                var width = this._width;
                var strokeWidth = this._strokeWidth;
                var radius = (width - strokeWidth) / 2;
                var circumference = 2 * Math.PI * radius;
                var offset = circumference - (this._percent / 100) * circumference;
                this._bgEl.setAttribute('stroke-dashoffset', offset);
            } else if (this._bgEl) {
                this._bgEl.style.width = this._percent + '%';
            }
            if (this._textEl) {
                this._textEl.innerHTML = this.getStatusText();
            }
            if (this._percent >= 100 && this._status === 'normal') {
                this.setStatus('success');
            }
        },

        getPercent: function () {
            return this._percent;
        },

        setStatus: function (status) {
            this._status = status;
            $e.fn.removeClass(this.shell, 'yc-progress-success');
            $e.fn.removeClass(this.shell, 'yc-progress-exception');
            if (status === 'success') {
                $e.fn.addClass(this.shell, 'yc-progress-success');
            } else if (status === 'exception') {
                $e.fn.addClass(this.shell, 'yc-progress-exception');
            }
            if (this._textEl) {
                this._textEl.innerHTML = this.getStatusText();
            }
        },

        getStatus: function () {
            return this._status;
        },

        setType: function (type) {
            this._type = type;
            this.render();
        },

        getType: function () {
            return this._type;
        },

        setShowInfo: function (show) {
            this._showInfo = show;
            this.render();
        },

        getShowInfo: function () {
            return this._showInfo;
        },

        selfRelease: function () {
            this._textEl = null;
            this._bgEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new ProgressView(options);
        }
    };
    $e.ui.addViewPlugin("view_progress", plugin);
}($e);