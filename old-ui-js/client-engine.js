/**
 * @file 客户端引擎核心模块
 * @description 提供ActiveModule管理、数据请求、视图管理、环境变量管理等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * 活动模块构造函数
     * @class ActiveModule
     * @param {string} name - 模块名称
     */
    function ActiveModule(name) {
        $e.initActiveCell(this, { name: name, _amn: name, _mn: name });
        this.ados = {};
        this.views = {};
        this.anys = {};
        this.mapViews = {};
        this.vars = {};
        this.varListen = {};
    }

    ActiveModule.prototype = {
        /**
         * 获取ADO对象
         * @public
         * @param {string} name - ADO名称
         * @returns {Object|null} ADO对象
         */
        getADO: function (name) {
            return name ? this.ados[name.toLowerCase()] : null;
        },

        /**
         * 获取视图
         * @public
         * @param {string} name - 视图名称
         * @returns {Object|undefined} 视图对象
         */
        getView: function (name) {
            return this.views[name];
        },

        /**
         * 获取Any对象
         * @public
         * @param {string} name - Any名称
         * @returns {Object|undefined} Any对象
         */
        getAny: function (name) {
            return this.anys[name];
        },

        /**
         * 释放模块资源
         * @public
         * @param {boolean} [toServer] - 是否通知服务器
         * @returns {void}
         */
        release: function (toServer) {
            var adoName;
            for (adoName in this.ados) {
                if (this.ados.hasOwnProperty(adoName)) {
                    this.ados[adoName].release();
                }
            }
            var viewName;
            for (viewName in this.views) {
                if (this.views.hasOwnProperty(viewName)) {
                    this.views[viewName].release(true);
                }
            }
            this.anys = null;
            this.mapViews = null;
            if (toServer && !$e.isPublic) {
                $e.request(this.getName(), 'release', null, null, null, {
                    error: {
                        method: function () {
                            // 忽略错误
                        }
                    }
                });
            }
            $e.removeActiveModule(this.name);
        }
    };

    $e.fn.extend($e.varEventsManager, ActiveModule.prototype);

    /**
     * 缓存的变量 dbs:按名称(lower)缓存的db views:按名称缓存的views,不区分具体内容和差别
     * 客户端向服务器端请求资源类型包括3类：
     * 1. 请求资源如view,db等,可采用getView(name),getADO(name)来获取
     * 2. 在ADOAgent为同步方式下的删除,增加行数据时的验证和返回数据,由ADOAgent自动调用,synccheck/syncdel
     * 3. 执行服务器端指令,可采用同步方式doAction("save","d1,d2"),或异步方式doAsyncAction(action, dbnames, _onLoad)来执行
     * 4. 在请求刷新数据时,应采用同步方式doAction("getrefresh","d1,d2");
     * 5. 请求分页数据doAction("getfirst[/getpre/getnext/getlast/getpage_n]","view1-1");-1为当前页
     */
    $e.fn.extend({
        ams: {},
        env: {},
        envListen: {},
        isPublic: false,
        inited: false,
        activeGroupName: '',
        events: $e.events.createEventCell(),
        baseURI: '',
        ErrorStatus: {
            TYPE_NOT_LOGIN: 1
        },

        /**
         * 模块单元格
         * @namespace
         */
        ModuleCell: {
            /**
             * 获取模块名称
             * @returns {string} 模块名称
             */
            getModuleName: function () {
                return this._mn;
            },

            /**
             * 获取活动模块名称
             * @returns {string} 活动模块名称
             */
            getActiveModuleName: function () {
                return this._amn;
            },

            /**
             * 获取名称
             * @returns {string} 名称
             */
            getName: function () {
                return this.name;
            },

            /**
             * 获取活动模块
             * @returns {ActiveModule} 活动模块
             */
            getActiveModule: function () {
                return $e.getActiveModule(this._amn);
            },

            /**
             * 获取URL选项
             * @param {Object} [options] - 选项
             * @returns {Object} URL选项
             */
            getURLOptions: function (options) {
                options = options || {};
                return $e.fn.extend(options, {
                    _amgn: this.getActiveModuleName(),
                    _amn: this.getActiveModuleName(),
                    _mn: this.getModuleName()
                }, true);
            },

            /**
             * 获取视图
             * @param {string} name - 视图名称
             * @param {string} [amn] - 活动模块名称
             * @returns {Object|null} 视图对象
             */
            getView: function (name, amn) {
                return $e.getView(name, amn || this.getActiveModuleName());
            },

            /**
             * 获取ADO
             * @param {string} [name] - ADO名称
             * @param {string} [amn] - 活动模块名称
             * @returns {Object|null} ADO对象
             */
            getADO: function (name, amn) {
                name = name || this.adoName;
                return name ? $e.getADO(name, amn || this.getActiveModuleName()) : null;
            },

            /**
             * 获取Any
             * @param {string} name - Any名称
             * @param {string} [amn] - 活动模块名称
             * @returns {Object|null} Any对象
             */
            getAny: function (name, amn) {
                return $e.getAny(name, amn || this.getActiveModuleName());
            },

            /**
             * 请求视图
             * @param {string} name - 视图名称
             * @param {Object} [options] - 选项
             * @returns {void}
             */
            requestView: function (name, options) {
                this.request('getview', name, null, null, options);
            },

            /**
             * 请求ADO
             * @param {string} name - ADO名称
             * @param {Object} [options] - 选项
             * @returns {void}
             */
            requestADO: function (name, options) {
                this.request('getado', name, null, null, options);
            },

            /**
             * 请求Any
             * @param {string} name - Any名称
             * @param {Object} [options] - 选项
             * @returns {void}
             */
            requestAny: function (name, options) {
                this.request('getany', name, null, null, options);
            },

            /**
             * 调用服务器方法（同步）
             * @param {string} name - 方法名
             * @param {string} [ados] - ADO名称
             * @param {Object} [jsonParm] - JSON参数
             * @param {Object} [options] - 选项
             * @returns {void}
             */
            call: function (name, ados, jsonParm, options) {
                this.request('call', name, ados, jsonParm, options);
            },

            /**
             * 调用服务器方法（异步）
             * @param {string} name - 方法名
             * @param {string} [ados] - ADO名称
             * @param {Object} [jsonParm] - JSON参数
             * @param {Object} [options] - 选项
             * @returns {void}
             */
            selfCall: function (name, ados, jsonParm, options) {
                this.request('async', name, ados, jsonParm, options);
            },

            /**
             * 请求资源
             * @param {string} type - 请求类型
             * @param {string} name - 资源名称
             * @param {string} [ados] - ADO名称
             * @param {Object} [jsonData] - JSON数据
             * @param {Object} [options] - 选项
             * @returns {void}
             */
            request: function (type, name, ados, jsonData, options) {
                options = options || {};
                var am = this.getActiveModuleName();
                var cell = null;
                if (type === 'getado') {
                    cell = $e.getADO(name, am);
                } else if (type === 'getview') {
                    cell = $e.getView(name, am);
                } else if (type === 'getany') {
                    cell = $e.getAny(name, am);
                }
                if (cell) {
                    if (type === 'getview') {
                        var ps = (options || {}).params;
                        if (ps && ps._call) {
                            var same = cell.getActiveModuleName() === this.getActiveModuleName();
                            $e.request(cell.getActiveModuleName(), 'call', ps._call, same ? ados : '', jsonData, options);
                        } else if (options.success) {
                            $e.callback(options.success);
                        }
                    } else if (options.success) {
                        $e.callback(options.success);
                    }
                } else {
                    options.params = options.params || {};
                    options.params._mn = options.params._mn || this.getModuleName();
                    $e.request(this.getActiveModuleName(), type, name, ados, jsonData, options);
                }
            },

            /**
             * 构建异步URL
             * @param {string} action - 动作名
             * @param {boolean|Object} [norand] - 是否不添加随机数或参数
             * @param {Object} [params] - 参数
             * @returns {string} URL
             */
            buildAsyncURL: function (action, norand, params) {
                var options = {
                    _amn: this.getActiveModuleName(),
                    _mn: this.getModuleName(),
                    _name: action,
                    _hasdata: '0',
                    _checkid: $e.getEnv('_checkid') || ''
                };
                if ($e.fn.isPlainObject(norand) && !params) {
                    params = norand;
                    norand = null;
                }
                if (params) {
                    Object.assign(options, params);
                }
                return $e.getURL('async', options, norand);
            }
        },

        /**
         * 初始化活动单元格
         * @param {Object} cell - 单元格
         * @param {Object} props - 属性
         * @param {Object} [extendCell] - 扩展单元格
         * @returns {void}
         */
        initActiveCell: function (cell, props, extendCell) {
            cell.name = cell.name || props.name;
            cell._mn = props._mn;
            cell._amn = props._amn;
            $e.fn.extend(extendCell || $e.ModuleCell, cell);
        },

        /**
         * 为活动单元格设置属性
         * @param {Object} props - 属性
         * @param {Object} cell - 单元格
         * @returns {Object} 单元格
         */
        forActiveCell: function (props, cell) {
            cell.name = cell.name || props.name;
            cell._mn = props._mn;
            cell._amn = props._amn;
            return cell;
        },

        /**
         * 获取活动模块
         * @param {string} [name] - 模块名称
         * @param {boolean} [autoAdd] - 是否自动添加
         * @returns {ActiveModule|null} 活动模块
         */
        getActiveModule: function (name, autoAdd) {
            name = name || this.activeGroupName;
            var am = this.ams[name];
            if (!am && autoAdd) {
                am = new ActiveModule(name);
                this.ams[name] = am;
            }
            return am;
        },

        /**
         * 释放活动模块
         * @param {string} name - 模块名称
         * @param {boolean} [toServer] - 是否通知服务器
         * @returns {void}
         */
        releaseActiveModule: function (name, toServer) {
            if (name) {
                var am = this.ams[name];
                if (am && am.name !== this.activeGroupName) {
                    am.release(!!toServer);
                }
            }
        },

        /**
         * 从缓存中移除活动模块
         * @param {string} name - 模块名称
         * @returns {ActiveModule|undefined} 被移除的模块
         */
        removeActiveModule: function (name) {
            var am = this.ams[name];
            delete this.ams[name];
            return am;
        },

        /**
         * 发送请求
         * @param {string} amn - 活动模块名
         * @param {string} type - 请求类型
         * @param {string} name - 资源名或指令名
         * @param {string} [adosName] - ADO名称
         * @param {Object} [jsonData] - JSON数据
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        request: function (amn, type, name, adosName, jsonData, options) {
            amn = amn || this.activeGroupName;
            var data = this.buildData(amn, adosName, jsonData);
            var settings = {
                _baseURI: this.baseURI + 'cloud?',
                _amgn: this.activeGroupName || (options && options._amgn),
                _amn: amn,
                _name: name,
                _type: type,
                _hasdata: (data ? '1' : '0'),
                _checkid: $e.getEnv('_checkid') || ''
            };
            options = options || {};
            if (options.async === undefined) {
                options.async = true;
            }
            if (options.params) {
                $e.fn.extend(options.params, settings, true);
            }
            options.error = options.error || this.defaultError;
            this.ajax(settings, data, options);
        },

        /**
         * 回调函数
         * @param {Object|Function|Array} obj - 回调对象
         * @returns {void}
         */
        callback: function (obj) {
            if (obj) {
                var arg1;
                var arg = [].slice.apply(arguments, [1]) || [];
                obj = (obj instanceof Array) ? obj : [obj];
                for (var i = 0; i < obj.length; i++) {
                    arg1 = arg.concat(obj[i].args || []);
                    if (typeof obj[i] === 'function') {
                        obj[i].apply($e, arg1);
                    } else {
                        obj[i].method.apply(obj[i].context || $e, arg1);
                    }
                }
            }
        },

        /**
         * 序列化URL
         * @param {Object|string} url - URL对象或字符串
         * @param {boolean} [noRand] - 是否不添加随机数
         * @returns {string} URL字符串
         */
        serialURL: function (url, noRand) {
            if ($e.fn.isPlainObject(url)) {
                url = $e.fn.extend(url, {});
                if (!noRand) {
                    url._rand = this.randNum();
                }
                var url1 = url._baseURI || (this.baseURI + 'cloud?');
                delete url._baseURI;
                var type;
                var value;
                var link = url1.indexOf('?') >= 0;
                for (var key in url) {
                    if (url.hasOwnProperty(key)) {
                        type = typeof key;
                        if (typeof type === 'string' || type instanceof String) {
                            value = url[key] + '';
                            type = typeof value;
                            if (type !== 'function' && type !== 'object' && type !== 'array' || value instanceof String) {
                                if (!link) {
                                    url1 += '?';
                                    link = true;
                                }
                                url1 = url1 + '&' + encodeURIComponent(key) + '=' + encodeURIComponent((value || '') + '');
                            }
                        }
                    }
                }
                url = url1.replace('?&', '?');
            }
            return url;
        },

        /**
         * 获取URL
         * @param {string} type - 类型
         * @param {Object} options - 选项
         * @param {boolean} [hasData] - 是否有数据
         * @param {boolean} [noId] - 是否不包含ID
         * @returns {string} URL
         */
        getURL: function (type, options, hasData, noId) {
            options = options || {};
            $e.fn.extend({
                _hasdata: $e.fn.getBoolean(hasData) ? '1' : '0',
                _type: type,
                _amgn: this.activeGroupName,
                _baseURI: this.baseURI + 'cloud?',
                _checkid: this.getEnv('_checkid') || ''
            }, options);
            return this.serialURL(options, noId);
        },

        /**
         * 构建数据
         * @param {string} awn - 活动模块名
         * @param {string} [ados] - ADO名称
         * @param {Object} [jsonData] - JSON数据
         * @returns {string|null} JSON字符串
         */
        buildData: function (activeModuleName, adoNames, jsonData) {
            var data = {};
            if (adoNames) {
                data.ados = this.getEditADOData(activeModuleName, adoNames);
            }
            if (jsonData) {
                data.data = jsonData;
            }
            return $e.fn.isEmptyObject(data) ? null : JSON.stringify(data);
        },

        /**
         * 默认错误处理
         * @type {Object}
         */
        defaultError: {
            method: function (e1) {
                if (e1.code === 111) {
                    $e.open(e1.login || 'index.html', '_self');
                } else if (e1.code === 101) {
                    $e.ui.showMessage(e1.message, { ico: 'warn' });
                } else if (e1.code || e1.message) {
                    $e.ui.showMessage(e1.detail + ',' + e1.message, { ico: 'warn' });
                } else {
                    $e.ui.showMessage(e1, { ico: 'warn' });
                }
            }
        },

        /**
         * 添加视图
         * @param {Object} view - 视图对象
         * @returns {boolean} 是否成功
         */
        addView: function (view) {
            var an = view.getActiveModuleName();
            var am = this.getActiveModule(an, true);
            var name = view.getName();
            if (!am.views[name]) {
                am.views[name] = view;
                return true;
            }
            return false;
        },

        /**
         * 请求视图
         * @param {string} name - 视图名称
         * @param {string} amn - 活动模块名
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        requestView: function (name, amn, options) {
            this.request(amn, 'getview', name, null, null, options);
        },

        /**
         * 获取视图
         * @param {string} name - 视图名称
         * @param {string} [amn] - 活动模块名
         * @returns {Object|null} 视图对象
         */
        getView: function (name, amn) {
            var mn = this.getMapViewName(name, amn);
            var am = this.getActiveModule(mn._mn);
            return am ? am.views[mn.name] : null;
        },

        /**
         * 移除视图
         * @param {string} name - 视图名称
         * @param {string} [amn] - 活动模块名
         * @param {Object} [view0] - 指定视图
         * @returns {Object|null} 被移除的视图
         */
        removeView: function (name, amn, view0) {
            var view = this.getView(name, amn);
            if (view && (!view0 || view0 === view)) {
                amn = view.getActiveModuleName();
                var am = this.getActiveModule(amn);
                delete am.views[view.getName()];
                return view;
            }
            return null;
        },

        /**
         * 映射视图
         * @param {Array} vs - 视图映射配置
         * @returns {void}
         */
        mapView: function (vs) {
            var t;
            for (var i = 0; i < vs.length; i++) {
                t = vs[i];
                if ((t._mn !== t.targetMN) || (t.name !== t.targetName)) {
                    var c = {
                        _mn: t.targetMN,
                        name: t.targetName
                    };
                    this.getActiveModule(t._mn, true).mapViews[t.name] = c;
                }
            }
        },

        /**
         * 获取映射的视图名
         * @param {string} name - 视图名
         * @param {string} [amn] - 活动模块名
         * @returns {Object} 映射信息
         */
        getMapViewName: function (name, amn) {
            var am = this.getActiveModule(amn);
            if (am) {
                var mv = am.mapViews[name];
                if (mv) {
                    return this.getMapViewName(mv.name, mv._mn);
                }
            }
            return {
                name: name,
                _mn: amn
            };
        },

        /**
         * 添加ADO
         * @param {Object} ado - ADO对象
         * @returns {void}
         */
        addADO: function (ado) {
            var an = ado.getActiveModuleName();
            var am = this.getActiveModule(an, true);
            var name = ado.getName().toLowerCase();
            if (!am.ados[name]) {
                am.ados[name] = ado;
            }
        },

        /**
         * 请求ADO
         * @param {string} name - ADO名称
         * @param {string} amn - 活动模块名
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        requestADO: function (name, amn, options) {
            this.request(amn, 'getado', name, null, null, options);
        },

        /**
         * 获取ADO
         * @param {string} name - ADO名称
         * @param {string} [amn] - 活动模块名
         * @returns {Object|null} ADO对象
         */
        getADO: function (name, amn) {
            var am = this.getActiveModule(amn);
            return am ? am.getADO(name) : null;
        },

        /**
         * 移除ADO
         * @param {string} name - ADO名称
         * @param {string} [amn] - 活动模块名
         * @returns {Object|null} 被移除的ADO
         */
        removeADO: function (name, amn) {
            var am = this.getActiveModule(amn);
            if (am) {
                name = name.toLowerCase();
                var ado = am.ados[name];
                delete am.ados[name];
                return ado;
            }
            return null;
        },

        /**
         * 获取所有环境变量
         * @returns {Object} 环境变量
         */
        getEnvs: function () {
            return this.env;
        },

        /**
         * 获取环境变量
         * @param {string} name - 变量名
         * @returns {*} 变量值
         */
        getEnv: function (name) {
            return this.env[name];
        },

        /**
         * 移除环境变量
         * @param {string} name - 变量名
         * @returns {*} 被移除的值
         */
        removeEnv: function (name) {
            var v = this.env[name];
            delete this.env[name];
            return v;
        },

        /**
         * 设置环境变量
         * @param {string} name - 变量名
         * @param {*} value - 变量值
         * @param {boolean} [stopEvent] - 是否停止事件
         * @returns {void}
         */
        setEnv: function (name, value, stopEvent) {
            var oldValue = this.env[name] || null;
            this.env[name] = value;
            if (!stopEvent) {
                this.doEnvListen(name, value, oldValue, false);
                this.doEnvListen('#all', value, oldValue, false);
            }
        },

        /**
         * 批量设置环境变量
         * @param {Object} map - 变量映射
         * @param {boolean} [stopEvent] - 是否停止事件
         * @returns {void}
         */
        setEnvs: function (map, stopEvent) {
            if (map && !$e.fn.isEmptyObject(map)) {
                var old = $e.fn.extend(this.env, {});
                $e.fn.extend(map, this.env, true);
                if (!stopEvent) {
                    var batch = false;
                    for (var i in map) {
                        if (map.hasOwnProperty(i) && i !== '#all') {
                            this.doEnvListen(i, map[i], old[i] || null, true);
                        }
                    }
                    this.doEnvListen('#all', '', '', true);
                }
            }
        },

        /**
         * 执行环境监听
         * @param {string} name - 变量名
         * @param {*} value - 当前值
         * @param {*} oldValue - 旧值
         * @param {boolean} [only] - 是否仅执行指定监听
         * @returns {void}
         */
        doEnvListen: function (name, value, oldValue, only) {
            var arg = [{ name: name, value: value, oldvalue: oldValue }];
            var ec = this.envListen[name];
            if (ec) {
                ec.done(arg);
            }
        },

        /**
         * 添加环境变更监听
         * @param {string} name - 变量名
         * @param {Object} listen - 监听器
         * @returns {number} 监听句柄
         */
        addEnvChangedListen: function (name, listen) {
            var ls = this.envListen[name];
            if (!ls) {
                this.envListen[name] = ls = $e.events.createEventCell();
            }
            return ls.add(listen);
        },

        /**
         * 移除环境变更监听
         * @param {string} name - 变量名
         * @param {number} handle - 监听句柄
         * @returns {void}
         */
        removeEnvChangedListen: function (name, handle) {
            var ls = this.envListen[name];
            if (ls) {
                ls.remove(handle);
            }
        },

        /**
         * 添加Any
         * @param {string} name - Any名称
         * @param {*} anySrc - Any源
         * @param {string} [amn] - 活动模块名
         * @returns {void}
         */
        addAny: function (name, anySrc, amn) {
            var am = this.getActiveModule(amn, true);
            if (am) {
                am.anys[name] = anySrc;
            }
        },

        /**
         * 获取Any
         * @param {string} name - Any名称
         * @param {string} [amn] - 活动模块名
         * @returns {Object|null} Any对象
         */
        getAny: function (name, amn) {
            var am = this.getActiveModule(amn);
            return am ? am.getAny(name) : null;
        },

        /**
         * 请求Any
         * @param {string} name - Any名称
         * @param {string} amn - 活动模块名
         * @param {Object} [options] - 选项
         * @returns {void}
         */
        requestAny: function (name, amn, options) {
            this.request(amn, 'getany', name, null, null, options);
        },

        /**
         * 打开窗口
         * @param {string|Object} url - URL或选项
         * @param {string} [pos] - 位置
         * @param {string} [ns] - 窗口名
         * @param {boolean} [repl] - 是否替换
         * @returns {Window} 窗口对象
         */
        open: function (url, pos, ns, repl) {
            if ($e.fn.isPlainObject(url)) {
                if (!url._baseURI) {
                    url._baseURI = 'work.jsp';
                }
                url = this.serialURL(url);
            }
            if (url.indexOf('_rand') < 0) {
                url = url + (url.indexOf('?') > 0 ? '&' : '?') + '_rand=' + this.randNum();
            }
            if (arguments.length >= 4) {
                return window.open(url, pos, ns, repl);
            } else if (arguments.length === 3) {
                return window.open(url, pos, ns);
            } else if (arguments.length === 2) {
                return window.open(url, pos);
            } else {
                return window.open(url);
            }
        },

        /**
         * 初始化模块
         * @param {string} name - 模块名称
         * @param {string} chkId - 检查ID
         * @returns {void}
         */
        initModule: function (name, chkId) {
            this.setEnv('_checkid', chkId);
            this.activeGroupName = name;
            $e.getActiveModule(name, true);
            $e.requestView('initView', name, {
                success: {
                    context: $e,
                    method: function () {
                        var view = $e.getView('initView', name);
                        if (view) {
                            var main = document.getElementById('yc_main')
                                || document.getElementById('yc-main')
                                || document.getElementById('main');
                            if (main) {
                                main.appendChild(view.getShell());
                            }
                            document.title = this.getEnv('title') || document.title;
                            this.isPublic = $e.fn.getBoolean(this.getEnv('public'), false);
                            this.keepLife = (this.env.lifeType || 'keep') === 'keep';
                            this.initEnd();
                        }
                    }
                }
            });
        },

        /**
         * 初始化结束
         * @returns {void}
         */
        initEnd: function () {
            if (this.isPublic && !this.keepLife) {
                this.request(this.activeGroupName, 'inited');
            }
        },

        /**
         * 获取活动组名
         * @returns {string} 活动组名
         */
        getActiveGroupName: function () {
            return this.activeGroupName;
        },

        /**
         * 加载数据
         * @param {string|Object} s - 数据
         * @param {Object} [successObj] - 成功回调
         * @param {Object} [errorObj] - 错误回调
         * @returns {boolean} 是否成功
         */
        loadData: function (s, successObj, errorObj) {
            var result = true;
            if (s) {
                var cells;
                var c1;
                if ((typeof s === 'string') || (s instanceof String)) {
                    if (!s.startsWith('{') || !s.endsWith('}')) {
                        return false;
                    }
                    cells = $e.fn.createObject(s);
                } else {
                    cells = s;
                }
                var name;
                var amn;
                var view;
                var ado;

                // 卸载工作的业务模型
                var dump = cells.dump;
                if (dump) {
                    this.releaseMember(dump);
                }
                var mv = cells.mapView;
                if (mv) {
                    this.mapView(mv);
                }
                var css = cells.css;
                if (css) {
                    for (var i = 0; i < css.length; i++) {
                        $e.fn.loadCSS(css[i]);
                    }
                }

                // 环境变量
                var envs = cells.envs;
                var onLoadScript = cells.onLoad;
                var cbps = cells.cbps;
                if (envs && !$e.fn.isEmptyObject(envs)) {
                    if (envs.onStart) {
                        new Function('data', envs.onStart)(cells);
                        delete envs.onStart;
                    }
                    onLoadScript = envs.onLoad || null;
                    delete envs.onLoad;
                    if (this.getEnv('_checkid')) {
                        delete envs._checkid;
                    }
                    if (!$e.fn.isEmptyObject(envs)) {
                        this.setEnvs(envs, true);
                        this.transParent({
                            type: 'env',
                            isParent: false,
                            data: envs,
                            _amgn: this.activeGroupName
                        });
                    }
                }

                var am;
                var extend = cells.extend;
                if (extend) {
                    for (var ex in extend) {
                        if (extend.hasOwnProperty(ex)) {
                            am = this.getActiveModule(ex, true);
                            c1 = extend[ex];
                            $e.fn.extend(c1, am);
                            if (c1.onStart && (am.getName() === this.activeGroupName)) {
                                $e.fn.applyMethod(am, am.onStart);
                            }
                        }
                    }
                }

                var ados = cells.ados;
                var prop;
                var mkAdos = [];
                if (ados && ados.length > 0) {
                    for (var j = 0; j < ados.length; j++) {
                        prop = ados[j];
                        if (prop) {
                            name = prop.name;
                            amn = prop._amn;
                            if (!this.getADO(name, amn)) {
                                ado = new $e.ADOAgent(name);
                                ado.init(prop);
                                this.addADO(ado);
                                mkAdos.push(ado);
                            }
                        }
                    }
                }

                var anys = cells.anys;
                if (anys) {
                    var a1;
                    for (var k in anys) {
                        if (anys.hasOwnProperty(k)) {
                            a1 = anys[k];
                            if (a1) {
                                for (var m in a1) {
                                    if (a1.hasOwnProperty(m)) {
                                        this.addAny(m, a1[m], k);
                                    }
                                }
                            }
                        }
                    }
                }

                var ds = '';
                var data = cells.data;
                if (data && data.length > 0) {
                    ds = [];
                    for (var n = 0; n < data.length; n++) {
                        if (data[n]) {
                            name = data[n].name;
                            amn = data[n]._amn;
                            ado = this.getADO(name, amn);
                            if (ado) {
                                ado.loadData(data[n]);
                                ds.push(ado);
                            } else if (!this.getActiveModule(amn)) {
                                this.transParent({
                                    type: 'ado',
                                    isParent: false,
                                    data: data[n],
                                    name: name,
                                    _amn: amn,
                                    _amgn: this.activeGroupName
                                });
                            }
                        }
                    }
                }

                // 视图
                var mkViews = [];
                var views = cells.views;
                if (views && views.length > 0) {
                    for (var p = 0; p < views.length; p++) {
                        if (views[p]) {
                            amn = views[p]._amn;
                            name = views[p].name;
                            view = $e.ui.createView(views[p]);
                            if (view) {
                                if (this.addView(view)) {
                                    mkViews.push(view);
                                }
                            }
                        }
                    }
                }

                // 下拉列表或其他代码表值
                var vs;
                var ld = cells.view_or;
                if (ld) {
                    for (var q in ld) {
                        if (ld.hasOwnProperty(q)) {
                            vs = ld[q];
                            for (var r in vs) {
                                if (vs.hasOwnProperty(r)) {
                                    view = $e.getView(r, q);
                                    if (view && view.changeProperty) {
                                        view.changeProperty(vs[r]._child_or || vs[r]);
                                    }
                                }
                            }
                        }
                    }
                }

                var vars = cells.vars;
                var async = false;
                if (mkViews.length > 0) {
                    for (var t = 0; t < mkViews.length; t++) {
                        if (mkViews[t]) {
                            $e.fn.bindMovingMenu(mkViews[t]);
                            if (mkViews[t].init) {
                                $e.fn.applyMethod(mkViews[t], mkViews[t].init);
                            }
                        }
                    }
                    result = false;
                    setTimeout(function () {
                        try {
                            $e.endLoadData(ds, mkAdos, envs, vars);
                            for (var u = 0; u < mkViews.length; u++) {
                                if (mkViews[u] && mkViews[u].onLoad) {
                                    $e.fn.applyMethod(mkViews[u], mkViews[u].onLoad);
                                }
                            }
                            if (onLoadScript) {
                                $e.fn.applyMethod($e, new Function(onLoadScript));
                            }
                            if (extend) {
                                var am2;
                                var c2;
                                for (var v in extend) {
                                    if (extend.hasOwnProperty(v)) {
                                        am2 = $e.getActiveModule(v);
                                        c2 = extend[v];
                                        if (am2 && c2.onLoad) {
                                            $e.fn.applyMethod(am2, am2.onLoad);
                                        }
                                    }
                                }
                                am2 = $e.getActiveModule();
                                c2 = extend[am2.getName()];
                                if (c2 && c2.onLast) {
                                    $e.fn.applyMethod(am2, am2.onLast);
                                }
                            }
                        } catch (e2) {
                            if (!cells.error && errorObj) {
                                $e.callback(errorObj, e2);
                                return;
                            }
                            throw e2;
                        }
                        if (!cells.error && successObj) {
                            $e.callback.apply($e, cbps ? [successObj, cbps] : [successObj]);
                        }
                    }, 0);
                    async = true;
                } else {
                    this.endLoadData(ds, mkAdos, envs, vars, extend);
                }

                // 错误信息
                var msg = cells.error;
                if (msg) {
                    throw msg;
                } else {
                    msg = cells.msg || cells.message;
                    if (msg) {
                        this.ui.showMessage(msg);
                    }
                }

                if (!async) {
                    $e.fn.applyMethod($e, new Function(onLoadScript));
                    if (successObj) {
                        $e.callback.apply($e, cbps ? [successObj, cbps] : [successObj]);
                    }
                }
            }
            return result;
        },

        /**
         * 加载数据结束
         * @param {Array} ds - 数据集
         * @param {Array} mkAdos - 创建的ADO
         * @param {Object} envs - 环境变量
         * @param {Object} vars - 变量
         * @param {Object} [extend] - 扩展
         * @returns {void}
         */
        endLoadData: function (dataSets, createdAdos, envVariables, vars, extend) {
            var ados = {};
            if (dataSets) {
                for (var i = 0; i < dataSets.length; i++) {
                    dataSets[i].doDelayListen();
                    ados[dataSets[i].getName()] = 1;
                }
            }
            if (createdAdos) {
                for (var j = 0; j < createdAdos.length; j++) {
                    if (createdAdos[j].onLoad) {
                        $e.fn.applyMethod(createdAdos[j], createdAdos[j].onLoad);
                    }
                    if (!ados[createdAdos[j].getName()]) {
                        $e.fn.applyMethod(createdAdos[j], createdAdos[j].doDelayListen);
                    }
                }
            }
            if (envVariables && !$e.fn.isEmptyObject(envVariables)) {
                this.setEnvs(envVariables);
            }
            if (vars && !$e.fn.isEmptyObject(vars)) {
                for (var moduleName in vars) {
                    if (vars.hasOwnProperty(moduleName)) {
                        var am = this.getActiveModule(moduleName);
                        if (am) {
                            $e.fn.setVars(vars[moduleName]);
                        }
                    }
                }
            }
            if (extend) {
                var am1;
                var c1;
                for (var ex in extend) {
                    if (extend.hasOwnProperty(ex)) {
                        am1 = this.getActiveModule(ex);
                        c1 = extend[ex];
                        if (am1 && c1.onLoad) {
                            $e.fn.applyMethod(am1, am1.onLoad);
                        }
                    }
                }
                am1 = $e.getActiveModule();
                c1 = extend[am1.getName()];
                if (c1 && c1.onLast) {
                    $e.fn.applyMethod(am1, am1.onLast);
                }
            }
        },

        /**
         * 释放成员
         * @param {Object} dump - 释放配置
         * @returns {void}
         */
        releaseMember: function (dump) {
            var r1;
            var m1;
            for (var i in dump) {
                if (dump.hasOwnProperty(i)) {
                    r1 = dump[i];
                    if (i === 'ado') {
                        for (var j = 0; j < r1.length; j++) {
                            m1 = this.getADO(r1[j][0], r1[j][1]);
                            if (m1) {
                                m1.release();
                            }
                        }
                    } else if (i === 'view') {
                        for (var k = 0; k < r1.length; k++) {
                            m1 = this.getView(r1[k][0], r1[k][1]);
                            if (m1) {
                                m1.release(false, r1[k][2] === '1');
                            }
                        }
                    } else if (i === 'module') {
                        for (var m = 0; m < r1.length; m++) {
                            this.releaseActiveModule(r1[m][0]);
                        }
                    }
                }
            }
        },

        /**
         * 传递父窗口（子类可覆盖）
         * @param {Object} options - 选项
         * @returns {void}
         */
        transParent: function (options) {
            // 子类实现
        },

        /**
         * 获取多个ADOAgent的变动数据
         * @param {string} wn - 模块名
         * @param {string|Array} ados - ADO名称
         * @returns {Array} 变动数据
         */
        getEditADOData: function (wn, ados) {
            var data = [];
            if (ados) {
                var ado;
                var names;
                var amn;
                var name;
                var p;
                names = (ados instanceof Array) ? ados : ados.split(',');
                for (var i = 0; i < names.length; i++) {
                    p = names[i].indexOf('/');
                    if (p >= 0) {
                        amn = names[i].substring(0, p);
                        name = names[i].substring(p + 1);
                    } else {
                        amn = wn;
                        name = names[i];
                    }
                    ado = $e.getADO(name, amn);
                    if (ado) {
                        var adata = ado.getUpdateData();
                        if (adata) {
                            data.push(adata);
                        }
                    }
                }
            }
            return data;
        },

        /**
         * 显示进度条
         * @param {string} [title] - 标题
         * @returns {void}
         */
        showProgress: function (title) {
            title = title || 'please wait ......';
            var p = this._progress;
            if (!p) {
                this._progress = p = $e.fn.create('div', 'progress');
                p.innerHTML = '<ul><li><span class="progress-icon fa fa-spinner fa-spin"></span></li><li><span id="progress">' + title + '</span></li></ul>';
                document.body.appendChild(p);
            } else {
                this.fn.setLabelText(p.querySelector('#progress'), title);
            }
            this.fn.setStyle(p, 'z-index:' + (this.fn._maxIndex + 1));
            $e.fn.showElement(p, true);
        },

        /**
         * 隐藏进度条
         * @returns {void}
         */
        hideProgress: function () {
            $e.fn.showElement(this._progress, false);
        },

        /**
         * 产生随机数
         * @returns {number} 随机数
         */
        randNum: function () {
            var today = new Date();
            return Math.abs(Math.sin(today.getTime()));
        },

        /**
         * 释放引擎
         * @returns {void}
         */
        release: function () {
            if (this.events) {
                if (!this.isPublic) {
                    this.request(this.activeGroupName, 'release');
                }
                if (this.ams) {
                    var moduleName;
                    for (moduleName in this.ams) {
                        if (this.ams.hasOwnProperty(moduleName)) {
                            this.ams[moduleName].release();
                        }
                    }
                    this.ams = null;
                }
                this.env = null;
                this.envListen = null;
                this.events.release();
                this.events = null;
            }
        }
    }, $e);
}($e);
