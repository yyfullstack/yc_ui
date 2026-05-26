/**
 * @file 布局组件
 * @description 支持栅格布局、响应式设计、水平/垂直方向、间距设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var layout = $e.ui.createView('view_layout', {
 *     direction: 'horizontal',
 *     gutter: 20,
 *     rows: [
 *         {
 *             gutter: 16,
 *             justify: 'center',
 *             align: 'middle',
 *             cols: [
 *                 { span: 8, content: '列1' },
 *                 { span: 8, content: '列2' },
 *                 { span: 8, content: '列3' }
 *             ]
 *         }
 *     ]
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 布局视图组件构造函数
     * @class LayoutView
     * @param {Object} options - 配置选项
     * @param {string} [options.direction='horizontal'] - 布局方向：horizontal/vertical
     * @param {number} [options.gutter=0] - 间距大小（像素）
     * @param {Array} [options.rows=[]] - 行配置数组
     */
    function LayoutView(options) {
        this.props = options || {};
        this.rows = [];
    }

    LayoutView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_layout',
        body: null,
        shell: null,
        rows: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildLayout();
            this.inited();
        },

        /**
         * 构建布局结构
         * @private
         * @returns {void}
         */
        buildLayout: function () {
            var options = this.props;
            var direction = options.direction || 'horizontal';
            var gutter = options.gutter || 0;
            $e.fn.addClass(this.shell, 'yc-container');
            if (direction === 'vertical') {
                $e.fn.addClass(this.shell, 'is-vertical');
            }
            if (options.rows instanceof Array) {
                for (var i = 0; i < options.rows.length; i++) {
                    this.addRow(options.rows[i]);
                }
            }
        },

        /**
         * 添加行
         * @public
         * @param {Object} rowOptions - 行配置
         * @param {number} [rowOptions.gutter] - 列间距
         * @param {string} [rowOptions.justify] - 水平对齐方式
         * @param {string} [rowOptions.align] - 垂直对齐方式
         * @param {Array} [rowOptions.cols] - 列配置数组
         * @returns {HTMLElement} 创建的行元素
         */
        addRow: function (rowOptions) {
            var row = $e.fn.create('div');
            $e.fn.addClass(row, 'yc-row');
            if (rowOptions.gutter) {
                row.style.setProperty('--yc-row-gutter', rowOptions.gutter + 'px');
            }
            if (rowOptions.justify) {
                $e.fn.addClass(row, 'yc-row--justify-' + rowOptions.justify);
            }
            if (rowOptions.align) {
                $e.fn.addClass(row, 'yc-row--align-' + rowOptions.align);
            }
            if (rowOptions.cols instanceof Array) {
                for (var i = 0; i < rowOptions.cols.length; i++) {
                    this.addCol(row, rowOptions.cols[i]);
                }
            }
            this.getBody().appendChild(row);
            this.rows.push(row);
            return row;
        },

        /**
         * 添加列
         * @public
         * @param {HTMLElement} row - 父行元素
         * @param {Object} colOptions - 列配置
         * @param {number} [colOptions.span=24] - 占据列数（1-24）
         * @param {number} [colOptions.offset=0] - 偏移列数
         * @param {Object} [colOptions.responsive] - 响应式配置
         * @param {number} [colOptions.responsive.xs] - 超小屏幕列数
         * @param {number} [colOptions.responsive.sm] - 小屏幕列数
         * @param {number} [colOptions.responsive.md] - 中等屏幕列数
         * @param {number} [colOptions.responsive.lg] - 大屏幕列数
         * @param {number} [colOptions.responsive.xl] - 超大屏幕列数
         * @param {string} [colOptions.content] - 列内容
         * @returns {HTMLElement} 创建的列元素
         */
        addCol: function (row, colOptions) {
            var col = $e.fn.create('div');
            var span = colOptions.span || 24;
            var offset = colOptions.offset || 0;
            var responsive = colOptions.responsive || {};
            $e.fn.addClass(col, 'yc-col-' + span);
            if (offset > 0) {
                $e.fn.addClass(col, 'yc-col-offset-' + offset);
            }
            if (responsive.xs) {
                $e.fn.addClass(col, 'yc-col-xs-' + responsive.xs);
            }
            if (responsive.sm) {
                $e.fn.addClass(col, 'yc-col-sm-' + responsive.sm);
            }
            if (responsive.md) {
                $e.fn.addClass(col, 'yc-col-md-' + responsive.md);
            }
            if (responsive.lg) {
                $e.fn.addClass(col, 'yc-col-lg-' + responsive.lg);
            }
            if (responsive.xl) {
                $e.fn.addClass(col, 'yc-col-xl-' + responsive.xl);
            }
            if (colOptions.content) {
                col.innerHTML = colOptions.content;
            }
            row.appendChild(col);
            return col;
        },

        /**
         * 移除指定索引的行
         * @public
         * @param {number} index - 行索引
         * @returns {void}
         */
        removeRow: function (index) {
            if (index >= 0 && index < this.rows.length) {
                this.getBody().removeChild(this.rows[index]);
                this.rows.splice(index, 1);
            }
        },

        /**
         * 获取指定索引的行
         * @public
         * @param {number} index - 行索引
         * @returns {HTMLElement|null} 行元素
         */
        getRow: function (index) {
            return this.rows[index] || null;
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this.rows = null;
            this.body = null;
        },

        /**
         * 调整组件尺寸
         * @public
         * @param {Object} [options] - 尺寸选项
         * @returns {void}
         */
        resize: function (options) {
            // 布局组件无需特殊尺寸调整
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建布局组件实例
         * @param {Object} options - 组件配置
         * @returns {LayoutView} 布局组件实例
         */
        create: function (options) {
            return new LayoutView(options);
        }
    };

    $e.ui.addViewPlugin("view_layout", plugin);
}($e);