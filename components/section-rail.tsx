'use client';

import {motion, useScroll, useSpring} from 'framer-motion';
import {useEffect, useState} from 'react';

export interface RailItem {
  id: string;
  number: string;
  label: string;
}

/** Sticky table of contents with a reading-progress spine (wide screens). */
export function SectionRail({items}: {items: RailItem[]}) {
  const [active, setActive] = useState(items[0]?.id);
  const {scrollYProgress} = useScroll();
  const progress = useSpring(scrollYProgress, {stiffness: 120, damping: 30});

  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id);
          }
        },
        {rootMargin: '-40% 0px -55% 0px'});
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Contents" className="no-print fixed left-8 top-1/2 z-30
      hidden -translate-y-1/2 2xl:block">
      <div className="relative pl-5">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-rule" />
        <motion.div
          className="absolute left-0 top-0 h-full w-px origin-top bg-accent"
          style={{scaleY: progress}}
        />
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider
          text-muted">Contents</p>
        <ol className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`flex gap-2 font-mono text-[11px] transition-colors
                  ${active === item.id ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                <span className={active === item.id ? 'text-accent' : ''}>
                  {item.number}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
