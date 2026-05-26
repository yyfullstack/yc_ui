/**
 * @file Web请求核心模块
 * @description 提供AJAX请求封装、错误处理、进度提示等功能
 * @author YC-UI Team
 * @version 3.0.2
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    $e.baseURI = '';

    var noop = function () {
    };

    var ERROR_MESSAGES = {
        timeout: 'The connection request timed out !',
        abort: 'Request Abort !!',
        'parse-error': 'Failed to parse return information !',
        'load-error': 'Data Load Error !',
        error: 'Failed to connect to server!'
    };

    function parseError(type) {
        return ERROR_MESSAGES[type] || 'Unknown exception!';
    }

    function beforeSend(xhr, options) {
        var title = (options && options.title !== undefined) ? options.title : '正在请求...';
        $e.showProgress(title);
        return true;
    }

    function onComplete() {
        $e.hideProgress();
    }

    var defaultSettings = {
        crossDomain: false,
        parseType: 'default',
        headers: {
            charset: 'UTF-8',
            contentType: 'application/json'
        },
        type: 'POST',
        timeout: 120000,
        beforeSend: beforeSend,
        complete: onComplete,
        async: true,
        success: noop,
        final: noop,
        error: {
            method: function (errType, errText) {
                if (arguments.length === 1) {
                    $e.ui.showMessage(errType, { ico: 'warn' });
                    throw errType;
                }
                throw new Error(parseError(errType));
            }
        }
    };

    function createXHR() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                } catch (e1) {
                    return null;
                }
            }
        }
        return null;
    }

    function isSuccessStatus(status) {
        return (status >= 200 && status < 300) || status === 304;
    }

    function isLocalSuccess(status, responseText) {
        return status === 0 && !!responseText;
    }

    /**
     * AJAX请求方法
     * @public
     * @param {string} url - 请求地址
     * @param {*} [data] - 请求数据
     * @param {Object} [options] - 请求选项
     * @returns {boolean} 请求是否成功发起
     */
    $e.ajax = function (url, data, options) {
        url = $e.serialURL(url, false);
        var mergedConfig = options || {};
        $e.fn.extend(defaultSettings, mergedConfig);

        if (data instanceof FormData) {
            mergedConfig.headers.contentType = '';
        }

        var context = mergedConfig.context || $e;
        var successCallback = mergedConfig.success || noop;
        var errorCallback = $e.fn.extend(mergedConfig.error, { context: context });
        var timeoutId = 0;

        function handleError(errorType, errorText, exception) {
            onComplete();
            var args = errorCallback.args || [];
            args = args.concat(exception ? [exception] : [errorType, errorText]);
            errorCallback.args = args;
            setTimeout(function () {
                $e.callback(errorCallback);
            }, 0);
        }

        function handleSuccess(responseData) {
            var handledInternally = false;
            var parseError = null;
            if (responseData && typeof responseData === 'string' && mergedConfig.parseType === 'default') {
                try {
                    handledInternally = true;
                    $e.showProgress('正在加载...');
                    $e.loadData(responseData, successCallback, errorCallback);
                } catch (e) {
                    parseError = e;
                    onComplete();
                }
            }
            if (!parseError) {
                onComplete();
                if (successCallback && !handledInternally) {
                    setTimeout(function () {
                        $e.callback(successCallback, responseData);
                    }, 0);
                }
            }
            return parseError;
        }

        function handleResponse(xhr) {
            if (xhr.readyState !== 4) {
                return;
            }
            xhr.onreadystatechange = noop;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = 0;
            }
            if (isSuccessStatus(xhr.status) || isLocalSuccess(xhr.status, xhr.responseText)) {
                var err = handleSuccess(xhr.responseText);
                if (err) {
                    handleError('load-error', xhr.responseText, err);
                }
            } else {
                var errorType = (xhr.status || xhr.status === 0) ? 'error' : 'abort';
                var errorText = errorType === 'error' ? xhr.responseText : (xhr.statusText || null);
                handleError(errorType, errorText);
            }
        }

        var xhr = createXHR();
        if (!xhr) {
            return false;
        }

        var httpMethod = mergedConfig.type || 'POST';
        xhr.open(httpMethod, url, mergedConfig.async);
        xhr.setRequestHeader('Charset', mergedConfig.headers.charset || 'UTF-8');
        if (mergedConfig.headers.contentType) {
            xhr.setRequestHeader('Content-Type', mergedConfig.headers.contentType);
        }

        if (mergedConfig.async) {
            xhr.onreadystatechange = function () {
                handleResponse(xhr);
            };
        }

        if (mergedConfig.beforeSend(xhr, mergedConfig) === false) {
            xhr.abort();
            return false;
        }

        if (mergedConfig.timeout > 0) {
            timeoutId = setTimeout(function () {
                xhr.onreadystatechange = noop;
                xhr.abort();
                handleError('timeout', url);
            }, mergedConfig.timeout);
        }

        xhr.send(data || null);

        if (!mergedConfig.async) {
            handleResponse(xhr);
        }

        return true;
    };
}($e);