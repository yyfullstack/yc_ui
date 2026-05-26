+function ($e) {
    var valid={
        addValidError:function(info){
            $e.fn.addClass(this.getShell(), 'yc-view-error-border');
            var cell;
            if (info){
                cell=this.getShell().querySelector(".yc-view-error-info");
                if (!cell){
                    cell = $e.fn.create("SPAN",'yc-view-error-info');
                    this.getShell().appendChild(cell);
                }
                cell.innerText = info;
            }
        },
        removeValidError:function(){
            $e.fn.removeClass(this.getShell(),"yc-view-error-border");
            var cell=this.getShell().querySelector(".yc-view-error-info");
            if (cell){
                cell.parentNode.removeChild(cell);
            }
        }
    };
    function SelfText(element, options) {
        this.shell = element;
        this.props = options;
    }

    SelfText.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "text",
        init: function () {
            this.formatText = this.props['formatText'] || '';
            this.initField();
            var p = this.props.precision;
            if ($e.fn.getInt(p, 0) > 0) {
                this.field.setAttribute('maxlength', p);
            }
        },
        initField: function () {
            this.field = this.queryField();
            this.bindListen($e.events.regEvent(this.field, 'change', this, this.changed));
            this.bindListen($e.events.regEvent(this.field, 'blur', this, this.lostFocus));
            this.bindListen($e.events.regEvent(this.field, 'focus', this, this.focused));
            //$e.fn.extend(valid,this);
        },
        lostFocus: function () {
            this.setValue(this.getValue(), true);
        },
        focused: function () {
            this.setValue(this.getValue(), true);
            this.field.select();
            this.removeValidError();
        },
        formatValue: function (value, focused) {
            if (value===0 || value === false || value) {
                value += "";
                if (this.formatText == "upper") {
                    value = value.toUpperCase();
                } else if (this.formatText == "lower") {
                    value = value.toLowerCase();
                }
            } else {
                value = "";
            }
            return value;
        }
    };
    var plugin = {
        create: function (element, options) {
            return new SelfText(element, options);
        }
    };
    $e.fn.extend($e.ui.BasicField, SelfText.prototype);
    $e.fn.extend(valid,SelfText.prototype);
    $e.ui.addFieldPlugin("text", plugin);

    function SelfNumber(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfNumber.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "number",
        init: function () {
            this.formatText = this.props['formatText'] || '';
            if (!this.formatText) {
                var p = this.props.precision;
                if (p > 0) {
                    this.formatText = "#." + "#".fillText(p);
                }
            }
            this.initField();
        },
        formatValue: function (value, focused) {
            if (value || value === 0.0) {
                if (this.formatText) {
                    value = $e.fn.formatNumber(value, this.formatText);
                }
                if (focused && value) {
                    value = (value+'').replace(/,/g, "");
                }
            } else {
                value = "";
            }
            return value;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfNumber(element, options);
        }
    };
    $e.fn.extend(SelfText.prototype, SelfNumber.prototype);
    $e.ui.addFieldPlugin("number", plugin);

    function SelfPercent(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfPercent.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "percent",
        percent: 100,
        postChar: '%',
        init: function () {
            this.formatText = this.props['formatText'] || '';
            if (!this.formatText) {
                var p = this.props.precision;
                if (p > 0) {
                    this.formatText = "#." + '#'.fillText(p);
                }
            } else if (this.formatText.endsWith(this.postChar)) {
                this.formatText = this.formatText.substring(0, this.formatText.length - 1);
            }
            this.initField();
            this.field.setAttribute("type", "text");
        },
        formatValue: function (value, focused) {
            if (value || value === 0.0) {
                if (focused) {
                    // 替换","为空
                    value = (value+'').replace(/,/g, "");
                }
                value = parseFloat(0 || value) * this.percent;
                if (this.formatText) {
                    value = $e.fn.formatNumber(value, this.formatText);
                }
            } else {
                value = "";
            }
            return value;
        },
        getValue: function () {
            var value = this.field.value;
            if (value) {
                value = parseFloat((value+'').replace(/,/g, "")) / this.percent;
            }
            return value;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfPercent(element, options);
        }
    };
    $e.fn.extend(SelfText.prototype, SelfPercent.prototype);
    $e.ui.addFieldPlugin("percent", plugin);

    function SelfTextArea(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfTextArea.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "textarea",
        init: function () {
            this.field = this.queryField('textarea') || this.queryField('input');
            this.bindListen($e.events.regEvent(this.field, 'change', this, this.changed));
            this.bindListen($e.events.regEvent(this.field, 'focus', this, this.focused));
        },
         focused: function () {
            this.removeValidError();
        }
    };
    var plugin = {
        create: function (element, options) {
            return new SelfTextArea(element, options);
        }
    };
    $e.fn.extend($e.ui.BasicField, SelfTextArea.prototype);
    $e.fn.extend(valid, SelfTextArea.prototype);
    $e.ui.addFieldPlugin("textarea", plugin);

    function SelfCheckbox(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfCheckbox.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "checkbox",
        init: function () {
            var vs = this.props['listData'];
            if (vs && (typeof vs) == 'string') {
                vs = $e.fn.createObject(vs);
            }
            this.listData = vs || {checked: true, unchecked: false};
            this.field = this.queryField('input[type="checkbox"]');
            this.bindListen($e.events.regEvent(this.field, 'change', this, this.changed));
        },
        setEditable: function (able) {
        },
        isEditable: function (options) {
            return false;
        },
        setEnable: function (able) {
            able = !!able;
            if (this.field) {
                $e.fn.enableField(this.field, able);
            }
           this.enable = able;
        },
        getValue: function () {
            return this.field.checked ? this.listData.checked : this.listData.unchecked;
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    this.field.checked = this.eq(value, this.listData.checked);
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldValue = this.getValue();
                } catch (e) {
                    throw("checkbox " + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        isCheckedValue: function (value) {
            return this.eq(value, this.listData.checked);
        },
        /**
         * 返回选中或非选中时的value
         * @param ischecked
         * @returns
         */
        getRealValue:function(ischecked){
        	return ischecked?this.listData.checked:this.listData.unchecked;
        },
        eq: function (v1, v2) {
            return v1 == v2;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfCheckbox(element, options);
        }
    };
    $e.fn.extend($e.ui.BasicField, SelfCheckbox.prototype);
    $e.ui.addFieldPlugin("checkbox", plugin);

    function SelfRadio(element, options) {
        this.shell = element;
        this.props = options;
    }

    SelfRadio.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "radio",
        init: function () {
            this.field = this.shell.querySelectorAll('input[type="radio"]');//[].slice.call();
            var name = 'r' + $e.fn.nextID();//这种动态命名方式是防止整个Document中的radio的名称冲突
            for (var i = 0; i < this.field.length; i++) {
                if (!this.field[i]['name']) {
                    this.field[i].setAttribute('name', name);
                }
                this.bindListen($e.events.regEvent(this.field[i], 'change', this, this.changed));
            }
        },
        setEditable: function (able) {
        },
        isEditable: function (options) {
            return false;
        },
        setEnable: function (able) {
            $e.fn.enableFields(this.field,able);
            this.enable = !!able;
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    value = this.turnValue(value, true);
                    var v1, field;
                    for (var i = 0; i < this.field.length; i++) {
                        field = this.field[i];
                        v1 = this.turnValue(field.getAttribute('value'), true);
                        field.checked = this.eq(v1, value);
                    }
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldValue = this.getValue();
                } catch (e) {
                    throw("radio " + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        /**
         * 值转换可以提供灵活的取值类型或方式
         * @param value
         * @param isget
         * @returns {*}
         */
        turnValue: function (value, isget) {
            return value;
        },
        getValue: function () {
            var fd;
            for (var i = 0; i < this.field.length; i++) {
                fd = this.field[i];
                if (fd.checked) {
                    return this.turnValue(fd.getAttribute('value'), true);
                }
            }
            return "";
        },
        eq: function (v1, v2) {
            return v1 == v2;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfRadio(element, options);
        }
    };
    $e.fn.extend($e.ui.BasicField, SelfRadio.prototype);
    $e.ui.addFieldPlugin("radio", plugin);

    function SelfList(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
        this.items = [];
    }

    SelfList.prototype = {
        VERSION: '3.0.1',
        props: null,
        value: null,
        oldItem: null,
        choiceType: 'single',//单选模式
        type: "list",
        //item_key:'data-list',
        //本方法需要覆盖
        init: function () {
            this.choiceType = (this.props['choiceType'] || 'single');
            this.initListBody();
        },
        initListBody: function () {
            this.listBody = this.shell.querySelector('[field-band="list"]') || this.shell;
            this.listData = this.shell.querySelector('[field-band="list-data"]') || this.listBody;
            this.bindListen($e.events.regEvent(this.listData, 'click', this, this.choice));
            this.changeProperty("listData", this.props['listData']);
        },

        /**
         * 根据字符键值生成列表项
         * @param itemtext 数组[[text,value],[text,value]]
         */
        changeListItem: function (itemtext) {
            $e.fn.setChild(this.listData, null);
            this.oldItem = null;
            if (itemtext) {
                var item, items = (itemtext instanceof Array) ? itemtext : this.parseListText(itemtext);
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item instanceof Array) {
                        this.addItem(item[0], item[1]);
                    } else {
                        this.addItem(item, item);
                    }
                }
            }
            this.setValue(this.getValue(), true);
        },
        /**
         * 修改组件的属性
         * @param values 应是二维数组或如 text1/value1;text2/value2形式的字符串
         */
        changeProperty: function (name, value) {
            if (name) {
                if ((arguments.length == 1) && (typeof name) == 'string') {
                    var s = name.trim();
                    if (s.startsWith("{") && s.endsWith("}")) {
                        name = JSON.parse(name);
                    }
                }
                if ($e.fn.isPlainObject(name) && name['listData'] !== undefined) {
                    value = name['listData'];
                    name = 'listData';
                }
                if (name == 'listData') {
                    this.changeListItem(value);
                }
                this.props[name] = value;
            }
        },

        /**
         * 这种方式只是个参考，具体情况可以覆盖这个方法
         * @param itemvalue
         * @returns {HTMLDivElement}
         */
        addItem: function (value, text) {
            var item = this.buildItem(value, text);
            if (item.value == undefined) {
                item.value = value;
                item.text = text;
            }
            this.listData.appendChild(item);
            this.items.push(item);
            return item;
        },
        /**
         * 返回item所在的位置
         * @param value
         */
        findItem: function (value, istext) {
            if (typeof value == 'function') {
                for (var i = 0; i < this.items.length; i++) {
                    if (value(this.items[i])) {
                        return this.items[i];
                    }
                }
            } else {
                istext = !!istext;
                var key=istext?"text":"value";
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i][key] == value) {
                        return this.items[i];
                    }
                }
            }
            return null;
        },
        getItem: function (index) {
            return this.items[index];
        },
        buildItem: function (value, text) {
            var item = $e.fn.create("dd");
            item.value = value;
            item.text = text;
            item.innerHTML = text;
            return item;
        },

        /**
         * 返回 item
         * @param event
         * @returns {*|Element}
         */
        queryItem: function (event) {
            var e1 = event.srcElement || event.target || event;
            return $e.fn.closest(e1, function (node) {
                return node['value'] != undefined ? 1 : (node['$owner'] ? -1 : 0);
            }, true);
        },
        choice: function (event) {
            var item = this.queryItem(event);
            if (item) {
                this.setValue(item.value);
            }
        },
        setSelectedItem: function (value, changevalue) {
            if (changevalue) {
                this.setValue(value);
            } else {
                //只改变样式
                var item = this.findItem(value);
                if (item) {
                    if (this.oldItem && this.choiceType == 'single') {
                        $e.fn.removeClass(this.oldItem, 'choiced');
                    }
                    $e.fn.addClass(item, 'choiced');
                }
            }
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    var item = this.findItem(value);
                    if (this.oldItem) {
                        $e.fn.removeClass(this.oldItem, 'choiced');
                    }
                    if (item) {
                        $e.fn.addClass(item, 'choiced');
                    }
                    this.value = value;
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldItem = item;
                    this.oldValue = value;
                } catch (e) {
                    throw(this.type + ":" + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        getValue: function () {
            return this.value;
        },
        getItemText: function (value) {
            if (arguments.length == 0) {
                return this.getItemText(this.getValue());
            }
            var item = this.findItem(value);
            return item ? item.text : (value + '');
        },
        parseListText: function (text, p1, p2) {
            var data = [];
            if (text) {
            	var st1=null;
                var j,vs = text.split(p1 || ";");
                p2 = p2 || "/";
                for (var i = 0; i < vs.length; i++) {
                	if (st1!=vs[i]){
                		st1=vs[i];
	                    j = vs[i].indexOf(p2);
	                    if (j >= 0) {
	                        data.push([vs[i].substring(0, j), vs[i].substring(j + 1)]);
	                    } else {
	                        data.push([vs[i], vs[i]]);
	                    }
                	}
                }
            }
            return data;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfList(element, options);
        }
    };
    $e.fn.extend($e.ui.AbstractField, SelfList.prototype);
    $e.ui.addFieldPlugin("list", plugin);

    function SelfLabel(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfLabel.prototype = {
        VERSION: '3.0.1',
        props: null,
        value: null,
        type: "label",
        data: null,
        init: function () {
            this.formatText = this.props['formatText'] || '';
            this.field = this.shell.querySelector('[field-band="label"]') || this.shell;
            this.parseListText(this.props['listData']);
        },
        /**
         * 需要覆盖此方法,才有效果
         * @param value
         * @param focused
         * @returns {*}
         */
        formatValue: function (value, focused) {
            return this.formatText?$e.fn.formatData(value,this.formatText):value;
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    this.value = value;
                    var text;
                    if (this.data && this.data[value + ''] !== undefined) {
                        text = this.data[value + ''];
                    } else {
                        text = value;
                    }
                    this.field.innerHTML = this.formatValue(text, false);
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldValue = value;
                } catch (e) {
                    throw("SelfLabel " + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        getValue: function () {
            return this.value;
        },
        changeProperty: function (name, value) {
            if (name) {
                if ((arguments.length == 1) && (typeof name) == 'string') {
                    var s = name.trim();
                    if (s.startsWith("{") && s.endsWith("}")) {
                        name = JSON.parse(name);
                    }
                }
                if ($e.fn.isPlainObject(name) && name['listData'] !== undefined) {
                    value = name['listData'];
                    name = 'listData';
                }
                if (name == 'listData') {
                    this.parseListText(value);
                }
                this.props[name] = value;
            }
        },
        parseListText: function (text, p1, p2) {
            var data = {};
            if (text) {
                var vs = text.split(p1 || ";");
                p2 = p2 || "/";
                for (var i = 0; i < vs.length; i++) {
                    var j = vs[i].indexOf(p2);
                    if (j >= 0) {
                        data[vs[i].substring(0, j)] = vs[i].substring(j + 1);
                    } else {
                        data[vs[i]] = vs[i];
                    }
                }
            }
            this.data = data;
            this.setValue(this.getValue(),true);
        },
        getItemText: function (value) {
            value = value + '';
            if (this.data && this.data[value] !== undefined) {
                return this.data[value];
            }
            return value;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfLabel(element, options);
        }
    };
    $e.fn.extend($e.ui.AbstractField, SelfLabel.prototype);
    $e.ui.addFieldPlugin("label", plugin);

    function SelfComboBox(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
        this.items = [];
    }

    SelfComboBox.prototype = {
        VERSION: '3.0.1',
        props: null,

        editable: false,
        enable:true,
        oldItem: null,
        type: "combobox",
        value: '',
        choiceType: 'single',
        menuWidth: 0,
        listBody: null,
        listData: null,
        init: function () {
            this.field = this.shell.querySelector('input');
            this.choiceType = (this.props['choiceType'] || 'single');
            this.bindListen($e.events.regEvent(this.field, 'click', this, this.showList));
            var ico = this.shell.querySelector('[field-band="icon"]');
            if (ico) {
                this.bindListen($e.events.regEvent(ico, 'click', this, this.showList));
            }
            this.initListBody();
            this.bindListen($e.events.regEvent(this.field, 'change', this, this.changed));
            this.bindListen($e.events.regEvent(this.field, 'blur', this, this.lostFocus));
            this.bindListen($e.events.regEvent(this.field, 'focus', this, this.focused));
        },

        lostFocus: function () {
            //this.field.setSelectionRange(0,0);
        },
        focused: function () {
            this.field.select();
            this.removeValidError();
        },

        /**
         * 初始化下拉列表项
         */
        initListBody: function () {
            this.listBody = this.shell.querySelector('[field-band="list"]');//|| this.shell;$e.fn.create("div",this.type + ' list');
            if (!this.listBody) {
                this.listBody = $e.fn.create('dl', 'drop-select');
                this.listBody.setAttribute('field-band', 'list');
                //this.getShell().appendChild(this.listBody);
            }
            this.listData = this.shell.querySelector('[field-band="list-data"]') || this.listBody;//|| this.shell;$e.fn.create("div",this.type + ' list');
            document.body.appendChild(this.listBody);
            $e.fn.addClass(this.listBody, 'hide');
            this.bindListen($e.events.regEvent(this.listData, 'click', this, this.choice));
            this.changeListItem(this.props['listData']);
        },
        getListBody: function () {
            return this.listBody;
        },
        //changeProperty: SelfList.prototype.changeProperty,
        choice: function (event) {
            $e.events.cancelEvent(event);
            var item = this.queryItem(event);
            if (item) {
                this.setValue(item.value, false, true);
                //this.doChangedListen(true);
            }
            this.showList();
            return false;
        },

        queryItem: function (event) {
            var e1 = event.srcElement || event.target || event;
            return $e.fn.closest(e1, function (node) {
                return node['value'] != undefined ? 1 : (node.getAttribute('field-band') ? -1 : 0);
            }, true);
        },
        showList: function (isshow) {
            if (arguments.length > 0 && (typeof isshow == 'boolean')) {
                //显式指定
                isshow = isshow && this.isEnable();
            } else {
                $e.events.cancelEvent(isshow);
                //自动
                isshow = !$e.fn.isElementShow(this.listBody) && this.isEnable();
            }
            //show or hide
            if (isshow) {
                $e.fn.removeClass(this.listBody, 'hide');
                $e.fn.setStyle(this.listBody, 'width:' + this.getMenuWidth() + "px;z-index:" + $e.fn.nextIndex());
                var tmp = this;
                setTimeout(function () {
                    $e.fn.showMenu({shell: tmp.listBody, level: 0, ref: tmp.field, side: 'down',move:-1, deviating: true});
                }, 0);
            } else if (this.choiceType == 'single') {
                $e.fn.hideMenu(0);
            }
            return false;
        },
        getMenuWidth: function () {
            return this.menuWidth > 0 ? this.menuWidth : this.field.offsetWidth;
        },

        setValue: function (value, stope, no_reset) {
            var reset = !no_reset;
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    var item = this.findItem(value);
                    if (this.oldItem && (this.choiceType == 'single')) {
                        $e.fn.removeClass(this.oldItem, 'choiced');
                    }
                    // if (item){
                    if (this.choiceType == 'single') {
                        if (item) {
                            $e.fn.addClass(item, 'choiced');
                        }
                        this.field.value = item ? item.text : value;
                    } else if (item) {
                        this.toggleValue(item, reset);
                        //需要自己出发值变动事件
                    }
                    // }
                    //this.value = value;
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldItem = item;
                    this.oldValue = value;
                } catch (e) {
                    throw(this.type + ":" + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        validEditable:function(options){
            return false;
        },
        /**
         * 可以选择多个值，需要覆盖此方法
         * @param value 在reset为true时，一般从外部（如数据对象创来），需要解析value，并清除原选择项，重新设定；在为false时，可能是添加或移除列表值
         * @param reset
         * @returns {*}
         */
        toggleValue: function (item, reset) {
            //$e.fn.addClass(item, 'choiced');
            //this.field.value=item.text;
        },
        getValue: function () {
            var v1 = this.field.value;
            if (this.choiceType == 'single') {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.field.value == this.items[i].text) {
                        v1 = this.items[i].value;
                        break;
                    }
                }
            }
            return v1;
        }
        //,
        // getText:function(value){
        //     if (arguments.length==0){
        //         return this.field.value;
        //     }else {
        //         for (var i = 0; i < this.items.length; i++) {
        //             if (value == this.items[i].value) {
        //                 return this.items[i].text;
        //             }
        //         }
        //     }
        //     return value;
        // }
    };
    plugin = {
        create: function (element, options) {
            return new SelfComboBox(element, options);
        }
    };
    $e.fn.extend($e.ui.BasicField, SelfComboBox.prototype);
    $e.fn.extend(SelfList.prototype, SelfComboBox.prototype);
    $e.fn.extend(valid,SelfComboBox.prototype);
    $e.ui.addFieldPlugin("combobox", plugin);

    function SelfPassWord(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfPassWord.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "password",
        init: function () {
            this.field = this.queryField();
            this.bindListen($e.events.regEvent(this.field, 'change', this, this.changed));
            this.bindListen($e.events.regEvent(this.field, 'focus', this, this.focused));
        },
        focused: function () {
            this.field.select();
            this.removeValidError();
        },
        formatValue: function (value, focused) {
            return value;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfPassWord(element, options);
        }
    };
    $e.fn.extend($e.ui.BasicField, SelfPassWord.prototype);
    $e.fn.extend(valid, SelfPassWord.prototype);
    $e.ui.addFieldPlugin("pwd", plugin);

    function SelfDate(element, options) {
        // element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfDate.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "date",
        init: function () {
            this.formatText = this.props['formatText'] || '';
            this.field = this.queryField();
            this.field.setAttribute("type", "text");
            this.bindListen($e.events.regEvent(this.field, 'change', this, this.changed));
            var button = this.shell.querySelector('.field-icon-right');
            if (button) {
                this.bindListen($e.events.regEvent(button, 'click', this, this.showDateDialog));
            }
            this.bindListen($e.events.regEvent(this.field, 'focus', this, this.focused));
        },
        focused: function () {
            this.field.select();
            this.removeValidError();
        },
        showDateDialog: function () {
            if (this.isEnable()) {
                $e.ui.showCalender({dataType: 'date', field: this.field, ref: this.getShell(), side: "down"});
            }
        },
        formatValue: function (value, focused) {
            if (value) {
                if (this.formatText) {
                    value = $e.fn.formatDate(value, this.formatText)
                }
            } else {
                value = "";
            }
            return value;
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    //this.value = value;
                    this.field.value = this.formatValue(value);
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldValue = this.getValue();
                } catch (e) {
                    throw("selfdate " + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        onChanged: function () {
            this.setValue(this.field.value);
        },
        getValue: function () {
            return this.field.value;//this.value;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfDate(element, options);
        }
    };
    $e.fn.extend(SelfText.prototype, SelfDate.prototype);
    $e.fn.extend(valid, SelfDate.prototype);
    $e.ui.addFieldPlugin("date", plugin);

    function SelfFile(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
        this.action=options['action']||this.action;
    }

    SelfFile.prototype = {
        VERSION: '3.0.1',
        props: null,
        type: "file",
        field:null,
        multFile:false,
        action:'file.Accept',
        transParams:null,
        init: function () {
            this.iframe=this.shell.querySelector('iframe');
            this.iframe._linkField=this;
            this.iframe.src = "upload.html?rand=" + $e.randNum();
            this.field = this.shell.querySelector('input');
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    this.value=value;
                    this.paintValue(value);
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldValue = this.getValue();
                } catch (e) {
                    throw("selffile " + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        check:function(){
            return true;
        },
        submit:function(){
            this.iframe.contentWindow.submit();
        },
        choiceFile:function(event){
            if (this.isEnable()){
            	if (this.onBeforeChoice()){
            		this.choice();
            	}
            }
        },
        onBeforeChoice:function(){
        	return true;
        },
        choice:function(){
            var body = this.iframe.contentDocument || this.iframe.contentWindow.document;
            var file=body.getElementById("file");
            if (this.multFile) {
                file.setAttribute('multiple', 'multiple');
            }else{
                file.removeAttribute('multiple');
            }
            file.click();
        },
        buildURL: function (value) {
            var options={
                _amn: this.getActiveModuleName(),
                _mn: this.getModuleName(),
                _name: this.action
            };
            $e.fn.extend(this.getTransParams(value)||{},options,true);
            return $e.getURL("async", options, false, false);
        },

        getTransParams:function(value){
            return this.transParams;
        },

        setTransParams:function(param){
            this.transParams=param;
        },
        /**
         * 上传成功（/失败）后，服务器端返回的信息
         * @param data
         */
        loadData:function(data){
            $e.loadData(data);
        },
        acceptFileName:function(text){
            this.setValue(text);
        },
        paintValue:function(value){
            if (this.field){
                this.field.value = this.value = value;
            }
        },
        validEnable:function(options){
            return false;
        },
        validEditable:function(options){
            return false;
        },
        getValue: function () {
            return this.value;
        },
        setEnable: function (enable) {
            this.enable = !!enable;//this.nviable=
            $e.fn.enableField(this.shell.querySelector('button'));
        },
        selfRelease:function(){
            if (this.iframe){
                delete this.iframe['_linkField'];
                this.iframe=null;
            }
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfFile(element, options);
        }
    };
    $e.fn.extend($e.ui.AbstractField, SelfFile.prototype);
    $e.ui.addFieldPlugin("file", plugin);

    function SelfImage(element, options) {
        //element.$owner = this;
        this.shell = element;
        this.props = options;
    }

    SelfImage.prototype = {
        VERSION: '3.0.1',
        props: null,
        value: null,
        type: "image",
        action:'image.Read',
        enable:true,
        transParams:null,
        init: function () {
            this.field = this.shell.querySelector('[field-band="image"]');
        },
        setValue: function (value, stope) {
            if (!this.locked || stope) {
                try {
                    this.locked = true;
                    //var old = this.getValue();
                    var url = this.buildURL(value);
                    this.field.src = url;
                    if (!stope) {
                        this.doChangedListen();
                    }
                    this.oldValue = value;
                } catch (e) {
                    throw("SelfImage " + this.name + ',setValue error:' + e);
                } finally {
                    this.locked = false;
                }
            }
        },
        buildURL: function (value) {
            //var setting=this.prepareOptions(value);
            var options={
                _amn: this.getActiveModuleName(),
                _mn: this.getModuleName(),
                _path: value,
                _name: this.action
            };
            $e.fn.extend(this.getTransParams(value)||{},options,true);
            return $e.getURL("getfile", options, false, true);
        },
        getTransParams:function(value){
            return this.transParams;
        },

        setTransParams:function(param){
            this.transParams=param;
        },
        validEnable:function(options){
            return false;
        },
        validEditable:function(options){
            return false;
        },
        getValue: function () {
            return this.value;
        },
        setEnable: function (enable) {
            this.enable = enable = !!enable;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfImage(element, options);
        }
    };
    $e.fn.extend($e.ui.AbstractField, SelfImage.prototype);
    $e.ui.addFieldPlugin("image", plugin);

    function SelfSelf(element, options) {
        this.shell = element;
        this.props = options;
    }

    SelfSelf.prototype = {
        VERSION: '3.0.1',
        props: null,
        value: null,
        type: "self",
        enable:false,
        init: function () {
        },
        setValue: function (value, stope) {
            this.getShell().innerHTML = value;
            this.value = value;
        },
        getValue: function () {
            return this.value;
        },
        initAction:function(){
            this.bindListen($e.events.regEvent(this.getShell(), 'click', this, this.doAction));
        },
        doAction: function (event,name) {
            if (this.isEnable()){
                var elem = event.target || event.srcElement;
                var action=elem.getAttribute("action");
                if (action){
                    if (typeof this[action]=='function'){
                        return this[action].apply(this,[event]);
                    }else{
                        return this.done(event);
                    }
                }
            }
            return false;
        },
        buildURL:function(){
        },
        validEnable:function(options){
            return false;
        },
        validEditable:function(options){
            return false;
        },
        done:function(event){
            return true;
        }
    };
    plugin = {
        create: function (element, options) {
            return new SelfSelf(element, options);
        }
    };
    $e.fn.extend($e.ui.AbstractField, SelfSelf.prototype);
    $e.ui.addFieldPlugin("self", plugin);

}($e);
