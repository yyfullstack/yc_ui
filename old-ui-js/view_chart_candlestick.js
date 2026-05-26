/**
 * @file K线图组件
 * @description 基于ECharts的K线图组件，支持与ADO数据对象绑定
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * CandlestickChartView K线图视图组件
     * @class
     * @param {Object} options - 配置选项
     * @param {string} options.adoName - 绑定的数据对象名称
     * @param {string} options.dateColumn - 日期列名
     * @param {string} options.openColumn - 开盘列名
     * @param {string} options.closeColumn - 收盘列名
     * @param {string} options.lowestColumn - 最低价列名
     * @param {string} options.highestColumn - 最高价列名
     */
    function CandlestickChartView(options) {
        this.props = options;
        this.adoName = options['adoName'];
        this.dateColumn = options['dateColumn'];
        this.openColumn = options['openColumn'];
        this.closeColumn = options['closeColumn'];
        this.lowestColumn = options['lowestColumn'];
        this.highestColumn = options['highestColumn'];
    }

    CandlestickChartView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_chart_candlestick',
        dateColumn: null,
        openColumn: null,
        closeColumn: null,
        lowestColumn: null,
        highestColumn: null,
        lineType: 'candlestick',
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
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30']
                },
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '15%'
                },
                yAxis: {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        start: 0,
                        end: 100
                    },
                    {
                        show: true,
                        type: 'slider',
                        y: '90%'
                    }
                ]
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
                text: 'Customized candlestick'
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
            var cols = ado.getColumnsIndex([this.dateColumn, this.openColumn, this.closeColumn, this.lowestColumn, this.highestColumn]);
            var data = {};
            var xAxisData = [];
            var data1 = [];
            for (var i = 0; i < ado.getRowsCount(); i++) {
                var date = ado.getValueAt(i, cols[0]);
                var open = ado.getValueAt(i, cols[1]);
                var close = ado.getValueAt(i, cols[2]);
                var lowest = ado.getValueAt(i, cols[3]);
                var highest = ado.getValueAt(i, cols[4]);
                xAxisData.push([date]);

                data1.push([open, close, lowest, highest]);

                data = {
                    category: xAxisData,
                    values: data1
                };
            }

            return {
                xAxis: {
                    type: 'category',
                    data: xAxisData,
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                },
                series: [
                    {
                        name: '日K',
                        type: 'candlestick',
                        data: data1,
                        itemStyle: {
                            normal: {
                                color: '#ec0000',
                                color0: '#00da3c',
                                borderColor: '#8A0000',
                                borderColor0: '#008F28'
                            }
                        }
                    },
                    {
                        name: 'MA5',
                        type: 'line',
                        data: this.calculateMA(data, 5),
                        smooth: true,
                        lineStyle: {
                            normal: { opacity: 0.5 }
                        }
                    },
                    {
                        name: 'MA10',
                        type: 'line',
                        data: this.calculateMA(data, 10),
                        smooth: true,
                        lineStyle: {
                            normal: { opacity: 0.5 }
                        }
                    },
                    {
                        name: 'MA20',
                        type: 'line',
                        data: this.calculateMA(data, 20),
                        smooth: true,
                        lineStyle: {
                            normal: { opacity: 0.5 }
                        }
                    },
                    {
                        name: 'MA30',
                        type: 'line',
                        data: this.calculateMA(data, 30),
                        smooth: true,
                        lineStyle: {
                            normal: { opacity: 0.5 }
                        }
                    }
                ]
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
         * 计算MA均线
         * @private
         * @param {Object} data - 数据对象
         * @param {number} dayCount - 天数
         * @returns {Array} MA值数组
         */
        calculateMA: function (data, dayCount) {
            var result = [];
            for (var i = 0, len = data.values.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                var sum = 0;
                for (var j = 0; j < dayCount; j++) {
                    sum += parseFloat(data.values[i - j][1]);
                }
                result.push(sum / dayCount);
            }
            return result;
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
            return new CandlestickChartView(options);
        }
    };

    $e.ui.addViewPlugin('view_chart_candlestick', plugin);
}($e);