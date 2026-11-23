'use client';

import dynamic from 'next/dynamic';
import {useTheme} from 'next-themes';
import {useCallback, useMemo, useRef, useSyncExternalStore} from 'react';
import type {BrainPalette} from './brain-scene';

const BrainScene = dynamic(() => import('./brain-scene'), {
  ssr: false,
  loading: () => <ScanPlaceholder />,
});

const LIGHT: BrainPalette = {
  ink: '#2a2620',
  edema: '#2f8f4e',
  enhancing: '#d99a00',
  core: '#c8381c',
  scan: '#2a46b8',
  additive: false,
};

const DARK: BrainPalette = {
  ink: '#c9c3b4',
  edema: '#3fc27a',
  enhancing: '#ffcf3a',
  core: '#ff5a2e',
  scan: '#7f9cff',
  additive: false,
};

function ScanPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center font-mono text-xs
      text-muted">
      <span className="animate-pulse">acquiring volume…</span>
    </div>
  );
}

const noopSubscribe = () => () => {};

let webglSupport: boolean | undefined;

function hasWebgl(): boolean {
  if (webglSupport === undefined) {
    const canvas = document.createElement('canvas');
    webglSupport =
        Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  }
  return webglSupport;
}

function subscribeReducedMotion(callback: () => void): () => void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

/** Figure 1: interactive point-cloud brain with simulated segmentation. */
export default function BrainFigure() {
  const {resolvedTheme} = useTheme();
  const sliceRef = useRef<HTMLSpanElement>(null);
  const webgl = useSyncExternalStore(noopSubscribe, hasWebgl, () => true);
  const reducedMotion = useSyncExternalStore(
      subscribeReducedMotion,
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      () => false);
  const palette = useMemo(
      () => (resolvedTheme === 'dark' ? DARK : LIGHT), [resolvedTheme]);

  const updateSlice = useCallback((slice: number) => {
    if (sliceRef.current) {
      sliceRef.current.textContent = String(slice).padStart(3, '0');
    }
  }, []);

  return (
    <figure className="relative">
      <div className="relative aspect-[4/3] w-full overflow-hidden border
        border-rule bg-paper-2/40 sm:aspect-[16/10]">
        {webgl ? (
          <BrainScene
            palette={palette}
            reducedMotion={reducedMotion}
            onSlice={updateSlice}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8
            text-center font-mono text-xs text-muted">
            WebGL is unavailable in this browser. Imagine a very handsome brain.
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 p-3 font-mono
          text-[10px] uppercase tracking-wider text-muted sm:p-4 sm:text-[11px]">
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <div>BraTS · T1CE</div>
            <div>vol 240×240×155</div>
          </div>
          <div className="absolute right-3 top-3 text-right sm:right-4 sm:top-4">
            <div>slice <span ref={sliceRef}>077</span>/155</div>
            <div className="text-blue">▮ axial sweep</div>
          </div>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3
            gap-y-1 sm:bottom-4 sm:left-4">
            <span><i className="mr-1 inline-block size-2 rounded-full
              bg-edema" />edema</span>
            <span><i className="mr-1 inline-block size-2 rounded-full
              bg-enhancing" />enhancing</span>
            <span><i className="mr-1 inline-block size-2 rounded-full
              bg-accent" />necrotic core</span>
          </div>
          <div className="absolute bottom-3 right-3 hidden sm:bottom-4
            sm:right-4 sm:block">
            ← move cursor to segment →
          </div>
          <Crosshairs />
        </div>
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted">
        <span className="font-mono text-xs uppercase tracking-wider text-ink">
          Figure 1.
        </span>{' '}
        A point-cloud brain volume, rendered live. Your cursor plays the
        lesion: nearby points are labeled with BraTS classes (edema, enhancing
        tumor and necrotic core) the way the model in §2.2 labels voxels. A
        blue scan plane sweeps the volume. Nothing here is a real patient.
      </figcaption>
    </figure>
  );
}

function Crosshairs() {
  const corner = 'absolute size-4 border-ink/40';
  return (
    <>
      <span className={`${corner} left-1.5 top-1.5 border-l border-t`} />
      <span className={`${corner} right-1.5 top-1.5 border-r border-t`} />
      <span className={`${corner} bottom-1.5 left-1.5 border-b border-l`} />
      <span className={`${corner} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  );
}
