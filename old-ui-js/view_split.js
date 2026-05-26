/**
 * @file Split分割面板组件
 * @description 提供水平/垂直分割面板功能，支持拖拽调整分割条位置和收起/展开面板
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * SplitView 分割面板组件
     * 提供水平/垂直分割面板功能，支持拖拽调整分割条位置和收起/展开面板
     * @class
     * @param {Object} options - 配置选项
     * @param {Array} [options.children] - 子视图配置数组
     * @param {number} [options.barPosition=0] - 分割条位置
     */
    function SplitView(options) {
        this.props = options;
        this.parseChildren(options['children']);
    }

    SplitView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_split',
        _leftArea: null,
        _rightArea: null,
        _bandLine: null,
        _resizing: false,
        _startWH: 0,
        _startPageXY: 0,
        leftStatus: false,
        topStatus: false,
        barPosition: 0,
        layType: null,
        goToBtn: null,
        barHeight: 0,

        /**
         * 初始化分割面板组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector('[view-band="body"]') || this.shell;
            this._bandLine = this.body.querySelector('[view-band="line"]');
            this._leftArea = this.body.querySelector('[view-area="left"]');
            this._rightArea = this.body.querySelector('[view-area="right"]');
            this.goToBtn = this._bandLine.querySelector('I');

            this._bandLine.rsh = 'auto';

            if ($e.fn.hasClass(this.body, 'yc-view-split-horizontal')) {
                this.layType = true;
                this._leftArea.rsh = this._rightArea.rsh = '100%';
            } else {
                this.layType = false;
            }

            this._bandLine.re_id = $e.fn.nextID();
            this.goToBtn.re_id = $e.fn.nextID();

            this.bindListen($e.events.regEvent(this._bandLine, 'mousedown', this, this.start));
            this.bindListen($e.events.regEvent(document, 'mousemove', this, this.move));
            this.bindListen($e.events.regEvent(document, 'mouseup', this, this.end));

            this.initArea();
            this.buildChildren();
            this.setSplitBarPosition(this.props['barPosition']);
        },

        /**
         * 初始化区域
         * @private
         * @returns {void}
         */
        initArea: function () {
            if (this._bandLine) {
                var lineStyle = $e.fn.getStyle(this._bandLine);
                this.barHeight = parseInt(lineStyle.height) || 8;
            }
        },

        /**
         * 开始拖拽
         * @private
         * @param {Event} e - 鼠标事件
         * @returns {void}
         */
        start: function (e) {
            var ele = e.srcElement || e.target;
            if (this.goToBtn.re_id == ele['re_id']) {
                if (this.layType === true) {
                    this.goLeft(e);
                } else if (this.layType === false) {
                    this.goTop(e);
                }
            } else if (this._bandLine.re_id == ele['re_id']) {
                if (this.layType === true) {
                    this._startPageXY = e.pageX;
                    this._startWH = parseInt($e.fn.getStyle(this._leftArea, 'width'));
                } else {
                    this._startPageXY = e.pageY;
                    this._startWH = parseInt($e.fn.getStyle(this._leftArea, 'height'));
                }
                this._resizing = true;
            }
        },

        /**
         * 拖拽移动
         * @private
         * @param {Event} e - 鼠标事件
         * @returns {void}
         */
        move: function (e) {
            if (this._resizing === true) {
                var chg, size;
                var thatArea = this._leftArea;
                if (this.layType === true) {
                    chg = e.pageX - this._startPageXY;
                    size = this._startWH + chg;
                    if (size < 0) {
                        size = 0;
                    }
                    $e.fn.setStyle(thatArea, 'width:' + size + 'px;');
                } else {
                    chg = e.pageY - this._startPageXY;
                    size = this._startWH + chg;
                    if (size < 0) {
                        size = 0;
                    }
                    $e.fn.debunce(function () {
                        $e.fn.setStyle(thatArea, 'height:' + size + 'px;');
                    }, 100, true)();
                }
            }
        },

        /**
         * 结束拖拽
         * @private
         * @param {Event} e - 鼠标事件
         * @returns {void}
         */
        end: function (e) {
            if (this._resizing) {
                if (this.layType === true) {
                    this.barPosition = parseInt($e.fn.getStyle(this._leftArea, 'width'));
                } else if (this.layType === false) {
                    this.barPosition = parseInt($e.fn.getStyle(this._rightArea, 'top'));
                }
                this._startWH = this._startPageXY = 0;
                this._resizing = false;
            }
        },

        /**
         * 收起/展开左侧面板
         * @private
         * @param {Event} e - 鼠标事件
         * @returns {void}
         */
        goLeft: function (e) {
            var ele = e.srcElement || e.target;
            if (this.goToBtn.re_id == ele['re_id']) {
                if (this.leftStatus === false) {
                    $e.fn.setStyle(this._leftArea, 'width:0;transition: width 0.8s;');
                    this.leftStatus = true;
                } else if (this.leftStatus === true) {
                    $e.fn.setStyle(this._leftArea, 'width:' + this.barPosition + 'px;transition: width 0.8s;');
                    this.leftStatus = false;
                }
            }
        },

        /**
         * 收起/展开顶部面板
         * @private
         * @param {Event} e - 鼠标事件
         * @returns {void}
         */
        goTop: function (e) {
            var ele = e.srcElement || e.target;
            if (this.goToBtn.re_id == ele['re_id']) {
                if (this.topStatus === false) {
                    $e.fn.setStyle(this._leftArea, 'height:0px;transition: height 0.8s;');
                    var top = 0 + this.barHeight;
                    $e.fn.setStyle(this._rightArea, 'top:' + top + 'px;');
                    this.topStatus = true;
                } else if (this.topStatus === true) {
                    var height = this.barPosition - this.barHeight;
                    $e.fn.setStyle(this._leftArea, 'height:' + height + 'px;transition: height 0.8s;');
                    $e.fn.setStyle(this._rightArea, 'top:' + this.barPosition + 'px;transition: top 0.8s;');
                    this.topStatus = false;
                }
            }
        },

        /**
         * 获取分割条位置
         * @public
         * @returns {number} 分割条位置
         */
        getSplitBarPosition: function () {
            var st = $e.fn.getStyle(this._leftArea);
            var p;
            if (this.layType === true) {
                p = st.width;
            } else {
                p = st.height;
            }
            return parseInt(p);
        },

        /**
         * 设置分割条位置
         * @public
         * @param {number|string} pos - 位置值
         * @returns {void}
         */
        setSplitBarPosition: function (pos) {
            pos = pos + '';
            if (pos && !pos.endsWith('%') && pos !== 'auto') {
                this.barPosition = parseInt(pos);
                pos = parseInt(this.barPosition) + 'px';
            } else {
                this.barPosition = pos;
            }
            if (this.layType === true) {
                $e.fn.setStyle(this._leftArea, 'width:' + pos);
            } else {
                $e.fn.setStyle(this._leftArea, 'height:' + pos);
            }
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            this.unbindAllListeners();
        }
    };

    var plugin = {
        create: function (options) {
            return new SplitView(options);
        }
    };

    $e.fn.extend($e.ui.getViewPlugin('view_container').viewPrototype(), SplitView.prototype);
    $e.ui.addViewPlugin('view_split', plugin);
}($e);