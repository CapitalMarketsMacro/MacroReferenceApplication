/**
 * Macro Reference — Trade Blotter domain model + mock data + AG Grid columns.
 *
 * Framework-agnostic: identical in the Angular and React apps. A simple flat
 * blotter of executed (done) trades.
 */
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';

export type TradeStatus = 'Settled' | 'Pending' | 'Failed';

export interface Trade {
  id: string;
  time: string;
  instrument: string;
  ccy: string;
  side: 'Buy' | 'Sell';
  qty: number;
  price: number;
  venue: string;
  counterparty: string;
  status: TradeStatus;
}

export function createTrades(): Trade[] {
  return [
    { id: 'T-50218', time: '14:22:41', instrument: 'USD 10Y SOFR', ccy: 'USD', side: 'Buy', qty: 40, price: 4.238, venue: 'TradeWeb', counterparty: 'JPM', status: 'Settled' },
    { id: 'T-50217', time: '14:22:12', instrument: 'DBR 2.1 02/34', ccy: 'EUR', side: 'Sell', qty: 20, price: 99.455, venue: 'BrokerTec', counterparty: 'DBK', status: 'Settled' },
    { id: 'T-50216', time: '14:21:58', instrument: 'DBR 2.1 02/34', ccy: 'EUR', side: 'Sell', qty: 30, price: 99.45, venue: 'MTS', counterparty: 'BNP', status: 'Settled' },
    { id: 'T-50215', time: '14:19:20', instrument: 'GBP 5Y SONIA', ccy: 'GBP', side: 'Sell', qty: 10, price: 4.0205, venue: 'BBG', counterparty: 'BARC', status: 'Pending' },
    { id: 'T-50214', time: '14:12:02', instrument: 'EUR 10Y ESTR', ccy: 'EUR', side: 'Buy', qty: 25, price: 2.3425, venue: 'MarketAxess', counterparty: 'SG', status: 'Settled' },
    { id: 'T-50213', time: '14:11:18', instrument: 'EUR 10Y ESTR', ccy: 'EUR', side: 'Buy', qty: 35, price: 2.3415, venue: 'TradeWeb', counterparty: 'GS', status: 'Settled' },
    { id: 'T-50212', time: '14:08:55', instrument: 'UST 3.875 08/34', ccy: 'USD', side: 'Buy', qty: 100, price: 98.18, venue: 'BrokerTec', counterparty: 'CITI', status: 'Settled' },
    { id: 'T-50211', time: '14:05:02', instrument: 'USD 30Y SOFR', ccy: 'USD', side: 'Sell', qty: 15, price: 4.452, venue: 'TradeWeb', counterparty: 'MS', status: 'Settled' },
    { id: 'T-50210', time: '13:58:31', instrument: 'GBP 10Y SONIA', ccy: 'GBP', side: 'Buy', qty: 20, price: 4.511, venue: 'BBG', counterparty: 'HSBC', status: 'Settled' },
    { id: 'T-50209', time: '13:52:14', instrument: 'TY Dec-26', ccy: 'USD', side: 'Buy', qty: 50, price: 110.18, venue: 'CME', counterparty: 'XCME', status: 'Settled' },
    { id: 'T-50208', time: '13:47:09', instrument: 'RX Dec-26', ccy: 'EUR', side: 'Sell', qty: 40, price: 132.85, venue: 'Eurex', counterparty: 'XEUR', status: 'Settled' },
    { id: 'T-50207', time: '13:41:33', instrument: 'USD 5Y SOFR', ccy: 'USD', side: 'Buy', qty: 60, price: 4.109, venue: 'TradeWeb', counterparty: 'JPM', status: 'Settled' },
    { id: 'T-50206', time: '13:36:20', instrument: 'EUR 5Y ESTR', ccy: 'EUR', side: 'Sell', qty: 30, price: 2.184, venue: 'MarketAxess', counterparty: 'BNP', status: 'Failed' },
    { id: 'T-50205', time: '13:30:01', instrument: 'USD 2Y SOFR', ccy: 'USD', side: 'Buy', qty: 80, price: 4.183, venue: 'BBG', counterparty: 'GS', status: 'Settled' },
    { id: 'T-50204', time: '13:22:47', instrument: 'UKT 4.625 10/33', ccy: 'GBP', side: 'Buy', qty: 25, price: 102.35, venue: 'BrokerTec', counterparty: 'BARC', status: 'Settled' },
    { id: 'T-50203', time: '13:15:12', instrument: 'USD Repo O/N', ccy: 'USD', side: 'Sell', qty: 250, price: 5.32, venue: 'BrokerTec', counterparty: 'CITI', status: 'Settled' },
  ];
}

const mmFmt = (p: ValueFormatterParams) => (p.value == null ? '' : `${p.value} MM`);

const sideStyle = (p: { value?: unknown }) =>
  p.value === 'Buy'
    ? { color: 'var(--mkt-up)' }
    : p.value === 'Sell'
      ? { color: 'var(--mkt-down)' }
      : null;

const statusStyle = (p: { value?: unknown }) => {
  switch (p.value) {
    case 'Settled':
      return { color: 'var(--mkt-up)' };
    case 'Pending':
      return { color: 'var(--status-warn)' };
    case 'Failed':
      return { color: 'var(--mkt-down)' };
    default:
      return null;
  }
};

export const TRADE_COLUMNS: ColDef<Trade>[] = [
  { field: 'time', headerName: 'Time', width: 100, pinned: 'left' },
  { field: 'id', headerName: 'Trade ID', width: 110 },
  { field: 'instrument', headerName: 'Instrument', minWidth: 170 },
  { field: 'side', headerName: 'Side', width: 80, cellStyle: sideStyle },
  { field: 'qty', headerName: 'Qty', width: 96, type: 'rightAligned', valueFormatter: mmFmt },
  {
    field: 'price', headerName: 'Price', width: 100, type: 'rightAligned',
    valueFormatter: (p) => (p.value == null ? '' : Number(p.value).toFixed(4)),
  },
  { field: 'venue', headerName: 'Venue', width: 130 },
  { field: 'counterparty', headerName: 'Cpty', width: 96 },
  { field: 'status', headerName: 'Status', width: 110, cellStyle: statusStyle },
];
