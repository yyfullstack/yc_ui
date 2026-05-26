/**
 * @file Carousel轮播组件
 * @description 提供轮播图展示功能，支持滑动和淡入淡出动画，支持自动播放和指示器
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * CarouselView 轮播组件
     * 用于展示轮播图片或内容，支持多种动画效果
     * @class
     * @param {Object} options 配置项
     * @param {Array} [options.slides] 轮播项数组
     * @param {number} [options.height=300] 轮播高度(像素)
     * @param {string} [options.transition='slide'] 过渡动画: slide/fade
     * @param {boolean} [options.autoplay=false] 是否自动播放
     * @param {number} [options.interval=3000] 自动播放间隔(毫秒)
     * @param {boolean} [options.showArrows=true] 是否显示箭头
     * @param {boolean} [options.showIndicators=true] 是否显示指示器
     * @param {boolean} [options.pauseOnHover] 悬停时是否暂停
     * @param {Function} [options.onChange] 切换回调
     */
    function CarouselView(options) {
        this.props = options;
        /** @type {Array} 轮播项元素数组 */
        this.slides = [];
        /** @type {Array} 事件监听器数组 */
        this._listeners = [];
        /** @type {number} 当前索引 */
        this._currentIndex = 0;
        /** @type {number} 自动播放定时器 */
        this._autoplayTimer = null;
    }

    CarouselView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_carousel',
        body: null,
        shell: null,
        slides: null,
        _listeners: null,
        _currentIndex: 0,
        _autoplayTimer: null,
        _track: null,
        _indicators: null,

        /**
         * 初始化组件
         * @public
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildCarousel();
            this.inited();
        },

        /**
         * 构建轮播组件结构
         * @public
         */
        buildCarousel: function () {
            var options = this.props;
            var height = options.height || 300;
            var transition = options.transition || 'slide';
            var autoplay = options.autoplay || false;
            var interval = options.interval || 3000;
            var showArrows = options.showArrows !== false;
            var showIndicators = options.showIndicators !== false;

            $e.fn.addClass(this.shell, 'yc-carousel');
            $e.fn.addClass(this.shell, 'yc-carousel--' + transition);

            var viewport = $e.fn.create('div');
            $e.fn.addClass(viewport, 'yc-carousel__viewport');
            viewport.style.height = height + 'px';

            var track = $e.fn.create('div');
            $e.fn.addClass(track, 'yc-carousel__track');
            this._track = track;
            viewport.appendChild(track);

            this.getBody().appendChild(viewport);

            if (options.slides instanceof Array) {
                for (var i = 0; i < options.slides.length; i++) {
                    this.addSlide(options.slides[i]);
                }
            }

            if (showArrows) {
                var prevBtn = $e.fn.create('button');
                $e.fn.addClass(prevBtn, 'yc-carousel__arrow');
                $e.fn.addClass(prevBtn, 'yc-carousel__arrow--prev');
                prevBtn.innerHTML = '&#10094;';

                var self = this;
                this.bindListen($e.events.regEvent(prevBtn, 'click', this, function () {
                    self.prev();
                }));

                viewport.appendChild(prevBtn);

                var nextBtn = $e.fn.create('button');
                $e.fn.addClass(nextBtn, 'yc-carousel__arrow');
                $e.fn.addClass(nextBtn, 'yc-carousel__arrow--next');
                nextBtn.innerHTML = '&#10095;';

                this.bindListen($e.events.regEvent(nextBtn, 'click', this, function () {
                    self.next();
                }));

                viewport.appendChild(nextBtn);
            }

            if (showIndicators) {
                var indicators = $e.fn.create('div');
                $e.fn.addClass(indicators, 'yc-carousel__indicators');
                this._indicators = indicators;

                for (var i = 0; i < this.slides.length; i++) {
                    var dot = $e.fn.create('button');
                    $e.fn.addClass(dot, 'yc-carousel__indicator');
                    if (i === 0) {
                        $e.fn.addClass(dot, 'is-active');
                    }
                    dot.setAttribute('data-index', i);

                    this.bindListen($e.events.regEvent(dot, 'click', this, function (e) {
                        self.goTo(parseInt(e.target.getAttribute('data-index'), 10));
                    }));

                    indicators.appendChild(dot);
                }

                viewport.appendChild(indicators);
            }

            this.updatePosition();

            if (autoplay) {
                this.startAutoplay(interval);
            }

            if (options.pauseOnHover) {
                this.bindListen($e.events.regEvent(viewport, 'mouseenter', this, function () {
                    self.stopAutoplay();
                }));
                this.bindListen($e.events.regEvent(viewport, 'mouseleave', this, function () {
                    self.startAutoplay(interval);
                }));
            }
        },

        /**
         * 添加轮播项
         * @public
         * @param {Object} slideOptions 轮播项配置
         * @returns {HTMLElement} 轮播项元素
         */
        addSlide: function (slideOptions) {
            var slide = $e.fn.create('div');
            $e.fn.addClass(slide, 'yc-carousel__slide');

            if (slideOptions.image) {
                var img = $e.fn.create('img');
                $e.fn.addClass(img, 'yc-carousel__slide-image');
                img.src = slideOptions.image;
                slide.appendChild(img);
            }

            if (slideOptions.content) {
                var content = $e.fn.create('div');
                $e.fn.addClass(content, 'yc-carousel__slide-content');
                content.innerHTML = slideOptions.content;
                slide.appendChild(content);
            }

            if (slideOptions.title) {
                var title = $e.fn.create('div');
                $e.fn.addClass(title, 'yc-carousel__slide-title');
                title.innerHTML = slideOptions.title;
                slide.appendChild(title);
            }

            if (slideOptions.description) {
                var desc = $e.fn.create('div');
                $e.fn.addClass(desc, 'yc-carousel__slide-description');
                desc.innerHTML = slideOptions.description;
                slide.appendChild(desc);
            }

            this._track.appendChild(slide);
            this.slides.push(slide);

            return slide;
        },

        /**
         * 跳转到指定索引
         * @public
         * @param {number} index 索引
         */
        goTo: function (index) {
            if (index < 0) {
                index = this.slides.length - 1;
            } else if (index >= this.slides.length) {
                index = 0;
            }

            this._currentIndex = index;
            this.updatePosition();
            this.updateIndicators();

            if (this.props.onChange) {
                this.props.onChange(index, this.slides[index]);
            }
        },

        /**
         * 下一项
         * @public
         */
        next: function () {
            this.goTo(this._currentIndex + 1);
        },

        /**
         * 上一项
         * @public
         */
        prev: function () {
            this.goTo(this._currentIndex - 1);
        },

        /**
         * 更新位置
         * @public
         */
        updatePosition: function () {
            var transition = this.props.transition || 'slide';

            if (transition === 'slide') {
                this._track.style.transform = 'translateX(-' + (this._currentIndex * 100) + '%)';
            } else if (transition === 'fade') {
                for (var i = 0; i < this.slides.length; i++) {
                    if (i === this._currentIndex) {
                        $e.fn.addClass(this.slides[i], 'is-active');
                    } else {
                        $e.fn.removeClass(this.slides[i], 'is-active');
                    }
                }
            }
        },

        /**
         * 更新指示器状态
         * @public
         */
        updateIndicators: function () {
            if (!this._indicators) {
                return;
            }

            var dots = this._indicators.querySelectorAll('.yc-carousel__indicator');
            for (var i = 0; i < dots.length; i++) {
                if (i === this._currentIndex) {
                    $e.fn.addClass(dots[i], 'is-active');
                } else {
                    $e.fn.removeClass(dots[i], 'is-active');
                }
            }
        },

        /**
         * 开始自动播放
         * @public
         * @param {number} interval 间隔时间(毫秒)
         */
        startAutoplay: function (interval) {
            var self = this;
            this.stopAutoplay();
            this._autoplayTimer = setInterval(function () {
                self.next();
            }, interval || 3000);
        },

        /**
         * 停止自动播放
         * @public
         */
        stopAutoplay: function () {
            if (this._autoplayTimer) {
                clearInterval(this._autoplayTimer);
                this._autoplayTimer = null;
            }
        },

        /**
         * 释放组件资源
         * @public
         */
        selfRelease: function () {
            this.stopAutoplay();

            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }

            this._listeners = null;
            this.slides = null;
            this._track = null;
            this._indicators = null;
            this.body = null;
        },

        /**
         * 窗口resize处理
         * @public
         * @param {Object} options 选项
         */
        resize: function (options) {
        }
    };

    var plugin = {
        /**
         * 创建Carousel组件实例
         * @public
         * @param {Object} options 配置项
         * @returns {CarouselView} Carousel实例
         */
        create: function (options) {
            return new CarouselView(options);
        }
    };

    $e.ui.addViewPlugin('view_carousel', plugin);
}($e);
