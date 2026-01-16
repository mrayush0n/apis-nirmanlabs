import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        // Try to get from local storage
        const saved = localStorage.getItem('app-theme');
        return (saved as ThemeMode) || 'auto';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old classes
        root.classList.remove('light', 'dark');

        // Determine active theme
        let activeTheme = theme;
        if (theme === 'auto') {
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            activeTheme = systemPreference;
        }

        // Apply new class
        root.classList.add(activeTheme);

        // Save to local storage
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    // Listen for system changes if in auto mode
    useEffect(() => {
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return { theme, setTheme };
};
