'use client';

import {useId, useState} from 'react';
import {Caption} from '../paper';

type Modality = 'T1' | 'T1CE' | 'FLAIR';

const MODALITIES: Record<Modality, {
  seed: number;
  tissue: number;
  csf: number;
  lesion: string;
  rim: string;
  edema: string;
  note: string;
}> = {
  T1: {
    seed: 3, tissue: 0.38, csf: 0.08, lesion: '#3a3a3a', rim: '#4a4a4a',
    edema: '#555555', note: 'anatomy; lesion appears dim',
  },
  T1CE: {
    seed: 5, tissue: 0.34, csf: 0.06, lesion: '#1e1e1e', rim: '#f2f2f2',
    edema: '#5a5a5a', note: 'contrast lights up the enhancing rim',
  },
  FLAIR: {
    seed: 8, tissue: 0.28, csf: 0.04, lesion: '#bdbdbd', rim: '#cfcfcf',
    edema: '#a8a8a8', note: 'fluid suppressed; edema glows',
  },
};

/** Figure 3: an MRI slice with switchable modality and Grad-CAM++ overlay. */
export function GradCamFigure() {
  const [modality, setModality] = useState<Modality>('T1CE');
  const [alpha, setAlpha] = useState(0.6);
  const [mask, setMask] = useState(true);
  const uid = useId().replace(/:/g, '');
  const m = MODALITIES[modality];
  const tissue = Math.round(m.tissue * 255);

  return (
    <figure className="my-10">
      <div className="grid gap-5 border border-rule bg-paper-2/40 p-4 sm:p-6
        md:grid-cols-[minmax(0,1fr)_14rem]">
        <svg viewBox="0 0 320 320" className="aspect-square w-full bg-black"
          role="img" aria-label={`Schematic ${modality} MRI slice with Grad-CAM++ overlay`}>
          <defs>
            <filter id={`tex-${uid}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.045"
                numOctaves="4" seed={m.seed} />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.55" />
              </feComponentTransfer>
            </filter>
            <clipPath id={`brain-${uid}`}>
              <ellipse cx="160" cy="162" rx="112" ry="134" />
            </clipPath>
            <radialGradient id={`cam-${uid}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#ff1e00" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#ffb000" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#3cd070" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#2050ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2050ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`edema-${uid}`}>
              <stop offset="40%" stopColor={m.edema} stopOpacity="0.9" />
              <stop offset="100%" stopColor={m.edema} stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="160" cy="162" rx="124" ry="146" fill="none"
            stroke="#d9d9d9" strokeWidth="5" opacity="0.55" />
          <g clipPath={`url(#brain-${uid})`}>
            <rect width="320" height="320"
              fill={`rgb(${tissue},${tissue},${tissue})`} />
            <rect width="320" height="320" filter={`url(#tex-${uid})`} />
            <path d="M160 40 L160 290" stroke="#000" strokeWidth="3"
              opacity="0.6" />
            <path d="M140 140 q-18 20 -6 48 q10 10 22 -4 z M180 140 q18 20 6 48
              q-10 10 -22 -4 z"
              fill={`rgb(${m.csf * 255},${m.csf * 255},${m.csf * 255})`} />
            <circle cx="214" cy="112" r="52" fill={`url(#edema-${uid})`} />
            <circle cx="214" cy="112" r="24" fill={m.lesion} stroke={m.rim}
              strokeWidth="5" />
          </g>

          <circle cx="210" cy="114" r="74" fill={`url(#cam-${uid})`}
            opacity={alpha} clipPath={`url(#brain-${uid})`} />

          {mask && (
            <g fill="none" strokeWidth="1.5">
              <path d="M180 82 q34 -22 64 6 q22 30 2 58 q-26 26 -58 6 q-26 -30
                -8 -70 z" stroke="#3cd070" strokeDasharray="4 3" />
              <circle cx="214" cy="112" r="29" stroke="#ffd24a" />
              <circle cx="214" cy="112" r="17" stroke="#ff5a2e" />
            </g>
          )}

          <text x="10" y="18" fill="#bbb" fontSize="10"
            fontFamily="monospace">{modality}</text>
          <text x="310" y="18" fill="#bbb" fontSize="10" textAnchor="end"
            fontFamily="monospace">axial · schematic</text>
          <text x="10" y="310" fill="#bbb" fontSize="10"
            fontFamily="monospace">R</text>
          <text x="310" y="310" fill="#bbb" fontSize="10" textAnchor="end"
            fontFamily="monospace">L</text>
        </svg>

        <div className="flex flex-col gap-5 font-mono text-xs">
          <fieldset>
            <legend className="mb-2 text-[10px] uppercase tracking-wider
              text-muted">modality</legend>
            <div className="flex gap-1">
              {(Object.keys(MODALITIES) as Modality[]).map((key) => (
                <button key={key} type="button" onClick={() => setModality(key)}
                  aria-pressed={key === modality}
                  className={`flex-1 border px-2 py-1.5 transition-colors
                    ${key === modality ? 'border-ink bg-ink text-paper' :
                      'border-rule text-muted hover:border-ink hover:text-ink'}`}>
                  {key}
                </button>
              ))}
            </div>
            <p className="mt-2 text-muted">{m.note}</p>
          </fieldset>

          <label className="block">
            <span className="mb-2 flex justify-between text-[10px] uppercase
              tracking-wider text-muted">
              Grad-CAM++ α <span className="text-ink">{alpha.toFixed(2)}</span>
            </span>
            <input type="range" min={0} max={1} step={0.01} value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-[var(--accent)]" />
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={mask}
              onChange={(e) => setMask(e.target.checked)}
              className="accent-[var(--accent)]" />
            predicted mask contours
          </label>

          <ul className="space-y-1 text-muted">
            <li><span className="text-edema">┄</span> edema</li>
            <li><span className="text-enhancing">○</span> enhancing tumor</li>
            <li><span className="text-accent">○</span> necrotic core</li>
          </ul>
        </div>
      </div>
      <Caption label="Figure 3.">
        What interpretability looks like in §2.2. Switch between T1, T1CE and
        FLAIR inputs, overlay a Grad-CAM++ attribution map and compare it with
        the predicted mask contours. This is a hand-drawn schematic for
        illustration, not patient data or model output.
      </Caption>
    </figure>
  );
}
