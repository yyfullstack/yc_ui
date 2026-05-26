/**
 * YC UI Login Module
 * Handles login form functionality, captcha management, and AJAX submission
 */
$(document).ready(function() {
    'use strict';

    // ===== Configuration =====
    var CONFIG = {
        captchaUrl: 'http://192.168.22.81/verify.jsp',
        loginUrl: 'WebLogin',
        module: 'sys_user_login',
        submitDelay: 1000
    };

    // ===== State Management =====
    var loginState = {
        isSubmitting: false,
        captchaLoaded: false
    };

    // ===== DOM Elements =====
    var elements = {
        $username: $('#username'),
        $password: $('#password'),
        $captchaInput: $('#captchaInput'),
        $verifyImg: $('#verifyImg'),
        $remember: $('#remember'),
        $submitBtn: $('#submitButton'),
        $message: $('#loginMessage'),
        $loginForm: $('#loginForm'),
        $refreshCaptcha: $('#refreshCaptcha'),
        $downloadLink: $('#download')
    };

    // ===== Captcha Module =====
    var captcha = {
        generateRandid: function() {
            return Math.random().toString(36).substring(2, 15);
        },

        generateUrl: function() {
            var timestamp = new Date().getTime();
            var randid = this.generateRandid();
            return CONFIG.captchaUrl + '?randid=' + randid + '&t=' + timestamp;
        },

        load: function() {
            var $img = elements.$verifyImg;
            var src = this.generateUrl();

            $img.addClass('is-loading').removeClass('is-loaded is-error');
            $img.attr('src', src);

            // Use event delegation to avoid duplicate event binding
            $img.off('load.captcha error.captcha');
            $img.on('load.captcha', function() {
                $img.removeClass('is-loading').addClass('is-loaded');
                loginState.captchaLoaded = true;
            }).on('error.captcha', function() {
                $img.removeClass('is-loading').addClass('is-error');
                loginState.captchaLoaded = false;
                console.error('验证码加载失败');
            });
        },

        refresh: function() {
            this.load();
            elements.$captchaInput.val('');
        }
    };

    // ===== UI Module =====
    var ui = {
        setWrapperTone: function(fieldName, tone) {
            var $wrapper = $('[data-field-wrapper="' + fieldName + '"]');
            if (!$wrapper.length) return;
            $wrapper.removeClass('yc-input-wrapper--error yc-input-wrapper--warning yc-input-wrapper--success');
            if (tone) {
                $wrapper.addClass('yc-input-wrapper--' + tone);
            }
        },

        clearWrapperTones: function() {
            ['username', 'password', 'captcha'].forEach(function(name) {
                ui.setWrapperTone(name, '');
            });
        },

        showMessage: function(type, text) {
            if (!elements.$message.length) return;
            elements.$message
                .show()
                .removeClass('is-warning is-danger is-success')
                .addClass('is-' + type)
                .text(text);
        },

        hideMessage: function() {
            if (!elements.$message.length) return;
            elements.$message.hide().removeClass('is-warning is-danger is-success').text('');
        },

        setSubmitState: function(isPending) {
            loginState.isSubmitting = isPending;
            elements.$submitBtn
                .prop('disabled', isPending)
                .toggleClass('is-pending', isPending)
                .text('登录');
        },

        setAllSuccess: function() {
            ['username', 'password', 'captcha'].forEach(function(name) {
                ui.setWrapperTone(name, 'success');
            });
        }
    };

    // ===== Checkbox Module =====
    var checkbox = {
        init: function() {
            $('.yc-checkbox').each(function() {
                var $checkbox = $(this);
                var $input = $checkbox.find('.yc-checkbox__input');

                var applyState = function() {
                    $checkbox.toggleClass('is-checked', $input.prop('checked'));
                };

                applyState();
                $input.on('change', applyState);
            });
        }
    };

    // ===== Validation Module =====
    var validation = {
        checkUsername: function() {
            if (!elements.$username.val().trim()) {
                alert('请输入用户名！');
                elements.$username.focus();
                elements.$password.val('');
                return false;
            }
            return true;
        },

        checkPassword: function() {
            if (!elements.$password.val().trim()) {
                alert('请输入密码！');
                elements.$password.focus();
                return false;
            }
            return true;
        },

        checkCaptcha: function() {
            if (!elements.$captchaInput.val().trim()) {
                alert('请输入验证码！');
                elements.$captchaInput.focus();
                return false;
            }
            return true;
        },

        validateAll: function() {
            return this.checkUsername() && this.checkPassword() && this.checkCaptcha();
        }
    };

    // ===== Login Module =====
    var login = {
        getData: function() {
            return {
                userid: elements.$username.val().trim(),
                pwd: elements.$password.val().trim(),
                VerifyPass: elements.$captchaInput.val().trim(),
                _amgn: CONFIG.module,
                autoLoginFlag: elements.$remember.prop('checked') ? '1' : '0'
            };
        },

        handleSubmit: function(res) {
            var result = res.result || '-1';
            var message = res.message || '';
            var initModule = res.initModule || '';
            var tokenId = res.tokenId || '';

            switch (result) {
                case '-101':
                    // Captcha error
                    alert(message);
                    elements.$captchaInput.focus();
                    captcha.refresh();
                    break;

                case '-100':
                    // Username/password error
                    alert(message);
                    elements.$password.focus();
                    elements.$password.val('');
                    captcha.refresh();
                    break;

                default:
                    if (parseInt(result) > 0) {
                        // Login success
                        ui.showMessage('success', '登录成功！正在跳转...');
                        var url = encodeURI(
                            'module.jsp?module=' + initModule +
                            '&_tokenid=' + tokenId +
                            '&rand=' + Math.random()
                        );
                        setTimeout(function() {
                            window.open(url, '_top', 'yc');
                        }, CONFIG.submitDelay);
                    } else {
                        // Other errors
                        alert(message || '登录失败，请稍后重试');
                        captcha.refresh();
                    }
                    break;
            }
        },

        handleError: function(xhr) {
            var message = xhr.status === 0
                ? '网络连接失败，请检查网络设置'
                : '登录失败，错误码: ' + xhr.status;
            ui.showMessage('danger', message);
            captcha.refresh();
        },

        submit: function() {
            if (!validation.validateAll()) return;
            if (loginState.isSubmitting) return;

            ui.setAllSuccess();
            ui.setSubmitState(true);

            $.ajax({
                url: CONFIG.loginUrl,
                type: 'POST',
                dataType: 'json',
                data: this.getData(),
                success: function(res) {
                    ui.setSubmitState(false);
                    login.handleSubmit(res);
                },
                error: function(xhr, status, error) {
                    ui.setSubmitState(false);
                    login.handleError(xhr);
                }
            });
        }
    };

    // ===== Field Reset Module =====
    var fieldReset = {
        init: function() {
            var fields = [
                { input: '#username', field: 'username' },
                { input: '#password', field: 'password' },
                { input: '#captchaInput', field: 'captcha' }
            ];

            fields.forEach(function(item) {
                $(item.input).on('input', function() {
                    ui.hideMessage();
                    ui.setWrapperTone(item.field, '');
                });
            });
        }
    };

    // ===== Event Binding =====
    var events = {
        init: function() {
            // Form submission
            elements.$loginForm.on('submit', function(e) {
                e.preventDefault();
                login.submit();
            });

            // Captcha refresh
            elements.$refreshCaptcha.on('click', function() {
                ui.hideMessage();
                ui.setWrapperTone('captcha', '');
                captcha.refresh();
            });

            // Keyboard support (Enter key)
            $(document).on('keyup', function(e) {
                if (e.charCode === 13 || e.keyCode === 13) {
                    login.submit();
                }
            });
        }
    };

    // ===== Initialization =====
    var init = function() {
        checkbox.init();
        fieldReset.init();
        events.init();

        // Focus username field
        elements.$username.focus();

        // Load captcha with slight delay to ensure DOM is ready
        setTimeout(function() {
            captcha.load();
        }, 100);
    };

    init();
});