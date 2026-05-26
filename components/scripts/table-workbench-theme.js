(() => {
    const root = document.documentElement;
    const storageKey = 'yc-theme';

    function normalizeTheme(theme) {
        return theme === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        root.setAttribute('yc-theme', normalizeTheme(theme));
    }

    function resolveTheme() {
        try {
            return normalizeTheme(localStorage.getItem(storageKey) || root.getAttribute('yc-theme'));
        } catch (error) {
            return normalizeTheme(root.getAttribute('yc-theme'));
        }
    }

    applyTheme(resolveTheme());

    window.addEventListener('message', event => {
        const data = event.data;
        if (!data || data.type !== 'yc-theme-sync') return;

        const theme = normalizeTheme(data.theme);
        applyTheme(theme);

        try {
            localStorage.setItem(storageKey, theme);
        } catch (error) {
            // Ignore storage write failures in restricted contexts.
        }
    });

    window.addEventListener('storage', event => {
        if (event.key !== storageKey || !event.newValue) return;
        applyTheme(event.newValue);
    });
})();
