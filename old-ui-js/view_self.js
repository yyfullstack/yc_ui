/**
 * @file Self自视图组件
 * @description 自视图组件，用于绑定ADO数据对象，实现数据监听和重绘
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * SelfView 自视图组件
     * 用于绑定ADO数据对象，实现数据监听和重绘
     * @class
     * @param {Object} options - 配置选项
     * @param {string} options.adoName - 绑定的数据对象名称
     */
    function SelfView(options) {
        this.props = options;
        this.adoName = options['adoName'];
    }

    SelfView.prototype = {
        VERSION: '3.0.1',
        props: null,
        adoName: null,
        type: 'view_self',
        dataListenHandle: 0,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({ context: this, method: this.doDataListen });
            }
        },

        /**
         * 数据监听回调
         * @public
         * @param {Object} options - 事件选项
         * @returns {void}
         */
        doDataListen: function (options) {
            this.repaint(options);
        },

        /**
         * 重绘组件
         * @public
         * @param {Object} options - 重绘选项
         * @returns {void}
         */
        repaint: function (options) {
        },

        /**
         * 获取绑定的ADO对象
         * @protected
         * @returns {Object|null} ADO对象
         */
        getADO: function () {
            return this.adoName ? $e.getADO(this.adoName) : null;
        },

        /**
         * 释放资源
         * @public
         * @returns {void}
         */
        release: function () {
            var ado = this.getADO();
            if (ado && this.dataListenHandle) {
                ado.removeListen(this.dataListenHandle);
                this.dataListenHandle = 0;
            }
        }
    };

    var plugin = {
        create: function (options) {
            return new SelfView(options);
        }
    };

    $e.ui.addViewPlugin('view_self', plugin);
}($e);