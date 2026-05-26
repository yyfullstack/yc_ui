(() => {
    const MASKS = {
        phone: {
            maxRawLength: 11,
            maxDisplayLength: 13,
            inputMode: 'tel',
            formatter(value) {
                if (value.length <= 3) return value;
                if (value.length <= 7) return `${value.slice(0, 3)}-${value.slice(3)}`;
                return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
            },
            validator(value) {
                return /^1[3-9]\d{9}$/.test(value);
            }
        },
        idcard: {
            maxRawLength: 18,
            maxDisplayLength: 22,
            formatter(value) {
                if (value.length <= 6) return value;
                if (value.length <= 10) return `${value.slice(0, 6)} ${value.slice(6)}`;
                if (value.length <= 12) return `${value.slice(0, 6)} ${value.slice(6, 10)}-${value.slice(10)}`;
                if (value.length <= 14) return `${value.slice(0, 6)} ${value.slice(6, 10)}-${value.slice(10, 12)}-${value.slice(12)}`;
                return `${value.slice(0, 6)} ${value.slice(6, 10)}-${value.slice(10, 12)}-${value.slice(12, 14)} ${value.slice(14, 18)}`;
            },
            sanitizer(value) {
                const chars = value.toUpperCase().replace(/[^0-9X]/g, '');
                let normalized = '';

                for (let index = 0; index < chars.length && normalized.length < 18; index += 1) {
                    const char = chars[index];

                    if (normalized.length < 17) {
                        if (/\d/.test(char)) {
                            normalized += char;
                        }
                        continue;
                    }

                    if (/[0-9X]/.test(char)) {
                        normalized += char;
                        break;
                    }
                }

                return normalized;
            },
            validator(value) {
                return /^\d{17}[0-9X]$/.test(value);
            }
        },
        bankcard: {
            maxRawLength: 19,
            maxDisplayLength: 23,
            inputMode: 'numeric',
            formatter(value) {
                return value.replace(/(.{4})/g, '$1 ').trim();
            },
            validator(value) {
                return /^\d{16,19}$/.test(value);
            }
        },
        date: {
            maxRawLength: 8,
            maxDisplayLength: 10,
            inputMode: 'tel',
            formatter(value) {
                if (value.length <= 4) return value;
                if (value.length <= 6) return `${value.slice(0, 4)}-${value.slice(4)}`;
                return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
            },
            validator(value) {
                if (!/^\d{8}$/.test(value)) return false;
                const year = Number(value.slice(0, 4));
                const month = Number(value.slice(4, 6));
                const day = Number(value.slice(6, 8));
                if (month < 1 || month > 12) return false;
                const date = new Date(year, month - 1, day);
                return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
            }
        },
        time: {
            maxRawLength: 6,
            maxDisplayLength: 8,
            inputMode: 'tel',
            formatter(value) {
                if (value.length <= 2) return value;
                if (value.length <= 4) return `${value.slice(0, 2)}:${value.slice(2)}`;
                return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
            },
            validator(value) {
                if (!/^\d{6}$/.test(value)) return false;
                const hours = Number(value.slice(0, 2));
                const minutes = Number(value.slice(2, 4));
                const seconds = Number(value.slice(4, 6));
                return hours <= 23 && minutes <= 59 && seconds <= 59;
            }
        },
        zipcode: {
            maxRawLength: 6,
            maxDisplayLength: 6,
            inputMode: 'numeric',
            formatter(value) {
                return value;
            },
            validator(value) {
                return /^\d{6}$/.test(value);
            }
        },
        ip: {
            maxRawLength: 12,
            maxDisplayLength: 15,
            inputMode: 'tel',
            formatter(value) {
                const groups = [];
                for (let index = 0; index < value.length; index += 3) {
                    groups.push(value.slice(index, index + 3));
                }
                return groups.slice(0, 4).join('.');
            },
            validator(value) {
                if (!/^\d{4,12}$/.test(value)) return false;
                const parts = value.match(/.{1,3}/g) || [];
                return parts.length === 4 && parts.every(part => Number(part) >= 0 && Number(part) <= 255);
            }
        }
    };

    function getMaskConfig(input) {
        const maskName = input.dataset.inputFormat || input.dataset.mask;
        return maskName ? MASKS[maskName] || null : null;
    }

    function getRawValue(input, config) {
        const sanitizer = config?.sanitizer;
        const current = input.value || '';
        if (sanitizer) {
            return sanitizer(current);
        }
        return current.replace(/\D/g, '').slice(0, config.maxRawLength);
    }

    function formatFormattedInput(input) {
        const config = getMaskConfig(input);
        if (!config) return;

        const rawValue = getRawValue(input, config);
        const formattedValue = config.formatter(rawValue).slice(0, config.maxDisplayLength);
        const oldValue = input.value;

        if (formattedValue !== oldValue) {
            input.value = formattedValue;
        }

        input.dataset.rawValue = rawValue;
        input.maxLength = config.maxDisplayLength;
        if (config.inputMode) {
            input.inputMode = config.inputMode;
        }
    }

    function syncWrapperState(input) {
        const wrapper = input.closest('.yc-input-wrapper, .yc-masked-input-wrapper');
        if (!wrapper) return;

        const hasValue = Boolean(input.value);
        wrapper.classList.toggle('has-value', hasValue);

        if (document.activeElement === input) {
            wrapper.classList.add('is-focused');
        } else {
            wrapper.classList.remove('is-focused');
        }
    }

    function updateFormattedState(input) {
        const config = getMaskConfig(input);
        const wrapper = input.closest('.yc-input-wrapper, .yc-masked-input-wrapper');
        if (!config || !wrapper) return;

        const rawValue = input.dataset.rawValue || getRawValue(input, config);
        const successClasses = ['yc-input-wrapper--success', 'yc-masked-input-wrapper--success'];
        const warningClasses = ['yc-input-wrapper--warning', 'yc-masked-input-wrapper--warning'];
        const errorClasses = ['yc-input-wrapper--error', 'yc-masked-input-wrapper--error'];

        wrapper.classList.remove(...successClasses, ...warningClasses, ...errorClasses);
        input.classList.remove('yc-input--complete', 'yc-input--incomplete', 'yc-masked-input--complete', 'yc-masked-input--incomplete');

        if (!rawValue) return;

        if (config.validator(rawValue)) {
            wrapper.classList.add('yc-input-wrapper--success');
            input.classList.add('yc-input--complete', 'yc-masked-input--complete');
            return;
        }

        if (rawValue.length >= config.maxRawLength) {
            wrapper.classList.add('yc-input-wrapper--error');
            return;
        }

        wrapper.classList.add('yc-input-wrapper--warning');
        input.classList.add('yc-input--incomplete', 'yc-masked-input--incomplete');
    }

    function handleFormattedInput(event) {
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;

        formatFormattedInput(input);
        updateFormattedState(input);
        syncWrapperState(input);
    }

    function handleClearClick(event) {
        const button = event.currentTarget;
        const wrapper = button.closest('.yc-input-wrapper, .yc-masked-input-wrapper');
        if (!wrapper) return;

        const input = wrapper.querySelector('.yc-input, .yc-masked-input');
        if (!(input instanceof HTMLInputElement)) return;

        input.value = '';
        input.dataset.rawValue = '';
        wrapper.classList.remove(
            'has-value',
            'yc-input-wrapper--success',
            'yc-input-wrapper--warning',
            'yc-input-wrapper--error',
            'yc-masked-input-wrapper--success',
            'yc-masked-input-wrapper--warning',
            'yc-masked-input-wrapper--error'
        );
        input.classList.remove('yc-input--complete', 'yc-input--incomplete', 'yc-masked-input--complete', 'yc-masked-input--incomplete');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    function initInputElement(input) {
        if (!(input instanceof HTMLInputElement)) return;

        if (getMaskConfig(input)) {
            formatFormattedInput(input);
            updateFormattedState(input);
        }
        syncWrapperState(input);

        if (!input.dataset.ycInputEnhanced) {
            input.addEventListener('input', handleFormattedInput);
            input.addEventListener('focus', () => syncWrapperState(input));
            input.addEventListener('blur', () => syncWrapperState(input));
            input.dataset.ycInputEnhanced = 'true';
        }
    }

    function initClearButton(button) {
        if (!(button instanceof HTMLButtonElement)) return;
        if (button.dataset.ycClearEnhanced) return;

        button.addEventListener('click', handleClearClick);
        button.dataset.ycClearEnhanced = 'true';
    }

    function initInputs(root = document) {
        root.querySelectorAll('.yc-input, .yc-masked-input').forEach(initInputElement);
        root.querySelectorAll('.yc-input__clear, .yc-masked-input__clear').forEach(initClearButton);
    }

    document.addEventListener('DOMContentLoaded', () => initInputs());

    window.YcInputEnhance = {
        init: initInputs,
        masks: MASKS
    };
})();
