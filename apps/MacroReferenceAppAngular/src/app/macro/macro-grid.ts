import {
  Component,
  Input,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  GetRowIdFunc,
  GridApi,
  GridOptions,
  GridReadyEvent,
  Theme,
} from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { buildAgGridTheme, type GridDensity } from './ag-grid-theme';
import { ThemeService } from '../theme.service';

type Density = 'Compact' | 'Normal' | 'Comfortable';

/** Maps the density label to the AG Grid theme density key. */
function densityKey(d: Density): GridDensity {
  switch (d) {
    case 'Compact':
      return 'tight';
    case 'Comfortable':
      return 'cozy';
    default:
      return 'normal';
  }
}

/**
 * Reusable AG Grid wrapper. Renders a compact toolbar strip (generic quick
 * filter + density + Columns) directly above the grid, owning theme/density
 * state per instance so every blotter gets the same controls.
 */
@Component({
  selector: 'app-macro-grid',
  standalone: true,
  imports: [FormsModule, AgGridAngular, InputTextModule, SelectModule, ButtonModule],
  templateUrl: './macro-grid.html',
  styleUrl: './macro-grid.css',
})
export class MacroGrid {
  private readonly themeSvc = inject(ThemeService);

  @Input({ required: true }) rowData: unknown[] = [];
  @Input() columnDefs?: ColDef[];
  @Input() getRowId?: GetRowIdFunc;
  @Input() gridOptions?: GridOptions | ((theme: Theme) => GridOptions);
  @Input() title?: string;
  @Input() searchPlaceholder = 'Filter…';

  // ----- Toolbar state (owned per instance) -----
  readonly densityOptions: Density[] = ['Compact', 'Normal', 'Comfortable'];
  readonly density = signal<Density>('Compact');
  readonly search = signal('');

  /** ngModel bridge for the density Select. */
  get densityModel(): Density {
    return this.density();
  }
  set densityModel(v: Density) {
    this.density.set(v);
  }

  /** Theme recomputes whenever the dark flag or density changes. */
  readonly theme = computed<Theme>(() =>
    buildAgGridTheme(this.themeSvc.isDark(), densityKey(this.density())),
  );

  /**
   * Resolve the gridOptions input (function -> call with theme; object -> use
   * as-is), then ensure a side bar (so Columns works) and a defaultColDef.
   */
  readonly mergedOptions = computed<GridOptions>(() => {
    const input = this.gridOptions;
    const resolved =
      typeof input === 'function' ? input(this.theme()) : (input ?? {});
    const merged: GridOptions = { ...resolved };
    if (!merged.sideBar) {
      merged.sideBar = { toolPanels: ['columns', 'filters'], hiddenByDefault: true };
    }
    if (!merged.defaultColDef) {
      merged.defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 90,
      };
    }
    return merged;
  });

  private gridApi?: GridApi;

  constructor() {
    // The theme param drives row sizing; re-measure rows when density changes.
    effect(() => {
      this.density();
      const api = this.gridApi;
      if (api) setTimeout(() => api.resetRowHeights(), 0);
    });
  }

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  toggleColumns(): void {
    if (!this.gridApi) return;
    this.gridApi.setSideBarVisible(!this.gridApi.isSideBarVisible());
  }
}
