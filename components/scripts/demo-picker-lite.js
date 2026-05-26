(() => {
    const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

    class DemoDatePicker {
        constructor(container) {
            this.container = container;
            this.trigger = container.querySelector('.yc-date-picker__trigger');
            this.panel = container.querySelector('.yc-date-picker__panel');
            this.label = container.querySelector('.yc-date-picker__header-label');
            this.dates = container.querySelector('.yc-date-picker__dates');
            this.valueNode = container.querySelector('.yc-date-picker__trigger-value');
            this.clearButton = container.querySelector('.yc-date-picker__clear');
            this.selectedDate = this.parseDate(container.dataset.value);
            const baseDate = this.selectedDate || new Date();
            this.viewDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
            this.bindEvents();
            this.render();
            this.syncValue();
        }

        parseDate(value) {
            if (!value) return null;
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        formatDate(date) {
            const year = date.getFullYear();
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        bindEvents() {
            this.trigger?.addEventListener('click', event => {
                event.stopPropagation();
                this.toggle();
            });

            this.clearButton?.addEventListener('click', event => {
                event.stopPropagation();
                this.selectedDate = null;
                this.render();
                this.syncValue();
            });

            this.container.querySelector('[data-action="prev-month"]')?.addEventListener('click', event => {
                event.stopPropagation();
                this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
                this.render();
            });

            this.container.querySelector('[data-action="next-month"]')?.addEventListener('click', event => {
                event.stopPropagation();
                this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
                this.render();
            });

            this.container.querySelector('[data-action="today"]')?.addEventListener('click', event => {
                event.stopPropagation();
                this.selectedDate = new Date();
                this.viewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
                this.render();
                this.syncValue();
                this.close();
            });
        }

        render() {
            if (!this.label || !this.dates) return;

            this.label.textContent = `${this.viewDate.getFullYear()}年${this.viewDate.getMonth() + 1}月`;
            this.dates.innerHTML = '';

            const year = this.viewDate.getFullYear();
            const month = this.viewDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const leadingDays = firstDay.getDay();
            const totalCells = Math.ceil((leadingDays + lastDay.getDate()) / 7) * 7;
            const today = this.formatDate(new Date());
            const selected = this.selectedDate ? this.formatDate(this.selectedDate) : '';

            for (let index = 0; index < totalCells; index += 1) {
                const day = index - leadingDays + 1;
                const date = new Date(year, month, day);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'yc-date-picker__date';
                button.textContent = `${date.getDate()}`;

                const formatted = this.formatDate(date);
                const isOtherMonth = date.getMonth() !== month;

                if (isOtherMonth) {
                    button.classList.add('is-other-month');
                }

                if (formatted === today) {
                    button.classList.add('is-today');
                }

                if (formatted === selected) {
                    button.classList.add('is-selected');
                }

                button.addEventListener('click', event => {
                    event.stopPropagation();
                    this.selectedDate = date;
                    this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
                    this.render();
                    this.syncValue();
                    this.close();
                });

                this.dates.appendChild(button);
            }
        }

        syncValue() {
            const value = this.selectedDate ? this.formatDate(this.selectedDate) : '';

            this.container.dataset.value = value;
            this.valueNode.textContent = value || this.trigger.dataset.placeholder || '请选择日期';
        }

        open() {
            document.querySelectorAll('.yc-date-picker.is-open').forEach(node => {
                if (node !== this.container) {
                    node.classList.remove('is-open');
                    node.querySelector('.yc-date-picker__panel')?.classList.remove('is-open');
                }
            });

            this.container.classList.add('is-open', 'is-focus');
            this.panel?.classList.add('is-open');
        }

        close() {
            this.container.classList.remove('is-open', 'is-focus');
            this.panel?.classList.remove('is-open');
        }

        toggle() {
            if (this.container.classList.contains('is-open')) {
                this.close();
                return;
            }

            this.open();
        }
    }

    class DemoTimePicker {
        constructor(container) {
            this.container = container;
            this.input = container.querySelector('.yc-time-picker__input');
            this.popper = container.querySelector('.yc-time-picker__popper');
            this.hourList = container.querySelector('[data-time-unit="hour"]');
            this.minuteList = container.querySelector('[data-time-unit="minute"]');
            this.secondList = container.querySelector('[data-time-unit="second"]');
            this.clearButton = container.querySelector('.yc-time-picker__clear');
            this.withSeconds = container.dataset.seconds === 'true';
            this.value = container.dataset.value || this.input?.value || '';
            this.bindEvents();
            this.render();
            this.syncValue();
        }

        bindEvents() {
            this.container.querySelector('.yc-time-picker__input-wrapper')?.addEventListener('click', event => {
                event.stopPropagation();
                this.toggle();
            });

            this.clearButton?.addEventListener('click', event => {
                event.stopPropagation();
                this.value = '';
                this.render();
                this.syncValue();
                this.container.classList.remove('has-value');
            });

            this.container.querySelector('[data-action="time-now"]')?.addEventListener('click', event => {
                event.stopPropagation();
                const now = new Date();
                const parts = [
                    `${now.getHours()}`.padStart(2, '0'),
                    `${now.getMinutes()}`.padStart(2, '0')
                ];

                if (this.withSeconds) {
                    parts.push(`${now.getSeconds()}`.padStart(2, '0'));
                }

                this.value = parts.join(':');
                this.syncValue();
                this.close();
            });
        }

        render() {
            this.renderColumn(this.hourList, 24, 0);
            this.renderColumn(this.minuteList, 60, 1);

            if (this.secondList) {
                this.renderColumn(this.secondList, 60, 2);
            }
        }

        renderColumn(list, count, index) {
            if (!list) return;

            list.innerHTML = '';
            const selectedParts = this.value ? this.value.split(':') : [];

            for (let value = 0; value < count; value += 1) {
                const item = document.createElement('div');
                const display = `${value}`.padStart(2, '0');
                item.className = 'yc-time-panel__item';
                item.textContent = display;

                if (selectedParts[index] === display) {
                    item.classList.add('is-selected');
                }

                item.addEventListener('click', event => {
                    event.stopPropagation();
                    const nextParts = this.value ? this.value.split(':') : (this.withSeconds ? ['00', '00', '00'] : ['00', '00']);
                    nextParts[index] = display;
                    this.value = nextParts.join(':');
                    this.render();
                    this.syncValue();
                });

                list.appendChild(item);
            }
        }

        syncValue() {
            if (!this.input) return;

            this.input.value = this.value;
            this.container.dataset.value = this.value;
            this.container.classList.toggle('has-value', Boolean(this.value));
        }

        open() {
            this.render();

            document.querySelectorAll('.yc-time-picker.is-active').forEach(node => {
                if (node !== this.container) {
                    node.classList.remove('is-active');
                    const popper = node.querySelector('.yc-time-picker__popper');
                    if (popper) popper.style.display = 'none';
                }
            });

            this.container.classList.add('is-active');
            if (this.popper) {
                this.popper.style.display = 'block';
            }
        }

        close() {
            this.container.classList.remove('is-active');
            if (this.popper) {
                this.popper.style.display = 'none';
            }
        }

        toggle() {
            if (this.container.classList.contains('is-active')) {
                this.close();
                return;
            }

            this.open();
        }
    }

    function initDatePickers(root = document) {
        root.querySelectorAll('.yc-date-picker[data-demo-picker]').forEach(container => {
            if (container.dataset.pickerLiteReady === 'true') return;
            container.datePickerLite = new DemoDatePicker(container);
            container.dataset.pickerLiteReady = 'true';
        });
    }

    function initTimePickers(root = document) {
        root.querySelectorAll('.yc-time-picker[data-demo-picker]').forEach(container => {
            if (container.dataset.pickerLiteReady === 'true') return;
            container.timePickerLite = new DemoTimePicker(container);
            container.dataset.pickerLiteReady = 'true';
        });
    }

    function init(root = document) {
        initDatePickers(root);
        initTimePickers(root);
    }

    document.addEventListener('click', event => {
        if (!event.target.closest('.yc-date-picker')) {
            document.querySelectorAll('.yc-date-picker.is-open').forEach(container => {
                container.classList.remove('is-open', 'is-focus');
                container.querySelector('.yc-date-picker__panel')?.classList.remove('is-open');
            });
        }

        if (!event.target.closest('.yc-time-picker')) {
            document.querySelectorAll('.yc-time-picker.is-active').forEach(container => {
                container.classList.remove('is-active');
                const popper = container.querySelector('.yc-time-picker__popper');
                if (popper) popper.style.display = 'none';
            });
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });

    window.YcDemoPickerLite = {
        WEEKDAYS,
        init
    };
})();
