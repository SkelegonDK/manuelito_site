// src/utils/theme.ts

/**
 * Gets the current theme preference from localStorage or system preference.
 * @returns {'light' | 'dark'} The current theme.
 */
export function getThemePreference(): 'light' | 'dark' {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as 'light' | 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies the given theme to the document.
 * @param theme The theme to apply ('light' or 'dark').
 */
export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;

  // For backward compatibility with existing CSS that might use .dark class
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (document.body) {
      document.body.classList.add('dark'); // Also apply to body for consistency
    }
  } else {
    document.documentElement.classList.remove('dark');
    if (document.body) {
      document.body.classList.remove('dark');
    }
  }
}

/**
 * Toggles the theme between 'light' and 'dark' and saves it to localStorage.
 */
export function toggleTheme() {
  const currentTheme = getThemePreference();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}

/**
 * Initializes the theme on page load.
 * Sets up an observer to persist theme changes made by other means (e.g., dev tools).
 */
export function initTheme() {
  const initialTheme = getThemePreference();
  applyTheme(initialTheme);

  // Observe changes to the 'class' attribute on the html element
  // This ensures that if the theme is changed by other means (e.g., dev tools),
  // it's persisted in localStorage.
  if (typeof localStorage !== 'undefined') {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
}
