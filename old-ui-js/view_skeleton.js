/**
 * @file 骨架屏组件
 * @description 用于在内容加载时展示占位图形，支持段落、图片、按钮等形状
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * SkeletonView 骨架屏组件
     * 用于在内容加载时展示占位图形，支持段落、图片、按钮等形状
     * @class
     * @param {Object} options - 配置选项
     * @param {boolean} [options.active=true] - 是否显示动画效果
     * @param {boolean} [options.avatar=false] - 是否显示头像占位
     * @param {boolean} [options.title=true] - 是否显示标题占位
     * @param {boolean} [options.paragraph=true] - 是否显示段落占位
     * @param {number} [options.rows=3] - 段落行数
     * @param {string} [options.shape='default'] - 占位形状：default/round
     */
    function SkeletonView(options) {
        this.props = options || {};
        this._active = $e.fn.getBoolean(this.props['active'], true);
        this._avatar = $e.fn.getBoolean(this.props['avatar'], false);
        this._title = $e.fn.getBoolean(this.props['title'], true);
        this._paragraph = $e.fn.getBoolean(this.props['paragraph'], true);
        this._rows = this.props['rows'] || 3;
        this._shape = this.props['shape'] || 'default';
    }

    SkeletonView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_skeleton',
        shell: null,
        body: null,
        _active: true,
        _avatar: false,
        _title: true,
        _paragraph: true,
        _rows: 3,
        _shape: 'default',

        /**
         * 初始化组件
         * @public
         * @returns {void}
         */
        init: function () {
            this.body = this.shell.querySelector('[view-band="body"]') || this.shell;
            $e.fn.addClass(this.shell, 'yc-skeleton');
            this.render();
            this.inited();
        },

        /**
         * 渲染Skeleton组件DOM结构
         * @private
         * @returns {void}
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';

            if (this._active) {
                $e.fn.addClass(shell, 'yc-skeleton-active');
            }

            if (this._avatar) {
                var avatarEl = document.createElement('div');
                avatarEl.className = 'yc-skeleton-avatar';
                if (this._shape === 'round') {
                    $e.fn.addClass(avatarEl, 'yc-skeleton-avatar-round');
                }
                shell.appendChild(avatarEl);
            }

            var contentWrap = document.createElement('div');
            contentWrap.className = 'yc-skeleton-content';

            if (this._title) {
                var titleEl = document.createElement('div');
                titleEl.className = 'yc-skeleton-title';
                if (this._shape === 'round') {
                    $e.fn.addClass(titleEl, 'yc-skeleton-title-round');
                }
                contentWrap.appendChild(titleEl);
            }

            if (this._paragraph) {
                var paragraphWrap = document.createElement('div');
                paragraphWrap.className = 'yc-skeleton-paragraph';
                for (var i = 0; i < this._rows; i++) {
                    var rowEl = document.createElement('div');
                    rowEl.className = 'yc-skeleton-row';
                    if (this._shape === 'round') {
                        $e.fn.addClass(rowEl, 'yc-skeleton-row-round');
                    }
                    paragraphWrap.appendChild(rowEl);
                }
                contentWrap.appendChild(paragraphWrap);
            }

            shell.appendChild(contentWrap);
        },

        /**
         * 设置加载状态
         * @public
         * @param {boolean} active - 是否处于加载状态
         * @returns {void}
         */
        setActive: function (active) {
            this._active = active;
            if (active) {
                $e.fn.addClass(this.shell, 'yc-skeleton-active');
            } else {
                $e.fn.removeClass(this.shell, 'yc-skeleton-active');
            }
        },

        /**
         * 显示骨架屏
         * @public
         * @returns {void}
         */
        show: function () {
            this.shell.style.display = 'block';
        },

        /**
         * 隐藏骨架屏
         * @public
         * @returns {void}
         */
        hide: function () {
            this.shell.style.display = 'none';
        }
    };

    var plugin = {
        create: function (options) {
            return new SkeletonView(options);
        }
    };

    $e.ui.addViewPlugin('view_skeleton', plugin);
}($e);