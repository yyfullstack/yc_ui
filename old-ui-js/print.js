/**
 * @file 打印模块
 * @description 提供打印渲染、打印机设置、打印预览等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 打印渲染
     * @public
     * @param {HTMLElement} element - 打印模板元素
     * @param {Object} map - 打印数据映射 {params: {}, tables: []}
     * @param {Array} ados - ADO数据对象数组
     */
    $e.ui.print = function (element, map, ados) {
        var el;
        var params = map['params'] || {};
        var vs;

        // 合并ADO变量到参数
        for (var i = 0; i < ados.length; i++) {
            vs = ados[i].getVars();
            $e.fn.extend(vs, params);
        }

        // 填充参数
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                el = element.querySelector('[prn=' + key + ']');
                if (el) {
                    if (el.tagName === 'IMG') {
                        el.src = params[key];
                    } else {
                        var format = el.getAttribute('data-fmt');
                        var value = params[key];
                        if (format) {
                            value = $e.fn.formatData(value, format);
                        }

                        if (params[key] === null) {
                            value = '';
                        }

                        var elArr = element.querySelectorAll('[prn=' + key + ']');
                        elArr = Array.prototype.slice.call(elArr);
                        for (var j = 0; j < elArr.length; j++) {
                            elArr[j].innerHTML = value;
                        }
                    }
                }
            }
        }

        // 填充表格数据
        var ado;
        var table;
        var tr;
        var col;
        for (var a = 0; a < ados.length; a++) {
            ado = ados[a];
            table = element.querySelector('[data-table=' + ado.getName() + ']');
            if (table) {
                var hd = element.querySelectorAll('col');
                for (var r = 0; r < ado.getRowsCount(); r++) {
                    tr = table.insertRow(r + 1);
                    for (var c = 0; c < hd.length; c++) {
                        col = hd[c].getAttribute('data-name');
                        var colFormat = hd[c].getAttribute('data-fmt');
                        var styleSheet = hd[c].style.cssText;
                        if (col) {
                            var td = document.createElement('td');
                            var cellValue = ado.getValueAt(r, col);
                            if (colFormat) {
                                cellValue = $e.fn.formatData(cellValue, colFormat);
                            }

                            if (cellValue === null) {
                                cellValue = '';
                            }

                            td.innerHTML = cellValue;
                            $e.fn.setStyle(td, styleSheet);
                            tr.appendChild(td);
                        }
                    }
                }
            }
        }
    };

    /**
     * 设置打印机
     * @public
     * @param {string} target - 打印机目标名称
     * @param {HTMLElement} shell - 外壳元素
     * @param {Function} callback - 回调函数
     */
    $e.ui.setPrinter = function (target, shell, callback) {
        var printerTarget = target || 'billPrinter';
        var printerCallback = callback || console.log;

        console.log('-----------set Printer now-----------------');
        var isIE = !!(navigator.userAgent.match(/MSIE/i)) || !!(navigator.userAgent.match(/Trident/i));

        if (isIE) {
            var frame = shell.querySelector('iframe');
            var body = frame.contentDocument || frame.contentWindow.document;
            var printer = body.getPrinterForIE();
            if (printer >= 0) {
                alert('打印机设置成功！请再次执行打印操作');
                document.cookie = printerTarget + ' =' + printer;
                printerCallback();
            } else {
                alert('printer setting failed!');
            }
        } else {
            console.log('-----------enter dialogInIt-----------------');
            try {
                var LODOP = getLodop();
                if (LODOP.CVERSION) {
                    LODOP.On_Return = function (taskId, value) {
                        if (value >= 0) {
                            alert('打印机设置成功！请再次执行打印操作');
                            document.cookie = printerTarget + ' =' + value;
                            printerCallback();
                        } else {
                            alert('打印机设置失败！');
                        }
                    };
                    LODOP.SELECT_PRINTER();
                    return;
                }
            } catch (err) {
                window.open('/lodop/Install_both_plug-ins.rar', '_parent');
            }
        }
    };

    /**
     * 检查打印机设置
     * @public
     * @param {string} cname - Cookie名称
     * @returns {string} 打印机编号
     */
    $e.ui.checkPrinter = function (cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    };

    /**
     * 获取打印机名称
     * @public
     * @param {number} iPrinterNO - 打印机编号
     * @returns {string} 打印机名称
     */
    $e.ui.getPrinterName = function (iPrinterNO) {
        var LODOP;
        try {
            LODOP = getLodop();
        } catch (err) {
            window.open('/lodop/Install_both_plug-ins.rar', '_parent');
        }
        return LODOP.GET_PRINTER_NAME(iPrinterNO);
    };

}($e);
