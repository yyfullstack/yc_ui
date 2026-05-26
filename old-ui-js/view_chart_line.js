/**
 * @file 折线图组件
 * @description 基于ECharts的折线图表组件，支持与ADO数据对象绑定
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 折线图视图组件构造函数
     * @class LineChartView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的ADO数据对象名称
     * @param {string} [options.categoryColumn] - 分类列名
     * @param {string} [options.valueColumn] - 值列名
     * @param {string} [options.keyColumn] - 关键字列名
     */
    function LineChartView(options) {
        this.props = options;
        this.adoName = options['adoName'];
        this.categoryColumn = options['categoryColumn'];
        this.valueColumn = options['valueColumn'];
        this.keyColumn = options['keyColumn'];
    }

    LineChartView.prototype = {
        type: 'view_chart_line',
        categoryColumn: null,
        valueColumn: null,
        keyColumn: null,
        lineType: 'line',
        _inited: false,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({
                    context: this,
                    method: this.doDataListen
                });
            }
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            if (ado && ado.isInited) {
                setTimeout(this.repaint.bind(this), 0);
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
                tooltip: this.getTooltip(),
                toolbox: this.getToolbox(),
                yAxis: {
                    type: 'value'
                },
                dataZoom: this.getDataZoom(),
                grid: this.getDataGrid()
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
                text: '折线图',
                subtext: '数据可视化图表'
            };
        },

        /**
         * 获取提示框配置
         * @private
         * @returns {Object} 提示框配置
         */
        getTooltip: function () {
            return {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            };
        },

        /**
         * 获取工具栏配置
         * @private
         * @returns {Object} 工具栏配置
         */
        getToolbox: function () {
            return {
                show: true,
                feature: {
                    magicType: {
                        show: true,
                        type: ['line', 'bar', 'stack', 'tiled']
                    },
                    dataView: {
                        show: true,
                        readOnly: false
                    },
                    restore: {
                        show: true
                    },
                    saveAsImage: {
                        show: true
                    }
                }
            };
        },

        /**
         * 获取数据缩放配置
         * @private
         * @returns {Array} 数据缩放配置数组
         */
        getDataZoom: function () {
            return [{
                type: 'inside',
                start: 1,
                end: 100
            }, {
                show: true,
                type: 'slider',
                y: '90%'
            }];
        },

        /**
         * 获取网格配置
         * @private
         * @returns {Object} 网格配置
         */
        getDataGrid: function () {
            return {
                left: '0%',
                right: '4%',
                bottom: '10%',
                width: 'auto',
                height: 'auto',
                containLabel: true
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
         * 获取图表数据（ADO数据必须按categoryColumn和keyColumn排序）
         * @private
         * @param {Object} ado - ADO数据对象
         * @returns {Object} 图表数据
         */
        getData: function (ado) {
            var category = this.getCategory() || [];
            var pos = {};
            if (category.length > 0) {
                for (var i = 0; i < category.length; i++) {
                    category[i] = this.getLabel(category[i]);
                    pos[category[i]] = i;
                }
            }
            var cols = ado.getColumnsIndex([this.categoryColumn, this.keyColumn, this.valueColumn]);
            var data = [], dataPos = {}, data1, legend = [];
            for (var i = 0; i < ado.getRowsCount(); i++) {
                var c = this.getLabel(ado.getValueAt(i, cols[0]));
                var k = ado.getValueAt(i, cols[1]) + '';
                if (pos[c] === undefined) {
                    pos[c] = category.length;
                    this.nextData(data, category.length);
                    category.push(c);
                }
                if (dataPos[k] === undefined) {
                    dataPos[k] = data.length;
                    data1 = this.getSeriesObject(k, category.length);
                    data.push(data1);
                    legend.push(k);
                } else {
                    data1 = data[dataPos[k]];
                }
                data1.data[pos[c]] = ado.getValueAt(i, cols[2]);
            }
            return {
                legend: {
                    data: legend
                },
                xAxis: this.buildXAxis(category),
                series: data
            };
        },

        /**
         * 构建X轴配置
         * @private
         * @param {Array} category - 分类数据
         * @returns {Object} X轴配置
         */
        buildXAxis: function (category) {
            return {
                type: 'category',
                data: category,
                axisTick: {
                    alignWithLabel: false
                }
            };
        },

        /**
         * 获取分类数据
         * @private
         * @returns {Array|null} 分类数据数组
         */
        getCategory: function () {
            return null;
        },

        /**
         * 获取系列对象
         * @private
         * @param {string} name - 系列名称
         * @param {number} length - 数据长度
         * @returns {Object} 系列对象
         */
        getSeriesObject: function (name, length) {
            return {
                name: name,
                data: new Array(length + 1).join('0').split(''),
                type: this.lineType
            };
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
         * 创建折线图组件实例
         * @param {Object} options - 组件配置
         * @returns {LineChartView} 折线图组件实例
         */
        create: function (options) {
            return new LineChartView(options);
        }
    };

    $e.ui.addViewPlugin('view_chart_line', plugin);
}($e);
