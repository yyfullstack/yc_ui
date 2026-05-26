(() => {
    const TITLE_MAP = {
        affix: 'Affix',
        alert: 'Alert',
        anchor: 'Anchor',
        autocomplete: 'Autocomplete',
        avatar: 'Avatar',
        backtop: 'BackTop',
        badge: 'Badge',
        barcode: 'Barcode',
        breadcrumb: 'Breadcrumb',
        button: 'Button',
        calendar: 'Calendar',
        captcha: 'Captcha',
        chart: 'Chart',
        card: 'Card',
        carousel: 'Carousel',
        cascader: 'Cascader',
        checkbox: 'Checkbox',
        collapse: 'Collapse',
        'color-picker': 'ColorPicker',
        container: 'Container',
        'date-picker': 'DatePicker',
        descriptions: 'Descriptions',
        diagram: 'Diagram',
        dialog: 'Dialog',
        divider: 'Divider',
        drawer: 'Drawer',
        dropdown: 'Dropdown',
        empty: 'Empty',
        filter: 'Filter',
        flex: 'Flex',
        form: 'Form',
        image: 'Image',
        input: 'Input',
        'input-number': 'InputNumber',
        'input-tag': 'InputTag',
        layout: 'Layout',
        link: 'Link',
        listview: 'ListView',
        loading: 'Loading',
        map: 'Map',
        masonry: 'Masonry',
        'masked-input': 'Input',
        menu: 'Menu',
        messagebox: 'MessageBox',
        notification: 'Notification',
        orgchart: 'OrgChart',
        'page-header': 'PageHeader',
        pagination: 'Pagination',
        panel: 'Panel',
        popover: 'Popover',
        progress: 'Progress',
        'property-grid': 'PropertyGrid',
        qrcode: 'QRCode',
        radio: 'Radio',
        rate: 'Rate',
        rating: 'Rating',
        result: 'Result',
        scrollbar: 'Scrollbar',
        segmented: 'Segmented',
        select: 'Select',
        skeleton: 'Skeleton',
        slider: 'Slider',
        space: 'Space',
        splitter: 'Splitter',
        spreadsheet: 'Spreadsheet',
        statistic: 'Statistic',
        switch: 'Switch',
        table: 'Table',
        tabs: 'Tabs',
        tag: 'Tag',
        text: 'Text',
        textarea: 'Textarea',
        tilelayout: 'TileLayout',
        'time-picker': 'TimePicker',
        timeline: 'Timeline',
        tour: 'Tour',
        transfer: 'Transfer',
        tree: 'Tree',
        'tree-select': 'TreeSelect',
        upload: 'Upload',
        watermark: 'Watermark',
        window: 'Window'
    };

    function getSlug() {
        const match = window.location.pathname.match(/demo-([a-z0-9-]+)\.html$/i);
        return match ? match[1].toLowerCase() : '';
    }

    function getTitle(slug) {
        if (!slug) return 'Component';
        return TITLE_MAP[slug] || slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('yc-theme', theme);
        localStorage.setItem('yc-theme', theme);

        const icon = document.querySelector('[data-demo-theme] .demo-icon');
        const label = document.querySelector('[data-demo-theme] .demo-shell-theme-label');
        if (icon) icon.dataset.icon = theme === 'dark' ? 'sun' : 'moon';
        if (label) label.textContent = theme === 'dark' ? '浅色' : '深色';
    }

    function copyImport(cssPath, trigger) {
        const text = `@import url('${cssPath}');`;
        navigator.clipboard.writeText(text).then(() => {
            const original = trigger.innerHTML;
            trigger.innerHTML = '<i class="demo-icon" data-icon="check" aria-hidden="true"></i> 已复制';
            window.setTimeout(() => {
                trigger.innerHTML = original;
            }, 1400);
        }).catch(() => {
            window.prompt('复制下面这段导入语句', text);
        });
    }

    function buildToolbar(container, title, cssPath) {
        const toolbar = document.createElement('div');
        toolbar.className = 'demo-shell-toolbar';
        toolbar.innerHTML = `
            <div class="demo-shell-meta">
                <a class="yc-button yc-button--small" href="../index.html#components">
                    <i class="demo-icon" data-icon="arrow-left" aria-hidden="true"></i>
                    返回组件平台
                </a>
                <span class="demo-shell-pill">
                    <i class="demo-icon" data-icon="cube" aria-hidden="true"></i>
                    ${title}
                </span>
                <span class="demo-shell-pill">
                    <i class="demo-icon" data-icon="file-code" aria-hidden="true"></i>
                    ${cssPath}
                </span>
            </div>
            <div class="demo-shell-actions">
                <a class="yc-button yc-button--small" href="${cssPath}" target="_blank" rel="noreferrer">
                    <i class="demo-icon" data-icon="code" aria-hidden="true"></i>
                    CSS
                </a>
                <button class="yc-button yc-button--small" type="button" data-copy-import>
                    <i class="demo-icon" data-icon="copy" aria-hidden="true"></i>
                    复制导入
                </button>
                <button class="yc-button yc-button--primary yc-button--small" type="button" data-demo-theme>
                    <i class="demo-icon" data-icon="moon" aria-hidden="true"></i>
                    <span class="demo-shell-theme-label">深色</span>
                </button>
            </div>
        `;
        container.insertBefore(toolbar, container.firstChild);

        toolbar.querySelector('[data-copy-import]').addEventListener('click', event => {
            copyImport(cssPath, event.currentTarget);
        });

        toolbar.querySelector('[data-demo-theme]').addEventListener('click', () => {
            const current = document.documentElement.getAttribute('yc-theme') || 'light';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    function enhanceHeader(title, cssPath) {
        const header = document.querySelector('.demo-page-header');
        if (!header) return;

        const titleEl = header.querySelector('.demo-page-title');
        const subtitleEl = header.querySelector('.demo-page-subtitle');
        if (titleEl) titleEl.textContent = `${title} 组件`;
        if (subtitleEl) subtitleEl.textContent = `${title} 的状态、交互与组合演示，统一使用平台级 token 与 demo shell。`;

        if (!header.querySelector('.demo-shell-meta')) {
            const meta = document.createElement('div');
            meta.className = 'demo-shell-meta';
            meta.innerHTML = `
                <span class="demo-shell-pill"><i class="demo-icon" data-icon="flask" aria-hidden="true"></i> Demo</span>
                <span class="demo-shell-pill"><i class="demo-icon" data-icon="layer-group" aria-hidden="true"></i> ${cssPath}</span>
            `;
            header.appendChild(meta);
        }
    }

    function buildAnchors(container) {
        const headings = Array.from(document.querySelectorAll('.demo-section h3'));
        if (headings.length < 2) return;

        headings.forEach((heading, index) => {
            if (!heading.id) heading.id = `section-${index + 1}`;
        });

        const anchorBar = document.createElement('div');
        anchorBar.className = 'demo-shell-anchorbar';
        anchorBar.innerHTML = headings.map(heading => `
            <a class="demo-shell-anchor" href="#${heading.id}">${heading.textContent.trim()}</a>
        `).join('');

        const header = document.querySelector('.demo-page-header');
        if (header) {
            header.insertAdjacentElement('afterend', anchorBar);
        } else {
            container.insertBefore(anchorBar, container.children[1] || null);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.querySelector('.demo-container');
        if (!container) return;

        const slug = getSlug();
        const title = getTitle(slug);
        const cssPath = slug ? `../styles/components/${slug}.css` : '../styles/index.css';
        const savedTheme = localStorage.getItem('yc-theme') || 'light';
        const hasCustomShell = Boolean(container.querySelector('.demo-shell-toolbar'));

        if (!hasCustomShell) {
            enhanceHeader(title, cssPath);
            buildToolbar(container, title, cssPath);
            buildAnchors(container);
        }

        setTheme(savedTheme);
    });
})();
