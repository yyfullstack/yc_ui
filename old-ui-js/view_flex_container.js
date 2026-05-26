/**
 * @file Flex容器组件
 * @description Flex视图的容器组件，用于管理子视图布局和交互
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * Flex容器组件构造函数
     * @class FlexContainerView
     * @param {Object} options - 配置选项
     * @param {Array} [options.children] - 子视图配置数组
     */
    function FlexContainerView(options) {
        this.props = options || {};
        this.parseChildren(options['children']);
    }

    FlexContainerView.prototype = {
        VERSION: '3.0.1',
        children: null,
        type: 'view_flex_container'
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建Flex容器组件实例
         * @param {Object} options - 组件配置
         * @returns {FlexContainerView} Flex容器组件实例
         */
        create: function (options) {
            return new FlexContainerView(options);
        }
    };

    $e.fn.extend($e.ui.getViewPlugin('view_container').viewPrototype(), FlexContainerView.prototype);
    $e.ui.addViewPlugin('view_flex_container', plugin);
}($e);