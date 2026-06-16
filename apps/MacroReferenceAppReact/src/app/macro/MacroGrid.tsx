/**
 * Macro Reference — reusable AG Grid wrapper.
 *
 * Framework-agnostic in intent (mirrors the Angular MacroGrid): renders a
 * compact toolbar strip directly above the grid (the same near-the-grid spot as
 * AG Grid's row-group panel) carrying the GENERIC grid controls — quick-filter
 * search, density, and a Columns side-bar toggle. Each instance owns its own
 * state, so every blotter gets these controls independently.
 *
 * Domain-specific controls (asset-class filter, New Order, …) stay on the host
 * view, outside the wrapper.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  ColDef,
  GetRowIdFunc,
  GridApi,
  GridOptions,
  GridReadyEvent,
  Theme,
} from 'ag-grid-community';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { buildAgGridTheme, type GridDensity } from './ag-grid-theme';
import { useIsDark } from './use-is-dark';

type Density = 'Compact' | 'Normal' | 'Comfortable';

const DENSITY_OPTIONS: Density[] = ['Compact', 'Normal', 'Comfortable'];

function densityKey(d: Density): GridDensity {
  if (d === 'Compact') return 'tight';
  if (d === 'Comfortable') return 'cozy';
  return 'normal';
}

export interface MacroGridProps {
  rowData: unknown[];
  columnDefs?: ColDef[];
  getRowId?: GetRowIdFunc;
  /**
   * Either a ready-made options object (used as-is; the wrapper supplies the
   * master theme via the grid's `theme` prop) or a function that receives the
   * wrapper's computed Theme and returns options — the latter is how a
   * master/detail grid gets a themed detail grid (e.g. buildOrderGridOptions).
   */
  gridOptions?: GridOptions | ((theme: Theme) => GridOptions);
  title?: string;
  searchPlaceholder?: string;
}

export function MacroGrid({
  rowData,
  columnDefs,
  getRowId,
  gridOptions,
  title,
  searchPlaceholder = 'Filter…',
}: MacroGridProps) {
  const isDark = useIsDark();
  const [density, setDensity] = useState<Density>('Compact');
  const [search, setSearch] = useState('');

  const gridApiRef = useRef<GridApi | null>(null);

  // Theme follows color scheme + density (density resizes the grid via params).
  const theme = useMemo(
    () => buildAgGridTheme(isDark, densityKey(density)),
    [isDark, density],
  );

  const resolved = useMemo(
    () => (typeof gridOptions === 'function' ? gridOptions(theme) : gridOptions ?? {}),
    [gridOptions, theme],
  );

  // Make the generic controls work on every grid: ensure a (hidden) side bar so
  // the Columns button has something to show, and sensible default columns.
  const merged = useMemo<GridOptions>(() => {
    const o: GridOptions = { ...resolved };
    if (!o.sideBar) o.sideBar = { toolPanels: ['columns', 'filters'], hiddenByDefault: true };
    if (!o.defaultColDef)
      o.defaultColDef = { sortable: true, filter: true, resizable: true, flex: 1, minWidth: 90 };
    return o;
  }, [resolved]);

  const onGridReady = useCallback((e: GridReadyEvent) => {
    gridApiRef.current = e.api;
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    gridApiRef.current?.setGridOption('quickFilterText', value);
  }, []);

  // The theme param drives row sizing; re-measure rows when density changes.
  useEffect(() => {
    gridApiRef.current?.resetRowHeights();
  }, [density]);

  const toggleColumns = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return;
    api.setSideBarVisible(!api.isSideBarVisible());
  }, []);

  return (
    <div className="macro-grid">
      <div className="macro-grid-toolbar">
        {title && <span className="macro-grid-title">{title}</span>}
        <div className="macro-grid-toolbar-controls">
          <InputText
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="macro-grid-search"
          />
          <Dropdown
            value={density}
            options={DENSITY_OPTIONS}
            onChange={(e) => setDensity(e.value as Density)}
          />
          <Button label="Columns" icon="pi pi-table" outlined onClick={toggleColumns} />
        </div>
      </div>
      <div className="macro-grid-area">
        <AgGridReact
          theme={theme}
          gridOptions={merged}
          rowData={rowData}
          getRowId={getRowId}
          onGridReady={onGridReady}
          {...(columnDefs ? { columnDefs } : {})}
        />
      </div>
    </div>
  );
}

export default MacroGrid;
