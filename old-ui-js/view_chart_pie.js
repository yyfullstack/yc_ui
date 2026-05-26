/**
 * @file 饼图组件
 * @description 基于ECharts的饼图组件，支持与ADO数据对象绑定
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 饼图视图组件构造函数
     * @class PieChartView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的ADO数据对象名称
     * @param {string} [options.valueColumn] - 值列名
     * @param {string} [options.nameColumn] - 名称列名
     */
    function PieChartView(options) {
        this.props = options;
        this.adoName = options['adoName'];
        this.valueColumn = options['valueColumn'];
        this.nameColumn = options['nameColumn'];
    }

    PieChartView.prototype = {
        type: 'view_chart_pie',
        valueColumn: null,
        nameColumn: null,
        lineType: 'pie',
        _inited: false,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
            }
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            if (ado && ado.isInited) {
                this.repaint();
            }
            this._inited = true;
        },

        /**
         * 数据监听处理
         * @private
         * @param {Object} options - 事件选项
         * @returns {void}
         */
        doDataListen: function (options) {
            this.repaint(options);
        },

        /**
         * 重新渲染图表
         * @public
         * @returns {void}
         */
        repaint: function () {
            var data = this.buildChartData();
            var target = this.getBody();
            setTimeout(function () {
                var size = $e.fn.realSize(target);
                var myChart = echarts.init(target, '', size);
                myChart.setOption(data);
            }, 0);
        },

        /**
         * 构建图表数据
         * @private
         * @returns {Object} 图表配置数据
         */
        buildChartData: function () {
            var ado = this.getADO();
            var options = this.initFixData();
            var data = this.getData(ado);
            $e.fn.extend(data, options, true);
            return options;
        },

        /**
         * 初始化固定数据配置
         * @private
         * @returns {Object} 固定配置数据
         */
        initFixData: function () {
            var data = {
                title: this.getTitle(),
                tooltip: {
                    trigger: 'item'
                }
            };
            return data;
        },

        /**
         * 获取标题配置
         * @private
         * @returns {Object} 标题配置
         */
        getTitle: function () {
            return {
                text: '饼图'
            };
        },

        /**
         * 格式化标签值
         * @private
         * @param {*} value - 值
         * @returns {string} 格式化后的值
         */
        getLabel: function (value) {
            return value + '';
        },

        /**
         * 获取图表数据
         * @private
         * @param {Object} ado - ADO数据对象
         * @returns {Object} 图表数据
         */
        getData: function (ado) {
            var cols = ado.getColumnsIndex([this.nameColumn, this.valueColumn]);
            var data = [];
            for (var i = 0; i < ado.getRowsCount(); i++) {
                var name = ado.getValueAt(i, cols[0]);
                var value = ado.getValueAt(i, cols[1]);
                data.push({
                    name: name,
                    value: value
                });
            }
            return {
                series: [{
                    name: '数据分布',
                    type: 'pie',
                    radius: '80%',
                    data: data
                }]
            };
        },

        /**
         * 获取系列对象
         * @private
         * @param {string} name - 系列名称
         * @param {number} length - 数据长度
         * @returns {Object} 系列对象
         */
        getSeriesObject: function (name, length) {
            return {name: name, data: new Array(length).fill(0), type: this.lineType};
        },

        /**
         * 填充下一条数据
         * @private
         * @param {Array} serialdata - 系列数据
         * @param {number} pos - 位置
         * @returns {void}
         */
        nextData: function (serialdata, pos) {
            for (var i = 0; i < serialdata.length; i++) {
                serialdata[i].data[pos] = 0;
            }
        },

        /**
         * 调整组件尺寸
         * @public
         * @param {Object} [options] - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建饼图组件实例
         * @param {Object} options - 组件配置
         * @returns {PieChartView} 饼图组件实例
         */
        create: function (options) {
            return new PieChartView(options);
        }
    };

    $e.ui.addViewPlugin('view_chart_pie', plugin);
}($e);
