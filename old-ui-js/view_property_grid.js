+function ($e) {
    /**
     * PropertyGridView 属性表格组件
     * 用于展示和编辑属性，支持分组和分类
     * @param {Object} options 配置项
     */
    function PropertyGridView(options) {
        this.props = options || {};
        this._title = this.props['title'] || '';
        this._properties = this.props['properties'] || [];
        this._groups = this.props['groups'] || [];
        this._size = this.props['size'] || 'default';
        this._expandedKeys = this.props['expandedKeys'] || [];
        this._categoryHandles = [];
        this._rowHandles = [];
        this._groupEls = [];
    }

    PropertyGridView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_property_grid',
        shell: null,
        body: null,
        _title: '',
        _properties: null,
        _groups: null,
        _size: 'default',
        _expandedKeys: null,
        _categoryHandles: null,
        _rowHandles: null,
        _groupEls: null,
        _headerEl: null,
        _bodyEl: null,

        /**
         * 初始化组件
         * 设置body区域，渲染属性表格，调用inited完成初始化
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            $e.fn.addClass(this.shell, 'yc-property-grid');
            if (this._size && this._size !== 'default') {
                $e.fn.addClass(this.shell, 'yc-property-grid--' + this._size);
            }
            this.render();
            this.inited();
        },

        /**
         * 渲染PropertyGrid组件DOM结构
         * 根据配置构建属性表格
         */
        render: function () {
            var shell = this.shell;
            shell.innerHTML = '';
            this._categoryHandles = [];
            this._rowHandles = [];
            this._groupEls = [];

            if (this._title) {
                var header = document.createElement('div');
                $e.fn.addClass(header, 'yc-property-grid__header');
                var title = document.createElement('div');
                $e.fn.addClass(title, 'yc-property-grid__title');
                title.innerText = this._title;
                header.appendChild(title);
                shell.appendChild(header);
                this._headerEl = header;
            }

            var body = document.createElement('div');
            $e.fn.addClass(body, 'yc-property-grid__body');
            this._bodyEl = body;

            var groups = this._groups;
            if (groups && groups.length > 0) {
                for (var i = 0; i < groups.length; i++) {
                    var groupEl = this.createGroup(groups[i]);
                    body.appendChild(groupEl);
                }
            } else {
                var defaultGroup = this.createGroup({
                    key: 'default',
                    title: '属性',
                    properties: this._properties
                });
                body.appendChild(defaultGroup);
            }

            shell.appendChild(body);
        },

        /**
         * 创建属性分组
         * @param {Object} group 分组配置
         * @returns {HTMLElement} 分组元素
         */
        createGroup: function (group) {
            var _this = this;
            var key = group.key || 'default';
            var title = group.title || '';
            var properties = group.properties || [];
            var isExpanded = this._expandedKeys.indexOf(key) >= 0;

            var category = document.createElement('div');
            $e.fn.addClass(category, 'yc-property-grid__category');
            if (isExpanded) {
                $e.fn.addClass(category, 'is-expanded');
            }
            category.setAttribute('data-key', key);

            var header = document.createElement('div');
            $e.fn.addClass(header, 'yc-property-grid__category-header');

            var icon = document.createElement('i');
            $e.fn.addClass(icon, 'fa');
            $e.fn.addClass(icon, 'fa-chevron-right');
            $e.fn.addClass(icon, 'yc-property-grid__category-icon');
            header.appendChild(icon);

            var titleEl = document.createElement('span');
            $e.fn.addClass(titleEl, 'yc-property-grid__category-title');
            titleEl.innerText = title;
            header.appendChild(titleEl);

            category.appendChild(header);

            var categoryBody = document.createElement('div');
            $e.fn.addClass(categoryBody, 'yc-property-grid__category-body');

            for (var i = 0; i < properties.length; i++) {
                var row = this.createPropertyRow(properties[i]);
                categoryBody.appendChild(row);
            }

            category.appendChild(categoryBody);

            var handle = this.bindListen($e.events.regEvent(header, 'click', this, function () {
                _this.toggleCategory(key);
            }));
            this._categoryHandles.push(handle);
            this._groupEls.push(category);

            return category;
        },

        /**
         * 创建属性行
         * @param {Object} prop 属性配置
         * @returns {HTMLElement} 属性行元素
         */
        createPropertyRow: function (prop) {
            var _this = this;
            var name = prop.name || '';
            var value = prop.value || '';
            var type = prop.type || 'text';
            var readonly = $e.fn.getBoolean(prop.readonly, false);
            var required = $e.fn.getBoolean(prop.required, false);
            var disabled = $e.fn.getBoolean(prop.disabled, false);

            var row = document.createElement('div');
            $e.fn.addClass(row, 'yc-property-grid__row');
            if (disabled) {
                $e.fn.addClass(row, 'is-disabled');
            }

            var nameEl = document.createElement('div');
            $e.fn.addClass(nameEl, 'yc-property-grid__name');
            if (required) {
                $e.fn.addClass(nameEl, 'yc-property-grid__name-required');
            }
            nameEl.innerText = name;
            row.appendChild(nameEl);

            var valueEl = document.createElement('div');
            $e.fn.addClass(valueEl, 'yc-property-grid__value');

            var inputEl = this.createEditor(type, value, readonly, disabled, prop);
            valueEl.appendChild(inputEl);
            row.appendChild(valueEl);

            return row;
        },

        /**
         * 创建属性编辑器
         * @param {string} type 编辑器类型
         * @param {string} value 当前值
         * @param {boolean} readonly 是否只读
         * @param {boolean} disabled 是否禁用
         * @param {Object} prop 属性配置
         * @returns {HTMLElement} 编辑器元素
         */
        createEditor: function (type, value, readonly, disabled, prop) {
            var _this = this;
            if (readonly) {
                var text = document.createElement('span');
                $e.fn.addClass(text, 'yc-property-grid__value-text');
                $e.fn.addClass(text, 'yc-property-grid__value-text--readonly');
                text.innerText = value;
                return text;
            }

            var input;
            if (type === 'select') {
                input = document.createElement('select');
                $e.fn.addClass(input, 'yc-property-grid__value-select');
                var options = prop.options || [];
                for (var i = 0; i < options.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = options[i].value;
                    opt.innerText = options[i].label;
                    if (options[i].value === value) {
                        opt.selected = true;
                    }
                    input.appendChild(opt);
                }
            } else if (type === 'boolean') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = !!value;
                $e.fn.addClass(input, 'yc-property-grid__value-boolean');
            } else if (type === 'textarea') {
                input = document.createElement('textarea');
                $e.fn.addClass(input, 'yc-property-grid__editor-textarea');
                input.value = value;
            } else if (type === 'number') {
                input = document.createElement('input');
                input.type = 'number';
                $e.fn.addClass(input, 'yc-property-grid__value-input');
                input.value = value;
            } else if (type === 'color') {
                var colorWrap = document.createElement('div');
                $e.fn.addClass(colorWrap, 'yc-property-grid__value-color');
                var preview = document.createElement('div');
                $e.fn.addClass(preview, 'yc-property-grid__color-preview');
                preview.style.backgroundColor = value;
                colorWrap.appendChild(preview);
                input = document.createElement('input');
                input.type = 'text';
                $e.fn.addClass(input, 'yc-property-grid__value-input');
                input.value = value;
                colorWrap.appendChild(input);
                return colorWrap;
            } else {
                input = document.createElement('input');
                input.type = 'text';
                $e.fn.addClass(input, 'yc-property-grid__value-input');
                input.value = value;
            }

            if (disabled) {
                input.disabled = true;
            }

            var changeHandle = this.bindListen($e.events.regEvent(input, 'change', this, function (e) {
                var newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                _this.onPropertyChange(prop.name, newValue, prop);
            }));
            this._rowHandles.push(changeHandle);

            return input;
        },

        /**
         * 切换分类展开/折叠状态
         * @param {string} key 分类标识
         */
        toggleCategory: function (key) {
            var idx = this._expandedKeys.indexOf(key);
            if (idx >= 0) {
                this._expandedKeys.splice(idx, 1);
            } else {
                this._expandedKeys.push(key);
            }
            this.updateCategoryStates();
        },

        /**
         * 更新分类状态
         */
        updateCategoryStates: function () {
            for (var i = 0; i < this._groupEls.length; i++) {
                var el = this._groupEls[i];
                var key = el.getAttribute('data-key');
                if (this._expandedKeys.indexOf(key) >= 0) {
                    $e.fn.addClass(el, 'is-expanded');
                } else {
                    $e.fn.removeClass(el, 'is-expanded');
                }
            }
        },

        /**
         * 设置属性数据
         * @param {Array} properties 属性数组
         */
        setProperties: function (properties) {
            this._properties = properties || [];
            this.render();
        },

        /**
         * 获取属性数据
         * @returns {Array} 属性数组
         */
        getProperties: function () {
            return this._properties;
        },

        /**
         * 设置分组数据
         * @param {Array} groups 分组数组
         */
        setGroups: function (groups) {
            this._groups = groups || [];
            this.render();
        },

        /**
         * 获取分组数据
         * @returns {Array} 分组数组
         */
        getGroups: function () {
            return this._groups;
        },

        /**
         * 设置标题
         * @param {string} title 标题文本
         */
        setTitle: function (title) {
            this._title = title;
            if (this._headerEl) {
                var titleEl = this._headerEl.querySelector('.yc-property-grid__title');
                if (titleEl) {
                    titleEl.innerText = title;
                }
            } else {
                this.render();
            }
        },

        /**
         * 获取标题
         * @returns {string} 标题文本
         */
        getTitle: function () {
            return this._title;
        },

        /**
         * 属性变化回调
         * @param {string} name 属性名
         * @param {any} value 属性值
         * @param {Object} prop 属性配置
         */
        onPropertyChange: function (name, value, prop) {
        },

        /**
         * 释放组件资源
         * 清理事件监听器和引用
         */
        selfRelease: function () {
            if (this._categoryHandles) {
                for (var i = 0; i < this._categoryHandles.length; i++) {
                    if (this._categoryHandles[i]) {
                        this._categoryHandles[i].release();
                    }
                }
                this._categoryHandles = null;
            }
            if (this._rowHandles) {
                for (var j = 0; j < this._rowHandles.length; j++) {
                    if (this._rowHandles[j]) {
                        this._rowHandles[j].release();
                    }
                }
                this._rowHandles = null;
            }
            this._groupEls = null;
            this._headerEl = null;
            this._bodyEl = null;
            this.shell = null;
            this.body = null;
        }
    };

    var plugin = {
        create: function (options) {
            return new PropertyGridView(options);
        }
    };
    $e.ui.addViewPlugin("view_property_grid", plugin);
}($e);
