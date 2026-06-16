/**
 * Macro Reference — shared rates-blotter domain model + mock market data.
 *
 * Framework-agnostic: this exact file is used by both the Angular and React
 * reference apps. Seed instruments mirror the Macro design-system rates-blotter
 * UI kit (MacroThemeCondensed/ui_kits/rates-blotter).
 */

export type AssetClass = 'IRS' | 'Gov' | 'Repo' | 'FX' | 'MM' | 'Fut';
export type InstrumentStatus = 'live' | 'stale' | 'halted';
export type Ccy = 'USD' | 'EUR' | 'GBP';

export interface Instrument {
  id: string;
  name: string;
  tenor: string;
  ccy: Ccy;
  ac: AssetClass;
  bid: number;
  ask: number;
  last: number;
  chg: number;
  venue: string;
  status: InstrumentStatus;
}

/** Toolbar filter chips. */
export const ASSET_CLASS_FILTERS = ['ALL', 'IRS', 'Gov', 'Repo', 'FX', 'MM', 'Fut'] as const;
export type AssetClassFilter = (typeof ASSET_CLASS_FILTERS)[number];

type Seed = Pick<Instrument, 'id' | 'name' | 'tenor' | 'ccy' | 'ac' | 'bid' | 'ask' | 'venue'>;

const SEED: Seed[] = [
  { id: 'USD-2Y', name: 'USD 2Y SOFR', tenor: '2Y', ccy: 'USD', ac: 'IRS', bid: 4.182, ask: 4.184, venue: 'TradeWeb' },
  { id: 'USD-5Y', name: 'USD 5Y SOFR', tenor: '5Y', ccy: 'USD', ac: 'IRS', bid: 4.109, ask: 4.112, venue: 'TradeWeb' },
  { id: 'USD-10Y', name: 'USD 10Y SOFR', tenor: '10Y', ccy: 'USD', ac: 'IRS', bid: 4.2375, ask: 4.2395, venue: 'BBG' },
  { id: 'USD-30Y', name: 'USD 30Y SOFR', tenor: '30Y', ccy: 'USD', ac: 'IRS', bid: 4.451, ask: 4.454, venue: 'TradeWeb' },
  { id: 'EUR-2Y', name: 'EUR 2Y ESTR', tenor: '2Y', ccy: 'EUR', ac: 'IRS', bid: 2.421, ask: 2.423, venue: 'MarketAxess' },
  { id: 'EUR-5Y', name: 'EUR 5Y ESTR', tenor: '5Y', ccy: 'EUR', ac: 'IRS', bid: 2.183, ask: 2.185, venue: 'TradeWeb' },
  { id: 'EUR-10Y', name: 'EUR 10Y ESTR', tenor: '10Y', ccy: 'EUR', ac: 'IRS', bid: 2.341, ask: 2.343, venue: 'TradeWeb' },
  { id: 'GBP-5Y', name: 'GBP 5Y SONIA', tenor: '5Y', ccy: 'GBP', ac: 'IRS', bid: 4.018, ask: 4.0205, venue: 'BBG' },
  { id: 'GBP-10Y', name: 'GBP 10Y SONIA', tenor: '10Y', ccy: 'GBP', ac: 'IRS', bid: 4.511, ask: 4.513, venue: 'BBG' },
  { id: 'DBR-34', name: 'DBR 2.1 02/34', tenor: '10Y', ccy: 'EUR', ac: 'Gov', bid: 99.42, ask: 99.46, venue: 'MTS' },
  { id: 'UST-34', name: 'UST 3.875 08/34', tenor: '10Y', ccy: 'USD', ac: 'Gov', bid: 98.18, ask: 98.22, venue: 'BrokerTec' },
  { id: 'UKT-33', name: 'UKT 4.625 10/33', tenor: '10Y', ccy: 'GBP', ac: 'Gov', bid: 102.35, ask: 102.4, venue: 'BrokerTec' },
  { id: 'RP-USD', name: 'USD Repo O/N', tenor: 'O/N', ccy: 'USD', ac: 'Repo', bid: 5.32, ask: 5.325, venue: 'BrokerTec' },
  { id: 'FXSW-EUR', name: 'EUR/USD 3M FWD', tenor: '3M', ccy: 'EUR', ac: 'FX', bid: 0.00234, ask: 0.00238, venue: '360T' },
  { id: 'FXSW-GBP', name: 'GBP/USD 3M FWD', tenor: '3M', ccy: 'GBP', ac: 'FX', bid: 0.00189, ask: 0.00192, venue: '360T' },
  { id: 'MM-USD', name: 'USD 3M Libor', tenor: '3M', ccy: 'USD', ac: 'MM', bid: 5.385, ask: 5.387, venue: 'BBG' },
  { id: 'FUT-TY', name: 'TY Dec-26', tenor: 'FUT', ccy: 'USD', ac: 'Fut', bid: 110.18, ask: 110.19, venue: 'CME' },
  { id: 'FUT-RX', name: 'RX Dec-26', tenor: 'FUT', ccy: 'EUR', ac: 'Fut', bid: 132.85, ask: 132.86, venue: 'Eurex' },
];

/** Price decimals appropriate to each asset class. */
export function decimalsFor(ac: AssetClass): number {
  if (ac === 'Gov' || ac === 'Fut') return 2;
  if (ac === 'FX') return 5;
  return 4;
}

function stepFor(ac: AssetClass): number {
  if (ac === 'Gov' || ac === 'Fut') return 0.01;
  if (ac === 'FX') return 0.000005;
  return 0.0005;
}

/** Build the initial row set (with derived last/chg/status). */
export function createInstruments(): Instrument[] {
  return SEED.map((i) => ({ ...i, last: (i.bid + i.ask) / 2, chg: 0, status: 'live' as const }));
}

/**
 * Produce the next market-data frame: returns a NEW array with a few randomly
 * chosen prices nudged. Changed rows are new object references so AG Grid's
 * immutable-data diff (via getRowId) flashes exactly the cells that moved.
 */
export function tickInstruments(rows: Instrument[]): Instrument[] {
  if (rows.length === 0) return rows;
  const hits = new Set<number>();
  const n = 3 + Math.floor(Math.random() * 4);
  while (hits.size < Math.min(n, rows.length)) {
    hits.add(Math.floor(Math.random() * rows.length));
  }
  return rows.map((r, i) => {
    if (!hits.has(i)) return r;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const delta = dir * stepFor(r.ac) * (1 + Math.floor(Math.random() * 3));
    let { bid, ask } = r;
    if (Math.random() > 0.5) bid = Math.max(0, bid + delta);
    else ask = Math.max(0, ask + delta);
    if (ask < bid) [bid, ask] = [ask, bid];
    return { ...r, bid, ask, last: (bid + ask) / 2, chg: r.chg + delta };
  });
}
