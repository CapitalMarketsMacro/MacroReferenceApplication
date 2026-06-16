/**
 * Macro Reference — Analytics charts (AG Charts).
 *
 * Framework-agnostic: identical in the Angular and React apps. Builds a Macro
 * dark/light chart theme + the chart option objects consumed by the
 * ag-charts-angular / ag-charts-react <AgCharts> components.
 */
import type { AgChartOptions, AgChartTheme } from 'ag-charts-community';

const SANS = "'Roboto', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

const MACRO_FILLS = ['#2aa6e6', '#34d97a', '#ff6b64', '#5b8def', '#a88cf2', '#f5c13a'];

/** Macro-branded AG Charts theme (slate surface, cerulean-led palette). */
export function macroChartTheme(isDark: boolean): AgChartTheme {
  const fg1 = isDark ? '#e6e8ec' : '#12141a';
  const fg2 = isDark ? '#a8afbd' : '#3b414c';
  const fg3 = isDark ? '#6f7687' : '#7b8392';
  const grid = isDark ? '#1c2029' : '#e1e4ea';
  const line = isDark ? '#2a2f39' : '#cdd2db';
  const bg = isDark ? '#181b22' : '#ffffff';
  return {
    baseTheme: isDark ? 'ag-default-dark' : 'ag-default',
    palette: { fills: MACRO_FILLS, strokes: MACRO_FILLS },
    overrides: {
      common: {
        background: { fill: bg },
        title: { color: fg1, fontFamily: SANS, fontSize: 14, fontWeight: 600 },
        subtitle: { color: fg3, fontFamily: SANS, fontSize: 11 },
        legend: { item: { label: { color: fg2, fontFamily: SANS, fontSize: 11 } } },
        axes: {
          number: {
            label: { color: fg3, fontFamily: MONO, fontSize: 10 },
            title: { color: fg3, fontFamily: SANS, fontSize: 11 },
            line: { stroke: line },
            gridLine: { style: [{ stroke: grid }] },
          },
          category: {
            label: { color: fg3, fontFamily: MONO, fontSize: 10 },
            title: { color: fg3, fontFamily: SANS, fontSize: 11 },
            line: { stroke: line },
          },
        },
      },
    },
  };
}

const CURVE_DATA = [
  { tenor: '2Y', usd: 4.18, eur: 2.42, gbp: 4.21 },
  { tenor: '5Y', usd: 4.11, eur: 2.18, gbp: 4.02 },
  { tenor: '10Y', usd: 4.24, eur: 2.34, gbp: 4.51 },
  { tenor: '30Y', usd: 4.45, eur: 2.78, gbp: 4.62 },
];

const NOTIONAL_DATA = [
  { ac: 'IRS', notional: 2.45 },
  { ac: 'Gov', notional: 1.82 },
  { ac: 'Repo', notional: 3.1 },
  { ac: 'FX', notional: 0.92 },
  { ac: 'MM', notional: 1.35 },
  { ac: 'Fut', notional: 0.74 },
];

const VENUE_DATA = [
  { venue: 'TradeWeb', volume: 38 },
  { venue: 'BBG', volume: 24 },
  { venue: 'BrokerTec', volume: 18 },
  { venue: 'MarketAxess', volume: 11 },
  { venue: 'MTS', volume: 6 },
  { venue: 'Other', volume: 3 },
];

/** Multi-series yield curve (line). */
export function yieldCurveOptions(isDark: boolean): AgChartOptions {
  // AgChartOptions is an undiscriminated union, so build untyped + assert.
  const options = {
    theme: macroChartTheme(isDark),
    title: { text: 'Government & Swap Curves' },
    subtitle: { text: 'Mid rate by tenor' },
    data: CURVE_DATA,
    series: [
      { type: 'line', xKey: 'tenor', yKey: 'usd', yName: 'USD SOFR', marker: { enabled: true } },
      { type: 'line', xKey: 'tenor', yKey: 'eur', yName: 'EUR ESTR', marker: { enabled: true } },
      { type: 'line', xKey: 'tenor', yKey: 'gbp', yName: 'GBP SONIA', marker: { enabled: true } },
    ],
    axes: [
      { type: 'category', position: 'bottom', title: { text: 'Tenor' } },
      { type: 'number', position: 'left', title: { text: 'Rate (%)' } },
    ],
  };
  return options as unknown as AgChartOptions;
}

/** Notional traded by asset class (column). */
export function notionalByClassOptions(isDark: boolean): AgChartOptions {
  // AgChartOptions is an undiscriminated union, so build untyped + assert.
  const options = {
    theme: macroChartTheme(isDark),
    title: { text: 'Notional by Asset Class' },
    subtitle: { text: '$ billions, today' },
    data: NOTIONAL_DATA,
    series: [{ type: 'bar', xKey: 'ac', yKey: 'notional', yName: 'Notional ($BN)' }],
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left', title: { text: '$BN' } },
    ],
  };
  return options as unknown as AgChartOptions;
}

/** Share of volume by venue (donut). */
export function volumeByVenueOptions(isDark: boolean): AgChartOptions {
  // AgChartOptions is an undiscriminated union, so build untyped + assert.
  const options = {
    theme: macroChartTheme(isDark),
    title: { text: 'Volume by Venue' },
    subtitle: { text: 'Share of notional' },
    data: VENUE_DATA,
    series: [
      {
        type: 'donut',
        angleKey: 'volume',
        calloutLabelKey: 'venue',
        legendItemKey: 'venue',
        innerRadiusRatio: 0.6,
      },
    ],
  };
  return options as unknown as AgChartOptions;
}
