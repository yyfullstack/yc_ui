(() => {
    function getCssVar(name, fallbackName = '') {
        const styles = getComputedStyle(document.documentElement);
        const value = styles.getPropertyValue(name).trim();
        if (value) return value;
        return fallbackName ? styles.getPropertyValue(fallbackName).trim() : '';
    }

    function getRgba(rgbVarName, alpha, fallbackRgbVar = '--yc-color-border-rgb') {
        return `rgba(${getCssVar(rgbVarName, fallbackRgbVar)}, ${alpha})`;
    }

    function getTonePalette() {
        return [
            getCssVar('--yc-color-primary'),
            getCssVar('--yc-color-success'),
            getCssVar('--yc-color-warning'),
            getCssVar('--yc-color-danger')
        ];
    }

    const state = {
        textCode: '',
        sliderTarget: 0,
        sliderPassed: false,
        clickTargets: [],
        clickPlaced: [],
        clickIndex: 0,
        smsCountdown: null
    };

    function setStatus(targetId, text, tone = 'default') {
        const target = document.getElementById(targetId);
        if (!target) return;

        target.textContent = text;
        target.dataset.tone = tone;
    }

    function clearClickMarks() {
        document.querySelectorAll('#clickCaptchaPanel .yc-captcha-click__mark').forEach(node => node.remove());
    }

    function drawTextCaptcha() {
        const canvas = document.getElementById('captchaCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const palette = getTonePalette();
        const linePalette = [
            getRgba('--yc-color-primary-rgb', 0.32),
            getRgba('--yc-color-success-rgb', 0.28),
            getRgba('--yc-color-warning-rgb', 0.28),
            getRgba('--yc-color-danger-rgb', 0.28)
        ];
        const dotPalette = [
            getRgba('--yc-color-primary-rgb', 0.24),
            getRgba('--yc-color-success-rgb', 0.22),
            getRgba('--yc-color-warning-rgb', 0.22),
            getRgba('--yc-color-danger-rgb', 0.22)
        ];

        state.textCode = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = getCssVar('--yc-color-fill-extra-light', '--yc-color-bg');
        ctx.fillRect(0, 0, width, height);

        for (let index = 0; index < 5; index += 1) {
            ctx.strokeStyle = linePalette[index % linePalette.length];
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        for (let index = 0; index < 24; index += 1) {
            ctx.fillStyle = dotPalette[index % dotPalette.length];
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        state.textCode.split('').forEach((char, index) => {
            ctx.save();
            ctx.translate(28 + index * 28, 33 + Math.random() * 6);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillStyle = palette[index % palette.length];
            ctx.font = `bold ${22 + Math.floor(Math.random() * 6)}px Arial`;
            ctx.fillText(char, 0, 0);
            ctx.restore();
        });

        const input = document.getElementById('captchaTextInput');
        if (input) input.value = '';
        setStatus('captchaTextStatus', '输入图中的四位字符后进行验证。');
    }

    function validateTextCaptcha() {
        const input = document.getElementById('captchaTextInput');
        if (!input) return;

        const value = input.value.trim().toUpperCase();
        if (!value) {
            setStatus('captchaTextStatus', '请先输入验证码。', 'danger');
            return;
        }

        if (value === state.textCode) {
            setStatus('captchaTextStatus', '图形验证码校验通过，可以继续业务流程。', 'success');
            return;
        }

        setStatus('captchaTextStatus', '验证码不匹配，已重新生成。', 'danger');
        drawTextCaptcha();
    }

    function buildSliderChallenge() {
        const stage = document.getElementById('sliderPuzzleStage');
        const piece = document.getElementById('sliderPuzzlePiece');
        const slot = document.getElementById('sliderPuzzleSlot');
        const handle = document.getElementById('sliderHandle');
        const fill = document.getElementById('sliderTrackFill');

        if (!stage || !piece || !slot || !handle || !fill) return;

        const limit = Math.max(stage.clientWidth - 54, 220);
        const availableRange = Math.max(limit - 120, 80);

        state.sliderTarget = 72 + Math.random() * availableRange;
        state.sliderPassed = false;

        slot.style.left = `${state.sliderTarget}px`;
        piece.style.left = '0px';
        handle.style.left = '0px';
        fill.style.width = '0px';
        stage.dataset.limit = String(limit);
        stage.classList.remove('is-success', 'is-danger');
        setStatus('captchaSliderStatus', '拖动滑块使拼图块和缺口对齐。');
    }

    function bindSlider() {
        const handle = document.getElementById('sliderHandle');
        const piece = document.getElementById('sliderPuzzlePiece');
        const fill = document.getElementById('sliderTrackFill');
        const stage = document.getElementById('sliderPuzzleStage');
        const label = document.getElementById('sliderTrackLabel');

        if (!handle || !piece || !fill || !stage || !label) return;

        let dragging = false;
        let startX = 0;
        let currentLeft = 0;

        function update(offset) {
            const limit = Number(stage.dataset.limit || 0);
            const next = Math.max(0, Math.min(offset, limit));
            currentLeft = next;
            handle.style.left = `${next}px`;
            piece.style.left = `${next}px`;
            fill.style.width = `${next + 42}px`;
        }

        function finish() {
            dragging = false;
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);

            const passed = Math.abs(currentLeft - state.sliderTarget) <= 8;
            state.sliderPassed = passed;
            stage.classList.toggle('is-success', passed);
            stage.classList.toggle('is-danger', !passed);
            label.textContent = passed ? '验证成功' : '偏差过大，请重试';
            setStatus(
                'captchaSliderStatus',
                passed ? '滑块验证成功，拼图已经对齐。' : '滑块没有对齐，系统已重置。',
                passed ? 'success' : 'danger'
            );

            if (!passed) {
                window.setTimeout(() => {
                    label.textContent = '按住滑块，拖动完成拼图';
                    buildSliderChallenge();
                }, 720);
            }
        }

        function onMove(event) {
            if (!dragging || state.sliderPassed) return;
            update(event.clientX - startX);
        }

        function onUp() {
            if (!dragging) return;
            finish();
        }

        handle.addEventListener('pointerdown', event => {
            if (state.sliderPassed) return;
            dragging = true;
            stage.classList.remove('is-success', 'is-danger');
            startX = event.clientX - currentLeft;
            handle.setPointerCapture?.(event.pointerId);
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        });
    }

    function drawClickCaptcha() {
        const canvas = document.getElementById('clickCaptchaCanvas');
        const sequence = document.getElementById('clickCaptchaSequence');
        const result = document.getElementById('clickCaptchaResult');
        if (!canvas || !sequence || !result) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const chars = ['营', '销', '平', '台', '订', '单', '流', '程', '数', '据'];
        const palette = getTonePalette();

        state.clickTargets = chars.slice().sort(() => Math.random() - 0.5).slice(0, 3);
        state.clickPlaced = [];
        state.clickIndex = 0;
        sequence.textContent = state.clickTargets.join(' -> ');
        result.textContent = '等待验证';
        clearClickMarks();

        ctx.clearRect(0, 0, width, height);
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, getRgba('--yc-color-primary-rgb', 0.14));
        gradient.addColorStop(1, getRgba('--yc-color-success-rgb', 0.12));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const placed = [];
        chars.forEach((char, index) => {
            let x = 0;
            let y = 0;
            let overlapping = true;
            let attempts = 0;

            while (overlapping && attempts < 40) {
                x = 36 + Math.random() * (width - 72);
                y = 30 + Math.random() * (height - 60);
                overlapping = placed.some(item => Math.abs(item.x - x) < 42 && Math.abs(item.y - y) < 42);
                attempts += 1;
            }

            placed.push({ char, x, y });
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.35);
            ctx.fillStyle = palette[index % palette.length];
            ctx.font = `bold ${28 + Math.floor(Math.random() * 10)}px "Microsoft YaHei", Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char, 0, 0);
            ctx.restore();
        });

        state.clickPlaced = placed;
        setStatus('captchaClickStatus', '请按顺序点击提示中的三个字符。');
    }

    function bindClickCaptcha() {
        const canvas = document.getElementById('clickCaptchaCanvas');
        const result = document.getElementById('clickCaptchaResult');
        if (!canvas || !result) return;

        canvas.addEventListener('click', event => {
            if (state.clickIndex >= state.clickTargets.length) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const expected = state.clickTargets[state.clickIndex];
            const hit = state.clickPlaced.find(item => Math.abs(item.x - x) < 24 && Math.abs(item.y - y) < 24);

            if (hit && hit.char === expected) {
                state.clickIndex += 1;
                const mark = document.createElement('span');
                mark.className = 'yc-captcha-click__mark yc-captcha-click__mark--pending';
                mark.style.left = `${hit.x}px`;
                mark.style.top = `${hit.y}px`;
                mark.textContent = String(state.clickIndex);
                canvas.parentElement.appendChild(mark);

                if (state.clickIndex === state.clickTargets.length) {
                    result.textContent = '顺序正确';
                    setStatus('captchaClickStatus', '点选验证通过。', 'success');
                    return;
                }

                result.textContent = `已完成 ${state.clickIndex}/${state.clickTargets.length}`;
                setStatus('captchaClickStatus', `继续点击字符“${state.clickTargets[state.clickIndex]}”。`, 'success');
                return;
            }

            const errorMark = document.createElement('span');
            errorMark.className = 'yc-captcha-click__mark yc-captcha-click__mark--error';
            errorMark.style.left = `${x}px`;
            errorMark.style.top = `${y}px`;
            errorMark.textContent = '!';
            canvas.parentElement.appendChild(errorMark);

            result.textContent = '点击顺序错误';
            setStatus('captchaClickStatus', '点选顺序不正确，已为你刷新。', 'danger');
            window.setTimeout(drawClickCaptcha, 720);
        });
    }

    function startSmsCountdown() {
        const button = document.getElementById('captchaSmsButton');
        if (!button) return;

        let remaining = 60;
        button.disabled = true;
        button.classList.add('is-disabled');
        button.textContent = `${remaining}s 后重发`;

        window.clearInterval(state.smsCountdown);
        state.smsCountdown = window.setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                window.clearInterval(state.smsCountdown);
                button.disabled = false;
                button.classList.remove('is-disabled');
                button.textContent = '获取验证码';
                setStatus('captchaSmsStatus', '可以再次发送短信验证码。');
                return;
            }

            button.textContent = `${remaining}s 后重发`;
        }, 1000);
    }

    function sendSmsCaptcha() {
        const phone = document.getElementById('captchaSmsPhone');
        const code = document.getElementById('captchaSmsCode');
        if (!phone || !code) return;

        if (!/^1[3-9]\d{9}$/.test(phone.value.trim())) {
            setStatus('captchaSmsStatus', '手机号格式不正确，请输入 11 位中国大陆手机号。', 'danger');
            return;
        }

        code.value = '482901';
        setStatus('captchaSmsStatus', '模拟验证码已发送，示例值已自动回填。', 'success');
        startSmsCountdown();
    }

    function initCaptchaWorkbench() {
        document.getElementById('captchaCanvas')?.addEventListener('click', drawTextCaptcha);
        document.getElementById('captchaTextRefresh')?.addEventListener('click', drawTextCaptcha);
        document.getElementById('captchaTextValidate')?.addEventListener('click', validateTextCaptcha);
        document.getElementById('captchaTextInput')?.addEventListener('keydown', event => {
            if (event.key === 'Enter') validateTextCaptcha();
        });
        document.getElementById('captchaSmsButton')?.addEventListener('click', sendSmsCaptcha);
        document.getElementById('captchaSmsPhone')?.addEventListener('keydown', event => {
            if (event.key === 'Enter') sendSmsCaptcha();
        });
        document.getElementById('captchaSliderReset')?.addEventListener('click', () => {
            document.getElementById('sliderTrackLabel').textContent = '按住滑块，拖动完成拼图';
            buildSliderChallenge();
        });
        document.getElementById('captchaClickRefresh')?.addEventListener('click', drawClickCaptcha);
        window.addEventListener('resize', buildSliderChallenge);

        drawTextCaptcha();
        buildSliderChallenge();
        bindSlider();
        drawClickCaptcha();
        bindClickCaptcha();
    }

    document.addEventListener('DOMContentLoaded', initCaptchaWorkbench);
})();
