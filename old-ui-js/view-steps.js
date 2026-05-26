/**
 * @file 步骤条组件
 * @description 支持水平/垂直布局、自定义图标、步骤状态管理等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 *
 * @example
 * // 创建水平步骤条
 * var steps = new yc_view_Steps();
 * var container = steps.init([
 *     { title: '步骤一', icon: 1, content: '第一步描述' },
 *     { title: '步骤二', icon: 2, content: '第二步描述' },
 *     { title: '步骤三', icon: 3, content: '第三步描述' }
 * ]);
 *
 * // 创建垂直时间线
 * var timeline = new yc_view_Steps();
 * var container = timeline.initTimeLine([
 *     { title: '事件一', icon: '&#128197;', content: '事件描述' }
 * ]);
 */

/**
 * 步骤条组件构造函数
 * @class yc_view_Steps
 */
function yc_view_Steps() {}

yc_view_Steps.prototype = {
    /**
     * 默认步骤数据
     * @type {Array}
     */
    data: [
        {
            title: '步骤一',
            icon: 1,
            content: '这是一段很长很长很长的描述性文字'
        },
        {
            title: '步骤二',
            icon: 2,
            content: '这是一段很长很长很长的描述性文字'
        },
        {
            title: '步骤三',
            icon: 3,
            content: '这是一段很长很长很长的描述性文字'
        },
        {
            title: '步骤四',
            icon: 4,
            content: '这是一段很长很长很长的描述性文字'
        },
        {
            title: '步骤五',
            icon: 5,
            content: '这是一段很长很长很长的描述性文字'
        },
        {
            title: '步骤六',
            icon: 6,
            content: '这是一段很长很长很长的描述性文字'
        }
    ],

    /**
     * 控制数据
     * @namespace
     * @property {number} currentStep - 当前步骤（从1开始）
     */
    ctrlData: {
        currentStep: 1
    },

    /**
     * 创建水平步骤条
     * @public
     * @param {Array} [data] - 步骤数据数组
     * @returns {HTMLElement} 步骤条容器元素
     */
    init: function (data) {
        data = data || this.data;

        this.body = document.createElement('div');
        this.body.classList.add('yc-view-steps-shell');
        this.body.classList.add('steps-horizontal');

        this.initialize(data);

        return this.body;
    },

    /**
     * 创建垂直时间线
     * @public
     * @param {Array} [data] - 步骤数据数组
     * @returns {HTMLElement} 时间线容器元素
     */
    initTimeLine: function (data) {
        data = data || this.data;

        this.body = document.createElement('div');
        this.body.classList.add('yc-view-steps-shell');
        this.body.classList.add('steps-vertical');

        this.initializeTimeLine(data);

        return this.body;
    },

    /**
     * 初始化水平步骤条DOM结构
     * @private
     * @param {Array} data - 步骤数据数组
     * @returns {void}
     */
    initialize: function (data) {
        for (var i = 0; i < data.length; i++) {
            var stepPart = document.createElement('div');
            stepPart.classList.add('yc-view-steps');
            stepPart.classList.add('steps-wait');

            var stepHead = document.createElement('div');
            stepHead.classList.add('steps-head');

            var stepLine = document.createElement('div');
            stepLine.classList.add('steps-line');

            var stepLineInner = document.createElement('div');
            stepLineInner.classList.add('steps-line-inner');
            stepLineInner.style.cssText = 'border-width: 0px; width: 0%;';

            var stepIcon = document.createElement('div');
            stepIcon.classList.add('steps-icon');

            var stepIconInner = document.createElement('div');
            stepIconInner.classList.add('steps-icon-inner');
            stepIconInner.innerHTML = data[i].icon;

            stepLine.appendChild(stepLineInner);
            stepIcon.appendChild(stepIconInner);
            stepHead.appendChild(stepLine);
            stepHead.appendChild(stepIcon);

            var stepMain = document.createElement('div');
            stepMain.classList.add('steps-main');

            var stepTitle = document.createElement('div');
            stepTitle.classList.add('steps-title');
            stepTitle.innerHTML = data[i].title;

            stepMain.appendChild(stepTitle);

            if (Array.isArray(data[i].content)) {
                for (var j = 0; j < data[i].content.length; j++) {
                    var stepContent = document.createElement('div');
                    stepContent.classList.add('steps-content');
                    stepContent.innerHTML = data[i].content[j];
                    stepMain.appendChild(stepContent);
                }
            } else {
                var stepContent = document.createElement('div');
                stepContent.classList.add('steps-content');
                stepContent.innerHTML = data[i].content;
                stepMain.appendChild(stepContent);
            }

            stepPart.appendChild(stepHead);
            stepPart.appendChild(stepMain);

            this.body.appendChild(stepPart);
        }

        this.setStatus();
    },

    /**
     * 初始化垂直时间线DOM结构
     * @private
     * @param {Array} data - 步骤数据数组
     * @returns {void}
     */
    initializeTimeLine: function (data) {
        for (var i = 0; i < data.length; i++) {
            var stepPart = document.createElement('div');
            stepPart.classList.add('yc-view-steps');
            stepPart.classList.add('steps-process');

            var stepHead = document.createElement('div');
            stepHead.classList.add('steps-head');

            var stepLine = document.createElement('div');
            stepLine.classList.add('steps-line');

            var stepLineInner = document.createElement('div');
            stepLineInner.classList.add('steps-line-inner');
            stepLineInner.style.cssText = 'border-width: 0px; width: 0%;';

            var stepIcon = document.createElement('div');
            stepIcon.classList.add('steps-icon');

            var stepIconInner = document.createElement('div');
            stepIconInner.classList.add('steps-icon-inner');
            stepIconInner.innerHTML = data[i].icon;

            stepLine.appendChild(stepLineInner);
            stepIcon.appendChild(stepIconInner);
            stepHead.appendChild(stepLine);
            stepHead.appendChild(stepIcon);

            var stepMain = document.createElement('div');
            stepMain.classList.add('steps-main');

            var stepTitle = document.createElement('div');
            stepTitle.classList.add('steps-title');
            stepTitle.innerHTML = data[i].title;

            stepMain.appendChild(stepTitle);

            if (Array.isArray(data[i].content)) {
                for (var j = 0; j < data[i].content.length; j++) {
                    var stepContent = document.createElement('div');
                    stepContent.classList.add('steps-content');
                    stepContent.innerHTML = data[i].content[j];
                    stepMain.appendChild(stepContent);
                }
            } else {
                var stepContent = document.createElement('div');
                stepContent.classList.add('steps-content');
                stepContent.innerHTML = data[i].content;
                stepMain.appendChild(stepContent);
            }

            stepPart.appendChild(stepHead);
            stepPart.appendChild(stepMain);

            this.body.appendChild(stepPart);
        }
    },

    /**
     * 设置步骤状态
     * @public
     * @param {number} [index] - 目标步骤索引
     * @param {string} [role='steps'] - 角色类型：steps（步骤条）/ timeline（时间线）
     * @returns {void}
     */
    setStatus: function (index, role) {
        role = role || 'steps';
        var current = index || this.ctrlData.currentStep;
        current = current - 1;

        var domArr = Array.prototype.slice.call(this.body.children);

        if (current >= 0 && current < domArr.length) {
            for (var i = 0; i <= current; i++) {
                domArr[i].classList.remove('steps-wait');
                domArr[i].classList.remove('steps-process');
                domArr[i].classList.add('steps-finish');
                if (role === 'steps') {
                    domArr[i].querySelector('.steps-line-inner').style.cssText = 'border-width: 1px; width: 100%; transition-delay: .15s;';
                } else if (role === 'timeline') {
                    domArr[i].querySelector('.steps-line-inner').style.cssText = 'border-width: 1px; width: 3px; transition-delay: .15s;';
                }
            }
        }

        var restDom = domArr.slice(current + 1, domArr.length);

        for (var i = 0; i < restDom.length; i++) {
            restDom[i].classList.add('steps-wait');
            restDom[i].querySelector('.steps-line-inner').style.cssText = 'border-width: 0; width: 0; transition-delay: -.15s;';
        }

        if (current >= 0 && current < domArr.length) {
            domArr[current].classList.remove('steps-wait');
            domArr[current].classList.remove('steps-finish');
            domArr[current].classList.add('steps-process');
        }

        this.ctrlData.currentStep = current + 1;
    },

    /**
     * 前进或后退步骤
     * @public
     * @param {number} [step] - 步骤数（正数前进，负数后退，不传默认前进1步）
     * @returns {void}
     */
    go: function (step) {
        if (step === undefined || step > 0) {
            this.ctrlData.currentStep += 1;
            if (this.ctrlData.currentStep > this.data.length) {
                this.ctrlData.currentStep = this.data.length;
            }
        } else {
            this.ctrlData.currentStep -= 1;
            if (this.ctrlData.currentStep <= 0) {
                this.ctrlData.currentStep = 1;
            }
        }

        this.setStatus();
    }
};

/**
 * 注册步骤条组件到全局对象
 * @private
 */
(function () {
    var obj = {
        'steps': yc_view_Steps
    };

    Object.defineProperty($e, 'viewGenerator', {
        value: obj,
        writable: false
    });
})();