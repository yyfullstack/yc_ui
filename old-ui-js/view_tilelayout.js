+function ($e) {
    function TileLayoutView(options) {
        this.props = options;
        this.tiles = [];
        this._listeners = [];
    }
    TileLayoutView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_tilelayout',
        body: null,
        shell: null,
        tiles: null,
        _listeners: null,
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildTileLayout();
            this.inited();
        },
        buildTileLayout: function () {
            var options = this.props;
            var responsive = options.responsive !== false;
            $e.fn.addClass(this.shell, 'yc-tilelayout');
            if (responsive) {
                $e.fn.addClass(this.shell, 'yc-tilelayout-responsive');
            }
            if (options.tiles instanceof Array) {
                for (var i = 0; i < options.tiles.length; i++) {
                    this.addTile(options.tiles[i]);
                }
            }
        },
        addTile: function (tileOptions) {
            var tile = $e.fn.create('div');
            var type = tileOptions.type || 'default';
            $e.fn.addClass(tile, 'yc-tilelayout-tile');
            if (type !== 'default') {
                $e.fn.addClass(tile, 'yc-tilelayout-tile-' + type);
            }
            var header = $e.fn.create('div');
            $e.fn.addClass(header, 'yc-tilelayout-tile-header');
            if (tileOptions.title) {
                header.innerHTML = '<span class="yc-tilelayout-tile-title-text">' + tileOptions.title + '</span>';
            }
            var controls = $e.fn.create('div');
            $e.fn.addClass(controls, 'yc-tilelayout-tile-controls');
            if (tileOptions.draggable) {
                var dragHandle = $e.fn.create('span');
                $e.fn.addClass(dragHandle, 'yc-tilelayout-tile-control');
                dragHandle.innerHTML = '&#x2195;';
                controls.appendChild(dragHandle);
                this.bindListen($e.events.regEvent(dragHandle, 'mousedown', this, function (e) {
                    this.onDragStart(e, tile);
                }));
            }
            if (tileOptions.closable) {
                var closeBtn = $e.fn.create('span');
                $e.fn.addClass(closeBtn, 'yc-tilelayout-tile-control');
                closeBtn.innerHTML = '&times;';
                var tileIndex = this.tiles.length;
                this.bindListen($e.events.regEvent(closeBtn, 'click', this, function () {
                    this.removeTile(tileIndex);
                }));
                controls.appendChild(closeBtn);
            }
            header.appendChild(controls);
            tile.appendChild(header);
            var content = $e.fn.create('div');
            $e.fn.addClass(content, 'yc-tilelayout-tile-content');
            if (tileOptions.content) {
                content.innerHTML = tileOptions.content;
            }
            tile.appendChild(content);
            if (tileOptions.resizable) {
                $e.fn.addClass(tile, 'yc-tilelayout-tile-resizable');
                var resizeHandle = $e.fn.create('div');
                $e.fn.addClass(resizeHandle, 'yc-tilelayout-tile-resize-handle');
                tile.appendChild(resizeHandle);
            }
            this.getBody().appendChild(tile);
            this.tiles.push(tile);
            return tile;
        },
        removeTile: function (index) {
            if (index >= 0 && index < this.tiles.length) {
                this.getBody().removeChild(this.tiles[index]);
                this.tiles.splice(index, 1);
                this.onTileChange();
            }
        },
        getTile: function (index) {
            return this.tiles[index];
        },
        onDragStart: function (e, tile) {
            e.preventDefault();
            var self = this;
            var startX = e.clientX;
            var startY = e.clientY;
            var rect = tile.getBoundingClientRect();
            var clone = tile.cloneNode(true);
            $e.fn.addClass(clone, 'is-dragging');
            clone.style.position = 'fixed';
            clone.style.width = rect.width + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            clone.style.zIndex = '9999';
            clone.style.opacity = '0.8';
            document.body.appendChild(clone);
            var originalNextSibling = tile.nextSibling;
            var originalParent = tile.parentNode;
            $e.fn.addClass(tile, 'is-dragging');
            var onMouseMove = function (ev) {
                var deltaX = ev.clientX - startX;
                var deltaY = ev.clientY - startY;
                clone.style.left = (rect.left + deltaX) + 'px';
                clone.style.top = (rect.top + deltaY) + 'px';
                var targetTile = self.findTileAtPosition(ev.clientX, ev.clientY, clone);
                if (targetTile) {
                    var targetIndex = self.tiles.indexOf(targetTile);
                    var cloneIndex = self.tiles.indexOf(tile);
                    if (targetIndex !== cloneIndex && targetIndex !== cloneIndex + 1) {
                        originalParent.insertBefore(tile, targetTile);
                        self.reorderTiles();
                    }
                }
            };
            var onMouseUp = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (clone.parentNode) {
                    clone.parentNode.removeChild(clone);
                }
                $e.fn.removeClass(tile, 'is-dragging');
                self.onTileChange();
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        findTileAtPosition: function (x, y, exclude) {
            for (var i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i] !== exclude) {
                    var rect = this.tiles[i].getBoundingClientRect();
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        return this.tiles[i];
                    }
                }
            }
            return null;
        },
        reorderTiles: function () {
            var newOrder = [];
            var children = this.getBody().children;
            for (var i = 0; i < children.length; i++) {
                if ($e.fn.hasClass(children[i], 'yc-tilelayout-tile')) {
                    newOrder.push(children[i]);
                }
            }
            this.tiles = newOrder;
        },
        onTileChange: function () {
        },
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this.tiles = null;
            this.body = null;
        },
        resize: function (options) {
        }
    };
    var plugin = {
        create: function (options) {
            return new TileLayoutView(options);
        }
    };
    $e.ui.addViewPlugin("view_tilelayout", plugin);
}($e);
