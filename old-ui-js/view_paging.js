/**
 * @file 分页组件
 * @description 支持数据分页、页码跳转、页面监听等功能，与ADO数据对象绑定
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var paging = $e.ui.createView('view_paging', {
 *     adoName: 'myData',
 *     showPages: 10,
 *     showPageGO: true
 * });
 */
+function ($e) {
    'use strict';

    /**
     * 分页视图组件构造函数
     * @class PagingView
     * @param {Object} options - 配置选项
     * @param {string} [options.adoName] - 绑定的ADO数据对象名称
     * @param {number} [options.showPages=10] - 显示的页码数量
     * @param {boolean} [options.showPageGO=false] - 是否显示跳转输入框
     */
    function PagingView(options) {
        this.props = options || {};
        this.adoName = options['adoName'];
        this.showPages = parseInt(options['showPages'] || 10, 10);
        this.showPageGO = $e.fn.getBoolean(options['showPageGO'], false);
    }

    PagingView.prototype = {
        VERSION: '3.0.1',
        _startPage: 0,
        _toPage: 1,
        _lock: false,
        showPages: null,
        showPageGO: null,
        currentPage: 0,
        pageCount: 0,
        type: 'view_paging',
        _inited: false,

        /**
         * 初始化分页组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.initPageCell();
            this.initEvent();
            this.showGOPage(this.showPageGO);
            var ado = this.getADO();
            if (ado) {
                this.dataListenHandle = ado.addListen({context: this, method: this.doDataListen});
                if (ado.isInited) {
                    this.repaint(ado);
                }
            }
            this._inited = true;
        },

        /**
         * 初始化页码单元格
         * @private
         * @returns {void}
         */
        initPageCell: function () {
            var pageBody = this.body.querySelector('.yc-view-paging-list');
            $e.fn.setChild(pageBody, null);
            for (var i = 0; i < this.showPages; i++) {
                var cell = this.createPageCell(i + 1);
                pageBody.appendChild(cell);
            }
        },

        /**
         * 显示或隐藏跳转输入框
         * @public
         * @param {boolean} isShow - 是否显示
         * @returns {void}
         */
        showGOPage: function (isShow) {
            var pageGo = this.body.querySelector('[view-band="footer"]');
            if (pageGo) {
                if (isShow) {
                    $e.fn.removeClass(pageGo, 'hide');
                } else {
                    $e.fn.addClass(pageGo, 'hide');
                }
            }
            this.showPageGO = isShow;
        },

        /**
         * 初始化事件绑定
         * @private
         * @returns {void}
         */
        initEvent: function () {
            var btns = this.shell.querySelectorAll('[paging-btn]');
            var name;
            for (var i = 0; i < btns.length; i++) {
                name = btns[i].getAttribute('paging-btn');
                if (typeof this[name] === 'function') {
                    this.bindListen($e.events.regEvent(btns[i], 'click', this, this[name]));
                }
            }
            var btnGroup = this.body.querySelector('.yc-view-paging-list');
            this.bindListen($e.events.regEvent(btnGroup, 'click', this, this.done));
        },

        /**
         * 点击页码处理
         * @private
         * @param {Event} event - 点击事件对象
         * @returns {void}
         */
        done: function (event) {
            var cell = event.target || event.srcElement;
            if (cell.nodeName.toLowerCase() === 'li') {
                var num = parseInt(cell.innerText, 10) - 1;
                this.toPage(num, true);
            }
        },

        /**
         * 创建页码单元格元素
         * @private
         * @param {number} num - 页码数字
         * @returns {HTMLElement} 创建的页码元素
         */
        createPageCell: function (num) {
            var cell = $e.fn.create('li', 'paging-item');
            $e.fn.setLabelText(cell, num);
            return cell;
        },

        /**
         * 更新页码显示
         * @public
         * @param {Object} ado - ADO数据对象
         * @returns {void}
         */
        repaint: function (ado) {
            var pg = ado.getDataPage();
            var pageCount = pg.getPageCount();
            var current = pg.getCurrentPage();
            var pages = this.showPages;
            var cells = this.body.querySelector('.yc-view-paging-list').querySelectorAll('li');

            if (pageCount <= 0) {
                pages = 1;
                for (var i = 0; i < cells.length; i++) {
                    if (i !== 0) {
                        $e.fn.addClass(cells[i], 'hide');
                    }
                }
            } else {
                for (var i = 0; i < cells.length; i++) {
                    $e.fn.removeClass(cells[i], 'hide');
                }
                if (pages >= pageCount) {
                    this._startPage = 0;
                    this._toPage = pageCount;
                    for (var i = pageCount; i < pages; i++) {
                        $e.fn.addClass(cells[i], 'hide');
                    }
                } else {
                    var halfPages = parseInt(pages / 2, 10);
                    if (current < halfPages) {
                        this._startPage = 0;
                        this._toPage = pages;
                    } else if (current + halfPages >= pageCount) {
                        this._toPage = pageCount;
                        this._startPage = pageCount - pages;
                    } else {
                        this._startPage = current - halfPages;
                        this._toPage = this._startPage + pages;
                    }
                }
            }

            var currentCell = this.body.querySelector('.yc-view-paging-list').querySelector('.paging-item-selected');
            if (currentCell) {
                $e.fn.removeClass(currentCell, 'paging-item-selected');
            }

            for (var i = 0, j = this._startPage; i < cells.length && j < this._toPage; i++, j++) {
                if (j === current) {
                    this.showPageNO(cells[i], current);
                }
                cells[i].innerText = (j + 1);
            }
        },

        /**
         * 显示当前页码
         * @private
         * @param {HTMLElement} cell - 页码元素
         * @param {number} current - 当前页码
         * @returns {void}
         */
        showPageNO: function (cell, current) {
            $e.fn.addClass(cell, 'paging-item-selected');
            var pageSum = this.body.querySelector('.yc-view-paging-sum');
            if (pageSum) {
                pageSum.innerText = (current + 1) + '/' + this.pageCount;
            }
        },

        /**
         * 数据监听处理
         * @private
         * @param {Object} options - 事件选项
         * @param {Object} options.ado - ADO数据对象
         * @param {string} options.eventType - 事件类型
         * @returns {void}
         */
        doDataListen: function (options) {
            var dp = options.ado.getDataPage();
            var pageCount = dp.getPageCount() || 1;
            if (options.eventType === ado_status.REFRESH && (this.pageCount !== pageCount || dp.getCurrentPage() !== this.getCurrentPage()) && !this._lock) {
                this.pageCount = pageCount || 1;
                this.repaint(options.ado);
            }
        },

        /**
         * 显示或隐藏按钮组
         * @public
         * @param {HTMLElement} node - 容器节点
         * @param {boolean} isShow - 是否显示
         * @returns {void}
         */
        showFrameButton: function (node, isShow) {
            var btns = node.querySelectorAll('.btn');
            if (btns) {
                for (var i = 0; i < btns.length; i++) {
                    $e.fn.enableField(btns[i], isShow);
                }
            }
        },

        /**
         * 添加页面变动监听
         * @public
         * @param {Object} listen - 监听对象
         * @returns {Object} 监听句柄
         */
        addPageListen: function (listen) {
            return this.bindListen(listen);
        },

        /**
         * 移除页面变动监听
         * @public
         * @param {Object} handle - 监听句柄
         * @returns {void}
         */
        removePageListen: function (handle) {
            this.unBindListen(handle);
        },

        /**
         * 执行页面监听回调
         * @private
         * @returns {void}
         */
        doPageListen: function () {
            if (this._becs) {
                this._becs.done(this);
            }
        },

        /**
         * 跳转指定页码（通过输入框）
         * @public
         * @returns {void}
         */
        goPage: function () {
            var num = this.body.querySelector('input').value;
            num = isNaN(parseInt(num, 10)) ? 0 : parseInt(num, 10);
            num = num < 1 ? 1 : (num > this.pageCount ? this.pageCount : num);
            this.toPage(num - 1);
        },

        /**
         * 获取当前页码
         * @public
         * @returns {number} 当前页码
         */
        getCurrentPage: function () {
            return this.currentPage;
        },

        /**
         * 跳转到指定页面
         * @public
         * @param {number} page - 目标页码
         * @param {boolean} [light=false] - 是否轻量更新（仅更新页码高亮）
         * @returns {void}
         */
        toPage: function (page, light) {
            var ado = this.getADO();
            var current = ado.getDataPage().getCurrentPage();
            if (page !== current) {
                var options = {
                    success: {
                        method: function () {
                            this.currentPage = ado.getDataPage().getCurrentPage();
                            if (light) {
                                this.lightPage(this.currentPage);
                            } else {
                                this.repaint(ado);
                            }
                            this._lock = false;
                        },
                        context: this
                    }
                };
                this._lock = true;
                ado.toPage(page, options);
            }
        },

        /**
         * 轻量更新页码高亮
         * @private
         * @param {number} page - 目标页码
         * @returns {void}
         */
        lightPage: function (page) {
            if (page >= this._startPage && page < this._toPage) {
                var selectedEl = this.body.querySelector('.paging-item-selected');
                if (selectedEl) {
                    $e.fn.removeClass(selectedEl, 'paging-item-selected');
                }
                var items = this.body.querySelectorAll('.paging-item');
                var num = page - this._startPage;
                if (num >= 0 && num < items.length) {
                    this.showPageNO(items[num], page);
                }
            }
        },

        /**
         * 上一页
         * @public
         * @returns {void}
         */
        prePage: function () {
            var currentPage = this.getCurrentPage();
            if (currentPage > 0) {
                this.toPage(currentPage - 1);
            }
        },

        /**
         * 下一页
         * @public
         * @returns {void}
         */
        nextPage: function () {
            var currentPage = this.getCurrentPage();
            if (currentPage + 1 < this.pageCount) {
                this.toPage(currentPage + 1);
            }
        },

        /**
         * 第一页
         * @public
         * @returns {void}
         */
        firstPage: function () {
            this.toPage(0);
        },

        /**
         * 最后一页
         * @public
         * @returns {void}
         */
        lastPage: function () {
            this.toPage(this.pageCount - 1);
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建分页组件实例
         * @param {Object} options - 组件配置
         * @returns {PagingView} 分页组件实例
         */
        create: function (options) {
            return new PagingView(options);
        }
    };

    $e.ui.addViewPlugin('view_paging', plugin);
}($e);