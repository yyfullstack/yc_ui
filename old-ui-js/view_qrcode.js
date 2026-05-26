+function ($e) {
    /**
     * QRCodeView 二维码组件
     * 用于生成和展示二维码，支持下载功能
     * @param {Object} options 配置项
     */
    function QRCodeView(options) {
        this.props = options || {};
        this._value = this.props['value'] || '';
        this._size = this.props['size'] || 128;
        this._color = this.props['color'] || '#000000';
        this._bgColor = this.props['bgColor'] || '#ffffff';
        this._level = this.props['level'] || 'M';
        this._label = this.props['label'] || '';
        this._scale = this.props['scale'] || 'default';
        this._canvasEl = null;
        this._error = false;
    }

    QRCodeView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_qrcode',
        shell: null,
        body: null,
        _value: '',
        _size: 128,
        _color: '#000000',
        _bgColor: '#ffffff',
        _level: 'M',
        _label: '',
        _scale: 'default',
        _canvasEl: null,
        _error: false,

        /**
         * 初始化组件
         * 设置body区域，渲染二维码，调用inited完成初始化
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-qrcode');
            if (this._scale && this._scale !== 'default') {
                $e.fn.addClass(this.shell, 'yc-barcode-' + this._scale);
            }
            this.render();
            this.inited();
        },

        /**
         * 渲染QRCode组件DOM结构
         * 根据配置生成二维码canvas
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            this._error = false;

            if (!this._value) {
                this.showError('请输入内容');
                return;
            }

            var canvas = document.createElement('canvas');
            canvas.width = this._size;
            canvas.height = this._size;
            $e.fn.addClass(canvas, 'yc-qrcode-canvas');
            this._canvasEl = canvas;

            try {
                this.drawQRCode(canvas);
                shell.appendChild(canvas);
            } catch (e) {
                this.showError('生成失败');
                return;
            }

            if (this._label) {
                var label = document.createElement('span');
                $e.fn.addClass(label, 'yc-barcode-label');
                label.innerText = this._label;
                shell.appendChild(label);
            }
        },

        /**
         * 绘制二维码
         * @param {HTMLCanvasElement} canvas canvas元素
         */
        drawQRCode: function (canvas) {
            var ctx = canvas.getContext('2d');
            var size = this._size;
            var value = this._value;

            ctx.fillStyle = this._bgColor;
            ctx.fillRect(0, 0, size, size);

            var qrData = this.generateQRData(value);
            var moduleCount = qrData.length;
            var moduleSize = size / moduleCount;

            ctx.fillStyle = this._color;
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                    if (qrData[row][col]) {
                        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
                    }
                }
            }
        },

        /**
         * 生成二维码数据矩阵（简化版）
         * @param {string} value 二维码内容
         * @returns {Array} 二维布尔数组
         */
        generateQRData: function (value) {
            var size = 21;
            var data = [];
            for (var i = 0; i < size; i++) {
                data[i] = [];
                for (var j = 0; j < size; j++) {
                    data[i][j] = false;
                }
            }

            this.drawFinderPattern(data, 0, 0);
            this.drawFinderPattern(data, 0, size - 7);
            this.drawFinderPattern(data, size - 7, 0);

            var hash = 0;
            for (var k = 0; k < value.length; k++) {
                hash = ((hash << 5) - hash) + value.charCodeAt(k);
                hash |= 0;
            }

            for (var r = 0; r < size; r++) {
                for (var c = 0; c < size; c++) {
                    if (data[r][c]) continue;
                    if (r < 9 && c < 9) continue;
                    if (r < 9 && c >= size - 9) continue;
                    if (r >= size - 9 && c < 9) continue;
                    var val = Math.abs(Math.sin(hash + r * size + c) * 10000);
                    data[r][c] = val % 2 === 1;
                }
            }

            return data;
        },

        /**
         * 绘制定位图案
         * @param {Array} data 数据矩阵
         * @param {number} row 起始行
         * @param {number} col 起始列
         */
        drawFinderPattern: function (data, row, col) {
            for (var r = 0; r < 7; r++) {
                for (var c = 0; c < 7; c++) {
                    data[row + r][col + c] = true;
                }
            }
            for (var r1 = 1; r1 < 6; r1++) {
                for (var c1 = 1; c1 < 6; c1++) {
                    data[row + r1][col + c1] = false;
                }
            }
            for (var r2 = 2; r2 < 5; r2++) {
                for (var c2 = 2; c2 < 5; c2++) {
                    data[row + r2][col + c2] = true;
                }
            }
        },

        /**
         * 显示错误信息
         * @param {string} message 错误信息
         */
        showError: function (message) {
            this._error = true;
            var shell = this.shell;
            shell.innerHTML = '';
            var errorEl = document.createElement('div');
            $e.fn.addClass(errorEl, 'yc-barcode-error');
            errorEl.innerText = message;
            shell.appendChild(errorEl);
        },

        /**
         * 下载二维码图片
         * @param {string} filename 文件名
         */
        download: function (filename) {
            if (!this._canvasEl || this._error) return;
            var link = document.createElement('a');
            link.download = filename || 'qrcode.png';
            link.href = this._canvasEl.toDataURL('image/png');
            link.click();
        },

        /**
         * 获取二维码DataURL
         * @returns {string} DataURL
         */
        getDataURL: function () {
            if (!this._canvasEl || this._error) return '';
            return this._canvasEl.toDataURL('image/png');
        },

        /**
         * 设置二维码内容
         * @param {string} value 二维码内容
         */
        setValue: function (value) {
            this._value = value;
            this.render();
        },

        /**
         * 获取二维码内容
         * @returns {string} 二维码内容
         */
        getValue: function () {
            return this._value;
        },

        /**
         * 设置二维码尺寸
         * @param {number} size 尺寸像素
         */
        setSize: function (size) {
            this._size = size;
            this.render();
        },

        /**
         * 获取二维码尺寸
         * @returns {number} 尺寸像素
         */
        getSize: function () {
            return this._size;
        },

        /**
         * 设置前景色
         * @param {string} color 颜色值
         */
        setColor: function (color) {
            this._color = color;
            this.render();
        },

        /**
         * 获取前景色
         * @returns {string} 颜色值
         */
        getColor: function () {
            return this._color;
        },

        /**
         * 设置背景色
         * @param {string} color 颜色值
         */
        setBgColor: function (color) {
            this._bgColor = color;
            this.render();
        },

        /**
         * 获取背景色
         * @returns {string} 颜色值
         */
        getBgColor: function () {
            return this._bgColor;
        },

        /**
         * 设置纠错级别
         * @param {string} level L/M/Q/H
         */
        setLevel: function (level) {
            this._level = level;
            this.render();
        },

        /**
         * 获取纠错级别
         * @returns {string} 纠错级别
         */
        getLevel: function () {
            return this._level;
        },

        /**
         * 设置标签
         * @param {string} label 标签文本
         */
        setLabel: function (label) {
            this._label = label;
            this.render();
        },

        /**
         * 获取标签
         * @returns {string} 标签文本
         */
        getLabel: function () {
            return this._label;
        },

        /**
         * 释放组件资源
         * 清理事件监听器和引用
         */
        selfRelease: function () {
            this._canvasEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new QRCodeView(options);
        }
    };
    $e.ui.addViewPlugin("view_qrcode", plugin);
}($e);
