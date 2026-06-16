/**
 * Macro Reference — useIsDark hook.
 *
 * Reads the dark/light state the same way the Rates Blotter does: seeded from
 * the `.dark` class on <html>, then kept in sync via a MutationObserver so any
 * consumer (grids, charts) re-themes when the header theme toggle fires.
 */
import { useEffect, useState } from 'react';

export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
