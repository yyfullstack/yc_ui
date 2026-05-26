/**
 * @file 间距布局组件
 * @description 提供水平/垂直方向的间距布局功能，支持对齐方式、换行设置和填充模式
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var space = $e.ui.createView('view_space', {
 *     direction: 'horizontal',
 *     size: 'default',
 *     align: 'center',
 *     wrap: true,
 *     items: [
 *         { content: '<span>项目1</span>' },
 *         { content: '<span>项目2</span>' }
 *     ]
 * });
 */
+function ($e) {
    'use strict';

    /**
     * SpaceView 间距布局组件
     * 提供水平/垂直方向的间距布局功能，支持对齐方式、换行设置和填充模式
     * @class
     * @param {Object} options - 配置选项
     * @param {string} [options.direction='horizontal'] - 布局方向：horizontal/vertical
     * @param {string} [options.size='default'] - 间距大小：none/xs/sm/default/md/lg/xl
     * @param {string} [options.align='center'] - 对齐方式：start/center/end/baseline
     * @param {boolean} [options.wrap=true] - 是否允许换行
     * @param {boolean} [options.fill=false] - 是否填充容器空间
     * @param {Array} [options.items=[]] - 子项配置数组
     */
    function SpaceView(options) {
        this.props = options || {};
        this.items = [];
    }

    SpaceView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_space',
        body: null,
        shell: null,
        items: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildSpace();
            this.inited();
        },

        /**
         * 构建间距布局DOM结构
         * @private
         * @returns {void}
         */
        buildSpace: function () {
            var options = this.props;
            var direction = options.direction || 'horizontal';
            var size = options.size || 'default';
            var align = options.align || 'center';
            var wrap = options.wrap !== false;
            var fill = options.fill || false;

            $e.fn.addClass(this.shell, 'yc-space');
            $e.fn.addClass(this.shell, 'yc-space--' + direction);
            $e.fn.addClass(this.shell, 'yc-space--size-' + size);
            $e.fn.addClass(this.shell, 'yc-space--align-' + align);

            if (!wrap) {
                $e.fn.addClass(this.shell, 'yc-space--nowrap');
            } else {
                $e.fn.addClass(this.shell, 'yc-space--wrap');
            }

            if (fill) {
                if (direction === 'vertical') {
                    $e.fn.addClass(this.shell, 'yc-space--fill-v');
                } else {
                    $e.fn.addClass(this.shell, 'yc-space--fill');
                }
            }

            if (options.items instanceof Array) {
                for (var i = 0; i < options.items.length; i++) {
                    this.addItem(options.items[i]);
                }
            }
        },

        /**
         * 添加子项
         * @public
         * @param {Object|string} itemOptions - 子项配置对象或HTML内容
         * @returns {HTMLElement} 新添加的子项元素
         */
        addItem: function (itemOptions) {
            var item = $e.fn.create('div');
            $e.fn.addClass(item, 'yc-space-item');

            if (typeof itemOptions === 'string') {
                item.innerHTML = itemOptions;
            } else if (itemOptions && itemOptions.content) {
                item.innerHTML = itemOptions.content;
            } else if (itemOptions && itemOptions.html) {
                item.innerHTML = itemOptions.html;
            }

            this.getBody().appendChild(item);
            this.items.push(item);
            return item;
        },

        /**
         * 移除子项
         * @public
         * @param {number} index - 子项索引
         * @returns {void}
         */
        removeItem: function (index) {
            if (index >= 0 && index < this.items.length) {
                this.getBody().removeChild(this.items[index]);
                this.items.splice(index, 1);
            }
        },

        /**
         * 获取子项
         * @public
         * @param {number} index - 子项索引
         * @returns {HTMLElement|null} 子项元素
         */
        getItem: function (index) {
            return this.items[index];
        },

        /**
         * 设置布局方向
         * @public
         * @param {string} direction - 方向：horizontal/vertical
         * @returns {void}
         */
        setDirection: function (direction) {
            $e.fn.removeClass(this.shell, 'yc-space--horizontal');
            $e.fn.removeClass(this.shell, 'yc-space--vertical');
            $e.fn.addClass(this.shell, 'yc-space--' + direction);
        },

        /**
         * 设置间距大小
         * @public
         * @param {string} size - 大小：none/xs/sm/default/md/lg/xl
         * @returns {void}
         */
        setSize: function (size) {
            var sizes = ['none', 'xs', 'sm', 'default', 'md', 'lg', 'xl'];
            for (var i = 0; i < sizes.length; i++) {
                $e.fn.removeClass(this.shell, 'yc-space--size-' + sizes[i]);
            }
            $e.fn.addClass(this.shell, 'yc-space--size-' + size);
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this.items = null;
            this.body = null;
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
         * 创建间距布局组件实例
         * @param {Object} options - 组件配置
         * @returns {SpaceView} 间距布局组件实例
         */
        create: function (options) {
            return new SpaceView(options);
        }
    };
    $e.ui.addViewPlugin("view_space", plugin);
}($e);