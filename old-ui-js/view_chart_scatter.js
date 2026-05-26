/**
 * @file 散点图组件
 * @description 基于ECharts的散点图组件，支持与ADO数据对象绑定
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 散点图视图组件构造函数
     * @class ScatterChartView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的ADO数据对象名称
     * @param {string} [options.categoryColumn] - 分类列名
     * @param {string} [options.valueColumn] - 值列名
     * @param {string} [options.nameColumn] - 名称列名
     */
    function ScatterChartView(options) {
        this.props = options;
        this.adoName = options['adoName'];
        this.categoryColumn = options['categoryColumn'];
        this.valueColumn = options['valueColumn'];
        this.nameColumn = options['nameColumn'];
    }

    ScatterChartView.prototype = {
        type: 'view_chart_scatter',
        categoryColumn: null,
        valueColumn: null,
        nameColumn: null,
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
                xAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                },
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    scale: true
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
                text: '散点图'
            };
        },

        /**
         * 获取图表数据（ADO数据必须按categoryColumn和keyColumn排序）
         * @private
         * @param {Object} ado - ADO数据对象
         * @returns {Object} 图表数据
         */
        getData: function (ado) {
            var cols = ado.getColumnsIndex([this.categoryColumn, this.nameColumn, this.valueColumn]);
            var data = [], legend = [], checker = {}, series = [];
            for (var i = 0; i < ado.getRowsCount(); i++) {
                var category = ado.getValueAt(i, cols[0]);
                var name = ado.getValueAt(i, cols[1]);
                var value = ado.getValueAt(i, cols[2]);
                data.push({
                    category: category,
                    name: name,
                    value: value
                });

                if (checker[category] === undefined) {
                    checker[category] = category;
                    legend.push(category);
                }
            }

            var dataArr = this.groupBy(data, 'category');

            for (var i = 0; i < legend.length; i++) {
                var val = this.getSeriesObject(dataArr[legend[i]], legend[i]);
                series.push(val);
            }
            return {
                legend: {
                    right: 10,
                    data: legend
                },
                series: series
            };
        },

        /**
         * 按属性分组数据
         * @private
         * @param {Array} arr - 数据数组
         * @param {string} prop - 属性名
         * @returns {Object} 分组后的数据
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
         * @param {string} legend - 图例名称
         * @returns {Object} 系列对象
         */
        getSeriesObject: function (data1, legend) {
            return {
                name: legend,
                data: data1,
                type: 'scatter',
                symbolSize: function (data) {
                    return data[2] * 5;
                },
                label: {
                    emphasis: {
                        show: true,
                        formatter: function (param) {
                            return param.data[0];
                        },
                        position: 'top'
                    }
                }
            };
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
         * 创建散点图组件实例
         * @param {Object} options - 组件配置
         * @returns {ScatterChartView} 散点图组件实例
         */
        create: function (options) {
            return new ScatterChartView(options);
        }
    };

    $e.ui.addViewPlugin('view_chart_scatter', plugin);
}($e);
