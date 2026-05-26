+function ($e) {
    function ScrollbarView(options) {
        this.props = options;
        this._listeners = [];
    }
    ScrollbarView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_scrollbar',
        body: null,
        shell: null,
        _wrap: null,
        _barV: null,
        _barH: null,
        _thumbV: null,
        _thumbH: null,
        _listeners: null,
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildScrollbar();
            this.inited();
        },
        buildScrollbar: function () {
            var options = this.props;
            var size = options.size || 'default';
            var always = options.always || false;
            $e.fn.addClass(this.shell, 'yc-scrollbar');
            if (size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-scrollbar--' + size);
            }
            if (always) {
                $e.fn.addClass(this.shell, 'yc-scrollbar--always');
            }
            this._wrap = $e.fn.create('div');
            $e.fn.addClass(this._wrap, 'yc-scrollbar__wrap');
            while (this.body.firstChild) {
                this._wrap.appendChild(this.body.firstChild);
            }
            this.body.appendChild(this._wrap);
            this._barV = $e.fn.create('div');
            $e.fn.addClass(this._barV, 'yc-scrollbar__bar');
            $e.fn.addClass(this._barV, 'yc-scrollbar__bar--vertical');
            this._thumbV = $e.fn.create('div');
            $e.fn.addClass(this._thumbV, 'yc-scrollbar__thumb');
            $e.fn.addClass(this._thumbV, 'yc-scrollbar__thumb--vertical');
            this._barV.appendChild(this._thumbV);
            this.body.appendChild(this._barV);
            this._barH = $e.fn.create('div');
            $e.fn.addClass(this._barH, 'yc-scrollbar__bar');
            $e.fn.addClass(this._barH, 'yc-scrollbar__bar--horizontal');
            this._thumbH = $e.fn.create('div');
            $e.fn.addClass(this._thumbH, 'yc-scrollbar__thumb');
            $e.fn.addClass(this._thumbH, 'yc-scrollbar__thumb--horizontal');
            this._barH.appendChild(this._thumbH);
            this.body.appendChild(this._barH);
            this.bindEvents();
            this.updateThumb();
        },
        bindEvents: function () {
            var self = this;
            this._listeners.push($e.events.regEvent(this._wrap, 'scroll', this, function () {
                self.updateThumb();
            }));
            this.bindListen(this._listeners[0]);
            this._listeners.push($e.events.regEvent(this._thumbV, 'mousedown', this, function (e) {
                self.onThumbMouseDown(e, 'vertical');
            }));
            this.bindListen(this._listeners[1]);
            this._listeners.push($e.events.regEvent(this._thumbH, 'mousedown', this, function (e) {
                self.onThumbMouseDown(e, 'horizontal');
            }));
            this.bindListen(this._listeners[2]);
        },
        updateThumb: function () {
            var wrap = this._wrap;
            var sh = wrap.scrollHeight;
            var ch = wrap.clientHeight;
            var sw = wrap.scrollWidth;
            var cw = wrap.clientWidth;
            if (sh > ch) {
                var thumbHeight = Math.max((ch / sh) * ch, 20);
                var thumbTop = (wrap.scrollTop / (sh - ch)) * (ch - thumbHeight);
                this._thumbV.style.height = thumbHeight + 'px';
                this._thumbV.style.top = thumbTop + 'px';
                this._barV.style.display = 'block';
            } else {
                this._barV.style.display = 'none';
            }
            if (sw > cw) {
                var thumbWidth = Math.max((cw / sw) * cw, 20);
                var thumbLeft = (wrap.scrollLeft / (sw - cw)) * (cw - thumbWidth);
                this._thumbH.style.width = thumbWidth + 'px';
                this._thumbH.style.left = thumbLeft + 'px';
                this._barH.style.display = 'block';
            } else {
                this._barH.style.display = 'none';
            }
        },
        onThumbMouseDown: function (e, direction) {
            e.preventDefault();
            var self = this;
            var startY = e.clientY;
            var startX = e.clientX;
            var startTop = this._thumbV.offsetTop;
            var startLeft = this._thumbH.offsetLeft;
            var onMouseMove = function (ev) {
                if (direction === 'vertical') {
                    var delta = ev.clientY - startY;
                    var newTop = startTop + delta;
                    var maxTop = self._barV.clientHeight - self._thumbV.clientHeight;
                    newTop = Math.max(0, Math.min(newTop, maxTop));
                    var ratio = newTop / maxTop;
                    self._wrap.scrollTop = ratio * (self._wrap.scrollHeight - self._wrap.clientHeight);
                } else {
                    var delta = ev.clientX - startX;
                    var newLeft = startLeft + delta;
                    var maxLeft = self._barH.clientWidth - self._thumbH.clientWidth;
                    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
                    var ratio = newLeft / maxLeft;
                    self._wrap.scrollLeft = ratio * (self._wrap.scrollWidth - self._wrap.clientWidth);
                }
                self.updateThumb();
            };
            var onMouseUp = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        scrollTo: function (top, left) {
            if (top !== undefined) {
                this._wrap.scrollTop = top;
            }
            if (left !== undefined) {
                this._wrap.scrollLeft = left;
            }
            this.updateThumb();
        },
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this._wrap = null;
            this._barV = null;
            this._barH = null;
            this._thumbV = null;
            this._thumbH = null;
            this.body = null;
        },
        resize: function (options) {
            this.updateThumb();
        }
    };
    var plugin = {
        create: function (options) {
            return new ScrollbarView(options);
        }
    };
    $e.ui.addViewPlugin("view_scrollbar", plugin);
}($e);
