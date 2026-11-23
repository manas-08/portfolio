'use client';

import {ThemeProvider as NextThemesProvider, useTheme} from 'next-themes';
import {type ReactNode, useSyncExternalStore} from 'react';

/** Class-based theme provider; "ink" is light mode and "chalk" is dark. */
export function ThemeProvider({children}: {children: ReactNode}) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem
      disableTransitionOnChange={false}>
      {children}
    </NextThemesProvider>
  );
}

const noopSubscribe = () => () => {};

/** Two-state switch styled like a typesetting option: ink / chalk. */
export function ThemeToggle() {
  const {resolvedTheme, setTheme} = useTheme();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="group flex items-center gap-2 font-mono text-[11px] uppercase
        tracking-wider text-muted transition-colors hover:text-ink"
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
    >
      <span className={dark ? '' : 'text-ink'}>ink</span>
      <span className="relative inline-flex h-4 w-8 items-center rounded-full
        border border-rule">
        <span
          className={`absolute size-2.5 rounded-full bg-accent transition-all
            duration-500 ${dark ? 'left-[18px]' : 'left-[3px]'}`}
        />
      </span>
      <span className={dark ? 'text-ink' : ''}>chalk</span>
    </button>
  );
}
