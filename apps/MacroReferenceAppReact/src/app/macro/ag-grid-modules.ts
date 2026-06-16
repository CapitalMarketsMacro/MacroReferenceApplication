/**
 * Macro Reference — AG Grid Enterprise module + license registration.
 *
 * Import this module once, before any grid is created. Registers the full
 * Community + Enterprise feature set and Integrated Charts. The license is
 * sourced from ./ag-grid-license (empty by default → evaluation mode, which
 * enables every enterprise feature with a small watermark).
 */
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule, IntegratedChartsModule, LicenseManager } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { AG_GRID_LICENSE } from './ag-grid-license';

ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);

if (AG_GRID_LICENSE) {
  LicenseManager.setLicenseKey(AG_GRID_LICENSE);
}
