/**
 * @file 地图组件
 * @description 提供地图展示功能，支持标记点添加、点击事件等操作
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * MapView 地图组件
     * 提供地图展示功能，支持标记点添加、点击事件等操作
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.provider='default'] - 地图提供商
     * @param {Array} [options.center] - 中心点坐标 [lat, lng]
     * @param {number} [options.zoom] - 缩放级别
     * @param {Array} [options.markers=[]] - 标记点数组
     * @param {Function} [options.onClick] - 地图点击回调
     * @param {Function} [options.onMarkerClick] - 标记点点击回调
     */
    function MapView(options) {
        this.props = options;
        this.markers = [];
        this._listeners = [];
    }

    MapView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_map',
        body: null,
        shell: null,
        markers: null,
        _listeners: null,
        _mapInstance: null,
        _container: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildMap();
            this.inited();
        },

        /**
         * 构建地图
         * @private
         * @returns {void}
         */
        buildMap: function () {
            var options = this.props;
            var provider = options.provider || 'default';
            $e.fn.addClass(this.shell, 'yc-map');
            $e.fn.addClass(this.shell, 'yc-map--' + provider);
            this._container = $e.fn.create('div');
            $e.fn.addClass(this._container, 'yc-map__container');
            this.getBody().appendChild(this._container);
            if (options.center && options.zoom) {
                this.loadMap(options.center, options.zoom);
            }
            if (options.markers instanceof Array) {
                for (var i = 0; i < options.markers.length; i++) {
                    this.addMarker(options.markers[i]);
                }
            }
        },

        /**
         * 加载地图
         * @private
         * @param {Array} center - 中心点坐标
         * @param {number} zoom - 缩放级别
         * @returns {void}
         */
        loadMap: function (center, zoom) {
            var self = this;
            this._container.innerHTML = '';
            var mapContent = $e.fn.create('div');
            mapContent.style.width = '100%';
            mapContent.style.height = '100%';
            mapContent.style.background = '#e8e8e8';
            mapContent.style.display = 'flex';
            mapContent.style.alignItems = 'center';
            mapContent.style.justifyContent = 'center';
            mapContent.innerHTML = '<div style="text-align:center;color:#999;"><div style="font-size:48px;margin-bottom:10px;">&#127758;</div><div>Map Placeholder</div><div>Center: ' + center.join(', ') + ', Zoom: ' + zoom + '</div></div>';
            this._container.appendChild(mapContent);
            this._mapInstance = {
                center: center,
                zoom: zoom,
                container: mapContent
            };
            this.bindListen($e.events.regEvent(this._container, 'click', this, function (e) {
                if (self.props.onClick) {
                    self.props.onClick(e);
                }
            }));
        },

        /**
         * 添加标记点
         * @public
         * @param {Object} markerOptions - 标记点配置
         * @returns {HTMLElement} 标记点元素
         */
        addMarker: function (markerOptions) {
            var marker = $e.fn.create('div');
            $e.fn.addClass(marker, 'yc-map__marker');
            if (markerOptions.type) {
                $e.fn.addClass(marker, 'yc-map__marker--' + markerOptions.type);
            }
            marker.style.left = (markerOptions.x || 50) + '%';
            marker.style.top = (markerOptions.y || 50) + '%';
            var icon = $e.fn.create('div');
            $e.fn.addClass(icon, 'yc-map__marker-icon');
            icon.innerHTML = markerOptions.icon || '&#128204;';
            marker.appendChild(icon);
            if (markerOptions.label) {
                var label = $e.fn.create('div');
                $e.fn.addClass(label, 'yc-map__marker-label');
                label.innerHTML = markerOptions.label;
                marker.appendChild(label);
            }
            if (markerOptions.popup) {
                var popup = $e.fn.create('div');
                $e.fn.addClass(popup, 'yc-map__popup');
                popup.innerHTML = markerOptions.popup;
                marker.appendChild(popup);
                var self = this;
                this.bindListen($e.events.regEvent(marker, 'mouseenter', this, function () {
                    $e.fn.addClass(popup, 'yc-map__popup--show');
                }));
                this.bindListen($e.events.regEvent(marker, 'mouseleave', this, function () {
                    $e.fn.removeClass(popup, 'yc-map__popup--show');
                }));
            }
            var self = this;
            this.bindListen($e.events.regEvent(marker, 'click', this, function (e) {
                e.stopPropagation();
                if (self.props.onMarkerClick) {
                    self.props.onMarkerClick(markerOptions, marker);
                }
            }));
            this._container.appendChild(marker);
            this.markers.push({ el: marker, data: markerOptions });
            return marker;
        },

        /**
         * 移除标记点
         * @public
         * @param {HTMLElement} marker - 标记点元素
         * @returns {void}
         */
        removeMarker: function (marker) {
            var index = this.markers.findIndex(function (m) { return m.el === marker; });
            if (index >= 0) {
                this._container.removeChild(marker);
                this.markers.splice(index, 1);
            }
        },

        /**
         * 清除所有标记点
         * @public
         * @returns {void}
         */
        clearMarkers: function () {
            for (var i = this.markers.length - 1; i >= 0; i--) {
                this._container.removeChild(this.markers[i].el);
            }
            this.markers = [];
        },

        /**
         * 设置中心点
         * @public
         * @param {Array} center - 中心点坐标
         * @returns {void}
         */
        setCenter: function (center) {
            if (this._mapInstance) {
                this._mapInstance.center = center;
                this.loadMap(center, this._mapInstance.zoom);
            }
        },

        /**
         * 设置缩放级别
         * @public
         * @param {number} zoom - 缩放级别
         * @returns {void}
         */
        setZoom: function (zoom) {
            if (this._mapInstance) {
                this._mapInstance.zoom = zoom;
                this.loadMap(this._mapInstance.center, zoom);
            }
        },

        /**
         * 获取body元素
         * @protected
         * @returns {HTMLElement} body元素
         */
        getBody: function () {
            return this.body;
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this.markers = null;
            this._mapInstance = null;
            this._container = null;
            this.body = null;
        },

        /**
         * 调整大小
         * @public
         * @param {Object} options - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {}
    };

    var plugin = {
        create: function (options) {
            return new MapView(options);
        }
    };

    $e.ui.addViewPlugin('view_map', plugin);
}($e);