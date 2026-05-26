/**
 * @file WebSocket通信模块
 * @description 提供WebSocket连接管理、心跳检测、消息解析等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * WebSocket连接类
     * @class
     */
    function MySocket() {
    }

    MySocket.prototype = {
        /** @type {string|null} WebSocket连接地址 */
        url: null,
        /** @type {WebSocket|null} WebSocket实例 */
        socket: null,
        /** @type {string|null} 连接密钥 */
        key: null,
        /** @type {number|null} 心跳定时器句柄 */
        timeHandle: null,
        /** @type {boolean} 重连状态 */
        status: false,
        /** @type {number} 超时时间(毫秒) */
        timeout: 30 * 1000,
        /** @type {Object|null} 上下文对象 */
        context: null,

        /**
         * 初始化WebSocket连接
         * @public
         * @param {Object} options - 配置选项
         * @param {string} options.url - WebSocket连接地址
         * @param {string} options.key - 连接密钥
         */
        init: function (options) {
            $e.fn.extend(options, this, true);
            if ('WebSocket' in window) {
                this.socket = new WebSocket(this.url);
            } else if ('MozWebSocket' in window) {
                this.socket = new MozWebSocket(this.url);
            } else {
                // 浏览器不支持WebSocket
                return;
            }
            var ws = this;
            ws.socket.onclose = function () {
                clearTimeout(ws.timeHandle);
            };
            ws.socket.onerror = function () {
                ws.reconnect();
            };
            ws.socket.onopen = function () {
                ws.socket.send(ws.key);
            };
            ws.socket.onmessage = function (event) {
                ws.parseData(event.data);
            };
            this.start();
        },

        /**
         * 解析接收到的数据
         * @public
         * @param {string} text - 接收到的文本数据
         */
        parseData: function (text) {
            if (text && text !== 'ok') {
                $e.loadData(text);
            }
        },

        /**
         * 启动心跳检测
         * @public
         */
        start: function () {
            if (this.timeHandle) {
                clearTimeout(this.timeHandle);
                this.timeHandle = null;
            }
            var that = this;
            this.timeHandle = setTimeout(function () {
                that.socket.send('HeartBeat');
                that.start();
            }, 20000);
        },

        /**
         * 重新连接
         * @public
         */
        reconnect: function () {
            if (!this.status) {
                this.status = true;
                // 没连接上会一直重连，设置延迟避免请求过多
                var that = this;
                setTimeout(function () {
                    that.status = false;
                    that.init();
                }, 20000);
            }
        }
    };

    /** @type {MySocket} WebSocket实例 */
    $e.socket = new MySocket();

}($e);
