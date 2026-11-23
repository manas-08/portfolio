import type {WordOfTheDay} from '@/lib/github';
import {ThemeToggle} from './theme';

const NAV = [
  {href: '#experiments', label: 'Experiments'},
  {href: '#methods', label: 'Methods'},
  {href: '#appointments', label: 'Appointments'},
  {href: '#conclusion', label: 'Contact'},
];

/** Journal-style running header with the live word of the day. */
export function Masthead({word, version}: {
  word: WordOfTheDay | null;
  version: string;
}) {
  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule
      bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1400px] items-center
        justify-between gap-4 px-5 font-mono text-[11px] sm:px-8">
        <a href="#" className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-display text-lg italic leading-none">
            M. Shende
          </span>
          <span className="hidden text-muted sm:inline">v{version}</span>
        </a>

        {word && (
          <a
            href="https://manas-08.github.io/word_of_the_day/"
            target="_blank"
            rel="noreferrer"
            title={word.meaning ?? 'Fetched daily by a GitHub Action'}
            className="hidden min-w-0 items-baseline gap-2 truncate text-muted
              transition-colors hover:text-ink md:flex"
          >
            <span className="uppercase tracking-wider">word of the day</span>
            <span className="font-display text-base italic text-ink">
              {word.word}
            </span>
            {word.meaning && (
              <span className="truncate">: {word.meaning}</span>
            )}
          </a>
        )}

        <div className="flex items-center gap-5">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex gap-5 uppercase tracking-wider text-muted">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors
                    hover:text-ink">{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
