/**
 * @file 设计器模块
 * @description 提供拖拽式可视化设计器功能，支持组件拖放、布局调整等
 * @module yc-ui
 * @version 3.0.3
 * @author YC-UI Team
 */
+function($e) {
	$e.fn.extend({
		$design: {
			root: null,
			asm: {
				_mn: null,
				_amn: 'module_assembly',
				drag_key: '__drag'
			},
			drag: {
				_lock: false,
				_allow: false,
				fillCell: null,
				gridCell: null,
				view_edit_button: null,
				field_edit_button: null,
				isTypeView: function(type) {
					return type && type.startsWith('view');
				},
				target: {
					container: null,
					relative: null,
					area: null
				},
				source: {
					obj: null,
					objType: '',
					name: '',
					action: '',
					any: '',
					type: ''
				},
				error: {
					method: function(errorInfo) {
						$e.$design.clearDesign(true);
						if (errorInfo['code'] === 111) {
							$e.open(errorInfo['login'] || 'index.html', '_self');
						} else if (errorInfo['code'] === 101) {
							$e.ui.showMessage(errorInfo['message'], {
								ico: 'warn'
							});
						} else if (errorInfo['code'] || errorInfo['message']) {
							$e.ui.showMessage(errorInfo['detail'] + ',' + errorInfo['message'], {
								ico: 'warn'
							});
						} else {
							$e.ui.showMessage(errorInfo, {
								title: '错误信息',
								type: "error"
							});
						}
					}
				},
				initView: {
					view_button: 'link.edit.init.view_button',
					view_free: 'link.edit.init.view_free',
					view_filter: 'link.edit.init.view_filter',
					view_grid: 'link.edit.init.view_grid',
					view_list: 'link.edit.init.view_list',
					view_chart_line: 'link.edit.init.view_chart_line',
					view_chart_pie: 'link.edit.init.view_chart_pie',
					view_chart_scatter: 'link.edit.init.view_chart_scatter',
					view_chart_candlestick: 'link.edit.init.view_chart_candlestick',
					view_chart_radar: 'link.edit.init.view_chart_radar',
					view_tree: 'link.edit.init.view_tree',
					view_split: 'link.edit.init.view_split',
					view_tabbed: 'link.edit.init.view_tabbed',
					view_images: 'link.edit.init.view_images',
					view_link: 'link.edit.init.view_link'
				}
			},
			editing: {
				editingLabel: {
					label: null,
					enedit: false
				},
				old: null,
				css: null,
				content: {
					status: "0",
					element: document.createElement("DIV")
				},
				/**
				 * 移除编辑状态：隐藏编辑按钮组、清除焦点样式、清理网格单元格高亮
				 */
				remove: function() {
					this.old = [];
					var drag = $e.$design.drag;
					var tempInfo, editButtons = [drag.view_edit_button, drag.field_edit_button];
					var buttonCount = editButtons.length;
					for (var i = 0; i < buttonCount; i++) {
						if (editButtons[i].getShell().parentNode) {
							tempInfo = {
								p: editButtons[i].getShell().parentNode,
								c: editButtons[i].getShell()
							};
							this.old.push(tempInfo);
							tempInfo.p.removeChild(tempInfo.c);
						}
					}
					this.css = [];
					var focusElements = $e.$design.root.querySelectorAll('.develop-edit-focus');
					var focusCount = focusElements.length;
					for (var i = 0; i < focusCount; i++) {
						this.css.push(focusElements[i]);
						$e.fn.removeClass(focusElements[i], 'develop-edit-focus');
					}
					this.clearGridCell();
				},
				/**
				 * 清除网格单元格高亮样式
				 */
				clearGridCell: function() {
					if ($e.$design.drag.gridCell) {
						$e.fn.removeClass($e.$design.drag.gridCell, 'design-fill-border');
						$e.$design.drag.gridCell = null;
					}
				},
				/**
				 * 恢复编辑状态：将之前移除的编辑按钮组和焦点样式重新还原
				 */
				restore: function() {
					var tempInfo;
					var oldCount = this.old.length;
					for (var i = 0; i < oldCount; i++) {
						tempInfo = this.old[i];
						tempInfo.p.appendChild(tempInfo.c);
					}
					var cssCount = this.css.length;
					for (var i = 0; i < cssCount; i++) {
						$e.fn.addClass(this.css[i], 'develop-edit-focus');
					}
				},
				/**
				 * 同步修改字符串中的属性值（用于 HTML 属性字符串的查找替换）
				 * @param {string} text - 原始文本
				 * @param {string} name - 属性名
				 * @param {string} oldvalue - 旧属性值
				 * @param {string} newvalue - 新属性值
				 * @returns {string} 替换后的文本
				 */
				replaceAttribute: function(text, name, oldvalue, newvalue) {
					var attributePosition, attrIndex = text.indexOf(name);
					if (attrIndex >= 0) {
						attributePosition = text.indexOf(oldvalue, attrIndex + 1);
						if (attributePosition > 0) {
							var quoteChar = text.charAt(attributePosition - 1);
							if ((quoteChar === '"' || quoteChar === "'") &&
								(text.length > attributePosition + oldvalue.length) &&
								(text.charAt(attributePosition + oldvalue.length) === quoteChar) &&
								text.substring(attrIndex + name.length, attributePosition - 1).trim() === "=") {
								text = text.substring(0, attributePosition) + newvalue +
									text.substring(attributePosition + oldvalue.length);
							}
						}
					}
					return text;
				},
				/**
				 * 初始化编辑元素：将 HTML 内容加载到编辑容器中
				 * @param {string} html - 要编辑的 HTML 内容
				 */
				initEditElement: function(html) {
					this.content.status = "1";
					this.content.element.innerHTML = html;
				},
				/**
				 * 关闭编辑元素：清空编辑容器内容
				 */
				closeEditElement: function() {
					this.content.status = "0";
					this.content.element.innerHTML = "";
				},
				/**
				 * 修改编辑元素中的指定属性节点
				 * @param {string} key - 属性键名
				 * @param {string} oldname - 旧属性值
				 * @param {string} newname - 新属性值
				 * @param {string} html - 新的内部 HTML
				 */
				changeEditElement: function(key, oldname, newname, html) {
					if (this.content.status !== "0") {
						var element = this.content.element.querySelector("[" + key + "='" + oldname + "']");
						if (element) {
							element.innerHTML = html;
							if (oldname !== newname) {
								element.setAttribute(key, newname);
							}
						}
						this.content.status = "2";
					}
				},
				/**
				 * 判断当前是否处于元素编辑状态
				 * @returns {boolean}
				 */
				isElementEdit: function() {
					return this.content.status === "2";
				},
				/**
				 * 获取编辑后的 HTML 内容
				 * @param {boolean} close - 是否在获取后关闭编辑
				 * @returns {string} 编辑后的 HTML
				 */
				getEditHTML: function(close) {
					var html = this.content.element.innerHTML;
					if (close) {
						this.closeEditElement();
					}
					return html;
				},
				/**
				 * 提交编辑后的 HTML 到 field 组件
				 * @param {Object} field - 目标 field 组件
				 * @param {boolean} close - 是否在提交后关闭编辑
				 */
				commitEditHTML: function(field, close) {
					if (this.isElementEdit()) {
						var html = this.getEditHTML(close);
						field.setValue(html);
					}
				}
			},
			table: {
				/**
				 * 在指定按钮所在行之前或之后插入新行
				 * @param {Element} buttonElement - 触发按钮
				 * @param {number} insertOffset - 插入偏移量（0=前，1=后）
				 */
				addRow: function(buttonElement, insertOffset) {
					var tableRow = this.findCell(buttonElement, "TR");
					var table = this.findCell(tableRow, "TABLE");
					var newRow = table.insertRow(tableRow.rowIndex + insertOffset);
					var colgroup = table.querySelector("colgroup");
					var tableCell, cellDiv;
					var columnCount = colgroup.children.length;
					for (var i = 0; i < columnCount; i++) {
						tableCell = document.createElement("td");
						cellDiv = $e.fn.create('div', 'field');
						tableCell.appendChild(cellDiv);
						newRow.appendChild(tableCell);
					}
				},
				/**
				 * 删除指定按钮所在的行
				 * @param {Element} buttonElement - 触发按钮
				 */
				deleteRow: function(buttonElement) {
					var tableRow = this.findCell(buttonElement, "TR");
					var table = this.findCell(tableRow, "TABLE");
					table.deleteRow(tableRow.rowIndex);
				},
				/**
				 * 在指定按钮所在列之前或之后插入新列
				 * @param {Element} buttonElement - 触发按钮
				 * @param {number} insertOffset - 插入偏移量
				 */
				addColumn: function(buttonElement, insertOffset) {
					var tableCell = this.findCell(buttonElement, "TD");
					var tableRow = this.findCell(tableCell, "TR");
					var table = this.findCell(tableRow, "TABLE");
					var newColumn, cellIndex = tableCell.cellIndex + insertOffset;
					var rowCount = table.rows.length;
					for (var i = 0; i < rowCount; i++) {
						tableRow = table.rows[i];
						newColumn = (cellIndex >= tableRow.cells.length) ? tableRow.cells.length : cellIndex;
						tableCell = tableRow.insertCell(newColumn);
						tableCell.appendChild($e.fn.create('div', 'field'));
					}
					var colgroup = table.querySelector('colgroup');
					var colElement = document.createElement("col");
					if (cellIndex >= colgroup.children.length) {
						colgroup.appendChild(colElement);
					} else {
						colgroup.insertBefore(colElement, colgroup.children[cellIndex]);
					}
				},
				/**
				 * 删除指定按钮所在的列
				 * @param {Element} buttonElement - 触发按钮
				 */
				deleteColumn: function(buttonElement) {
					var tableRow, tableCell = this.findCell(buttonElement, "TD");
					var table = this.findCell(tableCell, "TABLE");
					var cellIndex = tableCell.cellIndex;
					var rowCount = table.rows.length;
					for (var i = 0; i < rowCount; i++) {
						tableRow = table.rows[i];
						if (cellIndex < tableRow.cells.length) {
							tableRow.deleteCell(cellIndex);
						}
					}
					var colgroup = table.querySelector('colgroup');
					if (colgroup.children.length > cellIndex) {
						colgroup.removeChild(colgroup.children[cellIndex]);
					}
				},
				/**
				 * 合并或拆分指定按钮所在单元格的列跨度
				 * @param {Element} buttonElement - 触发按钮
				 * @param {number} insertOffset - 合并(+1)或拆分(-1)方向
				 */
				mergeColumnCell: function(buttonElement, insertOffset) {
					var tableCell = this.findCell(buttonElement, "TD");
					var currentColspan = (tableCell.hasAttribute("colspan") ? tableCell.getAttribute('colspan') : 1) - 0;
					if (insertOffset > 0) {
						tableCell.setAttribute("colspan", currentColspan + 1 + "");
					} else if (currentColspan > 1) {
						tableCell.setAttribute("colspan", currentColspan - 1 + "");
					}
				},
				/**
				 * 在指定按钮所在单元格之前或之后插入新单元格
				 * @param {Element} buttonElement - 触发按钮
				 * @param {number} insertOffset - 插入偏移量
				 */
				addCell: function(buttonElement, insertOffset) {
					var tableCell = this.findCell(buttonElement, "TD");
					var tableRow = this.findCell(tableCell, "TR");
					var cellIndex = tableCell.cellIndex + insertOffset;
					tableCell = tableRow.insertCell(cellIndex);
					var cellDiv = $e.fn.create('div', 'field');
					tableCell.appendChild(cellDiv);
					var colgroup = this.findCell(tableRow, "TABLE").querySelector('colgroup');
					if (tableRow.cells.length > colgroup.children.length) {
						var colElement = document.createElement("col");
						if (cellIndex >= colgroup.children.length) {
							colgroup.appendChild(colElement);
						} else {
							colgroup.insertBefore(colElement, colgroup.children[cellIndex]);
						}
					}
				},
				/**
				 * 删除指定按钮所在的单元格
				 * @param {Element} buttonElement - 触发按钮
				 */
				deleteCell: function(buttonElement) {
					var tableCell = this.findCell(buttonElement, "TD");
					var tableRow = this.findCell(tableCell, "TR");
					tableRow.deleteCell(tableCell.cellIndex);
				},
				/**
				 * 向上查找指定标签名的祖先元素
				 * @param {Element} buttonElement - 起始元素
				 * @param {string} tagName - 目标标签名（TD, TR, TABLE）
				 * @returns {Element}
				 */
				findCell: function(buttonElement, tagName) {
					return $e.fn.closest(buttonElement, {
						key: 'tagName',
						value: tagName
					});
				}
			},
			data: {
				fieldType: [
					['text', '文本'],
					['number', '数字'],
					['percent', '百分比'],
					['textarea', '多行文本'],
					['checkbox', '复选框'],
					['radio', '单选按钮'],
					['label', '标签'],
					['list', '列表项'],
					['combobox', '下拉列表'],
					['pwd', '口令'],
					['date', '日期'],
					['file', '文件上传'],
					['image', '图片'],
					['self', '自定义']
				]
			},
			/**
			 * 初始化设计器：绑定面板元素、缓存编辑按钮、注册拖放事件
			 * @param {Element} panel - 设计面板容器
			 * @param {Element} fillElement - 填充占位元素
			 */
			init: function(panel, fillElement) {
				this.root = panel;
				this.drag.fillCell = fillElement;
				this.drag.fillCell.parentNode.removeChild(fillElement);

				var viewButton = $e.getView('desk.tools.view_edit_button');
				viewButton.getShell().parentNode.removeChild(viewButton.getShell());
				this.drag.view_edit_button = viewButton;

				viewButton = $e.getView('desk.tools.field_edit_button');
				viewButton.getShell().parentNode.removeChild(viewButton.getShell());
				this.drag.field_edit_button = viewButton;

				this.bindListen($e.events.regEvent(panel, "drop", this, this.dragEnd));
				this.bindListen($e.events.regEvent(panel, "dragover", this, this.dragMoving));
				this.bindListen($e.events.regEvent(panel, "dragleave", this, this.dragLeave));
				this.bindListen($e.events.regEvent(panel, "mouseover", this, this.mouseOver));
				this.bindListen($e.events.regEvent(panel, "mousemove", this, this.showOwner));

				this.bindListen($e.events.regEvent(fillElement, "mouseover", this, this.lock));
				this.bindListen($e.events.regEvent(fillElement, "mouseleave", this, this.unlock));
				this.asm._mn = $e.removeEnv('asm_mn');
			},
			listens: $e.events.createEventCell(),
			/**
			 * 绑定事件监听
			 * @param {Object} listen - 事件监听句柄
			 * @returns {*} 监听句柄
			 */
			bindListen: function(listen) {
				return this.listens.add(listen);
			},
			/**
			 * 解绑事件监听
			 * @param {*} handle - 监听句柄
			 */
			unBindListen: function(handle) {
				this.listens.remove(handle);
			},
			/**
			 * 根据拖动的 view 类型创建视图或组件，向服务端发起创建请求
			 * @param {string} type - view 类型或 field 类型
			 * @param {Object} params - 额外参数
			 * @param {*} dataObjects - 关联的数据对象
			 */
			createDrag: function(type, params, dataObjects) {
				var target = $e.$design.drag.target;
				var source = $e.$design.drag.source;
				if (target.dragType === 'field' && (type === 'static-label' || type === 'static-label_1')) {
					if (type === 'static-label') {
						target.area.innerHTML = "<div class='field-shell'><span class='static-label'>静态文本</span></div>";
					} else {
						target.area.innerHTML = "<div class='field-shell'><span class='static-label fill-must'>静态文本</span></div>";
					}
				} else {
					var options = {
						success: {
							method: function() {
								if (target.dragType === 'view') {
									var viewName = $e.removeEnv('#new');
									var newView = $e.getView(viewName, $e.$design.asm._amn);
									if (newView) {
										$e.$design.dragSuccess(newView);
										if (source['dialog']) {
											source['dialog'].close(true);
											source['dialog'] = null;
										}
									}
								} else if (target.dragType === 'field') {
									var activeModule = $e.removeEnv('#am');
									var fieldDataObject = $e.getADO('field', activeModule);
									var containerView = $e.getView(target.container.getName(), $e.$design.asm._amn);
									var fieldProps = fieldDataObject.getRowProperties(0);
									if (containerView.getType() === 'view_free' || containerView.getType() === 'view_filter') {
										target.area.innerHTML = fieldProps['html'];
										target.area.setAttribute('data-name', fieldProps['name']);
										setTimeout(function() {
											containerView.bindField(target.area, fieldProps);
										}, 0);
									} else if (containerView.getType() === 'view_grid') {
										$e.$design.editing.clearGridCell();
										var childDialog = $e.getView('link.edit.child.' + containerView.getType());
										childDialog.show();
									}
								}
							}
						},
						error: this.drag.error,
						params: {
							type: type,
							dragType: target.dragType,
							parent: (target.container === 'root') ? '' : target.container.getName(),
							area: target.area ? (target.area.getAttribute('view-area') || "") : "",
							relative: this.getRelative(),
							ados: dataObjects ? dataObjects : '',
							any: encodeURIComponent($e.$design.drag.source.any || '')
						}
					};
					$e.fn.extend(params || {}, options.params);
					$e.request('', 'call', 'drag.Add', dataObjects, null, options);
				}
			},
			/**
			 * 初始化创建视图：弹窗让用户输入初始数据
			 * @param {string} type - 视图类型
			 */
			createInit: function(type) {
				var options = {
					success: {
						method: function() {
							var initView = $e.getView($e.$design.drag.initView[type]);
							initView.show();
						}
					},
					error: this.drag.error,
					params: {
						type: type
					}
				};
				$e.request('', 'call', 'drag.Init', null, null, options);
			},
			/**
			 * 编辑指定视图：向服务端发起编辑请求
			 * @param {string} rowid - 数据行 ID
			 * @param {string} name - 视图名称
			 * @param {string} type - 视图类型
			 * @param {string} sourceType - 源类型
			 */
			dragEditView: function(rowid, name, type, sourceType) {
				var target = $e.$design.drag.target;
				var parentName = (target.container === 'root') ? '' : target.container.getName();
				var options = {
					success: {
						method: function() {
							var newView = $e.getView(name, $e.$design.asm._amn);
							$e.$design.dragSuccess(newView);
						}
					},
					error: this.drag.error,
					params: {
						type: type,
						name: name,
						rowid: rowid,
						parent: parentName,
						area: target.area ? target.area.getAttribute('view-area') : "",
						relative: this.getRelative()
					}
				};
				$e.request('', 'call', 'drag.Edit', null, null, options);
			},
			/**
			 * 拖放成功后的处理：将新视图插入到目标区域
			 * @param {Object} view - 新创建的视图
			 */
			dragSuccess: function(view) {
				var fillCell = $e.$design.drag.fillCell;
				var area = $e.$design.drag.target.area;
				if (view.getType() === 'view_dialog') {
					$e.fn.showElement(view.getShell(), true, {
						side: 'top'
					});
				}
				var parentName = $e.removeEnv("#parent");
				var parentView = $e.getView(parentName, $e.$design.asm._amn);
				if (parentView && parentView.buildChildren) {
					parentView.buildChildren(true);
				} else {
					area.insertBefore(view.getShell(), fillCell);
				}
				fillCell.parentNode.removeChild(fillCell);

				var listView = $e.getView('body.tab.member.view_list');
				if (listView) {
					var listItem = listView.findItem(listView.getName());
					if (listItem) {
						listItem.expand(true, true);
					}
				}
			},
			/**
			 * 根据编辑按钮所在位置查找其所属的 field 或 view
			 * @param {Object} view - 编辑按钮对应的视图
			 * @returns {Object|null} 所属的编辑单元格组件
			 */
			queryEditCell: function(view) {
				var editButton = view.getShell().parentNode;
				return editButton ? editButton['__ec'] : null;
			},
			/**
			 * 清除设计面板内容
			 * @param {boolean} onlyFill - 是否仅清除填充占位元素
			 */
			clearDesign: function(onlyFill) {
				if (onlyFill) {
					var fillCell = this.drag.fillCell;
					if (fillCell.parentNode) {
						fillCell.parentNode.removeChild(fillCell);
					}
				} else {
					$e.fn.setChild($e.$design.root, null);
				}
				this.editing.clearGridCell();
			},
			/**
			 * 重建容器视图的子组件
			 */
			rebuildChildren: function() {
				var parentName = $e.removeEnv("#parent");
				if (parentName) {
					var parentView = $e.getView(parentName, this.asm._amn);
					if (parentView && parentView.buildChildren) {
						parentView.buildChildren(true);
					}
				}
			},
			/**
			 * 获取填充占位元素相对于同级元素的位置关系
			 * @returns {string} 相对位置标识（#top 或 空字符串或右侧视图名）
			 */
			getRelative: function() {
				var fillCellRef = $e.$design.drag.fillCell;
				var fillCellParent = fillCellRef.parentNode;
				if (fillCellParent) {
					if (fillCellRef === fillCellParent.firstChild) {
						return "#top";
					} else if (fillCellRef === fillCellParent.lastChild) {
						return "";
					} else {
						var childNodeList = fillCellParent.childNodes;
						var childCount = childNodeList.length;
						for (var i = 0; i < childCount; i++) {
							if (fillCellRef === childNodeList[i]) {
								if ((i < childCount - 1) && childNodeList[i + 1]['__ec'] &&
									$e.$design.drag.isTypeView(childNodeList[i + 1]['__ec'].getType())) {
									return childNodeList[i + 1].__ec.getName();
								}
							}
						}
					}
				}
				return '';
			},
			/**
			 * 编辑视图前初始化：将当前视图的 HTML 内容装入数据对象
			 * @param {Object} dataObject - 数据对象
			 */
			initEditView: function(dataObject) {
				var viewName = dataObject.getValueAt(0, 'name');
				var targetView = $e.getView(viewName, $e.$design.asm._amn);
				if (targetView) {
					var viewType = targetView.getType();
					this.editing.remove();
					if (viewType === 'view_free' || viewType === 'view_filter') {
						var htmlContent = targetView.getShell().innerHTML;
						dataObject.setValueAt(0, 'html', htmlContent);
					} else if (viewType === 'view_grid') {
						var headerCells = targetView.getBand('header_group').children;
						var headerJson = dataObject.getValueAt(0, 'header');
						if (headerJson) {
							var computedStyle, jsonData = JSON.parse(headerJson);
							var cellCount = headerCells.length;
							for (var i = 0; i < cellCount; i++) {
								computedStyle = $e.fn.getStyle(headerCells[i]);
								if (computedStyle.width.endsWith("px")) {
									jsonData[i][2] = parseInt(computedStyle.width);
								} else {
									jsonData[i][2] = computedStyle.width;
								}
							}
							dataObject.setValueAt(0, 'header', JSON.stringify(jsonData));
						}
					} else if (viewType === 'view_dialog') {
						var dialogShell = targetView.getShell();
						dataObject.setValueAt(0, 'style', dialogShell.getAttribute('style'));
						dataObject.setValueAt(0, 'className', dialogShell.getAttribute('class'));
					} else if (viewType === 'view_split') {
						dataObject.setValueAt(0, 'barPosition', targetView.getSplitBarPosition());
					}
					this.editing.restore();
				}
			},
			/**
			 * 验证字符串是否为有效的普通 JavaScript 对象字面量
			 * @param {string} source - 待验证字符串
			 * @returns {boolean}
			 */
			validPlainObject: function(source) {
				if (source) {
					var i = 0;
					while (i < source.length && source.charAt(i) <= ' ') {
						i++;
					}
					if (i > 0) {
						source = source.substring(i);
					}
					if (source.startsWith("{")) {
						source = "return " + source;
						if (source.startsWith("return")) {
							try {
								var fn = new Function(source);
								var obj = fn();
								return $e.fn.isPlainObject(obj);
							} catch (err) {
								return false;
							}
						}
					}
					return false;
				}
				return true;
			},
			/**
			 * 根据鼠标位置查找可放置区域：遍历 DOM 树定位合适的容器和区域
			 * @param {Event} event - 鼠标事件
			 * @param {string} sourceType - 资源类型（view/field）
			 * @returns {Object} 包含 container、area、relative、dragType 的放置选项
			 */
			findPlace: function(event, sourceType) {
				var eventTarget = event.target || event.srcElement;
				var place, currentNode = eventTarget;
				var option = {
					relative: null,
					area: null,
					container: null,
					dragType: ''
				};
				var ownerView, asm = $e.$design.asm;
				var areaValue, viewType, fieldElement, isRoot;
				while (currentNode && currentNode !== document) {
					areaValue = currentNode.getAttribute('view-area');
					isRoot = currentNode.getAttribute('design') === "root";
					if (sourceType === 'view') {
						option.dragType = 'view';
						if (isRoot) {
							if (!option.area) {
								option.area = currentNode;
								option.container = 'root';
							} else {
								option.area = null;
							}
							break;
						} else if (areaValue) {
							option.area = currentNode;
						} else if (currentNode['__ec']) {
							ownerView = currentNode['__ec'];
							viewType = ownerView.getType();
							if (viewType === 'view_container' || viewType === 'view_flex_container' ||
								viewType === 'view_split' || viewType === 'view_dialog' || viewType === 'view_tabbed') {
								if (ownerView._mn === asm._mn && ownerView._amn === asm._amn) {
									if (option.area) {
										option.container = ownerView;
										break;
									}
								}
							} else if (!viewType.startsWith('view')) {
								break;
							}
							if (ownerView._mn !== asm._mn || ownerView._amn !== asm._amn) {
								if (!option.relative) {
									option.relative = ownerView;
								} else {
									option.area = null;
									break;
								}
							} else {
								option.relative = ownerView;
								option.area = null;
							}
						}
					} else {
						if (isRoot) {
							option.area = null;
							break;
						} else if (currentNode['__ec']) {
							ownerView = currentNode['__ec'];
							if ($e.editAbleMember(ownerView)) {
								if (ownerView.getType() === 'view_free' || ownerView.getType() === 'view_filter') {
									if (option.area) {
										option.container = ownerView;
										option.dragType = 'field';
										break;
									}
								} else if (ownerView.getType() === 'view_grid') {
									option.container = ownerView;
									option.dragType = 'field';
									break;
								}
							} else {
								break;
							}
							option.area = null;
						} else {
							if ($e.fn.hasClass(currentNode, 'grid-hd-cell')) {
								option.area = currentNode;
							} else {
								fieldElement = this.findField(eventTarget);
								if (!fieldElement) {
									fieldElement = this.findLabel(eventTarget);
								}
								if (fieldElement) {
									option.area = fieldElement;
								}
							}
						}
					}
					currentNode = currentNode.parentNode;
				}
				return option;
			},
			/**
			 * 根据鼠标所在元素查找 FreeView 中的 Label 元素
			 * @param {Element} element - 起始元素
			 * @returns {Element|null}
			 */
			findLabel: function(element) {
				if ($e.fn.hasClass(element.parentNode, 'static-label')) {
					element = element.parentNode;
				}
				if ($e.fn.hasClass(element.parentNode, 'field-shell')) {
					element = element.parentNode;
				}
				if ($e.fn.hasClass(element.parentNode, 'field')) {
					element = element.parentNode;
				}
				if (($e.fn.hasClass(element, 'field') && element.children.length > 0) ||
					$e.fn.hasClass(element, 'field-shell')) {
					return element;
				}
				return null;
			},
			/**
			 * 根据元素查找其所属的 field 容器
			 * @param {Element} element - 起始元素或事件对象
			 * @returns {Element|null}
			 */
			findField: function(element) {
				var currentNode = element.target || element.srcElement || element;
				while (currentNode.tagName !== 'BODY' &&
					currentNode.tagName !== 'TD' &&
					currentNode.tagName !== 'TABLE' &&
					currentNode.nodeType === '1' &&
					!currentNode.getAttribute('view-area')) {
					if ($e.fn.hasClass(currentNode, 'field')) {
						return currentNode;
					}
					currentNode = currentNode.parentNode;
				}
				return null;
			},
			/**
			 * 为 Filter 视图填充复选框控件
			 * @param {Object} view - Filter 视图
			 */
			fillFilter: function(view) {
				var tableCells = view.getShell().querySelectorAll('TD');
				var fieldName, fieldElement, tableCell, checkboxElement;
				var cellCount = tableCells.length;
				for (var i = 0; i < cellCount; i++) {
					fieldElement = tableCells[i].querySelector("[data-name]");
					if (fieldElement) {
						if (tableCells[i].cellIndex > 0) {
							fieldName = fieldElement.getAttribute('data-name');
							tableCell = tableCells[i].parentElement.cells[tableCells[i].cellIndex - 1];
							fieldElement = tableCell.querySelector("[filter-name]");
							if (!fieldElement) {
								fieldElement = tableCell.querySelector(".field-shell");
								if (fieldElement) {
									checkboxElement = $e.fn.create("input", "filter-checkbox");
									checkboxElement.type = "checkbox";
									checkboxElement.setAttribute("filter-name", fieldName);
									checkboxElement.checked = false;
									fieldElement.appendChild(checkboxElement);
								}
							} else {
								fieldElement.setAttribute('filter-name', fieldName);
							}
						}
					}
				}
			},
			/**
			 * 锁定拖放操作（鼠标进入填充占位元素时）
			 * @param {Event} event - 鼠标事件
			 */
			lock: function(event) {
				this._lock = true;
				$e.events.cancelEvent(event);
				return false;
			},
			/**
			 * 解锁拖放操作（鼠标离开填充占位元素时）
			 */
			unlock: function() {
				this._lock = false;
			},
			/**
			 * 开始拖放：记录拖放源信息（类型、名称、操作等）
			 * @param {Event} event - 拖放事件
			 * @param {string} action - 操作类型（add/edit/move）
			 * @param {Object} item - 拖放项信息 {name, type}
			 * @param {string} sourceType - 资源类型（view/field）
			 * @param {*} any - 附加属性
			 */
			dragStart: function(event, action, item, sourceType, any) {
				if (item.type === 'view_dialog' && (this.root.children.length > 0)) {
					this.drag._allow = false;
					alert('请先清空设计模板 !!! ');
				} else {
					this.drag._allow = true;
					event.dataTransfer.effectAllowed = "move";
					this.clearDrag();
					var target = $e.$design.drag.target;
					var source = this.drag.source;
					source.action = action;
					source.srcType = sourceType;
					if (action === 'add') {
						source.objType = item.type;
						source.name = '';
						if (item.type === "view_container") {
							source.any = (item.label === 'any') ? item.header.querySelector('[any="drag_txt"]').value : item.label;
						} else if (item.type.startsWith('view')) {
							source.any = item.any;
						} else if (!item.type.startsWith('view') && any === '1') {
							source.objType = item.type + "_1";
						} else {
							source.any = "" || any;
						}
					} else if (action === 'edit') {
						source.objType = item.type;
						source.srcType = sourceType;
						source.rowid = item.rowid;
						source.name = item.name;
					} else if (action === 'move') {
						source.objType = item.type;
						source.name = item.name;
						if (sourceType === 'field') {
							source.obj = item.source;
							source.any = any;
						}
					}
				}
			},
			/**
			 * 拖放离开设计面板区域时清理填充占位元素
			 * @param {Event} event - 拖放事件
			 */
			dragLeave: function(event) {
				event.preventDefault();
				var fillCell = this.drag.fillCell;
				if (fillCell.parentNode) {
					var eventTarget = event.target || event.srcElement;
					if (eventTarget === $e.$design.root) {
						if (!this._lock) {
							this.clearDesign(true);
						}
					} else if (!$e.fn.isParent(eventTarget, $e.$design.root)) {
					}
				}
			},
			/**
			 * 清除拖放状态：重置 target 和 source 的所有属性
			 */
			clearDrag: function() {
				var target = $e.$design.drag.target;
				target.relative = target.area = target.container = null;
				var source = this.drag.source;
				source.obj = source.objType = source.srcType = source.name = source.action = source.any = '';
				this.editing.clearGridCell();
			},
			/**
			 * 拖放移动中：根据鼠标位置动态调整填充占位元素的位置
			 * @param {Event} event - 拖放移动事件
			 */
			dragMoving: function(event) {
				if (this.drag._allow) {
					var eventTarget = event.target || event.srcElement;
					var source = $e.$design.drag.source;
					var type = source.objType;
					if (type) {
						event.preventDefault();
					} else {
						return false;
					}
					var fillCell = this.drag.fillCell;
					if (eventTarget !== fillCell) {
						var option = $e.$design.drag.target = this.findPlace(event, source.srcType);
						if (option.area && option.container) {
							var parentElement = fillCell.parentNode;
							if (option.container['type'] === 'view_grid') {
								if (option.area.getAttribute('data-name')) {
									if (this.drag.gridCell !== option.area) {
										this.editing.clearGridCell();
										$e.fn.addClass(option.area, "design-fill-border");
										this.drag.gridCell = option.area;
										source.any = option.area.getAttribute('data-name');
									}
									return true;
								}
							} else if (!parentElement) {
								this._lock = true;
								option.area.appendChild(fillCell);
								var self = this;
								setTimeout(function() {
									self._lock = false;
								}, 20);
							} else if (option.relative) {
								var childArray = Array.prototype.slice.call(option.area.children, 0);
								var referenceNode = option.relative.getShell();
								var fillIndex = childArray.indexOf(fillCell);
								var refIndex = childArray.indexOf(referenceNode);
								if (referenceNode === option.area.lastChild &&
									option.area.lastChild.offsetHeight - event.offsetY < 20) {
									if ((fillIndex < 0) || (fillIndex !== refIndex + 1)) {
										option.area.appendChild(fillCell);
									}
								} else {
									if ((fillIndex < 0) || (fillIndex !== refIndex - 1)) {
										option.area.insertBefore(fillCell, referenceNode);
									}
								}
							} else {
								if (event.offsetY <= 20) {
									if (fillCell !== option.area.firstChild) {
										if (option.area.children.length === 0) {
											option.area.appendChild(fillCell);
										} else {
											option.area.insertBefore(fillCell, option.area.firstChild);
										}
									}
								} else if (option.area.lastChild !== fillCell && event.offsetY > 20) {
									option.area.appendChild(fillCell);
								}
							}
							if (source.srcType === 'field') {
								source.area = option.area;
							}
						}
					} else {
						$e.events.cancelEvent(event);
					}
					this.editing.clearGridCell();
				}
			},
			/**
			 * 拖放结束：根据操作类型执行创建、编辑或移动操作
			 * @param {Event} event - 拖放结束事件
			 */
			dragEnd: function(event) {
				if (this.drag._allow) {
					event.preventDefault();
					event.stopPropagation();
					var result = false,
						target = $e.$design.drag.target;
					if (target.area) {
						$e.getView('desk.edit').show(false);
						var source = this.drag.source;
						var type = source.objType;
						if (source.action === 'add') {
							result = true;
							if (!!this.drag.initView[type]) {
								this.createInit(source.objType);
							} else {
								this.createDrag(source.objType);
							}
						} else if (source.action === 'edit') {
							if (source.objType) {
								result = true;
								$e.$design.dragEditView(source.rowid, source.name, source.objType, source.srcType);
							}
						} else if (source.action === 'move') {
							if (source.srcType === 'view') {
								if (source.objType && source.type !== 'view_dialog') {
									var dataObject = $e.getADO('member.view_list');
									var rowIndex = dataObject.findRow(function(dataRow) {
										return this['name'] === source.name;
									});
									if (rowIndex >= 0) {
										result = true;
										source.rowid = dataObject.getRowID(rowIndex);
										$e.$design.dragEditView(source.rowid, source.name, source.objType, source.srcType);
									}
								}
							} else {
								if (source.area && source.obj) {
									var tempContainer = $e.fn.create("div");
									var fromParent = source.obj.parentNode;
									var toParent = source.area.parentNode;
									tempContainer.appendChild(source.area);
									toParent.appendChild(source.obj);
									fromParent.appendChild(source.area);
								}
							}
						}
					}
					if (!result) {
						this.clearDesign(true);
					}
				}
			},
			/**
			 * 鼠标悬停时高亮视图或组件：显示编辑按钮组、添加焦点样式
			 * @param {Event} event - 鼠标事件
			 */
			mouseOver: function(event) {
				var eventTarget = event.target || event.srcElement;
				var cell = $e.fn.queryOwner(eventTarget);
				if (cell) {
					var viewType = cell.getType();
					if (viewType === 'view_free' || viewType === 'view_filter') {
						var labelElement = $e.$design.findLabel(eventTarget);
						eventTarget = labelElement ? labelElement : eventTarget;
					}
					var isField = eventTarget &&
						($e.fn.hasClass(eventTarget, 'field') || $e.fn.hasClass(eventTarget, 'field-shell')) &&
						(eventTarget.children.length > 0);
					if ($e.editAbleMember(cell) &&
						(viewType || (eventTarget.tagName === 'TD' || isField) &&
							(viewType === 'view_free' || viewType === 'view_filter'))) {
						var otherButton, activeButton, buttonGroup;
						if (viewType.startsWith('view_') && (eventTarget.tagName !== 'TD') && !isField) {
							activeButton = this.drag.view_edit_button;
							otherButton = this.drag.field_edit_button;
							buttonGroup = activeButton.getGroup();
							if (buttonGroup !== 'min') {
								var targetGroup = (viewType === 'view_filter') ? 'max2' : 'max';
								if (targetGroup !== buttonGroup) {
									activeButton.setGroup(targetGroup);
								}
							}
						} else {
							activeButton = this.drag.field_edit_button;
							otherButton = this.drag.view_edit_button;
							if ((eventTarget.tagName === 'TD') && (viewType === 'view_free' || viewType === 'view_filter')) {
								$e.fn.addClass(activeButton.getShell(), 'develop-edit-btn-td');
								activeButton.setGroup('min');
							} else {
								$e.fn.removeClass(activeButton.getShell(), 'develop-edit-btn-td');
								activeButton.setGroup('max');
							}
						}
						var buttonParent = activeButton.getShell().parentNode;
						var targetParent = ((eventTarget.tagName === 'TD' || isField) && (viewType === 'view_free' || viewType === 'view_filter')) ?
							eventTarget : cell.getShell();
						if (buttonParent !== targetParent &&
							(targetParent['__ec'] || isField || targetParent === eventTarget) && (viewType !== 'tab-button')) {
							if (buttonParent) {
								$e.fn.removeClass(buttonParent, 'develop-edit-focus');
							}
							targetParent.appendChild(activeButton.getShell());
							if (targetParent.tagName !== 'TD') {
								$e.fn.addClass(targetParent, 'develop-edit-focus');
							}
							activeButton.locate(targetParent);
						}
						if (otherButton.getShell().parentNode) {
							$e.fn.removeClass(otherButton.getShell().parentNode, 'develop-edit-focus');
							otherButton.getShell().parentNode.removeChild(otherButton.getShell());
						}
					}
				}
			},
			/**
			 * 显示组件所有者名称的悬浮提示
			 * @param {Event} event - 鼠标移动事件
			 */
			showOwner: function(event) {
				var cell = $e.fn.queryOwner(event);
				if (cell && cell.getType() === 'button') {
					var ownerView = $e.fn.queryOwnerView(cell);
					if (ownerView.getName() === 'desk.tools.field_edit_button') {
						cell = this.findField(ownerView.getShell().parentNode);
						cell = cell ? cell['__ec'] : null;
					} else if (ownerView.getName() === 'desk.tools.view_edit_button') {
						return;
					}
				}
				var popver = this['popver'];
				if (cell && cell.getType() === 'field') {
					if (!popver) {
						this.popver = popver = $e.ui.createPopover({
							side: 'down'
						});
					}
					var self = this;
					setTimeout(function() {
						self.popver.show({
							text: cell.getName(),
							x: event.clientX,
							y: event.clientY - 40
						});
					}, 20);
				} else if (popver) {
					popver.hide();
				}
			}
		}
	}, $e);
}($e);
$e.fn.extend({
	view_dialog: {
		/**
		 * 关闭对话框视图
		 */
		close: function() {
			$e.$design.root.removeChild(this.getShell());
		},
		/**
		 * 显示对话框视图
		 */
		show: function() {
			$e.$design.root.appendChild(this.getShell());
			$e.fn.setStyle(this.getShell(), 'z-index:' + $e.fn.nextIndex());
			$e.fn.showElement(this.getShell(), true);
			var self = this;
			setTimeout(function() {
				self.resize();
			}, 50);
		}
	},
	view_container: {
		/**
		 * 容器视图属性变更处理
		 * @param {Object} props - 属性对象
		 */
		changePropery: function(props) {
			if (props['children']) {
				this.children = props['children'];
				this.buildChildren(true);
			}
		}
	},
	view_flex_container: {
		/**
		 * 弹性容器视图属性变更处理
		 * @param {Object} props - 属性对象
		 */
		changePropery: function(props) {
			if (props['children']) {
				this.children = props['children'];
				this.buildChildren(true);
			}
		}
	},
	view_grid: {
		/**
		 * 显示网格列宽悬浮提示
		 * @param {Event} event - 鼠标事件
		 */
		showPopover: function(event) {
			if (this.rsth && this.rsth.resizeE) {
				var popver = this['popver'];
				if (!popver) {
					popver = this.popver = $e.ui.createPopover({
						side: 'down'
					});
				}
				var self = this;
				setTimeout(function() {
					if (self.rsth.resizeE) {
						var columnWidth = self.rsth.resizeE.offsetWidth;
						popver.show({
							text: columnWidth + "px",
							x: event.clientX,
							y: event.clientY - 20
						});
					}
				}, 20);
			}
		},
		/**
		 * 隐藏网格列宽悬浮提示
		 */
		hidePopover: function() {
			if (this['popver']) {
				this['popver'].hide();
			}
		},
		/**
		 * 网格视图是否可编辑（设计模式下禁用）
		 * @returns {boolean}
		 */
		isEnable: function(options) {
			return false;
		}
	},
	view_overwrite: {
		onLoad: function() {},
		onShow: function() {},
		changeProperty: function(props) {}
	},
	/**
	 * 添加视图到活跃模块中
	 * @param {Object} view - 视图实例
	 * @returns {boolean} 是否成功添加
	 */
	addView: function(view) {
		var moduleName = view.getActiveModuleName();
		var activeModule = this.getActiveModule(moduleName, true);
		var viewName = view.getName();
		if (view.getActiveModuleName() === $e.$design.asm._amn) {
			var oldView = null;
			if (view.props && view.props['#old']) {
				oldView = activeModule.getView(view.props['#old']);
			}
			oldView = oldView || activeModule.getView(viewName);
			if (oldView && oldView.getShell().parentNode) {
				var oldShell = oldView.getShell();
				oldShell.parentNode.insertBefore(view.getShell(), oldShell);
				oldView.release(false, false);
			}
			if (view.getModuleName() === $e.$design.asm._mn) {
				var dataObject = $e.getADO('member.view_list');
				var rowCount = dataObject.getRowsCount();
				for (var i = 0; i < rowCount; i++) {
					if (dataObject.getValueAt(i, 'name') === viewName) {
						view._viewid = dataObject.getRowID(i);
						break;
					}
				}
				if (view.getType() === 'view_dialog') {
					$e.fn.extend(this.view_dialog, view, true);
				}
				if (view.getType() === 'view_grid') {
					$e.fn.extend(this.view_grid, view, true);
					view.bindListen($e.events.regEvent(document, 'mousemove', view, view.showPopover));
					view.bindListen($e.events.regEvent(document, 'mouseup', view, view.hidePopover));
				}
				view.shell.__ec = view;
			}
			activeModule.views[viewName] = view;
			if (view.buildChildren) {
				$e.fn.extend(this.view_container, view, true);
			}
			$e.fn.extend(this.view_overwrite, view, true);
			return true;
		} else if (!activeModule.views[viewName]) {
			activeModule.views[viewName] = view;
			return true;
		}
		return false;
	},
	/**
	 * 添加数据对象到活跃模块中
	 * @param {Object} dataObject - 数据对象实例
	 */
	addADO: function(dataObject) {
		var moduleName = dataObject.getActiveModuleName();
		var activeModule = this.getActiveModule(moduleName, true);
		var adoName = dataObject.getName().toLowerCase();
		if (!activeModule.ados[adoName]) {
			activeModule.ados[adoName] = dataObject;
		} else if (dataObject.getActiveModuleName() === $e.$design.asm._amn) {
			var oldDataObject = activeModule.ados[adoName];
			dataObject.listen = oldDataObject.listen;
			dataObject.varListen = oldDataObject.listen;
			delete oldDataObject.listen;
			delete oldDataObject.varListen;
			activeModule.ados[adoName] = dataObject;
		}
	},
	/**
	 * 判断成员是否可编辑（属于当前设计模块且非按钮类型）
	 * @param {Object} member - 视图或组件成员
	 * @returns {boolean}
	 */
	editAbleMember: function(member) {
		return (member.getActiveModuleName() === $e.$design.asm._amn &&
			member.getModuleName() === $e.$design.asm._mn && member.getType() !== 'button');
	}
}, $e, true);
+function($e) {
	var fieldOverwrite = {
		changeProperty: function(props) {},
		isEnable: function() {},
		isEditable: function() {
			return false
		},
		getValue: function() {},
		setValue: function() {}
	};
	var listHelper = {
		/**
		 * 解析列表文本
		 * @param {string} text - 列表文本
		 * @param {*} parameter1 - 参数1
		 * @param {*} parameter2 - 参数2
		 * @returns {Array}
		 */
		parseListText: function(text, parameter1, parameter2) {
			return [];
		},
		/**
		 * 初始化列表主体 DOM 元素
		 */
		initListBody: function() {
			this.listBody = this.shell.querySelector('[field-band="list"]');
			if (!this.listBody) {
				this.listBody = $e.fn.create('dl', 'drop-select');
				this.listBody.setAttribute('field-band', 'list');
			}
			this.listData = this.shell.querySelector('[field-band="list-data"]') || this.listBody;
			$e.fn.addClass(this.listBody, 'hide');
		}
	};
	$e.ui.$createView = $e.ui.createView;
	/**
	 * 重写创建视图方法：清理设计模式下的生命周期钩子
	 * @param {Object} props - 视图属性
	 * @returns {Object} 创建的视图
	 */
	$e.ui.createView = function(props) {
		if (!props['_mn'].startsWith('module_')) {
			var extendConfig = props['extend'];
			if (extendConfig) {
				if (extendConfig['onLoad'])
					delete extendConfig['onLoad'];
				if (extendConfig['onInit'])
					delete extendConfig['onInit'];
			}
			var overwriteConfig = props['overwrite'];
			if (overwriteConfig) {
				extendConfig = props['extend'];
				if (extendConfig) {
					if (extendConfig['onLoad'])
						delete extendConfig['onLoad'];
					if (extendConfig['onInit'])
						delete extendConfig['onInit'];
				}
			}
		}
		return this.$createView(props);
	};
	/**
	 * 创建 field 组件并注入设计模式相关逻辑
	 * @param {Element} element - DOM 元素
	 * @param {Object} props - 组件属性
	 * @param {Object} activeModule - 活跃模块
	 * @returns {Object} field 组件实例
	 */
	$e.ui.createField = function(element, props, activeModule) {
		var plugin = this.inputPlugin[props['type']];
		if (plugin) {
			var field = plugin.create(element, props);
			element.$owner = field;
			$e.initActiveCell(field, props, activeModule);
			var fieldConfig = props['extend'];
			var isDesignModule = (field.getActiveModuleName() === $e.$design.asm._amn);
			if (fieldConfig) {
				var configObj = $e.fn.createObject(fieldConfig);
				if (configObj) {
					if (isDesignModule && configObj['init']) {
						delete configObj['init'];
					}
					$e.fn.extend(configObj, field, true);
				}
				delete props.extend;
			}
			if (isDesignModule) {
				if (field.parseListText) {
					$e.fn.extend(listHelper, field, true);
				}
				field.getShell().__ec = field;
				$e.fn.extend(fieldOverwrite, field, true);
			} else {
				if (typeof field['initAction'] === 'function') {
					field.initAction();
				} else {
					this.initAction(field);
				}
			}
			return field;
		} else {
			throw "Error to create field <" + props['name'] + ">,type " + props["type"] + " not exists !";
		}
	}
}($e);