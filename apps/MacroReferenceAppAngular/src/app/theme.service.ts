import { Injectable, signal } from '@angular/core';

/**
 * Shared dark/light theme state. Default dark. Applies the framework-agnostic
 * theme contract: `.dark` on <html> and `.theme-light` on <body>. The AG Grid
 * theme binding in the blotter reads `isDark` and recomputes on toggle.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(true);

  constructor() {
    // Detect the initial scheme from the .dark class set in index.html.
    this.isDark.set(document.documentElement.classList.contains('dark'));
    this.apply();
  }

  toggle(): void {
    this.isDark.update((v) => !v);
    this.apply();
  }

  private apply(): void {
    const dark = this.isDark();
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('theme-light', !dark);
  }
}
