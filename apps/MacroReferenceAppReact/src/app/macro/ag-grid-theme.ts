/**
 * Macro Reference — AG Grid theme (new Theming API).
 *
 * Framework-agnostic: identical in the Angular and React apps. Mirrors the
 * Macro E-Trading tokens (MacroThemeCondensed) — Quartz base + Material icons,
 * IBM Plex Mono cells / Roboto headers, cerulean accents on a slate dark scheme.
 *
 * Density is applied as theme PARAMS (rowHeight/headerHeight/fontSize). With the
 * Theming API the legacy `.ag-theme-quartz { --ag-row-height }` overrides do
 * nothing, so resizing must flow through the theme object.
 */
import {
  type Theme,
  colorSchemeDarkBlue,
  colorSchemeLight,
  iconSetMaterial,
  themeQuartz,
} from 'ag-grid-community';

export type GridDensity = 'tight' | 'normal' | 'cozy';

/** Macro E-Trading font + border params (density-independent). */
export const AG_GRID_FONTS = {
  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
  headerFontFamily: "'Roboto', system-ui, sans-serif",
  headerFontSize: 10,
  headerFontWeight: 500,
  cellHorizontalPadding: 10,
  wrapperBorderRadius: 0,
  rowBorder: { style: 'solid' as const, width: 1, color: '#1c2029' },
  columnBorder: false,
} as const;

/** Row/header/font sizing per density — the Theming-API way to resize the grid. */
const DENSITY_PARAMS: Record<
  GridDensity,
  { rowHeight: number; headerHeight: number; fontSize: number; listItemHeight: number }
> = {
  tight: { rowHeight: 20, headerHeight: 24, fontSize: 11, listItemHeight: 20 },
  normal: { rowHeight: 22, headerHeight: 28, fontSize: 12, listItemHeight: 22 },
  cozy: { rowHeight: 32, headerHeight: 36, fontSize: 13, listItemHeight: 32 },
};

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

/** Build the Macro AG Grid theme for the given color scheme + density. */
export function buildAgGridTheme(isDark: boolean, density: GridDensity = 'normal'): Theme {
  const base = themeQuartz
    .withPart(iconSetMaterial)
    .withPart(isDark ? colorSchemeDarkBlue : colorSchemeLight)
    .withParams(AG_GRID_FONTS)
    .withParams(DENSITY_PARAMS[density]);

  return isDark ? base.withParams(DARK_TOKENS) : base;
}
