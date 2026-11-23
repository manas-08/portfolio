/**
 * @fileoverview Typographic primitives that make the page read like a paper:
 * numbered sections, citations with hover previews, and margin notes.
 */

import type {ReactNode} from 'react';

export interface Reference {
  n: number;
  title: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number | null;
  updatedAt: string | null;
}

export function formatMonth(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** An inline [n] citation that previews its reference on hover or focus. */
export function Cite({reference}: {reference: Reference}) {
  const updated = formatMonth(reference.updatedAt);
  return (
    <span className="group relative inline-block">
      <a
        href={`#ref-${reference.n}`}
        className="font-mono text-[0.8em] text-blue hover:text-accent"
        aria-label={`Reference ${reference.n}: ${reference.title}`}
      >
        [{reference.n}]
      </a>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2
          z-40 mb-2 w-[min(18rem,80vw)] -translate-x-1/2 translate-y-1 border border-ink
          bg-paper p-3 text-left text-sm leading-snug opacity-0 shadow-[4px_4px_0_var(--ink)]
          transition-all duration-200 group-focus-within:visible
          group-focus-within:translate-y-0 group-focus-within:opacity-100
          group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
      >
        <span className="block font-mono text-[10px] uppercase tracking-wider
          text-muted">
          [{reference.n}] github.com/manas-08
        </span>
        <span className="mt-1 block font-display text-lg leading-tight">
          {reference.title}
        </span>
        {reference.description && (
          <span className="mt-1 line-clamp-3 block text-muted">
            {reference.description}
          </span>
        )}
        <span className="mt-2 flex gap-3 font-mono text-[10px] uppercase
          tracking-wider text-muted">
          {reference.language && <span>{reference.language}</span>}
          {reference.stars !== null && <span>★ {reference.stars}</span>}
          {updated && <span>pushed {updated}</span>}
        </span>
      </span>
    </span>
  );
}

interface SectionProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}

/** A numbered section with a hairline rule, like a LaTeX \section. */
export function Section({id, number, title, children}: SectionProps) {
  return (
    <section id={id} data-section className="scroll-mt-24 pt-20 sm:pt-28">
      <header className="mb-8 flex items-baseline gap-4 border-b border-rule
        pb-3">
        <span className="font-mono text-sm text-accent">{number}</span>
        <h2 className="font-display text-4xl leading-none sm:text-5xl">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export function Subsection({id, number, title, aside}: {
  id?: string;
  number: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <h3 id={id} className="mb-4 flex flex-wrap items-baseline gap-x-3
      gap-y-1 scroll-mt-24">
      <span className="font-mono text-xs text-accent">{number}</span>
      <span className="font-display text-3xl leading-tight">{title}</span>
      {aside && (
        <span className="font-mono text-[11px] uppercase tracking-wider
          text-muted">{aside}</span>
      )}
    </h3>
  );
}

/**
 * A handwritten note in red pen. Floats into the right margin on wide
 * screens and sits inline on narrow ones.
 */
export function Marginalia({children, className = ''}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={`relative my-4 font-hand text-xl leading-snug
      text-accent lg:absolute lg:-right-64 lg:my-0 lg:w-56 lg:rotate-[-2deg]
      ${className}`}>
      <svg className="mb-1 hidden h-4 w-10 lg:block" viewBox="0 0 40 16"
        fill="none" aria-hidden>
        <path d="M38 8C28 3 14 3 3 9M3 9l6-6M3 9l7 4" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {children}
    </aside>
  );
}

export function Caption({label, children}: {label: string; children: ReactNode}) {
  return (
    <figcaption className="mt-3 text-sm leading-relaxed text-muted">
      <span className="font-mono text-xs uppercase tracking-wider text-ink">
        {label}
      </span>{' '}
      {children}
    </figcaption>
  );
}
