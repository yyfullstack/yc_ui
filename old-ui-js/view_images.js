/**
 * @file 图片视图组件
 * @description 提供图片缩略图展示、灯箱预览、图片上传和删除功能
 * @author YC-UI Team
 * @version 3.0.1
 * @since 2024-01-01
 * @copyright YC-UI Components
 */
+function($e) {
	'use strict';

	/**
	 * 图片视图组件构造函数
	 * @class ImageView
	 * @param {Object} options - 配置选项
	 * @param {string} options.adoName - 绑定的数据对象名称
	 * @param {Object} [options.imageStyle] - 缩略图样式（宽高）
	 * @param {string} [options.lightBoxHTML] - 灯箱组件内容HTML
	 */
	function ImageView(options) {
		this.props = options;
		this.adoName = options['adoName'];
		// this.titleColumn = options['titleColumn'];
		/*---缩略图style（宽高）---*/
		this.imageStyle = options['imageStyle'];
		/*---灯箱组件内容HTML---*/
		this.largeHTML = options['lightBoxHTML'];
		/*---缩略图和灯箱图是否同一路径---*/
		// this.imageSizeType = options['imageSizeType'];//same,notsame
		// if (options['imageAction']) {
		// this.imageAction = options['imageAction'];
		// }
		// this.acceptAction=options['acceptAction']||this.acceptAction;
		this._randID = {};
	}

	ImageView.prototype = {
		VERSION: '1.0.0',
		type: 'view_images',
		actionRead: "image.Read",
		actionAdd: "image.Add",
		actionDelete: "image.Delete",
		imageField: null,
		deleteCell: null,
		fieldAdd: null,
		lightBox: null,
		sameLargeImage: true,
		// imageSizeType: false,
		currentLargeRowID: -1,
		_randID: null,
		init: function() {
			var ado = this.getADO();
			if (ado) {
				this.dataListenHandle = ado.addListen({
					context: this,
					method: this.doDataListen
				});
			}
			this.body = this.shell.querySelector("[view-band='body']")
				|| this.shell;
			this.bindListen($e.events.regEvent(this.body, 'click', this,
				this.showLargeImage));
			if (ado.getColumnIndex('img_path') >= 0) {
				this.imageField = "img_path";
			}
			this.initEdit();
			if (ado && ado.isInited) {
				this.repaint(ado.buildEventObject(ado_status.REFRESH, -1));
			}
			this._inited = true;
		},
		initEdit: function() {
			var fShell = this.getShell().querySelector(
				"[image-band = 'upload']");
			if (fShell) {
				this.bindListen($e.events.regEvent(this.body, 'mouseover',
					this, this.showDeleteCell));
				this.bindListen($e.events.regEvent(this.body, 'mouseleave',
					this, this.hideDeleteCell));
				// this.fieldAdd =
				this.createImageAddField(fShell);
				// $e.forActiveCell(this, this.fieldAdd);
				// this.fieldAdd.init();
				// this.fieldAdd.atNode = this.fieldAdd.getShell().parentNode;
				if (this.deleteCell) {
					this.bindListen($e.events.regEvent(this.deleteCell,
						'click', this, this.deleteImage));
				}
			}
		},
		createImageAddField: function(shell) {
			var setting = this.prepareImageAddOptions() || {};
			var options = {
				ado:this.adoName,
				type: "file",
				name: "upload",
				action: this.actionAdd
			};
			this.fieldAdd = $e.ui.createField(shell, options);
			$e.forActiveCell(this, this.fieldAdd);
			if ($e.fn.isPlainObject(setting)) {
				$e.fn.extend(setting, this.fieldAdd, true);
			}
			this.fieldAdd.init();
			this.fieldAdd.atNode = this.fieldAdd.getShell().parentNode;
		},

		/**
		 * 上传图片时，增加 url 的参数
		 */
		prepareImageAddOptions: function() {
			// 覆盖组件(类型为SelfFile)fieldAdd的属性或方法
			// return {
			// transParams:{}或者下面的方法
			// getTransParams:function(value){
			// return {_path:value};
			// }};
			return {
				transParams:{
					ado:this.adoName
				}
			};
		},
		/**
		 * 删除图片时，增加url参数
		 */
		prepareImageDeleteOptions: function() {
			return {};
		},
		doDataListen: function(options) {
			this.repaint(options);
		},
		/*---判断修改状态初始函数---*/
		repaint: function(options) {
			this.setEnable(this.validEnable(options));
			var props;
			if (options.eventType == ado_status.REFRESH) {
				this._randID = {};
				var ado = options.ado || this.getADO();
				$e.fn.setChild(this.body, null);
				for (var i = 0; i < ado.getRowsCount(); i++) {
					props = $e.fn.extend(options, {});
					props.rowid = ado.getRowID(i);
					props = this.fillImageProps(ado, i, props);
					this.addImage(props);
				}
			} else {
				delete this._randID[options.rowid + ""];
				if (options.eventType == ado_status.ROW_DELETE) {
					this.removeImage(options);
					return;
				}
				props = this.fillImageProps(options.ado, options.row, options);
				if (options.eventType == ado_status.ROW_ADD) {
					this.addImage(props);
				} else if (options.eventType == ado_status.ROW_EDIT) {
					this.editImage(props);
				}
			}
		},
		fillImageProps: function(ado, row, props) {
			//			var map = {
			//				rowid : props.rowid
			//			};
			//			return map;
			var col = ado.getColumnIndex('video');
			if (col >= 0 && row >= 0) {
				props['video'] = ado.getValueAt(row, col);
			}
			return props;
		},
		validEnable: function(options) {
			// var ado = this.getADO();ado ? (ado.getRowsCount() > 0) :
			return true;
		},
		setEnable: function(enable, data) {
			this.enable = enable;
			if (this.fieldAdd) {
				this.fieldAdd.setEnable(enable);
				if (this.fieldAdd.atNode) {
					if (this.enable) {
						this.fieldAdd.atNode.appendChild(this.fieldAdd
							.getShell());
					} else if (this.fieldAdd.getShell().parentNode == this.fieldAdd.atNode) {
						this.fieldAdd.atNode.removeChild(this.fieldAdd
							.getShell());
					}
				}
				if (enable) {
					if (!this.deleteCell) {
						this.deleteCell = $e.fn.create("I",
							"fa fa-close yc-view-images-item-del");
						this.bindListen($e.events.regEvent(this.deleteCell,
							'click', this, this.deleteImage));
					}
				} else {
					this.hideDeleteCell();
				}
			}
		},
		/*---控制删除按钮功能---*/
		validDeleteAble: function(options) {
			return this.validEnable(options);
		},
		showDeleteCell: function(event) {
			$e.events.cancelEvent(event, true);
			if (this.deleteCell) {
				var target = event.target || event.srcElement;
				if (target.tagName == "IMG") {
					var cell = target.parentNode;
					var options = {
						ado: this.getADO(),
						rowid: cell.getAttribute("img_id")
					};
					if (this.validDeleteAble(options)) {
						cell.appendChild(this.deleteCell);
					}
				}
			}
		},

		hideDeleteCell: function(event) {
			// var target = event.target || event.srcElement;
			// if(target == this.deleteCell){
			// return;
			// }
			if (this.deleteCell && this.deleteCell.parentNode) {
				this.deleteCell.parentNode.removeChild(this.deleteCell);
			}
		},

		isEnable: function() {
			return this.enable;
		},

		addImage: function(options) {
			var img = this.createImage(options);
			this.body.appendChild(img);
			this.onCreateImage(options, img);
		},
		deleteImage: function(event) {
			if (this.isEnable() && this.actionDelete) {
				var cell = $e.fn.closest(event, "img_id");
				if (cell) {
					$e.events.cancelEvent(event, true);
					var rowid = cell.getAttribute("img_id");
					if (rowid && parseInt(rowid) > 0) {
						var params = {
							ado: this.adoName,
							rowid: rowid
						};
						$e.fn.extend(this.prepareImageDeleteOptions(), params, true);
						this.call(this.actionDelete, null, null, {
							params: params
						});
					}
				}
			}
		},
		removeImage: function(options) {
			var cell = this.getBody().querySelector("[img_id='" + options.rowid + "']");
			if (cell) {
				cell.parentNode.removeChild(cell);
			}
		},

		editImage: function(options) {
			var cell = this.getBody().querySelector("[img_id='" + options.rowid + "']");
			if (cell) {
				var img = this.createImage(options);
				cell.parentNode.appendChild(img);
				cell.parentNode.removeChild(cell);
				this.onCreateImage(options, img);
			}
		},
		/*---生成图片URL---*/
		buildURL: function(option) {
			if (this.imageField) {
				var ado = this.getADO();
				var row = ado.findRowByRowID(option.rowid);
				if (row >= 0) {
					var path = ado.getValueAt(row, this.imageField);
					if (!!path && path.startsWith('http')) {
						return path;
					}
				}
			}
			var options = {
				_amn: this.getActiveModuleName(),
				_mn: this.getModuleName(),
				_name: this.actionRead || "image.Read"
			};
			var randk = 'r' + option.rowid + '';
			if (!this._randID[randk]) {
				this._randID[randk] = $e.randNum();
			}
			options._rand = this._randID[randk];
			$e.fn.extend(option, options, true);
			this.prepareImageURLOptions(options);
			return $e.getURL("async", options, false, true);

		},

		/**
		 * 读取图片时，需要增加url的参数，覆盖此方法
		 * 
		 * @param options
		 */
		prepareImageURLOptions: function(options) {
			// 在此增加或修改options对象的参数值
		},
		/*---初始化缩略图---*/
		createImage: function(options) {
			var props = {
				ado:this.adoName,
				rowid: options.rowid
			};
			var cell = $e.fn.create("A", "yc-view-images-item");
			cell.setAttribute("img_id", options.rowid);

			var img = $e.fn.create("IMG", "yc-view-images-item-img");
			$e.fn.setStyle(img, this.getImageStyle(options));
			img.src = this.buildURL(props);
			cell.appendChild(img);

			if (!!options['video']) {
				// 加入播放器图片
				var icon = $e.fn.create("DIV", "yc-view-images-play");
				cell.setAttribute("src-type", options['video']);
				cell.appendChild(icon);
			}
			return cell;
		},



		getImageStyle: function(options) {
			return this.imageStyle;
		},
		onCreateImage: function(options, img) {
		},

		/*---显示灯箱---*/
		showLargeImage: function(event) {
			var cell = $e.fn.closest(event, "img_id", true);
			if (cell) {
				var type = cell.getAttribute("src-type");
				if (!type) {
					// 是图片,显示大图
					var that = this;
					setTimeout(
						function() {
							if (!that.lowVersionAct()) {
								var shell = that.createLargeBox();
								var box = shell
									.querySelector('.yc-view-images-lightbox-content');
								$e.fn.removeClass(shell, "hide");
								$e.fn.addClass(shell, "anima-open");
								$e.fn.addClass(box, "anima-open");
								box
									.addEventListener("animationend",
										doCall);
								function doCall() {
									that.showLightBox();
									$e.fn.removeClass(box, "anima-open");
									$e.fn.removeClass(shell, "anima-open");
									box.removeEventListener("animationend",
										doCall);
								}
							} else {
								that.showLightBox();
							}
							that.goLargeImage(cell.getAttribute("img_id"));
						}, 0);
				} else if (type != 'none') {
					// 播放视频
					var rowid = cell.getAttribute("img_id");
					var options = {
						rowid: rowid,
						size: "large",
						video: true,
						aod:this.adoName
					};
					var src = this.buildURL(options);
					// var shell = cell.parentNode;
					$e.fn.setChild(cell, null);

					var video = $e.fn.create("video", "yc-view-images-item-img",{controls:"true",autoplay:"autoplay"});
					//video.setAttribute("controls", "true");
					//video.setAttribute("autoplay", "autoplay");
					$e.fn.setStyle(video, this.getImageStyle(options));
					var source = $e.fn.create("source",'',{src:src,type:"video/" + type});
					//source.setAttribute("src", src);
					//source.setAttribute("type", "video/" + type);

					video.appendChild(source);
					cell.appendChild(video);

					// 修改src-type为none，防止再次触发
					cell.setAttribute("src-type", "none");
				}
			}
		},

		createSpin: function(shell) {
			var box = shell.querySelector('.yc-view-images-lightbox-content');
			var loader = this.lightBox.querySelector("[image-band='loader']");
			if (!loader) {
				loader = $e.fn.create("div", "yc-view-images-lightBox-loader");
				var loaderImg = $e.fn.create("img");
				loaderImg.src = "images/img_loading.png";
				loaderImg.classList.add("fa", "fa-spin");
				loader.setAttribute("image-band", "loader");
				loader.appendChild(loaderImg);
				box.appendChild(loader);
			}
		},

		createTools: function(shell) {
			var box = shell.querySelector('.yc-view-images-lightbox-content');
			var tools = this.lightBox.querySelector("[image-band='tools']");
			if (!tools) {
				tools = $e.fn.create("div", "yc-view-images-lightBox-tools");
				var rotateLeft = $e.fn.create("i", "fa fa-undo");
				var rotateRight = $e.fn.create("i", "fa fa-repeat");
				var zoomBtn = $e.fn.create("i", "fa fa-search-plus");
				var shrinkBtn = $e.fn.create("i", "fa fa-search-minus");

				tools.appendChild(rotateLeft);
				tools.appendChild(rotateRight);
				tools.appendChild(zoomBtn);
				tools.appendChild(shrinkBtn);

				this.addRotateCtrl(rotateLeft, rotateRight);
				var _this = this;
				zoomBtn.addEventListener("click", function() {
					_this.zoomImg();
				});
				shrinkBtn.addEventListener("click", function() {
					_this.shrinkImg();
				});

				box.appendChild(tools);
			}
		},

		addRotateCtrl: function(rotateLeft, rotateRight) {
			var img = this.lightBox.querySelector("[image-band='img']");
			var _this = this;
			rotateRight.addEventListener("click", function() {
				var leftIndex = _this.leftIndex || 0;
				leftIndex += 1;
				_this.leftIndex = leftIndex;
				_this.syncRotate();

				var degValue = leftIndex * 90;

				img.style.transform = "rotateZ(" + degValue + "deg)";
			});

			rotateLeft.addEventListener("click", function() {
				var leftIndex = _this.leftIndex || 0;
				var leftDeg = leftIndex * 90;
				var restDeg = leftDeg - 90;

				_this.leftIndex = leftIndex - 1;
				_this.syncRotate();

				img.style.transform = "rotateZ(" + restDeg + "deg)";
			});
		},

		addWheelCtrl: function() {
			var _this = this;
			this.lightBox.addEventListener("wheel", function(e) {
				if (e.deltaY) {
					if (e.deltaY > 0) { // 当滑轮向上滚动时
						_this.zoomImg();
					}
					if (e.deltaY < 0) { // 当滑轮向下滚动时
						_this.shrinkImg();
					}
				}
			});
		},

		zoomImg: function() {
			var img = this.lightBox.querySelector("[image-band='img']");
			var height = img.offsetHeight;
			img.style.height = height + 100 + 'px';
			img.style.width = "auto";
		},

		shrinkImg: function() {
			var img = this.lightBox.querySelector("[image-band='img']");
			var height = img.offsetHeight;
			img.style.height = height - 100 + 'px';
			img.style.width = "auto";
		},

		syncRotate: function() {
			var img = this.lightBox.querySelector("[image-band='img']");

			var width = img.offsetWidth;
			var height = img.offsetHeight;
			if (width > height) {
				width = height;
			}

			img.style.width = width + "px";
			img.style.height = height + "px";
		},

		clearRotate: function() {
			var img = this.lightBox.querySelector("[image-band='img']");
			img.style = "";
			this.leftIndex = undefined;
		},

		initializeImgHeight: function() {
			var img = this.lightBox.querySelector("[image-band='img']");
			var canSee = document.documentElement.clientHeight;
			var imgHeight = canSee - (canSee * 0.3);
			img.style.height = imgHeight + 'px';
		},

		/*---初始设置幻灯片图片大小---*/
		goLargeImage: function(rowid) {
			var img = this.lightBox.querySelector("[image-band='img']");
			this.initializeImgHeight();
			var options = {
				rowid: rowid,
				ado:this.adoName
			};
			if (!this.sameLargeImage) {
				options.size = "large";
			}
			img.src = this.buildURL(options);
			// 显示大图片后的操作
			this.currentLargeRowID = parseInt(options.rowid);
			this.onShowLargeImage(options);
		},

		/*---生成幻灯片---*/
		createLargeBox: function() {
			if (!this.lightBox) {
				this.lightBox = $e.fn.create("div",
					"yc-view-images-lightbox hide");// lightBox
				this.lightBox.innerHTML = this.largeHTML;

				this.createSpin(this.lightBox);
				this.createTools(this.lightBox);
				this.addWheelCtrl();

				// 添加事件,点击左右箭头时，执行的操作
				this.bindListen($e.events.regEvent(this.lightBox, 'click',
					this, this.changeLargeImage));
				this.bindListen($e.events.regEvent(this.lightBox, 'mouseover',
					this, this.showArrow));
				this.bindListen($e.events.regEvent(this.lightBox, 'mouseout',
					this, this.hideArrow));
				document.body.appendChild(this.lightBox);
			}
			return this.lightBox;
		},

		/**
		 * 处理显示大图片标题之类的信息
		 * 
		 * @param adoName,rowid
		 */
		onShowLargeImage: function(options) {
		},

		/*---设置左右按钮隐藏显示---*/
		showArrow: function(event) {
			var target = event.target || event.srcElement;
			var leftNav = this.lightBox.querySelector("[image-band='leftNav']");
			var rightNav = this.lightBox
				.querySelector("[image-band='rightNav']");
			var type = target.getAttribute("image-band");// left,right,close,modal
			if (target == leftNav || type == 'leftIcon') {
				leftNav.style.opacity = '1';
			} else if (target == rightNav || type == 'rightIcon') {
				rightNav.style.opacity = '1';
			}
		},
		hideArrow: function(event) {
			var leftNav = this.lightBox.querySelector("[image-band='leftNav']");
			var rightNav = this.lightBox
				.querySelector("[image-band='rightNav']");
			leftNav.style.opacity = '0';
			rightNav.style.opacity = '0';
		},

		/**
		 * 处理大图片上的响应事件 设置css3动画
		 * 
		 * @param event
		 */
		changeLargeImage: function(event) {
			var that = this;
			var target = event.target || event.srcElement;
			var type = target.getAttribute("image-band");// left,right,close,modal
			var shell = this.lightBox;
			if (this.lowVersionAct() == true) {
				if (type == 'leftNav' || type == 'leftIcon') {
					this.prevImage();
				} else if (type == 'rightNav' || type == 'rightIcon') {
					this.nextImage();
				} else if (type == 'close') {
					this.closeLightBox();
				} else if (target == this.lightBox) {
					this.closeLightBox();
				}
			} else {
				var box = shell
					.querySelector('.yc-view-images-lightbox-content');
				var img = shell.querySelector('.yc-view-images-lightbox-img');
				box.addEventListener("animationend", doCall);

				if (type == 'leftNav' || type == 'leftIcon') {
					$e.fn.addClass(img, "anima-switch-left");
				} else if (type == 'rightNav' || type == 'rightIcon') {
					$e.fn.addClass(img, "anima-switch-right");
				} else if (type == 'close') {
					$e.fn.addClass(box, "anima-close");
				} else if (target == shell) {
					$e.fn.addClass(box, "anima-close");
				}

				function doCall() {
					if (type == 'close') {
						that.closeLightBox();
						$e.fn.removeClass(box, "anima-close");
					} else if (target == shell) {
						that.closeLightBox();
						$e.fn.removeClass(box, "anima-close");
					} else if (type == 'leftNav' || type == 'leftIcon') {
						that.prevImage();
						$e.fn.removeClass(img, "anima-switch-left");
					} else if (type == 'rightNav' || type == 'rightIcon') {
						that.nextImage();
						$e.fn.removeClass(img, "anima-switch-right");
					}
					box.removeEventListener("animationend", doCall);
				}
			}
		},

		prevImage: function() {
			var ado = this.getADO();
			var count = ado.getRowsCount();
			if (count <= 1) {
				return;
			}
			var row = ado.findRowByRowID(this.currentLargeRowID);
			row -= 1;
			if (row < 0) {
				row = ado.getRowsCount() - 1;
			}
			if (row >= 0) {
				this.goLargeImage(ado.getRowID(row));
			}

			this.clearRotate();
			this.initializeImgHeight();
		},

		nextImage: function() {
			var ado = this.getADO();
			var count = ado.getRowsCount();
			if (count <= 1) {
				return;
			}
			var row = ado.findRowByRowID(this.currentLargeRowID);
			row += 1;
			if (row >= ado.getRowsCount()) {
				row = 0;
			}
			if (row >= 0 && row < ado.getRowsCount()) {
				this.goLargeImage(ado.getRowID(row));
			}

			this.clearRotate();
			this.initializeImgHeight();
		},

		showLightBox: function() {
			// $e.ui.showWindow(this.lightBox, true);
			$e.fn.setStyle(this.lightBox, "z-index:" + $e.fn.nextIndex(true));
			$e.fn.showElement(this.lightBox, true);
			// $e.fn.removeClass(this.lightBox, "hide");
		},

		closeLightBox: function() {
			$e.fn.addClass(this.lightBox, "hide");
			$e.ui.closeWindow(this.lightBox);

			this.clearRotate();
		},

		/*---低版本浏览器判断---*/
		lowVersionAct: function() {
			var userAgent = navigator.userAgent;
			var isIE = $e.os.ie;
			if (isIE) {
				var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
				reIE.test(userAgent);
				var fIEVersion = parseFloat(RegExp["$1"]);
				if (fIEVersion < 10 || !isSupportPlaceholder()) {
					return true;
				}
			}
			return false;
		}
	};
	var plugin = {
		create: function(options) {
			return new ImageView(options);
		}
	};
	$e.ui.addViewPlugin("view_images", plugin);
}($e);
