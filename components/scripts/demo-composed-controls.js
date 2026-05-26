(() => {
    function syncCheckboxState(checkbox) {
        const input = checkbox.querySelector('.yc-checkbox__input');
        if (!input) return;

        checkbox.classList.toggle('is-checked', input.checked);
        checkbox.classList.toggle('is-disabled', input.disabled);
    }

    function initCheckbox(checkbox) {
        if (!checkbox || checkbox.dataset.ycCheckboxEnhanced === 'true') return;

        const input = checkbox.querySelector('.yc-checkbox__input');
        if (!input) return;
        const usesNativeLabel = checkbox.tagName === 'LABEL';

        syncCheckboxState(checkbox);

        checkbox.addEventListener('click', event => {
            if (input.disabled || event.target === input || usesNativeLabel) return;
            input.checked = !input.checked;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        input.addEventListener('change', () => {
            syncCheckboxState(checkbox);
        });

        checkbox.dataset.ycCheckboxEnhanced = 'true';
    }

    function syncRadioGroupState(name) {
        if (!name) return;

        document.querySelectorAll(`.yc-radio__input[name="${name}"]`).forEach(input => {
            const radio = input.closest('.yc-radio');
            if (!radio) return;

            radio.classList.toggle('is-checked', input.checked);
            radio.classList.toggle('is-disabled', input.disabled);
        });
    }

    function initRadio(radio) {
        if (!radio || radio.dataset.ycRadioEnhanced === 'true') return;

        const input = radio.querySelector('.yc-radio__input');
        if (!input) return;
        const usesNativeLabel = radio.tagName === 'LABEL';

        syncRadioGroupState(input.name);

        radio.addEventListener('click', event => {
            if (input.disabled || event.target === input || usesNativeLabel) return;
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        input.addEventListener('change', () => {
            syncRadioGroupState(input.name);
        });

        radio.dataset.ycRadioEnhanced = 'true';
    }

    function closeSelect(select) {
        const popper = select.querySelector('.yc-select__popper');
        if (!popper) return;

        select.classList.remove('is-active');
        popper.classList.remove('is-visible');
    }

    function openSelect(select) {
        document.querySelectorAll('.yc-select.is-active').forEach(activeSelect => {
            if (activeSelect !== select) {
                closeSelect(activeSelect);
            }
        });

        const popper = select.querySelector('.yc-select__popper');
        if (!popper) return;

        select.classList.add('is-active');
        popper.classList.add('is-visible');

        const searchInput = select.querySelector('.yc-select-dropdown__search');
        if (searchInput) {
            window.setTimeout(() => searchInput.focus(), 0);
        }
    }

    function getSelectItemLabel(item) {
        return item.dataset.label
            || item.querySelector('.yc-select-dropdown__item-label')?.textContent.trim()
            || item.textContent.trim();
    }

    function syncSelectIcon(select, item) {
        const iconSlot = select.querySelector('.yc-select__selection-icon');
        if (!iconSlot) return;

        const iconClass = item?.dataset.icon
            || item?.querySelector('.yc-select-dropdown__item-icon i')?.className
            || '';

        if (!iconClass) {
            iconSlot.hidden = true;
            iconSlot.innerHTML = '';
            iconSlot.classList.remove('is-filled');
            select.classList.remove('has-selected-icon');
            return;
        }

        iconSlot.hidden = false;
        iconSlot.classList.add('is-filled');
        iconSlot.innerHTML = `<i class="${iconClass}"></i>`;
        select.classList.add('has-selected-icon');
    }

    function setSelectedItem(select, item) {
        const input = select.querySelector('.yc-select__input');
        if (!input) return;

        select.querySelectorAll('.yc-select-dropdown__item').forEach(option => {
            option.classList.toggle('is-selected', option === item);
        });

        input.value = getSelectItemLabel(item);
        select.dataset.selectedValue = item.dataset.value || input.value;
        select.classList.add('has-value');
        syncSelectIcon(select, item);
        closeSelect(select);
        select.dispatchEvent(new CustomEvent('yc-select:change', {
            bubbles: true,
            detail: {
                value: select.dataset.selectedValue,
                label: input.value,
                item
            }
        }));
    }

    function clearSelect(select) {
        const input = select.querySelector('.yc-select__input');
        if (!input) return;

        input.value = '';
        delete select.dataset.selectedValue;
        select.classList.remove('has-value');
        select.querySelectorAll('.yc-select-dropdown__item').forEach(option => {
            option.classList.remove('is-selected');
        });
        syncSelectIcon(select, null);
        select.dispatchEvent(new CustomEvent('yc-select:change', {
            bubbles: true,
            detail: {
                value: '',
                label: '',
                item: null
            }
        }));
    }

    function initSelect(select) {
        if (!select || select.dataset.ycSelectEnhanced === 'true' || select.classList.contains('is-disabled')) return;

        const inputWrapper = select.querySelector('.yc-select__input-wrapper');
        const clearButton = select.querySelector('.yc-select__clear');

        if (inputWrapper) {
            inputWrapper.addEventListener('click', event => {
                if (event.target.closest('.yc-select__clear')) return;
                if (select.classList.contains('is-active')) {
                    closeSelect(select);
                } else {
                    openSelect(select);
                }
            });
        }

        select.querySelectorAll('.yc-select-dropdown__item').forEach(item => {
            if (item.classList.contains('is-selected')) {
                setSelectedItem(select, item);
            }

            item.addEventListener('click', event => {
                event.stopPropagation();
                if (item.classList.contains('is-disabled')) return;
                setSelectedItem(select, item);
            });
        });

        if (clearButton) {
            select.classList.add('is-clearable');
            clearButton.addEventListener('click', event => {
                event.stopPropagation();
                clearSelect(select);
            });
        }

        if (!select.querySelector('.yc-select__selection-icon') && select.querySelector('.yc-select__prefix')) {
            select.classList.add('has-prefix');
        }

        select.dataset.ycSelectEnhanced = 'true';
    }

    function init(root = document) {
        root.querySelectorAll('.yc-checkbox').forEach(initCheckbox);
        root.querySelectorAll('.yc-radio').forEach(initRadio);
        root.querySelectorAll('.yc-select').forEach(initSelect);
    }

    document.addEventListener('click', event => {
        if (event.target.closest('.yc-select')) return;

        document.querySelectorAll('.yc-select.is-active').forEach(closeSelect);
    });

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });

    window.YcDemoComposedControls = {
        init,
        closeSelect,
        openSelect,
        clearSelect
    };
})();
