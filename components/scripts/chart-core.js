(function() {
    const chartInstances = new Set();
    let themeObserver = null;
    let resizeListenerBound = false;

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function deepMerge(target, source) {
        const output = Array.isArray(target) ? target.slice() : { ...target };

        if (!isPlainObject(source) && !Array.isArray(source)) {
            return source === undefined ? output : source;
        }

        Object.keys(source).forEach((key) => {
            const sourceValue = source[key];
            const targetValue = output[key];

            if (Array.isArray(sourceValue)) {
                output[key] = sourceValue.slice();
                return;
            }

            if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
                output[key] = deepMerge(targetValue, sourceValue);
                return;
            }

            if (isPlainObject(sourceValue)) {
                output[key] = deepMerge({}, sourceValue);
                return;
            }

            output[key] = sourceValue;
        });

        return output;
    }

    function readToken(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function alpha(rgbToken, opacity) {
        return `rgba(${rgbToken}, ${opacity})`;
    }

    function getThemeTokens() {
        return {
            white: readToken('--yc-color-white'),
            primary: readToken('--yc-color-primary'),
            success: readToken('--yc-color-success'),
            warning: readToken('--yc-color-warning'),
            danger: readToken('--yc-color-danger'),
            info: readToken('--yc-color-info'),
            primaryHover: readToken('--yc-color-primary-hover'),
            primarySoft: readToken('--yc-color-primary-soft'),
            primaryStrong: readToken('--yc-color-primary-strong'),
            successHover: readToken('--yc-color-success-hover'),
            successStrong: readToken('--yc-color-success-strong'),
            warningHover: readToken('--yc-color-warning-hover'),
            warningStrong: readToken('--yc-color-warning-strong'),
            dangerHover: readToken('--yc-color-danger-hover'),
            infoHover: readToken('--yc-color-info-hover'),
            textPrimary: readToken('--yc-color-text-primary'),
            textRegular: readToken('--yc-color-text-regular'),
            textSecondary: readToken('--yc-color-text-secondary'),
            textPlaceholder: readToken('--yc-color-text-placeholder'),
            bg: readToken('--yc-color-bg'),
            bgLight: readToken('--yc-color-bg-light'),
            bgFill: readToken('--yc-color-fill-extra-light'),
            bgSecondary: readToken('--yc-color-fill-light'),
            border: readToken('--yc-color-border'),
            borderLight: readToken('--yc-color-border-light'),
            overlayMask: readToken('--yc-color-bg-overlay'),
            gridLine: readToken('--yc-grid-line-color'),
            shadowBase: readToken('--yc-shadow-color-base'),
            shadowStrong: readToken('--yc-shadow-color-strong'),
            fontFamily: readToken('--yc-font-family'),
            whiteRgb: readToken('--yc-color-white-rgb'),
            primaryRgb: readToken('--yc-color-primary-rgb'),
            successRgb: readToken('--yc-color-success-rgb'),
            warningRgb: readToken('--yc-color-warning-rgb'),
            dangerRgb: readToken('--yc-color-danger-rgb'),
            infoRgb: readToken('--yc-color-info-rgb')
        };
    }

    function getPalette(tokens) {
        return [
            tokens.primary,
            tokens.success,
            tokens.warning,
            tokens.danger,
            tokens.info,
            tokens.primarySoft,
            tokens.successStrong,
            tokens.warningStrong,
            tokens.dangerHover
        ];
    }

    function getSeriesColor(index, helpers, customColor) {
        if (customColor) return customColor;
        return helpers.palette[index % helpers.palette.length];
    }

    function getSeriesRgb(index, helpers) {
        const rgbList = [
            helpers.tokens.primaryRgb,
            helpers.tokens.successRgb,
            helpers.tokens.warningRgb,
            helpers.tokens.dangerRgb,
            helpers.tokens.infoRgb
        ];
        return rgbList[index % rgbList.length] || helpers.tokens.primaryRgb;
    }

    function formatAxisValue(value) {
        if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return `${value}`;
    }

    function buildLineSeries(config, helpers, options) {
        const defaults = options || {};
        return (config.series || []).map((item, index) => {
            const color = getSeriesColor(index, helpers, item.color);
            const rgb = getSeriesRgb(index, helpers);
            const lineWidth = item.lineWidth || defaults.lineWidth || 3;
            const isArea = Boolean(item.area || defaults.area);

            return {
                name: item.name,
                type: 'line',
                smooth: item.smooth !== undefined ? item.smooth : defaults.smooth !== false,
                symbol: item.symbol || 'circle',
                symbolSize: item.symbolSize || 6,
                showSymbol: item.showSymbol !== undefined ? item.showSymbol : false,
                emphasis: { focus: 'series' },
                yAxisIndex: item.yAxisIndex || 0,
                data: item.data || [],
                lineStyle: {
                    width: lineWidth,
                    color
                },
                itemStyle: {
                    color
                },
                areaStyle: isArea ? {
                    color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: alpha(rgb, 0.32) },
                        { offset: 1, color: alpha(rgb, 0.04) }
                    ])
                } : undefined
            };
        });
    }

    function buildBarSeries(config, helpers) {
        return (config.series || []).map((item, index) => {
            const color = getSeriesColor(index, helpers, item.color);
            return {
                name: item.name,
                type: 'bar',
                stack: item.stack,
                barWidth: item.barWidth || '42%',
                barMaxWidth: item.barMaxWidth || 28,
                yAxisIndex: item.yAxisIndex || 0,
                data: item.data || [],
                emphasis: { focus: 'series' },
                itemStyle: {
                    color,
                    borderRadius: item.borderRadius || [8, 8, 2, 2]
                }
            };
        });
    }

    function createCommonAxisOption(helpers, config) {
        return {
            grid: deepMerge({
                left: 14,
                right: 16,
                top: 52,
                bottom: 18,
                containLabel: true
            }, config.grid || {}),
            tooltip: deepMerge({
                trigger: 'axis',
                backgroundColor: helpers.tokens.bg,
                borderColor: helpers.tokens.borderLight,
                borderWidth: 1,
                padding: 12,
                textStyle: {
                    color: helpers.tokens.textPrimary
                },
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: alpha(helpers.tokens.primaryRgb, 0.22)
                    }
                }
            }, config.tooltip || {}),
            legend: config.legend === false ? { show: false } : deepMerge({
                top: 10,
                right: 12,
                itemWidth: 12,
                itemHeight: 8,
                textStyle: {
                    color: helpers.tokens.textSecondary,
                    fontSize: 12
                }
            }, isPlainObject(config.legend) ? config.legend : {}),
            xAxis: deepMerge({
                type: 'category',
                boundaryGap: Boolean(config.boundaryGap),
                data: config.categories || [],
                axisLine: {
                    lineStyle: {
                        color: helpers.tokens.borderLight
                    }
                },
                axisTick: { show: false },
                axisLabel: {
                    color: helpers.tokens.textSecondary
                }
            }, config.xAxis || {}),
            yAxis: deepMerge({
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: helpers.tokens.textSecondary,
                    formatter: config.axisFormatter || formatAxisValue
                },
                splitLine: {
                    lineStyle: {
                        color: helpers.tokens.gridLine
                    }
                }
            }, config.yAxis || {})
        };
    }

    function linePreset(config) {
        return function(helpers) {
            const common = createCommonAxisOption(helpers, config);
            return {
                ...common,
                series: buildLineSeries(config, helpers, { smooth: true, area: false })
            };
        };
    }

    function areaPreset(config) {
        return function(helpers) {
            const common = createCommonAxisOption(helpers, config);
            return {
                ...common,
                series: buildLineSeries(config, helpers, { smooth: true, area: true })
            };
        };
    }

    function barPreset(config) {
        return function(helpers) {
            const horizontal = Boolean(config.horizontal);
            const common = createCommonAxisOption(helpers, {
                ...config,
                boundaryGap: true
            });
            const barSeries = buildBarSeries(config, helpers);

            if (!horizontal) {
                return {
                    ...common,
                    series: barSeries
                };
            }

            return {
                ...common,
                xAxis: deepMerge({
                    type: 'value',
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: {
                        color: helpers.tokens.textSecondary,
                        formatter: config.axisFormatter || formatAxisValue
                    },
                    splitLine: {
                        lineStyle: {
                            color: helpers.tokens.gridLine
                        }
                    }
                }, config.xAxis || {}),
                yAxis: deepMerge({
                    type: 'category',
                    data: config.categories || [],
                    axisLine: {
                        lineStyle: {
                            color: helpers.tokens.borderLight
                        }
                    },
                    axisTick: { show: false },
                    axisLabel: {
                        color: helpers.tokens.textSecondary
                    }
                }, config.yAxis || {}),
                series: barSeries.map((item) => deepMerge(item, {
                    itemStyle: {
                        borderRadius: item.itemStyle && item.itemStyle.borderRadius ? item.itemStyle.borderRadius : [0, 8, 8, 0]
                    }
                }))
            };
        };
    }

    function stackedBarPreset(config) {
        const normalizedSeries = (config.series || []).map((item) => ({
            ...item,
            stack: item.stack || config.stackName || 'total'
        }));
        return barPreset({
            ...config,
            series: normalizedSeries
        });
    }

    function piePreset(config) {
        return function(helpers) {
            const donut = Boolean(config.donut);
            return {
                tooltip: deepMerge({
                    trigger: 'item',
                    backgroundColor: helpers.tokens.bg,
                    borderColor: helpers.tokens.borderLight,
                    borderWidth: 1,
                    textStyle: {
                        color: helpers.tokens.textPrimary
                    }
                }, config.tooltip || {}),
                legend: config.legend === false ? { show: false } : deepMerge({
                    bottom: 8,
                    left: 'center',
                    itemWidth: 12,
                    itemHeight: 8,
                    textStyle: {
                        color: helpers.tokens.textSecondary,
                        fontSize: 12
                    }
                }, isPlainObject(config.legend) ? config.legend : {}),
                series: [{
                    name: config.name || '',
                    type: 'pie',
                    radius: donut ? (config.radius || ['54%', '76%']) : (config.radius || '70%'),
                    center: config.center || ['50%', '44%'],
                    roseType: config.roseType,
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderColor: helpers.tokens.bg,
                        borderWidth: 2,
                        borderRadius: donut ? 10 : 8
                    },
                    label: {
                        color: helpers.tokens.textSecondary,
                        formatter: config.labelFormatter || '{b}: {d}%'
                    },
                    labelLine: {
                        lineStyle: {
                            color: helpers.tokens.border
                        }
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 6
                    },
                    data: config.data || []
                }]
            };
        };
    }

    function comboPreset(config) {
        return function(helpers) {
            const common = createCommonAxisOption(helpers, {
                ...config,
                boundaryGap: true
            });

            return {
                ...common,
                yAxis: [
                    deepMerge({
                        type: 'value',
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: {
                            color: helpers.tokens.textSecondary,
                            formatter: config.leftAxisFormatter || formatAxisValue
                        },
                        splitLine: {
                            lineStyle: {
                                color: helpers.tokens.gridLine
                            }
                        }
                    }, Array.isArray(config.yAxis) ? config.yAxis[0] || {} : {}),
                    deepMerge({
                        type: 'value',
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: {
                            color: helpers.tokens.textSecondary,
                            formatter: config.rightAxisFormatter || '{value}%'
                        },
                        splitLine: { show: false }
                    }, Array.isArray(config.yAxis) ? config.yAxis[1] || {} : {})
                ],
                series: [
                    ...buildBarSeries({
                        series: (config.barSeries || []).map((item) => ({
                            ...item,
                            yAxisIndex: item.yAxisIndex !== undefined ? item.yAxisIndex : 0
                        }))
                    }, helpers),
                    ...buildLineSeries({
                        series: (config.lineSeries || []).map((item) => ({
                            ...item,
                            yAxisIndex: item.yAxisIndex !== undefined ? item.yAxisIndex : 1
                        }))
                    }, helpers, { smooth: true, area: false })
                ]
            };
        };
    }

    function sparklinePreset(config) {
        return function(helpers) {
            const color = config.color || helpers.tokens.primary;
            const rgb = config.rgb || helpers.tokens.primaryRgb;
            return {
                animationDuration: 300,
                grid: {
                    left: 0,
                    right: 0,
                    top: 6,
                    bottom: 6
                },
                tooltip: {
                    show: false
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: config.categories || [],
                    show: false
                },
                yAxis: {
                    type: 'value',
                    show: false
                },
                series: [{
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    data: config.data || [],
                    lineStyle: {
                        width: 2,
                        color
                    },
                    itemStyle: {
                        color
                    },
                    areaStyle: {
                        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: alpha(rgb, 0.24) },
                            { offset: 1, color: alpha(rgb, 0.02) }
                        ])
                    }
                }]
            };
        };
    }

    const presetFactory = {
        line: linePreset,
        area: areaPreset,
        bar: barPreset,
        'stacked-bar': stackedBarPreset,
        pie: piePreset,
        donut: function(config) {
            return piePreset({ ...config, donut: true });
        },
        combo: comboPreset,
        sparkline: sparklinePreset
    };

    function resolveOptionSource(source, helpers) {
        if (typeof source === 'function') {
            return source(helpers) || {};
        }

        if (source && (source.preset || source.type)) {
            const presetName = source.preset || source.type;
            const presetBuilder = presetFactory[presetName];
            if (presetBuilder) {
                return presetBuilder(source)(helpers);
            }
        }

        if (source && source.option) {
            return resolveOptionSource(source.option, helpers);
        }

        return source || {};
    }

    function ensureGlobalListeners() {
        if (!resizeListenerBound) {
            window.addEventListener('resize', () => {
                chartInstances.forEach((instance) => instance.resize());
            });
            resizeListenerBound = true;
        }

        if (!themeObserver) {
            themeObserver = new MutationObserver(() => {
                chartInstances.forEach((instance) => instance.render());
            });
            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['yc-theme']
            });
        }
    }

    class YCChartInstance {
        constructor(target, source, config) {
            this.root = typeof target === 'string' ? document.querySelector(target) : target;
            this.canvas = this.root && this.root.classList.contains('yc-chart__canvas')
                ? this.root
                : this.root && this.root.querySelector('.yc-chart__canvas');
            this.source = source || {};
            this.config = config || {};
            this.chart = null;
            this.emptyEl = null;
            this.resizeObserver = null;

            if (this.root) {
                ensureGlobalListeners();
                chartInstances.add(this);
                this.mount();
            }
        }

        mount() {
            if (!window.echarts || !this.canvas) {
                this.showEmpty(this.config.emptyText || 'ECharts 未加载，图表无法渲染。');
                return;
            }

            this.chart = window.echarts.init(this.canvas, null, {
                renderer: this.config.renderer || 'canvas'
            });

            if (window.ResizeObserver) {
                this.resizeObserver = new ResizeObserver(() => this.resize());
                this.resizeObserver.observe(this.root);
            }

            this.render();
        }

        getHelpers() {
            const tokens = getThemeTokens();
            return {
                tokens,
                palette: getPalette(tokens),
                alpha,
                formatAxisValue
            };
        }

        getBaseOption(helpers) {
            return {
                backgroundColor: 'transparent',
                color: helpers.palette,
                animationDuration: 420,
                animationDurationUpdate: 260,
                textStyle: {
                    fontFamily: helpers.tokens.fontFamily,
                    color: helpers.tokens.textPrimary
                }
            };
        }

        ensureEmptyElement() {
            if (this.emptyEl || !this.root) return;
            this.emptyEl = document.createElement('div');
            this.emptyEl.className = 'yc-chart__empty';
            this.emptyEl.hidden = true;
            this.root.appendChild(this.emptyEl);
        }

        showEmpty(message) {
            this.ensureEmptyElement();
            if (this.emptyEl) {
                this.emptyEl.textContent = message || '暂无数据';
                this.emptyEl.hidden = false;
            }
            if (this.canvas) this.canvas.style.display = 'none';
        }

        hideEmpty() {
            if (this.emptyEl) this.emptyEl.hidden = true;
            if (this.canvas) this.canvas.style.display = '';
        }

        render() {
            if (!this.chart) return;

            const helpers = this.getHelpers();
            const option = deepMerge(
                this.getBaseOption(helpers),
                resolveOptionSource(this.source, helpers)
            );

            const hasSeries = Array.isArray(option.series) && option.series.length > 0;
            if (!hasSeries) {
                this.showEmpty(this.config.emptyText || '暂无可展示的数据');
                return;
            }

            this.hideEmpty();
            this.chart.setOption(option, true);
            this.resize();
        }

        setSource(source) {
            this.source = source;
            this.render();
        }

        resize() {
            if (this.chart) {
                this.chart.resize();
            }
        }

        dispose() {
            chartInstances.delete(this);
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            if (this.chart) {
                this.chart.dispose();
                this.chart = null;
            }
        }
    }

    window.YCChart = {
        create(target, source, config) {
            return new YCChartInstance(target, source, config);
        },
        presets: {
            line: linePreset,
            area: areaPreset,
            bar: barPreset,
            stackedBar: stackedBarPreset,
            pie: piePreset,
            donut(config) {
                return piePreset({ ...config, donut: true });
            },
            combo: comboPreset,
            sparkline: sparklinePreset
        },
        alpha,
        getThemeTokens
    };
})();
