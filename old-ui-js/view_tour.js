/**
 * @file Tour引导组件
 * @description 用于展示步骤引导，支持遮罩和高亮目标元素，提供上一步/下一步导航
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * var tour = $e.ui.createView('view_tour', {
 *     steps: [
 *         {
 *             target: '#element1',
 *             title: '第一步',
 *             description: '这是第一步的描述',
 *             placement: 'bottom'
 *         },
 *         {
 *             target: '#element2',
 *             title: '第二步',
 *             description: '这是第二步的描述',
 *             placement: 'right'
 *         }
 *     ]
 * });
 * tour.start();
 */
+function ($e) {
    'use strict';

    /**
     * TourView 引导组件
     * 用于展示步骤引导，支持遮罩和高亮目标元素
     * @class
     * @param {Object} options - 配置选项
     * @param {Array} [options.steps=[]] - 步骤数组
     * @param {number} [options.current=0] - 当前步骤索引
     * @param {boolean} [options.visible=false] - 是否可见
     * @param {boolean} [options.overlay=true] - 是否显示遮罩
     */
    function TourView(options) {
        this.props = options || {};
        this._steps = this.props['steps'] || [];
        this._current = this.props['current'] || 0;
        this._visible = $e.fn.getBoolean(this.props['visible'], false);
        this._overlay = $e.fn.getBoolean(this.props['overlay'], true);
        this._panelEl = null;
        this._overlayEl = null;
        this._spotlightEl = null;
        this._actionHandles = [];
    }

    TourView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_tour',
        shell: null,
        body: null,
        _steps: null,
        _current: 0,
        _visible: false,
        _overlay: true,
        _panelEl: null,
        _overlayEl: null,
        _spotlightEl: null,
        _actionHandles: null,

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.inited();
        },

        /**
         * 开始引导
         * @public
         * @returns {void}
         */
        start: function () {
            this._current = 0;
            this._visible = true;
            this.show();
        },

        /**
         * 显示引导
         * @public
         * @returns {void}
         */
        show: function () {
            if (!this._visible || this._steps.length === 0) return;
            this.createOverlay();
            this.createPanel();
            this.updateStep();
        },

        /**
         * 创建遮罩层
         * @private
         * @returns {void}
         */
        createOverlay: function () {
            if (this._overlayEl) {
                this.removeOverlay();
            }

            var overlay = document.createElement('div');
            $e.fn.addClass(overlay, 'yc-tour-overlay');
            if (this._overlay) {
                $e.fn.addClass(overlay, 'yc-tour-overlay--show');
            }
            document.body.appendChild(overlay);
            this._overlayEl = overlay;

            var spotlight = document.createElement('div');
            $e.fn.addClass(spotlight, 'yc-tour-overlay__spotlight');
            overlay.appendChild(spotlight);
            this._spotlightEl = spotlight;
        },

        /**
         * 创建引导面板
         * @private
         * @returns {void}
         */
        createPanel: function () {
            var _this = this;
            if (this._panelEl) {
                this.removePanel();
            }

            var panel = document.createElement('div');
            $e.fn.addClass(panel, 'yc-tour-panel');
            $e.fn.addClass(panel, 'yc-tour-panel--show');
            document.body.appendChild(panel);
            this._panelEl = panel;

            var header = document.createElement('div');
            $e.fn.addClass(header, 'yc-tour-panel__header');

            var headerContent = document.createElement('div');
            $e.fn.addClass(headerContent, 'yc-tour-panel__header-content');

            var title = document.createElement('h4');
            $e.fn.addClass(title, 'yc-tour-panel__title');
            headerContent.appendChild(title);
            header.appendChild(headerContent);

            var closeBtn = document.createElement('button');
            $e.fn.addClass(closeBtn, 'yc-tour-panel__close');
            closeBtn.innerHTML = '<i class="fa fa-close"></i>';
            header.appendChild(closeBtn);

            panel.appendChild(header);

            var body = document.createElement('div');
            $e.fn.addClass(body, 'yc-tour-panel__body');
            var desc = document.createElement('p');
            $e.fn.addClass(desc, 'yc-tour-panel__description');
            body.appendChild(desc);
            panel.appendChild(body);

            var footer = document.createElement('div');
            $e.fn.addClass(footer, 'yc-tour-panel__footer');

            var indicators = document.createElement('div');
            $e.fn.addClass(indicators, 'yc-tour-panel__indicators');
            footer.appendChild(indicators);

            var actions = document.createElement('div');
            $e.fn.addClass(actions, 'yc-tour-panel__actions');

            var prevBtn = document.createElement('button');
            $e.fn.addClass(prevBtn, 'yc-tour-btn');
            prevBtn.innerText = '上一步';
            actions.appendChild(prevBtn);

            var nextBtn = document.createElement('button');
            $e.fn.addClass(nextBtn, 'yc-tour-btn');
            $e.fn.addClass(nextBtn, 'yc-tour-btn--primary');
            nextBtn.innerText = '下一步';
            actions.appendChild(nextBtn);

            footer.appendChild(actions);
            panel.appendChild(footer);

            var closeHandle = this.bindListen($e.events.regEvent(closeBtn, 'click', this, function () {
                _this.close();
            }));
            this._actionHandles.push(closeHandle);

            var prevHandle = this.bindListen($e.events.regEvent(prevBtn, 'click', this, function () {
                _this.prev();
            }));
            this._actionHandles.push(prevHandle);

            var nextHandle = this.bindListen($e.events.regEvent(nextBtn, 'click', this, function () {
                _this.next();
            }));
            this._actionHandles.push(nextHandle);
        },

        /**
         * 更新当前步骤
         * @private
         * @returns {void}
         */
        updateStep: function () {
            if (!this._panelEl || this._steps.length === 0) return;

            var step = this._steps[this._current];
            if (!step) return;

            var title = this._panelEl.querySelector('.yc-tour-panel__title');
            if (title) {
                title.innerText = step.title || '';
            }

            var desc = this._panelEl.querySelector('.yc-tour-panel__description');
            if (desc) {
                desc.innerText = step.description || '';
            }

            var indicators = this._panelEl.querySelector('.yc-tour-panel__indicators');
            if (indicators) {
                indicators.innerHTML = '';
                for (var i = 0; i < this._steps.length; i++) {
                    var dot = document.createElement('span');
                    $e.fn.addClass(dot, 'yc-tour-panel__indicator');
                    if (i === this._current) {
                        $e.fn.addClass(dot, 'yc-tour-panel__indicator--active');
                    }
                    indicators.appendChild(dot);
                }
            }

            var prevBtn = this._panelEl.querySelector('.yc-tour-panel__footer .yc-tour-btn:first-child');
            if (prevBtn) {
                prevBtn.style.display = this._current === 0 ? 'none' : '';
            }

            var nextBtn = this._panelEl.querySelector('.yc-tour-panel__footer .yc-tour-btn--primary');
            if (nextBtn) {
                nextBtn.innerText = this._current === this._steps.length - 1 ? '完成' : '下一步';
            }

            this.positionPanel(step);
        },

        /**
         * 定位引导面板
         * @private
         * @param {Object} step - 步骤配置
         * @returns {void}
         */
        positionPanel: function (step) {
            var target = null;
            if (step.target) {
                target = typeof step.target === 'string' ? document.querySelector(step.target) : step.target;
            }

            var panel = this._panelEl;
            var placement = step.placement || 'bottom';

            if (target) {
                var rect = target.getBoundingClientRect();
                var panelRect = panel.getBoundingClientRect();
                var top, left;

                switch (placement) {
                    case 'top':
                        top = rect.top - panelRect.height - 12;
                        left = rect.left + (rect.width - panelRect.width) / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 12;
                        left = rect.left + (rect.width - panelRect.width) / 2;
                        break;
                    case 'left':
                        top = rect.top + (rect.height - panelRect.height) / 2;
                        left = rect.left - panelRect.width - 12;
                        break;
                    case 'right':
                        top = rect.top + (rect.height - panelRect.height) / 2;
                        left = rect.right + 12;
                        break;
                    default:
                        top = rect.bottom + 12;
                        left = rect.left;
                }

                panel.style.top = Math.max(10, top) + 'px';
                panel.style.left = Math.max(10, left) + 'px';

                if (this._spotlightEl) {
                    this._spotlightEl.style.top = rect.top + 'px';
                    this._spotlightEl.style.left = rect.left + 'px';
                    this._spotlightEl.style.width = rect.width + 'px';
                    this._spotlightEl.style.height = rect.height + 'px';
                }
            } else {
                panel.style.top = '50%';
                panel.style.left = '50%';
                panel.style.transform = 'translate(-50%, -50%)';
            }
        },

        /**
         * 下一步
         * @public
         * @returns {void}
         */
        next: function () {
            if (this._current < this._steps.length - 1) {
                this._current++;
                this.updateStep();
            } else {
                this.close();
                this.onFinish();
            }
        },

        /**
         * 上一步
         * @public
         * @returns {void}
         */
        prev: function () {
            if (this._current > 0) {
                this._current--;
                this.updateStep();
            }
        },

        /**
         * 关闭引导
         * @public
         * @returns {void}
         */
        close: function () {
            this._visible = false;
            this.removeOverlay();
            this.removePanel();
            this.onClose();
        },

        /**
         * 移除遮罩层
         * @private
         * @returns {void}
         */
        removeOverlay: function () {
            if (this._overlayEl && this._overlayEl.parentNode) {
                this._overlayEl.parentNode.removeChild(this._overlayEl);
            }
            this._overlayEl = null;
            this._spotlightEl = null;
        },

        /**
         * 移除引导面板
         * @private
         * @returns {void}
         */
        removePanel: function () {
            if (this._panelEl && this._panelEl.parentNode) {
                this._panelEl.parentNode.removeChild(this._panelEl);
            }
            this._panelEl = null;
        },

        /**
         * 设置步骤
         * @public
         * @param {Array} steps - 步骤数组
         * @returns {void}
         */
        setSteps: function (steps) {
            this._steps = steps || [];
            if (this._visible) {
                this.updateStep();
            }
        },

        /**
         * 获取步骤
         * @public
         * @returns {Array} 步骤数组
         */
        getSteps: function () {
            return this._steps;
        },

        /**
         * 设置当前步骤
         * @public
         * @param {number} index - 步骤索引
         * @returns {void}
         */
        setCurrent: function (index) {
            this._current = index;
            if (this._visible) {
                this.updateStep();
            }
        },

        /**
         * 获取当前步骤索引
         * @public
         * @returns {number} 步骤索引
         */
        getCurrent: function () {
            return this._current;
        },

        /**
         * 关闭回调
         * @protected
         * @returns {void}
         */
        onClose: function () {
        },

        /**
         * 完成回调
         * @protected
         * @returns {void}
         */
        onFinish: function () {
        },

        /**
         * 释放组件资源
         * @public
         * @returns {void}
         */
        selfRelease: function () {
            this.close();
            if (this._actionHandles) {
                for (var i = 0; i < this._actionHandles.length; i++) {
                    if (this._actionHandles[i]) {
                        this._actionHandles[i].release();
                    }
                }
                this._actionHandles = null;
            }
            this.shell = null;
            this.body = null;
        }
    };

    /**
     * 插件定义
     * @namespace
     */
    var plugin = {
        /**
         * 创建引导组件实例
         * @param {Object} options - 组件配置
         * @returns {TourView} 引导组件实例
         */
        create: function (options) {
            return new TourView(options);
        }
    };
    $e.ui.addViewPlugin("view_tour", plugin);
}($e);