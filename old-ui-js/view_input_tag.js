/**
 * @file 标签输入框组件
 * @description 提供标签输入框功能，支持标签添加/删除、输入验证、尺寸设置等功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function ($e) {
    'use strict';

    /**
     * InputTagView 标签输入框视图组件
     * @class InputTagView
     * @param {Object} options - 配置选项
     * @param {Array} [options.tags=[]] - 初始标签数组
     * @param {string} [options.size] - 尺寸
     * @param {boolean} [options.disabled=false] - 是否禁用
     * @param {boolean} [options.closable=true] - 标签是否可关闭
     * @param {number} [options.max] - 最大标签数量
     * @param {string} [options.placeholder='请输入标签'] - 占位符
     * @param {Function} [options.validate] - 验证函数
     * @param {string} [options.tagType] - 标签类型：success/warning/danger/info
     * @param {Function} [options.onAdd] - 添加标签回调
     * @param {Function} [options.onRemove] - 移除标签回调
     * @param {Function} [options.onChange] - 变化回调
     */
    function InputTagView(options) {
        this.props = options;
        this._tags = options.tags || [];
        this._size = options.size || '';
        this._disabled = $e.fn.getBoolean(options.disabled, false);
        this._closable = $e.fn.getBoolean(options.closable, true);
        this._max = options.max || null;
        this._placeholder = options.placeholder || '请输入标签';
        this._validate = options.validate || null; // 验证函数
        this._tagType = options.tagType || ''; // success, warning, danger, info
    }

    InputTagView.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: 'view_input_tag',
        body: null,
        shell: null,
        _container: null,
        _input: null,
        _countEl: null,

        /**
         * 初始化组件
         */
        init: function () {
            this.body = this.shell.querySelector("[view-band='body']") || this.shell;
            this.buildDOM();
            this.renderTags();
            this.bindEvents();
            this.inited();
        },

        /**
         * 构建DOM结构
         */
        buildDOM: function () {
            var container = document.createElement('div');
            container.className = 'yc-input-tag';
            if (this._size) {
                container.classList.add('yc-input-tag--' + this._size);
            }
            if (this._disabled) {
                container.classList.add('is-disabled');
            }

            // 输入框
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'yc-input-tag__input';
            input.placeholder = this._placeholder;
            input.disabled = this._disabled;
            container.appendChild(input);
            this._input = input;

            // 计数器
            if (this._max) {
                var countEl = document.createElement('span');
                countEl.className = 'yc-input-tag__count';
                container.appendChild(countEl);
                this._countEl = countEl;
                this.updateCount();
            }

            this.body.appendChild(container);
            this._container = container;
        },

        /**
         * 渲染标签
         */
        renderTags: function () {
            var _this = this;
            // 清除已有标签
            var existingTags = this._container.querySelectorAll('.yc-input-tag__tag');
            existingTags.forEach(function (tag) {
                tag.remove();
            });

            // 重新渲染
            this._tags.forEach(function (tagText) {
                _this.createTagElement(tagText);
            });

            this.updateCount();
        },

        /**
         * 创建标签元素
         */
        createTagElement: function (text) {
            var _this = this;
            var tag = document.createElement('span');
            tag.className = 'yc-input-tag__tag';
            if (this._tagType) {
                tag.classList.add('yc-input-tag__tag--' + this._tagType);
            }
            if (this._closable) {
                tag.classList.add('yc-input-tag__tag--closable');
            }
            tag.innerText = text;

            // 关闭按钮
            if (this._closable && !this._disabled) {
                var closeBtn = document.createElement('span');
                closeBtn.className = 'yc-input-tag__tag-close';
                closeBtn.innerHTML = '&times;';
                closeBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    _this.removeTag(text);
                });
                tag.appendChild(closeBtn);
            }

            // 插入到输入框之前
            this._container.insertBefore(tag, this._input);
            return tag;
        },

        /**
         * 绑定事件
         */
        bindEvents: function () {
            var _this = this;

            // 回车添加标签
            this.bindListen($e.events.regEvent(this._input, 'keydown', this, function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    _this.addTagFromInput();
                } else if (e.key === 'Backspace' && !_this._input.value && _this._tags.length > 0) {
                    _this.removeTag(_this._tags[_this._tags.length - 1]);
                }
            }));

            // 失焦添加标签
            this.bindListen($e.events.regEvent(this._input, 'blur', this, function () {
                setTimeout(function () {
                    if (_this._input.value.trim()) {
                        _this.addTagFromInput();
                    }
                }, 200);
            }));

            // 点击容器聚焦
            this.bindListen($e.events.regEvent(this._container, 'click', this, function () {
                if (!_this._disabled) {
                    _this._input.focus();
                }
            }));

            // 聚焦样式
            this.bindListen($e.events.regEvent(this._input, 'focus', this, function () {
                _this._container.classList.add('is-focus');
            }));
            this.bindListen($e.events.regEvent(this._input, 'blur', this, function () {
                setTimeout(function () {
                    _this._container.classList.remove('is-focus');
                }, 250);
            }));
        },

        /**
         * 从输入框添加标签
         */
        addTagFromInput: function () {
            var text = this._input.value.trim();
            if (!text) return;

            // 验证
            if (this._validate && !this._validate(text)) {
                return;
            }

            // 去重
            if (this._tags.indexOf(text) >= 0) {
                this._input.value = '';
                return;
            }

            // 最大值限制
            if (this._max && this._tags.length >= this._max) {
                return;
            }

            this.addTag(text);
            this._input.value = '';
        },

        /**
         * 添加标签
         */
        addTag: function (text) {
            this._tags.push(text);
            this.createTagElement(text);
            this.updateCount();
            if (this.props.onAdd) {
                this.props.onAdd(text, this._tags);
            }
            if (this.props.onChange) {
                this.props.onChange(this._tags);
            }
        },

        /**
         * 移除标签
         */
        removeTag: function (text) {
            var index = this._tags.indexOf(text);
            if (index >= 0) {
                this._tags.splice(index, 1);
                this.renderTags();
                if (this.props.onRemove) {
                    this.props.onRemove(text, this._tags);
                }
                if (this.props.onChange) {
                    this.props.onChange(this._tags);
                }
            }
        },

        /**
         * 更新计数器
         */
        updateCount: function () {
            if (this._countEl) {
                this._countEl.innerText = this._tags.length + '/' + this._max;
            }
        },

        /**
         * 获取所有标签
         */
        getTags: function () {
            return this._tags.slice();
        },

        /**
         * 设置标签
         */
        setTags: function (tags) {
            this._tags = tags || [];
            this.renderTags();
        },

        /**
         * 设置禁用状态
         */
        setDisabled: function (disabled) {
            this._disabled = disabled;
            this._input.disabled = disabled;
            if (disabled) {
                this._container.classList.add('is-disabled');
            } else {
                this._container.classList.remove('is-disabled');
            }
        },

        /**
         * 释放组件
         */
        selfRelease: function () {
            this._container = null;
            this._input = null;
            this._countEl = null;
        },

        resize: function (options) {
        }
    };

    var plugin = {
        create: function (options) {
            return new InputTagView(options);
        }
    };
    $e.ui.addViewPlugin("view_input_tag", plugin);
}($e);
