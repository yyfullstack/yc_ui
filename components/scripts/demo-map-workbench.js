(() => {
    const LOCATIONS = [
        { id: 'beijing', name: '北京总部', x: 58, y: 22, category: '总部', note: '组件平台与设计系统核心团队', tone: 'primary' },
        { id: 'shanghai', name: '上海交付中心', x: 73, y: 36, category: '交付', note: '大型客户项目交付与验收支持', tone: 'success' },
        { id: 'guangzhou', name: '广州运营中心', x: 55, y: 58, category: '运营', note: '内容运营、营销活动和数据复盘', tone: 'warning' },
        { id: 'chengdu', name: '成都研发站点', x: 32, y: 46, category: '研发', note: '地图、图表和工作台类组件研发', tone: 'danger' },
        { id: 'wuhan', name: '武汉服务台', x: 48, y: 40, category: '服务', note: '客服、工单与 SLA 跟进支持', tone: 'info' }
    ];

    const TOOL_LABELS = {
        pointer: '浏览',
        marker: '标记',
        line: '路线',
        zone: '区域'
    };

    const TOOL_HINTS = {
        pointer: '浏览模式：点击地图节点查看详情。',
        marker: '新增标记模式：点击地图空白区域新增一个关注点。',
        line: '路线模式：用于标注站点之间的协作路径。',
        zone: '区域模式：快速圈出重点服务区域。'
    };

    const state = {
        activeTool: 'pointer',
        currentMarkerId: LOCATIONS[0].id,
        shapes: []
    };

    function getCurrentMarker() {
        return LOCATIONS.find(item => item.id === state.currentMarkerId) || LOCATIONS[0];
    }

    function toneClass(tone) {
        const toneMap = {
            primary: 'yc-map__marker--primary',
            success: 'yc-map__marker--success',
            warning: 'yc-map__marker--warning',
            danger: 'yc-map__marker--danger',
            info: 'yc-map__marker--info'
        };
        return toneMap[tone] || toneMap.primary;
    }

    function updateSummary(text) {
        const summary = document.getElementById('mapWorkbenchStatus');
        if (summary) summary.textContent = text;
    }

    function updateMetrics() {
        const currentMarker = getCurrentMarker();
        document.getElementById('mapMetricSites')?.replaceChildren(document.createTextNode(String(LOCATIONS.length)));
        document.getElementById('mapMetricShapes')?.replaceChildren(document.createTextNode(String(state.shapes.length)));
        document.getElementById('mapMetricTool')?.replaceChildren(document.createTextNode(TOOL_LABELS[state.activeTool] || TOOL_LABELS.pointer));
        document.getElementById('mapMetricFocus')?.replaceChildren(document.createTextNode(currentMarker.name));
    }

    function renderPopup(marker) {
        const popup = document.getElementById('mapPopup');
        if (!popup) return;

        popup.style.left = `${marker.x}%`;
        popup.style.top = `${marker.y}%`;
        popup.innerHTML = `
            <div class="yc-map__popup-title">${marker.name}</div>
            <div class="yc-map__popup-content">
                <div>${marker.category}</div>
                <div>${marker.note}</div>
            </div>
        `;
        popup.hidden = false;
    }

    function syncMarkerState() {
        const currentMarker = getCurrentMarker();

        document.querySelectorAll('.yc-map__marker').forEach(node => {
            const active = node.dataset.id === currentMarker.id;
            node.classList.toggle('is-active', active);
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        document.querySelectorAll('.yc-map-workbench__location').forEach(node => {
            const active = node.dataset.id === currentMarker.id;
            node.classList.toggle('is-active', active);
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function focusMarker(id, customSummary = '') {
        const marker = LOCATIONS.find(item => item.id === id);
        if (!marker) return;

        state.currentMarkerId = marker.id;
        syncMarkerState();
        renderPopup(marker);
        updateSummary(customSummary || `当前聚焦 ${marker.name}，分类：${marker.category}`);
        updateMetrics();
    }

    function activateTool(tool, summary) {
        state.activeTool = tool;
        document.querySelectorAll('[data-map-tool]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.mapTool === tool);
        });
        updateSummary(summary || TOOL_HINTS[tool] || TOOL_HINTS.pointer);
        updateMetrics();
    }

    function renderMarkers() {
        const layer = document.getElementById('mapMarkerLayer');
        const list = document.getElementById('mapMarkerList');
        if (!layer || !list) return;

        layer.innerHTML = '';
        list.innerHTML = '';

        LOCATIONS.forEach(item => {
            const marker = document.createElement('button');
            marker.type = 'button';
            marker.className = `yc-map__marker ${toneClass(item.tone)}`;
            marker.dataset.id = item.id;
            marker.style.left = `${item.x}%`;
            marker.style.top = `${item.y}%`;
            marker.innerHTML = `
                <span class="yc-map__marker-dot"></span>
                <span class="yc-map__marker-label is-always-show">${item.name}</span>
            `;
            marker.addEventListener('click', () => focusMarker(item.id));
            layer.appendChild(marker);

            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'yc-map-workbench__location';
            row.dataset.id = item.id;
            row.innerHTML = `
                <span class="yc-map-workbench__location-name">${item.name}</span>
                <span class="yc-map-workbench__location-meta">${item.category}</span>
            `;
            row.addEventListener('click', () => focusMarker(item.id));
            list.appendChild(row);
        });

        syncMarkerState();
    }

    function addShape(type, x, y) {
        const layer = document.getElementById('mapShapeLayer');
        if (!layer) return;

        const node = document.createElement('div');
        node.className = `yc-map-workbench__shape yc-map-workbench__shape--${type}`;
        node.style.left = `${x}%`;
        node.style.top = `${y}%`;

        if (type === 'line') {
            node.style.setProperty('--yc-map-shape-rotation', `${Math.round(Math.random() * 50 - 25)}deg`);
        }

        if (type === 'zone') {
            node.style.setProperty('--yc-map-shape-size', `${72 + Math.round(Math.random() * 24)}px`);
        }

        layer.appendChild(node);
        state.shapes.push(node);
        updateMetrics();
    }

    function clearShapes(updateText = true) {
        state.shapes.splice(0).forEach(node => node.remove());
        updateMetrics();
        if (updateText) {
            const currentMarker = getCurrentMarker();
            updateSummary(`已清除临时绘制，当前聚焦 ${currentMarker.name}。`);
        }
    }

    function resetWorkbench() {
        clearShapes(false);
        activateTool('pointer', '视图已重置，回到浏览模式。');
        focusMarker(getCurrentMarker().id, `视图已重置，当前聚焦 ${getCurrentMarker().name}。`);
    }

    function bindCanvas() {
        const viewport = document.getElementById('mapViewport');
        if (!viewport) return;

        viewport.addEventListener('click', event => {
            if (event.target.closest('.yc-map__marker') || event.target.closest('.yc-map__popup')) return;

            const rect = viewport.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            if (state.activeTool === 'marker') {
                addShape('marker', x, y);
                updateSummary(`已在地图上新增临时标记 (${x.toFixed(1)}%, ${y.toFixed(1)}%)。`);
                return;
            }

            if (state.activeTool === 'line') {
                addShape('line', x, y);
                updateSummary('已添加一段协作路线标记。');
                return;
            }

            if (state.activeTool === 'zone') {
                addShape('zone', x, y);
                updateSummary('已圈定一个重点服务区域。');
            }
        });
    }

    function bindToolbar() {
        document.querySelectorAll('[data-map-tool]').forEach(button => {
            button.addEventListener('click', () => {
                const tool = button.dataset.mapTool;
                if (tool === 'reset') {
                    resetWorkbench();
                    return;
                }
                activateTool(tool);
            });
        });

        document.getElementById('mapClearDrawings')?.addEventListener('click', () => {
            clearShapes();
            focusMarker(getCurrentMarker().id, `已清除临时绘制，当前聚焦 ${getCurrentMarker().name}。`);
        });
    }

    function initMapWorkbench() {
        renderMarkers();
        bindToolbar();
        bindCanvas();
        activateTool('pointer');
        focusMarker(state.currentMarkerId);
    }

    document.addEventListener('DOMContentLoaded', initMapWorkbench);
})();
