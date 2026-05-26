/**
 * @file 雷达图组件
 * @description 基于ECharts的雷达图组件，支持与ADO数据对象绑定
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * RadarChartView 雷达图视图组件
     * @class
     * @param {Object} options - 配置选项
     * @param {string} options.adoName - 绑定的数据对象名称
     * @param {string} options.categoryColumn - 分类列名
     * @param {string} options.nameColumn - 名称列名
     * @param {string} options.maxColumn - 最大值列名
     * @param {string} options.valueColumn - 值列名
     */
    function RadarChartView(options) {
        this.props = options;
        this.adoName = options['adoName'];
        this.categoryColumn = options['categoryColumn'];
        this.maxColumn = options['maxColumn'];
        this.valueColumn = options['valueColumn'];
        this.nameColumn = options['nameColumn'];
    }

    RadarChartView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_chart_radar',
        categoryColumn: null,
        valueColumn: null,
        nameColumn: null,
        maxColumn: null,
        lineType: 'radar',
        dataListenHandle: 0,
        _inited: false,
        body: null,
        shell: null,

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
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            if (ado && ado.isInited) {
                this.repaint();
            }
            this._inited = true;
        },

        /**
         * 数据监听回调
         * @private
         * @param {Object} options - 事件选项
         * @returns {void}
         */
        doDataListen: function (options) {
            this.repaint(options);
        },

        /**
         * 重绘图表
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
         * @returns {Object} 配置对象
         */
        initFixData: function () {
            var data = {
                title: this.getTitle(),
                tooltip: {}
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
                text: 'Customized Radar'
            };
        },

        /**
         * 获取ADO数据
         * ADO数据必须是按照categoryColumn和keyColumn排序的
         * @private
         * @param {Object} ado - ADO数据对象
         * @returns {Object} 图表数据
         */
        getData: function (ado) {
            var cols = ado.getColumnsIndex([this.categoryColumn, this.nameColumn, this.maxColumn, this.valueColumn]);
            var data = [];
            var legend = [];
            var checker = {};
            var data1 = [];
            var indicatorData = [];

            for (var i = 0; i < ado.getRowsCount(); i++) {
                var category = ado.getValueAt(i, cols[0]);
                var name = ado.getValueAt(i, cols[1]);
                var max = ado.getValueAt(i, cols[2]);
                var value = ado.getValueAt(i, cols[3]);
                data.push({
                    category: category,
                    name: name,
                    max: max,
                    value: value
                });

                if (checker[category] === undefined) {
                    checker[category] = category;
                    legend.push(category);
                }
            }

            var dataArr = this.groupBy(data, 'category');

            for (var i = 0; i < dataArr[legend[0]].length; i++) {
                indicatorData.push({
                    name: dataArr[legend[0]][i].name,
                    max: dataArr[legend[0]][i].max
                });
            }

            for (var i = 0; i < legend.length; i++) {
                var datalFill = [];
                for (var j = 0; j < dataArr[legend[0]].length; j++) {
                    datalFill.push(dataArr[legend[i]][j].value);
                }
                data1.push({
                    name: legend[i],
                    value: datalFill
                });
            }

            var series = this.getSeriesObject(data1);

            return {
                legend: {
                    right: 10,
                    data: legend
                },
                radar: {
                    name: {
                        textStyle: {
                            color: '#fff',
                            backgroundColor: '#999',
                            borderRadius: 3,
                            padding: [3, 5]
                        }
                    },
                    indicator: indicatorData
                },
                series: series
            };
        },

        /**
         * 按属性分组
         * @private
         * @param {Array} arr - 数组
         * @param {string} prop - 属性名
         * @returns {Object} 分组结果
         */
        groupBy: function (arr, prop) {
            return arr.reduce(function (groups, item) {
                var val = item[prop];
                groups[val] = groups[val] || [];
                groups[val].push(item);
                return groups;
            }, {});
        },

        /**
         * 获取系列对象
         * @private
         * @param {Array} data1 - 数据数组
         * @returns {Object} 系列对象
         */
        getSeriesObject: function (data1) {
            return {
                type: 'radar',
                data: data1
            };
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
         * 获取body元素
         * @protected
         * @returns {HTMLElement} body元素
         */
        getBody: function () {
            return this.body;
        },

        /**
         * 调整大小
         * @public
         * @param {Object} options - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {},

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
            return new RadarChartView(options);
        }
    };

    $e.ui.addViewPlugin('view_chart_radar', plugin);
}($e);