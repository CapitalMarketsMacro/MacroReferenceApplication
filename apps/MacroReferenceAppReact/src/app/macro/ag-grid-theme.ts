/**
 * Macro Reference — AG Grid theme (new Theming API).
 *
 * Framework-agnostic: identical in the Angular and React apps. Mirrors the
 * Macro E-Trading tokens (MacroThemeCondensed) — Quartz base + Material icons,
 * IBM Plex Mono cells / Roboto headers, cerulean accents on a slate dark scheme.
 */
import {
  type Theme,
  colorSchemeDarkBlue,
  colorSchemeLight,
  iconSetMaterial,
  themeQuartz,
} from 'ag-grid-community';

/** Macro E-Trading font + density params (applied in both light and dark). */
export const AG_GRID_FONTS = {
  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
  headerFontFamily: "'Roboto', system-ui, sans-serif",
  headerFontSize: 10,
  headerFontWeight: 500,
  fontSize: 12,
  cellHorizontalPadding: 10,
  rowHeight: 22,
  headerHeight: 28,
  listItemHeight: 22,
  wrapperBorderRadius: 0,
  rowBorder: { style: 'solid' as const, width: 1, color: '#1c2029' },
  columnBorder: false,
} as const;

/** Macro dark palette — mirrors colors_and_type.css (cerulean #2aa6e6 on slate). */
const DARK_TOKENS = {
  backgroundColor: '#12141a',
  foregroundColor: '#e6e8ec',
  chromeBackgroundColor: '#181b22',
  headerBackgroundColor: '#181b22',
  headerTextColor: '#6f7687',
  borderColor: '#1c2029',
  oddRowBackgroundColor: '#181b22',
  rowHoverColor: '#22262f',
  selectedRowBackgroundColor: '#1a2a3f',
  accentColor: '#2aa6e6',
  focusShadow: '0 0 0 2px #12141a, 0 0 0 4px #2aa6e6',
  rangeSelectionBackgroundColor: 'rgba(42,166,230,0.14)',
  rangeSelectionBorderColor: '#2aa6e6',
  inputBackgroundColor: '#12141a',
  inputBorder: { style: 'solid' as const, width: 1, color: '#363c48' },
  inputFocusBorder: { style: 'solid' as const, width: 1, color: '#2aa6e6' },
  menuBackgroundColor: '#1e222a',
  menuBorder: { style: 'solid' as const, width: 1, color: '#363c48' },
  menuShadow: '0 4px 16px rgba(0,0,0,0.40)',
};

/** Build the Macro AG Grid theme for the given color scheme. */
export function buildAgGridTheme(isDark: boolean): Theme {
  const base = themeQuartz
    .withPart(iconSetMaterial)
    .withPart(isDark ? colorSchemeDarkBlue : colorSchemeLight)
    .withParams(AG_GRID_FONTS);

  return isDark ? base.withParams(DARK_TOKENS) : base;
}
