+function ($e) {
    /**
     * StatisticView 统计数值组件
     * 用于展示带前缀/后缀的统计数据，支持标题和描述信息
     * @param {Object} options 配置项
     */
    function StatisticView(options) {
        this.props = options || {};
        this._value = this.props['value'] || 0;
        this._prefix = this.props['prefix'] || '';
        this._suffix = this.props['suffix'] || '';
        this._title = this.props['title'] || '';
        this._description = this.props['description'] || '';
        this._precision = this.props['precision'] || 0;
        this._groupSeparator = $e.fn.getBoolean(this.props['groupSeparator'], true);
    }

    StatisticView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_statistic',
        shell: null,
        body: null,
        _value: 0,
        _prefix: '',
        _suffix: '',
        _title: '',
        _description: '',
        _precision: 0,
        _groupSeparator: true,
        _valueEl: null,

        /**
         * 初始化组件
         * 设置body区域并渲染统计数值内容
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-statistic');
            this.render();
            this.inited();
        },

        /**
         * 渲染Statistic组件DOM结构
         * 构建前缀、数值、后缀、标题和描述区域
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';

            if (this._title) {
                var titleEl = document.createElement('div');
                $e.fn.addClass(titleEl, 'yc-statistic-title');
                titleEl.style.fontSize = 'var(--yc-font-size-base)';
                titleEl.style.color = 'var(--yc-text-color-secondary)';
                titleEl.style.marginBottom = 'var(--yc-padding-xs)';
                titleEl.innerHTML = this._title;
                shell.appendChild(titleEl);
            }

            var contentEl = document.createElement('div');
            $e.fn.addClass(contentEl, 'yc-statistic-content');
            contentEl.style.fontSize = 'var(--yc-font-size-xl)';
            contentEl.style.color = 'var(--yc-heading-color)';
            contentEl.style.fontWeight = '500';

            var prefixEl = document.createElement('span');
            $e.fn.addClass(prefixEl, 'yc-statistic-prefix');
            prefixEl.style.marginRight = '4px';
            if (this._prefix) {
                if (this._prefix.indexOf('<') === 0) {
                    prefixEl.innerHTML = this._prefix;
                } else {
                    prefixEl.innerText = this._prefix;
                }
            }
            contentEl.appendChild(prefixEl);

            var valueEl = document.createElement('span');
            $e.fn.addClass(valueEl, 'yc-statistic-value');
            valueEl.innerHTML = this.formatValue(this._value);
            this._valueEl = valueEl;
            contentEl.appendChild(valueEl);

            var suffixEl = document.createElement('span');
            $e.fn.addClass(suffixEl, 'yc-statistic-suffix');
            suffixEl.style.marginLeft = '4px';
            if (this._suffix) {
                if (this._suffix.indexOf('<') === 0) {
                    suffixEl.innerHTML = this._suffix;
                } else {
                    suffixEl.innerText = this._suffix;
                }
            }
            contentEl.appendChild(suffixEl);

            shell.appendChild(contentEl);

            if (this._description) {
                var descEl = document.createElement('div');
                $e.fn.addClass(descEl, 'yc-statistic-description');
                descEl.style.fontSize = 'var(--yc-font-size-sm)';
                descEl.style.color = 'var(--yc-text-color-secondary)';
                descEl.style.marginTop = 'var(--yc-padding-xs)';
                descEl.innerHTML = this._description;
                shell.appendChild(descEl);
            }
        },

        /**
         * 格式化数值
         * @param {number} value 数值
         * @returns {string} 格式化后的字符串
         */
        formatValue: function (value) {
            var formatted = value.toFixed(this._precision);
            if (this._groupSeparator) {
                var parts = formatted.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                formatted = parts.join('.');
            }
            return formatted;
        },

        /**
         * 设置数值
         * @param {number} value 数值
         */
        setValue: function (value) {
            this._value = value;
            if (this._valueEl) {
                this._valueEl.innerHTML = this.formatValue(value);
            }
        },

        /**
         * 获取数值
         * @returns {number} 当前数值
         */
        getValue: function () {
            return this._value;
        },

        /**
         * 设置前缀
         * @param {string} prefix 前缀文本或HTML
         */
        setPrefix: function (prefix) {
            this._prefix = prefix;
            this.render();
        },

        /**
         * 获取前缀
         * @returns {string} 前缀内容
         */
        getPrefix: function () {
            return this._prefix;
        },

        /**
         * 设置后缀
         * @param {string} suffix 后缀文本或HTML
         */
        setSuffix: function (suffix) {
            this._suffix = suffix;
            this.render();
        },

        /**
         * 获取后缀
         * @returns {string} 后缀内容
         */
        getSuffix: function () {
            return this._suffix;
        },

        /**
         * 设置标题
         * @param {string} title 标题文本
         */
        setTitle: function (title) {
            this._title = title;
            this.render();
        },

        /**
         * 获取标题
         * @returns {string} 标题文本
         */
        getTitle: function () {
            return this._title;
        },

        /**
         * 设置描述
         * @param {string} description 描述文本
         */
        setDescription: function (description) {
            this._description = description;
            this.render();
        },

        /**
         * 获取描述
         * @returns {string} 描述文本
         */
        getDescription: function () {
            return this._description;
        },

        /**
         * 设置精度（小数位数）
         * @param {number} precision 精度值
         */
        setPrecision: function (precision) {
            this._precision = precision;
            this.render();
        },

        /**
         * 获取精度
         * @returns {number} 精度值
         */
        getPrecision: function () {
            return this._precision;
        },

        /**
         * 设置千分位分隔符
         * @param {boolean} enabled 是否启用千分位
         */
        setGroupSeparator: function (enabled) {
            this._groupSeparator = enabled;
            this.render();
        },

        /**
         * 获取千分位状态
         * @returns {boolean} 是否启用千分位
         */
        getGroupSeparator: function () {
            return this._groupSeparator;
        },

        /**
         * 释放组件资源
         */
        selfRelease: function () {
            this._valueEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new StatisticView(options);
        }
    };
    $e.ui.addViewPlugin("view_statistic", plugin);
}($e);
