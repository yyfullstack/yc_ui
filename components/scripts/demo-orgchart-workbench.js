(() => {
    const TREE_DATA = {
        id: 'ceo',
        name: '林致远',
        title: '首席执行官',
        dept: '管理层',
        tone: 'primary',
        note: '统筹平台路线、业务节奏与组织协同。',
        children: [
            {
                id: 'platform',
                name: '唐一舟',
                title: '平台研发负责人',
                dept: '平台研发',
                tone: 'success',
                note: '负责组件平台、设计系统和基础工程能力。',
                children: [
                    { id: 'fe-1', name: '顾思齐', title: '前端架构师', dept: '平台研发', tone: 'primary', note: '负责工作台和表单体系。', children: [] },
                    { id: 'fe-2', name: '梁若川', title: '高级工程师', dept: '平台研发', tone: 'info', note: '负责地图、图表与流程可视化。', children: [] }
                ]
            },
            {
                id: 'product',
                name: '韩清越',
                title: '产品设计负责人',
                dept: '产品设计',
                tone: 'warning',
                note: '负责交互规范、体验策略和产品方案。',
                children: [
                    { id: 'pd-1', name: '周岚', title: '产品经理', dept: '产品设计', tone: 'warning', note: '负责配置类组件与 demo 场景。', children: [] },
                    { id: 'pd-2', name: '莫然', title: '体验设计师', dept: '产品设计', tone: 'danger', note: '负责风格统一和视觉细节。', children: [] }
                ]
            },
            {
                id: 'ops',
                name: '陆栖宁',
                title: '运营支持负责人',
                dept: '运营支持',
                tone: 'danger',
                note: '负责培训、发布节奏与客户成功。',
                children: [
                    { id: 'op-1', name: '沈行歌', title: '运营经理', dept: '运营支持', tone: 'danger', note: '负责示例内容和业务案例沉淀。', children: [] }
                ]
            }
        ]
    };

    const state = {
        scale: 100,
        selectedId: 'ceo',
        search: '',
        filter: '全部',
        collapsed: new Set()
    };

    function flatten(node, list = [], parent = null) {
        list.push({ ...node, parentId: parent?.id || null });
        node.children.forEach(child => flatten(child, list, node));
        return list;
    }

    const FLAT_TREE = flatten(TREE_DATA);
    const NODE_MAP = new Map(FLAT_TREE.map(node => [node.id, node]));

    function findNode(id) {
        return NODE_MAP.get(id) || null;
    }

    function countPeople(node) {
        return 1 + node.children.reduce((sum, child) => sum + countPeople(child), 0);
    }

    function matches(node) {
        const keyword = state.search.trim().toLowerCase();
        const deptMatch = state.filter === '全部' || node.dept === state.filter;
        const selfMatch = !keyword || [node.name, node.title, node.dept].some(text => text.toLowerCase().includes(keyword));
        const childMatch = node.children.some(matches);
        return (deptMatch && selfMatch) || childMatch;
    }

    function getVisibleNodes(node = TREE_DATA, list = []) {
        if (!matches(node)) return list;
        list.push(node);
        node.children.forEach(child => getVisibleNodes(child, list));
        return list;
    }

    function ensureSelectedVisible(visibleNodes) {
        if (!visibleNodes.length) {
            state.selectedId = '';
            return;
        }

        if (!visibleNodes.some(node => node.id === state.selectedId)) {
            state.selectedId = visibleNodes[0].id;
        }
    }

    function renderNode(node, level = 0) {
        if (!matches(node)) return '';

        const selected = state.selectedId === node.id ? ' is-selected' : '';
        const rootClass = level === 0 || node.children.length ? ' yc-orgchart__node-card--root' : ' yc-orgchart__node-card--leaf';
        const toneClass = node.tone ? ` yc-orgchart__node-avatar--${node.tone}` : '';
        const collapsed = state.collapsed.has(node.id);
        const childrenMarkup = node.children.map(child => renderNode(child, level + 1)).filter(Boolean).join('');
        const showChildren = Boolean(childrenMarkup) && !collapsed;

        return `
            <div class="yc-orgchart__node" data-id="${node.id}">
                <div class="yc-orgchart__node-wrapper">
                    <button type="button" class="yc-orgchart__node-card${rootClass}${selected}" data-node-id="${node.id}">
                        <div class="yc-orgchart__node-avatar${toneClass}">${node.name.slice(0, 1)}</div>
                        <div class="yc-orgchart__node-name">${node.name}</div>
                        <div class="yc-orgchart__node-title">${node.title}</div>
                        <span class="yc-orgchart__node-dept">${node.dept}</span>
                        ${node.children.length ? `<span class="yc-orgchart__node-badge">${node.children.length}</span>` : ''}
                        ${childrenMarkup ? `<span class="yc-orgchart__toggle${collapsed ? ' is-collapsed' : ''}" data-toggle-id="${node.id}"><i class="fas ${collapsed ? 'fa-plus' : 'fa-minus'}"></i></span>` : ''}
                    </button>
                </div>
                ${showChildren ? `<div class="yc-orgchart__children">${childrenMarkup}</div>` : ''}
            </div>
        `;
    }

    function renderTree() {
        const tree = document.getElementById('orgchartTree');
        if (!tree) return;

        const visibleNodes = getVisibleNodes();
        ensureSelectedVisible(visibleNodes);

        if (!visibleNodes.length) {
            tree.innerHTML = '<div class="yc-orgchart__empty">没有匹配的成员，试试切换部门或清空关键词。</div>';
            tree.style.transform = 'none';
            renderInspector();
            renderStats(visibleNodes.length);
            return;
        }

        tree.innerHTML = renderNode(TREE_DATA);
        tree.style.transform = `scale(${state.scale / 100})`;
        tree.style.transformOrigin = 'top center';
        bindTreeEvents();
        renderInspector();
        renderStats(visibleNodes.length);
    }

    function renderInspector() {
        const target = document.getElementById('orgchartInspector');
        const node = state.selectedId ? findNode(state.selectedId) : null;
        if (!target) return;

        if (!node) {
            target.innerHTML = '<div class="yc-orgchart-workbench__empty">当前筛选结果为空，调整搜索或部门后会在这里展示成员详情。</div>';
            return;
        }

        target.innerHTML = `
            <div class="yc-orgchart-workbench__inspector-avatar yc-orgchart__node-avatar yc-orgchart__node-avatar--${node.tone || 'primary'}">${node.name.slice(0, 1)}</div>
            <div class="yc-orgchart-workbench__inspector-name">${node.name}</div>
            <div class="yc-orgchart-workbench__inspector-role">${node.title}</div>
            <div class="yc-orgchart-workbench__inspector-note">${node.note}</div>
            <div class="yc-orgchart-workbench__meta-list">
                <div><span>所属部门</span><strong>${node.dept}</strong></div>
                <div><span>直接下属</span><strong>${node.children.length}</strong></div>
                <div><span>管理总人数</span><strong>${countPeople(node) - 1}</strong></div>
            </div>
        `;
    }

    function renderStats(visibleCount) {
        const total = FLAT_TREE.length;
        const depts = new Set(FLAT_TREE.map(item => item.dept)).size;
        const maxDepth = Math.max(...FLAT_TREE.map(item => {
            let depth = 1;
            let current = item;
            while (current.parentId) {
                depth += 1;
                current = NODE_MAP.get(current.parentId);
            }
            return depth;
        }));

        document.getElementById('orgchartMetricPeople').textContent = String(total);
        document.getElementById('orgchartMetricDept').textContent = String(depts);
        document.getElementById('orgchartMetricDepth').textContent = String(maxDepth);
        document.getElementById('orgchartZoomLabel').textContent = `${state.scale}%`;

        const toolbarTitle = document.querySelector('.yc-orgchart__toolbar-title');
        if (toolbarTitle) {
            toolbarTitle.textContent = `组织结构视图 · 当前显示 ${visibleCount} 人`;
        }
    }

    function bindTreeEvents() {
        document.querySelectorAll('[data-node-id]').forEach(button => {
            button.addEventListener('click', event => {
                if (event.target.closest('[data-toggle-id]')) return;
                state.selectedId = button.dataset.nodeId;
                renderTree();
            });
        });

        document.querySelectorAll('[data-toggle-id]').forEach(toggle => {
            toggle.addEventListener('click', event => {
                event.stopPropagation();
                const id = toggle.dataset.toggleId;
                if (state.collapsed.has(id)) {
                    state.collapsed.delete(id);
                } else {
                    state.collapsed.add(id);
                }
                renderTree();
            });
        });
    }

    function bindWorkbench() {
        document.getElementById('orgchartSearch')?.addEventListener('input', event => {
            state.search = event.target.value;
            renderTree();
        });

        document.querySelectorAll('[data-org-filter]').forEach(button => {
            button.addEventListener('click', () => {
                state.filter = button.dataset.orgFilter;
                document.querySelectorAll('[data-org-filter]').forEach(item => item.classList.toggle('is-active', item === button));
                renderTree();
            });
        });

        document.getElementById('orgchartExpandAll')?.addEventListener('click', () => {
            state.collapsed.clear();
            renderTree();
        });

        document.getElementById('orgchartCollapseAll')?.addEventListener('click', () => {
            FLAT_TREE.filter(node => node.children.length).forEach(node => state.collapsed.add(node.id));
            state.collapsed.delete('ceo');
            renderTree();
        });

        document.getElementById('orgchartZoomIn')?.addEventListener('click', () => {
            state.scale = Math.min(state.scale + 10, 160);
            renderTree();
        });

        document.getElementById('orgchartZoomOut')?.addEventListener('click', () => {
            state.scale = Math.max(state.scale - 10, 70);
            renderTree();
        });
    }

    function initOrgchartWorkbench() {
        bindWorkbench();
        renderTree();
    }

    document.addEventListener('DOMContentLoaded', initOrgchartWorkbench);
})();
