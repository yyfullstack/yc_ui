(() => {
    const MODE_META = {
        select: {
            label: '选择',
            summary: '用于浏览、选中节点并查看属性，适合做流程审阅和配置调整。'
        },
        connect: {
            label: '连线',
            summary: '用于规划节点之间的流转关系，适合补充分支路径和审批出口。'
        },
        pan: {
            label: '平移',
            summary: '用于拖动画布并检查整体布局，方便在大流程图里快速定位。'
        }
    };

    const NODE_META = {
        start: {
            type: '开始节点',
            title: '提交申请',
            owner: '发起人',
            summary: '流程入口，负责收集申请表单并触发后续校验。',
            next: '流向表单校验节点'
        },
        validate: {
            type: '处理节点',
            title: '表单校验',
            owner: '系统规则引擎',
            summary: '校验必填字段、附件完整性和基础规则，避免错误数据进入审批链。',
            next: '流向规则判断节点'
        },
        decision: {
            type: '判断节点',
            title: '是否满足规则',
            owner: '流程引擎',
            summary: '根据金额、类型和风控策略分流，决定进入审批还是退回修正。',
            next: '向左通过，向右驳回'
        },
        approve: {
            type: '处理节点',
            title: '进入审批链',
            owner: '审批中心',
            summary: '通知审批人并记录时间线，正式进入业务审批流程。',
            next: '审批完成后结束'
        },
        revise: {
            type: '处理节点',
            title: '驳回修正',
            owner: '申请人',
            summary: '提示申请人补齐材料或修正字段，然后重新回到流程起点。',
            next: '重新提交申请'
        },
        end: {
            type: '结束节点',
            title: '流程完成',
            owner: '系统归档',
            summary: '流程闭环，生成记录并写入后续追踪与审计日志。',
            next: '无后续节点'
        }
    };

    const state = {
        zoom: 100,
        mode: 'select',
        selectedNodeId: 'validate'
    };

    function updateMetrics() {
        document.getElementById('diagramMetricNodes')?.replaceChildren(document.createTextNode(String(Object.keys(NODE_META).length)));
        document.getElementById('diagramMetricBranches')?.replaceChildren(document.createTextNode('2'));
        document.getElementById('diagramMetricMode')?.replaceChildren(document.createTextNode(MODE_META[state.mode].label));
        document.getElementById('diagramMetricZoom')?.replaceChildren(document.createTextNode(`${state.zoom}%`));
        document.getElementById('diagramZoomLabel')?.replaceChildren(document.createTextNode(`${state.zoom}%`));
    }

    function syncZoom() {
        const canvas = document.getElementById('diagramBoard');
        if (!canvas) return;

        canvas.style.transform = `scale(${state.zoom / 100})`;
        canvas.style.transformOrigin = 'top left';
        updateMetrics();
    }

    function syncStatus() {
        const status = document.getElementById('diagramStatus');
        if (!status) return;

        const modeLabel = MODE_META[state.mode].label;
        const nodeMeta = state.selectedNodeId ? NODE_META[state.selectedNodeId] : null;
        status.textContent = nodeMeta ? `${modeLabel}模式 · 已选中：${nodeMeta.title}` : `当前模式：${modeLabel}`;
    }

    function renderInspector() {
        const inspector = document.getElementById('diagramInspector');
        if (!inspector) return;

        const nodeMeta = state.selectedNodeId ? NODE_META[state.selectedNodeId] : null;
        if (!nodeMeta) {
            const modeMeta = MODE_META[state.mode];
            inspector.innerHTML = `
                <div class="yc-diagram__inspector-eyebrow">当前模式</div>
                <div class="yc-diagram__inspector-name">${modeMeta.label}</div>
                <div class="yc-diagram__inspector-summary">${modeMeta.summary}</div>
                <div class="yc-diagram__inspector-meta-list">
                    <div><span>操作建议</span><strong>点击节点查看详情</strong></div>
                    <div><span>画布缩放</span><strong>${state.zoom}%</strong></div>
                </div>
            `;
            return;
        }

        inspector.innerHTML = `
            <div class="yc-diagram__inspector-eyebrow">${nodeMeta.type}</div>
            <div class="yc-diagram__inspector-name">${nodeMeta.title}</div>
            <div class="yc-diagram__inspector-summary">${nodeMeta.summary}</div>
            <div class="yc-diagram__inspector-meta-list">
                <div><span>责任角色</span><strong>${nodeMeta.owner}</strong></div>
                <div><span>后续流向</span><strong>${nodeMeta.next}</strong></div>
                <div><span>当前模式</span><strong>${MODE_META[state.mode].label}</strong></div>
            </div>
        `;
    }

    function setSelection(nodeId) {
        state.selectedNodeId = nodeId;
        document.querySelectorAll('.yc-diagram__node').forEach(node => {
            node.classList.toggle('is-selected', node.dataset.nodeId === nodeId);
        });
        syncStatus();
        renderInspector();
    }

    function setMode(mode) {
        state.mode = mode;
        document.querySelectorAll('[data-diagram-mode]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.diagramMode === mode);
        });
        syncStatus();
        renderInspector();
        updateMetrics();
    }

    function bindZoom() {
        document.getElementById('diagramZoomIn')?.addEventListener('click', () => {
            state.zoom = Math.min(state.zoom + 10, 180);
            syncZoom();
            renderInspector();
        });

        document.getElementById('diagramZoomOut')?.addEventListener('click', () => {
            state.zoom = Math.max(state.zoom - 10, 60);
            syncZoom();
            renderInspector();
        });

        document.getElementById('diagramZoomReset')?.addEventListener('click', () => {
            state.zoom = 100;
            syncZoom();
            renderInspector();
        });
    }

    function bindToolbar() {
        document.querySelectorAll('[data-diagram-mode]').forEach(button => {
            button.addEventListener('click', () => {
                setMode(button.dataset.diagramMode);
            });
        });
    }

    function bindNodes() {
        document.querySelectorAll('.yc-diagram__node').forEach(node => {
            node.addEventListener('click', event => {
                event.stopPropagation();
                setSelection(node.dataset.nodeId || '');
            });
        });

        document.getElementById('diagramCanvasViewport')?.addEventListener('click', () => {
            setSelection('');
        });
    }

    function initDiagramWorkbench() {
        bindZoom();
        bindToolbar();
        bindNodes();
        syncZoom();
        setMode(state.mode);
        setSelection(state.selectedNodeId);
    }

    document.addEventListener('DOMContentLoaded', initDiagramWorkbench);
})();
