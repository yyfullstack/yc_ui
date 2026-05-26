/**
 * @file 特效组件模块
 * @description 提供复选框点击特效等视觉增强功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */

var components = {};

(function () {
    'use strict';

    /**
     * AmazingCheckBox 复选框特效组件
     * @class
     */
    function AmazingCheckBox() {}

    AmazingCheckBox.prototype = {
        /**
         * 初始化复选框特效
         * @public
         * @param {HTMLElement} target - 目标元素
         * @returns {void}
         */
        init: function (target) {
            if (document.body.animate) {
                partyPop(target);
            }
        }
    };

    Object.defineProperty(components, 'checkbox', {
        value: new AmazingCheckBox()
    });

    /**
     * 派对爆发特效
     * @private
     * @param {HTMLElement} target - 目标元素
     * @returns {void}
     */
    function partyPop(target) {
        let input = target;
        let label = input.closest('label');

        if (input && label) {
            if (input.checked) {
                let particles = 14;
                for (let p = 0; p < particles; ++p) {
                    let angleInc = 360 / particles;
                    let angle = angleInc * p;

                    if (p % 2 === 1) {
                        angle -= angleInc / 2;
                    }

                    confetti(label, angle);
                }
            } else {
                while (label.querySelector('span')) {
                    label.removeChild(label.lastChild);
                }
            }
        }
    }

    /**
     * 创建彩纸粒子
     * @private
     * @param {HTMLElement} el - 父元素
     * @param {number} angle - 角度
     * @param {number} [hue=0] - 色相
     * @returns {void}
     */
    function confetti(el, angle, hue) {
        var hueValue = hue || 0;
        let particle = document.createElement('span');
        let start = 0.75;
        let end = 2.25;
        let middle = (start + end) / 2;
        let angleInRad = angle * Math.PI / 180;
        let angleSin = Math.sin(angleInRad);
        let angleCos = Math.cos(angleInRad);
        let pointA = {
            x: start * angleSin,
            y: start * angleCos
        };
        let pointB = {
            x: middle * angleSin,
            y: middle * angleCos
        };
        let pointC = {
            x: end * angleSin,
            y: end * angleCos
        };
        let rootEl = document.querySelector(':root');
        let durationInMs = propertyUnitsStripped(rootEl, '--duration', 's') * 1e3;
        let animation = particle.animate([
            {
                transform: 'translate(' + pointA.x + 'em,' + pointA.y + 'em) scale(0)'
            },
            {
                transform: 'translate(' + pointB.x + 'em,' + pointB.y + 'em) scale(1)'
            },
            {
                transform: 'translate(' + pointC.x + 'em,' + pointC.y + 'em) scale(0)'
            }
        ], {
            duration: durationInMs * 0.75,
            easing: 'linear',
            delay: durationInMs * 0.25
        });
        let bgHue = Math.round(angle);
        particle.style.background = 'hsl(' + bgHue + ',90%,45%)';
        el.appendChild(particle);
        animation.onfinish = particle.remove.bind(particle);
    }

    /**
     * 移除CSS属性单位
     * @private
     * @param {HTMLElement} el - 元素
     * @param {string} property - 属性名
     * @param {string} unit - 单位
     * @returns {number} 数值
     */
    function propertyUnitsStripped(el, property, unit) {
        let cs = window.getComputedStyle(el);
        let valueRaw = cs.getPropertyValue(property);
        let value = +valueRaw.substr(0, valueRaw.indexOf(unit));
        return value;
    }

})();

if (window.diy_component === undefined) {
    Object.defineProperty(window, 'diy_component', {
        value: components
    });
}