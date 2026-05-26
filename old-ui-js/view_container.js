/**
 * @file 容器视图组件
 * @description 提供子视图管理、区域布局、视图放置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function($e) {
    'use strict';

    /**
     * 容器视图组件构造函数
     * @class ContainerView
     * @param {Object} options - 配置选项
     * @param {Object} [options.children] - 子视图配置对象
     */
    function ContainerView(options) {
        this.props = options || {};
        this.parseChildren(this.props['children']);
    }

    ContainerView.prototype = {
        VERSION : '3.0.1',
        children : null,
        type : 'view_container',
        areas : null,
        rsh_auto : true,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init : function() {
            this.initArea();
            this.buildChildren();
            this.inited();
        },

        /**
         * 初始化区域映射
         * @private
         * @returns {void}
         */
        initArea : function() {
            this.areas = {};
            var es = this.shell.querySelectorAll("[view-area]");
            for (var i = 0; i < es.length; i++) {
                this.areas[es[i].getAttribute("view-area")] = es[i];
            }
        },

        /**
         * 获取指定区域元素
         * @public
         * @param {string} name - 区域名称
         * @returns {HTMLElement|null} 区域元素
         */
        getArea : function(name) {
            return this.areas[name];
        },

        /**
         * 解析子视图配置
         * @private
         * @param {Object} children - 子视图配置
         * @returns {void}
         */
        parseChildren : function(children) {
            if (children) {
                var chd = $e.fn.createObject(children);
                for (var c in chd) {
                    chd[c] = chd[c] ? chd[c].split(",") : [];
                }
                this.children = chd;
            } else {
                this.children = {};
            }
        },

        /**
         * 构建子视图
         * @public
         * @param {boolean} [isclear=false] - 是否先清空
         * @returns {void}
         */
        buildChildren : function(isclear) {
            if (!!isclear) {
                for (var i in this.areas) {
                    $e.fn.setChild(this.areas[i], null);
                }
            }
            var view, chd;
            if (this.children) {
                for (var c in this.children) {
                    chd = this.children[c];
                    for (var i = 0; i < chd.length; i++) {
                        view = this.getView(chd[i]);
                        if (view) {
                            this.placeView(c, view, false, true);
                        }
                    }
                }
            }
        },

        /**
         * 将视图放置到指定区域
         * @public
         * @param {string} area - 区域名称，支持 'absolute' 和 'fixed'
         * @param {Object|string|Array} view - 视图对象、视图名称或数组
         * @param {boolean} [clearchild=false] - 是否清空区域子元素
         * @param {boolean} [notrs=false] - 是否跳过尺寸调整
         * @returns {void}
         */
        placeView : function(area, view, clearchild, notrs) {
            var st = null;
            notrs = !!notrs;
            if (!notrs) {
                st = $e.fn.realSize(this.getShell());
            }
            var shell = null;
            if (area == 'absolute' || area == 'fixed') {
                shell = this.getShell();
            } else if (area) {
                shell = this.areas[area];
            }
            if (!shell) {
                throw new Error("In contentView:" + this.getName() + ",area " + area + " not exist !");
            }
            if (clearchild) {
                $e.fn.setChild(shell, null);
            }
            if (view) {
                var vs = [];
                if (view instanceof Array) {
                    for (var i = 0; i < view.length; i++) {
                        vs.push((typeof view[i]) == "string" ? this.getView(view[i]) : view[i]);
                    }
                } else {
                    vs.push((typeof view) == "string" ? this.getView(view) : view);
                }
                for (var i = 0; i < vs.length; i++) {
                    if (vs[i]) {
                        shell.appendChild(vs[i].getShell());
                    }
                }
                if (!notrs) {
                    var that = this;
                    setTimeout(function() {
                        that.resize({height: st.height});
                    }, 0);
                }
            }
        },

        /**
         * 释放组件资源
         * @public
         * @param {boolean} [withado=false] - 是否同时释放ADO对象
         * @param {boolean} [withchild=false] - 是否同时释放子视图
         * @returns {void}
         */
        release : function(withado, withchild) {
            if (this.shell && withchild && this.children) {
                var view = null;
                var an = this.getActiveModuleName();
                for (var c in this.children) {
                    var chd = this.children[c];
                    if (chd) {
                        for (var i = 0; i < chd.length; i++) {
                            view = $e.getView(chd[i], an);
                            if (view) {
                                view.release(withado, withchild);
                            }
                        }
                    }
                }
                this.children = null;
            }
            $e.ui.releaseView(this, withado);
        }
    };

    var plugin = {
        /**
         * 创建容器组件实例
         * @param {Object} options - 配置选项
         * @returns {ContainerView} 容器组件实例
         */
        create : function(options) {
            return new ContainerView(options);
        },

        /**
         * 获取视图原型
         * @returns {Object} 视图原型对象
         */
        viewPrototype : function() {
            return ContainerView.prototype;
        }
    };
    $e.ui.addViewPlugin("view_container", plugin);
}($e);