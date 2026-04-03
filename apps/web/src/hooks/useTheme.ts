import { useEffect } from 'react';
import { useSettings } from './useSettings';

const LIGHT_THEME_COLOR = '#F2F2F7';
const DARK_THEME_COLOR = '#000000';

/**
 * Applies the theme class to <html> and updates <meta name="theme-color">.
 * - 'system': no class, OS media query controls colors
 * - 'light': adds .light class
 * - 'dark': adds .dark class
 */
export function useTheme() {
  const { theme } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');

    root.classList.remove('light', 'dark');

    if (theme === 'light') {
      root.classList.add('light');
      meta?.setAttribute('content', LIGHT_THEME_COLOR);
    } else if (theme === 'dark') {
      root.classList.add('dark');
      meta?.setAttribute('content', DARK_THEME_COLOR);
    } else {
      // System: check OS preference for meta tag
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      meta?.setAttribute('content', prefersDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }
  }, [theme]);
}
