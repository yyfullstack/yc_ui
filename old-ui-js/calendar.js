/**
 * @file 日历组件模块
 * @description 提供日期选择、时间选择、年月选择等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 工具对象
     * @namespace
     */
    var myUtil = {
        /**
         * 遍历对象或数组
         * @public
         * @param {Object|Array} obj - 要遍历的对象
         * @param {Function} fn - 回调函数
         * @returns {Object} 工具对象
         */
        each: function (obj, fn) {
            var key;
            var that = this;
            if (typeof fn !== 'function') {
                return that;
            }
            obj = obj || [];
            if (obj.constructor === Object) {
                for (key in obj) {
                    if (obj.hasOwnProperty(key) && fn.call(obj[key], key, obj[key])) {
                        break;
                    }
                }
            } else {
                for (key = 0; key < obj.length; key++) {
                    if (fn.call(obj[key], key, obj[key])) {
                        break;
                    }
                }
            }
            return that;
        },

        /**
         * 数字补零
         * @public
         * @param {number} num - 数字
         * @param {number} [length] - 长度，默认为2
         * @returns {string} 补零后的字符串
         */
        digit: function (num, length) {
            var str = '';
            num = String(num);
            length = length || 2;
            for (var i = num.length; i < length; i++) {
                str += '0';
            }
            return num < Math.pow(10, length) ? str + (num | 0) : num;
        },

        /**
         * 构建日期数字
         * @public
         * @param {HTMLElement} child - 子元素
         * @param {number} num - 数字
         * @param {Date} date - 日期对象
         * @param {string} [type] - 类型，-m表示上月，+m表示下月
         */
        buildNum: function (child, num, date, type) {
            child.innerHTML = num;
            var year = date.getFullYear();
            var month = date.getMonth();
            if (type === '-m') {
                month--;
                if (month < 0) {
                    --year;
                    month = 11;
                }
            } else if (type === '+m') {
                month++;
                if (month > 11) {
                    ++year;
                    month = 0;
                }
            }
            var str = year + '-' + myUtil.digit((month + 1), 2) + '-' + myUtil.digit(num, 2);

            var now = new Date();
            var d = now.getDate();
            var m = now.getMonth();
            var y = now.getFullYear();
            if (d === num && m === month && y === year) {
                child.setAttribute('class', 'yc-datebox-today');
            }
            child.setAttribute('data-ymd', str);
            child.setAttribute('action', 'choose-day');
        }
    };

    /**
     * 日期框类
     * @class
     */
    function Datebox() {
        this.shell = $e.fn.create('div', 'yc-datebox');
        this.eventCell = $e.events.createEventCell();
        this.eventCell.add($e.events.regEvent(this.shell, 'click', this, this.changeEvent));
    }

    Datebox.prototype = {
        constructor: Datebox,
        /** @type {string} 版本号 */
        VERSION: '3.0.1',
        /** @type {Object|null} 属性 */
        props: null,
        /** @type {string} 类型 */
        type: 'yc-datebox',
        /** @type {string} 日期类型 */
        dateType: 'date',
        /** @type {HTMLElement|null} 节点 */
        node: null,
        /** @type {Date} 当前日期值 */
        globalVal: new Date(),
        /** @type {Array} 右下角显示的按钮 */
        btns: ['clear', 'now', 'confirm'],

        /**
         * 获取语言配置
         * @public
         * @returns {Object} 语言配置
         */
        lang: function () {
            return {
                weeks: ['日', '一', '二', '三', '四', '五', '六'],
                time: ['时', '分', '秒'],
                timeTips: '选择时间',
                dateTips: '返回日期',
                month: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
                tools: {
                    confirm: '确定',
                    clear: '清空',
                    now: '今日'
                }
            };
        },

        /**
         * 显示日期框
         * @public
         * @param {Object} options - 配置选项
         * @param {string} [options.dateType] - 日期类型
         * @param {HTMLElement} options.field - 输入字段
         * @param {HTMLElement} options.ref - 参考元素
         */
        show: function (options) {
            this.dateType = options.dateType || 'date';
            this.node = options.field;
            var val = options.field.value;
            var inputDate;
            var date;
            if (val) {
                val = val.replace(/-/g, '/');
                inputDate = Date.parse(val);
                date = isNaN(inputDate) ? new Date() : new Date(inputDate);
                if (options.type === 'date') {
                    date.setHours(0, 0, 0);
                }
                this.globalVal = date;
            } else {
                this.globalVal = new Date();
            }
            this.reference = options.ref;
            this.shell.innerHTML = '';
            this.render();
            document.body.appendChild(this.shell);
        },

        /**
         * 隐藏日期框
         * @public
         */
        hide: function () {
            document.body.removeChild(this.shell);
        },

        /**
         * 渲染界面
         * @public
         */
        render: function () {
            var that = this;
            var lang = that.lang();

            // 主区域
            var dateMain = that.dateMain = $e.fn.create('div', 'yc-datebox-body');
            var dateHeader = that.dateHeader = [];
            var dateCont = that.dateCont = $e.fn.create('div', 'yc-datebox-content');
            var dateTable = that.dateTable = $e.fn.create('table');

            // 底部区域
            var divFooter = that.footer = $e.fn.create('div', 'yc-datebox-footer');

            // 头部区域
            var divHeader = $e.fn.create('div', 'yc-datebox-header');

            // 左右切换
            var headerChild = [
                function () { // 上一年
                    var elem = $e.fn.create('i', 'fa fa-angle-double-left yc-datebox-prev-y');
                    elem.setAttribute('action', 'prev-y');
                    return elem;
                }(),
                function () { // 上一月
                    var elem = $e.fn.create('i', 'fa fa-angle-left yc-datebox-prev-m');
                    elem.setAttribute('action', 'prev-m');
                    return elem;
                }(),
                function () { // 年月选择
                    var elem = $e.fn.create('div', 'yc-datebox-set-ym');
                    var spanY = $e.fn.create('span', 'pick-year');
                    var spanM = $e.fn.create('span', 'pick-month');
                    spanY.setAttribute('action', 'pick-year');
                    spanM.setAttribute('action', 'pick-month');
                    elem.appendChild(spanY);
                    elem.appendChild(spanM);
                    return elem;
                }(),
                function () { // 下一月
                    var elem = $e.fn.create('i', 'fa fa-angle-right yc-datebox-next-m');
                    elem.setAttribute('action', 'next-m');
                    return elem;
                }(),
                function () { // 下一年
                    var elem = $e.fn.create('i', 'fa fa-angle-double-right yc-datebox-next-y');
                    elem.setAttribute('action', 'next-y');
                    return elem;
                }()
            ];

            // 日历星期显示区域
            var thead = $e.fn.create('thead');
            var theadTr = $e.fn.create('tr');

            // 生成年月选择
            myUtil.each(headerChild, function (i, item) {
                divHeader.appendChild(item);
            });

            // 生成表格
            thead.appendChild(theadTr);

            myUtil.each(new Array(6), function (i) { // 表体
                var tr = dateTable.insertRow(0);
                myUtil.each(new Array(7), function (j) {
                    if (i === 0) {
                        var th = $e.fn.create('th');
                        th.innerHTML = lang.weeks[j];
                        theadTr.appendChild(th);
                    }
                    tr.insertCell(j);
                });
            });

            dateTable.insertBefore(thead, dateTable.children[0]); // 表头
            dateCont.appendChild(dateTable);

            dateMain.appendChild(divHeader);
            dateMain.appendChild(dateCont);

            dateHeader.push(headerChild);
            // 生成底部栏
            var html = [];
            var btns = [];
            if (that.dateType === 'datetime') {
                html.push('<span action="datetime" class="yc-datebox-btns-time">' + lang.timeTips + '</span>');
            }

            myUtil.each(that.btns, function (i, item) {
                var title = lang.tools[item] || 'btn';
                btns.push('<span action="' + item + '" class="yc-datebox-btns-' + item + '">' + title + '</span>');
            });

            html.push('<div class="yc-datebox-footer-btns">' + btns.join('') + '</div>');

            divFooter.innerHTML = html.join('');

            // 插入到主区域
            this.shell.appendChild(dateMain);
            this.shell.appendChild(divFooter);
            that.calendar(); // 初始

            if (that.dateType === 'time') {
                that.pick('time');
            }
        },

        /**
         * 获取外壳元素
         * @public
         * @returns {HTMLElement} 外壳元素
         */
        getShell: function () {
            return this.shell;
        },

        /**
         * 渲染日历
         * @public
         */
        calendar: function () {
            var that = this;
            var date = that.globalVal;
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var monthDays = that.getMonthDays(year, month); // 计算一个月的天数
            var weekDay = (new Date(year, month, 1)).getDay(); // 计算每个月1号在星期几
            var lastMonthDays = that.getMonthDays(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1); // 上一个月天数
            var lastMonthDayCal = lastMonthDays - weekDay + 1; // 计算上个月在第一行显示的天数
            var num = 1;
            var nextNum = 1; // 日期显示
            var tbodyChild = that.dateTable.querySelector('tbody').children;
            var elemSpan = that.dateHeader[0][2].querySelectorAll('span');
            var elemYear = elemSpan.item(0);
            var elemMonth = elemSpan.item(1);

            elemYear.setAttribute('datebox-type', 'year');
            elemYear.innerHTML = year + '年';
            elemMonth.setAttribute('datebox-type', 'month');
            elemMonth.innerHTML = (month + 1) + '月';

            for (var i = 0; i < tbodyChild.length; i++) {
                var child = tbodyChild[i].children; // 遍历tr,获得td
                for (var j = 0; j < child.length; j++) {
                    if (i === 0) { // 在第一行 与第一天进行判断 大于等于第一天时载入日期
                        if (j >= weekDay) {
                            if (num === day) {
                                child[j].setAttribute('class', 'yc-datebox-current');
                            } else {
                                child[j].setAttribute('class', '');
                            }
                            myUtil.buildNum(child[j], num, date);
                            num++;
                        } else {
                            child[j].setAttribute('class', 'yc-datebox-prev-day');
                            myUtil.buildNum(child[j], lastMonthDayCal, date, '-m');
                            lastMonthDayCal++;
                        }
                    } else {
                        // 判断是否超出天数 ,不超出则继续加，超出则显示下个月日期
                        if (num <= monthDays) {
                            if (num === day) {
                                child[j].setAttribute('class', 'yc-datebox-current');
                            } else {
                                child[j].setAttribute('class', '');
                            }
                            myUtil.buildNum(child[j], num, date);
                            num++;
                        } else {
                            child[j].setAttribute('class', 'yc-datebox-next-day');
                            myUtil.buildNum(child[j], nextNum, date, '+m');
                            nextNum++;
                        }
                    }
                }
            }
        },

        /**
         * 获取月份天数
         * @public
         * @param {number} year - 年份
         * @param {number} month - 月份
         * @returns {number} 天数
         */
        getMonthDays: function (year, month) {
            return new Date(year, month + 1, 0).getDate();
        },

        /**
         * 变更事件
         * @public
         * @param {Event} e - 事件对象
         */
        changeEvent: function (e) {
            var that = this;
            $e.events.cancelEvent(e, true);
            var src = e.target || e.srcElement;
            if (src.getAttribute('action')) {
                var action = src.getAttribute('action');
                switch (action) {
                    // 上一年
                    case 'prev-y':
                        that.change('-y');
                        break;
                    // 上一月
                    case 'prev-m':
                        that.change('-m');
                        break;
                    // 选择年
                    case 'pick-year':
                        that.pick('year');
                        break;
                    // 选择月
                    case 'pick-month':
                        that.pick('month');
                        break;
                    // 下一年
                    case 'next-y':
                        that.change('y');
                        break;
                    // 下一月
                    case 'next-m':
                        that.change('m');
                        break;
                    // 选择日期
                    case 'choose-day':
                        var old = that.dateTable.querySelector('.yc-datebox-current');
                        if (old) {
                            $e.fn.removeClass(old, 'yc-datebox-current');
                        }
                        $e.fn.addClass(src, 'yc-datebox-current');
                        that.choose(src);
                        break;
                    // 底部按钮
                    case 'datetime':
                    case 'date':
                    case 'clear':
                    case 'now':
                    case 'confirm':
                        that.tool(src, action);
                        break;
                    // 选择年月
                    case 'choose-year':
                    case 'choose-month':
                        var ym = parseInt(src.getAttribute('data-ym'), 10);
                        if (action === 'choose-year') {
                            that.globalVal.setFullYear(ym);
                        } else {
                            that.globalVal.setMonth(ym);
                        }
                        that.calendar();
                        that.closeList();
                        break;
                }
            }
        },

        /**
         * 选择日期
         * @public
         * @param {HTMLElement} elem - 元素
         */
        choose: function (elem) {
            var that = this;
            var ref = that.reference;
            var ymd = elem.getAttribute('data-ymd');
            ymd = ymd.replace(/-/g, '/');
            var date = new Date(Date.parse(ymd));
            that.globalVal.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            if (that.dateType === 'date') {
                ref.$owner.setValue(that.globalVal);
                that.hide();
            } else if ($e.fn.hasClass(elem, 'yc-datebox-prev-day') || $e.fn.hasClass(elem, 'yc-datebox-next-day')) {
                that.calendar();
            }
        },

        /**
         * 切换年月
         * @public
         * @param {string} interval - 切换间隔
         */
        change: function (interval) {
            var that = this;
            var date = that.globalVal;
            var year = date.getFullYear();
            var month = date.getMonth();
            var elemCont = that.dateCont;
            var isYear = elemCont.querySelector('.yc-datebox-year-list');
            var isMonth = elemCont.querySelector('.yc-datebox-month-list');

            // 切换年列表
            if (isYear) {
                year = interval === '-y' ? year - 20 : year + 20;
                date.setFullYear(year);
                that.globalVal = date;
                that.pick('year');
                return;
            }

            if (isMonth) { // 切换月面板中的年
                that.pick('month');
            }

            switch (interval) {
                case 'y':
                    year++;
                    date.setFullYear(year);
                    break;
                case 'm':
                    month++;
                    if (month > 11) {
                        date.setFullYear(++year, 0);
                    } else {
                        date.setMonth(month);
                    }
                    break;
                case '-y':
                    year--;
                    date.setFullYear(year);
                    break;
                case '-m':
                    month--;
                    if (month < 0) {
                        date.setFullYear(--year, 11);
                    } else {
                        date.setMonth(month);
                    }
                    break;
            }
            that.globalVal = date;
            that.calendar();
        },

        /**
         * 选择年月时间
         * @public
         * @param {string} interval - 类型
         */
        pick: function (interval) {
            var that = this;
            var date = that.globalVal;
            var elemHeader = that.dateHeader[0];
            var elemCont = that.dateCont;
            var hasList = elemCont.querySelector('.yc-datebox-list');
            var year = date.getFullYear();
            var month = date.getMonth();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();
            var lang = that.lang();
            var cls = interval === 'time' ? 'yc-datebox-time-list' : interval === 'year' ? 'yc-datebox-year-list' : 'yc-datebox-month-list';
            var ul = $e.fn.create('ul', 'yc-datebox-list ' + cls);
            var hms = [hour, minute, second];
            var chooseTime = that.footer.querySelector('.yc-datebox-btns-time');

            switch (interval) {
                case 'year':
                    var yearNum;
                    var startY = yearNum = year - 9;
                    if (startY < 1) {
                        startY = yearNum = 1;
                    }
                    myUtil.each(new Array(20), function (i) {
                        var li = $e.fn.create('li');
                        var val = startY + i;
                        li.innerHTML = val;
                        li.setAttribute('data-ym', val);
                        li.setAttribute('action', 'choose-year');
                        if (startY + i === year) {
                            $e.fn.addClass(li, 'yc-datebox-current');
                        }
                        ul.appendChild(li);
                        yearNum++;
                    });
                    that.dateHeader[0][2].querySelector('[datebox-type="year"]').innerHTML = startY + '年' + '-' + (yearNum - 1) + '年';
                    break;
                case 'month':
                    myUtil.each(new Array(12), function (i) {
                        var li = $e.fn.create('li');
                        li.innerHTML = lang.month[i] + '月';
                        li.setAttribute('data-ym', i);
                        li.setAttribute('action', 'choose-month');
                        if (i === month) {
                            $e.fn.addClass(li, 'yc-datebox-current');
                        }
                        ul.appendChild(li);
                    });
                    break;
                case 'time':
                    myUtil.each([24, 60, 60], function (i, item) {
                        var li = $e.fn.create('li');
                        var childUL = ['<p>' + lang.time[i] + '</p><ol>'];
                        myUtil.each(new Array(item), function (ii) {
                            var clsStr = hms[i] === ii ? 'class="yc-datebox-current"' : '';
                            childUL.push('<li ' + clsStr + '>' + myUtil.digit(ii, 2) + '</li>');
                        });
                        li.innerHTML = childUL.join('') + '</ol>';
                        // 添加显示效果
                        var ol = li.querySelector('ol');
                        ol.onmouseover = function () {
                            ol.style.overflow = 'auto';
                        };
                        ol.onmouseleave = function () {
                            ol.style.overflow = 'hidden';
                        };
                        ul.appendChild(li);
                    });
                    break;
            }

            if (hasList) {
                elemCont.removeChild(hasList);
            }
            elemCont.appendChild(ul);
            if (interval === 'year' || interval === 'month') {
                // 显示切换箭头
                $e.fn.addClass(that.dateMain, 'yc-datebox-ym-show');
                if (chooseTime) {
                    $e.fn.addClass(chooseTime, 'yc-datebox-btn-disabled');
                }
            } else {
                $e.fn.addClass(that.dateMain, 'yc-datebox-time-show');
                var list = Array.prototype.slice.call(ul.querySelectorAll('ol'));
                var scroll = function () {
                    myUtil.each(list, function (i, val) {
                        var step;
                        if (i === 0) {
                            step = hour - 2;
                        } else if (i === 1) {
                            step = minute - 2;
                        } else if (i === 2) {
                            step = second - 2;
                        }
                        val.scrollTop = 24 * step;
                    });
                };
                scroll();
                var span = $e.fn.create('span', 'yc-datebox-time-text');
                span.innerHTML = lang.timeTips;
                elemHeader[2].appendChild(span);
                myUtil.each(list, function (i, ol) {
                    ol.onclick = function (e) {
                        var target = e.target || e.srcElement;
                        if (target.nodeName.toLowerCase() === 'li') {
                            var t = parseInt(target.innerHTML, 10);
                            if (i === 0) {
                                date.setHours(t);
                            } else if (i === 1) {
                                date.setMinutes(t);
                            } else if (i === 2) {
                                date.setSeconds(t);
                            }
                            that.globalVal = date;
                            $e.fn.removeClass(ol.querySelector('.yc-datebox-current'), 'yc-datebox-current');
                            $e.fn.addClass(target, 'yc-datebox-current');
                            scroll();
                        }
                    };
                });
            }
        },

        /**
         * 工具按钮处理
         * @public
         * @param {HTMLElement} btn - 按钮元素
         * @param {string} type - 类型
         */
        tool: function (btn, type) {
            var that = this;
            var ref = that.reference;
            var active = {
                // 选择时间
                datetime: function () {
                    if ($e.fn.hasClass(btn, 'yc-datebox-btn-disabled')) {
                        return;
                    }
                    that.pick('time');
                    btn.setAttribute('action', 'date');
                    btn.innerHTML = that.lang().dateTips;
                },
                // 选择日期
                date: function () {
                    that.closeList();
                    btn.setAttribute('action', 'datetime');
                    btn.innerHTML = that.lang().timeTips;
                },
                // 清空、重置
                clear: function () {
                    ref.$owner.setValue('');
                    that.hide();
                },
                // 现在
                now: function () {
                    var now = new Date();
                    ref.$owner.setValue(now);
                    that.hide();
                },
                // 确定
                confirm: function () {
                    ref.$owner.setValue(that.globalVal);
                    that.hide();
                }
            };
            if (active[type]) {
                active[type]();
            }
        },

        /**
         * 关闭列表
         * @public
         */
        closeList: function () {
            var that = this;
            var hasList = that.dateCont.querySelector('.yc-datebox-list');
            if (hasList) {
                that.dateCont.removeChild(hasList);
            }
            $e.fn.removeClass(that.dateMain, 'yc-datebox-ym-show');
            $e.fn.removeClass(that.dateMain, 'yc-datebox-time-show');
            var span = that.dateHeader[0][2].querySelector('.yc-datebox-time-text');
            if (span) {
                that.dateHeader[0][2].removeChild(span);
            }
            var chooseTime = that.footer.querySelector('.yc-datebox-btns-time');
            if (chooseTime) {
                $e.fn.removeClass(chooseTime, 'yc-datebox-btn-disabled');
            }
        }
    };

    /**
     * 显示日历
     * @public
     * @param {Object} options - 配置选项
     */
    $e.ui.showCalender = function (options) {
        var calender = this.calender;
        if (!calender) {
            this.calender = calender = new Datebox();
        }
        calender.show(options);
        var setting = {
            shell: calender.getShell(),
            ref: options.ref,
            level: options.level || 0,
            side: options.side || 'down'
        };
        setTimeout(function () {
            $e.fn.showMenu(setting);
        }, 0);
    };
}($e);
