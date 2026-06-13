/** Cores alinhadas ao tema `koala` da documentação (libs/doc/site). */
export const scalarThemeOptions = {
  theme: 'none' as const,
  darkMode: true,
  forceDarkModeState: 'dark' as const,
  hideDarkModeToggle: true,
  customCss: `
    .dark-mode {
      --scalar-color-1: oklch(90% 0 0);
      --scalar-color-2: oklch(70% 0 0);
      --scalar-color-3: oklch(55% 0 0);
      --scalar-color-accent: oklch(58% 0.233 277.117);
      --scalar-background-1: oklch(13% 0 0);
      --scalar-background-2: oklch(19% 0 0);
      --scalar-background-3: oklch(22% 0 0);
      --scalar-background-accent: oklch(58% 0.233 277.117 / 0.12);
      --scalar-border-color: oklch(22% 0 0);
    }
  `.trim(),
};
