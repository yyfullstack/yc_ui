+function ($e) {
    function SpreadsheetView(options) {
        this.props = options;
        this._listeners = [];
        this._data = [];
        this._selectedCell = null;
    }
    SpreadsheetView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_spreadsheet',
        body: null,
        shell: null,
        _listeners: null,
        _data: null,
        _selectedCell: null,
        _table: null,
        _formulaBar: null,
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildSpreadsheet();
            this.inited();
        },
        buildSpreadsheet: function () {
            var options = this.props;
            var size = options.size || 'default';
            var bordered = options.bordered !== false;
            var striped = options.striped || false;
            $e.fn.addClass(this.shell, 'yc-spreadsheet');
            if (size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-spreadsheet--' + size);
            }
            if (bordered) {
                $e.fn.addClass(this.shell, 'yc-spreadsheet--bordered');
            }
            if (striped) {
                $e.fn.addClass(this.shell, 'yc-spreadsheet--striped');
            }
            var toolbar = $e.fn.create('div');
            $e.fn.addClass(toolbar, 'yc-spreadsheet__toolbar');
            var toolbarGroups = [
                { items: ['bold', 'italic', 'underline'] },
                { items: ['align-left', 'align-center', 'align-right'] }
            ];
            for (var g = 0; g < toolbarGroups.length; g++) {
                var group = $e.fn.create('div');
                $e.fn.addClass(group, 'yc-spreadsheet__toolbar-group');
                for (var i = 0; i < toolbarGroups[g].items.length; i++) {
                    var btn = $e.fn.create('button');
                    $e.fn.addClass(btn, 'yc-spreadsheet__toolbar-btn');
                    btn.innerHTML = toolbarGroups[g].items[i];
                    btn.setAttribute('data-action', toolbarGroups[g].items[i]);
                    var self = this;
                    this.bindListen($e.events.regEvent(btn, 'click', this, function (e) {
                        self.onToolbarClick(e.target.getAttribute('data-action'));
                    }));
                    group.appendChild(btn);
                }
                toolbar.appendChild(group);
            }
            this.getBody().appendChild(toolbar);
            var formulaBar = $e.fn.create('div');
            $e.fn.addClass(formulaBar, 'yc-spreadsheet__formula-bar');
            var nameBox = $e.fn.create('div');
            $e.fn.addClass(nameBox, 'yc-spreadsheet__name-box');
            nameBox.innerHTML = 'A1';
            formulaBar.appendChild(nameBox);
            var formulaInput = $e.fn.create('input');
            $e.fn.addClass(formulaInput, 'yc-spreadsheet__formula-input');
            formulaBar.appendChild(formulaInput);
            this.getBody().appendChild(formulaBar);
            this._formulaBar = formulaInput;
            var scrollContainer = $e.fn.create('div');
            $e.fn.addClass(scrollContainer, 'yc-spreadsheet__scroll-container');
            var table = $e.fn.create('table');
            $e.fn.addClass(table, 'yc-spreadsheet__table');
            this._table = table;
            scrollContainer.appendChild(table);
            this.getBody().appendChild(scrollContainer);
            var statusBar = $e.fn.create('div');
            $e.fn.addClass(statusBar, 'yc-spreadsheet__status-bar');
            statusBar.innerHTML = '<span class="yc-spreadsheet__status-item">就绪</span>';
            this.getBody().appendChild(statusBar);
            this.initData();
        },
        initData: function () {
            var options = this.props;
            var rows = options.rows || 20;
            var cols = options.cols || 10;
            this._data = [];
            for (var r = 0; r < rows; r++) {
                var row = [];
                for (var c = 0; c < cols; c++) {
                    row.push('');
                }
                this._data.push(row);
            }
            this.renderTable();
        },
        renderTable: function () {
            var table = this._table;
            table.innerHTML = '';
            var thead = $e.fn.create('thead');
            var headerRow = $e.fn.create('tr');
            var cornerCell = $e.fn.create('th');
            $e.fn.addClass(cornerCell, 'yc-spreadsheet__corner');
            headerRow.appendChild(cornerCell);
            for (var c = 0; c < this._data[0].length; c++) {
                var th = $e.fn.create('th');
                $e.fn.addClass(th, 'yc-spreadsheet__col-header');
                th.innerHTML = this.getColumnLabel(c);
                headerRow.appendChild(th);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
            var tbody = $e.fn.create('tbody');
            for (var r = 0; r < this._data.length; r++) {
                var tr = $e.fn.create('tr');
                var rowHeader = $e.fn.create('th');
                $e.fn.addClass(rowHeader, 'yc-spreadsheet__row-header');
                rowHeader.innerHTML = (r + 1).toString();
                tr.appendChild(rowHeader);
                for (var c = 0; c < this._data[r].length; c++) {
                    var td = $e.fn.create('td');
                    $e.fn.addClass(td, 'yc-spreadsheet__cell');
                    td.setAttribute('data-row', r);
                    td.setAttribute('data-col', c);
                    td.innerHTML = this._data[r][c];
                    var self = this;
                    this.bindListen($e.events.regEvent(td, 'click', this, function (e) {
                        self.onCellClick(e, e.target);
                    }));
                    this.bindListen($e.events.regEvent(td, 'dblclick', this, function (e) {
                        self.onCellEdit(e, e.target);
                    }));
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
        },
        getColumnLabel: function (index) {
            var label = '';
            var num = index;
            do {
                label = String.fromCharCode(65 + (num % 26)) + label;
                num = Math.floor(num / 26);
            } while (num > 0);
            return label;
        },
        onCellClick: function (e, cell) {
            if (this._selectedCell) {
                $e.fn.removeClass(this._selectedCell, 'is-selected');
            }
            this._selectedCell = cell;
            $e.fn.addClass(cell, 'is-selected');
            var row = parseInt(cell.getAttribute('data-row'));
            var col = parseInt(cell.getAttribute('data-col'));
            var nameBox = this.shell.querySelector('.yc-spreadsheet__name-box');
            if (nameBox) {
                nameBox.innerHTML = this.getColumnLabel(col) + (row + 1);
            }
            if (this._formulaBar) {
                this._formulaBar.value = this._data[row][col];
            }
        },
        onCellEdit: function (e, cell) {
            var self = this;
            var row = parseInt(cell.getAttribute('data-row'));
            var col = parseInt(cell.getAttribute('data-col'));
            var input = $e.fn.create('input');
            input.type = 'text';
            input.value = this._data[row][col];
            input.style.width = '100%';
            input.style.height = '100%';
            input.style.border = 'none';
            input.style.outline = 'none';
            cell.innerHTML = '';
            cell.appendChild(input);
            input.focus();
            var onBlur = function () {
                var value = input.value;
                cell.removeChild(input);
                self.setCellValue(row, col, value);
            };
            var onKeyDown = function (ev) {
                if (ev.key === 'Enter') {
                    input.blur();
                }
            };
            input.addEventListener('blur', onBlur);
            input.addEventListener('keydown', onKeyDown);
        },
        setCellValue: function (row, col, value) {
            if (value.charAt(0) === '=') {
                value = this.evaluateFormula(value.substring(1));
            }
            this._data[row][col] = value;
            var cell = this._table.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
            if (cell) {
                cell.innerHTML = value;
            }
            if (this.props.onChange) {
                this.props.onChange(row, col, value);
            }
        },
        evaluateFormula: function (formula) {
            try {
                var cleanFormula = formula.replace(/[A-Z]+\d+/g, function (ref) {
                    var col = 0;
                    var row = 0;
                    var i = 0;
                    while (i < ref.length && ref.charCodeAt(i) >= 65 && ref.charCodeAt(i) <= 90) {
                        col = col * 26 + (ref.charCodeAt(i) - 64);
                        i++;
                    }
                    row = parseInt(ref.substring(i)) - 1;
                    col = col - 1;
                    if (row >= 0 && row < this._data.length && col >= 0 && col < this._data[0].length) {
                        var val = this._data[row][col];
                        return isNaN(parseFloat(val)) ? 0 : parseFloat(val);
                    }
                    return 0;
                }.bind(this));
                return eval(cleanFormula);
            } catch (e) {
                return '#ERROR';
            }
        },
        onToolbarClick: function (action) {
            if (!this._selectedCell) return;
            var row = parseInt(this._selectedCell.getAttribute('data-row'));
            var col = parseInt(this._selectedCell.getAttribute('data-col'));
            if (action === 'bold') {
                $e.fn.toggleClass(this._selectedCell, 'is-bold');
            } else if (action === 'italic') {
                $e.fn.toggleClass(this._selectedCell, 'is-italic');
            } else if (action === 'underline') {
                $e.fn.toggleClass(this._selectedCell, 'is-underline');
            } else if (action === 'align-left') {
                this._selectedCell.style.textAlign = 'left';
            } else if (action === 'align-center') {
                this._selectedCell.style.textAlign = 'center';
            } else if (action === 'align-right') {
                this._selectedCell.style.textAlign = 'right';
            }
        },
        getData: function () {
            return this._data;
        },
        setData: function (data) {
            this._data = data;
            this.renderTable();
        },
        selfRelease: function () {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i]) {
                    this._listeners[i].release();
                }
            }
            this._listeners = null;
            this._data = null;
            this._selectedCell = null;
            this._table = null;
            this._formulaBar = null;
            this.body = null;
        },
        resize: function (options) {
        }
    };
    var plugin = {
        create: function (options) {
            return new SpreadsheetView(options);
        }
    };
    $e.ui.addViewPlugin("view_spreadsheet", plugin);
}($e);
