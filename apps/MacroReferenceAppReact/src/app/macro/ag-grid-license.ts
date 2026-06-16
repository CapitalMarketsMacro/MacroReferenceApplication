/**
 * AG Grid Enterprise license key.
 *
 * Empty by default → AG Grid runs in evaluation mode (all enterprise features
 * work; a small watermark + console notice appear). To remove the watermark,
 * set VITE_AG_GRID_LICENSE in a (git-ignored) .env file — no code change needed.
 */
export const AG_GRID_LICENSE: string =
  (import.meta.env.VITE_AG_GRID_LICENSE as string | undefined) ?? '';
